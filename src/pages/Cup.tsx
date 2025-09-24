import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Cup() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startReading = async () => {
    try {
      setBusy(true);
      setError(null);

      const { data: userData, error: uErr } = await supabase.auth.getUser();
      if (uErr) throw uErr;
      const user = userData?.user;
      if (!user) throw new Error("Δεν υπάρχει ενεργό session χρήστη.");

      // DUMMY περιεχόμενο για να τεστάρουμε όλη τη ροή
      const payload = {
        user_id: user.id,
        persona: "middle",
        topic: "general",
        mood: "neutral",
        question: null,
        text: "Προσωρινός χρησμός για δοκιμή ροής.",
        tts_url: null,
        is_public: false,
      };

      console.debug("[Cup] inserting payload", payload);

      const { data, error } = await supabase
        .from("readings")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        console.error("[Cup] insert error", error);
        throw error;
      }
      console.debug("[Cup] created reading id", data.id);

      nav(`/cup-reading/${data.id}`);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ξεκίνα την Ανάγνωση</h1>
      <p className="mb-4 text-sm opacity-80">Απαιτείται σύνδεση χρήστη.</p>

      <button
        onClick={startReading}
        disabled={busy}
        className="rounded-2xl px-5 py-3 border"
      >
        {busy ? "Δημιουργία..." : "Ξεκίνα τώρα"}
      </button>

      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
    </div>
  );
}
