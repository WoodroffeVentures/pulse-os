import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

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

  const {
    title, description, opportunity_type, target_property_id,
    proposer_business_id, revenue_share_proposer, foc,
    organization_id, district, province,
  } = body as Record<string, unknown>;

  if (!title || !opportunity_type || !target_property_id || !proposer_business_id || !organization_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Verify the proposer belongs to this org
  const { data: member } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', organization_id)
    .eq('user_id', user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Score the opportunity deterministically before inserting
  const viabilityRes = await fetch(new URL('/api/ai/viability', request.url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      signals: { foc: foc ?? true, has_business_profile: true, has_description: !!description },
    }),
  });
  const viability = viabilityRes.ok ? await viabilityRes.json() : { score: 50, confidence: 0.58, recommendation: 'hold' };

  // Insert opportunity
  const { data: opp, error: oppErr } = await supabase
    .from('opportunities')
    .insert({
      organization_id,
      title,
      opportunity_type,
      district: district ?? null,
      province: province ?? 'KwaZulu-Natal',
      description: description ?? null,
      status: 'open',
    })
    .select()
    .single();

  if (oppErr || !opp) {
    return NextResponse.json({ error: 'Failed to create opportunity', detail: oppErr?.message }, { status: 500 });
  }

  // Insert pitch as a participation record
  const { data: pitch, error: pitchErr } = await supabase
    .from('participation_records')
    .insert({
      organization_id,
      opportunity_id: opp.id,
      business_profile_id: proposer_business_id,
      status: 'identified',
      owner_user_id: user.id,
      evidence: {
        target_property_id,
        revenue_share_proposer: revenue_share_proposer ?? 40,
        foc: foc ?? true,
        viability_score: viability.score,
        viability_confidence: viability.confidence,
        viability_recommendation: viability.recommendation,
        pitched_at: new Date().toISOString(),
      },
    })
    .select()
    .single();

  if (pitchErr) {
    return NextResponse.json({ error: 'Failed to record pitch', detail: pitchErr?.message }, { status: 500 });
  }

  // Audit log
  await supabase.from('event_log').insert({
    event_type: 'opportunity.pitched',
    organization_id,
    actor_type: 'user',
    actor_id: user.id,
    payload: { opportunity_id: opp.id, pitch_id: pitch.id, viability_score: viability.score },
  });

  return NextResponse.json({ opportunity: opp, pitch, viability }, { status: 201 });
}
