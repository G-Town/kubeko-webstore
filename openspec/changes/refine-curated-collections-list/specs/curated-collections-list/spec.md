# Spec Delta: curated-collections-list

## Purpose

Defines the curated collection index on the Shopify collection-list page so
merchants can present selected collections as a stable, responsive visual grid.

## ADDED Requirements

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
The Curated Collections section SHALL display its cards as one column on mobile,
two columns on tablet, and three columns on desktop, with each card retaining a
consistent portrait presentation.

#### Scenario: Desktop grid
- **WHEN** the collection-list page is viewed at the desktop layout breakpoint
- **THEN** valid collection cards render in rows of three

#### Scenario: Narrow layout grid
- **WHEN** the collection-list page is viewed on tablet or mobile
- **THEN** cards render in two columns on tablet and one column on mobile

### Requirement: Collection card media and navigation
Each valid card SHALL link to its collection and display the collection image or,
when absent, the first product image as its primary media. A configured secondary
collection image SHALL be available as a hover treatment on hover-capable devices.

#### Scenario: Collection provides primary and secondary images
- **WHEN** a configured collection has a collection image and a secondary image
- **THEN** the card displays the collection image by default
- **AND** reveals the secondary image on a hover-capable device when the card is hovered

#### Scenario: Collection image is absent
- **WHEN** a configured collection has no collection image but has products with
  a featured image
- **THEN** the card uses the first product's featured image as its primary media

#### Scenario: Card is viewed on a touch-oriented device
- **WHEN** the card is viewed on a device without hover support
- **THEN** the primary image remains visible and the card link remains usable

### Requirement: Merchant-facing section identification
The section's editor title and Add section preset SHALL both be named
`Curated Collections`.

#### Scenario: Merchant adds the section
- **WHEN** a merchant opens the Theme Editor's Add section picker
- **THEN** the section is listed as `Curated Collections`
