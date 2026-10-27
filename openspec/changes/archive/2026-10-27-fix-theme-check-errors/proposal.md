# Proposal: fix-theme-check-errors

## Why

`shopify theme check` reports **5 errors** across the theme (down from 6 after the hand-fix in `layout/theme.liquid`). Each error marks invalid markup, invalid Liquid, or a discouraged platform pattern. Two of them are real rendering bugs, not just lint noise: the malformed loop in `snippets/product-buy-section.liquid` breaks the PDP collection breadcrumbs, and the mangled `<img>` in `sections/hero-image.liquid` emits a broken image URL (`src="{{ ... }} 1200w"`). Clearing these now keeps the theme-check gate green and unblocks the planned home/header/cart work on a clean base.

## What Changes

- **`sections/all-products-info.liquid`** — remove the unsupported schema key `"templates": ["collection"]` (line 37). Section schemas must not declare `templates`; it triggers `ValidSchema`.
- **`sections/hero-image.liquid`** — repair the `<picture>` block (lines 53–81). A Liquid comment placed *inside* the `<img …>` tag (line 80) is stripped at render, so the tag never closes and the parser reports `LiquidHTMLSyntaxError`. Also remove the stray `1200w` descriptor from the `<img src>` (line 75), which makes the URL invalid, and delete the dead commented `onload` handler.
- **`snippets/product-buy-section.liquid`** — fix the invalid for-loop `{% for collection in product.collections, i %}` (line 6) → `{% for collection in product.collections %}`. The `i` positional argument is not valid Liquid and is unused in the loop body.
- **`snippets/product-card.liquid`** — add `width`/`height` to the first-slide `<img>` (line 35) so it satisfies `ImgWidthAndHeight`.
- **`templates/page.look.liquid`** — replace the `content_for_header` capture/parse (lines 9–20, 32–35) with `request.params.look`, which is already used on line 37. Removes the `ContentForHeaderModification` error and the redundant `requested_look_id` logic.

**BREAKING**: none. All changes either preserve current behavior or correct a broken render.

## Capabilities

### New Capabilities

- `storefront-markup`: the theme's templates, sections, and snippets emit valid, theme-check-clean markup, using only supported section-schema keys and supported request-param APIs.

### Modified Capabilities

- None — the project has no existing specs yet (`openspec/specs/` is empty).

## Non-goals

- No visual redesign or layout changes. Suboptimal-but-valid values (e.g. `sizes="120vw"`/`"150vw"`) are left for the home-page change.
- Not addressing the ~77 warnings (deprecated `img_url`, `HardcodedRoutes`, `VariableName`, `UnusedAssign`, etc.); those are tracked for later batches.
- No changes to the PDP structure, cart architecture, header, or JavaScript behavior.

## Impact

- **Files (5):** `sections/all-products-info.liquid`, `sections/hero-image.liquid`, `snippets/product-buy-section.liquid`, `snippets/product-card.liquid`, `templates/page.look.liquid`.
- **Behavior:** PDP collection breadcrumb links render again; hero image URL is valid; look detection is preserved via `request.params`; product-card images gain intrinsic dimensions (reduced layout shift).
- **Verification:** re-run `shopify theme check` — expect **0 errors** in these files. Note: repairing the `hero-image.liquid` syntax error may surface an additional `ContentForHeaderModification` offense in that file that was previously masked by the parse failure; if so, it is fixed in the same change (its `content_for_header` capture on line 28 must go too).
