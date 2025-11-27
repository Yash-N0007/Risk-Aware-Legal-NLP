import { useEffect, useState } from 'react'
import { listClauses } from '../lib/mockApi'
import RiskPill from '../ui/RiskPill'
import RoleBadge from '../ui/RoleBadge'


export default function Clauses(){
const [clauses,setClauses] = useState([])
const [role,setRole] = useState('')
useEffect(()=>{(async()=> setClauses(await listClauses(role||undefined)))()},[role])


return (
<div>
<div className="flex items-end justify-between mb-4">
<div>
<h1 className="text-2xl font-bold">Clauses</h1>
<p className="text-gray-600">Browse by role and inspect risk flags.</p>
</div>
<select value={role} onChange={e=>setRole(e.target.value)} className="border rounded px-3 py-2">
<option value="">All roles</option>
{['FACTS','ISSUE','ARG','REASON','HOLDING','ORDER','OTHER'].map(r=> <option key={r} value={r}>{r}</option>)}
</select>
</div>


<div className="space-y-3">
{clauses.map(c=> (
<div key={c.id} className="p-4 bg-white border rounded flex items-start justify-between">
<div>
<div className="mb-1"><RoleBadge role={c.role}/></div>
<div>{c.text}</div>
</div>
<RiskPill score={c.risk}/>
</div>
))}
</div>
</div>
)
}