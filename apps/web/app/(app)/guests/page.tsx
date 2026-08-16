'use client';
import { useState, useEffect } from 'react';
import { listGuests } from '@/lib/queries/guests';
import { listProperties } from '@/lib/queries/properties';
import { StatusBadge } from '@/components/ui/status-badge';
import { useOrg } from '@/lib/context/org-context';
import { Users, Search } from 'lucide-react';



function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function GuestsPage() {
  const { orgId } = useOrg();
  const [search, setSearch] = useState('');
  const [guests, setGuests] = useState<any[]>([]);
  const [source, setSource] = useState<'live' | 'demo'>('demo');

  useEffect(() => {
    listGuests(orgId ?? '').then(r => { setGuests(r.rows); setSource(r.source); }).catch(console.error);
  }, []);

  const filtered = guests.filter((g: any) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (g.first_name + ' ' + g.last_name).toLowerCase().includes(q) ||
      g.email?.toLowerCase().includes(q) ||
      g.phone?.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#f1f5f9]">Guest CRM</h2>
          <p className="text-xs text-[#64748b] mt-0.5">{guests.length} guest profiles</p>
        </div>
        <div className="flex items-center gap-2 bg-[#111318] border border-[#1e2028] rounded px-3 py-1.5">
          <Search className="w-3 h-3 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search guests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-[#f1f5f9] placeholder:text-[#9BA7B8] outline-none w-48"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111318] border border-[#1e2028] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e2028]">
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">Guest</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">Contact</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">Stays</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">Last Stay</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">Preferred Property</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2028]">
            {filtered.map((g: any) => {
              return (
                <tr key={g.id} className="hover:bg-[#161b22] transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-[#1e2028] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-[#64748b]">
                          {(g.first_name?.[0] ?? '') + (g.last_name?.[0] ?? '')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#f1f5f9]">
                          {g.first_name} {g.last_name}
                        </div>
                        <div className="text-[10px] text-[#64748b]">{g.country}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-[#94a3b8]">{g.email ?? '—'}</div>
                    <div className="text-[10px] text-[#64748b] mt-0.5">{g.phone ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-mono font-semibold ${
                      (g.total_stays ?? 0) >= 3 ? 'text-amber-400' : 'text-[#f1f5f9]'
                    }`}>
                      {g.total_stays ?? 0}
                    </span>
                    {(g.total_stays ?? 0) >= 3 && (
                      <span className="ml-2 text-[10px] text-amber-400">REPEAT</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-[#94a3b8]">
                    {formatDate(g.last_stay_at)}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#94a3b8]">
                    {(g.preferred_property_name as string | undefined) ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748b] max-w-xs truncate">
                    {g.notes ?? '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-[#64748b]">No guests found</div>
        )}
      </div>
    </div>
  );
}
