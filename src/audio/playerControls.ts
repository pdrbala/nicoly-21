/**
 * Module-level handle to the single HTMLAudioElement created by useAudioEngine.
 * UI components import the action functions and call them — the store stays a
 * pure state container; this is the thin imperative side-effect layer.
 */
let el: HTMLAudioElement | null = null;

export function registerAudioElement(audio: HTMLAudioElement) {
  el = audio;
}

export function play() {
  if (!el) return;
  void el.play().catch(() => {
    /* autoplay blocked until the next user gesture — silently no-op */
  });
}

export function pause() {
  if (!el) return;
  el.pause();
}

export function toggle() {
  if (!el) return;
  if (el.paused) play();
  else pause();
}

export function restart() {
  if (!el) return;
  el.currentTime = 0;
  void el.play().catch(() => {});
}

export function seekTo(t: number) {
  if (!el) return;
  el.currentTime = t;
}
