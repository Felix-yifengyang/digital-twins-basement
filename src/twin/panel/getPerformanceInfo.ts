import type { WebGLRenderer } from 'three';
import type { ModelCacheInfo } from '@/twin/model/modelResources';

export function getPerformanceInfo(renderer: WebGLRenderer, cache: ModelCacheInfo) {
  const statuses = { loading: '加载中', active: '使用中', cached: '历史缓存' };

  return {
    geometries: String(renderer.info.memory.geometries),
    textures: String(renderer.info.memory.textures),
    programs: String(renderer.info.programs?.length ?? 0),
    calls: String(renderer.info.render.calls),
    triangles: String(renderer.info.render.triangles),
    cacheCount: String(cache.length),
    cacheList: cache.map(({ url, status }) => `${decodeURI(url.split('/').pop() ?? url)} [${statuses[status]}]`).join('\n') || '无',
  };
}
