// src/pages/Cup.tsx
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormItem, FormMessage, FormField, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Coffee, Sparkles, ImageIcon } from "lucide-react";
import AuthRedirectGuard from '@/hooks/AuthRedirectGuard';
import { SignInWithGoogle, SignOut } from '@/components/AuthButtons';
import StartReadingButton from '@/components/StartReadingButton';

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

  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // === Auth hydrate + live updates ===
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionToken(data.session?.access_token ?? null);
    });
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionToken(session?.access_token ?? null);
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
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

  // preview εικόνας με όμορφο placeholder/πλαίσιο
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

  // optional upload στο bucket 'uploads'
  const uploadCupImage = async (file: File) => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id ?? "anonymous";
    const path = `cups/${uid}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });
    if (error) throw error;
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    return data.publicUrl as string;
  };

  const signIn = async () => {
    // Διάλεξε πάροχο που θες — Google για ευκολία.
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Αποσυνδεθήκατε" });
  };

  const isFormDisabled = useMemo(() => !user || isLoading, [user, isLoading]);

  const onSubmit = async (values: CupForm) => {
    if (!sessionToken || !user) {
      toast({
        title: "Απαιτείται σύνδεση",
        description: "Συνδέσου για να ξεκινήσεις την ανάγνωση.",
        variant: "destructive",
      });
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
    }

    try {
      setIsLoading(true);

      // 1) Edge Function για παραγωγή χρησμού (AUTH απαιτείται)
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
      if (!data?.ok) throw new Error(data?.error ?? "Άγνωστο σφάλμα");

      // 2) Αποθήκευση σε πίνακα `readings` (ώστε να υπάρχει πέρμα)
      //    Αν δεν υπάρχει ο πίνακας, δες SQL πιο κάτω.
      const insertPayload = {
        user_id: user.id,
        persona: data.persona,
        profile: data.profile ?? null,
        category: values.category,
        mood: values.mood,
        question: values.question ?? null,
        image_url,
        text: data.text,
        tts_url: data.tts_url ?? null,
        created_at: data.created_at, // από το function
      };

      const { data: row, error: dbErr } = await supabase
        .from("readings")
        .insert(insertPayload)
        .select("id")
        .single();

      // 3) Μετάβαση στη σελίδα αποτελέσματος
      if (!dbErr && row?.id) {
        navigate(`/reading/${row.id}`);
      } else {
        // fallback: πέρασε state αν δεν σώθηκε (να μη χαθεί ο χρησμός)
        navigate(`/reading`, {
          state: {
            fromMemory: true,
            temp: insertPayload,
          },
        });
      }
    } catch (e: any) {
      toast({ title: "Σφάλμα", description: String(e?.message ?? e), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary font-medium">
            Home
          </Link>

          <h1 className="text-2xl font-bold text-primary flex items-center">
            <Coffee className="inline-block mr-2 h-6 w-6" />
            Ανάγνωση Φλιτζανιού
          </h1>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden md:inline">
                  Συνδεδεμένος/η
                </span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Αποσύνδεση
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={signIn}>
                Εγγραφή / Σύνδεση
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Αν δεν είναι συνδεδεμένος, ξεκάθαρο banner */}
      {!user && (
        <div className="container mx-auto px-4 mt-4">
          <Card className="border-primary/30">
            <CardContent className="py-4 text-sm text-muted-foreground">
              Για να πάρεις χρησμό, χρειάζεται να κάνεις <b>Εγγραφή/Σύνδεση</b>.
              Μετά την είσοδο, πάτησε «Ξεκίνα την Ανάγνωση».
            </CardContent>
          </Card>
        </div>
      )}

      <AuthRedirectGuard />
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <SignInWithGoogle />
        <SignOut />
      </div>
      <StartReadingButton />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Επιλογή Καφετζούς</CardTitle>
            <CardDescription>Διάλεξε ποια θα διαβάσει το φλιτζάνι σου</CardDescription>
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
                              <img src={r.image} alt={r.name} className="w-full aspect-square object-cover" />
                              <div className="px-4 py-3 text-center">
                                <div className="font-medium text-primary">{r.name}</div>
                                <div className="text-sm text-muted-foreground mt-1">{r.description}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Profile (gender / age) */}
                <Card>
                  <CardHeader>
                    <CardTitle>Στοιχεία Προφίλ</CardTitle>
                    <CardDescription>Βοηθούν να προσαρμόσουμε καλύτερα τον τόνο & το περιεχόμενο.</CardDescription>
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
                              <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                                <SelectTrigger><SelectValue placeholder="Φύλο..." /></SelectTrigger>
                                <SelectContent>
                                  {genders.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
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
                              <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                                <SelectTrigger><SelectValue placeholder="Ηλικιακό εύρος..." /></SelectTrigger>
                                <SelectContent>
                                  {ages.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
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
                          <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                            <SelectTrigger><SelectValue placeholder="Τομέας ενδιαφέροντος..." /></SelectTrigger>
                            <SelectContent>
                              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                          <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                            <SelectTrigger><SelectValue placeholder="Στυλ/διάθεση..." /></SelectTrigger>
                            <SelectContent>
                              {moods.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Question */}
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Προαιρετική ερώτηση (π.χ. Θα βρω αγάπη φέτος;)"
                          className="min-h-[100px] resize-none"
                          disabled={isFormDisabled}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Upload area (πλαίσιο + placeholder + smooth preview) */}
                <Card>
                  <CardHeader>
                    <CardTitle>Φωτογραφία Φλιτζανιού (προαιρετικό)</CardTitle>
                    <CardDescription>Αν έχεις καθαρή φωτογραφία από το φλιτζάνι σου, ανέβασέ την.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl cursor-pointer transition hover:border-primary/50 bg-muted/20">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                        disabled={isFormDisabled}
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
                  <Button type="submit" size="lg" disabled={isFormDisabled} className="px-8">
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
