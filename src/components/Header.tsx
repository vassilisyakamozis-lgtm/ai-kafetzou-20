import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Header: React.FC = () => {
  const { user, loading, signOut, profile } = useAuth();
  const navigate = useNavigate();

  const name =
    (profile && (profile.full_name || profile.name)) ||
    user?.email ||
    "Επισκέπτης";

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 18px",
        borderBottom: "1px solid #eee",
        position: "sticky",
        top: 0,
        background: "#fff",
        zIndex: 10,
      }}
    >
      <Link to="/" style={{ textDecoration: "none", color: "#111", fontWeight: 700 }}>
        AI Καφετζού
      </Link>

      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/cup">Ανάγνωση</Link>
      </nav>

      <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
        {!loading && user ? (
          <>
            <span style={{ opacity: 0.8 }}>Γεια σου, {name}</span>
            <button onClick={() => signOut()} style={{ padding: "6px 10px" }}>
              Αποσύνδεση
            </button>
          </>
        ) : (
          <button onClick={() => navigate("/auth")} style={{ padding: "6px 10px" }}>
            Εγγραφή / Σύνδεση
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
