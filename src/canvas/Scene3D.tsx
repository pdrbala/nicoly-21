import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { NicolyModel } from './NicolyModel';
import { SkullProp } from './SkullProp';
import { CameraDriver } from './CameraDriver';
import { useEraStore } from '../store/useEraStore';
import { ERA_BY_ID } from '../data/eras';

function RimLight() {
  const selected = useEraStore((s) => s.selected);
  const era = selected ? ERA_BY_ID[selected] : null;
  const c = era?.accent ?? '#c0c0c0';
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color={'#ffffff'} />
      <pointLight position={[-3, 2, -2]} intensity={2.2} color={c} distance={12} />
      <pointLight position={[2, -1, 3]} intensity={1.0} color={c} distance={10} />
    </>
  );
}

export function Scene3D() {
  return (
    <div className="canvas-wrap">
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0.4, 6.6], fov: 30, near: 0.1, far: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        resize={{ debounce: 100, scroll: false, offsetSize: true }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <CameraDriver />
          <RimLight />
          <Environment preset="night" />
          <NicolyModel />
          <SkullProp />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableRotate={false}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
