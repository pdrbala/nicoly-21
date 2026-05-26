import gsap from 'gsap';

export function buildIntroTimeline(
  vinylEl: HTMLElement,
  labelEl: HTMLElement,
  overlayEl: HTMLElement,
  onComplete: () => void
): { timeline: gsap.core.Timeline; spin: gsap.core.Tween } {
  const tl = gsap.timeline({ onComplete });

  // 1) Vinyl falls from above with a slight overshoot, while rotating
  tl.fromTo(
    vinylEl,
    { y: '-110vh', rotate: 0, scale: 1 },
    { y: 0, rotate: 220, duration: 1.4, ease: 'power4.out' }
  )
    .to(vinylEl, { y: -16, duration: 0.18, ease: 'power2.out' })
    .to(vinylEl, { y: 0, duration: 0.32, ease: 'power2.in' })

    // 2) Label ignites
    .to(labelEl, { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.4')
    .fromTo(labelEl, { scale: 0.94 }, { scale: 1, duration: 0.9, ease: 'power3.out' }, '<')

    // 3) Hold for a beat so it lands
    .to({}, { duration: 0.9 })

    // 4) Fade overlay out (the rest of the app is already mounted underneath)
    .to(overlayEl, { opacity: 0, duration: 0.85, ease: 'power2.inOut' });

  // Independent continuous spin (not part of the timeline, so onComplete fires)
  const spin = gsap.to(vinylEl, {
    rotate: '+=360',
    duration: 6,
    ease: 'none',
    repeat: -1,
    delay: 1.4,
  });

  return { timeline: tl, spin };
}
