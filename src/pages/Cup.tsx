import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Crown, Heart, Sparkles, Upload, Coffee, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CupReadingResult from "@/components/CupReadingResult";
import CupReadingLoader from "@/components/CupReadingLoader";

interface CupReadingForm {
  reader: string;
  category: string;
  mood: string;
  question?: string;
  image: File | null;
}

const Cup = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  const [selectedReader, setSelectedReader] = useState<{ id: string; name: string; description: string } | null>(null);

  const form = useForm<CupReadingForm>({
    defaultValues: { reader: "", category: "", mood: "", question: "", image: null },
  });

  // ✅ Readers με τα σωστά Supabase URLs
  const readers = [
    {
      id: "young",
      name: "Ρένα η μοντέρνα",
      description: "Φρέσκες προβλέψεις με νεανική αισιοδοξία",
      icon: Heart,
      image: "https://ziqhqdorqfowubjrchyu.supabase.co/storage/v1/object/public/tellers/modern%20woman.png?v=2",
      gradient: "from-rose-gold to-soft-pink",
    },
    {
      id: "experienced",
      name: "Μαίρη η ψαγμένη",
      description: "Ισορροπημένη οπτική με εμπειρία ζωής",
      icon: Crown,
      image: "https://ziqhqdorqfowubjrchyu.supabase.co/storage/v1/object/public/tellers/katina-klassiki.png?v=2",
      gradient: "from-mystical-purple to-mystical-purple-light",
    },
    {
      id: "wise",
      name: "Ισιδώρα η πνευματική",
      description: "Αρχαία σοφία και βαθιές προβλέψεις",
      icon: Sparkles,
      image: "https://ziqhqdorqfowubjrchyu.supabase.co/storage/v1/object/public/tellers/mystic%20woman.png?v=2",
      gradient: "from-golden to-golden-light",
    },
  ];

  const categories = [
    "Αγάπη & Σχέσεις", "Καριέρα & Εργασία", "Υγεία & Ευεξία", "Οικογένεια & Φίλοι",
    "Χρήματα & Οικονομικά", "Ταξίδια & Περιπέτειες", "Πνευματική Ανάπτυξη", "Γενικό Μέλλον",
  ];

  const moods = [
    "Χαρούμενη/ος","Ανήσυχη/ος","Ελπιδοφόρα/ος","Μπερδεμένη/ος","Ενθουσιασμένη/ος","Λυπημένη/ος","Αισιόδοξη/ος","Φοβισμένη/ος",
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const r = new FileReader();
      r.onload = ev => setImagePreview(ev.target?.result as string);
      r.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CupReadingForm) => {
    if (!selectedImage) {
      toast({ title: "Παρακαλώ ανεβάστε μια εικόνα", description: "Χρειαζόμαστε την εικόνα του φλιτζανιού σας.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const readerInfo = readers.find(r => r.id === data.reader);
    setSelectedReader(readerInfo || null);
    try {
      const result = await getCupReading(data, selectedImage);
      if (result) setReadingResult(result);
    } catch (e) {
      console.error(e);
      toast({ title: "Σφάλμα", description: "Κάτι πήγε στραβά. Δοκιμάστε ξανά.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getCupReading = async (formData: CupReadingForm, imageFile: File): Promise<string | null> => {
    const imageBase64 = await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onload = (e) => resolve((e.target?.result as string).split(",")[1]);
      r.readAsDataURL(imageFile);
    });

    const readerName = readers.find(r => r.id === formData.reader)?.name || "Καφετζού";
    const { data, error } = await supabase.functions.invoke("cup-reading", {
      body: { reader: readerName, category: formData.category, mood: formData.mood, question: formData.question, imageBase64 },
    });
    if (error) throw new Error("Σφάλμα επικοινωνίας με το σύστημα ανάγνωσης.");
    if (data?.error) throw new Error(data.error);
    if (data?.reading) {
      toast({ title: "Ο χρησμός σας είναι έτοιμος!", description: "Δείτε την ανάγνωση του φλιτζανιού σας." });
      return data.reading;
    }
    return null;
  };

  const handleBackToForm = () => {
    setReadingResult(null); setSelectedReader(null); form.reset(); setSelectedImage(null); setImagePreview(null);
  };

  const handleSaveReading = async (_reading: string) => {
    console.log("Saving reading…");
    throw new Error("Η αποθήκευση θα ενεργοποιηθεί όταν προστεθεί login.");
  };

  if (isLoading && selectedReader) return <CupReadingLoader readerName={selectedReader.name} />;
  if (readingResult && selectedReader) {
    return <CupReadingResult reading={readingResult} readerInfo={selectedReader} onBack={handleBackToForm} onSave={handleSaveReading} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-mystical-purple/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-mystical-purple hover:text-mystical-purple/80 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Επιστροφή</span>
            </Link>
            <h1 className="text-2xl font-mystical font-bold text-mystical-purple">
              <Coffee className="inline-block mr-2 h-6 w-6" />
              Ανάγνωση Φλιτζανιού
            </h1>
            <div />
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-mystical font-bold text-mystical-purple mb-4">Ανακαλύψτε τα Μυστικά του Φλιτζανιού σας</h2>
            <p className="text-lg text-muted-foreground">Συμπληρώστε τα παρακάτω στοιχεία για μια προσωποποιημένη ανάγνωση</p>
          </div>
          {/* υπόλοιπο form (κατηγορίες, διάθεση, ερώτηση, upload) παραμένει ίδιο */}
        </div>
      </div>
    </div>
  );
};

export default Cup;
