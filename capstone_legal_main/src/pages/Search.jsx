import { useState } from 'react'
import { semanticSearch } from '../lib/mockApi'
import RoleBadge from '../ui/RoleBadge'


export default function Search(){
const [q,setQ] = useState('early termination notice period')
const [hits,setHits] = useState([])
async function go(){ setHits(await semanticSearch(q)) }


return (
<div>
<h1 className="text-2xl font-bold mb-2">Semantic Search</h1>
<p className="text-gray-600 mb-4">Find clauses by intent, not keywords.</p>
<div className="flex gap-2">
<input className="border rounded px-3 py-2 flex-1" value={q} onChange={e=>setQ(e.target.value)} placeholder="Try: early termination"/>
<button className="bg-black text-white px-4 py-2 rounded" onClick={go}>Search</button>
</div>


<div className="mt-5 space-y-3">
{hits.map(h => (
<div key={h.id} className="p-4 bg-white border rounded">
<div className="flex items-center justify-between mb-1">
<RoleBadge role={h.role}/>
<div className="text-xs text-gray-500">similarity {h.score.toFixed(2)}</div>
</div>
<div>{h.text}</div>
</div>
))}
</div>
</div>
)
}