# DESIGN.md — Grace of the Day Redesign Plan

## 1. Executive Summary & Vision
**Grace of the Day** (`https://graceoftheday.com/`) serves as a daily spiritual refuge offering Catholic Scripture, spiritual reflections, daily prayers, and actionable daily virtues. 

The goal of this redesign is to transition the site from a heavy, 3D graphics-dependent experience (removing Three.js) into a modern, serene, and elegant single-page application. The new layout will strictly fit within **`100vh` viewport height**, eliminating full-page window scrolling and focusing entirely on an immersive, glassmorphism-inspired design.

---

## 2. Core Architectural Principles & Guidelines

### 2.1 Single Viewport Constraint (`100vh`)
* **Zero Window Scroll:** The `html` and `body` tags will have `height: 100vh; overflow: hidden;`.
* **Internal Scrolling:** Any content exceeding container dimensions (e.g., long spiritual reflections or prayer texts) will use internal, sleekly styled SCSS custom scrollbars inside glass cards.

### 2.2 Aesthetic & Visual Styling
* **Glassmorphism (Frosted Glass):** Use multi-layered backdrop filters (`backdrop-filter: blur(16px) saturate(180%)`) with semi-transparent light/dark borders and subtle shadows to evoke sacred, architectural translucency.
* **Pure SCSS (No Tailwind, No BEM):** Clean, modular SCSS structure using standard nesting, variables, mixins, and semantic class names.
* **No Three.js / Heavy 3D Libraries:** Replace 3D canvas rendering with lightweight, performant CSS radial gradients, soft glowing ambient spheres, and SVG-based sacred imagery.

### 2.3 Typography & Sacred Tone
* **Primary Serif (Scripture & Headings):** `Cinzel`, `Cormorant Garamond`, or `Playfair Display` for reverence, nobility, and readability.
* **Secondary Sans-Serif (UI Elements & Actions):** `Inter` or `Plus Jakarta Sans` for modern readability and crisp navigation.

---

## 3. UI/UX Layout & Information Architecture

The viewport is organized into a balanced, 3-column / asymmetric dashboard grid optimized for `100vh`:

```
+-----------------------------------------------------------------------------------+
|  HEADER: [Logo / Title: Grace of the Day]     [Liturgical Date & Feast Day] [Nav]  |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  LEFT PANEL (25%)        |  CENTER PANEL (50%) - PRIMARY FOCUS  |  RIGHT PANEL (25%) |
|                          |                                      |                    |
|  • Liturgical Context    |  • Featured Daily Scripture Quote   |  • Daily Prayer    |
|    (Season, Color, Year) |    (Prominent typography & card)     |  • Faith in Action |
|  • Daily Virtue          |  • Spiritual Reflection             |  • Share & Save    |
|  • Saint / Feast Info    |    (Scrollable internal container)   |    Action Bar      |
|                          |                                      |                    |
+-----------------------------------------------------------------------------------+
|  FOOTER: "Ad Maiorem Dei Gloriam" — AMDG  |  © Grace of the Day                    |
+-----------------------------------------------------------------------------------+
```

---

## 4. Design System & SCSS Architecture

### 4.1 SCSS Variable Definition (`_variables.scss`)

```scss
// Color Palette (Catholic Sacred Elegance)
$color-bg-gradient-start: #0f172a; // Deep Marian Navy
$color-bg-gradient-end: #1e1b4b;   // Deep Sacred Purple
$color-glass-bg: rgba(255, 255, 255, 0.07);
$color-glass-border: rgba(255, 255, 255, 0.15);
$color-glass-glow: rgba(212, 175, 55, 0.25); // Divine Gold Tint

$color-text-primary: #f8fafc;
$color-text-secondary: #cbd5e1;
$color-accent-gold: #f59e0b;
$color-accent-gold-light: #fef3c7;

// Typography
$font-family-serif: 'Cormorant Garamond', 'Cinzel', Georgia, serif;
$font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

// Layout & Spacing
$header-height: 70px;
$footer-height: 40px;
$border-radius-card: 20px;
```

### 4.2 Frosted Glass Mixin (`_mixins.scss`)

```scss
@mixin frosted-glass($bg-opacity: 0.08, $blur: 16px, $border-opacity: 0.15) {
  background: rgba(255, 255, 255, $bg-opacity);
  backdrop-filter: blur($blur) saturate(180%);
  -webkit-backdrop-filter: blur($blur) saturate(180%);
  border: 1px solid rgba(255, 255, 255, $border-opacity);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

@mixin custom-scrollbar {
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    &:hover {
      background: $color-accent-gold;
    }
  }
}
```

### 4.3 Layout & Structural Styles (`main.scss`)

```scss
@import 'variables';
@import 'mixins';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: $font-family-sans;
  background: linear-gradient(135deg, $color-bg-gradient-start, $color-bg-gradient-end);
  color: $color-text-primary;
}

// Background Ambient Glow Effects (Replacing Three.js)
.ambient-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(0, 0, 0, 0) 70%);
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 0;
}

.app-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1.5rem 2rem;
}

// Header
header {
  height: $header-height;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  border-radius: 16px;
  @include frosted-glass(0.05, 12px, 0.1);
  margin-bottom: 1rem;

  .brand {
    h1 {
      font-family: $font-family-serif;
      font-size: 1.6rem;
      color: $color-accent-gold-light;
      letter-spacing: 1px;
    }
  }

  .date-badge {
    font-size: 0.9rem;
    color: $color-text-secondary;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.4rem 1rem;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

// Main Viewport Content Grid
main.dashboard {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 1.25rem;
  height: calc(100vh - #{$header-height} - #{$footer-height} - 4rem);
  min-height: 0; // Essential for flex/grid child overflow constraint

  .panel {
    @include frosted-glass;
    border-radius: $border-radius-card;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    // Center Panel - Scripture Focal Point
    &.primary-focus {
      border: 1px solid rgba(245, 158, 11, 0.3); // Subtle Gold Highlight
      box-shadow: 0 10px 40px rgba(245, 158, 11, 0.1);

      .scripture-card {
        text-align: center;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

        blockquote {
          font-family: $font-family-serif;
          font-size: 1.45rem;
          line-height: 1.6;
          color: #ffffff;
          font-style: italic;
          margin-bottom: 0.75rem;
        }

        cite {
          font-size: 0.95rem;
          color: $color-accent-gold;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
      }

      .reflection-container {
        flex: 1;
        overflow-y: auto;
        margin-top: 1.25rem;
        padding-right: 0.5rem;
        @include custom-scrollbar;

        h3 {
          font-family: $font-family-serif;
          font-size: 1.2rem;
          color: $color-accent-gold-light;
          margin-bottom: 0.75rem;
        }

        p {
          font-size: 0.98rem;
          line-height: 1.65;
          color: $color-text-secondary;
          margin-bottom: 1rem;
        }
      }
    }

    // Side Panels Content Controls
    &.side-panel {
      .panel-section {
        margin-bottom: 1.5rem;

        h4 {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: $color-accent-gold;
          margin-bottom: 0.5rem;
        }

        p {
          font-size: 0.92rem;
          color: $color-text-secondary;
          line-height: 1.5;
        }
      }

      .scrollable-content {
        flex: 1;
        overflow-y: auto;
        @include custom-scrollbar;
      }
    }
  }
}

// Footer
footer {
  height: $footer-height;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  padding: 0 1rem;

  .motto {
    font-family: $font-family-serif;
    font-style: italic;
    color: $color-accent-gold;
  }
}
```

---

## 5. Implementation & Migration Steps

1. **Remove Three.js Dependencies:** Strip Three.js bundle and canvas DOM elements to significantly boost page load performance and reduce battery usage.
2. **Setup SCSS Build Pipeline:** Implement standard SCSS compilation (via Dart Sass / Vite) without Tailwind or BEM framework overhead.
3. **Assemble HTML Structure:** Inject semantic HTML structure mapped to the 3-panel single-page viewport.
4. **Apply Glassmorphism & Custom Scrollbars:** Enable internal scrolling only within `.reflection-container` and `.scrollable-content`.
5. **Verify Viewport Responsiveness:** Ensure media queries adjust column counts on smaller screens (e.g., stacked tabs within `100vh` on mobile devices).