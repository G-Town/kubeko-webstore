# curated-collections-list Specification

## Purpose
Defines the curated collection index on the Shopify collection-list page so
merchants can present selected collections as a stable, responsive visual grid.

## Requirements

### Requirement: Configured collection order
The Curated Collections section SHALL render only its configured collection
blocks, in the order defined by the template's block order, and SHALL NOT
render pagination controls.

#### Scenario: Curated collections render in configured order
- **WHEN** a merchant configures two or more valid collection blocks
- **THEN** the storefront renders one card for each configured collection in the
  same order as the blocks
- **AND** the storefront renders no previous, next, or page-count controls

#### Scenario: Collection block is no longer valid
- **WHEN** a configured collection block does not resolve to a collection
- **THEN** the storefront skips that block without rendering an empty card or a
  broken collection link

### Requirement: Responsive curated collection grid
The Curated Collections section SHALL display its cards as one column below
768px, two columns from 768px to 1023px, and three columns at 1024px and above,
with each card retaining a consistent portrait presentation.

#### Scenario: Desktop grid
- **WHEN** the collection-list page is viewed at 1024px or wider
- **THEN** valid collection cards render in rows of three

#### Scenario: Tablet grid
- **WHEN** the collection-list page is viewed between 768px and 1023px
- **THEN** valid collection cards render in rows of two

#### Scenario: Mobile grid
- **WHEN** the collection-list page is viewed below 768px
- **THEN** valid collection cards render in a single column

### Requirement: Collection card media and navigation
Each valid card SHALL link to its collection and display the collection image or,
when absent, the first product image as its primary media. A secondary image
configured through the collection's `custom.second_image` metafield SHALL be
available as a hover treatment on hover-capable devices. When no primary media
resolves, the card SHALL display a solid dark media field while remaining a link.

#### Scenario: Collection provides primary and secondary images
- **WHEN** a configured collection has a collection image and a `custom.second_image`
  metafield
- **THEN** the card displays the collection image by default
- **AND** reveals the secondary image on a hover-capable device when the card is hovered

#### Scenario: Collection image is absent
- **WHEN** a configured collection has no collection image but has products with
  a featured image
- **THEN** the card uses the first product's featured image as its primary media

#### Scenario: Collection has no usable image
- **WHEN** a configured collection has neither a collection image nor a product
  with a featured image
- **THEN** the card still links to the collection
- **AND** displays a solid `#444444` media field with no placeholder copy
- **AND** does not emit an empty or broken image source
- **AND** keeps the collection title bar visible at the bottom of the card

#### Scenario: No secondary image is configured
- **WHEN** a configured collection has no `custom.second_image` metafield
- **THEN** the card renders no hover image
- **AND** the primary image remains visible when the card is hovered

#### Scenario: Card is viewed on a touch-oriented device
- **WHEN** the card is viewed on a device without hover support
- **THEN** the primary image remains visible and the card link remains usable

### Requirement: Merchant-facing section identification
The section's editor title and Add section preset SHALL both be named
`Curated Collections`.

#### Scenario: Merchant adds the section
- **WHEN** a merchant opens the Theme Editor's Add section picker
- **THEN** the section is listed as `Curated Collections`
