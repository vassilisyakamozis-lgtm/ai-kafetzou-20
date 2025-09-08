import React, { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type AnalysisResponse = {
  message: string;
  tts_url?: string;
};

const BUCKET = "cup-uploads"; // φτιάξε αυτόν τον bucket στο Supabase (δες οδηγίες πιο κάτω)

const CupPage: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [ttsUrl, setTtsUrl] = useState<string | null>(null);

  // επιλογές (προσαρμόζεις κατά βούληση)
  const [category, setCategory] = useState<"general" | "love" | "career" | "family" | "luck">("general");
  const [persona, setPersona] = useState<"young" | "middle" | "elder">("middle");
  const [mood, setMood] = useState<"neutral" | "optimistic" | "realistic" | "tough-love">("neutral");

  const webhookUrl = import.meta.env.VITE_WEBHOOK_URL as string | undefined; // ΠΡΟΣΘΕΣΕ το στο .env

  const disabled = useMemo(() => {
    return uploading || analyzing || !file || !user;
  }, [uploading, analyzing, file, user]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setResult(null);
    setTtsUrl(null);
    setError(null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const uploadToSupabase = async (f: File): Promise<string> => {
    if (!user) throw new Error("Δεν έχεις συνδεθεί.");
    setUploading(true);
    try {
      const ext = f.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, f, {
        cacheControl: "3600",
        upsert: false,
        contentType: f.type || "image/png",
      });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const publicUrl = data.publicUrl;
      if (!publicUrl) throw new Error("Αποτυχία λήψης public URL.");
      return publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const analyze = async () => {
    setError(null);
    setResult(null);
    setTtsUrl(null);

    if (!file) {
      setError("Διάλεξε εικόνα φλιτζανιού.");
      return;
    }
    if (!webhookUrl) {
      setError("Λείπει το VITE_WEBHOOK_URL στο .env.");
      return;
    }

    try {
      // 1) upload στο Storage
      const imageUrl = await uploadToSupabase(file);

      // 2) call webhook
      setAnalyzing(true);
      const resp = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: imageUrl,
          category,
          persona,
          mood,
        }),
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        throw new Error(`Αποτυχία ανάλυσης (${resp.status}). ${txt}`);
      }

      const json = (await resp.json()) as AnalysisResponse;
      setResult(json.message || "—");
      setTtsUrl(json.tts_url || null);
    } catch (e: any) {
      setError(e?.message || "Κάτι πήγε στραβά.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "32px auto", padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Ανάλυση Φλιτζανιού</h2>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Συνδεδεμένος: <b>{user?.email}</b>
      </p>

      {/* Επιλογές */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, margin: "16px 0 20px" }}>
        <label style={{ display: "grid", gap: 6 }}>
          Κατηγορία
          <select value={category} onChange={(e) => setCategory(e.target.value as any)} style={{ padding: 10, fontSize: 14 }}>
            <option value="general">Γενική</option>
            <option value="love">Ερωτικά</option>
            <option value="career">Επαγγελματικά</option>
            <option value="family">Οικογενειακά</option>
            <option value="luck">Τύχη</option>
          </select>
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          Περσόνα
          <select value={persona} onChange={(e) => setPersona(e.target.value as any)} style={{ padding: 10, fontSize: 14 }}>
            <option value="young">Νέα</option>
            <option value="middle">Μεσήλικας</option>
            <option value="elder">Ηλικιωμένη</option>
          </select>
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          Ύφος
          <select value={mood} onChange={(e) => setMood(e.target.value as any)} style={{ padding: 10, fontSize: 14 }}>
            <option value="neutral">Ουδέτερο</option>
            <option value="optimistic">Αισιόδοξο</option>
            <option value="realistic">Ρεαλιστικό</option>
            <option value="tough-love">Tough love</option>
          </select>
        </label>
      </div>

      {/* Uploader */}
      <div style={{ display: "grid", gap: 12, border: "1px dashed #aaa", padding: 16, borderRadius: 12 }}>
        <input type="file" accept="image/*" onChange={onPick} />
        {preview && (
          <img
            src={preview}
            alt="Προεπισκόπηση φλιτζανιού"
            style={{ maxWidth: "100%", height: "auto", borderRadius: 12 }}
          />
        )}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={analyze} disabled={disabled} style={{ padding: 10, fontSize: 16 }}>
            {uploading ? "Μεταφόρτωση..." : analyzing ? "Ανάλυση..." : "Ξεκίνα ανάλυση"}
          </button>
          {!user && <span style={{ color: "#b00" }}>Πρέπει να είσαι συνδεδεμένος/η.</span>}
        </div>
      </div>

      {/* Αποτελέσματα */}
      <div style={{ marginTop: 24 }}>
        {error && (
          <div style={{ background: "#fee", border: "1px solid #f99", padding: 12, borderRadius: 10, marginBottom: 12 }}>
            <b>Σφάλμα:</b> {error}
          </div>
        )}
        {result && (
          <div style={{ background: "#f6f9ff", border: "1px solid #cfe0ff", padding: 16, borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>Χρησμός</h3>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{result}</p>
            {ttsUrl && (
              <div style={{ marginTop: 12 }}>
                <audio controls src={ttsUrl} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CupPage;
