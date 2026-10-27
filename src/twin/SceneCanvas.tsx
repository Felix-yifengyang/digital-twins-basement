import { useRef, useState, type ReactNode, type RefObject } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { DirectionalLight, type Group } from 'three';
import { sceneConfig } from '@/project/scene';
import { Model } from '@/twin/Model';

const modelUrl = `${import.meta.env.BASE_URL}${sceneConfig.modelPath}`;

export type SceneValues = {
  background: string;
  ambientIntensity: number;
  intensity: number;
  color: string;
  position: [number, number, number];
};

type Props = {
  modelUrl?: string;
  renderModel?: (scene: Group) => ReactNode;
  children?: (scene: {
    light: RefObject<DirectionalLight>;
    onChange: (values: SceneValues) => void;
  }) => ReactNode;
};

export function SceneCanvas({ children, renderModel, modelUrl: url = modelUrl }: Props) {
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
      <Model url={url}>{renderModel}</Model>
      <OrbitControls makeDefault target={sceneConfig.controlsTarget} />
      {children?.({ light, onChange: setValues })}
    </Canvas>
  );
}
