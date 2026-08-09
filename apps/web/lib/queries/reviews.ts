import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';
import { mockReviews } from '@/lib/mock-data';

export async function listReviews(organizationId: string) {
  if (!isSupabaseConfigured()) {
    return { rows: mockReviews, source: 'demo' as const };
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('organization_id', organizationId)
    .order('review_date', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return { rows: data ?? [], source: 'live' as const };
}
