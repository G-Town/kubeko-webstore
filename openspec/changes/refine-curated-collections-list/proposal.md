# Proposal: refine-curated-collections-list

## Why

The `/collections` page is a deliberately small, merchant-curated index of named
collections, but its section behaves like a paginated collection catalog. Its
pagination footer references `paginate` without a paginate scope, and its card
layout relies on global style overrides and an invalid responsive-image size.
Refining this focused section makes the merchant-configured page predictable,
keeps the editorial card treatment, and avoids a broader theme-style rewrite.

## What Changes

- Keep `list-collections` as a static page whose cards render in the configured
  `section.blocks` order; remove the inactive pagination UI.
- Render valid configured collection cards in a responsive grid: one column on
  mobile, two on tablet, and three on desktop.
- Preserve collection-image and optional hover-image presentation, with a stable
  portrait frame and hover behavior limited to devices that support hover.
- Replace unscoped global hover and positioning CSS with section-scoped card
  styles, and correct responsive image selection.
- Skip blocks whose configured collection no longer resolves, rather than
  emitting broken links or empty cards.
- Align the section preset label with the existing merchant-facing section name:
  `Curated Collections`.

**BREAKING**: none. Existing configured collection blocks and their order are
preserved; the only removed storefront element is nonfunctional pagination.

## Capabilities

### New Capabilities

- `curated-collections-list`: merchant-configured collections render as a stable,
  responsive editorial card grid on the Shopify collection-list page.

### Modified Capabilities

- None. No durable capabilities have yet been synchronized into `openspec/specs/`.

## Non-goals

- Replacing the Shopify `list-collections` template type or changing the
  customer-facing `Collections` navigation label.
- Converting this section into an all-collections catalog, adding pagination,
  filtering, sorting, or automatic collection discovery.
- Theme-wide CSS architecture work, a broad collection-card redesign, or changes
  to unrelated collection templates.

## Impact

- **Theme code:** `theme/sections/collections-list.liquid`.
- **Merchant experience:** the existing sidebar label and Add section preset both
  read `Curated Collections`; selected collection blocks remain the source of
  content and ordering.
- **Storefront behavior:** responsive collection cards link to their collections,
  use a collection image or first-product fallback, optionally reveal the curated
  hover image, and do not display pagination.
