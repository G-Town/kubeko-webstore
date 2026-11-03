# Tasks

## 1. Server-rendered cart section

- [ ] 1.1 Extract the line-item markup to `theme/snippets/cart-line-item.liquid`
  (accepts `item`; image, product title, variant title, line price, remove,
  quantity) and create `theme/sections/cart-dropdown.liquid` that renders the
  populated and empty states, total, and checkout with the existing
  `.cart-dropdown` root classes plus `data-cart-item-count`. Include a minimal
  schema with a name and no settings.
  - Verify: push the two files and request
    `/?section_id=cart-dropdown`; the response contains the panel, the current
    line items or the empty message, and shop-formatted prices.
- [ ] 1.2 Render the new section from `theme/layout/theme.liquid` after
  `{% section 'header' %}`, delete the cart markup from `header.liquid`, and
  keep the inner structure the existing JavaScript targets.
  - Verify: `shopify theme push --path theme --store kubeko-dev.myshopify.com
    --theme 195275784486 --only layout/theme.liquid --only
    sections/cart-dropdown.liquid --only snippets/cart-line-item.liquid --only
    sections/header.liquid --nodelete`; desktop hover and mobile tap open the
    same panel as before, and the DOM contains exactly one `.cart-dropdown`.

## 2. Refresh path

- [ ] 2.1 Replace `fetchAndUpdateCart()` / `updateCartDropdownContent()` with a
  single refresh that requests `/?section_id=cart-dropdown`, replaces the
  panel contents, and updates every `.cart-count` from
  `data-cart-item-count`.
  - Verify: in DevTools → Network, opening or changing the cart issues one
    `section_id=cart-dropdown` request and no `/cart.js` request; the panel
    updates without closing.
- [ ] 2.2 Remove the page-load cart fetch, the global `window.fetch` wrapper,
  the document `submit` listener, and the `product:added` / `variant:change`
  listeners. Refresh instead on `cart:updated`, on quantity/remove success, and
  when the dropdown opens.
  - Verify: add a product from the PDP and confirm exactly one section request
    and one correct count update; no cart request fires on page load.
- [ ] 2.3 Update the cart refresh contract in `openspec/config.yaml` from
  `/?section_id=cart-drawer` to `/?section_id=cart-dropdown` and add the
  merchant-facing `CHANGELOG.md` entry.
  - Verify: `openspec validate refine-cart-dropdown --strict` passes and the
    changelog entry describes the visible improvement without code terms.

## 3. Line-item actions

- [ ] 3.1 Delegate quantity and remove clicks on the `.cart-dropdown` root, and
  send the line's `data-line-item-key` as `id` to `/cart/change.js`.
  - Verify: with two separate lines for the same variant, removing one leaves
    the other intact; quantity and remove still work after a refresh replaces
    the panel contents.

## 4. Verification

- [ ] 4.1 Desktop: empty and populated dropdown, decimal prices, total, add,
  quantity increase/decrease, remove, open/close, count badge visibility, and
  header panel anchoring.
- [ ] 4.2 Mobile: tap open/close, quantity and remove, count badge, and layout
  at the mobile header height.
- [ ] 4.3 Run `shopify theme check --path theme` (no new offenses) and
  `openspec validate refine-cart-dropdown --strict`; confirm the network panel
  shows no duplicate cart requests during add, quantity, and remove flows.
