import gsap from 'gsap';
import type { Era } from '../data/eras';

let activeFlash: HTMLDivElement | null = null;

function ensureFlash(): HTMLDivElement {
  if (activeFlash) return activeFlash;
  const d = document.createElement('div');
  d.style.cssText = `
    position: fixed; inset: 0; z-index: 150; pointer-events: none;
    background: #fff; opacity: 0; mix-blend-mode: screen;
  `;
  document.body.appendChild(d);
  activeFlash = d;
  return d;
}

export function tweenVars(era: Era, ms = 1200) {
  const r = document.documentElement.style;
  const target = {
    '--bg': era.bg,
    '--paint': era.paint,
    '--label': era.label,
    '--line': era.line,
    '--glow': era.glow,
    '--accent': era.accent,
    '--fg': era.fg,
    '--muted': era.muted,
  };
  // Browsers tween color CSS vars natively when the consuming property has a transition,
  // so we just set them and let the body's `transition: background var(--transition)` handle it.
  Object.entries(target).forEach(([k, v]) => r.setProperty(k, v));
  // Tween a numeric helper var for things that need to read it from JS later.
  void ms;
}

export function flashTransition(): gsap.core.Timeline {
  const flash = ensureFlash();
  const tl = gsap.timeline();
  tl.to(flash, { opacity: 0.65, duration: 0.14, ease: 'power3.out' })
    .to(flash, { opacity: 0, duration: 0.5, ease: 'power2.inOut' });
  return tl;
}

/**
 * Lift the tonearm off the disc, hold briefly, then let CSS drop it back into
 * the playing position. Called when the user switches between eras (so the
 * track change feels like a real DJ swap, not just a color tween).
 */
export function liftTonearm(holdMs = 520) {
  const arm = document.querySelector('.tonearm');
  if (!arm) return;
  arm.classList.add('lifting');
  window.setTimeout(() => arm.classList.remove('lifting'), holdMs);
}
