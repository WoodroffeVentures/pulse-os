import { ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const settings = [
    ['Tenant', 'Farmstead Hospitality'],
    ['Currency', 'ZAR'],
    ['Timezone', 'Africa/Johannesburg'],
    ['AI Mode', 'Draft-first with mandatory logging'],
    ['Production Scope', 'Farmstead Phase 1 only'],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF5]">Settings</h1>
        <p className="mt-1 text-sm text-[#9BA7B8]">MVP operating defaults and governance boundaries.</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <ShieldCheck className="h-4 w-4 text-[#2BB8A5]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#E6EDF5]">Operational Controls</span>
        </div>
        <div className="divide-y divide-white/10">
          {settings.map(([label, value]) => (
            <div key={label} className="grid gap-2 px-4 py-3 md:grid-cols-[220px_1fr]">
              <div className="text-xs uppercase tracking-widest text-[#617089]">{label}</div>
              <div className="text-sm text-[#E6EDF5]">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
