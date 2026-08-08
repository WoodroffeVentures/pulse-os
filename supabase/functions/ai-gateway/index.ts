import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

type AiGatewayRequest = {
  organization_id: string;
  property_id?: string;
  prompt_template_id: string;
  payload: Record<string, unknown>;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
};

serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = (await request.json()) as AiGatewayRequest;

  if (!body.organization_id || !body.prompt_template_id) {
    return Response.json({ error: 'organization_id and prompt_template_id are required' }, { status: 400 });
  }

  return Response.json({
    status: 'draft',
    approval_required: true,
    message: 'AI gateway contract is ready. Wire provider call and ai_action_logs insert before production use.',
    request: {
      organization_id: body.organization_id,
      property_id: body.property_id,
      prompt_template_id: body.prompt_template_id,
      risk_level: body.risk_level ?? 'medium',
    },
  });
});

