import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { createModelLoader, type ModelLease } from '@/twin/modelResources';

type Props = { url: string; maxIdle?: number };
type Display = { model: GLTF; lease: ModelLease };

export function Model({ url, maxIdle = 1 }: Props) {
  const [resources] = useState(() => createModelLoader(maxIdle));
  const [display, setDisplay] = useState<Display>();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const visible = useRef<Display | undefined>(undefined);
  const generation = useRef(0);

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
      setDisplay({ model, lease });
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
  }, [resources, url, attempt]);

  useLayoutEffect(() => {
    const previous = visible.current;
    visible.current = display;
    if (previous !== display) previous?.lease.release();
  }, [display]);

  return (
    <>
      {display && <primitive object={display.model.scene} />}
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
