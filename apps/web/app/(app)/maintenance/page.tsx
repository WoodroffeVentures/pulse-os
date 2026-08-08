import { farmsteadProperties, mockTasks } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui/status-badge';
import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
  const maintenanceTasks = mockTasks.filter((task) => task.category === 'maintenance');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF5]">Maintenance</h1>
        <p className="mt-1 text-sm text-[#9BA7B8]">Operational defects, follow-ups and guest-impacting issues.</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <Wrench className="h-4 w-4 text-[#D68B5C]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#E6EDF5]">Active Maintenance Queue</span>
        </div>
        <div className="divide-y divide-white/10">
          {maintenanceTasks.map((task) => {
            const property = farmsteadProperties.find((item) => item.id === task.property_id);
            return (
              <div key={task.id} className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_180px_120px_120px] md:items-center">
                <div>
                  <div className="text-sm font-medium text-[#E6EDF5]">{task.title}</div>
                  <div className="mt-1 text-xs text-[#617089]">{property?.name}</div>
                </div>
                <StatusBadge status={task.priority} />
                <StatusBadge status={task.status} />
                <div className="text-xs text-[#9BA7B8]">{task.due_at ? new Date(task.due_at).toLocaleDateString('en-ZA') : 'No due date'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
