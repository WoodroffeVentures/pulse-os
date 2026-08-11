'use client';
import { useState, useEffect } from 'react';
import { listBookings } from '@/lib/queries/bookings';
import { StatusBadge } from '@/components/ui/status-badge';
import { Calendar, Plus, RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useOrg } from '@/lib/context/org-context';



const icalSources = [
  {
    id: 'ical-1',
    property: 'Jackals Rest',
    platform: 'booking_com',
    status: 'success' as const,
    lastSync: '2 hours ago',
    url: 'https://ical.booking.com/v1/export?t=0d8f6bd9...',
  },
  {
    id: 'ical-2',
    property: 'Jackals Rest',
    platform: 'airbnb',
    status: 'success' as const,
    lastSync: '2 hours ago',
    url: 'https://www.airbnb.ae/calendar/ical/53438771.ics...',
  },
  {
    id: 'ical-3',
    property: 'Jackals Rest',
    platform: 'lekkeslaap',
    status: 'pending' as const,
    lastSync: 'Never',
    url: 'https://www.lekkeslaap.co.za/suppliers/icalendar...',
  },
];

const statusFilterOptions = ['All', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];
const sourceFilterOptions = ['All', 'airbnb', 'booking_com', 'lekkeslaap', 'direct'];

function nightsBetween(checkIn: string, checkOut: string) {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BookingsPage() {
  const { orgId } = useOrg();
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [propertyFilter, setPropertyFilter] = useState('All');
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [source, setSource] = useState<'live' | 'demo'>('demo');

  useEffect(() => {
    listBookings(orgId ?? '').then(r => { setAllBookings(r.rows); setProperties(r.properties as any[]); setSource(r.source); }).catch(console.error);
  }, []);

  const filtered = allBookings.filter((b: any) => {
    if (statusFilter !== 'All' && b.status !== statusFilter) return false;
    if (sourceFilter !== 'All' && b.source !== sourceFilter) return false;
    if (propertyFilter !== 'All' && b.property_id !== propertyFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#f1f5f9]">Reservations</h2>
          <p className="text-xs text-[#64748b] mt-0.5">{allBookings.length} total bookings across {properties.length} properties</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3b82f6] text-white text-xs font-medium px-3 py-2 rounded hover:bg-[#2563eb] transition-colors">
          <Plus className="w-3.5 h-3.5" />
          New Booking
        </button>
      </div>

      {/* iCal Sync Panel */}
      <div className="bg-[#111318] border border-[#1e2028] rounded-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2028]">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase">iCal Sync Sources</span>
          </div>
          <button className="text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors">Sync All</button>
        </div>
        <div className="grid grid-cols-3 divide-x divide-[#1e2028]">
          {icalSources.map((src) => (
            <div key={src.id} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <StatusBadge status={src.platform} />
                  <span className="text-[10px] text-[#64748b]">{src.property}</span>
                </div>
                <div className="text-[10px] text-[#374151] truncate">{src.url}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  {src.status === 'success' ? (
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                  ) : (src.status as string) === 'error' ? (
                    <AlertCircle className="w-3 h-3 text-red-400" />
                  ) : (
                    <Clock className="w-3 h-3 text-amber-400" />
                  )}
                  <StatusBadge status={src.status} />
                </div>
                <span className="text-[9px] text-[#374151]">{src.lastSync}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-1.5 outline-none focus:border-[#3b82f6]"
        >
          <option value="All">All Properties</option>
          {properties.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-1.5 outline-none focus:border-[#3b82f6]"
        >
          {statusFilterOptions.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-1.5 outline-none focus:border-[#3b82f6]"
        >
          {sourceFilterOptions.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Sources' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-[#64748b]">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#111318] border border-[#1e2028] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e2028]">
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">Guest</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">Property</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">Check-in</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">Check-out</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">Nights</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">Source</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">Amount</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2028]">
            {filtered.map((b: any) => {
              const prop = properties.find((p: any) => p.id === b.property_id);
              const nights = nightsBetween(b.check_in_date ?? b.check_in, b.check_out_date ?? b.check_out);
              return (
                <tr key={b.id} className="hover:bg-[#161b22] transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-[#f1f5f9]">{b.guest_name ?? (b.guests ? `${b.guests.first_name} ${b.guests.last_name}` : 'Guest')}</div>
                    {(b.adults || b.children) && (
                      <div className="text-[10px] text-[#64748b]">
                        {b.adults ?? 0} adult{(b.adults ?? 0) !== 1 ? 's' : ''}{b.children ? `, ${b.children} child${b.children !== 1 ? 'ren' : ''}` : ''}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#94a3b8]">{prop?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-mono text-[#94a3b8]">{formatDate(b.check_in_date ?? b.check_in)}</td>
                  <td className="px-4 py-3 text-sm font-mono text-[#94a3b8]">{formatDate(b.check_out_date ?? b.check_out)}</td>
                  <td className="px-4 py-3 text-sm font-mono text-[#f1f5f9]">{nights}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.source} /></td>
                  <td className="px-4 py-3 text-sm font-mono text-[#f1f5f9]">
                    {b.total_amount ? `R${b.total_amount.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-[#64748b]">No bookings match the current filters</div>
        )}
      </div>
    </div>
  );
}
