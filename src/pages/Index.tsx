// src/pages/Cup.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormItem,
  FormMessage,
  FormField,
  FormControl,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Coffee, House, LogOut, LogIn, Sparkles, ImageIcon } from "lucide-react";

type CupForm = {
  reader: string;
  category: string;
  mood: string;
  question?: string;
  image: File | null;
  gender: string;
  age_range: string;
};

const readers = [
  {
    id: "young",
    name: "Ρένα η μοντέρνα",
    description: "Φρέσκες προβλέψεις με νεανική αισιοδοξία",
    image:
      "https://ziqhqdorqfowubjrchyu.supabase.co/storage/v1/object/public/tellers/modern%20woman.png?v=2",
  },
  {
    id: "experienced",
    name: "Μαίρη η ψαγμένη",
    description: "Ισορροπημένη οπτική με εμπειρία ζωής",
    image:
      "https://ziqhqdorqfowubjrchyu.supabase.co/storage/v1/object/public/tellers/katina-klassiki.png?v=2",
  },
  {
    id: "wise",
    name: "Ισιδώρα η πνευματική",
    description: "Αρχαία σοφία και βαθιές προβλέψεις",
    image:
      "https://ziqhqdorqfowubjrchyu.supabase.co/storage/v1/object/public/tellers/mystic%20woman.png?v=2",
  },
];

const categories = [
  "Γενικό Μέλλον",
  "Αγάπη & Σχέσεις",
  "Καριέρα & Εργασία",
  "Υγεία & Ευεξία",
  "Οικογένεια & Φίλοι",
  "Χρήματα & Οικονομικά",
  "Ταξίδια & Περιπέτειες",
  "Πνευματική Ανάπτυξη",
];

const moods = [
  "Ζεστή & ενθαρρυντική",
  "Ισορροπημένη & αντικειμενική",
  "Πνευματική & βαθιά",
  "Ανάλαφρη & αισιόδοξη",
];

const genders = ["Γυναίκα", "Άνδρας", "Άλλο/Μη δυαδικό"];
const ages = ["18-24", "25-34", "35-44", "45-54", "55+"];

export default function Cup() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);

  // Πάρε session για να δείξουμε Σύνδεση/Αποσύνδεση και για το invoke
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token ?? null;
      setSessionToken(token);
      setIsAuthed(Boolean(token));
    });
    // live updates όταν αλλάζει το session
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      const token = s?.access_token ?? null;
      setSessionToken(token);
      setIsAuthed(Boolean(token));
    });
    return () => {
      sub.subscription?.unsubscribe();
    };
  }, []);

  const form = useForm<CupForm>({
    defaultValues: {
      reader: "",
      category: "",
      mood: "",
      question: "",
      image: null,
      gender: "",
      age_range: "",
    },
  });

  // preview εικόνας
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    form.setValue("image", file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  // upload εικόνας στο bucket 'uploads' → public URL
  const uploadCupImage = async (file: File) => {
    const { data: user } = await supabase.auth.getUser();
    const uid = user.user?.id ?? "anonymous";
    const path = `cups/${uid}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("uploads")
      .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (error) throw error;
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    return data.publicUrl as string;
  };

  const onSubmit = async (values: CupForm) => {
    // Αν δεν έχει session → πήγαινε για σύνδεση
    if (!sessionToken) {
      toast({
        title: "Απαιτείται σύνδεση",
        description: "Συνδέσου για να ξεκινήσεις την ανάγνωση.",
        variant: "destructive",
      });
      // Αν έχεις σελίδα login διαφορετική, άλλαξέ το εδώ
      navigate("/auth");
      return;
    }

    const readerName =
      readers.find((r) => r.id === values.reader)?.name || "Ρένα η μοντέρνα";

    let image_url: string | null = null;
    try {
      if (values.image) {
        image_url = await uploadCupImage(values.image);
      }
    } catch (e: any) {
      console.warn("Upload image failed:", e?.message ?? e);
      // δεν σταματάμε—προχωράμε χωρίς image_url
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke("reading", {
        body: {
          reader: readerName,
          category: values.category,
          mood: values.mood,
          question: values.question,
          image_url,
          gender: values.gender,
          age_range: values.age_range,
        },
        headers: { Authorization: `Bearer ${sessionToken}` },
      });

      if (error) throw error;

      if (data?.ok) {
        toast({
          title: "Ο χρησμός ετοιμάστηκε!",
          description: `Ημερομηνία: ${new Date(
            data.created_at
          ).toLocaleString("el-GR")}`,
        });

        // 👉 εδώ κατευθύνεις στη σελίδα αποτελεσμάτων σου
        // Αν δεν υπάρχει ακόμη, θα προσγειωθείς στο NotFound και θα το δεις στο console (ok).
        navigate("/reading", { state: data });
      } else {
        throw new Error(data?.error ?? "Άγνωστο σφάλμα");
      }
    } catch (e: any) {
      toast({
        title: "Σφάλμα",
        description: String(e?.message ?? e),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Αποσύνδεση", description: "Έγινες αποσύνδεση." });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <House className="h-5 w-5" />
            <span>Home</span>
          </Link>

          <h1 className="text-2xl font-bold text-primary">
            <Coffee className="inline-block mr-2 h-6 w-6" />
            Ανάγνωση Φλιτζανιού
          </h1>

          <div className="flex items-center gap-3">
            {!isAuthed ? (
              <Link
                to="/auth"
                className="inline-flex items-center text-primary hover:underline"
                title="Εγγραφή / Σύνδεση"
              >
                <LogIn className="h-4 w-4 mr-1" />
                Εγγραφή / Σύνδεση
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="inline-flex items-center text-muted-foreground hover:text-primary"
                title="Αποσύνδεση"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Αποσύνδεση
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Επιλογή Καφετζούς</CardTitle>
            <CardDescription>
              Διάλεξε ποια θα διαβάσει το φλιτζάνι σου
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Readers */}
                <FormField
                  control={form.control}
                  name="reader"
                  rules={{ required: "Παρακαλώ επίλεξε καφετζού" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid md:grid-cols-3 gap-4">
                          {readers.map((r) => (
                            <label
                              key={r.id}
                              className={`border rounded-xl overflow-hidden cursor-pointer transition ${
                                field.value === r.id
                                  ? "border-primary shadow-[0_0_0_2px_rgba(168,85,247,0.25)]"
                                  : "border-primary/20 hover:border-primary/40"
                              }`}
                            >
                              <input
                                type="radio"
                                value={r.id}
                                checked={field.value === r.id}
                                onChange={() => field.onChange(r.id)}
                                className="hidden"
                              />
                              <img
                                src={r.image}
                                alt={r.name}
                                className="w-full aspect-square object-cover"
                              />
                              <div className="px-4 py-3 text-center">
                                <div className="font-medium text-primary">{r.name}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {r.description}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Profile */}
                <Card>
                  <CardHeader>
                    <CardTitle>Στοιχεία Προφίλ</CardTitle>
                    <CardDescription>
                      Μας βοηθούν να προσαρμόσουμε καλύτερα τον τόνο & το περιεχόμενο.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="gender"
                        rules={{ required: "Επέλεξε φύλο" }}
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

                      <FormField
                        control={form.control}
                        name="age_range"
                        rules={{ required: "Επέλεξε ηλικιακό εύρος" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Ηλικιακό εύρος..." />
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
                    </div>
                  </CardContent>
                </Card>

                {/* Interest / Mood */}
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    rules={{ required: "Επέλεξε τομέα" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Τομέας ενδιαφέροντος..." />
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

                  <FormField
                    control={form.control}
                    name="mood"
                    rules={{ required: "Επέλεξε στυλ/διάθεση" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Στυλ/διάθεση..." />
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
                </div>

                {/* Optional question */}
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Προαιρετική ερώτηση (π.χ. Θα βρω αγάπη φέτος;)"
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Upload area with dashed border kept */}
                <Card>
                  <CardHeader>
                    <CardTitle>Φωτογραφία Φλιτζανιού (προαιρετικό)</CardTitle>
                    <CardDescription>
                      Αν έχεις καθαρή φωτογραφία από το φλιτζάνι σου, ανέβασέ την.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl cursor-pointer transition hover:border-primary/50">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          className="h-44 object-contain transition-opacity duration-300 opacity-100"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-muted-foreground">
                          <ImageIcon className="h-8 w-8 mb-2" />
                          <span>Κάνε κλικ για να επιλέξεις εικόνα</span>
                        </div>
                      )}
                    </label>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="px-8"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Προετοιμάζεται ο χρησμός...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Ξεκίνα την Ανάγνωση
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
