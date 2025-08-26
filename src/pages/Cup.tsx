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
    defaultValues: {
      reader: "",
      category: "",
      mood: "",
      question: "",
      image: null,
    },
  });

  const readers = [
    {
      id: "young",
      name: "Ρένα η μοντέρνα",
      description: "Φρέσκιες προβλέψεις με νεανική αισιοδοξία",
      icon: Heart,
      image: "/images/tellers/modern-woman.png",
      gradient: "from-rose-gold to-soft-pink",
    },
    {
      id: "experienced",
      name: "Κατίνα η Σμυρνιά",
      description: "Ισορροπημένη οπτική με εμπειρία ζωής",
      icon: Crown,
      image: "/images/tellers/katina-klassiki.png",
      gradient: "from-mystical-purple to-mystical-purple-light",
    },
    {
      id: "wise",
      name: "Ισιδώρα η πνευματική",
      description: "Αρχαία σοφία και βαθιές προβλέψεις",
      icon: Sparkles,
      image: "/images/tellers/mystic-woman.png",
      gradient: "from-golden to-golden-light",
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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CupReadingForm) => {
    if (!selectedImage) {
      toast({
        title: "Παρακαλώ ανεβάστε μια εικόνα",
        description: "Χρειαζόμαστε την εικόνα του φλιτζανιού σας για την ανάγνωση.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const readerInfo = readers.find((r) => r.id === data.reader);
    setSelectedReader(readerInfo || null);

    try {
      const result = await getCupReading(data, selectedImage);
      if (result) setReadingResult(result);
    } catch (error) {
      console.error("Error getting cup reading:", error);
      toast({
        title: "Σφάλμα",
        description: "Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCupReading = async (formData: CupReadingForm, imageFile: File): Promise<string | null> => {
    const imageBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result.split(",")[1]);
      };
      reader.readAsDataURL(imageFile);
    });

    const readerName = readers.find((r) => r.id === formData.reader)?.name || "Καφετζού";

    const { data, error } = await supabase.functions.invoke("cup-reading", {
      body: {
        reader: readerName,
        category: formData.category,
        mood: formData.mood,
        question: formData.question,
        imageBase64,
      },
    });

    if (error) throw new Error("Παρουσιάστηκε σφάλμα κατά την επικοινωνία με το σύστημα ανάγνωσης.");
    if (data?.error) throw new Error(data.error);
    if (data?.reading) {
      toast({ title: "Ο χρησμός σας είναι έτοιμος!", description: "Δείτε την ανάγνωση του φλιτζανιού σας." });
      return data.reading;
    }
    return null;
  };

  const handleBackToForm = () => {
    setReadingResult(null);
    setSelectedReader(null);
    form.reset();
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSaveReading = async (reading: string) => {
    console.log("Saving reading:", reading);
    throw new Error("Η αποθήκευση θα είναι διαθέσιμη μόλις δημιουργήσουμε το σύστημα χρηστών.");
  };

  if (isLoading && selectedReader) return <CupReadingLoader readerName={selectedReader.name} />;
  if (readingResult && selectedReader)
    return (
      <CupReadingResult
        reading={readingResult}
        readerInfo={selectedReader}
        onBack={handleBackToForm}
        onSave={handleSaveReading}
      />
    );

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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-mystical font-bold text-mystical-purple mb-4">
              Ανακαλύψτε τα Μυστικά του Φλιτζανιού σας
            </h2>
            <p className="text-lg text-muted-foreground">Συμπληρώστε τα παρακάτω στοιχεία για μια προσωποποιημένη ανάγνωση</p>
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
                            className="grid md:grid-cols-3 gap-4"
                          >
                            {readers.map((reader) => {
                              const IconComponent = reader.icon;
                              return (
                                <div key={reader.id} className="relative">
                                  <RadioGroupItem value={reader.id} id={reader.id} className="peer sr-only" />
                                  <Label
                                    htmlFor={reader.id}
                                    className="flex flex-col items-center p-4 border-2 border-mystical-purple/20 rounded-xl cursor-pointer hover:border-mystical-purple/40 peer-checked:border-mystical-purple peer-checked:bg-mystical-purple/5 transition-all"
                                  >
                                    {/* ΤΕΤΡΑΓΩΝΟ PLACEHOLDER / ΕΙΚΟΝΑ – force square */}
                                    <div className="relative w-28 aspect-square overflow-hidden !rounded-2xl border-2 border-mystical-purple/25 mb-3 shadow-sm">
                                      <img
                                        src={reader.image}
                                        alt={reader.name}
                                        className="absolute inset-0 h-full w-full object-cover !rounded-none"
                                        loading="lazy"
                                      />
                                      <div
                                        className={`absolute inset-0 bg-gradient-to-br ${reader.gradient} opacity-10 pointer-events-none`}
                                      />
                                      <div className="absolute right-2 top-2">
                                        <IconComponent className="h-5 w-5 text-white drop-shadow" />
                                      </div>
                                    </div>

                                    <h3 className="font-medium text-mystical-purple text-center">{reader.name}</h3>
                                    <p className="text-sm text-muted-foreground text-center mt-1">{reader.description}</p>
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

              {/* Category Selection */}
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
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
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

              {/* Mood Selection */}
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
                              {moods.map((mood) => (
                                <SelectItem key={mood} value={mood}>
                                  {mood}
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

              {/* Optional Question */}
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

              {/* Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-mystical-purple">Φωτογραφία Φλιτζανιού</CardTitle>
                  <CardDescription>Ανεβάστε μια καθαρή φωτογραφία του φλιτζανιού σας μετά τον καφέ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-6">
                    <div className="text-center space-y-2">
                      <h3 className="font-mystical text-[24px] font-semibold text-[#3B1F4A]">Ανέβασε το Φλιτζάνι σου ☕</h3>
                      <p className="font-elegant text-sm text-[#7E6A8A] max-w-[400px] mx-auto">
                        Σύρε & άφησε την εικόνα ή κάνε κλικ για επιλογή. Δεκτά αρχεία: JPG/PNG έως 8MB.
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
                              <div className="bg-[#8B5CF6] h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
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
                            <p className="text-[#3B1F4A] font-medium text-center">Κάνε κλικ ή σύρε την εικόνα εδώ</p>
                          </div>
                        )}
                      </Label>

                      <Input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                    </div>
                  </div>
                </CardContent>
              </Card>

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
