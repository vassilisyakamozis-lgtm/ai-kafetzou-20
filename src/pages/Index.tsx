import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Safe wrapper: αν για οποιονδήποτε λόγο το useAuth() κληθεί εκτός AuthProvider,
 * δεν ρίχνουμε σφάλμα/blank screen — εμφανίζουμε προειδοποίηση και δουλεύουμε με defaults.
 */
function useAuthSafe() {
  try {
    return useAuth();
  } catch (e) {
    console.warn("useAuth called outside AuthProvider. Rendering with safe defaults.");
    return {
      user: null,
      session: null,
      loading: false,
      signInWithOtp: async () => ({ error: new Error("No AuthProvider") }),
      signOut: async () => ({ error: null }),
    } as const;
  }
}

const IndexPage: React.FC = () => {
  const { user, loading, signOut } = useAuthSafe();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: "40px auto", padding: 24 }}>
        <p>Φόρτωση…</p>
      </div>
    );
  }

  const go = () => {
    if (!user) navigate("/auth");
    else navigate("/cup");
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 24 }}>
      <h1>AI Καφετζού</h1>

      {!user && (
        <div
          style={{
            background: "#fff7e6",
            border: "1px solid #ffd591",
            padding: 12,
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          <b>Δεν είσαι συνδεδεμένος.</b> Κάνε σύνδεση για να ξεκινήσεις την ανάγνωση.
        </div>
      )}

      {user && (
        <p style={{ marginTop: 0, opacity: 0.85 }}>Συνδεδεμένος: <b>{user.email}</b></p>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={go} style={{ padding: 10, fontSize: 16 }}>
          Ξεκίνα την ανάγνωση
        </button>

        {user ? (
          <button onClick={() => signOut()} style={{ padding: 10, fontSize: 16 }}>
            Αποσύνδεση
          </button>
        ) : (
          <button onClick={() => navigate("/auth")} style={{ padding: 10, fontSize: 16 }}>
            Εγγραφή / Σύνδεση
          </button>
        )}
      </div>

      {/* Debug helper — αφαίρεσέ το όταν σταθεροποιηθεί */}
      <div style={{ marginTop: 16, opacity: 0.6, fontSize: 12 }}>
        <code>Index mounted</code>
      </div>
    </div>
  );
};

export default IndexPage;
