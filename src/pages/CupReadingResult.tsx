// src/pages/CupReadingResult.tsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ReadingRow = {
  id: string;
  user_id: string;
  image_url: string | null;
  persona: string | null;
  profile: string | null;
  category: string | null;
  mood: string | null;
  question: string | null;
  text: string | null;
  message: string | null;
  tts_url: string | null;
  created_at: string;
};

export default function CupReadingResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reading, setReading] = useState<ReadingRow | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "empty">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setStatus("loading");
        setError(null);

        // Να υπάρχει session, αλλιώς οι RLS θα κόψουν το select
        const { data: sess } = await supabase.auth.getSession();
        if (!sess?.session) {
          setStatus("error");
          setError("Δεν είσαι συνδεδεμένος/η.");
          return;
        }

        const { data, error } = await supabase
          .from("readings")
          .select(
            "id,user_id,image_url,persona,profile,category,mood,question,text,message,tts_url,created_at"
          )
          .eq("id", id)
          .maybeSingle();

        if (error) {
          setStatus("error");
          setError(error.message);
          return;
        }
        if (!data) {
          setStatus("empty");
          return;
        }
        setReading(data as ReadingRow);
        setStatus("idle");
      } catch (e: any) {
        setStatus("error");
        setError(e?.message || "Κάτι πήγε στραβά.");
      }
    })();
  }, [id]);

  if (status === "loading") {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Φορτώνει η ανάγνωση…</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-3">
              <div className="h-64 bg-muted rounded-xl" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="mb-4 text-destructive">Σφάλμα: {error}</p>
        <Button onClick={() => navigate("/cup")}>Πίσω στο φλυτζάνι</Button>
      </div>
    );
  }

  if (status === "empty" || !reading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="mb-4">Δεν βρέθηκε ανάγνωση ή δεν έχεις δικαίωμα πρόσβασης.</p>
        <Button asChild>
          <Link to="/cup">Πίσω στο φλυτζάνι</Link>
        </Button>
      </div>
    );
  }

  const txt = reading.text || reading.message || "(χωρίς κείμενο)";

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Αποτέλεσμα Ανάγνωσης</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reading.image_url && (
            <img
              src={reading.image_url}
              alt="Καφές"
              className="w-full max-h-[480px] object-contain rounded-xl border"
            />
          )}

          <div className="text-sm text-muted-foreground">
            <span className="mr-3">Κατηγορία: {reading.category || "—"}</span>
            <span className="mr-3">Περσόνα: {reading.persona || reading.profile || "—"}</span>
            <span>Συναίσθημα: {reading.mood || "—"}</span>
          </div>

          {reading.question && (
            <p className="text-sm italic text-muted-foreground">Ερώτηση: {reading.question}</p>
          )}

          <p className="whitespace-pre-wrap leading-7">{txt}</p>

          {reading.tts_url && (
            <audio controls className="w-full">
              <source src={reading.tts_url} type="audio/mpeg" />
              Ο περιηγητής σου δεν υποστηρίζει audio.
            </audio>
          )}

          <div className="pt-2">
            <Button asChild variant="secondary">
              <Link to="/cup">Νέα ανάγνωση</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
