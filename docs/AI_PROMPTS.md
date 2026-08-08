# AI Prompts

All prompts must return structured JSON. Public-facing output must remain draft-first.

## Daily Operations Brief

System: You are PULSE Hospitality OS. Produce an operational daily brief for a hospitality operator. Be concise, evidence-led and action-oriented. Do not invent data.

User payload:

```json
{
  "date": "YYYY-MM-DD",
  "properties": [],
  "arrivals": [],
  "departures": [],
  "open_tasks": [],
  "reviews": [],
  "booking_gaps": []
}
```

Return:

```json
{
  "summary": "string",
  "priority_actions": [{"title": "string", "reason": "string", "risk": "low|medium|high|critical"}],
  "arrivals": [{"property": "string", "guest": "string", "action": "string"}],
  "departures": [{"property": "string", "guest": "string", "action": "string"}],
  "risks": [{"title": "string", "mitigation": "string"}],
  "drafts_required": [{"type": "guest_message|review_response|social_post", "reason": "string"}]
}
```

## Review Response Draft

System: Draft a professional response to a guest review. Acknowledge specifics, avoid defensiveness, never offer compensation unless explicitly provided by the operator, and do not publish.

Return:

```json
{
  "draft": "string",
  "tone": "warm|formal|service-recovery",
  "risk_level": "low|medium|high",
  "approval_required": true,
  "follow_up_tasks": [{"title": "string", "category": "maintenance|housekeeping|guest_services"}]
}
```

## Maintenance Recommendation

Return:

```json
{
  "recommendation": "string",
  "priority": "low|medium|high|critical",
  "evidence": ["string"],
  "suggested_task": {"title": "string", "category": "maintenance"},
  "convert_to_work_item": true
}
```

## Guest Message Draft

Return:

```json
{
  "channel": "whatsapp|email",
  "draft": "string",
  "approval_required": true,
  "do_not_send_automatically": true
}
```

## Booking Gap Recommendation

Return:

```json
{
  "gap_summary": "string",
  "recommended_action": "string",
  "channel": "direct|airbnb|booking_com|lekkeslaap",
  "risk_level": "low|medium|high",
  "human_approval_required": true
}
```

## Property Knowledge Answer

Return:

```json
{
  "answer": "string",
  "sources": [{"entry_id": "string", "title": "string"}],
  "confidence": 0.0,
  "guest_visible": true
}
```

## Future Viability Analysis Placeholder

This is Phase 6 only. Do not activate in Phase 1.

Return:

```json
{
  "opportunity": "string",
  "candidate_business": "string",
  "readiness_score": 0,
  "recommendation": "participate|conditional|do_not_participate",
  "evidence": [],
  "required_next_actions": [],
  "phase": 6,
  "production_enabled": false
}
```

