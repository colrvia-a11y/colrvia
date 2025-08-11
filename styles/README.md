# Styles

This directory contains the project's global styles and design tokens.

## Tokens

`tokens.css` is the canonical source for design tokens. Tokens are grouped under a
single `:root` block and cover:

- **Brand** – primary and accent hues
- **Neutrals** – gray scale used to build semantic colors
- **Semantic colors** – backgrounds, foregrounds and status colors
- **Typography** – font stacks and text sizes
- **Spacing** – 4pt-based spacing scale
- **Radii & Shadows** – shape and elevation primitives
- **Motion** – easing curves and duration presets

Each token is annotated in `tokens.css` with a comment describing its intended
usage, providing designers and developers with a shared source of truth.

Dark mode overrides are defined within a `prefers-color-scheme: dark` media
query.

