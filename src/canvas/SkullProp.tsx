import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Color, Group, MeshStandardMaterial } from 'three';
import { useEraStore } from '../store/useEraStore';
import { usePlaybackStore } from '../store/usePlaybackStore';
import { ERA_BY_ID } from '../data/eras';

export function SkullProp() {
  const group = useRef<Group>(null);
  const gltf = useGLTF('models/skull.glb');
  const selected = useEraStore((s) => s.selected);
  const era = selected ? ERA_BY_ID[selected] : null;

  // Cache the materials we need to pulse so we don't traverse every frame.
  const materialsRef = useRef<MeshStandardMaterial[]>([]);
  const baseEmissiveRef = useRef(0.35);

  // Apply per-era material AND collect material refs for the per-frame pulse loop.
  useEffect(() => {
    if (!gltf.scene) return;
    const mat = era?.skullMaterial;
    const collected: MeshStandardMaterial[] = [];
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
        collected.push(obj.material);
      }
    });
    materialsRef.current = collected;
    baseEmissiveRef.current = mat ? 0.35 : 0.1;
  }, [gltf.scene, era]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const lv = usePlaybackStore.getState().level; // 0..1, bass band of analyser

    // Hover near her head, with extra bounce on bass hits
    group.current.position.y = 1.4 + Math.sin(t * 0.9) * 0.06 + lv * 0.18;
    // Gentle sway, then a punch of rotation on bass
    group.current.rotation.y = Math.sin(t * 0.5) * 0.35 + lv * 0.18;
    group.current.rotation.z = Math.sin(t * 0.6) * 0.05 - lv * 0.08;
    // Scale pulse, kept subtle so it reads as "alive" not "jumpy"
    const s = 1 + lv * 0.18;
    group.current.scale.setScalar(s);

    // Emissive intensity follows the bass for a glow heartbeat
    const targetEmissive = baseEmissiveRef.current + lv * 1.4;
    for (const m of materialsRef.current) m.emissiveIntensity = targetEmissive;
  });

  return (
    <group ref={group} position={[-0.85, 1.4, 0.6]} scale={0.35}>
      <primitive object={gltf.scene} />
    </group>
  );
}

useGLTF.preload('models/skull.glb');
