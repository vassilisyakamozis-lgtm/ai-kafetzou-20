
// src/pages/CupReadingResult.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Share2, Volume2, Home, ArrowLeft } from "lucide-react";
import jsPDF from "jspdf";

type ReadingRow = {
  id: string;
  user_id: string;
  persona: string;
  profile: string | null;
  category: string;
  mood: string;
  question: string | null;
  image_url: string | null;
  text: string;
  tts_url: string | null;
  created_at: string;
};

export default function CupReadingResult() {
  const { toast } = useToast();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [reading, setReading] = useState<ReadingRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const stateTemp = (location.state as any)?.temp as Partial<ReadingRow> | undefined;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const { data, error } = await supabase.from("readings").select("*").eq("id", id).single();
          if (error) throw error;
          if (!cancelled) setReading(data as unknown as ReadingRow);
        } else if (stateTemp) {
          const tmp: ReadingRow = {
            id: "temp",
            user_id: "temp",
            persona: stateTemp.persona || "Ρένα η μοντέρνα",
            profile: stateTemp.profile ?? null,
            category: stateTemp.category || "Γενικό Μέλλον",
            mood: stateTemp.mood || "Ζεστή & ενθαρρυντική",
            question: stateTemp.question ?? null,
            image_url: stateTemp.image_url ?? null,
            text: stateTemp.text || "",
            tts_url: stateTemp.tts_url ?? null,
            created_at: stateTemp.created_at || new Date().toISOString(),
          };
          if (!cancelled) setReading(tmp);
        } else {
          toast({ title: "Δεν βρέθηκε χρησμός", variant: "destructive" });
          navigate("/cup");
        }
      } catch (e: any) {
        toast({ title: "Σφάλμα", description: String(e?.message ?? e), variant: "destructive" });
        navigate("/cup");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const dateLabel = useMemo(() => {
    if (!reading?.created_at) return "";
    return new Date(reading.created_at).toLocaleString("el-GR");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reading?.created_at]);

  const doPDF = () => {
    if (!reading) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const margin = 40;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Χρησμός - ${reading.persona}`, margin, y);
    y += 22;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Ημερομηνία: ${dateLabel}`, margin, y);
    y += 18;

    if (reading.profile) {
      doc.text(`Προφίλ: ${reading.profile}`, margin, y);
      y += 18;
    }

    doc.text(`Θεματική: ${reading.category} | Στυλ: ${reading.mood}`, margin, y);
    y += 18;

    if (reading.question) {
      const q = `Ερώτηση: ${reading.question}`;
      const lines = doc.splitTextToSize(q, 515);
      doc.text(lines, margin, y);
      y += 16 * lines.length + 6;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Κείμενο χρησμού", margin, y);
    y += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(reading.text, 515);
    doc.text(lines, margin, y);

    doc.save(`xrhsmos_${new Date(reading.created_at).getTime()}.pdf`);
  };

  const doShare = async () => {
    if (id && navigator.share) {
      try {
        await navigator.share({
          title: "Ο χρησμός μου",
          text: "Δες τον χρησμό μου ☕",
          url: `${window.location.origin}/reading/${id}`,
        });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Αντιγράφηκε το link!" });
    }
  };

  if (isLoading || !reading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center text-muted-foreground">Φόρτωση…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary font-medium">
            <Home className="h-5 w-5" />
            Home
          </Link>
          <div className="text-sm text-muted-foreground">Ημερομηνία: {dateLabel}</div>
          <Link to="/cup" className="text-primary flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Νέα Ανάγνωση
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">
              {reading.persona} — {reading.category} ({reading.mood})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {reading.question && (
              <div className="text-sm text-muted-foreground">
                <b>Ερώτηση:</b> {reading.question}
              </div>
            )}

            <div className="whitespace-pre-wrap leading-relaxed">{reading.text}</div>

            <div className="flex flex-wrap gap-2 pt-2">
              {reading.tts_url && (
                <Button variant="secondary" asChild>
                  <a href={reading.tts_url} target="_blank" rel="noreferrer">
                    <Volume2 className="h-4 w-4 mr-2" />
                    Άκουσε (TTS)
                  </a>
                </Button>
              )}
              <Button variant="outline" onClick={doPDF}>
                <Download className="h-4 w-4 mr-2" />
                Κατέβασμα PDF
              </Button>
              <Button onClick={doShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Κοινοποίηση
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
