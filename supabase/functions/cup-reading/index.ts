import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { reader, gender, ageRange, category, mood, question, imageBase64 } = body ?? {};

    console.log("Processing cup reading request:", {
      reader,
      gender,
      ageRange,
      category,
      mood,
      hasImage: !!imageBase64,
    });

    // ---- Required checks ----
    if (!imageBase64) {
      throw new Error("Η εικόνα του φλιτζανιού είναι απαραίτητη");
    }
    if (!gender || !ageRange) {
      throw new Error("Το φύλο και το ηλικιακό εύρος είναι απαραίτητα");
    }

    // ---- Whitelist validation (αποδεκτές τιμές) ----
    const allowedGenders = new Set(["Άνδρας", "Γυναίκα", "Άλλο"]);
    const allowedAgeRanges = new Set(["17-24", "25-34", "35-44", "45-54", "55-64", "64+"]);

    if (!allowedGenders.has(gender)) {
      throw new Error("Μη αποδεκτή τιμή για Φύλο");
    }
    if (!allowedAgeRanges.has(ageRange)) {
      throw new Error("Μη αποδεκτή τιμή για Ηλικιακό εύρος");
    }

    // ---- Safe fallbacks για μη-υποχρεωτικά πεδία ----
    const safeReader = reader || "Καφετζού";
    const safeCategory = category || "Γενικό Μέλλον";
    const safeMood = mood || "Ουδέτερη/ος";

    // ---- Prompt με gender & ageRange + οδηγίες ύφους ----
    let prompt = `Είσαι ${safeReader}, ένας/μία έμπειρος/η καφεμάντης/ισσα.

ΣΤΟΙΧΕΙΑ ΧΡΗΣΤΗ:
• Φύλο: ${gender}
• Ηλικιακό εύρος: ${ageRange}

ΠΛΑΙΣΙΟ ΑΙΤΗΜΑΤΟΣ:
• Κατηγορία: ${safeCategory}
• Διάθεση: ${safeMood}${question ? `\n• Ερώτηση: ${question}` : ""}

ΟΔΗΓΙΕΣ:
1) Παρατήρησε ΠΟΛΥ προσεκτικά την εικόνα του φλιτζανιού και περιέγραψε τα σχήματα/σύμβολα που διακρίνεις.
2) Εξήγησε τις πιθανές ερμηνείες τους.
3) Δώσε προβλέψεις/τάσεις σχετικές με την κατηγορία.
4) Πρόσφερε 2–4 πρακτικές συμβουλές.
5) Προσαρμόζεις ύφος & λεξιλόγιο στο φύλο και στην ηλικία (π.χ. προσφώνηση, αναφορές, τόνος).
6) Τόνος: μυστηριώδης αλλά ελπιδοφόρος, συμπονετικός· απόφυγε απόλυτες βεβαιότητες.
7) Γράψε στα ελληνικά, καθαρή μορφοποίηση με μικρές παραγράφους και bullets όπου βοηθά.

Ακολουθεί η εικόνα του φλιτζανιού.`;

    // ---- OpenAI call ----
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-2025-04-14",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }, // λειτουργεί και για png
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {}
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData?.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const reading = data?.choices?.[0]?.message?.content;
    if (!reading) {
      throw new Error("Δεν ελήφθη περιεχόμενο ανάγνωσης από το μοντέλο.");
    }

    console.log("Cup reading generated successfully");

    return new Response(JSON.stringify({ reading }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in cup-reading function:", error);
    return new Response(
      JSON.stringify({
        error: error?.message || "Παρουσιάστηκε σφάλμα κατά την ανάγνωση του φλιτζανιού",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
