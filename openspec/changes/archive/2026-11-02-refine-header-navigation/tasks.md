# Tasks

## 1. Navigation hover/fade behavior
- [x] 1.1 Add CSS rules in `theme/assets/index.css`:
  - All left nav items full opacity on open
  - First group with children fills right pane faded
  - Hovered left item stays opaque, others fade to 0.4
  - No-children hover fades right pane to 0 (retains width)
  - No JS cloning; server-rendered groups
- [x] 1.2 Add chevron indicator on parent links with children
  - Small chevron (like product cards, <10px height), not inline SVG
  - Chevron opacity 0.6, placed after link text
  - Also on SHOP submenu groups that have their own submenus
- [x] 1.3 Verify active page state and preselection
  - Use `link.active` / `child_active`, `aria-current="page"`
  - Chevron on parent link indicates active dropdown (no underline)
  - Preselect active group on open, fallback to first group with children
- [x] 1.4 Review column-width: SHOP panel narrowed, COLLECTIONS reuses SHOP mechanism
  - Ensure SHOP column-width values reused for COLLECTIONS
  - SHOP panel reduced ~31% (560px → 384px), left column restored to 62.5%
  - COLLECTIONS panel capped at 280px (half of the original SHOP panel)
  - No extra padding/margin on menu columns

## 2. Search/cart coordination
- [x] 2.1 Search inline box stays open during unrelated hovers
  - Keep existing search trigger behavior
  - Closes on Escape, submit, or empty blur
- [x] 2.2 Hovering Search closes cart/dropdowns
  - On `searchTrigger` mouseenter, close any open cart/dropdown
- [x] 2.3 Hovering nav closes cart
  - On nav hover, if cart open, close it
- [x] 2.4 Right-side actions hover like the left nav
  - Hovered Search/Cart stays opaque; the other fades to 0.4

## 3. Panel clamping and max-width
- [x] 3.1 Panels clamped to viewport with 8px gutter
  - Clamp applied to the inline `left` in `positionSubmenu`
  - Min 8px between the panel edge and the viewport edge
- [x] 3.2 SHOP panel max reduced
  - 560px → 384px (about 31% narrower), on the 8px grid

## 4. Files to modify
- [x] 4.1 `theme/assets/index.css` — nav hover/fade CSS, column-width classes, panel clamping, chevron indicator
- [x] 4.2 `theme/sections/header.liquid` — add active state markup, chevron indicator, search/nav closures
- [x] 4.3 `CHANGELOG.md` — add merchant-facing entry describing the nav refinement

## 5. Verification
- [x] 5.1 Desktop: hover left nav, verify opacity changes, right-pane fill, chevron, active chevron
- [x] 5.2 Active page: verify chevron, preselection, `aria-current="page"`
- [x] 5.3 Column widths: SHOP and COLLECTIONS consistent
- [x] 5.4 Search/cart: test forced closures on hover
- [x] 5.5 Panel: clamp to viewport, max-width
- [x] 5.6 Run `shopify theme check --path theme` and verify no new offenses
- [x] 5.7 Run `openspec validate refine-header-navigation --strict`
- [x] 5.8 Right-side actions: hovered item opaque, other fades; SHOP submenu parents show chevrons

## Notes
- Keep the dropdown cart as-is per the earlier agreement; standalone cart page + drawer prototype come after.
- No rewrite of header scroll-state JS; nav/dropdown JS and CSS extraction is a separate cleanup.
- Performance: watch for duplicated rendering/redundant work, especially mobile.
- Mobile header arrangement stays as-is (50px height, mobile panels offset).

## Dependencies
- This change builds on `fix-header-overlap`. Ensure that header is committed.
- It is currently a separate OpenSpec change; after implementation, consider `refine-cart-dropdown` to extract cart-dropdown partial and re-render via a `cart-dropdown` section instead of JS template strings.