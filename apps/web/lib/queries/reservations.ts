import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';
import { mockReservations, mockRoomTypes, mockRatePlans } from '@/lib/mock-data';

export type ReservationStatus =
  | 'quote' | 'hold' | 'confirmed' | 'deposit_paid' | 'fully_paid'
  | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show' | 'voided';

export interface Reservation {
  id: string;
  property_id: string;
  room_type_id?: string;
  unit_id?: string;
  rate_plan_id?: string;
  guest_id?: string;
  confirmation_number: string;
  channel_code?: string;
  check_in_date: string;
  check_out_date: string;
  booked_at: string;
  adults: number;
  children: number;
  status: ReservationStatus;
  source: string;
  total_amount: number;
  outstanding_balance: number;
  currency: string;
  notes?: string;
  special_requests?: string;
  actual_check_in?: string;
  actual_check_out?: string;
  // joined
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  property_name?: string;
  room_type_name?: string;
  unit_name?: string;
}

export interface RoomType {
  id: string;
  property_id: string;
  name: string;
  code?: string;
  max_occupancy: number;
  bed_configuration?: string;
  is_active: boolean;
}

export interface RatePlan {
  id: string;
  property_id: string;
  name: string;
  code?: string;
  meal_plan: string;
  min_nights: number;
  is_active: boolean;
}

export async function listReservations(propertyId?: string) {
  if (!isSupabaseConfigured()) {
    const rows = propertyId
      ? mockReservations.filter((r) => r.property_id === propertyId)
      : mockReservations;
    return { rows, source: 'demo' as const };
  }
  const supabase = createClient();
  let q = supabase
    .from('reservations')
    .select(`
      *,
      guests(first_name, last_name, email, phone),
      properties(name),
      room_types(name),
      units(name)
    `)
    .order('check_in_date', { ascending: false })
    .limit(500);
  if (propertyId) q = q.eq('property_id', propertyId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const rows: Reservation[] = (data ?? []).map((r: any) => ({
    ...r,
    guest_name: r.guests ? `${r.guests.first_name} ${r.guests.last_name}` : undefined,
    guest_email: r.guests?.email,
    guest_phone: r.guests?.phone,
    property_name: r.properties?.name,
    room_type_name: r.room_types?.name,
    unit_name: r.units?.name,
  }));
  return { rows, source: 'live' as const };
}

export async function listRoomTypes(propertyId: string) {
  if (!isSupabaseConfigured()) {
    return { rows: mockRoomTypes.filter((rt) => rt.property_id === propertyId), source: 'demo' as const };
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('room_types')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as RoomType[], source: 'live' as const };
}

export async function listRatePlans(propertyId: string) {
  if (!isSupabaseConfigured()) {
    return { rows: mockRatePlans.filter((rp) => rp.property_id === propertyId), source: 'demo' as const };
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rate_plans')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true);
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as RatePlan[], source: 'live' as const };
}

export async function createReservation(payload: Partial<Reservation>) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured — cannot create reservation in demo mode');
  }
  const supabase = createClient();

  // Overlap check: reject if a confirmed/checked-in reservation already exists for
  // the same property and unit (if provided) within the requested date range.
  if (payload.property_id && payload.check_in_date && payload.check_out_date) {
    let overlapQ = supabase
      .from('reservations')
      .select('id', { count: 'exact', head: true })
      .eq('property_id', payload.property_id)
      .in('status', ['confirmed', 'deposit_paid', 'fully_paid', 'checked_in'])
      .lt('check_in_date', payload.check_out_date)
      .gt('check_out_date', payload.check_in_date);
    if (payload.unit_id) overlapQ = overlapQ.eq('unit_id', payload.unit_id);
    const { count, error: overlapErr } = await overlapQ;
    if (overlapErr) throw new Error(overlapErr.message);
    if ((count ?? 0) > 0) {
      throw new Error(
        'Booking conflict: a confirmed reservation already exists for this property' +
        (payload.unit_id ? '/unit' : '') +
        ' within the selected dates. Adjust dates or select a different unit.'
      );
    }
  }

  const nights = Math.max(1,
    (new Date(payload.check_out_date!).getTime() - new Date(payload.check_in_date!).getTime())
    / 86400000
  );
  const insertData = {
    ...payload,
    status: payload.status ?? 'confirmed',
    booked_at: new Date().toISOString(),
    nights_count: nights,
  };
  const { data, error } = await supabase.from('reservations').insert(insertData).select().single();
  if (error) throw new Error(error.message);
  return data as Reservation;
}

export async function updateReservationStatus(id: string, status: ReservationStatus, reason?: string) {
  if (!isSupabaseConfigured()) throw new Error('Demo mode');
  const supabase = createClient();
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === 'cancelled') { patch.cancelled_at = new Date().toISOString(); patch.cancellation_reason = reason; }
  if (status === 'checked_in') patch.actual_check_in = new Date().toISOString();
  if (status === 'checked_out') patch.actual_check_out = new Date().toISOString();
  const { data, error } = await supabase.from('reservations').update(patch).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data as Reservation;
}

export async function checkAvailability(
  propertyId: string,
  roomTypeId: string,
  checkIn: string,
  checkOut: string,
  excludeReservationId?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return true;
  const supabase = createClient();
  let q = supabase
    .from('reservations')
    .select('id', { count: 'exact', head: true })
    .eq('property_id', propertyId)
    .eq('room_type_id', roomTypeId)
    .in('status', ['confirmed', 'deposit_paid', 'fully_paid', 'checked_in'])
    .lt('check_in_date', checkOut)
    .gt('check_out_date', checkIn);
  if (excludeReservationId) q = q.neq('id', excludeReservationId);
  const { count, error } = await q;
  if (error) throw new Error(error.message);
  return (count ?? 0) === 0;
}
