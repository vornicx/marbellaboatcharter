import { readFileSync } from 'node:fs';

export function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

export function readCss(path) {
  return stripComments(readFileSync(path, 'utf8'));
}

export function declarationsFromBlock(block) {
  const out = new Map();
  const re = /(--[\w-]+)\s*:\s*([^;]*);/g;
  let m;
  while ((m = re.exec(block))) out.set(m[1], m[2].trim());
  return out;
}

export function mergeMaps(target, source) {
  for (const [k, v] of source) target.set(k, v);
  return target;
}

export function rootDeclarations(css) {
  const out = new Map();
  const re = /:root\s*\{([\s\S]*?)\n\s*\}/g;
  let m;
  while ((m = re.exec(css))) mergeMaps(out, declarationsFromBlock(m[1]));
  return out;
}

export function themeDeclarations(css) {
  const themes = new Map();
  const re = /\[data-theme=["']([^"']+)["']\]\s*\{([\s\S]*?)\n\s*\}/g;
  let m;
  while ((m = re.exec(css))) {
    const current = themes.get(m[1]) ?? new Map();
    mergeMaps(current, declarationsFromBlock(m[2]));
    themes.set(m[1], current);
  }
  return themes;
}
