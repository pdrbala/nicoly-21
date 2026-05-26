import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useEraStore } from '../store/useEraStore';

const BASE_POS: [number, number, number] = [0, 0.4, 6.6];

/**
 * Cinematic camera reaction on era change:
 *  - quick dolly-out (z back ~0.9)
 *  - small lateral shake on x
 *  - ease back to the base pose
 * Pure GSAP, no per-frame state.
 */
export function CameraDriver() {
  const camera = useThree((s) => s.camera);
  const selected = useEraStore((s) => s.selected);
  const prev = useRef<string | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    camera.position.set(...BASE_POS);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useEffect(() => {
    if (!selected) {
      prev.current = null;
      return;
    }
    const isFirst = prev.current === null;
    prev.current = selected;

    tl.current?.kill();
    const t = gsap.timeline();

    if (isFirst) {
      // First selection out of stand-by — gentle push-in only.
      t.fromTo(
        camera.position,
        { x: BASE_POS[0], y: BASE_POS[1], z: BASE_POS[2] + 1.3 },
        { x: BASE_POS[0], y: BASE_POS[1], z: BASE_POS[2], duration: 1.4, ease: 'power3.out' }
      );
    } else {
      // Era→era swap: dolly out + tiny shake, then settle.
      t.to(camera.position, {
        z: BASE_POS[2] + 0.9,
        duration: 0.22,
        ease: 'power2.out',
      })
        .to(camera.position, {
          x: BASE_POS[0] + 0.08,
          duration: 0.08,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: 3,
        })
        .to(camera.position, {
          x: BASE_POS[0],
          y: BASE_POS[1],
          z: BASE_POS[2],
          duration: 0.95,
          ease: 'power3.inOut',
        });
    }
    tl.current = t;

    return () => {
      t.kill();
    };
  }, [selected, camera]);

  return null;
}
