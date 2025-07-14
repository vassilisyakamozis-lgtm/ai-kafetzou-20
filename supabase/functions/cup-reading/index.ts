import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reader, category, mood, question, imageBase64 } = await req.json();

    console.log('Processing cup reading request:', { reader, category, mood, hasImage: !!imageBase64 });

    if (!imageBase64) {
      throw new Error('Η εικόνα του φλυτζανιού είναι απαραίτητη');
    }

    // Construct the prompt for the cup reading
    let prompt = `Είσαι ${reader}, ένας έμπειρος καφεμάντης. Κάνε μια ανάγνωση του φλυτζανιού βάσει των παρακάτω στοιχείων:

Κατηγορία: ${category}
Διάθεση: ${mood}`;

    if (question) {
      prompt += `\nΕρώτηση: ${question}`;
    }

    prompt += `

Παρακάτω είναι η εικόνα του φλυτζανιού. Δες προσεκτικά τα σχήματα του καφέ και δώσε μια λεπτομερή ανάγνωση στα ελληνικά που να περιλαμβάνει:

1. Τι βλέπεις στο φλυτζάνι (σχήματα, σύμβολα)
2. Τι σημαίνουν αυτά τα σχήματα
3. Προβλέψεις για το μέλλον
4. Συμβουλές

Να είσαι μυστηριώδης αλλά ελπιδοφόρος στον τόνο σου.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.8
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const reading = data.choices[0].message.content;

    console.log('Cup reading generated successfully');

    return new Response(JSON.stringify({ reading }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in cup-reading function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Παρουσιάστηκε σφάλμα κατά την ανάγνωση του φλυτζανιού' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});