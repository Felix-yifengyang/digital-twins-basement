import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { LevaInputs, useControls } from 'leva';
import type { ModelCacheInfo } from '@/twin/model/modelResources';
import { getPerformanceInfo } from '@/twin/panel/getPerformanceInfo';

type Props = {
  getCacheInfo: () => ModelCacheInfo;
};

export default function PerformanceInfoControls({ getCacheInfo }: Props) {
  const renderer = useThree((state) => state.gl);
  const [, set] = useControls('性能信息', () => {
    const labels = {
      geometries: '几何体数量',
      textures: '纹理数量',
      programs: '着色器程序',
      calls: '每帧绘制调用',
      triangles: '每帧三角形',
      cacheCount: '缓存条目数',
      cacheList: '模型缓存',
    };
    const values = getPerformanceInfo(renderer, getCacheInfo());

    return Object.fromEntries(Object.entries(labels).map(([key, label]) => [
      key,
      { label, type: LevaInputs.STRING, value: values[key as keyof typeof values], editable: false },
    ]));
  }, { order: 2, collapsed: false });

  useEffect(() => {
    // Read after a rendered frame, at most twice per second; no React frame state.
    const update = set as unknown as (values: Record<string, string>) => void;
    const timer = window.setInterval(() => {
      update(getPerformanceInfo(renderer, getCacheInfo()));
    }, 500);

    return () => window.clearInterval(timer);
  }, [renderer, getCacheInfo, set]);

  return null;
}
