// src/pages/MyReadings.tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { SignInWithGoogle, SignOut } from '@/components/AuthButtons';

type Reading = {
  id: string;
  image_path: string;
  oracle_text: string | null;
  tts_path: string | null;
  created_at: string; // ISO
  user_id: string;
};

export default function MyReadings() {
  const [sessionReady, setSessionReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  // helper: public URL for cups image
  const urlFor = (path: string) =>
    supabase.storage.from('cups').getPublicUrl(path).data.publicUrl;

  useEffect(() => {
    // 1) Ensure session
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      setUserId(uid);
      setSessionReady(true);
    });

    // 2) React to auth changes (optional)
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      const uid = s?.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setItems([]);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Fetch readings (current user)
  useEffect(() => {
    if (!sessionReady) return;
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      const { data, error } = await supabase
        .from('readings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (cancelled) return;
      if (error) {
        setErr(error.message);
        setItems([]);
      } else {
        setItems((data as Reading[]) ?? []);
      }
      setLoading(false);
    })();

    // Realtime updates on this user's readings
    const chan = supabase
      .channel('readings-self')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'readings', filter: `user_id=eq.${userId}` },
        async () => {
          // simple refetch to keep logic clean
          const { data, error } = await supabase
            .from('readings')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
          if (!error) setItems((data as Reading[]) ?? []);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(chan);
    };
  }, [sessionReady, userId]);

  const content = useMemo(() => {
    if (!userId) {
      return (
        <div style={{ padding: 16 }}>
          <p>Πρέπει να συνδεθείς για να δεις τα readings σου.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <SignInWithGoogle />
            <SignOut />
          </div>
        </div>
      );
    }

    if (loading) return <div style={{ padding: 16 }}>Φόρτωση…</div>;
    if (err) return <div style={{ padding: 16, color: 'red' }}>{err}</div>;
    if (!items.length)
      return <div style={{ padding: 16 }}>Δεν υπάρχουν ακόμη αναγνώσεις.</div>;

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
          padding: 16,
        }}
      >
        {items.map((r) => {
          const img = urlFor(r.image_path);
          const date = new Date(r.created_at);
          const subtitle =
            r.oracle_text?.slice(0, 90)?.trim() + (r.oracle_text && r.oracle_text.length > 90 ? '…' : '');

          return (
            <button
              key={r.id}
              onClick={() => navigate(`/reading/${r.id}`)}
              style={{
                textAlign: 'left',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                background: 'white',
                padding: 10,
                cursor: 'pointer',
              }}
            >
              <img
                src={img}
                alt="cup"
                style={{
                  width: '100%',
                  height: 140,
                  objectFit: 'cover',
                  borderRadius: 8,
                  marginBottom: 8,
                  display: 'block',
                }}
              />
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                {date.toLocaleDateString('el-GR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div style={{ fontSize: 13, color: '#374151', whiteSpace: 'pre-wrap' }}>
                {subtitle || '—'}
              </div>
            </button>
          );
        })}
      </div>
    );
  }, [userId, loading, err, items, navigate]);

  return (
    <main>
      <header style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Τα Readings μου</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <SignInWithGoogle />
          <SignOut />
        </div>
      </header>
      {content}
    </main>
  );
}
