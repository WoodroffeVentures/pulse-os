import { StatusBadge } from '@/components/ui/status-badge';
import { ClipboardList } from 'lucide-react';

const workItems = [
  {
    title: 'Stabilise Swallows Nest hot water',
    property: 'Swallows Nest Studio',
    status: 'open',
    priority: 'high',
    estimate: 'R1,800',
    note: 'Inspect geyser timer, pressure and guest instructions before next arrival.',
  },
  {
    title: "Improve Woody's Cottage bedroom WiFi",
    property: "Woody's Cottage",
    status: 'scoped',
    priority: 'medium',
    estimate: 'R1,200',
    note: 'Install repeater or mesh node and update review response once complete.',
  },
];

export default function WorksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF5]">Works Register</h1>
        <p className="mt-1 text-sm text-[#9BA7B8]">Durable maintenance, improvements, spend and lessons learned.</p>
      </div>

      <div className="grid gap-4">
        {workItems.map((item) => (
          <div key={item.title} className="rounded-lg border border-white/10 bg-[#08111f] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-[#C6A66B]" />
                  <h2 className="text-sm font-semibold text-[#E6EDF5]">{item.title}</h2>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#9BA7B8]">{item.note}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={item.status} />
                <StatusBadge status={item.priority} />
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="text-xs text-[#9BA7B8]">Property: <span className="text-[#E6EDF5]">{item.property}</span></div>
              <div className="text-xs text-[#9BA7B8]">Estimated cost: <span className="font-mono text-[#E6EDF5]">{item.estimate}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
