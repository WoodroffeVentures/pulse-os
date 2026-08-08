'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const configured = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent) {
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

  return (
    <div style={{
      minHeight: '100vh', background: '#07090E', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 400, padding: '2.5rem',
        background: '#0B1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
      }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36, background: '#C6A66B', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
          }}>
            <div style={{ width: 10, height: 10, background: '#07090E', borderRadius: '50%' }} />
          </div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#9BA7B8', marginBottom: 4 }}>PULSE OS</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#f1f5f9' }}>Sign in</div>
        </div>

        {!configured && (
          <div style={{
            background: 'rgba(155,109,255,0.1)', border: '1px solid rgba(155,109,255,0.3)',
            borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.5rem',
            fontSize: 12, color: '#c4b5fd', lineHeight: 1.5,
          }}>
            Demo mode — Supabase not connected. Configure <code>.env.local</code> to enable real authentication.
          </div>
        )}

        {sent ? (
          <div style={{ textAlign: 'center', color: '#2BB8A5', fontSize: 14, lineHeight: 1.6 }}>
            Check your email.<br />
            A magic link has been sent to <strong>{email}</strong>.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: 12, color: '#9BA7B8', marginBottom: 6 }}>
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={!configured || loading}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.75rem',
                background: '#07090E', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 6, color: '#f1f5f9', fontSize: 14, marginBottom: '1rem',
                outline: 'none',
              }}
            />
            {error && (
              <div style={{ color: '#f87171', fontSize: 12, marginBottom: '0.75rem' }}>{error}</div>
            )}
            <button
              type="submit"
              disabled={!configured || loading}
              style={{
                width: '100%', padding: '0.65rem', background: '#C6A66B',
                border: 'none', borderRadius: 6, color: '#07090E',
                fontWeight: 600, fontSize: 14, cursor: configured ? 'pointer' : 'not-allowed',
                opacity: configured ? 1 : 0.5,
              }}
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
