// api/generate-reading.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const must = (name: string) => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const OPENAI_API_KEY = must("OPENAI_API_KEY");
    const SUPABASE_URL = must("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = must("SUPABASE_SERVICE_ROLE_KEY");

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { image_url, persona, topic, mood, question, user_id } = req.body || {};
    if (!image_url || !user_id) {
      return res.status(400).json({ error: "Missing image_url or user_id" });
    }

    // 1) Vision -> text
    const sys = `Είσαι χαρισματική καφετζού. Δίνεις χρησμό 130-180 λέξεις, ζεστός αλλά προσγειωμένος τόνος,
χωρίς ιατρικές/νομικές συμβουλές. Persona="${persona}", Topic="${topic}", Mood="${mood}".`;
    const userPrompt: any = [
      { type: "text", text: `Ανάλυσε το φλιτζάνι. Ερώτηση: ${question ?? "—"}` },
      { type: "image_url", image_url: { url: image_url } },
    ];

    const vision = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
    });

    const readingText =
      vision.choices?.[0]?.message?.content?.trim() ||
      "Δεν μπόρεσα να αναλύσω την εικόνα. Δοκίμασε ξανά.";

    // 2) TTS (fail-safe)
    let ttsUrl: string | null = null;
    try {
      const tts = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: readingText,
        format: "mp3",
      });
      const audioBuffer = Buffer.from(await tts.arrayBuffer());
      const fileName = `tts_${Date.now()}.mp3`;
      const put = await supabase.storage.from("tts").upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: false,
      });
      if (put.error) {
        console.error("Upload TTS error:", put.error);
      } else {
        ttsUrl = supabase.storage.from("tts").getPublicUrl(put.data.path).data.publicUrl;
      }
    } catch (e: any) {
      console.error("TTS failed:", e?.message || e);
      // συνεχίζουμε μόνο με κείμενο
    }

    // 3) Insert στο readings
    const ins = await supabase
      .from("readings")
      .insert({
        user_id,
        persona,
        topic,
        mood,
        question: question ?? null,
        text: readingText,
        tts_url: ttsUrl,
        is_public: false,
      })
      .select("id")
      .single();

    if (ins.error) {
      console.error("Insert reading error:", ins.error);
      return res.status(500).json({ error: "DB insert failed", detail: ins.error.message });
    }

    return res.status(200).json({ id: ins.data.id });
  } catch (err: any) {
    console.error("API fatal error:", err?.message || err);
    // Εγγυημένο JSON error (ποτέ κενό σώμα)
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
