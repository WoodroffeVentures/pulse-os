'use client';
import { useState, useEffect, useCallback } from 'react';
import { useOrg } from '@/lib/context/org-context';
import { createClient } from '@/lib/supabase/client';
import { Map, ArrowRight } from 'lucide-react';

type ParticipationRecord = {
  id: string;
  opportunity_id: string;
  business_profile_id: string;
  status: string;
  evidence: Record<string, unknown>;
  created_at: string;
};

const STATUS_COLOR: Record<string, string> = {
  jv_active:   '#9B6DFF',
  accepted:    '#2BB8A5',
  completed:   '#2BB8A5',
  conditional: '#C6A66B',
  in_review:   '#E8D9A8',
  declined:    '#ef4444',
  identified:  '#617089',
};

export default function GraphPage() {
  const { orgId, orgName, loading } = useOrg();
  const supabase = createClient();
  const [records, setRecords] = useState<ParticipationRecord[]>([]);
  const [fetching, setFetching] = useState(false);

  const load = useCallback(async (oid: string) => {
    setFetching(true);
    const { data } = await supabase
      .from('participation_records')
      .select('*')
      .eq('organization_id', oid)
      .order('created_at', { ascending: false });
    setRecords(data ?? []);
    setFetching(false);
  }, [supabase]);

  useEffect(() => { if (orgId) load(orgId); }, [orgId, load]);

  if (loading) return <div className="p-6 text-[#617089] text-sm">Loading…</div>;

  const byStatus = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF5]">Participation Graph</h1>
        <p className="mt-1 text-sm text-[#9BA7B8]">
          All participation records for {orgName ?? 'your organisation'} — full lifecycle view
        </p>
      </div>

      {records.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(byStatus).map(([status, count]) => (
            <div key={status} className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#08111f] px-3 py-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[status] ?? '#617089' }} />
              <span className="text-[10px] uppercase tracking-widest text-[#617089]">{status.replace(/_/g, ' ')}</span>
              <span className="text-sm font-mono font-semibold text-[#E6EDF5]">{count}</span>
            </div>
          ))}
        </div>
      )}

      {fetching && <div className="text-[#617089] text-sm">Loading…</div>}

      {!fetching && records.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 rounded-xl border border-dashed border-white/10">
          <Map className="w-8 h-8 text-[#374151]" />
          <div className="text-center">
            <p className="text-sm text-[#9BA7B8]">No participation records yet</p>
            <p className="text-xs text-[#617089] mt-1">Records appear when you identify or pitch opportunities</p>
          </div>
        </div>
      )}

      {records.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-widest text-[#617089] px-1 mb-2">All Participation Records</div>
          {records.map(r => {
            const color = STATUS_COLOR[r.status] ?? '#617089';
            const score = r.evidence?.viability_score as number | undefined;
            return (
              <div key={r.id} className="flex items-center gap-4 rounded-lg border border-white/10 bg-[#08111f] px-4 py-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[#9BA7B8]">
                    <span className="font-mono truncate">{r.business_profile_id.slice(0, 8)}…</span>
                    <ArrowRight className="w-3 h-3 flex-shrink-0 text-[#374151]" />
                    <span className="font-mono truncate">{r.opportunity_id.slice(0, 8)}…</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {score !== undefined && (
                    <span className="text-[10px] font-semibold" style={{ color }}>{score}</span>
                  )}
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide"
                    style={{ color, background: `${color}18`, borderColor: `${color}44` }}
                  >
                    {r.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-[#617089]">
                    {new Date(r.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
