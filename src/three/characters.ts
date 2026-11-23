import * as THREE from 'three';

export interface MuthuCharacter {
  group: THREE.Group;
  head: THREE.Group;
  torso: THREE.Group;
  rightArm: THREE.Group;
  leftArm: THREE.Group;
  eyelids: THREE.Mesh[];
  lanternProp: THREE.Group;
  keyProp: THREE.Mesh;
  update: (
    time: number,
    pose: 'jetty_lantern' | 'cottage_key' | 'dawn_stand' | 'hidden',
    actionFlag: boolean
  ) => void;
}

export interface MeeraCharacter {
  group: THREE.Group;
  head: THREE.Group;
  torso: THREE.Group;
  rightArm: THREE.Group;
  leftArm: THREE.Group;
  eyelids: THREE.Mesh[];
  helmWheel: THREE.Group;
  lanternHeld: THREE.Group;
  update: (
    time: number,
    transmitting: boolean,
    turning: boolean,
    ashoreMode?: boolean
  ) => void;
}

export interface KeeperGlovesRig {
  group: THREE.Group;
  leftGlove: THREE.Group;
  rightGlove: THREE.Group;
  triggerAction: (kind: 'turn' | 'press' | 'lever' | 'crank') => void;
  update: (dt: number) => void;
}

function buildDetailedHead(opts: {
  skinColor: number;
  hairColor: number;
  jawScaleX: number;
  jawScaleY: number;
  hasMoustache?: boolean;
  hasWoolCap?: boolean;
  hasBun?: boolean;
}): { head: THREE.Group; eyelids: THREE.Mesh[] } {
  const head = new THREE.Group();
  const eyelids: THREE.Mesh[] = [];

  const skinMat = new THREE.MeshStandardMaterial({
    color: opts.skinColor,
    roughness: 0.62,
    metalness: 0.02,
  });
  const lipMat = new THREE.MeshStandardMaterial({
    color: 0x5c3027,
    roughness: 0.55,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: opts.hairColor,
    roughness: 0.85,
    metalness: 0.04,
  });
  const scleraMat = new THREE.MeshStandardMaterial({ color: 0xebe6dc, roughness: 0.3 });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x1b1512, roughness: 0.2 });

  // Neck cylinder bridging collar cleanly
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.056, 0.09, 12), skinMat);
  neck.position.set(0, -0.095, -0.005);
  head.add(neck);

  // Upper cranium + sculpted jaw & cheekbone silhouette
  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.112, 20, 16), skinMat);
  cranium.scale.set(opts.jawScaleX, opts.jawScaleY, 0.98);
  head.add(cranium);

  const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.088, 16, 12), skinMat);
  jaw.position.set(0, -0.042, 0.02);
  jaw.scale.set(opts.jawScaleX * 0.88, 0.72, 0.86);
  head.add(jaw);

  // Nose bridge + tip + nostrils
  const noseBridge = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.042, 0.026), skinMat);
  noseBridge.position.set(0, 0.0, 0.102);
  noseBridge.rotation.x = -0.22;
  head.add(noseBridge);
  const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 8), skinMat);
  noseTip.position.set(0, -0.016, 0.114);
  head.add(noseTip);

  // Sculpted eyes, pupils, eyelids & brows
  const browMat = new THREE.MeshStandardMaterial({
    color: opts.hasMoustache ? 0x6b727a : 0x181311,
    roughness: 0.85,
  });
  for (const side of [-1, 1]) {
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), scleraMat);
    sclera.scale.set(1.15, 0.85, 0.65);
    sclera.position.set(side * 0.036, 0.015, 0.094);
    head.add(sclera);

    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 10, 8), irisMat);
    iris.position.set(side * 0.036, 0.015, 0.101);
    head.add(iris);

    // Upper eyelid that blinks smoothly
    const lid = new THREE.Mesh(
      new THREE.SphereGeometry(0.0155, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55),
      skinMat
    );
    lid.position.set(side * 0.036, 0.017, 0.095);
    lid.rotation.x = -0.75; // Open resting angle
    head.add(lid);
    eyelids.push(lid);

    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.008, 0.015), browMat);
    brow.position.set(side * 0.036, 0.036, 0.098);
    brow.rotation.z = side * (opts.hasMoustache ? -0.08 : -0.04);
    head.add(brow);

    // Sculpted ears
    const ear = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.006, 6, 12), skinMat);
    ear.position.set(side * 0.104 * opts.jawScaleX, 0.0, -0.008);
    ear.rotation.y = Math.PI / 2;
    head.add(ear);
  }

  // Distinct upper & lower lips
  const upperLip = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.006, 0.014), lipMat);
  upperLip.position.set(0, -0.046, 0.096);
  const lowerLip = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.007, 0.014), lipMat);
  lowerLip.position.set(0, -0.053, 0.094);
  head.add(upperLip, lowerLip);

  if (opts.hasMoustache) {
    const stacheMat = new THREE.MeshStandardMaterial({ color: 0xa4acb5, roughness: 0.88 });
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.CapsuleGeometry(0.007, 0.022, 4, 8), stacheMat);
      wing.position.set(side * 0.017, -0.034, 0.103);
      wing.rotation.z = side * 1.25;
      head.add(wing);
    }
  }

  if (opts.hasWoolCap) {
    const capMat = new THREE.MeshStandardMaterial({ color: 0x354049, roughness: 0.94 });
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.116, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.52),
      capMat
    );
    dome.scale.set(opts.jawScaleX, 1, 1);
    dome.position.y = 0.038;
    head.add(dome);

    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.108, 0.02, 8, 22), capMat);
    cuff.rotation.x = Math.PI / 2;
    cuff.scale.set(opts.jawScaleX, 1, 1);
    cuff.position.y = 0.054;
    head.add(cuff);
  } else {
    const hairShell = new THREE.Mesh(
      new THREE.SphereGeometry(0.117, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hairMat
    );
    hairShell.scale.set(opts.jawScaleX, 1, 1);
    hairShell.position.set(0, 0.01, -0.01);
    hairShell.rotation.x = -0.18;
    head.add(hairShell);

    if (opts.hasBun) {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.044, 12, 10), hairMat);
      bun.position.set(0, -0.012, -0.122);
      head.add(bun);
    }
  }

  return { head, eyelids };
}

function buildMiniBrassLantern(): THREE.Group {
  const g = new THREE.Group();
  const brass = new THREE.MeshStandardMaterial({ color: 0xc2933e, roughness: 0.28, metalness: 0.85 });
  const glass = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.5,
    roughness: 0.15,
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.088, 0.05, 12), brass);
  const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 12), glass);
  cage.position.y = 0.095;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.055, 12), brass);
  cap.position.y = 0.19;
  const bail = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.008, 6, 14, Math.PI), brass);
  bail.position.y = 0.21;
  g.add(base, cage, cap, bail);
  return g;
}

export function createMuthuCharacter(): MuthuCharacter {
  const group = new THREE.Group();

  const coatMat = new THREE.MeshStandardMaterial({ color: 0x4b5842, roughness: 0.72, metalness: 0.04 });
  const coatDarkMat = new THREE.MeshStandardMaterial({ color: 0x333e2e, roughness: 0.78 });
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x2c2219, roughness: 0.65 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc2933e, roughness: 0.3, metalness: 0.85 });
  const trousersMat = new THREE.MeshStandardMaterial({ color: 0x22292d, roughness: 0.86 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0x7a4f38, roughness: 0.62 });

  // Grounded legs & heavy rubber boots (y = 0)
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.066, 0.78, 12), trousersMat);
    leg.position.set(side * 0.105, 0.42, 0);
    group.add(leg);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.09, 0.21), coatDarkMat);
    boot.position.set(side * 0.105, 0.045, 0.03);
    group.add(boot);
  }

  // Torso group for breathing & posture asymmetry (stiff left shoulder!)
  const torso = new THREE.Group();
  torso.position.y = 0.82;
  group.add(torso);

  const coatBody = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.235, 0.72, 16), coatMat);
  coatBody.position.y = 0.34;
  coatBody.scale.set(1.04, 1, 0.78);
  torso.add(coatBody);

  const waistBelt = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.21, 0.055, 16), beltMat);
  waistBelt.position.y = 0.16;
  waistBelt.scale.set(1.05, 1, 0.8);
  torso.add(waistBelt);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.045, 0.02), brassMat);
  buckle.position.set(0, 0.16, 0.17);
  torso.add(buckle);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.032, 8, 16), coatDarkMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.72;
  torso.add(collar);

  const pocketL = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.1, 0.028), coatDarkMat);
  pocketL.position.set(-0.095, 0.24, 0.17);
  const pocketR = pocketL.clone();
  pocketR.position.x = 0.095;
  torso.add(pocketL, pocketR);

  // Narrower, weathered face silhouette
  const { head, eyelids } = buildDetailedHead({
    skinColor: 0x7a4f38,
    hairColor: 0x808790,
    jawScaleX: 0.88,
    jawScaleY: 1.09,
    hasMoustache: true,
    hasWoolCap: true,
  });
  head.position.set(0, 0.84, 0.01);
  torso.add(head);

  // Articulated arms with hands & fingers (note left shoulder slightly elevated/stiff)
  const makeArm = (side: -1 | 1) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.215, side === -1 ? 0.655 : 0.64, 0);
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), coatMat);
    arm.add(shoulder);
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.048, 0.28, 10), coatMat);
    upper.position.y = -0.14;
    arm.add(upper);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.044, 0.26, 10), coatDarkMat);
    cuff.position.set(0, -0.35, 0.07);
    cuff.rotation.x = -0.45;
    arm.add(cuff);
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.05, 0.058), skinMat);
    palm.position.set(0, -0.47, 0.15);
    arm.add(palm);
    for (let f = 0; f < 3; f++) {
      const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.007, 0.024, 3, 5), skinMat);
      finger.position.set((-0.012 + f * 0.012) * side, -0.495, 0.175);
      finger.rotation.x = Math.PI * 0.4;
      arm.add(finger);
    }
    return arm;
  };

  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);
  torso.add(leftArm, rightArm);

  // Brass storm lantern Muthu fastens in Chapter 1
  const lanternProp = buildMiniBrassLantern();
  lanternProp.position.set(0, -0.48, 0.22);
  rightArm.add(lanternProp);

  // Boathouse brass key Muthu holds out in Chapter 2
  const keyProp = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.006, 6, 12), brassMat);
  keyProp.position.set(0, -0.47, 0.2);
  keyProp.visible = false;
  rightArm.add(keyProp);

  const update = (
    time: number,
    pose: 'jetty_lantern' | 'cottage_key' | 'dawn_stand' | 'hidden',
    actionFlag: boolean
  ) => {
    group.visible = pose !== 'hidden';
    if (!group.visible) return;

    // Natural breathing + blink every ~4.2s
    torso.position.y = 0.82 + Math.sin(time * 1.9) * 0.007;
    torso.rotation.z = Math.sin(time * 0.9) * 0.018 + 0.02; // Slight stiffness asymmetry
    const blinkCycle = time % 4.2;
    const blinkAmt = blinkCycle > 4.02 ? Math.sin(((blinkCycle - 4.02) / 0.18) * Math.PI) : 0;
    eyelids.forEach((lid) => {
      lid.rotation.x = THREE.MathUtils.lerp(-0.75, 0.12, blinkAmt);
    });

    if (pose === 'jetty_lantern') {
      lanternProp.visible = !actionFlag;
      keyProp.visible = false;
      // Right arm extended fastening lantern at arm's length onto jetty post; stiff left arm lowered
      rightArm.rotation.x = actionFlag ? -0.3 : -1.05 + Math.sin(time * 2.4) * 0.06;
      rightArm.rotation.z = -0.12;
      leftArm.rotation.x = -0.18;
      leftArm.rotation.z = 0.1;
      head.rotation.y = Math.sin(time * 0.8) * 0.14;
      head.rotation.x = 0.08;
    } else if (pose === 'cottage_key') {
      lanternProp.visible = false;
      keyProp.visible = !actionFlag;
      rightArm.rotation.x = actionFlag ? -0.25 : -0.82 + Math.sin(time * 2) * 0.05;
      leftArm.rotation.x = -0.22;
      head.rotation.y = Math.sin(time * 0.9) * 0.12;
      head.rotation.x = -0.02;
    } else {
      lanternProp.visible = false;
      keyProp.visible = false;
      rightArm.rotation.x = -0.18 + Math.sin(time * 1.2) * 0.04;
      leftArm.rotation.x = -0.16;
      head.rotation.y = Math.sin(time * 0.6) * 0.15;
    }
  };

  return { group, head, torso, rightArm, leftArm, eyelids, lanternProp, keyProp, update };
}

export function createMeeraCharacter(): MeeraCharacter {
  const group = new THREE.Group();

  const jacketMat = new THREE.MeshStandardMaterial({ color: 0x1a2e46, roughness: 0.58, metalness: 0.08 });
  const trousersMat = new THREE.MeshStandardMaterial({ color: 0x16202b, roughness: 0.82 });
  const reflectMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    emissive: 0x713f12,
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.25,
  });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0x87563c, roughness: 0.6 });
  const radioMat = new THREE.MeshStandardMaterial({ color: 0x161c22, roughness: 0.4, metalness: 0.35 });

  // Full legs/boots (hidden only if waist-up bridge portrait crops it below)
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.058, 0.72, 10), trousersMat);
    leg.position.set(side * 0.095, -0.36, 0);
    group.add(leg);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.08, 0.19), radioMat);
    boot.position.set(side * 0.095, -0.71, 0.025);
    group.add(boot);
  }

  // Torso (waist at y = 0 for clean bridge & jetty anchoring)
  const torso = new THREE.Group();
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.185, 0.58, 16), jacketMat);
  chest.position.y = 0.29;
  chest.scale.set(1.05, 1, 0.72);
  torso.add(chest);

  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.18, 0.052, 16), reflectMat);
  band.position.y = 0.26;
  band.scale.set(1.06, 1, 0.74);
  torso.add(band);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.026, 8, 16), jacketMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.58;
  torso.add(collar);

  // Broader cheekbone face silhouette + hair bun
  const { head, eyelids } = buildDetailedHead({
    skinColor: 0x87563c,
    hairColor: 0x171412,
    jawScaleX: 0.96,
    jawScaleY: 1.03,
    hasBun: true,
  });
  head.position.set(0, 0.72, 0.01);
  torso.add(head);

  // Right arm (VHF radio OR Muthu's storm lantern ashore)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.2, 0.52, 0.02);
  const rUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.25, 10), jacketMat);
  rUpper.position.y = -0.12;
  rightArm.add(rUpper);
  const rBand = new THREE.Mesh(new THREE.CylinderGeometry(0.049, 0.049, 0.035, 10), reflectMat);
  rBand.position.y = -0.16;
  rightArm.add(rBand);
  const rLower = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.036, 0.24, 10), jacketMat);
  rLower.position.set(-0.02, -0.28, 0.1);
  rLower.rotation.x = -0.85;
  rightArm.add(rLower);
  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 8), skinMat);
  rHand.position.set(-0.03, -0.34, 0.2);
  rightArm.add(rHand);

  const handset = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.11, 0.032), radioMat);
  handset.position.set(-0.03, -0.3, 0.23);
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.006, 0.12, 6), radioMat);
  antenna.position.set(-0.018, -0.21, 0.23);
  rightArm.add(handset, antenna);

  const lanternHeld = buildMiniBrassLantern();
  lanternHeld.position.set(-0.03, -0.45, 0.24);
  lanternHeld.visible = false;
  rightArm.add(lanternHeld);

  torso.add(rightArm);

  // Left arm gripping helm wheel
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.2, 0.52, 0.02);
  const lUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.25, 10), jacketMat);
  lUpper.position.y = -0.12;
  leftArm.add(lUpper);
  const lLower = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.036, 0.25, 10), jacketMat);
  lLower.position.set(0.03, -0.25, 0.12);
  lLower.rotation.x = -0.95;
  leftArm.add(lLower);
  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 8), skinMat);
  lHand.position.set(0.04, -0.31, 0.22);
  leftArm.add(lHand);
  torso.add(leftArm);

  group.add(torso);

  // Helm wheel (hidden when ashore)
  const helmWheel = new THREE.Group();
  helmWheel.position.set(-0.08, 0.24, 0.34);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x5d3d24, roughness: 0.55, metalness: 0.2 });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.018, 8, 20), wheelMat);
  helmWheel.add(rim);
  for (let i = 0; i < 6; i++) {
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.36, 6), wheelMat);
    spoke.rotation.z = (i * Math.PI) / 3;
    helmWheel.add(spoke);
  }
  group.add(helmWheel);

  const update = (time: number, transmitting: boolean, turning: boolean, ashoreMode = false) => {
    torso.position.y = Math.sin(time * 2.1) * 0.006;
    const blinkCycle = (time + 1.7) % 3.8;
    const blinkAmt = blinkCycle > 3.62 ? Math.sin(((blinkCycle - 3.62) / 0.18) * Math.PI) : 0;
    eyelids.forEach((lid) => {
      lid.rotation.x = THREE.MathUtils.lerp(-0.75, 0.12, blinkAmt);
    });

    if (ashoreMode) {
      helmWheel.visible = false;
      handset.visible = false;
      antenna.visible = false;
      lanternHeld.visible = true;
      torso.rotation.z = Math.sin(time * 1.1) * 0.018;
      rightArm.rotation.x = -0.68 + Math.sin(time * 1.5) * 0.04;
      rightArm.rotation.z = -0.05;
      leftArm.rotation.x = -0.22;
      head.rotation.y = Math.sin(time * 0.8) * 0.16;
      return;
    }

    helmWheel.visible = true;
    handset.visible = true;
    antenna.visible = true;
    lanternHeld.visible = false;

    const sway = Math.sin(time * 1.4) * 0.04;
    torso.rotation.z = sway;

    if (transmitting) {
      const lift = 0.5 + 0.5 * Math.sin(time * 2.5);
      rightArm.rotation.x = THREE.MathUtils.lerp(-0.45, -0.82, 0.7 + lift * 0.3);
      rightArm.rotation.z = 0.18;
      head.rotation.y = Math.sin(time * 1.2) * 0.28;
      head.rotation.x = -0.06;
    } else {
      rightArm.rotation.x = -0.25;
      rightArm.rotation.z = 0.05;
      head.rotation.y = Math.sin(time * 0.7) * 0.18;
      head.rotation.x = 0;
    }

    if (turning) {
      helmWheel.rotation.z = Math.sin(time * 1.8) * 0.45;
      leftArm.rotation.x = -0.35 + Math.sin(time * 1.8) * 0.12;
    } else {
      helmWheel.rotation.z = Math.sin(time * 0.9) * 0.12;
      leftArm.rotation.x = -0.28;
    }
  };

  return { group, head, torso, rightArm, leftArm, eyelids, helmWheel, lanternHeld, update };
}

export function createKeeperGloves(): KeeperGlovesRig {
  const group = new THREE.Group();
  const rubberMat = new THREE.MeshStandardMaterial({ color: 0x20353b, roughness: 0.62, metalness: 0.08 });
  const cuffMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7, metalness: 0.05 });

  const makeGlove = (side: -1 | 1) => {
    const g = new THREE.Group();
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.04, 0.09, 10), cuffMat);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.z = 0.04;
    g.add(cuff);

    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.028, 0.085), rubberMat);
    palm.position.z = -0.03;
    g.add(palm);

    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.011, 0.032, 4, 6), rubberMat);
    thumb.position.set(-side * 0.042, 0.005, -0.035);
    thumb.rotation.set(Math.PI / 2.4, 0, side * 0.45);
    g.add(thumb);

    for (let f = 0; f < 4; f++) {
      const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.0085, 0.042, 4, 6), rubberMat);
      finger.position.set((-0.024 + f * 0.016) * side, -0.004, -0.09);
      finger.rotation.x = Math.PI / 2.1;
      g.add(finger);
    }

    g.position.set(side * 0.34, -0.28, -0.34);
    g.rotation.set(0.25, -side * 0.25, 0);
    return g;
  };

  const leftGlove = makeGlove(-1);
  const rightGlove = makeGlove(1);
  group.add(leftGlove, rightGlove);

  let actionTimer = 0;
  let actionKind: 'turn' | 'press' | 'lever' | 'crank' = 'press';

  const triggerAction = (kind: 'turn' | 'press' | 'lever' | 'crank') => {
    actionKind = kind;
    actionTimer = 0.48;
  };

  const update = (dt: number) => {
    if (actionTimer > 0) {
      actionTimer = Math.max(0, actionTimer - dt);
      const p = Math.sin((actionTimer / 0.48) * Math.PI);
      rightGlove.position.set(
        THREE.MathUtils.lerp(0.34, 0.14, p),
        THREE.MathUtils.lerp(-0.28, -0.14, p),
        THREE.MathUtils.lerp(-0.34, -0.48, p)
      );
      if (actionKind === 'turn' || actionKind === 'crank') {
        rightGlove.rotation.z = p * 0.75;
      } else if (actionKind === 'lever') {
        rightGlove.position.y = THREE.MathUtils.lerp(-0.14, -0.24, 1 - p);
      } else {
        rightGlove.rotation.z = 0;
      }
      if (actionKind === 'crank') {
        leftGlove.position.set(
          THREE.MathUtils.lerp(-0.34, -0.16, p),
          THREE.MathUtils.lerp(-0.28, -0.17, p),
          THREE.MathUtils.lerp(-0.34, -0.46, p)
        );
      }
    } else {
      rightGlove.position.x = THREE.MathUtils.damp(rightGlove.position.x, 0.34, 8, dt);
      rightGlove.position.y = THREE.MathUtils.damp(rightGlove.position.y, -0.28, 8, dt);
      rightGlove.position.z = THREE.MathUtils.damp(rightGlove.position.z, -0.34, 8, dt);
      rightGlove.rotation.z = THREE.MathUtils.damp(rightGlove.rotation.z, 0, 8, dt);

      leftGlove.position.x = THREE.MathUtils.damp(leftGlove.position.x, -0.34, 8, dt);
      leftGlove.position.y = THREE.MathUtils.damp(leftGlove.position.y, -0.28, 8, dt);
      leftGlove.position.z = THREE.MathUtils.damp(leftGlove.position.z, -0.34, 8, dt);
    }
  };

  return { group, leftGlove, rightGlove, triggerAction, update };
}
