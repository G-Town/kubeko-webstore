# Design: fix-theme-check-errors

## Context

All five errors come from a single previous theme-check run (see `proposal.md` for the list). The files and defect classes are independent; no shared abstraction is needed. Evidence for each root cause:

- `sections/hero-image.liquid:74-81` — the `<img>` tag is never closed because line 80's Liquid comment (which contains the `>` and an `onload` handler) is stripped at render. The HTML parser then sees `</picture>`/`</div>` while `<img>` is open → `LiquidHTMLSyntaxError` reporting a `div` closed before `picture`. Line 75 also appends a literal ` 1200w` to `src`, producing an invalid URL. The same file captures `content_for_header` at line 28.
- `snippets/product-buy-section.liquid:6` — `{% for collection in product.collections, i %}` passes a positional `, i` that Liquid does not accept; `i` is unused in the body.
- `snippets/product-card.liquid:35-46` — first-slide `<img>` has no `width`/`height`.
- `templates/page.look.liquid:9-20,32-35` — parses `content_for_header` to recover the `look` query param, duplicating line 37's `request.params.look`.
- `sections/all-products-info.liquid:37` — schema declares `"templates": ["collection"]`, which is not a valid section-schema key.

## Goals / Non-Goals

**Goals:**
- Eliminate the 5 theme-check errors with behavior preserved or corrected.
- Keep each edit local to the offending file (no shared helpers introduced).
- Leave the change independently reviewable and revertible per file.

**Non-Goals:**
- No CSS/layout/visual changes; suboptimal-but-valid `sizes` values (`120vw`, `150vw`) stay as-is.
- No warning cleanup (`img_url` deprecations, `HardcodedRoutes`, `UnusedAssign`, etc.).
- No changes to JS, cart, header, or PDP structure.

## Decisions

**1. Hero `<picture>`: delete the inline comment rather than relocate it.**
The commented `onload` references a dead blur-up helper (`window.loadHighResImage`), so it has no future value. Removing it (and the trailing comment on line 82) closes the `<img>` cleanly.
*Alternatives:* move the comment above `<picture>` (keeps dead code, still must re-verify parsing) — rejected as it preserves noise.

**2. Hero `<img src>`: drop the stray `1200w`, keep `mobile_img_url_1200`.**
`image_url` returns a complete URL; the descriptor belongs in `srcset` only.
*Alternative:* switch to `image_tag` filter — larger rewrite, out of scope.

**3. Look detection: use `request.params.look`, delete the `content_for_header` capture.**
`request.params` is the supported API (already on `page.look.liquid:37`) and avoids `ContentForHeaderModification`. It is available in both templates and sections.
*Alternatives:* keep the parse and suppress the check with a `# theme-check-disable` comment — rejected; the parsing is fragile and unnecessary.

**4. Hero look gate: replace the `content_for_header` capture at line 28 with `request.params.look`.**
Because `hero-image.liquid` already fails parsing, a `ContentForHeaderModification` offense in the same file may be masked. Removing the capture at the same time (line 28-34) is safe and consistent with decision 3. If the re-run still reports it, fix in place.

**5. PDP breadcrumb loop: `{% for collection in product.collections %}`.**
`i` is unused; if an index is ever needed, `forloop.index` is the supported form.

**6. Product-card image dimensions: derive from `first_image.width`/`first_image.height`.**
Mirrors the hero section's pattern (`hero-image.liquid:76-77`) and matches the clamped `srcset`. If `first_image` is blank, fall back to `product.featured_image` (already the source on line 2).

**7. `all-products-info` schema: remove the `templates` key entirely.**
Placement is controlled by template JSON; the key is unsupported and serves no purpose.

## Risks / Trade-offs

- **Masked offenses reappear after the hero syntax fix** → re-run `shopify theme check` after each file and fix any newly surfaced offense within this change.
- **`request.params` naming vs the existing `requested_look_id` / `look_id` duplication** → `page.look.liquid` already has an unused `look_id` assign; collapse both to a single `request.params.look` reference so behavior is unchanged.
- **Blank image object** → guard the `width`/`height` source with the existing `first_image | default: product.featured_image` chain so the attributes are always emitted.
- **Behavior drift in the look gate** → verify a look URL (hero hidden) and a normal URL (hero shown) on desktop and mobile after the change.
