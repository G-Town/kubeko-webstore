# Tasks

## 1. Section schema (all-products-info)

- [x] 1.1 Remove the `"templates": ["collection"]` key from the schema in `theme/sections/all-products-info.liquid` (line 37) and verify the file still ends with valid `{% schema %}` JSON
- [x] 1.2 Run `shopify theme check` scoped to the change and verify the `ValidSchema` error for `all-products-info.liquid` is gone

## 2. Hero image markup (hero-image)

- [x] 2.1 In `theme/sections/hero-image.liquid`, delete the Liquid comment inside the `<img>` tag and the trailing dead comment so the `<img>` closes cleanly, and verify the `<picture>` block contains one balanced `<img>`
- [x] 2.2 Remove the stray ` 1200w` descriptor from the fallback `<img src>` so `src` is a single image URL
- [x] 2.3 Replace/remove `content_for_header` usage for look gating; looks are modal-only now, hero always renders
- [x] 2.4 Run `shopify theme check` and verify no `LiquidHTMLSyntaxError` or `ContentForHeaderModification` remains for `hero-image.liquid`

## 3. PDP collection breadcrumbs (product-buy-section)

- [x] 3.1 Fix the loop in `theme/snippets/product-buy-section.liquid` (line 6) to `{% for collection in product.collections %}` and verify no positional argument remains
- [x] 3.2 Run `shopify theme check` and verify the `LiquidHTMLSyntaxError` for `product-buy-section.liquid` is gone

## 4. Product card image dimensions (product-card)

- [x] 4.1 Add `width`/`height` to the first-slide `<img>` in `theme/snippets/product-card.liquid` using `first_image | default: product.featured_image` as the source
- [x] 4.2 Run `shopify theme check` and verify the `ImgWidthAndHeight` error for `product-card.liquid` is gone

## 5. Look resolution via request params (page.look)

- [x] 5.1 Deleted `theme/templates/page.look.liquid` (unused full-page look route). Look display is handled via modal on collection pages; no `content_for_header` parsing remains.
- [x] 5.2 Run `shopify theme check` and verify the `ContentForHeaderModification` error for `page.look.liquid` is gone (file removed)

## 6. Integration verification

- [x] 6.1 Run the full `shopify theme check` and verify the targeted errors from this change are resolved
- [x] 6.2 Looks open via modal on collection pages; hero always renders. Collection card links point to `#` with JS interception.
