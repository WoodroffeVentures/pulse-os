# Database Plan

## Core Tables

- `organizations`
- `organization_members`
- `properties`
- `property_users`
- `units`
- `guests`
- `bookings`
- `tasks`
- `reviews`
- `ai_recommendations`
- `ai_action_logs`
- `integration_accounts`
- `integration_sync_logs`
- `event_log`

## Phase 1 Extension Tables

- `ical_feeds`
- `work_items`
- `brain_entries`
- `property_assets`
- `guest_communications`
- `guest_notes`
- `review_requests`
- `property_guides`
- `operational_assets`
- `offline_import_batches`
- `offline_import_records`

## RLS Requirements

- Every tenant table must contain `organization_id` or inherit access through a property.
- Members may only read rows for their organization.
- Property-scoped staff may only access assigned properties.
- Public guest guide routes may only read explicitly published guide content.
- Service-role edge functions may write integration logs but must not expose secrets to the client.

## iCal Feed Model

Each feed belongs to an organization and property. Required fields:

- provider
- feed URL
- sync status
- last sync timestamp
- last error
- last event hash
- enabled flag

Imported bookings must store provider, external booking ID, dates, guest display name when available and a raw payload summary.

## Knowledge / Brain Model

All operational knowledge belongs in `brain_entries` or `operational_assets`:

- house manuals
- SOPs
- WiFi
- appliance notes
- maintenance lessons
- guest guide copy
- private operating notes

Every entry must support search and a `guest_visible` flag.

## Works Register

`work_items` is for durable repairs and improvements. Short tasks stay in `tasks`. If an issue needs history, spend, supplier, evidence or repeated follow-up, it becomes a work item.

