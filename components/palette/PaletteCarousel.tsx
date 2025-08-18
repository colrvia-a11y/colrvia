export function PaletteCarousel({ children }:{ children:React.ReactNode }){
  return (
    <div className="overflow-x-auto snap-x snap-mandatory flex gap-4 p-2">
      {Array.isArray(children) ? children.map((c,i)=><div key={i} className="min-w-[85%] snap-center">{c}</div>) : children}
    </div>
  )
}
