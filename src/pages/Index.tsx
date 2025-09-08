import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const IndexPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="grid" style={{ gap: 20 }}>
      {/* HERO */}
      <section className="hero">
        <span className="badge">Νέα εμπειρία καφεμαντείας</span>
        <h1>Δες τι «γράφει» το φλιτζάνι σου, σε λίγα δευτερόλεπτα</h1>
        <p>
          Ανέβασε μια καθαρή φωτογραφία από το φλιτζάνι και πάρε τον χρησμό
          σε κείμενο ή αφήγηση. Απλό, γρήγορο, μαγικό ✨
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
          <button className="btn btn-primary" onClick={() => navigate("/cup")}>
            Ξεκίνα ανάγνωση
          </button>
          {!user && (
            <button className="btn btn-outline" onClick={() => navigate("/auth")}>
              Εγγραφή / Σύνδεση
            </button>
          )}
        </div>
        {!user && (
          <div
            className="card"
            style={{ padding: 10, borderRadius: 10, borderColor: "var(--border)" }}
          >
            <small style={{ color: "var(--muted)" }}>
              Δεν είσαι συνδεδεμένος. Συνδέσου για να αποθηκεύεις ιστορικό αναγνώσεων.
            </small>
          </div>
        )}
      </section>

      {/* FEATURES */}
      <section>
        <h2 style={{ margin: "6px 0 14px" }}>Πώς λειτουργεί</h2>
        <div className="grid grid-3">
          <div className="feature">
            <h3>1. Ανέβασε φωτογραφία</h3>
            <p>Χρησιμοποίησε φωτεινή, καθαρή εικόνα του εσωτερικού του φλιτζανιού.</p>
          </div>
          <div className="feature">
            <h3>2. Επιλογές ύφους</h3>
            <p>Διάλεξε κατηγορία, περσόνα και τόνο — από ουδέτερο έως “tough love”.</p>
          </div>
          <div className="feature">
            <h3>3. Χρησμός & αφήγηση</h3>
            <p>Πάρε το κείμενο του χρησμού και, προαιρετικά, άκουσέ το σε TTS.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IndexPage;
