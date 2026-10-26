import { Suspense } from 'react';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { sceneConfig } from '../project/scene';

function Model() {
  const { scene } = useGLTF(sceneConfig.modelUrl);
  return <primitive object={scene} />;
}

export function SceneCanvas() {
  return (
    <Canvas
      camera={{
        position: sceneConfig.camera.position,
        fov: sceneConfig.camera.fov,
      }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#0d1112']} />
      <ambientLight intensity={0.8} />
      <directionalLight intensity={2.5} position={[7, 11, 6]} />

      <Suspense fallback={null}>
        <Model />
      </Suspense>

      <OrbitControls makeDefault target={sceneConfig.controlsTarget} />
    </Canvas>
  );
}

useGLTF.preload(sceneConfig.modelUrl);
