// api/src/routes/trips.js
import { Router } from 'express'
import db from '../db/index.js'
import { cuid } from '../utils/cuid.js'

const router = Router()

// GET /trips
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM trips WHERE user_id=? ORDER BY created_at DESC').all(req.user.id)
  res.json(rows)
})

// POST /trips
router.post('/', (req, res) => {
  const { title, origin_airport, start_date, end_date, budget } = req.body || {}
  if (!title) return res.status(400).json({ error: 'title required' })
  const id = cuid()
  db.prepare('INSERT INTO trips (id,user_id,title,origin_airport,start_date,end_date,budget) VALUES (?,?,?,?,?,?,?)')
    .run(id, req.user.id, title, origin_airport || null, start_date || null, end_date || null, budget || null)
  const trip = db.prepare('SELECT * FROM trips WHERE id=?').get(id)
  res.json(trip)
})

// GET /trips/:id
router.get('/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM trips WHERE id=? AND user_id=?').get(req.params.id, req.user.id)
  if (!t) return res.status(404).json({ error: 'not found' })
  const places = db.prepare('SELECT * FROM places WHERE trip_id=?').all(req.params.id)
  res.json({ ...t, places })
})

// GET /trips/:id/messages
router.get('/:id/messages', (req, res) => {
  const t = db.prepare('SELECT * FROM trips WHERE id=? AND user_id=?').get(req.params.id, req.user.id)
  if (!t) return res.status(404).json({ error: 'not found' })
  const msgs = db.prepare('SELECT * FROM messages WHERE trip_id=? ORDER BY created_at ASC').all(req.params.id)
  res.json(msgs)
})

export default router
