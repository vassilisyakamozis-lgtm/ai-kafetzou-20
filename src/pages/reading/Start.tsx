'use client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ React Router redirect
import { supabase } from '@/lib/supabase';

export default function ReadingStartPage() {
  const navigate = useNavigate(); // ✅ θα το χρησιμοποιήσουμε αντί για window.location.href

  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // Βεβαιώσου ότι είμαστε logged in – αν όχι, κάνε OAuth και γύρνα ξανά εδώ
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        localStorage.setItem('returnTo', '/reading/start');
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/reading/start` },
        });
      } else {
        setReady(true);
      }
    });
  }, []);

  const run = async () => {
    setErr(null);
    if (!file) return setErr('Διάλεξε εικόνα φλιτζανιού.');
    if (!file.type.startsWith('image/')) return setErr('Μόνο εικόνες.');
    if (file.size > 5 * 1024 * 1024) return setErr('Μέγιστο 5MB.');

    setBusy(true);

    // 0) Χρήστης
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      setBusy(false);
      return setErr('Απαιτείται σύνδεση.');
    }
    const user = userData.user;

    // 1) Upload στο bucket "cups"
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const up = await supabase.storage.from('cups').upload(path, file, { upsert: false });
    if (up.error) {
      setBusy(false);
      return setErr(up.error.message);
    }

    // 2) Public URL (για ανάλυση/προβολή)
    const imageUrl = supabase.storage.from('cups').getPublicUrl(path).data.publicUrl;

    // 3) Δημιουργία εγγραφής στον πίνακα readings (placeholder κείμενο)
    const ins = await supabase
      .from('readings')
      .insert({
        user_id: user.id,
        image_path: path,
        oracle_text: 'Δημιουργία χρησμού…',
      })
      .select('*')
      .single();

    if (ins.error || !ins.data) {
      setBusy(false);
      return setErr(ins.error?.message || 'Insert failed');
    }
    const readingId = ins.data.id as string;

    // 4) (ΠΡΟΣΩΡΙΝΑ) Δημιουργία χρησμού στον client για end-to-end ροή
    const fakeOracle = await createFakeOracle(imageUrl);

    // 5) Update με τον τελικό χρησμό
    const upd = await supabase.from('readings').update({ oracle_text: fakeOracle }).eq('id', readingId);
    if (upd.error) {
      setBusy(false);
      return setErr(upd.error.message);
    }

    setBusy(false);
    // 6) ✅ Redirect με React Router (όχι full reload)
    navigate(`/reading/detail?id=${readingId}`, { replace: true });
  };

  if (!ready) return <div style={{ padding: 16 }}>Έλεγχος σύνδεσης…</div>;

  return (
    <main style={{ padding: 16 }}>
      <h1>Νέα Ανάγνωση</h1>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        disabled={busy}
      />
      <button type="button" onClick={run} disabled={busy || !file} style={{ marginLeft: 8 }}>
        {busy ? 'Ανάλυση…' : 'Ανάλυση φλιτζανιού'}
      </button>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      <p style={{ marginTop: 8, opacity: 0.7 }}>Μετά την ανάλυση θα μεταφερθείς αυτόματα στον χρησμό.</p>
    </main>
  );
}

// ------ Προσωρινή "δημιουργία χρησμού" για να δεις τη ροή να δουλεύει ------
async function createFakeOracle(imageUrl: string): Promise<string> {
  // Σε παραγωγή: κάλεσε Edge Function που μιλά στο OpenAI Vision.
  return `Είδα σημάδια ανανέωσης και τύχης. (demo)\nΕικόνα: ${imageUrl}`;
}
