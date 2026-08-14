'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';
import { useRouter } from 'next/navigation';

type Mode = 'magic' | 'password';

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const configured = isSupabaseConfigured();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push('/dashboard');
  }

  const s = {
    wrap: {
      minHeight: '100vh', background: '#07090E', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif',
    } as React.CSSProperties,
    card: {
      width: '100%', maxWidth: 400, padding: '2.5rem',
      background: '#0B1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
    } as React.CSSProperties,
    input: {
      width: '100%', boxSizing: 'border-box' as const, padding: '0.6rem 0.75rem',
      background: '#07090E', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 6, color: '#f1f5f9', fontSize: 14, marginBottom: '1rem', outline: 'none',
    } as React.CSSProperties,
    label: { display: 'block', fontSize: 12, color: '#9BA7B8', marginBottom: 6 } as React.CSSProperties,
    btn: {
      width: '100%', padding: '0.65rem', borderRadius: 6, border: 'none',
      background: 'linear-gradient(135deg,#D4B87A,#C6A66B)', color: '#07090E',
      fontWeight: 700, fontSize: 14, cursor: 'pointer',
    } as React.CSSProperties,
  };

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        {/* Logo */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, background: '#C6A66B', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <div style={{ width: 10, height: 10, background: '#07090E', borderRadius: '50%' }} />
          </div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#9BA7B8', marginBottom: 4 }}>PULSE OS</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#f1f5f9' }}>Sign in</div>
        </div>

        {!configured && (
          <div style={{ background: 'rgba(155,109,255,0.1)', border: '1px solid rgba(155,109,255,0.3)', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: 12, color: '#c4b5fd', lineHeight: 1.5 }}>
            Demo mode — Supabase not connected.
          </div>
        )}

        {/* Mode toggle */}
        <div style={{ display: 'flex', marginBottom: '1.5rem', background: '#07090E', borderRadius: 8, padding: 3, border: '1px solid rgba(255,255,255,0.08)' }}>
          {(['magic', 'password'] as Mode[]).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSent(false); }}
              style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                background: mode === m ? 'rgba(198,166,107,0.15)' : 'transparent',
                color: mode === m ? '#C6A66B' : '#617089',
              }}>
              {m === 'magic' ? 'Magic Link' : 'Password'}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: 'rgba(212,93,93,0.1)', border: '1px solid rgba(212,93,93,0.3)', borderRadius: 8, padding: '0.6rem 0.9rem', marginBottom: '1rem', fontSize: 13, color: '#f87171' }}>
            {error}
          </div>
        )}

        {mode === 'magic' ? (
          sent ? (
            <div style={{ textAlign: 'center', color: '#2BB8A5', fontSize: 14, lineHeight: 1.6 }}>
              Check your email.<br />A magic link has been sent to <strong>{email}</strong>.
            </div>
          ) : (
            <form onSubmit={handleMagicLink}>
              <label style={s.label}>Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" disabled={!configured || loading} style={s.input} />
              <button type="submit" disabled={!configured || loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Sending…' : 'Send magic link →'}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handlePassword}>
            <label style={s.label}>Email address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" disabled={!configured || loading} style={s.input} />
            <label style={s.label}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" disabled={!configured || loading} style={s.input} />
            <button type="submit" disabled={!configured || loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a href="/" style={{ fontSize: 12, color: '#617089', textDecoration: 'none' }}>← Back to PULSE OS</a>
        </div>
      </div>
    </div>
  );
}
