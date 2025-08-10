// Simple contrast audit for key brand/accent/highlight combos against surface & brand backgrounds.
import { contrastRatio, ensureContrast } from '@/lib/ai/color'

export interface ContrastIssue { fg:string; bg:string; ratio:number; target:number }

export function auditKeyCombos(): ContrastIssue[] {
  const surface = '#FFFFFF'
  const brand = '#2F5D50'
  const accent = '#C07A5A'
  const highlight = '#F7BE58'
  const ink = '#1E1B16'
  const combos = [
    { fg: accent, bg: brand, target: 3 },
    { fg: highlight, bg: brand, target: 3 },
    { fg: highlight, bg: surface, target: 3 },
    { fg: accent, bg: surface, target: 4.5 },
    { fg: ink, bg: highlight, target: 4.5 }
  ]
  const issues: ContrastIssue[] = []
  for(const c of combos){
    let fg = c.fg, bg = c.bg
    const ratio = contrastRatio(fg, bg)
    if(ratio < c.target){
      const fixed = ensureContrast(fg, bg, c.target)
      const post = contrastRatio(fixed.a, fixed.b)
      if(post < c.target){
        issues.push({ fg:fixed.a, bg:fixed.b, ratio:Number(post.toFixed(2)), target:c.target })
      }
    }
  }
  return issues
}
