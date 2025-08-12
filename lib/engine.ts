import { INTAKE_GRAPH, type FieldSpec } from "@/lib/intake-graph";
import type { SessionState, RoomType } from "@/lib/types";

export function countAllFields(state: SessionState): number {
  const answers = state.answers || {};
  const modules: any = INTAKE_GRAPH.modules as any;
  const core = (INTAKE_GRAPH.core as any).flatMap((f: any) => f.input_type === "group" ? f.fields : f);
  const carry = (INTAKE_GRAPH.carryover as any).flatMap((f: any) => f.input_type === "group" ? f.fields : f);
  const room = (answers["room_type"] as any) || (state as any).room_type;
  const mod = room && modules[room] ? modules[room].flatMap((f: any) => f.input_type === "group" ? f.fields : f) : [];
  const all = [...core, ...carry, ...mod];
  return all.filter((f: any) => f.input_type !== "group").length;
}
// (imports moved to top for ordering)

type Comparator = "==" | "!=" | ">=" | "<=" | ">" | "<";

/** Evaluate simple show_if objects like:
 * { need_white_match: true } OR { dark_comfort: { ">=": 3 } }
 */
function evalShowIf(show_if: any, answers: Record<string, unknown>): boolean {
  if (!show_if) return true;
  const ops: Comparator[] = ["==","!=",">=", "<=", ">", "<"];
  for (const key of Object.keys(show_if)) {
    const rule = (show_if as any)[key];
    const val = answers[key as keyof typeof answers];

    if (rule && typeof rule === "object" && !Array.isArray(rule)) {
      // comparator form: { ">=": 3 }
      const cmpOp = Object.keys(rule)[0] as Comparator;
      const target = (rule as any)[cmpOp];
      if (!ops.includes(cmpOp)) return false;
      const a = typeof val === "number" ? val : Number(val);
      const b = typeof target === "number" ? target : Number(target);
      if (Number.isNaN(a) || Number.isNaN(b)) return false;
      switch (cmpOp) {
        case "==": if (!(a === b)) return false; break;
        case "!=": if (!(a !== b)) return false; break;
        case ">=": if (!(a >= b)) return false; break;
        case "<=": if (!(a <= b)) return false; break;
        case ">":  if (!(a >  b)) return false; break;
        case "<":  if (!(a <  b)) return false; break;
      }
    } else {
      // equality form
      if (val !== rule) return false;
    }
  }
  return true;
}

type FlatField = FieldSpec & { lineage: string[] };

function flatten(fields: FieldSpec[], lineage: string[] = []): FlatField[] {
  const out: FlatField[] = [];
  for (const f of fields) {
    if ((f as any).input_type === "group" && (f as any).fields) {
      out.push(...flatten((f as any).fields, [...lineage, f.id]));
    } else {
      out.push({ ...(f as any), lineage: lineage });
    }
  }
  return out;
}

function orderedFields(state: SessionState): FlatField[] {
  const core = flatten(INTAKE_GRAPH.core as any);
  const carry = flatten(INTAKE_GRAPH.carryover as any);
  const room = (state.answers?.["room_type"] as RoomType) || (state as any).room_type;
  const mod = room && (INTAKE_GRAPH.modules as any)[room] ? flatten((INTAKE_GRAPH.modules as any)[room]) : [];
  return [...core, ...carry, ...mod];
}

export function getNextField(state: SessionState): FieldSpec | null {
  const answers = state.answers || {};
  const all = orderedFields(state);
  for (const f of all) {
    if ((f as any).input_type === "group") continue; // groups are flattened
    if (!evalShowIf((f as any).show_if, answers)) continue;
    if (answers[(f as any).id] !== undefined && answers[(f as any).id] !== null && answers[(f as any).id] !== "") continue;
    return f;
  }
  return null;
}
