'use client';
import { useState, useEffect } from 'react';
import { listReservations, type Reservation } from '@/lib/queries/reservations';
import { LogIn, LogOut, Clock, DollarSign, Users, AlertCircle, CheckCircle2, Phone, Mail } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  confirmed:    'bg-blue-500/80 border-blue-400/50 text-white',
  deposit_paid: 'bg-indigo-500/80 border-indigo-400/50 text-white',
  fully_paid:   'bg-emerald-500/80 border-emerald-400/50 text-white',
  checked_in:   'bg-green-500/80 border-green-400/50 text-white',
  checked_out:  'bg-gray-500/40 border-gray-400/30 text-gray-300',
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed', deposit_paid: 'Deposit Paid', fully_paid: 'Fully Paid',
  checked_in: 'In House', checked_out: 'Checked Out',
};

function fmt(d: Date) { return d.toISOString().split('T')[0]; }
function nightCount(ci: string, co: string) {
  return Math.max(0, (new Date(co + 'T00:00:00').getTime() - new Date(ci + 'T00:00:00').getTime()) / 86400000);
}

export default function FrontDeskPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [source, setSource] = useState<'live' | 'demo'>('demo');
  const [now] = useState(new Date());

  const todayStr = fmt(now);
  const tomorrowStr = fmt(new Date(now.getTime() + 86400000));

  useEffect(() => {
    listReservations()
      .then((r) => { setReservations(r.rows as Reservation[]); setSource(r.source); })
      .catch(console.error);
  }, []);

  const arrivingToday = reservations.filter(
    (r) => r.check_in_date === todayStr && ['confirmed', 'deposit_paid', 'fully_paid'].includes(r.status)
  );
  const inHouse = reservations.filter((r) => r.status === 'checked_in');
  const departingToday = reservations.filter(
    (r) => r.check_out_date === todayStr && r.status === 'checked_in'
  );
  const arrivingTomorrow = reservations.filter(
    (r) => r.check_in_date === tomorrowStr && ['confirmed', 'deposit_paid', 'fully_paid'].includes(r.status)
  );
  const pendingBalance = reservations.filter(
    (r) => r.outstanding_balance > 0 && !['cancelled', 'no_show', 'voided', 'checked_out'].includes(r.status)
  );

  const totalOutstanding = pendingBalance.reduce((s, r) => s + r.outstanding_balance, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#f1f5f9]">Front Desk</h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            {now.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ·{' '}
            <span className={source === 'live' ? 'text-emerald-400' : 'text-amber-400'}>{source}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalOutstanding > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-1.5">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span className="text-xs text-amber-400 font-semibold">
                ZAR {totalOutstanding.toLocaleString()} outstanding
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-5 gap-3">
        <KPICard label="Arriving Today" value={arrivingToday.length} color="blue" />
        <KPICard label="In House" value={inHouse.length} color="green" />
        <KPICard label="Departing Today" value={departingToday.length} color="gray" />
        <KPICard label="Arriving Tomorrow" value={arrivingTomorrow.length} color="indigo" />
        <KPICard label="Pending Payment" value={pendingBalance.length} color="amber" />
      </div>

      {/* Main content: 3 columns */}
      <div className="grid grid-cols-3 gap-4">
        {/* Arriving today */}
        <div className="col-span-1">
          <SectionHeader icon={<LogIn className="w-3.5 h-3.5 text-blue-400" />} title="Arriving Today" count={arrivingToday.length} />
          <div className="space-y-2 mt-2">
            {arrivingToday.length === 0 ? (
              <EmptyState msg="No arrivals today" />
            ) : (
              arrivingToday.map((r) => (
                <GuestCard key={r.id} reservation={r} action="check_in" onAction={() => {}} />
              ))
            )}
          </div>
        </div>

        {/* In house */}
        <div className="col-span-1">
          <SectionHeader icon={<Clock className="w-3.5 h-3.5 text-green-400" />} title="In House" count={inHouse.length} />
          <div className="space-y-2 mt-2">
            {inHouse.length === 0 ? (
              <EmptyState msg="No guests currently in house" />
            ) : (
              inHouse.map((r) => (
                <GuestCard key={r.id} reservation={r} action={r.check_out_date === todayStr ? 'check_out' : 'none'} onAction={() => {}} />
              ))
            )}
          </div>
        </div>

        {/* Departing + balance */}
        <div className="col-span-1 space-y-4">
          <div>
            <SectionHeader icon={<LogOut className="w-3.5 h-3.5 text-gray-400" />} title="Departing Today" count={departingToday.length} />
            <div className="space-y-2 mt-2">
              {departingToday.length === 0 ? (
                <EmptyState msg="No departures today" />
              ) : (
                departingToday.map((r) => (
                  <GuestCard key={r.id} reservation={r} action="check_out" onAction={() => {}} />
                ))
              )}
            </div>
          </div>

          {/* Outstanding payments */}
          {pendingBalance.length > 0 && (
            <div>
              <SectionHeader icon={<DollarSign className="w-3.5 h-3.5 text-amber-400" />} title="Outstanding Balances" count={pendingBalance.length} />
              <div className="space-y-2 mt-2">
                {pendingBalance.map((r) => (
                  <div key={r.id} className="bg-[#111318] border border-amber-500/20 rounded-lg px-3 py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-[#f1f5f9] truncate">{r.guest_name}</div>
                      <div className="text-[10px] text-[#64748b] mt-0.5">{r.property_name}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold text-amber-400">
                        ZAR {r.outstanding_balance.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-[#64748b] mt-0.5">{STATUS_LABELS[r.status] ?? r.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Arriving tomorrow preview */}
      {arrivingTomorrow.length > 0 && (
        <div>
          <SectionHeader icon={<LogIn className="w-3.5 h-3.5 text-indigo-400" />} title="Arriving Tomorrow" count={arrivingTomorrow.length} />
          <div className="grid grid-cols-3 gap-3 mt-2">
            {arrivingTomorrow.map((r) => (
              <GuestCard key={r.id} reservation={r} action="none" onAction={() => {}} compact />
            ))}
          </div>
        </div>
      )}

      {/* All in-house detail table */}
      {inHouse.length > 0 && (
        <div className="bg-[#111318] border border-[#1e2028] rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#1e2028]">
            <h3 className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase">In-House Register</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e2028]">
                {['Guest', 'Property', 'Checked In', 'Departs', 'Nights Left', 'Balance', 'Source'].map((h) => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2028]">
              {inHouse.map((r) => {
                const nightsLeft = nightCount(todayStr, r.check_out_date);
                return (
                  <tr key={r.id} className="hover:bg-[#161b22] transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium text-[#f1f5f9]">{r.guest_name}</div>
                      <div className="text-[10px] text-[#64748b] mt-0.5">{r.adults}A{r.children ? ` ${r.children}C` : ''}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#94a3b8]">{r.property_name}</td>
                    <td className="px-4 py-3 text-xs font-mono text-[#94a3b8]">{r.check_in_date}</td>
                    <td className="px-4 py-3 text-xs font-mono text-[#94a3b8]">{r.check_out_date}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${nightsLeft <= 1 ? 'text-amber-400' : 'text-[#f1f5f9]'}`}>
                        {nightsLeft}n
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono font-semibold ${r.outstanding_balance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        ZAR {r.outstanding_balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] text-[#64748b]">{r.channel_code?.replace(/_/g, '.')}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KPICard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-400', green: 'text-emerald-400', gray: 'text-gray-400',
    indigo: 'text-indigo-400', amber: 'text-amber-400',
  };
  return (
    <div className="bg-[#111318] border border-[#1e2028] rounded-lg px-4 py-3">
      <div className={`text-2xl font-bold ${colorMap[color] ?? 'text-[#f1f5f9]'}`}>{value}</div>
      <div className="text-[10px] text-[#64748b] mt-0.5">{label}</div>
    </div>
  );
}

function SectionHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase">{title}</span>
      <span className="text-[10px] text-[#64748b] bg-[#1e2028] px-1.5 py-0.5 rounded-full">{count}</span>
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="bg-[#111318] border border-[#1e2028] rounded-lg px-4 py-4 text-xs text-[#64748b] text-center">
      <CheckCircle2 className="w-4 h-4 text-[#1e2028] mx-auto mb-1" />
      {msg}
    </div>
  );
}

function GuestCard({ reservation: r, action, onAction, compact = false }: {
  reservation: Reservation;
  action: 'check_in' | 'check_out' | 'none';
  onAction: () => void;
  compact?: boolean;
}) {
  const nights = nightCount(r.check_in_date, r.check_out_date);
  return (
    <div className="bg-[#111318] border border-[#1e2028] rounded-lg px-3 py-3 hover:border-[#374151] transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-[#f1f5f9] truncate">{r.guest_name}</div>
          <div className="text-[10px] text-[#64748b] mt-0.5">{r.property_name}</div>
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 ${STATUS_COLORS[r.status] ?? ''}`}>
          {STATUS_LABELS[r.status] ?? r.status}
        </span>
      </div>

      {!compact && (
        <div className="space-y-1 mb-2">
          <div className="flex items-center gap-1.5 text-[10px] text-[#64748b]">
            <Users className="w-3 h-3" />
            {r.adults}A{r.children ? ` ${r.children}C` : ''} · {nights}n ·{' '}
            <span className="text-[#94a3b8]">{r.check_in_date} → {r.check_out_date}</span>
          </div>
          {r.outstanding_balance > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] text-amber-400">
              <DollarSign className="w-3 h-3" />
              ZAR {r.outstanding_balance.toLocaleString()} outstanding
            </div>
          )}
          {r.special_requests && (
            <div className="flex items-start gap-1.5 text-[10px] text-amber-300">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{r.special_requests}</span>
            </div>
          )}
        </div>
      )}

      {!compact && r.guest_email && (
        <div className="flex items-center gap-1.5 text-[10px] text-[#64748b] mb-2">
          <Mail className="w-3 h-3" /> {r.guest_email}
        </div>
      )}

      {action !== 'none' && (
        <button
          onClick={onAction}
          className={`w-full py-1.5 text-[10px] font-semibold rounded transition-colors ${
            action === 'check_in'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
          }`}
        >
          {action === 'check_in' ? 'Check In' : 'Check Out'}
        </button>
      )}
    </div>
  );
}
