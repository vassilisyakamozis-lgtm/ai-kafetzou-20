'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ReadingStartPage() {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // Έλεγχος session: αν δεν υπάρχει, κάνε OAuth και γύρνα πάλι εδώ
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

    // Βασικοί έλεγχοι αρχείου
    if (!file) { setErr('Διάλεξε εικόνα φλιτζανιού.'); return; }
    if (!file.type.startsWith('image/')) { setErr('Μόνο εικόνες.'); return; }
    if (file.size > 5 * 1024 * 1024) { setErr('Μέγιστο 5MB.'); return; }

    setBusy(true);
    try {
      // 0) Χρήστης
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) throw new Error('Απαιτείται σύνδεση.');
      const user = userData.user;

      // 1) Upload στο bucket "cups"
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const up = await supabase.storage.from('cups').upload(path, file, { upsert: false });
      if (up.error) throw up.error;

      // 2) Public URL (για ανάλυση/προβολή)
      const imageUrl = supabase.storage.from('cups').getPublicUrl(path).data.publicUrl;

      // 3) Δημιουργία εγγραφής στον πίνακα readings (placeholder)
      const ins = await supabase
        .from('readings')
        .insert({
          user_id: user.id,
          image_path: path,
          oracle_text: 'Δημιουργία χρησμού…',
        })
        .select('*')
        .single();
      if (ins.error || !ins.data) throw new Error(ins.error?.message || 'Insert failed');
      const readingId = ins.data.id as string;

      // 4) (ΠΡΟΣΩΡΙΝΑ) Δημιουργία χρησμού στον client (demo)
      const fakeOracle = await createFakeOracle(imageUrl);

      // 5) Update με τον τελικό χρησμό
      const upd = await supabase
        .from('readings')
        .update({ oracle_text: fakeOracle })
        .eq('id', readingId);
      if (upd.error) throw upd.error;

      // 6) Redirect στη σελίδα αποτελέσματος (detail με query id)
      window.location.href = `/reading/detail?id=${readingId}`;
    } catch (e: any) {
      setErr(e?.message || 'Κάτι πήγε στραβά.');
    } finally {
      setBusy(false);
    }
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

      <button
        type="button"
        onClick={run}
        disabled={busy || !file}
        style={{ marginLeft: 8 }}
      >
        {busy ? 'Ανάλυση…' : 'Ανάλυση φλιτζανιού'}
      </button>

      {err && <p style={{ color: 'red' }}>{err}</p>}
      <p style={{ marginTop: 8, opacity: 0.7 }}>
        Μετά την ανάλυση θα μεταφερθείς αυτόματα στον χρησμό.
      </p>
    </main>
  );
}

// ------ Προσωρινή "δημιουργία χρησμού" για να δεις τη ροή να δουλεύει ------
async function createFakeOracle(imageUrl: string): Promise<string> {
  // Σε παραγωγή: αντικατάστησέ το με κλήση σε Edge Function / server route (OpenAI Vision).
  return `Είδα σημάδια ανανέωσης και τύχης. (demo)\nΕικόνα: ${imageUrl}`;
}
