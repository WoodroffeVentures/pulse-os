export type RiskLevel = 'low' | 'medium' | 'high' | 'urgent' | 'critical';
export type TaskStatus =
  | 'open'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'cancelled'
  | 'overdue';
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show'
  | 'tentative';

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  subscription_plan?: string;
  default_currency?: string;
  created_at?: string;
}

export interface Property {
  id: string;
  organization_id: string;
  name: string;
  type?: 'cottage' | 'studio' | 'lodge' | 'guesthouse' | 'hotel' | 'villa';
  property_type: string;
  status: 'active' | 'inactive' | 'maintenance';
  google_maps_url?: string;
  google_review_url?: string;
  airbnb_url?: string;
  booking_url?: string;
  lekkeslaap_url?: string;
  operational_email?: string;
  city?: string;
  province?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface Booking {
  id: string;
  organization_id?: string;
  property_id: string;
  guest_id?: string;
  unit_id?: string;
  source:
    | 'airbnb'
    | 'booking_com'
    | 'lekkeslaap'
    | 'direct'
    | 'manual'
    | 'other';
  status: BookingStatus;
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
  external_booking_id?: string;
  created_at: string;
}

export interface Task {
  id: string;
  organization_id: string;
  property_id: string;
  title: string;
  description?: string;
  category:
    | 'housekeeping'
    | 'maintenance'
    | 'guest_services'
    | 'finance'
    | 'compliance'
    | 'inspection'
    | 'operations';
  priority: RiskLevel;
  status: TaskStatus;
  assigned_to?: string;
  due_at?: string;
  completed_at?: string;
  booking_id?: string;
  ai_generated?: boolean;
  created_at: string;
}

export interface Guest {
  id: string;
  organization_id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
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

export interface BrainEntry {
  id: string;
  property_id?: string;
  category: 'wifi' | 'sop' | 'guest_guide' | 'maintenance' | 'policy' | 'lesson';
  title: string;
  content: string;
  guest_visible: boolean;
}

export interface RoadmapModule {
  phase: number;
  slug: string;
  title: string;
  status: 'locked' | 'demo' | 'future';
  audience: string;
  promise: string;
}

export interface Opportunity {
  id: string;
  title: string;
  opportunity_type: string;
  district: string;
  value_band: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface ViabilityAnalysis {
  score: number;
  confidence: number;
  recommendation: 'participate' | 'conditional' | 'do_not_participate';
  evidence: { signal: string; value: string; weight: number }[];
  risks: string[];
  actions: string[];
}
