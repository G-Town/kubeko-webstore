# site-header Specification

## Purpose
Defines how the storefront header occupies page space, stays pinned while
scrolling, and preserves its existing scroll-dependent surface and logo states.

## Requirements

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

### Requirement: Navigation hover and right-pane behavior

The desktop navigation SHALL keep the hovered top-level item at full opacity
while fading the other top-level items to 0.4, and SHALL fill the open panel's
right pane with the children of the selected group.

#### Scenario: Hovered nav item stays highlighted

- **WHEN** the visitor hovers a top-level navigation item that has a dropdown
- **THEN** that item remains at full opacity
- **AND** the other top-level navigation items fade to 0.4 opacity
- **AND** its dropdown opens

#### Scenario: Right pane shows the selected group

- **WHEN** a navigation dropdown is open and a group with children is selected
- **THEN** the right pane shows that group's children
- **AND** the fade state persists while the pointer is inside the panel

#### Scenario: Group without children keeps panel width

- **WHEN** the visitor hovers a group that has no children
- **THEN** the right pane becomes transparent
- **AND** it keeps its width so the panel does not resize

### Requirement: Active page indication

The header SHALL indicate the current page on its top-level navigation item
without underlining and SHALL preselect the matching group when its dropdown
opens.

#### Scenario: Current page is marked

- **WHEN** a page is rendered whose top-level navigation item is active
- **THEN** the item's link has `aria-current="page"`
- **AND** its parent chevron is at full opacity
- **AND** the link is not underlined

#### Scenario: Active child group is preselected

- **WHEN** a visitor opens a dropdown while one of its child groups is active
- **THEN** that group is selected and its children appear in the right pane

#### Scenario: Fallback preselects first group with children

- **WHEN** a dropdown opens and no child group is active
- **THEN** the first group that has children is selected

#### Scenario: Active state survives reopening

- **WHEN** a dropdown is closed and opened again
- **THEN** the active page and preselected group remain indicated

### Requirement: Parent chevron indicators

Links with children SHALL show a small chevron after the link text, and the
chevron SHALL point in the direction the related panel opens.

#### Scenario: Top-level parent chevron points down

- **WHEN** a top-level navigation item has a dropdown
- **THEN** a 5x5px border chevron appears after its label
- **AND** the chevron points down

#### Scenario: Submenu parent chevron points right

- **WHEN** a group inside a dropdown has its own children
- **THEN** a 5x5px border chevron appears after its label
- **AND** the chevron points right

#### Scenario: Chevron adds no text

- **WHEN** the chevron is rendered
- **THEN** it is drawn by CSS and adds no DOM text content

### Requirement: Dropdown panel sizing and anchoring

Header dropdown panels SHALL be anchored to their trigger, SHALL keep an 8px
gutter from the viewport edge, and SHALL respect their maximum widths.

#### Scenario: Panels stay within the viewport

- **WHEN** any header dropdown opens
- **THEN** its left edge is clamped to at least 8px from the viewport edge
- **AND** its right edge is clamped to at least 8px from the opposite edge
- **AND** it begins below the header

#### Scenario: Panel maximum widths

- **WHEN** the SHOP, COLLECTIONS, or cart dropdown opens on a wide viewport
- **THEN** the SHOP panel is at most 384px
- **AND** the COLLECTIONS panel is at most 280px
- **AND** the cart panel is at most 560px

#### Scenario: SHOP columns

- **WHEN** the SHOP dropdown opens
- **THEN** its left column is 62.5% and its right pane is 37.5% of the panel
- **AND** the left column is wider than the right pane

#### Scenario: COLLECTIONS reuses the column mechanism

- **WHEN** the COLLECTIONS dropdown opens
- **THEN** it uses the same left-column mechanism as the SHOP panel
- **AND** neither column adds extra padding or margin

### Requirement: Search and cart interaction coordination

Search, cart, and navigation dropdowns SHALL coordinate so that only the
relevant overlay is open, and the right-side actions SHALL use the same hover
fade as the left navigation.

#### Scenario: Search stays open during unrelated hover

- **WHEN** the search field is open and the visitor hovers an unrelated element
- **THEN** the search field stays open

#### Scenario: Search closes on its own actions

- **WHEN** the visitor presses Escape, submits the search form, or blurs the
  field while it is empty
- **THEN** the search field closes

#### Scenario: Hovering Search closes other panels

- **WHEN** the visitor hovers the search trigger or the open search form
- **THEN** any open cart or navigation dropdown closes

#### Scenario: Hovering navigation closes the cart

- **WHEN** the visitor hovers a navigation item
- **THEN** the cart dropdown closes

#### Scenario: Right-side actions fade like the navigation

- **WHEN** the visitor hovers Search or Cart
- **THEN** the hovered action stays at full opacity
- **AND** the other action fades to 0.4
