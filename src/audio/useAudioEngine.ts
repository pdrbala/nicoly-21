import { useEffect, useRef } from 'react';
import { useEraStore } from '../store/useEraStore';
import { usePlaybackStore } from '../store/usePlaybackStore';
import { ERA_BY_ID } from '../data/eras';
import { play, registerAudioElement, registerBeforePlay, registerScratchFx } from './playerControls';
import { createScratchFx, type ScratchFx } from './scratchFx';

/**
 * Single HTMLAudioElement reused across eras. AnalyserNode reads the running
 * audio so the active card can pulse with the bass band.
 */
export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const scratchRef = useRef<ScratchFx | null>(null);
  const rafRef = useRef<number>(0);

  const selected = useEraStore((s) => s.selected);

  useEffect(() => {
    const el = new Audio();
    el.crossOrigin = 'anonymous';
    el.preload = 'auto';
    el.volume = usePlaybackStore.getState().volume;
    audioRef.current = el;
    registerAudioElement(el);
    registerBeforePlay(async () => {
      if (ctxRef.current?.state === 'suspended') {
        await ctxRef.current.resume();
      }
    });

    const onTime = () => usePlaybackStore.getState().setTime(el.currentTime);
    const onDur = () => usePlaybackStore.getState().setDuration(el.duration || 0);
    const onPlay = () => usePlaybackStore.getState().setPlaying(true);
    const onPause = () => usePlaybackStore.getState().setPlaying(false);
    const onEnded = () => usePlaybackStore.getState().setPlaying(false);
    const onSeek = () => usePlaybackStore.getState().setTime(el.currentTime);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onDur);
    el.addEventListener('durationchange', onDur);
    el.addEventListener('seeking', onSeek);
    el.addEventListener('seeked', onSeek);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);

    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onDur);
      el.removeEventListener('durationchange', onDur);
      el.removeEventListener('seeking', onSeek);
      el.removeEventListener('seeked', onSeek);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
      el.pause();
      registerScratchFx(null);
      scratchRef.current?.dispose();
      cancelAnimationFrame(rafRef.current);
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !selected) return;
    const era = ERA_BY_ID[selected];
    if (!era) return;
    if (!el.src.endsWith(era.audio)) {
      el.src = era.audio;
      const playback = usePlaybackStore.getState();
      playback.setTime(0);
      playback.setDuration(0);
      el.load();
    }
    const ensureCtx = async () => {
      if (!ctxRef.current) {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        const ctx: AudioContext = new AC();
        const src = ctx.createMediaElementSource(el);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        analyser.connect(ctx.destination);
        ctxRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = src;
        scratchRef.current = createScratchFx(ctx);
        registerScratchFx((strength, direction) => {
          scratchRef.current?.trigger(strength, direction);
        });
        const buf = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(buf);
          let sum = 0;
          const bassEnd = Math.min(8, buf.length);
          for (let i = 0; i < bassEnd; i++) sum += buf[i];
          const level = sum / (bassEnd * 255);
          const playback = usePlaybackStore.getState();
          playback.setLevel(level);
          playback.setTime(el.currentTime);
          if (Number.isFinite(el.duration)) playback.setDuration(el.duration || 0);
          rafRef.current = requestAnimationFrame(tick);
        };
        tick();
      }
      await play();
    };
    ensureCtx();
  }, [selected]);

  return { audioRef };
}
