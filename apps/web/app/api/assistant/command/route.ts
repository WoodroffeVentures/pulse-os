// PULSE ASSISTANT — photo, voice and text command pipeline.
// Accepts image, text or structured command and returns ranked candidates.
// AI is explanation layer only; core matching is deterministic.

import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicKey } from '@/lib/env';

type CommandRequest = {
  type: 'text' | 'photo_description' | 'voice_transcript';
  input: string;
  context?: {
    property_id?: string;
    location?: string;
    user_role?: string;
  };
};

type CommandResult = {
  action_type: 'work_order' | 'service_request' | 'incident' | 'asset_match' | 'place_lookup' | 'unknown';
  confidence: number;
  suggested_title: string;
  suggested_category: string;
  candidates: { label: string; confidence: number; action: string }[];
  requires_confirmation: boolean;
  ai_used: boolean;
  provider: string | null;
  fallback_reason?: string;
};

const KEYWORD_RULES: { keywords: string[]; action_type: CommandResult['action_type']; category: string; title_prefix: string }[] = [
  { keywords: ['leak', 'drip', 'water', 'pipe', 'flood'], action_type: 'work_order', category: 'plumbing', title_prefix: 'Plumbing issue' },
  { keywords: ['bulb', 'light', 'electricity', 'power', 'socket', 'trip'], action_type: 'work_order', category: 'electrical', title_prefix: 'Electrical issue' },
  { keywords: ['broken', 'damaged', 'crack', 'smash', 'shatter'], action_type: 'work_order', category: 'maintenance', title_prefix: 'Damage report' },
  { keywords: ['towel', 'linen', 'soap', 'toilet', 'amenity', 'amenities'], action_type: 'service_request', category: 'housekeeping', title_prefix: 'Amenity request' },
  { keywords: ['noise', 'loud', 'disturbance', 'security', 'unsafe'], action_type: 'incident', category: 'security', title_prefix: 'Security incident' },
  { keywords: ['restaurant', 'food', 'dinner', 'breakfast', 'lunch', 'book'], action_type: 'service_request', category: 'dining', title_prefix: 'Dining request' },
];

function deterministicMatch(input: string): Partial<CommandResult> {
  const lower = input.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      return {
        action_type: rule.action_type,
        confidence: 0.72,
        suggested_title: `${rule.title_prefix}: ${input.slice(0, 60)}`,
        suggested_category: rule.category,
        candidates: [{ label: rule.title_prefix, confidence: 0.72, action: rule.action_type }],
        requires_confirmation: true,
        ai_used: false,
        provider: null,
      };
    }
  }
  return {
    action_type: 'unknown',
    confidence: 0.3,
    suggested_title: `Unclassified: ${input.slice(0, 60)}`,
    suggested_category: 'general',
    candidates: [{ label: 'Create general request', confidence: 0.3, action: 'service_request' }],
    requires_confirmation: true,
    ai_used: false,
    provider: null,
  };
}

async function aiEnhance(input: string, base: Partial<CommandResult>): Promise<Partial<CommandResult>> {
  const apiKey = getAnthropicKey();
  if (!apiKey) {
    return { ...base, fallback_reason: 'AI provider not configured — deterministic match used.' };
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: `You are PULSE ASSISTANT. Classify this property management request into one of: work_order, service_request, incident, asset_match, place_lookup. Return JSON only: {"action_type":"...","suggested_title":"...","suggested_category":"...","confidence":0.0-1.0}\n\nRequest: "${input}"`,
        }],
      }),
    });

    if (!res.ok) throw new Error(`Anthropic error ${res.status}`);
    const data = await res.json();
    const text = data.content?.[0]?.text ?? '';
    const parsed = JSON.parse(text);
    return {
      action_type: parsed.action_type ?? base.action_type,
      suggested_title: parsed.suggested_title ?? base.suggested_title,
      suggested_category: parsed.suggested_category ?? base.suggested_category,
      confidence: Math.max(parsed.confidence ?? 0, base.confidence ?? 0),
      candidates: base.candidates,
      requires_confirmation: true,
      ai_used: true,
      provider: 'anthropic/claude-haiku-4-5',
    };
  } catch {
    return { ...base, fallback_reason: 'AI classification failed — deterministic match used.', ai_used: false, provider: null };
  }
}

export async function POST(request: NextRequest) {
  let body: CommandRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.input || typeof body.input !== 'string') {
    return NextResponse.json({ error: 'input is required' }, { status: 400 });
  }

  const base = deterministicMatch(body.input);
  const result = await aiEnhance(body.input, base);

  return NextResponse.json({
    ...result,
    input_received: body.input.slice(0, 200),
    timestamp: new Date().toISOString(),
  });
}
