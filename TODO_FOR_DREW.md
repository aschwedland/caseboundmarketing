# Manual follow-ups

## Blocking before this goes live

- [ ] **Apply the waitlist migration.** `booktrackerapi/migrations/create_waitlist_signups.sql`
      against the shared Supabase project. The notify form on `#get` returns a
      502 until this table exists — deliberately, since an address we can't
      record is an address we can't mail at launch.

- [ ] **Deploy booktrackerapi.** The new `POST /notify` endpoint
      (`app/notify.py`) has to be live on Railway before the form works.
      No new env vars are required — it reuses the existing `noreply@`
      SMTP settings. Optional: set `WAITLIST_TO_EMAIL` to route sign-ups
      somewhere other than `support@pixel-master.com`.

- [ ] **Sign off on the copy corrections.** See `CONTENT-CHANGES.md`. Seven
      claims in the approved design contradict the shipping app and were
      changed: "No streaks, ever", "private by default", "no account needed",
      and four wrong tier assignments — data export, year-in-review and cloud
      sync were all listed as Pro when they're free, and the free plan's
      one-club limit was unstated. The privacy one matters most.

- [ ] **Resolve a cloud-sync inconsistency in the app.** Nothing gates sync
      (`SyncProvider.tsx` has no entitlement checks, `PREMIUM_FEATURES` in
      `src/lib/constants.ts` doesn't list it), but the in-app upsells in
      `library.tsx` and `AddToListSheet.tsx` still pitch "cloud sync" as a Pro
      benefit. Either gate it or stop selling it. The website now claims it on
      neither tier, pending your call.

- [ ] **Decide whether Year in Review stays free.** It currently is
      (`year-in-review.tsx`: "free for all users", no gating), so the site now
      lists it under Free. If you intend to gate it, tell me before launch.

- [ ] **Clear the book cover art — or replace it.** The eight covers in
      `src/assets/covers/` are real, in-copyright commercial designs
      (Rothfuss, Miller, Weir, Herbert, Clarke, Le Guin, Kuang, Ishiguro),
      now served locally rather than hotlinked from Open Library — but that
      fixes the dependency, not the rights. Either get it cleared, or swap
      them: replace the files and update `COVERS` in `src/config/site.ts`.
      Nothing else references them.

## Launch day

- [ ] **Flip iOS live.** Set `LAUNCH.ios.live = true` in `src/config/site.ts`.
      That's the whole change — both store badges, the CTA pill, the hero fine
      print, the FAQ answer and the `SoftwareApplication` structured data all
      read from it. The App Store URL (id `6778136030`) is already wired.

- [ ] **Swap in the official store badge artwork.** The badges are currently
      text buttons with no store logos, which is the option both stores
      sanction when you don't have their assets in hand. Apple and Google each
      require their supplied artwork be used unmodified; drop the files in and
      update `src/components/StoreBadges.astro`.

## Still open from before

- [ ] **Attorney review of legal pages.** `/privacy` and `/terms` are interim
      drafts, carried over unchanged. `/delete-account` was updated for
      Colorado compliance in Aug 2026.

- [ ] **Add PostHog.** Placeholder is still in `src/layouts/BaseLayout.astro` —
      search for "ANALYTICS".

- [ ] **Confirm pricing against StoreKit / Play Billing.** The page shows
      $29.99/yr, $4.99/mo and a 5-list free cap. These match what the current
      live site shows and what the app's settings screen says
      ("5 lists · basic stats"), but the billing config is the authority.

- [ ] **Trademark posture.** Attorney consult before putting the Casebound
      wordmark on expensive deliverables.

## Done

- [x] ~~Wire real email capture.~~ The `mailto:` is gone. `#get` now has a real
      inline email field posting to `POST /notify`, which stores the address in
      `waitlist_signups` and emails you. Honeypot + per-IP cap + strict
      validation; see the module docstring in `booktrackerapi/app/notify.py`
      for why CORS isn't part of that list.

- [x] ~~Set up Cloudflare Pages.~~ / ~~Configure DNS.~~ — the site is live at
      casebound.co, so these are done. Build command and output directory are
      unchanged (`npm run build` → `dist/`).
