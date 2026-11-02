# Design: fix-header-overlap

## Context

See `proposal.md` — Why. The header section emits three nested layout elements
before the actual `<header>`:

- an in-flow outer `<div>` with `bg-white`
- an inner `<div class="fixed w-full">`
- the `<header id="site-header">` with the absolute overlay

Because the inner wrapper is fixed, the outer `<div>` and Shopify's generated
`#shopify-section-header` both collapse to zero height. Measured at a 1000px
viewport: header height `52px`; outer wrapper height `0`; section wrapper height
`0`; first content starts at `top: 0`. The header therefore overlays every page.

The visible surface is `#header-overlay` (`header.liquid:8`), initially
`rgba(254,254,254,0.60)` with `blur(12.5px)`. The scroll controller at
`header.liquid:851-882` hides that overlay, hides the centered logo, and enables
`mix-blend-difference` when scrolling down; it restores the translucent surface
and logo when scrolling up. Dropdowns and mobile panels are separate fixed
elements offset below the header (`header.liquid:321,385,411-412,431-432,467`).

`theme/layout/theme.liquid:79-86` places `{% section 'header' %}` immediately
before `content_for_layout`, so a header that owns height naturally pushes content
down without template-specific offsets.

## Goals / Non-Goals

**Goals:**

- Give the header a real height in the document flow and keep it pinned at the
  viewport top.
- Preserve the existing scroll-time surface, logo, and blend-mode behavior.
- Keep all header menus and panels anchored to the pinned header.
- Keep the change local to the header section.

**Non-Goals:**

- Rewriting the header's scroll-state JavaScript or consolidating its repeated
  inline-style updates.
- Changing header content, menu labels, search/cart behavior, or visual design.
- Adjusting Collections-page spacing or adding per-page header offsets.
- Changing the section schema or theme editor controls.

## Decisions

### 1. Put sticky positioning on the generated section wrapper

The header section will emit a scoped style for
`#shopify-section-{{ section.id }}`:

```css
#shopify-section-{{ section.id }} {
  position: sticky;
  top: 0;
  z-index: 110;
}
```

The wrapper already exists around every Shopify section and is a direct child of
`<body>`. Making it sticky gives it the page's full height as its containing block
and preserves its natural header height. The inner fixed wrapper is then removed.

*Alternatives:*

- **Sticky on the inner header wrapper.** Rejected: its parent would be only as
  tall as the header, so sticky positioning would have no scroll range and the
  header would not stay pinned.
- **Keep `position: fixed` and add top padding to every template.** Rejected: it
  requires per-page offsets that drift when header height changes, keeps content
  underneath the header, and contradicts the no-template-padding goal.
- **Static header that scrolls away.** Rejected: it loses the pinned navigation
  the storefront currently relies on.

This follows the existing section-scoped CSS pattern already used by
`theme/sections/collections-list.liquid:97`.

A browser-only prototype of these three changes confirmed the expected result at a
1000px viewport: section height `52px`, first content top `52px`, and header top
`0` both at page load and at `scrollY: 400`.

### 2. Move the visible surface entirely to the header overlay

The outer wrapper's `bg-white` must be removed. Once the header is in flow, the
outer wrapper becomes header-height; leaving it white would paint an opaque bar
behind the overlay even when the overlay is hidden on scroll-down, breaking the
requested transparent state.

After removing the fixed inner wrapper, the sticky section wrapper becomes the
positioned ancestor of `#header-overlay`; `inset-0` therefore covers exactly the
header height. The overlay remains the only background surface and continues to
be controlled by the existing scroll code.

### 3. Keep the existing scroll-state controller unchanged

The scroll handler already produces the requested behavior and is used from
several interaction paths (dropdowns, cart, mobile menu, search, and resize). This
change will not alter its logic or visual values; only the layout context changes.

*Trade-off:* the inline style updates are duplicated across roughly a dozen call
sites (`header.liquid:628-713,851-882,887-894,964-965,1038-1048,1072-1107,
1172-1205,1233`). A class-based state helper would be cleaner, but refactoring it
here would mix a large behavioral rewrite into a layout fix and raise regression
risk. It is recorded as follow-up technical debt.

### 4. Leave panel offsets and content spacing alone

The sticky header remains at viewport top (`top: 0`) at every scroll position, so
the existing fixed offsets for dropdowns, cart, mobile menu, and mobile search
still align directly below it. They do not need repositioning.

Because the header now occupies flow height, no page needs compensating top
padding. Existing section spacing remains untouched, including the Collections
section and its deferred top-spacing TODO.

## Risks / Trade-offs

- **Sticky breaks if an ancestor gains `overflow`, `transform`, or a filter.** →
  Keep the header wrapper a direct child of `<body>`; verify computed sticky
  behavior in the browser at mobile and desktop widths.
- **The old white wrapper can hide the transparent scroll state.** → Remove
  `bg-white` from the outer wrapper and verify the surface becomes transparent on
  a scroll-down pass.
- **Pinned content still passes beneath the header while scrolling.** → This is
  inherent to a sticky header and matches the existing scroll surface behavior;
  the fix removes the initial/flow overlap, not the pinned overlay during scroll.
- **Dropdown offsets assume the header height.** → No header-height change is
  planned; verify each panel at mobile and desktop widths. Any future header
  height change must also revisit the fixed offsets.
- **Theme editor preview may differ from the storefront.** → Verify the same
  in-flow and sticky behavior in the theme editor preview after implementation.
