const colors = {
FACTS: 'bg-blue-100 text-blue-700',
ISSUE: 'bg-orange-100 text-orange-700',
ARG: 'bg-purple-100 text-purple-700',
REASON: 'bg-teal-100 text-teal-700',
HOLDING: 'bg-green-100 text-green-700',
ORDER: 'bg-emerald-100 text-emerald-700',
OTHER: 'bg-gray-100 text-gray-700',
}
export default function RoleBadge({role}){
return <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[role]||colors.OTHER}`}>{role}</span>
}