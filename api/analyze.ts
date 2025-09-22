// api/analyze.ts
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
      return res.status(500).json({
        error:
          "Missing server env. Required: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE",
      });
    }

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // Auth
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing bearer token" });

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user)
      return res.status(401).json({ error: "Invalid user token" });
    const user = userData.user;

    // Body
    const {
      image_url,         // δημόσιο URL για αποθήκευση/προβολή
      image_data_url,    // data URL (base64) για OpenAI (ΠΡΟΤΕΙΝΕΤΑΙ)
      category,
      persona,
      mood,
      question,
    } = (req.body as any) || {};

    if (!image_url && !image_data_url) {
      return res.status(400).json({ error: "image_url or image_data_url is required" });
    }

    // ----- OpenAI Vision -----
    const system =
      "Είσαι έμπειρη καφετζού. Δίνεις ζεστό, συγκεκριμένο αλλά θετικό χρησμό. Αποφεύγεις ιατρικές/επενδυτικές συμβουλές. Κείμενο 120-180 λέξεις.";
    const personaLine = persona ? `Περσόνα: ${persona}.` : "";
    const moodLine = mood ? `Συναίσθημα χρήστη: ${mood}.` : "";
    const categoryLine = category ? `Κατηγορία: ${category}.` : "";
    const questionLine = question ? `Ερώτηση: ${question}.` : "";

    const imageUrlForOpenAI =
      image_data_url && image_data_url.startsWith("data:")
        ? image_data_url
        : image_url; // fallback αν δεν στάλθηκε data URL

    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `Ανάλυσε το φλυτζάνι και δώσε χρησμό.\n` +
                `${personaLine}\n${moodLine}\n${categoryLine}\n${questionLine}`,
            },
            {
              type: "image_url",
              image_url: { url: imageUrlForOpenAI },
            },
          ],
        },
      ],
    });

    const content = chat.choices?.[0]?.message?.content?.trim();
    if (!content) return res.status(500).json({ error: "No content from OpenAI" });

    // ----- OpenAI TTS → mp3 -----
    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: content,
      format: "mp3",
    });
    const buffer = Buffer.from(await speech.arrayBuffer());

    // ----- Upload mp3 στο 'tts' -----
    const readingId = crypto.randomUUID();
    const ttsPath = `${user.id}/${readingId}.mp3`;
    const { error: upErr } = await admin.storage.from("tts").upload(ttsPath, buffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });
    if (upErr) return res.status(500).json({ error: "Failed to upload TTS: " + upErr.message });

    const { data: ttsPublic } = admin.storage.from("tts").getPublicUrl(ttsPath);
    const tts_url = ttsPublic.publicUrl;

    // ----- Insert στη DB -----
    const { data: insert, error: insErr } = await admin
      .from("readings")
      .insert({
        id: readingId,
        user_id: user.id,
        image_url,                 // αποθηκεύουμε το public URL
        category: category ?? null,
        persona: persona ?? null,
        profile: persona ?? null,
        mood: mood ?? null,
        question: question ?? null,
        message: content,
        text: content,
        tts_url,
        is_public: false,
      })
      .select("id")
      .single();

    if (insErr) return res.status(500).json({ error: "Insert failed: " + insErr.message });

    return res.status(200).json({ id: insert.id });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Internal error" });
  }
}
