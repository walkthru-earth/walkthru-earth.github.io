'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  loadHemispheres,
  loadParcelAtlas,
  paintBrainActivity,
  type BrainAssembly,
  type ParcelAtlas,
} from './brain-mesh';
import type { SurfaceMode } from './config';

interface Props {
  surface: SurfaceMode;
  brainActivity: Float32Array | null;
  spotlightAlias?: string | null;
  onAtlasReady?: (available: boolean) => void;
  onStatus?: (msg: string) => void;
}

interface SceneCtx {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  rafId: number;
  resizeObs: ResizeObserver;
}

export function HNCBrainPanel({
  surface,
  brainActivity,
  spotlightAlias,
  onAtlasReady,
  onStatus,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<SceneCtx | null>(null);
  const assemblyRef = useRef<BrainAssembly | null>(null);
  const [atlas, setAtlas] = useState<ParcelAtlas | null>(null);
  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;
  const onAtlasReadyRef = useRef(onAtlasReady);
  onAtlasReadyRef.current = onAtlasReady;

  // Try the parcel atlas once. Missing asset → highlighting silently no-ops.
  useEffect(() => {
    let cancelled = false;
    loadParcelAtlas().then((a) => {
      if (cancelled) return;
      setAtlas(a);
      onAtlasReadyRef.current?.(!!a);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || sceneRef.current) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const initialW = container.clientWidth || 1;
    const initialH = container.clientHeight || 1;
    renderer.setSize(initialW, initialH);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      initialW / initialH,
      0.01,
      100
    );
    camera.position.set(0, 0, 2.6);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 0.85);
    key.position.set(2, 2, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xb388ff, 0.4);
    rim.position.set(-2, 1, -2);
    scene.add(rim);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.6;
    controls.minDistance = 1.2;
    controls.maxDistance = 6;
    controls.enablePan = false;

    const resizeObs = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resizeObs.observe(container);

    let rafId = 0;
    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    tick();

    sceneRef.current = { renderer, scene, camera, controls, rafId, resizeObs };

    return () => {
      cancelAnimationFrame(sceneRef.current?.rafId ?? 0);
      resizeObs.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
    };
  }, []);

  // Load / reload hemispheres when surface mode changes.
  useEffect(() => {
    let cancelled = false;
    const ctx = sceneRef.current;
    if (!ctx) return;
    onStatusRef.current?.('Loading cortex…');
    loadHemispheres(surface)
      .then((assembly) => {
        if (cancelled) return;
        const ctxNow = sceneRef.current;
        if (!ctxNow) return;
        if (assemblyRef.current) {
          ctxNow.scene.remove(assemblyRef.current.group);
          assemblyRef.current.group.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
              obj.geometry?.dispose();
              const mat = obj.material as THREE.Material | THREE.Material[];
              if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
              else mat?.dispose();
            }
          });
        }
        assemblyRef.current = assembly;
        ctxNow.scene.add(assembly.group);
        ctxNow.controls.target.set(0, 0, 0);
        ctxNow.camera.position.set(0, 0.15, 2.4);
        ctxNow.camera.lookAt(0, 0, 0);
        // Re-apply current activity if any.
        paintBrainActivity(assembly, brainActivity, {
          spotlight: spotlightAlias ?? null,
          atlas,
        });
        onStatusRef.current?.('Cortex ready');
      })
      .catch((err) => {
        console.error('[hnc] hemisphere load failed', err);
        onStatusRef.current?.(`Cortex load error: ${(err as Error).message}`);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surface]);

  // Repaint when brainActivity, spotlight, or atlas changes.
  useEffect(() => {
    paintBrainActivity(assemblyRef.current, brainActivity, {
      spotlight: spotlightAlias ?? null,
      atlas,
    });
  }, [brainActivity, spotlightAlias, atlas]);

  return (
    <div
      ref={containerRef}
      className="hnc-brain relative h-full w-full"
      role="region"
      aria-label="Predicted cortical activity, fsaverage5 surface"
      // Lenis smooth-scroll otherwise eats the wheel event before OrbitControls.
      data-lenis-prevent
    />
  );
}
