# Marbella Boat Charter × Archic

Production-oriented project foundation based on **Archic Design System v1.0.0**, now reworked into a **v0.3 luxury editorial direction**.

## v0.3 direction

The project treats Marbella Boat Charter as a **premium Costa del Sol charter operator based in Puerto Banús**, not as a Puerto Banús-only rental listing and not as another repeated Archic marketing template.

The visible direction is now:

- **luxury editorial** rather than system-first;
- **private charter concierge** rather than catalogue-first;
- **calm, spacious and aspirational** rather than overtly technical;
- **broader business scope**, including motor yachts, sailing, fishing, group events, catering and yacht management;
- **Costa del Sol positioning**, not a narrow Puerto Banús-only framing.

## Key page moves

- **Home** now leads with a premium hero, stronger positioning and a curated vessel selection.
- **Fleet** is presented as a calm, elegant register rather than a repetitive card wall.
- **Experiences** reframes routes and offers as curated charter formats.
- **Yacht spotlight** presents the Sunseeker 68 as a premium flagship example.
- **Contact** works as a charter desk and hands the enquiry into WhatsApp with a structured brief.

## Current inventory represented

- 23 motor yachts
- 2 sailing boats
- 3 fishing boats
- 2 group vessels

The data is based on the operator's public listings and remains subject to client verification before production.

## Production gate

`project.config.json` remains in `prototype` mode because original/high-resolution photography and fully verified brand/legal assets have not yet been authorised and signed off.

Before launch:

1. verify current fleet, rates, VAT, fuel and vessel-specific inclusions with the client;
2. acquire authorised high-resolution fleet / crew / destination photography or video;
3. implement final Spanish parity and multilingual review;
4. migrate / review privacy, cookie and booking/legal terms;
5. connect a booking / CRM backend if the client wants more than the current direct WhatsApp handoff;
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
