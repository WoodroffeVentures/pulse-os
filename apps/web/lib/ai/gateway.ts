import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface AIGatewayRequest {
  template: string;
  context: Record<string, unknown>;
  riskLevel: RiskLevel;
  organizationId: string;
  propertyId?: string;
}

interface AIGatewayResponse<T> {
  output: T;
  confidence: number;
  evidence: string[];
  requiresApproval: boolean;
  logId?: string;
}

const APPROVAL_THRESHOLD: Record<RiskLevel, boolean> = {
  low: false,
  medium: true,
  high: true,
  critical: true,
};

export async function callAIGateway<T>(
  request: AIGatewayRequest,
  schema: z.ZodType<T>
): Promise<AIGatewayResponse<T>> {
  const { template, context, riskLevel } = request;
  const requiresApproval = APPROVAL_THRESHOLD[riskLevel];

  // All AI calls go through this gateway — never direct from UI components
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const systemPrompt = `You are an AI assistant for PULSE Hospitality OS.
You assist hospitality operators at Farmstead Hospitality managing 4 properties:
Woody's Cottage, Swallows Nest Studio, Meadows Cottage, and Jackals Rest.
Risk level for this request: ${riskLevel}
Rules: Be concise. Never invent facts. Cite evidence. Return valid JSON only — no markdown, no explanation.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: JSON.stringify({ template, context }),
      },
    ],
  });

  const raw =
    response.content[0].type === 'text' ? response.content[0].text : '';

  let output: T;
  try {
    const parsed = JSON.parse(raw);
    output = schema.parse(parsed);
  } catch {
    throw new Error(
      `AI output validation failed for template: ${template}. Raw: ${raw.slice(0, 200)}`
    );
  }

  return {
    output,
    confidence: 0.8,
    evidence: [],
    requiresApproval,
  };
}

// Prompt templates
export const promptTemplates = {
  guest_welcome_whatsapp: (ctx: {
    guestName: string;
    propertyName: string;
    checkIn: string;
    wifiNetwork: string;
  }) =>
    `Draft a warm WhatsApp welcome message for ${ctx.guestName} arriving at ${ctx.propertyName} on ${ctx.checkIn}. Include WiFi: ${ctx.wifiNetwork}. Keep it under 100 words and friendly. Return JSON: {"message": "..."}`,

  review_response: (ctx: {
    rating: number;
    reviewText: string;
    propertyName: string;
  }) =>
    `Draft a professional response to this ${ctx.rating}-star review for ${ctx.propertyName}: "${ctx.reviewText}". Be genuine, address specific points, invite return visit. Under 80 words. Return JSON: {"response": "..."}`,

  low_occupancy_action_plan: (ctx: {
    propertyName: string;
    gapNights: number;
    nextBooking: string;
  }) =>
    `${ctx.propertyName} has ${ctx.gapNights} gap nights before ${ctx.nextBooking}. Suggest 3 specific actions to fill this gap. Return JSON: {"actions": [{"title": "...", "description": "...", "platform": "..."}]}`,
};
