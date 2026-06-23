const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const cssPath = path.join(root, 'app', 'globals.css');
const auditPath = path.join(root, 'tools', 'css-audit-output.json');

function read(p){ try { return fs.readFileSync(p, 'utf8'); } catch(e){ return null; } }
const css = read(cssPath);
if(!css) { console.error('globals.css not found'); process.exit(2); }
const audit = JSON.parse(read(auditPath) || '{}');

const duplicateList = audit.duplicateSelectorList || [];

// helper: parse properties keys from block content
function parseProps(content){
  const props = {};
  const re = /([a-zA-Z-]+)\s*:\s*([^;]+);/g;
  let m;
  while((m=re.exec(content))){
    props[m[1].trim()] = (m[2]||'').trim();
  }
  return props;
}

let newCss = css;
let changes = [];

for(const dup of duplicateList){
  const sel = dup.selector;
  const occ = dup.occurrences || [];
  if(occ.length < 2) continue;

  // parse properties for each occurrence
  const occProps = occ.map(o => parseProps(o.content));
  // check for overlapping keys
  const allKeys = occProps.map(Object.keys);
  const keySet = new Set();
  let overlap = false;
  for(const keys of allKeys){
    for(const k of keys){
      if(keySet.has(k)) { overlap = true; break; }
      keySet.add(k);
    }
    if(overlap) break;
  }
  if(overlap) continue; // skip merging when property keys overlap

  // safe to merge: build combined declarations in order of first->last
  const combined = {};
  for(const p of occProps){
    for(const [k,v] of Object.entries(p)) combined[k]=v;
  }
  const combinedText = Object.entries(combined).map(([k,v])=>`  ${k}: ${v};`).join('\n');

  // Now find all occurrences of selector in css and their braces positions
  // use a simple regex that finds the selector followed by optional whitespace then a { 
  const regex = new RegExp(''+sel.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')+'\\s*\\{', 'g');
  let match;
  const positions = [];
  while((match = regex.exec(newCss))){
    const start = match.index;
    const braceOpen = newCss.indexOf('{', start);
    // find matching closing brace
    let depth = 1; let j = braceOpen+1;
    while(j < newCss.length && depth>0){ if(newCss[j]==='{') depth++; else if(newCss[j]==='}') depth--; j++; }
    const end = j; // end is index after closing brace
    positions.push({start, braceOpen, end});
  }
  if(positions.length < 2) continue; // unexpected

  // We'll keep the first occurrence, replace its block with combined, remove others
  const first = positions[0];
  const before = newCss.slice(0, first.braceOpen+1);
  const afterFirst = newCss.slice(first.braceOpen+1);
  // find the index of end of first block relative to original
  // reconstruct newCss by replacing first block content and removing later blocks

  // Build the new content for the first block
  const newBlockContent = '\n' + combinedText + '\n';

  // remove later blocks by slicing them out
  // we must adjust indices as we mutate string; to simplify, collect ranges to remove then apply backwards
  const removeRanges = positions.slice(1).map(p=>({s:p.start, e:p.end})).sort((a,b)=>b.s-a.s);
  let tempCss = newCss;
  for(const r of removeRanges){
    tempCss = tempCss.slice(0, r.s) + tempCss.slice(r.e);
  }
  // now replace content inside first block: find new first block positions again
  const firstMatch = new RegExp(''+sel.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')+'\\s*\\{','g').exec(tempCss);
  if(!firstMatch){ console.error('first occurrence not found after removals for', sel); continue; }
  const fo = firstMatch.index;
  const fBraceOpen = tempCss.indexOf('{', fo);
  // find matching close
  let depth2 = 1; let jj=fBraceOpen+1; while(jj<tempCss.length && depth2>0){ if(tempCss[jj]==='{') depth2++; else if(tempCss[jj]==='}') depth2--; jj++; }
  const fEnd = jj;
  const newCssCandidate = tempCss.slice(0, fBraceOpen+1) + newBlockContent + tempCss.slice(fEnd-1);
  newCss = newCssCandidate;
  changes.push({selector: sel, mergedCount: positions.length});
}

if(changes.length>0){
  // backup existing file
  fs.writeFileSync(cssPath + '.premerge.bak', css, 'utf8');
  fs.writeFileSync(cssPath, newCss, 'utf8');
  console.log('Applied safe merges:', changes);
  fs.writeFileSync(path.join(__dirname,'css-merge-report.json'), JSON.stringify(changes, null, 2), 'utf8');
} else {
  console.log('No safe merges found');
}

process.exit(0);
