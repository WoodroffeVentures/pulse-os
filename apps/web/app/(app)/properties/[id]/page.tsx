'use client';
import { use, useEffect, useState } from 'react';
import { getPropertyWithStats } from '@/lib/queries/properties';
import { listReviews } from '@/lib/queries/reviews';
import { listBrainEntries } from '@/lib/queries/brain';
import { useOrg } from '@/lib/context/org-context';
import { StatusBadge } from '@/components/ui/status-badge';
import { BookOpen, CalendarDays, ClipboardCheck, Wrench } from 'lucide-react';

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { orgId } = useOrg();
  const [property, setProperty] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [source, setSource] = useState<'live' | 'demo'>('demo');

  useEffect(() => {
    Promise.all([
      getPropertyWithStats(id),
      listReviews(orgId ?? ''),
      listBrainEntries(orgId ?? '', id),
    ]).then(([ps, rv, br]) => {
      setProperty(ps.property);
      setBookings(ps.bookings);
      setTasks(ps.tasks);
      setReviews(rv.rows.filter((r: any) => r.property_id === id));
      setEntries(br.rows);
      setSource(ps.source);
    }).catch(console.error);
  }, [id]);

  if (!property) {
    return <div className="p-6 text-[#617089] text-sm">Loading…</div>;
  }

  const revenue = bookings.reduce((sum: number, b: any) => sum + (b.total_amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#E6EDF5]">{property.name}</h1>
          <p className="mt-1 text-sm text-[#9BA7B8]">{property.property_type}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={property.status} />
          <StatusBadge status={property.type ?? 'cottage'} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          ['Occupancy Signals', `${bookings.length} bookings`, CalendarDays],
          ['Revenue Tracked', `R${revenue.toLocaleString()}`, ClipboardCheck],
          ['Open Tasks', `${tasks.filter((task) => task.status !== 'completed').length}`, Wrench],
          ['Brain Entries', `${entries.length}`, BookOpen],
        ].map(([label, value, Icon]) => (
          <div key={label as string} className="rounded-lg border border-white/10 bg-[#08111f] p-4">
            <Icon className="h-4 w-4 text-[#C6A66B]" />
            <div className="mt-3 text-[10px] uppercase tracking-widest text-[#617089]">{label as string}</div>
            <div className="mt-1 font-mono text-lg text-[#E6EDF5]">{value as string}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-white/10 bg-[#08111f]">
          <div className="border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#E6EDF5]">
            Operations
          </div>
          <div className="divide-y divide-white/10">
            {tasks.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <div className="text-sm text-[#E6EDF5]">{task.title}</div>
                  <div className="mt-1 text-xs text-[#617089]">{task.category.replace(/_/g, ' ')}</div>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-[#08111f]">
          <div className="border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#E6EDF5]">
            Guest Experience
          </div>
          <div className="divide-y divide-white/10">
            {reviews.map((review: any) => (
              <div key={review.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm text-[#E6EDF5]">{review.rating}/5</div>
                  <StatusBadge status={review.sentiment ?? 'neutral'} />
                </div>
                <p className="mt-2 text-xs leading-5 text-[#9BA7B8]">{review.review_text}</p>
              </div>
            ))}
            {reviews.length === 0 && <div className="px-4 py-6 text-sm text-[#617089]">No reviews loaded yet.</div>}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-white/10 bg-[#08111f]">
        <div className="border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#E6EDF5]">
          Commercial And Knowledge
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-[#E6EDF5]">Booking Sources</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[...new Set(bookings.map((booking: any) => booking.source))].map((src) => (
                <StatusBadge key={src as string} status={src as string} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-[#E6EDF5]">Brain Entries</div>
            <div className="mt-3 space-y-2">
              {entries.map((entry: any) => (
                <div key={entry.id} className="rounded border border-white/10 bg-[#020912] px-3 py-2">
                  <div className="text-xs text-[#E6EDF5]">{entry.title}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-widest text-[#617089]">
                    {entry.guest_visible ? 'Guest visible' : 'Internal only'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
