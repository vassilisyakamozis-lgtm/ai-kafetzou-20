import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const IndexPage: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) return null; // ή spinner

  const go = () => {
    if (!user) navigate("/auth");
    else navigate("/cup"); // βάλε εδώ τη σελίδα ανάγνωσης
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 24 }}>
      <h1>AI Καφετζού</h1>
      <p>{user ? `Συνδεδεμένος: ${user.email}` : "Δεν είσαι συνδεδεμένος."}</p>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={go} style={{ padding: 10, fontSize: 16 }}>
          Ξεκίνα την ανάγνωση
        </button>
        {user && (
          <button onClick={() => signOut()} style={{ padding: 10, fontSize: 16 }}>
            Αποσύνδεση
          </button>
        )}
        {!user && (
          <button onClick={() => navigate("/auth")} style={{ padding: 10, fontSize: 16 }}>
            Εγγραφή / Σύνδεση
          </button>
        )}
      </div>
    </div>
  );
};

export default IndexPage;
