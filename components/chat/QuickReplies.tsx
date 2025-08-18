'use client'

export function QuickReplies({ options, onPick }:{ options:string[]; onPick:(s:string)=>void }){
  return (
    <div className="px-3 pb-2 flex gap-2 overflow-x-auto">
      {options.map(o=>(
        <button type="button" key={o} onClick={()=>onPick(o)} className="px-3 py-1.5 rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_82%,white_18%)] text-sm">
          {o}
        </button>
      ))}
    </div>
  )
}

