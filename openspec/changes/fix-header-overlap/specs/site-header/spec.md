# Spec Delta: site-header

## Purpose

Defines how the storefront header occupies page space, stays pinned while
scrolling, and preserves its existing scroll-dependent surface and logo states.

## ADDED Requirements

### Requirement: Header occupies document flow

The site header SHALL participate in the document's normal layout so that page
content begins below the header at initial load, and the header SHALL NOT be
positioned as an overlay above the first content section.

#### Scenario: First content begins below the header

- **WHEN** any storefront page loads at the top of the document
- **THEN** the first content section begins at or below the bottom edge of the
  header
- **AND** no part of that content is covered by the header

#### Scenario: Header height is respected across viewports

- **WHEN** the page is viewed at mobile or desktop width
- **THEN** the content below the header starts after that viewport's header
  height without requiring section-specific top padding

### Requirement: Header remains pinned while scrolling

The header SHALL remain visible at the top of the viewport while the page is
scrolled in either direction.

#### Scenario: Header stays visible when scrolling down

- **WHEN** the visitor scrolls down the page
- **THEN** the header remains pinned at the top of the viewport

#### Scenario: Header stays visible when scrolling up

- **WHEN** the visitor scrolls up the page
- **THEN** the header remains pinned at the top of the viewport

### Requirement: Scroll-dependent header surface

The header SHALL preserve its existing scroll-dependent appearance: a
translucent white, blurred surface at the top of the page and when scrolling up,
and a transparent surface when scrolling down. The centered logo SHALL be visible
with the translucent surface and hidden with the transparent surface. The header
navigation SHALL remain visible in both states.

#### Scenario: Translucent surface at the top

- **WHEN** the page is at the top
- **THEN** the header background is translucent white with background blur
- **AND** the centered logo is visible

#### Scenario: Transparent surface while scrolling down

- **WHEN** the visitor scrolls down and no header menu is open
- **THEN** the header background becomes transparent
- **AND** the centered logo is hidden
- **AND** the header navigation remains visible

#### Scenario: Surface returns while scrolling up

- **WHEN** the visitor scrolls up
- **THEN** the header background returns to the translucent white, blurred
  surface
- **AND** the centered logo becomes visible again

#### Scenario: Open menu keeps the surface visible

- **WHEN** a header dropdown, cart dropdown, or mobile menu is open
- **THEN** the header surface remains visible regardless of scroll direction

### Requirement: Header overlays stay anchored below the header

The header's desktop dropdowns, cart dropdown, mobile menu, and mobile search
panel SHALL remain anchored directly below the header while it is pinned.

#### Scenario: Desktop dropdown opens below the header

- **WHEN** a visitor opens a desktop navigation dropdown while the header is
  pinned
- **THEN** the dropdown begins below the header
- **AND** it does not cover the header controls

#### Scenario: Mobile panels open below the header

- **WHEN** a visitor opens the mobile menu or mobile search while the header is
  pinned
- **THEN** the panel begins below the header

### Requirement: No fixed-header content offset

Pages SHALL NOT need template-specific padding or spacer elements to compensate
for a fixed header.

#### Scenario: Existing pages keep their section spacing

- **WHEN** a template is rendered after this change
- **THEN** its sections use their existing internal spacing
- **AND** no added top padding or spacer is used solely to clear the header
