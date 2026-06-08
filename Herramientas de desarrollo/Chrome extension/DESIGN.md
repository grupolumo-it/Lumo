---
name: Lumo Professional Marketplace
colors:
  surface: '#faf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#faf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e8'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#454652'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#757683'
  outline-variant: '#c5c5d3'
  surface-tint: '#4458af'
  primary: '#000d46'
  on-primary: '#ffffff'
  primary-container: '#001d77'
  on-primary-container: '#778ae5'
  inverse-primary: '#b9c3ff'
  secondary: '#575c80'
  on-secondary: '#ffffff'
  secondary-container: '#d0d4ff'
  on-secondary-container: '#565b7f'
  tertiary: '#000e44'
  on-tertiary: '#ffffff'
  tertiary-container: '#122362'
  on-tertiary-container: '#7e8cd1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b9c3ff'
  on-primary-fixed: '#001256'
  on-primary-fixed-variant: '#2b3f95'
  secondary-fixed: '#dee0ff'
  secondary-fixed-dim: '#bfc4ee'
  on-secondary-fixed: '#131939'
  on-secondary-fixed-variant: '#3f4467'
  tertiary-fixed: '#dde1ff'
  tertiary-fixed-dim: '#b8c4ff'
  on-tertiary-fixed: '#001354'
  on-tertiary-fixed-variant: '#334282'
  background: '#faf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
typography:
  display-lg:
    fontFamily: Comfortaa
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Comfortaa
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Comfortaa
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Comfortaa
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Comfortaa
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Comfortaa
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Comfortaa
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Comfortaa
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Comfortaa
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is engineered to project stability, accessibility, and a modern edge for a high-scale e-commerce ecosystem. The brand personality is **Professional, Approachable, and Intuitive**, catering to a discerning audience that values both technical reliability and a friendly, streamlined user experience.

The visual style follows a **Corporate / Modern** aesthetic with an emphasis on **Soft Geometry**. The interface utilizes generous whitespace to reduce cognitive load, complemented by rounded shapes that soften the professional tone. The emotional response should be one of confidence and ease—users should feel the platform is robust, secure, and designed with a human-centric touch.

## Colors

The palette is anchored by a deep **Midnight Blue** (#001D77), used for navigation, headers, and primary branding elements to establish authority and trust. This is supported by **Slate Blue** (#60658A) and a darker tertiary navy (#021657) to create a sophisticated, monochromatic-leaning environment.

The background uses a clean neutral scale, with secondary grey tones (#838383) used for borders and disabled states. Text is rendered in high-contrast dark tones to ensure maximum legibility and AAA accessibility compliance, moving away from high-contrast accent colors like orange to focus on tonal depth.

## Typography

This design system utilizes **Comfortaa** for its distinctive, rounded, and approachable nature. This typeface bridges the gap between technical utilitarianism and a modern, friendly interface.

Headlines use a heavier weight to create a sense of presence, while the typeface's geometric curves provide a modern aesthetic. Body text is optimized for long-form reading with a standard 150% line height. Labels and metadata use a slightly heavier weight to ensure clear differentiation within the user interface.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop, centered within a 1280px container to maintain visual focus. On mobile devices, the system shifts to a **Fluid Grid** with 16px side margins.

A strict **8px linear scale** governs all spatial relationships. 
- **Desktop:** 12-column grid, 24px gutters.
- **Tablet (768px - 1024px):** 8-column grid, 20px gutters.
- **Mobile (< 768px):** 4-column grid, 16px gutters.

Vertical rhythm is maintained by using the `md` (24px) spacing unit for most component groupings, while `lg` (48px) is used to separate distinct page sections.

## Elevation & Depth

Visual hierarchy in this design system is achieved through **Tonal Layers** and **Low-Contrast Outlines**. 

- **Surface 0 (Background):** #F9F9FB.
- **Surface 1 (Cards/Main Content):** Pure white (#FFFFFF) with a 1px border (#838383 at 20% opacity). No shadow.
- **Surface 2 (Interactive/Floating):** Pure white (#FFFFFF) with a soft, ambient shadow: `0px 8px 24px rgba(0, 29, 119, 0.06)`.

Shadows are used sparingly, reserved only for elements that require immediate user attention or appear to float above the primary surface (e.g., dropdowns, modals, or the active state of a product card).

## Shapes

The shape language is **Pill-shaped**, utilizing a 1rem (16px) base radius. This creates an ultra-modern and approachable look that complements the rounded nature of the typography.

- **Standard Elements (Inputs, Buttons, Cards):** 16px (rounded-md)
- **Large Elements (Modals, Feature Sections):** 32px (rounded-lg)
- **Small Detail Elements (Badges, Tags):** 8px or fully circular for status indicators.

Consistent corner radii across all components reinforce the modern, friendly architectural integrity of the marketplace.

## Components

### Buttons
Primary actions use the **Midnight Blue** with white text. Secondary actions use the **Slate Blue** or a transparent background with a Midnight Blue outline. Buttons feature 16px rounded corners (pill-shaped) and a minimum height of 48px for touch targets.

### Input Fields
Fields feature a 1px border (#838383) and a soft 16px radius. The focus state uses a 2px Midnight Blue border. Error states utilize a soft red background tint with a 1px solid red border.

### Product Cards
Cards are the core of the ecosystem. They feature a white background, a light border, and no shadow in their default state. Upon hover, they transition to a Surface 2 elevation (soft blue-tinted shadow) and the product title highlights in the primary brand color. Cards utilize the system-wide 16px radius.

### Lists & Navigation
Navigation links use Midnight Blue in a semi-bold weight. Breadcrumbs and footer links use the `body-sm` typography in a muted grey tone.

### Chips & Badges
Used for categories and status (e.g., "In Stock"). Chips have a light slate background with Midnight Blue text and a pill-shaped radius. Status badges use low-opacity versions of the status colors (Success/Error) with high-contrast text labels.