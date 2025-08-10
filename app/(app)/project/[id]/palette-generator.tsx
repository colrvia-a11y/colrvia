"use client";

export default function PaletteGenerator(){
  const colors = ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA']
  return (
    <div className="space-y-2 mt-6">
      <button
        onClick={() => { /* placeholder no-op for future generation */ }}
        className="rounded-xl px-4 py-2 border"
      >Generate Palette</button>
      <div className="flex gap-2">
        {colors.map(c => (
          <div key={c} className="h-10 w-10 rounded" style={{ background: c }} title={c} />
        ))}
      </div>
    </div>
  )
}
