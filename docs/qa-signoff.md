# Archic Quality Gate — Marbella Boat Charter × Archic
Date: 2026-08-12 · Reviewer: machine + source pass · Build: 0.2

## Passed in this milestone

- Foundation + semantic layer retained; client Brand Layer rewritten: PASS.
- Semantic contract mapping: **79/79 roles**: PASS.
- WCAG + APCA contrast matrix: PASS; sRGB gamut clean.
- Static anti-template audit: PASS.
- No inline-style/template findings in public HTML.
- No public Unsplash/representative yacht photography.
- No public use of the old Archic page grammar (`editorial-split`, CTA band, drawer planner, generic hero/media pattern).
- Fleet dataset expanded to 30 published/known vessels across motor, sailing, fishing and group operations.
- Charter enquiry hands off a structured brief to the published WhatsApp number; it does not claim live booking.
- Internal page links checked: no missing local targets.

## Findings blocking production

| # | Severity | Area | Issue | Resolution |
|---|---|---|---|---|
| 1 | Blocker | Assets | Original/high-resolution client fleet photography and master brand assets are not authorised/verified. | Acquire, document and art-direct real client assets. |
| 2 | Blocker | Commercial data | Rates, fleet status, VAT, fuel, moorings and inclusions are based on public source pages and may change. | Reconcile against client-owned source of truth. |
| 3 | Major | Internationalisation | English build only. | Native Spanish copy and complete route parity. |
| 4 | Major | Legal | Privacy/cookies/booking terms are not migrated/reviewed. | Client/legal pass before launch. |
| 5 | Major | Device QA | Headless Chromium in this container could not complete screenshot capture reliably. | Run deployed visual QA at mobile/tablet/desktop breakpoints and real devices. |
| 6 | Optional | Booking | Current handoff is WhatsApp, not a live inventory/CRM system. | Connect Archic Control or existing booking workflow if required by client. |

## Verdict

**Suitable as the v0.2 sales/development foundation; not yet production-approved.**
