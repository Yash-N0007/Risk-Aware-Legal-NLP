import { useEffect, useState } from 'react'
import { getDoc, getSummaries } from '../lib/mockApi'
import Card from '../ui/Card'


export default function Dashboard(){
const [doc,setDoc] = useState(null)
const [sums,setSums] = useState({})
useEffect(()=>{(async()=>{ setDoc(await getDoc()); setSums(await getSummaries()) })()},[])
return (
<div className="space-y-6">
<div className="flex items-end justify-between">
<div>
<h1 className="text-3xl font-bold">Dashboard</h1>
<p className="text-gray-600">Unified pipeline view for your document.</p>
</div>
{doc && <div className="text-sm text-gray-500">Current: {doc.title}</div>}
</div>


<div className="grid md:grid-cols-2 gap-6">
<Card href="/clauses" title="📄 Clauses" desc="Browse by discourse role and inspect risk flags."/>
<Card href="/risk" title="⚠️ Risk Insights" desc="See high-risk or unusual clauses at a glance."/>
<Card href="/search" title="🔍 Semantic Search" desc="Find clauses by intent, not keywords."/>
<Card href="/qa" title="💬 Ask the Document" desc="Conversational Q&A with citations."/>
</div>


<Card>
<h3 className="text-lg font-semibold mb-3">Role-wise Summaries</h3>
<div className="grid md:grid-cols-2 gap-4">
{Object.entries(sums).map(([role, lines])=> (
<div key={role} className="p-4 border rounded bg-gray-50">
<div className="text-xs uppercase tracking-wide text-gray-500 mb-2">{role}</div>
<ul className="list-disc ml-5 text-sm text-gray-700">
{lines.map((s,i)=>(<li key={i}>{s}</li>))}
</ul>
</div>
))}
</div>
</Card>
</div>
)
}