import type { ReactNode } from 'react';
import { Html } from '@react-three/drei';
import '@/twin/label/label.css';

type Props = {
  position: [number, number, number];
  children: ReactNode;
  className?: string;
  occlude?: boolean;
};

export function Label({ position, children, className = '', occlude = false }: Props) {
  return (
    <Html position={position} center occlude={occlude} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`twin-label ${className}`}>{children}</div>
    </Html>
  );
}
