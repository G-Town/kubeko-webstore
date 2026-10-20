# Kubeko Webstore

## Vision

Kubeko is an independent clothing brand selling through a custom Shopify
Online Store 2.0 theme in `theme/`. The storefront is editorial and
image-led: Garamond + Helvetica Now typography, white/black/#444 palette,
full-bleed photography. Custom Liquid, hand-written browser JavaScript, and
CSS — no Dawn conventions, no build system.

## Goals

- Correctness first: fix illegal markup, broken Liquid, and dead code
  before adding anything new.
- Maintainability: one source of truth for CSS, small independently
  reviewable changes, and an OpenSpec record of every decision.
- Performance: conditional script loading, drop heavy dependencies where
  hand-rolled solutions are lighter (e.g. Swiper -> CSS scroll-snap rail),
  correct image sizes/srcset.
- Coherent, merchant-editable home page, header, and cart.

## Scope

- Theme development under `theme/`: home page, header + cart dropdown,
  product cards/carousel, PDP, collections, search.
- CSS: `theme/assets/index.css` is the live hand-edited Tailwind v3 output
  (pipeline never committed; differential rebuild planned, not done).
- JS: hand-written custom elements (`base.js`, `product-card.js`,
  `product.js`, `product-utils.js`); no bundler.
- OpenSpec root lives at the repo root (`openspec/`): changes, specs,
  config.

## Non-goals (v1)

- Customer accounts (ignore `templates/customers/*`).
- Multi-language / multi-market (zero i18n today).
- Introducing a build system or JS framework for the theme.
- Theme Store submission.

## Current state (2026-10)

- `shopify theme check`: ~81 offenses / 6 errors across 17 files; being
  fixed in small batches, correctness first.
- Known broken: cart-drawer dead code in `base.js` vs. header dropdown
  (three parallel cart paths), hero `<picture>` markup, missing
  `{% paginate %}` wrapper, PDP monolith (no schema, duplicate IDs, five
  product forms), metafield key mismatches (`custom.shipping` /
  `custom.size_chart`).
- Header + search — **incomplete, committed as-is in `f436b50`**: the
  desktop search toggle and mobile search bar live in
  `sections/header.liquid`; the results page is `templates/search.liquid`,
  with support CSS in `assets/index.css`. It works end-to-end at a basic
  level but was never finished or `theme check`-verified, and has no spec.
  Treat as half-done; don't build on it before it is reviewed and specced.
- CSS fragmented: `index.css` + inline `<style>` blocks + dead
  `main.css` / `style.css`(.liquid).
- Missing templates: 404, cart, gift_card, blog/article, password.

## Roadmap

1. Correctness: theme-check errors, collections pagination, PDP markup,
   metafield key alignment.
2. Home: hero markup, side-by-side sizes, CSS scroll-snap carousel rail,
   performance (conditional scripts, drop Swiper), `index-page` cleanup.
3. Header + search (prioritized): finish the half-done search work from
   `Current state` — desktop toggle, mobile bar, and the
   `templates/search.liquid` results page, `theme check`-clean — then
   header fixed -> sticky, cleanup + schema, cart dropdown done right.
4. Cart architecture: drawer + add/remove contract
   (`?section_id=cart-drawer`).
5. Cart page (`templates/cart`).

## Conventions

- Theme code conventions: `theme/AGENTS.md`.
- Operational digest for OpenSpec artifact authors:
  `openspec/config.yaml` -> `context:`.