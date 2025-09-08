import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const AuthPage: React.FC = () => {
  const { signInWithOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setMsg("");
    const { error } = await signInWithOtp(email.trim());
    if (error) {
      setStatus("error");
      setMsg(error.message || "Κάτι πήγε στραβά");
      return;
    }
    setStatus("sent");
    setMsg("Σου στείλαμε magic link. Έλεγξε το email σου.");
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 24 }}>
      <h1>Εγγραφή / Σύνδεση</h1>
      <p>Χρησιμοποίησε magic link στο email σου.</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          type="email"
          required
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, fontSize: 16 }}
        />
        <button disabled={status === "sending"} style={{ padding: 10, fontSize: 16 }}>
          {status === "sending" ? "Αποστέλλεται…" : "Magic link στο email"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
};

export default AuthPage;
