-- seed.sql — Farmstead Hospitality production seed data

-- Organization
INSERT INTO organizations (id, name, default_currency, subscription_plan) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Farmstead Hospitality', 'ZAR', 'professional')
ON CONFLICT (id) DO NOTHING;

-- 4 Properties
INSERT INTO properties (id, organization_id, name, property_type, status, google_maps_url, operational_email) VALUES
  ('b1b2c3d4-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'Woody''s Cottage',      'cottage', 'active', 'https://maps.app.goo.gl/fcWPWnpqP4tP3MfS9', NULL),
  ('b1b2c3d4-0001-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000001', 'Swallows Nest Studio', 'studio',  'active', 'https://maps.app.goo.gl/AMQ7izhTSbrkVqRg7', NULL),
  ('b1b2c3d4-0001-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000001', 'Meadows Cottage',      'cottage', 'active', 'https://maps.app.goo.gl/fcWPWnpqP4tP3MfS9', NULL),
  ('b1b2c3d4-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001', 'Jackals Rest',         'cottage', 'active', 'https://maps.app.goo.gl/k1Y3mPrm7cDkLwKL6', 'jackalsrest@gmail.com')
ON CONFLICT (id) DO NOTHING;

-- iCal sources for Jackals Rest
INSERT INTO ical_sync_sources (property_id, organization_id, platform, ical_url) VALUES
  ('b1b2c3d4-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001', 'booking_com', 'https://ical.booking.com/v1/export?t=0d8f6bd9-52fb-4229-8fd8-d371651c89d7'),
  ('b1b2c3d4-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001', 'airbnb',      'https://www.airbnb.ae/calendar/ical/53438771.ics?t=a30a63d356674ae193dbc77de22694fd'),
  ('b1b2c3d4-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001', 'lekkeslaap',  'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=VVRWRDg0SjJyWWJzZmNYeUp2dVdWZz09')
ON CONFLICT DO NOTHING;

-- Property knowledge for Jackals Rest
INSERT INTO property_knowledge (property_id, organization_id, category, title, content, is_guest_visible) VALUES
  ('b1b2c3d4-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001', 'wifi',        'WiFi Access',                 'Network: JoyWood Farm | Guest Network: JoyWood Farm Guest', true),
  ('b1b2c3d4-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001', 'instruction', 'Fireplace Instructions',      'Stack logs in a crisscross pattern. Open flue fully before lighting. Use firelighters at the base. Allow 10 minutes before closing flue to 3/4 position.', true),
  ('b1b2c3d4-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001', 'instruction', 'Fireplace Smoke Prevention',  'Always ensure flue is fully open before lighting. Do not use wet wood. If smoke enters room, fully open flue and open nearest window briefly.', true),
  ('b1b2c3d4-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001', 'instruction', 'Sliding Door Key Warning',    'The sliding door key must be removed after locking. Do not leave in lock overnight — key can stick in cold weather.', true),
  ('b1b2c3d4-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001', 'appliance',   'TV Remote Instructions',      'Main TV remote is on the coffee table. Press INPUT to switch between HDMI sources. HDMI 1 = DStv decoder. HDMI 2 = streaming stick.', true),
  ('b1b2c3d4-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001', 'checkin',     'Check-In Procedure',          'Key lockbox is at the front gate, code provided via WhatsApp. Self check-in. Check-in from 14:00, checkout by 10:00.', true),
  ('b1b2c3d4-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001', 'appliance',   'AC Remote Location',          'The AC remote is kept in the bedside table drawer. Press MODE to toggle between cooling and heating. Default setting: 22°C cooling.', true)
ON CONFLICT DO NOTHING;

-- Property knowledge for Swallows Nest Studio
INSERT INTO property_knowledge (property_id, organization_id, category, title, content, is_guest_visible) VALUES
  ('b1b2c3d4-0001-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000001', 'wifi',    'WiFi Access',        'Network: JoyWood Farm | Guest Network: JoyWood Farm Guest', true),
  ('b1b2c3d4-0001-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000001', 'checkin', 'Check-In Procedure', 'Key lockbox at studio entrance, code sent via WhatsApp. Check-in from 14:00, checkout by 10:00.', true)
ON CONFLICT DO NOTHING;

-- Default workflows
INSERT INTO workflow_definitions (organization_id, name, trigger_event, actions) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Pre-Arrival Checklist', 'booking.created',
   '[{"type":"create_task","category":"housekeeping","title":"Pre-arrival clean and inspection","priority":"high","offset_hours":-24},{"type":"create_task","category":"guest_services","title":"Prepare welcome guide and keys","priority":"medium","offset_hours":-4},{"type":"generate_ai_draft","template":"guest_welcome_whatsapp","risk":"low"}]'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Post-Checkout Protocol', 'guest.checked_out',
   '[{"type":"create_task","category":"housekeeping","title":"Full checkout clean and inventory check","priority":"high","offset_hours":0},{"type":"create_task","category":"maintenance","title":"Post-stay inspection","priority":"medium","offset_hours":2}]'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Negative Review Response', 'review.negative_detected',
   '[{"type":"escalate","level":"manager"},{"type":"generate_ai_draft","template":"review_response","risk":"high"},{"type":"create_task","category":"compliance","title":"Investigate root cause of negative review","priority":"high"}]')
ON CONFLICT DO NOTHING;

-- Farmstead MVP iCal feeds
INSERT INTO ical_feeds (organization_id, property_id, provider, feed_url, sync_status) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000004', 'booking_com', 'https://ical.booking.com/v1/export?t=placeholder-jackals-booking', 'pending'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000004', 'airbnb', 'https://www.airbnb.com/calendar/ical/placeholder-jackals.ics', 'pending'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000004', 'lekkeslaap', 'https://www.lekkeslaap.co.za/suppliers/icalendar.ics?t=placeholder-jackals', 'pending')
ON CONFLICT DO NOTHING;

-- Farmstead MVP brain entries
INSERT INTO brain_entries (organization_id, property_id, category, title, content, tags, guest_visible, source) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000004', 'wifi', 'Jackals Rest WiFi', 'Network: JoyWood Farm Guest. Keep router powered during loadshedding checks. Escalate repeated dropouts to maintenance before guest arrival.', ARRAY['wifi','jackals-rest'], true, 'seed'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000004', 'sop', 'Jackals Rest fireplace procedure', 'Open flue fully before lighting. Use dry wood only. If smoke enters the room, open the flue and nearest window, then log a maintenance note.', ARRAY['fireplace','sop'], true, 'seed'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000002', 'maintenance', 'Swallows Nest hot water watch item', 'Recent guest feedback mentioned hot water delay. Inspect geyser timer and pressure before next arrival. If repeated, convert to works item.', ARRAY['hot-water','maintenance'], false, 'seed'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000001', 'lesson', 'Woody''s Cottage WiFi improvement', 'Bedroom WiFi signal is a known improvement opportunity. Add repeater before peak holiday season and mention upgrade in review response draft.', ARRAY['wifi','improvement'], false, 'seed'),
  ('a1b2c3d4-0001-0001-0001-000000000001', null, 'local_recommendation', 'Local recommendations baseline', 'Maintain a curated local guide covering restaurants, cafes, farm stalls, walking routes, family activities, emergency contacts and rainy-day options.', ARRAY['local-guide','guest-experience'], true, 'seed')
ON CONFLICT DO NOTHING;

-- Sample bookings
INSERT INTO guests (id, organization_id, first_name, last_name, email, phone, country, notes) VALUES
  ('c1b2c3d4-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'Sarah', 'Thompson', 'sarah.thompson@example.com', '+27821234567', 'South Africa', 'Repeat guest. Prefers fireplace units.'),
  ('c1b2c3d4-0001-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000001', 'Priya', 'Govender', 'priya.govender@example.com', '+27841234567', 'South Africa', 'Travels with child. Send family-friendly recommendations.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO bookings (id, property_id, guest_id, source, check_in_date, check_out_date, status, total_amount, currency, adults, children, special_requests) VALUES
  ('d1b2c3d4-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000004', 'c1b2c3d4-0001-0001-0001-000000000001', 'airbnb', current_date - 1, current_date + 3, 'checked_in', 7400, 'ZAR', 2, 0, 'Firewood requested'),
  ('d1b2c3d4-0001-0001-0001-000000000002', 'b1b2c3d4-0001-0001-0001-000000000002', 'c1b2c3d4-0001-0001-0001-000000000002', 'direct', current_date, current_date + 4, 'confirmed', 5600, 'ZAR', 2, 1, 'Family-friendly recommendations')
ON CONFLICT (id) DO NOTHING;

-- Works register
INSERT INTO work_items (organization_id, property_id, title, description, category, status, priority, estimated_cost, lessons_learned) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000002', 'Stabilise Swallows Nest hot water', 'Investigate geyser timer, water pressure and guest-facing instruction clarity.', 'maintenance', 'open', 'high', 1800, 'Guest review mentioned slow response time; inspect before next arrival.'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000001', 'Improve bedroom WiFi signal', 'Install repeater or mesh node for Woody''s Cottage bedroom area.', 'improvement', 'scoped', 'medium', 1200, 'Review response should mention upgrade once complete.')
ON CONFLICT DO NOTHING;

-- Property guide shell
INSERT INTO property_guides (organization_id, property_id, title, slug, status, public_share_token, sections) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000004', 'Jackals Rest Guest Guide', 'jackals-rest', 'draft', 'guide_jackals_rest_placeholder',
   '[{"title":"Arrival","items":["Self check-in from 14:00","Lockbox code shared before arrival"]},{"title":"WiFi","items":["Use JoyWood Farm Guest network"]},{"title":"Fireplace","items":["Open flue fully before lighting","Use dry wood only"]}]'::jsonb)
ON CONFLICT DO NOTHING;

-- AI recommendations remain draft-first
INSERT INTO ai_recommendations (organization_id, property_id, recommendation_type, title, body, confidence_score, impact_estimate, risk_level, requires_approval, status) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000002', 'review_response', 'Draft response for Swallows Nest hot water review', 'Acknowledge the hot water issue, explain that it has been escalated, and invite the guest back. Do not publish automatically.', 0.82, 'Protects reputation and shows operational follow-through.', 'medium', true, 'draft'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'b1b2c3d4-0001-0001-0001-000000000003', 'booking_gap', 'Meadows Cottage has a 3-night gap next week', 'Consider a direct repeat-guest offer or LekkeSlaap last-minute promotion.', 0.74, 'May recover otherwise empty nights.', 'low', true, 'draft')
ON CONFLICT DO NOTHING;
