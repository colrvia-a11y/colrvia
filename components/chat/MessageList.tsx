export type Msg = { id:string; sender:'user'|'assistant'|'system'; text?:string }

export function MessageList({ messages }:{ messages:Msg[] }){
  return (
    <div className="px-3 py-4 space-y-2">
      {messages.map(m=>(
        <div key={m.id} className={m.sender==='user'?'flex justify-end':'flex justify-start'}>
          <div className={`${m.sender==='user'
              ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
              : 'bg-[color-mix(in_oklab,var(--surface)_85%,white_15%)] text-[var(--ink)]'} max-w-[80%] rounded-2xl px-3 py-2`}>
            {m.text}
          </div>
        </div>
      ))}
    </div>
  )
}

