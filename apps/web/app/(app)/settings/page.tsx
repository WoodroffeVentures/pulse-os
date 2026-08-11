'use client';
import { useState, useEffect } from 'react';
import { useOrg } from '@/lib/context/org-context';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle2, AlertCircle, MinusCircle } from 'lucide-react';

type StatusLevel = 'connected' | 'manual' | 'error' | 'not_configured';

function StatusRow({ label, status, detail }: { label: string; status: StatusLevel; detail: string }) {
  const cfg: Record<StatusLevel, { icon: typeof CheckCircle2; color: string; badge: string }> = {
    connected:      { icon: CheckCircle2, color: 'text-emerald-400', badge: 'Connected' },
    manual:         { icon: MinusCircle,  color: 'text-[#C6A66B]',   badge: 'Manual / Partial' },
    error:          { icon: AlertCircle,  color: 'text-[#D45D5D]',   badge: 'Error' },
    not_configured: { icon: MinusCircle,  color: 'text-[#617089]',   badge: 'Not Configured' },
  };
  const { icon: Icon, color, badge } = cfg[status];
  return (
    <div className="grid gap-2 px-4 py-3 md:grid-cols-[220px_1fr_160px] items-center">
      <div className="text-xs uppercase tracking-widest text-[#617089]">{label}</div>
      <div className="text-sm text-[#9BA7B8]">{detail}</div>
      <div className={`flex items-center gap-1.5 text-xs font-semibold ${color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { orgId, orgName, orgPlan, user, loading } = useOrg();
  const supabase = createClient();
  const [dbOk, setDbOk] = useState<boolean | null>(null);
  const [storageOk, setStorageOk] = useState<boolean | null>(null);
  const [buildSha] = useState(() => {
    // injected at build time via NEXT_PUBLIC_GIT_SHA or falls back to unknown
    return process.env.NEXT_PUBLIC_GIT_SHA?.slice(0, 7) ?? 'unknown';
  });

  useEffect(() => {
    // Ping database
    supabase.from('organizations').select('id').limit(1)
      .then(({ error }) => setDbOk(!error));

    // Check storage bucket existence
    supabase.storage.listBuckets()
      .then(({ error }) => setStorageOk(!error));
  }, [supabase]);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseReal = supabaseUrl && !supabaseUrl.includes('placeholder') && supabaseUrl !== '';

  const dbStatus: StatusLevel = !isSupabaseReal ? 'not_configured' : dbOk === null ? 'manual' : dbOk ? 'connected' : 'error';
  const storageStatus: StatusLevel = !isSupabaseReal ? 'not_configured' : storageOk === null ? 'manual' : storageOk ? 'connected' : 'manual';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF5]">Settings</h1>
        <p className="mt-1 text-sm text-[#9BA7B8]">Organisation configuration and system status.</p>
      </div>

      {/* Organisation */}
      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <div className="px-4 py-3 border-b border-white/10">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#E6EDF5]">Organisation</span>
        </div>
        <div className="divide-y divide-white/10">
          <div className="grid gap-2 px-4 py-3 md:grid-cols-[220px_1fr]">
            <div className="text-xs uppercase tracking-widest text-[#617089]">Name</div>
            <div className="text-sm text-[#E6EDF5]">{loading ? '…' : (orgName ?? 'Not resolved')}</div>
          </div>
          <div className="grid gap-2 px-4 py-3 md:grid-cols-[220px_1fr]">
            <div className="text-xs uppercase tracking-widest text-[#617089]">Plan</div>
            <div className="text-sm text-[#E6EDF5]">{orgPlan ?? 'Pilot'}</div>
          </div>
          <div className="grid gap-2 px-4 py-3 md:grid-cols-[220px_1fr]">
            <div className="text-xs uppercase tracking-widest text-[#617089]">User</div>
            <div className="text-sm text-[#E6EDF5]">{user?.email ?? '—'}</div>
          </div>
          <div className="grid gap-2 px-4 py-3 md:grid-cols-[220px_1fr]">
            <div className="text-xs uppercase tracking-widest text-[#617089]">Currency</div>
            <div className="text-sm text-[#E6EDF5]">ZAR</div>
          </div>
          <div className="grid gap-2 px-4 py-3 md:grid-cols-[220px_1fr]">
            <div className="text-xs uppercase tracking-widest text-[#617089]">Timezone</div>
            <div className="text-sm text-[#E6EDF5]">Africa/Johannesburg</div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <div className="px-4 py-3 border-b border-white/10">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#E6EDF5]">System Status</span>
          <p className="text-[10px] text-[#617089] mt-0.5">Live checks against your production environment. No fabricated values.</p>
        </div>
        <div className="divide-y divide-white/10">
          <StatusRow
            label="Database"
            status={dbStatus}
            detail={dbOk === null ? 'Checking…' : dbOk ? 'Supabase Postgres — authenticated queries operational' : 'Connection error — check Supabase project status'}
          />
          <StatusRow
            label="Authentication"
            status={user ? 'connected' : 'error'}
            detail={user ? `Signed in as ${user.email}` : 'No authenticated session'}
          />
          <StatusRow
            label="File Storage"
            status={storageStatus}
            detail={storageOk ? 'Supabase Storage — buckets accessible' : 'Storage unavailable — evidence files must be referenced manually'}
          />
          <StatusRow
            label="Google Places"
            status="not_configured"
            detail="Google Places API not connected. Place IDs may be entered manually via Maps URL."
          />
          <StatusRow
            label="Google Ownership Verification"
            status="manual"
            detail="Manual Evidence Only — a public listing match is not proof of ownership. Ownership requires human review."
          />
          <StatusRow
            label="Analytics"
            status="manual"
            detail="Internal records only — counts come from your Supabase database. No external analytics service configured."
          />
          <StatusRow
            label="AI / Viability Engine"
            status="connected"
            detail="Rules-based engine active (rules-based-v1). Deterministic, explainable, no external AI API required."
          />
          <StatusRow
            label="Email Invitations"
            status="manual"
            detail="Controlled pilot only — external SMTP not configured. Owner accounts are provisioned directly."
          />
        </div>
      </div>

      {/* Production version */}
      <div className="rounded-lg border border-white/10 bg-[#08111f] px-4 py-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-[#617089]">Production Version</span>
        <span className="font-mono text-xs text-[#9BA7B8]">{buildSha}</span>
      </div>

      {/* Governance */}
      <div className="text-[10px] text-[#374151] text-center tracking-widest py-2">
        AI ASSISTS · HUMANS GOVERN · EVIDENCE DECIDES · NO ECONOMIC VALUES FABRICATED
      </div>
    </div>
  );
}
