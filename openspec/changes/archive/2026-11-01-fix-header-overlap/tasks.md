# Tasks

## 1. Header layout

- [x] 1.1 In `theme/sections/header.liquid`, add a section-scoped style for `#shopify-section-{{ section.id }}` with `position: sticky`, `top: 0`, and `z-index: 110`; verify the compiled section emits the rule with the live section id.
- [x] 1.2 Remove the inner `fixed` wrapper around the header and remove `bg-white` from the outer wrapper, leaving `#header-overlay` as the only background surface; verify the sticky section wrapper and outer wrapper now compute to the header's height instead of zero.
- [x] 1.3 Remove the commented-out fixed-header markup left above the live wrapper; verify the remaining markup is balanced and `shopify theme check --path theme` reports no new offense for `header.liquid`.

## 2. Scroll behavior and panels

- [x] 2.1 Verify at desktop width that the page loads with content below the header, the surface is translucent with the centered logo visible, scrolling down makes the surface transparent and hides the logo, and scrolling up restores both; confirm the header stays pinned throughout.
- [x] 2.2 Repeat the scroll-state verification at mobile width, including the mobile menu and mobile search; confirm each panel opens directly below the pinned header.
- [x] 2.3 Verify desktop navigation dropdowns and the cart dropdown open directly below the pinned header and do not cover its controls.

## 3. Page integration

- [x] 3.1 Verify the Collections page and home page start their first section below the header at desktop and mobile widths, with no template-specific padding or spacer added.
- [x] 3.2 Confirm `theme/sections/collections-list.liquid` and its top-spacing TODO are unchanged, and that no other section gained header-offset padding.
- [x] 3.3 Add a short merchant-facing entry to `CHANGELOG.md` describing the header no longer covering page content while keeping its scroll behavior; verify the entry avoids technical language.
- [x] 3.4 Run `shopify theme check --path theme` and verify no new offenses were introduced; run `openspec validate fix-header-overlap --strict` and verify the change passes.
