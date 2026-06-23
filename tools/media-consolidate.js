const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const cssPath = path.join(root, 'app', 'globals.css');
const outReport = path.join(__dirname, 'media-consolidate-report.json');
function read(p){ try { return fs.readFileSync(p,'utf8'); } catch(e){ return null; } }
let css = read(cssPath);
if(!css){ console.error('globals.css not found'); process.exit(2); }
const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, '/*COMMENTSTRIPPED*/');

// find all @media blocks and their positions
const mediaRegex = /@media\s*([^\{]+)\{/g;
let m;
const mediaBlocks = [];
while((m = mediaRegex.exec(cssNoComments))){
  const cond = m[1].trim();
  const openIdx = m.index + m[0].length - 1; // position of '{'
  // find matching closing brace
  let depth = 1; let j = openIdx + 1;
  while(j < cssNoComments.length && depth>0){ if(cssNoComments[j]==='{') depth++; else if(cssNoComments[j]==='}') depth--; j++; }
  const endIdx = j; // index after closing brace
  // map back to original css index (simple approach: search for this substring in original css near m.index)
  mediaBlocks.push({cond, start: m.index, openIdx, end: endIdx});
}

// group by condition
const groups = {};
for(const b of mediaBlocks){
  groups[b.cond] = groups[b.cond] || [];
  groups[b.cond].push(b);
}

const toMerge = Object.entries(groups).filter(([cond, arr]) => arr.length > 1);
if(toMerge.length === 0){ console.log('No duplicate @media blocks to merge'); process.exit(0); }

// We'll operate on the original css string; to make reliable slicing, we'll find actual indexes by searching for the pattern in original css this time
let working = css;
const merges = [];
for(const [cond, arr] of toMerge){
  // find all occurrences positions in working string for this exact @media cond
  const escaped = cond.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp('@media\\s*' + escaped + '\\s*\\{', 'g');
  const positions = [];
  let mm;
  while((mm = regex.exec(working))){
    const sIdx = mm.index;
    const braceOpen = working.indexOf('{', sIdx + mm[0].length - 1);
    // find matching close
    let depth = 1; let k = braceOpen + 1; while(k < working.length && depth>0){ if(working[k]==='{') depth++; else if(working[k]==='}') depth--; k++; }
    const eIdx = k;
    positions.push({sIdx, braceOpen, eIdx});
  }
  if(positions.length < 2) continue;
  // extract contents and merge in order
  const contents = [];
  for(const p of positions){
    const inner = working.slice(p.braceOpen+1, p.eIdx-1);
    contents.push(inner.trim());
  }
  const mergedInner = contents.filter(Boolean).join('\n\n');
  // prepare new first block text
  const first = positions[0];
  const firstStart = first.sIdx;
  const firstOpen = first.braceOpen;
  const firstEnd = first.eIdx;
  const newFirstBlock = working.slice(firstStart, firstOpen+1) + '\n' + mergedInner + '\n' + '}';
  // remove later blocks from the end to avoid index shifts
  let newWorking = working;
  const later = positions.slice(1).sort((a,b)=>b.sIdx - a.sIdx);
  for(const p of later){
    newWorking = newWorking.slice(0, p.sIdx) + newWorking.slice(p.eIdx);
  }
  // replace the first block content
  // recalc first block start in newWorking by searching for the '@media cond {' pattern
  const findRegex = new RegExp('@media\\s*' + escaped + '\\s*\\{');
  const found = findRegex.exec(newWorking);
  if(!found){ console.error('Failed to locate first block after removals for', cond); continue; }
  const fidx = found.index;
  const fBrace = newWorking.indexOf('{', fidx + found[0].length - 1);
  // find matching close for the first block
  let depth2 = 1; let kk = fBrace + 1; while(kk < newWorking.length && depth2>0){ if(newWorking[kk]==='{') depth2++; else if(newWorking[kk]==='}') depth2--; kk++; }
  const fend = kk;
  newWorking = newWorking.slice(0, fBrace+1) + '\n' + mergedInner + '\n' + newWorking.slice(fend);

  merges.push({cond, countMerged: positions.length});
  working = newWorking;
}

if(merges.length > 0){
  fs.writeFileSync(cssPath + '.premedia.bak', css, 'utf8');
  fs.writeFileSync(cssPath, working, 'utf8');
  fs.writeFileSync(outReport, JSON.stringify(merges, null, 2), 'utf8');
  console.log('Merged media queries:', merges);
} else {
  console.log('No merges applied');
}

process.exit(0);
