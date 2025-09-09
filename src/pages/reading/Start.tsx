'use client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function ReadingStartPage() {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        localStorage.setItem('returnTo', '/reading/start');
        navigate('/auth', { replace: true });
      } else {
        setReady(true);
      }
    });
  }, [navigate]);

  const run = async () => {
    setErr(null);
    if (!file) return setErr('Διάλεξε εικόνα φλιτζανιού.');
    if (!file.type.startsWith('image/')) return setErr('Μόνο εικόνες.');
    if (file.size > 5 * 1024 * 1024) return setErr('Μέγιστο 5MB.');
    setBusy(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return setErr('Απαιτείται σύνδεση.'); }

    const path = `${user.id}/${Date.now()}_${file.name}`;
    const up = await supabase.storage.from('cups').upload(path, file);
    if (up.error) { setBusy(false); return setErr(up.error.message); }

    const imageUrl = supabase.storage.from('cups').getPublicUrl(path).data.publicUrl;

    // Προκαταχώρηση reading
    const ins = await supabase.from('readings').insert({
      user_id: user.id,
      image_url: imageUrl,
      text: 'Δημιουργία χρησμού…'
    }).select('id').single();

    if (ins.error || !ins.data) { setBusy(false); return setErr(ins.error?.message || 'Insert failed'); }

    const readingId = ins.data.id as string;

    // DEMO “oracle” – μέχρι να κουμπώσουμε OpenAI
    const oracle = await createFakeOracle(imageUrl);
    await supabase.from('readings').update({ text: oracle }).eq('id', readingId);

    setBusy(false);
    navigate(`/reading/${readingId}`, { replace: true });
  };

  if (!ready) return <div style={{ padding: 16 }}>Έλεγχος σύνδεσης…</div>;

  return (
    <main style={{ padding: 16 }}>
      <h1>Νέα Ανάγνωση</h1>
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={busy} />
      <button type="button" onClick={run} disabled={busy || !file} style={{ marginLeft: 8 }}>
        {busy ? 'Ανάλυση…' : 'Ανάλυση φλιτζανιού'}
      </button>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
    </main>
  );
}

async function createFakeOracle(imageUrl: string) {
  return `Είδα σημάδια ανανέωσης και τύχης.\nΕικόνα: ${imageUrl}`;
}
