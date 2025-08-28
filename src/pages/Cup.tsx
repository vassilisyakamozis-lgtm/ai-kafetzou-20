import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import { Coffee, ArrowLeft, Heart, Crown, Sparkles, Share2, Download, Volume2, Save } from "lucide-react";

// ————————————————————————————————————————————
// Types
// ————————————————————————————————————————————
interface CupReadingForm {
  reader: string;
  category: string;
  mood: string;
  gender: "Άνδρας" | "Γυναίκα" | "Άλλο" | "";
  age_range: "17-24" | "25-34" | "35-44" | "45-54" | "55-64" | "64+" | "";
  question?: string;
  image: File | null;
}

type ReaderInfo = { id: string; name: string; description: string; icon: any; image: string };

const GENDER_OPTIONS = ["Άνδρας", "Γυναίκα", "Άλλο"] as const;
const AGE_OPTIONS = ["17-24", "25-34", "35-44", "45-54", "55-64", "64+"] as const;

// **ΣΩΣΤΑ URLs από Supabase Storage**
const STORAGE = "https://ziqhqdorqfowubjrchyu.supabase.co/storage/v1/object/public";
const TELLERS = (p: string) => `${STORAGE}/tellers/${p}?v=2`;

const readers: ReaderInfo[] = [
  {
    id: "young",
    name: "Ρένα η μοντέρνα",
    description: "Φρέσκες προβλέψεις με νεανική αισιοδοξία",
    icon: Heart,
    image: TELLERS("modern%20woman.png"),
  },
  {
    id: "experienced",
    name: "Μαίρη η ψαγμένη",
    description: "Ισορροπημένη οπτική με εμπειρία ζωής",
    icon: Crown,
    image: TELLERS("katina-klassiki.png"),
  },
  {
    id: "wise",
    name: "Ισιδώρα η πνευματική",
    description: "Αρχαία σοφία και βαθιές προβλέψεις",
    icon: Sparkles,
    image: TELLERS("mystic%20woman.png"),
  },
];

const categories = [
  "Αγάπη & Σχέσεις", "Καριέρα & Εργασία", "Υγεία & Ευεξία", "Οικογένεια & Φίλοι",
  "Χρήματα & Οικονομικά", "Ταξίδια & Περιπέτειες", "Πνευματική Ανάπτυξη", "Γενικό Μέλλον",
];

const moods = [
  "Χαρούμενη/ος","Ανήσυχη/ος","Ελπιδοφόρα/ος","Μπερδεμένη/ος","Ενθουσιασμένη/ος","Λυπημένη/ος","Αισιόδοξη/ος","Φοβισμένη/ος",
];

// ————————————————————————————————————————————
// Helper για PDF (jsPDF) – αν ΔΕΝ το έχεις, πρόσθεσε στο project:
//   npm i jspdf
// ————————————————————————————————————————————
async function makePdf(filename: string, title: string, text: string, meta: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFont("Times", "normal");
  doc.setFontSize(16);
  doc.text(title, 40, 60);
  doc.setFontSize(11);
  doc.text(meta, 40, 84);
  doc.setFontSize(12);

  const lines = doc.splitTextToSize(text, 515);
  doc.text(lines, 40, 120);

  doc.save(filename);
}

export default function Cup() {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  const [readerInfo, setReaderInfo] = useState<ReaderInfo | null>(null);
  const [ttsUrl, setTtsUrl] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

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

  // ————————————————
  // Image picker
  // ————————————————
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedImage(file);
    if (file) {
      const r = new FileReader();
      r.onload = (ev) => setImagePreview(String(ev.target?.result));
      r.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // ————————————————
  // Submit
  // ————————————————
  async function onSubmit(data: CupReadingForm) {
    if (!selectedImage) {
      toast({ title: "Χρειάζεται εικόνα", description: "Ανέβασε τη φωτογραφία του φλιτζανιού.", variant: "destructive" });
      return;
    }

    const reader = readers.find(r => r.id === data.reader) || null;
    setReaderInfo(reader);

    setIsLoading(true);
    setReadingResult(null);
    setTtsUrl(null);
    setCreatedAt(null);

    try {
      // Μετατρέπουμε σε base64 περιεχόμενο
      const base64 = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => {
          const raw = String(fr.result);
          const b64 = raw.split(",")[1] ?? "";
          resolve(b64);
        };
        fr.onerror = reject;
        fr.readAsDataURL(selectedImage);
      });

      // Κλήση Edge Function "cup-reading"
      const { data: payload, error } = await supabase.functions.invoke("cup-reading", {
        body: {
          reader: reader?.name ?? "Καφετζού",
          category: data.category,
          mood: data.mood,
          question: data.question || "",
          gender: data.gender,
          age_range: data.age_range,
          imageBase64: base64,
        },
      });

      if (error) throw error;
      if (payload?.error) throw new Error(payload.error);

      setReadingResult(payload.reading ?? null);
      setTtsUrl(payload.tts_url ?? null);
      setCreatedAt(new Date().toLocaleString("el-GR", { dateStyle: "medium", timeStyle: "short" }));

      toast({ title: "Ο χρησμός είναι έτοιμος!", description: "Μπορείς να τον ακούσεις, να τον σώσεις ή να τον κατεβάσεις." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Σφάλμα", description: e?.message ?? "Κάτι πήγε στραβά.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  // ————————————————
  // Actions: TTS / Save / PDF / Share
  // ————————————————
  async function playTTS() {
    if (!ttsUrl) {
      toast({ title: "Δεν υπάρχει ήχος", description: "Δοκίμασε ξανά παραγωγή ήχου." });
      return;
    }
    const audio = new Audio(ttsUrl);
    audio.play().catch(() => {
      toast({ title: "Αποτυχία αναπαραγωγής", description: "Πρόβλημα με τον browser ή το αρχείο ήχου." });
    });
  }

  async function saveReading() {
    if (!readingResult || !readerInfo) return;

    // Δημιούργησε έναν πίνακα "readings" (id uuid default uuid_generate_v4(), created_at, reader, text, gender, age_range)
    const { error } = await supabase.from("readings").insert({
      reader: readerInfo.name,
      text: readingResult,
      gender: form.getValues("gender"),
      age_range: form.getValues("age_range"),
      created_at: new Date().toISOString(),
    });
    if (error) {
      toast({ title: "Αποτυχία αποθήκευσης", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Αποθηκεύτηκε!" });
    }
  }

  async function downloadPdf() {
    if (!readingResult || !readerInfo) return;

    const meta = [
      `Καφετζού: ${readerInfo.name}`,
      `Κατηγορία: ${form.getValues("category")}`,
      `Διάθεση: ${form.getValues("mood")}`,
      `Φύλο: ${form.getValues("gender") || "-"}`,
      `Ηλικιακό εύρος: ${form.getValues("age_range") || "-"}`,
      `Ημ/νία: ${createdAt ?? "-"}`,
    ].join(" · ");
    await makePdf("kafetzou-reading.pdf", "Ανάγνωση Φλιτζανιού", readingResult, meta);
  }

  async function shareReading() {
    if (!readingResult) return;
    const text = `Ανάγνωση Φλιτζανιού\n\n${readingResult}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Ο χρησμός μου", text });
      } catch {
        /* ignore */
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Αντιγράφηκε", description: "Το κείμενο του χρησμού αντιγράφηκε στο πρόχειρο." });
    }
  }

  // ————————————————
  // UI
  // ————————————————
  if (isLoading && readerInfo) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <div className="animate-pulse text-xl mb-3">Προετοιμάζουμε τον χρησμό…</div>
          <div className="text-muted-foreground">Καφετζού {readerInfo.name}</div>
        </div>
      </div>
    );
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!readingResult ? (
          <>
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
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="grid md:grid-cols-3 gap-4">
                              {readers.map((r) => {
                                const Icon = r.icon;
                                return (
                                  <div key={r.id} className="relative">
                                    <RadioGroupItem value={r.id} id={r.id} className="peer sr-only" />
                                    <Label
                                      htmlFor={r.id}
                                      className="flex flex-col p-0 overflow-hidden border-2 border-mystical-purple/20 rounded-2xl cursor-pointer hover:border-mystical-purple/40 peer-checked:border-mystical-purple peer-checked:bg-white transition-all"
                                    >
                                      <div className="w-full aspect-square overflow-hidden relative">
                                        <img src={r.image} alt={r.name} className="h-full w-full object-cover" loading="lazy" />
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

                {/* Στοιχεία Προφίλ (Gender / Age) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-mystical-purple">Στοιχεία Προφίλ</CardTitle>
                    <CardDescription>Βοηθούν να προσαρμοστεί καλύτερα ο τόνος και το περιεχόμενο.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      rules={{ required: "Επιλέξτε φύλο" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger><SelectValue placeholder="Φύλο..." /></SelectTrigger>
                              <SelectContent>
                                {GENDER_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
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
                      rules={{ required: "Επιλέξτε ηλικιακό εύρος" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger><SelectValue placeholder="Ηλικιακό εύρος..." /></SelectTrigger>
                              <SelectContent>
                                {AGE_OPTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Τομέας Ενδιαφέροντος */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-mystical-purple">Τομέας Ενδιαφέροντος</CardTitle>
                    <CardDescription>Σε ποιον τομέα θέλετε καθοδήγηση;</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="category"
                      rules={{ required: "Παρακαλώ επιλέξτε τομέα" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger><SelectValue placeholder="Επιλέξτε τομέα..." /></SelectTrigger>
                              <SelectContent>
                                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Διάθεση */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-mystical-purple">Συναισθηματική Κατάσταση</CardTitle>
                    <CardDescription>Πώς νιώθετε αυτή τη στιγμή;</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="mood"
                      rules={{ required: "Παρακαλώ επιλέξτε διάθεση" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger><SelectValue placeholder="Επιλέξτε διάθεση..." /></SelectTrigger>
                              <SelectContent>
                                {moods.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Ερώτηση */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-mystical-purple">Ερώτηση (προαιρετική)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="question"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea placeholder="π.χ. Θα βρω αγάπη φέτος; Πότε θα αλλάξει η καριέρα μου;" className="min-h-[100px] resize-none" {...field} />
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
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center space-y-4">
                      <Label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer hover:border-mystical-purple/50 transition-all"
                      >
                        {imagePreview
                          ? <img src={imagePreview} alt="preview" className="w-40 h-40 object-cover rounded-xl border" />
                          : <div className="text-muted-foreground">Κάνε κλικ ή σύρε την εικόνα εδώ</div>}
                      </Label>
                      <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <Button type="submit" size="lg" disabled={isLoading}>
                    {isLoading ? "Προετοιμάζεται ο χρησμός..." : "Ξεκινήστε την Ανάγνωση"}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        ) : (
          // ————————————————————————————————
          // ΑΠΟΤΕΛΕΣΜΑ
          // ————————————————————————————————
          <Card>
            <CardHeader>
              <CardTitle className="text-mystical-purple">Ο Χρησμός σας</CardTitle>
              <CardDescription>
                {readerInfo?.name} · {createdAt ?? new Date().toLocaleString("el-GR", { dateStyle: "medium", timeStyle: "short" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="whitespace-pre-wrap leading-7">{readingResult}</div>

              {/* Κουμπιά ενεργειών */}
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={playTTS}><Volume2 className="mr-2 h-4 w-4" /> Άκου</Button>
                <Button variant="secondary" onClick={saveReading}><Save className="mr-2 h-4 w-4" /> Αποθήκευση</Button>
                <Button variant="secondary" onClick={downloadPdf}><Download className="mr-2 h-4 w-4" /> Λήψη PDF</Button>
                <Button variant="secondary" onClick={shareReading}><Share2 className="mr-2 h-4 w-4" /> Κοινοποίηση</Button>
                <Button variant="ghost" onClick={() => { setReadingResult(null); setTtsUrl(null); }}>
                  Νέα ανάγνωση
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
