import { useEffect, type RefObject } from 'react';
import { useThree } from '@react-three/fiber';
import { useHelper } from '@react-three/drei';
import { button, useControls } from 'leva';
import { DirectionalLightHelper, PerspectiveCamera, Vector3, type DirectionalLight } from 'three';
import { sceneConfig } from '@/project/scene';
import { getSceneControls } from '@/twin/leva/getSceneControls';
import type { SceneValues } from '@/twin/SceneCanvas';

type Props = {
  light: RefObject<DirectionalLight>;
  onChange: (values: SceneValues) => void;
};

export default function SceneControls({ light, onChange }: Props) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const get = useThree((state) => state.get);
  const [values, , read] = useControls('场景调参', () => ({
    ...getSceneControls(),
    '复制配置': button(async () => {
      const controls = get().controls;
      if (!controls || !('target' in controls) || !(controls.target instanceof Vector3)) return;
      const roundPosition = (position: readonly number[]) => position.map((value) => Math.round(value * 10) / 10);
      const config = {
        ...sceneConfig,
        camera: {
          position: roundPosition(camera.position.toArray()),
          target: roundPosition(controls.target.toArray()),
          fov: read('fov'),
        },
        background: read('background'),
        lighting: {
          ambientIntensity: read('ambientIntensity'),
          intensity: read('intensity'),
          color: read('color'),
          position: roundPosition(read('position')),
        },
      };
      const formatted = JSON.stringify(config, null, 2).replace(
        /\[\s*([-\d.e+]+),\s*([-\d.e+]+),\s*([-\d.e+]+)\s*\]/g,
        '[$1, $2, $3]',
      );
      const text = 'export const sceneConfig = ' + formatted + ' as const;\n';
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        window.prompt('复制配置，替换 src/project/scene.ts：', text);
      }
    }),
  }), { order: 0, collapsed: false });
  useHelper(values.helpers ? light : false, DirectionalLightHelper, 1, '#ffff00');
  useEffect(() => {
    onChange({
      background: values.background,
      ambientIntensity: values.ambientIntensity,
      intensity: values.intensity,
      color: values.color,
      position: values.position,
    });
  }, [onChange, values.background, values.ambientIntensity, values.intensity, values.color, values.position]);
  useEffect(() => {
    camera.fov = values.fov;
    camera.updateProjectionMatrix();
  }, [camera, values.fov]);
  return null;
}
