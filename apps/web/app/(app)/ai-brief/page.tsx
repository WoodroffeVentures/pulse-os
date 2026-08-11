'use client';
import { useState, useEffect } from 'react';
import { aiRecommendations } from '@/lib/mock-data';
import { listBookings } from '@/lib/queries/bookings';
import { listTasks } from '@/lib/queries/tasks';
import { listReviews } from '@/lib/queries/reviews';
import { StatusBadge } from '@/components/ui/status-badge';
import { Bot, ShieldAlert } from 'lucide-react';
import { useOrg } from '@/lib/context/org-context';



export default function AiBriefPage() {
  const { orgId } = useOrg();
  const [bookings, setBookings] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([listBookings(orgId ?? ''), listTasks(orgId ?? ''), listReviews(orgId ?? '')])
      .then(([b, t, r]) => { setBookings(b.rows); setTasks(t.rows); setReviews(r.rows); })
      .catch(console.error);
  }, []);

  const arrivals = bookings.filter((b: any) => b.status === 'confirmed').slice(0, 3);
  const urgentTasks = tasks.filter((t: any) => t.status === 'overdue' || t.priority === 'high');
  const pendingReviews = reviews.filter((r: any) => r.response_status !== 'responded');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF5]">AI Daily Brief</h1>
        <p className="mt-1 text-sm text-[#9BA7B8]">Draft-first operational intelligence. Nothing publishes or sends automatically.</p>
      </div>

      <section className="rounded-lg border border-white/10 bg-[#08111f]">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <Bot className="h-4 w-4 text-[#C6A66B]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#E6EDF5]">Today’s Operating Brief</span>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-3">
          <div>
            <div className="text-xs font-semibold text-[#E6EDF5]">Arrivals To Prepare</div>
            <div className="mt-3 space-y-2">
              {arrivals.map((booking: any) => (
                <div key={booking.id} className="rounded border border-white/10 bg-[#020912] px-3 py-2 text-xs text-[#9BA7B8]">
                  {booking.guest_name ?? (booking.guests ? `${booking.guests.first_name} ${booking.guests.last_name}` : 'Guest')} · {(booking.source ?? '').replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-[#E6EDF5]">Priority Work</div>
            <div className="mt-3 space-y-2">
              {urgentTasks.map((task: any) => (
                <div key={task.id} className="rounded border border-white/10 bg-[#020912] px-3 py-2">
                  <div className="text-xs text-[#E6EDF5]">{task.title}</div>
                  <div className="mt-2"><StatusBadge status={task.priority} /></div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-[#E6EDF5]">Review Attention</div>
            <div className="mt-3 font-mono text-3xl text-[#E6EDF5]">{pendingReviews.length}</div>
            <p className="mt-2 text-xs leading-5 text-[#9BA7B8]">Pending review workflows require human approval before any public response.</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-[#08111f]">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <ShieldAlert className="h-4 w-4 text-[#2BB8A5]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#E6EDF5]">AI Recommendations</span>
        </div>
        <div className="divide-y divide-white/10">
          {aiRecommendations.map((item) => (
            <div key={item.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[#E6EDF5]">{item.title}</div>
                  <div className="mt-1 text-xs text-[#617089]">{item.property}</div>
                </div>
                <StatusBadge status={item.risk} />
              </div>
              <p className="mt-2 text-xs leading-5 text-[#9BA7B8]">{item.action}</p>
              <div className="mt-2 text-[10px] uppercase tracking-widest text-[#617089]">{item.confidence}% confidence · approval required</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
