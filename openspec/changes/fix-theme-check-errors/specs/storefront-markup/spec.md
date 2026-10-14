# Spec Delta: storefront-markup

## Purpose

Defines the markup and rendering contract for the Kubeko storefront theme, ensuring every template, section, and snippet emits valid, theme-check-clean HTML and uses only supported platform APIs.

## ADDED Requirements

### Requirement: Supported section schema keys

Section and block schemas SHALL use only keys defined by the Shopify section-schema specification, and SHALL NOT declare the unsupported `templates` key.

#### Scenario: Collection product section schema is valid

- **WHEN** `shopify theme check` validates a section schema
- **THEN** it reports no `ValidSchema` offense for that schema

#### Scenario: No unsupported templates key

- **WHEN** a section is added to a template
- **THEN** its schema relies on the template JSON for placement and does not declare a `templates` key

### Requirement: Valid hero image markup

The hero-image section SHALL render a single well-formed `<picture>` element containing desktop and mobile `<source>` elements plus one fallback `<img>` that carries intrinsic `width` and `height`, and it SHALL NOT emit a malformed image URL.

#### Scenario: Hero renders balanced picture markup

- **WHEN** the hero-image section renders with an image setting configured
- **THEN** the output contains one balanced `<picture>` element and one fallback `<img>` element
- **AND** `shopify theme check` reports no `LiquidHTMLSyntaxError` for the section

#### Scenario: Fallback image URL is well-formed

- **WHEN** the fallback `<img>` is emitted
- **THEN** its `src` attribute contains exactly one image URL with no trailing width descriptor

### Requirement: PDP collection breadcrumbs

The product buy section SHALL render a link to each collection the product belongs to, excluding the automatic `All` collection.

#### Scenario: Product belongs to collections

- **WHEN** a product belongs to one or more collections other than `All`
- **THEN** the buy section renders an `<a>` element linking to each such collection's URL

#### Scenario: Product has no qualifying collections

- **WHEN** a product belongs only to the `All` collection
- **THEN** the buy section renders no collection breadcrumb links

### Requirement: Product card image intrinsic dimensions

Product card images SHALL declare intrinsic `width` and `height` attributes so the browser can reserve layout space.

#### Scenario: First slide image has dimensions

- **WHEN** a product card renders its first gallery slide
- **THEN** the `<img>` includes `width` and `height` attributes
- **AND** `shopify theme check` reports no `ImgWidthAndHeight` offense for the snippet

### Requirement: Look resolution via request parameters

Look resolution SHALL be derived from request query parameters and SHALL NOT parse the `content_for_header` variable.

#### Scenario: Look parameter present

- **WHEN** a request URL includes a `look` query parameter
- **THEN** the look template resolves the requested look using `request.params.look`

#### Scenario: No content_for_header parsing

- **WHEN** templates and sections resolve request context
- **THEN** they do not capture `content_for_header`
- **AND** `shopify theme check` reports no `ContentForHeaderModification` offense
