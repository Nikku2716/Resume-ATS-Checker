# Design System: Buy Me a Coffee (Cream-Paper Café Scrapbook)

## Aesthetic & Atmospheric Foundation
Buy Me a Coffee operates on a warm, generous canvas — a **cream paper background (`#faf8f0`)** that softens the entire experience like sunlight through a café window. The interface is overwhelmingly monochromatic with black text at heroic sizes (64–96px display), reserving color for two highly intentional roles:
1. **Marigold Yellow (`#ffdd00`)**: The bright, sunny primary call-to-action color for creator/user signup and primary evaluation execution.
2. **Burnt Terracotta (`#d8573f`)**: Supporter-facing payment actions, secondary emphasis, and focused/active selection tabs.

Cards float above the cream canvas with generous **24–40px radii** and a soft **three-layer shadow stack** that feels like physical paper resting on a wooden café table.

---

## 1. Color Matrix & Roles

| Role | Color Name | Hex Code | Purpose |
|:---|:---|:---|:---|
| **Canvas** | Cream Paper | `#faf8f0` | Page canvas, section backgrounds — warm off-white foundation |
| **Surface** | Card White | `#ffffff` | Floating card surfaces, modal containers, workbench panels |
| **Border / Divider** | Hairline Gray | `#e5e7eb` | Universal 1px hairline border across cards, inputs, and dividers |
| **Accent Border** | Blush Border | `#f5d5cf` | Warm border accent for notification chips and active indicators |
| **Headline Text** | Ink Black | `#000000` | Display headlines, bold titles, filled icon strokes |
| **Body Text** | Charcoal | `#222222` | Body paragraphs and comfortable reading copy |
| **Muted Meta** | Fog Gray | `#717171` | Helper captions, word counts, timestamps, small-caps section labels |
| **Primary CTA** | Marigold | `#ffdd00` | Primary action button (`Start Evaluation`, `Run Diagnostic`) |
| **Highlight Wash** | Buttercup | `#f7d046` | Soft emphasis behind key highlights and decorative tags |
| **Secondary Accent**| Terracotta | `#d8573f` | Supporter actions, active filter pill selections, warm alerts |
| **Trust Signal** | Trust Green | `#22c55e` | 5-star rating header, verified checks, passing indicators |

---

## 2. Typography Scale (Circular / Plus Jakarta Sans)

### Font Family
- **Primary / Display**: `Plus Jakarta Sans`, `Circular`, system-ui, -apple-system, sans-serif
- **Code / Mono Data**: `JetBrains Mono`, `ui-monospace`, monospace

### Typographic Scale
- **Display Hero**: 64px–96px / weight **700 (Bold)** / line-height `1.0` / letter-spacing `-2.7px` to `-4.0px`
- **Heading Large**: 36px–40px / weight **700 (Bold)** / line-height `1.2` / letter-spacing `-1.2px`
- **Heading Medium**: 24px–30px / weight **700 (Bold)** / line-height `1.25` / letter-spacing `-0.6px`
- **Subheading**: 18px–20px / weight **500 (Medium)** / line-height `1.3` / letter-spacing `-0.4px`
- **Body Large**: 16px / weight **400 (Regular)** / line-height `1.5` / letter-spacing `-0.34px`
- **Body Regular**: 14px / weight **400 (Regular)** / line-height `1.5`
- **Caption / Meta**: 12px / weight **400 (Regular)** / line-height `1.4`
- **Small-Caps Section Label**: 12px / weight **700 (Bold)** / `0.125em` tracking (1.5px letter-spacing) / `uppercase`

---

## 3. Border Radii & Geometry Rules

| Component | Radius | Tailwind Class |
|:---|:---|:---|
| **Buttons & Pill Tags** | `9999px` | `rounded-full` |
| **Pill Inputs & Search** | `9999px` | `rounded-full` |
| **Floating Cards** | `24px` | `rounded-[24px]` |
| **Modal / Workbench Decks**| `32px` | `rounded-[32px]` |
| **Hero Containers** | `40px` | `rounded-[40px]` |
| **Small Elements & Tiles**| `8px`–`12px`| `rounded-[8px]` / `rounded-[12px]` |

---

## 4. Elevation & Shadow Philosophy

All elevated elements use the signature **three-layer black-alpha stack** that mimics paper resting on a café table:
```css
box-shadow: 0 0 2px rgba(0, 0, 0, 0.15), 
            0 8px 40px rgba(0, 0, 0, 0.04), 
            0 2px 5px rgba(0, 0, 0, 0.05);
```

No sharp drops or colored neon glows are permitted.

---

## 5. Key Signatures & Components

1. **5-Star Trust Row**: Five `#22c55e` stars centered above the hero headline followed by conversational trust copy.
2. **Marigold Pill CTA (`.btn-marigold`)**: `#ffdd00` background with `#000000` text, `rounded-full`, 12px 24px padding, font-bold 16px.
3. **Terracotta Pill Action (`.btn-terracotta`)**: `#d8573f` background with `#ffffff` text, `rounded-full`, 14px 28px padding.
4. **Ghost Outline Pill (`.btn-ghost`)**: Transparent background with 1px `#e5e7eb` border, `#000000` text, `rounded-full`.
5. **Floating Polaroid/Scrapbook Cards**: White surfaces (`#ffffff`) floating at gentle rotations (±2–3°) on desktop viewports.
6. **Small-Caps Section Labels**: Wide-spaced uppercase label (e.g. `DIAGNOSTICS`, `BENCHMARKS`, `SUPPORT`, `SECURITY`).
