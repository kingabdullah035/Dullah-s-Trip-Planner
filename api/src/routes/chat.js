// api/src/routes/chat.js
import { Router } from 'express'
import db from '../db/index.js'
import { cuid } from '../utils/cuid.js'
import { planTrip, mockPlan } from '../services/ai.js'
import { resolvePlaces } from '../services/places.js'
import { ORIGIN } from '../env.js'

const router = Router()

// classic non-streaming
router.post('/chat', async (req, res) => {
  const { tripId, message } = req.body || {}
  if (!tripId || !message) return res.status(400).json({ error: 'tripId and message required' })
  const t = db.prepare('SELECT * FROM trips WHERE id=? AND user_id=?').get(tripId, req.user.id)
  if (!t) return res.status(404).json({ error: 'trip not found' })

  db.prepare('INSERT INTO messages (id,trip_id,user_id,role,content) VALUES (?,?,?,?,?)')
    .run(cuid(), tripId, req.user.id, 'user', message)

  const plan = await planTrip(t, message)
  const enriched = await resolvePlaces(plan, t.title)

  db.prepare('INSERT INTO messages (id,trip_id,user_id,role,content) VALUES (?,?,?,?,?)')
    .run(cuid(), tripId, req.user.id, 'assistant', JSON.stringify(enriched))

  // snapshot markers
  if (Array.isArray(enriched.plan)) {
    for (const d of enriched.plan) {
      for (const it of (d.items || [])) {
        db.prepare(`INSERT INTO places
          (id,trip_id,name,description,day,start_time,end_time,lat,lng,address,external_url,source)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
          .run(
            cuid(), tripId, it.name, it.type || null, d.day || null,
            it.start_time || null, it.end_time || null,
            it.lat || null, it.lng || null, it.address || null,
            it.external_url || null, it.source || 'mock'
          )
      }
    }
  }

  res.json(enriched)
})

// streaming via SSE
router.post('/chat/stream', async (req, res) => {
  const { tripId, message } = req.body || {}
  if (!tripId || !message) return res.status(400).json({ error: 'tripId and message required' })
  const trip = db.prepare('SELECT * FROM trips WHERE id=? AND user_id=?').get(tripId, req.user.id)
  if (!trip) return res.status(404).json({ error: 'trip not found' })

  db.prepare('INSERT INTO messages (id,trip_id,user_id,role,content) VALUES (?,?,?,?,?)')
    .run(cuid(), tripId, req.user.id, 'user', message)

  const history = db.prepare(
    'SELECT role, content FROM messages WHERE trip_id=? ORDER BY created_at ASC LIMIT 20'
  ).all(tripId)
  const tail = history.slice(-10).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }))

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': ORIGIN,
  })
  const sse = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`)

  // If no OpenAI key, just stream mock once
  if (!process.env.OPENAI_API_KEY) {
    sse({ chunk: JSON.stringify(mockPlan(trip), null, 2) })
    sse({ done: true })
    return res.end()
  }

  // Build OpenAI request
  const system = {
    role: 'system',
    content:
      'You are a helpful trip planner. ALWAYS reply with ONE JSON object: ' +
      '{ city, plan:[{day:number, items:[{name,type,start_time?,end_time?}]}], ' +
      'suggestions?:{neighborhoods?:string[],lodging_criteria?:string[],transit?:string[]}, ' +
      'budget_level?: "low"|"mid"|"high", questions?: string[] }. ' +
      'If info is missing, include `questions`, but STILL include a reasonable draft `plan`.'
  }
  const messages = [
    system,
    { role: 'user', content: `Trip title: ${trip.title}` },
    ...tail,
    { role: 'user', content: message }
  ]

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        response_format: { type: 'json_object' },
        stream: true,
        messages,
      }),
    })

    if (!r.ok || !r.body) {
      sse({ chunk: JSON.stringify(mockPlan(trip), null, 2) })
      sse({ done: true })
      return res.end()
    }

    const reader = r.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let fullText = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const parts = buffer.split('\n\n')
      buffer = parts.pop() || ''

      for (const part of parts) {
        if (!part.startsWith('data:')) continue
        const payload = part.slice(5).trim()
        if (payload === '[DONE]') continue
        try {
          const j = JSON.parse(payload)
          const delta = j?.choices?.[0]?.delta?.content || ''
          if (delta) {
            fullText += delta
            sse({ chunk: delta })
          }
        } catch {
          // ignore control lines
        }
      }
    }

    let data
    try { data = JSON.parse(fullText) } catch { data = mockPlan(trip) }

    if (!data.plan || !Array.isArray(data.plan) || data.plan.length === 0) {
      const m = mockPlan(trip)
      data = {
        city: data.city || m.city,
        plan: m.plan,
        suggestions: data.suggestions || m.suggestions,
        budget_level: data.budget_level || m.budget_level,
        questions: data.questions || []
      }
    }

    // store assistant JSON
    db.prepare('INSERT INTO messages (id,trip_id,user_id,role,content) VALUES (?,?,?,?,?)')
      .run(cuid(), tripId, req.user.id, 'assistant', JSON.stringify(data))

    // enrich + persist places
    const enriched = await resolvePlaces(data, trip.title)
    db.prepare("UPDATE messages SET content=? WHERE rowid=(SELECT rowid FROM messages WHERE trip_id=? AND role='assistant' ORDER BY created_at DESC LIMIT 1)")
      .run(JSON.stringify(enriched), tripId)

    if (Array.isArray(enriched.plan)) {
      for (const d of enriched.plan) {
        for (const it of (d.items || [])) {
          db.prepare(`INSERT INTO places
            (id,trip_id,name,description,day,start_time,end_time,lat,lng,address,external_url,source)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
            .run(
              cuid(), tripId, it.name, it.type || null, d.day || null,
              it.start_time || null, it.end_time || null,
              it.lat || null, it.lng || null, it.address || null,
              it.external_url || null, it.source || 'mock'
            )
        }
      }
    }

    sse({ done: true })
    res.end()
  } catch (e) {
    console.error('Stream failed:', e)
    sse({ chunk: JSON.stringify(mockPlan(trip), null, 2) })
    sse({ done: true })
    res.end()
  }
})

export default router
