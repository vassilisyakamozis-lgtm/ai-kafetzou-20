import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Props = {
  image: File | null;
  category: string;
  persona: string;
  mood: string;
  question?: string | null;
  className?: string;
};

async function fileToDataURL(file: File): Promise<string> {
  // επιστρέφει "data:image/...;base64,xxxx"
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function StartReadingButton({
  image,
  category,
  persona,
  mood,
  question,
  className,
}: Props) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleClick() {
    try {
      setLoading(true);

      // 1) Auth
      const { data: u, error: uErr } = await supabase.auth.getUser();
      if (uErr || !u?.user) {
        alert("Χρειάζεται είσοδος/εγγραφή.");
        return navigate("/");
      }

      if (!image) {
        alert("Επίλεξε εικόνα φλυτζανιού.");
        return;
      }

      // 2) Upload στον public bucket 'cups' (για προβολή/ιστορικό)
      const ext = image.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${u.user.id}/${Date.now()}.${ext}`;
      const up = await supabase.storage.from("cups").upload(path, image, {
        contentType: image.type || "image/jpeg",
        upsert: true,
      });
      if (up.error) {
        alert("Αποτυχία ανεβάσματος εικόνας: " + up.error.message);
        return;
      }
      const pub = supabase.storage.from("cups").getPublicUrl(path);
      const image_url = pub.data.publicUrl;

      // 3) Παράγουμε data URL για OpenAI (αποφεύγουμε timeouts)
      const image_data_url = await fileToDataURL(image);

      // 4) Supabase access token
      const { data: s } = await supabase.auth.getSession();
      const token = s?.session?.access_token;
      if (!token) {
        alert("Δεν βρέθηκε session token.");
        return;
      }

      // 5) Κλήση στο API
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          image_url,            // αποθήκευση/ιστορικό
          image_data_url,       // για OpenAI (inline)
          category,
          persona,
          mood,
          question,
        }),
      });

      const json = await resp.json();
      if (!resp.ok) {
        alert("Σφάλμα API: " + (json?.error || resp.statusText));
        return;
      }

      navigate(`/reading/${json.id}`);
    } catch (e: any) {
      alert(e?.message || "Κάτι πήγε στραβά.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Γίνεται ανάλυση..." : "Ξεκίνα Ανάγνωση"}
    </Button>
  );
}
