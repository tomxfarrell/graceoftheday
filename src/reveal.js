// v-reveal: lifts an element into view once, the first time it enters the viewport.
// The value is the element's place in its section's stagger (0, 1, 2 ...).
// Without IntersectionObserver, or with reduced motion, nothing is hidden.

const STAGGER_MS = 90;

const watch = (className, options) =>
  typeof IntersectionObserver === 'undefined'
    ? null
    : new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(className);
          observer.unobserve(entry.target);
        });
      }, options);

// Reveal as soon as any part shows, so content peeking at the fold never sits blank
const revealObserver = watch('is-revealed', { rootMargin: '0px' });

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const reveal = {
  mounted(el, binding) {
    if (!revealObserver || prefersReducedMotion()) return;
    el.style.setProperty('--reveal-delay', `${(binding.value || 0) * STAGGER_MS}ms`);
    el.classList.add('reveal');
    revealObserver.observe(el);
  },
  unmounted(el) {
    revealObserver?.unobserve(el);
  },
};
