# Casebound Marketing Site

Public marketing site for [Casebound](https://casebound.co) — a library and reading tracker built for serious readers.

## Stack

- Astro 6 (static output)
- Tailwind CSS v4 (via PostCSS)
- TypeScript (strict)
- Self-hosted Lora font via @fontsource

## Development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run preview  # preview production build locally
```

## Deploy

Cloudflare Pages:

- Build command: `npm run build`
- Output directory: `dist/`
- No special environment variables required

## Structure

```
src/
├── styles/global.css         # Tailwind theme tokens, dark mode, base styles
├── layouts/
│   ├── BaseLayout.astro      # HTML shell (meta, fonts, analytics placeholder)
│   └── ProseLayout.astro     # Centered prose wrapper for /privacy, /terms
├── components/
│   ├── Header.astro          # Wordmark link (prose pages only)
│   ├── Footer.astro          # Shared footer
│   ├── Hero.astro            # Landing section 1
│   ├── Differentiator.astro  # Landing section 2
│   ├── FeatureCards.astro    # Landing section 3
│   ├── WhoItsFor.astro       # Landing section 4
│   ├── Pricing.astro         # Landing section 5
│   └── FAQ.astro             # Landing section 6
└── pages/
    ├── index.astro           # Landing page
    ├── privacy.astro         # Privacy policy
    ├── terms.astro           # Terms of service
    └── 404.astro             # 404 page
```
