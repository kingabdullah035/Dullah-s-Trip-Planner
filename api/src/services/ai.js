// api/src/services/ai.js
import { OPENAI_API_KEY } from '../env.js'

export function mockPlan (trip) {
  return {
    city: trip.title,
    plan: [
      { day: 1, items: [
        { name: 'Old Town Walk', type: 'activity' },
        { name: 'Central Market', type: 'food' },
        { name: 'City View', type: 'sight' },
      ]},
      { day: 2, items: [
        { name: 'Riverside Promenade', type: 'sight' },
        { name: 'Tapas Corner', type: 'food' },
        { name: 'Modern Art Museum', type: 'sight' },
      ]}
    ],
    suggestions: { neighborhoods: ['Center', 'Riverside'], lodging_criteria: ['Walkable', '<$180/night'] },
    budget_level: trip.budget || 'mid'
  }
}

export async function planTrip (trip, lastMessage) {
  const key = OPENAI_API_KEY
  if (!key) {
    console.log('[AI] Using MOCK (no OpenAI key)')
    return mockPlan(trip)
  }

  console.log('[AI] Using OpenAI planner')
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful trip planner. Always reply with ONE JSON object: ' +
              '{ city, plan:[{day:number, items:[{name,type,start_time?,end_time?}]}], ' +
              'suggestions?:{neighborhoods?:string[],lodging_criteria?:string[],transit?:string[]}, ' +
              'budget_level?: "low"|"mid"|"high", questions?: string[] }. ' +
              'If details are missing, ask via `questions`, but ALWAYS include a draft `plan`.'
          },
          { role: 'user', content: `Trip: ${trip.title}. Message: ${lastMessage}.` },
        ],
      }),
    })

    console.log('OpenAI status:', r.status)
    const j = await r.json().catch(() => null)
    if (!j || !r.ok) return mockPlan(trip)

    const txt = j?.choices?.[0]?.message?.content ?? ''
    let data
    try { data = JSON.parse(txt) } catch { return mockPlan(trip) }

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
    return data
  } catch (e) {
    console.error('OpenAI call failed:', e)
    return mockPlan(trip)
  }
}
