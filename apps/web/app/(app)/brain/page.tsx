'use client';

import { useMemo, useState, useEffect } from 'react';
import { listBrainEntries } from '@/lib/queries/brain';
import { listProperties } from '@/lib/queries/properties';
import { StatusBadge } from '@/components/ui/status-badge';
import { Search } from 'lucide-react';
import { useOrg } from '@/lib/context/org-context';



export default function BrainPage() {
  const { orgId } = useOrg();
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [source, setSource] = useState<'live' | 'demo'>('demo');

  useEffect(() => {
    Promise.all([listBrainEntries(orgId ?? ''), listProperties(orgId ?? '')])
      .then(([b, p]) => { setEntries(b.rows); setProperties(p.rows); setSource(b.source); })
      .catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return entries.filter(
      (entry: any) =>
        entry.title.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q)
    );
  }, [query, entries]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF5]">Brain / Knowledge Base</h1>
        <p className="mt-1 text-sm text-[#9BA7B8]">Searchable operating knowledge, SOPs, WiFi, guest guide copy and lessons learned.</p>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#08111f] px-3 py-2">
        <Search className="h-4 w-4 text-[#9BA7B8]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Farmstead knowledge..."
          className="w-full bg-transparent text-sm text-[#E6EDF5] outline-none placeholder:text-[#9BA7B8]"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((entry: any) => {
          const property = properties.find((item: any) => item.id === entry.property_id);
          return (
            <article key={entry.id} className="rounded-lg border border-white/10 bg-[#08111f] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-[#E6EDF5]">{entry.title}</h2>
                  <div className="mt-1 text-xs text-[#9BA7B8]">{property?.name ?? 'Portfolio-wide'}</div>
                </div>
                <StatusBadge status={entry.guest_visible ? 'active' : 'draft'} />
              </div>
              <p className="mt-3 text-xs leading-5 text-[#9BA7B8]">{entry.content}</p>
              <div className="mt-4">
                <StatusBadge status={entry.category} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
