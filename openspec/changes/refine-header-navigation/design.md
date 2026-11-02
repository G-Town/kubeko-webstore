# Design: refine-header-navigation

## Context

`fix-header-overlap` completed the sticky header and panel offsets, making the header truly in document flow while preserving its scroll-time surface and panels anchored below it. This left the navigation interaction patterns unchanged:

- Hover on left nav items opened dropdowns but without the agreed fade/visibility rules.
- Active page state was not indicated (no underline, no preselection).
- SHOP and COLLECTIONS used independent column-widths with potential inconsistency.
- Search/cart/dropdown interactions followed the original behavior (no forced closure).
- Panel clamping and max-width values were inherited from the previous design but may need refinement.

This change refines the nav interaction and layout per the agreed design that I outlined earlier:

- Left-item opacity control, right-pane fill/fade, no-children behavior.
- Chevron indicators (like product cards) for parents with children.
- Active page: `link.active` / `child_active`, `aria-current="page"`, chevron on parent indicates active dropdown (no underline), preselect active group on open, fallback to first group with children.
- SHOP panel narrowed by ~31% (560px → 384px); the left list keeps the larger column share. COLLECTIONS reuses SHOP's column mechanism.
- Search stays open during unrelated hovers; closes on Escape/submit/empty blur; hovering Search closes cart/dropdowns; hovering nav closes cart.
- Right-side hover matches left-nav pattern.
- Panels clamped to viewport with 8px gutter; SHOP panel capped at 384px and COLLECTIONS at 280px.

## Goals

1. **Navigation interaction**: implement the agreed hover/fade behavior and active page indicators.
2. **Column width consistency**: ensure SHOP and COLLECTIONS columns use the same width mechanism, with SHOP's left column keeping the larger share at a narrower panel size.
3. **Search/cart coordination**: enforce the required interaction closures to avoid conflicts.
4. **Panel constraints**: enforce clamping to viewport and reduce max-width.

## Non-Goals (per agreement)
- Rewriting the header's scroll-state JavaScript or consolidating its repeated inline-style updates (this is a separate task).
- Changing header content, menu labels, search/cart behavior, or visual design beyond the nav interaction refinements.
- Adjusting Collections-page spacing or adding per-page header offsets.
- Changing the section schema or theme editor controls.

## Implementation Considerations

### Nav markup
- Left nav items (`<li class="relative group">`) with `<a href="...">{{ link.title }}</a>`.
- Parent links with children get `class="... has-children"`.
- Active state: `{% if link.active or link.child_active %}` adds `aria-current="page"` to the `<a>` and `data-page-active="true"` to the `<li>`. The parent is preselected through `[data-submenu-active="true"]` on its matching group.
- Chevron indicator: a small border chevron (5×5px, opacity 0.6) after the link text on any parent link with children, including SHOP submenu groups that have grandchildren. It points down for top-level menus and right for submenu parents.
- No underline on active items; the chevron is the active indicator.

### CSS (`theme/assets/index.css`)
- `#header-nav li > a` is full opacity; `#header-nav:hover li > a` fades non-hovered items to 0.4.
- The hovered item and the item with `[data-dropdown-active="true"]` stay at opacity 1.
- `body:has(.menu-dropdown:not(.hidden))` keeps the same fade while the pointer is inside an open panel.
- `.submenu-content:empty` fades the right pane to 0 and keeps its width (`nav-col-right`), for groups with no grandchildren.
- Chevron: `a.has-children::after` draws a 5×5px border chevron, opacity 0.6, after the link text (no SVG, no extra text nodes). It points down under top-level nav parents and right under SHOP submenu parents.
- Column widths: `.nav-col-left { width: 62.5%; }`; `.nav-col-right { width: 37.5%; }`.
- Panel clamp: SHOP 384px, cart 560px, COLLECTIONS 280px, each also capped by `calc(100vw - 16px)`.
- Right-side actions: `.header-actions:hover > *:not(:hover) { opacity: 0.4 }`, `.header-actions > *:hover { opacity: 1 }`.

### JS (`theme/sections/header.liquid`, existing nav handlers)
- Use existing nav hover detection (`mouseenter` on `#header-nav` items).
- On hover, close the cart/previous dropdown, set `data-dropdown-active="true"` on the hovered li, and open its dropdown.
- Preselect the active group (`[data-submenu-active="true"]`), else the first group with children, so the right pane is filled on open.
- `positionSubmenu` anchors the panel to the trigger and clamps its inline `left` to an 8px gutter.
- No cloning; the HTML already has server-rendered groups.

### Search interaction
- Use existing `searchTrigger`, `searchForm`, `searchInput` event listeners (as present in `header.liquid`).
- On any `mouseenter` on `searchTrigger` or `searchForm`, close any open cart/nav dropdown via `closeCurrentDropdown`.
- On nav hover: if the cart dropdown is open, close it (existing `closeCurrentDropdown` call).
- Search stays open during unrelated hovers; closes on Escape, submit, or empty-field blur.

### Panel anchoring and clamping
- `positionSubmenu` sets `dropdown.style.left` from the trigger rect, then clamps it to `[8, innerWidth - panelWidth - 8]`.
- CSS only caps `max-width`; it does not set a second `left`, so trigger anchoring is preserved.

### Column widths
- SHOP uses `.nav-col-left` (62.5%) and `.nav-col-right` (37.5%); its panel is capped at 384px, so the left list stays wider than the submenu pane without the panel being oversized.
- COLLECTIONS reuses `.nav-col-left`; its panel is capped at 280px (half the SHOP panel) so the single list does not stretch.

## Risk / Trade-offs
- **CSS cascade**: Nav opacity rules moved out of the section's inline `<style>` into `assets/index.css`; keep the `!important`-free rules ordered after Tailwind utilities.
- **Panel positioning**: `positionSubmenu` sets an inline `left`; clamping must happen there, not via a second CSS `left`, or the trigger anchoring is lost.
- **Search/nav coordination**: Adding forced closures may conflict with existing expectations; test thoroughly on desktop and mobile.
- **Panel max-width**: SHOP 384px, cart 560px, COLLECTIONS 280px; confirm they still fit the submenu content during review.

## Status
Tasks 1.1–5.8 are complete and verified against the local development theme. The change is ready to archive.