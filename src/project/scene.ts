export type SceneConfig = {
  modelPath: string;
  camera?: {
    position?: readonly [number, number, number];
    target?: readonly [number, number, number];
    fov?: number;
  };
  background?: string;
  lighting?: {
    ambientIntensity?: number;
    intensity?: number;
    color?: string;
    position?: readonly [number, number, number];
  };
};

export const sceneConfig: SceneConfig = {
  modelPath: 'models/demo-pump.glb',
  camera: {
    // 自定义视角时一起填写；均未填写则使用 Bounds 自动取景。
    position: undefined, // 示例：[8, 5.5, 9]
    target: undefined, // 示例：[0, 1, 0]
    fov: undefined, // 默认：42
  },
  background: undefined, // 默认：'#0d1112'
  lighting: {
    ambientIntensity: undefined, // 默认：0.8；0 表示关闭
    intensity: undefined, // 默认：2.5
    color: undefined, // 默认：'#ffffff'
    position: undefined, // 默认：[7, 11, 6]
  },
};
