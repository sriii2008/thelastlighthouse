import * as THREE from 'three';
import {
  getBuoyE4WorldState,
  RESCUE_SEQUENCE_DURATION,
  type CartridgeId,
  type DrumPatternId,
  type GameState,
  type SocketShape,
} from '../game/gameState';
import { createMeeraCharacter, type MeeraCharacter } from './characters';
import type { MaterialTextures } from './textures';

export interface InteractiveHandle {
  mesh: THREE.Object3D;
  actionId: string;
  label: string;
}

export interface RadioAssembly {
  group: THREE.Group;
  interactables: InteractiveHandle[];
  update: (state: GameState, dt: number, time: number) => void;
}

export interface GeneratorAssembly {
  group: THREE.Group;
  interactables: InteractiveHandle[];
  triggerRejectShake: () => void;
  update: (state: GameState, dt: number, time: number) => void;
}

export interface FresnelAssembly {
  group: THREE.Group;
  beamGroup: THREE.Group;
  beamSpotlight: THREE.SpotLight;
  interactables: InteractiveHandle[];
  update: (state: GameState, dt: number, time: number) => void;
}

export interface CottageAssembly {
  group: THREE.Group;
  interactables: InteractiveHandle[];
  update: (state: GameState, dt: number) => void;
}

export interface BoathousePropsAssembly {
  group: THREE.Group;
  interactables: InteractiveHandle[];
  update: (state: GameState, dt: number, time: number) => void;
}

export interface SignalHutPropsAssembly {
  group: THREE.Group;
  interactables: InteractiveHandle[];
  update: (state: GameState, dt: number, time: number) => void;
}

export interface FerryAssembly {
  group: THREE.Group;
  meeraBridge: MeeraCharacter;
  wakeGroup: THREE.Group;
  passengersGroup: THREE.Group;
  wheelhouseEyeWorld: THREE.Vector3;
  interactables: InteractiveHandle[];
  update: (state: GameState, time: number, dt: number) => void;
}

export interface BuoyE4Assembly {
  group: THREE.Group;
  beaconMat: THREE.MeshBasicMaterial;
  update: (state: GameState, time: number) => void;
}

export function createRadioAssembly(textures: MaterialTextures): RadioAssembly {
  const group = new THREE.Group();
  const interactables: InteractiveHandle[] = [];

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2a4545, roughness: 0.48, metalness: 0.35 });
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x161f24, roughness: 0.38, metalness: 0.5 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xb98d3c, roughness: 0.3, metalness: 0.85 });

  const shape = new THREE.Shape();
  shape.moveTo(-0.22, 0);
  shape.lineTo(0.22, 0);
  shape.lineTo(0.22, 0.22);
  shape.lineTo(-0.22, 0.22);
  shape.closePath();
  const bodyGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 2,
  });
  bodyGeo.translate(0, 0, -0.11);
  group.add(new THREE.Mesh(bodyGeo, bodyMat));

  const scaleMat = new THREE.MeshStandardMaterial({
    map: textures.radioScale,
    roughness: 0.35,
    emissive: 0x3b2608,
    emissiveMap: textures.radioScale,
    emissiveIntensity: 0.55,
  });
  const scalePlate = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.088), scaleMat);
  scalePlate.position.set(-0.055, 0.155, 0.128);
  group.add(scalePlate);

  const needle = new THREE.Mesh(
    new THREE.BoxGeometry(0.006, 0.062, 0.008),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x991b1b, emissiveIntensity: 0.6 })
  );
  needle.position.set(-0.055, 0.15, 0.133);
  group.add(needle);

  const grille = new THREE.Mesh(
    new THREE.PlaneGeometry(0.11, 0.11),
    new THREE.MeshStandardMaterial({ map: textures.speakerGrille, roughness: 0.7, metalness: 0.3 })
  );
  grille.position.set(0.145, 0.13, 0.128);
  group.add(grille);

  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 10), lampMat);
  lamp.position.set(0.145, 0.045, 0.128);
  group.add(lamp);

  const knobGroup = new THREE.Group();
  knobGroup.position.set(-0.11, 0.055, 0.13);
  const knobCore = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.035, 16), bezelMat);
  knobCore.rotation.x = Math.PI / 2;
  knobGroup.add(knobCore);
  const knobMarker = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.022, 0.012), brassMat);
  knobMarker.position.set(0, 0.016, 0.018);
  knobGroup.add(knobMarker);
  group.add(knobGroup);

  const dialLeftBtn = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.052, 0.03), brassMat);
  dialLeftBtn.position.set(-0.175, 0.055, 0.132);
  group.add(dialLeftBtn);
  interactables.push({ mesh: dialLeftBtn, actionId: 'radio_dial_left', label: 'Turn Radio Dial Left (-CH)' });

  const dialRightBtn = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.052, 0.03), brassMat);
  dialRightBtn.position.set(-0.045, 0.055, 0.132);
  group.add(dialRightBtn);
  interactables.push({ mesh: dialRightBtn, actionId: 'radio_dial_right', label: 'Turn Radio Dial Right (+CH)' });

  const listenBtnMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    emissive: 0x450a0a,
    emissiveIntensity: 0.4,
    roughness: 0.35,
  });
  const listenBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.028, 0.028, 16), listenBtnMat);
  listenBtn.rotation.x = Math.PI / 2;
  listenBtn.position.set(0.045, 0.055, 0.132);
  group.add(listenBtn);
  interactables.push({ mesh: listenBtn, actionId: 'radio_listen', label: 'Press LISTEN (Test Channel)' });

  const helixPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    const angle = t * Math.PI * 12;
    helixPts.push(
      new THREE.Vector3(
        -0.25 - Math.sin(t * Math.PI) * 0.04 + Math.cos(angle) * 0.014,
        0.04 + t * 0.14,
        Math.sin(angle) * 0.014
      )
    );
  }
  group.add(
    new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(helixPts), 44, 0.005, 6, false), bezelMat)
  );
  const handset = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.045), bezelMat);
  handset.position.set(-0.255, 0.12, 0.02);
  group.add(handset);

  let targetKnobAngle = 0;
  let targetNeedleX = -0.055;

  const update = (state: GameState, dt: number, time: number) => {
    const norm = (state.radioChannel - 10) / 10;
    targetKnobAngle = -(norm - 0.5) * Math.PI * 1.4;
    targetNeedleX = -0.055 + (norm - 0.5) * 0.23;

    knobGroup.rotation.z = THREE.MathUtils.damp(knobGroup.rotation.z, targetKnobAngle, 14, dt);
    needle.position.x = THREE.MathUtils.damp(needle.position.x, targetNeedleX, 16, dt);

    if (state.radioSolved) {
      lampMat.color.setHex(0x22c55e);
      lampMat.emissive.setHex(0x16a34a);
      lampMat.emissiveIntensity = 0.9 + Math.sin(time * 3) * 0.15;
    } else if (state.emergencyLightOn) {
      lampMat.color.setHex(0xf59e0b);
      lampMat.emissive.setHex(0xd97706);
      lampMat.emissiveIntensity = state.radioChannel === 16 ? 1.1 : 0.45 + Math.sin(time * 7) * 0.2;
    }
  };

  return { group, interactables, update };
}

export function createGeneratorAssembly(textures: MaterialTextures): GeneratorAssembly {
  const group = new THREE.Group();
  const interactables: InteractiveHandle[] = [];

  const steelMat = new THREE.MeshStandardMaterial({
    map: textures.steelAlbedo,
    color: 0xffffff,
    roughness: 0.55,
    metalness: 0.45,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e262c, roughness: 0.42, metalness: 0.72 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc2933e, roughness: 0.28, metalness: 0.86 });

  const genBox = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.15, 0.82), steelMat);
  genBox.position.set(0.55, 0.575, 0);
  genBox.castShadow = true;
  genBox.receiveShadow = true;
  group.add(genBox);

  const exhaustPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 2.2, 12), darkMetalMat);
  exhaustPipe.position.set(1.02, 1.75, -0.15);
  group.add(exhaustPipe);

  // Hinged Wiring Inspection Plate + Portable Inspection Lamp
  const wiringPivot = new THREE.Group();
  wiringPivot.position.set(0.1, 0.55, 0.415);
  const wiringCover = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.025), darkMetalMat);
  wiringCover.position.set(0.16, 0, 0);
  const wiringLatch = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.07, 0.04), brassMat);
  wiringLatch.position.set(0.29, 0, 0.015);
  wiringPivot.add(wiringCover, wiringLatch);
  group.add(wiringPivot);
  interactables.push({ mesh: wiringCover, actionId: 'gen_wiring_plate', label: 'Inspect Wiring Plate & Lamp' });

  const inspLampBulbMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0,
  });
  const inspLamp = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), inspLampBulbMat);
  inspLamp.position.set(-0.08, 1.05, 0.44);
  group.add(inspLamp);

  const fanGroup = new THREE.Group();
  fanGroup.position.set(0.36, 0.84, 0.42);
  fanGroup.add(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.022, 8, 20), darkMetalMat));
  const fanBlades = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.16, 0.012), brassMat);
    blade.rotation.z = (i * Math.PI) / 3;
    blade.position.set(Math.sin((i * Math.PI) / 3) * -0.085, Math.cos((i * Math.PI) / 3) * 0.085, 0);
    blade.rotation.y = 0.35;
    fanBlades.add(blade);
  }
  fanGroup.add(fanBlades);
  group.add(fanGroup);

  const gaugeNeedles: THREE.Mesh[] = [];
  for (let i = 0; i < 2; i++) {
    const gx = 0.78 + i * 0.22;
    const dial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.025, 18),
      new THREE.MeshStandardMaterial({ color: 0xe2dcc8, roughness: 0.4 })
    );
    dial.rotation.x = Math.PI / 2;
    dial.position.set(gx, 0.85, 0.415);
    group.add(dial);

    const gNeedle = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, 0.055, 0.01),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c })
    );
    gNeedle.position.set(gx, 0.85, 0.432);
    gNeedle.rotation.z = 0.85;
    group.add(gNeedle);
    gaugeNeedles.push(gNeedle);
  }

  const contactorMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0x7f1d1d,
    emissiveIntensity: 0.6,
  });
  const contactorLamp = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 10), contactorMat);
  contactorLamp.position.set(0.89, 1.03, 0.42);
  group.add(contactorLamp);

  const isolatorPivot = new THREE.Group();
  isolatorPivot.position.set(1.12, 0.68, 0.43);
  const leverArm = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.34, 8), brassMat);
  leverArm.position.y = 0.16;
  const leverGrip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.11, 10),
    new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.45 })
  );
  leverGrip.position.y = 0.34;
  isolatorPivot.add(leverArm, leverGrip);
  isolatorPivot.rotation.x = -0.35;
  group.add(isolatorPivot);
  interactables.push({ mesh: leverGrip, actionId: 'gen_isolator', label: 'Pull Main Isolator Lever' });
  interactables.push({ mesh: leverArm, actionId: 'gen_isolator', label: 'Pull Main Isolator Lever' });

  // Service Fuse Cabinet
  const cabGroup = new THREE.Group();
  cabGroup.position.set(-0.62, 1.05, 0);
  group.add(cabGroup);

  cabGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.92, 0.24), darkMetalMat));

  const diagramPlate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.64, 0.32),
    new THREE.MeshStandardMaterial({ map: textures.fuseDiagramTex, roughness: 0.4 })
  );
  diagramPlate.position.set(0, 0.23, 0.125);
  cabGroup.add(diagramPlate);

  const socketSpecs: Array<{ shape: SocketShape; x: number; num: string }> = [
    { shape: 'circle', x: -0.2, num: '1' },
    { shape: 'triangle', x: 0, num: '2' },
    { shape: 'square', x: 0.2, num: '3' },
  ];

  const socketRings: Record<SocketShape, THREE.MeshStandardMaterial> = {
    circle: new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0x000000 }),
    triangle: new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0x000000 }),
    square: new THREE.MeshStandardMaterial({ color: 0x334155, emissive: 0x000000 }),
  };

  const seatedMeshes: Record<SocketShape, THREE.Group> = {
    circle: new THREE.Group(),
    triangle: new THREE.Group(),
    square: new THREE.Group(),
  };

  const makeCartridgeBody = (id: CartridgeId) => {
    const g = new THREE.Group();
    const color = id === 'AUX' ? 0x38bdf8 : id === 'DRIVE' ? 0xfbbf24 : 0xf97316;
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.036, 0.13, 14),
      new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.25 })
    );
    cyl.rotation.x = Math.PI / 2;
    g.add(cyl);
    const capGeo =
      id === 'AUX'
        ? new THREE.CylinderGeometry(0.03, 0.03, 0.025, 16)
        : id === 'DRIVE'
        ? new THREE.CylinderGeometry(0.034, 0.034, 0.025, 3)
        : new THREE.BoxGeometry(0.052, 0.052, 0.025);
    const cap = new THREE.Mesh(capGeo, brassMat);
    if (id !== 'BEACON') cap.rotation.x = Math.PI / 2;
    cap.position.z = 0.07;
    g.add(cap);
    return g;
  };

  socketSpecs.forEach((spec) => {
    const bezelGeo =
      spec.shape === 'circle'
        ? new THREE.TorusGeometry(0.055, 0.012, 8, 20)
        : spec.shape === 'triangle'
        ? new THREE.RingGeometry(0.042, 0.064, 3)
        : new THREE.RingGeometry(0.044, 0.066, 4);
    const bezel = new THREE.Mesh(bezelGeo, socketRings[spec.shape]);
    if (spec.shape === 'square') bezel.rotation.z = Math.PI / 4;
    if (spec.shape === 'triangle') bezel.rotation.z = Math.PI / 6;
    bezel.position.set(spec.x, -0.14, 0.13);
    cabGroup.add(bezel);

    const hitPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.18, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 })
    );
    hitPlate.position.set(spec.x, -0.14, 0.11);
    cabGroup.add(hitPlate);
    interactables.push({
      mesh: hitPlate,
      actionId: `gen_socket_${spec.shape}`,
      label: `Socket ${spec.num} (${spec.shape.toUpperCase()})`,
    });

    const seated = new THREE.Group();
    seated.position.set(spec.x, -0.14, 0.14);
    (['AUX', 'DRIVE', 'BEACON'] as CartridgeId[]).forEach((cid) => {
      const m = makeCartridgeBody(cid);
      m.name = cid;
      m.visible = false;
      seated.add(m);
    });
    cabGroup.add(seated);
    seatedMeshes[spec.shape] = seated;
  });

  const tray = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.05, 0.28), steelMat);
  tray.position.set(0, -0.52, 0.16);
  cabGroup.add(tray);

  const trayCartridges: Record<CartridgeId, THREE.Group> = {
    AUX: makeCartridgeBody('AUX'),
    DRIVE: makeCartridgeBody('DRIVE'),
    BEACON: makeCartridgeBody('BEACON'),
  };
  (['AUX', 'DRIVE', 'BEACON'] as CartridgeId[]).forEach((cid, idx) => {
    const cg = trayCartridges[cid];
    cg.position.set(-0.2 + idx * 0.2, -0.46, 0.18);
    cg.rotation.x = -Math.PI / 2;
    cabGroup.add(cg);
    interactables.push({
      mesh: cg,
      actionId: `gen_cartridge_${cid}`,
      label: `Select ${cid} Cartridge (${cid === 'AUX' ? '○' : cid === 'DRIVE' ? '△' : '□'})`,
    });
  });

  const doorPivot = new THREE.Group();
  doorPivot.position.set(-0.38, 0, 0.13);
  const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.92, 0.03), steelMat);
  doorLeaf.position.set(0.38, 0, 0);
  doorPivot.add(doorLeaf);
  const latch = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.045), brassMat);
  latch.position.set(0.7, 0, 0.025);
  doorPivot.add(latch);
  cabGroup.add(doorPivot);
  interactables.push({ mesh: doorLeaf, actionId: 'gen_door_toggle', label: 'Open / Close Fuse Cabinet Door' });
  interactables.push({ mesh: latch, actionId: 'gen_door_toggle', label: 'Open / Close Fuse Cabinet Door' });

  let rejectShakeTimer = 0;
  const triggerRejectShake = () => {
    rejectShakeTimer = 0.45;
  };

  const update = (state: GameState, dt: number, time: number) => {
    wiringPivot.rotation.y = THREE.MathUtils.damp(wiringPivot.rotation.y, state.wiringPlateOpened ? -1.45 : 0, 10, dt);
    inspLampBulbMat.emissiveIntensity = state.inspectionLampOn ? 1.8 : 0;

    doorPivot.rotation.y = THREE.MathUtils.damp(doorPivot.rotation.y, state.cabinetOpen ? -Math.PI * 1.05 : 0, 14, dt);
    isolatorPivot.rotation.x = THREE.MathUtils.damp(isolatorPivot.rotation.x, state.isolatorPulled ? 0.72 : -0.35, 10, dt);

    if (rejectShakeTimer > 0) {
      rejectShakeTimer = Math.max(0, rejectShakeTimer - dt);
      cabGroup.position.x = -0.62 + Math.sin(rejectShakeTimer * 55) * 0.02;
    } else {
      cabGroup.position.x = -0.62;
    }

    const seatedValues = Object.values(state.sockets);
    (['AUX', 'DRIVE', 'BEACON'] as CartridgeId[]).forEach((cid) => {
      const isSeated = seatedValues.includes(cid);
      const mesh = trayCartridges[cid];
      mesh.visible = !isSeated;
      const targetY = state.selectedCartridge === cid ? -0.36 : -0.46;
      mesh.position.y = THREE.MathUtils.damp(mesh.position.y, targetY, 12, dt);
    });

    (['circle', 'triangle', 'square'] as SocketShape[]).forEach((shape) => {
      const seatedCid = state.sockets[shape];
      const sockGroup = seatedMeshes[shape];
      sockGroup.children.forEach((child) => {
        child.visible = child.name === seatedCid;
      });
      if (seatedCid) {
        socketRings[shape].color.setHex(0x22c55e);
        socketRings[shape].emissive.setHex(0x16a34a);
        socketRings[shape].emissiveIntensity = 0.85;
      } else {
        socketRings[shape].color.setHex(0x475569);
        socketRings[shape].emissive.setHex(0x000000);
        socketRings[shape].emissiveIntensity = 0;
      }
    });

    if (state.generatorRunning) {
      fanBlades.rotation.z += dt * 14;
      contactorMat.color.setHex(0x22c55e);
      contactorMat.emissive.setHex(0x16a34a);
      contactorMat.emissiveIntensity = 1.1;
      gaugeNeedles.forEach((n, idx) => {
        const target = -0.45 + Math.sin(time * 7 + idx * 2) * 0.06;
        n.rotation.z = THREE.MathUtils.damp(n.rotation.z, target, 6, dt);
      });
    } else {
      contactorMat.color.setHex(0xef4444);
      contactorMat.emissive.setHex(0x7f1d1d);
      contactorMat.emissiveIntensity = 0.55;
      gaugeNeedles.forEach((n) => {
        n.rotation.z = THREE.MathUtils.damp(n.rotation.z, 0.85, 6, dt);
      });
    }
  };

  return { group, interactables, triggerRejectShake, update };
}

export function createFresnelAssembly(textures: MaterialTextures, isMobileOrSoftware: boolean): FresnelAssembly {
  const group = new THREE.Group();
  const interactables: InteractiveHandle[] = [];

  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc99a42, roughness: 0.28, metalness: 0.86 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x202b32, roughness: 0.55, metalness: 0.65 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xdbeafe,
    roughness: 0.08,
    metalness: 0.05,
    transparent: true,
    opacity: 0.42,
    clearcoat: 1.0,
    depthWrite: false,
  });

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.74, 0.92, 20), ironMat);
  pedestal.position.y = 0.46;
  group.add(pedestal);

  const plaqueGroup = new THREE.Group();
  plaqueGroup.position.set(-0.74, 1.08, 0.42);
  plaqueGroup.rotation.set(-0.2, 0.34, 0);
  const plaqueBack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.024), ironMat);
  const bearingCard = new THREE.Mesh(
    new THREE.PlaneGeometry(0.47, 0.27),
    new THREE.MeshStandardMaterial({ map: textures.bearingCardTex, roughness: 0.42 })
  );
  bearingCard.position.z = 0.015;
  plaqueGroup.add(plaqueBack, bearingCard);
  group.add(plaqueGroup);

  const pinTray = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.14), ironMat);
  pinTray.position.set(-0.48, 0.82, 0.54);
  group.add(pinTray);
  const trayPin = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.14, 10), brassMat);
  trayPin.rotation.z = Math.PI / 2;
  trayPin.position.set(-0.48, 0.85, 0.54);
  group.add(trayPin);
  interactables.push({ mesh: trayPin, actionId: 'lantern_take_pin', label: 'Take Brass Drive Pin' });
  interactables.push({ mesh: pinTray, actionId: 'lantern_take_pin', label: 'Take Brass Drive Pin' });

  const couplingHub = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.09, 14), brassMat);
  couplingHub.position.set(-0.24, 0.94, 0.58);
  group.add(couplingHub);
  interactables.push({ mesh: couplingHub, actionId: 'lantern_seat_pin', label: 'Seat Drive Pin in Coupling' });

  const seatedPin = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 10), brassMat);
  seatedPin.position.set(-0.24, 1.0, 0.58);
  seatedPin.visible = false;
  group.add(seatedPin);

  const switchBase = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.08), ironMat);
  switchBase.position.set(0.46, 0.86, 0.54);
  group.add(switchBase);
  const lampLever = new THREE.Group();
  lampLever.position.set(0.46, 0.86, 0.59);
  const switchHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.16, 8), brassMat);
  switchHandle.position.y = 0.07;
  const switchKnob = new THREE.Mesh(
    new THREE.SphereGeometry(0.028, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35 })
  );
  switchKnob.position.y = 0.15;
  lampLever.add(switchHandle, switchKnob);
  lampLever.rotation.x = -0.4;
  group.add(lampLever);
  interactables.push({ mesh: switchBase, actionId: 'lantern_lamp_switch', label: 'Pull Fresnel Lamp Switch' });
  interactables.push({ mesh: switchKnob, actionId: 'lantern_lamp_switch', label: 'Pull Fresnel Lamp Switch' });

  const crankPivot = new THREE.Group();
  crankPivot.position.set(0.28, 0.72, 0.68);
  const crankArm = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.22, 0.03), brassMat);
  crankArm.position.y = 0.1;
  const crankGrip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.1, 10),
    new THREE.MeshStandardMaterial({ color: 0x5c3723, roughness: 0.65 })
  );
  crankGrip.rotation.x = Math.PI / 2;
  crankGrip.position.set(0, 0.2, 0.06);
  crankPivot.add(crankArm, crankGrip);
  group.add(crankPivot);

  const crankLeftHit = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.07), ironMat);
  crankLeftHit.position.set(0.14, 0.42, 0.72);
  group.add(crankLeftHit);
  interactables.push({ mesh: crankLeftHit, actionId: 'lantern_crank_left', label: 'Crank Left (-2° Bearing)' });

  const crankRightHit = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.07), ironMat);
  crankRightHit.position.set(0.42, 0.42, 0.72);
  group.add(crankRightHit);
  interactables.push({ mesh: crankRightHit, actionId: 'lantern_crank_right', label: 'Crank Right (+2° Bearing)' });

  // 3-Beat Telegraph Buttons on Pedestal Panel (Catch Marker / Hold / Proceed Shutter)
  const catchBtnMat = new THREE.MeshStandardMaterial({ color: 0xd97706, emissive: 0x78350f, emissiveIntensity: 0.5 });
  const catchBtn = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 0.06), catchBtnMat);
  catchBtn.position.set(-0.48, 0.42, 0.71);
  group.add(catchBtn);
  interactables.push({ mesh: catchBtn, actionId: 'lantern_catch_marker', label: 'Beat 1: Catch Outer Marker (072°)' });

  const holdBtnMat = new THREE.MeshStandardMaterial({ color: 0x475569, emissive: 0x1e293b, emissiveIntensity: 0.35 });
  const holdBtn = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.06), holdBtnMat);
  holdBtn.position.set(-0.27, 0.42, 0.71);
  group.add(holdBtn);
  interactables.push({ mesh: holdBtn, actionId: 'lantern_signal_hold', label: 'Beat 2: Signal HOLD (Wait for E-4)' });

  const proceedBtnMat = new THREE.MeshStandardMaterial({ color: 0x15803d, emissive: 0x052e16, emissiveIntensity: 0.35 });
  const proceedBtn = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.06), proceedBtnMat);
  proceedBtn.position.set(-0.07, 0.42, 0.71);
  group.add(proceedBtn);
  interactables.push({ mesh: proceedBtn, actionId: 'lantern_signal_proceed', label: 'Beat 3: East Shutter PROCEED' });

  // Rotating Turret & Fresnel Rings
  const turret = new THREE.Group();
  turret.position.y = 0.96;
  group.add(turret);

  turret.add(new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.09, 28), brassMat));

  const toothGeo = new THREE.BoxGeometry(0.04, 0.09, 0.05);
  const teeth = new THREE.InstancedMesh(toothGeo, brassMat, 28);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    dummy.position.set(Math.cos(a) * 0.7, 0, Math.sin(a) * 0.7);
    dummy.rotation.set(0, -a, 0);
    dummy.updateMatrix();
    teeth.setMatrixAt(i, dummy.matrix);
  }
  teeth.instanceMatrix.needsUpdate = true;
  turret.add(teeth);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.15, 0.05), brassMat);
    rib.position.set(Math.cos(a) * 0.52, 0.62, Math.sin(a) * 0.52);
    rib.rotation.y = -a;
    turret.add(rib);
  }

  [0.46, 0.51, 0.53, 0.51, 0.46].forEach((r, idx) => {
    const prism = new THREE.Mesh(new THREE.TorusGeometry(r, 0.068, 10, 28), glassMat);
    prism.rotation.x = Math.PI / 2;
    prism.position.y = 0.24 + idx * 0.19;
    prism.renderOrder = 2;
    turret.add(prism);
  });

  const bullseye = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 10, 22), glassMat);
  bullseye.rotation.y = Math.PI / 2;
  bullseye.position.set(0.52, 0.62, 0);
  bullseye.renderOrder = 3;
  turret.add(bullseye);

  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xf59e0b,
    emissiveIntensity: 0,
    roughness: 0.2,
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), bulbMat);
  bulb.position.y = 0.62;
  turret.add(bulb);

  const lanternPointLight = new THREE.PointLight(0xffb84d, 0, 12, 1.5);
  lanternPointLight.position.y = 0.62;
  turret.add(lanternPointLight);

  // Volumetric beam + sea-surface light patch synchronized with turret rotation
  const beamGroup = new THREE.Group();
  beamGroup.position.set(0.5, 0.62, 0);
  const beamLen = isMobileOrSoftware ? 115 : 145;
  const beamGeo = new THREE.CylinderGeometry(0.28, 7.5, beamLen, 20, 1, true);
  beamGeo.rotateZ(-Math.PI / 2);
  beamGeo.translate(beamLen / 2, 0, 0);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xffc66d,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const beamMesh = new THREE.Mesh(beamGeo, beamMat);
  beamMesh.rotation.z = -0.14;
  beamGroup.add(beamMesh);

  // Synchronized glowing water pool where beam meets the harbor approach
  const seaPatch = new THREE.Mesh(
    new THREE.CircleGeometry(6.8, 20),
    new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  seaPatch.rotation.x = -Math.PI / 2;
  seaPatch.position.set(48, -11.3, 0);
  beamGroup.add(seaPatch);

  beamGroup.visible = false;
  turret.add(beamGroup);

  const beamSpotlight = new THREE.SpotLight(0xffcb74, 0, 180, Math.PI / 11, 0.65, 0.8);
  beamSpotlight.position.set(0.5, 0.62, 0);
  const spotTarget = new THREE.Object3D();
  spotTarget.position.set(60, -10, 0);
  turret.add(spotTarget);
  beamSpotlight.target = spotTarget;
  turret.add(beamSpotlight);

  const bearingNeedle = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 0.14, 0.012),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xb45309, emissiveIntensity: 0.8 })
  );
  bearingNeedle.position.set(0.28, 0.92, 0.68);
  group.add(bearingNeedle);

  let currentTurretYaw = 0;

  const update = (state: GameState, dt: number, time: number) => {
    trayPin.visible = !state.drivePinTaken;
    seatedPin.visible = state.drivePinSeated;

    lampLever.rotation.x = THREE.MathUtils.damp(lampLever.rotation.x, state.lampSwitchOn ? 0.55 : -0.4, 10, dt);

    const targetTurretYaw = THREE.MathUtils.degToRad(72 - state.bearingDegrees) + 0.14;
    currentTurretYaw = THREE.MathUtils.damp(currentTurretYaw, targetTurretYaw, 10, dt);
    turret.rotation.y = currentTurretYaw;

    const targetCrankZ = -((state.bearingDegrees - 60) / 2) * (Math.PI / 4);
    crankPivot.rotation.z = THREE.MathUtils.damp(crankPivot.rotation.z, targetCrankZ, 12, dt);
    bearingNeedle.rotation.z = THREE.MathUtils.damp(
      bearingNeedle.rotation.z,
      -((state.bearingDegrees - 72) / 16) * 0.9,
      12,
      dt
    );

    const beamOn = state.lampSwitchOn && state.generatorRunning;
    const isDawn = state.phase === 'dawn_epilogue' || state.phase === 'credits';
    // Brief Morse pulse shutter flicker when Beat 3 PROCEED active
    const proceedFlicker = state.phase === 'rescue_sequence' && state.rescueElapsed < 2.2 ? (Math.sin(time * 18) > 0 ? 1 : 0.25) : 1;
    beamGroup.visible = beamOn && !isDawn;
    if (beamOn) {
      bulbMat.emissiveIntensity = (isDawn ? 1.6 : 3.2) * proceedFlicker;
      lanternPointLight.intensity = (isDawn ? 3.0 : 6.5) * proceedFlicker;
      beamSpotlight.intensity = (isDawn ? 0 : 185) * proceedFlicker;
      beamMat.opacity = (0.21 + Math.sin(time * 2.5) * 0.02) * proceedFlicker;
      (seaPatch.material as THREE.MeshBasicMaterial).opacity = 0.22 * proceedFlicker;
    } else {
      bulbMat.emissiveIntensity = 0;
      lanternPointLight.intensity = 0;
      beamSpotlight.intensity = 0;
    }

    catchBtnMat.emissiveIntensity = state.crossingBeat >= 1 ? 1.0 : state.bearingDegrees === 72 && state.lampSwitchOn ? 0.8 + Math.sin(time * 4) * 0.2 : 0.3;
    holdBtnMat.emissiveIntensity = state.holdBeamActive ? 1.1 : state.crossingBeat === 1 ? 0.8 : 0.2;
    holdBtnMat.color.setHex(state.holdBeamActive ? 0xf59e0b : 0x475569);
    proceedBtnMat.emissiveIntensity = state.crossingBeat >= 2 ? 1.2 + Math.sin(time * 5) * 0.3 : 0.25;
  };

  return { group, beamGroup, beamSpotlight, interactables, update };
}

export function createCottageAssembly(textures: MaterialTextures): CottageAssembly {
  const group = new THREE.Group();
  const interactables: InteractiveHandle[] = [];

  const woodMat = new THREE.MeshStandardMaterial({
    map: textures.woodAlbedo,
    roughnessMap: textures.woodRoughness,
    color: 0xffffff,
    roughness: 0.72,
  });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0x9c5534, roughness: 0.42, metalness: 0.75 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e282e, roughness: 0.6, metalness: 0.6 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc2933e, roughness: 0.3, metalness: 0.82 });

  // Chart table inside cottage
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.07, 0.92), woodMat);
  tableTop.position.set(0, 0.78, 0);
  group.add(tableTop);
  for (const lx of [-0.68, 0.68]) {
    for (const lz of [-0.36, 0.36]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.78, 0.08), woodMat);
      leg.position.set(lx, 0.39, lz);
      group.add(leg);
    }
  }

  // Drawer slide-out
  const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.11, 0.46), woodMat);
  drawer.position.set(0, 0.68, 0.26);
  const drawerPull = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.04), brassMat);
  drawerPull.position.set(0, 0.68, 0.51);
  group.add(drawer, drawerPull);
  interactables.push({ mesh: drawer, actionId: 'cottage_open_drawer', label: 'Open Chart Table Drawer' });
  interactables.push({ mesh: drawerPull, actionId: 'cottage_open_drawer', label: 'Open Chart Table Drawer' });

  // Base Harbor Chart on Table
  const baseChart = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.7),
    new THREE.MeshStandardMaterial({ map: textures.chartTexDark, roughness: 0.62 })
  );
  baseChart.rotation.x = -Math.PI / 2;
  baseChart.position.set(0, 0.82, -0.04);
  group.add(baseChart);

  // Transparent Survey Overlay Sheet (rotates on Y around chart center!)
  const overlaySheet = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.7),
    new THREE.MeshBasicMaterial({
      map: textures.surveyOverlayTex,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    })
  );
  overlaySheet.rotation.x = -Math.PI / 2;
  overlaySheet.position.set(0, 0.832, -0.04);
  overlaySheet.visible = false;
  group.add(overlaySheet);

  // Overlay Rotation Brass Buttons right on table edge
  const rotL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.04, 0.09), brassMat);
  rotL.position.set(-0.58, 0.83, 0.28);
  const rotR = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.04, 0.09), brassMat);
  rotR.position.set(-0.42, 0.83, 0.28);
  group.add(rotL, rotR);
  interactables.push({ mesh: rotL, actionId: 'cottage_overlay_left', label: 'Rotate Survey Overlay (-5°)' });
  interactables.push({ mesh: rotR, actionId: 'cottage_overlay_right', label: 'Rotate Survey Overlay (+5°)' });

  // Cold Copper Kettle resting on timber hearth side table
  const hearthShelf = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.72, 0.48), woodMat);
  hearthShelf.position.set(-1.35, 0.36, -1.15);
  group.add(hearthShelf);

  const kettleGroup = new THREE.Group();
  kettleGroup.position.set(-1.35, 0.82, -1.15);
  const kBody = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 12), copperMat);
  kBody.scale.y = 0.82;
  const kHandle = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 6, 14, Math.PI), ironMat);
  kHandle.position.y = 0.09;
  kettleGroup.add(kBody, kHandle);
  group.add(kettleGroup);
  interactables.push({ mesh: kBody, actionId: 'cottage_inspect_kettle', label: 'Inspect Cold Copper Kettle' });

  // Carved Doorframe Tide Marks Plaque
  const tidePlaque = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.65, 0.04), woodMat);
  tidePlaque.position.set(1.55, 1.1, 1.5);
  group.add(tidePlaque);
  interactables.push({ mesh: tidePlaque, actionId: 'cottage_inspect_tidemarks', label: 'Examine Doorframe Tide Marks' });

  // East Window Frame looking toward Boathouse Slipway
  const winCheckTarget = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.72, 1.1),
    new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.16, depthWrite: false })
  );
  winCheckTarget.position.set(2.05, 1.38, 0);
  group.add(winCheckTarget);
  interactables.push({ mesh: winCheckTarget, actionId: 'cottage_window_check', label: 'Verify Slipway Through Cottage Window' });

  const update = (state: GameState, dt: number) => {
    const targetDrawerZ = state.drawerOpened ? 0.58 : 0.26;
    drawer.position.z = THREE.MathUtils.damp(drawer.position.z, targetDrawerZ, 10, dt);
    drawerPull.position.z = drawer.position.z + 0.25;

    overlaySheet.visible = state.overlayPlaced;
    const targetRotZ = THREE.MathUtils.degToRad(state.overlayAngleDeg);
    overlaySheet.rotation.z = THREE.MathUtils.damp(overlaySheet.rotation.z, targetRotZ, 12, dt);
    rotL.visible = state.overlayPlaced;
    rotR.visible = state.overlayPlaced;
  };

  return { group, interactables, update };
}

export function createBoathousePropsAssembly(textures: MaterialTextures): BoathousePropsAssembly {
  const group = new THREE.Group();
  const interactables: InteractiveHandle[] = [];

  const woodMat = new THREE.MeshStandardMaterial({ map: textures.woodAlbedo, roughness: 0.72 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc2933e, roughness: 0.28, metalness: 0.85 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1c252b, roughness: 0.55, metalness: 0.65 });

  // Painted Tide Scale by Slipway Stairs
  const tideBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 1.55, 0.04),
    new THREE.MeshStandardMaterial({ map: textures.tideScaleTex, roughness: 0.7 })
  );
  tideBoard.position.set(-1.35, 1.0, -1.6);
  group.add(tideBoard);
  interactables.push({ mesh: tideBoard, actionId: 'boathouse_check_tide', label: 'Read Painted Tide Scale' });

  // Upper Landing Mounted Telescope (y = 1.4m above boathouse deck floor)
  const scopeGroup = new THREE.Group();
  scopeGroup.position.set(1.25, 1.4, -0.55);
  const tripodLegMat = ironMat;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.018, 1.28, 8), tripodLegMat);
    leg.position.set(Math.cos(a) * 0.24, 0.58, Math.sin(a) * 0.24);
    leg.rotation.set(Math.sin(a) * 0.34, 0, -Math.cos(a) * 0.34);
    scopeGroup.add(leg);
  }
  const barrelPivot = new THREE.Group();
  barrelPivot.position.set(0, 1.24, 0);
  barrelPivot.rotation.y = 0.22; // Aimed out across eastern swells toward E-4
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.036, 0.68, 14), brassMat);
  barrel.rotation.z = -Math.PI / 2;
  barrelPivot.add(barrel);

  const focusWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.03, 14), ironMat);
  focusWheel.rotation.x = Math.PI / 2;
  focusWheel.position.set(-0.18, -0.03, 0.055);
  barrelPivot.add(focusWheel);
  scopeGroup.add(barrelPivot);
  group.add(scopeGroup);

  interactables.push({ mesh: barrel, actionId: 'boathouse_telescope_toggle', label: 'Look Through Mounted Telescope' });
  const focusInHit = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.08), brassMat);
  focusInHit.position.set(1.05, 2.38, -0.35);
  const focusOutHit = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.08), ironMat);
  focusOutHit.position.set(1.25, 2.38, -0.35);
  group.add(focusInHit, focusOutHit);
  interactables.push({ mesh: focusOutHit, actionId: 'boathouse_focus_out', label: 'Telescope Focus -' });
  interactables.push({ mesh: focusInHit, actionId: 'boathouse_focus_in', label: 'Telescope Focus +' });

  // Upper Landing Bench with 2 Buoy Maintenance Cards + Parts Rack + 12V Bench Tester
  const bench = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.07, 0.68), woodMat);
  bench.position.set(-0.2, 2.18, 0.72);
  group.add(bench);

  const cardE4 = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.02, 0.3),
    new THREE.MeshStandardMaterial({ map: textures.cardE4Tex, roughness: 0.55 })
  );
  cardE4.position.set(-0.78, 2.23, 0.72);
  group.add(cardE4);
  interactables.push({ mesh: cardE4, actionId: 'boathouse_card_e4', label: 'Confirm Card E-4 (Double Flash)' });

  const cardD2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.02, 0.3),
    new THREE.MeshStandardMaterial({ map: textures.cardD2Tex, roughness: 0.55 })
  );
  cardD2.position.set(-0.46, 2.23, 0.72);
  group.add(cardD2);
  interactables.push({ mesh: cardD2, actionId: 'boathouse_card_d2', label: 'Inspect Card D-2 (Single Flash)' });

  // Three Flash-Pattern Drums on Rack
  const drumSpecs: Array<{ id: DrumPatternId; x: number; color: number; label: string }> = [
    { id: 'single_3s', x: -0.1, color: 0xef4444, label: 'Drum A: Single Pulse (3.0s)' },
    { id: 'double_flash', x: 0.12, color: 0xf59e0b, label: 'Drum B: Double-Flash Amber' },
    { id: 'quick_tri', x: 0.34, color: 0x38bdf8, label: 'Drum C: Quick Tri-Flash' },
  ];
  const drumMeshes = new Map<DrumPatternId, THREE.Mesh>();
  drumSpecs.forEach((d) => {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.14, 14),
      new THREE.MeshStandardMaterial({ color: d.color, roughness: 0.42, metalness: 0.3 })
    );
    mesh.position.set(d.x, 2.29, 0.55);
    group.add(mesh);
    drumMeshes.set(d.id, mesh);
    interactables.push({ mesh, actionId: `boathouse_drum_${d.id}`, label: d.label });
  });

  // Bench Tester Cradle & LED
  const testerBase = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.24), ironMat);
  testerBase.position.set(0.54, 2.27, 0.78);
  const testerLedMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.2,
  });
  const testerLed = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 10), testerLedMat);
  testerLed.position.set(0.54, 2.36, 0.78);
  group.add(testerBase, testerLed);
  interactables.push({ mesh: testerBase, actionId: 'boathouse_test_drum', label: 'Run Bench Tester (12V Battery)' });

  const update = (state: GameState, dt: number, time: number) => {
    focusWheel.rotation.z = THREE.MathUtils.damp(focusWheel.rotation.z, state.telescopeFocus * 0.55, 10, dt);

    drumMeshes.forEach((m, id) => {
      const selected = state.selectedDrum === id;
      m.position.y = THREE.MathUtils.damp(m.position.y, selected ? 2.38 : 2.29, 10, dt);
      if (selected) m.rotation.y += dt * 1.8;
    });

    if (state.drumTestedMatch) {
      const p24 = time % 2.4;
      const on = p24 < 0.22 || (p24 > 0.42 && p24 < 0.64);
      testerLedMat.color.setHex(0xfbbf24);
      testerLedMat.emissive.setHex(0xf59e0b);
      testerLedMat.emissiveIntensity = on ? 2.4 : 0.15;
    } else if (state.selectedDrum === 'single_3s') {
      const on = time % 3.0 < 0.3;
      testerLedMat.color.setHex(0xef4444);
      testerLedMat.emissive.setHex(0xdc2626);
      testerLedMat.emissiveIntensity = on ? 1.8 : 0.1;
    } else {
      testerLedMat.emissiveIntensity = 0.25;
    }
  };

  return { group, interactables, update };
}

export function createSignalHutPropsAssembly(textures: MaterialTextures): SignalHutPropsAssembly {
  const group = new THREE.Group();
  const interactables: InteractiveHandle[] = [];

  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e2930, roughness: 0.52, metalness: 0.68 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc2933e, roughness: 0.28, metalness: 0.85 });

  // East Shutter Housing & Openable Inspection Cover
  const housing = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.46), ironMat);
  housing.position.set(0, 1.15, -0.55);
  group.add(housing);

  const coverPivot = new THREE.Group();
  coverPivot.position.set(-0.31, 1.15, -0.31);
  const coverLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.68, 0.03), ironMat);
  coverLeaf.position.set(0.31, 0, 0);
  coverPivot.add(coverLeaf);
  group.add(coverPivot);
  interactables.push({ mesh: coverLeaf, actionId: 'shut_open_housing', label: 'Open East Shutter Housing' });

  // Disengaged Gear Coupling inside housing
  const gearMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 16), brassMat);
  gearMesh.rotation.x = Math.PI / 2;
  gearMesh.position.set(-0.08, 1.04, -0.28);
  group.add(gearMesh);
  interactables.push({ mesh: gearMesh, actionId: 'shut_seat_gear', label: 'Seat Disengaged Coupling Gear' });

  // Shutter Lever
  const leverPivot = new THREE.Group();
  leverPivot.position.set(0.36, 1.15, -0.45);
  const leverStick = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.34, 8), brassMat);
  leverStick.position.y = 0.16;
  const leverKnob = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 })
  );
  leverKnob.position.y = 0.33;
  leverPivot.add(leverStick, leverKnob);
  group.add(leverPivot);
  interactables.push({ mesh: leverKnob, actionId: 'shut_test_lever', label: 'Pull Shutter Test Lever' });

  // Sighting Slit framing the East breakwaters
  const slitBox = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.16), ironMat);
  slitBox.position.set(0.7, 1.38, 0.1);
  group.add(slitBox);
  interactables.push({ mesh: slitBox, actionId: 'shut_look_slit', label: 'Sight Breakwaters Through Slit' });

  // Harbor Plot Board with clickable indicator pins
  const boardBack = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.92, 1.15), ironMat);
  boardBack.position.set(-0.85, 1.32, 0.15);
  const boardFace = new THREE.Mesh(
    new THREE.PlaneGeometry(1.08, 0.84),
    new THREE.MeshStandardMaterial({ map: textures.plotBoardTex, roughness: 0.45 })
  );
  boardFace.rotation.y = Math.PI / 2;
  boardFace.position.set(-0.815, 1.32, 0.15);
  group.add(boardBack, boardFace);

  const makePin = (y: number, z: number, color: number, actionId: string, label: string) => {
    const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.25 });
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), mat);
    pin.position.set(-0.79, y, z);
    group.add(pin);
    interactables.push({ mesh: pin, actionId, label });
    return mat;
  };
  const northPinMat = makePin(1.52, 0.52, 0xef4444, 'shut_pin_north', 'Toggle Fixed North Gate Pin');
  const southPinMat = makePin(1.12, 0.52, 0x22c55e, 'shut_pin_south', 'Toggle Fixed South Gate Pin');
  const e4PinMat = makePin(1.32, 0.52, 0xf59e0b, 'shut_pin_e4', 'Mark Buoy E-4 Drifting');

  const confirmMat = new THREE.MeshStandardMaterial({ color: 0xd97706, emissive: 0x78350f, emissiveIntensity: 0.45 });
  const confirmBtn = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.34), confirmMat);
  confirmBtn.position.set(-0.79, 0.96, 0.32);
  group.add(confirmBtn);
  interactables.push({ mesh: confirmBtn, actionId: 'shut_confirm_route', label: 'Confirm Harbor Route (072° E)' });

  const update = (state: GameState, dt: number, time: number) => {
    coverPivot.rotation.y = THREE.MathUtils.damp(coverPivot.rotation.y, state.shutterHousingOpen ? -1.8 : 0, 10, dt);
    gearMesh.position.x = THREE.MathUtils.damp(gearMesh.position.x, state.shutterGearSeated ? 0 : -0.11, 10, dt);
    gearMesh.position.y = THREE.MathUtils.damp(gearMesh.position.y, state.shutterGearSeated ? 1.15 : 1.02, 10, dt);
    if (state.shutterTested) gearMesh.rotation.z += dt * 1.5;

    leverPivot.rotation.x = THREE.MathUtils.damp(leverPivot.rotation.x, state.shutterTested ? 0.55 : -0.35, 10, dt);

    northPinMat.emissiveIntensity = state.plotNorthMarker ? 1.5 : 0.15;
    southPinMat.emissiveIntensity = state.plotSouthMarker ? 1.5 : 0.15;
    e4PinMat.emissiveIntensity = state.plotE4Drifting ? 1.5 + Math.sin(time * 6) * 0.4 : 0.15;
    confirmMat.color.setHex(state.plotRouteConfirmed ? 0x22c55e : 0xd97706);
  };

  return { group, interactables, update };
}

export function createDriftingBuoyE4(): BuoyE4Assembly {
  const group = new THREE.Group();
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x232d35, roughness: 0.55, metalness: 0.65 });
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.48 });

  const floatCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.96, 1.0, 12), hullMat);
  floatCyl.position.y = 0.4;
  const lattice = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.45, 1.55, 8), ironMat);
  lattice.position.y = 1.45;
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), beaconMat);
  beacon.position.y = 2.3;

  group.add(floatCyl, lattice, beacon);

  const update = (state: GameState, time: number) => {
    const w = getBuoyE4WorldState(state, time);
    group.position.set(w.x, w.y, w.z);
    group.rotation.z = Math.sin(time * 1.4) * 0.12 * (1 - state.dawnMix * 0.6);
    beaconMat.color.setHex(w.flashOn ? 0xfbbf24 : 0x451a03);
  };

  return { group, beaconMat, update };
}

export function createFerryAssembly(textures: MaterialTextures): FerryAssembly {
  const group = new THREE.Group();
  const interactables: InteractiveHandle[] = [];

  const hullMat = new THREE.MeshStandardMaterial({ color: 0x182b3a, roughness: 0.55, metalness: 0.25 });
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0xd8d5c9, roughness: 0.52, metalness: 0.08 });
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x3f4e56, roughness: 0.8 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc2933e, roughness: 0.28, metalness: 0.85 });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.55,
    roughness: 0.15,
  });

  const hullShape = new THREE.Shape();
  hullShape.moveTo(-7.0, -1.7);
  hullShape.lineTo(4.2, -1.7);
  hullShape.quadraticCurveTo(6.8, -1.1, 7.6, 0);
  hullShape.quadraticCurveTo(6.8, 1.1, 4.2, 1.7);
  hullShape.lineTo(-7.0, 1.7);
  hullShape.closePath();

  const hullGeo = new THREE.ExtrudeGeometry(hullShape, {
    depth: 1.85,
    bevelEnabled: true,
    bevelThickness: 0.18,
    bevelSize: 0.12,
    bevelSegments: 2,
  });
  hullGeo.rotateX(Math.PI / 2);
  hullGeo.translate(0, 1.2, 0);
  group.add(new THREE.Mesh(hullGeo, hullMat));

  const deck = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.16, 3.2), deckMat);
  deck.position.set(-0.8, 1.32, 0);
  group.add(deck);

  const nameMat = new THREE.MeshStandardMaterial({ map: textures.ferryNameTex, roughness: 0.45 });
  for (const side of [-1, 1]) {
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.55), nameMat);
    plate.position.set(0.6, 0.62, side * 1.84);
    if (side < 0) plate.rotation.y = Math.PI;
    group.add(plate);
  }

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.65, 2.5), cabinMat);
  cabin.position.set(-1.5, 2.2, 0);
  group.add(cabin);

  const winStrip = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.55, 2.54), windowMat);
  winStrip.position.set(-1.5, 2.35, 0);
  group.add(winStrip);

  // Raised Wheelhouse (open interior sides so optional player viewpoint looks forward cleanly!)
  const wheelhouseRoof = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.14, 2.2), cabinMat);
  wheelhouseRoof.position.set(1.2, 4.32, 0);
  const wheelhouseBulkhead = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.3, 2.15), cabinMat);
  wheelhouseBulkhead.position.set(-0.08, 3.65, 0);
  const bridgeGlassFront = new THREE.Mesh(
    new THREE.PlaneGeometry(2.05, 0.72),
    new THREE.MeshPhysicalMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false })
  );
  bridgeGlassFront.rotation.y = Math.PI / 2;
  bridgeGlassFront.position.set(2.45, 3.85, 0);
  group.add(wheelhouseRoof, wheelhouseBulkhead, bridgeGlassFront);

  // Clickable Horn Lever inside Wheelhouse
  const hornLever = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.12), brassMat);
  hornLever.position.set(2.1, 3.55, 0.48);
  group.add(hornLever);
  interactables.push({ mesh: hornLever, actionId: 'ferry_blow_horn', label: 'Sound Two-Blast Ferry Horn' });

  const meeraBridge = createMeeraCharacter();
  meeraBridge.group.scale.setScalar(0.85);
  meeraBridge.group.position.set(1.45, 3.22, -0.36);
  meeraBridge.group.rotation.y = Math.PI / 2;
  group.add(meeraBridge.group);

  const wheelhouseAnchor = new THREE.Object3D();
  wheelhouseAnchor.position.set(1.35, 3.92, 0.25);
  group.add(wheelhouseAnchor);
  const wheelhouseEyeWorld = new THREE.Vector3();

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 2.1, 8), cabinMat);
  mast.position.set(0.8, 5.2, 0);
  group.add(mast);

  const mastLight = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
  mastLight.position.set(0.8, 6.25, 0);
  const portLight = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  portLight.position.set(1.2, 4.1, -1.16);
  const stbdLight = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
  stbdLight.position.set(1.2, 4.1, 1.16);
  group.add(mastLight, portLight, stbdLight);

  for (const side of [-1, 1]) {
    const buoy = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.075, 8, 14), trimMat);
    buoy.position.set(-2.2, 2.1, side * 1.29);
    group.add(buoy);
  }

  const wakeGroup = new THREE.Group();
  const wakeMat = new THREE.MeshBasicMaterial({ color: 0xdbeafe, transparent: true, opacity: 0.35, depthWrite: false });
  for (let i = 0; i < 4; i++) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(3.5 + i * 1.6, 2.6 + i * 1.1), wakeMat);
    w.rotation.x = -Math.PI / 2;
    w.position.set(-8.8 - i * 3.2, 0.08, 0);
    wakeGroup.add(w);
  }
  group.add(wakeGroup);

  const passengersGroup = new THREE.Group();
  const passMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
  const passColors = [0x9f1239, 0x0f766e, 0xb45309, 0x1d4ed8, 0x4338ca];
  for (let i = 0; i < 5; i++) {
    const p = new THREE.Group();
    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, 0.72, 8),
      new THREE.MeshStandardMaterial({ color: passColors[i], roughness: 0.8 })
    );
    torso.position.y = 0.36;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), passMat);
    head.position.y = 0.84;
    p.add(torso, head);
    p.position.set(-4.0 + i * 1.15, 1.4, 1.42);
    passengersGroup.add(p);
  }
  passengersGroup.visible = false;
  group.add(passengersGroup);

  // Path from outer sea -> between North & South breakwaters -> moored cleanly alongside Vaanthurai Jetty!
  const rescueCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(74, 0, -10),
    new THREE.Vector3(56, 0, -7),
    new THREE.Vector3(41, 0, -3),
    new THREE.Vector3(33, 0, 4),
    new THREE.Vector3(32, 0, 15.8),
  ]);
  const tangentVec = new THREE.Vector3();

  const update = (state: GameState, time: number, dt: number) => {
    const stormScale = 1 - state.dawnMix * 0.75;

    if (state.phase === 'jetty_opening') {
      // Ferry departs across the outer mouth during Ch 1 jetty opening
      const departOffset = state.openingBellRung ? Math.min(28, state.openingElapsed * 4.2) : 0;
      group.position.set(42 + departOffset, 0, 14 - departOffset * 0.7);
      group.rotation.y = 0.55;
      wakeGroup.visible = true;
      passengersGroup.visible = false;
      meeraBridge.update(time, false, true);
    } else if (state.phase === 'rescue_sequence') {
      const t = THREE.MathUtils.clamp(state.rescueElapsed / RESCUE_SEQUENCE_DURATION, 0, 1);
      const pos = rescueCurve.getPointAt(t);
      rescueCurve.getTangentAt(t, tangentVec);
      group.position.copy(pos);
      const yaw = Math.atan2(-tangentVec.z, tangentVec.x);
      group.rotation.y = THREE.MathUtils.damp(group.rotation.y, yaw, 5, dt);
      wakeGroup.visible = true;
      passengersGroup.visible = false;
      meeraBridge.update(time, true, true);
    } else if (state.phase === 'dawn_epilogue' || state.phase === 'credits') {
      // Moored beside Jetty Head where Ch.1 opened
      group.position.set(32.5, 0, 15.8);
      group.rotation.y = -Math.PI * 0.55;
      wakeGroup.visible = false;
      passengersGroup.visible = true;
      meeraBridge.group.visible = false; // Meera stepped onto jetty!
    } else {
      meeraBridge.group.visible = true;
      // Visible out through East windows! Creeps slightly closer if Beat 1 caught, pauses outside E-4
      const holdX = state.chapter === 5 && state.crossingBeat >= 1 ? 62 : 70;
      group.position.set(holdX + Math.sin(time * 0.35) * 1.8, 0, -9 + Math.cos(time * 0.28) * 2.2);
      group.rotation.y = Math.PI + 0.14 + Math.sin(time * 0.35) * 0.06;
      wakeGroup.visible = true;
      passengersGroup.visible = false;
      meeraBridge.update(
        time,
        state.activeTransmission === 'meera_distress' || state.activeTransmission === 'meera_buoy',
        false
      );
    }

    group.position.y = Math.sin(time * 1.5) * 0.22 * stormScale;
    group.rotation.z = Math.sin(time * 1.15) * 0.04 * stormScale;
    group.rotation.x = Math.cos(time * 1.35) * 0.05 * stormScale;
    wheelhouseAnchor.getWorldPosition(wheelhouseEyeWorld);
  };

  return { group, meeraBridge, wakeGroup, passengersGroup, wheelhouseEyeWorld, interactables, update };
}
