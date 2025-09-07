import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../system/auth";
import { useAuth } from "../system/auth";


type Reading = {
  id: string;
  text: string;
  tts_url?: string | null;
  is_public: boolean;
  user_id: string;
  created_at: string;
};

export default function CupReadingResult() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const nav = useNavigate();
  const passed = (useLocation().state as any)?.reading as Reading | undefined;

  const [reading, setReading] = useState<Reading | null>(passed ?? null);
  const [loading, setLoading] = useState(!passed);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!id || passed) return;
      setLoading(true); setError(null);
      try {
        const { data, error } = await supabase
          .from("readings")
          .select("id,text,tts_url,is_public,user_id,created_at")
          .eq("id", id)
          .single();
        if (error) throw error;
        if (!data) throw new Error("Δεν βρέθηκε το αποτέλεσμα.");
        if (!data.is_public && user?.id !== data.user_id) {
          throw new Error("Δεν έχεις δικαίωμα πρόσβασης.");
        }
        if (!cancel) setReading(data as Reading);
      } catch (e: any) {
        if (!cancel) setError(e?.message ?? "Σφάλμα φόρτωσης.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [id, passed, user?.id]);

  if (loading) return <div className="p-6 text-center opacity-70">Φόρτωση…</div>;
  if (error) return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h2 className="text-xl font-semibold mb-2">Αποτυχία φόρτωσης</h2>
      <p className="mb-4">{error}</p>
      <button className="px-4 py-2 rounded bg-black text-white" onClick={() => nav("/")}>Αρχική</button>
    </div>
  );
  if (!reading) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="text-sm opacity-60">{new Date(reading.created_at).toLocaleString()}</div>
      <h1 className="text-2xl font-bold">Ο χρησμός σου</h1>
      <p className="leading-7 whitespace-pre-wrap">{reading.text}</p>
      {reading.tts_url && <audio controls src={reading.tts_url} className="mt-4" />}
      <div className="pt-6">
        <button className="px-4 py-2 rounded bg-black text-white" onClick={() => nav("/new")}>Νέα Ανάγνωση</button>
      </div>
    </div>
  );
}
