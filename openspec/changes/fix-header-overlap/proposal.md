# Proposal: fix-header-overlap

## Why

The header section's layout wrapper is `position: fixed`, so the generated
`#shopify-section-header` element has zero height and `content_for_layout` starts
at the very top of the document (`theme/sections/header.liquid:4-8`,
`theme/layout/theme.liquid:79-86`). Every page therefore begins underneath the
header; the Collections page makes this obvious because its first row sits under
the header bar. The header should occupy its own row in the page flow and remain
pinned to the top while scrolling, without changing its existing scroll-time
surface behavior.

## What Changes

- Make the header section take up its natural height in the document flow so the
  first content section starts below it instead of underneath it.
- Keep the header pinned to the top of the viewport as the page scrolls.
- Preserve the current surface behavior exactly:
  - Translucent white/blurred background at the top of the page and after
    scrolling up.
  - Transparent background after scrolling down.
  - Centered logo visible in the translucent state and hidden in the transparent
    state.
  - Existing navigation blend-mode treatment while the surface is transparent.
- Keep the desktop dropdowns, cart dropdown, mobile menu, and mobile search
  anchored directly below the pinned header.
- Remove the now-unnecessary fixed wrapper and its opaque white background from
  `theme/sections/header.liquid`.

## Capabilities

### New Capabilities

- `site-header`: header placement in the document flow, sticky behavior, and the
  scroll-dependent surface and logo states.

### Modified Capabilities

- None.

## Non-goals

- Redesigning the header, changing its menu contents, or altering search or cart
  behavior.
- Changing the header's existing scroll-time background, logo, or blend-mode
  behavior.
- Adding top spacing, padding, or introductory text to the Collections page or
  any other section. That remains a separate, optional follow-up.
- Adding a page-level offset or padding workaround to compensate for a fixed
  header.
- Refactoring the header's duplicated inline scroll-style updates. That is
  recorded as technical debt and deferred.
- Changing section schemas or the theme editor experience.

## Impact

- `theme/sections/header.liquid`: sticky section-scoped layout rule and removal of
  the fixed wrapper / opaque background that would defeat the transparent state.
- All storefront templates inherit the corrected placement through
  `theme/layout/theme.liquid`; no template-specific padding changes are needed.
- `theme/sections/collections-list.liquid` is intentionally untouched. Its
  existing top-spacing TODO stays valid for a later change.
- No JavaScript behavior changes are planned for the existing scroll state
  controller.
