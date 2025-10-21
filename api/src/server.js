// api/src/server.js
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser' // in case you later switch to cookies
import { ORIGIN, PORT, OPENAI_API_KEY, GOOGLE_MAPS_API_KEY } from './env.js'
import { auth } from './middleware/auth.js'
import tripsRoutes from './routes/trips.js'
import chatRoutes from './routes/chat.js'

const app = express()

app.use(cors({ origin: ORIGIN, credentials: true }))
app.use(express.json())
app.use(cookieParser())

// Startup diagnostics
console.log('[Trip Planner] OpenAI key set?:', !!OPENAI_API_KEY)
console.log('[Trip Planner] Google Places key set?:', !!GOOGLE_MAPS_API_KEY)

// Health
app.get('/health', (_req, res) => res.json({ ok: true }))

// Protected routes (require Supabase JWT)
app.use('/trips', auth, tripsRoutes)
app.use('/', auth, chatRoutes) // /chat, /chat/stream

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`))
