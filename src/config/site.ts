/**
 * Single source of truth for launch state, store links and cover art.
 *
 * Launch status appears in five places (both store badge pairs, the final-CTA
 * pill, the hero fine print, and the FAQ). Flipping a platform to `live` here
 * is the only change needed on launch day — see `LAUNCH` below.
 */

export interface PlatformStatus {
  /** `true` once the app is publicly downloadable on this store. */
  live: boolean;
  /** Store listing URL. Kept populated even while `live` is false. */
  url: string;
}

/**
 * Android shipped first; iOS is still in review. Set `ios.live = true` on the
 * day the App Store listing goes public and every string on the page follows.
 */
export const LAUNCH: { ios: PlatformStatus; android: PlatformStatus } = {
  ios: {
    live: false,
    // ASC app id 6778136030, from booktracker/eas.json.
    url: 'https://apps.apple.com/app/id6778136030',
  },
  android: {
    live: true,
    url: 'https://play.google.com/store/apps/details?id=com.pixelmaster.casebound',
  },
};

/** True when both stores are live — collapses the split-launch copy. */
export const BOTH_LIVE = LAUNCH.ios.live && LAUNCH.android.live;
/** True while neither store is live — restores plain "coming soon" copy. */
export const NEITHER_LIVE = !LAUNCH.ios.live && !LAUNCH.android.live;

/** Short platform-availability line used in the hero and final CTA. */
export function availabilityLine(): string {
  if (BOTH_LIVE) return 'iOS & Android';
  if (NEITHER_LIVE) return 'Coming soon to iOS & Android';
  return LAUNCH.android.live
    ? 'On Google Play now · iOS coming soon'
    : 'On the App Store now · Android coming soon';
}

export const SUPPORT_EMAIL = 'support@pixel-master.com';
export const LEGAL_ENTITY = 'Pixel Master Technologies LLC';

/**
 * Waitlist endpoint on booktrackerapi (Railway). Unauthenticated by design —
 * marketing visitors have no Supabase JWT — so the server side carries a
 * honeypot, strict validation and a per-IP daily cap. See
 * `booktrackerapi/app/notify.py`.
 */
export const NOTIFY_ENDPOINT =
  'https://booktrackerapi-production-a74f.up.railway.app/notify';

/**
 * Book cover registry.
 *
 * `fallback` is painted as a solid background behind every cover so a failed
 * image load degrades to a colored spine rather than a hole. Cover files live
 * in `src/assets/covers/` so Astro emits responsive WebP at build time.
 *
 * NOTE: these are real, in-copyright commercial cover designs used to
 * illustrate product UI. Rights are not cleared — see TODO_FOR_DREW.md.
 * Swapping the art is a one-file change: replace the files in
 * `src/assets/covers/` and update the titles here.
 */
export interface CoverMeta {
  slug: string;
  title: string;
  author: string;
  fallback: string;
}

export const COVERS = {
  nameOfTheWind: {
    slug: 'name-of-the-wind',
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    fallback: '#2E5D45',
  },
  circe: {
    slug: 'circe',
    title: 'Circe',
    author: 'Madeline Miller',
    fallback: '#9A6B1E',
  },
  projectHailMary: {
    slug: 'project-hail-mary',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    fallback: '#3E5F79',
  },
  dune: {
    slug: 'dune',
    title: 'Dune',
    author: 'Frank Herbert',
    fallback: '#A8492C',
  },
  piranesi: {
    slug: 'piranesi',
    title: 'Piranesi',
    author: 'Susanna Clarke',
    fallback: '#5B6B82',
  },
  leftHandOfDarkness: {
    slug: 'left-hand-of-darkness',
    title: 'The Left Hand of Darkness',
    author: 'Ursula K. Le Guin',
    fallback: '#7A4A2B',
  },
  babel: {
    slug: 'babel',
    title: 'Babel',
    author: 'R. F. Kuang',
    fallback: '#2E5D45',
  },
  klaraAndTheSun: {
    slug: 'klara-and-the-sun',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    fallback: '#8A6A1F',
  },
} as const satisfies Record<string, CoverMeta>;

export type CoverKey = keyof typeof COVERS;
