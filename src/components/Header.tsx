import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Header: React.FC = () => {
  const { user, loading, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const name = (profile?.full_name || profile?.name) ?? user?.email ?? "Επισκέπτης";

  return (
    <header className="header">
      <div className="header-inner container">
        <Link to="/" className="brand" style={{ fontSize: 20 }}>AI Καφετζού</Link>

        <nav style={{ display: "flex", gap: 8 }}>
          <Link to="/cup">Ανάγνωση</Link>
        </nav>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          {!loading && user ? (
            <>
              <span style={{ color: "var(--muted)" }}>Γεια σου, {name}</span>
              <button className="btn btn-outline" onClick={() => signOut()}>Αποσύνδεση</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => navigate("/auth")}>Εγγραφή / Σύνδεση</button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
