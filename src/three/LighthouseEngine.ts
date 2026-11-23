import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { GameSettings, GameState, InputMode, TeleportNodeId } from '../game/gameState';
import { soundEngine } from '../audio/soundEngine';
import { createKeeperGloves, type KeeperGlovesRig } from './characters';
import { createProceduralTextures, type MaterialTextures } from './textures';
import { createBridgeStudio, createVrHudRig, type BridgeStudio, type VrHudRig } from './vrHud';
import {
  buildLighthouseWorld,
  clampPlayerPosition,
  TELEPORT_NODES,
  type WorldHandles,
} from './worldBuilder';

export interface EngineCallbacks {
  getState: () => GameState;
  getSettings: () => GameSettings;
  onAction: (actionId: string) => void;
  onTick: (dt: number) => void;
  onHoverChange: (hover: { actionId: string; label: string } | null, dwellProgress: number) => void;
  onTeleportFade: (opacity: number) => void;
  onSensorStatus: (status: 'checking' | 'active' | 'unavailable') => void;
  onWebXrEnded: () => void;
  onContextLost: (lost: boolean) => void;
}

function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

export class LighthouseEngine {
  private container: HTMLElement;
  private callbacks: EngineCallbacks;
  public readonly isSoftwareGl: boolean;
  private readonly isMobileDevice: boolean;

  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private stereoCamera: THREE.StereoCamera;
  private cameraRig: THREE.Group;
  private headHolder: THREE.Group;

  private textures: MaterialTextures;
  private bridgeStudio: BridgeStudio;
  private world: WorldHandles;
  private gloves: KeeperGlovesRig;
  private vrHud: VrHudRig;

  private raycaster = new THREE.Raycaster();
  private interactMeshes: THREE.Object3D[] = [];
  private meshActionMap = new Map<THREE.Object3D, { actionId: string; label: string }>();

  private yaw = -1.42;
  private pitch = -0.06;
  private gyroQuat = new THREE.Quaternion();
  private gyroZeroYaw = 0;
  private hasGyroReading = false;
  private gyroCheckTimer: number | null = null;
  private gyroListenerActive = false;

  private pointerDown = false;
  private pointerMoved = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private keys = new Set<string>();
  private touchMoveVec = { x: 0, z: 0 };

  private currentHovered: { actionId: string; label: string } | null = null;
  private dwellTimer = 0;
  private dwellConsumed = false;
  private readonly DWELL_DURATION = 0.8;

  private fadePhase: 'idle' | 'in' = 'idle';
  private fadeAlpha = 0;

  private frameId = 0;
  private disposed = false;
  private lastTime = performance.now();
  private simTime = 0;
  private lastViewportW = 0;
  private lastViewportH = 0;
  private resizeObserver: ResizeObserver;
  private xrSession: XRSession | null = null;
  private xrController0: THREE.Group | null = null;
  private xrController1: THREE.Group | null = null;

  private readonly _vec2 = new THREE.Vector2(0, 0);
  private readonly _vec3A = new THREE.Vector3();
  private readonly _vec3B = new THREE.Vector3();
  private readonly _vec3C = new THREE.Vector3();
  private readonly _euler = new THREE.Euler(0, 0, 0, 'YXZ');
  private readonly _q1 = new THREE.Quaternion();
  private readonly _q2 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
  private readonly _q0 = new THREE.Quaternion();

  constructor(container: HTMLElement, callbacks: EngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.isSoftwareGl = detectSoftwareGl();
    this.isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl && !this.isMobileDevice,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.lastViewportW = w;
    this.lastViewportH = h;
    this.renderer.setSize(w, h);
    this.applyQualityProfile(callbacks.getSettings());

    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.tabIndex = 0;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(68, w / h, 0.08, 420);
    this.stereoCamera = new THREE.StereoCamera();
    this.stereoCamera.eyeSep = 0.064;

    this.cameraRig = new THREE.Group();
    this.headHolder = new THREE.Group();
    this.cameraRig.add(this.headHolder);
    this.headHolder.add(this.camera);
    this.scene.add(this.cameraRig);

    this.gloves = createKeeperGloves();
    this.camera.add(this.gloves.group);
    this.vrHud = createVrHudRig();
    this.camera.add(this.vrHud.group);

    const maxAniso = this.isSoftwareGl ? 1 : Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    this.textures = createProceduralTextures(maxAniso);
    this.bridgeStudio = createBridgeStudio();
    this.world = buildLighthouseWorld(this.scene, this.textures, {
      isSoftwareGl: this.isSoftwareGl,
      isMobile: this.isMobileDevice || callbacks.getSettings().quality === 'mobile',
      bridgeTexture: this.bridgeStudio.texture,
    });

    this.world.interactables.forEach((item) => {
      item.mesh.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          this.interactMeshes.push(child);
          this.meshActionMap.set(child, { actionId: item.actionId, label: item.label });
        }
      });
    });

    this.snapCameraToState(callbacks.getState(), callbacks.getSettings());

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.bindEvents();

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    this.scheduleNextFrame();
  }

  public applyQualityProfile(settings: GameSettings): void {
    const mobileCap = settings.quality === 'mobile' || (settings.quality === 'auto' && this.isMobileDevice);
    const pr = this.isSoftwareGl
      ? 1
      : mobileCap
      ? Math.min(window.devicePixelRatio, 1.35)
      : Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pr);
  }

  public setTouchMoveVector(x: number, z: number): void {
    this.touchMoveVec.x = x;
    this.touchMoveVec.z = z;
  }

  public setLookAngles(yaw: number, pitch: number): void {
    this.yaw = yaw;
    this.pitch = THREE.MathUtils.clamp(pitch, -1.25, 1.25);
    this.syncImmediateRender();
  }

  public syncImmediateRender(): void {
    const state = this.callbacks.getState();
    const settings = this.callbacks.getSettings();
    const targetFov =
      state.binocularActive || state.telescopeActive
        ? 28
        : state.slitViewActive
        ? 40
        : 68;
    if (Math.abs(this.camera.fov - targetFov) > 0.1) {
      this.camera.fov = targetFov;
      this.camera.updateProjectionMatrix();
    }
    this.gloves.group.visible =
      state.phase !== 'title' &&
      !state.binocularActive &&
      !state.telescopeActive &&
      !state.slitViewActive;
    if (state.inputMode !== 'phone-vr' && state.inputMode !== 'webxr') {
      this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    }
    this.world.update(
      state,
      this.simTime,
      0,
      settings.reducedLightning,
      this.cameraRig.position.x,
      this.cameraRig.position.z
    );
    if (!this.xrSession) {
      this.vrHud.updateSlate(state, settings);
      this.renderScenePass(state);
    }
  }

  public triggerGloveAnimation(kind: 'turn' | 'press' | 'lever' | 'crank'): void {
    this.gloves.triggerAction(kind);
  }

  public triggerRejectShake(): void {
    this.world.generator.triggerRejectShake();
  }

  public snapCameraToState(state: GameState, settings: GameSettings): void {
    if (state.phase === 'title') {
      this.cameraRig.position.set(22, 4.4, 24);
      this.yaw = 0.72;
      this.pitch = 0.16;
      this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
      this.gloves.group.visible = false;
      return;
    }

    this.gloves.group.visible = true;
    const node = TELEPORT_NODES[state.currentNode];
    this.cameraRig.position.set(
      node.eyePos.x,
      node.eyePos.y + settings.seatedHeightOffset,
      node.eyePos.z
    );
    this.yaw = node.defaultYaw;
    this.pitch = node.defaultPitch;
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    this.world.update(
      state,
      this.simTime,
      0,
      settings.reducedLightning,
      this.cameraRig.position.x,
      this.cameraRig.position.z
    );
    if (!this.xrSession) {
      this.vrHud.updateSlate(state, settings);
      this.renderScenePass(state);
    }
  }

  public fadeTeleportToNode(nodeId: TeleportNodeId, settings: GameSettings): void {
    const node = TELEPORT_NODES[nodeId];
    this.cameraRig.position.set(
      node.eyePos.x,
      node.eyePos.y + settings.seatedHeightOffset,
      node.eyePos.z
    );
    this.yaw = node.defaultYaw;
    this.pitch = node.defaultPitch;
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');

    const state = this.callbacks.getState();
    this.world.update(
      state,
      this.simTime,
      0,
      settings.reducedLightning,
      this.cameraRig.position.x,
      this.cameraRig.position.z
    );
    if (!this.xrSession) {
      this.vrHud.updateSlate(state, settings);
      this.renderScenePass(state);
    }

    if (this.isSoftwareGl) {
      this.fadePhase = 'idle';
      this.fadeAlpha = 0;
      this.callbacks.onTeleportFade(0);
    } else {
      this.fadePhase = 'in';
      this.fadeAlpha = 0.72;
      this.callbacks.onTeleportFade(this.fadeAlpha);
    }
  }

  public updateSeatedHeight(offset: number, nodeId: TeleportNodeId, phase: string): void {
    if (phase === 'title') return;
    const node = TELEPORT_NODES[nodeId];
    this.cameraRig.position.y = node.eyePos.y + offset;
  }

  public recenterOrientation(): void {
    const euler = new THREE.Euler().setFromQuaternion(this.gyroQuat, 'YXZ');
    this.gyroZeroYaw = euler.y;
  }

  public async enablePhoneVrSensors(): Promise<boolean> {
    this.callbacks.onSensorStatus('checking');
    this.hasGyroReading = false;

    const DevOrient = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    try {
      if (DevOrient && typeof DevOrient.requestPermission === 'function') {
        const perm = await DevOrient.requestPermission();
        if (perm !== 'granted') {
          this.callbacks.onSensorStatus('unavailable');
          return false;
        }
      }
    } catch {
      this.callbacks.onSensorStatus('unavailable');
      return false;
    }

    if (!this.gyroListenerActive) {
      window.addEventListener('deviceorientation', this.onDeviceOrientation);
      this.gyroListenerActive = true;
    }

    if (this.gyroCheckTimer !== null) {
      window.clearTimeout(this.gyroCheckTimer);
    }
    this.gyroCheckTimer = window.setTimeout(() => {
      if (!this.hasGyroReading) {
        this.callbacks.onSensorStatus('unavailable');
      }
    }, 1800);

    return true;
  }

  public disablePhoneVrSensors(): void {
    if (this.gyroListenerActive) {
      window.removeEventListener('deviceorientation', this.onDeviceOrientation);
      this.gyroListenerActive = false;
    }
    if (this.gyroCheckTimer !== null) {
      window.clearTimeout(this.gyroCheckTimer);
      this.gyroCheckTimer = null;
    }
  }

  public async enterWebXr(): Promise<boolean> {
    if (!navigator.xr) return false;
    try {
      const supported = await navigator.xr.isSessionSupported('immersive-vr');
      if (!supported) return false;
      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor'],
      });
      this.xrSession = session;
      this.renderer.xr.enabled = true;
      await this.renderer.xr.setSession(session);

      const rayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -4),
      ]);
      const rayMat = new THREE.LineBasicMaterial({ color: 0xf59e0b });
      for (const idx of [0, 1]) {
        const ctrl = this.renderer.xr.getController(idx);
        const line = new THREE.Line(rayGeo, rayMat);
        ctrl.add(line);
        ctrl.addEventListener('select', () => this.onXrControllerSelect(ctrl));
        this.cameraRig.add(ctrl);
        if (idx === 0) this.xrController0 = ctrl;
        else this.xrController1 = ctrl;
      }

      session.addEventListener('end', () => {
        this.xrSession = null;
        this.renderer.xr.enabled = false;
        if (this.xrController0) this.cameraRig.remove(this.xrController0);
        if (this.xrController1) this.cameraRig.remove(this.xrController1);
        this.renderer.setAnimationLoop(null);
        this.scheduleNextFrame();
        this.callbacks.onWebXrEnded();
      });

      cancelAnimationFrame(this.frameId);
      clearTimeout(this.frameId);
      this.renderer.setAnimationLoop((timeMs) => this.renderFrame(timeMs));
      return true;
    } catch {
      return false;
    }
  }

  public async exitWebXr(): Promise<void> {
    if (this.xrSession) {
      await this.xrSession.end().catch(() => {});
      this.xrSession = null;
    }
  }

  public requestPointerLock(): void {
    const state = this.callbacks.getState();
    if (state.inputMode !== 'screen' || state.phase === 'title' || state.paused || state.phase === 'credits') {
      return;
    }
    try {
      this.renderer.domElement.requestPointerLock?.();
    } catch {
      // Fallback drag-look active
    }
  }

  public exitPointerLock(): void {
    if (document.pointerLockElement === this.renderer.domElement) {
      document.exitPointerLock?.();
    }
  }

  private onDeviceOrientation = (ev: DeviceOrientationEvent) => {
    if (ev.alpha === null || ev.beta === null || ev.gamma === null) return;
    if (!this.hasGyroReading) {
      this.hasGyroReading = true;
      this.callbacks.onSensorStatus('active');
    }

    const alpha = THREE.MathUtils.degToRad(ev.alpha);
    const beta = THREE.MathUtils.degToRad(ev.beta);
    const gamma = THREE.MathUtils.degToRad(ev.gamma);
    const orient = window.screen?.orientation?.angle
      ? THREE.MathUtils.degToRad(window.screen.orientation.angle)
      : typeof (window as unknown as { orientation?: number }).orientation === 'number'
      ? THREE.MathUtils.degToRad((window as unknown as { orientation: number }).orientation)
      : 0;

    this._euler.set(beta, alpha, -gamma, 'YXZ');
    this.gyroQuat.setFromEuler(this._euler);
    this.gyroQuat.multiply(this._q2);
    this.gyroQuat.multiply(this._q1.setFromAxisAngle(this._vec3A.set(0, 0, 1), -orient));
  };

  private onXrControllerSelect(ctrl: THREE.Group): void {
    const tempMat = new THREE.Matrix4().identity().extractRotation(ctrl.matrixWorld);
    this.raycaster.ray.origin.setFromMatrixPosition(ctrl.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMat);
    const hits = this.raycaster.intersectObjects(this.interactMeshes, false);
    if (hits.length > 0) {
      const info = this.meshActionMap.get(hits[0].object);
      if (info) {
        this.callbacks.onAction(info.actionId);
      }
    }
  }

  private bindEvents(): void {
    const canvas = this.renderer.domElement;

    canvas.addEventListener('webglcontextlost', this.onContextLost);
    canvas.addEventListener('webglcontextrestored', this.onContextRestored);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onWindowBlur);
  }

  private onContextLost = (e: Event) => {
    e.preventDefault();
    this.callbacks.onContextLost(true);
  };

  private onContextRestored = () => {
    this.callbacks.onContextLost(false);
  };

  private onWindowBlur = () => {
    this.keys.clear();
    this.pointerDown = false;
    this.touchMoveVec.x = 0;
    this.touchMoveVec.z = 0;
  };

  private onPointerDown = (e: PointerEvent) => {
    soundEngine.unlock();
    const state = this.callbacks.getState();
    if (state.phase === 'title' || state.paused || state.phase === 'credits') return;

    this.pointerDown = true;
    this.pointerMoved = false;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
  };

  private onPointerMove = (e: PointerEvent) => {
    const state = this.callbacks.getState();
    if (state.phase === 'title' || state.paused || state.phase === 'credits') return;

    if (document.pointerLockElement === this.renderer.domElement) {
      this.yaw -= e.movementX * 0.0024;
      this.pitch = THREE.MathUtils.clamp(this.pitch - e.movementY * 0.0024, -1.25, 1.25);
      return;
    }

    if (this.pointerDown) {
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        this.pointerMoved = true;
      }
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.yaw -= dx * 0.0042;
      this.pitch = THREE.MathUtils.clamp(this.pitch - dy * 0.0042, -1.25, 1.25);
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    const wasDown = this.pointerDown;
    this.pointerDown = false;
    if (!wasDown) return;

    const state = this.callbacks.getState();
    if (state.phase === 'title' || state.paused || state.phase === 'credits') return;

    if (!this.pointerMoved) {
      if (document.pointerLockElement === this.renderer.domElement) {
        if (this.currentHovered) {
          this.callbacks.onAction(this.currentHovered.actionId);
        }
      } else {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this._vec2.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this._vec2.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this._vec2, this.camera);
        const hits = this.raycaster.intersectObjects(this.interactMeshes, false);
        if (hits.length > 0 && hits[0].distance < 10) {
          const info = this.meshActionMap.get(hits[0].object);
          if (info) {
            this.callbacks.onAction(info.actionId);
            return;
          }
        }
        if (state.inputMode === 'screen' && e.pointerType === 'mouse') {
          this.requestPointerLock();
        }
      }
    }
  };

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.code);
    const state = this.callbacks.getState();
    if (state.phase === 'title' || state.paused || state.phase === 'credits') return;

    if (e.code === 'KeyE') {
      if (this.currentHovered) {
        this.callbacks.onAction(this.currentHovered.actionId);
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  public handleResize(): void {
    if (this.disposed) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    if (w <= 0 || h <= 0) return;

    const state = this.callbacks.getState();
    const isStereo = state.inputMode === 'phone-vr';
    this.camera.aspect = isStereo ? w / 2 / h : w / h;
    this.camera.updateProjectionMatrix();

    if (w !== this.lastViewportW || h !== this.lastViewportH) {
      this.lastViewportW = w;
      this.lastViewportH = h;
      this.renderer.setSize(w, h);
    }

    if (!this.xrSession) {
      const settings = this.callbacks.getSettings();
      this.vrHud.updateSlate(state, settings);
      this.world.update(
        state,
        this.simTime,
        0,
        settings.reducedLightning,
        this.cameraRig.position.x,
        this.cameraRig.position.z
      );
      this.renderScenePass(state);
    }
  }

  private scheduleNextFrame(): void {
    if (this.disposed || this.xrSession) return;
    if (this.isSoftwareGl) {
      this.afterDraw(() => this.renderFrame(performance.now()));
    } else {
      this.frameId = requestAnimationFrame((t) => this.renderFrame(t));
    }
  }

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      this.frameId = window.setTimeout(cb, 24);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const status = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
      if (status === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 24);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private renderFrame(nowMs: number): void {
    if (this.disposed) return;
    const rawDt = Math.max(0.001, (nowMs - this.lastTime) / 1000);
    this.lastTime = nowMs;
    const clampedTotalDt = this.isSoftwareGl ? Math.min(rawDt, 1.0) : Math.min(rawDt, 0.1);
    const dt = Math.min(rawDt, 0.05);
    this.simTime += clampedTotalDt;

    let remaining = clampedTotalDt;
    while (remaining > 0.0001) {
      const step = Math.min(remaining, 0.05);
      this.callbacks.onTick(step);
      remaining -= step;
    }

    const state = this.callbacks.getState();
    const settings = this.callbacks.getSettings();

    this.vrHud.group.visible = state.phase !== 'title' && state.phase !== 'credits';

    // Optical Zoom FOV (Binoculars, Mounted Telescope, Sighting Slit)
    const targetFov =
      state.binocularActive || state.telescopeActive
        ? 28
        : state.slitViewActive
        ? 40
        : 68;
    if (Math.abs(this.camera.fov - targetFov) > 0.1) {
      this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 10, clampedTotalDt);
      this.camera.updateProjectionMatrix();
    }

    if (state.phase === 'title') {
      this.cameraRig.position.x = 22 + Math.sin(this.simTime * 0.14) * 2.2;
      this.cameraRig.position.z = 24 + Math.cos(this.simTime * 0.12) * 1.6;
      this.camera.lookAt(0, 7.2, 0);
      this.gloves.group.visible = false;
    } else {
      this.gloves.group.visible = !state.binocularActive && !state.telescopeActive && !state.slitViewActive;

      if (!state.paused && state.phase !== 'credits') {
        // Arrow keys + Q/E turn & tilt comfortably
        if (this.keys.has('ArrowLeft') || this.keys.has('KeyQ')) this.yaw += clampedTotalDt * 1.45;
        if (this.keys.has('ArrowRight')) this.yaw -= clampedTotalDt * 1.45;
        if (this.keys.has('ArrowUp')) this.pitch = Math.min(1.2, this.pitch + clampedTotalDt * 1.1);
        if (this.keys.has('ArrowDown')) this.pitch = Math.max(-1.2, this.pitch - clampedTotalDt * 1.1);

        // Optional WASD & Touch Thumbstick free-walking inside playable area bounds
        if (
          (state.inputMode === 'screen' || state.inputMode === 'touch') &&
          state.currentArea !== 'wheelhouse' &&
          !state.binocularActive &&
          !state.telescopeActive &&
          !state.slitViewActive
        ) {
          let moveForward = 0;
          let moveRight = 0;
          if (this.keys.has('KeyW')) moveForward += 1;
          if (this.keys.has('KeyS')) moveForward -= 1;
          if (this.keys.has('KeyD')) moveRight += 1;
          if (this.keys.has('KeyA')) moveRight -= 1;

          moveForward += -this.touchMoveVec.z;
          moveRight += this.touchMoveVec.x;

          if (Math.abs(moveForward) > 0.05 || Math.abs(moveRight) > 0.05) {
            const speed = 2.85 * clampedTotalDt;
            const sinY = Math.sin(this.yaw);
            const cosY = Math.cos(this.yaw);
            const dx = (-sinY * moveForward + cosY * moveRight) * speed;
            const dz = (-cosY * moveForward - sinY * moveRight) * speed;
            const clamped = clampPlayerPosition(
              state.currentArea,
              state.currentNode,
              this.cameraRig.position.x + dx,
              this.cameraRig.position.z + dz
            );
            this.cameraRig.position.x = clamped.x;
            this.cameraRig.position.z = clamped.z;
          }
        }
      }

      // Snap camera to M/V Thendral Wheelhouse while riding crossing beat!
      if (state.currentNode === 'ferry_wheelhouse' && state.phase === 'rescue_sequence') {
        this.cameraRig.position.set(
          this.world.ferry.wheelhouseEyeWorld.x,
          this.world.ferry.wheelhouseEyeWorld.y + settings.seatedHeightOffset,
          this.world.ferry.wheelhouseEyeWorld.z
        );
      }

      if (state.inputMode === 'phone-vr' && this.hasGyroReading) {
        this._q0.setFromAxisAngle(this._vec3A.set(0, 1, 0), -this.gyroZeroYaw + this.yaw);
        this.camera.quaternion.copy(this._q0).multiply(this.gyroQuat);
      } else if (state.inputMode !== 'webxr') {
        this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
      }

      if (this.fadePhase === 'in') {
        this.fadeAlpha = Math.max(0, this.fadeAlpha - clampedTotalDt * 4.5);
        this.callbacks.onTeleportFade(this.fadeAlpha);
        if (this.fadeAlpha <= 0) {
          this.fadePhase = 'idle';
        }
      }
    }

    const isGazeMode = state.inputMode === 'phone-vr' || state.inputMode === 'webxr';
    if (state.phase !== 'title' && !state.paused && state.phase !== 'credits') {
      this._vec2.set(0, 0);
      this.raycaster.setFromCamera(this._vec2, this.camera);
      const hits = this.raycaster.intersectObjects(this.interactMeshes, false);
      let nextHover: { actionId: string; label: string } | null = null;
      if (hits.length > 0 && hits[0].distance < 9.5) {
        nextHover = this.meshActionMap.get(hits[0].object) ?? null;
      }

      if (nextHover?.actionId !== this.currentHovered?.actionId) {
        this.currentHovered = nextHover;
        this.dwellTimer = 0;
        this.dwellConsumed = false;
      } else if (nextHover && isGazeMode && !this.dwellConsumed) {
        this.dwellTimer += dt;
        if (this.dwellTimer >= this.DWELL_DURATION) {
          this.dwellConsumed = true;
          this.callbacks.onAction(nextHover.actionId);
        }
      }

      const dwellProgress =
        isGazeMode && nextHover && !this.dwellConsumed
          ? Math.min(1, this.dwellTimer / this.DWELL_DURATION)
          : 0;
      this.vrHud.updateReticle(nextHover?.label ?? null, dwellProgress, isGazeMode);
      this.callbacks.onHoverChange(nextHover, dwellProgress);
    } else {
      this.vrHud.updateReticle(null, 0, false);
      this.callbacks.onHoverChange(null, 0);
    }

    const animDt = Math.min(clampedTotalDt, 0.25);
    this.vrHud.updateSlate(state, settings);
    this.gloves.update(animDt);
    this.world.update(
      state,
      this.simTime,
      animDt,
      settings.reducedLightning,
      this.cameraRig.position.x,
      this.cameraRig.position.z
    );

    const transmitting =
      state.activeTransmission === 'meera_distress' ||
      state.activeTransmission === 'meera_buoy' ||
      state.activeTransmission === 'meera_route' ||
      state.activeTransmission === 'meera_offcourse' ||
      state.activeTransmission === 'meera_hold' ||
      state.activeTransmission === 'meera_closing';
    this.bridgeStudio.renderIfNeeded(
      this.renderer,
      this.simTime,
      transmitting,
      state.phase === 'rescue_sequence'
    );

    this.camera.getWorldPosition(this._vec3A);
    this.camera.getWorldDirection(this._vec3B);
    this._vec3C.set(0, 1, 0).applyQuaternion(this.camera.getWorldQuaternion(this._q1));
    soundEngine.updateListener(
      { x: this._vec3A.x, y: this._vec3A.y, z: this._vec3A.z },
      { x: this._vec3B.x, y: this._vec3B.y, z: this._vec3B.z },
      { x: this._vec3C.x, y: this._vec3C.y, z: this._vec3C.z }
    );
    soundEngine.updateEnvironmentState({
      floor: state.currentFloor,
      area: state.currentArea,
      dawnMix: state.dawnMix,
      generatorRunning: state.generatorRunning,
      radioChannel: state.radioChannel,
      radioSolved: state.radioSolved,
      phase: state.phase,
      ferryPos: {
        x: this.world.ferry.group.position.x,
        y: this.world.ferry.group.position.y + 2,
        z: this.world.ferry.group.position.z,
      },
    });

    this.renderScenePass(state);

    if (!this.xrSession) {
      this.scheduleNextFrame();
    }
  }

  private renderScenePass(state: GameState): void {
    if (this.disposed) return;
    if (state.inputMode === 'phone-vr' && !this.xrSession) {
      const size = this.renderer.getSize(this._vec2);
      const halfW = Math.max(1, Math.floor(size.x / 2));
      const fullH = Math.max(1, Math.floor(size.y));

      this.camera.aspect = halfW / fullH;
      this.camera.updateProjectionMatrix();
      this.vrHud.updateOpticTransform(this.camera.fov, this.camera.aspect, state);
      this.cameraRig.updateMatrixWorld(true);
      this.stereoCamera.aspect = 1;
      this.stereoCamera.update(this.camera);

      this.renderer.setRenderTarget(null);
      this.renderer.setScissorTest(true);

      this.renderer.setViewport(0, 0, halfW, fullH);
      this.renderer.setScissor(0, 0, halfW, fullH);
      this.renderer.render(this.scene, this.stereoCamera.cameraL);

      this.renderer.setViewport(halfW, 0, Math.max(1, size.x - halfW), fullH);
      this.renderer.setScissor(halfW, 0, Math.max(1, size.x - halfW), fullH);
      this.renderer.render(this.scene, this.stereoCamera.cameraR);

      this.renderer.setScissorTest(false);
    } else {
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      this.vrHud.updateOpticTransform(this.camera.fov, this.camera.aspect, state);
      this.renderer.setRenderTarget(null);
      this.renderer.setScissorTest(false);
      this.renderer.setViewport(0, 0, w, h);
      this.renderer.render(this.scene, this.camera);
    }
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.disablePhoneVrSensors();
    this.resizeObserver.disconnect();
    this.exitWebXr();

    const canvas = this.renderer.domElement;
    canvas.removeEventListener('webglcontextlost', this.onContextLost);
    canvas.removeEventListener('webglcontextrestored', this.onContextRestored);
    canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);

    this.world.dispose();
    this.textures.dispose();
    this.bridgeStudio.dispose();
    this.vrHud.dispose();
    this.renderer.dispose();
    if (canvas.parentElement) {
      canvas.parentElement.removeChild(canvas);
    }
  }
}
