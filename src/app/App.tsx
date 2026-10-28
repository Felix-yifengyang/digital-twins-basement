import { lazy, Suspense, useCallback, useState } from 'react';
import type { Object3D } from 'three';
import { getModelInfo, type ModelDetails } from '@/twin/panel/getModelInfo';
import { SceneCanvas } from '@/twin/SceneCanvas';
import { ModelSelection } from '@/twin/selection/ModelSelection';
import { SceneSwitcher } from '@/twin/scene/SceneSwitcher';
import { scenes } from '@/project/scenes';

const SceneControls = import.meta.env.TUNER
  ? lazy(() => import('@/twin/panel/SceneControls'))
  : null;
const PerformanceInfoControls = lazy(() => import('@/twin/panel/PerformanceInfoControls'));
const LevaPanel = lazy(() => import('@/twin/panel/LevaPanel'));

export function App() {
  const [details, setDetails] = useState<ModelDetails | null>(null);
  const inspect = useCallback((object: Object3D | null) => {
    setDetails(object ? getModelInfo(object) : null);
  }, []);

  return (
    <>
      <SceneSwitcher scenes={scenes}>
        {(config) => (
          <SceneCanvas
            config={config}
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
        )}
      </SceneSwitcher>
      <Suspense fallback={null}>
        <LevaPanel details={details} />
      </Suspense>
    </>
  );
}
