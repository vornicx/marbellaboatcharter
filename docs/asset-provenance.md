# Asset Provenance — Marbella Boat Charter × Archic

Project mode: `prototype`

| Asset | Source / owner | Licence / permission | Represents actual client reality? | Production status | Replacement required? |
|---|---|---|---|---|---|
| Current white logo | marbellaboatcharter.com / Marbella Boat Charter | Existing public brand asset; client authorization still required for transfer | yes | concept-only | yes, verify master asset |
| Harbour aerial | Wyatt Simpson / Unsplash | Unsplash free licence | no (Monaco, not Puerto Banús) | concept-only | yes |
| Motor yacht at sunset | Dawid Tkocz / Unsplash | Unsplash free licence | no | concept-only | yes |
| Sailing yacht at sunset | amein shareef77 / Unsplash | Unsplash free licence | no | concept-only | yes |
| Sailing yacht on blue water | Margo Evardson / Unsplash | Unsplash free licence | no | concept-only | yes |

## Production asset gate

The implementation is designed as production-oriented code, but the Archic machine contract remains in `prototype` mode because current photographic rights and actual fleet imagery have not been supplied/verified by the client. Before launch: replace representative imagery with authorized real fleet/crew/location assets, set `mode: production`, change policy to `real-or-authorized`, mark `verified: true`, and rerun every gate.
