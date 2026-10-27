# Design: refine-curated-collections-list

## Context

See `proposal.md` for motivation. `collections-list.liquid` currently loops
through merchant-selected blocks, but uses an unscoped `paginate` footer, a
flex layout with an unreliable height constraint, fixed image dimensions, and
global `.absolute` and hover CSS. Its top-level schema name is already
`Curated Collections`; the preset still uses the previous label.

## Goals / Non-Goals

**Goals:**
- Preserve configured blocks, their order, and the current collection-image /
  first-product-image fallback.
- Make the grid and hover behavior predictable across mobile, tablet, and desktop.
- Keep styling isolated to this section and correct the responsive image contract.

**Non-Goals:**
- Change Shopify's `list-collections` template type or customer navigation.
- Rework shared CSS, collection cards used elsewhere, or the store's metafield model.

## Decisions

### 1. Retain a block-driven curated list

The section will continue iterating `section.blocks`, guard against an unresolved
collection, and remove the pagination markup. The template's ordered block list
is the merchant-controlled source of truth.

*Alternative:* iterate Shopify's `collections` object and paginate it. Rejected:
that creates an automatic catalog rather than the intended named-collection index.

### 2. Use a section-scoped CSS grid with a portrait media frame

The section will use local, section-instance-scoped grid and card styles for one
column below 768px, two columns from 768px to 1023px, and three columns at 1024px
and above. A consistent 4:5 portrait media frame preserves the existing editorial
crop and aligns cards in each row. When no primary image resolves, the media frame
renders as a solid `#444444` field with no placeholder copy; the collection title
bar remains the card's content and accessible name.

*Alternative:* retain the flex layout and `h-4/5`/`max-h` constraints. Rejected:
they do not establish a reliable card height or responsive grid behavior.

### 3. Keep hover media optional and pointer-capability-aware

Primary media remains visible by default. Secondary media comes from
`collection.metafields.custom.second_image`; when that metafield is blank, render
no second image and no hover transition, and do not fall back to the primary
image. Apply the transition only inside a hover-capable media query. The hover
image is decorative, uses empty alt text, and will not create duplicate
accessible image text.

*Alternative:* retain global utility overrides and inline visibility/onload
behavior. Rejected: it leaks styles beyond the section and creates fragile image
visibility behavior.

### 4. Use Shopify responsive image URLs consistently

Both primary and secondary media will use current `image_url` output with an
accurate `sizes` value for the one/two/three-column layout:
`(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw`. The existing `00vw`
value is invalid and can lead the browser to choose unsuitable sources.

*Alternative:* preserve the mixed `img_url` fallback and fixed 800x1000
attributes. Rejected: it conflicts with the responsive source set and is not a
reliable description of every collection image.

### 5. Complete the merchant-facing rename

Keep the stable file handle and template section type (`collections-list`) but
set both schema name and preset name to `Curated Collections`. This distinguishes
the curated section from Shopify's built-in Collection list template without
changing persisted template data.

*Alternative:* rename the section file or `list-collections` template. Rejected:
neither changes Shopify's system page label and both add unnecessary migration risk.

## Risks / Trade-offs

- Hover images must load before they can be revealed -> keep them as normal image
  resources while limiting the visual transition to hover-capable devices.
- A collection can lack both a collection image and a product fallback -> render a
  solid `#444444` frame with no copy; the title bar keeps the collection reachable
  and identifiable.
- Local CSS must coexist with the existing compiled utility CSS -> scope selectors
  to the rendered section instance and avoid global utility-class redefinitions.

## Migration Plan

No merchant-data migration is required. Existing block IDs, selected collection
handles, and `block_order` remain unchanged. Rollback is a single-section
reversion if visual verification exposes a regression.
