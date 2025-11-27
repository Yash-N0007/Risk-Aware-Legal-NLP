export const API_BASE = 'http://127.0.0.1:8000';

export async function uploadDoc(file){
  const fd = new FormData()
  fd.append('file', file)
  const r = await fetch(`${API_BASE}/upload`, { method:'POST', body: fd })
  return r.json()
}
export async function summarize(doc_id, mode='extractive'){
  const r = await fetch(`${API_BASE}/summarize`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ doc_id, mode })
  })
  return r.json()
}
export async function indexDoc(doc_id){
  const r = await fetch(`${API_BASE}/index`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ doc_id })
  })
  return r.json()
}
export async function ask(doc_id, question, k = 5) {
  const r = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doc_id, question, k })
  })
  return r.json()
}
