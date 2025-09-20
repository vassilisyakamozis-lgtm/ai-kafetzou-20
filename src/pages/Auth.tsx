import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const siteUrl =
    (import.meta.env.VITE_SITE_URL as string) ||
    (typeof window !== "undefined" ? window.location.origin : "");

  async function magicLink() {
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl}/cup` },
    });
    setSending(false);
    if (error) alert(error.message);
    else alert("Σου έστειλα magic link.");
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${siteUrl}/cup` },
    });
    if (error) alert(error.message);
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto" }}>
      <h1>Είσοδος / Εγγραφή</h1>
      <input
        type="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 10, marginTop: 12 }}
      />
      <button onClick={magicLink} disabled={sending} style={{ marginTop: 8 }}>
        {sending ? "Αποστολή..." : "Magic link"}
      </button>
      <hr style={{ margin: "24px 0" }} />
      <button onClick={google}>Σύνδεση με Google</button>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate("/")}>Αρχική</button>
      </div>
    </div>
  );
}
