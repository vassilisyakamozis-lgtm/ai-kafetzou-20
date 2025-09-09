'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function CupUpload() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(null); setErr(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setErr('Μόνο εικόνες επιτρέπονται.');
    if (file.size > 5 * 1024 * 1024) return setErr('Μέγιστο 5MB.');

    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return setErr('Απαραίτητη η σύνδεση (Google).'); }

    const path = `${user.id}/${Date.now()}_${file.name}`;
    const up = await supabase.storage.from('cups').upload(path, file, { upsert: false });
    if (up.error) { setBusy(false); return setErr(up.error.message); }

    const ins = await supabase.from('readings').insert({ user_id: user.id, image_path: path });
    if (ins.error) { setBusy(false); return setErr(ins.error.message); }

    setBusy(false);
    setMsg('Το ανέβασμα ολοκληρώθηκε.');
    e.currentTarget.value = '';
  };

  return (
    <div style={{marginTop:12}}>
      <input type="file" accept="image/*" onChange={onChange} disabled={busy}/>
      {busy && <p>Ανέβασμα…</p>}
      {msg && <p>{msg}</p>}
      {err && <p style={{color:'red'}}>{err}</p>}
    </div>
  );
}