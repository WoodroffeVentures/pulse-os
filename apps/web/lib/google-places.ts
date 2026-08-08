// Google Places API (New) — server-only adapter.
// Uses the non-deprecated Places API (New) endpoints with field masks.
// NEVER import this in client bundles.

import { getGooglePlacesKey } from './env';

const PLACES_BASE = 'https://places.googleapis.com/v1';

export type PlaceResult = {
  id: string;
  displayName: { text: string };
  formattedAddress: string;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  regularOpeningHours?: { openNow: boolean };
  types?: string[];
};

export type PlaceSearchResult = {
  places: PlaceResult[];
  source: 'google' | 'demo_fallback';
};

// Search for places near a location using Places API (New) Text Search.
export async function searchNearbyPlaces(
  textQuery: string,
  locationBias?: { lat: number; lng: number; radiusMeters?: number },
  maxResults = 5
): Promise<PlaceSearchResult> {
  const apiKey = getGooglePlacesKey();

  if (!apiKey) {
    // No key — return empty results; callers should render a demo state.
    return { places: [], source: 'demo_fallback' };
  }

  const body: Record<string, unknown> = { textQuery, pageSize: maxResults };
  if (locationBias) {
    body.locationBias = {
      circle: {
        center: { latitude: locationBias.lat, longitude: locationBias.lng },
        radius: locationBias.radiusMeters ?? 5000,
      },
    };
  }

  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.rating',
    'places.userRatingCount',
    'places.websiteUri',
    'places.nationalPhoneNumber',
    'places.regularOpeningHours',
    'places.types',
  ].join(',');

  const res = await fetch(`${PLACES_BASE}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify(body),
    // Cache for 1 hour — Places data doesn't change minute-to-minute.
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Places API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return { places: data.places ?? [], source: 'google' };
}

// Fetch details for a single place by its Place ID.
export async function getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  const apiKey = getGooglePlacesKey();
  if (!apiKey) return null;

  const fieldMask = [
    'id',
    'displayName',
    'formattedAddress',
    'rating',
    'userRatingCount',
    'websiteUri',
    'nationalPhoneNumber',
    'regularOpeningHours',
    'types',
  ].join(',');

  const res = await fetch(`${PLACES_BASE}/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask,
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;
  return res.json();
}
