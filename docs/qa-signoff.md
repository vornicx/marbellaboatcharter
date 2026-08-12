# Archic Quality Gate — Marbella Boat Charter × Archic
Date: 2026-08-12 · Reviewer: initial machine pass · Build: 0.1

## Passed in this milestone

- Foundation/semantic contract exact-copy verification: PASS.
- Project contract + Direction Vector validation: PASS.
- Semantic contract mapping: 79/79 roles: PASS.
- WCAG + APCA contrast matrix: PASS; sRGB gamut clean.
- Static anti-template audit: PASS.
- No native date input; planner uses project-designed calendar.
- No Lorem ipsum, no TODO markers, no card-grid fleet architecture.
- Keyboard-visible focus and minimum touch sizing implemented at component level.
- 404, sitemap, robots and Vercel security headers included.

## Findings blocking production

| # | Severity | Location | Issue | Resolution |
|---|---|---|---|---|
| 1 | Blocker | Imagery | Representative Unsplash images do not document the actual client fleet/location. | Replace with authorized real fleet, crew and Puerto Banús assets; verify crops at all breakpoints. |
| 2 | Blocker | Booking | Planner success state is local only; it does not transmit data. | Confirm booking/CRM target, implement API endpoint, validation, anti-spam and delivery confirmation. |
| 3 | Blocker | Content | Public source pages contain inconsistent statements around VAT and what is included across vessels. | Reconcile every current price/inclusion with client-owned source of truth. |
| 4 | Major | Internationalisation | English architecture is complete; Spanish production copy is not yet implemented. | Native Spanish copy pass and full route parity. |
| 5 | Major | Device QA | Container browser could not complete a visual network-loaded screenshot pass. | Run 320/375/768/1024/1440/2560 plus iPhone and mid-range Android on deployed preview. |
| 6 | Major | Performance | Representative images are remote and not yet art-directed into local responsive sizes. | Export authorized AVIF/WebP/JPEG sources, width descriptors and mobile crops. |
| 7 | Major | Legal | Existing client privacy/cookies/terms are not migrated into this build. | Client/legal review and route migration before launch. |

## Verdict

**FIX AND RE-RUN before production.**

This does not block using the build as the production-oriented foundation for continued development; it blocks claiming the current package is launch-ready.
