const fs = require('fs');
const path = 'e:/web-khanh-linh-trans/app/globals.css';
const css = fs.readFileSync(path, 'utf8');
const lines = css.split(/\n/);
const sels = {};
const re = /^\s*([a-zA-Z0-9\.\#\:\[\*][^\{]+)\s*\{/;
for (let i=0;i<lines.length;i++){
  const m = re.exec(lines[i]);
  if(m){
    const sel = m[1].trim();
    if(!sels[sel]) sels[sel] = [];
    // capture block starting at this line
    let depth = 0;
    let props = [];
    for (let j=i; j<lines.length; j++){
      const line = lines[j];
      for (let k=0;k<line.length;k++){
        if(line[k] === '{') depth++;
        if(line[k] === '}') depth--;
      }
      // collect prop lines (simple: contains ':' and ends with ';')
      const propMatch = line.match(/\s*([\w-]+)\s*:\s*([^;]+);/);
      if(propMatch){
        props.push({raw: propMatch[0].trim(), prop: propMatch[1].trim(), value: propMatch[2].trim(), line: j+1});
      }
      if (j>i && depth<=0) { break; }
    }
    sels[sel].push({startLine: i+1, props});
  }
}
// Only keep selectors with multiple occurrences
const dup = Object.keys(sels).filter(k=>sels[k].length>1).sort();
const conflicts = [];
dup.forEach(sel => {
  const occ = sels[sel];
  const propMap = {};
  occ.forEach(o=>{
    o.props.forEach(p=>{
      if(!propMap[p.prop]) propMap[p.prop] = {};
      if(!propMap[p.prop][p.value]) propMap[p.prop][p.value] = [];
      propMap[p.prop][p.value].push(o.startLine + ':' + p.line);
    });
  });
  // find properties with >1 distinct values
  Object.keys(propMap).forEach(prop => {
    const vals = Object.keys(propMap[prop]);
    if(vals.length>1){
      conflicts.push({selector: sel, property: prop, values: vals.map(v=>({value:v, occurrences: propMap[prop][v]}))});
    }
  });
});
console.log(JSON.stringify({dupSelectors: dup, conflicts}, null, 2));
