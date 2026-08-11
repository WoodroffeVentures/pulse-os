'use client';
import { useState, useEffect } from 'react';
import { MetricTile } from '@/components/ui/metric-tile';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockMetrics } from '@/lib/mock-data';
import { listBookings } from '@/lib/queries/bookings';
import { listTasks } from '@/lib/queries/tasks';
import { listProperties } from '@/lib/queries/properties';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  ClipboardList,
  Bot,
} from 'lucide-react';
import { useOrg } from '@/lib/context/org-context';

export default function DashboardPage() {
  const { orgId } = useOrg();
  const [bookings, setBookings] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState<'live' | 'demo'>('demo');

  useEffect(() => {
    if (!orgId) return;
    Promise.all([listBookings(orgId), listTasks(orgId), listProperties(orgId)])
      .then(([b, t, p]) => { setBookings(b.rows); setTasks(t.rows); setProperties(p.rows); setDataSource(b.source); })
      .catch(console.error);
  }, [orgId]);

  const today = new Date().toISOString().split('T')[0];
  const arrivalsToday = bookings.filter((b: any) => (b.check_in_date ?? b.check_in) === today);
  const departuresToday = bookings.filter((b: any) => (b.check_out_date ?? b.check_out) === today);
  const overdueTasks = tasks.filter((t: any) => t.status === 'overdue');
  const openTasks = tasks.filter(
    (t: any) => t.status === 'open' || t.status === 'in_progress'
  );

  return (
    <div className="space-y-6">
      {/* Critical Alert Banner */}
      {overdueTasks.length > 0 && (
        <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-300">
            {overdueTasks.length} overdue task
            {overdueTasks.length > 1 ? 's' : ''} require immediate attention
          </span>
          <a
            href="/tasks"
            className="ml-auto text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            View <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-3">
        <MetricTile
          label="Occupancy"
          value={mockMetrics.occupancy_rate}
          unit="%"
          trend={mockMetrics.occupancy_trend}
          trendLabel="vs last month"
        />
        <MetricTile
          label="ADR"
          value={`R${mockMetrics.adr.toLocaleString()}`}
          subValue="avg daily rate"
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
          label="Avg Rating"
          value={mockMetrics.avg_rating}
          unit="/ 5"
          variant="success"
        />
        <MetricTile
          label="Arrivals Today"
          value={arrivalsToday.length}
          subValue="properties"
        />
        <MetricTile
          label="Active Bookings"
          value={bookings.filter((b: any) => b.status === 'checked_in' || b.status === 'confirmed').length}
          subValue={dataSource === 'live' ? '● live' : '⬛ demo'}
        />
        <MetricTile
          label="Rev This Month"
          value={`R${mockMetrics.revenue_this_month.toLocaleString()}`}
          trend={mockMetrics.revenue_trend}
          trendLabel="vs last month"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Property Status */}
        <div className="col-span-2 bg-[#111318] border border-[#1e2028] rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2028]">
            <h2 className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase">
              Property Status
            </h2>
            <span className="text-xs text-[#64748b]">4 active</span>
          </div>
          <div className="divide-y divide-[#1e2028]">
            {properties.map((p: any) => {
              const pBookings = bookings.filter(
                (b: any) => b.property_id === p.id
              );
              const currentBooking = pBookings.find(
                (b: any) => b.status === 'checked_in'
              );
              const nextBooking = pBookings
                .filter((b: any) => b.status === 'confirmed')
                .sort((a: any, b: any) => (a.check_in_date ?? a.check_in).localeCompare(b.check_in_date ?? b.check_in))[0];
              const pTasks = tasks.filter(
                (t: any) => t.property_id === p.id && t.status !== 'completed'
              );
              const hasOverdue = pTasks.some((t) => t.status === 'overdue');
              return (
                <div key={p.id} className="px-4 py-3 flex items-center gap-4">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      currentBooking ? 'bg-green-400' : 'bg-[#374151]'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#f1f5f9]">
                      {p.name}
                    </div>
                    <div className="text-xs text-[#64748b] mt-0.5">
                      {currentBooking
                        ? `${currentBooking.guest_name ?? (currentBooking.guests ? `${currentBooking.guests.first_name} ${currentBooking.guests.last_name}` : 'Guest')} · until ${new Date(
                            currentBooking.check_out_date ?? currentBooking.check_out
                          ).toLocaleDateString('en-ZA', {
                            day: 'numeric',
                            month: 'short',
                          })}`
                        : nextBooking
                        ? `Next: ${nextBooking.guest_name ?? (nextBooking.guests ? `${nextBooking.guests.first_name} ${nextBooking.guests.last_name}` : 'Guest')} · ${new Date(
                            nextBooking.check_in_date ?? nextBooking.check_in
                          ).toLocaleDateString('en-ZA', {
                            day: 'numeric',
                            month: 'short',
                          })}`
                        : 'No upcoming bookings'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasOverdue && <StatusBadge status="overdue" />}
                    {pTasks.length > 0 && !hasOverdue && (
                      <span className="text-xs text-[#64748b]">
                        {pTasks.length} task{pTasks.length > 1 ? 's' : ''}
                      </span>
                    )}
                    <StatusBadge
                      status={
                        currentBooking
                          ? 'checked_in'
                          : nextBooking
                          ? 'confirmed'
                          : 'active'
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-[#111318] border border-[#1e2028] rounded-lg">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2028]">
            <Bot className="w-3.5 h-3.5 text-[#3b82f6]" />
            <h2 className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase">
              AI Recommendations
            </h2>
          </div>
          <div className="divide-y divide-[#1e2028]">
            {[
              {
                id: 1,
                text: 'Respond to Booking.com 3★ review for Swallows Nest — guest mentions hot water issue',
                risk: 'medium',
                confidence: 82,
              },
              {
                id: 2,
                text: 'Meadows Cottage has 3 gap nights next week — consider LekkeSlaap last-minute promotion',
                risk: 'low',
                confidence: 74,
              },
              {
                id: 3,
                text: 'Post-stay follow-up for Jackals Rest checkout — ideal timing for review request',
                risk: 'low',
                confidence: 91,
              },
            ].map((rec) => (
              <div key={rec.id} className="p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <StatusBadge status={rec.risk} />
                  <span className="text-[10px] text-[#64748b] ml-auto">
                    {rec.confidence}% confidence
                  </span>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  {rec.text}
                </p>
                <div className="flex gap-2 mt-2">
                  <button className="flex-1 text-[10px] bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 rounded px-2 py-1 hover:bg-[#3b82f6]/20 transition-colors">
                    Apply
                  </button>
                  <button className="flex-1 text-[10px] text-[#64748b] border border-[#1e2028] rounded px-2 py-1 hover:border-[#374151] transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[#1e2028]">
            <p className="text-[9px] text-[#374151] text-center tracking-widest">
              AI ASSISTS · HUMANS GOVERN · EVIDENCE DECIDES
            </p>
          </div>
        </div>
      </div>

      {/* Today's Schedule + Priority Tasks */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111318] border border-[#1e2028] rounded-lg">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2028]">
            <Calendar className="w-3.5 h-3.5 text-[#3b82f6]" />
            <h2 className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase">
              Today&apos;s Arrivals / Departures
            </h2>
          </div>
          {[
            ...arrivalsToday.map((b: any) => ({ ...b, movType: 'ARRIVAL' })),
            ...departuresToday.map((b: any) => ({ ...b, movType: 'DEPARTURE' })),
          ].length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-[#64748b]">
              No arrivals or departures today
            </div>
          ) : (
            <div className="divide-y divide-[#1e2028]">
              {[
                ...arrivalsToday.map((b: any) => ({ ...b, movType: 'ARRIVAL' })),
                ...departuresToday.map((b: any) => ({
                  ...b,
                  movType: 'DEPARTURE',
                })),
              ].map((b: any) => (
                <div
                  key={b.id + b.movType}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <span
                    className={`text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded ${
                      b.movType === 'ARRIVAL'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {b.movType}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#f1f5f9] truncate">
                      {b.guest_name ?? (b.guests ? `${b.guests.first_name} ${b.guests.last_name}` : 'Guest')}
                    </div>
                    <div className="text-xs text-[#64748b]">
                      {properties.find((p: any) => p.id === b.property_id)
                        ?.name}
                    </div>
                  </div>
                  <StatusBadge status={b.source} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#111318] border border-[#1e2028] rounded-lg">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2028]">
            <ClipboardList className="w-3.5 h-3.5 text-[#3b82f6]" />
            <h2 className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase">
              Priority Tasks
            </h2>
          </div>
          <div className="divide-y divide-[#1e2028]">
            {tasks
              .filter((t: any) => t.status !== 'completed')
              .slice(0, 5)
              .map((task: any) => (
                <div key={task.id} className="px-4 py-3 flex items-center gap-3">
                  <div
                    className={`w-1 h-8 rounded-full flex-shrink-0 ${
                      task.status === 'overdue'
                        ? 'bg-red-500'
                        : task.priority === 'high' || task.priority === 'urgent'
                        ? 'bg-amber-500'
                        : 'bg-[#374151]'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#f1f5f9] truncate">
                      {task.title}
                    </div>
                    <div className="text-[10px] text-[#64748b] mt-0.5">
                      {
                        properties.find(
                          (p: any) => p.id === task.property_id
                        )?.name
                      }
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
