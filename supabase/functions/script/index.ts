import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import OpenAI from "npm:openai@4.28.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

    if (req.method !== "POST") {
      throw new Error(`HTTP method ${req.method} not allowed`);
    }

    const { scriptResponses, businessProfile, userName } = await req.json();

    if (!scriptResponses || !businessProfile) {
      throw new Error('Missing required script generation parameters');
    }

    if (!businessProfile.businessInfo?.businessName) {
      throw new Error('Business name is required');
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });

    // Create the prompt
    const prompt = `
You are an expert business script writer. Create a compelling 60-second script for a business presentation based on the following information:

BUSINESS PROFILE:
- Business Name: ${businessProfile.businessInfo.businessName || 'Not specified'}
- Years in Business: ${businessProfile.businessInfo.businessYears || 'Not specified'}
- Industry: ${businessProfile.businessInfo.industry || 'Not specified'}
- Target Audience: ${businessProfile.businessInfo.targetAudience || 'Not specified'}
- Presenter Name: ${userName || (businessProfile.contactInfo?.contactDetails ? businessProfile.contactInfo.contactDetails.split(',')[0] : 'Not specified')}

SCRIPT CONTENT:
- Core Problem Solved: ${scriptResponses.coreProblem}
- Ideal Customer: ${scriptResponses.idealCustomer}
- Business Inspiration: ${scriptResponses.businessInspiration}
- Unique Value Proposition: ${scriptResponses.uniqueValue}
- Key Message: ${scriptResponses.keyMessage}
- Customer Journey: ${scriptResponses.customerJourney}
- Call to Action: ${scriptResponses.callToAction}

INSTRUCTIONS:
1. Create a 60-second script (approximately 150-180 words)
2. Start with a strong hook that grabs attention
3. Clearly articulate the problem and solution
4. Include the unique value proposition
5. End with a clear call to action
6. Make it conversational and authentic
7. Format it for easy reading with natural pauses
8. Do not use bullet points or headings in the final script
9. The script should flow naturally as if being spoken

The script should be ready to read aloud and time to approximately 60 seconds when spoken at a natural pace.
`;

    // Generate the script
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert business script writer who creates compelling 60-second scripts for business presentations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const script = completion.choices[0]?.message?.content?.trim();
    if (!script) {
      throw new Error('Failed to generate script');
    }

    return new Response(
      JSON.stringify({ script }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Script generation error:', error);
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