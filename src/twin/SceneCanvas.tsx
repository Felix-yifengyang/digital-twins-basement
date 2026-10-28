import { useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Bounds, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { DirectionalLight, type Group } from 'three';
import type { SceneConfig } from '@/project/scene';
import { resolveSceneConfig, type SceneSettings } from '@/twin/scene/sceneSettings';
import { ModelBounds } from '@/twin/scene/ModelBounds';
import { Model } from '@/twin/model/Model';
import type { ModelCacheInfo } from '@/twin/model/modelResources';

export type SceneValues = {
  background: string;
  ambientIntensity: number;
  intensity: number;
  color: string;
  position: [number, number, number];
};

type Tools = {
  getCacheInfo: () => ModelCacheInfo;
  light: RefObject<DirectionalLight>;
  onChange: (values: SceneValues) => void;
  settings: SceneSettings;
};

type Props = {
  config: SceneConfig;
  renderModel?: (scene: Group) => ReactNode;
  children?: (scene: Tools) => ReactNode;
};

function SceneContent({ model, settings, getCacheInfo, renderModel, children }: {
  getCacheInfo: () => ModelCacheInfo;
  model: Group;
  settings: SceneSettings;
} & Omit<Props, 'config'>) {
  const [values, setValues] = useState<SceneValues>({
    background: settings.background,
    ...settings.lighting,
  });
  const light = useRef<DirectionalLight>(null!);

  return (
    <>
      <color attach="background" args={[values.background]} />
      <ambientLight intensity={values.ambientIntensity} />
      <directionalLight ref={light} intensity={values.intensity} color={values.color} position={values.position} />
      <OrbitControls makeDefault />
      <Bounds margin={1.2} maxDuration={0}>
        <ModelBounds model={model} settings={settings}>
          {renderModel ? renderModel(model) : <primitive object={model} />}
        </ModelBounds>
      </Bounds>
      {children?.({ light, onChange: setValues, settings, getCacheInfo })}
    </>
  );
}

export function SceneCanvas({ config, renderModel, children }: Props) {
  const settings = useMemo(() => resolveSceneConfig(config), [config]);
  const url = new URL(settings.modelPath, new URL(import.meta.env.BASE_URL, window.location.href)).href;

  return (
    <Canvas camera={{ position: [8, 5.5, 9], fov: 42 }}>
      <Model url={url} context={settings}>
        {(model, loadedSettings, getCacheInfo) => (
          <SceneContent key={`${model.uuid}:${loadedSettings.modelPath}`} model={model} settings={loadedSettings} getCacheInfo={getCacheInfo} renderModel={renderModel}>
            {children}
          </SceneContent>
        )}
      </Model>
    </Canvas>
  );
}
