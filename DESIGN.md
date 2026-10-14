---
"name": "companymgmt.ai"
"description": "Professional dark company workspace preview"
"colors":
  "background": "#000000"
  "sidebar": "#080808"
  "surface": "#0b0b0b"
  "raised": "#191919"
  "border": "#262626"
  "text": "#e5e5e5"
  "muted": "#999999"
  "accent": "#71f53b"
  "accent-wash": "#191919"
  "nav-text": "#bababa"
  "nav-hover": "#171717"
  "nav-hover-text": "#f4f4f4"
  "nav-active-text": "#e0e0e0"
  "login-button": "#71f53b"
  "login-button-hover": "#8cff60"
  "login-button-text": "#080808"
  "field-surface": "#131313"
  "field-border": "#323232"
  "field-text": "#e4e4e4"
  "field-focus": "#71f53b"
  "form-error": "#ff8b51"
"typography":
  "display":
    "fontFamily": '"Manrope Variable", sans-serif'
    "fontSize": "clamp(35px, 3.3vw, 54px)"
    "fontWeight": 600
    "lineHeight": 1.18
    "letterSpacing": "-0.035em"
  "headline":
    "fontFamily": '"Manrope Variable", sans-serif'
    "fontSize": "30px"
    "fontWeight": 600
    "letterSpacing": "-0.03em"
  "title":
    "fontFamily": '"Manrope Variable", sans-serif'
    "fontSize": "26px"
    "fontWeight": 650
    "lineHeight": 1.5
    "letterSpacing": "-0.025em"
  "login-title":
    "fontFamily": '"Manrope Variable", sans-serif'
    "fontSize": "28px"
    "fontWeight": 650
    "letterSpacing": "-0.03em"
  "body":
    "fontFamily": '"Manrope Variable", sans-serif'
    "fontSize": "14px"
  "navigation":
    "fontFamily": '"Manrope Variable", sans-serif'
    "fontSize": "14px"
    "fontWeight": 500
    "lineHeight": "20px"
  "label":
    "fontFamily": '"Manrope Variable", sans-serif'
    "fontSize": "12px"
    "fontWeight": 550
  "small":
    "fontFamily": '"Manrope Variable", sans-serif'
    "fontSize": "11px"
  "group-label":
    "fontFamily": '"Manrope Variable", sans-serif'
    "fontSize": "12px"
    "fontWeight": 500
    "letterSpacing": "0"
"rounded":
  "badge": "4px"
  "status": "6px"
  "quiet-control": "7px"
  "control": "8px"
  "workspace": "9px"
  "brand": "10px"
  "panel": "12px"
  "dialog": "14px"
  "placeholder-icon": "22px"
  "avatar": "50%"
"spacing":
  "compact": "8px"
  "icon-gap": "10px"
  "control": "12px"
  "field": "14px"
  "content": "18px"
  "section": "20px"
  "dialog": "24px"
  "page-inline": "40px"
"components":
  "button-primary":
    "backgroundColor": "{colors.login-button}"
    "textColor": "{colors.login-button-text}"
    "rounded": "999px"
    "padding": "15px"
    "width": "100%"
  "button-primary-hover":
    "backgroundColor": "{colors.login-button-hover}"
  "icon-button":
    "textColor": "{colors.muted}"
    "rounded": "{rounded.control}"
    "width": "36px"
    "height": "36px"
  "icon-button-hover":
    "backgroundColor": "{colors.raised}"
    "textColor": "{colors.text}"
  "nav-item":
    "textColor": "{colors.nav-text}"
    "typography": "{typography.navigation}"
    "rounded": "{rounded.control}"
    "padding": "11px 12px"
  "nav-item-active":
    "backgroundColor": "{colors.accent-wash}"
    "textColor": "{colors.nav-active-text}"
  "nav-item-hover":
    "backgroundColor": "{colors.nav-hover}"
    "textColor": "{colors.nav-hover-text}"
  "input":
    "backgroundColor": "{colors.field-surface}"
    "textColor": "{colors.field-text}"
    "rounded": "{rounded.control}"
    "padding": "0 14px"
    "height": "48px"
  "status-badge":
    "rounded": "{rounded.status}"
    "padding": "5px 8px"
  "popover":
    "backgroundColor": "{colors.nav-hover}"
    "rounded": "{rounded.panel}"
    "padding": "18px"
---

# Design System: companymgmt.ai

## Overview

**Creative North Star: "The Dark Workspace"**

The current interface uses the user-requested professional dark direction: charcoal surfaces, a persistent workspace frame, and restrained lime-green highlights. This record replaces the previous light directory direction and describes the implemented login and workspace shell.

Compact navigation surrounds quiet placeholder destinations. Tonal layering separates the sidebar, topbar, content, and overlays, while self-hosted Manrope and Lucide outline icons provide a consistent visual language. The login's decorative workspace illustration is built with CSS rather than a bespoke image asset.

**Key Characteristics:**

- Charcoal surfaces with lime-green accents.
- Compact sidebar and topbar navigation.
- Self-hosted Manrope and outline icons.
- Explicit demo sign-in and placeholder destinations.
- Responsive drawer navigation and visible focus.

## Colors

The frontmatter records the operative CSS palette; the workspace uses the :root custom properties rather than the legacy Tailwind aliases.

### Primary

- **Lime-green** (`accent`): focus outlines and brand emphasis.
- **Charcoal Selection** (`accent-wash`): selected navigation background.
- **Selected Lime-green Text** (`nav-active-text`): active destination text.
- **Login Lime-green** (`login-button`, `login-button-hover`, `login-button-text`): the sign-in button and its hover treatment.

### Neutral

- **Charcoal Canvas** (`background`): main workspace background.
- **Sidebar Charcoal** (`sidebar`): persistent sidebar and mobile drawer.
- **Surface and Raised Charcoal** (`surface`, `raised`): controls and hover layers.
- **Divider** (`border`): principal shell boundaries.
- **Soft White and Muted Lime-green Grey** (`text`, `muted`): primary and supporting text.
- **Navigation Neutrals** (`nav-text`, `nav-hover`, `nav-hover-text`): inactive links and hover state.
- **Field Neutrals** (`field-surface`, `field-border`, `field-text`): login field wrapper and entered text.

Field focus uses `field-focus`; login errors use `form-error`. Neutral gray shades support captions, artwork, and overlay borders. The AI badge uses a subdued green surface with light green text.

## Typography

**Font:** self-hosted Manrope Variable with a sans-serif fallback. Lucide outline SVGs provide the icon vocabulary.

The login story uses the responsive display role; its form heading uses login-title. Destination titles use title, while the centered Coming soon heading uses headline. Body defaults to 14px; navigation is 14px with a 20px line height, and supporting shell text is generally 10–11px. Sidebar group labels use sentence case with normal tracking.

At 520px and below, destination titles reduce to 19px and Coming soon headings to 27px. Login fields grow from 13px to 16px at 900px and below. Preserve the deliberate hierarchy between readable field text and compact navigation metadata.

## Layout

The workspace occupies 100dvh. Its desktop sidebar is 306px wide, reduces to 284px at 1200px and below, and collapses to a 76px icon rail. The sidebar navigation and main content scroll independently. The topbar is 70px tall, with breadcrumbs on the left and navigation search, notifications, and account controls on the right. Main content uses 36px vertical and 40px horizontal padding on wide screens.

At 900px and below, the desktop sidebar becomes a native-dialog drawer (310px wide, capped at viewport width minus 40px), the topbar becomes 64px tall, and icon controls and navigation links have 44px minimum touch dimensions. At 520px and below, page headings stack and secondary topbar details disappear. Preserve destination names in the current breadcrumb and active navigation state.

Login uses equal story and form columns on desktop. The form has a 360px maximum width; at 900px and below, the story hides and a single login panel exposes the mobile brand and a 380px maximum form width. Destination placeholders center within the available page, with a 400px minimum content height, reducing to 360px at the narrow breakpoint.

## Elevation & Depth

Use tonal layering and thin borders for the persistent shell. Shadows belong to floating overlays: popovers use a compact shadow, while dialogs use a deeper shadow with a dark backdrop. Login fields use a small focus halo; command search marks focused input with an inset underline.

Sidebar resizing transitions over 0.18s with ease. Navigation background and text change over 0.15s. Reduced-motion preference disables transitions and animation.

## Shapes

Most controls and navigation items use the control radius. Workspace chips use workspace; popovers and login artwork use panel; dialogs use dialog. The placeholder icon uses the larger placeholder-icon radius and a small offset arrow badge. Account avatars remain circular. Mobile drawer edges are square. Borders stay thin rather than creating heavy outlined cards.

## Components

### Buttons

Sign in is a full-width lime-green button with dark text, 13px type at weight 750, and a lighter hover fill. Icon buttons are transparent at rest and use Raised Charcoal on hover. Preserve descriptive accessible names on icon-only controls. Disabled controls reduce opacity and use the waiting cursor.

### Inputs / Fields

Login uses persistent labels above 48px-high field wrappers with inline icons. The password visibility button exposes its pressed state and a Show or Hide password label. Field focus changes the border and adds a 3px halo; other focus-visible elements receive a 2px accent outline with a 4px offset. Login errors use an alert region.

### Navigation

Sidebar links combine 18–19px outline icons with compact text. Active links use Lime-green Wash, selected text, and aria-current. The systems group is expandable; collapsed desktop navigation retains names through accessible labels and title text. Mobile navigation uses a dialog drawer with explicit open and close controls.

The topbar provides current-location breadcrumbs, navigation search (Ctrl or Command K), notification and account details popovers, and sign out. Search filters destination names; it does not search company data. A skip link provides access to main content. Native dialogs handle modal surfaces, and Escape dismisses open overlays.

### Status and Placeholder

Each destination has a small Coming soon status badge and a centered icon, heading, supporting sentence, short rule, and destination caption. AI Agent and all ten systems share this treatment. Do not imply that their business features are implemented.

### Overlays and Demo Context

Account and notification panels are anchored popovers. Navigation search and the workspace guide are dialogs. The login demo note, sidebar environment label, account panel, and footer keep the preview status visible. Sign-in state is a tab-scoped demo flag, not real authentication.

## Do's and Don'ts

### Do:

- **Do** use the current black and neutral gray with lime-green actions palette with self-hosted Manrope.
- **Do** keep active navigation, destination headings, and breadcrumbs consistent.
- **Do** preserve accessible names, persistent field labels, visible focus, and reduced-motion support.
- **Do** retain drawer navigation and 44px mobile touch controls.
- **Do** label the demo session and keep every destination explicitly Coming soon.

### Don't:

- **Don't** restore the previous light directory styling as the current design authority.
- **Don't** imply demo sign-in protects API data or provides production authentication.
- **Don't** add invented data, operational metrics, or working system features to placeholder pages.
- **Don't** replace the compact shell with unrelated ornamental cards or icon styles.

## Reference theme

Use solid black page backgrounds without imagery or texture. Surfaces are near-black, borders are subtle neutral gray, navigation selection is charcoal, and primary actions use bright lime green (#71f53b) with dark text and pill corners. Preserve all existing pages, content, routes, and interactions. Keep self-hosted Manrope and the existing Lucide icons.
