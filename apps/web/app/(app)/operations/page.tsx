import { mockTasks, mockBookings, farmsteadProperties } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui/status-badge';
import { MetricTile } from '@/components/ui/metric-tile';
import { AlertTriangle, Wrench, Home, Star, Search, CalendarCheck } from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  housekeeping: <Home className="w-4 h-4" />,
  maintenance: <Wrench className="w-4 h-4" />,
  guest_services: <Star className="w-4 h-4" />,
  inspection: <Search className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  housekeeping: 'text-teal-400',
  maintenance: 'text-orange-400',
  guest_services: 'text-blue-400',
  inspection: 'text-purple-400',
  compliance: 'text-yellow-400',
  finance: 'text-green-400',
};

export default function OperationsPage() {
  const today = new Date().toISOString().split('T')[0];
  const activeTasks = mockTasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
  const overdueTasks = activeTasks.filter((t) => t.status === 'overdue');
  const arrivalsToday = mockBookings.filter((b) => b.check_in === today);
  const departuresToday = mockBookings.filter((b) => b.check_out === today);

  const tasksByCategory = (category: string) =>
    activeTasks.filter((t) => t.category === category);

  return (
    <div className="space-y-6">
      {/* Critical Alert */}
      {overdueTasks.length > 0 && (
        <div className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <div>
            <span className="text-sm font-semibold text-red-300">
              {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''} require immediate attention
            </span>
            <div className="text-xs text-red-400/60 mt-0.5">
              {overdueTasks.map((t) => t.title).join(' · ')}
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <MetricTile label="Active Tasks" value={activeTasks.length} />
        <MetricTile
          label="Overdue"
          value={overdueTasks.length}
          variant={overdueTasks.length > 0 ? 'critical' : 'default'}
        />
        <MetricTile label="Arrivals Today" value={arrivalsToday.length} variant="success" />
        <MetricTile label="Departures Today" value={departuresToday.length} />
      </div>

      {/* Today's Movements */}
      <div className="bg-[#111318] border border-[#1e2028] rounded-lg">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2028]">
          <CalendarCheck className="w-3.5 h-3.5 text-[#3b82f6]" />
          <h2 className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase">
            Today&apos;s Guest Movements
          </h2>
          <span className="text-xs text-[#64748b] ml-auto">
            {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
        {[...arrivalsToday, ...departuresToday].length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-[#64748b]">
            No arrivals or departures scheduled for today
          </div>
        ) : (
          <div className="divide-y divide-[#1e2028]">
            {arrivalsToday.map((b) => {
              const prop = farmsteadProperties.find((p) => p.id === b.property_id);
              return (
                <div key={b.id + '-arrival'} className="px-4 py-3 flex items-center gap-4">
                  <span className="text-[10px] font-bold bg-green-500/10 text-green-400 px-2 py-0.5 rounded tracking-widest">
                    ARRIVAL
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#f1f5f9]">{b.guest_name ?? 'Guest'}</div>
                    <div className="text-xs text-[#64748b]">{prop?.name} · Checkout {b.check_out}</div>
                  </div>
                  <StatusBadge status={b.source} />
                  <StatusBadge status={b.status} />
                </div>
              );
            })}
            {departuresToday.map((b) => {
              const prop = farmsteadProperties.find((p) => p.id === b.property_id);
              return (
                <div key={b.id + '-departure'} className="px-4 py-3 flex items-center gap-4">
                  <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded tracking-widest">
                    DEPARTURE
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#f1f5f9]">{b.guest_name ?? 'Guest'}</div>
                    <div className="text-xs text-[#64748b]">{prop?.name} · Checkout by 10:00</div>
                  </div>
                  <StatusBadge status={b.source} />
                  <StatusBadge status={b.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tasks by Category */}
      <div className="grid grid-cols-2 gap-4">
        {(['housekeeping', 'maintenance', 'guest_services', 'inspection'] as const).map((cat) => {
          const catTasks = tasksByCategory(cat);
          const catOverdue = catTasks.filter((t) => t.status === 'overdue');
          const Icon = ({ className }: { className: string }) => (
            <span className={cn(className, categoryColors[cat])}>
              {categoryIcons[cat]}
            </span>
          );

          return (
            <div
              key={cat}
              className={`bg-[#111318] border rounded-lg overflow-hidden ${
                catOverdue.length > 0 ? 'border-red-500/20' : 'border-[#1e2028]'
              }`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2028]">
                <div className="flex items-center gap-2">
                  <span className={categoryColors[cat]}>
                    {categoryIcons[cat] ?? <Wrench className="w-4 h-4" />}
                  </span>
                  <span className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase">
                    {cat.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {catOverdue.length > 0 && (
                    <span className="text-[10px] text-red-400 font-semibold">
                      {catOverdue.length} overdue
                    </span>
                  )}
                  <span className="text-xs font-mono text-[#64748b]">{catTasks.length}</span>
                </div>
              </div>
              {catTasks.length === 0 ? (
                <div className="px-4 py-4 text-xs text-[#374151] text-center">All clear</div>
              ) : (
                <div className="divide-y divide-[#1e2028]">
                  {catTasks.map((task) => (
                    <div key={task.id} className="px-4 py-3 flex items-center gap-3">
                      <div
                        className={`w-1 h-6 rounded-full flex-shrink-0 ${
                          task.status === 'overdue'
                            ? 'bg-red-500'
                            : task.priority === 'urgent' || task.priority === 'high'
                            ? 'bg-amber-500'
                            : 'bg-[#374151]'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-[#f1f5f9] truncate">{task.title}</div>
                        <div className="text-[10px] text-[#64748b] mt-0.5">
                          {farmsteadProperties.find((p) => p.id === task.property_id)?.name}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={task.status} />
                        <StatusBadge status={task.priority} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
