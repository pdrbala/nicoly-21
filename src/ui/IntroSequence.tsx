import { useEffect, useRef, useState } from 'react';
import { useEraStore } from '../store/useEraStore';

const HOLD_MS = 3200;
const FADE_MS = 800;

export function IntroSequence() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [fading, setFading] = useState(false);
  const finishIntro = useEraStore((s) => s.finishIntro);

  useEffect(() => {
    const t1 = window.setTimeout(() => setFading(true), HOLD_MS);
    const t2 = window.setTimeout(() => finishIntro(), HOLD_MS + FADE_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [finishIntro]);

  return (
    <>
      <div className={`intro-overlay ${fading ? 'fading' : ''}`} ref={overlayRef}>
        <div className="intro-vinyl">
          <div className="intro-label">
            <div className="nm">Nicoly · 21</div>
            <div className="yr">— side a —</div>
          </div>
        </div>
      </div>
      <button className="skip" onClick={() => finishIntro()}>
        Pular intro
      </button>
    </>
  );
}
