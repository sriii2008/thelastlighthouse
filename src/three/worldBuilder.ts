import * as THREE from 'three';
import {
  isNodeUnlocked,
  type AreaId,
  type GameState,
  type TeleportNodeId,
} from '../game/gameState';
import {
  createMeeraCharacter,
  createMuthuCharacter,
  type MeeraCharacter,
  type MuthuCharacter,
} from './characters';
import {
  createBoathousePropsAssembly,
  createCottageAssembly,
  createDriftingBuoyE4,
  createFerryAssembly,
  createFresnelAssembly,
  createGeneratorAssembly,
  createRadioAssembly,
  createSignalHutPropsAssembly,
  type BoathousePropsAssembly,
  type BuoyE4Assembly,
  type CottageAssembly,
  type FerryAssembly,
  type FresnelAssembly,
  type GeneratorAssembly,
  type InteractiveHandle,
  type RadioAssembly,
  type SignalHutPropsAssembly,
} from './props';
import type { MaterialTextures } from './textures';

export interface TeleportNode {
  id: TeleportNodeId;
  floor: 1 | 2 | 3;
  area: AreaId;
  label: string;
  eyePos: THREE.Vector3;
  defaultYaw: number; // radians
  defaultPitch: number;
  beaconPos: THREE.Vector3;
}

export const TELEPORT_NODES: Record<TeleportNodeId, TeleportNode> = {
  jetty_head: {
    id: 'jetty_head',
    floor: 1,
    area: 'jetty',
    label: 'Vaanthurai Jetty',
    eyePos: new THREE.Vector3(27.5, 3.68, 11.0),
    defaultYaw: -1.42,
    defaultPitch: -0.06,
    beaconPos: new THREE.Vector3(27.5, 2.13, 11.0),
  },
  walkway_yard: {
    id: 'walkway_yard',
    floor: 1,
    area: 'walkway',
    label: 'Covered Walkway',
    eyePos: new THREE.Vector3(-4.2, 4.08, 6.2),
    defaultYaw: 2.38,
    defaultPitch: -0.06,
    beaconPos: new THREE.Vector3(-4.2, 2.53, 6.2),
  },
  cottage_table: {
    id: 'cottage_table',
    floor: 1,
    area: 'cottage',
    label: 'Cottage Chart Table',
    eyePos: new THREE.Vector3(-10.0, 4.08, 13.05),
    defaultYaw: 0.0,
    defaultPitch: -0.26,
    beaconPos: new THREE.Vector3(-10.0, 2.53, 13.05),
  },
  cottage_window: {
    id: 'cottage_window',
    floor: 1,
    area: 'cottage',
    label: 'Cottage East Window',
    eyePos: new THREE.Vector3(-8.45, 4.08, 12.15),
    defaultYaw: -1.18,
    defaultPitch: -0.08,
    beaconPos: new THREE.Vector3(-8.45, 2.53, 12.15),
  },
  f1_desk: {
    id: 'f1_desk',
    floor: 1,
    area: 'radio_room',
    label: 'Radio Desk',
    eyePos: new THREE.Vector3(-0.35, 4.1, 0.75),
    defaultYaw: -0.38,
    defaultPitch: -0.13,
    beaconPos: new THREE.Vector3(-0.35, 2.53, 0.75),
  },
  f1_door: {
    id: 'f1_door',
    floor: 1,
    area: 'radio_room',
    label: 'Stairwell Door',
    eyePos: new THREE.Vector3(-0.85, 4.1, -0.3),
    defaultYaw: 0.9,
    defaultPitch: -0.05,
    beaconPos: new THREE.Vector3(-1.35, 2.53, -0.95),
  },
  f2_cabinet: {
    id: 'f2_cabinet',
    floor: 2,
    area: 'generator_gallery',
    label: 'Fuse Cabinet',
    eyePos: new THREE.Vector3(-0.42, 8.15, 0.96),
    defaultYaw: 0.03,
    defaultPitch: -0.13,
    beaconPos: new THREE.Vector3(-0.42, 6.73, 0.96),
  },
  f2_generator: {
    id: 'f2_generator',
    floor: 2,
    area: 'generator_gallery',
    label: 'Generator & Stairs',
    eyePos: new THREE.Vector3(0.75, 8.3, 0.95),
    defaultYaw: 0.25,
    defaultPitch: -0.08,
    beaconPos: new THREE.Vector3(0.95, 6.73, 0.95),
  },
  boathouse_slipway: {
    id: 'boathouse_slipway',
    floor: 1,
    area: 'boathouse',
    label: 'Boathouse Slipway',
    eyePos: new THREE.Vector3(4.9, 2.98, 21.8),
    defaultYaw: -1.45,
    defaultPitch: -0.1,
    beaconPos: new THREE.Vector3(4.9, 1.43, 21.8),
  },
  boathouse_upper: {
    id: 'boathouse_upper',
    floor: 2,
    area: 'boathouse',
    label: 'Boathouse Telescope',
    eyePos: new THREE.Vector3(6.2, 5.15, 22.1),
    defaultYaw: -1.36,
    defaultPitch: -0.06,
    beaconPos: new THREE.Vector3(6.2, 3.63, 22.1),
  },
  signal_hut_shutter: {
    id: 'signal_hut_shutter',
    floor: 1,
    area: 'signal_hut',
    label: 'Signal Hut Shutter',
    eyePos: new THREE.Vector3(18.5, 3.68, 11.75),
    defaultYaw: 0.02,
    defaultPitch: -0.12,
    beaconPos: new THREE.Vector3(18.5, 2.13, 11.75),
  },
  signal_hut_board: {
    id: 'signal_hut_board',
    floor: 1,
    area: 'signal_hut',
    label: 'Harbor Plot Board',
    eyePos: new THREE.Vector3(18.7, 3.68, 11.2),
    defaultYaw: 1.52,
    defaultPitch: -0.08,
    beaconPos: new THREE.Vector3(18.7, 2.13, 11.95),
  },
  f3_gear: {
    id: 'f3_gear',
    floor: 3,
    area: 'lantern_room',
    label: 'Lens Crank',
    eyePos: new THREE.Vector3(-0.95, 12.56, 1.55),
    defaultYaw: -0.56,
    defaultPitch: -0.16,
    beaconPos: new THREE.Vector3(-0.95, 10.93, 1.55),
  },
  f3_window: {
    id: 'f3_window',
    floor: 3,
    area: 'lantern_room',
    label: 'East Window',
    eyePos: new THREE.Vector3(1.65, 12.5, -0.35),
    defaultYaw: -Math.PI * 0.45,
    defaultPitch: -0.1,
    beaconPos: new THREE.Vector3(1.65, 10.93, -0.35),
  },
  f3_balcony: {
    id: 'f3_balcony',
    floor: 3,
    area: 'lantern_room',
    label: 'Lantern Balcony',
    eyePos: new THREE.Vector3(3.15, 12.5, 1.65),
    defaultYaw: -2.05,
    defaultPitch: -0.22,
    beaconPos: new THREE.Vector3(3.15, 10.93, 1.65),
  },
  ferry_wheelhouse: {
    id: 'ferry_wheelhouse',
    floor: 3,
    area: 'wheelhouse',
    label: 'M/V Thendral Wheelhouse',
    eyePos: new THREE.Vector3(45, 3.92, -3),
    defaultYaw: 1.7,
    defaultPitch: -0.04,
    beaconPos: new THREE.Vector3(45, 3.9, -3),
  },
};

export function clampPlayerPosition(
  area: AreaId,
  nodeId: TeleportNodeId,
  x: number,
  z: number
): { x: number; z: number } {
  if (area === 'radio_room' || area === 'generator_gallery') {
    const r = Math.hypot(x, z);
    const maxR = 2.65;
    if (r > maxR) {
      return { x: (x / r) * maxR, z: (z / r) * maxR };
    }
    return { x, z };
  }
  if (area === 'lantern_room') {
    const r = Math.hypot(x, z);
    const maxR = nodeId === 'f3_balcony' ? 3.95 : 2.65;
    if (r > maxR) {
      return { x: (x / r) * maxR, z: (z / r) * maxR };
    }
    return { x, z };
  }
  if (area === 'cottage') {
    return {
      x: THREE.MathUtils.clamp(x, -11.7, -8.3),
      z: THREE.MathUtils.clamp(z, 10.6, 13.7),
    };
  }
  if (area === 'walkway') {
    return {
      x: THREE.MathUtils.clamp(x, -9.0, 17.5),
      z: THREE.MathUtils.clamp(z, 2.2, 13.0),
    };
  }
  if (area === 'boathouse') {
    return {
      x: THREE.MathUtils.clamp(x, 3.8, 8.2),
      z: THREE.MathUtils.clamp(z, 19.6, 24.4),
    };
  }
  if (area === 'signal_hut') {
    return {
      x: THREE.MathUtils.clamp(x, 17.3, 19.8),
      z: THREE.MathUtils.clamp(z, 9.8, 12.2),
    };
  }
  if (area === 'jetty') {
    return {
      x: THREE.MathUtils.clamp(x, 16.5, 30.2),
      z: THREE.MathUtils.clamp(z, 9.6, 12.4),
    };
  }
  return { x, z };
}

export interface WorldHandles {
  interactables: InteractiveHandle[];
  teleportMeshes: Map<TeleportNodeId, THREE.Mesh>;
  radio: RadioAssembly;
  generator: GeneratorAssembly;
  fresnel: FresnelAssembly;
  cottage: CottageAssembly;
  boathouse: BoathousePropsAssembly;
  signalHut: SignalHutPropsAssembly;
  buoyE4: BuoyE4Assembly;
  ferry: FerryAssembly;
  muthu: MuthuCharacter;
  meeraAshore: MeeraCharacter;
  bridgeScreenMesh: THREE.Mesh;
  bridgeScreenF3Mesh: THREE.Mesh;
  update: (
    state: GameState,
    time: number,
    dt: number,
    reducedLightning: boolean,
    camX: number,
    camZ: number
  ) => void;
  dispose: () => void;
}

function isPointIndoors(x: number, z: number): boolean {
  // Tower cylinder
  if (x * x + z * z < 3.15 * 3.15) return true;
  // Keeper's Cottage (-10, 12) radius box
  if (x >= -12.3 && x <= -7.7 && z >= 9.9 && z <= 14.1) return true;
  // Boathouse (6, 22)
  if (x >= 3.2 && x <= 8.8 && z >= 19.2 && z <= 24.8) return true;
  // Signal Hut (18.5, 11)
  if (x >= 16.8 && x <= 20.2 && z >= 9.4 && z <= 12.6) return true;
  return false;
}

export function buildLighthouseWorld(
  scene: THREE.Scene,
  textures: MaterialTextures,
  opts: { isSoftwareGl: boolean; isMobile: boolean; bridgeTexture: THREE.Texture }
): WorldHandles {
  const interactables: InteractiveHandle[] = [];
  const teleportMeshes = new Map<TeleportNodeId, THREE.Mesh>();

  // Sky & Fog setup (storm petroleum-blue -> pale coral dawn)
  const stormSkyColor = new THREE.Color(0x0b1822);
  const dawnSkyColor = new THREE.Color(0xd99b84);
  const skyColor = stormSkyColor.clone();
  scene.background = skyColor;
  const fog = new THREE.FogExp2(stormSkyColor.getHex(), 0.01);
  scene.fog = fog;

  // Lighting Rig (1 shadow-casting directional key + Hemisphere fill + interior/yard points)
  const hemiLight = new THREE.HemisphereLight(0x527591, 0x182128, 0.74);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0x88b0d4, 0.92);
  keyLight.position.set(28, 36, -18);
  if (!opts.isSoftwareGl) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -28;
    keyLight.shadow.camera.right = 28;
    keyLight.shadow.camera.top = 28;
    keyLight.shadow.camera.bottom = -28;
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 96;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
  }
  scene.add(keyLight);

  const lightningLight = new THREE.DirectionalLight(0xdbeafe, 0);
  lightningLight.position.set(40, 50, -35);
  scene.add(lightningLight);

  // Two shared dynamic interior/local PointLights (keeps total scene PointLights = 3 for fast WebGL shaders)
  const activeRoomKeyLight = new THREE.PointLight(0xfff0d4, 4.5, 13, 1.45);
  const activeRoomFillLight = new THREE.PointLight(0xf59e0b, 2.5, 10, 1.45);
  scene.add(activeRoomKeyLight, activeRoomFillLight);

  // Materials
  const stoneMat = new THREE.MeshStandardMaterial({
    map: textures.stoneAlbedo,
    bumpMap: textures.stoneBump,
    bumpScale: 0.04,
    roughnessMap: textures.stoneRoughness,
    color: 0xffffff,
    roughness: 0.85,
    metalness: 0.06,
    side: THREE.DoubleSide,
  });
  const woodMat = new THREE.MeshStandardMaterial({
    map: textures.woodAlbedo,
    roughnessMap: textures.woodRoughness,
    color: 0xffffff,
    roughness: 0.72,
    metalness: 0.05,
  });
  const tinRoofMat = new THREE.MeshStandardMaterial({
    map: textures.tinRoofAlbedo,
    color: 0xffffff,
    roughness: 0.45,
    metalness: 0.55,
  });
  const grateMat = new THREE.MeshStandardMaterial({
    map: textures.grateAlbedo,
    alphaMap: textures.grateAlpha,
    transparent: true,
    color: 0xffffff,
    roughness: 0.6,
    metalness: 0.65,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    map: textures.steelAlbedo,
    color: 0xffffff,
    roughness: 0.55,
    metalness: 0.45,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xc2933e,
    roughness: 0.28,
    metalness: 0.86,
  });
  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x1f2a30,
    roughness: 0.58,
    metalness: 0.65,
  });
  const glassRainMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.22,
    roughness: 0.14,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // ---------------------------------------------------------------------------
  // 1. EXTERIOR COASTLINE: Ocean, Headland, Breakwaters, Buoys, Surf Foam
  // ---------------------------------------------------------------------------
  const oceanSegs = opts.isMobile || opts.isSoftwareGl ? 36 : 56;
  const oceanGeo = new THREE.PlaneGeometry(340, 340, oceanSegs, oceanSegs);
  oceanGeo.rotateX(-Math.PI / 2);
  const oceanBaseY = new Float32Array(oceanGeo.attributes.position.count);
  for (let i = 0; i < oceanBaseY.length; i++) {
    oceanBaseY[i] = oceanGeo.attributes.position.getY(i);
  }
  const oceanMat = new THREE.MeshStandardMaterial({
    color: 0x102836,
    roughness: 0.26,
    metalness: 0.42,
  });
  const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
  oceanMesh.receiveShadow = true;
  scene.add(oceanMesh);

  // Rocky headland & harbor terrace uniting Lighthouse, Cottage, Walkway, and Jetty approach
  const headlandMat = new THREE.MeshStandardMaterial({
    map: textures.stoneAlbedo,
    bumpMap: textures.stoneBump,
    bumpScale: 0.08,
    color: 0x7b858e,
    roughness: 0.9,
    metalness: 0.06,
  });
  const headland = new THREE.Mesh(new THREE.CylinderGeometry(10.5, 15.5, 2.7, 20), headlandMat);
  headland.position.set(-2.0, 1.15, 3.0);
  headland.receiveShadow = true;
  scene.add(headland);

  // Cottage & Yard terrace (-10, 12) + East harbor approach causeway toward Signal Hut (18, 11)
  const yardPlateau = new THREE.Mesh(new THREE.BoxGeometry(14, 2.5, 11), headlandMat);
  yardPlateau.position.set(-7.5, 1.25, 11.5);
  yardPlateau.receiveShadow = true;
  scene.add(yardPlateau);

  const eastQuay = new THREE.Mesh(new THREE.BoxGeometry(22, 2.2, 6.2), headlandMat);
  eastQuay.position.set(10.0, 1.0, 11.0);
  eastQuay.receiveShadow = true;
  scene.add(eastQuay);

  const boathouseFoundation = new THREE.Mesh(new THREE.BoxGeometry(9.2, 1.8, 9.2), headlandMat);
  boathouseFoundation.position.set(6.0, 0.7, 22.0);
  boathouseFoundation.receiveShadow = true;
  scene.add(boathouseFoundation);

  // Causeway stone steps joining Yard/Walkway (z=13.5) to Boathouse (z=18.5)
  const causeway = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.7, 8.2), headlandMat);
  causeway.position.set(3.5, 0.9, 16.0);
  scene.add(causeway);

  // Coastal boulders + whitewater surf foam crests around rocks & breakwaters
  const rockGeo = new THREE.DodecahedronGeometry(1.4, 0);
  const rockCount = 42;
  const rocks = new THREE.InstancedMesh(rockGeo, headlandMat, rockCount);
  const rockDummy = new THREE.Object3D();
  for (let i = 0; i < rockCount; i++) {
    const angle = (i / rockCount) * Math.PI * 2;
    const rad = i < 22 ? 12.2 + (i % 4) * 1.6 : 26 + (i % 5) * 3.5;
    const x = i < 22 ? Math.cos(angle) * rad - 2.0 : 18 + (i - 22) * 1.4;
    const z = i < 22 ? Math.sin(angle) * rad + 4.0 : (i % 2 === 0 ? -15.5 : 27.5) + Math.sin(i) * 1.4;
    rockDummy.position.set(x, 0.3 + (i % 3) * 0.25, z);
    rockDummy.rotation.set(i * 0.7, i * 1.1, i * 0.4);
    const s = 0.7 + (i % 5) * 0.22;
    rockDummy.scale.set(s * 1.25, s * 0.75, s);
    rockDummy.updateMatrix();
    rocks.setMatrixAt(i, rockDummy.matrix);
  }
  rocks.instanceMatrix.needsUpdate = true;
  rocks.computeBoundingSphere();
  scene.add(rocks);

  // Surf foam crests along breakwaters & headland
  const foamMat = new THREE.MeshBasicMaterial({
    color: 0xdbeafe,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });
  const foamGeo = new THREE.PlaneGeometry(5.5, 1.4);
  foamGeo.rotateX(-Math.PI / 2);
  const foamMeshes: THREE.Mesh[] = [];
  const foamCoords: Array<[number, number, number]> = [
    [32, -11.5, -0.15],
    [38, -12.5, -0.15],
    [30, 10.2, 0.14],
    [36, 7.2, 0.2],
    [10, 18.5, 0.4],
    [13, 6.2, -0.3],
  ];
  foamCoords.forEach(([fx, fz, rot]) => {
    const fm = new THREE.Mesh(foamGeo, foamMat);
    fm.position.set(fx, 0.22, fz);
    fm.rotation.y = rot;
    scene.add(fm);
    foamMeshes.push(fm);
  });

  // Two stone breakwaters framing Vaanthurai harbor mouth
  const bwNorth = new THREE.Mesh(new THREE.BoxGeometry(24, 1.8, 3.4), headlandMat);
  bwNorth.position.set(30, 0.6, -13.5);
  bwNorth.rotation.y = -0.16;
  const bwSouth = new THREE.Mesh(new THREE.BoxGeometry(20, 1.8, 3.4), headlandMat);
  bwSouth.position.set(31, 0.6, 8.8);
  bwSouth.rotation.y = 0.25;
  scene.add(bwNorth, bwSouth);

  // Two fixed channel marker buoys (North Port Red & South Starboard Green)
  const makeBuoy = (x: number, z: number, colorHex: number) => {
    const bGroup = new THREE.Group();
    bGroup.position.set(x, 0, z);
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.9, 0.9, 10),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5 })
    );
    base.position.y = 0.35;
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.4, 1.4, 8), ironMat);
    tower.position.y = 1.3;
    const beaconMat = new THREE.MeshBasicMaterial({ color: colorHex });
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), beaconMat);
    beacon.position.y = 2.1;
    bGroup.add(base, tower, beacon);
    scene.add(bGroup);
    return { bGroup, beaconMat };
  };
  const portBuoy = makeBuoy(40, -12.0, 0xef4444);
  const stbdBuoy = makeBuoy(38.5, 6.5, 0x22c55e);

  // Drifting Buoy E-4 (controlled identically by getBuoyE4WorldState)
  const buoyE4 = createDriftingBuoyE4();
  scene.add(buoyE4.group);

  // Distant Tamil Nadu village shore lights (North-West & South-West shoreline)
  const villageGroup = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const house = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 2.2, 3.0),
      new THREE.MeshStandardMaterial({ color: 0x3b444b, roughness: 0.9 })
    );
    house.position.set(-16 - i * 4.5, 2.6, 26 + (i % 2) * 3.5);
    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.6),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    win.position.set(-16 - i * 4.5, 2.7, 24.48 + (i % 2) * 3.5);
    win.rotation.y = Math.PI;
    villageGroup.add(house, win);
  }
  scene.add(villageGroup);

  // ---------------------------------------------------------------------------
  // 2. VAANTHURAI WATERFRONT BUILDINGS (Cottage, Covered Walkway, Boathouse, Signal Hut, Crooked Mast, Jetty)
  // ---------------------------------------------------------------------------

  // Covered Walkway (-2.2, 2.5, 3.5) -> (-8.0, 2.5, 10.0)
  const walkwayGroup = new THREE.Group();
  const walkCurve = new THREE.LineCurve3(new THREE.Vector3(-2.0, 2.52, 3.6), new THREE.Vector3(-8.2, 2.52, 10.2));
  const walkLen = walkCurve.getLength();
  const walkMid = walkCurve.getPoint(0.5);
  const walkAngle = Math.atan2(-8.2 - -2.0, 10.2 - 3.6);
  const walkDeck = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.12, walkLen), woodMat);
  walkDeck.position.copy(walkMid);
  walkDeck.rotation.y = walkAngle;
  const walkRoof = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.14, walkLen + 0.4), tinRoofMat);
  walkRoof.position.set(walkMid.x, 4.95, walkMid.z);
  walkRoof.rotation.y = walkAngle;
  walkwayGroup.add(walkDeck, walkRoof);
  for (let i = 0; i <= 3; i++) {
    const pt = walkCurve.getPoint(i / 3);
    for (const side of [-0.95, 0.95]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.11, 2.45, 0.11), woodMat);
      post.position.set(pt.x + Math.cos(walkAngle) * side, 3.72, pt.z - Math.sin(walkAngle) * side);
      walkwayGroup.add(post);
    }
  }
  const yardLanternMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.4,
  });
  const yardBulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), yardLanternMat);
  yardBulb.position.set(walkMid.x, 4.75, walkMid.z);
  walkwayGroup.add(yardBulb);
  scene.add(walkwayGroup);

  // Keeper's Cottage (-10, 2.5, 12)
  const cottageGroup = new THREE.Group();
  cottageGroup.position.set(-10, 2.5, 12);
  const cotFloor = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.14, 4.2), woodMat);
  cotFloor.position.y = 0.05;
  cottageGroup.add(cotFloor);
  // South, West, North walls + East wall with large window facing Boathouse Slipway!
  const cotWallS = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.8, 0.18), stoneMat);
  cotWallS.position.set(0, 1.4, 2.05);
  const cotWallW = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.8, 4.2), stoneMat);
  cotWallW.position.set(-2.22, 1.4, 0);
  const cotWallNLeft = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.8, 0.18), stoneMat);
  cotWallNLeft.position.set(-1.0, 1.4, -2.05);
  const cotWallESpandrel = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.95, 4.2), stoneMat);
  cotWallESpandrel.position.set(2.22, 0.48, 0);
  const cotWallEHeader = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 4.2), stoneMat);
  cotWallEHeader.position.set(2.22, 2.45, 0);
  const cotGlassE = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.15), glassRainMat);
  cotGlassE.rotation.y = Math.PI / 2;
  cotGlassE.position.set(2.22, 1.52, 0);
  const cotRoof = new THREE.Mesh(new THREE.ConeGeometry(3.55, 1.35, 4), tinRoofMat);
  cotRoof.rotation.y = Math.PI / 4;
  cotRoof.position.y = 3.45;
  cottageGroup.add(
    cotWallS,
    cotWallW,
    cotWallNLeft,
    cotWallESpandrel,
    cotWallEHeader,
    cotGlassE,
    cotRoof
  );

  const cottage = createCottageAssembly(textures);
  cottageGroup.add(cottage.group);
  interactables.push(...cottage.interactables);

  // Muthu talk hotspot on Cottage porch threshold
  const muthuCottageHit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 1.7, 10),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  muthuCottageHit.position.set(1.6, 0.9, 1.0);
  cottageGroup.add(muthuCottageHit);
  interactables.push({ mesh: muthuCottageHit, actionId: 'cottage_talk_muthu', label: 'Speak with Muthu (Boathouse Key)' });

  scene.add(cottageGroup);

  // Blue-Roofed Boathouse & Tidal Slipway (6, 1.4, 22)
  const boathouseGroup = new THREE.Group();
  boathouseGroup.position.set(6.0, 1.4, 22.0);
  const bhFloor = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.14, 6.2), woodMat);
  bhFloor.position.y = 0.02;
  const bhUpperDeck = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.14, 3.6), woodMat);
  bhUpperDeck.position.set(0.45, 2.2, 0.55);
  // Tide stair beams up to upper landing
  for (let s = 0; s < 6; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, 0.42), woodMat);
    step.position.set(-1.35, 0.35 + s * 0.34, -1.9 + s * 0.42);
    boathouseGroup.add(step);
  }
  const bhWallN = new THREE.Mesh(new THREE.BoxGeometry(5.6, 4.4, 0.18), steelMat);
  bhWallN.position.set(0, 2.2, -3.0);
  const bhWallS = new THREE.Mesh(new THREE.BoxGeometry(5.6, 4.4, 0.18), steelMat);
  bhWallS.position.set(0, 2.2, 3.0);
  const bhWallW = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.4, 6.2), steelMat);
  bhWallW.position.set(-2.75, 2.2, 0);
  // Blue corrugated gable roof visible from Lantern Balcony & Cottage window
  const bhRoofL = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.14, 3.8), tinRoofMat);
  bhRoofL.position.set(0, 5.15, -1.65);
  bhRoofL.rotation.x = 0.44;
  const bhRoofR = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.14, 3.8), tinRoofMat);
  bhRoofR.position.set(0, 5.15, 1.65);
  bhRoofR.rotation.x = -0.44;
  // Exterior glowing boathouse window indicator when power restored
  const bhWinExtMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const bhWinExt = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), bhWinExtMat);
  bhWinExt.position.set(0, 3.0, -3.11);
  bhWinExt.rotation.y = Math.PI;
  boathouseGroup.add(bhFloor, bhUpperDeck, bhWallN, bhWallS, bhWallW, bhRoofL, bhRoofR, bhWinExt);

  const boathouse = createBoathousePropsAssembly(textures);
  boathouseGroup.add(boathouse.group);
  interactables.push(...boathouse.interactables);
  scene.add(boathouseGroup);

  // Signal Hut (18.5, 2.1, 11.0)
  const signalHutGroup = new THREE.Group();
  signalHutGroup.position.set(18.5, 2.1, 11.0);
  const shFloor = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 3.0), woodMat);
  shFloor.position.y = 0.02;
  const shWallN = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.4, 0.16), steelMat);
  shWallN.position.set(0, 1.2, -1.42);
  const shWallS = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.4, 0.16), steelMat);
  shWallS.position.set(0, 1.2, 1.42);
  const shWallE = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.15, 3.0), steelMat);
  shWallE.position.set(1.52, 0.58, 0);
  const shRoof = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.14, 3.3), tinRoofMat);
  shRoof.position.set(0, 2.46, 0);
  signalHutGroup.add(shFloor, shWallN, shWallS, shWallE, shRoof);

  const signalHut = createSignalHutPropsAssembly(textures);
  signalHutGroup.add(signalHut.group);
  interactables.push(...signalHut.interactables);
  scene.add(signalHutGroup);

  // Crooked Galvanized Signal Mast (20.5, 2.1, 9.2) — landmark visible from Radio Room & Jetty
  const mastGroup = new THREE.Group();
  mastGroup.position.set(20.5, 2.1, 9.2);
  const mastPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 6.2, 10), ironMat);
  mastPole.position.y = 3.0;
  mastPole.rotation.z = -0.14; // Crooked storm lean!
  const crossYard = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.07, 0.07), ironMat);
  crossYard.position.set(0.32, 4.9, 0);
  crossYard.rotation.z = -0.14;
  const mastLantern = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b })
  );
  mastLantern.position.set(1.1, 4.75, 0);
  const halyardRope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 4.3, 6), brassMat);
  halyardRope.position.set(0.38, 2.6, 0.05);
  mastGroup.add(mastPole, crossYard, mastLantern, halyardRope);
  scene.add(mastGroup);

  // Timber Vaanthurai Jetty (x = 19.5..30.5, y = 2.1, z = 11.0)
  const jettyGroup = new THREE.Group();
  const jettyDeck = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.22, 3.1), woodMat);
  jettyDeck.position.set(25.2, 2.0, 11.0);
  jettyDeck.receiveShadow = true;
  jettyGroup.add(jettyDeck);
  for (let px = 20.5; px <= 30.2; px += 2.4) {
    for (const pz of [9.6, 12.4]) {
      const piling = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 3.2, 8), woodMat);
      piling.position.set(px, 1.0, pz);
      jettyGroup.add(piling);
    }
  }

  // Jetty Brass Storm Lantern Post (Muthu fastens storm lantern here in Chapter 1, still burning at Dawn!)
  const lanternPost = new THREE.Group();
  lanternPost.position.set(29.45, 2.1, 10.05);
  const postWood = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 1.85, 8), woodMat);
  postWood.position.y = 0.92;
  const bracketArm = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.06), ironMat);
  bracketArm.position.set(-0.18, 1.65, 0);
  const fastenedLanternGroup = new THREE.Group();
  fastenedLanternGroup.position.set(-0.34, 1.42, 0);
  const flGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.18, 12),
    new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0xf59e0b, emissiveIntensity: 1.8 })
  );
  const flCap = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.08, 12), brassMat);
  flCap.position.y = 0.12;
  fastenedLanternGroup.add(flGlass, flCap);
  lanternPost.add(postWood, bracketArm, fastenedLanternGroup);
  jettyGroup.add(lanternPost);

  const lanternBracketHit = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), new THREE.MeshBasicMaterial({ visible: false }));
  lanternBracketHit.position.set(29.0, 3.55, 10.1);
  jettyGroup.add(lanternBracketHit);
  interactables.push({ mesh: lanternBracketHit, actionId: 'jetty_help_lantern', label: 'Fasten Brass Storm Lantern' });
  interactables.push({ mesh: bracketArm, actionId: 'jetty_help_lantern', label: 'Fasten Brass Storm Lantern' });

  // Jetty Departure Bell on South-East Bollard (Chapter 1)
  const jettyBellPost = new THREE.Group();
  jettyBellPost.position.set(29.4, 2.1, 12.15);
  const jbPole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.45, 8), ironMat);
  jbPole.position.y = 0.72;
  const jbBell = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 0.22, 12), brassMat);
  jbBell.position.set(0.12, 1.32, 0);
  jettyBellPost.add(jbPole, jbBell);
  jettyGroup.add(jettyBellPost);
  interactables.push({ mesh: jbBell, actionId: 'jetty_ring_bell', label: 'Ring Jetty Bell for M/V Thendral' });

  scene.add(jettyGroup);

  // ---------------------------------------------------------------------------
  // 3. LIGHTHOUSE TOWER (3 Connected Floors at Origin 0,0,0)
  // ---------------------------------------------------------------------------
  const towerGroup = new THREE.Group();
  scene.add(towerGroup);

  const foundation = new THREE.Mesh(new THREE.CylinderGeometry(3.65, 4.0, 1.2, 24), stoneMat);
  foundation.position.y = 2.0;
  foundation.receiveShadow = true;
  towerGroup.add(foundation);

  const addCurvedFloorWalls = (baseY: number, height: number, windowBottom: number, windowTop: number) => {
    const wallArc = new THREE.Mesh(
      new THREE.CylinderGeometry(3.35, 3.35, height, 28, 1, true, 0.42 + Math.PI / 2, Math.PI * 2 - 0.88),
      stoneMat
    );
    wallArc.position.y = baseY + height / 2;
    towerGroup.add(wallArc);

    const lowerSpandrel = new THREE.Mesh(
      new THREE.CylinderGeometry(3.35, 3.35, windowBottom, 12, 1, true, Math.PI / 2 - 0.46, 0.88),
      stoneMat
    );
    lowerSpandrel.position.y = baseY + windowBottom / 2;
    towerGroup.add(lowerSpandrel);

    const upperH = height - windowTop;
    const upperSpandrel = new THREE.Mesh(
      new THREE.CylinderGeometry(3.35, 3.35, upperH, 12, 1, true, Math.PI / 2 - 0.46, 0.88),
      stoneMat
    );
    upperSpandrel.position.y = baseY + windowTop + upperH / 2;
    towerGroup.add(upperSpandrel);

    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(3.32, 3.32, windowTop - windowBottom, 10, 1, true, Math.PI / 2 - 0.44, 0.84),
      glassRainMat
    );
    glass.position.y = baseY + (windowBottom + windowTop) / 2;
    towerGroup.add(glass);

    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.08, windowTop - windowBottom, 0.08), ironMat);
    mullion.position.set(3.26, baseY + (windowBottom + windowTop) / 2, -0.05);
    towerGroup.add(mullion);
  };

  // --- FLOOR 1: RADIO ROOM (y = 2.5 .. 6.7) ---
  const f1Floor = new THREE.Mesh(new THREE.CylinderGeometry(3.32, 3.32, 0.14, 28), woodMat);
  f1Floor.position.y = 2.5;
  f1Floor.receiveShadow = true;
  towerGroup.add(f1Floor);
  addCurvedFloorWalls(2.5, 4.1, 1.0, 2.95);

  const deskGroup = new THREE.Group();
  deskGroup.position.set(0.65, 2.57, -0.55);
  deskGroup.rotation.y = -0.35;
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.08, 0.84), woodMat);
  deskTop.position.y = 0.78;
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  deskGroup.add(deskTop);
  for (const lx of [-0.78, 0.78]) {
    for (const lz of [-0.32, 0.32]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.78, 0.08), woodMat);
      leg.position.set(lx, 0.39, lz);
      deskGroup.add(leg);
    }
  }
  towerGroup.add(deskGroup);

  const radio = createRadioAssembly(textures);
  radio.group.position.set(-0.34, 0.82, -0.06);
  radio.group.rotation.y = 0.12;
  deskGroup.add(radio.group);
  interactables.push(...radio.interactables);

  // Desk Logbook (interactive Ch.1 sketch recording)
  const logbook = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.032, 0.24),
    new THREE.MeshStandardMaterial({ map: textures.logbookTex, roughness: 0.75 })
  );
  logbook.position.set(0.14, 0.838, 0.16);
  logbook.rotation.y = -0.08;
  deskGroup.add(logbook);
  interactables.push({ mesh: logbook, actionId: 'radio_record_sketch', label: 'Record Third Light in Watch Log' });

  // Adjustable Binoculars on right front corner of Radio Desk (facing East window)
  const binocGroup = new THREE.Group();
  binocGroup.position.set(0.72, 0.85, 0.2);
  binocGroup.rotation.y = -0.25;
  for (const bz of [-0.042, 0.042]) {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.036, 0.18, 12), ironMat);
    tube.rotation.z = Math.PI / 2;
    tube.position.z = bz;
    binocGroup.add(tube);
  }
  const binocBridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.09), brassMat);
  binocGroup.add(binocBridge);
  deskGroup.add(binocGroup);
  interactables.push({ mesh: binocGroup, actionId: 'radio_binoculars', label: 'Look Through Binoculars (East Window)' });

  // Desk Chart & Dawn Chart Stamp + Wall Chart Frame
  const chartMat = new THREE.MeshStandardMaterial({
    map: textures.chartTexDark,
    roughness: 0.65,
    emissive: 0x000000,
    emissiveIntensity: 0,
  });
  const chartMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.42), chartMat);
  chartMesh.rotation.x = -Math.PI / 2;
  chartMesh.rotation.z = 0.05;
  chartMesh.position.set(0.5, 0.83, -0.04);
  deskGroup.add(chartMesh);
  interactables.push({ mesh: chartMesh, actionId: 'epilogue_stamp_chart', label: 'Stamp Corrected Harbor Chart' });

  // Wall Chart Frame (North-West stone wall inside Radio Room)
  const wallFrameGroup = new THREE.Group();
  wallFrameGroup.position.set(-2.35, 4.15, 0.9);
  wallFrameGroup.rotation.y = 1.25;
  const frameBack = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.58, 0.04), woodMat);
  const wallChartMat = new THREE.MeshStandardMaterial({ map: textures.chartTexDark, roughness: 0.55 });
  const wallChartFace = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.5), wallChartMat);
  wallChartFace.position.z = 0.025;
  wallFrameGroup.add(frameBack, wallChartFace);
  towerGroup.add(wallFrameGroup);
  interactables.push({ mesh: frameBack, actionId: 'epilogue_hang_chart', label: 'Hang Corrected Chart on Wall' });

  // Bridge Transmission Screen above desk (Floor 1 & Floor 3)
  const makeBridgeScreen = (w: number, h: number) => {
    const frame = new THREE.Group();
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, h + 0.06, 0.04), ironMat);
    const screenMat = new THREE.MeshBasicMaterial({ map: opts.bridgeTexture });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), screenMat);
    screen.position.z = 0.025;
    frame.add(bezel, screen);
    return { frame, screen };
  };
  const bScreen1 = makeBridgeScreen(0.52, 0.36);
  bScreen1.frame.position.set(0.24, 1.24, -0.28);
  bScreen1.frame.rotation.y = -0.15;
  bScreen1.frame.visible = false;
  deskGroup.add(bScreen1.frame);

  const replayBtnF1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.04), brassMat);
  replayBtnF1.position.set(-0.62, 0.84, 0.2);
  deskGroup.add(replayBtnF1);
  interactables.push({ mesh: replayBtnF1, actionId: 'radio_replay', label: 'Replay Distress Call' });

  // Stairwell Door (Floor 1 -> Floor 2)
  const doorFrame = new THREE.Group();
  doorFrame.position.set(-1.95, 2.57, -1.65);
  doorFrame.rotation.y = 0.72;
  const jambL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.25, 0.16), ironMat);
  jambL.position.set(-0.56, 1.125, 0);
  const jambR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.25, 0.16), ironMat);
  jambR.position.set(0.56, 1.125, 0);
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.14, 0.16), ironMat);
  lintel.position.set(0, 2.22, 0);
  doorFrame.add(jambL, jambR, lintel);

  const doorPivot = new THREE.Group();
  doorPivot.position.set(-0.48, 0, 0);
  const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.96, 2.12, 0.08), steelMat);
  doorLeaf.position.set(0.48, 1.06, 0);
  const doorLatch = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.12), brassMat);
  doorLatch.position.set(0.84, 1.04, 0.04);
  const lockIndicatorMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0x7f1d1d,
    emissiveIntensity: 0.7,
  });
  const lockIndicator = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 8), lockIndicatorMat);
  lockIndicator.position.set(0.84, 1.2, 0.05);
  doorPivot.add(doorLeaf, doorLatch, lockIndicator);
  doorFrame.add(doorPivot);
  towerGroup.add(doorFrame);
  interactables.push({ mesh: doorLeaf, actionId: 'door_f1_up', label: 'Ascend Stairwell to Floor 2' });
  interactables.push({ mesh: doorLatch, actionId: 'door_f1_up', label: 'Ascend Stairwell to Floor 2' });

  // Floor 1 Emergency Bulb mesh (lit dynamically via activeRoomKeyLight / activeRoomFillLight)
  const f1EmergencyBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0 })
  );
  f1EmergencyBulb.position.set(-0.4, 4.9, -0.5);
  towerGroup.add(f1EmergencyBulb);

  // --- FLOOR 2: GENERATOR GALLERY (y = 6.7 .. 10.9) ---
  const f2Floor = new THREE.Mesh(new THREE.CylinderGeometry(3.32, 3.32, 0.14, 28), grateMat);
  f2Floor.position.y = 6.7;
  towerGroup.add(f2Floor);
  addCurvedFloorWalls(6.7, 4.1, 1.35, 2.65);

  const generator = createGeneratorAssembly(textures);
  generator.group.position.set(0.1, 6.77, -1.1);
  towerGroup.add(generator.group);
  interactables.push(...generator.interactables);

  const f2StairsUp = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.9, 0.24), steelMat);
  f2StairsUp.position.set(2.05, 7.7, -1.8);
  f2StairsUp.rotation.y = -0.7;
  towerGroup.add(f2StairsUp);
  interactables.push({ mesh: f2StairsUp, actionId: 'door_f2_up', label: 'Climb to Floor 3 — Lantern Room' });

  const f2StairsDown = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.8, 0.22), steelMat);
  f2StairsDown.position.set(-2.05, 7.65, -1.75);
  f2StairsDown.rotation.y = 0.7;
  towerGroup.add(f2StairsDown);
  interactables.push({ mesh: f2StairsDown, actionId: 'door_f2_down', label: 'Descend to Floor 1 — Radio Room' });

  const stairwellMats: THREE.MeshStandardMaterial[] = [];
  [4.8, 7.9, 10.1].forEach((ly, idx) => {
    const m = new THREE.MeshStandardMaterial({ color: 0xfde68a, emissive: 0xf59e0b, emissiveIntensity: 0 });
    const sconce = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), m);
    sconce.position.set(-1.3 + idx * 0.9, ly, -1.9);
    towerGroup.add(sconce);
    stairwellMats.push(m);
  });

  // --- FLOOR 3: LANTERN ROOM & EXTERIOR BALCONY (y = 10.9 .. 14.5) ---
  const f3GalleryFloor = new THREE.Mesh(new THREE.CylinderGeometry(4.45, 3.65, 0.22, 28), ironMat);
  f3GalleryFloor.position.y = 10.85;
  towerGroup.add(f3GalleryFloor);

  const f3InnerFloor = new THREE.Mesh(new THREE.CylinderGeometry(3.18, 3.18, 0.08, 28), steelMat);
  f3InnerFloor.position.y = 10.93;
  towerGroup.add(f3InnerFloor);

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.09, 2.9, 0.09), ironMat);
    post.position.set(Math.cos(a) * 3.16, 12.4, Math.sin(a) * 3.16);
    post.rotation.y = -a;
    towerGroup.add(post);
  }
  const lanternGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(3.14, 3.14, 2.6, 24, 1, true, 0.55, Math.PI * 2 - 0.52),
    new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.14,
      roughness: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  lanternGlass.position.y = 12.35;
  towerGroup.add(lanternGlass);

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const stan = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.05, 6), ironMat);
    stan.position.set(Math.cos(a) * 4.28, 11.45, Math.sin(a) * 4.28);
    towerGroup.add(stan);
  }
  const topRail = new THREE.Mesh(new THREE.TorusGeometry(4.28, 0.04, 8, 32), ironMat);
  topRail.rotation.x = Math.PI / 2;
  topRail.position.y = 11.96;
  const midRail = new THREE.Mesh(new THREE.TorusGeometry(4.28, 0.025, 6, 32), ironMat);
  midRail.rotation.x = Math.PI / 2;
  midRail.position.y = 11.48;
  towerGroup.add(topRail, midRail);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.55, 2.1, 24),
    new THREE.MeshStandardMaterial({ color: 0x26443d, roughness: 0.45, metalness: 0.6 })
  );
  roof.position.y = 14.85;
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.08, 1.4, 8), brassMat);
  spire.position.y = 16.4;
  towerGroup.add(roof, spire);

  const fresnel = createFresnelAssembly(textures, opts.isMobile || opts.isSoftwareGl);
  fresnel.group.position.set(0, 10.97, 0);
  towerGroup.add(fresnel.group);
  interactables.push(...fresnel.interactables);

  const bScreen3 = makeBridgeScreen(0.56, 0.38);
  bScreen3.frame.position.set(1.15, 12.15, 0.9);
  bScreen3.frame.rotation.y = -0.85;
  bScreen3.frame.visible = false;
  towerGroup.add(bScreen3.frame);

  const bellGroup = new THREE.Group();
  bellGroup.position.set(3.48, 12.02, 2.38);
  bellGroup.rotation.y = -0.6;
  const bellBracket = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.06), ironMat);
  const bellBody = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, 0.24, 14), brassMat);
  bellBody.position.set(0.08, -0.14, 0);
  bellGroup.add(bellBracket, bellBody);
  towerGroup.add(bellGroup);
  interactables.push({ mesh: bellBody, actionId: 'balcony_ring_bell', label: 'Ring All-Clear Brass Bell' });

  const f3StairsDown = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.3, 0.24), steelMat);
  f3StairsDown.position.set(-1.95, 11.6, -1.65);
  f3StairsDown.rotation.y = 0.72;
  towerGroup.add(f3StairsDown);
  interactables.push({ mesh: f3StairsDown, actionId: 'door_f3_down', label: 'Descend to Floor 2 — Generator Room' });

  // ---------------------------------------------------------------------------
  // 4. CHARACTERS & FERRY
  // ---------------------------------------------------------------------------
  const muthu = createMuthuCharacter();
  muthu.group.position.set(28.68, 2.1, 10.42);
  muthu.group.rotation.y = -0.78;
  scene.add(muthu.group);

  const meeraAshore = createMeeraCharacter();
  meeraAshore.group.position.set(29.3, 2.86, 11.35);
  meeraAshore.group.rotation.y = -1.25;
  meeraAshore.group.visible = false;
  scene.add(meeraAshore.group);
  const meeraAshoreHit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 1.7, 10),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  meeraAshoreHit.position.set(29.3, 3.0, 11.35);
  scene.add(meeraAshoreHit);
  interactables.push({ mesh: meeraAshoreHit, actionId: 'epilogue_talk_meera', label: 'Speak with Captain Meera Ashore' });

  const ferry = createFerryAssembly(textures);
  scene.add(ferry.group);
  interactables.push(...ferry.interactables);

  // ---------------------------------------------------------------------------
  // 5. TELEPORT WAYPOINT PADS (Only visible when unlocked & relevant)
  // ---------------------------------------------------------------------------
  const padGeo = new THREE.RingGeometry(0.24, 0.34, 20);
  padGeo.rotateX(-Math.PI / 2);
  (Object.values(TELEPORT_NODES) as TeleportNode[]).forEach((node) => {
    if (node.id === 'ferry_wheelhouse') return;
    const padMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.copy(node.beaconPos);
    scene.add(pad);
    teleportMeshes.set(node.id, pad);
    interactables.push({
      mesh: pad,
      actionId: `teleport_${node.id}`,
      label: `Move to ${node.label}`,
    });
  });

  // ---------------------------------------------------------------------------
  // 6. SUBTLE PERFORMANCE-OPTIMIZED RAIN STREAK PARTICLE SYSTEM (THREE.LineSegments)
  // ---------------------------------------------------------------------------
  const rainCount = opts.isMobile || opts.isSoftwareGl ? 180 : 420;
  const rainSpan = 34;
  const rainHeight = 16;
  const rainStreakPos = new Float32Array(rainCount * 6); // 2 vertices per streak
  const rainOffsetsX = new Float32Array(rainCount);
  const rainOffsetsY = new Float32Array(rainCount);
  const rainOffsetsZ = new Float32Array(rainCount);
  const rainSpeeds = new Float32Array(rainCount);

  for (let i = 0; i < rainCount; i++) {
    rainOffsetsX[i] = (Math.random() - 0.5) * rainSpan;
    rainOffsetsY[i] = Math.random() * rainHeight;
    rainOffsetsZ[i] = (Math.random() - 0.5) * rainSpan;
    rainSpeeds[i] = 17 + (i % 5) * 1.4;
  }

  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainStreakPos, 3));
  const rainMat = new THREE.LineBasicMaterial({
    color: 0xa5c4de,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });
  const rainLines = new THREE.LineSegments(rainGeo, rainMat);
  rainLines.frustumCulled = false;
  scene.add(rainLines);

  let nextLightningAt = 6.0;
  let lightningFlash = 0;
  let powerClimbTimer = 0;
  let bellSwing = 0;
  let lastBellRung = false;

  const update = (
    state: GameState,
    time: number,
    dt: number,
    reducedLightning: boolean,
    camX: number,
    camZ: number
  ) => {
    const dawn = state.dawnMix;

    // Sky, Fog & Ocean crossfade
    skyColor.copy(stormSkyColor).lerp(dawnSkyColor, dawn);
    fog.color.copy(skyColor);
    fog.density = THREE.MathUtils.lerp(0.0098, 0.0042, dawn);
    oceanMat.color.setHex(0x102836).lerp(new THREE.Color(0x28566b), dawn);

    keyLight.color.setHex(0x88b0d4).lerp(new THREE.Color(0xffc9a6), dawn);
    keyLight.intensity = THREE.MathUtils.lerp(0.92, 1.9, dawn);
    hemiLight.intensity = THREE.MathUtils.lerp(0.74, 1.15, dawn);

    // Lightning flashes during squall
    if (!reducedLightning && dawn < 0.35 && state.phase !== 'title') {
      if (time >= nextLightningAt) {
        lightningFlash = 1.0;
        nextLightningAt = time + 9 + Math.random() * 11;
      }
      lightningFlash = Math.max(0, lightningFlash - dt * 3.8);
      lightningLight.intensity = lightningFlash * 4.2;
    } else {
      lightningLight.intensity = 0;
    }

    // Ocean wave vertex animation
    const posAttr = oceanGeo.attributes.position;
    const waveAmp = THREE.MathUtils.lerp(0.65, 0.16, dawn);
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      const wy =
        Math.sin(vx * 0.09 + time * 1.4) * waveAmp +
        Math.cos(vz * 0.11 + time * 1.1) * (waveAmp * 0.7);
      posAttr.setY(i, oceanBaseY[i] + wy);
    }
    posAttr.needsUpdate = true;

    // Surf foam pulse
    foamMat.opacity = (0.28 + Math.sin(time * 2.2) * 0.1) * (1 - dawn * 0.65);
    foamMeshes.forEach((fm, idx) => {
      fm.position.y = 0.2 + Math.sin(time * 1.7 + idx) * 0.08;
    });

    // Subtle localized wind-angled Rain Streak particle simulation (sheltered indoors)
    const rainOpacity = Math.max(0, (1 - dawn * 1.45) * 0.34);
    rainMat.opacity = rainOpacity;
    rainLines.visible = rainOpacity > 0.015;
    if (rainLines.visible) {
      const windX = -3.6;
      const windZ = -1.2;
      const anchorX = state.phase === 'title' ? 10 : camX;
      const anchorZ = state.phase === 'title' ? 10 : camZ;

      for (let i = 0; i < rainCount; i++) {
        rainOffsetsY[i] -= dt * rainSpeeds[i];
        rainOffsetsX[i] += dt * windX;
        rainOffsetsZ[i] += dt * windZ;

        if (rainOffsetsY[i] < 0.2) rainOffsetsY[i] += rainHeight;
        if (rainOffsetsX[i] < -rainSpan * 0.5) rainOffsetsX[i] += rainSpan;
        if (rainOffsetsZ[i] < -rainSpan * 0.5) rainOffsetsZ[i] += rainSpan;

        const wx = anchorX + rainOffsetsX[i];
        const wy = Math.max(0.4, rainOffsetsY[i]);
        const wz = anchorZ + rainOffsetsZ[i];

        const base = i * 6;
        if (isPointIndoors(wx, wz)) {
          // Collapse streak cleanly inside roofed interiors so rain never clips through ceilings
          rainStreakPos[base] = wx;
          rainStreakPos[base + 1] = wy;
          rainStreakPos[base + 2] = wz;
          rainStreakPos[base + 3] = wx;
          rainStreakPos[base + 4] = wy;
          rainStreakPos[base + 5] = wz;
        } else {
          rainStreakPos[base] = wx;
          rainStreakPos[base + 1] = wy;
          rainStreakPos[base + 2] = wz;
          rainStreakPos[base + 3] = wx - 0.15;
          rainStreakPos[base + 4] = wy + 0.72;
          rainStreakPos[base + 5] = wz - 0.05;
        }
      }
      rainGeo.attributes.position.needsUpdate = true;
    }

    // Channel markers & Drifting Buoy E-4
    const blink = Math.sin(time * 3.5) > 0.2 ? 1 : 0.2;
    portBuoy.bGroup.position.y = Math.sin(time * 1.6) * 0.18 * (1 - dawn * 0.6);
    portBuoy.beaconMat.color.setHex(blink > 0.5 ? 0xff4d4d : 0x5c1414);
    stbdBuoy.bGroup.position.y = Math.cos(time * 1.5) * 0.18 * (1 - dawn * 0.6);
    stbdBuoy.beaconMat.color.setHex(blink > 0.5 ? 0x4ade80 : 0x14532d);
    buoyE4.update(state, time);

    // Crooked mast sway & lantern pulse
    mastGroup.rotation.z = Math.sin(time * 1.9) * 0.015 * (1 - dawn * 0.7);
    halyardRope.rotation.z = Math.sin(time * 3.8) * 0.04 * (1 - dawn * 0.7);

    // Jetty fastened lantern
    fastenedLanternGroup.visible = state.lanternFastened;

    // Exterior emissive indicators & Floor 1 emergency bulb
    const extPow = !state.powerCutTriggered || state.exteriorPowerRestored;
    yardLanternMat.emissiveIntensity = extPow ? 1.4 : 0.2;
    bhWinExtMat.color.setHex(state.exteriorPowerRestored ? 0xfbbf24 : 0x334155);
    (f1EmergencyBulb.material as THREE.MeshStandardMaterial).emissiveIntensity =
      state.emergencyLightOn ? 1.4 : 0;

    // Dynamically steer the 2 shared local PointLights to light whichever room/area the player is viewing
    if (state.phase === 'title') {
      activeRoomKeyLight.position.set(walkMid.x, 4.5, walkMid.z);
      activeRoomKeyLight.color.setHex(0xfbbf24);
      activeRoomKeyLight.intensity = 3.2;
      activeRoomKeyLight.distance = 16;
      activeRoomFillLight.position.set(28.9, 3.6, 10.1);
      activeRoomFillLight.color.setHex(0xfbbf24);
      activeRoomFillLight.intensity = 3.0;
      activeRoomFillLight.distance = 14;
    } else if (state.currentArea === 'jetty') {
      activeRoomKeyLight.position.set(28.2, 4.4, 11.2);
      activeRoomKeyLight.color.setHex(state.phase === 'dawn_epilogue' ? 0xffdfc2 : 0xffcf88);
      activeRoomKeyLight.intensity = state.phase === 'dawn_epilogue' ? 4.2 : 3.4;
      activeRoomKeyLight.distance = 14;
      activeRoomFillLight.position.set(28.96, 3.55, 10.1);
      activeRoomFillLight.color.setHex(0xfbbf24);
      activeRoomFillLight.intensity = state.lanternFastened ? 3.4 : 1.6;
      activeRoomFillLight.distance = 10;
    } else if (state.currentArea === 'walkway') {
      activeRoomKeyLight.position.set(walkMid.x, 4.5, walkMid.z);
      activeRoomKeyLight.color.setHex(0xfbbf24);
      activeRoomKeyLight.intensity = extPow ? 4.2 : 1.6;
      activeRoomKeyLight.distance = 15;
      activeRoomFillLight.position.set(-10, 4.8, 12);
      activeRoomFillLight.color.setHex(0xffcf88);
      activeRoomFillLight.intensity = 2.6;
      activeRoomFillLight.distance = 12;
    } else if (state.currentArea === 'cottage') {
      activeRoomKeyLight.position.set(-10.0, 4.85, 12.0);
      activeRoomKeyLight.color.setHex(0xffd699);
      activeRoomKeyLight.intensity = 5.4;
      activeRoomKeyLight.distance = 11;
      activeRoomFillLight.position.set(-8.6, 4.3, 12.6);
      activeRoomFillLight.color.setHex(0xfbbf24);
      activeRoomFillLight.intensity = 2.4;
      activeRoomFillLight.distance = 8;
    } else if (state.currentArea === 'radio_room') {
      const overheadOn = !state.powerCutTriggered || state.stairwellPowered;
      activeRoomKeyLight.position.set(0.1, 5.6, -0.2);
      activeRoomKeyLight.color.setHex(0xfff0d4);
      activeRoomKeyLight.intensity = overheadOn ? 5.8 : 1.1;
      activeRoomKeyLight.distance = 11;
      activeRoomFillLight.position.set(-0.3, 4.6, -0.5);
      activeRoomFillLight.color.setHex(0xf59e0b);
      activeRoomFillLight.intensity = state.emergencyLightOn ? 4.0 : 0.8;
      activeRoomFillLight.distance = 9;
    } else if (state.currentArea === 'generator_gallery') {
      activeRoomKeyLight.position.set(0.3, 9.8, 0.2);
      activeRoomKeyLight.color.setHex(state.stairwellPowered ? 0xe2f0ff : 0xf59e0b);
      activeRoomKeyLight.intensity = state.stairwellPowered ? 5.6 : 2.8;
      activeRoomKeyLight.distance = 11;
      activeRoomFillLight.position.set(0.0, 8.1, -0.45);
      activeRoomFillLight.color.setHex(0xfbbf24);
      activeRoomFillLight.intensity = state.inspectionLampOn ? 3.8 : 1.6;
      activeRoomFillLight.distance = 8;
    } else if (state.currentArea === 'boathouse') {
      activeRoomKeyLight.position.set(6.4, 5.5, 22.4);
      activeRoomKeyLight.color.setHex(0xfde68a);
      activeRoomKeyLight.intensity = state.exteriorPowerRestored ? 5.2 : 2.6;
      activeRoomKeyLight.distance = 12;
      activeRoomFillLight.position.set(5.4, 3.6, 21.8);
      activeRoomFillLight.color.setHex(0x93c5fd);
      activeRoomFillLight.intensity = 2.2;
      activeRoomFillLight.distance = 9;
    } else if (state.currentArea === 'signal_hut') {
      activeRoomKeyLight.position.set(18.5, 4.2, 11.0);
      activeRoomKeyLight.color.setHex(0xfde68a);
      activeRoomKeyLight.intensity = state.exteriorPowerRestored ? 4.8 : 2.6;
      activeRoomKeyLight.distance = 10;
      activeRoomFillLight.position.set(18.0, 3.6, 11.2);
      activeRoomFillLight.color.setHex(0xf59e0b);
      activeRoomFillLight.intensity = 2.0;
      activeRoomFillLight.distance = 7;
    } else {
      // Lantern Room / Balcony / Wheelhouse
      activeRoomKeyLight.position.set(0, 13.4, 0.8);
      activeRoomKeyLight.color.setHex(0xfde68a);
      activeRoomKeyLight.intensity = 2.8;
      activeRoomKeyLight.distance = 12;
      activeRoomFillLight.position.set(2.2, 12.6, 1.4);
      activeRoomFillLight.color.setHex(0x93c5fd);
      activeRoomFillLight.intensity = 1.4;
      activeRoomFillLight.distance = 10;
    }

    if (state.chartStamped) {
      if (chartMat.map !== textures.chartStampedTex) {
        chartMat.map = textures.chartStampedTex;
        chartMat.needsUpdate = true;
      }
      if (state.chartHung && wallChartMat.map !== textures.chartStampedTex) {
        wallChartMat.map = textures.chartStampedTex;
        wallChartMat.needsUpdate = true;
      }
    } else if (state.chartLit && chartMat.map !== textures.chartTexLit) {
      chartMat.map = textures.chartTexLit;
      chartMat.emissive.setHex(0xd97706);
      chartMat.emissiveIntensity = 0.22;
      chartMat.needsUpdate = true;
    } else if (!state.chartLit && chartMat.map !== textures.chartTexDark) {
      chartMat.map = textures.chartTexDark;
      chartMat.emissive.setHex(0x000000);
      chartMat.emissiveIntensity = 0;
      chartMat.needsUpdate = true;
    }

    const targetDoorYaw = state.doorUnlocked ? 0.32 : 0;
    doorPivot.rotation.y = THREE.MathUtils.damp(doorPivot.rotation.y, targetDoorYaw, 6, dt);
    doorLatch.position.x = THREE.MathUtils.damp(doorLatch.position.x, state.doorUnlocked ? 0.78 : 0.84, 10, dt);
    lockIndicatorMat.color.setHex(state.doorUnlocked ? 0x22c55e : 0xef4444);
    lockIndicatorMat.emissive.setHex(state.doorUnlocked ? 0x15803d : 0x7f1d1d);

    // Climbing stairwell sconce glow
    if (state.stairwellPowered) {
      powerClimbTimer = Math.min(2.5, powerClimbTimer + dt);
      stairwellMats.forEach((mat, idx) => {
        const on = powerClimbTimer > idx * 0.45;
        mat.emissiveIntensity = on ? 1.5 : 0;
      });
    } else {
      powerClimbTimer = 0;
      stairwellMats.forEach((mat) => {
        mat.emissiveIntensity = 0;
      });
    }

    // Bridge transmission screen
    const showBridge =
      state.activeTransmission === 'meera_distress' ||
      state.activeTransmission === 'meera_buoy' ||
      state.activeTransmission === 'meera_route' ||
      state.activeTransmission === 'meera_offcourse' ||
      state.activeTransmission === 'meera_hold' ||
      state.activeTransmission === 'meera_closing';
    bScreen1.frame.visible = showBridge && state.currentArea === 'radio_room';
    bScreen3.frame.visible = showBridge && state.currentArea === 'lantern_room';

    // Muthu world placement across chapters
    if (state.phase === 'jetty_opening') {
      muthu.group.position.set(28.68, 2.1, 10.42);
      muthu.group.rotation.y = -0.78;
      muthu.update(time, 'jetty_lantern', state.lanternFastened);
    } else if (state.phase === 'dawn_epilogue' || state.phase === 'credits') {
      muthu.group.position.set(28.68, 2.1, 10.32);
      muthu.group.rotation.y = -0.78;
      muthu.update(time, 'dawn_stand', false);
    } else {
      muthu.group.position.set(-8.4, 2.5, 13.0);
      muthu.group.rotation.y = -2.2;
      muthu.update(time, 'cottage_key', state.muthuKeyGiven);
    }

    // Captain Meera ashore on Dawn Jetty holding Muthu's storm lantern
    const showMeeraAshore = state.phase === 'dawn_epilogue' || state.phase === 'credits';
    meeraAshore.group.visible = showMeeraAshore;
    meeraAshoreHit.visible = state.phase === 'dawn_epilogue' && !state.meeraAshoreSpoken;
    if (showMeeraAshore) {
      meeraAshore.update(time, false, false, true);
    }

    // Bell swing animation
    if (state.bellRung && !lastBellRung) {
      bellSwing = 1.0;
    }
    lastBellRung = state.bellRung;
    if (bellSwing > 0.001) {
      bellSwing *= Math.exp(-dt * 1.4);
      bellBody.rotation.z = Math.sin(time * 12) * 0.35 * bellSwing;
    }

    // Teleport pads visibility: hide current node & locked destinations
    teleportMeshes.forEach((pad, id) => {
      const node = TELEPORT_NODES[id];
      const unlocked = isNodeUnlocked(state, id).ok;
      const nearbyOrCrossArea =
        node.area === state.currentArea ||
        (state.currentArea === 'radio_room' && (node.id === 'walkway_yard' || node.id === 'f2_cabinet')) ||
        (state.currentArea === 'walkway' &&
          (node.id === 'f1_desk' ||
            node.id === 'cottage_table' ||
            node.id === 'boathouse_slipway' ||
            node.id === 'signal_hut_shutter' ||
            node.id === 'jetty_head')) ||
        (state.currentArea === 'cottage' && (node.id === 'walkway_yard' || node.id === 'boathouse_slipway')) ||
        (state.currentArea === 'boathouse' && (node.id === 'walkway_yard' || node.id === 'cottage_table')) ||
        (state.currentArea === 'signal_hut' && (node.id === 'jetty_head' || node.id === 'walkway_yard')) ||
        (state.currentArea === 'jetty' && (node.id === 'signal_hut_shutter' || node.id === 'f1_desk'));

      const visible =
        id !== state.currentNode &&
        state.phase !== 'title' &&
        state.phase !== 'credits' &&
        unlocked &&
        nearbyOrCrossArea;
      pad.visible = visible;
      if (visible) {
        (pad.material as THREE.MeshBasicMaterial).opacity = 0.35 + 0.15 * Math.sin(time * 3);
      }
    });

    // Update hero assemblies
    radio.update(state, dt, time);
    generator.update(state, dt, time);
    fresnel.update(state, dt, time);
    cottage.update(state, dt);
    boathouse.update(state, dt, time);
    signalHut.update(state, dt, time);
    ferry.update(state, time, dt);
  };

  const dispose = () => {
    oceanGeo.dispose();
    oceanMat.dispose();
    foamGeo.dispose();
    foamMat.dispose();
    rainGeo.dispose();
    rainMat.dispose();
  };

  return {
    interactables,
    teleportMeshes,
    radio,
    generator,
    fresnel,
    cottage,
    boathouse,
    signalHut,
    buoyE4,
    ferry,
    muthu,
    meeraAshore,
    bridgeScreenMesh: bScreen1.screen,
    bridgeScreenF3Mesh: bScreen3.screen,
    update,
    dispose,
  };
}
