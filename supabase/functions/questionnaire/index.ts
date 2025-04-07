import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
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

    switch (req.method) {
      case "GET": {
        const { data, error } = await supabaseClient
          .from('questionnaires')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          throw new Error('Failed to fetch questionnaire');
        }

        return new Response(
          JSON.stringify(data),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      case "POST": {
        const { responses } = await req.json();

        if (!responses) {
          throw new Error('Responses are required');
        }

        const { error } = await supabaseClient.rpc('handle_questionnaire', {
          p_user_id: user.id,
          p_responses: responses
        });

        if (error) {
          throw new Error('Failed to save questionnaire');
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      default:
        throw new Error(`HTTP method ${req.method} not allowed`);
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