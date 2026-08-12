# Marbella Boat Charter × Archic

Production-oriented project foundation based on **Archic Design System v1.0.0**, with a client-specific visual grammar rather than a shared Archic page template.

## v0.2 direction

The project now treats Marbella Boat Charter as a **Costa del Sol charter operator based in Puerto Banús**, not as a Puerto Banús-only yacht rental site.

The visible design system is **Coastal Navigation Office**:

- coast chart for service area and route logic;
- course board for itinerary discovery;
- full fleet register grouped by motor / sailing / fishing / group operations;
- physical vessel-scale visualisation;
- technical yacht plate for vessel data, seasonal rates and inclusions;
- inline Charter Desk that prepares a structured WhatsApp enquiry;
- service ledger for catering and yacht management / maintenance.

No public page loads the old generic archetype/component CSS layer. Foundation, semantic roles, accessibility and QA tooling remain reusable; client-facing compositions do not.

## Current inventory represented

- 23 motor yachts
- 2 sailing boats
- 3 fishing boats
- 2 group vessels

The data is based on the operator's current public listings and remains subject to client verification before production.

## Production gate

`project.config.json` stays in `prototype` mode because original/high-resolution photography and brand assets have not yet been authorised and verified. This build deliberately avoids presenting unrelated stock yacht photography as if it were the client's real fleet.

Before launch:

1. verify current fleet, rates, VAT, fuel and vessel-specific inclusions with the client;
2. acquire authorised high-resolution fleet / crew / port photography;
3. implement native-reviewed Spanish parity;
4. migrate/review privacy, cookie and booking/legal terms;
5. connect a booking/CRM backend if the client wants more than the current direct WhatsApp handoff;
6. run final real-device and network QA.

## Run locally

```bash
python -m http.server 4173
```

## Archic gates

```bash
node tools/static-audit.mjs .
node tools/contrast.mjs styles/brand.css
node /path/to/archic-design-system/tools/validate-contract.mjs styles/brand.css
```
