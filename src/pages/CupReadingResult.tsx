import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Reading = {
  id: string;
  created_at: string;
  text: string | null;
  tts_url: string | null;
};

export default function CupReadingResult() {
  const { id } = useParams();
  const [reading, setReading] = useState<Reading | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("readings")
        .select("id, created_at, text, tts_url")
        .eq("id", id)
        .single();
      if (error) setError(error.message);
      else setReading(data);
    };
    if (id) load();
  }, [id]);

  if (error) {
    return <div className="max-w-xl mx-auto p-6 text-red-600">{error}</div>;
  }
  if (!reading) {
    return <div className="max-w-xl mx-auto p-6">Φόρτωση…</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-2">Αποτέλεσμα</h1>
      <p className="text-sm opacity-70 mb-4">
        {new Date(reading.created_at).toLocaleString()}
      </p>
      <div className="rounded-xl border p-4 whitespace-pre-wrap">
        {reading.text ?? "—"}
      </div>
      {reading.tts_url && (
        <audio className="mt-4 w-full" controls src={reading.tts_url} />
      )}
    </div>
  );
}
