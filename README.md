# Casebound Marketing Site

Public marketing site for [Casebound](https://casebound.co) — a library and
reading tracker built for serious readers.

## Stack

- Astro 6 (static output)
- Tailwind CSS v4 (via PostCSS)
- TypeScript (strict)
- Self-hosted Lora + Hanken Grotesk via `@fontsource`

## Development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run preview  # preview production build locally
npm run check    # astro check (types + a11y hints)
```

## Deploy

Cloudflare Pages:

- Build command: `npm run build`
- Output directory: `dist/`
- No environment variables required

## Two files to read before changing anything

- **`src/config/site.ts`** — launch state, store URLs, the waitlist endpoint,
  and the book-cover registry. Setting `LAUNCH.ios.live = true` is the entire
  launch-day change: both store badges, the CTA pill, the hero fine print, the
  FAQ answer and the structured data all read from it.
- **`CONTENT-CHANGES.md`** — every place the copy departs from the approved
  design, and why. Four of them are corrections to claims that contradict the
  shipping app.

Outstanding manual work is in **`TODO_FOR_DREW.md`**.

## Structure

```
src/
├── config/
│   ├── site.ts               # launch flags, store URLs, cover registry
│   └── faq.ts                # FAQ copy — shared with the FAQPage JSON-LD
├── styles/global.css         # theme tokens + section primitives (light only)
├── scripts/motion.ts         # reveals, count-ups, session timer, parallax
├── assets/
│   ├── covers/               # 8 book covers, bundled (see TODO: rights)
│   └── screenshots/          # 8 real app screenshots, build-optimized
├── layouts/
│   ├── BaseLayout.astro      # HTML shell: meta, OG, JSON-LD, analytics slot
│   └── ProseLayout.astro     # prose wrapper for the legal pages
├── components/
│   ├── Nav.astro             # fixed nav + mobile menu
│   ├── Hero.astro            # #top
│   ├── Formats.astro         # #formats
│   ├── Stats.astro           # #stats      — the one dark section
│   ├── Architecture.astro    # #architecture
│   ├── Randomizer.astro      # #randomizer — interactive
│   ├── Scan.astro            # #scan
│   ├── Themes.astro          # #themes     — interactive
│   ├── Screenshots.astro     # #screenshots
│   ├── WhoItsFor.astro       # #who
│   ├── Pricing.astro         # #pricing
│   ├── FAQ.astro             # #faq
│   ├── FinalCTA.astro        # #get        — waitlist form
│   ├── Footer.astro
│   ├── Header.astro          # wordmark only, prose pages
│   ├── Phone.astro           # mockup shell: bezel, scaling, role="img"
│   ├── Cover.astro           # cover image + color fallback
│   ├── StoreBadges.astro
│   └── Icon.astro            # inline SVG set
└── pages/
    ├── index.astro
    ├── privacy.astro
    ├── terms.astro
    ├── delete-account.astro  # required by both app stores — keep reachable
    └── 404.astro
```

## Conventions worth knowing

**The page is light-mode only.** The `prefers-color-scheme: dark` block was
removed deliberately. `#stats` and the final CTA are fixed dark bands whose
whole job is contrast against a warm page; inverting the page around them
destroys the rhythm. The theme switcher on `#themes` is a *product demo* — it
recolors a phone mockup via CSS custom properties, not the site.

**Content ships visible.** Scroll-reveal hides nothing until `motion.ts` has
confirmed both `IntersectionObserver` and `prefers-reduced-motion:
no-preference`, then sets `data-reveal-ready` on `<html>`. No-JS visitors,
reduced-motion visitors, and throttled background tabs all get a fully rendered
page. Animated values (the count-ups, the session timer) are rendered correct in
the HTML and animate *to* the number that's already there.

**Phone mockups are single images to assistive tech.** Each carries
`role="img"` with a description and hides its internals, so a screen reader
doesn't read out "9:41" and thirty chip labels. The randomizer's mockup is the
exception: it contains a real `<button>`, so it's a labelled `group` instead —
a focusable element inside an `aria-hidden` subtree would be invalid.

**Mockups scale, they don't re-lay-out.** Authored at fixed pixel sizes and
scaled per breakpoint by `Phone.astro` via `transform: scale()`, with the
wrapper reserving the scaled box so nothing jumps.

**The bob owns `transform`; parallax owns `translate`.** That's why the hero
phone can bob and parallax at once, and why the rotated covers keep their
rotation while translating.

## Waitlist form

`#get` posts to `POST /notify` on
[booktrackerapi](https://github.com/aschwedland/booktrackerapi)
(`app/notify.py`), which stores the address in Supabase `waitlist_signups` and
emails the support inbox. The table is the mailing list; the email is just
visibility.

It is the only unauthenticated mail-sending endpoint in that service, so it
carries a honeypot, strict validation and a per-IP cap. CORS is not part of
that — it's `*` service-wide and means nothing against `curl`.

Requires `migrations/create_waitlist_signups.sql` to be applied. See
`TODO_FOR_DREW.md`.
