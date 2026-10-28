import { lazy, Suspense, useCallback, useState } from 'react';
import type { Object3D } from 'three';
import { getModelInfo, type ModelDetails } from '@/twin/leva/getModelInfo';
import { SceneCanvas } from '@/twin/SceneCanvas';
import { ModelSelection } from '@/twin/ModelSelection';
import { SceneSwitcher } from '@/twin/SceneSwitcher';
import { scenes } from '@/project/scenes';

const SceneControls = import.meta.env.TUNER
  ? lazy(() => import('@/twin/leva/SceneControls'))
  : null;
const PerformanceInfoControls = lazy(() => import('@/twin/leva/PerformanceInfoControls'));
const LevaPanel = lazy(() => import('@/twin/leva/LevaPanel'));

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
