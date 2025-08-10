"use client"
interface SummaryProps { values: { designer:string; vibe:string; brand:string; lighting:string; hasWarmWood:boolean; roomType?:string|null; photoUrl?:string|null } }

export default function SummaryCard({ values }: SummaryProps){
  return (
    <aside className="w-full md:w-64 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 h-fit">
      <h3 className="font-display text-lg mb-4">Summary</h3>
      <ul className="space-y-3 text-xs">
        <li><span className="font-medium">Designer:</span> {values.designer}</li>
        <li><span className="font-medium">Vibe:</span> {values.vibe}</li>
        <li><span className="font-medium">Brand:</span> {values.brand}</li>
        <li><span className="font-medium capitalize">Lighting:</span> {values.lighting}</li>
        <li><span className="font-medium">Warm wood:</span> {values.hasWarmWood? 'Yes':'No'}</li>
        {values.roomType && <li><span className="font-medium">Room:</span> {values.roomType}</li>}
        {values.photoUrl && <li><span className="font-medium">Photo:</span> Added</li>}
      </ul>
    </aside>
  )
}
