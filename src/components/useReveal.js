import { useEffect } from 'react';

/**
 * Adds `is-in` to every [data-reveal] element as it enters the viewport.
 * Hidden start states only apply when <html> has `anim-on` (set in main.jsx when the
 * visitor has NOT asked for reduced motion), so content is visible without JS.
 * A MutationObserver picks up elements rendered later (hot reload, conditional
 * sections, content swaps) so nothing is ever left hidden.
 */
export function useReveal() {
  useEffect(() => {
    const animate = 'IntersectionObserver' in window && document.documentElement.classList.contains('anim-on');
    const io = animate
      ? new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (e.isIntersecting) {
                e.target.classList.add('is-in');
                io.unobserve(e.target);
              }
            }
          },
          { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
        )
      : null;

    const scan = () => {
      document.querySelectorAll('[data-reveal]:not(.is-in):not([data-watch])').forEach((el) => {
        if (!io) {
          el.classList.add('is-in');
          return;
        }
        el.setAttribute('data-watch', '');
        io.observe(el);
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      if (io) io.disconnect();
      document.querySelectorAll('[data-watch]').forEach((el) => el.removeAttribute('data-watch'));
    };
  }, []);
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
