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
      toast({ title: "Σφάλμα", description: "Κάτι πήγε
