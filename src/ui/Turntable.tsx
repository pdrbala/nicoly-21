import { useRef, useState } from 'react';
import { useEraStore } from '../store/useEraStore';
import { usePlaybackStore } from '../store/usePlaybackStore';
import { ERA_BY_ID } from '../data/eras';
import { play, pause, toggle as togglePlay } from '../audio/playerControls';
import { TonearmSVG } from './Tonearm';
import { VinylLabel } from './VinylLabel';

// Snap thresholds (degrees). Dragging right parks the arm off the record and
// pauses. Dragging left drops it onto the groove and resumes.
const PLAY_ROTATION = -22;
const REST_ROTATION = 10;
const REST_THRESHOLD = 8;
const MIN_ROTATION = -28;
const MAX_ROTATION = 14;

export function Turntable() {
  const selected = useEraStore((s) => s.selected);
  const playing = usePlaybackStore((s) => s.playing);
  const era = selected ? ERA_BY_ID[selected] : null;

  const tonearmRef = useRef<HTMLDivElement>(null);
  const pivotRef = useRef<HTMLSpanElement>(null);
  // Manual rotation while the user is dragging. null = let CSS decide.
  const [manualAngle, setManualAngle] = useState<number | null>(null);
  // Mirror of manualAngle that survives the closure inside onPointerUp.
  const liveAngleRef = useRef<number>(0);
  const baselineRef = useRef<number>(-6);

  const onDeckClick = () => {
    if (!selected) return;
    togglePlay();
  };

  const onTonearmDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!pivotRef.current) return;
    e.preventDefault();

    const pr = pivotRef.current.getBoundingClientRect();
    const pivotX = pr.left + pr.width / 2;
    const pivotY = pr.top + pr.height / 2;

    const startCursorAngle =
      Math.atan2(e.clientY - pivotY, e.clientX - pivotX) * (180 / Math.PI);
    const baseline = playing ? PLAY_ROTATION : REST_ROTATION;
    baselineRef.current = baseline;
    const startRotation = manualAngle ?? baseline;
    liveAngleRef.current = startRotation;

    tonearmRef.current?.classList.add('dragging');
    document.body.classList.add('arm-dragging');

    const onMove = (ev: PointerEvent) => {
      const cursorAngle =
        Math.atan2(ev.clientY - pivotY, ev.clientX - pivotX) * (180 / Math.PI);
      const delta = cursorAngle - startCursorAngle;
      const target = startRotation + delta;
      const clamped = Math.max(MIN_ROTATION, Math.min(MAX_ROTATION, target));
      liveAngleRef.current = clamped;
      setManualAngle(clamped);
    };

    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      tonearmRef.current?.classList.remove('dragging');
      document.body.classList.remove('arm-dragging');

      const final = liveAngleRef.current;
      setManualAngle(null);
      if (!selected) return;
      if (final > REST_THRESHOLD) pause();
      else play();
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const armStyle =
    manualAngle !== null
      ? { transform: `rotate(${manualAngle}deg)`, transition: 'none' as const }
      : undefined;

  return (
    <div className="turntable">
      <div
        className="deck"
        onClick={onDeckClick}
        role={selected ? 'button' : undefined}
        aria-label={selected ? 'play/pause' : undefined}
      >
        <div className="platter" />
        <div className="label-disc">
          <VinylLabel
            name={era ? era.name : '— —'}
            year={era ? era.year : 'stand by'}
            track={era ? era.track : '—'}
            active={!!era}
          />
        </div>
      </div>
      <div className="tonearm" ref={tonearmRef} style={armStyle}>
        {/* Invariant anchor at the SVG pivot point — used by the drag handler
            to compute pointer angle relative to a fixed screen position. */}
        <span ref={pivotRef} className="pivot-anchor" />
        <TonearmSVG onPointerDown={onTonearmDown} />
      </div>
    </div>
  );
}
