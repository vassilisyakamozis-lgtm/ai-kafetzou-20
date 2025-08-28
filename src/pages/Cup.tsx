import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
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
  gender: "Άνδρας" | "Γυναίκα" | "Άλλο";
  age_range: "17-24" | "25-34" | "35-44" | "45-54" | "55-64" | "64+";
  question?: string;
  image: File | null;
}

type ReadingPayload = {
  session_id: string;
  persona: string;
  text: string;
  tts_url?: string;
  image_url?: string;
};

const Cup = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [reading, setReading] = useState<ReadingPayload | null>(null);
  const [selectedReader, setSelectedReader] = useState<{ id: string; name: string; description: string } | null>(null);

  const form = useForm<CupReadingForm>({
    defaultValues: {
      reader: "",
      category: "",
      mood: "",
      question: "",
      image: null,
      gender: "Γυναίκα",
      age_range: "25-34",
    },
  });

  // εικόνες readers (PUBLIC)
  const readers = [
    {
      id: "young",
      name: "Ρένα η μοντέρνα",
      description: "Φρέσκες προβλέψεις με νεανική αισιοδοξία",
      icon: Heart,
      image: "/images/tellers/modern-woman.png?v=2",
    },
    {
      id: "experienced",
      name: "Μαίρη η ψαγμένη",
      description: "Ισορροπημένη οπτική με εμπειρία ζωής",
      icon: Crown,
      image: "/images/tellers/katina-klassiki.png?v=2",
    },
    {
      id: "wise",
      name: "Ισιδώρα η πνευματική",
      description: "Αρχαία σοφία και βαθιές προβλέψεις",
      icon: Sparkles,
      image: "/images/tellers/mystic-woman.png?v=2",
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const r = new FileReader();
      r.onload = (ev) => setImagePreview(ev.target?.result as string);
      r.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File) => {
    // Ανεβάζουμε τη φωτό σε PUBLIC bucket: "cup-uploads"
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from("cup-uploads").upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (error) throw error;

    const { data: pub } = supabase.storage.from("cup-uploads").getPublicUrl(data.path);
    return pub.publicUrl;
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
    const readerInfo = readers.find((r) => r.id === data.reader);
    setSelectedReader(readerInfo || null);

    try {
      // 1) Upload image to storage και πάρε PUBLIC URL
      const image_url = await uploadImage(selectedImage);

      // 2) Κάλεσε την Edge Function "reading"
      //    (προσαρμοσμένη να δέχεται image_url + profile data)
      const { data: resp, error } = await supabase.functions.invoke("reading", {
        body: {
          reader: readerInfo?.name ?? "Καφετζού",
          category: data.category,
          mood: data.mood,
          question: data.question,
          gender: data.gender,
          age_range: data.age_range,
          image_url,
        },
      });

      if (error) throw error;
      if (!resp?.ok) throw new Error(resp?.error || "OpenAI Vision error");

      const payload: ReadingPayload = {
        session_id: resp.session_id,
        persona: resp.persona,
        text: resp.text,
        tts_url: resp.tts_url,
        image_url,
      };

      setReading(payload);
      toast({ title: "Ο χρησμός σας είναι έτοιμος!", description: "Δείτε την ανάγνωση του φλιτζανιού σας." });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Σφάλμα",
        description: e?.message || "Κάτι πήγε στραβά. Δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setReading(null);
    setSelectedReader(null);
    form.reset();
    setSelectedImage(null);
    setImagePreview(null);
  };

  if (isLoading && selectedReader) {
    return <CupReadingLoader readerName={selectedReader.name} />;
  }
  if (reading && selectedReader) {
    return (
      <CupReadingResult
        reading={reading.text}
        readerInfo={selectedReader}
        ttsUrl={reading.tts_url}
        imageUrl={reading.image_url}
        sessionId={reading.session_id}
        profile={{
          gender: form.getValues("gender"),
          age_range: form.getValues("age_range"),
          category: form.getValues("category"),
          mood: form.getValues("mood"),
          question: form.getValues("question") || "",
        }}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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
                            {readers.map((reader) => {
                              const IconComponent = reader.icon;
                              return (
                                <div key={reader.id} className="relative">
                                  <RadioGroupItem value={reader.id} id={reader.id} className="peer sr-only" />
                                  <Label
                                    htmlFor={reader.id}
                                    className="flex flex-col p-0 overflow-hidden border-2 border-mystical-purple/20 rounded-2xl cursor-pointer hover:border-mystical-purple/40 peer-checked:border-mystical-purple peer-checked:bg-white transition-all"
                                  >
                                    <div className="w-full aspect-square overflow-hidden relative">
                                      <img src={reader.image} alt={reader.name} className="h-full w-full object-cover" loading="lazy" />
                                      <div className="absolute right-2 top-2">
                                        <IconComponent className="h-5 w-5 text-white drop-shadow" />
                                      </div>
                                    </div>
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

              {/* Φύλο & Ηλικιακό εύρος */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-mystical-purple">Στοιχεία Προφίλ</CardTitle>
                  <CardDescription>Βοηθούν να προσαρμόσουμε καλύτερα τον τόνο και το περιεχόμενο.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="gender"
                    rules={{ required: "Παρακαλώ επιλέξτε φύλο" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Φύλο..." /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Άνδρας">Άνδρας</SelectItem>
                              <SelectItem value="Γυναίκα">Γυναίκα</SelectItem>
                              <SelectItem value="Άλλο">Άλλο</SelectItem>
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
                    rules={{ required: "Παρακαλώ επιλέξτε ηλικιακό εύρος" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Ηλικιακό εύρος..." /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="17-24">17-24</SelectItem>
                              <SelectItem value="25-34">25-34</SelectItem>
                              <SelectItem value="35-44">35-44</SelectItem>
                              <SelectItem value="45-54">45-54</SelectItem>
                              <SelectItem value="55-64">55-64</SelectItem>
                              <SelectItem value="64+">64+</SelectItem>
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
                    rules={{ required: "Παρακαλώ επιλέξτε τομέα ενδιαφέροντος" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Επιλέξτε τομέα..." /></SelectTrigger>
                            <SelectContent>
                              {categories.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
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
                    rules={{ required: "Παρακαλώ επιλέξτε τη διάθεσή σας" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Επιλέξτε διάθεση..." /></SelectTrigger>
                            <SelectContent>
                              {moods.map((m) => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
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

              {/* Ερώτηση */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-mystical-purple">Ερώτηση (Προαιρετικό)</CardTitle>
                  <CardDescription>Έχετε κάποια συγκεκριμένη ερώτηση;</CardDescription>
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
                  <CardDescription>Ανεβάστε μια καθαρή φωτογραφία του φλιτζανιού μετά τον καφέ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-6">
                    <div className="w-full max-w-md">
                      <Label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-[#8B5CF6] bg-[#FBF7FF] rounded-2xl cursor-pointer hover:border-[#F472B6] hover:bg-[#FDF4FF] transition-all duration-300 p-8"
                      >
                        {imagePreview ? (
                          <div className="flex flex-col items-center space-y-4">
                            <img
                              src={imagePreview}
                              alt="Φλιτζάνι"
                              className="w-36 h-36 object-cover rounded-xl border-2 border-[#8B5CF6]/20"
                            />
                            <Button type="submit" className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-xl px-6 py-3">
                              Προχώρα στην Ανάλυση
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <Upload className="w-12 h-12 text-[#8B5CF6]" />
                            <p className="text-[#3B1F4A] font-medium text-center">Κάνε κλικ ή σύρε την εικόνα εδώ</p>
                          </div>
                        )}
                      </Label>
                      <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                    </div>

                    {!imagePreview && (
                      <Button type="submit" size="lg" className="bg-gradient-to-r from-mystical-purple to-mystical-purple-light text-white px-8 py-3 text-lg">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Ξεκινήστε την Ανάγνωση
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Cup;
