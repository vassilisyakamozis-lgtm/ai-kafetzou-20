
import { useState } from "react";
import { supabase } from "../supabaseAuth"; // <-- φτιάξαμε το αρχείο supabaseAuth.ts

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage("❌ Σφάλμα: " + error.message);
    } else {
      setMessage("📧 Σου στείλαμε σύνδεσμο στο email. Έλεγξε τα εισερχόμενα!");
    }
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setMessage("Αποσυνδέθηκες.");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 px-4">
      <div className="max-w-md w-full bg-white shadow rounded-2xl p-6">
        <h1 className="text-xl font-semibold mb-4 text-center">Σύνδεση</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Το email σου"
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
          >
            {loading ? "Στέλνουμε…" : "Στείλε μου μαγικό link"}
          </button>
        </form>

        {message && (
          <div className="mt-4 text-sm text-center text-neutral-700">{message}</div>
        )}

        <hr className="my-6" />

        <button
          onClick={handleLogout}
          className="w-full bg-neutral-200 hover:bg-neutral-300 text-black py-2 rounded-lg transition"
        >
          Αποσύνδεση
        </button>
      </div>
    </div>
  );
}
