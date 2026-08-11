'use client';
import { useState, useEffect, useCallback } from 'react';
import { listReservations, listRoomTypes, type Reservation, type RoomType } from '@/lib/queries/reservations';
import { listProperties } from '@/lib/queries/properties';
import { useOrg } from '@/lib/context/org-context';
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Users, DollarSign, Clock } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  confirmed:    'bg-blue-500/80 border-blue-400/50 text-white',
  deposit_paid: 'bg-indigo-500/80 border-indigo-400/50 text-white',
  fully_paid:   'bg-emerald-500/80 border-emerald-400/50 text-white',
  checked_in:   'bg-green-500/80 border-green-400/50 text-white',
  checked_out:  'bg-gray-500/40 border-gray-400/30 text-gray-300',
  cancelled:    'bg-red-500/20 border-red-400/20 text-red-400 line-through',
  no_show:      'bg-orange-500/30 border-orange-400/30 text-orange-300',
  hold:         'bg-amber-500/30 border-amber-400/30 text-amber-300',
  quote:        'bg-gray-500/20 border-gray-400/20 text-gray-400',
  voided:       'bg-gray-500/10 border-gray-400/10 text-gray-500',
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed', deposit_paid: 'Deposit Paid', fully_paid: 'Paid',
  checked_in: 'In House', checked_out: 'Checked Out', cancelled: 'Cancelled',
  no_show: 'No Show', hold: 'Hold', quote: 'Quote', voided: 'Voided',
};

const CHANNEL_BADGE: Record<string, string> = {
  airbnb: 'bg-rose-500/20 text-rose-300',
  booking_com: 'bg-blue-600/20 text-blue-300',
  lekke_slaap: 'bg-orange-500/20 text-orange-300',
  direct: 'bg-emerald-500/20 text-emerald-300',
  phone: 'bg-emerald-500/20 text-emerald-300',
  walk_in: 'bg-teal-500/20 text-teal-300',
  expedia: 'bg-yellow-500/20 text-yellow-300',
};

function fmt(d: Date) { return d.toISOString().split('T')[0]; }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function parseDate(s: string) { return new Date(s + 'T00:00:00'); }
function nightCount(ci: string, co: string) {
  return Math.max(0, (parseDate(co).getTime() - parseDate(ci).getTime()) / 86400000);
}

export default function ReservationCalendarPage() {
  const { orgId } = useOrg();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [viewStart, setViewStart] = useState<Date>(() => {
    const d = new Date(); d.setDate(d.getDate() - 3); return d;
  });
  const [viewDays] = useState(28);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [source, setSource] = useState<'live' | 'demo'>('demo');
  const [isNewOpen, setIsNewOpen] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    Promise.all([listReservations(), listProperties(orgId)])
      .then(([res, props]) => {
        setReservations(res.rows as Reservation[]);
        setSource(res.source);
        setProperties(props.rows);
        if (props.rows.length > 0) setSelectedProperty('all');
      })
      .catch(console.error);
  }, []);

  // Derive room type list from filtered properties
  const filteredRoomTypes = roomTypes.length > 0
    ? roomTypes
    : properties.map((p: any) => ({ id: p.id, property_id: p.id, name: p.name, code: p.type, max_occupancy: 4, is_active: true }));

  // For display: use properties as "rooms" when no room_types table yet
  const displayRows = selectedProperty === 'all'
    ? properties
    : properties.filter((p: any) => p.id === selectedProperty);

  // Build date columns
  const dateColumns: Date[] = Array.from({ length: viewDays }, (_, i) => addDays(viewStart, i));

  // Map reservations onto rows (property = row in this view)
  const getResForRow = useCallback((propId: string, date: Date) => {
    const d = fmt(date);
    return reservations.filter((r) => {
      if (selectedProperty !== 'all' && r.property_id !== propId) return false;
      if (r.property_id !== propId) return false;
      return r.check_in_date <= d && r.check_out_date > d;
    });
  }, [reservations, selectedProperty]);

  // Find reservation that starts on a given date (for rendering bar start)
  const getResStartingOn = useCallback((propId: string, date: Date) => {
    const d = fmt(date);
    return reservations.filter((r) => r.property_id === propId && r.check_in_date === d);
  }, [reservations]);

  const todayStr = fmt(new Date());

  return (
    <div className="space-y-4 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#f1f5f9]">Reservation Calendar</h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            {reservations.filter(r => ['confirmed','deposit_paid','fully_paid','checked_in'].includes(r.status)).length} active ·{' '}
            <span className={source === 'live' ? 'text-emerald-400' : 'text-amber-400'}>{source}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Property filter */}
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-2 py-1.5 outline-none"
          >
            <option value="all">All Properties</option>
            {properties.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {/* Week nav */}
          <button
            onClick={() => setViewStart(v => addDays(v, -7))}
            className="p-1.5 bg-[#111318] border border-[#1e2028] rounded hover:bg-[#1e2028] transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#64748b]" />
          </button>
          <button
            onClick={() => { const d = new Date(); d.setDate(d.getDate() - 3); setViewStart(d); }}
            className="px-2 py-1.5 bg-[#111318] border border-[#1e2028] text-xs text-[#64748b] rounded hover:bg-[#1e2028] transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setViewStart(v => addDays(v, 7))}
            className="p-1.5 bg-[#111318] border border-[#1e2028] rounded hover:bg-[#1e2028] transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 text-[#64748b]" />
          </button>
          <button
            onClick={() => setIsNewOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C6A66B] text-[#020912] text-xs font-semibold rounded hover:bg-[#D4B47A] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Reservation
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#111318] border border-[#1e2028] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            {/* Date header */}
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-[#111318] border-b border-r border-[#1e2028] px-3 py-2 text-left w-36">
                  <span className="text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">Unit / Room</span>
                </th>
                {dateColumns.map((d) => {
                  const isToday = fmt(d) === todayStr;
                  const dayName = d.toLocaleDateString('en-ZA', { weekday: 'short' });
                  const dayNum = d.getDate();
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <th
                      key={fmt(d)}
                      className={`border-b border-r border-[#1e2028] px-1 py-2 text-center min-w-[36px] ${
                        isToday ? 'bg-[#C6A66B]/10' : isWeekend ? 'bg-[#08111f]' : ''
                      }`}
                    >
                      <div className={`text-[9px] font-medium ${isToday ? 'text-[#C6A66B]' : 'text-[#374151]'}`}>{dayName}</div>
                      <div className={`text-xs font-bold ${isToday ? 'text-[#C6A66B]' : isWeekend ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>{dayNum}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {displayRows.map((prop: any) => {
                // Collect all reservations for this property in the view window
                const propReservations = reservations.filter((r) => {
                  if (r.property_id !== prop.id) return false;
                  const ciDate = fmt(viewStart);
                  const coDate = fmt(addDays(viewStart, viewDays));
                  return r.check_out_date > ciDate && r.check_in_date < coDate;
                });

                return (
                  <tr key={prop.id} className="group border-b border-[#1e2028] last:border-0">
                    {/* Row header */}
                    <td className="sticky left-0 z-10 bg-[#111318] border-r border-[#1e2028] px-3 py-3">
                      <div className="text-xs font-medium text-[#f1f5f9] leading-tight">{prop.name}</div>
                      <div className="text-[10px] text-[#64748b] mt-0.5">{prop.property_type || prop.type}</div>
                    </td>

                    {/* Day cells */}
                    {dateColumns.map((d) => {
                      const dStr = fmt(d);
                      const isToday = dStr === todayStr;
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                      // Find reservations that start on this date for this property
                      const startingHere = propReservations.filter((r) => r.check_in_date === dStr);
                      // Find reservations that span this date (not starting here)
                      const spanningHere = propReservations.filter((r) => r.check_in_date < dStr && r.check_out_date > dStr);
                      // Find reservations that end today (check-out)
                      const endingHere = propReservations.filter((r) => r.check_out_date === dStr);

                      const allActive = propReservations.filter((r) =>
                        r.check_in_date <= dStr && r.check_out_date > dStr
                      );

                      return (
                        <td
                          key={dStr}
                          className={`border-r border-[#1e2028] px-0.5 py-1 min-w-[36px] h-14 align-top relative ${
                            isToday ? 'bg-[#C6A66B]/5' : isWeekend ? 'bg-[#08111f]/50' : ''
                          }`}
                        >
                          {startingHere.map((res) => {
                            const nights = nightCount(res.check_in_date, res.check_out_date);
                            // Calculate how many columns this bar spans (capped at viewDays remaining)
                            const colsLeft = dateColumns.findIndex((c) => fmt(c) === dStr);
                            const colsAvailable = viewDays - colsLeft;
                            const barCols = Math.min(nights, colsAvailable);

                            return (
                              <button
                                key={res.id}
                                onClick={() => setSelected(res)}
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  left: '2px',
                                  width: `calc(${barCols * 100}% + ${(barCols - 1) * 1}px)`,
                                  minWidth: '60px',
                                  zIndex: 5,
                                }}
                                className={`text-left px-2 py-0.5 rounded border text-[10px] font-medium truncate leading-tight ${
                                  STATUS_COLORS[res.status] ?? 'bg-blue-500/80 border-blue-400/50 text-white'
                                } hover:opacity-90 transition-opacity`}
                                title={`${res.guest_name} · ${res.check_in_date} → ${res.check_out_date} · ${res.status}`}
                              >
                                {res.guest_name?.split(' ')[0]}
                              </button>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {displayRows.length === 0 && (
                <tr>
                  <td colSpan={viewDays + 1} className="px-4 py-8 text-center text-sm text-[#64748b]">
                    No properties found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(STATUS_LABELS).slice(0, 6).map(([status, label]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded border ${STATUS_COLORS[status]}`} />
            <span className="text-[10px] text-[#64748b]">{label}</span>
          </div>
        ))}
      </div>

      {/* Upcoming arrivals quick list */}
      <div className="grid grid-cols-2 gap-4">
        <UpcomingList reservations={reservations} title="Arrivals (next 7 days)" type="arrivals" />
        <UpcomingList reservations={reservations} title="Departures (next 7 days)" type="departures" />
      </div>

      {/* Reservation detail drawer */}
      {selected && (
        <ReservationDetail reservation={selected} onClose={() => setSelected(null)} />
      )}

      {/* New reservation modal */}
      {isNewOpen && (
        <NewReservationModal
          properties={properties}
          onClose={() => setIsNewOpen(false)}
          onCreated={(r) => { setReservations(prev => [r, ...prev]); setIsNewOpen(false); }}
        />
      )}
    </div>
  );
}

// ─── Upcoming list ────────────────────────────────────────────────────────────

function UpcomingList({ reservations, title, type }: {
  reservations: Reservation[];
  title: string;
  type: 'arrivals' | 'departures';
}) {
  const today = new Date();
  const in7 = addDays(today, 7);
  const todayStr = fmt(today);
  const in7Str = fmt(in7);

  const filtered = reservations
    .filter((r) => {
      const d = type === 'arrivals' ? r.check_in_date : r.check_out_date;
      return d >= todayStr && d <= in7Str && !['cancelled', 'no_show', 'voided'].includes(r.status);
    })
    .sort((a, b) => {
      const da = type === 'arrivals' ? a.check_in_date : a.check_out_date;
      const db = type === 'arrivals' ? b.check_in_date : b.check_out_date;
      return da.localeCompare(db);
    });

  return (
    <div className="bg-[#111318] border border-[#1e2028] rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#1e2028]">
        <h3 className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase">{title}</h3>
      </div>
      <div className="divide-y divide-[#1e2028]">
        {filtered.length === 0 ? (
          <div className="px-4 py-4 text-xs text-[#64748b]">None scheduled</div>
        ) : (
          filtered.map((r) => {
            const d = type === 'arrivals' ? r.check_in_date : r.check_out_date;
            const nights = nightCount(r.check_in_date, r.check_out_date);
            return (
              <div key={r.id} className="flex items-center px-4 py-2.5 gap-3 hover:bg-[#161b22] transition-colors">
                <div className="text-center min-w-[32px]">
                  <div className="text-[10px] text-[#64748b]">
                    {new Date(d + 'T00:00:00').toLocaleDateString('en-ZA', { weekday: 'short' })}
                  </div>
                  <div className="text-sm font-bold text-[#f1f5f9]">
                    {new Date(d + 'T00:00:00').getDate()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-[#f1f5f9] truncate">{r.guest_name}</div>
                  <div className="text-[10px] text-[#64748b]">{r.property_name} · {nights}n</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${CHANNEL_BADGE[r.channel_code ?? 'direct'] ?? 'bg-gray-500/20 text-gray-300'}`}>
                    {r.channel_code?.replace('_', '.')}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[r.status] ?? ''}`}>
                    {STATUS_LABELS[r.status] ?? r.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Reservation detail panel ─────────────────────────────────────────────────

function ReservationDetail({ reservation: r, onClose }: { reservation: Reservation; onClose: () => void }) {
  const nights = nightCount(r.check_in_date, r.check_out_date);
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-[400px] h-full bg-[#0d1117] border-l border-[#1e2028] shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2028]">
          <div>
            <div className="text-xs font-mono text-[#C6A66B]">{r.confirmation_number}</div>
            <h3 className="text-sm font-semibold text-[#f1f5f9] mt-0.5">{r.guest_name}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#1e2028] rounded transition-colors">
            <X className="w-4 h-4 text-[#64748b]" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded border font-medium ${STATUS_COLORS[r.status] ?? ''}`}>
              {STATUS_LABELS[r.status] ?? r.status}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${CHANNEL_BADGE[r.channel_code ?? 'direct'] ?? 'bg-gray-500/20 text-gray-300'}`}>
              {r.channel_code?.replace(/_/g, '.')}
            </span>
          </div>

          {/* Stay */}
          <div className="bg-[#111318] border border-[#1e2028] rounded-lg p-4 space-y-3">
            <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Check-in">
              {formatDisplayDate(r.check_in_date)}
            </Row>
            <Row icon={<Calendar className="w-3.5 h-3.5" />} label="Check-out">
              {formatDisplayDate(r.check_out_date)} ({nights} night{nights !== 1 ? 's' : ''})
            </Row>
            <Row icon={<Users className="w-3.5 h-3.5" />} label="Guests">
              {r.adults} adult{r.adults !== 1 ? 's' : ''}{r.children ? ` · ${r.children} child${r.children !== 1 ? 'ren' : ''}` : ''}
            </Row>
            {r.property_name && (
              <Row icon={<Clock className="w-3.5 h-3.5" />} label="Property">
                {r.property_name}
              </Row>
            )}
          </div>

          {/* Financials */}
          <div className="bg-[#111318] border border-[#1e2028] rounded-lg p-4 space-y-3">
            <Row icon={<DollarSign className="w-3.5 h-3.5" />} label="Total">
              {r.currency} {r.total_amount.toLocaleString()}
            </Row>
            <Row icon={<DollarSign className="w-3.5 h-3.5" />} label="Outstanding">
              <span className={r.outstanding_balance > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                {r.currency} {r.outstanding_balance.toLocaleString()}
              </span>
            </Row>
          </div>

          {/* Guest contact */}
          {(r.guest_email || r.guest_phone) && (
            <div className="bg-[#111318] border border-[#1e2028] rounded-lg p-4 space-y-2">
              {r.guest_email && (
                <div className="text-xs text-[#94a3b8]">{r.guest_email}</div>
              )}
              {r.guest_phone && (
                <div className="text-xs text-[#94a3b8]">{r.guest_phone}</div>
              )}
            </div>
          )}

          {/* Special requests */}
          {r.special_requests && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
              <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest mb-1">Special Requests</div>
              <p className="text-xs text-[#94a3b8]">{r.special_requests}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2">
            {r.status === 'confirmed' || r.status === 'deposit_paid' || r.status === 'fully_paid' ? (
              <button className="w-full py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded hover:bg-emerald-500/30 transition-colors">
                Check In
              </button>
            ) : null}
            {r.status === 'checked_in' ? (
              <button className="w-full py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold rounded hover:bg-blue-500/30 transition-colors">
                Check Out
              </button>
            ) : null}
            {!['cancelled', 'checked_out', 'voided', 'no_show'].includes(r.status) && (
              <button className="w-full py-2 bg-[#111318] text-[#94a3b8] border border-[#1e2028] text-xs rounded hover:border-[#374151] transition-colors">
                Edit Reservation
              </button>
            )}
            {!['cancelled', 'checked_out', 'voided'].includes(r.status) && (
              <button className="w-full py-2 bg-red-500/5 text-red-400 border border-red-500/20 text-xs rounded hover:bg-red-500/10 transition-colors">
                Cancel Reservation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#64748b]">{icon}</span>
      <span className="text-[10px] text-[#64748b] w-20">{label}</span>
      <span className="text-xs text-[#f1f5f9] flex-1">{children}</span>
    </div>
  );
}

function formatDisplayDate(s: string) {
  return new Date(s + 'T00:00:00').toLocaleDateString('en-ZA', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ─── New Reservation Modal ────────────────────────────────────────────────────

function NewReservationModal({ properties, onClose, onCreated }: {
  properties: any[];
  onClose: () => void;
  onCreated: (r: Reservation) => void;
}) {
  const [form, setForm] = useState({
    property_id: properties[0]?.id ?? '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in_date: fmt(addDays(new Date(), 1)),
    check_out_date: fmt(addDays(new Date(), 3)),
    adults: 2,
    children: 0,
    source: 'direct',
    channel_code: 'direct',
    special_requests: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const nights = nightCount(form.check_in_date, form.check_out_date);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nights < 1) { setError('Check-out must be after check-in'); return; }
    setSaving(true);
    try {
      const { createReservation } = await import('@/lib/queries/reservations');
      const r = await createReservation({
        ...form,
        status: 'confirmed',
        total_amount: 0,
        outstanding_balance: 0,
        currency: 'ZAR',
      });
      onCreated(r);
    } catch (err: any) {
      setError(err.message ?? 'Failed to create reservation');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-[520px] bg-[#0d1117] border border-[#1e2028] rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2028]">
          <h3 className="text-sm font-semibold text-[#f1f5f9]">New Reservation</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#1e2028] rounded transition-colors">
            <X className="w-4 h-4 text-[#64748b]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Property */}
          <Field label="Property">
            <select
              value={form.property_id}
              onChange={(e) => setForm(f => ({ ...f, property_id: e.target.value }))}
              className="w-full bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-2 outline-none"
            >
              {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>

          {/* Guest */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Guest name">
              <input required value={form.guest_name} onChange={(e) => setForm(f => ({ ...f, guest_name: e.target.value }))}
                className="w-full bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-2 outline-none placeholder:text-[#374151]"
                placeholder="Full name" />
            </Field>
            <Field label="Email">
              <input type="email" value={form.guest_email} onChange={(e) => setForm(f => ({ ...f, guest_email: e.target.value }))}
                className="w-full bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-2 outline-none placeholder:text-[#374151]"
                placeholder="guest@email.com" />
            </Field>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Check-in">
              <input type="date" value={form.check_in_date} onChange={(e) => setForm(f => ({ ...f, check_in_date: e.target.value }))}
                className="w-full bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-2 outline-none" />
            </Field>
            <Field label="Check-out">
              <input type="date" value={form.check_out_date} onChange={(e) => setForm(f => ({ ...f, check_out_date: e.target.value }))}
                className="w-full bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-2 outline-none" />
            </Field>
            <Field label={`Nights`}>
              <div className="w-full bg-[#111318] border border-[#1e2028] text-xs text-[#C6A66B] font-bold rounded px-3 py-2">
                {nights > 0 ? `${nights} night${nights !== 1 ? 's' : ''}` : '—'}
              </div>
            </Field>
          </div>

          {/* Guests */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Adults">
              <input type="number" min={1} max={20} value={form.adults} onChange={(e) => setForm(f => ({ ...f, adults: +e.target.value }))}
                className="w-full bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-2 outline-none" />
            </Field>
            <Field label="Children">
              <input type="number" min={0} max={20} value={form.children} onChange={(e) => setForm(f => ({ ...f, children: +e.target.value }))}
                className="w-full bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-2 outline-none" />
            </Field>
            <Field label="Source">
              <select value={form.channel_code} onChange={(e) => setForm(f => ({ ...f, channel_code: e.target.value, source: e.target.value }))}
                className="w-full bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-2 outline-none">
                <option value="direct">Direct</option>
                <option value="phone">Phone</option>
                <option value="walk_in">Walk-in</option>
                <option value="airbnb">Airbnb</option>
                <option value="booking_com">Booking.com</option>
                <option value="lekke_slaap">LekkeSlaap</option>
                <option value="expedia">Expedia</option>
                <option value="agent">Agent</option>
              </select>
            </Field>
          </div>

          {/* Special requests */}
          <Field label="Special requests">
            <textarea value={form.special_requests} onChange={(e) => setForm(f => ({ ...f, special_requests: e.target.value }))}
              className="w-full bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-2 outline-none placeholder:text-[#374151] resize-none"
              rows={2} placeholder="Any special requests or notes..." />
          </Field>

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 bg-[#111318] border border-[#1e2028] text-xs text-[#94a3b8] rounded hover:border-[#374151] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 bg-[#C6A66B] text-[#020912] text-xs font-semibold rounded hover:bg-[#D4B47A] transition-colors disabled:opacity-50">
              {saving ? 'Creating…' : 'Create Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold text-[#64748b] uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}
