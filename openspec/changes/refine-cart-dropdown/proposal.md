# Proposal

## Why

The cart dropdown is rendered twice: server-side Liquid in
`theme/sections/header.liquid:447-509` and a JavaScript template string in the
same file at `1276-1381`. The two copies already disagree — Liquid uses
`money_without_trailing_zeros`, while the JS copy hardcodes `$` and
`(cents / 100).toFixed(0)`, and item padding is `py-4` in Liquid but `py-2` in
JS. Every page load also fetches `/cart.js`, a global `window.fetch` wrapper
triggers extra refreshes after cart adds, and the dropdown re-binds handlers
after each `innerHTML` replacement. The standalone cart page planned next would
add a third copy of the same line-item markup.

This change collapses the dropdown to one server-rendered source, refreshed
through Shopify's Section Rendering API, so the cart page can later reuse the
same line-item partial.

## What Changes

- Extract line-item markup to `theme/snippets/cart-line-item.liquid` (image,
  product/variant title, line price, remove, quantity) for reuse by the future
  cart page.
- Add `theme/sections/cart-dropdown.liquid` that server-renders the panel in
  both empty and populated states and exposes `data-cart-item-count` on its
  root.
- Render the new section from `theme/layout/theme.liquid` next to
  `{% section 'header' %}`, and delete the cart markup from `header.liquid`.
- Replace `updateCartDropdownContent()` and the `/cart.js` path with one
  refresh function: fetch `/?section_id=cart-dropdown`, replace the panel
  contents, and update `.cart-count` from the rendered section's count
  attribute.
- Remove the page-load cart fetch, the global `window.fetch` wrapper, the
  submit listener, and the `product:added` / `variant:change` listeners that
  nothing dispatches. Refresh after `cart:updated`, after quantity/remove
  actions, and when the dropdown opens.
- Delegate quantity and remove clicks on the panel root so handlers survive
  partial DOM replacement, and send the line item key (`item.key`) instead of
  the variant id to `/cart/change.js`.
- Remove the accelerated checkout block (Shop Pay / PayPal / Google Pay) from
  the dropdown so the panel has one primary action; those options remain on the
  checkout page. Refine the checkout button to an outlined dark-text treatment,
  keep the "CHECK OUT" label, group the total label with its amount on the right,
  replace the nested line-item cards with full-bleed rows sharing one 20px inset,
  give rows a subtle static background, align the stepper glyphs, remove the
  non-interactive row hover, and darken only the control hover fills so those
  states stay visible without changing the shared panel opacity.
- Keep the dropdown's placement, panel opacity, and line-item typography
  visually unchanged.
- Link the line-item image to its product page, leaving the row itself
  non-interactive. Deferred until approved.
- Update the stale cart refresh contract note in `openspec/config.yaml`
  (`cart-drawer` → `cart-dropdown`) and add a merchant-facing changelog entry.

## Capabilities

### New Capabilities

- `cart`: the cart dropdown's server-rendered content contract — single
  renderer, Section Rendering refresh contract, money formatting, line-item
  actions, empty state, and item-count synchronization.

### Modified Capabilities

- None. The panel's width, anchoring, and open/close coordination already have
  requirements in `site-header` and do not change.

## Impact

- `theme/sections/header.liquid` — cart markup removed; cart refresh/action
  JavaScript replaced.
- `theme/layout/theme.liquid` — renders the new cart dropdown section.
- `theme/sections/cart-dropdown.liquid` — new section file.
- `theme/snippets/cart-line-item.liquid` — new shared partial.
- `openspec/config.yaml` — refresh contract note corrected.
- `CHANGELOG.md` — merchant-facing entry.
- No new dependencies or third-party changes. The one technical assumption —
  that the Section Rendering API can render a section included from the
  layout — is verified in the first implementation task.

## Non-goals

- The standalone `/cart` page and the cart drawer prototype.
- Removing dead `base.js` `cart-drawer` code or the unused
  `product-buy-section` / `product-form` snippets. Those are recorded as
  follow-up work, not changed here.
- Redesigning the dropdown's open/close interaction or the header. The panel
  layout itself was refined as part of this change.
- Changing the checkout page, payment providers, or checkout configuration.
  Accelerated checkout buttons remain available on the checkout page.
- Changing the cart's currency or money format settings.

## Recorded legacy findings

In scope here: the JS/Liquid price and spacing drift, the duplicate renderer,
the page-load fetch, the global `fetch` wrapper, handler rebinding after
`innerHTML`, the unused `data-line-item-key`, and the stale `cart-drawer`
refresh contract.

Follow-up, not in this change: `base.js`'s unreachable `cart-drawer`,
`header-cart`, and `remove-button` elements, and the unused `product-form` /
`product-buy-section` snippets. The Liquid `additional_checkout_buttons` block
that was embedded inside a JS template string is removed here along with the
dropdown wallet buttons.

Also deferred: extracting the cart CSS from `header.liquid` into a shared
stylesheet. The same style-organization pass is expected to cover other sections
and snippets, so it belongs in a separate change rather than this one.
