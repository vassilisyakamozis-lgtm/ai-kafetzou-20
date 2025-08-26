"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Volume2, VolumeX, Save, ArrowLeft, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CupReadingResultProps {
  reading: string;
  readerInfo: {
    id: string;
    name: string;
    description: string;
  };
  uploadedImage?: string;
  detectedSymbols?: string[];
  onBack: () => void;
  onSave?: (reading: string) => Promise<void>;
}

// Voice mapping for different personas
const VOICE_MAPPING = {
  young: { voice: "nova", name: "Νεαρή Μάντισσα", age: "νεανική" },
  experienced: { voice: "shimmer", name: "Έμπειρη Καφετζού", age: "ώριμη" },
  wise: { voice: "alloy", name: "Σοφή Γιαγιά", age: "σοφή" },
} as const;

const b64ToBlobUrl = (b64: string, mime = "audio/mpeg") => {
  const byteChars = atob(b64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mime });
  return URL.createObjectURL(blob);
};

const CupReadingResult = ({
  reading,
  readerInfo,
  uploadedImage,
  detectedSymbols = [],
  onBack,
  onSave,
}: CupReadingResultProps) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const voiceConfig =
    VOICE_MAPPING[(readerInfo?.id as keyof typeof VOICE_MAPPING) || "experienced"] ??
    VOICE_MAPPING.experienced;

  useEffect(() => {
    return () => {
      if (currentAudio) {
        try {
          currentAudio.pause();
          URL.revokeObjectURL(currentAudio.src);
          currentAudio.src = "";
        } catch {}
      }
    };
  }, [currentAudio]);

  const handlePlayAudio = async () => {
    try {
      // toggle off
      if (isPlaying && currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setIsPlaying(false);
        return;
      }

      // stop previous if exists
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        URL.revokeObjectURL(currentAudio.src);
      }

      setIsPlaying(true);
      toast({
        title: "🔊 Ο Χρησμός σου παίζει…",
        description: "Άκου προσεκτικά τις προβλέψεις σου",
      });

      const { data, error } = await supabase.functions.invoke("text-to-speech", {
        body: { text: reading, voice: voiceConfig.voice },
      });
      if (error || !data?.audioContent) throw new Error("TTS failed");

      const url = b64ToBlobUrl(data.audioContent);
      const audio = new Audio(url);
      setCurrentAudio(audio);

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
        toast({
          title: "Σφάλμα αναπαραγωγής",
          description: "Δεν ήταν δυνατή η αναπαραγωγή του ήχου.",
          variant: "destructive",
        });
      };

      await audio.play();
    } catch (e) {
      setIsPlaying(false);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η δημιουργία ήχου. Δοκιμάστε ξανά.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(reading);
      toast({
        title: "Επιτυχής αποθήκευση",
        description: "Ο χρησμός αποθηκεύτηκε στον λογαριασμό σας.",
      });
    } catch {
      toast({
        title: "Σφάλμα αποθήκευσης",
        description: "Δεν ήταν δυνατή η αποθήκευση. Δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    // Placeholder – πρόσθεσε υλοποίηση (html2canvas + jsPDF ή server function)
    toast({ title: "Σύντομα διαθέσιμο", description: "Η λήψη PDF θα προστεθεί άμεσα." });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Ο Χρησμός μου",
          text: reading,
          url: typeof window !== "undefined" ? window.location.href : undefined,
        });
      } else {
        await navigator.clipboard.writeText(
          `${reading}\n\n${typeof window !== "undefined" ? window.location.href : ""}`
        );
        toast({ title: "Αντιγράφηκε", description: "Ο σύνδεσμος αντιγράφηκε στο πρόχειρο." });
      }
    } catch {}
  };

  // Format reading text with headings and paragraphs
  const formatReading = (text: string) =>
    text.split("\n").map((line, i) => {
      if (/^### \d+\./.test(line)) {
        return (
          <h3
            key={`h-${i}`}
            className="font-['Playfair_Display'] font-bold text-[#3B1F4A] text-xl mb-2 mt-6 first:mt-0 border-b-2 border-[#E9D5FF] w-fit pb-1"
          >
            {line.replace(/^### /, "")}
          </h3>
        );
      }
      if (/^- /.test(line)) {
        return (
          <p key={`li-${i}`} className="font-['Inter'] text-base text-[#3B1F4A] leading-relaxed max-w-[620px] mb-4">
            {line.replace(/^- /, "")}
          </p>
        );
      }
      if (line.trim()) {
        return (
          <p key={`p-${i}`} className="font-['Inter'] text-base text-[#3B1F4A] leading-relaxed max-w-[620px] mb-4">
            {line}
          </p>
        );
      }
      return null;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-purple/10 via-background to-rose-gold/10">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-mystical-purple hover:text-mystical-purple-dark"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Πίσω
          </Button>

          <h1 className="text-2xl font-mystical font-bold text-mystical-purple text-center flex-1">
            Ο Χρησμός σας
          </h1>

          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayAudio}
              aria-pressed={isPlaying}
              aria-label={isPlaying ? "Διακοπή αφήγησης" : "Αναπαραγωγή αφήγησης"}
              className="border-mystical-purple text-mystical-purple hover:bg-mystical-purple hover:text-white"
            >
              {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left column (1/3) */}
            <div className="lg:col-span-4 space-y-6">
              {uploadedImage && (
                <div>
                  <h3 className="font-['Playfair_Display'] font-semibold text-[#3B1F4A] text-lg mb-4">
                    Το Φλιτζάνι σας
                  </h3>
                  <div className="max-w-[260px] mx-auto lg:mx-0">
                    <img
                      src={uploadedImage}
                      alt="Uploaded cup"
                      className="w-full aspect-square object-cover rounded-xl shadow-lg"
                    />
                  </div>
                </div>
              )}

              {detectedSymbols.length > 0 && (
                <div>
                  <h3 className="font-['Playfair_Display'] font-semibold text-[#3B1F4A] text-lg mb-4">
                    Σύμβολα που Εντόπισα
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {detectedSymbols.map((symbol, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center bg-[#F3E8FF] text-[#3B1F4A] text-sm font-medium rounded-full px-3 py-1"
                      >
                        {symbol}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column (2/3) */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="rounded-2xl shadow-[0_8px_32px_rgba(139,92,246,0.08)] border border-[#E9D5FF] overflow-hidden max-w-none">
                <div className="relative" style={{ backgroundColor: "#FAF3E0" }}>
                  {/* inner glow */}
                  <div
                    className="absolute inset-0 rounded-2xl shadow-inner"
                    style={{ boxShadow: "inset 0 0 20px rgba(139, 92, 246, 0.05)" }}
                  />
                  <CardContent className="relative p-8">
                    <div className="text-center mb-8">
                      <h2 className="font-['Playfair_Display'] text-[26px] font-bold bg-gradient-to-r from-[#8B5CF6] to-[#F472B6] bg-clip-text text-transparent mb-2">
                        Χρησμός από τη {voiceConfig.name}
                      </h2>
                      <p className="font-['Inter'] italic text-[#7E6A8A]">
                        με {voiceConfig.age} φωνή και χρόνια εμπειρίας
                      </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 max-w-[620px]">{formatReading(reading)}</div>
                  </CardContent>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={handlePlayAudio}
                  disabled={isPlaying}
                  aria-pressed={isPlaying}
                  aria-label={isPlaying ? "Διακοπή αφήγησης" : "Αναπαραγωγή αφήγησης"}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-xl px-5 py-3 flex items-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <VolumeX className="h-4 w-4" /> Σταμάτημα
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" /> Άκου
                    </>
                  )}
                </Button>

                {onSave && (
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    variant="outline"
                    className="bg-white border border-[#8B5CF6]/30 hover:bg-[#F3E8FF] rounded-xl px-5 py-3 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                        Αποθήκευση...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Αποθήκευσε τον Χρησμό
                      </>
                    )}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={handleDownloadPdf}
                  className="bg-white border border-[#8B5CF6]/30 hover:bg-[#F3E8FF] rounded-xl px-5 py-3 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Λήψη PDF
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleShare}
                  className="text-[#3B1F4A] hover:text-[#8B5CF6] flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Κοινοποίησε
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CupReadingResult;
