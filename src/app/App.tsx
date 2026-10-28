import { lazy, Suspense, useCallback, useState } from 'react';
import type { Object3D } from 'three';
import { getModelInfo, type ModelDetails } from '@/twin/leva/getModelInfo';
import { SceneCanvas } from '@/twin/SceneCanvas';
import { ModelSelection } from '@/twin/ModelSelection';
import { scenes } from '@/project/scenes';

const SceneControls = import.meta.env.TUNER
  ? lazy(() => import('@/twin/leva/SceneControls'))
  : null;
const PerformanceInfoControls = lazy(() => import('@/twin/leva/PerformanceInfoControls'));
const LevaPanel = lazy(() => import('@/twin/leva/LevaPanel'));

export function App() {
  const [sceneId, setSceneId] = useState(scenes[0].id);
  const activeScene = scenes.find((scene) => scene.id === sceneId)!;
  const [details, setDetails] = useState<ModelDetails | null>(null);
  const inspect = useCallback((object: Object3D | null) => {
    setDetails(object ? getModelInfo(object) : null);
  }, []);

  return (
    <>
      <label className="scene-switcher">
        场景
        <select value={sceneId} onChange={(event) => setSceneId(event.target.value)}>
          {scenes.map((scene) => <option key={scene.id} value={scene.id}>{scene.name}</option>)}
        </select>
      </label>
      <SceneCanvas
        config={activeScene.config}
        renderModel={(model) => (
          <ModelSelection onSelect={inspect}>
            <primitive object={model} />
          </ModelSelection>
        )}
      >
        {(scene) => (
          <Suspense fallback={null}>
            {SceneControls && <SceneControls {...scene} />}
            <PerformanceInfoControls getCacheInfo={scene.getCacheInfo} />
          </Suspense>
        )}
      </SceneCanvas>
      <Suspense fallback={null}>
        <LevaPanel details={details} />
      </Suspense>
    </>
  );
}
