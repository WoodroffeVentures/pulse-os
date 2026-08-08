import { roadmapModules } from '@/lib/mock-data';
import { Lock, ShieldCheck } from 'lucide-react';

interface LockedModulePageProps {
  slug: string;
}

export function LockedModulePage({ slug }: LockedModulePageProps) {
  const module = roadmapModules.find((item) => item.slug === slug);

  if (!module) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[#C6A66B]">
            Phase {module.phase} · Strategic Expansion
          </div>
          <h1 className="mt-2 text-xl font-semibold text-[#E6EDF5]">
            {module.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#9BA7B8]">
            {module.promise}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded border border-white/10 bg-[#08111f] px-3 py-2 text-xs text-[#9BA7B8]">
          <Lock className="h-3.5 w-3.5 text-[#C6A66B]" />
          Locked roadmap surface
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Audience', module.audience],
          ['Current State', 'Read-only narrative and investor/government demo context.'],
          ['Production Rule', 'Do not enable workflows until this phase is explicitly activated.'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-white/10 bg-[#08111f] p-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-[#617089]">
              {label}
            </div>
            <div className="mt-3 text-sm leading-6 text-[#E6EDF5]">{value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-white/10 bg-[#08111f]">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <ShieldCheck className="h-4 w-4 text-[#2BB8A5]" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#E6EDF5]">
            Future Architecture Placeholder
          </h2>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-2">
          <div className="rounded border border-white/10 bg-[#020912] p-4">
            <div className="text-xs font-semibold text-[#E6EDF5]">Data Spine</div>
            <p className="mt-2 text-xs leading-5 text-[#9BA7B8]">
              This phase will attach to the same organization, property, business,
              opportunity, evidence, action and outcome model.
            </p>
          </div>
          <div className="rounded border border-white/10 bg-[#020912] p-4">
            <div className="text-xs font-semibold text-[#E6EDF5]">Governance</div>
            <p className="mt-2 text-xs leading-5 text-[#9BA7B8]">
              AI can recommend, classify and draft. Human approval remains required
              for public, legal, financial and operational commitments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
