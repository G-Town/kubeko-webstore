# Tasks

## 1. Curated collection section

- [ ] 1.1 Update `theme/sections/collections-list.liquid` to render only valid configured collection blocks in their existing order, preserve collection-image and first-product-image fallback behavior, retain a reachable no-image state, and verify an unset block emits no card or broken link.
- [ ] 1.2 Replace the current flex card layout with section-scoped one/mobile, two/tablet, and three/desktop grid styles plus a consistent 4:5 media frame; verify a configured three-card row aligns on desktop and collapses correctly on tablet and mobile.
- [ ] 1.3 Implement optional secondary-image hover behavior only for hover-capable devices, remove global utility-style overrides and inline image-visibility handling, correct image `src`/`srcset`/`sizes` usage, and verify the primary image remains visible and the link works on a touch layout.
- [ ] 1.4 Remove the invalid pagination footer and rename the `Curated Collections` preset; verify the storefront has no pagination controls and the Theme Editor's existing section and Add section picker use the same label.
- [ ] 1.5 Run `shopify theme check` for the edited section and resolve any offenses introduced by this change.

## 2. Storefront verification

- [ ] 2.1 In Shopify preview or Theme Editor, verify the configured collection order, primary-image fallback, optional desktop hover image, no-image state, and navigation to each collection on both desktop and mobile.
