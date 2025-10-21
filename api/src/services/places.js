// api/src/services/places.js
import { GOOGLE_MAPS_API_KEY } from '../env.js'

export async function resolvePlaces (plan, city) {
  if (!plan?.plan) return plan
  for (const d of plan.plan) {
    for (const it of d.items || []) {
      const q = `${it.name} ${city}`
      const r = await searchPlaces(q)
      if (r[0]) {
        it.lat = r[0].lat; it.lng = r[0].lng; it.address = r[0].address
        it.external_url = r[0].url; it.source = r[0].source
      }
    }
  }
  return plan
}

export async function searchPlaces (q) {
  const key = GOOGLE_MAPS_API_KEY
  if (!key) {
    const base = { lat: 41.387, lng: 2.170 }
    return [0, 1, 2].map(i => ({
      name: `Mock Place ${i + 1}`,
      address: 'Mock Address',
      lat: base.lat + i * 0.005,
      lng: base.lng + i * 0.005,
      url: 'https://maps.example/mock',
      source: 'mock'
    }))
  }
  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&key=${key}`
    const r = await fetch(url)
    const j = await r.json()
    return (j.results || []).slice(0, 3).map(p => ({
      name: p.name,
      address: p.formatted_address,
      lat: p.geometry?.location?.lat,
      lng: p.geometry?.location?.lng,
      url: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
      source: 'google'
    }))
  } catch {
    return []
  }
}
