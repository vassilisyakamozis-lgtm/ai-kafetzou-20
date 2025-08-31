'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ReadingStartPage() {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  const [file, setFile] = useState<File|null>(null);

  useEffect(() => {
    // βεβαιώσου ότι είμαστε logged in – αν όχι, στείλε για login και ξαναγύρνα εδώ
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        localStorage.setItem('returnTo', '/reading/start');
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/reading/start` }
        });
      } else {
        setReady(true);
      }
    });
  }, []);

  const run = async () => {
    setErr(null);
    if (!file) { setErr('Διάλεξε εικόνα φλιτζανιού.'); return; }
    if (!file.type.startsWith('image/')) { setErr('Μόνο εικόνες.'); return; }
    if (file.size > 5 * 1024 * 1024) { setErr('Μέγιστο 5MB.'); return; }

    setBusy(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); setErr('Απαιτείται σύνδεση.'); return; }

    // 1) upload
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const up = await supabase.storage.from('cups').upload(path, file, { upsert: false });
    if (up.error) { setBusy(false); setErr(up.error.message); return; }

    // 2) public URL (για ανάλυση)
    const pub = supabase.storage.from('cups').getPublicUrl(path);
    const imageUrl = pub.data.publicUrl;

    // 3) δημιουργία row reading (μπορούμε να βάλουμε placeholder oracle_text πρώτα)
    const ins = await supabase.from('readings').insert({
      user_id: user.id,
      image_path: path,
      text: 'Δημιουργία χρησμού…'
    }).select('*').single();

    if (ins.error || !ins.data) { setBusy(false); setErr(ins.error?.message || 'Insert failed'); return; }
    const readingId = ins.data.id;

    // 4) (ΠΡΟΣΩΡΙΝΑ) παράγουμε χρησμό στον client ώστε να δεις ροή end-to-end
    // ΣΕ ΠΑΡΑΓΩΓΗ: κάλεσε Supabase Edge Function / server route που μιλά στο OpenAI.
    const fakeOracle = await createFakeOracle(imageUrl);

    // 5) update με τον τελικό χρησμό
    await supabase.from('readings').update({ text: fakeOracle }).eq('id', readingId);

    setBusy(false);
    // 6) μετάβαση στη σελίδα αποτελέσματος
    window.location.href = `/reading/${readingId}`;
  };

  if (!ready) return <div style={{padding:16}}>Έλεγχος σύνδεσης…</div>;

  return (
    <main style={{padding:16}}>
      <h1>Νέα Ανάγνωση</h1>
      <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} disabled={busy}/>
      <button onClick={run} disabled={busy || !file} style={{marginLeft:8}}>
        {busy ? 'Ανάλυση…' : 'Ανάλυση φλιτζανιού'}
      </button>
      {err && <p style={{color:'red'}}>{err}</p>}
      <p style={{marginTop:8,opacity:.7}}>Μετά την ανάλυση θα μεταφερθείς αυτόματα στον χρησμό.</p>
    </main>
  );
}

// ------ προσωρινή "δημιουργία χρησμού" για να δεις τη ροή να δουλεύει ------
async function createFakeOracle(imageUrl: string): Promise<string> {
  // εδώ βάζουμε προσωρινό κείμενο. Σε production κάλεσε Edge Function με OpenAI Vision.
  return `Είδα σημάδια ανανέωσης και τύχης. (demo)\nΕικόνα: ${imageUrl}`;
}