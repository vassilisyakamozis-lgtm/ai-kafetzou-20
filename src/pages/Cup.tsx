// src/pages/Cup.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Cup() {
  const nav = useNavigate();

  // δείχνουμε το email για επιβεβαίωση ότι είμαστε logged-in
  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [persona, setPersona] = useState("middle");
  const [topic, setTopic] = useState("general");
  const [mood, setMood] = useState("neutral");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("Έτοιμο");
  const [error, setError] = useState<string | null>(null);

  const uploadToCups = async (f: File) => {
    const ext = f.name.split(".").pop() || "jpg";
    const path = `cup_${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from("cups").upload(path, f, {
      cacheControl: "3600",
      upsert: false,
      contentType: f.type || "image/jpeg",
    });
    if (error) throw error;
    return supabase.storage.from("cups").getPublicUrl(data.path).data.publicUrl;
  };

  const startReading = async () => {
    try {
      setBusy(true);
      setError(null);
      setStep("Έλεγχος χρήστη…");

      const { data: userData, error: uErr } = await supabase.auth.getUser();
      if (uErr) throw uErr;
      const user = userData?.user;
      if (!user) throw new Error("Δεν υπάρχει ενεργό session χρήστη.");
      if (!file) throw new Error("Επέλεξε μια φωτογραφία φλιτζανιού.");

      setStep("Ανέβασμα εικόνας…");
      const image_url = await uploadToCups(file);

      setStep("Κλήση Vision + TTS…");
const resp = await fetch("/api/generate-reading", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    image_url,
    persona,
    topic,
    mood,
    question: question || null,
    user_id: user.id,
  }),
});

// parse με ασφάλεια: πρώτα text, μετά προσπάθεια για JSON
const raw = await resp.text();
let json: any = null;
try {
  json = raw ? JSON.parse(raw) : null;
} catch {
  // όχι JSON – θα δείξουμε το κείμενο όπως είναι
}

if (!resp.ok) {
  const msg =
    (json && (json.error || json.message || json.detail)) ||
    raw ||
    `API error ${resp.status}`;
  throw new Error(msg);
}
if (!json || !json.id) {
  throw new Error("Άδεια ή μη έγκυρη απάντηση από το API.");
}

setStep("Μετάβαση στο αποτέλεσμα…");
nav(`/cup-reading/${json.id}`);


  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Ξεκίνα την Ανάγνωση</h1>
      {userEmail && (
        <p className="text-sm opacity-70">Συνδεδεμένος ως {userEmail}</p>
      )}
      {/* ΒΓΗΚΕ το παλιό: “Απαιτείται σύνδεση χρήστη.” */}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm">Περσόνα</span>
          <select className="w-full border rounded-xl px-3 py-2"
                  value={persona} onChange={(e) => setPersona(e.target.value)}>
            <option value="young">Νεαρή</option>
            <option value="middle">Μεσήλικα</option>
            <option value="classic">Παραδοσιακή</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Θεματική</span>
          <select className="w-full border rounded-xl px-3 py-2"
                  value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="general">Γενικά</option>
            <option value="love">Ερωτικά</option>
            <option value="career">Επαγγελματικά</option>
            <option value="luck">Τύχη</option>
            <option value="family">Οικογενειακά</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm">Διάθεση</span>
        <select className="w-full border rounded-xl px-3 py-2"
                value={mood} onChange={(e) => setMood(e.target.value)}>
          <option value="neutral">Ήρεμη</option>
          <option value="optimistic">Αισιόδοξη</option>
          <option value="worried">Αγχωμένη</option>
        </select>
      </label>

      <label className="block">
        <span className="text-sm">Ερώτηση (προαιρετική)</span>
        <input
          className="w-full border rounded-xl px-3 py-2"
          value={question} onChange={(e) => setQuestion(e.target.value)}
          placeholder="Τι σε απασχολεί;"
        />
      </label>

      <button
        onClick={startReading}
        disabled={busy}
        className="rounded-2xl px-5 py-3 border"
      >
        {busy ? `Δημιουργία… (${step})` : "Ξεκίνα τώρα"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
