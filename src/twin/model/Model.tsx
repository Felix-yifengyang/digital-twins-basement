import { Fragment, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import type { Group } from 'three';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { createModelLoader, type ModelLease, type ModelCacheInfo } from '@/twin/model/modelResources';

type Props<T> = { url: string; context: T; maxIdle?: number; children?: (scene: Group, context: T, getCacheInfo: () => ModelCacheInfo) => ReactNode };
type Display<T> = { model: GLTF; lease: ModelLease; context: T; version: number };

export function Model<T>({ url, context, maxIdle = 1, children }: Props<T>) {
  const [resources] = useState(() => createModelLoader(maxIdle));
  const [display, setDisplay] = useState<Display<T>>();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const visible = useRef<Display<T> | undefined>(undefined);
  const generation = useRef(0);
  const version = useRef(0);

  useEffect(() => {
    const version = ++generation.current;
    return () => {
      // StrictMode immediately remounts effects; real unmount destroys this owner.
      queueMicrotask(() => { if (generation.current === version) resources.dispose(); });
    };
  }, [resources]);

  useEffect(() => {
    let active = true;
    let adopted = false;
    const lease = resources.acquire(url);
    setStatus('loading');
    lease.promise.then((model) => {
      if (!active) return;
      adopted = true;
      setDisplay({ model, lease, context, version: ++version.current });
      setStatus('ready');
    }, (error: unknown) => {
      if (!active) return;
      console.error(`Failed to load model: ${url}`, error);
      setStatus('error');
    });
    return () => {
      active = false;
      if (!adopted) lease.release();
    };
  }, [resources, url, context, attempt]);

  useLayoutEffect(() => {
    const previous = visible.current;
    visible.current = display;
    if (previous !== display) previous?.lease.release();
  }, [display]);

  return (
    <>
      {display && (
        <Fragment key={display.version}>
          {children ? children(display.model.scene, display.context, resources.getInfo) : <primitive object={display.model.scene} />}
        </Fragment>
      )}
      {status !== 'ready' && (
        <Html center>
          <div role="status" style={{ color: 'white', background: '#202428', padding: 12, whiteSpace: 'nowrap' }}>
            {status === 'loading' ? '模型加载中…' : (
              <>模型加载失败 <button onClick={() => setAttempt((value) => value + 1)}>重试</button></>
            )}
          </div>
        </Html>
      )}
    </>
  );
}
