/**
 * The page's whole motion layer: scroll reveals, count-up numerals, the live
 * session timer, and hero parallax.
 *
 * Two rules this file exists to enforce:
 *
 * 1. Content is never left permanently hidden. The hidden state is armed by
 *    the inline script in BaseLayout.astro (before first paint, to avoid a
 *    flash), guarded by the same IntersectionObserver + reduced-motion checks
 *    used here, and backed by a 3s watchdog that drops it if this file never
 *    boots. A no-JS visitor, a reduced-motion visitor, a throttled background
 *    tab, a failed chunk fetch, or a thrown exception all leave the page fully
 *    rendered.
 *
 * 2. Every animated value is already correct in the HTML. The count-ups
 *    animate *to* the number that was server-rendered; the timer starts from
 *    the time that was server-rendered.
 */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ reveals */

function initReveals(): void {
  const targets = Array.from(
    document.querySelectorAll<HTMLElement>('[data-reveal]'),
  );
  if (!targets.length) return;

  // Count-ups still need to settle on their final value even when reveals
  // don't run. They already render correctly server-side, so this is a no-op
  // in practice — it just keeps one code path responsible for the value.
  if (REDUCED || !('IntersectionObserver' in window)) {
    countUpWithin(document.body, true);
    return;
  }

  // Normally already armed by the inline head script, so the hero doesn't
  // paint, blank, then fade. Setting it again is idempotent and covers the
  // case where that script didn't run.
  document.documentElement.setAttribute('data-reveal-ready', '');

  targets.forEach((el, i) => {
    if (!el.style.getPropertyValue('--reveal-delay')) {
      el.style.setProperty('--reveal-delay', `${(i % 6) * 60}ms`);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add('is-revealed');
        countUpWithin(el, false);
        observer.unobserve(el);
      }
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
  );

  targets.forEach((el) => observer.observe(el));
}

/* ----------------------------------------------------------------- count-up */

/**
 * Run every count-up at or beneath `root`. The numbers sit inside the revealed
 * block rather than on it (the big figure and the three metrics all live in
 * one card that carries a single `data-reveal`), so a self-only check would
 * never fire.
 */
function countUpWithin(root: HTMLElement, immediate: boolean): void {
  if (root.hasAttribute('data-count')) runCountUp(root, immediate);
  root
    .querySelectorAll<HTMLElement>('[data-count]')
    .forEach((el) => runCountUp(el, immediate));
}

function runCountUp(el: HTMLElement, immediate: boolean): void {
  const raw = el.getAttribute('data-count');
  if (raw === null) return;
  // Guard against a reveal firing twice for nested targets.
  if (el.dataset.counted === '1') return;
  el.dataset.counted = '1';

  const target = Number.parseFloat(raw);
  if (!Number.isFinite(target)) return;

  const suffix = el.getAttribute('data-suffix') ?? '';
  // Pinned to en-US to match the server-rendered value. A bare
  // toLocaleString() follows the visitor's locale, so a de-DE reader would
  // watch "18.240" count up and then land on the HTML's "18,240".
  const render = (v: number) => {
    el.textContent = Math.round(v).toLocaleString('en-US') + suffix;
  };

  if (immediate) {
    render(target);
    return;
  }

  const DURATION = 1400;
  const start = performance.now();

  const step = (now: number) => {
    const p = Math.min((now - start) / DURATION, 1);
    render(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

/* -------------------------------------------------------------------- timer */

function initTimer(): void {
  const el = document.getElementById('cb-timer');
  if (!el) return;

  let seconds = Number.parseInt(el.dataset.timerStart ?? '0', 10);
  if (!Number.isFinite(seconds)) return;

  const format = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  let interval: number | null = null;

  const start = () => {
    if (interval !== null) return;
    interval = window.setInterval(() => {
      seconds += 1;
      el.textContent = format(seconds);
    }, 1000);
  };

  const stop = () => {
    if (interval === null) return;
    window.clearInterval(interval);
    interval = null;
  };

  // A timer nobody can see is pure battery drain, so it runs only while
  // #stats is on screen AND the tab is foregrounded. Both conditions are
  // tracked as state and re-evaluated together: an earlier version stopped on
  // `visibilitychange` but had no path back, so returning from another tab
  // left the timer frozen until the section was scrolled fully out and back.
  let onScreen = !('IntersectionObserver' in window);

  const sync = () => {
    if (onScreen && !document.hidden) start();
    else stop();
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) onScreen = e.isIntersecting;
        sync();
      },
      { threshold: 0.1 },
    );
    io.observe(el);
  }

  document.addEventListener('visibilitychange', sync);
  sync();
}

/* ----------------------------------------------------------------- parallax */

function initParallax(): void {
  // Parallax fights momentum scrolling on iOS, so it stays desktop-only.
  if (REDUCED || window.matchMedia('(max-width: 767px)').matches) return;

  const layers = Array.from(
    document.querySelectorAll<HTMLElement>('[data-parallax]'),
  );
  if (!layers.length) return;

  let ticking = false;

  const apply = () => {
    const y = window.scrollY;
    for (const el of layers) {
      const speed = Number.parseFloat(el.dataset.parallax ?? '0');
      // `translate` rather than `transform`, so a layer's own rotation (the
      // floating covers) or its own keyframe animation (the hero phone's bob)
      // is left completely alone.
      el.style.translate = `0 ${(y * speed).toFixed(2)}px`;
    }
    ticking = false;
  };

  apply();

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    },
    { passive: true },
  );
}

/* --------------------------------------------------------------------- boot */

function boot(): void {
  // Calls off the inline head script's watchdog (BaseLayout.astro), which
  // otherwise drops the hidden state after 3s. Set first and unconditionally:
  // every init below can legitimately return early, and an early return still
  // means this script ran.
  document.documentElement.setAttribute('data-motion-booted', '');

  initReveals();
  initTimer();
  initParallax();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
