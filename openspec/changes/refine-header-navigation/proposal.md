# Propose: refine-header-navigation

## Why

The header's navigation and dropdown panels are now in their correct flow/sticky positions, but the interaction patterns still need refinement to match the agreed design: hover/fade behavior between left nav groups, active page state, column-width sizing for SHOP vs COLLECTIONS, search/cart/dropdown interaction semantics, and panel clamping/max-width. These are the remaining nav-level polish items after the header layout overlap fix.

## What Changes

### 1. Nav hover/fade behavior
- **On dropdown open**: all left nav items at full opacity; the group with children fills the right pane faded (opacity 0.4, retains width); items without children hover-fade the right pane to 0 while retaining the panel width.
- **Hover a left nav item**: that item stays opaque; all other left items fade to opacity 0.4; the right pane fills the hovered item's group.
- **No-children hover**: hovers over left items with no dropdown cause the right pane to fade to opacity 0 but keep its width (the panel stays visible but transparent).
- **Implementation**: no JS cloning of nav items; all groups server-rendered with `data-menu` attributes; CSS `:hover` and `:focus-within` control opacity and visibility.
- **Chevron indicator**: a small chevron (like product cards, <10px height) on parent links that have children, placed after the link text.

### 2. Active page state
- Use `link.active` / `link.child_active`, `aria-current="page"` on the `<a>` element.
- Do not underline the active top-level nav item; the indicator is the chevron on the parent link (no underline anywhere).
- If a child is active, mark its parent and preselect that group on open.
- Fallback: if no active signal is present, preselect the first group that has children.
- The active state should survive a dropdown re-open.

### 3. Column-width: SHOP panel narrowed; COLLECTIONS reuses SHOP's mechanism
- The SHOP panel is ~31% narrower (560px → 384px); the left column keeps its larger 62.5% share so it stays wider than the submenu pane.
- COLLECTIONS must reuse SHOP's column-width mechanism (`nav-col-left`) — no new width values — while its panel is capped at 280px (half the SHOP panel).
- No extra padding or margin on menu columns.

### 4. Search + dropdown interactions
- **Search inline box**: stays open during unrelated hovers; closes on Escape key, form submit, or empty-field blur.
- **Hovering Search**: closes any open cart/dropdowns.
- **Hovering nav**: closes the cart dropdown.
- **Right-side actions**: hovering Search or Cart keeps the hovered item opaque and fades the other to 0.4.
- These behaviors must work alongside the new hover/fade rules without conflict.

### 5. Panel clamping and max-width
- Each dropdown panel is anchored per trigger and clamped to the viewport.
- A minimum `8px` gutter between panel edge and viewport edge.
- **SHOP panel**: max reduced from 650px to a smaller value (to be determined; agreed design direction).
- Panels should not cover header controls (the existing spec scenario).

### 6. Keep the dropdown cart now
- Per the earlier agreement: keep the cart drawer as-is for now; a standalone cart page + drawer prototype will come later.

## Non-Goals (per agreement)
- Rewriting the header's scroll-state JavaScript or consolidating its repeated inline-style updates.
- Changing header content, menu labels, search/cart behavior, or visual design beyond the nav interaction refinements.
- Adjusting Collections-page spacing or adding per-page header offsets.
- Changing the section schema or theme editor controls.

## Files to Create/Modify
- `openspec/changes/refine-header-navigation/proposal.md` (this file)
- `openspec/changes/refine-header-navigation/design.md`
- `openspec/changes/refine-header-navigation/tasks.md`
- `openspec/changes/refine-header-navigation/specs/site-header/spec.md` — capability delta
- `theme/sections/header.liquid` — nav markup updates, hover/fade CSS, active state indicators, chevron indicators, data-menu attributes
- `theme/assets/index.css` — new nav hover/fade rules, column-width classes, panel clamping, chevron indicator; reuse SHOP column mechanism for COLLECTIONS
- `CHANGELOG.md` — merchant-facing entry describing the nav refinement