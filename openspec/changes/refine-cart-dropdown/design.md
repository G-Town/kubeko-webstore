# Design

## Context

See `proposal.md` - Why. The current dropdown markup lives inside
`theme/sections/header.liquid` (`447-509`) and is rebuilt by
`updateCartDropdownContent()` (`1276-1381`). `theme/layout/theme.liquid:79`
renders the header with `{% section 'header' %}`; no section is rendered inside
another section. `theme/sections/header.liquid` has no `{% schema %}` block.

Live cart mutation paths observed:

- Add to cart: `theme/assets/product.js:744-760` posts to `/cart/add.js`, then
  dispatches `cart:updated` on `document`.
- Quantity and remove: the header dropdown posts to `/cart/change.js`
  (`header.liquid:1411-1438`).
- `base.js`'s `cart-drawer` element and `/?section_id=cart-drawer` refresh are
  unreachable: no template renders `<cart-drawer>`.
- `header.liquid` listens for `product:added` and `variant:change`, which
  nothing dispatches, and additionally refreshes through a global `window.fetch`
  wrapper and a document `submit` listener.

## Goals / Non-Goals

**Goals**

- One Liquid source for cart line items, shared between the dropdown and the
  future cart page.
- One refresh path: the Section Rendering API, with the item count carried in
  the rendered markup.
- Keep the dropdown's rendered appearance and open/close behavior unchanged.

**Non-Goals**

- Changing the dropdown design, panel width, or anchoring.
- Building the cart page or drawer, or removing the dead `base.js` cart-drawer
  code.
- Moving cart JavaScript out of the header section.

## Decisions

### Render the dropdown from a dedicated layout-level section

Add `theme/sections/cart-dropdown.liquid`, rendered from
`theme/layout/theme.liquid` immediately after `{% section 'header' %}`, and
delete the cart markup from `header.liquid`.

- Shopify does not allow `{% section %}` inside another section, so the cart
  cannot be a child section of the header.
- The Section Rendering API returns only this section's HTML on refresh, rather
  than the whole header and its menus.
- The section can later be reused by the cart page work, and it matches the
  section-rendering refresh pattern already described in the project constraints.
- The section root keeps the `.cart-dropdown` class, so the existing header
  trigger/open/close JavaScript and the panel's `site-header` anchoring
  requirements keep working. The root also exposes `data-cart-item-count`.

Alternatives considered:

- *Re-render `/?section_id=header` and extract `.cart-dropdown`* - fewer files,
  but every cart change re-renders the entire navigation and mobile menu, and the
  cart stays coupled to the header section.
- *Keep the JS renderer and share only a line-item snippet* - leaves two
  renderers and the price drift, and the cart page would inherit the same
  problem.

### Refresh with one section request and read the count from the markup

Replace `fetchAndUpdateCart()` / `updateCartDropdownContent()` with a single
`refreshCartDropdown()` that requests `/?section_id=cart-dropdown`, parses the
response, replaces the contents of the existing `.cart-dropdown` root, and reads
`data-cart-item-count` to update every `.cart-count` indicator.

- One request per change instead of `/cart.js` plus DOM generation.
- The rendered HTML and the count cannot disagree.
- Removing the page-load fetch is a performance win; the server-rendered page is
  already correct.

The root element is not replaced, only its contents, so the panel stays open,
keeps its `hidden` state, and keeps its position. Because the section is rendered
in the layout, a minimal `{% schema %}` with a name and no settings is included
so the section is well-formed for the theme editor; `header.liquid` has no
schema, so a schema-less section also renders, but the name makes the section
identifiable.

### Refresh from explicit cart events, not a global fetch wrapper

- Refresh after a successful quantity change or remove in the dropdown.
- Refresh when the dropdown opens.
- Listen for `cart:updated`, which `product.js` dispatches after a successful
  add-to-cart.

Remove the `window.fetch` wrapper, the document `submit` listener, the
`product:added` listener, the `variant:change` listener, and the page-load
`fetchAndUpdateCart()` call. This removes the double/triple refresh that occurs
today when `product.js` adds an item.

Risk accepted: an add-to-cart path that does not dispatch `cart:updated` would
not refresh immediately. Evidence says the only live path is `product.js`; the
refresh-on-open behavior covers any gap, and the global fetch wrapper is too
broad a fix to keep.

### Delegate line-item actions and use the line key

Attach `click` listeners once to the `.cart-dropdown` root and resolve
`.quantity-adjust` / `.remove-item` targets with `closest()`. Read the line key
from `data-line-item-key` and send it as `id` to `/cart/change.js`.

- Delegation survives the section-content replacement, removing the per-render
  `querySelectorAll` rebinding.
- `item.key` addresses the exact line; the current `variant_id` path updates the
  first line with that variant when the same variant appears on multiple lines.

### Retain existing money formatting and checkout markup

Keep `money_without_trailing_zeros` for line prices and totals, matching the
current Liquid render. Retaining it avoids a visual change and keeps Shopify's
shop currency, symbol, and grouping; the JS copy's hardcoded `$` and
`toFixed(0)` rounding are removed. Keep the `additional_checkout_buttons` block
for parity even though it is effectively empty outside the cart page; it is
currently embedded in a JS template string, so moving it into Liquid does not
reduce existing functionality.

## Risks / Trade-offs

- **Section Rendering API may not render a layout-level section** → the first
  task verifies `/?section_id=cart-dropdown` on the dev theme before the markup
  is removed from `header.liquid`. If it fails, fall back to rendering the
  section from each template that needs it (the header is on every page).
- **`cart:updated` is dispatched before the header listener can act?** → the
  listener is registered at DOMContentLoaded and the event fires on user action,
  so ordering is safe; refresh-on-open remains a backstop.
- **Theme editor re-rendering** → the cart section has no settings, and the
  header script is unchanged in how it registers; existing editor behavior is
  preserved.
- **Two count indicators (mobile and desktop)** → update all `.cart-count`
  elements from the section value, as the current helper does.
- **Merchant-facing behavior change** → the dropdown now shows shop-formatted
  prices after updates; this fixes drift rather than changing the design.

## Migration Plan

Single theme change; no data migration. Deploy by pushing the changed files to
the development theme and verifying desktop and mobile in the Section Rendering
API. Rollback is a revert of the commit (the old markup and JS are restored) with
no persisted state to clean up.

## Open Questions

None. The only deferred item is whether the `additional_checkout_buttons` block
is ever populated in this theme; it is kept for parity and can be reassessed
when the cart page is built.
