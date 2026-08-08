# Edge Functions Plan

## `ical-sync`

Reads enabled `ical_feeds`, fetches calendar events server-side, normalizes them into bookings and writes sync logs. MVP can run manually from Supabase or a scheduled trigger.

## `ai-gateway`

Single server-side AI boundary. Accepts prompt template ID and structured payload, calls Anthropic or OpenAI, validates JSON output and writes `ai_action_logs`.

## `nightly-brief`

Generates tomorrow's draft operating brief from bookings, tasks, reviews, work items and knowledge risk signals.

## Placeholders

- `google-integrations`: Google Business Profile, Maps and review ingestion.
- `whatsapp-webhooks`: inbound/outbound WhatsApp audit boundary.
- `review-ingestion`: platform review import and deduplication.

All functions must enforce tenant scope, use service role only server-side, and avoid public publication or automatic guest messaging.

