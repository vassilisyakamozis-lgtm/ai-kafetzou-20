import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Crown, Heart, Sparkles, Upload, Coffee, ArrowLeft, Check } from "lucide-react";

import CupReadingResult from "@/components/CupReadingResult";
import CupReadingLoader from "@/components/CupReadingLoader";

interface CupReadingForm {
  reader: string;
  category: string;
  mood: string;
  gender?: string;
  age_range?: string;
  question?: string;
  image: File | null;
}

type Reader = {
  id: "young" | "experienced" | "wise";
  name: string;
  description: string;
  icon: any;
  image: string;          // local public path (/tellers/...)
  fallback?: string;      // optional absolute fallback (supabase public URL)
};

const genders = ["Γυναίκα", "Άνδρας", "Άλλο"];
const ageRanges = ["17-24", "25-34", "35-44", "45-54", "55-64", "64+"];

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

const Cup = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  const [selectedReader, setSelectedReader] = useState<{ id: string; name: string; description: string } | null>(null);

  // αν κάποιο img αποτύχει, γυρνάμε σε fallback
  const [brokenImg, setBrokenImg] = useState<Record<string, boolean>>({});

  // === ΒΑΛΕ τις εικόνες σου στον φάκελο /public/tellers/ και κράτα αυτά τα paths ===
  const readers: Reader[] = useMemo(
    () => [
      {
        id: "young",
        name: "Ρένα η μοντέρνα",
        description: "Φρέσκες προβλέψεις με νεανική αισιοδοξία",
        icon: Heart,
        image: "/tellers/modern-woman.png",
        // fallback προαιρετικό: βάλε εδώ (αν θέλεις) δημόσιο supabase URL
        // fallback: "https://<project-ref>.supabase.co/storage/v1/object/public/tellers/modern-woman.png",
      },
      {
        id: "experienced",
        name: "Μαίρη η ψαγμένη",
        description: "Ισορροπημένη οπτική με εμπειρία ζωής",
        icon: Crown,
        image: "/tellers/katina-klassiki.png",
        // fallback: "https://<project-ref>.supabase.co/storage/v1/object/public/tellers/katina-klassiki.png",
      },
      {
        id: "wise",
        name: "Ισιδώρα η πνευματική",
        description: "Αρχαία σοφία και βαθιές προβλέψεις",
        icon: Sparkles,
        image: "/tellers/mystic-woman.png",
        // fallback: "https://<project-ref>.supabase.co/storage/v1/object/public/tellers/mystic-woman.png",
      },
    ],
    []
  );

  const form = useForm<CupReadingForm>({
    defaultValues: {
      reader: "",
      category: "",
      mood: "",
      gender: "",
      age_range: "",
      question: "",
      image: null,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const r = new FileReader();
    r.onload = (ev) => setImagePreview(ev.target?.result as string);
    r.readAsDataURL(file);
  };

  const getCupReading = async (formData: CupReadingForm, imageFile: File): Promise<string | null> => {
    // μετατρέπουμε το image σε base64 (χωρίς data: prefix)
    const imageBase64 = await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onload = (e) => resolve((e.target?.result as string).split(",")[1]);
      r.readAsDataURL(imageFile);
    });

    const readerName = readers.find((r) => r.id === formData.reader)?.name || "Καφετζού";

    const { data, error } = await supabase.functions.invoke("cup-reading", {
      body: {
        reader: readerName,
        category: formData.category,
        mood: formData.mood,
        question: formData.question,
        imageBase64,
        // περνάμε και gender/age_range στο prompt, εφόσον ο κώδικας του Edge Function τα αξιοποιεί
        gender: formData.gender,
        age_range: formData.age_range,
      },
    });

    if (error) throw new Error("Σφάλμα επικοινωνίας με το σύστημα ανάγνωσης.");
    if (data?.error) throw new Error(data.error);

    if (data?.reading) {
      toast({
        title: "Ο χρησμός σας είναι έτοιμος!",
        description: "Δείτε την ανάγνωση του φλιτζανιού σας.",
      });
      return data.reading;
    }
    return null;
  };

  const onSubmit = async (data: CupReadingForm) => {
    if (!selectedImage) {
      toast({
        title: "Παρακαλώ ανεβάστε μια εικόνα",
        description: "Χρειαζόμαστε την εικόνα του φλιτζανιού σας.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const rInfo = readers.find((r) => r.id === data.reader);
    setSelectedReader(rInfo || null);

    try {
      const result = await getCupReading(data, selectedImage);
      if (result) setReadingResult(result);
    } catch (e) {
      console.error(e);
      toast({
        title: "Σφάλμα",
        description: "Κάτι πήγε στραβά. Δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setReadingResult(null);
    setSelectedReader(null);
    form.reset();
    setSelectedImage(null);
    setImagePreview(null);
    setBrokenImg({});
  };

  const handleSaveReading = async (_reading: string) => {
    // θα το ενεργοποιήσεις όταν μπει login
    throw new Error("Η αποθήκευση θα ενεργοποιηθεί όταν προστεθεί login.");
  };

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
              {/* Επιλογή Καφετζούς */}
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
                            {readers.map((r) => {
                              const Icon = r.icon;
                              const isSelected = field.value === r.id;
                              const src = brokenImg[r.id] && r.fallback ? r.fallback : r.image;

                              return (
                                <div key={r.id} className="relative">
                                  <RadioGroupItem id={r.id} value={r.id} className="peer sr-only" />
                                  <Label
                                    htmlFor={r.id}
                                    className={[
                                      "block overflow-hidden rounded-2xl cursor-pointer transition-all",
                                      "bg-white border-2 border-mystical-purple/20 hover:border-mystical-purple/40",
                                      "peer-checked:border-mystical-purple peer-checked:shadow-[0_0_0_4px_rgba(139,92,246,0.12)]",
                                    ].join(" ")}
                                  >
                                    <div className="relative w-full aspect-square overflow-hidden">
                                      <img
                                        src={src}
                                        alt={r.name}
                                        className="h-full w-full object-cover select-none"
                                        loading="lazy"
                                        onError={() => setBrokenImg((p) => ({ ...p, [r.id]: true }))}
                                      />
                                      {/* μικρό icon πάνω δεξιά */}
                                      <div className="absolute right-2 top-2">
                                        <Icon className="h-5 w-5 text-white drop-shadow" />
                                      </div>
                                      {/* badge όταν είναι επιλεγμένο */}
                                      {isSelected && (
                                        <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-mystical-purple px-2 py-1 text-xs font-medium text-white shadow">
                                          <Check className="h-4 w-4" />
                                          Επιλέχθηκε
                                        </div>
                                      )}
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

              {/* Στοιχεία Προφίλ (Φύλο / Ηλικία) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-mystical-purple">Στοιχεία Προφίλ</CardTitle>
                  <CardDescription>
                    Βοηθούν να προσαρμόσουμε καλύτερα τον τόνο και το περιεχόμενο.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Φύλο..." />
                              </SelectTrigger>
                              <SelectContent>
                                {genders.map((g) => (
                                  <SelectItem value={g} key={g}>
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
                      name="age_range"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Ηλικιακό εύρος..." />
                              </SelectTrigger>
                              <SelectContent>
                                {ageRanges.map((a) => (
                                  <SelectItem value={a} key={a}>
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

              {/* Τομέας Ενδιαφέροντος */}
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

              {/* Συναισθηματική Κατάσταση */}
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

              {/* Προαιρετική Ερώτηση */}
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

              {/* Upload Φωτογραφίας */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-mystical-purple">Φωτογραφία Φλιτζανιού</CardTitle>
                  <CardDescription>Ανεβάστε μια καθαρή φωτογραφία του φλιτζανιού σας μετά τον καφέ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="font-mystical text-[24px] font-semibold text-[#3B1F4A]">
                        Ανέβασε το Φλιτζάνι σου ☕
                      </h3>
                      <p className="font-elegant text-sm text-[#7E6A8A] max-w-[400px] mx-auto">
                        Σύρε & άφησε την εικόνα ή κάνε κλικ για επιλογή. Δεκτά αρχεία: JPG/PNG
                        έως 8MB.
                      </p>
                    </div>

                    <div className="w-full max-w-md">
                      <Label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-[#8B5CF6] bg-[#FBF7FF] rounded-2xl cursor-pointer hover:border-[#F472B6] hover:bg-[#FDF4FF] transition-all duration-300 shadow-[0_8px_32px_rgba(139,92,246,0.08)] p-8"
                      >
                        {isLoading ? (
                          <div className="flex flex-col items-center space-y-4 w-full">
                            <div className="w-full max-w-xs bg-[#E9D5FF] rounded-full h-2">
                              <div
                                className="bg-[#8B5CF6] h-2 rounded-full animate-pulse"
                                style={{ width: "60%" }}
                              />
                            </div>
                            <p className="text-[#3B1F4A] font-medium">Γίνεται μεταφόρτωση…</p>
                          </div>
                        ) : imagePreview ? (
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
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <Upload className="w-12 h-12 text-[#8B5CF6]" />
                            <p className="text-[#3B1F4A] font-medium text-center">
                              Κάνε κλικ ή σύρε την εικόνα εδώ
                            </p>
                          </div>
                        )}
                      </Label>
                      <input
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

              {/* Submit */}
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
