import { BufferGeometry, Material, Mesh, Skeleton, SkinnedMesh, Texture } from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

type Resource = BufferGeometry | Material | Texture | Skeleton;
type Entry = { promise: Promise<GLTF>; users: number; model?: GLTF; resources?: Set<Resource> };
export type ModelLease = { promise: Promise<GLTF>; release: () => void };

function collectResources(model: GLTF) {
  const resources = new Set<Resource>();
  for (const scene of model.scenes) scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    resources.add(object.geometry);
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      resources.add(material);
      for (const value of Object.values(material)) {
        if (value instanceof Texture) resources.add(value);
      }
    }
    if (object instanceof SkinnedMesh) {
      // Bone textures are owned and disposed by Skeleton.
      resources.add(object.skeleton);
    }
  });
  return resources;
}

/** One owner per Model component. Only resources from loaded GLBs belong here. */
export function createModelResources(
  load: (url: string) => Promise<GLTF>,
  maxIdle = 1,
) {
  const entries = new Map<string, Entry>();
  const references = new Map<Resource, number>();
  const images = new Map<ImageBitmap, number>();
  let closed = false;

  function bitmap(texture: Texture) {
    return typeof ImageBitmap !== 'undefined' && texture.image instanceof ImageBitmap
      ? texture.image : undefined;
  }

  function remove(url: string, entry: Entry) {
    entries.delete(url);
    for (const resource of entry.resources ?? []) {
      const remaining = references.get(resource)! - 1;
      if (remaining) references.set(resource, remaining);
      else {
        references.delete(resource);
        resource.dispose();
        if (resource instanceof Texture) {
          const image = bitmap(resource);
          if (image) {
            const count = images.get(image)! - 1;
            if (count) images.set(image, count);
            else { images.delete(image); image.close(); }
          }
        }
      }
    }
  }

  function trim() {
    const idle = [...entries].filter(([, entry]) => entry.model && entry.users === 0);
    for (const [url, entry] of idle.slice(0, Math.max(0, idle.length - maxIdle))) remove(url, entry);
  }

  return {
    acquire(url: string): ModelLease {
      if (closed) throw new Error('Model resource owner has been disposed');
      let entry = entries.get(url);
      if (!entry) {
        entry = { users: 0, promise: Promise.resolve().then(() => load(url)) };
        const created = entry;
        created.promise = created.promise.then((model) => {
          created.model = model;
          created.resources = collectResources(model);
          for (const resource of created.resources) {
            const count = references.get(resource) ?? 0;
            references.set(resource, count + 1);
            if (!count && resource instanceof Texture) {
              const image = bitmap(resource);
              if (image) images.set(image, (images.get(image) ?? 0) + 1);
            }
          }
          if (closed || created.users === 0) remove(url, created);
          return model;
        }, (error) => {
          entries.delete(url);
          throw error;
        });
      }
      // Map insertion order is the least-recently-used order.
      entries.delete(url);
      entries.set(url, entry);
      entry.users++;
      let released = false;
      return {
        promise: entry.promise,
        release() {
          if (released) return;
          released = true;
          entry.users--;
          trim();
        },
      };
    },
    dispose() {
      closed = true;
      for (const [url, entry] of entries) {
        if (entry.model) remove(url, entry);
        // In-flight loads release their results on completion.
      }
    },
  };
}

export function createModelLoader(maxIdle = 1) {
  const draco = new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
  const loader = new GLTFLoader().setDRACOLoader(draco).setMeshoptDecoder(MeshoptDecoder);
  let pending = 0;
  let closed = false;
  const resources = createModelResources(async (url) => {
    pending++;
    try { return await loader.loadAsync(url); }
    finally {
      pending--;
      if (closed && !pending) draco.dispose();
    }
  }, maxIdle);
  return {
    acquire: resources.acquire,
    dispose() {
      closed = true;
      resources.dispose();
      if (!pending) draco.dispose();
    },
  };
}
