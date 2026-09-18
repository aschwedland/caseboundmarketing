# Content changes vs. the approved design

The handoff called its copy final and high-fidelity, and it is followed
verbatim except where noted below. Two kinds of change are recorded here:

- **Corrections** — the approved copy makes a claim I verified to be false
  against the shipping app. Each one is cited to the code or schema that
  contradicts it. These are the ones that need your sign-off; every one is a
  claim a user could disprove within a minute of installing the app.
- **Merges** — content carried forward from the current site, which the
  handoff had no slot for.

Every correction is a small, self-contained edit. If you disagree with one, the
original wording is quoted here and it's a one-line revert.

---

## Corrections

### 1. "No streaks, ever" — false

**Was** (FAQ): *"No streaks, ever. Goals are framed in pages and time, never
book counts…"*

**Now:** *"Both — and neither is the point. Your daily goal is set in pages or
minutes, never in books, and a streak tracks it. There's an optional yearly
book-count goal too, if that's a number you like having. What Casebound won't
do is reduce your reading to it…"*

> **This one was corrected twice.** My first pass replaced "no streaks, ever"
> with wording that claimed *"there is no yearly book-count goal"* — which is
> also false. `reading_goals.book_goal`
> (`20260602120200_add_reading_goals.sql:6`) backs a "Yearly book goal" row in
> Settings and a whole `src/app/yearly-goal-stats.tsx` screen. A second review
> pass caught it. The wording above is the corrected version.

**Why:** Casebound ships a full streak system.
`supabase/migrations/20260601120200_add_streak_columns.sql` adds
`current_streak_cache`, `longest_streak`, `streak_requires_goal` and
`last_streak_date` to `profiles`; streak UI appears on the home tab, stats,
badges, goal setup, log-session and notification settings. The
`/delete-account` page on the current site already lists "streaks" among the
data that gets deleted.

The book-count half of the original claim **is** accurate and is kept:
`goal_type` is constrained to `('pages','time')` and `goal-setup.tsx` offers
only minutes or pages.

Same change applied to the `#stats` lede, which ended *"…never reduced to a
book count or a streak to protect."* — the streak clause is dropped, the
book-count clause kept.

### 2. "Private by default" — false, and a privacy claim

**Was** (FAQ): *"Your library is private by default, with per-book privacy
controls."*

**Now:** *"Your profile is public by default so other readers can find you, and
you can switch it to private whenever you like from Edit profile — which hides
your library from everyone else. Individual books can be marked private on
their own…"*

**Why:** `profiles.is_public` is `not null default true`
(`20260625120000_v32_profile_social_identity.sql:13`), no later migration
changes it, `handle_new_user()` inserts only `id` so the default applies, and
the app reads `profile.is_public ?? true`.

> **Also corrected twice.** My first pass said the toggle was "in Settings" and
> that private hides your library "from anyone who doesn't already follow you".
> Both wrong. The toggle is in the Edit profile sheet on your social profile,
> not Settings. And the `public_library_entries` view filters on
> `le.is_private = false and p.is_public = true` with **no follows clause**
> (`20260625120700_v32_public_library.sql:22-24`) — so a private profile hides
> the library from followers too. The `!relationship.isFollowing` check at
> `social/profile/[id].tsx:139` is only a client-side gate on reaching the tab;
> a follower who gets past it sees an empty grid. The new wording is both
> simpler and accurate.

This one I'd flag hardest: a false "private by default" claim on a marketing
site is the kind of thing that attracts regulatory attention, and the
`/delete-account` page suggests you're already tracking privacy compliance.

**Note:** the *current live site* has the same problem — its FAQ says "no public
profile by default". That's live and wrong today, independently of this
redesign.

### 3. "Data export" listed as a Pro feature — misleading, and self-contradictory

**Was** (Pricing, Pro column): *"Data export & the Sepia theme"*

**Now:** *"PDF collector's report & the Sepia theme"*

**Why:** `src/app/export.tsx` gates only `format === 'pdf'` behind `isPremium`.
CSV and JSON export are free on every plan. The handoff contradicted itself
here — its own FAQ said *"export everything to CSV or JSON at any time, on any
plan — no truncation, no upgrade required"* and its pricing footnote said
*"Export your data anytime, on any plan."* Both of those are accurate and are
kept; the Pro bullet was the odd one out.

I also added **"CSV & JSON export"** to the Free column, so the free tier states
the capability outright rather than leaving it to a footnote.

Sepia genuinely is Pro-gated (`src/app/appearance.tsx` shows its own PRO pill
and routes to the paywall), so that half is unchanged.

### 3b. Two more Pro bullets that aren't Pro

Found on the second review pass, in the same Pricing list.

- **"Year-in-review wraps"** — free. `src/app/year-in-review.tsx` opens with
  *"a full annual reading summary, **free for all users**"* and contains zero
  entitlement checks; `stats.tsx` routes everyone to it. **Moved to the Free
  column**, where it's a genuine selling point rather than an error.
- **"Cloud sync across devices"** — not gated by anything.
  `src/lib/SyncProvider.tsx` has no entitlement checks, an account is
  mandatory, and all data is Supabase-backed, so free users already sync.
  `account-setup.tsx` even tells the user the account *"is what lets their
  library + reading data sync across devices."* **Removed from Pro, and
  deliberately not added to Free** — see the app inconsistency below.

The Pro list now names the actual gates, taken from `PREMIUM_FEATURES`
(`src/lib/constants.ts:32-38`) and the `!isPremium` checks in
`useClubJoinAction.ts`, `library.tsx` and `appearance.tsx`: unlimited lists and
smart lists, advanced stats, unlimited book clubs, customizable bookshelf and
spine photos, and the PDF report plus Sepia.

> **An inconsistency in the app, not the site.** `PREMIUM_FEATURES` does not
> list cloud sync, and nothing gates it — but the in-app upsell strings in
> `library.tsx` and `AddToListSheet.tsx` still pitch *"unlimited lists,
> advanced stats, cloud sync, and more"*. The website inherited that marketing
> line rather than the behavior. Worth resolving in the app; the site now stays
> out of it by not claiming sync either way.

### 3d. Two ledes promising things their own sections no longer said

Knock-on effects of the tier corrections, caught by a code review pass.

- **Pricing lede** read *"Pro adds depth, **devices, and exports**."* After the
  fixes above, Pro's list contains neither — sync was removed and export is
  Free. Now: *"Your full library, real session tracking and your data on the
  way out are free forever. Pro adds depth, not permission."*
- **`#stats` lede** read *"…never reduced to a book count or a streak to
  protect."* The first pass dropped only the streak half, which left the
  section contradicting the FAQ four sections later once the yearly book goal
  was disclosed. Now: *"…measured in the units you actually read in, not
  rounded off into a number to protect."*

### 3c. The free plan's one-club limit was unstated

The FAQ's social answer said *"join book clubs"*, which reads as unlimited.
`src/lib/useClubJoinAction.ts:38` caps free accounts at one
(`if (count >= 1 && !isPremium)`). The answer now says *"one on the free plan,
unlimited on Pro"*, and Pro's bullet list names clubs explicitly — the design's
pricing table never mentioned them at all.

### 4. "No account needed" — false, in three places

**Was:** hero fine print *"Free to start · No account needed · iOS & Android"*;
Pricing Free card *"No account needed to start"*; final CTA *"Free to start ·
No account required · Your data stays yours"*.

**Now:** *"Free to start · On Google Play now · iOS coming soon"*; *"Free
forever, no card required"*; *"Free to start · Export your data anytime · Your
data stays yours"*.

**Why:** `src/app/_layout.tsx` routes first run through
`slides → account-setup (auth) → goal-setup → notif-primer → home` and
redirects to `/onboarding` or `/(auth)/sign-in` whenever there's no session.
There is no guest mode.

### 5. Split-launch copy — Android is live, iOS is not

"Coming soon to iOS & Android" appeared in five places. All five now derive
from `LAUNCH` in `src/config/site.ts`:

- Google Play badge is a live download link to the real listing
  (`com.pixelmaster.casebound`, verified as a published listing).
- App Store badge reads "Coming soon to the App Store" and points at the
  notify-me field. Its real URL (ASC app id `6778136030`, from
  `booktracker/eas.json`) is already wired behind the flag.
- Final-CTA pill: *"Out now on Android · iOS coming soon"*.
- FAQ "Where can I get it?" is generated from the same flag.

**Launch day is one line:** set `LAUNCH.ios.live = true`.

### Judgment calls I did *not* change

"Not built for: people who want an algorithm to decide what they read next"
(`#who`) and "No algorithm deciding for you" (`#randomizer`) sit awkwardly
next to `booktrackerapi/app/recommendations.py`, which scores a "discover" pool
by genre and author affinity and backs a `/recommended` screen. I left both:
they're positioning about not having an opaque feed, the engine is explicitly
rule-based, and it suggests rather than decides. Flagging it so the call is
yours, not mine by omission.

"Not built for: casual readers chasing yearly book-count goals" (`#who`) sits
in similar tension with the yearly book goal the app actually offers. I left it
too: it's a statement about who the product is aimed at rather than what it
contains, and the FAQ now discloses the feature plainly a few sections later.
Same note applies — your call, not mine by omission.

### Pricing could not be verified from source

The arithmetic holds ($29.99 ÷ 12 = $2.4991 ≈ $2.50; saving vs. $4.99 × 12 is
49.9% ≈ "save 50%"). But no price is hardcoded anywhere in the app —
`paywall.tsx` renders `product.priceString` live from RevenueCat. The real
numbers live in RevenueCat / App Store Connect / Play Console, so the
StoreKit sign-off item in `TODO_FOR_DREW.md` stands and should not be cleared
on the strength of this page matching the old one.

---

## Merges from the current site

All four of the items you selected, plus the non-negotiable ones.

| Carried | Where it went |
|---|---|
| "Why not just use Goodreads?" | FAQ item 3, verbatim. The design's Goodreads item is about CSV import — a different question. |
| Real app screenshots | New `#screenshots` section between Themes and Who-it's-for. Alt text carried verbatim. |
| "Will there be a web app?" | FAQ item 8, lightly expanded. |
| Social-features FAQ | FAQ item 6, **rewritten** — the live answer says "possibly, on the roadmap", but clubs, follows, the activity feed, friend recommendations and blocking all ship today. |
| `/privacy`, `/terms`, `/delete-account`, `/404` | Unchanged. Still rendered through `ProseLayout`. |
| Footer "Delete account" link | Kept. Both app stores require a publicly reachable deletion path — this is not optional, and the new design dropped it. |
| Footer contact address | Kept in the Company column. |
| "Pixel Master Technologies LLC" | Kept in the footer bottom bar. The new design's footer said only "© 2026 Casebound". |

The screenshot carousel was **rebuilt**, not copied: the old one was ~200 lines
of pointer/wheel/keyboard handling with a clone-set infinite loop. It's now a
CSS scroll-snap strip — drag, momentum, keyboard and touch all come from the
browser, it ships zero JavaScript, and it can't trap focus.

---

## Handoff errors worth knowing about

The handoff's "Blockers to resolve first" section is wrong on two of three
points, both verifiable with `git ls-tree`:

1. **"The repo is missing its own source."** It isn't. All 17 files under
   `src/` are committed at `bc5e227b`, the working tree was clean, and the
   components it says "were never committed" are all there.
2. **"`astro.config.mjs` must be created."** It already existed, already
   wired `@astrojs/sitemap`, `site: 'https://casebound.co'` and
   `output: 'static'`, with `postcss.config.mjs` alongside it.

It also described the current site as "six sections" (there are seven — it
missed `ScreenshotShowcase`) and never mentioned `/delete-account`,
`ProseLayout.astro`, `Header.astro` or `/404`.

Point 3 — cover art rights — is real and still open. See `TODO_FOR_DREW.md`.
