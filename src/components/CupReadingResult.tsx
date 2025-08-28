import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CalendarDays, Download, Save, Share2, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// PDF: πρόσθεσε το dependency από Settings → Dependencies → πρόσθεσε "jspdf"
import { jsPDF } from "jspdf";

type ReaderInfo = {
  id: string;
  name: string;
  description?: string;
  image?: string;
};

interface Props {
  reading: string;
  readerInfo: ReaderInfo;
  onBack: () => void;
  // προαιρετικά: αν θες custom save logic από τον γονιό
  onSave?: (reading: string) => Promise<void>;
  // προαιρετικά: αν το UI ξέρει gender/age και θες να τα αποθηκεύουμε μαζί
  gender?: string | null;
  ageRange?: string | null;
}

const CupReadingResult: React.FC<Props> = ({
  reading,
  readerInfo,
  onBack,
  onSave,
  gender,
  ageRange,
}) => {
  const { toast } = useToast();
  const [speaking, setSpeaking] = useState(false);

  // Ημερομηνία παραγωγής χρησμού
  const producedAt = useMemo(() => {
    const d = new Date();
    return d.toLocaleString("el-GR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // ========= Text-to-Speech =========
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleSpeak = () => {
    try {
      if (!reading) return;
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      const u = new SpeechSynthesisUtterance(reading);
      // Ελληνικά
      u.lang = "el-GR";
      u.rate = 1;
      u.pitch = 1;
      u.onend = () => setSpeaking(false);
      utteranceRef.current = u;
      speechSynthesis.speak(u);
      setSpeaking(true);
    } catch (e) {
      console.error(e);
      toast({ title: "Σφάλμα", description: "Αποτυχία Text-to-Speech", variant: "destructive" });
    }
  };

  const handleStop = () => {
    try {
      speechSynthesis.cancel();
      setSpeaking(false);
    } catch {}
  };

  useEffect(() => () => speechSynthesis.cancel(), []);

  // ========= Save (Supabase) =========
  const handleSave = async () => {
    try {
      if (onSave) {
        await onSave(reading);
        toast({ title: "Αποθηκεύτηκε!", description: "Ο χρησμός αποθηκεύτηκε." });
        return;
      }
      // Basic αποθήκευση σε table "readings"
      const { data, error } = await supabase.from("readings").insert({
        reader: readerInfo?.name ?? null,
        text: reading,
        gender: gender ?? null,
        age_range: ageRange ?? null,
        produced_at: new Date().toISOString(),
      });
      if (error) throw error;

      toast({ title: "Αποθηκεύτηκε!", description: "Ο χρησμός αποθηκεύτηκε στο προφίλ σας." });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Σφάλμα αποθήκευσης",
        description: e?.message ?? "Δοκιμάστε ξανά.",
        variant: "destructive",
      });
    }
  };

  // ========= PDF (jsPDF) =========
  const handlePDF = async () => {
    try {
      const doc = new jsPDF({ unit: "pt" });
      const margin = 48;
      let y = margin;

      doc.setFont("times", "bold");
      doc.setFontSize(18);
      doc.text("Ανάγνωση Φλιτζανιού", margin, y);
      y += 24;

      doc.setFontSize(12);
      doc.setFont("times", "normal");
      doc.text(`Ημερομηνία: ${producedAt}`, margin, y);
      y += 18;
      if (readerInfo?.name) {
        doc.text(`Καφετζού: ${readerInfo.name}`, margin, y);
        y += 18;
      }
      if (gender) {
        doc.text(`Φύλο: ${gender}`, margin, y);
        y += 18;
      }
      if (ageRange) {
        doc.text(`Ηλικιακό εύρος: ${ageRange}`, margin, y);
        y += 18;
      }
      y += 8;

      const lines = doc.splitTextToSize(reading, doc.internal.pageSize.getWidth() - margin * 2);
      doc.text(lines, margin, y);

      const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
      doc.save(`kafetzou-reading-${stamp}.pdf`);
      toast({ title: "Δημιουργήθηκε PDF", description: "Λήψη ολοκληρώθηκε." });
    } catch (e) {
      console.error(e);
      toast({
        title: "Σφάλμα PDF",
        description: "Δεν ήταν δυνατή η δημιουργία PDF.",
        variant: "destructive",
      });
    }
  };

  // ========= Share =========
  const handleShare = async () => {
    try {
      const title = "Ανάγνωση Φλιτζανιού";
      const text = `Καφετζού: ${readerInfo?.name ?? "-"}\nΗμερομηνία: ${producedAt}\n\n${reading}`;

      if (navigator.share) {
        await navigator.share({ title, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast({ title: "Αντιγράφηκε", description: "Το κείμενο αντιγράφηκε στο πρόχειρο." });
    } catch (e) {
      console.error(e);
      toast({ title: "Σφάλμα", description: "Δεν ήταν δυνατή η κοινοποίηση.", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-5 w-5" />
          Επιστροφή
        </Button>

        <div className="text-center">
          <h1 className="text-2xl font-mystical font-bold text-mystical-purple">
            Ανάγνωση Φλιτζανιού
          </h1>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-mystical-purple/10 px-3 py-1 text-sm text-mystical-purple">
            <CalendarDays className="h-4 w-4" />
            <span>Ημερομηνία: {producedAt}</span>
          </div>
        </div>

        <div className="w-24" /> {/* spacer */}
      </div>

      {/* Reader + Text */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-mystical-purple">{readerInfo?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {readerInfo?.image && (
              <img
                src={readerInfo.image}
                alt={readerInfo.name}
                className="w-full rounded-xl object-cover"
              />
            )}
            {readerInfo?.description && (
              <p className="mt-3 text-muted-foreground">{readerInfo.description}</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-mystical-purple">Ο χρησμός σου</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none whitespace-pre-line leading-relaxed">
              {reading}
            </div>

            {/* Action bar */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {!speaking ? (
                <Button onClick={handleSpeak} className="gap-2">
                  <Volume2 className="h-5 w-5" />
                  Άκου
                </Button>
              ) : (
                <Button onClick={handleStop} variant="secondary" className="gap-2">
                  <VolumeX className="h-5 w-5" />
                  Στοπ
                </Button>
              )}

              <Button onClick={handleSave} variant="outline" className="gap-2">
                <Save className="h-5 w-5" />
                Αποθήκευση
              </Button>

              <Button onClick={handlePDF} variant="outline" className="gap-2">
                <Download className="h-5 w-5" />
                Λήψη PDF
              </Button>

              <Button onClick={handleShare} variant="outline" className="gap-2">
                <Share2 className="h-5 w-5" />
                Κοινοποίηση
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CupReadingResult;
