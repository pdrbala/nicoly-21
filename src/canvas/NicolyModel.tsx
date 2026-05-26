import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Box3, Group, MeshStandardMaterial, Vector3 } from 'three';
import { useEraStore } from '../store/useEraStore';
import { usePlaybackStore } from '../store/usePlaybackStore';
import { ERA_BY_ID } from '../data/eras';

const TARGET_HEIGHT = 2.4;

interface Fit {
  scale: number;
  offset: [number, number, number]; // applied to the scaled model to bring its centroid to world origin
}

export function NicolyModel() {
  const outer = useRef<Group>(null);
  const gltf = useGLTF('models/nicoly.glb');
  const selected = useEraStore((s) => s.selected);
  const era = selected ? ERA_BY_ID[selected] : null;
  const [fit, setFit] = useState<Fit>({ scale: 1, offset: [0, 0, 0] });

  // Measure the model AFTER it is in the scene graph (world matrices valid),
  // then compute scale + the offset that re-centers its centroid at world (0,0,0).
  useLayoutEffect(() => {
    if (!gltf.scene) return;
    gltf.scene.updateMatrixWorld(true);
    const box = new Box3().setFromObject(gltf.scene);
    const size = new Vector3();
    const center = new Vector3();
    box.getSize(size);
    box.getCenter(center);
    if (size.y < 0.01) return;
    const s = TARGET_HEIGHT / size.y;
    setFit({
      scale: s,
      // after we apply scale to the inner group, the centroid moves to center*s,
      // so we negate that to bring it back to origin
      offset: [-center.x * s, -center.y * s, -center.z * s],
    });
  }, [gltf.scene]);

  useEffect(() => {
    if (!gltf.scene || !era) return;
    gltf.scene.traverse((obj: any) => {
      if (obj.isMesh && obj.material instanceof MeshStandardMaterial) {
        obj.material.emissive.set(era.accent);
        obj.material.emissiveIntensity = 0.1;
      }
    });
  }, [gltf.scene, era]);

  useFrame((state) => {
    if (!outer.current) return;
    const t = state.clock.elapsedTime;
    const lv = usePlaybackStore.getState().level;
    outer.current.position.y = Math.sin(t * 0.6) * 0.04;
    // Tripo exported this model facing +X (perfil to camera). Rotate -90° (−π/2)
    // around Y to bring the face toward the camera, then add subtle sway.
    outer.current.rotation.y = -Math.PI / 2 + Math.sin(t * 0.4) * 0.12;
    outer.current.scale.setScalar(1 + lv * 0.05);
  });

  return (
    <group ref={outer}>
      <group position={fit.offset} scale={fit.scale}>
        <primitive object={gltf.scene} />
      </group>
    </group>
  );
}

useGLTF.preload('models/nicoly.glb');
