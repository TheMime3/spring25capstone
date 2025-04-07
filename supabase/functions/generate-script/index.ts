import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "npm:openai@^4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Verify request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: `HTTP method ${req.method} is not allowed` }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify Content-Type
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI service is not configured properly' }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { scriptResponses, businessProfile, userName } = body;

    // Validate required fields
    if (!scriptResponses || !businessProfile?.businessInfo?.businessName) {
      return new Response(
        JSON.stringify({ error: 'Missing required data: scriptResponses or businessProfile' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize OpenAI with error handling
    let openai;
    try {
      openai = new OpenAI({
        apiKey: openaiApiKey
      });
    } catch (error) {
      console.error('OpenAI initialization error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to initialize AI service' }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare the prompt
    const prompt = `Create a 60-second business presentation script for ${businessProfile.businessInfo.businessName}.

Core Problem: ${scriptResponses.coreProblem}
Ideal Customer: ${scriptResponses.idealCustomer}
Business Inspiration: ${scriptResponses.businessInspiration}
Unique Value: ${scriptResponses.uniqueValue}
Key Message: ${scriptResponses.keyMessage}
Customer Journey: ${scriptResponses.customerJourney}
Call to Action: ${scriptResponses.callToAction}

Format the script in a clear, conversational style that's easy to read and present.`;

    // Generate script using OpenAI with error handling
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert copywriter specializing in creating engaging 60-second business presentation scripts."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });
    } catch (error) {
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ 
          error: error.message || 'Failed to generate script content'
        }),
        {
          status: error.status || 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const script = completion.choices[0]?.message?.content;
    if (!script) {
      return new Response(
        JSON.stringify({ error: "Failed to generate script content" }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Return successful response
    return new Response(
      JSON.stringify({ script }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    // Log error for debugging
    console.error('Edge function error:', error);

    // Return error response with appropriate status code
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }),
      {
        status: error instanceof Error && error.message.includes('API key') ? 503 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});