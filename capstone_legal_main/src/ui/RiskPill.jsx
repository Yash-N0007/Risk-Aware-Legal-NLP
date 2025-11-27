export default function RiskPill({score}){
const color = score>=0.6? 'bg-red-100 text-red-700': score>=0.3? 'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'
return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>risk {score.toFixed(2)}</span>
}