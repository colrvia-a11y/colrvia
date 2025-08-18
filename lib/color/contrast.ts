export function hexToRgb(hex:string){ const m=hex.replace('#',''); const i=parseInt(m,16); return {r:(i>>16)&255,g:(i>>8)&255,b:i&255} }
function lum(c:number){ c/=255; return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4) }
export function contrastRatio(a:string,b:string){ const A=hexToRgb(a),B=hexToRgb(b); const L1=0.2126*lum(A.r)+0.7152*lum(A.g)+0.0722*lum(A.b); const L2=0.2126*lum(B.r)+0.7152*lum(B.g)+0.0722*lum(B.b); const [hi,lo]=L1>L2?[L1,L2]:[L2,L1]; return (hi+0.05)/(lo+0.05) }
export function badge(a:string,b:string){ const r=contrastRatio(a,b); return r>=7?'AAA':r>=4.5?'AA':'Fail' }
