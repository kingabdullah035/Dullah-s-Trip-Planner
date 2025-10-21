import React from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login(){
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [mode, setMode] = React.useState('login') // 'login' | 'register'
  const [err, setErr] = React.useState('')
  const [msg, setMsg] = React.useState('')
  const nav = useNavigate()

  React.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const token = session?.access_token || ''
      if (token) localStorage.setItem('supabase_token', token)
      else localStorage.removeItem('supabase_token')
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function submit(e){
    e.preventDefault()
    setErr(''); setMsg('')
    try{
      if (mode === 'register'){
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMsg('Check your email to verify your account.')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        const token = data.session?.access_token
        if (token) localStorage.setItem('supabase_token', token)
        nav('/app')
      }
    }catch(e){ setErr(e.message || String(e)) }
  }

  return (
    <section className="section" style={{maxWidth:560}}>
      <h2>{mode==='login'?'Login':'Register'}</h2>
      <form onSubmit={submit} className="form-grid mt-3">
        <input className="input" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <div style={{color:'#ff6b6b'}}>{err}</div>}
        {msg && <div style={{color:'#34d399'}}>{msg}</div>}
        <div className="space-between">
          <button className="btn" type="submit">{mode}</button>
          <button className="btn ghost" type="button" onClick={()=>setMode(mode==='login'?'register':'login')}>
            switch to {mode==='login'?'register':'login'}
          </button>
        </div>
      </form>
    </section>
  )
}
