import * as THREE from 'three';
import {
  E4_CROSSING_CLEAR_TIME,
  formatBearing,
  getActiveObjective,
  type GameSettings,
  type GameState,
} from '../game/gameState';
import { createMeeraCharacter } from './characters';

export interface VrHudRig {
  group: THREE.Group;
  updateReticle: (hoverLabel: string | null, dwellProgress: number, isGazeMode: boolean) => void;
  updateSlate: (state: GameState, settings: GameSettings) => void;
  updateOpticTransform: (fovDeg: number, aspect: number, state: GameState) => void;
  dispose: () => void;
}

export function createVrHudRig(): VrHudRig {
  const group = new THREE.Group();

  // Center Gaze Reticle
  const dotGeo = new THREE.CircleGeometry(0.0045, 16);
  const dotMat = new THREE.MeshBasicMaterial({
    color: 0xfde68a,
    transparent: true,
    opacity: 0.9,
    depthTest: false,
  });
  const dot = new THREE.Mesh(dotGeo, dotMat);
  dot.position.z = -1.0;
  dot.renderOrder = 999;
  group.add(dot);

  // Outer Gaze Dwell Progress Ring
  const ringCanvas = document.createElement('canvas');
  ringCanvas.width = 128;
  ringCanvas.height = 128;
  const rCtx = ringCanvas.getContext('2d')!;
  const ringTex = new THREE.CanvasTexture(ringCanvas);
  ringTex.colorSpace = THREE.SRGBColorSpace;
  const ringMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.065, 0.065),
    new THREE.MeshBasicMaterial({
      map: ringTex,
      transparent: true,
      depthTest: false,
    })
  );
  ringMesh.position.z = -0.99;
  ringMesh.renderOrder = 999;
  group.add(ringMesh);

  // Optical Vignette / Sighting Mask (Binoculars / Telescope / Signal Slit)
  const opticCanvas = document.createElement('canvas');
  opticCanvas.width = 512;
  opticCanvas.height = 512;
  const oCtx = opticCanvas.getContext('2d')!;
  const opticTex = new THREE.CanvasTexture(opticCanvas);
  opticTex.colorSpace = THREE.SRGBColorSpace;
  const opticMat = new THREE.MeshBasicMaterial({
    map: opticTex,
    transparent: true,
    depthTest: false,
  });
  const opticMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), opticMat);
  opticMesh.position.z = -0.82;
  opticMesh.renderOrder = 996;
  opticMesh.visible = false;
  group.add(opticMesh);

  // Scene-Space Subtitle & Objective Slate (visible in both eyes in VR / Stereo)
  const slateCanvas = document.createElement('canvas');
  slateCanvas.width = 768;
  slateCanvas.height = 256;
  const sCtx = slateCanvas.getContext('2d')!;
  const slateTex = new THREE.CanvasTexture(slateCanvas);
  slateTex.colorSpace = THREE.SRGBColorSpace;
  const slateMat = new THREE.MeshBasicMaterial({
    map: slateTex,
    transparent: true,
    depthTest: false,
  });
  const slateMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.3), slateMat);
  slateMesh.position.set(0, -0.45, -1.35);
  slateMesh.rotation.x = -0.22;
  slateMesh.renderOrder = 998;
  group.add(slateMesh);

  let lastProgress = -1;
  let lastHover = '';
  let lastSlateSig = '';
  let lastOpticSig = '';

  const updateReticle = (hoverLabel: string | null, dwellProgress: number, isGazeMode: boolean) => {
    const quantized = Math.round(dwellProgress * 40) / 40;
    const hoverKey = hoverLabel || '';
    if (quantized === lastProgress && hoverKey === lastHover) return;
    lastProgress = quantized;
    lastHover = hoverKey;

    dotMat.color.setHex(hoverLabel ? 0xf59e0b : 0xe2e8f0);
    dot.scale.setScalar(hoverLabel ? 1.4 : 1.0);

    rCtx.clearRect(0, 0, 128, 128);
    if (hoverLabel) {
      rCtx.strokeStyle = 'rgba(255,255,255,0.28)';
      rCtx.lineWidth = 8;
      rCtx.beginPath();
      rCtx.arc(64, 64, 46, 0, Math.PI * 2);
      rCtx.stroke();

      if (isGazeMode && dwellProgress > 0.01) {
        rCtx.strokeStyle = '#f59e0b';
        rCtx.lineWidth = 10;
        rCtx.beginPath();
        rCtx.arc(64, 64, 46, -Math.PI / 2, -Math.PI / 2 + dwellProgress * Math.PI * 2);
        rCtx.stroke();
      }
    }
    ringTex.needsUpdate = true;
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) => {
    const words = text.split(' ');
    let line = '';
    let cy = y;
    for (let i = 0; i < words.length; i++) {
      const test = line + words[i] + ' ';
      if (ctx.measureText(test).width > maxW && i > 0) {
        ctx.fillText(line.trim(), x, cy);
        line = words[i] + ' ';
        cy += lineH;
      } else {
        line = test;
      }
    }
    if (line.trim()) ctx.fillText(line.trim(), x, cy);
  };

  const updateOpticOverlay = (state: GameState, aspect = 1.6) => {
    const activeType = state.binocularActive
      ? 'binoc'
      : state.telescopeActive
      ? 'scope'
      : state.slitViewActive
      ? 'slit'
      : 'none';
    opticMesh.visible = activeType !== 'none';
    if (activeType === 'none') return;

    const focusVal = activeType === 'binoc' ? state.binocularFocus : state.telescopeFocus;
    const targetMin = activeType === 'binoc' ? 6 : 5;
    const targetMax = activeType === 'binoc' ? 8 : 7;
    const sharp = focusVal >= targetMin && focusVal <= targetMax;
    const aspectBucket = Math.round(aspect * 20) / 20;
    const sig = `${activeType}|${focusVal}|${sharp}|${aspectBucket}`;
    if (sig === lastOpticSig) return;
    lastOpticSig = sig;

    oCtx.clearRect(0, 0, 512, 512);
    oCtx.fillStyle = 'rgba(4, 10, 15, 0.9)';
    oCtx.fillRect(0, 0, 512, 512);

    oCtx.save();
    oCtx.translate(256, 256);
    oCtx.scale(1 / Math.max(0.5, aspectBucket), 1);
    oCtx.globalCompositeOperation = 'destination-out';
    if (activeType === 'slit') {
      oCtx.fillRect(-210 * aspectBucket, -74, 420 * aspectBucket, 148);
    } else if (activeType === 'binoc') {
      oCtx.beginPath();
      oCtx.arc(-88, 0, 142, 0, Math.PI * 2);
      oCtx.arc(88, 0, 142, 0, Math.PI * 2);
      oCtx.fill();
    } else {
      oCtx.beginPath();
      oCtx.arc(0, 0, 175, 0, Math.PI * 2);
      oCtx.fill();
    }
    oCtx.restore();

    if (activeType !== 'slit') {
      oCtx.strokeStyle = sharp ? 'rgba(52, 211, 153, 0.78)' : 'rgba(245, 158, 11, 0.72)';
      oCtx.lineWidth = 3;
      oCtx.beginPath();
      oCtx.moveTo(232, 256);
      oCtx.lineTo(280, 256);
      oCtx.moveTo(256, 232);
      oCtx.lineTo(256, 280);
      oCtx.stroke();
    }
    opticTex.needsUpdate = true;
  };

  const updateOpticTransform = (fovDeg: number, aspect: number, state: GameState) => {
    updateOpticOverlay(state, aspect);
    if (!opticMesh.visible) return;
    const visH = 2 * 0.82 * Math.tan(THREE.MathUtils.degToRad(fovDeg * 0.5)) * 1.04;
    const visW = visH * Math.max(0.5, aspect);
    opticMesh.scale.set(visW, visH, 1);
  };

  const updateSlate = (state: GameState, settings: GameSettings) => {
    const isVr = state.inputMode === 'phone-vr' || state.inputMode === 'webxr';
    slateMesh.visible = isVr && state.phase !== 'title' && state.phase !== 'credits';
    if (!slateMesh.visible) return;

    const holdSec = state.crossingBeat === 1 ? state.e4ClearTimer.toFixed(1) : '';
    const sig = `${state.phase}|${state.chapter}|${state.currentArea}|${state.radioChannel}|${state.bearingDegrees}|${holdSec}|${state.subtitle?.text ?? ''}|${settings.textSize}|${settings.subtitlesEnabled}`;
    if (sig === lastSlateSig) return;
    lastSlateSig = sig;

    sCtx.clearRect(0, 0, 768, 256);

    sCtx.fillStyle = 'rgba(10, 18, 26, 0.88)';
    sCtx.strokeStyle = 'rgba(217, 154, 56, 0.65)';
    sCtx.lineWidth = 3;
    sCtx.beginPath();
    sCtx.roundRect(14, 14, 740, 228, 16);
    sCtx.fill();
    sCtx.stroke();

    const large = settings.textSize === 'large';

    sCtx.fillStyle = '#fbbf24';
    sCtx.font = `bold ${large ? 21 : 18}px monospace`;
    const statusRight =
      state.currentArea === 'radio_room'
        ? `CH ${state.radioChannel}`
        : state.currentArea === 'lantern_room'
        ? `BRG ${formatBearing(state.bearingDegrees)}`
        : state.currentArea === 'wheelhouse'
        ? 'WHEELHOUSE'
        : `CH.${state.chapter}`;
    sCtx.fillText(getActiveObjective(state).slice(0, 48), 34, 52);
    sCtx.textAlign = 'right';
    sCtx.fillText(statusRight, 734, 52);
    sCtx.textAlign = 'left';

    if (state.chapter === 5 && state.crossingBeat === 1) {
      const pct = Math.min(1, state.e4ClearTimer / (E4_CROSSING_CLEAR_TIME * 0.85));
      sCtx.fillStyle = 'rgba(255,255,255,0.16)';
      sCtx.fillRect(34, 70, 700, 14);
      sCtx.fillStyle = '#22c55e';
      sCtx.fillRect(34, 70, 700 * pct, 14);
    }

    if (settings.subtitlesEnabled && state.subtitle) {
      sCtx.fillStyle = '#93c5fd';
      sCtx.font = `bold ${large ? 20 : 17}px sans-serif`;
      sCtx.fillText(state.subtitle.speaker, 34, 114);

      sCtx.fillStyle = '#f8fafc';
      sCtx.font = `${large ? 24 : 20}px sans-serif`;
      wrapText(sCtx, state.subtitle.text, 34, 148, 700, large ? 29 : 25);
    }

    slateTex.needsUpdate = true;
  };

  const dispose = () => {
    dotGeo.dispose();
    dotMat.dispose();
    ringTex.dispose();
    opticTex.dispose();
    opticMat.dispose();
    slateTex.dispose();
    slateMat.dispose();
  };

  return { group, updateReticle, updateSlate, updateOpticTransform, dispose };
}

export interface BridgeStudio {
  texture: THREE.Texture;
  renderIfNeeded: (
    renderer: THREE.WebGLRenderer,
    time: number,
    transmitting: boolean,
    turning: boolean
  ) => void;
  dispose: () => void;
}

export function createBridgeStudio(): BridgeStudio {
  const rt = new THREE.WebGLRenderTarget(256, 192, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });
  const bridgeScene = new THREE.Scene();
  bridgeScene.background = new THREE.Color(0x0c1926);

  const bridgeCam = new THREE.PerspectiveCamera(36, 256 / 192, 0.1, 12);
  bridgeCam.position.set(0.18, 0.58, 1.35);
  bridgeCam.lookAt(0, 0.52, 0);

  const key = new THREE.PointLight(0xfbbf24, 3.8, 6);
  key.position.set(0.6, 1.1, 1.0);
  const fill = new THREE.HemisphereLight(0x60a5fa, 0x0f172a, 1.1);
  bridgeScene.add(key, fill);

  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 2.2),
    new THREE.MeshStandardMaterial({ color: 0x162430, roughness: 0.8 })
  );
  wall.position.set(0, 0.6, -0.45);
  bridgeScene.add(wall);

  const meera = createMeeraCharacter();
  meera.group.position.set(0, 0, 0);
  bridgeScene.add(meera.group);

  let lastRenderTime = -1;

  const renderIfNeeded = (
    renderer: THREE.WebGLRenderer,
    time: number,
    transmitting: boolean,
    turning: boolean
  ) => {
    if (!transmitting) return;
    if (time - lastRenderTime < 0.08) return;
    lastRenderTime = time;

    meera.update(time, transmitting, turning, false);
    const prevTarget = renderer.getRenderTarget();
    const prevXr = renderer.xr.enabled;
    renderer.xr.enabled = false;
    renderer.setRenderTarget(rt);
    renderer.render(bridgeScene, bridgeCam);
    renderer.setRenderTarget(prevTarget);
    renderer.xr.enabled = prevXr;
  };

  const dispose = () => {
    rt.dispose();
  };

  return { texture: rt.texture, renderIfNeeded, dispose };
}
