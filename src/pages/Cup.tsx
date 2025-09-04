import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type PersonaId = "classic" | "young" | "mystic";

const PERSONAS: { id: PersonaId; name: string; desc: string; img: string }[] = [
  {
    id: "classic",
    name: "Κλασική Καφετζού",
    desc: "παραδοσιακό, ζεστό ύφος",
    img: "/assets/kafetzou-classic.png",
  },
  {
    id: "young",
    name: "Κατίνα η Σμυρνιά",
    desc: "από τη Σμύρνη με αγάπη και παράδοση",
    img: "/assets/kafetzou-young.png",
  },
  {
    id: "mystic",
    name: "Ισιδώρα η Πνευματική",
    desc: "συνδέει τον κόσμο με το πνεύμα",
    img: "/assets/kafetzou-mystic.png",
  },
];

const MOODS = ["Ουδέτερο", "Χαρούμενο", "Αγχωμένο", "Θλιμμένο"] as const;
type Mood = (typeof MOODS)[number];

const TOPICS = ["Έρωτας", "Τύχη", "Καριέρα", "Οικογένεια", "Υγεία", "Χρήματα"] as const;
type Topic = (typeof TOPICS)[number];

export default function Cup() {
  const nav = useNavigate();

  const [persona, setPersona] = useState<PersonaId>("classic");
  const [mood, setMood] = useState<Mood>("Ουδέτερο");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const personaObj = useMemo(
    () => PERSONAS.find((p) => p.id === persona)!,
    [persona]
  );

  const toggleTopic = (t: Topic) => {
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const start = async () => {
    try {
      setErr(null);

      // 1) Έλεγχος login
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        localStorage.setItem("returnTo", "/cup");
        return nav("/auth");
      }

      // 2) Έλεγχος αρχείου
      if (!file) return setErr("Διάλεξε φωτογραφία του φλιτζανιού.");
      if (!file.type.startsWith("image/")) return setErr("Μόνο εικόνες.");
      if (file.size > 5 * 1024 * 1024) return setErr("Μέγιστο μέγεθος 5MB.");

      setBusy(true);

      // 3) Upload στο Supabase Storage (bucket: cups)
      const safeName = file.name.replace(/\s+/g, "_");
      const path = `${auth.user.id}/${Date.now()}_${safeName}`;
      const up = await supabase.storage.from("cups").upload(path, file, { upsert: false });
      if (up.error) throw up.error;

      const imageUrl = supabase.storage.from("cups").getPublicUrl(path).data.publicUrl;

      // 4) Δημιουργία reading (χρησιμοποιούμε στήλες: user_id, image_url, text)
      const seedText =
        `Περσόνα: ${personaObj.name} | Κατάσταση: ${mood} | Θέματα: ${topics.join(", ") || "—"}` +
        `\nΗ ανάλυση ετοιμάζεται…`;

      const ins = await supabase
        .from("readings")
        .insert({
          user_id: auth.user.id,
          image_url: imageUrl,
          text: seedText, // κρατάμε βασικά meta μέσα στο text για να μην σπάσουμε schema
        })
        .select("id")
        .single();

      if (ins.error || !ins.data) throw ins.error || new Error("Insert failed");
      const readingId = ins.data.id as string;

      // 5) Redirect στη λεπτομέρεια
      nav(`/reading/${readingId}`);
    } catch (e: any) {
      console.error(e);
      setErr(e.message || "Κάτι πήγε στραβά.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* HERO */}
      <header className="flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Ξεκλείδωσε την Αρχαία Τέχνη της Καφεμαντείας
          </h1>
          <p className="mt-3 text-lg opacity-80">
            Το πεπρωμένο σου σε περιμένει στο φλιτζάνι σου. Με την βοήθεια της Τεχνητής Νοημοσύνης,
            οι συμβολισμοί αποκτούν φωνή — εξατομικευμένα, ζεστά και ουσιαστικά.
          </p>
        </div>
      </header>

      {/* PERSONAS */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Διάλεξε Καφετζού</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
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
                <div className="bg-gray-50">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full aspect-square object-contain"
                    loading="lazy"
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

      {/* MOOD */}
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

      {/* TOPICS */}
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

      {/* UPLOAD + ACTION */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Ανέβασε το Φλιτζάνι σου</h2>
        <div className="flex flex-col md:flex-row items-start gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button
            onClick={start}
            disabled={busy || !file}
            className="rounded-xl px-5 py-3 bg-black text-white hover:opacity-90 transition disabled:opacity-40"
          >
            {busy ? "Ανάλυση…" : "Ξεκίνα Ανάλυση Τώρα"}
          </button>
        </div>
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      </section>
    </div>
  );
}
