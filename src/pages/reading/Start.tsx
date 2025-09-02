'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ReadingStartPage() {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return setErr('Απαιτείται σύνδεση.'); }

    // 1) Upload
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const up = await supabase.storage.from('cups').upload(path, file, { upsert: false });
    if (up.error) { setBusy(false); return setErr(up.error.message); }

    // 2) Public URL
    const imageUrl = supabase.storage.from('cups').getPublicUrl(path).data.publicUrl;

    // 3) Insert reading (placeholder)
    const ins = await supabase.from('readings').insert({
      user_id: user.id,
      image_path: path,
      oracle_text: 'Δημιουργία χρησμού…',
    }).select('*').single();

    if (ins.error || !ins.data) {
      setBusy(false);
      return setErr(ins.error?.message || 'Insert failed');
    }
    const readingId = ins.data.id as string;

    // 4) (Demo) Δημιουργία χρησμού client-side
    const fakeOracle = await createFakeOracle(imageUrl);

    // 5) Update με τον χρησμό
    const upd = await supabase.from('readings')
      .update({ oracle_text: fakeOracle })
      .eq('id', readingId);
    if (upd.error) { setBusy(false); return setErr(upd.error.message); }

    setBusy(false);
    // 6) Redirect σε detail
    window.location.href = `/reading/detail?id=${readingId}`;
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
      <button onClick={run} disabled={busy || !file} style={{ marginLeft: 8 }}>
        {busy ? 'Ανάλυση…' : 'Ανάλυση φλιτζανιού'}
      </button>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      <p style={{ marginTop: 8, opacity: 0.7 }}>
        Μετά την ανάλυση θα μεταφερθείς αυτόματα στον χρησμό.
      </p>
    </main>
  );
}

async function createFakeOracle(imageUrl: string): Promise<string> {
  return `Είδα σημάδια ανανέωσης και τύχης. (demo)\nΕικόνα: ${imageUrl}`;
}