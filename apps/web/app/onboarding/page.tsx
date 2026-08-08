'use client';
import { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/client';

type Step = 'identity' | 'evidence' | 'consent' | 'done';

const STEPS: { key: Step; label: string }[] = [
  { key: 'identity', label: '1 · Identity' },
  { key: 'evidence', label: '2 · Evidence' },
  { key: 'consent', label: '3 · Consent' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('identity');
  const [form, setForm] = useState({
    orgName: '', businessName: '', category: 'accommodation', district: '',
    website: '', cipcNumber: '', description: '',
    evidenceType: 'photo', consentGiven: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function field(key: keyof typeof form) {
    return {
      value: form[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(v => ({ ...v, [key]: e.target.value })),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.consentGiven) { setError('Consent is required to proceed.'); return; }
    setSaving(true); setError('');
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError('Sign in required.'); setSaving(false); return; }

        // Create org
        const { data: org, error: orgErr } = await supabase.from('organizations').insert({ name: form.orgName || form.businessName, default_currency: 'ZAR' }).select().single();
        if (orgErr) throw new Error(orgErr.message);

        // Create business profile
        await supabase.from('business_profiles').insert({
          organization_id: org.id,
          business_name: form.businessName,
          verification_status: 'evidence_submitted',
          verified_signals: { cipc_number: form.cipcNumber, description: form.description, website: form.website },
        });

        // Record consent
        await supabase.from('consent_records').insert({
          organization_id: org.id,
          user_id: user.id,
          purpose: 'business_profile_onboarding',
          consent_given: true,
          consent_method: 'web_form',
        });

        await supabase.from('organization_members').insert({ organization_id: org.id, user_id: user.id, role: 'org_owner' });
      }
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
    setSaving(false);
  }

  const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', background: '#07090E', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: '#f1f5f9', padding: '0.6rem 0.75rem', fontSize: 13 };
  const labelStyle: React.CSSProperties = { fontSize: 11, color: '#9BA7B8', display: 'block', marginBottom: 4 };

  if (step === 'done') {
    return (
      <div style={{ minHeight: '100vh', background: '#07090E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
          <div style={{ fontSize: 10, letterSpacing: 4, color: '#2BB8A5', marginBottom: 8 }}>PROFILE SUBMITTED</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Welcome to PULSE</h2>
          <p style={{ color: '#9BA7B8', fontSize: 13, lineHeight: 1.6 }}>
            Your business profile is now pending verification. The PULSE team will review your evidence and contact you within 48 hours.
            {!isSupabaseConfigured() && <><br /><br /><strong style={{ color: '#C6A66B' }}>Demo mode — connect Supabase to persist this registration.</strong></>}
          </p>
          <a href="/dashboard" style={{ display: 'inline-block', marginTop: 24, background: '#C6A66B', color: '#07090E', borderRadius: 6, padding: '0.6rem 1.5rem', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#07090E', fontFamily: 'Inter, sans-serif', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: '#9BA7B8', marginBottom: 4 }}>PULSE OS</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Create your business profile</h1>
          <p style={{ color: '#9BA7B8', fontSize: 13 }}>Three steps. No technical knowledge required.</p>
        </div>

        {/* Step tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
          {STEPS.map(s => (
            <div key={s.key} style={{
              flex: 1, textAlign: 'center', padding: '0.4rem', borderRadius: 6, fontSize: 11, fontWeight: 600,
              background: step === s.key ? 'rgba(198,166,107,0.15)' : '#0B1220',
              color: step === s.key ? '#C6A66B' : '#617089',
              border: `1px solid ${step === s.key ? 'rgba(198,166,107,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}>{s.label}</div>
          ))}
        </div>

        <form onSubmit={step === 'consent' ? handleSubmit : e => { e.preventDefault(); setStep(step === 'identity' ? 'evidence' : 'consent'); }} style={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.75rem' }}>
          {step === 'identity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#C6A66B', marginBottom: 4 }}>Tell us about your business</div>
              <div>
                <label style={labelStyle}>Business name *</label>
                <input required {...field('businessName')} placeholder="e.g. Thabo Mokoena Photography" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Organisation / trading name</label>
                <input {...field('orgName')} placeholder="Leave blank if same as business name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Category *</label>
                <select required style={inputStyle} value={form.category} onChange={e => setForm(v => ({ ...v, category: e.target.value }))}>
                  <option value="accommodation">Accommodation</option>
                  <option value="photography">Photography</option>
                  <option value="food_beverage">Food & Beverage</option>
                  <option value="adventure">Adventure & Guiding</option>
                  <option value="wellness">Wellness & Spa</option>
                  <option value="transport_tours">Transport & Tours</option>
                  <option value="community_enterprise">Community Enterprise</option>
                  <option value="craft_artisan">Craft & Artisan</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>District *</label>
                <input required {...field('district')} placeholder="e.g. Underberg, Himeville, Sani Pass" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Website (optional)</label>
                <input {...field('website')} placeholder="https://" style={inputStyle} />
              </div>
            </div>
          )}

          {step === 'evidence' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#C6A66B', marginBottom: 4 }}>Submit evidence</div>
              <p style={{ fontSize: 12, color: '#9BA7B8', lineHeight: 1.6, margin: 0 }}>
                Evidence improves your viability score and verification status. More evidence = higher scores = better opportunities.
              </p>
              <div>
                <label style={labelStyle}>CIPC registration number (optional)</label>
                <input {...field('cipcNumber')} placeholder="e.g. 2021/123456/07" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Describe your service or product *</label>
                <textarea required value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} rows={4} placeholder="What do you offer? Who benefits? What makes it unique?" style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ background: '#07090E', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 8, padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#9BA7B8', marginBottom: 8 }}>Photo or document upload</div>
                <div style={{ fontSize: 11, color: '#617089' }}>Available after Supabase Storage is connected</div>
                <div style={{ fontSize: 10, color: '#374151', marginTop: 4 }}>Portfolio, brochure, signage photo, registration certificate</div>
              </div>
            </div>
          )}

          {step === 'consent' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#C6A66B', marginBottom: 4 }}>Consent & submission</div>
              <div style={{ background: '#07090E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '1.25rem', fontSize: 12, color: '#9BA7B8', lineHeight: 1.7 }}>
                <strong style={{ color: '#f1f5f9', display: 'block', marginBottom: 8 }}>How PULSE uses your information</strong>
                Your business profile and evidence will be used to:<br />
                • Create a verified profile in the PULSE network<br />
                • Calculate your opportunity viability score<br />
                • Connect you with relevant venue opportunities<br />
                • Present aggregated destination insights to tourism boards (no personal data without additional consent)<br /><br />
                You may request correction or removal at any time. POPIA-aligned. Legal review pending before production data processing.
              </div>
              <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.consentGiven} onChange={e => setForm(v => ({ ...v, consentGiven: e.target.checked }))} style={{ marginTop: 2 }} />
                <span style={{ fontSize: 13, color: '#f1f5f9', lineHeight: 1.5 }}>
                  I consent to PULSE collecting and using my business information as described above.
                </span>
              </label>
              {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}
              {!isSupabaseConfigured() && (
                <div style={{ background: 'rgba(155,109,255,0.1)', border: '1px solid rgba(155,109,255,0.3)', borderRadius: 6, padding: '0.6rem 0.9rem', fontSize: 11, color: '#c4b5fd' }}>
                  Demo mode — data will not be persisted until Supabase is connected.
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: '1.5rem' }}>
            {step !== 'identity' && (
              <button type="button" onClick={() => setStep(step === 'consent' ? 'evidence' : 'identity')}
                style={{ background: 'transparent', color: '#9BA7B8', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '0.6rem 1rem', fontSize: 13, cursor: 'pointer' }}>
                Back
              </button>
            )}
            <button type="submit" disabled={saving}
              style={{ flex: 1, background: '#C6A66B', color: '#07090E', border: 'none', borderRadius: 6, padding: '0.6rem', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Saving…' : step === 'consent' ? 'Submit Profile' : 'Continue →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
