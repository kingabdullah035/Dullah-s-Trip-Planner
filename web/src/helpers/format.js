export function summarizeAssistant(txt){
    let j = null
    try{ j = JSON.parse(txt) }catch{}
    if (!j) return txt
    const lines = []
    lines.push(`City: ${j.city || 'N/A'} (budget: ${j.budget_level || 'n/a'})`)
    if (Array.isArray(j.plan)) {
      for (const d of j.plan) {
        lines.push(`Day ${d.day}:`)
        for (const it of (d.items||[])) lines.push(` - ${it.name} (${it.type})`)
      }
    }
    if (Array.isArray(j.questions) && j.questions.length){
      lines.push('Questions:')
      for (const q of j.questions) lines.push(` ? ${q}`)
    }
    return lines.join('\n')
  }
  