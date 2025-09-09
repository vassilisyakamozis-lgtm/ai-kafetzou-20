import { useState } from "react";

const FORTUNE_TELLERS = [
  {
    id: "classic",
    name: "Κλασική Καφετζού",
    desc: "παραδοσιακό, ζεστό ύφος",
    img: "/assets/kafetzou-classic.png",
  },
  {
    id: "young",
    name: "Νεαρή Καφετζού",
    desc: "ανάλαφρο, παιχνιδιάρικο ύφος",
    img: "/assets/kafetzou-young.png",
  },
  {
    id: "mystic",
    name: "Μυστική Μάντισσα",
    desc: "ποιητικό, μυσταγωγικό ύφος",
    img: "/assets/kafetzou-mystic.png",
  },
] as const;

type PersonaId = typeof FORTUNE_TELLERS[number]["id"];

export default function IndexPage() {
  const [pickerOpen, setPickerOpen] = useState(true);
  const [persona, setPersona] = useState<PersonaId>("classic");
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("35-44");
  const [topic, setTopic] = useState("spiritual");
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const startReading = () => {
    console.log({ persona, gender, age, topic, question, file });
    alert("Η ανάγνωση ξεκινά! Δες console για τα δεδομένα.");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fdf7fb", color: "#333" }}>
      {/* HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          background: "#fff",
          borderBottom: "1px solid #ddd",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 50,
        }}
      >
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>AI Καφετζού</div>
        <nav style={{ display: "flex", gap: "10px" }}>
          <a href="/signup">
            <button>Εγγραφή</button>
          </a>
          <a href="/login">
            <button>Σύνδεση</button>
          </a>
          <a href="/logout">
            <button>Έξοδος</button>
          </a>
        </nav>
      </header>

      {/* PERSONA PICKER */}
      <section style={{ maxWidth: "900px", margin: "20px auto", padding: "0 20px" }}>
        <div
          style={{
            border: "2px dashed #ddd",
            borderRadius: "10px",
            padding: "20px",
            background: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2>Διάλεξε Καφετζού</h2>
              <p style={{ fontSize: "14px", color: "#666" }}>
                Καθορίζει το ύφος απάντησης (κείμενο & αφήγηση).
              </p>
            </div>
            <button onClick={() => setPickerOpen((v) => !v)}>
              {pickerOpen ? "Απόκρυψη" : "Εμφάνιση"}
            </button>
          </div>

          {pickerOpen && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
                marginTop: "20px",
              }}
            >
              {FORTUNE_TELLERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPersona(f.id)}
                  style={{
                    border: persona === f.id ? "2px solid purple" : "1px solid #ccc",
                    borderRadius: "10px",
                    padding: "10px",
                    background: "#fafafa",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      aspectRatio: "4/3",
                      background: "#f3e9f9",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={f.img}
                      alt={f.name}
                      style={{ maxHeight: "100%", maxWidth: "100%" }}
                    />
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    <strong>{f.name}</strong>
                    <p style={{ fontSize: "12px", color: "#666" }}>{f.desc}</p>
                  </div>
                  {persona === f.id && (
                    <div style={{ color: "purple", fontSize: "12px" }}>✓ Επιλεγμένη</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PROFILE FORM */}
      <main style={{ maxWidth: "900px", margin: "20px auto", padding: "0 20px" }}>
        <h1>Στοιχεία Προφίλ</h1>
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            marginTop: "10px",
          }}
        >
          <div style={{ display: "grid", gap: "15px" }}>
            <div>
              <label>Φύλο</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{ display: "block", width: "100%", marginTop: "5px" }}
              >
                <option value="male">Άνδρας</option>
                <option value="female">Γυναίκα</option>
                <option value="other">Άλλο</option>
              </select>
            </div>

            <div>
              <label>Ηλικία</label>
              <select
                value={age}
                onChange={(e) => setAge(e.target.value)}
                style={{ display: "block", width: "100%", marginTop: "5px" }}
              >
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45-54">45-54</option>
                <option value="55+">55+</option>
              </select>
            </div>

            <div>
              <label>Θεματική</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ display: "block", width: "100%", marginTop: "5px" }}
              >
                <option value="love">Ερωτικά</option>
                <option value="career">Επαγγελματικά</option>
                <option value="luck">Τύχη</option>
                <option value="family">Οικογενειακά</option>
                <option value="spiritual">Πνευματική & βαθιά</option>
              </select>
            </div>

            <div>
              <label>Προαιρετική ερώτηση</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="π.χ. Θα βρω αγάπη φέτος;"
                style={{ display: "block", width: "100%", marginTop: "5px" }}
              />
            </div>

            <div>
              <label>Φωτογραφία Φλιτζανιού (προαιρετικό)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                style={{ display: "block", marginTop: "5px" }}
              />
            </div>

            <div>
              <button
                onClick={startReading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "purple",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Ξεκίνα την Ανάγνωση
              </button>
              <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                * Αν δεν επιλέξεις καφετζού, χρησιμοποιείται προεπιλογή:
                <strong> Κλασική</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer
        style={{
          maxWidth: "900px",
          margin: "20px auto",
          padding: "10px",
          textAlign: "center",
          fontSize: "12px",
          color: "#666",
        }}
      >
        © {new Date().getFullYear()} AI Καφετζού
      </footer>
    </div>
  );
}
