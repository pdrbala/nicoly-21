import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Center, useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Box3, Group, MeshStandardMaterial, Vector3 } from 'three';
import { useEraStore } from '../store/useEraStore';
import { usePlaybackStore } from '../store/usePlaybackStore';
import { ERA_BY_ID } from '../data/eras';

const TARGET_HEIGHT = 2.4;

export function NicolyModel() {
  const outer = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const gltf = useGLTF('models/nicoly.glb');
  const selected = useEraStore((s) => s.selected);
  const era = selected ? ERA_BY_ID[selected] : null;
  const [fitScale, setFitScale] = useState(1);

  // Measure AFTER the model is mounted into the scene so world matrices are valid.
  useLayoutEffect(() => {
    if (!gltf.scene) return;
    gltf.scene.updateMatrixWorld(true);
    const box = new Box3().setFromObject(gltf.scene);
    const size = new Vector3();
    box.getSize(size);
    if (size.y > 0.01) {
      setFitScale(TARGET_HEIGHT / size.y);
    }
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
    outer.current.rotation.y = Math.PI + Math.sin(t * 0.4) * 0.12;
    outer.current.scale.setScalar(1 + lv * 0.05);
  });

  return (
    <group ref={outer}>
      <Center disableY={false} disableZ={false}>
        <group ref={inner} scale={fitScale}>
          <primitive object={gltf.scene} />
        </group>
      </Center>
    </group>
  );
}

useGLTF.preload('models/nicoly.glb');
