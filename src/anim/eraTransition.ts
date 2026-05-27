import gsap from 'gsap';
import type { Era } from '../data/eras';

let activeFlash: HTMLDivElement | null = null;

function ensureFlash(): HTMLDivElement {
  if (activeFlash) return activeFlash;
  const d = document.createElement('div');
  d.style.cssText = `
    position: fixed; inset: 0; z-index: 150; pointer-events: none;
    opacity: 0;
    background: radial-gradient(circle at center, var(--accent) 0%, transparent 60%);
    mix-blend-mode: screen;
    will-change: opacity, transform;
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
  // Browsers tween color CSS vars natively when the consuming property has a
  // CSS transition, so we just set them and let the body's transition handle
  // the easing.
  Object.entries(target).forEach(([k, v]) => r.setProperty(k, v));
  void ms;
}

/**
 * Era-change visual punctuation. Instead of a bleach-white swipe, this is a
 * radial pulse tinted by the era's accent color, expanding from the center
 * and fading out. The `screen` blend brightens the dark backdrop with the
 * accent — feels like a stage light kicking on in the new color.
 */
export function flashTransition(): gsap.core.Timeline {
  const flash = ensureFlash();
  // Re-assert the background each call so it picks up the latest --accent.
  flash.style.background =
    'radial-gradient(circle at center, var(--accent) 0%, transparent 60%)';
  const tl = gsap.timeline();
  tl.fromTo(
    flash,
    { opacity: 0, scale: 0.55, transformOrigin: 'center center' },
    { opacity: 0.85, scale: 1.15, duration: 0.22, ease: 'power3.out' }
  ).to(flash, {
    opacity: 0,
    scale: 1.45,
    duration: 0.65,
    ease: 'power2.inOut',
  });
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
