import { lazy, Suspense, useCallback, useState } from 'react';
import type { Object3D } from 'three';
import { getModelInfo, type ModelDetails } from '@/twin/leva/getModelInfo';
import { SceneCanvas } from '@/twin/SceneCanvas';
import { ModelSelection } from '@/twin/ModelSelection';

const SceneControls = import.meta.env.TUNER
  ? lazy(() => import('@/twin/leva/SceneControls'))
  : null;
const LevaPanel = lazy(() => import('@/twin/leva/LevaPanel'));

export function App() {
  const [details, setDetails] = useState<ModelDetails | null>(null);
  const inspect = useCallback((object: Object3D | null) => {
    setDetails(object ? getModelInfo(object) : null);
  }, []);

  return (
    <>
      <SceneCanvas
        renderModel={(model) => (
          <ModelSelection onSelect={inspect}>
            <primitive object={model} />
          </ModelSelection>
        )}
      >
        {(scene) => SceneControls && (
          <Suspense fallback={null}>
            <SceneControls {...scene} />
          </Suspense>
        )}
      </SceneCanvas>
      <Suspense fallback={null}>
        <LevaPanel details={details} />
      </Suspense>
    </>
  );
}
