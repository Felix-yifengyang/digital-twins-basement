import { useEffect, type RefObject } from 'react';
import { useThree } from '@react-three/fiber';
import { useHelper } from '@react-three/drei';
import { button, useControls } from 'leva';
import { DirectionalLightHelper, PerspectiveCamera, Vector3, type DirectionalLight } from 'three';
import { sceneConfig } from '@/project/scene';
import type { SceneValues } from '@/twin/SceneCanvas';

type Props = {
  light: RefObject<DirectionalLight>;
  onChange: (values: SceneValues) => void;
};

export default function SceneTuner({ light, onChange }: Props) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const get = useThree((state) => state.get);
  const [values, , read] = useControls('场景调参', () => ({
    background: { label: '背景', value: sceneConfig.background },
    ambientIntensity: { label: '环境光', value: sceneConfig.lighting.ambientIntensity, min: 0, max: 5, step: 0.05 },
    intensity: { label: '主光强度', value: sceneConfig.lighting.intensity, min: 0, max: 10, step: 0.1 },
    color: { label: '主光颜色', value: sceneConfig.lighting.color },
    position: { label: '主光位置', value: [...sceneConfig.lighting.position] as [number, number, number], step: 0.1 },
    fov: { label: '相机视野', value: sceneConfig.camera.fov, min: 15, max: 100, step: 1 },
    helpers: { label: '灯光辅助线', value: true },
    '复制配置': button(async () => {
      const controls = get().controls;
      if (!controls || !('target' in controls) || !(controls.target instanceof Vector3)) return;
      const roundPosition = (position: readonly number[]) => position.map((value) => Math.round(value * 10) / 10);
      const config = {
        ...sceneConfig,
        camera: { position: roundPosition(camera.position.toArray()), fov: read('fov') },
        controlsTarget: roundPosition(controls.target.toArray()),
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
  }));
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
