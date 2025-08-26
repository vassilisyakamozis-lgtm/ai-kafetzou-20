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
  young: { voice: 'nova', name: 'Νεαρή Μάντισσα', age: 'νεανική' },
  experienced: { voice: 'shimmer', name: 'Έμπειρη Καφετζού', age: 'ώριμη' },
  wise: { voice: 'alloy', name: 'Σοφή Γιαγιά', age: 'σοφή' }
};

const CupReadingResult = ({ reading, readerInfo, uploadedImage, detectedSymbols = [], onBack, onSave }: CupReadingResultProps) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const voiceConfig = VOICE_MAPPING[readerInfo.id as keyof typeof VOICE_MAPPING] || VOICE_MAPPING.experienced;

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  const handlePlayAudio = async () => {
    if (isPlaying && currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      
      // Call Supabase edge function for text-to-speech
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: reading, voice: voiceConfig.voice }
      });

      if (error) {
        throw new Error('Failed to generate speech');
      }

      const { audioContent } = data;
      
      // Create audio from base64
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      setCurrentAudio(audio);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        toast({
          title: "Σφάλμα αναπαραγωγής",
          description: "Δεν ήταν δυνατή η αναπαραγωγή του ήχου.",
          variant: "destructive",
        });
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
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
    } catch (error) {
      toast({
        title: "Σφάλμα αποθήκευσης",
        description: "Δεν ήταν δυνατή η αποθήκευση. Δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to format reading content with proper structure
  const formatReading = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Section headings (###)
      if (line.match(/^### \d+\./)) {
        return (
          <h3 key={index} className="font-mystical font-semibold text-[#3B1F4A] text-xl mb-3 mt-6 first:mt-0 pb-2 border-b-2 border-[#F3E8FF] w-fit">
            {line.replace(/^### /, '')}
          </h3>
        );
      }
      // Advice list items
      if (line.match(/^- /)) {
        return (
          <div key={index} className="bg-[#F9F5FF] rounded-lg p-4 mt-4 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-green-600">✔️</span>
              <span className="font-elegant text-[#3B1F4A] leading-relaxed">{line.replace(/^- /, '')}</span>
            </div>
          </div>
        );
      }
      // Regular paragraphs
      if (line.trim()) {
        return (
          <p key={index} className="font-elegant text-base text-[#3B1F4A] leading-relaxed max-w-[620px] mb-4">
            {line}
          </p>
        );
      }
      return null;
    });
  };

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
          
          <h1 className="text-2xl font-mystical font-bold text-mystical-purple text-center">
            Ο Χρησμός σας
          </h1>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayAudio}
              disabled={isPlaying}
              className="border-mystical-purple text-mystical-purple hover:bg-mystical-purple hover:text-white"
            >
              {isPlaying ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column - Image & Symbols */}
            <div className="space-y-6">
              {/* Uploaded Cup Image */}
              {uploadedImage && (
                <Card className="rounded-2xl shadow-[0_8px_32px_rgba(139,92,246,0.08)]">
                  <CardContent className="p-6">
                    <h3 className="font-mystical font-semibold text-[#3B1F4A] text-lg mb-4">
                      Το Φλιτζάνι σας
                    </h3>
                    <div className="aspect-square overflow-hidden rounded-xl">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded cup" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detected Symbols */}
              {detectedSymbols.length > 0 && (
                <Card className="rounded-2xl shadow-[0_8px_32px_rgba(139,92,246,0.08)]">
                  <CardContent className="p-6">
                    <h3 className="font-mystical font-semibold text-[#3B1F4A] text-lg mb-4">
                      Σύμβολα που Εντόπισα
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {detectedSymbols.map((symbol, index) => (
                        <span 
                          key={index}
                          className="bg-[#F3E8FF] text-[#3B1F4A] text-sm px-3 py-1 rounded-full"
                        >
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Reading Card */}
            <div>
              <Card className="rounded-2xl shadow-[0_8px_32px_rgba(139,92,246,0.08)] border border-[#E9D5FF] overflow-hidden">
                <div 
                  className="relative"
                  style={{ backgroundColor: '#FAF3E0' }}
                >
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 rounded-2xl shadow-inner" style={{
                    boxShadow: 'inset 0 0 20px rgba(139, 92, 246, 0.05)'
                  }} />
                  
                  <CardContent className="relative p-8">
                    {/* Reading Header */}
                    <div className="text-center mb-8">
                      <h2 className="font-mystical text-[26px] font-bold bg-gradient-to-r from-[#8B5CF6] to-[#F472B6] bg-clip-text text-transparent mb-2">
                        Χρησμός από τη Νεαρή Μάντισσα
                      </h2>
                      <p className="font-elegant italic text-[#7E6A8A]">
                        με νεανική φωνή και χρόνια εμπειρίας
                      </p>
                    </div>
                    
                    {/* Reading Content */}
                    <div className="space-y-4">
                      {formatReading(reading)}
                    </div>
                  </CardContent>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <Button
                  onClick={handlePlayAudio}
                  disabled={isPlaying}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-xl px-6 py-3 shadow-[0_4px_16px_rgba(139,92,246,0.18)] transition"
                >
                  {isPlaying ? (
                    <>
                      <VolumeX className="h-4 w-4 mr-2" />
                      Σταμάτημα
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 mr-2" />
                      Άκου
                    </>
                  )}
                </Button>
                
                {onSave && (
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-xl px-6 py-3 shadow-[0_4px_16px_rgba(139,92,246,0.18)] transition"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Αποθήκευση...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Αποθήκευσε τον Χρησμό
                      </>
                    )}
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-xl px-6 py-3 shadow-[0_4px_16px_rgba(139,92,246,0.18)] transition border-0"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Λήψη PDF
                </Button>
                
                <Button
                  variant="outline"
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-xl px-6 py-3 shadow-[0_4px_16px_rgba(139,92,246,0.18)] transition border-0"
                >
                  <Share2 className="h-4 w-4 mr-2" />
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