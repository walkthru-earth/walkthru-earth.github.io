import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FSAVERAGE5_HEMI_VERTS, HNC_GLB, type SurfaceMode } from './config';
import { colormap, dynamicRange } from './colormap';

/**
 * Parcel atlas: alias → fsaverage5 vertex indices in [0..20483].
 * Generated offline via hnc/scripts/gen_parcel_aliases.py (see comments
 * in that file). When this asset is missing, region-spotlight is a no-op.
 */
export type ParcelAtlas = Record<string, number[]>;

let atlasPromise: Promise<ParcelAtlas | null> | null = null;
export function loadParcelAtlas(
  url = '/hnc/parcel_aliases.json'
): Promise<ParcelAtlas | null> {
  if (atlasPromise) return atlasPromise;
  atlasPromise = fetch(url, { cache: 'force-cache' })
    .then((r) => (r.ok ? (r.json() as Promise<ParcelAtlas>) : null))
    .catch(() => null);
  return atlasPromise;
}

export type Hemi = 'left' | 'right';

export interface HemisphereData {
  mesh: THREE.Mesh;
  baseColor: THREE.Color;
  /** mapping[hi-vertex] = nearest fsaverage5 vertex (within hemisphere, 0..10241) */
  mapping: Int32Array;
}

export interface BrainAssembly {
  group: THREE.Group;
  meshes: Record<Hemi, THREE.Mesh>;
  baseColors: Record<Hemi, THREE.Color>;
  mappings: Record<Hemi, Int32Array>;
}

const BASE_HEMI_COLOR: Record<Hemi, number> = {
  left: 0x9aa3b7,
  right: 0xa8a1b9,
};

async function extractMesh(url: string): Promise<THREE.Mesh | null> {
  const gltf = await new GLTFLoader().loadAsync(url);
  const found = gltf.scene.getObjectByProperty('isMesh', true);
  return (found as THREE.Mesh | undefined) ?? null;
}

function buildHashGridNN(positions: ArrayLike<number>, cellSize: number) {
  const grid = new Map<string, number[]>();
  const key = (x: number, y: number, z: number) => `${x}|${y}|${z}`;
  const n = positions.length / 3;
  for (let i = 0; i < n; i++) {
    const x = Math.floor(positions[i * 3] / cellSize);
    const y = Math.floor(positions[i * 3 + 1] / cellSize);
    const z = Math.floor(positions[i * 3 + 2] / cellSize);
    const k = key(x, y, z);
    let arr = grid.get(k);
    if (!arr) {
      arr = [];
      grid.set(k, arr);
    }
    arr.push(i);
  }
  return {
    nearest(px: number, py: number, pz: number): number {
      const cx = Math.floor(px / cellSize);
      const cy = Math.floor(py / cellSize);
      const cz = Math.floor(pz / cellSize);
      let best = -1;
      let bestD = Infinity;
      const search = (dx: number, dy: number, dz: number) => {
        const arr = grid.get(key(cx + dx, cy + dy, cz + dz));
        if (!arr) return;
        for (const i of arr) {
          const ax = positions[i * 3];
          const ay = positions[i * 3 + 1];
          const az = positions[i * 3 + 2];
          const d = (ax - px) ** 2 + (ay - py) ** 2 + (az - pz) ** 2;
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
      };
      for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++)
          for (let dz = -1; dz <= 1; dz++) search(dx, dy, dz);
      if (best >= 0) return best;
      let r = 2;
      while (r < 12) {
        for (let dx = -r; dx <= r; dx++)
          for (let dy = -r; dy <= r; dy++)
            for (let dz = -r; dz <= r; dz++) {
              if (Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) !== r)
                continue;
              search(dx, dy, dz);
            }
        if (best >= 0) return best;
        r++;
      }
      return 0;
    },
  };
}

export async function loadHemispheres(
  surface: SurfaceMode
): Promise<BrainAssembly> {
  const high = HNC_GLB.high[surface];
  const low = HNC_GLB.low[surface];
  const [meshL, meshR, lowL, lowR] = await Promise.all([
    extractMesh(high.left),
    extractMesh(high.right),
    extractMesh(low.left),
    extractMesh(low.right),
  ]);

  const group = new THREE.Group();
  const meshes: Partial<Record<Hemi, THREE.Mesh>> = {};
  const baseColors: Partial<Record<Hemi, THREE.Color>> = {};
  const mappings: Partial<Record<Hemi, Int32Array>> = {};

  const sides: Array<{
    side: Hemi;
    mesh: THREE.Mesh | null;
    lowMesh: THREE.Mesh | null;
  }> = [
    { side: 'left', mesh: meshL, lowMesh: lowL },
    { side: 'right', mesh: meshR, lowMesh: lowR },
  ];

  for (const { side, mesh, lowMesh } of sides) {
    if (!mesh || !lowMesh) continue;

    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeBoundingBox();
    lowMesh.geometry.computeBoundingBox();

    // High-res inflated GLBs are exported centered at the origin while the
    // low-res mesh keeps its anatomical position. Align high to low so the
    // hemispheres separate correctly and the NN mapping is in the same frame.
    const hi = mesh.geometry.boundingBox!;
    const lo = lowMesh.geometry.boundingBox!;
    const dx = (lo.min.x + lo.max.x - hi.min.x - hi.max.x) / 2;
    const dy = (lo.min.y + lo.max.y - hi.min.y - hi.max.y) / 2;
    const dz = (lo.min.z + lo.max.z - hi.min.z - hi.max.z) / 2;
    if (Math.hypot(dx, dy, dz) > 0.5) {
      mesh.geometry.translate(dx, dy, dz);
    }

    const lowPos = lowMesh.geometry.attributes.position
      .array as ArrayLike<number>;
    const lowCount = lowMesh.geometry.attributes.position.count;
    if (lowCount !== FSAVERAGE5_HEMI_VERTS) {
      console.warn('[hnc] low mesh vertex count mismatch', lowCount);
    }
    const grid = buildHashGridNN(lowPos, 6);
    const highPos = mesh.geometry.attributes.position
      .array as ArrayLike<number>;
    const nHigh = mesh.geometry.attributes.position.count;
    const mapping = new Int32Array(nHigh);
    for (let i = 0; i < nHigh; i++) {
      mapping[i] = grid.nearest(
        highPos[i * 3],
        highPos[i * 3 + 1],
        highPos[i * 3 + 2]
      );
    }

    const colorAttr = new THREE.BufferAttribute(new Float32Array(nHigh * 3), 3);
    const baseColor = new THREE.Color(BASE_HEMI_COLOR[side]);
    for (let i = 0; i < nHigh; i++) {
      colorAttr.setXYZ(i, baseColor.r, baseColor.g, baseColor.b);
    }
    mesh.geometry.setAttribute('color', colorAttr);
    mesh.material = new THREE.MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.55,
      metalness: 0.05,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
      flatShading: false,
    });
    meshes[side] = mesh;
    baseColors[side] = baseColor;
    mappings[side] = mapping;
    group.add(mesh);
  }

  // Order matters here. Earlier this function did `position.sub(center)`
  // BEFORE applying scale, but Group.position lives in parent space and is
  // not affected by Group.scale, so the geometry's true world-centroid
  // shifted by `center * (s - 1)`. Result: the OrbitControls target was
  // the file's local origin, not the visual centroid between hemispheres,
  // and the brain drifted off-screen. Fix: rotate → scale → measure → re-center.
  group.rotation.x = -Math.PI / 2;
  group.updateMatrixWorld(true);
  {
    const measured = new THREE.Box3().setFromObject(group);
    const span = measured.getSize(new THREE.Vector3()).length();
    if (span > 0) group.scale.setScalar(1.7 / span);
  }
  group.updateMatrixWorld(true);
  {
    const measured = new THREE.Box3().setFromObject(group);
    const center = measured.getCenter(new THREE.Vector3());
    group.position.sub(center);
  }

  return {
    group,
    meshes: meshes as Record<Hemi, THREE.Mesh>,
    baseColors: baseColors as Record<Hemi, THREE.Color>,
    mappings: mappings as Record<Hemi, Int32Array>,
  };
}

export interface PaintOptions {
  /** Alias of the region to spotlight. Vertices outside this region are dimmed. */
  spotlight?: string | null;
  /** Atlas fsaverage5-vertex membership lookup, expected to span [0..20483]. */
  atlas?: ParcelAtlas | null;
}

const DIM_TINT = new THREE.Color(0x4a4a55);

export function paintBrainActivity(
  assembly: BrainAssembly | null,
  brainActivity: Float32Array | null,
  opts: PaintOptions = {}
) {
  if (!assembly) return;
  if (!brainActivity) {
    resetBrainColors(assembly);
    return;
  }

  // Per-frame symmetric range — see colormap.dynamicRange.
  const range = dynamicRange(brainActivity);

  // Build a fast lookup of which fsaverage5 vertices belong to the spotlight.
  // When `spotlight` or atlas is missing, every vertex is "in" (no dimming).
  const inSpotlight: Uint8Array = new Uint8Array(brainActivity.length);
  const useSpot = !!opts.spotlight && !!opts.atlas?.[opts.spotlight];
  if (useSpot) {
    const verts = opts.atlas![opts.spotlight!];
    for (const v of verts) {
      if (v >= 0 && v < inSpotlight.length) inSpotlight[v] = 1;
    }
  } else {
    inSpotlight.fill(1);
  }

  const sides: Array<{ key: Hemi; start: number }> = [
    { key: 'left', start: 0 },
    { key: 'right', start: FSAVERAGE5_HEMI_VERTS },
  ];
  for (const { key, start } of sides) {
    const mesh = assembly.meshes[key];
    const mapping = assembly.mappings[key];
    if (!mesh) continue;
    const colorAttr = mesh.geometry.attributes.color as THREE.BufferAttribute;
    const nVerts = mesh.geometry.attributes.position.count;
    for (let i = 0; i < nVerts; i++) {
      const fsi = mapping && mapping.length === nVerts ? mapping[i] : i;
      const globalIdx = start + fsi;
      if (globalIdx >= brainActivity.length) continue;
      const v = brainActivity[globalIdx];
      const [r, g, b] = colormap(v, range);
      if (useSpot && !inSpotlight[globalIdx]) {
        // Dim non-spotlight vertices toward neutral grey while preserving
        // a faint ghost of their activity.
        const t = 0.85;
        colorAttr.setXYZ(
          i,
          r * (1 - t) + DIM_TINT.r * t,
          g * (1 - t) + DIM_TINT.g * t,
          b * (1 - t) + DIM_TINT.b * t
        );
      } else {
        colorAttr.setXYZ(i, r, g, b);
      }
    }
    colorAttr.needsUpdate = true;
  }
}

export function resetBrainColors(assembly: BrainAssembly) {
  for (const key of ['left', 'right'] as const) {
    const mesh = assembly.meshes[key];
    if (!mesh) continue;
    const base = assembly.baseColors[key];
    const colorAttr = mesh.geometry.attributes.color as THREE.BufferAttribute;
    const n = colorAttr.count;
    for (let i = 0; i < n; i++) colorAttr.setXYZ(i, base.r, base.g, base.b);
    colorAttr.needsUpdate = true;
  }
}
