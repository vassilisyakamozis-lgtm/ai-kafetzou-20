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
      name: "Νεαρή Μάντισσα",
      description: "Φρέσκιες προβλέψεις με νεανική αισιοδοξία",
      icon: Heart,
      gradient: "from-rose-gold to-soft-pink"
    },
    {
      id: "experienced",
      name: "Έμπειρη Καφετζού", 
      description: "Ισορροπημένη οπτική με εμπειρία ζωής",
      icon: Crown,
      gradient: "from-mystical-purple to-mystical-purple-light"
    },
    {
      id: "wise",
      name: "Σοφή Γιαγιά",
      description: "Αρχαία σοφία και βαθιές προβλέψεις",
      icon: Sparkles,
      gradient: "from-golden to-golden-light"
    }
  ];

  const categories = [
    "Αγάπη & Σχέσεις",
    "Καριέρα & Εργασία", 
    "Υγεία & Ευεξία",
    "Οικογένεια & Φίλοι",
    "Χρήματα & Οικονομικά",
    "Ταξίδια & Περιπέτειες",
    "Πνευματική Ανάπτυξη",
    "Γενικό Μέλλον"
  ];

  const moods = [
    "Χαρούμενη/ος",
    "Ανήσυχη/ος", 
    "Ελπιδοφόρα/ος",
    "Μπερδεμένη/ος",
    "Ενθουσιασμένη/ος",
    "Λυπημένη/ος",
    "Αισιόδοξη/ος",
    "Φοβισμένη/ος"
  ];

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
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
    
    try {
      await getCupReading(data, selectedImage);
      
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

  const getCupReading = async (formData: CupReadingForm, imageFile: File) => {
    // Convert image to base64
    const imageBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        resolve(base64);
      };
      reader.readAsDataURL(imageFile);
    });

    const selectedReader = readers.find(r => r.id === formData.reader);

    try {
      const { data, error } = await supabase.functions.invoke('cup-reading', {
        body: {
          reader: formData.reader,
          category: formData.category,
          mood: formData.mood,
          question: formData.question,
          imageBase64
        }
      });

      if (error) {
        console.error('Error calling cup-reading function:', error);
        throw new Error('Παρουσιάστηκε σφάλμα κατά την επικοινωνία με το σύστημα ανάγνωσης.');
      }

      if (data.error) {
        console.error('Cup reading error:', data.error);
        throw new Error(data.error);
      }

      if (data.reading) {
        // Show the reading result
        toast({
          title: "Ο χρησμός σας είναι έτοιμος!",
          description: "Δείτε την ανάγνωση του φλιτζανιού σας παρακάτω.",
        });
        
        // Display the reading result
        alert(`Χρησμός από ${selectedReader?.name}:\n\n${data.reading}`);
      }
    } catch (error) {
      console.error('Error getting cup reading:', error);
      throw error;
    }
  };

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
            <div></div>
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
                                  <RadioGroupItem
                                    value={reader.id}
                                    id={reader.id}
                                    className="peer sr-only"
                                  />
                                  <Label
                                    htmlFor={reader.id}
                                    className="flex flex-col items-center p-4 border-2 border-mystical-purple/20 rounded-xl cursor-pointer hover:border-mystical-purple/40 peer-checked:border-mystical-purple peer-checked:bg-mystical-purple/5 transition-all"
                                  >
                                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${reader.gradient} flex items-center justify-center mb-3`}>
                                      <IconComponent className="h-8 w-8 text-white" />
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <Label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-mystical-purple/30 border-dashed rounded-xl cursor-pointer bg-mystical-purple/5 hover:bg-mystical-purple/10 transition-colors"
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Φλιτζάνι προεπισκόπηση"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 mb-3 text-mystical-purple" />
                            <p className="mb-2 text-mystical-purple">
                              <span className="font-semibold">Κάντε κλικ για ανέβασμα</span>
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG ή JPEG (MAX. 10MB)</p>
                          </div>
                        )}
                        <Input
                          id="image-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </Label>
                    </div>
                    {selectedImage && (
                      <div className="text-sm text-muted-foreground">
                        Επιλεγμένο αρχείο: {selectedImage.name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="text-center">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-mystical-purple to-mystical-purple-light text-white px-8 py-3 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
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
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Cup;