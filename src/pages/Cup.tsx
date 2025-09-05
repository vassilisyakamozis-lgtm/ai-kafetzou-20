import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type PersonaId = "classic" | "young" | "mystic";

const PERSONAS: { id: PersonaId; name: string; desc: string; img: string }[] = [
  {
    id: "classic",
    name: "Μαίρη, η 'ψαγμένη'",
    desc: "έμπειρη καφετζού με βαθιά γνώση και παράδοση",
    img: "/lovable-uploads/fb2ced7f-3a10-44ac-b0e6-3a29551a5e3f.png",
  },
  {
    id: "young",
    name: "Ρένα, η μοντέρνα",
    desc: "σύγχρονη προσέγγιση με νεανικό πνεύμα",
    img: "/lovable-uploads/745cf168-0332-4afd-b558-fc54db9eef18.png",
  },
  {
    id: "mystic",
    name: "Ισιδώρα, η πνευματική",
    desc: "συνδέει τον κόσμο με το πνεύμα και τη σοφία",
    img: "/lovable-uploads/ac472d31-2787-4950-9fa2-8fe551005e5d.png",
  },
];

const GENDERS = ["Άνδρας", "Γυναίκα", "Άλλο"] as const;
type Gender = (typeof GENDERS)[number];

const AGE_GROUPS = ["17-24", "25-34", "35-44", "45-54", "55-64", "65+"] as const;
type AgeGroup = (typeof AGE_GROUPS)[number];

const MOODS = [
  "Ουδέτερο",
  "Χαρούμενο",
  "Αγχωμένο",
  "Θλιμμένο",
  "Αναποφάσιστο/η",
  "Στενοχωρημένο/η",
  "Ενθουσιασμένο/η",
  "Ερωτευμένο/η",
] as const;
type Mood = (typeof MOODS)[number];

const TOPICS = [
  "Έρωτας",
  "Τύχη",
  "Καριέρα",
  "Οικογένεια",
  "Υγεία",
  "Χρήματα",
  "Ταξίδια",
  "Φίλοι",
] as const;
type Topic = (typeof TOPICS)[number];

type PersistedForm = {
  persona: PersonaId;
  gender: Gender | "";
  age: AgeGroup | "";
  mood: Mood;
  topics: Topic[];
  question: string;
};

export default function Cup() {
  const nav = useNavigate();

  const [persona, setPersona] = useState<PersonaId>("classic");
  const [gender, setGender] = useState<Gender | "">("");
  const [age, setAge] = useState<AgeGroup | "">("");
  const [mood, setMood] = useState<Mood>("Ουδέτερο");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("cupForm");
    if (raw) {
      try {
        const f = JSON.parse(raw) as PersistedForm;
        if (f.persona) setPersona(f.persona);
        setGender(f.gender);
        setAge(f.age);
        setMood(f.mood ?? "Ουδέτερο");
        setTopics(f.topics ?? []);
        setQuestion(f.question ?? "");
      } catch {}
      localStorage.removeItem("cupForm");
    }
  }, []);

  const personaObj = useMemo(
    () => PERSONAS.find((p) => p.id === persona)!,
    [persona]
  );

  const toggleTopic = (t: Topic) =>
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const onFile = (f: File | null) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const validate = () => {
    if (!gender) return "Το *Φύλο* είναι υποχρεωτικό.";
    if (!age) return "Το *Ηλικιακό γκρουπ* είναι υποχρεωτικό.";
    if (!file) return "Ανέβασε φωτογραφία του φλιτζανιού.";
    return null;
  };

  const start = async () => {
    setErr(null);
    const v = validate();
    if (v) return setErr(v);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      const toStore: PersistedForm = { persona, gender, age, mood, topics, question };
      localStorage.setItem("cupForm", JSON.stringify(toStore));
      localStorage.setItem("returnTo", "/cup");
      return nav("/auth");
    }

    try {
      setBusy(true);
      const safeName = file!.name.replace(/\s+/g, "_");
      const path = `${auth.user.id}/${Date.now()}_${safeName}`;
      const up = await supabase.storage.from("cups").upload(path, file!, { upsert: false });
      if (up.error) throw up.error;
      const imageUrl = supabase.storage.from("cups").getPublicUrl(path).data.publicUrl;

      const meta =
        `Περσόνα: ${personaObj.name}\n` +
        `Φύλο: ${gender}\nΗλικιακό γκρουπ: ${age}\n` +
        `Κατάσταση: ${mood}\n` +
        `Θέματα: ${topics.join(", ") || "—"}\n` +
        `Ερώτηση: ${question || "—"}`;

      const { data, error } = await supabase
        .from("readings")
        .insert({
          user_id: auth.user.id,
          image_url: imageUrl,
          text: `${meta}\n\nΗ ανάλυση ετοιμάζεται…`,
        })
        .select("id")
        .single();

      if (error || !data) throw error || new Error("Insert failed");
      nav(`/reading/${data.id}`);
    } catch (e: any) {
      console.error(e);
      setErr(e.message || "Κάτι πήγε στραβά.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Ξεκλείδωσε την Αρχαία Τέχνη της Καφεμαντείας
        </h1>
        <p className="mt-3 text-lg opacity-80 max-w-3xl">
          Το πεπρωμένο σου σε περιμένει στο φλιτζάνι σου. Με την βοήθεια της Τεχνητής Νοημοσύνης,
          οι συμβολισμοί αποκτούν φωνή — εξατομικευμένα, ζεστά και ουσιαστικά.
        </p>
      </header>

      {/* PERSONAS */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Διάλεξε Καφετζού</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {PERSONAS.map((p) => {
            const active = persona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPersona(p.id)}
                className={`group rounded-2xl border overflow-hidden bg-white shadow-sm hover:shadow-md transition text-left ${
                  active ? "ring-2 ring-black" : ""
                }`}
                title={`Επιλογή: ${p.name}`}
              >
                {/* Wrapper με σταθερό aspect ratio 4:3 */}
                <div className="w-full" style={{ aspectRatio: "4 / 3" }}>
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full h-full object-cover block"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                    }}
                    referrerPolicy="no-referrer"
                    loading="eager"
                  />
                </div>
                <div className="p-4">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm opacity-70">{p.desc}</div>
                  <div className="mt-3 text-sm underline group-hover:no-underline">
                    {active ? "Επιλεγμένη" : "Επίλεξε"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Required fields */}
      <section className="mt-10 grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">
            Φύλο <span className="text-red-600">*</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`px-3 py-2 rounded-full border ${
                  gender === g ? "bg-black text-white" : "bg-white hover:bg-gray-50"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">
            Ηλικιακό γκρουπ <span className="text-red-600">*</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {AGE_GROUPS.map((a) => (
              <button
                key={a}
                onClick={() => setAge(a)}
                className={`px-3 py-2 rounded-full border ${
                  age === a ? "bg-black text-white" : "bg-white hover:bg-gray-50"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Mood */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Κατάσταση</h2>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`px-3 py-2 rounded-full border ${
                mood === m ? "bg-black text-white" : "bg-white hover:bg-gray-50"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </section>

      {/* Topics */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Θέματα που σε ενδιαφέρουν</h2>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => {
            const on = topics.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTopic(t)}
                className={`px-3 py-2 rounded-full border ${
                  on ? "bg-black text-white" : "bg-white hover:bg-gray-50"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </section>

      {/* Personalized Question */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Προσωποποιημένη ερώτηση (προαιρετικό)</h2>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Γράψε την ερώτησή σου…"
          className="w-full rounded-xl border px-3 py-2"
          maxLength={240}
        />
        <div className="text-xs opacity-60 mt-1">{question.length}/240</div>
      </section>

      {/* Upload + CTA */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">
          Ανέβασε το Φλιτζάνι σου <span className="text-red-600">*</span>
        </h2>

        <div className="grid md:grid-cols-[280px_1fr] gap-6 items-start">
          <div className="rounded-2xl border bg-white overflow-hidden w-[280px] h-[280px] flex items-center justify-center">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-sm opacity-60 p-4 text-center">
                Καμία εικόνα<br />Επίλεξε ένα αρχείο για προεπισκόπηση
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onFile(e.target.files?.[0] || null)}
            />
            <button
              onClick={start}
              disabled={busy}
              className="rounded-xl px-5 py-3 bg-black text-white hover:opacity-90 transition disabled:opacity-40 w-fit"
            >
              {busy ? "Ανάλυση…" : "Ανάλυση τώρα"}
            </button>
            {err && <p className="text-red-600 text-sm">{err}</p>}
            <p className="text-xs opacity-60">
              * Απαραίτητα πεδία: Φύλο, Ηλικιακό γκρουπ, Εικόνα φλιτζανιού
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
