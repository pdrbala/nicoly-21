import { playNeedleDropFx, playNeedleLiftFx } from './recordNeedleFx';
import { usePlaybackStore } from '../store/usePlaybackStore';

/**
 * Module-level handle to the single HTMLAudioElement created by useAudioEngine.
 * UI components import the action functions and call them — the store stays a
 * pure state container; this is the thin imperative side-effect layer.
 */
let el: HTMLAudioElement | null = null;
let beforePlay: (() => Promise<void>) | null = null;

export function registerAudioElement(audio: HTMLAudioElement) {
  el = audio;
}

export function registerBeforePlay(callback: () => Promise<void>) {
  beforePlay = callback;
}

export async function play() {
  const playback = usePlaybackStore.getState();
  if (!playback.playing) playNeedleDropFx();
  playback.setPlaying(true);
  if (!el) return Promise.resolve();
  await beforePlay?.();
  return el.play().catch(() => {
    /* Keep the needle/record state alive even if the media file is missing. */
  });
}

export function pause() {
  const playback = usePlaybackStore.getState();
  if (playback.playing) playNeedleLiftFx();
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
  playNeedleDropFx();
  return el.play().catch(() => {});
}

export function seekTo(t: number) {
  if (!el) return;
  el.currentTime = t;
}
