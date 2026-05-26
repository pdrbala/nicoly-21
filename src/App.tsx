import { useEffect } from 'react';
import { useEraStore } from './store/useEraStore';
import { useAudioEngine } from './audio/useAudioEngine';
import { tweenVars, flashTransition } from './anim/eraTransition';
import { ERA_BY_ID } from './data/eras';
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

  // apply theme + flash on era change
  useEffect(() => {
    if (!selected) return;
    const era = ERA_BY_ID[selected];
    flashTransition();
    tweenVars(era);
    document.body.classList.add('playing');
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
