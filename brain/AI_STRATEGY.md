# AI STRATEGY
*AI routing logic, cost controls, UX invisibility rules, and governance framework. Updated: 2026-05-31.*

---

## Core Principle

AI providers are invisible infrastructure. PULSE is the product. Users never see a model name.

**Internal:** AI response, AI recommendation, AI-generated draft  
**User-facing:** PULSE Insight, PULSE Recommendation, PULSE Draft, PULSE Alert, PULSE Opportunity

---

## Task-to-Model Routing

| Task | Model | Cost Tier | Risk Level | Approval Required |
|------|-------|-----------|------------|-------------------|
| Nightly brief generation | Claude Sonnet | Medium | Low | No (auto-apply) |
| Trust score explanation | Claude Sonnet | Medium | Low | No |
| Review response draft | Claude Sonnet | Medium | High | Yes — always |
| Guest WhatsApp draft | Claude Sonnet | Medium | Medium | Yes |
| Opportunity analysis | Claude Sonnet | Medium | High | Yes |
| Social media captions | Gemini Flash | Low | Low | Yes (first run) |
| Property descriptions | Gemini Flash | Low | Low | No (auto-apply) |
| Guest guide copy | Gemini Flash | Low | Low | No |
| Discovery descriptions | Gemini Flash | Low | Low | No |
| Sentiment classification | Rules + cheap model | Minimal | Low | No |
| Tag extraction | Rules + cheap model | Minimal | Low | No |
| iCal event parsing | Rules (no AI) | Zero | Low | No |
| Conflict detection | Rules (no AI) | Zero | Low | No |

---

## Risk Level Governance

| Risk Level | Definition | Approval Gate | Audit Log |
|------------|-----------|---------------|-----------|
| Low | Internal summaries, classifications, suggestions | Auto-apply | Yes |
| Medium | Guest-facing drafts, recommendations | Human review required | Yes |
| High | Public responses, pricing, cancellations, legal | Human approval required | Yes — immutable |
| Critical | Financial commitments, legal actions, infrastructure | Cannot be AI-initiated | Yes — immutable |

---

## AI Cost Architecture

**Target:** AI expenditure ≤ 15% of platform revenue

**Per-tenant monthly budget limits:**
- Starter tier: R50/month AI budget (approx 50k tokens)
- Professional tier: R150/month AI budget (approx 150k tokens)
- Enterprise: Custom budget with monitoring

**Cost monitoring:**
- All AI calls log to `ai_action_logs` with token count and model
- Monthly per-tenant cost calculated automatically
- Owner notified if projected to exceed budget
- Cheapest capable model always used — no quality padding

**Token efficiency rules:**
1. Prompts use structured templates with minimal repetition
2. Context passed is minimal — only what the model needs
3. Summaries are preferred over full document passes
4. Batch classification tasks to reduce API call overhead

---

## AI Governance Framework

### Audit Trail
Every AI call creates an `ai_action_logs` record:
```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "property_id": "uuid",
  "action_type": "review_response_draft",
  "risk_level": "high",
  "model_used": "claude-sonnet-4-6",
  "tokens_used": 847,
  "cost_usd": 0.0042,
  "prompt_template": "review_response_v2",
  "input_summary": "3-star review mentioning hot water",
  "output_preview": "We sincerely apologise...",
  "status": "pending_approval",
  "approved_by": null,
  "approved_at": null,
  "created_at": "2026-05-31T08:00:00Z"
}
```

### Approval Queue
Medium and high-risk AI outputs enter an approval queue visible in the Morning Brief and AI Brief pages. Operators can:
- Approve → output is applied (sent, published, or saved)
- Edit → open draft for modification, then approve
- Dismiss → output is discarded (logged but not applied)

No approval action expires automatically. Outputs remain in queue until explicitly actioned.

### Prompt Template Versioning
All prompt templates are versioned. Template changes are logged. If an output quality regression is detected, the previous template version can be restored.

---

## AI UX Rules

1. AI outputs always show confidence score when above threshold (>60%)
2. AI outputs always show what evidence was used
3. AI outputs that are high-risk show a clear "Requires your approval" label
4. The AI doctrine footer appears on every AI-heavy page: "AI Assists · Humans Govern · Evidence Decides"
5. No loading spinner that says "AI thinking" — use "PULSE is preparing your brief..."
6. No apology language in AI outputs — PULSE outputs are professional and direct

---

## Hallucination Mitigation

1. Review responses are grounded in the actual review text — not generated freely
2. Recommendations include evidence cited ("Based on 3 reviews mentioning WiFi...")
3. Medium+ risk outputs include a "What this is based on" section
4. Trust scores show their component breakdown — no black box
5. All recommendations from the Opportunity Intelligence layer show readiness evidence
