import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';

type Decision = 'accepted' | 'declined' | 'conditional' | 'request_presentation';

const VALID_DECISIONS: Decision[] = ['accepted', 'declined', 'conditional', 'request_presentation'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { id: opportunityId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { decision, conditions, organization_id } = body as Record<string, unknown>;

  if (!VALID_DECISIONS.includes(decision as Decision)) {
    return NextResponse.json({ error: `decision must be one of: ${VALID_DECISIONS.join(', ')}` }, { status: 400 });
  }

  if (!organization_id) {
    return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
  }

  // Verify the decision-maker is a member of the org that owns the target property
  const { data: member } = await supabase
    .from('organization_members')
    .select('id, role')
    .eq('organization_id', organization_id)
    .eq('user_id', user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Map decision to participation status
  const statusMap: Record<Decision, string> = {
    accepted: 'jv_pending',
    declined: 'declined',
    conditional: 'conditional',
    request_presentation: 'presentation_requested',
  };

  const { data: pitch, error: pitchErr } = await supabase
    .from('participation_records')
    .update({
      status: statusMap[decision as Decision],
      updated_at: new Date().toISOString(),
    })
    .eq('opportunity_id', opportunityId)
    .select()
    .single();

  if (pitchErr || !pitch) {
    return NextResponse.json({ error: 'Pitch not found or update failed', detail: pitchErr?.message }, { status: 404 });
  }

  // Merge conditions into evidence JSON
  if (decision === 'conditional' && conditions) {
    await supabase
      .from('participation_records')
      .update({
        evidence: { ...pitch.evidence, conditions, conditions_set_at: new Date().toISOString() },
      })
      .eq('id', pitch.id);
  }

  // If accepted, open a JV account
  if (decision === 'accepted') {
    await supabase.from('jv_accounts').insert({
      organization_id,
      opportunity_id: opportunityId,
      participation_id: pitch.id,
      status: 'active',
      opened_at: new Date().toISOString(),
    });
  }

  // Audit log
  await supabase.from('event_log').insert({
    event_type: `opportunity.${decision}`,
    organization_id,
    actor_type: 'user',
    actor_id: user.id,
    payload: { opportunity_id: opportunityId, pitch_id: pitch.id, decision, conditions: conditions ?? null },
  });

  return NextResponse.json({ pitch, decision }, { status: 200 });
}
