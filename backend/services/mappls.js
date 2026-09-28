// services/mappls.js — Mappls (MapmyIndia) API Integration
// Provides real-time nearby search for hospitals, diagnostics, and blood banks
const axios = require('axios');

// In-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Get OAuth2 access token from Mappls
let tokenCache = { token: null, expiresAt: 0 };

async function getMapplsToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const clientId = process.env.MAPPLS_CLIENT_ID;
  const clientSecret = process.env.MAPPLS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Mappls API credentials not configured');
  }

  try {
    const response = await axios.post('https://outpost.mappls.com/api/security/oauth/token', 
      `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
      }
    );

    const { access_token, expires_in } = response.data;
    tokenCache = {
      token: access_token,
      expiresAt: Date.now() + (expires_in - 60) * 1000 // Refresh 60s early
    };
    return access_token;
  } catch (err) {
    console.error('Mappls auth error:', err.message);
    throw new Error('Failed to authenticate with Mappls API');
  }
}

// Search nearby places using Mappls Nearby API
async function searchNearby(lat, lng, keyword, radius = 5000) {
  const cacheKey = `mappls_${keyword}_${lat.toFixed(3)}_${lng.toFixed(3)}_${radius}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const token = await getMapplsToken();

    const response = await axios.get('https://atlas.mappls.com/api/places/nearby/json', {
      params: {
        keywords: keyword,
        refLocation: `${lat},${lng}`,
        radius: radius,
        sortBy: 'dist:asc',
        page: 1,
        richData: true
      },
      headers: {
        Authorization: `bearer ${token}`
      },
      timeout: 10000
    });

    const results = (response.data.suggestedLocations || []).map(place => ({
      name: place.placeName || place.poi || '',
      address: place.placeAddress || place.address || '',
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude),
      distance: place.distance ? `${(place.distance / 1000).toFixed(1)} km` : null,
      distanceMeters: place.distance || null,
      phone: place.telephone || place.tel || null,
      email: place.email || null,
      website: place.website || null,
      type: place.type || null,
      eLoc: place.eLoc || null,
      category: place.categoryCode || keyword,
      source: 'mappls'
    }));

    setCache(cacheKey, results);
    return results;
  } catch (err) {
    console.error('Mappls nearby search error:', err.message);
    return [];
  }
}

// Convenience methods
async function searchNearbyHospitals(lat, lng, radius = 5000) {
  return searchNearby(lat, lng, 'HSPTL', radius);
}

async function searchNearbyDiagnostics(lat, lng, radius = 5000) {
  return searchNearby(lat, lng, 'DGNSCP', radius);
}

async function searchNearbyBloodBanks(lat, lng, radius = 10000) {
  return searchNearby(lat, lng, 'BLDBNK', radius);
}

module.exports = {
  getMapplsToken,
  searchNearby,
  searchNearbyHospitals,
  searchNearbyDiagnostics,
  searchNearbyBloodBanks
};
