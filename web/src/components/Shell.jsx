import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import '../styles.css'

export default function Shell({ children }) {
  const [user, setUser] = React.useState(null)
  const nav = useNavigate()

  // 🔐 check auth state once and subscribe to changes
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.removeItem('supabase_token')
    nav('/login')
  }

  return (
    <>
      {/* floating background clouds */}
      <div className="travel-clouds">
        <div className="c"></div>
        <div className="c"></div>
        <div className="c"></div>
        <div className="c"></div>
      </div>

      <div className="app-wrap">
        <header className="header">
          <div className="brand">
            <span className="brand-badge"></span>
            Dullah's Trip Planner
          </div>

          <nav className="nav-links">
            <Link className="link" to="/">Home</Link>
            <Link className="link" to="/app">App</Link>

            {/* Toggle Login / Logout automatically */}
            {!user ? (
              <Link className="link" to="/login">Login</Link>
            ) : (
              <button className="link" onClick={handleLogout}>
                Logout
              </button>
            )}
          </nav>
        </header>

        {/* Render child pages inside the shell */}
        {children}
      </div>
    </>
  )
}
