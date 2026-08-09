import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';
import { farmsteadProperties, mockBookings, mockTasks } from '@/lib/mock-data';

export async function listProperties(organizationId: string) {
  if (!isSupabaseConfigured()) {
    return { rows: farmsteadProperties, source: 'demo' as const };
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name');
  if (error) throw new Error(error.message);
  return { rows: data ?? [], source: 'live' as const };
}

export async function getPropertyWithStats(propertyId: string) {
  if (!isSupabaseConfigured()) {
    const prop = farmsteadProperties.find(p => p.id === propertyId) ?? farmsteadProperties[0];
    const bookings = mockBookings.filter(b => b.property_id === propertyId);
    const tasks = mockTasks.filter(t => t.property_id === propertyId && t.status !== 'completed');
    return { property: prop, bookings, tasks, source: 'demo' as const };
  }
  const supabase = createClient();
  const [propRes, bookRes, taskRes] = await Promise.all([
    supabase.from('properties').select('*').eq('id', propertyId).single(),
    supabase.from('bookings').select('*').eq('property_id', propertyId).order('check_in_date', { ascending: false }).limit(20),
    supabase.from('tasks').select('*').eq('property_id', propertyId).neq('status', 'completed').order('created_at', { ascending: false }),
  ]);
  if (propRes.error) throw new Error(propRes.error.message);
  return {
    property: propRes.data,
    bookings: bookRes.data ?? [],
    tasks: taskRes.data ?? [],
    source: 'live' as const,
  };
}
