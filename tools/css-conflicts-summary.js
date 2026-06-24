const fs = require('fs');
const path = 'e:/web-khanh-linh-trans/app/globals.css';
const out = 'e:/web-khanh-linh-trans/tools/conflicts-summary.txt';
const css = fs.readFileSync(path, 'utf8');
const lines = css.split(/\n/);
const sels = {};
const re = /^\s*([a-zA-Z0-9\.\#\:\[\*][^\{]+)\s*\{/;
for (let i=0;i<lines.length;i++){
  const m = re.exec(lines[i]);
  if(m){
    const sel = m[1].trim();
    if(!sels[sel]) sels[sel] = [];
    // capture block
    let depth = 0; let props = [];
    for (let j=i;j<lines.length;j++){
      const ln = lines[j];
      for (let k=0;k<ln.length;k++){ if(ln[k]==='{') depth++; if(ln[k]==='}') depth--; }
      const pm = ln.match(/\s*([\w-]+)\s*:\s*([^;]+);/);
      if(pm){ props.push({prop: pm[1].trim(), value: pm[2].trim(), line: j+1}); }
      if(j>i && depth<=0) break;
    }
    sels[sel].push({startLine: i+1, props});
  }
}
let linesOut=[];
const dup = Object.keys(sels).filter(k=>sels[k].length>1).sort();
linesOut.push('DUPLICATE SELECTORS: ' + dup.length);
linesOut.push('');
for(const sel of dup){
  linesOut.push('SELECTOR: ' + sel);
  for(const occ of sels[sel]){
    linesOut.push('  occurrence at line ' + occ.startLine + ' -> properties: ' + occ.props.map(p=>p.prop+': '+p.value+' (ln '+p.line+')').join('; '));
  }
  // detect conflicting properties
  const propMap = {};
  for(const occ of sels[sel]){
    for(const p of occ.props){ if(!propMap[p.prop]) propMap[p.prop] = {}; if(!propMap[p.prop][p.value]) propMap[p.prop][p.value] = []; propMap[p.prop][p.value].push(occ.startLine+':'+p.line); }}
  const conflicts = [];
  for(const prop in propMap){ const vals = Object.keys(propMap[prop]); if(vals.length>1) conflicts.push({prop, vals}); }
  if(conflicts.length){ linesOut.push('  CONFLICTS:'); for(const c of conflicts){ linesOut.push('    - ' + c.prop + ' set to: ' + Object.keys(propMap[c.prop]).map(v=>v + ' ('+propMap[c.prop][v].join(',')+')').join(' ; ')); } }
  linesOut.push('');
}
fs.writeFileSync(out, linesOut.join('\n'));
console.log('WROTE', out);
