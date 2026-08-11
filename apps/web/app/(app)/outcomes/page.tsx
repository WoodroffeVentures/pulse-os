'use client';
import { useState, useEffect, useCallback } from 'react';
import { useOrg } from '@/lib/context/org-context';
import { createClient } from '@/lib/supabase/client';
import { TrendingUp, Plus, X, Calendar, DollarSign } from 'lucide-react';

type Outcome = {
  id: string;
  opportunity_id: string;
  business_profile_id: string;
  status: string;
  evidence: Record<string, unknown>;
  updated_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  jv_active: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  accepted:  'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  conditional: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  declined:  'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function OutcomesPage() {
  const { orgId, loading } = useOrg();
  const supabase = createClient();
  const [records, setRecords] = useState<Outcome[]>([]);
  const [fetching, setFetching] = useState(false);

  const load = useCallback(async (oid: string) => {
    setFetching(true);
    const { data } = await supabase
      .from('participation_records')
      .select('*')
      .eq('organization_id', oid)
      .in('status', ['accepted', 'jv_active', 'completed', 'conditional'])
      .order('updated_at', { ascending: false });
    setRecords(data ?? []);
    setFetching(false);
  }, [supabase]);

  useEffect(() => { if (orgId) load(orgId); }, [orgId, load]);

  if (loading) return <div className="p-6 text-[#617089] text-sm">Loading…</div>;

  const totalRevShare = records.reduce((sum, r) => sum + ((r.evidence?.revenue_share_proposer as number) ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF5]">Outcomes</h1>
        <p className="mt-1 text-sm text-[#9BA7B8]">
          Accepted, active, and completed opportunity participations
        </p>
      </div>

      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 bg-[#08111f] p-4">
            <div className="text-[10px] uppercase tracking-widest text-[#617089] mb-1">Participations</div>
            <div className="text-2xl font-mono font-semibold text-[#E6EDF5]">{records.length}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#08111f] p-4">
            <div className="text-[10px] uppercase tracking-widest text-[#617089] mb-1">JV Active</div>
            <div className="text-2xl font-mono font-semibold text-purple-400">
              {records.filter(r => r.status === 'jv_active').length}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#08111f] p-4">
            <div className="text-[10px] uppercase tracking-widest text-[#617089] mb-1">Avg Rev Share</div>
            <div className="text-2xl font-mono font-semibold text-[#C6A66B]">
              {records.length > 0 ? `${Math.round(totalRevShare / records.length)}%` : '—'}
            </div>
          </div>
        </div>
      )}

      {fetching && <div className="text-[#617089] text-sm">Loading…</div>}

      {!fetching && records.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 rounded-xl border border-dashed border-white/10">
          <TrendingUp className="w-8 h-8 text-[#374151]" />
          <div className="text-center">
            <p className="text-sm text-[#9BA7B8]">No outcomes yet</p>
            <p className="text-xs text-[#617089] mt-1">Accepted and active opportunities will appear here</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {records.map(r => {
          const score = r.evidence?.viability_score as number | undefined;
          const revShare = r.evidence?.revenue_share_proposer as number | undefined;
          return (
            <div key={r.id} className="rounded-xl border border-white/10 bg-[#08111f] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-widest ${STATUS_COLORS[r.status] ?? 'text-[#617089] bg-white/5 border-white/10'}`}>
                      {r.status.replace(/_/g, ' ')}
                    </span>
                    {score !== undefined && (
                      <span className="text-[10px] font-semibold text-[#C6A66B]">Score {score}</span>
                    )}
                  </div>
                  <p className="text-xs text-[#9BA7B8] font-mono">
                    Opp: {r.opportunity_id.slice(0, 8)}… · Biz: {r.business_profile_id.slice(0, 8)}…
                  </p>
                  {r.evidence?.conditions != null && (
                    <p className="text-xs text-[#C6A66B]">Condition: {String(r.evidence.conditions)}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  {revShare !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-emerald-400">
                      <DollarSign className="w-3 h-3" />{revShare}% rev share
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[10px] text-[#617089] mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(r.updated_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
