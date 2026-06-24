const fs = require('fs');
const path = 'e:/web-khanh-linh-trans/app/globals.css';
const out = 'e:/web-khanh-linh-trans/tools/important-summary.txt';
const css = fs.readFileSync(path,'utf8');
const lines = css.split('\n');
function findSelector(lineIndex){
  for(let i=lineIndex;i>=0;i--){
    if(/\{\s*$/.test(lines[i])){
      // capture selector
      return lines[i].replace(/\s*\{\s*$/,'').trim() + ' (line '+(i+1)+')';
    }
  }
  return 'UNKNOWN';
}
let outLines = [];
for(let i=0;i<lines.length;i++){
  if(lines[i].includes('!important')){
    const sel = findSelector(i);
    outLines.push('LINE '+(i+1)+': '+lines[i].trim());
    outLines.push('  selector context: '+sel);
    // heuristic: mark unnecessary if '!important' appears inside a media query or later override exists
    // Simple heuristic: if the line contains '!important' and the selector has other occurrences (we can check counts)
    outLines.push('  NOTE: REVIEW (heuristic)');
    outLines.push('');
  }
}
fs.writeFileSync(out, outLines.join('\n'));
console.log('WROTE',out);
