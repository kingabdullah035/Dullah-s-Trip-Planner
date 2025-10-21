// web/src/components/ProtectedRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

// checks if user is logged in, otherwise redirects
export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState(null)

  React.useEffect(() => {
    // check session on mount
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null)
      setLoading(false)
    })

    // listen for auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  if (loading) return <div className="section">Loading...</div>

  // if no user, redirect to login
  if (!user) return <Navigate to="/login" replace />

  // otherwise show page
  return children
}
