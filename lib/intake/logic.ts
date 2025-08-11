// Minimal JSON-logic evaluator for ops we need
type JSONLogic = any
type Ctx = { answers: Record<string, any> }

function getVar(path: string, ctx: Ctx) {
  if (!path.startsWith("answers.")) return undefined
  const keys = path.split(".").slice(1)
  return keys.reduce<any>((acc,k)=> (acc ? acc[k] : undefined), ctx)
}

export function evalLogic(expr: JSONLogic, ctx: Ctx): boolean {
  if (!expr || typeof expr !== "object") return false
  const op = Object.keys(expr)[0]
  const val = (expr as any)[op]
  switch (op) {
    case "==": return toVal(val[0], ctx) == toVal(val[1], ctx)
    case "!=": return toVal(val[0], ctx) != toVal(val[1], ctx)
    case ">=": return toVal(val[0], ctx) >= toVal(val[1], ctx)
    case "<=": return toVal(val[0], ctx) <= toVal(val[1], ctx)
    case "in": {
      const item = toVal(val[0], ctx)
      const list = toVal(val[1], ctx)
      return Array.isArray(list) ? list.includes(item) : false
    }
    case "and": return (val as any[]).every(v => evalLogic(v, ctx))
    case "or": return (val as any[]).some(v => evalLogic(v, ctx))
    case "var": return Boolean(getVar(val, ctx))
    case "!": return !evalLogic(val, ctx)
    default: return false
  }
}
function toVal(v:any, ctx:Ctx) {
  if (typeof v === "object" && v && "var" in v) return getVar(v.var, ctx)
  if (typeof v === "object" && !Array.isArray(v)) return v
  return v
}
