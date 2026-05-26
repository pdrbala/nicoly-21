import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Color, Group, MeshStandardMaterial } from 'three';
import { useEraStore } from '../store/useEraStore';
import { ERA_BY_ID } from '../data/eras';

export function SkullProp() {
  const group = useRef<Group>(null);
  const gltf = useGLTF('models/skull.glb');
  const selected = useEraStore((s) => s.selected);
  const era = selected ? ERA_BY_ID[selected] : null;

  // apply per-era material
  useEffect(() => {
    if (!gltf.scene) return;
    const mat = era?.skullMaterial;
    gltf.scene.traverse((obj: any) => {
      if (obj.isMesh && obj.material instanceof MeshStandardMaterial) {
        if (mat) {
          obj.material.color = new Color(mat.color);
          obj.material.emissive = new Color(mat.emissive);
          obj.material.emissiveIntensity = 0.35;
          obj.material.metalness = mat.metalness;
          obj.material.roughness = mat.roughness;
        } else {
          obj.material.color = new Color('#e0d8d2');
          obj.material.emissive = new Color('#1a0d0a');
          obj.material.emissiveIntensity = 0.1;
          obj.material.metalness = 0.1;
          obj.material.roughness = 0.6;
        }
      }
    });
  }, [gltf.scene, era]);

  useFrame((state, dt) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    // Hover next to her shoulder/head with a gentle bob
    group.current.position.y = 1.55 + Math.sin(t * 0.9) * 0.06;
    // Subtle sway, not a full spin — face mostly toward the camera
    group.current.rotation.y = Math.sin(t * 0.5) * 0.35;
    group.current.rotation.z = Math.sin(t * 0.6) * 0.05;
  });

  return (
    <group ref={group} position={[0.55, 1.55, 0.4]} scale={0.32}>
      <primitive object={gltf.scene} />
    </group>
  );
}

useGLTF.preload('models/skull.glb');
