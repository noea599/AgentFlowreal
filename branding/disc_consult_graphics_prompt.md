# Disc Consult — Claude Code Graphics Generation Prompt
## Copy and paste this ENTIRE block at the start of any graphics request in Claude Code.

---

## GRAPHICS GENERATION SYSTEM RULES

You are generating a branded social media graphic for **Disc Consult**. Follow every rule below without deviation.

---

### TECH STACK — NON-NEGOTIABLE

**Always generate graphics as HTML → PNG via Playwright/Puppeteer screenshot.**

Do NOT use:
- Python Pillow / ImageDraw (blurry text, poor anti-aliasing)
- matplotlib (chart tool, not a design tool)
- Raw SVG saved as PNG (font rendering inconsistency)

**Why HTML → screenshot?** The browser renders Outfit font with full sub-pixel anti-aliasing, correct kerning, and exact color reproduction. This is the only method that matches professional design tool output.

**Workflow:**
1. Write the graphic as a self-contained `graphic.html` file
2. Use Playwright to screenshot it at **2x device pixel ratio** and **1080×1080px** (or the target size)
3. Save output as a high-quality PNG (`quality=100`, `full_page=False`)

```python
# Standard screenshot command — always use this exact config
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1080, "height": 1080}, device_scale_factor=2)
    page.goto(f"file://{html_path}")
    page.wait_for_load_state("networkidle")  # CRITICAL: waits for Google Fonts to load
    page.screenshot(path="output.png", full_page=False)
    browser.close()
```

> ⚠️ `wait_for_load_state("networkidle")` is mandatory. Without it, Outfit font does not load and the browser falls back to a generic sans-serif.

---

### TYPOGRAPHY — DISC CONSULT BRAND

Load Outfit from Google Fonts. Always include ALL three weights.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&display=swap" rel="stylesheet">
```

| Role              | Font             | CSS                                      |
|-------------------|------------------|------------------------------------------|
| Main headline     | Outfit Bold      | `font-family: 'Outfit'; font-weight: 700`|
| Subheading        | Outfit Medium    | `font-family: 'Outfit'; font-weight: 500`|
| Body / caption    | Outfit Regular   | `font-family: 'Outfit'; font-weight: 400`|

**Letter-spacing rules:**
- ALL-CAPS headlines: `letter-spacing: 0.04em`
- Subheadings: `letter-spacing: 0.01em`
- Body text: `letter-spacing: 0`

**Anti-aliasing (add to every text element):**
```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
text-rendering: optimizeLegibility;
```

---

### BRAND COLORS — EXACT HEX VALUES

```css
:root {
  --dc-blue:        #5281EC;   /* Primary — headlines, CTAs, key elements */
  --dc-purple:      #9F71C5;   /* Secondary — accents, dividers */
  --dc-pink:        #D96570;   /* Tertiary — callouts, emphasis */
  --dc-light-grey:  #D4D4D4;   /* Borders, subtle backgrounds */
  --dc-grey:        #B8B8B8;   /* Captions, metadata, secondary text */
  --dc-dark-grey:   #444746;   /* Body text on light backgrounds */
  --dc-black:       #080808;   /* High-contrast text */
  --dc-white:       #FFFFFF;   /* Text on dark backgrounds */

  /* Gradient — hero sections, banners, top bars */
  --dc-gradient: linear-gradient(90deg, #5281EC 0%, #9F71C5 50%, #D96570 100%);
}
```

**Background rule for dark-mode graphics:**
- Primary dark background: `#0D1117` (near-black, not pure black — prevents harsh bleed)
- Card/panel surfaces: `#161B22` (slightly lifted from background — creates depth)
- Border/divider lines: `rgba(255,255,255,0.08)` (subtle, not harsh)

---

### LAYOUT — DARK MODE GRAPHIC STANDARDS

```css
/* Base canvas */
body {
  width: 1080px;
  height: 1080px;
  margin: 0;
  padding: 60px;
  background: #0D1117;
  box-sizing: border-box;
  font-family: 'Outfit', sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}

/* Top gradient accent bar */
.top-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 5px;
  background: var(--dc-gradient);
}

/* Panel / card surface */
.card {
  background: #161B22;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 28px 32px;
}

/* Left accent bar on panels */
.card-blue   { border-left: 4px solid #5281EC; }
.card-purple { border-left: 4px solid #9F71C5; }
.card-pink   { border-left: 4px solid #D96570; }
```

---

### TEXT CONTRAST RULES

| Text Role         | Color          | Background     | Min Contrast |
|-------------------|----------------|----------------|--------------|
| Main headline     | `#FFFFFF`       | `#0D1117`      | 15:1 ✓       |
| Subheading        | `#5281EC`       | `#0D1117`      | 5.5:1 ✓      |
| Body text         | `#D4D4D4`       | `#161B22`      | 8:1 ✓        |
| Caption / meta    | `#B8B8B8`       | `#161B22`      | 5:1 ✓        |
| Accent label      | `#9F71C5`       | `#161B22`      | 4.5:1 ✓      |

> ❌ Never place grey text (`#B8B8B8` or darker) directly on `#0D1117`. Use `#D4D4D4` minimum for readable body copy.

---

### FONT SIZE SCALE (for 1080×1080px canvas)

| Role                | Size    | Weight |
|---------------------|---------|--------|
| Main hero headline  | 68–80px | 700    |
| Section title       | 40–48px | 700    |
| Subheading          | 24–28px | 500    |
| Body / description  | 20–22px | 400    |
| Caption / label     | 16–18px | 400    |
| Small meta text     | 14px    | 400    |

---

### WHAT TO AVOID

- ❌ `font-family: Arial, sans-serif` — always use Outfit
- ❌ `background: #000000` — use `#0D1117` for depth
- ❌ `color: #888888` on dark backgrounds — fails contrast
- ❌ Tight line-height below `1.3` — text becomes illegible
- ❌ Screenshot before fonts load — always use `wait_for_load_state("networkidle")`
- ❌ `device_scale_factor: 1` — always use `2` for retina-quality output

---

### LOGO PLACEMENT

- Top-left: `assets/brand/disc-logo-white-500.png` at `height: 36px`
- Maintain clear space: padding of at least `20px` around logo
- Never stretch or recolor
- Use white logo variant on all dark backgrounds

---

### QUICK CHECKLIST BEFORE SAVING OUTPUT

- [ ] Playwright screenshot at `device_scale_factor=2`
- [ ] `wait_for_load_state("networkidle")` called before screenshot
- [ ] Outfit font loaded from Google Fonts (all 3 weights)
- [ ] `-webkit-font-smoothing: antialiased` on body
- [ ] Background is `#0D1117`, not pure black
- [ ] All body text is `#D4D4D4` or brighter
- [ ] Top gradient bar present (`#5281EC → #9F71C5 → #D96570`)
- [ ] Output PNG is minimum 1080×1080px

---

*Disc Consult Brand System — Graphics Prompt v1.0*
