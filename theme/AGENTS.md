# Kubeko Shopify theme instructions

This is a custom Shopify Online Store 2.0 theme. It uses custom Liquid, CSS, and hand-written browser JavaScript; do not assume Dawn conventions, a JavaScript package/build system, or Shopify UI defaults.

- `layout/` loads document-level assets.
- `templates/` contains page entry points.
- `sections/` contains merchant-configurable storefront components.
- `snippets/` contains reusable Liquid partials.
- `assets/` contains performance-sensitive CSS, JavaScript, images, fonts, and third-party bundles.
- `config/` contains theme settings and schemas; preserve stable setting IDs.

`assets/base.js` uses custom elements. Scope selectors to the component instance and guard new registrations with `customElements.get()`.

The cart drawer is refreshed via `/?section_id=cart-drawer`; preserve that markup and behavior contract when changing cart actions.

Theme JavaScript must tolerate section reloads and partial DOM replacement. Avoid editing minified third-party assets unless explicitly requested. Verify desktop and mobile behavior separately for UI changes.