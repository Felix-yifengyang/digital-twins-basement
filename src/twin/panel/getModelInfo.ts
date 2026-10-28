import { Color, MathUtils, Mesh, Object3D, Vector3 } from 'three';

export type ModelDetails = Record<string, Record<string, string>>;

export function getModelInfo(object: Object3D): ModelDetails {
  const vector = (values: number[]) => values.map((value) => Number(value.toFixed(3))).join(', ');
  const path: string[] = [];
  for (let node: Object3D | null = object; node && node.type !== 'Scene'; node = node.parent) {
    path.unshift(`${node.name || '(未命名)'} [${node.type}]`);
  }
  object.updateWorldMatrix(true, false);
  const details: ModelDetails = {
    对象: {
      名称: object.name || '(未命名)',
      类型: object.type,
      'UUID（仅运行时）': object.uuid,
      层级路径: path.join(' / '),
      父节点: object.parent?.name || object.parent?.type || '无',
      直接子节点数: String(object.children.length),
      可见: object.visible ? '是' : '否',
    },
    变换: {
      局部位置: vector(object.position.toArray()),
      '旋转（度）': vector([object.rotation.x, object.rotation.y, object.rotation.z].map(MathUtils.radToDeg)),
      旋转顺序: object.rotation.order,
      局部缩放: vector(object.scale.toArray()),
      世界位置: vector(object.getWorldPosition(new Vector3()).toArray()),
    },
  };
  if (object instanceof Mesh) {
    const geometry = object.geometry;
    const count = geometry.index?.count ?? geometry.getAttribute('position')?.count ?? 0;
    details.几何体 = {
      名称: geometry.name || '(未命名)',
      类型: geometry.type,
      顶点数: String(geometry.getAttribute('position')?.count ?? 0),
      三角形数: String(Math.floor(count / 3)),
      材质槽数: String(Array.isArray(object.material) ? object.material.length : 1),
    };
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material, index) => {
      const properties: Record<string, string> = {
        名称: material.name || '(未命名)',
        类型: material.type,
        透明度: String(material.opacity),
        透明模式: material.transparent ? '是' : '否',
        面: ['正面', '背面', '双面'][material.side],
      };
      for (const key of ['color', 'emissive', 'metalness', 'roughness', 'emissiveIntensity']) {
        const value = (material as unknown as Record<string, unknown>)[key];
        if (value instanceof Color) properties[key] = `#${value.getHexString()}`;
        else if (typeof value === 'number') properties[key] = String(value);
      }
      details[`材质槽 ${index}`] = properties;
    });
  }
  return details;
}
