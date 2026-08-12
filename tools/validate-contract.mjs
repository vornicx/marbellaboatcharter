#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCss, rootDeclarations } from './lib/css.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..');
const contractPath = join(repo, '01-tokens/semantic-contract.css');
const brandsDir = join(repo, '01-tokens/brands');
const contract = rootDeclarations(readCss(contractPath));
const required = [...contract.keys()];

function validate(file, template = false) {
  const css = readCss(file);
  const tokens = rootDeclarations(css);
  const raw = readFileSync(file, 'utf8');
  const missing = required.filter((name) => !tokens.has(name));
  const unfilled = template ? [] : required.filter((name) => {
    const value = tokens.get(name) ?? '';
    return !value || /magenta|REPLACE-ME/i.test(value);
  });

  // Detect declarations that exist textually but were left blank. Useful for template review.
  const blank = template
    ? required.filter((name) => new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*;`).test(raw))
    : [];

  if (missing.length || unfilled.length) {
    console.error(`✗ ${basename(file)}`);
    if (missing.length) console.error(`  missing semantic tokens: ${missing.join(', ')}`);
    if (unfilled.length) console.error(`  unfilled semantic tokens: ${unfilled.join(', ')}`);
    return false;
  }
  console.log(`✓ ${basename(file)} — ${required.length}/${required.length} semantic roles declared${template ? ` (${blank.length} intentionally blank template values)` : ''}`);
  return true;
}

const args = process.argv.slice(2);
let files;
if (args.includes('--all')) {
  files = readdirSync(brandsDir).filter((f) => f.endsWith('.css')).map((f) => join(brandsDir, f));
} else {
  const file = args.find((a) => !a.startsWith('--'));
  if (!file) {
    console.error('usage: node tools/validate-contract.mjs <brand.css> | --all');
    process.exit(2);
  }
  files = [resolve(file)];
}

let ok = true;
for (const file of files) ok = validate(file, basename(file) === '_template.css') && ok;
process.exit(ok ? 0 : 1);
