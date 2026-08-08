import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';
import { drakensbergBusinesses } from '@/lib/drakensberg-demo';

export type BusinessProfileRow = {
  id: string;
  organization_id: string;
  business_name: string;
  google_place_id: string | null;
  website_url: string | null;
  verification_status: 'unverified' | 'place_matched' | 'email_confirmed' | 'evidence_submitted' | 'claim_pending' | 'claim_reviewed' | 'verified' | 'disputed';
  verified_signals: Record<string, unknown>;
  consistency_score: number | null;
  created_at: string;
  updated_at: string;
};

export async function listBusinessProfiles(organizationId: string): Promise<{ rows: BusinessProfileRow[]; source: 'live' | 'demo' }> {
  if (!isSupabaseConfigured()) {
    return { rows: drakensbergBusinesses as unknown as BusinessProfileRow[], source: 'demo' };
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Business profiles query failed: ${error.message}`);
  return { rows: data ?? [], source: 'live' };
}

export async function upsertBusinessProfile(profile: Partial<BusinessProfileRow> & { organization_id: string; business_name: string }): Promise<BusinessProfileRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('business_profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw new Error(`Business profile upsert failed: ${error.message}`);
  return data;
}
