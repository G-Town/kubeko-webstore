# Tasks

## 1. Section schema (all-products-info)

- [ ] 1.1 Remove the `"templates": ["collection"]` key from the schema in `theme/sections/all-products-info.liquid` (line 37) and verify the file still ends with valid `{% schema %}` JSON
- [ ] 1.2 Run `shopify theme check` scoped to the change and verify the `ValidSchema` error for `all-products-info.liquid` is gone

## 2. Hero image markup (hero-image)

- [ ] 2.1 In `theme/sections/hero-image.liquid`, delete the Liquid comment inside the `<img>` tag (line 80) and the trailing dead comment (line 82) so the `<img>` closes cleanly, and verify the `<picture>` block contains one balanced `<img>`
- [ ] 2.2 Remove the stray ` 1200w` descriptor from the fallback `<img src>` (line 75) so `src` is a single image URL
- [ ] 2.3 Replace the `content_for_header` capture used for the look gate (lines 28-34) with `request.params.look`, and verify no `content_for_header` reference remains in the section
- [ ] 2.4 Run `shopify theme check` and verify no `LiquidHTMLSyntaxError` or `ContentForHeaderModification` remains for `hero-image.liquid`

## 3. PDP collection breadcrumbs (product-buy-section)

- [ ] 3.1 Fix the loop in `theme/snippets/product-buy-section.liquid` (line 6) to `{% for collection in product.collections %}` and verify no positional argument remains
- [ ] 3.2 Run `shopify theme check` and verify the `LiquidHTMLSyntaxError` for `product-buy-section.liquid` is gone

## 4. Product card image dimensions (product-card)

- [ ] 4.1 Add `width`/`height` to the first-slide `<img>` in `theme/snippets/product-card.liquid` (line 35) using `first_image | default: product.featured_image` as the source, and verify both attributes are present
- [ ] 4.2 Run `shopify theme check` and verify the `ImgWidthAndHeight` error for `product-card.liquid` is gone

## 5. Look resolution via request params (page.look)

- [ ] 5.1 In `theme/templates/page.look.liquid`, remove the `content_for_header` capture/parse block (lines 9-20) and the redundant `requested_look_id` logic (lines 32-35), resolving the requested look solely from `request.params.look`
- [ ] 5.2 Run `shopify theme check` and verify the `ContentForHeaderModification` error for `page.look.liquid` is gone

## 6. Integration verification

- [ ] 6.1 Run the full `shopify theme check` and verify the error count is 0 (warnings may remain unchanged)
- [ ] 6.2 Verify on desktop and mobile that the PDP renders collection breadcrumb links, the home hero image loads, and a look URL (e.g. `?look=<id>`) hides the hero while a normal URL shows it
