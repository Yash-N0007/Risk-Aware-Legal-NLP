// Minimal mocked dataset
const DOC = {
id: 'doc-001',
title: 'Service Agreement — Acme vs. Beta',
roles: ['FACTS','ISSUE','ARG','REASON','HOLDING','ORDER','OTHER']
}


const CLAUSES = [
{ id:1, role:'FACTS', text:'Parties executed a service agreement on 02 Jan 2024 with a 12-month term.' },
{ id:2, role:'ISSUE', text:'Whether early termination without cause is permissible under clause 9.' },
{ id:3, role:'ARG', text:'Plaintiff argues notice must be 60 days as per industry standard.' },
{ id:4, role:'REASON', text:'The Court considered contra proferentem and course of dealing.' },
{ id:5, role:'HOLDING', text:'Termination clause requires 30 days written notice.' },
{ id:6, role:'ORDER', text:'Damages limited to fees paid in the last billing cycle.' },
{ id:7, role:'OTHER', text:'Vendor may terminate at its sole discretion without liability.' },
]


// naive risk: keyword + length
function riskScore(text){
const risky = [/sole discretion/i,/without liability/i,/indemnif/i,/liquidated damages/i,/termination for convenience/i]
const hits = risky.reduce((a,r)=> a + (r.test(text)?1:0), 0)
const len = Math.min(text.length/300,1)
return +(Math.min(1, 0.25*hits + 0.35*len).toFixed(2))
}


export async function getDoc(){ return { ...DOC } }
export async function listClauses(role){
const rows = CLAUSES.map(c=> ({...c, risk: riskScore(c.text)}))
return role? rows.filter(r=>r.role===role): rows
}


export async function getSummaries(){
return {
FACTS: ['The agreement was signed on 02 Jan 2024 for 12 months.'],
ISSUE: ['Is early termination without cause permitted?'],
REASON: ['Court applied contra proferentem and course of dealing.'],
HOLDING: ['30 days written notice is required for termination.'],
}
}


export async function semanticSearch(query){
// pretend similarity by simple overlap
const q = query.toLowerCase().split(/\W+/).filter(Boolean)
const rows = (await listClauses()).map(c => {
const tokens = c.text.toLowerCase().split(/\W+/)
const score = q.filter(t=>tokens.includes(t)).length / (q.length||1)
return { ...c, score: +score.toFixed(2) }
}).filter(r=>r.score>0).sort((a,b)=>b.score-a.score)
return rows.slice(0,8)
}


export async function ragAnswer(question){
const hits = await semanticSearch(question)
const answer = hits.length
? `Likely answer: ${hits[0].text}`
: 'No relevant clause found. Try rephrasing.'
return { answer, citations: hits.slice(0,3).map(h=>({id:h.id, role:h.role})) }
}