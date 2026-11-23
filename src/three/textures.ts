import * as THREE from 'three';

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

export interface MaterialTextures {
  stoneAlbedo: THREE.CanvasTexture;
  stoneBump: THREE.CanvasTexture;
  stoneRoughness: THREE.CanvasTexture;
  steelAlbedo: THREE.CanvasTexture;
  woodAlbedo: THREE.CanvasTexture;
  woodRoughness: THREE.CanvasTexture;
  tinRoofAlbedo: THREE.CanvasTexture;
  grateAlbedo: THREE.CanvasTexture;
  grateAlpha: THREE.CanvasTexture;
  radioScale: THREE.CanvasTexture;
  speakerGrille: THREE.CanvasTexture;
  logbookTex: THREE.CanvasTexture;
  chartTexDark: THREE.CanvasTexture;
  chartTexLit: THREE.CanvasTexture;
  chartStampedTex: THREE.CanvasTexture;
  surveyOverlayTex: THREE.CanvasTexture;
  fuseDiagramTex: THREE.CanvasTexture;
  bearingCardTex: THREE.CanvasTexture;
  ferryNameTex: THREE.CanvasTexture;
  tideScaleTex: THREE.CanvasTexture;
  cardE4Tex: THREE.CanvasTexture;
  cardD2Tex: THREE.CanvasTexture;
  plotBoardTex: THREE.CanvasTexture;
  dispose: () => void;
}

export function createProceduralTextures(maxAnisotropy: number): MaterialTextures {
  const prepColor = (tex: THREE.CanvasTexture, repX = 1, repY = 1, clamp = false) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    tex.wrapT = clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    tex.repeat.set(repX, repY);
    tex.anisotropy = maxAnisotropy;
    tex.needsUpdate = true;
    return tex;
  };
  const prepData = (tex: THREE.CanvasTexture, repX = 1, repY = 1, clamp = false) => {
    tex.wrapS = clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    tex.wrapT = clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    tex.repeat.set(repX, repY);
    tex.anisotropy = maxAnisotropy;
    tex.needsUpdate = true;
    return tex;
  };

  // 1. Wet Charcoal Basalt Masonry (Albedo + Bump + Roughness)
  const [stoneC, sCtx] = makeCanvas(512, 512);
  const [stoneBC, sbCtx] = makeCanvas(512, 512);
  const [stoneRC, srCtx] = makeCanvas(512, 512);
  sCtx.fillStyle = '#1f2830';
  sCtx.fillRect(0, 0, 512, 512);
  sbCtx.fillStyle = '#505050';
  sbCtx.fillRect(0, 0, 512, 512);
  srCtx.fillStyle = '#d4d4d4';
  srCtx.fillRect(0, 0, 512, 512);

  const rows = 8;
  const rowH = 512 / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    const cols = 4;
    const offset = (r % 2) * (512 / cols / 2);
    for (let c = -1; c <= cols; c++) {
      const x = c * (512 / cols) + offset;
      const w = 512 / cols - 6;
      const h = rowH - 6;
      const shade = 35 + ((r * 13 + c * 29) % 20);
      sCtx.fillStyle = `rgb(${shade}, ${shade + 7}, ${shade + 13})`;
      sCtx.fillRect(x + 3, y + 3, w, h);

      // Subtle stone highlight edge
      sCtx.fillStyle = 'rgba(130, 155, 175, 0.12)';
      sCtx.fillRect(x + 4, y + 4, w - 2, 4);

      const bVal = 155 + ((r * 17 + c * 23) % 58);
      sbCtx.fillStyle = `rgb(${bVal},${bVal},${bVal})`;
      sbCtx.fillRect(x + 4, y + 4, w - 2, h - 2);

      // Wet glistening lower half vs drier crown
      const rVal = 120 + ((r * 19 + c * 11) % 70);
      srCtx.fillStyle = `rgb(${rVal},${rVal},${rVal})`;
      srCtx.fillRect(x + 4, y + 4, w - 2, h - 2);
    }
  }
  for (let i = 0; i < 75; i++) {
    const sx = (i * 73) % 512;
    const sy = (i * 41) % 512;
    sCtx.fillStyle = 'rgba(14, 24, 32, 0.28)';
    sCtx.fillRect(sx, sy, 6 + (i % 8), 35 + (i % 50));
    srCtx.fillStyle = 'rgba(65, 65, 65, 0.55)'; // Wet streaks are glossier
    srCtx.fillRect(sx, sy, 6 + (i % 8), 35 + (i % 50));
  }
  const stoneAlbedo = prepColor(new THREE.CanvasTexture(stoneC), 4, 3);
  const stoneBump = prepData(new THREE.CanvasTexture(stoneBC), 4, 3);
  const stoneRoughness = prepData(new THREE.CanvasTexture(stoneRC), 4, 3);

  // 2. Sea-green painted industrial steel
  const [steelC, stCtx] = makeCanvas(256, 256);
  stCtx.fillStyle = '#2d4b4a';
  stCtx.fillRect(0, 0, 256, 256);
  stCtx.strokeStyle = '#1b3131';
  stCtx.lineWidth = 4;
  stCtx.strokeRect(4, 4, 248, 248);
  for (let i = 0; i < 18; i++) {
    stCtx.fillStyle = 'rgba(180, 140, 90, 0.08)';
    stCtx.fillRect((i * 37) % 240, (i * 53) % 240, 18, 8);
  }
  for (let x = 20; x <= 236; x += 54) {
    for (const y of [16, 240]) {
      stCtx.fillStyle = '#537a76';
      stCtx.beginPath();
      stCtx.arc(x, y, 4, 0, Math.PI * 2);
      stCtx.fill();
    }
  }
  const steelAlbedo = prepColor(new THREE.CanvasTexture(steelC), 2, 2);

  // 3. Weathered Teak Timber Planks + Worn-Edge Roughness
  const [woodC, wCtx] = makeCanvas(256, 256);
  const [woodRC, wrCtx] = makeCanvas(256, 256);
  wCtx.fillStyle = '#4f3827';
  wCtx.fillRect(0, 0, 256, 256);
  wrCtx.fillStyle = '#c8c8c8';
  wrCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 42; i++) {
    wCtx.fillStyle = i % 2 === 0 ? 'rgba(32,20,12,0.22)' : 'rgba(115,82,55,0.18)';
    wCtx.fillRect(0, i * 6, 256, 3);
    wrCtx.fillStyle = i % 3 === 0 ? '#969696' : '#dcdcdc';
    wrCtx.fillRect(0, i * 6, 256, 2);
  }
  wCtx.strokeStyle = '#24160d';
  wCtx.lineWidth = 3;
  wCtx.beginPath();
  wCtx.moveTo(0, 85);
  wCtx.lineTo(256, 85);
  wCtx.moveTo(0, 170);
  wCtx.lineTo(256, 170);
  wCtx.stroke();
  const woodAlbedo = prepColor(new THREE.CanvasTexture(woodC), 2, 2);
  const woodRoughness = prepData(new THREE.CanvasTexture(woodRC), 2, 2);

  // 3b. Blue Corrugated Tin Boathouse Roof
  const [tinC, tCtx] = makeCanvas(256, 256);
  tCtx.fillStyle = '#255372';
  tCtx.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 16) {
    tCtx.fillStyle = 'rgba(255,255,255,0.12)';
    tCtx.fillRect(x, 0, 6, 256);
    tCtx.fillStyle = 'rgba(8,20,30,0.32)';
    tCtx.fillRect(x + 8, 0, 6, 256);
  }
  tCtx.fillStyle = 'rgba(130, 85, 50, 0.2)';
  tCtx.fillRect(20, 40, 44, 18);
  tCtx.fillRect(150, 160, 52, 22);
  const tinRoofAlbedo = prepColor(new THREE.CanvasTexture(tinC), 4, 2);

  // 4. Grated steel floor
  const [grateC, gCtx] = makeCanvas(128, 128);
  const [grateAC, gaCtx] = makeCanvas(128, 128);
  gCtx.fillStyle = '#334047';
  gCtx.fillRect(0, 0, 128, 128);
  gaCtx.fillStyle = '#ffffff';
  gaCtx.fillRect(0, 0, 128, 128);
  for (let x = 8; x < 128; x += 16) {
    for (let y = 8; y < 128; y += 16) {
      gCtx.fillStyle = '#13181c';
      gCtx.fillRect(x, y, 10, 10);
      gaCtx.fillStyle = '#444444';
      gaCtx.fillRect(x, y, 10, 10);
    }
  }
  const grateAlbedo = prepColor(new THREE.CanvasTexture(grateC), 6, 6);
  const grateAlpha = prepData(new THREE.CanvasTexture(grateAC), 6, 6);

  // 5. Radio frequency scale (CH 10 - CH 20)
  const [radC, rCtx] = makeCanvas(512, 160);
  rCtx.fillStyle = '#12181c';
  rCtx.fillRect(0, 0, 512, 160);
  rCtx.strokeStyle = '#d99a38';
  rCtx.lineWidth = 3;
  rCtx.strokeRect(8, 8, 496, 144);
  rCtx.fillStyle = '#f2d399';
  rCtx.font = 'bold 20px monospace';
  rCtx.textAlign = 'center';
  rCtx.fillText('VHF MARINE BAND · VAANTHURAI', 256, 36);
  for (let ch = 10; ch <= 20; ch++) {
    const x = 44 + ((ch - 10) / 10) * 424;
    const isTarget = ch === 16;
    rCtx.strokeStyle = isTarget ? '#f59e0b' : '#9fb3bf';
    rCtx.lineWidth = isTarget ? 4 : 2;
    rCtx.beginPath();
    rCtx.moveTo(x, 68);
    rCtx.lineTo(x, isTarget ? 105 : 94);
    rCtx.stroke();
    rCtx.fillStyle = isTarget ? '#fbbf24' : '#cbd5e1';
    rCtx.font = isTarget ? 'bold 24px monospace' : '18px monospace';
    rCtx.fillText(`${ch}`, x, 134);
  }
  const radioScale = prepColor(new THREE.CanvasTexture(radC), 1, 1, true);

  // 6. Speaker grille
  const [spkC, spCtx] = makeCanvas(256, 256);
  spCtx.fillStyle = '#1d272b';
  spCtx.fillRect(0, 0, 256, 256);
  for (let y = 18; y < 240; y += 22) {
    for (let x = 18; x < 240; x += 22) {
      spCtx.fillStyle = '#090d10';
      spCtx.beginPath();
      spCtx.arc(x, y, 6.5, 0, Math.PI * 2);
      spCtx.fill();
    }
  }
  const speakerGrille = prepColor(new THREE.CanvasTexture(spkC));

  // 7. Desk Logbook
  const [logC, lCtx] = makeCanvas(512, 360);
  lCtx.fillStyle = '#ebe1c8';
  lCtx.fillRect(0, 0, 512, 360);
  lCtx.strokeStyle = '#9ea8b0';
  lCtx.lineWidth = 2;
  for (let y = 58; y < 340; y += 34) {
    lCtx.beginPath();
    lCtx.moveTo(28, y);
    lCtx.lineTo(484, y);
    lCtx.stroke();
  }
  lCtx.fillStyle = '#232b32';
  lCtx.font = 'bold 22px Georgia, serif';
  lCtx.fillText('VAANTHURAI LIGHT — WATCH LOG', 28, 42);
  lCtx.font = '18px Georgia, serif';
  lCtx.fillStyle = '#334155';
  lCtx.fillText('21:30 — Jetty storm lantern fastened. Thendral out.', 28, 86);
  lCtx.fillText('21:55 — Squall surge; check CH 16 distress band.', 28, 120);
  lCtx.fillStyle = '#991b1b';
  lCtx.font = 'bold 22px monospace';
  lCtx.fillText('OBSERVATION SKETCH: 3 LIGHTS EAST', 28, 188);
  lCtx.font = '17px monospace';
  lCtx.fillText('North Red + South Green + 3RD DRIFTING?', 28, 224);
  lCtx.fillStyle = '#334155';
  lCtx.font = 'italic 18px Georgia, serif';
  lCtx.fillText('"Compare with old cottage survey." — Muthu', 28, 290);
  const logbookTex = prepColor(new THREE.CanvasTexture(logC), 1, 1, true);

  // 8. Coastal Charts (Dark, Lit, Stamped)
  const makeChart = (mode: 'dark' | 'lit' | 'stamped') => {
    const [c, ctx] = makeCanvas(512, 384);
    ctx.fillStyle = mode === 'dark' ? '#cfc5aa' : '#ebe2c7';
    ctx.fillRect(0, 0, 512, 384);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, 488, 360);

    // Headland, Cottage, Boathouse, Jetty
    ctx.fillStyle = '#9b8e72';
    ctx.beginPath();
    ctx.moveTo(12, 372);
    ctx.lineTo(145, 295);
    ctx.lineTo(175, 195);
    ctx.lineTo(130, 120);
    ctx.lineTo(12, 85);
    ctx.closePath();
    ctx.fill();

    // Registration Marks for Survey Overlay (Tower circle + Boathouse square)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(138, 190, 14, 0, Math.PI * 2); // Tower mark
    ctx.stroke();
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(156, 250, 20, 16); // Blue Boathouse mark

    // Breakwaters
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(195, 145);
    ctx.lineTo(315, 125);
    ctx.moveTo(185, 255);
    ctx.lineTo(300, 240);
    ctx.stroke();

    // East channel bearing line
    ctx.strokeStyle = mode === 'dark' ? '#64748b' : '#d97706';
    ctx.lineWidth = mode === 'dark' ? 2 : 5;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.moveTo(138, 190);
    ctx.lineTo(475, 155);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 19px Georgia, serif';
    ctx.fillText('VAANTHURAI HARBOR SURVEY', 190, 48);
    ctx.font = '15px monospace';
    ctx.fillText('TOWER ○', 52, 185);
    ctx.fillText('BOATHOUSE □', 32, 265);
    ctx.fillText('NORTH BREAKWATER', 200, 112);
    ctx.fillText('SOUTH BREAKWATER', 195, 282);

    if (mode === 'lit') {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(218, 66, 248, 36);
      ctx.fillStyle = '#fffbeb';
      ctx.font = 'bold 21px monospace';
      ctx.fillText('CHANNEL: 072° E', 238, 91);
    }

    if (mode === 'stamped') {
      ctx.save();
      ctx.translate(345, 215);
      ctx.rotate(-0.18);
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 5;
      ctx.strokeRect(-115, -36, 230, 72);
      ctx.fillStyle = 'rgba(185, 28, 28, 0.12)';
      ctx.fillRect(-115, -36, 230, 72);
      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BUOY E-4 ADRIFT', 0, -6);
      ctx.font = 'bold 18px monospace';
      ctx.fillText('072° FIXED GATE OK', 0, 20);
      ctx.restore();
    }

    return prepColor(new THREE.CanvasTexture(c), 1, 1, true);
  };
  const chartTexDark = makeChart('dark');
  const chartTexLit = makeChart('lit');
  const chartStampedTex = makeChart('stamped');

  // 8b. Transparent Hydrographic Survey Overlay (alpha texture!)
  const [ovC, ovCtx] = makeCanvas(512, 384);
  ovCtx.clearRect(0, 0, 512, 384);
  ovCtx.fillStyle = 'rgba(218, 238, 248, 0.24)';
  ovCtx.fillRect(10, 10, 492, 364);
  ovCtx.strokeStyle = 'rgba(220, 38, 38, 0.92)';
  ovCtx.lineWidth = 3;
  ovCtx.strokeRect(10, 10, 492, 364);
  // Crosshair registration ring on Tower & Boathouse
  ovCtx.beginPath();
  ovCtx.arc(138, 190, 16, 0, Math.PI * 2);
  ovCtx.stroke();
  ovCtx.strokeRect(154, 248, 24, 20);
  // Revealed East Maintenance Slipway + Former Buoy E-4 station
  ovCtx.strokeStyle = '#f59e0b';
  ovCtx.lineWidth = 4;
  ovCtx.setLineDash([7, 5]);
  ovCtx.beginPath();
  ovCtx.moveTo(176, 258);
  ovCtx.lineTo(255, 272);
  ovCtx.stroke();
  ovCtx.setLineDash([]);
  ovCtx.fillStyle = '#fbbf24';
  ovCtx.beginPath();
  ovCtx.arc(415, 208, 10, 0, Math.PI * 2);
  ovCtx.fill();
  ovCtx.fillStyle = '#fef3c7';
  ovCtx.font = 'bold 16px monospace';
  ovCtx.fillText('1998 SLIPWAY SURVEY', 195, 300);
  ovCtx.fillText('FORMER BUOY E-4 (2x FLASH)', 260, 196);
  const surveyOverlayTex = prepColor(new THREE.CanvasTexture(ovC), 1, 1, true);

  // 9. Fuse Cabinet Engraved Diagram
  const [diagC, dCtx] = makeCanvas(512, 256);
  dCtx.fillStyle = '#1f2933';
  dCtx.fillRect(0, 0, 512, 256);
  dCtx.strokeStyle = '#d4a34a';
  dCtx.lineWidth = 4;
  dCtx.strokeRect(10, 10, 492, 236);
  dCtx.fillStyle = '#f3d999';
  dCtx.font = 'bold 24px monospace';
  dCtx.textAlign = 'center';
  dCtx.fillText('BEACON POWER MATRIX', 256, 48);

  const items: Array<{ x: number; label: string; shape: 'circle' | 'triangle' | 'square' }> = [
    { x: 100, label: 'AUX', shape: 'circle' },
    { x: 256, label: 'DRIVE', shape: 'triangle' },
    { x: 412, label: 'BEACON', shape: 'square' },
  ];
  items.forEach((item) => {
    dCtx.strokeStyle = '#f3d999';
    dCtx.lineWidth = 4;
    if (item.shape === 'circle') {
      dCtx.beginPath();
      dCtx.arc(item.x, 128, 30, 0, Math.PI * 2);
      dCtx.stroke();
    } else if (item.shape === 'triangle') {
      dCtx.beginPath();
      dCtx.moveTo(item.x, 96);
      dCtx.lineTo(item.x + 32, 156);
      dCtx.lineTo(item.x - 32, 156);
      dCtx.closePath();
      dCtx.stroke();
    } else {
      dCtx.strokeRect(item.x - 28, 98, 56, 56);
    }
    dCtx.fillStyle = '#e2e8f0';
    dCtx.font = 'bold 22px monospace';
    dCtx.fillText(item.label, item.x, 204);
  });
  const fuseDiagramTex = prepColor(new THREE.CanvasTexture(diagC), 1, 1, true);

  // 10. Bearing Card (Floor 3 Gear Housing)
  const [bearC, bCtx] = makeCanvas(384, 220);
  bCtx.fillStyle = '#1b262d';
  bCtx.fillRect(0, 0, 384, 220);
  bCtx.strokeStyle = '#d4a34a';
  bCtx.lineWidth = 4;
  bCtx.strokeRect(10, 10, 364, 200);
  bCtx.fillStyle = '#e5d4a6';
  bCtx.font = 'bold 20px monospace';
  bCtx.textAlign = 'center';
  bCtx.fillText('FRESNEL 3-BEAT CROSSING', 192, 42);
  bCtx.fillStyle = '#cbd5e1';
  bCtx.font = '16px sans-serif';
  bCtx.fillText('1. Seat Pin · Ignite Lamp · Crank 072°', 192, 78);
  bCtx.fillText('2. Catch Marker · HOLD while E-4 crosses', 192, 108);
  bCtx.fillText('3. Signal PROCEED via East Shutter', 192, 138);
  bCtx.fillStyle = '#fbbf24';
  bCtx.font = 'bold 24px monospace';
  bCtx.fillText('TARGET: 072° EAST', 192, 184);
  const bearingCardTex = prepColor(new THREE.CanvasTexture(bearC), 1, 1, true);

  // 11. Ferry Hull Nameplate
  const [ferryC, fCtx] = makeCanvas(512, 96);
  fCtx.fillStyle = '#142634';
  fCtx.fillRect(0, 0, 512, 96);
  fCtx.fillStyle = '#f8fafc';
  fCtx.font = 'bold 46px Georgia, serif';
  fCtx.textAlign = 'center';
  fCtx.textBaseline = 'middle';
  fCtx.fillText('M/V THENDRAL', 256, 48);
  const ferryNameTex = prepColor(new THREE.CanvasTexture(ferryC), 1, 1, true);

  // 12. Boathouse Tide Scale Wall Marking
  const [tideC, tdCtx] = makeCanvas(128, 512);
  tdCtx.fillStyle = '#dcd6c6';
  tdCtx.fillRect(0, 0, 128, 512);
  tdCtx.fillStyle = '#1e293b';
  for (let m = 0; m < 10; m++) {
    const y = 470 - m * 46;
    tdCtx.fillRect(10, y, m % 2 === 0 ? 54 : 32, 6);
    if (m % 2 === 0) {
      tdCtx.font = 'bold 22px monospace';
      tdCtx.fillText(`${(m * 0.5 + 1).toFixed(1)}m`, 68, y + 8);
    }
  }
  tdCtx.fillStyle = '#991b1b';
  tdCtx.fillRect(0, 210, 128, 10);
  const tideScaleTex = prepColor(new THREE.CanvasTexture(tideC), 1, 1, true);

  // 13. Buoy Maintenance Cards (E-4 vs D-2)
  const makeBuoyCard = (id: 'E-4' | 'D-2') => {
    const [c, ctx] = makeCanvas(256, 320);
    ctx.fillStyle = '#ebe4cf';
    ctx.fillRect(0, 0, 256, 320);
    ctx.strokeStyle = id === 'E-4' ? '#b45309' : '#334155';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 240, 304);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 34px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`BUOY ${id}`, 128, 58);
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(id === 'E-4' ? 'EAST SHOAL MARKER' : 'OUTER DEEP BELL', 128, 92);

    // Illustrated buoy icon
    ctx.fillStyle = id === 'E-4' ? '#d97706' : '#dc2626';
    ctx.fillRect(88, 130, 80, 56);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(118, 106, 20, 28);
    // Light flashes
    ctx.fillStyle = id === 'E-4' ? '#fbbf24' : '#ef4444';
    ctx.beginPath();
    ctx.arc(id === 'E-4' ? 110 : 128, 224, 14, 0, Math.PI * 2);
    if (id === 'E-4') ctx.arc(146, 224, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(id === 'E-4' ? 'DOUBLE FLASH 2.4s' : 'SINGLE FLASH 3.0s', 128, 272);
    ctx.font = '15px sans-serif';
    ctx.fillText(id === 'E-4' ? 'Shallow Bar Mooring' : 'Outer Deep Mooring', 128, 298);
    return prepColor(new THREE.CanvasTexture(c), 1, 1, true);
  };
  const cardE4Tex = makeBuoyCard('E-4');
  const cardD2Tex = makeBuoyCard('D-2');

  // 14. Signal Hut Plot Board Texture
  const [pbC, pbCtx] = makeCanvas(512, 384);
  pbCtx.fillStyle = '#15222b';
  pbCtx.fillRect(0, 0, 512, 384);
  pbCtx.strokeStyle = '#c2933e';
  pbCtx.lineWidth = 4;
  pbCtx.strokeRect(10, 10, 492, 364);
  pbCtx.fillStyle = '#fde68a';
  pbCtx.font = 'bold 22px monospace';
  pbCtx.fillText('HARBOR APPROACH PLOT BOARD', 40, 46);
  pbCtx.strokeStyle = '#334155';
  pbCtx.lineWidth = 2;
  for (let x = 40; x < 480; x += 48) {
    pbCtx.beginPath();
    pbCtx.moveTo(x, 68);
    pbCtx.lineTo(x, 355);
    pbCtx.stroke();
  }
  for (let y = 68; y < 360; y += 48) {
    pbCtx.beginPath();
    pbCtx.moveTo(30, y);
    pbCtx.lineTo(480, y);
    pbCtx.stroke();
  }
  pbCtx.fillStyle = '#94a3b8';
  pbCtx.font = '18px monospace';
  pbCtx.fillText('1. NORTH GATE (RED)', 48, 120);
  pbCtx.fillText('2. SOUTH GATE (GREEN)', 48, 285);
  pbCtx.fillText('3. BUOY E-4 (FLAG ADRIFT)', 195, 202);
  const plotBoardTex = prepColor(new THREE.CanvasTexture(pbC), 1, 1, true);

  return {
    stoneAlbedo,
    stoneBump,
    stoneRoughness,
    steelAlbedo,
    woodAlbedo,
    woodRoughness,
    tinRoofAlbedo,
    grateAlbedo,
    grateAlpha,
    radioScale,
    speakerGrille,
    logbookTex,
    chartTexDark,
    chartTexLit,
    chartStampedTex,
    surveyOverlayTex,
    fuseDiagramTex,
    bearingCardTex,
    ferryNameTex,
    tideScaleTex,
    cardE4Tex,
    cardD2Tex,
    plotBoardTex,
    dispose: () => {
      [
        stoneAlbedo,
        stoneBump,
        stoneRoughness,
        steelAlbedo,
        woodAlbedo,
        woodRoughness,
        tinRoofAlbedo,
        grateAlbedo,
        grateAlpha,
        radioScale,
        speakerGrille,
        logbookTex,
        chartTexDark,
        chartTexLit,
        chartStampedTex,
        surveyOverlayTex,
        fuseDiagramTex,
        bearingCardTex,
        ferryNameTex,
        tideScaleTex,
        cardE4Tex,
        cardD2Tex,
        plotBoardTex,
      ].forEach((t) => t.dispose());
    },
  };
}
