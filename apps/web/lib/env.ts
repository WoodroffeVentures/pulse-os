// Environment validation — call at startup to fail fast with a clear error.
// Never import this in client bundles (no 'use client' files).

const PLACEHOLDER = 'placeholder';

function required(name: string): string {
  const val = process.env[name];
  if (!val || val.includes(PLACEHOLDER)) {
    throw new Error(`Missing or placeholder environment variable: ${name}. Set it in .env.local before starting.`);
  }
  return val;
}

function optional(name: string): string | undefined {
  const val = process.env[name];
  if (!val || val.includes(PLACEHOLDER)) return undefined;
  return val;
}

// Call this in server-only code that requires a real Supabase connection.
export function requireSupabaseEnv() {
  return {
    url: required('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  };
}

// Returns true if Supabase is configured with real credentials.
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && !url.includes(PLACEHOLDER) && !key.includes(PLACEHOLDER));
}

// Google Places API key — server-only, never NEXT_PUBLIC_.
// Returns undefined if not configured; callers must handle demo fallback.
export function getGooglePlacesKey(): string | undefined {
  return optional('GOOGLE_PLACES_API_KEY');
}

// Anthropic API key — server-only.
export function getAnthropicKey(): string | undefined {
  return optional('ANTHROPIC_API_KEY');
}
