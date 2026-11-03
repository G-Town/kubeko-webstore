# Spec Delta

## Purpose

Defines how the storefront cart dropdown renders and refreshes its line items,
totals, and item count from server-rendered Shopify markup, so the cart has one
rendering source and one refresh path.

## ADDED Requirements

### Requirement: Single server-rendered cart dropdown

The cart dropdown contents SHALL be produced by Shopify Liquid from one source,
and SHALL NOT be rebuilt from JavaScript strings in the browser.

#### Scenario: Populated cart renders from Liquid

- **WHEN** a page loads with items in the cart
- **THEN** the dropdown contains the line items rendered by Liquid
- **AND** each line item shows the product title, variant title, quantity, line
  price, and a remove control
- **AND** the dropdown shows the cart total and the checkout control

#### Scenario: Empty cart renders from Liquid

- **WHEN** a page loads with no items in the cart
- **THEN** the dropdown shows the server-rendered empty-cart message
- **AND** no line items or totals are shown

#### Scenario: One line-item renderer

- **WHEN** the dropdown is compared with a future cart page
- **THEN** both use the same shared Liquid line-item partial
- **AND** no browser JavaScript contains line-item markup for the cart

### Requirement: Cart refresh through the Section Rendering API

The dropdown SHALL refresh by requesting the rendered cart dropdown section and
replacing the panel contents, without a full page reload.

#### Scenario: Refresh after a cart change

- **WHEN** an item is added, a quantity is changed, or an item is removed
- **THEN** the dropdown panel contents are replaced with freshly rendered
  server markup
- **AND** the panel stays open in its current position while the contents update

#### Scenario: Refresh when the dropdown opens

- **WHEN** a visitor opens the cart dropdown
- **THEN** its contents reflect the current cart

#### Scenario: No cart request on page load

- **WHEN** any storefront page loads
- **THEN** the cart contents come from the server-rendered page
- **AND** no cart data request is made solely to populate the dropdown

#### Scenario: No duplicate refresh work

- **WHEN** one cart change occurs
- **THEN** the dropdown performs at most one content refresh
- **AND** the theme does not wrap or intercept the global fetch function to
  trigger cart refreshes

### Requirement: Item count synchronization

The refreshed cart markup SHALL carry the current item count, and every cart
count indicator in the header SHALL update from that value.

#### Scenario: Count updates after a cart change

- **WHEN** the dropdown refreshes after a cart change
- **THEN** every cart count indicator shows the new item count
- **AND** no separate cart API request is needed for the count

#### Scenario: Count hides on an empty cart

- **WHEN** the refreshed cart has no items
- **THEN** the cart count indicators are hidden

### Requirement: Money formatting follows the shop format

Cart line prices and the cart total SHALL use the theme's Shopify money
formatting in both the initial render and every refresh.

#### Scenario: Prices use the shop money format

- **WHEN** the dropdown renders or refreshes
- **THEN** every price is rendered with the theme's Shopify money filter
- **AND** prices do not hardcode a currency symbol or round away fractional
  amounts

### Requirement: Line-item actions target the exact line

Quantity and remove actions SHALL apply to the specific cart line they belong
to, and SHALL keep working after the panel contents are replaced.

#### Scenario: Removing one of two lines with the same variant

- **WHEN** the cart contains two separate lines for the same variant and the
  visitor removes one of them
- **THEN** only that line is removed
- **AND** the other line and its quantity remain

#### Scenario: Controls survive a refresh

- **WHEN** the dropdown contents are replaced after a refresh
- **THEN** the quantity and remove controls still respond without a page reload

### Requirement: Cart dropdown presentation is preserved

The refactored cart dropdown SHALL keep its existing appearance and placement.

#### Scenario: Panel appearance is unchanged

- **WHEN** the dropdown is compared before and after this change
- **THEN** its maximum width, position below the header, typography, spacing,
  and checkout control are visually unchanged
