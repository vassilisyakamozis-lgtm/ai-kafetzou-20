/**
 * Απλή σελίδα προορισμού για να δεις ότι η ροή /cup → /reading δουλεύει.
 * Διαβάζει τα query params και τα εμφανίζει.
 */
export default function ReadingPage() {
  const params = new URLSearchParams(window.location.search);
  const data = Object.fromEntries(params.entries());

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: "0 20px" }}>
      <h1>Αποτέλεσμα Ανάγνωσης (demo)</h1>
      <pre
        style={{
          background: "#f6f6f6",
          padding: 16,
          borderRadius: 8,
          border: "1px solid #eee",
          overflowX: "auto",
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
      <p><a href="/cup">← Επιστροφή</a></p>
    </div>
  );
}
