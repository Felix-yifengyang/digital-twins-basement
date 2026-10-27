import { lazy, Suspense, useRef, useState } from 'react';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { DirectionalLight } from 'three';
import { sceneConfig } from '@/project/scene';

const SceneTuner = import.meta.env.DEV
  ? lazy(() => import('@/twin/SceneTuner'))
  : null;
const modelUrl = `${import.meta.env.BASE_URL}${sceneConfig.modelPath}`;

export type SceneValues = {
  background: string;
  ambientIntensity: number;
  intensity: number;
  color: string;
  position: [number, number, number];
  fov: number;
};

function Model() {
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} />;
}

function Scene() {
  const [values, setValues] = useState<SceneValues>({
    background: sceneConfig.background,
    ...sceneConfig.lighting,
    position: [...sceneConfig.lighting.position],
    fov: sceneConfig.camera.fov,
  });
  const light = useRef<DirectionalLight>(null!);
  return (
    <>
      <color attach="background" args={[values.background]} />
      <ambientLight intensity={values.ambientIntensity} />
      <directionalLight ref={light} intensity={values.intensity} color={values.color} position={values.position} />
      <Suspense fallback={null}><Model /></Suspense>
      <OrbitControls makeDefault target={sceneConfig.controlsTarget} />
      {SceneTuner && (
        <Suspense fallback={null}>
          <SceneTuner light={light} onChange={setValues} />
        </Suspense>
      )}
    </>
  );
}

export function SceneCanvas() {
  return (
    <Canvas camera={{ position: sceneConfig.camera.position, fov: sceneConfig.camera.fov }} gl={{ antialias: true }}>
      <Scene />
    </Canvas>
  );
}

useGLTF.preload(modelUrl);
