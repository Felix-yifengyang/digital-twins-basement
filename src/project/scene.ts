export const sceneConfig = {
  modelPath: 'models/demo-pump.glb',
  camera: { position: [8, 5.5, 9], fov: 42 },
  controlsTarget: [0, 1, 0],
  background: '#0d1112',
  lighting: {
    ambientIntensity: 0.8,
    intensity: 2.5,
    color: '#ffffff',
    position: [7, 11, 6],
  },
} as const;
