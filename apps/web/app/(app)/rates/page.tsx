'use client';
import { useState, useEffect } from 'react';
import { listProperties } from '@/lib/queries/properties';
import { listRoomTypes, listRatePlans, type RoomType, type RatePlan } from '@/lib/queries/reservations';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';
import { useOrg } from '@/lib/context/org-context';
import { ChevronLeft, ChevronRight, Save, Lock, Unlock, TrendingUp } from 'lucide-react';

function fmt(d: Date) { return d.toISOString().split('T')[0]; }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function parseDateLocal(s: string) { return new Date(s + 'T00:00:00'); }

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Demo rate grid
function buildDemoRates(roomTypeId: string, ratePlanId: string, days: Date[]) {
  return Object.fromEntries(days.map((d) => {
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const base = roomTypeId.includes('rt-001') ? 1850 : roomTypeId.includes('rt-002') ? 1400 : roomTypeId.includes('rt-003') ? 1650 : 2200;
    return [fmt(d), { rate: isWeekend ? Math.round(base * 1.2) : base, stop_sell: false, min_nights: 2 }];
  }));
}

export default function RatesPage() {
  const { orgId } = useOrg();
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [selectedRatePlan, setSelectedRatePlan] = useState<string>('');
  const [viewStart, setViewStart] = useState<Date>(() => {
    const d = new Date(); d.setDate(1); return d; // start of month
  });
  const viewDays = 31;
  const [rates, setRates] = useState<Record<string, Record<string, { rate: number; stop_sell: boolean; min_nights: number }>>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState<'live' | 'demo'>('demo');

  const dateColumns = Array.from({ length: viewDays }, (_, i) => addDays(viewStart, i));

  useEffect(() => {
    if (!orgId) return;
    listProperties(orgId).then((r) => {
      setProperties(r.rows);
      if (r.rows.length > 0) setSelectedProperty(r.rows[0].id);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedProperty) return;
    Promise.all([listRoomTypes(selectedProperty), listRatePlans(selectedProperty)])
      .then(([rt, rp]) => {
        setRoomTypes(rt.rows);
        setRatePlans(rp.rows);
        setSource(rt.source);
        if (rp.rows.length > 0) setSelectedRatePlan(rp.rows[0].id);
      })
      .catch(console.error);
  }, [selectedProperty]);

  useEffect(() => {
    if (!selectedRatePlan || roomTypes.length === 0) return;
    // Load rates — demo or live
    if (!isSupabaseConfigured()) {
      const demo: typeof rates = {};
      roomTypes.forEach((rt) => {
        demo[rt.id] = buildDemoRates(rt.id, selectedRatePlan, dateColumns);
      });
      setRates(demo);
      return;
    }
    // Live: fetch from rate_calendar
    const supabase = createClient();
    const startStr = fmt(viewStart);
    const endStr = fmt(addDays(viewStart, viewDays));
    supabase
      .from('rate_calendar')
      .select('room_type_id, stay_date, rate_amount, stop_sell, min_nights')
      .eq('rate_plan_id', selectedRatePlan)
      .gte('stay_date', startStr)
      .lt('stay_date', endStr)
      .then(({ data }) => {
        const built: typeof rates = {};
        roomTypes.forEach((rt) => { built[rt.id] = {}; });
        (data ?? []).forEach((row: any) => {
          if (built[row.room_type_id]) {
            built[row.room_type_id][row.stay_date] = {
              rate: row.rate_amount,
              stop_sell: row.stop_sell,
              min_nights: row.min_nights ?? 1,
            };
          }
        });
        setRates(built);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRatePlan, roomTypes, viewStart]);

  function setRate(roomTypeId: string, date: string, field: 'rate' | 'stop_sell', value: number | boolean) {
    setRates((prev) => ({
      ...prev,
      [roomTypeId]: {
        ...prev[roomTypeId],
        [date]: {
          ...(prev[roomTypeId]?.[date] ?? { rate: 0, stop_sell: false, min_nights: 1 }),
          [field]: value,
        },
      },
    }));
    setDirty((prev) => new Set(prev).add(`${roomTypeId}:${date}`));
  }

  async function handleSave() {
    if (!isSupabaseConfigured()) {
      setDirty(new Set());
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const upserts: any[] = [];
      dirty.forEach((key) => {
        const [rtId, date] = key.split(':');
        const cell = rates[rtId]?.[date];
        if (!cell) return;
        upserts.push({
          property_id: selectedProperty,
          room_type_id: rtId,
          rate_plan_id: selectedRatePlan,
          stay_date: date,
          rate_amount: cell.rate,
          stop_sell: cell.stop_sell,
          min_nights: cell.min_nights,
        });
      });
      await supabase.from('rate_calendar').upsert(upserts, { onConflict: 'room_type_id,rate_plan_id,stay_date' });
      setDirty(new Set());
    } finally {
      setSaving(false);
    }
  }

  const todayStr = fmt(new Date());

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#f1f5f9]">Rate Management</h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            Set nightly rates, stop-sells and minimum stay restrictions ·{' '}
            <span className={source === 'live' ? 'text-emerald-400' : 'text-amber-400'}>{source}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty.size > 0 && (
            <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
              {dirty.size} unsaved change{dirty.size !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={dirty.size === 0 || saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C6A66B] text-[#020912] text-xs font-semibold rounded hover:bg-[#D4B47A] transition-colors disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Rates'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-2 py-1.5 outline-none"
        >
          {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <select
          value={selectedRatePlan}
          onChange={(e) => setSelectedRatePlan(e.target.value)}
          className="bg-[#111318] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-2 py-1.5 outline-none"
        >
          {ratePlans.map((rp) => <option key={rp.id} value={rp.id}>{rp.name} ({rp.code})</option>)}
        </select>

        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setViewStart(v => addDays(v, -viewDays))}
            className="p-1.5 bg-[#111318] border border-[#1e2028] rounded hover:bg-[#1e2028]">
            <ChevronLeft className="w-3.5 h-3.5 text-[#64748b]" />
          </button>
          <span className="text-xs text-[#64748b] px-2">
            {viewStart.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => setViewStart(v => addDays(v, viewDays))}
            className="p-1.5 bg-[#111318] border border-[#1e2028] rounded hover:bg-[#1e2028]">
            <ChevronRight className="w-3.5 h-3.5 text-[#64748b]" />
          </button>
        </div>
      </div>

      {/* Rate grid */}
      <div className="bg-[#111318] border border-[#1e2028] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1200px]">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-[#111318] border-b border-r border-[#1e2028] px-3 py-2 w-36 text-left">
                  <span className="text-[10px] font-semibold text-[#64748b] tracking-widest uppercase">Room Type</span>
                </th>
                {dateColumns.map((d) => {
                  const isToday = fmt(d) === todayStr;
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <th key={fmt(d)} className={`border-b border-r border-[#1e2028] px-1 py-1 min-w-[64px] text-center ${
                      isToday ? 'bg-[#C6A66B]/10' : isWeekend ? 'bg-[#08111f]' : ''
                    }`}>
                      <div className={`text-[9px] ${isWeekend ? 'text-[#94a3b8]' : 'text-[#9BA7B8]'}`}>
                        {WEEKDAY_NAMES[d.getDay()]}
                      </div>
                      <div className={`text-[10px] font-bold ${isToday ? 'text-[#C6A66B]' : isWeekend ? 'text-[#64748b]' : 'text-[#9BA7B8]'}`}>
                        {d.getDate()}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {roomTypes.map((rt) => (
                <tr key={rt.id} className="border-b border-[#1e2028] last:border-0">
                  <td className="sticky left-0 z-10 bg-[#111318] border-r border-[#1e2028] px-3 py-3">
                    <div className="text-xs font-medium text-[#f1f5f9]">{rt.name}</div>
                    <div className="text-[10px] text-[#64748b] mt-0.5">{rt.code} · max {rt.max_occupancy}</div>
                  </td>
                  {dateColumns.map((d) => {
                    const dStr = fmt(d);
                    const cell = rates[rt.id]?.[dStr];
                    const isDirty = dirty.has(`${rt.id}:${dStr}`);
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    const isToday = dStr === todayStr;
                    return (
                      <td key={dStr} className={`border-r border-[#1e2028] px-1 py-1 ${
                        cell?.stop_sell ? 'bg-red-500/10' : isToday ? 'bg-[#C6A66B]/5' : isWeekend ? 'bg-[#08111f]/50' : ''
                      } ${isDirty ? 'ring-1 ring-inset ring-amber-500/40' : ''}`}>
                        {/* Rate input */}
                        <input
                          type="number"
                          value={cell?.rate ?? ''}
                          placeholder="—"
                          onChange={(e) => setRate(rt.id, dStr, 'rate', parseInt(e.target.value) || 0)}
                          className="w-full bg-transparent text-[10px] font-mono text-[#f1f5f9] text-center outline-none focus:bg-[#1e2028] rounded px-1 py-0.5 placeholder:text-[#9BA7B8]"
                        />
                        {/* Stop-sell toggle */}
                        <button
                          onClick={() => setRate(rt.id, dStr, 'stop_sell', !cell?.stop_sell)}
                          className={`w-full text-[9px] text-center py-0.5 rounded transition-colors ${
                            cell?.stop_sell ? 'text-red-400 bg-red-500/20' : 'text-[#9BA7B8] hover:text-[#64748b]'
                          }`}
                          title="Toggle stop-sell"
                        >
                          {cell?.stop_sell ? (
                            <span className="flex items-center justify-center gap-0.5"><Lock className="w-2 h-2" /> STOP</span>
                          ) : (
                            <span className="flex items-center justify-center gap-0.5"><Unlock className="w-2 h-2" /> open</span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {roomTypes.length === 0 && (
                <tr>
                  <td colSpan={viewDays + 1} className="px-4 py-8 text-center text-sm text-[#64748b]">
                    No room types found for this property
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-[#64748b]">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500/10 border border-red-500/20 rounded" /> Stop-sell</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#08111f] rounded" /> Weekend</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 ring-1 ring-amber-500/40 rounded" /> Unsaved</div>
        <div className="ml-auto flex items-center gap-1.5 text-[#9BA7B8]">
          <TrendingUp className="w-3 h-3" /> Rates shown in ZAR per night
        </div>
      </div>

      {/* Bulk actions */}
      <BulkRatePanel roomTypes={roomTypes} onApply={(rtId, amount, days) => {
        days.forEach((d) => setRate(rtId === 'all' ? roomTypes[0]?.id ?? '' : rtId, d, 'rate', amount));
        // if all, apply to all room types
        if (rtId === 'all') {
          roomTypes.forEach((rt) => days.forEach((d) => setRate(rt.id, d, 'rate', amount)));
        }
      }} viewDays={viewDays} viewStart={viewStart} />
    </div>
  );
}

function BulkRatePanel({ roomTypes, onApply, viewDays, viewStart }: {
  roomTypes: RoomType[];
  onApply: (rtId: string, amount: number, days: string[]) => void;
  viewDays: number;
  viewStart: Date;
}) {
  const [open, setOpen] = useState(false);
  const [bulkRt, setBulkRt] = useState('all');
  const [bulkRate, setBulkRate] = useState('');
  const [bulkDays, setBulkDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  function apply() {
    const days: string[] = [];
    for (let i = 0; i < viewDays; i++) {
      const d = addDays(viewStart, i);
      if (bulkDays.includes(d.getDay())) days.push(fmt(d));
    }
    onApply(bulkRt, parseInt(bulkRate) || 0, days);
    setOpen(false);
    setBulkRate('');
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-[#111318] border border-[#1e2028] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#161b22] transition-colors"
      >
        <span className="text-xs font-semibold text-[#f1f5f9]">Bulk Rate Update</span>
        <span className="text-[10px] text-[#64748b]">{open ? 'Hide' : 'Expand'}</span>
      </button>
      {open && (
        <div className="border-t border-[#1e2028] px-4 py-3 flex items-end gap-3 flex-wrap">
          <div className="space-y-1">
            <label className="text-[10px] text-[#64748b] uppercase tracking-widest">Room Type</label>
            <select value={bulkRt} onChange={(e) => setBulkRt(e.target.value)}
              className="bg-[#0d1117] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-2 py-1.5 outline-none">
              <option value="all">All Room Types</option>
              {roomTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-[#64748b] uppercase tracking-widest">Rate (ZAR)</label>
            <input type="number" value={bulkRate} onChange={(e) => setBulkRate(e.target.value)}
              placeholder="e.g. 1850"
              className="bg-[#0d1117] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-1.5 outline-none w-28 placeholder:text-[#9BA7B8]" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-[#64748b] uppercase tracking-widest">Apply To Days</label>
            <div className="flex gap-1">
              {dayNames.map((name, i) => (
                <button key={i} onClick={() => setBulkDays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i])}
                  className={`w-8 h-7 text-[10px] font-medium rounded border transition-colors ${
                    bulkDays.includes(i) ? 'bg-[#C6A66B]/20 border-[#C6A66B]/40 text-[#C6A66B]' : 'bg-[#0d1117] border-[#1e2028] text-[#64748b]'
                  }`}>
                  {name}
                </button>
              ))}
            </div>
          </div>
          <button onClick={apply} disabled={!bulkRate}
            className="px-3 py-1.5 bg-[#C6A66B] text-[#020912] text-xs font-semibold rounded hover:bg-[#D4B47A] transition-colors disabled:opacity-40">
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
