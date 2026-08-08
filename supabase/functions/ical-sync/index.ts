import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = request.headers.get('authorization');
  const expected = Deno.env.get('ICAL_SYNC_SECRET');

  if (expected && authHeader !== `Bearer ${expected}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return Response.json({
    status: 'accepted',
    message: 'iCal sync boundary is ready. Add feed fetch, event normalization, booking upsert and sync logging.',
  });
});

