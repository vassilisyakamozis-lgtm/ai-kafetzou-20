import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useToast } from "@/hooks/use-toast";
import { Crown, Heart, Sparkles, Upload, Coffee, ArrowLeft, Check } from "lucide-react";

import CupReadingResult from "@/components/CupReadingResult";
import CupReadingLoader from "@/components/CupReadingLoader";

/** -------- Types -------- */
interface CupReadingForm {
  reader: string;
  category: string;
  mood: string;
  gender: string;
  age_range: string;
  question?: string;
}

type ReaderInfo = {
  id: string;
  name: string;
  description: string;
  icon: any;
  /** local (public/) path */
  localSrc: string;
  /** storage (supabase) fallback path */
  storagePath: string;
};

const EDGE_FN = "reading"; // αν θες το παλιό όνομα, βάλε "cup-reading"

/** -------- Data -------- */

const readers: ReaderInfo[] = [
  {
    id: "young",
    name: "Ρένα η μοντέρνα",
    description: "Φρέσκες προβλέψεις με νεανική αισιοδοξία",
    icon: Heart,
    localSrc: "/images/tellers/modern-woman.png",
    storagePath: "tellers/modern%20woman.png",
  },
  {
    id: "experienced",
    name: "Μαίρη η ψαγμένη",
    description: "Ισορροπημένη οπτική με εμπειρία ζωής",
    icon: Crown,
    localSrc: "/images/tellers/katina-klassiki.png",
    storagePath: "tellers/katina-klassiki.png",
  },
  {
    id: "wise",
    name: "Ισιδώρα η πνευματική",
    description: "Αρχαία σοφία και βαθιές προβλέψεις",
    icon: Sparkles,
    localSrc: "/images/tellers/mystic-woman.png",
    storagePath: "tellers/mystic%20woman.png",
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

const genders = ["Γυναίκα", "Άνδρας", "Άλλο"];
const ageRanges = ["17-24", "25-34", "35-44", "45-54", "55-64", "64+"];

/** -------- Helpers -------- */

function buildStoragePublicUrl(path: string) {
  // Δημόσιο URL για Supabase storage (Public bucket "tellers")
  // Το base URL είναι το PROJECT_URL από το supabase client
  const baseUrl = supabase.storage.from("tellers").getPublicUrl(path).data.publicUrl;
  return baseUrl;
}

/** -------- Component -------- */

const Cup = () => {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  const [selectedReader, setSelectedReader] = useState<{ id: string; name: string; description: string } | null>(null);

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<CupReadingForm>({
    defaultValues: {
      reader: "",
      category: "",
      mood: "",
      gender: "",
      age_range: "",
      question: "",
    },
  });

  /** --- Derived for image border highlight --- */
  const currentReader = useMemo(
    () => readers.find((r) => r.id === form.getValues("reader")),
    [form.watch("reader")]
  );

  /** --- Upload image change --- */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImageFile(file);

    const r = new FileReader();
    r.onload = (ev) => setImagePreview((ev.target?.result as string) || null);
    r.readAsDataURL(file);
  };

  /** --- Call Edge Function --- */
  const onSubmit = async (data: CupReadingForm) => {
    if (!selectedImageFile) {
      toast({
        title: "Παρακαλώ ανεβάστε μια εικόνα",
        description: "Χρειαζόμαστε την εικόνα του φλιτζανιού σας.",
        variant: "destructive",
      });
      return;
    }

    const selReader = readers.find((r) => r.id === data.reader);
    if (!selReader) {
      toast({ title: "Επιλέξτε καφετζού", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setSelectedReader({ id: selReader.id, name: selReader.name, description: selReader.description });

    try {
      // Μετατρέπουμε σε base64 μόνο το payload (όχι το full dataURL)
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = (ev) => {
          const full = ev.target?.result as string;
          const only = full.includes(",") ? full.split(",")[1] : full;
          resolve(only);
        };
        r.readAsDataURL(selectedImageFile);
      });

      const payload = {
        reader: selReader.name,
        category: data.category,
        mood: data.mood,
        question: data.question,
        gender: data.gender,
        age_range: data.age_range,
        imageBase64: base64,
      };

      const { data: resp, error } = await supabase.functions.invoke(EDGE_FN, { body: payload });
      if (error) throw error;

      if (resp?.error) {
        throw new Error(resp.error);
      }

      if (resp?.reading) {
        setReadingResult(resp.reading);
        toast({ title: "Ο χρησμός σας είναι έτοιμος!", description: "Δείτε την ανάγνωση του φλιτζανιού σας." });
      } else {
        throw new Error("Άγνωστη απόκριση από το μοντέλο.");
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

  /** --- Back from result --- */
  const handleBackToForm = () => {
    setReadingResult(null);
    setSelectedReader(null);
    form.reset();
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  /** --- Placeholder save (ενεργοποίηση με login) --- */
  const handleSaveReading = async () => {
    throw new Error("Η αποθήκευση θα ενεργοποιηθεί όταν προστεθεί login.");
  };

  /** --- Loader & Result states --- */
  if (isLoading && selectedReader) {
    return <CupReadingLoader readerName={selectedReader.name} />;
  }

  if (readingResult && selectedReader) {
    return (
      <CupReadingResult
        reading={readingResult}
        readerInfo={selectedReader}
        onBack={handleBackToForm}
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
              {/* Readers */}
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
                            className="grid md:grid-cols-3 gap-5"
                          >
                            {readers.map((reader) => {
                              const Icon = reader.icon;
                              const checked = field.value === reader.id;
                              return (
                                <div key={reader.id} className="relative">
                                  <RadioGroupItem id={reader.id} value={reader.id} className="peer sr-only" />

                                  <Label
                                    htmlFor={reader.id}
                                    className={[
                                      "flex flex-col p-0 overflow-hidden rounded-2xl cursor-pointer transition-all",
                                      "border-2",
                                      checked
                                        ? "border-mystical-purple ring-4 ring-mystical-purple/20 shadow-[0_12px_30px_rgba(139,92,246,0.22)]"
                                        : "border-mystical-purple/20 hover:border-mystical-purple/40",
                                    ].join(" ")}
                                  >
                                    {/* Image full-bleed with fallback */}
                                    <div className="w-full aspect-square overflow-hidden relative">
                                      <img
                                        src={reader.localSrc}
                                        alt={reader.name}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                          const target = e.currentTarget;
                                          // Fallback σε public URL supabase storage
                                          target.src = buildStoragePublicUrl(reader.storagePath);
                                        }}
                                      />
                                      {/* Icon top-right */}
                                      <div className="absolute right-2 top-2">
                                        <Icon className="h-5 w-5 text-white drop-shadow" />
                                      </div>

                                      {/* Επιλέχθηκε badge */}
                                      {checked && (
                                        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-mystical-purple/90 px-2.5 py-1 text-xs font-medium text-white shadow">
                                          <Check className="h-3.5 w-3.5" />
                                          Επιλέχθηκε
                                        </div>
                                      )}
                                    </div>

                                    {/* Text */}
                                    <div className="px-4 py-3 text-center">
                                      <h3 className="font-medium text-mystical-purple">{reader.name}</h3>
                                      <p className="text-sm text-muted-foreground mt-1">{reader.description}</p>
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

              {/* Profile (gender + age) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-mystical-purple">Στοιχεία Προφίλ</CardTitle>
                  <CardDescription>
                    Βοηθούν να προσαρμόσουμε καλύτερα τον τόνο και το περιεχόμενο.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Gender */}
                    <FormField
                      control={form.control}
                      name="gender"
                      rules={{ required: "Παρακαλώ επιλέξτε φύλο" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Φύλο..." />
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
                    {/* Age */}
                    <FormField
                      control={form.control}
                      name="age_range"
                      rules={{ required: "Παρακαλώ επιλέξτε ηλικιακό εύρος" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Ηλικιακό εύρος..." />
                              </SelectTrigger>
                              <SelectContent>
                                {ageRanges.map((a) => (
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
                  </div>
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
                    Ανεβάστε μια καθαρή φωτογραφία του φλιτζανιού σας μετά τον καφέ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-6">
                    <div className="w-full max-w-md">
                      <Label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-[#8B5CF6] bg-[#FBF7FF] rounded-2xl cursor-pointer hover:border-[#F472B6] hover:bg-[#FDF4FF] transition-all duration-300 shadow-[0_8px_32px_rgba(139,92,246,0.08)] p-8"
                      >
                        {!imagePreview ? (
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <Upload className="w-12 h-12 text-[#8B5CF6]" />
                            <p className="text-[#3B1F4A] font-medium text-center">
                              Κάνε κλικ ή σύρε την εικόνα εδώ
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-4">
                            <img
                              src={imagePreview}
                              alt="Φλιτζάνι προεπισκόπηση"
                              className="w-32 h-32 object-cover rounded-xl border-2 border-[#8B5CF6]/20"
                            />
                            <Button
                              type="submit"
                              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-xl px-6 py-3 shadow-[0_4px_16px_rgba(139,92,246,0.18)] transition"
                            >
                              Προχώρα στην Ανάλυση
                            </Button>
                          </div>
                        )}
                      </Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA when δεν υπάρχει preview */}
              {!imagePreview && (
                <div className="text-center">
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-gradient-to-r from-mystical-purple to-mystical-purple-light text-white px-8 py-3 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Προετοιμάζεται ο χρησμός...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Ξεκινήστε την Ανάγνωση
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Cup;
