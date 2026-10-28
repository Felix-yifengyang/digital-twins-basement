import { sceneConfig, type SceneConfig } from '@/project/scene';

export function resolveSceneConfig(config: SceneConfig) {
  const { position, target } = config.camera ?? {};
  if (Boolean(position) !== Boolean(target)) {
    console.warn('camera.position 和 camera.target 需要一起填写；本次使用自动取景。');
  }
  return {
    modelPath: config.modelPath,
    customView: Boolean(position && target),
    camera: {
      position: position && target ? [...position] as [number, number, number] : [8, 5.5, 9] as [number, number, number],
      fov: config.camera?.fov ?? 42,
    },
    target: position && target ? [...target] as [number, number, number] : [0, 0, 0] as [number, number, number],
    background: config.background ?? '#0d1112',
    lighting: {
      ambientIntensity: config.lighting?.ambientIntensity ?? 0.8,
      intensity: config.lighting?.intensity ?? 2.5,
      color: config.lighting?.color ?? '#ffffff',
      position: [...(config.lighting?.position ?? [7, 11, 6])] as [number, number, number],
    },
  };
}

export const sceneSettings = resolveSceneConfig(sceneConfig);
