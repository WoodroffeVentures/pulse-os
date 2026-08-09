'use client';
import { useState, useEffect } from 'react';
import { listProperties } from '@/lib/queries/properties';
import { listBookings } from '@/lib/queries/bookings';
import { listTasks } from '@/lib/queries/tasks';
import { StatusBadge } from '@/components/ui/status-badge';
import { Home } from 'lucide-react';

const ORG_ID = 'a1b2c3d4-0001-0001-0001-000000000001';

export default function HousekeepingPage() {
  const [data, setData] = useState<{ properties: any[]; bookings: any[]; tasks: any[]; source: 'live' | 'demo' } | null>(null);
  useEffect(() => {
    Promise.all([listProperties(ORG_ID), listBookings(ORG_ID), listTasks(ORG_ID)])
      .then(([p, b, t]) => setData({ properties: p.rows, bookings: b.rows, tasks: t.rows, source: p.source }))
      .catch(console.error);
  }, []);
  if (!data) return <div className="p-6 text-[#617089] text-sm">Loading…</div>;
  const housekeepingTasks = data.tasks.filter(
    (task: any) => task.category === 'housekeeping' || task.category === 'inspection'
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF5]">Housekeeping</h1>
        <p className="mt-1 text-sm text-[#9BA7B8]">Cleaning readiness, inspections and turnovers.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.properties.map((property: any) => {
          const arrivals = data.bookings.filter(
            (booking: any) => booking.property_id === property.id && booking.status === 'confirmed'
          );
          const tasks = housekeepingTasks.filter((task: any) => task.property_id === property.id);

          return (
            <div key={property.id} className="rounded-lg border border-white/10 bg-[#08111f] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-[#2BB8A5]" />
                  <h2 className="text-sm font-semibold text-[#E6EDF5]">{property.name}</h2>
                </div>
                <StatusBadge status={tasks.some((task) => task.status === 'overdue') ? 'overdue' : 'active'} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded border border-white/10 bg-[#020912] p-3">
                  <div className="text-[10px] uppercase tracking-widest text-[#617089]">Upcoming Arrivals</div>
                  <div className="mt-1 font-mono text-lg text-[#E6EDF5]">{arrivals.length}</div>
                </div>
                <div className="rounded border border-white/10 bg-[#020912] p-3">
                  <div className="text-[10px] uppercase tracking-widest text-[#617089]">Cleaning Tasks</div>
                  <div className="mt-1 font-mono text-lg text-[#E6EDF5]">{tasks.length}</div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-3 rounded border border-white/10 bg-[#020912] px-3 py-2">
                    <span className="text-xs text-[#E6EDF5]">{task.title}</span>
                    <StatusBadge status={task.status} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
