import React from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

export default function AppPage(){
  const [trips, setTrips] = React.useState([])
  const [title, setTitle] = React.useState('Barcelona 4 days')
  const [err, setErr] = React.useState('')

  React.useEffect(()=>{ api('/trips').then(setTrips).catch(e=>setErr(String(e))) }, [])

  async function createTrip(){
    try{
      const t = await api('/trips', { method:'POST', body: JSON.stringify({ title }) })
      setTrips([t, ...trips]); setTitle('')
    }catch(e){ setErr(String(e)) }
  }

  return (
    <>
      <section className="section">
        <div className="space-between">
          <h2>Your Trips</h2>
          <span className="badge">Saved · {trips.length}</span>
        </div>

        <div className="trip-list mt-3">
          {trips.length ? trips.map(t=>(
            <div key={t.id} className="trip-item">
              <div>
                <div className="title">{t.title}</div>
                <div className="sub">Itinerary</div>
              </div>
              <Link to={`/trips/${t.id}`} className="btn ghost">Open</Link>
            </div>
          )) : <div className="empty">No trips yet — create your first itinerary!</div>}
        </div>
      </section>

      <section className="section">
        <h2>Create Trip</h2>
        <div className="form-grid mt-2">
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Paris 5 days" />
          <button className="btn mt-3" onClick={createTrip}>Create</button>
          {err && <div style={{color:'#ff6b6b'}}>{err}</div>}
        </div>
      </section>
    </>
  )
}
