# Brand Brief — Marbella Boat Charter × Archic

Date: 2026-08-12 · Version: 0.2

## Business truth

Marbella Boat Charter is based in Puerto Banús but the business is not confined to Puerto Banús. Its published offer covers the Costa del Sol with service/departure logic around Marbella, Puerto Banús, Estepona, Sotogrande and Benalmádena, plus longer programmes toward Gibraltar and selected Morocco routes.

The product is also broader than “luxury yacht rental”. The published inventory spans motor yachts, sailing, dedicated fishing boats and group vessels. The company additionally promotes corporate/group programmes, catering and yacht management / maintenance.

## Product problem

The old website contains real breadth but distributes it across a large number of SEO-led pages. The first Archic build corrected some information hierarchy but made a different mistake: it narrowed the brand too strongly to Puerto Banús and reused a recognisable Archic grammar — full-bleed hero, editorial split, repeated rows, dark interruption panel, CTA band and drawer planner.

That is explicitly rejected in v0.2. The Design System is a foundation and validation contract, not a visual template library.

## Perception target

“They know this coast, they understand the operational differences between boats, and they can organise more than a simple four-hour yacht rental.”

The brand should feel:

- coastal, not resort-themed;
- precise, not corporate;
- experienced, not old-fashioned;
- operational, not marketplace-like;
- premium through judgement and detail, not through black/gold luxury costume.

## Audiences

1. Couples, families and small groups comparing a private day on the water.
2. Affluent visitors who know they want a larger motor yacht and need confidence on route/inclusions.
3. Fishing customers who care about the programme and equipment, not decorative luxury language.
4. Corporate/event organisers who may need large single-vessel capacity or coordinated multi-boat activity.
5. Yacht owners enquiring about management, maintenance or charter commercialisation.

## Conversion

Primary: qualified availability enquiry via WhatsApp / direct contact.

A qualified enquiry should carry date, guest count, area/departure, duration and intended plan or vessel. The interface does not pretend to provide live booking when no inventory API is connected.

## Direction vector

| Axis | Value | Rationale |
|---|---:|---|
| Density | 5 | real inventory and operational detail are a strength |
| Volume | 3 | strong hierarchy without theatrical luxury scale |
| Geometry | 5 | charts, registers and technical records are native to the subject |
| Temperature | 2 | cool water/ink/chart-paper world |
| Era | 3 | contemporary but not trendy SaaS |
| Kinetics | 1 | the information should feel stable and navigable |
| Distance | 4 | high-value, practical, professional relationship |

Lead medium: **Data / type**.

## Composition system

Primary archetype: **Dossier**. Secondary: **Editorial Spread** only when geography or narrative requires it.

The client-facing grammar is named **Coastal Navigation Office**:

1. **Coast chart** — geography is a primary interface, showing base, service ports and destinations.
2. **Course board** — routes read like operating options, not experience cards.
3. **Fleet register** — all published boats are grouped by operation and read as a working register.
4. **Fleet scale** — physical boat length becomes a visual variable.
5. **Technical yacht plate** — specifications, seasonal rates and vessel-specific inclusions are treated as one technical record.
6. **Charter desk** — an inline dispatch form prepares a real enquiry; no generic drawer or fake instant booking.
7. **Service ledger** — catering and yacht management sit alongside charter as real business lines.

### Explicit anti-repeat rule

Do not reuse recognisable page-level components from Mfinity, La Bocana, Noguera or other Archic projects simply because they already exist. Foundation tokens, accessibility rules and QA tooling are reusable. Client-facing compositions are not reusable by default.

Specifically banned for this project unless a future requirement independently justifies them:

- full-bleed photographic hero with text overlay;
- generic split-image/text section;
- repeated luxury cards;
- CTA band copied between pages;
- drawer-based multi-step planner;
- black/gold/serif “luxury” costume;
- fixed generic “featured item” slot in navigation;
- decorative pill filters.

## Typography & colour

Display/body: Manrope. Functional/data: IBM Plex Mono.

Chart-paper off-white, marine ink, sea teal and a restrained signal orange. No gold, no decorative serif, no glass effects, no soft floating cards.

## Asset policy

The project must not present unrelated stock-yacht photography as if it were a specific Marbella Boat Charter vessel. Until original/high-resolution client imagery is authorised, technical drawings, chart graphics and data-led composition are preferable to deceptive photography. Production remains gated on verified visual assets.

## Content rules

- Puerto Banús = base / office, not the whole service area.
- Marbella / Estepona / Sotogrande / Benalmádena = service/departure context where supported by the operator.
- Gibraltar and Morocco = routes/destinations, not business locations.
- Inclusions must be vessel-specific where published information differs.
- Prices are orientation until live availability, VAT, fuel, mooring and seasonal conditions are confirmed.
- Wildlife such as dolphins is never guaranteed.
