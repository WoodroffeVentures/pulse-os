import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, organisation, role, email, phone, interest_type, message } = body;

    if (!name?.trim() || !organisation?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name, organisation and email are required.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email address required.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
    }

    // Use anon key — RLS allows public inserts on pilot_interest table (migration 0014).
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from('pilot_interest').insert({
      name: name.trim(),
      organisation: organisation.trim(),
      role: role?.trim() || null,
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      interest_type: interest_type || 'general',
      message: message?.trim() || null,
      source: 'landing-page',
    });

    if (error) {
      console.error('pilot_interest insert error:', error.code);
      return NextResponse.json({ error: 'Submission failed. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
