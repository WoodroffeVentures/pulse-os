import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  return Response.json({
    status: 'draft',
    approval_required: true,
    message: 'Nightly brief boundary is ready. Query bookings, tasks, reviews and brain entries, then call ai-gateway.',
  });
});

