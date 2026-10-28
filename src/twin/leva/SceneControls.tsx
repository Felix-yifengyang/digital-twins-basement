import { useEffect, type RefObject } from 'react';
import { useThree } from '@react-three/fiber';
import { useHelper } from '@react-three/drei';
import { button, useControls } from 'leva';
import { DirectionalLightHelper, PerspectiveCamera, Vector3, type DirectionalLight } from 'three';
import type { SceneSettings } from '@/twin/sceneSettings';
import { getSceneControls } from '@/twin/leva/getSceneControls';
import type { SceneValues } from '@/twin/SceneCanvas';

type Props = {
  settings: SceneSettings;
  light: RefObject<DirectionalLight>;
  onChange: (values: SceneValues) => void;
};

export default function SceneControls({ light, onChange, settings }: Props) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const get = useThree((state) => state.get);
  const [values, set, read] = useControls('场景调参', () => ({
    ...getSceneControls(settings),
    '复制配置': button(async () => {
      const controls = get().controls;
      if (!controls || !('target' in controls) || !(controls.target instanceof Vector3)) return;
      const roundPosition = (position: readonly number[]) => position.map((value) => Math.round(value * 10) / 10);
      const config = {
        modelPath: settings.modelPath,
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
        window.prompt('复制配置，替换当前场景的 config：', text);
      }
    }),
  }), { order: 0, collapsed: false }, [settings]);
  useEffect(() => {
    set({ background: settings.background, ...settings.lighting, fov: settings.camera.fov, helpers: true });
  }, [settings, set]);
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
