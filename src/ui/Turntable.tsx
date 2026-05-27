import { type CSSProperties, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useEraStore } from '../store/useEraStore';
import { usePlaybackStore } from '../store/usePlaybackStore';
import { ERA_BY_ID, type EraId } from '../data/eras';
import {
  nudgeBy,
  play,
  pause,
  scratchRecord,
  toggle as togglePlay,
} from '../audio/playerControls';
import { TonearmSVG } from './Tonearm';
import { VinylLabel } from './VinylLabel';

// Snap thresholds (degrees). Dragging right parks the arm off the record and
// pauses. Dragging left drops it onto the groove and resumes.
const PLAY_ROTATION = -22;
const REST_ROTATION = 10;
const REST_THRESHOLD = 8;
const MIN_ROTATION = -28;
const MAX_ROTATION = 14;
const SCRUB_SECONDS_PER_ROTATION = 1.8;

function normalizeAngleDelta(value: number) {
  let normalized = value % 360;
  if (normalized > 180) normalized -= 360;
  if (normalized < -180) normalized += 360;
  return normalized;
}

export function Turntable() {
  const selected = useEraStore((s) => s.selected);
  const playing = usePlaybackStore((s) => s.playing);
  const [displayedSelected, setDisplayedSelected] = useState<EraId | null>(selected);
  const [flipping, setFlipping] = useState(false);
  const flipTlRef = useRef<gsap.core.Timeline | null>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const discRotationRef = useRef(0);
  const didScratchDragRef = useRef(false);
  const era = displayedSelected ? ERA_BY_ID[displayedSelected] : null;
  const deckClassName = `deck${era?.recordImage ? ' deck--record' : ''}${flipping ? ' deck--flipping' : ''}`;
  const recordStyle = era?.recordImage
    ? ({ '--record-image': `url('/${era.recordImage}')` } as CSSProperties)
    : undefined;

  const tonearmRef = useRef<HTMLDivElement>(null);
  const pivotRef = useRef<HTMLSpanElement>(null);
  // Manual rotation while the user is dragging. null = let CSS decide.
  const [manualAngle, setManualAngle] = useState<number | null>(null);
  // Mirror of manualAngle that survives the closure inside onPointerUp.
  const liveAngleRef = useRef<number>(0);
  const baselineRef = useRef<number>(-6);

  useEffect(() => {
    if (selected === displayedSelected) return;

    flipTlRef.current?.kill();

    if (!selected || !displayedSelected) {
      setDisplayedSelected(selected);
      setFlipping(false);
      return;
    }

    const disc = discRef.current;
    const nextEra = ERA_BY_ID[selected];
    if (!disc) {
      setDisplayedSelected(selected);
      return;
    }

    setFlipping(true);

    gsap.set(disc, {
      rotateY: 0,
      scale: 1,
      filter: 'brightness(1)',
      transformOrigin: '50% 50%',
      transformPerspective: 1100,
    });

    flipTlRef.current = gsap
      .timeline({
        defaults: { overwrite: true },
        onComplete: () => {
          gsap.set(disc, { clearProps: 'transform,filter' });
          setDisplayedSelected(selected);
          setFlipping(false);
          flipTlRef.current = null;
        },
      })
      .to(disc, {
        rotateY: 88,
        scale: 0.992,
        filter: 'brightness(0.72)',
        duration: 0.34,
        ease: 'power2.in',
      })
      .call(() => {
        disc.style.setProperty('--record-image', `url('/${nextEra.recordImage}')`);
        setDisplayedSelected(selected);
        gsap.set(disc, { rotateY: -88 });
      })
      .to(disc, {
        rotateY: 0,
        scale: 1,
        filter: 'brightness(1)',
        duration: 0.56,
        ease: 'power3.out',
      });
  }, [selected, displayedSelected]);

  useEffect(() => {
    return () => {
      flipTlRef.current?.kill();
    };
  }, []);

  const onDeckClick = () => {
    if (didScratchDragRef.current) {
      didScratchDragRef.current = false;
      return;
    }
    if (!selected) return;
    togglePlay();
  };

  const onDeckDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!selected || !deckRef.current || !discRef.current || flipping) return;
    if ((e.target as HTMLElement).closest('.tonearm')) return;

    e.preventDefault();
    deckRef.current.setPointerCapture(e.pointerId);

    const deckRect = deckRef.current.getBoundingClientRect();
    const centerX = deckRect.left + deckRect.width / 2;
    const centerY = deckRect.top + deckRect.height / 2;
    let previousAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    let movedDistance = 0;
    let lastMoveAt = performance.now();

    deckRef.current.classList.add('is-scratching');

    const onMove = (ev: PointerEvent) => {
      const angle = Math.atan2(ev.clientY - centerY, ev.clientX - centerX) * (180 / Math.PI);
      const delta = normalizeAngleDelta(angle - previousAngle);
      previousAngle = angle;
      if (Math.abs(delta) < 0.2) return;

      movedDistance += Math.abs(delta);
      if (movedDistance > 3) didScratchDragRef.current = true;

      const now = performance.now();
      const elapsed = Math.max(16, now - lastMoveAt);
      lastMoveAt = now;
      const strength = Math.min(42, (Math.abs(delta) / elapsed) * 140);
      const direction = Math.sign(delta) || 1;

      discRotationRef.current += delta;
      discRef.current?.style.setProperty('transform', `rotate(${discRotationRef.current}deg)`);
      nudgeBy((delta / 360) * SCRUB_SECONDS_PER_ROTATION);
      scratchRecord(strength, direction);
    };

    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      deckRef.current?.classList.remove('is-scratching');
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const onTonearmDown = (e: React.PointerEvent<HTMLElement>) => {
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
        ref={deckRef}
        className={deckClassName}
        onClick={onDeckClick}
        onPointerDown={onDeckDown}
        role={selected ? 'button' : undefined}
        aria-label={selected ? 'play/pause' : undefined}
      >
        <div className="disc-plane disc-plane--current" ref={discRef} style={recordStyle}>
          <div className="platter" />
        </div>
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
        <div className="tonearm-grab tonearm-grab--counterweight" onPointerDown={onTonearmDown} />
        <div className="tonearm-grab tonearm-grab--pivot" onPointerDown={onTonearmDown} />
        <div className="tonearm-grab tonearm-grab--tube" onPointerDown={onTonearmDown} />
        <div className="tonearm-grab tonearm-grab--head" onPointerDown={onTonearmDown} />
        <TonearmSVG />
      </div>
    </div>
  );
}
