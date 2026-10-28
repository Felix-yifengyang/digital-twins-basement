import { sceneConfig, type SceneConfig } from '@/project/scene';

// 添加场景时填写独立 GLB 路径；可复用 scene.ts 的可选配置模板。
export const scenes: { id: string; name: string; config: SceneConfig }[] = [
  { id: 'pump', name: '泵站', config: sceneConfig },
  { id: 'box', name: '方块示例', config: { modelPath: 'models/box.glb' } },
  { id: 'duck', name: '鸭子示例', config: { modelPath: 'models/duck.glb' } },
];
