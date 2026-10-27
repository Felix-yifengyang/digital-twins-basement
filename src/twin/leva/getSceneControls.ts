import { sceneConfig } from '@/project/scene';

export function getSceneControls() {
  return {
    background: { label: '背景', value: sceneConfig.background },
    ambientIntensity: {
      label: '环境光',
      value: sceneConfig.lighting.ambientIntensity,
      min: 0,
      max: 5,
      step: 0.05,
    },
    intensity: {
      label: '主光强度',
      value: sceneConfig.lighting.intensity,
      min: 0,
      max: 10,
      step: 0.1,
    },
    color: { label: '主光颜色', value: sceneConfig.lighting.color },
    position: {
      label: '主光位置',
      value: [...sceneConfig.lighting.position] as [number, number, number],
      step: 0.1,
    },
    fov: {
      label: '相机视野',
      value: sceneConfig.camera.fov,
      min: 15,
      max: 100,
      step: 1,
    },
    helpers: { label: '灯光辅助线', value: true },
  };
}
