'use client';
import { useState, useEffect } from 'react';
import { MetricTile } from '@/components/ui/metric-tile';
import { StatusBadge } from '@/components/ui/status-badge';
import { listBookings } from '@/lib/queries/bookings';
import { listTasks } from '@/lib/queries/tasks';
import { listProperties } from '@/lib/queries/properties';
import { createClient } from '@/lib/supabase/client';
import { AlertTriangle, ArrowRight, Calendar, ClipboardList, Building2, CheckCircle2, Circle, Target, Zap, AlertCircle } from 'lucide-react';
import { useOrg } from '@/lib/context/org-context';

export default function DashboardPage() {
  const { orgId, orgName, loading: orgLoading } = useOrg();
  const supabase = createClient();
  const [bookings, setBookings] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [pulse, setPulse] = useState({ businesses: 0, opportunities: 0, viability: 0, participation: 0, outcomes: 0 });
  const [topOpps, setTopOpps] = useState<any[]>([]);
  const [evidenceHealth, setEvidenceHealth] = useState({ selfEntered: 0, total: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    Promise.all([
      listBookings(orgId),
      listTasks(orgId),
      listProperties(orgId),
      supabase.from('business_profiles').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
      supabase.from('opportunities').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
      supabase.from('viability_analyses').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
      supabase.from('participation_records').select('id,evidence', { count: 'exact' }).eq('organization_id', orgId),
      supabase.from('opportunities').select('id,title,status,urgency,next_decision,readiness_score').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(10),
      supabase.from('business_profiles').select('id,business_name,verified_signals').eq('organization_id', orgId),
    ]).then(([b, t, p, bizRes, oppRes, vaRes, partRes, oppsData, bizProfiles]) => {
      setBookings(b.rows);
      setTasks(t.rows);
      setProperties(p.rows);
      const allOutcomes = (partRes.data ?? []).flatMap((r: any) => r.evidence?.outcomes ?? []);

      // Top opportunities: sort by urgency then recency
      const urgencyOrder: Record<string, number> = { critical: 0, high: 1, normal: 2, low: 3 };
      const sortedOpps = [...(oppsData.data ?? [])].sort((a: any, b: any) => {
        const ua = urgencyOrder[a.urgency ?? 'normal'] ?? 2;
        const ub = urgencyOrder[b.urgency ?? 'normal'] ?? 2;
        return ua !== ub ? ua - ub : 0;
      });
      setTopOpps(sortedOpps.slice(0, 3));

      // Evidence health: count businesses by evidence state
      const profiles = bizProfiles.data ?? [];
      const selfEntered = profiles.filter((bp: any) =>
        (bp.verified_signals?.evidence_state ?? 'Self-entered') === 'Self-entered'
      ).length;
      setEvidenceHealth({ selfEntered, total: profiles.length });

      setPulse({
        businesses: bizRes.count ?? 0,
        opportunities: oppRes.count ?? 0,
        viability: vaRes.count ?? 0,
        participation: partRes.count ?? 0,
        outcomes: allOutcomes.length,
      });
      setLoaded(true);
    }).catch(console.error);
  }, [orgId]);

  if (orgLoading) return <div className="p-6 text-[#617089] text-sm">Loading…</div>;

  const today = new Date().toISOString().split('T')[0];
  const arrivalsToday = bookings.filter((b: any) => (b.check_in_date ?? b.check_in) === today);
  const departuresToday = bookings.filter((b: any) => (b.check_out_date ?? b.check_out) === today);
  const overdueTasks = tasks.filter((t: any) => t.status === 'overdue');
  const openTasks = tasks.filter((t: any) => t.status === 'open' || t.status === 'in_progress');
  const activeBookings = bookings.filter((b: any) => b.status === 'checked_in' || b.status === 'confirmed');

  return (
    <div className="space-y-6">
      {overdueTasks.length > 0 && (
        <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-300">
            {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''} require immediate attention
          </span>
          <a href="/tasks" className="ml-auto text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
            View <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      )}

      {loaded && properties.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 p-6 text-center space-y-2">
          <Building2 className="w-8 h-8 text-[#374151] mx-auto" />
          <p className="text-sm text-[#9BA7B8]">No properties yet</p>
          <p className="text-xs text-[#617089]">Add your properties to see operational data here.</p>
          <a href="/properties" className="inline-block mt-2 text-xs text-[#C6A66B] border border-[#C6A66B]/30 rounded px-3 py-1.5 hover:bg-[#C6A66B]/10">
            Go to Properties →
          </a>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricTile
          label="Properties"
          value={properties.length}
          subValue={loaded ? '● live' : '…'}
        />
        <MetricTile
          label="Active Bookings"
          value={activeBookings.length}
          subValue={loaded ? '● live' : '…'}
        />
        <MetricTile
          label="Open Tasks"
          value={openTasks.length}
          variant={openTasks.length > 5 ? 'warning' : 'default'}
        />
        <MetricTile
          label="Overdue Tasks"
          value={overdueTasks.length}
          variant={overdueTasks.length > 0 ? 'critical' : 'default'}
        />
        <MetricTile
          label="Arrivals Today"
          value={arrivalsToday.length}
        />
        <MetricTile
          label="Departures Today"
          value={departuresToday.length}
        />
        <MetricTile
          label="Total Bookings"
          value={bookings.length}
          subValue="all time"
        />
        <MetricTile
          label="Total Tasks"
          value={tasks.length}
          subValue="all time"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 bg-[#111318] border border-[#1e2028] rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2028]">
            <h2 className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase">Property Status</h2>
            <span className="text-xs text-[#64748b]">{properties.length} propert{properties.length === 1 ? 'y' : 'ies'}</span>
          </div>
          {properties.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#64748b]">No properties yet</div>
          ) : (
            <div className="divide-y divide-[#1e2028]">
              {properties.map((p: any) => {
                const pBookings = bookings.filter((b: any) => b.property_id === p.id);
                const currentBooking = pBookings.find((b: any) => b.status === 'checked_in');
                const nextBooking = pBookings
                  .filter((b: any) => b.status === 'confirmed')
                  .sort((a: any, b: any) => (a.check_in_date ?? a.check_in).localeCompare(b.check_in_date ?? b.check_in))[0];
                const pTasks = tasks.filter((t: any) => t.property_id === p.id && t.status !== 'completed');
                const hasOverdue = pTasks.some((t: any) => t.status === 'overdue');
                return (
                  <div key={p.id} className="px-4 py-3 flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${currentBooking ? 'bg-green-400' : 'bg-[#374151]'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#f1f5f9]">{p.name}</div>
                      <div className="text-xs text-[#64748b] mt-0.5">
                        {currentBooking
                          ? `Occupied · checkout ${new Date(currentBooking.check_out_date ?? currentBooking.check_out).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}`
                          : nextBooking
                          ? `Next arrival: ${new Date(nextBooking.check_in_date ?? nextBooking.check_in).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}`
                          : 'No upcoming bookings'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasOverdue && <StatusBadge status="overdue" />}
                      {pTasks.length > 0 && !hasOverdue && (
                        <span className="text-xs text-[#64748b]">{pTasks.length} task{pTasks.length > 1 ? 's' : ''}</span>
                      )}
                      <StatusBadge status={currentBooking ? 'checked_in' : nextBooking ? 'confirmed' : 'active'} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#111318] border border-[#1e2028] rounded-lg">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2028]">
            <ClipboardList className="w-3.5 h-3.5 text-[#9BA7B8]" />
            <h2 className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase">Priority Tasks</h2>
          </div>
          {tasks.filter((t: any) => t.status !== 'completed').length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#64748b]">No open tasks</div>
          ) : (
            <div className="divide-y divide-[#1e2028]">
              {tasks.filter((t: any) => t.status !== 'completed').slice(0, 5).map((task: any) => (
                <div key={task.id} className="px-4 py-3 flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full flex-shrink-0 ${task.status === 'overdue' ? 'bg-red-500' : task.priority === 'high' || task.priority === 'critical' ? 'bg-amber-500' : 'bg-[#374151]'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#f1f5f9] truncate">{task.title}</div>
                    <div className="text-[10px] text-[#64748b] mt-0.5">{properties.find((p: any) => p.id === task.property_id)?.name}</div>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#111318] border border-[#1e2028] rounded-lg">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2028]">
          <Calendar className="w-3.5 h-3.5 text-[#9BA7B8]" />
          <h2 className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase">Today's Arrivals & Departures</h2>
        </div>
        {arrivalsToday.length === 0 && departuresToday.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-[#64748b]">No arrivals or departures today</div>
        ) : (
          <div className="divide-y divide-[#1e2028]">
            {[
              ...arrivalsToday.map((b: any) => ({ ...b, movType: 'ARRIVAL' })),
              ...departuresToday.map((b: any) => ({ ...b, movType: 'DEPARTURE' })),
            ].map((b: any) => (
              <div key={b.id + b.movType} className="px-4 py-3 flex items-center gap-3">
                <span className={`text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded ${b.movType === 'ARRIVAL' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {b.movType}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#f1f5f9] truncate">
                    {b.guests ? `${b.guests.first_name} ${b.guests.last_name}` : 'Guest'}
                  </div>
                  <div className="text-xs text-[#64748b]">{properties.find((p: any) => p.id === b.property_id)?.name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Opportunities */}
      {loaded && pulse.opportunities > 0 && (
        <div className="bg-[#111318] border border-[#1e2028] rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2028]">
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-[#C6A66B]" />
              <h2 className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase">Top Opportunities</h2>
            </div>
            <a href="/opportunities" className="text-[10px] text-[#617089] hover:text-[#C6A66B] flex items-center gap-1">
              Radar <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          <div className="divide-y divide-[#1e2028]">
            {topOpps.map((o: any) => {
              const urgencyColor = o.urgency === 'critical' ? 'text-red-400' : o.urgency === 'high' ? 'text-amber-400' : 'text-[#617089]';
              return (
                <a key={o.id} href={`/opportunities/${o.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[#0a1425] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#f1f5f9] truncate">{o.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#617089]">{(o.status ?? 'draft').replace(/_/g, ' ')}</span>
                      {o.urgency && o.urgency !== 'normal' && (
                        <span className={`text-[10px] font-semibold uppercase ${urgencyColor}`}>▲ {o.urgency}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {o.next_decision && (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    {o.readiness_score !== null && (
                      <span className="text-xs font-bold text-[#C6A66B]">{Math.round(o.readiness_score)}</span>
                    )}
                    <ArrowRight className="w-3 h-3 text-[#374151]" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Evidence Health */}
      {loaded && evidenceHealth.total > 0 && (
        <div className="bg-[#111318] border border-[#1e2028] rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2028]">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#9BA7B8]" />
              <h2 className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase">Evidence Health</h2>
            </div>
            <a href="/businesses" className="text-[10px] text-[#617089] hover:text-[#C6A66B] flex items-center gap-1">
              Businesses <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9BA7B8]">Business profiles</span>
              <span className="text-[#f1f5f9] font-medium">{evidenceHealth.total}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400">Self-entered (Low confidence)</span>
              <span className="text-amber-400 font-medium">{evidenceHealth.selfEntered}</span>
            </div>
            {evidenceHealth.total - evidenceHealth.selfEntered > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400">Reviewed or verified</span>
                <span className="text-emerald-400 font-medium">{evidenceHealth.total - evidenceHealth.selfEntered}</span>
              </div>
            )}
            {evidenceHealth.selfEntered > 0 && (
              <p className="text-[10px] text-[#617089] pt-1 border-t border-white/5">
                Submit evidence for human review to raise confidence above Low.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Onboarding Progress */}
      {loaded && (
        <div className="bg-[#08111f] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="w-3.5 h-3.5 text-[#C6A66B]" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C6A66B]">Pilot Readiness</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Properties', done: properties.length > 0, href: '/properties' },
              { label: 'Business Profile', done: pulse.businesses > 0, href: '/businesses' },
              { label: 'Opportunity', done: pulse.opportunities > 0, href: '/opportunities' },
              { label: 'Viability Assessment', done: pulse.viability > 0, href: '/viability' },
              { label: 'Participation Record', done: pulse.participation > 0, href: '/participation' },
              { label: 'Outcome Recorded', done: pulse.outcomes > 0, href: '/outcomes' },
            ].map(step => (
              <a key={step.label} href={step.href}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-center transition-colors ${step.done ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/10 hover:border-[#C6A66B]/30'}`}>
                {step.done
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  : <Circle className="w-4 h-4 text-[#374151]" />
                }
                <span className={`text-[10px] font-medium leading-tight ${step.done ? 'text-emerald-400' : 'text-[#617089]'}`}>{step.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="text-[9px] text-[#374151] text-center tracking-widest py-2">
        ALL METRICS FROM {orgName?.toUpperCase() ?? 'YOUR'} PRODUCTION DATABASE · HUMANS GOVERN · EVIDENCE DECIDES
      </div>
    </div>
  );
}
