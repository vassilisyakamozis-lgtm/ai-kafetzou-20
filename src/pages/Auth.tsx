import { supabase } from "../lib/supabase";

export default function AuthPage() {
  async function sendMagicLink() {
    const email = prompt("Email για magic link:");
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (error) alert(error.message);
    else alert("Στείλαμε link στο email σου.");
  }
  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-2">Εγγραφή / Σύνδεση</h1>
      <p className="opacity-70 mb-4">Χρησιμοποίησε magic link ή provider.</p>
      <button onClick={sendMagicLink} className="px-4 py-2 rounded bg-black text-white">
        Magic link στο email
      </button>
    </div>
  );
}