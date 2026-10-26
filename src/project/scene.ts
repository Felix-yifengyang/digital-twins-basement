export const sceneConfig = {
  modelUrl: `${import.meta.env.BASE_URL}models/demo-pump.glb`,
  camera: {
    position: [8, 5.5, 9] as const,
    fov: 42,
  },
  controlsTarget: [0, 1, 0] as const,
} as const;
