import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { propertyId } = await request.json();

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: sources, error } = await supabase
      .from('ical_sync_sources')
      .select('*')
      .eq('property_id', propertyId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!sources?.length) {
      return NextResponse.json({ synced: 0, total: 0 });
    }

    let synced = 0;
    const results: Array<{ platform: string; status: string; error?: string }> = [];

    for (const source of sources) {
      try {
        await supabase
          .from('ical_sync_sources')
          .update({ sync_status: 'syncing' })
          .eq('id', source.id);

        const res = await fetch(source.ical_url, {
          headers: { 'User-Agent': 'PULSE-Hospitality-OS/1.0' },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const icalText = await res.text();
        const bookings = parseICalBookings(
          icalText,
          source.property_id,
          source.organization_id,
          source.platform
        );

        for (const booking of bookings) {
          await supabase
            .from('bookings')
            .upsert(booking, { onConflict: 'external_booking_id,property_id' });
        }

        await supabase
          .from('ical_sync_sources')
          .update({
            sync_status: 'success',
            last_synced_at: new Date().toISOString(),
            last_error: null,
          })
          .eq('id', source.id);

        synced++;
        results.push({ platform: source.platform, status: 'success' });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        await supabase
          .from('ical_sync_sources')
          .update({
            sync_status: 'error',
            last_error: message,
          })
          .eq('id', source.id);

        results.push({ platform: source.platform, status: 'error', error: message });
      }
    }

    return NextResponse.json({ synced, total: sources.length, results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

function parseICalBookings(
  icalText: string,
  propertyId: string,
  organizationId: string,
  platform: string
) {
  const bookings: Record<string, unknown>[] = [];
  const events = icalText.split('BEGIN:VEVENT').slice(1);

  for (const event of events) {
    const dtstart = event.match(/DTSTART(?:;VALUE=DATE)?:(\d{8})/)?.[1];
    const dtend = event.match(/DTEND(?:;VALUE=DATE)?:(\d{8})/)?.[1];
    const summary = event.match(/SUMMARY:(.+)/)?.[1]?.trim();
    const uid = event.match(/UID:(.+)/)?.[1]?.trim();

    if (!dtstart || !dtend || !uid) continue;

    const formatDate = (d: string) =>
      `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;

    bookings.push({
      property_id: propertyId,
      organization_id: organizationId,
      source: platform,
      status: 'confirmed',
      check_in_date: formatDate(dtstart),
      check_out_date: formatDate(dtend),
      external_booking_id: uid,
      guest_name:
        summary?.replace(/^(Reservation|Booking|Reserved)\s*/i, '') ||
        'Guest',
    });
  }

  return bookings;
}
