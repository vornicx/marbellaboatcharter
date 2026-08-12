#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const systemRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const configArg = args.find((a) => !a.startsWith('--'));
const registryIdx = args.indexOf('--registry');
if (!configArg) {
  console.error('usage: node tools/validate-project.mjs <project.config.json> [--registry archic-projects.json]');
  process.exit(2);
}
const configPath = resolve(configArg);
const projectRoot = dirname(configPath);
const registryPath = registryIdx >= 0 ? resolve(args[registryIdx + 1]) : join(systemRoot, 'archic-projects.json');
const cfg = JSON.parse(readFileSync(configPath, 'utf8'));
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
const systemVersion = readFileSync(join(systemRoot, 'VERSION'), 'utf8').trim();
const errors = [];
const notes = [];
const axes = ['density','volume','geometry','temperature','era','kinetics','distance'];
const media = new Set(['Image','Type','Object','Data','Motion']);
const archetypes = new Set(['Editorial Spread','Index','Cinematic Sequence','Specimen','Dossier','Salon']);

const requireString = (value, label, min = 1) => { if (typeof value !== 'string' || value.trim().length < min) errors.push(`${label} must be at least ${min} characters`); };

if (cfg.schemaVersion !== '1.0') errors.push('schemaVersion must be 1.0');
if (!cfg.project) errors.push('project block missing');
if (!cfg.direction) errors.push('direction block missing');
if (!cfg.assets) errors.push('assets block missing');
if (!cfg.foundation) errors.push('foundation block missing');

if (cfg.project && cfg.direction && cfg.assets && cfg.foundation) {
  requireString(cfg.project.name, 'project.name');
  for (const [label, value] of [['project.name', cfg.project.name], ['project.sector', cfg.project.sector], ['direction.justification', cfg.direction.justification]]) {
    if (typeof value === 'string' && /REPLACE(?: ME)?/i.test(value)) errors.push(`${label} still contains template placeholder text`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cfg.project.slug ?? '')) errors.push('project.slug must be lowercase kebab-case');
  if (!['prototype','production'].includes(cfg.project.mode)) errors.push('project.mode must be prototype or production');
  if (!['marketing','software'].includes(cfg.project.kind)) errors.push('project.kind must be marketing or software');
  requireString(cfg.project.sector, 'project.sector', 2);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cfg.project.decisionDate ?? '') || Number.isNaN(Date.parse(`${cfg.project.decisionDate}T00:00:00Z`))) errors.push('project.decisionDate must be a valid YYYY-MM-DD date');

  for (const axis of axes) if (!Number.isInteger(cfg.direction[axis]) || cfg.direction[axis] < 1 || cfg.direction[axis] > 5) errors.push(`direction.${axis} must be an integer 1..5`);
  if (!media.has(cfg.direction.leadMedium)) errors.push('direction.leadMedium invalid');
  if (!archetypes.has(cfg.direction.primaryArchetype)) errors.push('direction.primaryArchetype invalid');
  if (cfg.direction.secondaryArchetype && !archetypes.has(cfg.direction.secondaryArchetype)) errors.push('direction.secondaryArchetype invalid');
  requireString(cfg.direction.justification, 'direction.justification', 40);

  if (cfg.foundation.version !== systemVersion) errors.push(`foundation.version must match system VERSION ${systemVersion}`);

  requireString(cfg.assets.provenanceFile, 'assets.provenanceFile');
  if (cfg.assets.provenanceFile && !existsSync(resolve(projectRoot, cfg.assets.provenanceFile))) errors.push(`asset provenance file not found: ${cfg.assets.provenanceFile}`);
  if (cfg.project.mode === 'prototype' && cfg.assets.policy !== 'representative-with-provenance') errors.push('prototype mode requires assets.policy = representative-with-provenance');
  if (cfg.project.mode === 'production') {
    if (cfg.assets.policy !== 'real-or-authorized') errors.push('production mode requires assets.policy = real-or-authorized');
    if (cfg.assets.verified !== true) errors.push('production mode requires assets.verified = true');
  }

  const decisionDate = new Date(`${cfg.project.decisionDate}T00:00:00Z`);
  const cutoff = new Date(decisionDate);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - 18);
  const live = [...(registry.live ?? [])]
    .filter((p) => /^\d{4}-\d{2}-\d{2}$/.test(p.shipped ?? ''))
    .sort((a,b) => a.shipped.localeCompare(b.shipped));
  const recent = live.filter((p) => new Date(`${p.shipped}T00:00:00Z`) >= cutoff && new Date(`${p.shipped}T00:00:00Z`) <= decisionDate);
  const axisDeltaCount = (a,b) => axes.filter((axis) => Math.abs(a[axis] - b[axis]) >= 2).length;

  if (cfg.project.kind === 'software') {
    notes.push('software: numeric and lead-medium divergence rules 1–2 exempt; archetype repeat gate still applies');
  } else {
    for (const previous of recent) {
      const count = axisDeltaCount(cfg.direction, previous);
      if (count < 4) errors.push(`divergence rule 1: only ${count}/7 axes differ by ≥2 vs ${previous.project}; need ≥4`);
    }
  }

  const previous = live.filter((p) => p.shipped <= cfg.project.decisionDate).at(-1);
  if (previous) {
    const delta = axisDeltaCount(cfg.direction, previous);
    if (cfg.project.kind !== 'software' && cfg.direction.leadMedium === previous.leadMedium) {
      const unrelatedEscape = cfg.direction.sectorsUnrelatedToPrevious === true && delta >= 6;
      if (!unrelatedEscape) errors.push(`divergence rule 2: lead medium repeats ${previous.leadMedium}; escape requires sectorsUnrelatedToPrevious=true and ≥6 axes differing by ≥2`);
    }
    if (cfg.direction.primaryArchetype === previous.primaryArchetype) {
      const reason = (cfg.direction.archetypeRepeatJustification ?? '').trim();
      if (reason.length < 40 || delta < 5 || cfg.direction.leadMedium === previous.leadMedium) {
        errors.push(`archetype repeat gate: repeating ${previous.primaryArchetype} requires ≥40-char justification, a different lead medium, and ≥5 axes differing by ≥2 (currently ${delta})`);
      } else {
        notes.push(`archetype repeat accepted against ${previous.project}: justified, medium differs, ${delta}/7 axes differ by ≥2`);
      }
    }
  } else {
    notes.push('no previous live project: divergence comparison not applicable yet');
  }
}

if (errors.length) {
  console.error(`✗ ${configPath}`);
  errors.forEach((e) => console.error(`  ${e}`));
  notes.forEach((n) => console.error(`  note: ${n}`));
  process.exit(1);
}
console.log(`✓ project config — ${cfg.project.name}`);
notes.forEach((n) => console.log(`  ${n}`));
