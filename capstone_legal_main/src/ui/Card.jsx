export default function Card({title,desc,href,children}){
if(href){
return (
<a href={href} className="block p-6 bg-white border rounded-2xl shadow hover:shadow-lg transition">
<h3 className="text-lg font-semibold">{title}</h3>
{desc && <p className="text-sm text-gray-600 mt-1">{desc}</p>}
{children}
</a>
)
}
return (
<div className="p-6 bg-white border rounded-2xl shadow">{children || (
<>
<h3 className="text-lg font-semibold">{title}</h3>
{desc && <p className="text-sm text-gray-600 mt-1">{desc}</p>}
</>
)}</div>
)
}