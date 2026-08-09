import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';
import { brainEntries } from '@/lib/mock-data';

export async function listBrainEntries(organizationId: string, propertyId?: string) {
  if (!isSupabaseConfigured()) {
    const rows = propertyId
      ? brainEntries.filter(e => e.property_id === propertyId || !e.property_id)
      : brainEntries;
    return { rows, source: 'demo' as const };
  }
  const supabase = createClient();
  let q = supabase
    .from('brain_entries')
    .select('*')
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false });
  if (propertyId) q = q.eq('property_id', propertyId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return { rows: data ?? [], source: 'live' as const };
}

export async function createBrainEntry(entry: {
  organization_id: string;
  property_id?: string;
  category: string;
  title: string;
  content: string;
  tags?: string[];
  guest_visible?: boolean;
  source?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase.from('brain_entries').insert(entry).select().single();
  if (error) throw new Error(error.message);
  return data;
}
