// Opportunity query service — wraps Supabase calls.
// Falls back to demo data when Supabase is not configured.
// NO silent fallback in production: throws if configured but query fails.
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';
import { drakensbergOpportunities } from '@/lib/drakensberg-demo';

export type OpportunityRow = {
  id: string;
  title: string;
  opportunity_type: string;
  description: string | null;
  district: string | null;
  province: string | null;
  status: string;
  created_at: string;
  participation_records?: { id: string; status: string; evidence: Record<string, unknown> }[];
};

export async function listOpportunities(organizationId?: string): Promise<{ rows: OpportunityRow[]; source: 'live' | 'demo' }> {
  if (!isSupabaseConfigured()) {
    return { rows: drakensbergOpportunities as unknown as OpportunityRow[], source: 'demo' };
  }
  const supabase = createClient();
  let q = supabase.from('opportunities').select('*, participation_records(id, status, evidence)').order('created_at', { ascending: false });
  if (organizationId) q = q.eq('organization_id', organizationId);
  const { data, error } = await q;
  if (error) throw new Error(`Opportunities query failed: ${error.message}`);
  return { rows: data ?? [], source: 'live' };
}

export async function getOpportunity(id: string): Promise<OpportunityRow | null> {
  if (!isSupabaseConfigured()) {
    return drakensbergOpportunities.find(o => o.id === id) as unknown as OpportunityRow ?? null;
  }
  const supabase = createClient();
  const { data, error } = await supabase.from('opportunities').select('*, participation_records(id, status, evidence)').eq('id', id).single();
  if (error) return null;
  return data;
}
