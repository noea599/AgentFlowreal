# Brand Assets — Disc Consult
> Single source for all Disc Consult brand files. Everything lives here.
> For full brand specs (colors, typography, voice), see `context/brand-guide.md`.

---

## All Files

| File | Type | Size | Use When |
|------|------|------|----------|
| `disc-logo-white.svg` | Vector | 12 KB | **Preferred** — dark/gradient backgrounds. Scalable, no quality loss |
| `disc-logo-white.png` | Raster | 304 KB | Dark/gradient backgrounds — full-res master. Do not embed directly in docs |
| `disc-logo-white-500.png` | Raster | 23 KB | Dark/gradient backgrounds — **embed in .docx/.pdf** |
| `disc-logo-dark.svg` | Vector | 11 KB | **Preferred** — white/light backgrounds. Scalable, no quality loss |
| `disc-logo-dark.png` | Raster | 148 KB | White/light backgrounds — full-res master. Do not embed directly in docs |
| `disc-logo-dark-500.png` | Raster | 21 KB | White/light backgrounds — **embed in .docx/.pdf** |
| `noel-headshot.webp` | Photo | 15 KB | Bio sections, LinkedIn, speaker profiles |
| `noel-business-card.webp` | E-business card | 6 KB | Embed at end of proposals, reports, or any doc where client should be able to reach Noel directly |
| `Noel signature.pdf` | E-signature | 1 page | Signature blocks in proposals, partnership agreements, contracts, and any document requiring Noel's signature |
| `disc-consult-qr.png` | QR code | — | Add when ready — links to website or Calendly |

---

## Which Logo to Use

| Context | File to use |
|---------|------------|
| Cover page (Blue/gradient background) | `disc-logo-white-500.png` |
| Running header (white page) | `disc-logo-dark-500.png` |
| Email signature | `disc-logo-dark-500.png` |
| Signing / last page block | `disc-logo-dark-500.png` |
| Print / PDF (any) | `.svg` variant (SVG scales without quality loss) |
| PowerPoint dark slide | `disc-logo-white-500.png` |
| PowerPoint light slide | `disc-logo-dark-500.png` |
| Web / LinkedIn banner | `disc-logo-white.svg` or `disc-logo-dark.svg` |

**Rule for scripts:** Always embed the `*-500.png` files. Never embed the full-res `.png` originals — they inflate file sizes by 4–8×.

---

## Logo Usage Rules

- Never stretch, rotate, or recolor the logo
- Never place the white mode logo on a white/light background (invisible)
- Never place the dark mode logo on a dark/gradient background (invisible)
- Maintain clear space around the logo equal to the height of the "D" lettermark
- Minimum display size: 0.75 inches / 72px

---

## E-Business Card Usage

`noel-business-card.webp` — embed this when the document warrants easy contact access.

**When to include:**
- Proposals (last page or after signature block)
- Reports delivered to clients
- Any document where a prospect or client needs to reach Noel directly

**When to skip:**
- Internal documents
- Emails (signature block is sufficient)
- Cover decks / pitch slides (logo + contact details are enough)

**How to call for it:** When generating a document, say: *"include the business card"* and the script will embed `noel-business-card.webp` at the appropriate position.

---

## E-Signature Usage

`Noel signature.pdf` is Noel's official e-signature. Insert it into any document that requires a personal signature.

**When to include:**
- Proposals with a signature block (partnership agreements, service agreements)
- Contracts and letters of engagement
- Any document where a formal signature is expected

**When to skip:**
- Emails (name sign-off is sufficient)
- Internal documents
- Informational deliverables (reports, briefs, research)

**How to use:** When generating a document that needs a signature, extract the signature image from the PDF and place it in the designated signature line or block. Reference path: `assets/brand/Noel signature.pdf`.

---

## Adding the QR Code

When ready:
1. Generate your QR code linking to your Calendly or website
2. Save it here as `disc-consult-qr.png` at 500×500px minimum
3. The proposal and business card scripts will auto-detect and embed it

---

## Regenerating Optimized Logos

Run this after any logo update to refresh the `*-500.png` embed files:

```bash
python3 -c "
from PIL import Image
import os
for mode in ['white', 'dark']:
    src = f'assets/brand/disc-logo-{mode}.png'
    dst = f'assets/brand/disc-logo-{mode}-500.png'
    Image.open(src).resize((500,500), Image.LANCZOS).save(dst, optimize=True)
    print(f'{mode}: {os.path.getsize(dst)/1024:.1f} KB')
"
```

---

## Color Swatches (Quick Reference)

| Name       | Hex       | Usage |
|------------|-----------|-------|
| Blue       | `#5281EC` | Primary — headings, links, CTA buttons |
| Purple     | `#9F71C5` | Secondary — highlights, dividers |
| Pink       | `#D96570` | Tertiary — callouts, emphasis |
| Light Grey | `#D4D4D4` | Borders, backgrounds, dividers |
| Grey       | `#B8B8B8` | Secondary text, captions |
| Dark Grey  | `#444746` | Body text |
| Black      | `#080808` | High-contrast elements |
| Gradient   | `#5281EC → #D96570` | Hero sections, cover pages, banners |
