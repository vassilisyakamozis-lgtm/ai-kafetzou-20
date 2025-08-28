import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Coffee, ArrowLeft, Upload, Heart, Crown, Sparkles } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import CupReadingResult from "@/components/CupReadingResult";
import CupReadingLoader from "@/components/CupReadingLoader";

type CupReadingForm = {
  reader: string;
  category: string;
  mood: string;
  question?: string;
  gender?: string;
  ageRange?: string;
  image: File | null;
};

const FALLBACK_IMG =
  "https://ziqhqdorqfowubjrchyu.supabase.co/storage/v1/object/public/tellers/katina-klassiki.png?v=2";

const readers = [
  {
    id: "young",
    name: "Ρένα η μοντέρνα",
    description: "Φρέσκες προβλέψεις με νεανική αισιοδοξία",
    icon: Heart,
    image:
      "https://ziqhqdorqfowubjrchyu.supabase.co/storage/v1/object/public/tellers/modern%20woman.png?v=2",
  },
  {
    id: "experienced",
    name: "Μαίρη η ψαγμένη",
    description: "Ισορροπημένη οπτική με εμπειρία ζωής",
    icon: Crown,
    image:
      "https://ziqhqdorqfowubjrchyu.supabase.co/storage/v1/object/public/tellers/katina-klassiki.png?v=2",
  },
  {
    id: "wise",
    name: "Ισιδώρα η πνευματική",
    description: "Αρχαία σοφία και βαθιές προβλέψεις",
    icon: Sparkles,
    image:
      "https://ziqhqdorqfowubjrchyu.supabase.co/storage/v1/object/public/tellers/mystic%20woman.png?v=2",
  },
];

const categories = [
  "Αγάπη & Σχέσεις",
  "Καριέρα & Εργασία",
  "Υγεία & Ευεξία",
  "Οικογένεια & Φίλοι",
  "Χρήματα & Οικονομικά",
  "Ταξίδια & Περιπέτειες",
  "Πνευματική Ανάπτυξη",
  "Γενικό Μέλλον",
];

const moods = [
  "Χαρούμενη/ος",
  "Ανήσυχη/ος",
  "Ελπιδοφόρα/ος",
  "Μπερδεμένη/ος",
  "Ενθουσιασμένη/ος",
  "Λυπημένη/ος",
  "Αισιόδοξη/ος",
  "Φοβισμένη/ος",
];

const genders = ["Γυναίκα", "Άνδρας", "Μη δυαδικό", "Άλλο/Δε θέλω να πω"];
const ages = ["18-24", "25-34", "35-44", "45-54", "55+"];

export default function Cup() {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  const [selectedReader, setSelectedReader] = useState<{
    id: string;
    name: string;
    description: string;
  } | null>(null);

  const form = useForm<CupReadingForm>({
    defaultValues: {
      reader: "",
      category: "",
      mood: "",
      question: "",
      gender: "",
      ageRange: "",
      image: null,
    },
  });

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    if (file) {
      const r = new FileReader();
      r.onload = (ev) => setImagePreview((ev.target?.result as string) || null);
      r.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const getCupReading = async (formData: CupReadingForm, file: File): Promise<string | null> => {
    const imageBase64 = await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onload = (ev) => resolve(((ev.target?.result as string) || "").split(",")[1] || "");
      r.readAsDataURL(file);
    });

    const readerName = readers.find((r) => r.id === formData.reader)?.name || "Καφετζού";

    const { data, error } = await supabase.functions.invoke("cup-reading", {
      body: {
        reader: readerName,
        category: formData.category,
        mood: formData.mood,
        question: formData.question,
        // αν θελήσεις, πρόσθεσε και αυτά στην edge function:
        gender: formData.gender,
        age_range: formData.ageRange,
        imageBase64,
      },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data?.reading ?? null;
  };

  const onSubmit = async (values: CupReadingForm) => {
    if (!selectedImage) {
      toast({
        title: "Παρακαλώ ανεβάστε μια εικόνα",
        description: "Χρειαζόμαστε την εικόνα του φλιτζανιού σας.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const info = readers.find((r) => r.id === values.reader) || null;
    setSelectedReader(info);

    try {
      const reading = await getCupReading(values, selectedImage);
      if (reading) {
        setReadingResult(reading);
        toast({ title: "Ο χρησμός σας είναι έτοιμος!", description: "Δείτε το αποτέλεσμα." });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Σφάλμα",
        description: err?.message || "Κάτι πήγε στραβά. Δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setReadingResult(null);
    setSelectedReader(null);
    setSelectedImage(null);
    setImagePreview(null);
    form.reset();
  };

  const handleSaveReading = async (_text: string) => {
    // TODO: implement όταν ενεργοποιηθεί login
    throw new Error("Η αποθήκευση ενεργοποιείται όταν προστεθεί login.");
  };

  // Loader / Result states
  if (isLoading && selectedReader) {
    return <CupReadingLoader readerName={selectedReader.name} />;
  }

  if (readingResult && selectedReader) {
    return (
      <CupReadingResult
        reading={readingResult}
        readerInfo={selectedReader}
        onBack={handleBack}
        onSave={handleSaveReading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-mystical-purple/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-mystical-purple hover:text-mystical-purple/80 transition-colors"
            >
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

      {/* Body */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-mystical font-bold text-mystical-purple mb-4">
              Ανακαλύψτε τα Μυστικά του Φλιτζανιού σας
            </h2>
            <p className="text-lg text-muted-foreground">
              Συμπληρώστε τα παρακάτω στοιχεία για μια προσωποποιημένη ανάγνωση
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Reader Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-mystical-purple">Επιλογή Καφετζούς</CardTitle>
                  <CardDescription>Διαλέξτε ποια καφετζού θα διαβάσει το φλιτζάνι σας</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="reader"
                    rules={{ required: "Παρακαλώ επιλέξτε καφετζού" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid gap-4 md:grid-cols-3"
                          >
                            {readers.map((r) => {
                              const Icon = r.icon;
                              return (
                                <div key={r.id} className="relative">
                                  <RadioGroupItem value={r.id} id={r.id} className="peer sr-only" />
                                  <Label
                                    htmlFor={r.id}
                                    className="flex flex-col p-0 overflow-hidden rounded-2xl border-2 border-mystical-purple/20 cursor-pointer hover:border-mystical-purple/40 peer-checked:border-mystical-purple peer-checked:bg-white transition-all"
                                  >
                                    <div className="w-full aspect-square relative overflow-hidden">
                                      <img
                                        src={r.image}
                                        onError={(e) => ((e.currentTarget.src = FALLBACK_IMG))}
                                        alt={r.name}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                      />
                                      <div className="absolute right-2 top-2">
                                        <Icon className="h-5 w-5 text-white drop-shadow" />
                                      </div>
                                    </div>
                                    <div className="px-4 py-3 text-center">
                                      <h3 className="font-medium text-mystical-purple">{r.name}</h3>
                                      <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                                    </div>
                                  </Label>
                                </div>
                              );
                            })}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Profile (Gender / Age) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-mystical-purple">Στοιχεία Προφίλ</CardTitle>
                  <CardDescription>
                    Βοηθούν να προσαρμόσουμε καλύτερα τον τόνο και το περιεχόμενο.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Φύλο</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Επιλέξτε..." />
                            </SelectTrigger>
                            <SelectContent>
                              {genders.map((g) => (
                                <SelectItem key={g} value={g}>
                                  {g}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ageRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ηλικιακό εύρος</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Επιλέξτε..." />
                            </SelectTrigger>
                            <SelectContent>
                              {ages.map((a) => (
                                <SelectItem key={a} value={a}>
                                  {a}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-mystical-purple">Τομέας Ενδιαφέροντος</CardTitle>
                  <CardDescription>Σε ποιον τομέα της ζωής σας θέλετε καθοδήγηση;</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="category"
                    rules={{ required: "Παρακαλώ επιλέξτε τομέα ενδιαφέροντος" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Επιλέξτε τομέα..." />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Mood */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-mystical-purple">Συναισθηματική Κατάσταση</CardTitle>
                  <CardDescription>Πώς νιώθετε αυτή τη στιγμή;</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="mood"
                    rules={{ required: "Παρακαλώ επιλέξτε τη διάθεσή σας" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Επιλέξτε διάθεση..." />
                            </SelectTrigger>
                            <SelectContent>
                              {moods.map((m) => (
                                <SelectItem key={m} value={m}>
                                  {m}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Question */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-mystical-purple">Ερώτηση (Προαιρετικό)</CardTitle>
                  <CardDescription>Έχετε κάποια συγκεκριμένη ερώτηση για την καφετζού;</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="π.χ. Θα βρω αγάπη φέτος; Πότε θα αλλάξει η καριέρα μου;"
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-mystical-purple">Φωτογραφία Φλιτζανιού</CardTitle>
                  <CardDescription>
                    Ανεβάστε μια καθαρή φωτογραφία του φλιτζανιού σας μετά τον καφέ.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-6">
                    <div className="w-full max-w-md">
                      <Label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-[#8B5CF6] bg-[#FBF7FF] rounded-2xl cursor-pointer hover:border-[#F472B6] hover:bg-[#FDF4FF] transition-all duration-300 shadow-[0_8px_32px_rgba(139,92,246,0.08)] p-8"
                      >
                        {imagePreview ? (
                          <div className="flex flex-col items-center space-y-4">
                            <img
                              src={imagePreview}
                              alt="Φλιτζάνι προεπισκόπηση"
                              className="w-32 h-32 object-cover rounded-xl border-2 border-[#8B5CF6]/20"
                            />
                            <span className="text-[#3B1F4A] font-medium">
                              Επιλέχθηκε εικόνα – μπορείτε να συνεχίσετε
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <Upload className="w-12 h-12 text-[#8B5CF6]" />
                            <p className="text-[#3B1F4A] font-medium text-center">
                              Κάνε κλικ ή σύρε την εικόνα εδώ
                            </p>
                          </div>
                        )}
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={onImageChange}
                        className="sr-only"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="text-center">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-mystical-purple to-mystical-purple-light text-white px-8 py-3 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Προετοιμάζεται ο χρησμός..." : "Ξεκινήστε την Ανάγνωση"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
