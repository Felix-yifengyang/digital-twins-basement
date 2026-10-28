import { useLayoutEffect, type ReactNode } from 'react';
import { useBounds } from '@react-three/drei';
import type { Group } from 'three';

type Props = {
  model: Group;
  autoFit: boolean;
  children: ReactNode;
};

export function ModelBounds({ model, autoFit, children }: Props) {
  const bounds = useBounds();

  useLayoutEffect(() => {
    bounds.refresh(model).clip();
    if (autoFit) bounds.fit();
  }, [bounds, model, autoFit]);

  return <>{children}</>;
}
