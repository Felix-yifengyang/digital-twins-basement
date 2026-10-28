import { useRef, useState, type ReactNode, type RefObject } from 'react';
import { Bounds, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { DirectionalLight, type Group } from 'three';
import { sceneSettings } from '@/twin/sceneSettings';
import { ModelBounds } from '@/twin/ModelBounds';
import { Model } from '@/twin/Model';

const modelUrl = `${import.meta.env.BASE_URL}${sceneSettings.modelPath}`;

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
    background: sceneSettings.background,
    ...sceneSettings.lighting,
    position: [...sceneSettings.lighting.position],
  });
  const light = useRef<DirectionalLight>(null!);
  return (
    <Canvas camera={sceneSettings.camera}>
      <color attach="background" args={[values.background]} />
      <ambientLight intensity={values.ambientIntensity} />
      <directionalLight ref={light} intensity={values.intensity} color={values.color} position={values.position} />
      <Bounds margin={1.2} maxDuration={0}>
        <Model url={url}>
          {(model) => (
            <ModelBounds model={model} autoFit={!sceneSettings.customView || url !== modelUrl}>
              {renderModel ? renderModel(model) : <primitive object={model} />}
            </ModelBounds>
          )}
        </Model>
      </Bounds>
      <OrbitControls makeDefault target={sceneSettings.target} />
      {children?.({ light, onChange: setValues })}
    </Canvas>
  );
}
