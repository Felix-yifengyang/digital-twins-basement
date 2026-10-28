import { useState, type ReactNode } from 'react';
import type { SceneConfig } from '@/project/scene';
import '@/twin/scene/sceneSwitcher.css';

export type SceneOption = {
  id: string;
  name: string;
  config: SceneConfig;
};

type Props = {
  scenes: readonly [SceneOption, ...SceneOption[]];
  children: (config: SceneConfig) => ReactNode;
};

export function SceneSwitcher({ scenes, children }: Props) {
  const [sceneId, setSceneId] = useState(scenes[0].id);
  const activeScene = scenes.find((scene) => scene.id === sceneId) ?? scenes[0];

  return (
    <>
      {scenes.length > 1 && (
        <label className="scene-switcher">
          场景
          <select value={activeScene.id} onChange={(event) => setSceneId(event.target.value)}>
            {scenes.map((scene) => (
              <option key={scene.id} value={scene.id}>{scene.name}</option>
            ))}
          </select>
        </label>
      )}
      {children(activeScene.config)}
    </>
  );
}
