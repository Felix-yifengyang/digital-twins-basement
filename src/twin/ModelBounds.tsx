import { useLayoutEffect, type ReactNode } from 'react';
import { useBounds } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { PerspectiveCamera, Vector3, type Group } from 'three';
import type { SceneSettings } from '@/twin/sceneSettings';

type Props = { model: Group; settings: SceneSettings; children: ReactNode };

export function ModelBounds({ model, settings, children }: Props) {
  const bounds = useBounds();
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const controls = useThree((state) => state.controls);

  useLayoutEffect(() => {
    camera.fov = settings.camera.fov;
    camera.position.set(...settings.camera.position);
    camera.updateProjectionMatrix();
    if (controls && 'target' in controls && controls.target instanceof Vector3) {
      controls.target.set(...settings.target);
      camera.lookAt(controls.target);
    }
    bounds.refresh(model).clip();
    if (!settings.customView) bounds.fit();
  }, [bounds, camera, controls, model, settings]);

  return <>{children}</>;
}
