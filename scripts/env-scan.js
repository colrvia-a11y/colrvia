// scripts/env-scan.js
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const exts = new Set(['.ts','.tsx','.js','.mjs','.cjs','.json','.yml','.yaml']);
const keys = new Set();

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.next')) continue;
    const p = path.join(dir, name);
    let s;
    try { s = fs.statSync(p); } catch { continue }
    if (s.isDirectory()) walk(p); else if (exts.has(path.extname(name))) {
      let text;
      try { text = fs.readFileSync(p, 'utf8'); } catch { continue }
      const re = /process\.env\.([A-Z0-9_]+)/g;
      let m;
      while ((m = re.exec(text))) keys.add(m[1]);
    }
  }
}

walk(root);
const list = Array.from(keys).sort();
console.log('Found env keys (' + list.length + '):');
for (const k of list) console.log(' - ' + k);
