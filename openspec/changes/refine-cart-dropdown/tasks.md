# Tasks

## 1. Server-rendered cart section

- [x] 1.1 Extract the line-item markup to `theme/snippets/cart-line-item.liquid`
  (accepts `item`; image, product title, variant title, line price, remove,
  quantity) and create `theme/sections/cart-dropdown.liquid` that renders the
  populated and empty states, total, and checkout with the existing
  `.cart-dropdown` root classes plus `data-cart-item-count`. Include a minimal
  schema with a name and no settings.
  - Verify: push the two files and request
    `/?section_id=cart-dropdown`; the response contains the panel, the current
    line items or the empty message, and shop-formatted prices.
- [x] 1.2 Render the new section from `theme/layout/theme.liquid` after
  `{% section 'header' %}`, delete the cart markup from `header.liquid`, and
  keep the inner structure the existing JavaScript targets.
  - Verify: `shopify theme push --path theme --store kubeko-dev.myshopify.com
    --theme 195275784486 --only layout/theme.liquid --only
    sections/cart-dropdown.liquid --only snippets/cart-line-item.liquid --only
    sections/header.liquid --nodelete`; desktop hover and mobile tap open the
    same panel as before, and the DOM contains exactly one `.cart-dropdown`.

## 2. Refresh path

- [x] 2.1 Replace `fetchAndUpdateCart()` / `updateCartDropdownContent()` with a
  single refresh that requests `/?section_id=cart-dropdown`, replaces the
  panel contents, and updates every `.cart-count` from
  `data-cart-item-count`.
  - Verify: in DevTools → Network, opening or changing the cart issues one
    `section_id=cart-dropdown` request and no `/cart.js` request; the panel
    updates without closing.
- [x] 2.2 Remove the page-load cart fetch, the global `window.fetch` wrapper,
  the document `submit` listener, and the `product:added` / `variant:change`
  listeners. Refresh instead on `cart:updated`, on quantity/remove success, and
  when the dropdown opens.
  - Verify: add a product from the PDP and confirm exactly one section request
    and one correct count update; no cart request fires on page load.

## 3. Cart presentation

- [x] 3.1 After the JS renderer is gone, remove the
  `additional_checkout_buttons` block from `sections/cart-dropdown.liquid` and
  refine the checkout button: keep the "CHECK OUT" label, use a 13px outlined
  treatment (transparent fill, 1px `#444444` border, `#444444` text) with the
  panel's inherited tracking, a 2px radius, and a 38px height. Hover inverts it
  to a `#444444` fill with white text. Keep a labelled, commented solid-fill
  alternative in the same style block for quick comparison. Put the total label
  and amount in a right-aligned block that matches the desktop QUANTITY +
  stepper width, label on the left and amount on the right.
  - Verify: desktop and mobile dropdowns show exactly one checkout control, no
    Shop Pay / PayPal / Google Pay buttons, the label matches the panel's text
    spacing, TOTAL lines up with QUANTITY on desktop, and the button still
    submits to Shopify checkout.
- [x] 3.2 Keep the panel and line-item background opacities unchanged so the
  dropdown matches the other header menus, and darken only the control hover
  fills so remove and quantity highlights stay visible over light page content.
  - Verify: the panel background remains `rgba(254, 254, 254, 0.60)` with its
    backdrop blur, remove and quantity hovers use `#C9C9C9`, and line-item rows
    have no hover background.
- [x] 3.3 Align the line-item content and the stepper glyphs.
  - Verify: the `+` and `−` inks share the quantity value's vertical center.
- [x] 3.4 Replace the nested row cards with full-bleed rows: remove the 5px panel
  inset, give rows a 20px horizontal inset and 8px separation, and give the
  footer and checkout button the same 20px inset so the total block realigns
  with the QUANTITY group.
  - Verify: rows span the panel width, line-item content, total, and button all
    sit 20px from the panel edges, the button stays 520px wide and 38px tall,
    row separation is 8px, and the total and QUANTITY blocks share both edges.
- [x] 3.5 Match the dropdown's top offset to the other header menus and add 8px
  of top padding to the line-item text block so the title and price sit lower
  while the image and bottom controls stay anchored.
  - Verify: the panel opens at 47px on mobile and 56px on desktop, matching the
    other dropdowns, and the title/price move down without shifting the image,
    Remove, or stepper.
- [ ] 3.6 Link the line-item image (not the whole row) to its product page.
  Deferred until approved; keep the row itself non-interactive.
  - Verify: the image is a link to the product, the title may also be a link,
    and Remove/quantity clicks still work without navigating.
- [x] 3.7 Add a subtle static background to each line-item row so rows read as a
  grouped list without implying interactivity.
  - Verify: each row uses `rgba(255, 255, 255, 0.35)`, the 8px gaps remain, and
    hovering a row does not change its background.

## 4. Line-item actions

- [ ] 4.1 Delegate quantity and remove clicks on the `.cart-dropdown` root, and
  send the line's `data-line-item-key` as `id` to `/cart/change.js`.
  - Verify: with two separate lines for the same variant, removing one leaves
    the other intact; quantity and remove still work after a refresh replaces
    the panel contents.

## 5. Documentation

- [ ] 5.1 Update the cart refresh contract in `openspec/config.yaml` from
  `/?section_id=cart-drawer` to `/?section_id=cart-dropdown`, update the stale
  `cart-drawer` refresh note in `theme/AGENTS.md`, and add the merchant-facing
  `CHANGELOG.md` entry, including the wallet buttons moving to checkout and the
  clearer checkout button.
  - Verify: `openspec validate refine-cart-dropdown --strict` passes, the
    changelog entry describes the visible improvements without code terms, and
    no repository doc still describes the cart as a `cart-drawer`.

## 6. Verification

- [ ] 6.1 Desktop: empty and populated dropdown, decimal prices, total, add,
  quantity increase/decrease, remove, open/close, count badge visibility, header
  panel anchoring, and the single checkout button.
  - Start `shopify theme dev --path theme --store kubeko-dev.myshopify.com
    --theme 195275784486` and verify on the preview URL. If a saved section is
    served stale, touch the file or restart the dev server.
- [ ] 6.2 Mobile: tap open/close, quantity and remove, count badge, checkout
  button, and layout at the mobile header height.
- [ ] 6.3 Run `shopify theme check --path theme` (no new offenses) and
  `openspec validate refine-cart-dropdown --strict`; confirm the network panel
  shows no duplicate cart requests during add, quantity, and remove flows.
