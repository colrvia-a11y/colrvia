type Settings = { theme:'system'|'light'|'dark'; accent:string; fontScale:-1|0|1 }
const KEY = 'colrvia:settings'
const listeners = new Set<() => void>()

export function getSettings():Settings{
  if (typeof window==='undefined') return { theme:'system', accent:'', fontScale:0 }
  try { return JSON.parse(localStorage.getItem(KEY)!) || { theme:'system', accent:'', fontScale:0 } }
  catch { return { theme:'system', accent:'', fontScale:0 } }
}
export function setSettings(next:Partial<Settings>){
  const cur=getSettings(); localStorage.setItem(KEY, JSON.stringify({ ...cur, ...next })); listeners.forEach(l=>l())
}
export function onSettingsChange(fn:()=>void){
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}
