# Machine validation — 2026-08-12

## Project
```
✓ project config — Marbella Boat Charter × Archic
  no previous live project: divergence comparison not applicable yet
```

## Contrast
```

  /mnt/data/marbella-boat-charter-archic/styles/brand.css
  ────────────────────────────────────────────────────────────────────────────────────────────────
  PAIR                                 WCAG   MIN     APCA  AMIN  APCA VERDICT  RESULT
  ────────────────────────────────────────────────────────────────────────────────────────────────
  body text                           17.54   7.0     99.6    75  body ✓✓       pass
  body on alt band                    15.51   7.0     91.5    75  body ✓✓       pass
  body on surface                     18.57   7.0    103.5    75  body ✓✓       pass
  body on sunken                      15.10   7.0     89.9    75  body ✓        pass
  secondary text                      11.65   4.5     92.8    60  body ✓✓       pass
  secondary on surface                12.33   4.5     96.7    60  body ✓✓       pass
  muted text                           7.76   4.5     83.3    60  body ✓        pass
  muted on surface                     8.21   4.5     87.2    60  body ✓        pass
  placeholder in input                 6.68   4.5     73.5    60  large ✓       pass
  accent text                          9.82   4.5     88.7    60  body ✓        pass
  link                                12.83   4.5     94.6    60  body ✓✓       pass
  inverse body                        17.54   7.0   -101.0    75  body ✓✓       pass
  button label                        17.24   4.5   -104.5    60  body ✓✓       pass
  button label hover                  13.58   4.5   -101.4    60  body ✓✓       pass
  focus ring vs page                   9.46   3.0     87.8    30  ui ✓✓         pass
  focus ring vs surface               10.01   3.0     91.8    30  ui ✓✓         pass
  input border                         4.82   3.0     70.2    30  ui ✓✓         pass
  input border on surface              5.11   3.0     74.1    30  ui ✓✓         pass
  strong rule                          4.26   3.0     66.4    30  ui ✓✓         pass
  button vs page                      16.29   3.0     98.6    30  ui ✓✓         pass
  error text                           9.38   4.5     86.9    60  body ✓        pass
  error on error bg                    8.48   4.5     80.3    60  body ✓        pass
  success on bg                        9.29   4.5     83.9    60  body ✓        pass
  warning on bg                        8.03   4.5     81.4    60  body ✓        pass
  info on bg                           8.68   4.5     82.2    60  body ✓        pass
  ────────────────────────────────────────────────────────────────────────────────────────────────

  ✓ all WCAG + APCA pairs pass; gamut clean

```

## Static audit
```
✓ static audit — no obvious template/default/token-boundary violations
```

## Semantic contract
```
✓ brand.css — 79/79 semantic roles declared
```

## Foundation integrity
```
✓ client foundation.css and semantic-contract.css match the frozen system release
```
