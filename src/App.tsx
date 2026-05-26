import { useEffect, useRef } from 'react';
import { useEraStore } from './store/useEraStore';
import { useAudioEngine } from './audio/useAudioEngine';
import { tweenVars, flashTransition, liftTonearm } from './anim/eraTransition';
import { ERA_BY_ID, type EraId } from './data/eras';
import { Chrome } from './ui/Chrome';
import { Turntable } from './ui/Turntable';
import { LinerNotes } from './ui/LinerNotes';
import { DialShelf } from './ui/DialShelf';
import { AudioToggle } from './ui/AudioToggle';
import { Footer } from './ui/Footer';
import { IntroSequence } from './ui/IntroSequence';
import { Scene3D } from './canvas/Scene3D';

export default function App() {
  const selected = useEraStore((s) => s.selected);
  const introDone = useEraStore((s) => s.introDone);

  useAudioEngine();

  // R3F's ResizeObserver sometimes misses the initial parent-size measurement
  // when the canvas mounts inside a grid cell. Nudge it once.
  useEffect(() => {
    const id = window.setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    return () => window.clearTimeout(id);
  }, []);

  // apply theme + flash on era change; lift tonearm on era→era swaps
  const prevEraRef = useRef<EraId | null>(null);
  useEffect(() => {
    if (!selected) {
      prevEraRef.current = null;
      return;
    }
    const era = ERA_BY_ID[selected];
    flashTransition();
    tweenVars(era);
    document.body.classList.add('playing');
    // Only lift the tonearm when switching between two playing eras —
    // not on the first selection out of stand-by (the CSS handles that).
    if (prevEraRef.current && prevEraRef.current !== selected) {
      liftTonearm();
    }
    prevEraRef.current = selected;
  }, [selected]);

  // remove .playing on stand-by
  useEffect(() => {
    if (!selected) document.body.classList.remove('playing');
  }, [selected]);

  return (
    <>
      <div className="grain" />
      <div className="vignette" />
      <div className="bk tl" />
      <div className="bk tr" />
      <div className="bk bl" />
      <div className="bk br" />

      <Chrome />

      <main className="stage">
        <Turntable />
        <LinerNotes />
        <Scene3D />
      </main>

      <DialShelf />
      <Footer />
      <AudioToggle />

      {!introDone && <IntroSequence />}
    </>
  );
}
