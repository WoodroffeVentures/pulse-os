'use client';
import { useState, useEffect } from 'react';
import { listBrainEntries } from '@/lib/queries/brain';
import { listProperties } from '@/lib/queries/properties';
import { StatusBadge } from '@/components/ui/status-badge';
import { BookOpen } from 'lucide-react';

const ORG_ID = 'a1b2c3d4-0001-0001-0001-000000000001';

export default function GuestGuidesPage() {
  const [brainEntries, setBrainEntries] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([listBrainEntries(ORG_ID), listProperties(ORG_ID)])
      .then(([b, p]) => { setBrainEntries(b.rows); setProperties(p.rows); })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF5]">Guest Guides</h1>
        <p className="mt-1 text-sm text-[#9BA7B8]">Published guide surfaces are separated from private operating knowledge.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {properties.map((property: any) => {
          const entries = brainEntries.filter(
            (entry: any) => (entry.property_id === property.id || !entry.property_id) && entry.guest_visible
          );

          return (
            <div key={property.id} className="rounded-lg border border-white/10 bg-[#08111f] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#C6A66B]" />
                  <h2 className="text-sm font-semibold text-[#E6EDF5]">{property.name}</h2>
                </div>
                <StatusBadge status="draft" />
              </div>
              <div className="mt-4 space-y-2">
                {entries.map((entry: any) => (
                  <div key={entry.id} className="rounded border border-white/10 bg-[#020912] px-3 py-2">
                    <div className="text-xs font-medium text-[#E6EDF5]">{entry.title}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-[#617089]">{entry.category}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-[#9BA7B8]">
                Public publishing is disabled until the guide is reviewed and explicitly approved.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
