# Tasks

## 1. Curated collection section

- [ ] 1.1 Update `theme/sections/collections-list.liquid` to render only valid configured collection blocks in their existing order, preserve collection-image and first-product-image fallback behavior, render a solid `#444444` frame with no placeholder copy when neither image exists, and verify an unset block emits no card or broken link.
- [ ] 1.2 Replace the current flex card layout with section-scoped grid styles for one column below 768px, two columns from 768px to 1023px, and three columns at 1024px and above, plus a consistent 4:5 media frame; verify a configured three-card row aligns on desktop and collapses correctly on tablet and mobile.
- [ ] 1.3 Source the secondary image from `collection.metafields.custom.second_image`, render the hover image and transition only when it exists (without falling back to the primary image), mark it decorative with empty alt text, apply hover behavior only for hover-capable devices, remove global utility-style overrides and inline image-visibility handling, correct image `src`/`srcset`/`sizes` usage, and verify the primary image remains visible and the link works on a touch layout.
- [ ] 1.4 Remove the invalid pagination footer and rename the `Curated Collections` preset; verify the storefront has no pagination controls and the Theme Editor's existing section and Add section picker use the same label.
- [ ] 1.5 From the repo root, run `shopify theme check --path theme` and confirm `sections/collections-list.liquid` reports no remaining offenses (the existing `img_url` deprecations and undefined `paginate` warnings should be gone).

## 2. Storefront verification

- [ ] 2.1 In Shopify preview or Theme Editor, using at least three configured blocks, verify collection order, primary-image fallback, optional desktop hover image, the solid no-image state and title-bar readability, and navigation to each collection on both desktop and mobile.
