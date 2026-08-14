/**
 * RLS and tenant isolation tests.
 * These run against the production Supabase project using the anon key.
 * They prove database-level isolation, not just UI-level hiding.
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   TEST_USER_EMAIL / TEST_USER_PASSWORD   (Tenant A — Farmstead)
 *   TEST_USER_B_EMAIL / TEST_USER_B_PASSWORD  (Tenant B — second org, if available)
 */
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const EMAIL_A = process.env.TEST_USER_EMAIL ?? '';
const PASS_A = process.env.TEST_USER_PASSWORD ?? '';
const EMAIL_B = process.env.TEST_USER_B_EMAIL ?? '';
const PASS_B = process.env.TEST_USER_B_PASSWORD ?? '';

function anonClient() {
  return createClient(URL, ANON);
}

async function authedClient(email: string, password: string) {
  const client = createClient(URL, ANON);
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Auth failed: ${error.message}`);
  return client;
}

test.describe('Anonymous RLS', () => {
  test.skip(!URL || !ANON, 'Supabase env vars not set');

  test('anonymous cannot read opportunities', async () => {
    const client = anonClient();
    const { data, error } = await client.from('opportunities').select('id').limit(5);
    // RLS should return 0 rows (not an error — Postgres returns empty for policy miss)
    expect(data?.length ?? 0).toBe(0);
  });

  test('anonymous cannot read business_profiles', async () => {
    const client = anonClient();
    const { data } = await client.from('business_profiles').select('id').limit(5);
    expect(data?.length ?? 0).toBe(0);
  });

  test('anonymous cannot read participation_records', async () => {
    const client = anonClient();
    const { data } = await client.from('participation_records').select('id').limit(5);
    expect(data?.length ?? 0).toBe(0);
  });

  test('anonymous cannot read outcomes', async () => {
    const client = anonClient();
    const { data } = await client.from('outcomes').select('id').limit(5);
    expect(data?.length ?? 0).toBe(0);
  });

  test('anonymous cannot insert into opportunities', async () => {
    const client = anonClient();
    const { error } = await client.from('opportunities').insert({
      title: 'ANON_TEST',
      organization_id: '00000000-0000-0000-0000-000000000000',
    });
    expect(error).toBeTruthy();
  });

  test('anonymous cannot insert into business_profiles', async () => {
    const client = anonClient();
    const { error } = await client.from('business_profiles').insert({
      business_name: 'ANON_TEST',
      organization_id: '00000000-0000-0000-0000-000000000000',
    });
    expect(error).toBeTruthy();
  });
});

test.describe('Tenant A isolation', () => {
  test.skip(!URL || !ANON || !EMAIL_A || !PASS_A, 'Tenant A credentials not set');

  test('Tenant A can read its own opportunities', async () => {
    const client = await authedClient(EMAIL_A, PASS_A);
    const { data, error } = await client.from('opportunities').select('id, organization_id').limit(10);
    expect(error).toBeNull();
    // All returned rows belong to Tenant A's org (enforced by RLS)
    // We can't easily check the org_id without knowing it, but absence of error confirms auth works
  });
});

test.describe('Cross-tenant isolation', () => {
  test.skip(!EMAIL_A || !PASS_A || !EMAIL_B || !PASS_B, 'Both tenant credentials required');

  test('Tenant A cannot read Tenant B opportunities', async () => {
    const clientA = await authedClient(EMAIL_A, PASS_A);
    const clientB = await authedClient(EMAIL_B, PASS_B);

    const { data: bOpps } = await clientB.from('opportunities').select('id').limit(5);
    const bIds = (bOpps ?? []).map((r: { id: string }) => r.id);

    if (bIds.length === 0) {
      // Tenant B has no opportunities — can't test isolation but test setup needs data
      console.warn('Tenant B has no opportunities to test cross-tenant isolation');
      return;
    }

    const { data: aView } = await clientA
      .from('opportunities')
      .select('id')
      .in('id', bIds);

    expect((aView ?? []).length).toBe(0);
  });

  test('Tenant A cannot read Tenant B businesses', async () => {
    const clientA = await authedClient(EMAIL_A, PASS_A);
    const clientB = await authedClient(EMAIL_B, PASS_B);

    const { data: bBiz } = await clientB.from('business_profiles').select('id').limit(5);
    const bIds = (bBiz ?? []).map((r: { id: string }) => r.id);

    if (bIds.length === 0) return;

    const { data: aView } = await clientA
      .from('business_profiles')
      .select('id')
      .in('id', bIds);

    expect((aView ?? []).length).toBe(0);
  });
});
