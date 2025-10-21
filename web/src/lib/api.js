// export const API_BASE = 'http://localhost:4000'
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
export async function api(path, init = {}) {
  const token =
    localStorage.getItem('supabase_token') || localStorage.getItem('token') || ''
  const res = await fetch(API_BASE + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(init.headers || {})
    }
  })
  if (!res.ok) throw new Error(await res.text().catch(()=>'Request failed'))
  return res.status === 204 ? null : res.json()
}
