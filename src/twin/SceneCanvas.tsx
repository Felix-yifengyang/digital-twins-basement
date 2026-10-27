import { Suspense, useRef, useState, type ReactNode, type RefObject } from 'react';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { DirectionalLight } from 'three';
import { sceneConfig } from '@/project/scene';

const modelUrl = `${import.meta.env.BASE_URL}${sceneConfig.modelPath}`;

export type SceneValues = {
  background: string;
  ambientIntensity: number;
  intensity: number;
  color: string;
  position: [number, number, number];
};

function Model() {
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} />;
}

type Props = {
  children?: (scene: {
    light: RefObject<DirectionalLight>;
    onChange: (values: SceneValues) => void;
  }) => ReactNode;
};

export function SceneCanvas({ children }: Props) {
  const [values, setValues] = useState<SceneValues>({
    background: sceneConfig.background,
    ...sceneConfig.lighting,
    position: [...sceneConfig.lighting.position],
  });
  const light = useRef<DirectionalLight>(null!);
  return (
    <Canvas camera={sceneConfig.camera}>
      <color attach="background" args={[values.background]} />
      <ambientLight intensity={values.ambientIntensity} />
      <directionalLight ref={light} intensity={values.intensity} color={values.color} position={values.position} />
      <Suspense fallback={null}><Model /></Suspense>
      <OrbitControls makeDefault target={sceneConfig.controlsTarget} />
      {children?.({ light, onChange: setValues })}
    </Canvas>
  );
}
