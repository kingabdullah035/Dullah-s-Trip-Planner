// api/src/env.js
export const PORT = process.env.PORT ? Number(process.env.PORT) : 4000
export const JWT_SECRET = process.env.JWT_SECRET || 'dev' // unused after Supabase, kept for compatibility
export const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || ''

export const SUPABASE_URL = process.env.SUPABASE_URL || ''
export const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || ''
