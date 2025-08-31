'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Reading = {
  id: string;
  image_path: string;
  text: string | null;
  tts_url: string | null;
  created_at: string;
};

export default function ReadingDetail() {
  const [reading, setReading] = useState<Reading|null>(null);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id') || '';
    if (!id) { setErr('Λείπει το id.'); return; }

    (async () => {
      const { data, error } = await supabase.from('readings').select('*').eq('id', id).single();
      if (error) { setErr(error.message); return; }
      setReading(data as Reading);
    })();
  }, []);

  if (err) return <div style={{padding:16,color:'red'}}>{err}</div>;
  if (!reading) return <div style={{padding:16}}>Φόρτωση…</div>;

  const imageUrl = supabase.storage.from('cups').getPublicUrl(reading.image_path).data.publicUrl;
  const ttsUrl = reading.tts_url
    ? supabase.storage.from('tts').getPublicUrl(reading.tts_url).data.publicUrl
    : null;

  return (
    <main style={{padding:16}}>
      <h1>Ο χρησμός σου</h1>
      <img src={imageUrl} alt="cup" style={{maxWidth:360, display:'block', marginBottom:12}} />
      <pre style={{whiteSpace:'pre-wrap', fontFamily:'inherit'}}>{reading.text || '…'}</pre>
      {ttsUrl && (
        <audio controls src={ttsUrl} style={{marginTop:12}}/>
      )}
      <a href="/my-readings" style={{display:'inline-block', marginTop:16}}>⬅ Πίσω στα Readings</a>
    </main>
  );
}