#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const clientArg = process.argv[2];
if (!clientArg) {
  console.error('usage: node tools/verify-client-foundation.mjs <client-project-root>');
  process.exit(2);
}
const system = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const client = resolve(clientArg);
const pairs = [
  [join(system,'01-tokens/foundation.css'), join(client,'styles/foundation.css')],
  [join(system,'01-tokens/semantic-contract.css'), join(client,'styles/semantic-contract.css')]
];
const errors=[];
const hash=(p)=>createHash('sha256').update(readFileSync(p)).digest('hex');
for (const [source,target] of pairs) {
  if (!existsSync(target)) { errors.push(`missing ${target}`); continue; }
  if (hash(source)!==hash(target)) errors.push(`${basename(target)} differs from Archic Design System ${readFileSync(join(system,'VERSION'),'utf8').trim()}`);
}
if (errors.length) {
  console.error('✗ client system-copy verification failed');
  errors.forEach((e)=>console.error(`  ${e}`));
  process.exit(1);
}
console.log('✓ client foundation.css and semantic-contract.css match the frozen system release');
