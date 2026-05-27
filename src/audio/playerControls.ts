import { usePlaybackStore } from '../store/usePlaybackStore';

/**
 * Module-level handle to the single HTMLAudioElement created by useAudioEngine.
 * UI components import the action functions and call them — the store stays a
 * pure state container; this is the thin imperative side-effect layer.
 */
let el: HTMLAudioElement | null = null;
let beforePlay: (() => Promise<void>) | null = null;
let scratchFx: ((strength: number, direction: number) => void) | null = null;

export function registerAudioElement(audio: HTMLAudioElement) {
  el = audio;
  el.volume = usePlaybackStore.getState().volume;
}

export function registerBeforePlay(callback: () => Promise<void>) {
  beforePlay = callback;
}

export function registerScratchFx(callback: ((strength: number, direction: number) => void) | null) {
  scratchFx = callback;
}

export async function play() {
  const playback = usePlaybackStore.getState();
  playback.setPlaying(true);
  if (!el) return Promise.resolve();
  if (el.ended || (Number.isFinite(el.duration) && el.currentTime >= el.duration - 0.2)) {
    el.currentTime = 0;
    playback.setTime(0);
  }
  await beforePlay?.();
  return el.play().catch(() => {
    /* Keep the needle/record state alive even if the media file is missing. */
  });
}

export function pause() {
  const playback = usePlaybackStore.getState();
  playback.setPlaying(false);
  el?.pause();
}

export function toggle() {
  if (usePlaybackStore.getState().playing) pause();
  else play();
}

export function restart() {
  if (!el) return Promise.resolve();
  el.currentTime = 0;
  usePlaybackStore.getState().setTime(0);
  return el.play().catch(() => {});
}

export function seekTo(t: number) {
  if (!el) return;
  const duration = Number.isFinite(el.duration) ? el.duration : 0;
  const nextTime = duration > 0 ? Math.max(0, Math.min(duration, t)) : Math.max(0, t);
  el.currentTime = nextTime;
  usePlaybackStore.getState().setTime(nextTime);
}

export function nudgeBy(deltaSeconds: number) {
  if (!el || !Number.isFinite(deltaSeconds)) return;
  seekTo(el.currentTime + deltaSeconds);
}

export function scratchRecord(strength: number, direction: number) {
  if (!el || !usePlaybackStore.getState().playing) return;
  scratchFx?.(strength, direction);
}

export function setVolume(v: number) {
  const nextVolume = Math.max(0, Math.min(1, v));
  usePlaybackStore.getState().setVolume(nextVolume);
  if (el) el.volume = nextVolume;
}
