# Onepager product cleanup

# Effective teaching duration

- [x] Correct informative private/group minute labels only; preserve clocks, prices and booking rules.
- [x] 87 tests pass; actual 10-card catalog verified at 1280/390 px, including private details, Escape and refresh; automatic build OK; no publication or backend deployment.

- [x] Remove product overrides and local tariff limits; preserve card design and editorial content.
- [x] Accept informational availability policy; prevent name-derived booking authorization.
- [x] Verify 41 targeted regressions, clean lint/typecheck/build and desktop/mobile rendering; no publication or Edge deployment. Legacy group bookings await a Core product-level schedule contract.

# Public offering display

- [x] Accept optional Core public offering and display validated schedule/time metadata only; preserve pricing and booking guards.
- [x] 19 targeted tests and scoped lint pass; automatic build OK. Actual catalog plus synthetic two-block/HTML-text cases verified at 1280/390 px: unchanged layout, no page overflow/runtime errors, eight disabled booking buttons. No publication or deployment; separate TypeScript-check result is not exposed by the automatic harness.