import { lazy, Suspense } from 'react';
import { SceneCanvas } from '@/twin/SceneCanvas';

const SceneTuner = import.meta.env.TUNER
  ? lazy(() => import('@/twin/SceneTuner'))
  : null;

export function App() {
  return (
    <SceneCanvas>
      {(scene) => SceneTuner && (
        <Suspense fallback={null}>
          <SceneTuner {...scene} />
        </Suspense>
      )}
    </SceneCanvas>
  );
}
