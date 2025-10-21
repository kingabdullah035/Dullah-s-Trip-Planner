// api/src/middleware/auth.js
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_SERVICE_ROLE, SUPABASE_URL } from '../env.js'

const sbAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

export async function auth (req, res, next) {
  const a = req.headers.authorization || ''
  const token = a.startsWith('Bearer ') ? a.slice(7) : null
  if (!token) return res.status(401).json({ error: 'missing token' })
  try {
    const { data, error } = await sbAdmin.auth.getUser(token)
    if (error || !data?.user) return res.status(401).json({ error: 'invalid token' })
    req.user = { id: data.user.id }   // Supabase user UUID
    next()
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' })
  }
}
