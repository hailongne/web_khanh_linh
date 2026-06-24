const fs = require('fs');
const path = 'e:/web-khanh-linh-trans/app/globals.css';
const out = 'e:/web-khanh-linh-trans/tools/media-summary.txt';
const css = fs.readFileSync(path,'utf8');
const lines = css.split('\n');
const re = /@media\s*\([^)]+\)/;
let map = {};
for(let i=0;i<lines.length;i++){
  const m = lines[i].match(re);
  if(m){
    const key = m[0].trim();
    if(!map[key]) map[key]=[];
    map[key].push(i+1);
  }
}
let outLines = [];
Object.keys(map).sort().forEach(k=>{ outLines.push(k+' -> '+map[k].join(', ')); });
outLines.push('TOTAL_MEDIA_QUERIES: '+Object.keys(map).length);
fs.writeFileSync(out, outLines.join('\n'));
console.log('WROTE', out);
