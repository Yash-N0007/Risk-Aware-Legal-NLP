import { useEffect, useState } from 'react'
import { listClauses } from '../lib/mockApi'
import RiskPill from '../ui/RiskPill'


export default function Risk(){
const [rows,setRows] = useState([])
const [threshold,setThreshold] = useState(0.3)
useEffect(()=>{(async()=> {
const all = await listClauses()
setRows(all.filter(c=>c.risk >= threshold).sort((a,b)=>b.risk-a.risk))
})()},[threshold])


return (
<div>
<div className="flex items-end justify-between mb-4">
<div>
<h1 className="text-2xl font-bold">Risk & Anomaly Insights</h1>
<p className="text-gray-600">Clauses flagged by heuristic risk score.</p>
</div>
<div className="flex items-center gap-2 text-sm">
<span>Threshold</span>
<input type="range" min="0" max="1" step="0.05" value={threshold}
onChange={e=>setThreshold(parseFloat(e.target.value))}/>
<span className="w-12 text-right">{threshold.toFixed(2)}</span>
</div>
</div>


<div className="space-y-3">
{rows.map(c=> (
<div key={c.id} className="p-4 bg-white border rounded">
<div className="flex items-center justify-between mb-1">
<div className="text-sm text-gray-500">Clause #{c.id}</div>
<RiskPill score={c.risk}/>
</div>
<div>{c.text}</div>
</div>
))}
{!rows.length && <div className="text-gray-500">No clauses above threshold.</div>}
</div>
</div>
)
}