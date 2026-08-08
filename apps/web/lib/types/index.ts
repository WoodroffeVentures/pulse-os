export interface Organization {
  id: string;
  name: string;
  slug?: string;
  plan?: 'starter' | 'professional' | 'enterprise';
  subscription_plan?: string;
  default_currency?: string;
  created_at: string;
}

export interface Property {
  id: string;
  organization_id: string;
  name: string;
  type?: 'cottage' | 'studio' | 'guesthouse' | 'hotel' | 'villa' | 'lodge';
  property_type?: string;
  status: 'active' | 'inactive' | 'maintenance';
  google_maps_url?: string;
  airbnb_url?: string;
  operational_email?: string;
  city?: string;
  province?: string;
  google_review_url?: string;
  booking_url?: string;
  lekkeslaap_url?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  organization_id?: string;
  property_id: string;
  guest_id?: string;
  unit_id?: string;
  source: 'airbnb' | 'booking_com' | 'lekkeslaap' | 'direct' | 'other' | 'manual';
  status: 'confirmed' | 'tentative' | 'cancelled' | 'checked_in' | 'checked_out' | 'pending' | 'no_show';
  check_in: string;
  check_out: string;
  check_in_date?: string;
  check_out_date?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  adults?: number;
  children?: number;
  total_amount?: number;
  currency?: string;
  notes?: string;
  external_id?: string;
  external_booking_id?: string;
  created_at: string;
}

export interface Task {
  id: string;
  organization_id: string;
  property_id: string;
  title: string;
  description?: string;
  category: 'housekeeping' | 'maintenance' | 'guest_services' | 'finance' | 'compliance' | 'inspection' | 'operations';
  status: 'open' | 'in_progress' | 'completed' | 'overdue' | 'cancelled' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  assigned_to?: string;
  due_at?: string;
  completed_at?: string;
  booking_id?: string;
  sla_hours?: number;
  created_at: string;
}

export interface Guest {
  id: string;
  organization_id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  country?: string;
  preferred_language?: string;
  language_preference?: string;
  notes?: string;
  total_stays?: number;
  last_stay_at?: string;
  created_at: string;
}

export interface Review {
  id: string;
  organization_id?: string;
  property_id: string;
  guest_id?: string;
  platform?: string;
  source?: string;
  rating: number;
  title?: string;
  content?: string;
  review_text?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  ai_response_draft?: string;
  recommended_response?: string;
  response_status: 'pending' | 'draft' | 'draft_ready' | 'responded' | 'dismissed';
  topics?: string[];
  review_date?: string;
  created_at: string;
}

export interface ICalSyncSource {
  id: string;
  property_id: string;
  organization_id: string;
  platform: 'airbnb' | 'booking_com' | 'lekkeslaap' | 'direct';
  ical_url: string;
  last_synced_at?: string;
  sync_status: 'pending' | 'syncing' | 'success' | 'error';
  last_error?: string;
}

export interface PropertyKnowledge {
  id: string;
  property_id: string;
  organization_id: string;
  category: 'appliance' | 'checkin' | 'wifi' | 'faq' | 'policy' | 'instruction';
  title: string;
  content: string;
  is_guest_visible: boolean;
}

export interface AIActionLog {
  id: string;
  organization_id: string;
  property_id?: string;
  action_type: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'auto_applied';
  output_preview?: string;
  output_summary?: string;
  confidence?: number;
  confidence_score?: number;
  created_at: string;
}

export interface BrainEntry {
  id: string;
  category: string;
  title: string;
  content: string;
}

export interface RoadmapModule {
  id: string;
  phase: number;
  name: string;
  status: 'live' | 'dormant' | 'planned';
}

export interface DashboardMetrics {
  occupancy_rate: number;
  occupancy_trend: number;
  adr: number;
  revpar: number;
  open_tasks: number;
  overdue_tasks: number;
  pending_reviews: number;
  avg_rating: number;
  arrivals_today: number;
  departures_today: number;
  revenue_this_month: number;
  revenue_trend: number;
}
