-- Migration 0016: fix pilot_interest service_role grant
-- Migration 0014 revoked all on pilot_interest then only re-granted anon/authenticated.
-- service_role needs SELECT/UPDATE/DELETE to support admin queries and monitoring.

GRANT SELECT, UPDATE, DELETE ON pilot_interest TO service_role;
