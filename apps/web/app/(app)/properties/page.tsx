import Link from 'next/link';
import { farmsteadProperties, mockBookings, mockTasks } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui/status-badge';
import { ArrowRight, Building2, Sparkles } from 'lucide-react';

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF5]">Farmstead Portfolio</h1>
        <p className="mt-1 text-sm text-[#9BA7B8]">
          Four operating units, one Farmstead Hospitality command layer.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {farmsteadProperties.map((property) => {
          const bookings = mockBookings.filter((booking) => booking.property_id === property.id);
          const activeTasks = mockTasks.filter(
            (task) => task.property_id === property.id && task.status !== 'completed'
          );
          const revenue = bookings.reduce((sum, booking) => sum + (booking.total_amount ?? 0), 0);

          return (
            <Link
              href={`/properties/${property.id}`}
              key={property.id}
              className="group rounded-lg border border-white/10 bg-[#08111f] p-4 transition-colors hover:border-[#C6A66B]/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#C6A66B]" />
                    <h2 className="text-base font-semibold text-[#E6EDF5]">{property.name}</h2>
                  </div>
                  <p className="mt-1 text-xs text-[#9BA7B8]">{property.property_type}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#617089] transition-transform group-hover:translate-x-1" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#617089]">Bookings</div>
                  <div className="mt-1 font-mono text-lg text-[#E6EDF5]">{bookings.length}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#617089]">Revenue</div>
                  <div className="mt-1 font-mono text-lg text-[#E6EDF5]">R{revenue.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#617089]">Open Work</div>
                  <div className="mt-1 font-mono text-lg text-[#E6EDF5]">{activeTasks.length}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge status={property.status} />
                <StatusBadge status={property.type ?? 'cottage'} />
                {property.airbnb_url && <StatusBadge status="airbnb" />}
                {property.booking_url && <StatusBadge status="booking_com" />}
                {property.lekkeslaap_url && <StatusBadge status="lekkeslaap" />}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="rounded-lg border border-[#C6A66B]/20 bg-[#C6A66B]/5 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#C6A66B]">
          <Sparkles className="h-4 w-4" />
          MVP Boundary
        </div>
        <p className="mt-2 text-sm leading-6 text-[#9BA7B8]">
          Farmstead is the only implemented production customer. Multi-tenant, group,
          destination and government expansion stays visible but locked.
        </p>
      </div>
    </div>
  );
}
