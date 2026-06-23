const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const cssPath = path.join(root, 'app', 'globals.css');
const outPath = path.join(root, 'tools', 'css-audit-output.json');

function readFile(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch (e) { return null; }
}

const css = readFile(cssPath);
if (!css) {
  console.error('globals.css not found at', cssPath);
  process.exit(2);
}

const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, '');

// find all blocks (both at-rules and selector rules)
const blocks = [];
let i = 0;
while (i < cssNoComments.length) {
  const openIdx = cssNoComments.indexOf('{', i);
  if (openIdx === -1) break;
  // find selector text (trim trailing whitespace/backwards)
  const selStart = cssNoComments.lastIndexOf('\n', openIdx) + 1;
  const selectorRaw = cssNoComments.slice(selStart, openIdx).trim();

  // find matching closing brace
  let depth = 1;
  let j = openIdx + 1;
  while (j < cssNoComments.length && depth > 0) {
    if (cssNoComments[j] === '{') depth++;
    else if (cssNoComments[j] === '}') depth--;
    j++;
  }
  const blockContent = cssNoComments.slice(openIdx + 1, j - 1).trim();
  const preText = cssNoComments.slice(Math.max(0, selStart - 80), selStart);
  // compute line number
  const before = cssNoComments.slice(0, selStart);
  const line = before.split('\n').length;
  blocks.push({ selectorRaw, blockContent, startIndex: selStart, line, endIndex: j });
  i = j;
}

const selectorsMap = Object.create(null);
const selectorBlocks = Object.create(null);
const mediaQueries = Object.create(null);
let importantCount = 0;
const longSelectors = [];

for (const b of blocks) {
  const s = b.selectorRaw;
  if (!s) continue;
  if (s.startsWith('@media')) {
    const cond = s.replace(/^@media\s*/i, '').trim();
    mediaQueries[cond] = (mediaQueries[cond] || 0) + 1;
    continue;
  }
  // split selector group by commas
  const parts = s.split(',').map(x => x.trim()).filter(Boolean);
  for (const p of parts) {
    selectorsMap[p] = (selectorsMap[p] || 0) + 1;
    // capture block content for later diff
    selectorBlocks[p] = selectorBlocks[p] || [];
    selectorBlocks[p].push({ content: b.blockContent, line: b.line });

    // specificity length heuristic: token count separated by spaces
    const tokens = p.split(/\s+/).filter(Boolean);
    if (tokens.length >= 4) {
      longSelectors.push({ selector: p, tokens: tokens.length, line: b.line });
    }
  }
}

// compute duplicate selectors
const duplicateSelectors = [];
const identicalDuplicates = [];
const conflictingDuplicates = [];
for (const sel of Object.keys(selectorsMap)) {
  if (selectorsMap[sel] > 1) {
    duplicateSelectors.push({ selector: sel, count: selectorsMap[sel], occurrences: selectorBlocks[sel] });
    // compare blocks content for identical
    const contents = selectorBlocks[sel].map(x => x.content.replace(/\s+/g,' ').trim());
    const uniqueContents = Array.from(new Set(contents));
    if (uniqueContents.length === 1) {
      identicalDuplicates.push({ selector: sel, count: selectorsMap[sel], line: selectorBlocks[sel][0].line });
    } else {
      conflictingDuplicates.push({ selector: sel, count: selectorsMap[sel], samples: selectorBlocks[sel].slice(0,3) });
    }
  }
}

// important count
const impMatches = cssNoComments.match(/!important/g) || [];
importantCount = impMatches.length;

// total selectors (count comma-separated selectors)
let totalSelectors = 0;
for (const key of Object.keys(selectorsMap)) totalSelectors += selectorsMap[key];

// media queries totals
const totalMediaQueries = Object.values(mediaQueries).reduce((a,b)=>a+b,0);
const duplicateMediaQueries = Object.entries(mediaQueries).filter(([k,v]) => v>1).map(([k,v])=>({cond:k,count:v}));

// scan source files for class/id usage - naive: look for simple token occurrences across app/ and prototype/
function listFiles(dir, exts=['.tsx','.ts','.js','.jsx','.html']){
  const out = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    if (f.name === 'node_modules' || f.name === '.next' || f.name === 'public' || f.name === 'tools') continue;
    const fp = path.join(dir, f.name);
    if (f.isDirectory()) out.push(...listFiles(fp, exts));
    else {
      const ext = path.extname(f.name).toLowerCase();
      if (exts.includes(ext)) out.push(fp);
    }
  }
  return out;
}

const searchDirs = [path.join(root, 'app'), path.join(root, 'prototype'), path.join(root, 'agent')].filter(fs.existsSync);
let sourceFiles = [];
for (const d of searchDirs) sourceFiles.push(...listFiles(d));

function fileContainsToken(fp, token){
  const txt = readFile(fp) || '';
  return txt.indexOf(token) !== -1;
}

const unusedSelectors = [];
const suspectedUnused = [];
for (const sel of Object.keys(selectorsMap)) {
  // only consider class or id selectors
  const classTokens = Array.from(sel.matchAll(/[.#]([a-zA-Z0-9\-_]+)/g)).map(m=>m[1]);
  if (classTokens.length === 0) continue;
  let found = false;
  for (const t of classTokens) {
    for (const fp of sourceFiles) {
      const txt = readFile(fp);
      if (!txt) continue;
      if (txt.indexOf(t) !== -1) { found = true; break; }
    }
    if (found) break;
  }
  if (!found) {
    // check if definitely unused: token not in any source files
    unusedSelectors.push({ selector: sel, occurrences: selectorsMap[sel] });
  } else {
    // nothing
  }
}

// also count inline style attributes in source files (className style attributes)
let inlineAttrCount = 0;
let inlineJsStyleAssignments = 0;
for (const fp of sourceFiles) {
  const txt = readFile(fp) || '';
  const m = txt.match(/style\s*=\s*\{/g);
  if (m) inlineAttrCount += m.length;
  // JS style assignments like element.style.
  const m2 = txt.match(/\.style\./g);
  if (m2) inlineJsStyleAssignments += m2.length;
}

const result = {
  path: cssPath,
  totalSelectors,
  uniqueSelectorCount: Object.keys(selectorsMap).length,
  duplicateSelectors: duplicateSelectors.length,
  identicalDuplicates,
  conflictingDuplicatesCount: conflictingDuplicates.length,
  duplicateSelectorList: duplicateSelectors.slice(0,200),
  totalMediaQueries,
  mediaQueryMap: mediaQueries,
  duplicateMediaQueries,
  importantCount,
  inlineStyleAttrs: inlineAttrCount,
  inlineJsStyleAssignments,
  totalBlocks: blocks.length,
  unusedSelectorsCount: unusedSelectors.length,
  unusedSelectors: unusedSelectors.slice(0,200),
  longSelectors,
};

fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
console.log('Audit written to', outPath);

// also print summary
console.log('Summary:');
console.log('Total selectors:', result.totalSelectors);
console.log('Unique selectors:', result.uniqueSelectorCount);
console.log('Duplicate selectors count:', result.duplicateSelectors);
console.log('Total media queries:', result.totalMediaQueries);
console.log('!important occurrences:', result.importantCount);
console.log('Inline style attrs (JSX):', result.inlineStyleAttrs);
console.log('Inline JS style assignments (.style.):', result.inlineJsStyleAssignments);

process.exit(0);
