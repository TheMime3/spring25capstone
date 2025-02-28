import OpenAI from 'openai';
import { ScriptGeneratorState } from '../types/scriptGenerator';
import { QuestionnaireState } from '../types/questionnaire';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, you should proxy requests through your backend
});

export interface ScriptGenerationParams {
  scriptResponses: ScriptGeneratorState;
  businessProfile: QuestionnaireState;
  userName?: string;
}

export const generateScript = async (params: ScriptGenerationParams): Promise<string> => {
  const { scriptResponses, businessProfile, userName } = params;
  
  try {
    // Create a prompt that includes all the relevant information
    const prompt = `
You are an expert business script writer. Create a compelling 60-second script for a business presentation based on the following information:

BUSINESS PROFILE:
- Business Name: ${businessProfile.businessInfo.businessName || 'Not specified'}
- Years in Business: ${businessProfile.businessInfo.businessYears || 'Not specified'}
- Industry: ${businessProfile.businessInfo.industry || 'Not specified'}
- Target Audience: ${businessProfile.businessInfo.targetAudience || 'Not specified'}
- Presenter Name: ${userName || businessProfile.contactInfo.contactDetails.split(',')[0] || 'Not specified'}

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

    // Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
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

    // Extract and return the generated script
    return completion.choices[0].message.content?.trim() || 
      "Sorry, I couldn't generate a script at this time. Please try again.";
    
  } catch (error) {
    console.error('Error generating script with OpenAI:', error);
    throw new Error('Failed to generate script. Please check your API key and try again.');
  }
};