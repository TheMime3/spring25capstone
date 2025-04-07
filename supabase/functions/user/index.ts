import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Get user ID from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization required');
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Invalid token');
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    switch (path) {
      case "profile": {
        if (req.method === "GET") {
          const { data: profile, error } = await supabaseClient
            .from('users')
            .select('id, email, first_name, last_name')
            .eq('id', user.id)
            .single();

          if (error || !profile) {
            throw new Error('User not found');
          }

          return new Response(
            JSON.stringify({
              id: profile.id,
              email: profile.email,
              firstName: profile.first_name,
              lastName: profile.last_name
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        }

        if (req.method === "PUT") {
          const { firstName, lastName, email } = await req.json();
          const updates: Record<string, string> = {};

          if (firstName) updates.first_name = firstName;
          if (lastName) updates.last_name = lastName;
          if (email) {
            // Check if email is already taken
            const { data: existingUser } = await supabaseClient
              .from('users')
              .select('id')
              .eq('email', email.toLowerCase())
              .neq('id', user.id)
              .single();

            if (existingUser) {
              throw new Error('Email already in use');
            }
            updates.email = email.toLowerCase();
          }

          if (Object.keys(updates).length === 0) {
            throw new Error('No updates provided');
          }

          const { data: updatedUser, error } = await supabaseClient
            .from('users')
            .update(updates)
            .eq('id', user.id)
            .select('id, email, first_name, last_name')
            .single();

          if (error) {
            throw new Error('Failed to update profile');
          }

          return new Response(
            JSON.stringify({
              id: updatedUser.id,
              email: updatedUser.email,
              firstName: updatedUser.first_name,
              lastName: updatedUser.last_name
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        }

        throw new Error(`HTTP method ${req.method} not allowed`);
      }

      default:
        throw new Error(`Unknown path: ${path}`);
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: error instanceof Error && 
          (error.message.includes('Authorization required') || error.message.includes('Invalid token')) 
          ? 401 : 500,
      }
    );
  }
});