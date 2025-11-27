import { NavLink } from 'react-router-dom'


const tabs = [
{ to: '/', label: 'Dashboard' },
{ to: '/summarize', label: 'Get Summary'},
{ to: '/clauses', label: 'Clauses' },
{ to: '/risk', label: 'Risk' },
{ to: '/search', label: 'Semantic Search' },
{ to: '/qa', label: 'Ask the Document' },
]


export default function Navbar(){
return (
<header className="bg-white border-b">
<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
<div className="text-xl font-extrabold">⚖️ Legal Doc Analyzer</div>
<nav className="flex gap-2">
{tabs.map(t => (
<NavLink key={t.to} to={t.to}
className={({isActive})=> `px-3 py-2 rounded-md text-sm font-medium ${isActive? 'bg-black text-white':'hover:bg-gray-100'}`}
>{t.label}</NavLink>
))}
</nav>
</div>
</header>
)
}