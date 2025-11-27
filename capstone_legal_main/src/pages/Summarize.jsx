import { useState } from 'react'
import { indexDoc, summarize, uploadDoc } from '../lib/api'

export default function Summarize(){
  const [file,setFile] = useState(null)
  const [doc,setDoc] = useState(null)
  const [mode,setMode] = useState('abstractive')   // LED path returns a string
  const [para,setPara] = useState('')              // paragraph summary
  const [bullets,setBullets] = useState([])        // array summary (old/extractive/topicized)
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')

  async function handle(){
    try{
      setError(''); setPara(''); setBullets([]); setLoading(true)

      const up = await uploadDoc(file)
      setDoc(up)
      localStorage.setItem('last_doc_id', up.doc_id)

      const res = await summarize(up.doc_id, mode)
      // --- normalize both shapes ---
      const s = res?.summary
      if (Array.isArray(s)) {
        // could be array of strings or array of objects {text, topic, ...}
        setBullets(s.map(x => typeof x === 'string' ? { text: x } : x))
      } else if (typeof s === 'string') {
        setPara(s.trim())
      } else {
        setError('Unexpected summary format from server.')
      }

      await indexDoc(up.doc_id) // prep RAG
    }catch(e){
      setError(String(e))
    }finally{
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Document Summarization</h1>
      <p className="text-gray-600 mb-4">Upload a legal document and generate a concise summary.</p>

      <div className="flex gap-3 items-center">
        <input type="file" onChange={e=>setFile(e.target.files?.[0])}/>
        <select className="border rounded px-3 py-2" value={mode} onChange={e=>setMode(e.target.value)}>
          <option value="extractive">Extractive (fast)</option>
          <option value="abstractive">Abstractive (LED)</option>
        </select>
        <button className="bg-black text-white px-4 py-2 rounded" onClick={handle} disabled={!file || loading}>
          {loading ? 'Processing…' : 'Upload & Summarize'}
        </button>
      </div>

      {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}

      {doc && <div className="mt-3 text-sm text-gray-500">
        Loaded <b>{doc.title}</b> (chars {doc.chars}) — id: {doc.doc_id}
      </div>}

      {/* Paragraph summary (LED) */}
      {para && (
        <div className="mt-5 p-4 bg-white border rounded leading-7">
          <h3 className="font-semibold mb-2">Summary</h3>
          <p>{para}</p>
        </div>
      )}

      {/* Bulleted summary (extractive/topicized) */}
      {bullets.length > 0 && (
        <div className="mt-5 p-4 bg-white border rounded">
          <h3 className="font-semibold mb-2">Summary</h3>
          <ul className="list-disc ml-5 space-y-1">
            {bullets.map((b,i)=>(
              <li key={i}>
                {b.topic ? <b>{b.topic} — </b> : null}{b.text}
                {b.source_index !== undefined &&
                  <span className="text-xs text-gray-500"> (sent #{b.source_index})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(para || bullets.length>0) && (
        <div className="text-xs text-gray-500 mt-3">
          Tip: head to <a className="underline" href="/qa">Ask the Document</a> to query this file.
        </div>
      )}
    </div>
  )
}
