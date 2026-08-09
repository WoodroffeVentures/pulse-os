import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';
import { mockTasks } from '@/lib/mock-data';

export async function listTasks(organizationId: string) {
  if (!isSupabaseConfigured()) {
    return { rows: mockTasks, source: 'demo' as const };
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return { rows: data ?? [], source: 'live' as const };
}

export async function createTask(task: {
  organization_id: string;
  property_id?: string;
  title: string;
  category: string;
  priority: string;
  due_at?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase.from('tasks').insert(task).select().single();
  if (error) throw new Error(error.message);
  return data;
}
