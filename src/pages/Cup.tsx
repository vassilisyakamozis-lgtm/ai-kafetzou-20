// src/pages/Cup.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Cup() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("general");
  const [persona, setPersona] = useState("κλασική καφετζού");
  const [mood, setMood] = useState("ουδέτερο");
  const [loading, setLoading] = useState(false);

  async function start() {
    try {
      setLoading(true);

      // check session
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        alert("Χρειάζεται σύνδεση.");
        return navigate("/auth");
      }
      // file required
      if (!file) {
        alert("Επίλεξε εικόνα φλυτζανιού.");
        return;
      }

      // upload to Storage (public bucket 'cups')
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${u.user.id}/${Date.now()}.${ext}`;
      const up = await supabase.storage.from("cups").upload(path, file, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });
      if (up.error) {
        alert("Αποτυχία upload: " + up.error.message);
        return;
      }
      const pub = supabase.storage.from("cups").getPublicUrl(path);
      const image_url = pub.data.publicUrl;

      // supabase access token -> backend
      const { data: s } = await supabase.auth.getSession();
      const token = s?.session?.access_token;
      if (!token) {
        alert("Δεν βρέθηκε session token.");
        return;
      }

      // call /api/analyze
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image_url, category, persona, mood }),
      });
      const json = await resp.json();
      if (!resp.ok) {
        alert("Σφάλμα API: " + (json?.error || resp.statusText));
        return;
      }
      navigate(`/reading/${json.id}`);
    } catch (e: any) {
      alert(e?.message || "Σφάλμα.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto" }}>
      <h1>Ανάγνωση Φλυτζανιού</h1>

      <div style={{ marginTop: 16 }}>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
        <div>
          <label>Κατηγορία</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%" }}>
            <option value="general">Γενικά</option>
            <option value="love">Ερωτικά</option>
            <option value="career">Επαγγελματικά</option>
            <option value="luck">Τύχη</option>
            <option value="family">Οικογενειακά</option>
          </select>
        </div>
        <div>
          <label>Περσόνα</label>
          <select value={persona} onChange={(e) => setPersona(e.target.value)} style={{ width: "100%" }}>
            <option>κλασική καφετζού</option>
            <option>μοντέρνα μάντισσα</option>
            <option>μυστικιστική αφηγήτρια</option>
          </select>
        </div>
        <div>
          <label>Συναίσθημα</label>
          <select value={mood} onChange={(e) => setMood(e.target.value)} style={{ width: "100%" }}>
            <option>ουδέτερο</option>
            <option>αγχωμένος</option>
            <option>ελπιδοφόρος</option>
            <option>στεναχωρημένος</option>
            <option>ενθουσιασμένος</option>
          </select>
        </div>
      </div>

      <button onClick={start} disabled={loading} style={{ marginTop: 16 }}>
        {loading ? "Γίνεται ανάλυση..." : "Ξεκίνα Ανάγνωση"}
      </button>
    </div>
  );
}
