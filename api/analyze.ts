// api/analyze.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, {
  auth: { persistSession: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing bearer token" });

    // Επαλήθευση χρήστη από το Supabase token
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return res.status(401).json({ error: "Invalid user token" });
    const user = userData.user;

    const { image_url, category, persona, mood } = req.body || {};
    if (!image_url) return res.status(400).json({ error: "image_url is required" });

    // 1) Vision → Κείμενο χρησμού
    const system = [
      "Είσαι έμπειρη καφετζού. Δίνεις ζεστό, συγκεκριμένο αλλά θετικό χρησμό.",
      "Αποφεύγεις ιατρικές/επενδυτικές συμβουλές. Κείμενο 120-180 λέξεις.",
    ].join(" ");

    const personaLine = persona ? `Περσόνα: ${persona}.` : "";
    const moodLine = mood ? `Συναίσθημα χρήστη: ${mood}.` : "";
    const categoryLine = category ? `Κατηγορία: ${category}.` : "";

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          { type: "text", text: `Ανάλυσε το φλυτζάνι και δώσε χρησμό.\n${personaLine}\n${moodLine}\n${categoryLine}` },
          { type: "image_url", image_url: { url: image_url } },
        ],
      },
    ];

    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.8,
    });

    const message = chat.choices[0]?.message?.content?.trim();
    if (!message) return res.status(500).json({ error: "No content from OpenAI" });

    // 2) ΤΤS → mp3
    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: message,
      format: "mp3",
    });
    const arrayBuffer = await speech.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3) Ανεβάζουμε mp3 στο Supabase Storage (public)
    const readingId = crypto.randomUUID();
    const ttsPath = `${user.id}/${readingId}.mp3`;
    const { error: upErr } = await admin.storage.from("tts").upload(ttsPath, buffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });
    if (upErr) return res.status(500).json({ error: "Failed to upload TTS: " + upErr.message });

    const { data: ttsPublic } = admin.storage.from("tts").getPublicUrl(ttsPath);
    const tts_url = ttsPublic.publicUrl;

    // 4) Εγγραφή στη βάση
    const { data: insert, error: insErr } = await admin
      .from("readings")
      .insert({
        id: readingId,
        user_id: user.id,
        image_url, // public url που πέρασε ο client
        category: category || null,
        persona: persona || null,
        mood: mood || null,
        message,
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
