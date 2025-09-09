// src/components/CupReadingResult.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Share2, Save, Volume2, VolumeX, ClipboardCheck } from "lucide-react";
import { jsPDF } from "jspdf";

type ReaderInfo = {
  id: string;
  name: string;
  description: string;
  image?: string;
};

type Props = {
  reading: string;
  readerInfo: ReaderInfo;
  onBack: () => void;
  /** Αν η Edge Function επιστρέφει URL έτοιμου ήχου, θα το παίξουμε από εδώ */
  ttsUrl?: string;
  /** Προαιρετικά, για metadata & prompt-context */
  gender?: string;
  ageRange?: string;
};

const formatDateTime = (d = new Date()) =>
  d.toLocaleString("el-GR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const STORAGE_KEY = "cup_readings";

const CupReadingResult = ({
  reading,
  readerInfo,
  onBack,
  ttsUrl,
  gender,
  ageRange,
}: Props) => {
  const { toast } = useToast();
  const producedAt = useMemo(() => new Date(), []);
  const producedAtLabel = useMemo(() => formatDateTime(producedAt), [producedAt]);

  // ---- TTS State ----
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Αν μας ήρθε έτοιμος ήχος από Edge (ttsUrl), ετοιμάζουμε <audio>
  useEffect(() => {
    if (ttsUrl) {
      audioRef.current = new Audio(ttsUrl);
      audioRef.current.onended = () => setIsSpeaking(false);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [ttsUrl]);

  // ---- TTS: Web Speech fallback ----
  const speakWithWebSpeech = () => {
    // Σταματάμε ό,τι παίζει ήδη
    stopTTS();

    const u = new SpeechSynthesisUtterance(reading);
    // Προσπαθούμε να βρούμε ελληνική φωνή
    const voices = window.speechSynthesis.getVoices();
    const elVoice =
      voices.find((v) => v.lang?.toLowerCase().startsWith("el")) ||
      voices.find((v) => v.lang?.toLowerCase().startsWith("gr"));

    if (elVoice) u.voice = elVoice;
    u.lang = elVoice?.lang || "el-GR";
    u.rate = 1;
    u.pitch = 1;

    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);

    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
    setIsSpeaking(true);
  };

  const playTTS = async () => {
    try {
      if (audioRef.current) {
        // Έχουμε έτοιμο mp3 από Edge
        stopTTS();
        await audioRef.current.play();
        setIsSpeaking(true);
        return;
      }
      // Αλλιώς Web Speech
      speakWithWebSpeech();
    } catch (e) {
      toast({
        title: "Σφάλμα ήχου",
        description: "Δεν ήταν δυνατή η αναπαραγωγή. Δοκίμασε ξανά.",
        variant: "destructive",
      });
    }
  };

  const stopTTS = () => {
    // Audio από Edge
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // Web Speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // ---- Download PDF ----
  const downloadPDF = () => {
    try {
      const doc = new jsPDF({
        unit: "pt",
        format: "a4",
      });

      const margin = 40;
      const maxWidth = 515; // a4 width - margins
      const title = `Ανάγνωση Φλιτζανιού — ${readerInfo?.name || ""}`;
      const meta = [
        producedAtLabel,
        gender ? `Φύλο: ${gender}` : "",
        ageRange ? `Ηλικιακό εύρος: ${ageRange}` : "",
      ]
        .filter(Boolean)
        .join(" • ");

      doc.setFont("Times", "Bold");
      doc.setFontSize(16);
      doc.text(title, margin, 60);

      doc.setFont("Times", "Normal");
      doc.setFontSize(11);
      doc.setTextColor("#666666");
      doc.text(meta, margin, 80);

      doc.setTextColor("#000000");
      doc.setFontSize(12);

      const lines = doc.splitTextToSize(reading, maxWidth);
      doc.text(lines, margin, 110, { lineHeightFactor: 1.35 });

      const fn = `kafetzou-reading-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fn);

      toast({ title: "Έτοιμο!", description: "Κατέβηκε το PDF." });
    } catch (e) {
      toast({
        title: "Σφάλμα PDF",
        description: "Δεν ήταν δυνατή η δημιουργία PDF.",
        variant: "destructive",
      });
    }
  };

  // ---- Share ----
  const shareReading = async () => {
    const text = `${readerInfo?.name} • ${producedAtLabel}\n\n${reading}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Ανάγνωση Φλιτζανιού",
          text,
        });
      } catch {
        // ακύρωση ή σφάλμα — απλώς σιωπή
      }
      return;
    }
    // Fallback: copy
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Αντιγράφηκε!", description: "Το κείμενο αντιγράφηκε στο πρόχειρο." });
    } catch {
      toast({
        title: "Αποτυχία αντιγραφής",
        description: "Δεν ήταν δυνατή η αντιγραφή στο clipboard.",
        variant: "destructive",
      });
    }
  };

  // ---- Save (τοπικά χωρίς login) ----
  const saveLocally = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? (JSON.parse(raw) as any[]) : [];

      const item = {
        id: crypto.randomUUID(),
        producedAt: producedAt.toISOString(),
        reader: readerInfo?.name,
        readerId: readerInfo?.id,
        gender: gender || null,
        ageRange: ageRange || null,
        text: reading,
      };
      arr.unshift(item);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

      toast({ title: "Αποθηκεύτηκε", description: "Ο χρησμός αποθηκεύτηκε στη συσκευή σου." });
    } catch {
      toast({
        title: "Σφάλμα αποθήκευσης",
        description: "Δεν ήταν δυνατή η αποθήκευση τοπικά.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-mystical-purple/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-mystical-purple">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Επιστροφή
          </Button>
          <h1 className="text-2xl font-mystical font-bold text-mystical-purple">Ανάγνωση Φλιτζανιού</h1>
          <div />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-mystical-purple">
              {readerInfo?.name} — <span className="text-muted-foreground">{producedAtLabel}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            {readerInfo?.description && <div>{readerInfo.description}</div>}
            <div className="flex flex-wrap gap-4">
              {gender && (
                <div className="rounded-full bg-mystical-purple/10 px-3 py-1 text-mystical-purple">Φύλο: {gender}</div>
              )}
              {ageRange && (
                <div className="rounded-full bg-mystical-purple/10 px-3 py-1 text-mystical-purple">
                  Ηλικιακό εύρος: {ageRange}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reading body */}
        <Card>
          <CardContent className="pt-6">
            <article className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-mystical-purple">
              {reading.split("\n").map((line, i) => (
                <p key={i}>{line.trim()}</p>
              ))}
            </article>

            {/* Actions */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {!isSpeaking ? (
                <Button onClick={playTTS} className="w-full">
                  <Volume2 className="mr-2 h-5 w-5" />
                  Άκου
                </Button>
              ) : (
                <Button variant="secondary" onClick={stopTTS} className="w-full">
                  <VolumeX className="mr-2 h-5 w-5" />
                  Στοπ
                </Button>
              )}

              <Button onClick={saveLocally} variant="outline" className="w-full">
                <Save className="mr-2 h-5 w-5" />
                Αποθήκευση
              </Button>

              <Button onClick={downloadPDF} variant="outline" className="w-full">
                <Download className="mr-2 h-5 w-5" />
                Λήψη PDF
              </Button>

              <Button onClick={shareReading} variant="outline" className="w-full">
                <Share2 className="mr-2 h-5 w-5" />
                Κοινοποίηση
              </Button>
            </div>

            {/* μικρό helper για clipboard fallback */}
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Αν δεν υποστηρίζεται «Κοινοποίηση», θα γίνει αντιγραφή στο πρόχειρο.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CupReadingResult;
