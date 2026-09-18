import { LAUNCH, BOTH_LIVE, NEITHER_LIVE } from './site';

/**
 * FAQ content, shared by FAQ.astro and the FAQPage JSON-LD on the landing
 * page so the two can never drift apart.
 *
 * Nine items: the six from the new design, plus three carried forward from the
 * current site (Goodreads positioning, social features, web app) which the new
 * design had no slot for. Several answers are corrected against the shipping
 * app — see CONTENT-CHANGES.md and the notes below.
 */

export interface FaqItem {
  q: string;
  a: string;
  /** Where this item came from, for review. Not rendered. */
  origin: 'design' | 'carried';
}

/**
 * Deliberately avoids "above" / "below". #faq renders *before* #get, so the
 * store badges and the email field are further down the page — and these
 * strings are also emitted into the FAQPage JSON-LD, where they can surface in
 * a search result with no surrounding page at all.
 */
function launchAnswer(): string {
  if (BOTH_LIVE) {
    return 'Casebound is available now on both the App Store and Google Play — grab it from either store badge on this page.';
  }
  if (NEITHER_LIVE) {
    return 'Casebound is coming to iOS and Android. Leave your email in the sign-up box at the end of this page and we’ll tell you the moment it lands on your platform.';
  }
  const live = LAUNCH.android.live ? 'Google Play' : 'the App Store';
  const soon = LAUNCH.android.live ? 'the App Store' : 'Google Play';
  return `Casebound is out now on ${live} — you can download it today. The ${soon} release is still on its way; leave your email in the sign-up box at the end of this page and we’ll tell you the moment it lands.`;
}

export const FAQS: FaqItem[] = [
  {
    origin: 'design',
    q: 'Is my library actually free?',
    a:
      'Yes — completely. Your full library, catalog, and real session tracking are free forever, with no book limit. ' +
      'Pro only adds depth: unlimited lists, advanced insights, unlimited book clubs, and the PDF collector’s report.',
    // CORRECTED TWICE. Originally ended "...sync, and exports": CSV/JSON export
    // is free and only the PDF report is Premium-gated (src/app/export.tsx).
    // Then "cloud sync" also had to go — src/lib/SyncProvider.tsx has zero
    // entitlement checks and PREMIUM_FEATURES (src/lib/constants.ts:32-38)
    // doesn't list it. Replaced with unlimited clubs, which IS gated
    // (src/lib/useClubJoinAction.ts:38, free users get one club).
  },
  {
    origin: 'design',
    q: 'How do you handle audiobooks vs. print?',
    a:
      'Each format is its own record on one book. Audio is tracked in hours and minutes, print in pages, ebooks in percent or locations. ' +
      'Nothing is ever converted into a fake “page” number, so your stats stay honest.',
  },
  {
    origin: 'carried',
    q: 'Why not just use Goodreads?',
    a:
      'Goodreads conflates shelves with reading state and user lists. When you own 500 books across overlapping shelves, you can’t cleanly answer “what do I own?” ' +
      'Casebound treats your library as a canonical catalog and lists as tags layered on top. They’re separate things, and they look that way.',
    // Carried from the current site. The new design's Goodreads item is about
    // CSV import, which is a different question; this is the positioning one.
  },
  {
    origin: 'design',
    q: 'Are there streaks or yearly goals?',
    a:
      'Both — and neither is the point. Your daily goal is set in pages or minutes, never in books, and a streak tracks it. ' +
      'There’s an optional yearly book-count goal too, if that’s a number you like having. ' +
      'What Casebound won’t do is reduce your reading to it: sessions, stats and progress are all measured in pages and hours, so the thing you’re building is real reading rather than a tally to protect.',
    // CORRECTED TWICE.
    //   (a) The approved answer opened "No streaks, ever." Casebound ships a
    //       full streak system (profiles.current_streak_cache / longest_streak
    //       / streak_requires_goal) on the home tab, stats, badges and
    //       log-session, with no way to switch it off.
    //   (b) My own first correction then claimed "there is no yearly
    //       book-count goal". There is one: reading_goals.book_goal
    //       (20260602120200_add_reading_goals.sql:6), a "Yearly book goal" row
    //       in Settings, and a whole src/app/yearly-goal-stats.tsx screen.
    // The daily-goal metric claim survives both: goal_metric is CHECKed to
    // ('pages','minutes') only.
  },
  {
    origin: 'design',
    q: 'Can I import from Goodreads or StoryGraph?',
    a:
      'Yes. Import a CSV export from Goodreads or StoryGraph and Casebound matches it to real editions. ' +
      'Re-importing your own export merges without creating duplicates.',
    // Verified against src/app/import.tsx, which supports both and reports a
    // "Merged with existing" count.
  },
  {
    origin: 'carried',
    q: 'Does Casebound have social features?',
    a:
      'Yes, and none of them are the point. You can follow other readers, share an activity feed, join a book club with threads and reading votes — one on the free plan, unlimited on Pro — and send recommendations to friends. ' +
      'There is no algorithmic feed and no public leaderboard, and you can make your profile private, mark individual books private, or block anyone.',
    // REWRITTEN. The current live site answers "Possibly — on the roadmap for
    // a later version", which is stale: clubs, follows, the activity feed,
    // friend recommendations and blocking all ship today.
    // The club count is stated because free membership is capped at one
    // (src/lib/useClubJoinAction.ts:38) — "join book clubs" alone read as
    // unlimited. The feed really is chronological
    // (src/lib/queries/social.ts: order('created_at')) and there is no
    // leaderboard anywhere in the app.
  },
  {
    origin: 'design',
    q: 'Is my data private — and can I get it out?',
    a:
      'Your profile is public by default so other readers can find you, and you can switch it to private whenever you like from Edit profile — which hides your library from everyone else. ' +
      'Individual books can be marked private on their own, and you can block anyone. ' +
      'You can export everything to CSV or JSON at any time, on any plan — no truncation, no upgrade required.',
    // CORRECTED TWICE.
    //   (a) The approved answer opened "Your library is private by default".
    //       profiles.is_public is `not null default true` (v32 migration,
    //       never altered), handle_new_user() sets only `id` so the default
    //       applies, and the app reads `profile.is_public ?? true`. Shipping
    //       "private by default" would be a false privacy claim.
    //   (b) My own first correction then said "in Settings" and "from anyone
    //       who doesn't already follow you". Both wrong: the toggle lives in
    //       the Edit profile sheet, not Settings; and the
    //       public_library_entries view filters on
    //       `is_private = false and p.is_public = true` with NO follows
    //       clause, so a private profile hides the library from followers too.
  },
  {
    origin: 'carried',
    q: 'Is there a web app?',
    a:
      'Mobile first. Casebound is built for the phone in your hand while you’re standing at the shelf, and a web app comes later only if it’s clearly needed.',
  },
  {
    origin: 'design',
    q: 'Where can I get it?',
    a: launchAnswer(),
    // REWRITTEN for the split launch: Android is live, iOS is not. The answer
    // is generated from LAUNCH in src/config/site.ts, so it stays correct when
    // iOS flips.
  },
];
