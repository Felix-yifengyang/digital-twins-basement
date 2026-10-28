import { useLayoutEffect, useState, type ReactNode } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { Color, Material, Mesh, Object3D } from 'three';

/** Only clones materials; textures and geometries remain owned by the model loader. */
export function highlightObject(object: Object3D, color = '#ffb020') {
  const originals = new Map<Mesh, Material | Material[]>();
  const copies = new Map<Material, Material>();
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;
    originals.set(child, child.material);
    const clone = (material: Material) => {
      let copy = copies.get(material);
      if (!copy) {
        copy = material.clone();
        if ('color' in copy && copy.color instanceof Color) copy.color.set(color);
        if ('emissive' in copy && copy.emissive instanceof Color) copy.emissive.set(color).multiplyScalar(0.35);
        copies.set(material, copy);
      }
      return copy;
    };
    child.material = Array.isArray(child.material) ? child.material.map(clone) : clone(child.material);
  });
  return () => {
    for (const [mesh, material] of originals) mesh.material = material;
    for (const material of copies.values()) material.dispose();
  };
}

type Props = {
  children: ReactNode;
  resolve?: (clicked: Object3D) => Object3D | null;
  onSelect?: (object: Object3D | null) => void;
};

export function ModelSelection({ children, resolve, onSelect }: Props) {
  const [selected, setSelected] = useState<Object3D | null>(null);
  // Publish original information before the temporary highlight replaces materials.
  useLayoutEffect(() => {
    onSelect?.(selected);
    return () => { onSelect?.(null); };
  }, [selected, onSelect]);
  useLayoutEffect(() => {
    if (selected) return highlightObject(selected);
  }, [selected]);
  function select(event: ThreeEvent<MouseEvent>) {
    if (event.delta > 2) return;
    event.stopPropagation();
    setSelected(resolve ? resolve(event.object) : event.object);
  }

  return (
    <group onClick={select} onPointerMissed={() => setSelected(null)}>
      {children}
    </group>
  );
}
