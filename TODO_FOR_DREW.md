# Manual follow-ups

- [ ] **Wire real email capture.** The "Notify me when it's ready" CTA is currently a `mailto:` link. Replace with ConvertKit embed or similar. See the HTML comment in `src/components/Hero.astro` for the exact location.

- [ ] **Attorney review of legal pages.** Privacy policy and terms of service are interim drafts. Swap in attorney-reviewed versions before public launch. Content is inline in `src/pages/privacy.astro` and `src/pages/terms.astro`.

- [ ] **Add PostHog.** Analytics placeholder is in `src/layouts/BaseLayout.astro` — search for "ANALYTICS" comment. Wire PostHog when ready.

- [ ] **Set up Cloudflare Pages.** Connect this repo. Build command: `npm run build`. Output directory: `dist/`.

- [ ] **Configure DNS.** Point casebound.co at Cloudflare Pages.

- [ ] **Trademark posture.** Schedule attorney consult before incorporating the Casebound wordmark into expensive deliverables (print, merch, etc.).
