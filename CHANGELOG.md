# Storefront Changelog

Plain-language notes for merchant review. Each entry lists what changed and which
decisions can be reversed. Newest entries appear first.

## 27 October 2026

### Collections page

The Collections page now works as a curated index rather than a catalog:

- It shows only the collections selected in the theme editor, in the order they
  are arranged.
- The old previous/next and page-number controls have been removed.
- Cards adapt to the screen: one per row on phones, two on tablets, and three on
  desktops.
- When a row has fewer cards than it can fit, the cards are centered. With the
  current two collections, they appear as a centered pair.
- Each card uses the collection image. If the collection has no image, the first
  product image is used instead.
- If a collection has no image at all, the card shows a plain charcoal panel with
  no “no image available” message.
- If a collection has a second image set, it appears when a visitor points at the
  card with a mouse or trackpad. Touch devices keep the first image.
- The section is named “Curated Collections” in the theme editor.

### Theme fixes

- Product pages show the collections a product belongs to again.
- The homepage hero image loads correctly again, and the hero always appears.
- Product card images reserve their space while loading, reducing page jumps.
- The unused full-page “look” view has been removed. Looks still open in the
  existing collection-page modal.
- An invalid setting was removed from the collection page’s product section so
  the theme remains valid.

### Choices you can change

These are intentional decisions, not permanent requirements. Reply with the item
name if you want any of them reversed or adjusted.

- **Centered two-card layout** — Current: the two collections sit as a centered
  pair. Alternative: start the cards from the left and leave the third spot empty.
- **Centered partial rows** — Current: any incomplete row is centered, so four
  collections would appear as three cards plus one centered card below.
  Alternative: keep every row starting from the left.
- **Portrait card shape** — Current: cards use a portrait crop, slightly taller
  than wide. Alternative: square or landscape cards.
- **Hover image** — Current: the optional second image appears only on devices
  that support hovering. Alternative: remove the hover effect, always show the
  first image, or use a different image.
- **No-image panel** — Current: a plain dark charcoal panel. Alternative: another
  color or a short message.
- **Title bar** — Current: collection names sit in a light translucent bar at the
  bottom of each card. Alternative: change the bar, text size, or placement.
- **Section name** — Current: “Curated Collections” in the theme editor.
  Alternative: a different label.
- **Card spacing and maximum width** — Current: cards have a small gap and the
  section stops widening on very large screens. Alternative: more or less space.

### Still to come

- The fixed header currently overlaps the top of the Collections section. We plan
  to update the header so it no longer sits over page content. After that, we can
  add extra top spacing or introductory text to this section if desired.
- Remaining theme maintenance warnings are being cleaned up in later work. They
  are upkeep items and do not represent broken pages.
