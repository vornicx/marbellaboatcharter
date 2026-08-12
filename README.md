# Marbella Boat Charter × Archic

Production-oriented concept build based on **Archic Design System v1.0.0**.

## What is implemented

- Frozen Foundation + semantic contract copied verbatim.
- Client-specific Brand Layer and Index-led archetype.
- Responsive home, fleet index, experience architecture, yacht detail and contact/availability page.
- Filterable fleet with persistent media preview.
- Accessible navigation and focus states.
- Custom 4-step charter planner on the home page with custom calendar (no native date control).
- Reduced-motion behaviour inherited from Foundation.
- Structured data and semantic page hierarchy.
- Asset provenance and brand brief.

## Important mode note

The code is intentionally built beyond a throwaway mock-up, but `project.config.json` remains in `prototype` mode because authorized production photography has not been supplied. That is an asset-rights gate, not a code-quality label. Switch to `production` only after real/authorized fleet assets are verified.

## Run locally

From this folder:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Archic gates

Run against the Archic Design System v1.0 tooling/registry:

```bash
node tools/static-audit.mjs .
node tools/contrast.mjs styles/brand.css
```

`validate-project.mjs` additionally needs the Design System registry (`archic-projects.json`) available in the system root or passed with `--registry`.

## Next production steps

1. Acquire/export original brand marks and authorized high-resolution fleet photography.
2. Complete fleet data for every current vessel and reconcile VAT/inclusion inconsistencies with the client.
3. Decide booking destination (existing engine, CRM/API, email, WhatsApp, or Archic Control).
4. Add native-reviewed Spanish copy and route-level SEO content without duplicating the old SEO-page sprawl.
5. Wire forms end-to-end and add privacy/cookie/legal content after client/legal review.
6. Run complete Archic QA on real devices and networks.
