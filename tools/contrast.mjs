#!/usr/bin/env node
/* ==========================================================================
   ARCHIC CONTRAST CHECKER
   --------------------------------------------------------------------------
   Parses a brand.css, resolves every OKLCH token to sRGB, and reports the
   full contrast matrix in both WCAG 2.1 and APCA (W3 0.1.9).

   Why both: WCAG 2 contrast maths systematically overestimates the
   readability of light text on dark grounds. When WCAG passes and APCA
   fails, trust APCA. See 02-craft/02-color.md.

   Usage:
     node tools/contrast.mjs 01-tokens/brands/casa-lentisco.css
     node tools/contrast.mjs 01-tokens/brands/berth-ops.css --theme night

   Exit code 1 if WCAG, APCA, token presence, or sRGB gamut fails. Wire it into CI.
   ========================================================================== */

import { readFileSync } from 'node:fs';

/* ---------- OKLCH → sRGB (CSS Color 4) ---------------------------------- */

function oklchToLinearSrgb(L, C, Hdeg) {
  const h = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

const encodeGamma = (c) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

/* Gamut check before clipping — an out-of-gamut token renders differently
   per browser and must be caught, not silently clamped. */
function oklchToSrgb(L, C, H) {
  const lin = oklchToLinearSrgb(L, C, H);
  const outOfGamut = lin.some((v) => v < -1e-4 || v > 1 + 1e-4);
  const clipped = lin.map((v) => Math.min(1, Math.max(0, v)));
  const srgb = clipped.map((v) => Math.round(encodeGamma(v) * 255));
  return { srgb, outOfGamut };
}

/* ---------- WCAG 2.1 ----------------------------------------------------- */

function relativeLuminance([r, g, b]) {
  const f = (v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function wcagContrast(fg, bg) {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/* ---------- APCA-W3 0.1.9 ------------------------------------------------ */

const APCA = {
  mainTRC: 2.4,
  Rco: 0.2126729, Gco: 0.7151522, Bco: 0.0721750,
  normBG: 0.56, normTXT: 0.57, revTXT: 0.62, revBG: 0.65,
  blkThrs: 0.022, blkClmp: 1.414,
  scaleBoW: 1.14, scaleWoB: 1.14,
  loBoWoffset: 0.027, loWoBoffset: 0.027,
  deltaYmin: 0.0005, loClip: 0.1,
};

function apcaY([r, g, b]) {
  const { mainTRC, Rco, Gco, Bco, blkThrs, blkClmp } = APCA;
  let Y =
    Rco * Math.pow(r / 255, mainTRC) +
    Gco * Math.pow(g / 255, mainTRC) +
    Bco * Math.pow(b / 255, mainTRC);
  if (Y < blkThrs) Y += Math.pow(blkThrs - Y, blkClmp);
  return Y;
}

function apcaLc(fg, bg) {
  const Yt = apcaY(fg);
  const Yb = apcaY(bg);
  const K = APCA;
  if (Math.abs(Yb - Yt) < K.deltaYmin) return 0;

  let S, out;
  if (Yb > Yt) { // dark text on light background
    S = (Math.pow(Yb, K.normBG) - Math.pow(Yt, K.normTXT)) * K.scaleBoW;
    out = S < K.loClip ? 0 : (S - K.loBoWoffset) * 100;
  } else {       // light text on dark background
    S = (Math.pow(Yb, K.revBG) - Math.pow(Yt, K.revTXT)) * K.scaleWoB;
    out = S > -K.loClip ? 0 : (S + K.loWoBoffset) * 100;
  }
  return out;
}

/* APCA guidance (W3 bronze-tier lookup, simplified):
   TEXT     |Lc| 90 preferred body · 75 minimum body · 60 large/fluent
                 45 large headline · 30 absolute minimum
   NON-TEXT |Lc| 45 preferred · 30 minimum for meaningful UI · 15 floor
   Non-text is judged on its own scale — borders and focus rings are not
   held to body-text thresholds. */
const apcaVerdict = (lc, kind = 'text') => {
  const a = Math.abs(lc);
  if (kind === 'nontext') {
    if (a >= 60) return 'ui ✓✓';
    if (a >= 45) return 'ui ✓';
    if (a >= 30) return 'ui min';
    if (a >= 15) return 'ui floor';
    return 'FAIL';
  }
  if (a >= 90) return 'body ✓✓';
  if (a >= 75) return 'body ✓';
  if (a >= 60) return 'large ✓';
  if (a >= 45) return 'headline';
  if (a >= 30) return 'minimum';
  return 'FAIL';
};

/* ---------- CSS token resolution ----------------------------------------- */

function parseTokens(rawCss, theme) {
  /* Strip comments FIRST. Without this, prose like
       "--surface-sunken: 4.52 (64.6) ← tightest pair"
     inside a documentation comment is parsed as a real declaration and
     silently overwrites the token — which is exactly how this checker
     reported two false failures on its own brand files. Documentation that
     mentions token names is normal and must not change the result. */
  const css = rawCss.replace(/\/\*[\s\S]*?\*\//g, '');
  const tokens = new Map();
  // Root block(s) first, then the theme block, so theme wins.
  const blocks = [];
  const rootRe = /:root\s*\{([\s\S]*?)\n\s*\}/g;
  let m;
  while ((m = rootRe.exec(css))) blocks.push(m[1]);
  if (theme) {
    const themeRe = new RegExp(
      `\\[data-theme=["']${theme}["']\\]\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, 'g');
    while ((m = themeRe.exec(css))) blocks.push(m[1]);
  }
  for (const block of blocks) {
    const declRe = /(--[\w-]+)\s*:\s*([^;]+);/g;
    let d;
    while ((d = declRe.exec(block))) tokens.set(d[1], d[2].trim());
  }
  return tokens;
}

function resolve(tokens, name, depth = 0) {
  if (depth > 12) return null;
  let v = tokens.get(name);
  if (!v) return null;
  const varRe = /var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/;
  let vm;
  while ((vm = varRe.exec(v))) {
    const inner = resolveRaw(tokens, vm[1], depth + 1) ?? vm[2] ?? '';
    v = v.slice(0, vm.index) + inner + v.slice(vm.index + vm[0].length);
  }
  return v.trim();
}
function resolveRaw(tokens, name, depth) {
  const v = resolve(tokens, name, depth);
  return v;
}

/* oklch(96.5% .018 78)  ·  oklch(25% 0.030 96 / 0.55) */
function parseOklch(value) {
  const m = value.match(
    /oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)\s*)?\)/i);
  if (!m) return null;
  return {
    L: parseFloat(m[1]) / 100,
    C: parseFloat(m[2]),
    H: parseFloat(m[3]),
    alpha: m[4] ? parseFloat(m[4]) : 1,
  };
}

function toRgb(tokens, name) {
  const raw = resolve(tokens, name);
  if (!raw) return null;
  const ok = parseOklch(raw);
  if (!ok) return null;
  const { srgb, outOfGamut } = oklchToSrgb(ok.L, ok.C, ok.H);
  return { rgb: srgb, raw, outOfGamut, alpha: ok.alpha };
}

const hex = ([r, g, b]) =>
  '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');

/* ---------- The matrix --------------------------------------------------- */

/* [ foreground, background, WCAG minimum, label ]
   Minimums are the ARCHIC standard, not the WCAG floor.
   See 00-foundation/03-invariants-and-variables.md. */
const PAIRS = [
  ['--text-primary',   '--bg-primary',   7.0, 'body text'],
  ['--text-primary',   '--bg-secondary', 7.0, 'body on alt band'],
  ['--text-primary',   '--surface',      7.0, 'body on surface'],
  ['--text-primary',   '--surface-sunken', 7.0, 'body on sunken'],
  ['--text-secondary', '--bg-primary',   4.5, 'secondary text'],
  ['--text-secondary', '--surface',      4.5, 'secondary on surface'],
  ['--text-muted',     '--bg-primary',   4.5, 'muted text'],
  ['--text-muted',     '--surface',      4.5, 'muted on surface'],
  ['--text-muted',     '--surface-sunken', 4.5, 'placeholder in input'],
  ['--text-accent',    '--bg-primary',   4.5, 'accent text'],
  ['--text-link',      '--bg-primary',   4.5, 'link'],
  ['--text-inverse',   '--bg-inverse',   7.0, 'inverse body'],
  ['--on-interactive', '--interactive',  4.5, 'button label'],
  ['--on-interactive', '--interactive-hover', 4.5, 'button label hover'],
  ['--focus',          '--bg-primary',   3.0, 'focus ring vs page', 'nontext'],
  ['--focus',          '--surface',      3.0, 'focus ring vs surface', 'nontext'],
  ['--border-interactive', '--bg-primary', 3.0, 'input border', 'nontext'],
  ['--border-interactive', '--surface',  3.0, 'input border on surface', 'nontext'],
  ['--border-strong',  '--bg-primary',   3.0, 'strong rule', 'nontext'],
  ['--interactive',    '--bg-primary',   3.0, 'button vs page', 'nontext'],
  ['--status-error',   '--bg-primary',   4.5, 'error text'],
  ['--status-error',   '--status-error-bg', 4.5, 'error on error bg'],
  ['--status-success', '--status-success-bg', 4.5, 'success on bg'],
  ['--status-warning', '--status-warning-bg', 4.5, 'warning on bg'],
  ['--status-info',    '--status-info-bg', 4.5, 'info on bg'],
];

/* ---------- Run ---------------------------------------------------------- */

const file = process.argv[2];
const themeIdx = process.argv.indexOf('--theme');
const theme = themeIdx > -1 ? process.argv[themeIdx + 1] : null;

if (!file) {
  console.error('usage: node tools/contrast.mjs <brand.css> [--theme night]');
  process.exit(2);
}

const css = readFileSync(file, 'utf8');
const tokens = parseTokens(css, theme);

console.log(`\n  ${file}${theme ? `  [data-theme="${theme}"]` : ''}`);
console.log('  ' + '─'.repeat(96));
console.log(
  '  ' +
  'PAIR'.padEnd(34) +
  'WCAG'.padStart(7) +
  'MIN'.padStart(6) +
  '  ' +
  'APCA'.padStart(7) +
  'AMIN'.padStart(6) +
  '  ' +
  'APCA VERDICT'.padEnd(14) +
  'RESULT'
);
console.log('  ' + '─'.repeat(96));

let pairFailures = 0;
let missingPairs = [];
let gamutIssues = [];

for (const [fgName, bgName, min, label, kind = 'text'] of PAIRS) {
  const fg = toRgb(tokens, fgName);
  const bg = toRgb(tokens, bgName);
  if (!fg || !bg) {
    missingPairs.push(`${label}: ${!fg ? fgName : ''}${!fg && !bg ? ' + ' : ''}${!bg ? bgName : ''}`);
    pairFailures++;
    console.log(
      '  ' + label.padEnd(34) + 'MISSING TOKEN'.padStart(26) + '  ' + 'FAIL'
    );
    continue;
  }

  if (fg.outOfGamut) gamutIssues.push(`${fgName} → ${fg.raw}`);
  if (bg.outOfGamut) gamutIssues.push(`${bgName} → ${bg.raw}`);

  const ratio = wcagContrast(fg.rgb, bg.rgb);
  const lc = apcaLc(fg.rgb, bg.rgb);
  // ARCHIC operational APCA floor: body 75, other text 60, meaningful UI 30.
  // These are minimum intended-use tiers, not a replacement for font-size-aware APCA design.
  const apcaMin = kind === 'nontext' ? 30 : (min >= 7 ? 75 : 60);
  const wcagPass = ratio >= min;
  const apcaPass = Math.abs(lc) >= apcaMin;
  const pass = wcagPass && apcaPass;
  if (!pass) pairFailures++;

  console.log(
    '  ' +
    label.padEnd(34) +
    ratio.toFixed(2).padStart(7) +
    min.toFixed(1).padStart(6) +
    '  ' +
    lc.toFixed(1).padStart(7) +
    apcaMin.toFixed(0).padStart(6) +
    '  ' +
    apcaVerdict(lc, kind).padEnd(14) +
    (pass ? 'pass' : `FAIL${!wcagPass && !apcaPass ? ' (both)' : !wcagPass ? ' (WCAG)' : ' (APCA)'}`)
  );
}

console.log('  ' + '─'.repeat(96));

const uniqueGamutIssues = [...new Set(gamutIssues)];
if (uniqueGamutIssues.length) {
  console.log('\n  ✗ OUT OF sRGB GAMUT (ship-blocking):');
  uniqueGamutIssues.forEach((g) => console.log('    ' + g));
}
if (missingPairs.length) {
  console.log('\n  ✗ MISSING REQUIRED TOKENS:');
  missingPairs.forEach((g) => console.log('    ' + g));
}

const failures = pairFailures + uniqueGamutIssues.length;
console.log(
  `\n  ${failures === 0 ? '✓ all WCAG + APCA pairs pass; gamut clean' : `✗ ${pairFailures} FAILING PAIR(S), ${uniqueGamutIssues.length} GAMUT ISSUE(S)`}\n`
);

/* Resolved values, for pasting into the brand file header */
if (process.argv.includes('--values')) {
  console.log('  Resolved sRGB:');
  const seen = new Set(PAIRS.flatMap(([a, b]) => [a, b]));
  for (const name of seen) {
    const c = toRgb(tokens, name);
    if (c) console.log(`    ${name.padEnd(26)} ${hex(c.rgb)}  ${c.raw}`);
  }
  console.log();
}

process.exit(failures === 0 ? 0 : 1);
