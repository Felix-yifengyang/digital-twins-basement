import { sceneConfig } from '@/project/scene';
import type { SceneOption } from '@/twin/SceneSwitcher';

// 添加场景时填写独立 GLB 路径；可复用 scene.ts 的可选配置模板。
export const scenes: [SceneOption, ...SceneOption[]] = [
  { id: 'pump', name: '泵站', config: sceneConfig },
  { id: 'box', name: '方块示例', config: { modelPath: 'models/box.glb' } },
  { id: 'duck', name: '鸭子示例', config: { modelPath: 'models/duck.glb' } },
];
