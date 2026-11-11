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

### Retain existing money formatting

Keep `money_without_trailing_zeros` for line prices and totals, matching the
current Liquid render. Retaining it avoids a visual change and keeps Shopify's
shop currency, symbol, and grouping; the JS copy's hardcoded `$` and
`toFixed(0)` rounding are removed.

### Remove accelerated checkout buttons and refine the checkout button

Remove the `additional_checkout_buttons` /
`content_for_additional_checkout_buttons` block from the dropdown. On this store
it renders the `shopify-accelerated-checkout-cart` widget with Shop Pay, PayPal,
and Google Pay, which measured 106px tall inside the panel. Its typography and
internal layout are controlled by Shopify's component, so it cannot be matched
reliably with the theme's type scale, and the checkout page already shows the
same payment options.

Keep the primary button at 13px with the site's inherited letter spacing (the
earlier positive-tracking experiment was removed), an outlined treatment
(transparent fill, 1px `#444444` border, `#444444` text, 2px radius), and a 38px
height on both breakpoints. Hover inverts it to a `#444444` fill with white text.
Keep the "CHECK OUT" label: Shopify's own cart uses the verb form, and
"checkout" is the noun.

The section also carries a commented solid-fill alternative in the same `{%
style %}` block (dark `#444444` background, white text, `#555555` hover). Both
variants are labelled so they can be swapped by commenting one block and
uncommenting the other, which makes the comparison a one-step edit instead of a
rewrite.

Lay out the total as a right-aligned 154px block that mirrors the desktop
QUANTITY + stepper group: TOTAL sits on the left of that block and the amount on
the right, so TOTAL lines up with QUANTITY while the amount stays at the panel
edge. Below `md` the QUANTITY label is hidden, so the total block falls back to
its natural width.

Make the line-item rows full-bleed inside the panel. The old layout nested a
10px row card inside a 5px panel inset inside a 15px footer inset, which produced
5/10/15/20px horizontal values that read as accidental. The rows now span the
panel edge to edge, all line-item content shares a 20px horizontal inset, rows
are separated by 8px, and the footer and checkout button keep the same 20px
inset. The total block therefore aligns with the QUANTITY group again on both
edges.

Remove the line-item hover background. The row is not a link or button, so
highlighting the whole row suggested a click target that does not exist. Only
the Remove and quantity controls keep hover fills. Replace it with a static
`rgba(255, 255, 255, 0.35)` row background so the rows read as a grouped list
without implying interactivity. This is deliberately much lighter than the old
`0.60` hover, which composited to about 84% white on the `0.60` panel and became
the strongest surface in the dropdown. The `+` and `−` glyphs still get a 1px
upward nudge so their inks share the quantity value's center line.

Match the dropdown's top offset to the other header menus: `43px` with a `4px`
margin on mobile and `52px` with a `4px` margin on desktop. The cart panel was
previously `52px` on mobile and `55px` plus `6px` on desktop, so it sat 5px lower
than every other dropdown.

Add 8px of top padding to the row's top text block. The image and bottom
controls are already anchored 10px from the row edges, but the title's ink starts
about 11px from the top while the bottom control text sits about 22px from the
bottom. Padding only the top block moves the title and price down without moving
the image or the Remove/stepper row, which stays aligned with the image bottom.
The compiled stylesheet's `.pt-2` utility is broken (it sets `padding-top:
0.5rem` then overrides it with `padding-top: 0`), so the row uses a scoped
`.cart-item-top` class instead.

When the image link is added later, link only the image (and possibly the
product title) to the product page, never the whole row. The row contains
buttons, so wrapping it in an anchor would either be invalid HTML or require a
stretched-link overlay with the controls layered above it. The row hover is
removed, so the link is the only hover target and no false affordance returns.

The theme loads only a 300-weight Helvetica Now file, so heavier `font-weight`
values do not produce a real medium face. The button therefore uses the same
text weight and tracking as the rest of the panel.

### Keep control hover states legible over the page

The panel keeps its original `rgba(254, 254, 254, 0.60)` background and backdrop
blur so it matches the header and collection menus. Only the control hover fills
change: darken the remove and quantity hover fills from `#D9D9D9` to `#C9C9C9`
while keeping the original panel and line-item opacities. This adds a visible,
consistent delta on top of the frosted panel without altering the material or
making the dropdown diverge from the other menus. A darker fill is the minimal
change; raising the panel opacity or fully opaquing it would change the shared
menu appearance.

Alternatives considered:

- *Keep the wallets and align the primary button to their 30px/38px rows* -
  still visually mismatched because the widget's internals are not stylable.
- *Collapse the wallets behind a disclosure* - hides the fastest path behind an
  extra click and still requires the third-party widget in the panel.

Trade-off accepted: visitors lose one-click wallet checkout directly from the
dropdown, but the same options remain one step away on the checkout page. This is
a deliberate presentation choice, not a change to checkout behavior.

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
  prices after updates and no longer shows accelerated wallet buttons; both are
  deliberate and described in the changelog.

## Migration Plan

Single theme change; no data migration. Deploy by pushing the changed files to
the development theme and verifying desktop and mobile in the Section Rendering
API. Rollback is a revert of the commit (the old markup and JS are restored) with
no persisted state to clean up.

## Open Questions

None.
