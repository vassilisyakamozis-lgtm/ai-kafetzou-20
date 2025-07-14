import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Volume2, VolumeX, Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CupReadingResultProps {
  reading: string;
  readerInfo: {
    id: string;
    name: string;
    description: string;
  };
  onBack: () => void;
  onSave?: (reading: string) => Promise<void>;
}

// Voice mapping for different personas
const VOICE_MAPPING = {
  young: { voice: 'nova', name: 'Νεαρή Μάντισσα', age: 'νεανική' },
  experienced: { voice: 'shimmer', name: 'Έμπειρη Καφετζού', age: 'ώριμη' },
  wise: { voice: 'alloy', name: 'Σοφή Γιαγιά', age: 'σοφή' }
};

const CupReadingResult = ({ reading, readerInfo, onBack, onSave }: CupReadingResultProps) => {
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
            Ο Χρησμός σας από την {voiceConfig.name}
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
            
            {onSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="border-golden text-golden hover:bg-golden hover:text-white"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Papyrus Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border-none shadow-2xl">
            {/* Papyrus background with CSS */}
            <div 
              className="absolute inset-0 opacity-90"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 20%, rgba(139, 121, 94, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(160, 140, 115, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 40% 60%, rgba(180, 165, 140, 0.1) 0%, transparent 50%),
                  linear-gradient(45deg, rgba(139, 121, 94, 0.05) 0%, rgba(160, 140, 115, 0.05) 25%, rgba(180, 165, 140, 0.05) 50%, rgba(139, 121, 94, 0.05) 75%, rgba(160, 140, 115, 0.05) 100%)
                `,
                backgroundColor: '#f7f3e9',
                backgroundSize: '200px 200px, 150px 150px, 250px 250px, 50px 50px'
              }}
            />
            
            {/* Aged paper texture */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(139, 121, 94, 0.1) 2px,
                    rgba(139, 121, 94, 0.1) 4px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 2px,
                    rgba(139, 121, 94, 0.1) 2px,
                    rgba(139, 121, 94, 0.1) 4px
                  )
                `
              }}
            />
            
            <CardContent className="relative z-10 p-8 md:p-12">
              {/* Decorative border */}
              <div className="border-2 border-golden/30 rounded-lg p-6 md:p-8 relative">
                {/* Corner decorations */}
                <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-golden/50"></div>
                <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-golden/50"></div>
                <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-golden/50"></div>
                <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-golden/50"></div>
                
                {/* Reading content */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-mystical text-mystical-purple-dark mb-2">
                    Χρησμός από την {voiceConfig.name}
                  </h2>
                  <p className="text-sm text-muted-foreground italic">
                    με {voiceConfig.age} φωνή και χρόνια εμπειρίας
                  </p>
                </div>
                
                <div className="prose max-w-none">
                  <div 
                    className="text-lg leading-relaxed text-mystical-purple-dark font-serif whitespace-pre-wrap text-justify"
                    style={{ 
                      fontFamily: '"Times New Roman", serif',
                      textShadow: '0 1px 2px rgba(139, 121, 94, 0.1)'
                    }}
                  >
                    {reading}
                  </div>
                </div>
                
                {/* Signature */}
                <div className="mt-8 text-right">
                  <p className="text-sm italic text-muted-foreground">
                    ~ {voiceConfig.name} ~
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date().toLocaleDateString('el-GR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Action buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={handlePlayAudio}
              disabled={isPlaying}
              className="bg-gradient-to-r from-mystical-purple to-mystical-purple-light text-white px-6"
            >
              {isPlaying ? (
                <>
                  <VolumeX className="h-4 w-4 mr-2" />
                  Σταμάτημα
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Άκου με τη φωνή της {voiceConfig.name}
                </>
              )}
            </Button>
            
            {onSave && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="outline"
                className="border-golden text-golden hover:bg-golden hover:text-white px-6"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Αποθήκευση...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Αποθήκευση στον Λογαριασμό
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CupReadingResult;