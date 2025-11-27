import { useEffect, useState } from 'react'
import { ask } from '../lib/api'

export default function QA(){
  const [docId,setDocId] = useState(localStorage.getItem('last_doc_id') || '')
  const [q,setQ] = useState('What is the notice period for termination?')
  const [msgs,setMsgs] = useState([])

  async function send(){
    if(!docId || !q.trim()) return
    setMsgs(m=>[...m, {role:'user', text:q}])
    const r = await ask(docId, q, 5)
    setMsgs(m=>[...m, {role:'assistant', text:r.answer, cites:r.citations||[] }])
    setQ('')
  }

  useEffect(()=> {
    // auto-focus maybe
  },[])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Ask the Document</h1>
      <p className="text-gray-600 mb-4">Retrieval-augmented Q&A with citations.</p>

      <div className="flex gap-2 mb-3">
        <input className="border rounded px-3 py-2" value={docId} onChange={e=>setDocId(e.target.value)} placeholder="doc_id"/>
        <input className="border rounded px-3 py-2 flex-1" value={q} onChange={e=>setQ(e.target.value)} placeholder="Ask a question"/>
        <button className="bg-black text-white px-4 py-2 rounded" onClick={send}>Ask</button>
      </div>

      <div className="space-y-3">
        {msgs.map((m,i)=> (
          <div key={i} className={`p-3 rounded max-w-3xl ${m.role==='user' ? 'bg-black text-white ml-auto' : 'bg-white border'}`}>
            <div>{m.text}</div>
            {m.cites?.length > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                Citations: {m.cites.map(c=>`#${c.i} (score ${c.score.toFixed(2)})`).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
