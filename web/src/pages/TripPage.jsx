import React from 'react'
import { useParams } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { api, API_BASE } from '../lib/api'
import { summarizeAssistant } from '../helpers/format'

export default function TripPage() {
  const { id } = useParams()
  const [trip, setTrip] = React.useState(null)
  const [messages, setMessages] = React.useState([])
  const [input, setInput] = React.useState('Plan 3 days in Lisbon with viewpoints and bakeries.')
  const [err, setErr] = React.useState('')
  const [streamingText, setStreamingText] = React.useState('')
  const [isStreaming, setIsStreaming] = React.useState(false)

  const mapRef = React.useRef(null)
  const markersRef = React.useRef([])
  const controllerRef = React.useRef(null)

  // load trip + messages
  React.useEffect(() => {
    api(`/trips/${id}`).then(setTrip).catch(e => setErr(String(e)))
    api(`/trips/${id}/messages`).then(setMessages).catch(e => setErr(String(e)))
  }, [id])

  async function sendStream() {
    if (!input.trim() || isStreaming) return
    setErr('')
    setStreamingText('')
    setIsStreaming(true)

    try {
      const token =
        localStorage.getItem('supabase_token') ||
        localStorage.getItem('token') ||
        ''

      controllerRef.current = new AbortController()

      const res = await fetch(`${API_BASE}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {})
        },
        body: JSON.stringify({ tripId: id, message: input }),
        signal: controllerRef.current.signal
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        if (res.status === 401) {
          setErr('Auth failed. Please log in again.')
        } else {
          setErr(text || `Stream failed (HTTP ${res.status}).`)
        }
        setIsStreaming(false)
        return
      }
      if (!res.body) {
        setErr('Stream failed: empty body.')
        setIsStreaming(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })

        // SSE-style parsing
        const lines = chunk.split('\n\n')
        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const payload = line.slice(5).trim()
          if (!payload) continue
          try {
            const j = JSON.parse(payload)
            if (j.chunk) setStreamingText(prev => prev + j.chunk)
            if (j.done) {
              setIsStreaming(false)
              setInput('')
              const [t, m] = await Promise.all([
                api(`/trips/${id}`),
                api(`/trips/${id}/messages`)
              ])
              setTrip(t)
              setMessages(m)
            }
          } catch {
            // ignore partial JSON during stream
          }
        }
      }
    } catch (e) {
      if (e?.name === 'AbortError') return
      setErr(String(e))
      setIsStreaming(false)
    }
  }

  // cancel stream on unmount
  React.useEffect(() => {
    return () => controllerRef.current?.abort()
  }, [])

  // Map
  React.useEffect(() => {
    if (!trip) return
    if (!mapRef.current) {
      const m = L.map('map').setView([41.387, 2.17], 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(m)
      mapRef.current = m
    }
    // refresh markers
    markersRef.current.forEach(mm => mm.remove())
    markersRef.current = []
    if (trip.places?.length) {
      const group = L.featureGroup()
      for (const p of trip.places) {
        if (typeof p.lat === 'number' && typeof p.lng === 'number') {
          const mk = L.marker([p.lat, p.lng]).addTo(mapRef.current)
          mk.bindPopup(`<b>${p.name}</b><br/>${p.address || ''}`)
          markersRef.current.push(mk)
          group.addLayer(mk)
        }
      }
      if (group.getLayers().length)
        mapRef.current.fitBounds(group.getBounds().pad(0.2))
    }
  }, [trip && JSON.stringify(trip.places || [])])

  return (
    <>
      <section className="section">
        <div className="space-between">
          <h2>{trip?.title || 'Trip'}</h2>
          <span className="badge">ID: {id}</span>
        </div>
      </section>

      <section className="section">
        <h3>Chat</h3>
        <div style={{ maxHeight: 240, overflow: 'auto' }} className="section mt-2">
          {messages.map(m => (
            <div key={m.id} style={{ whiteSpace: 'pre-wrap', marginBottom: 6 }}>
              <strong>{m.role === 'user' ? 'You' : 'Planner'}:</strong>{' '}
              {m.role === 'assistant' ? summarizeAssistant(m.content) : m.content}
            </div>
          ))}
          {isStreaming && (
            <div style={{ whiteSpace: 'pre-wrap', opacity: 0.9 }}>
              <strong>Planner:</strong> {streamingText}
            </div>
          )}
        </div>
        <div className="space-between mt-3">
          <input
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask for a plan, add preferences..."
          />
          <button className="btn" onClick={sendStream} disabled={isStreaming}>
            {isStreaming ? 'Streaming…' : 'Send'}
          </button>
        </div>
        {err && <div style={{ color: '#ff6b6b', marginTop: 8 }}>{err}</div>}
      </section>

      <section className="section">
        <h3>Map</h3>
        <div id="map" className="map mt-3"></div>
      </section>
    </>
  )
}
