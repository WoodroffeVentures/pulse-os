-- Grant SELECT, INSERT, UPDATE, DELETE to authenticated role on all public tables.
-- RLS policies control row-level access; these grants allow column-level access via PostgREST.
-- anon role gets no grants — unauthenticated users cannot access any table.

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'organizations','organization_members','properties','property_users','property_settings',
    'room_types','units','rate_plans','rate_calendar','inventory_ledger',
    'reservations','reservation_rooms','reservation_audit','booking_holds',
    'folios','folio_items','payments','channels','channel_connections','channel_room_mapping',
    'guests','bookings','housekeeping_tasks','room_status_log','online_checkins',
    'ical_feeds','ical_sync_sources','guests','guest_communications','guest_notes',
    'brain_entries','property_assets','property_guides','property_knowledge',
    'tasks','work_items','workflows','workflow_definitions',
    'notifications','event_log','platform_events',
    'reviews','review_requests','promo_codes','payment_links',
    'invoices','finance_records','ai_recommendations','ai_action_logs',
    'opportunities','local_attractions','social_campaigns',
    'consent_records','booking_agents','booking_engine_config',
    'jv_accounts','jv_revenue_events','viability_analyses',
    'integration_accounts','integration_sync_logs',
    'offline_import_batches','offline_import_records',
    'corporate_accounts','operational_assets','participation_records',
    'business_profiles','message_log','guest_messages',
    'folio_items','folios'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename=t) THEN
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    END IF;
  END LOOP;
END $$;

-- Grant usage on sequences for INSERT with serial/gen_random_uuid PKs
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
