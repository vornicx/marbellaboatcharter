#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCss, rootDeclarations } from './lib/css.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..');
const componentDir = join(repo, '03-components');
const contract = new Set(rootDeclarations(readCss(join(repo, '01-tokens/semantic-contract.css'))).keys());
const failures = [];

for (const file of readdirSync(componentDir).filter((f) => f.endsWith('.md'))) {
  const path = join(componentDir, file);
  const text = readFileSync(path, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/var\((--[A-Za-z0-9][A-Za-z0-9_-]*)/g)) {
      const token = m[1];
      // Documentation contains incomplete grep examples such as var(--brand-.
      if (token.endsWith('-')) continue;
      if (!contract.has(token)) failures.push(`${file}:${i + 1} references non-semantic ${token}`);
    }
  });
}

if (failures.length) {
  console.error('✗ component token boundary failed');
  failures.forEach((f) => console.error(`  ${f}`));
  process.exit(1);
}
console.log(`✓ component token boundary — all reusable component var() reads are semantic (${contract.size} roles available)`);
