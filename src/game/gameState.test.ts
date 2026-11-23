import test from 'node:test';
import assert from 'node:assert/strict';
import {
  adjustBinocularsFocus,
  adjustTelescopeFocus,
  areAllCartridgesSeated,
  blowWheelhouseHorn,
  checkCottageWindowMatch,
  checkTideScale,
  clearCheckpoint,
  confirmPlotBoard,
  createDefaultSettings,
  createInitialGameState,
  E4_CROSSING_CLEAR_TIME,
  EVENT_SAVE_STORAGE_KEY,
  fastenJettyLantern,
  formatBearing,
  getActiveObjective,
  getBuoyE4WorldState,
  getStagedHint,
  hangCorrectedChart,
  identifyBuoyCard,
  interactSocket,
  LEGACY_SAVE_STORAGE_KEY,
  loadCheckpoint,
  loadSettings,
  openCottageDrawer,
  openShutterHousing,
  openWiringPlate,
  pressRadioListen,
  pullIsolatorLever,
  pullLampSwitch,
  recordObservationSketch,
  RESCUE_SEQUENCE_DURATION,
  ringAllClearBell,
  ringOpeningBell,
  rotateChartOverlay,
  saveCheckpoint,
  saveSettings,
  seatDrivePin,
  seatShutterGear,
  selectCartridge,
  selectFlashDrum,
  skipHandover,
  speakMeeraAshore,
  stampCorrectedChart,
  startEventEdition,
  startNewCampaign,
  stepGameSimulation,
  takeDrivePin,
  talkMuthuCottage,
  teleportToNode,
  testDrumOnBench,
  testShutterLever,
  toggleCabinetDoor,
  togglePlotPin,
  toggleSlitView,
  triggerCatchOuterMarker,
  triggerHoldBeam,
  triggerSignalHold,
  triggerSignalProceed,
  turnCrank,
  turnRadioDial,
  type StorageLike,
} from './gameState';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

test('Chapter 1 jetty opening -> storm blackout -> CH 16 + binoculars + sketch log -> Chapter 2', () => {
  let state = startNewCampaign(createInitialGameState('screen'));
  assert.equal(state.phase, 'jetty_opening');
  assert.equal(state.currentArea, 'jetty');

  // Cannot ring departure bell before lantern bracket fastened
  assert.equal(ringOpeningBell(state).rung, false);

  state = fastenJettyLantern(state);
  assert.equal(state.lanternFastened, true);

  const bell = ringOpeningBell(state);
  assert.equal(bell.rung, true);
  state = bell.state;
  assert.equal(state.openingFerryPassed, true);

  // Advance simulation 5.5s until storm cuts feeder power & moves keeper inside
  for (let i = 0; i < 115; i++) {
    state = stepGameSimulation(state, 0.05).state;
  }
  assert.equal(state.phase, 'floor1_radio');
  assert.equal(state.currentArea, 'radio_room');
  assert.equal(state.powerCutTriggered, true);
  assert.equal(state.emergencyLightOn, true);

  // Wrong channel test
  state = turnRadioDial(state, 1); // 13
  assert.equal(pressRadioListen(state).outcome, 'static');

  // Tune CH 16
  for (let i = 0; i < 3; i++) state = turnRadioDial(state, 1);
  assert.equal(state.radioChannel, 16);
  const distress = pressRadioListen(state);
  assert.equal(distress.outcome, 'distress');
  state = distress.state;
  assert.ok(state.subtitle?.text.includes('three lights'));

  // Cannot log sketch before observing 3 lights through binoculars
  assert.equal(recordObservationSketch(state).recorded, false);

  // Focus binoculars to 7
  for (let i = 0; i < 5; i++) {
    state = adjustBinocularsFocus(state, 1).state;
  }
  assert.equal(state.lightsObserved, true);

  const logged = recordObservationSketch(state);
  assert.equal(logged.recorded, true);
  assert.equal(logged.state.chapter, 2);
  assert.equal(logged.state.phase, 'cottage_chart');
});

test('Chapter 2 cottage chart overlay alignment, window match, and Muthu key handoff', () => {
  let state = startNewCampaign(createInitialGameState('screen'), true);
  state = { ...state, radioChannel: 16 };
  state = pressRadioListen(state).state;
  for (let i = 0; i < 5; i++) state = adjustBinocularsFocus(state, 1).state;
  state = recordObservationSketch(state).state;

  // Spatial travel to Cottage
  const moved = teleportToNode(state, 'cottage_table');
  assert.equal(moved.moved, true);
  state = moved.state;

  // Boathouse locked before Muthu key
  assert.equal(teleportToNode(state, 'boathouse_slipway').moved, false);

  state = openCottageDrawer(state);
  assert.equal(state.overlayPlaced, true);
  assert.equal(state.overlayAngleDeg, -15);

  // Rotate overlay from -15 to 0 in +5 steps
  for (let i = 0; i < 3; i++) {
    state = rotateChartOverlay(state, 5).state;
  }
  assert.equal(state.overlayAligned, true);

  state = checkCottageWindowMatch(state);
  assert.equal(state.cottageWindowMatched, true);

  const keyRes = talkMuthuCottage(state);
  assert.equal(keyRes.unlocked, true);
  state = keyRes.state;
  assert.equal(state.chapter, 3);
  assert.equal(state.boathouseUnlocked, true);
  assert.equal(state.doorUnlocked, true);
});

test('Chapter 3 allows Boathouse BEFORE Generator (battery mode) and vice versa, unlocking Chapter 4 only after both', () => {
  // Path 1: Boathouse FIRST, Generator SECOND
  let state = startNewCampaign(createInitialGameState('screen'), true);
  state = {
    ...state,
    chapter: 3,
    phase: 'open_leads',
    radioSolved: true,
    lightsObserved: true,
    sketchRecorded: true,
    overlayAligned: true,
    muthuKeyGiven: true,
    boathouseUnlocked: true,
    doorUnlocked: true,
  };

  state = teleportToNode(state, 'boathouse_slipway').state;
  state = checkTideScale(state);
  state = teleportToNode(state, 'boathouse_upper').state;
  assert.equal(state.currentArea, 'boathouse');

  // Focus telescope from 2 -> 6
  for (let i = 0; i < 4; i++) state = adjustTelescopeFocus(state, 1).state;
  assert.equal(state.telescopeReadBuoy, true);

  // Recoverable wrong card D-2
  const wrongCard = identifyBuoyCard(state, 'D-2');
  assert.equal(wrongCard.outcome, 'wrong');
  state = identifyBuoyCard(wrongCard.state, 'E-4').state;
  assert.equal(state.buoyCardConfirmed, true);

  // Wrong drum fails cleanly, double_flash passes on battery power
  state = selectFlashDrum(state, 'single_3s');
  assert.equal(testDrumOnBench(state).matched, false);
  state = selectFlashDrum(state, 'double_flash');
  const tested = testDrumOnBench(state);
  assert.equal(tested.matched, true);
  state = tested.state;
  assert.equal(state.boathouseLeadComplete, true);
  assert.equal(state.chapter, 3); // Generator not done yet!

  // Now do Generator Gallery
  state = teleportToNode(state, 'f2_cabinet').state;
  state = openWiringPlate(state);
  state = toggleCabinetDoor(state);
  state = selectCartridge(state, 'AUX');
  assert.equal(interactSocket(state, 'square').outcome, 'rejected'); // Recoverable wrong socket
  state = interactSocket(state, 'circle').state;
  state = selectCartridge(state, 'DRIVE');
  state = interactSocket(state, 'triangle').state;
  state = selectCartridge(state, 'BEACON');
  state = interactSocket(state, 'square').state;
  assert.equal(areAllCartridgesSeated(state), true);

  const powered = pullIsolatorLever(state);
  assert.equal(powered.powered, true);
  state = powered.state;
  assert.equal(state.exteriorPowerRestored, true);
  assert.equal(state.chapter, 4); // Both leads done -> Chapter 4 Signal Hut!
  assert.equal(state.phase, 'signal_hut');

  // Path 2: Generator FIRST, Boathouse SECOND
  let stateB = startNewCampaign(createInitialGameState('screen'), true);
  stateB = {
    ...stateB,
    chapter: 3,
    phase: 'open_leads',
    boathouseUnlocked: true,
    doorUnlocked: true,
    cabinetOpen: true,
    sockets: { circle: 'AUX', triangle: 'DRIVE', square: 'BEACON' },
  };
  stateB = pullIsolatorLever(stateB).state;
  assert.equal(stateB.chapter, 3); // Boathouse not done yet!
  stateB = selectFlashDrum(stateB, 'double_flash');
  stateB = testDrumOnBench(stateB).state;
  assert.equal(stateB.chapter, 4);
});

test('Chapter 4 Signal Hut shutter repair, plot board rejection/recovery, and Chapter 5 3-beat crossing + Wheelhouse + Epilogue', () => {
  let state = startNewCampaign(createInitialGameState('screen'), true);
  state = {
    ...state,
    chapter: 4,
    phase: 'signal_hut',
    radioSolved: true,
    doorUnlocked: true,
    boathouseUnlocked: true,
    generatorRunning: true,
    stairwellPowered: true,
    boathouseLeadComplete: true,
  };

  state = teleportToNode(state, 'signal_hut_shutter').state;
  // Lever fails before coupling gear seated
  assert.equal(testShutterLever(state).tested, false);
  state = openShutterHousing(state);
  state = seatShutterGear(state).state;
  state = testShutterLever(state).state;
  assert.equal(state.shutterTested, true);
  state = toggleSlitView(state, true);
  assert.equal(state.shutterSlitChecked, true);

  // Plot board wrong route rejection (missing E-4 drifting mark)
  state = togglePlotPin(state, 'north');
  state = togglePlotPin(state, 'south');
  const badPlot = confirmPlotBoard(state);
  assert.equal(badPlot.confirmed, false);
  assert.ok(badPlot.state.subtitle?.text.includes('adrift'));

  state = togglePlotPin(badPlot.state, 'e4');
  const goodPlot = confirmPlotBoard(state);
  assert.equal(goodPlot.confirmed, true);
  state = goodPlot.state;
  assert.equal(state.chapter, 5);
  assert.equal(state.phase, 'floor3_lantern');

  // Chapter 5: Lantern Room
  state = teleportToNode(state, 'f3_gear').state;
  assert.equal(pullLampSwitch(state).ignited, false);
  state = takeDrivePin(state);
  state = seatDrivePin(state).state;
  state = pullLampSwitch(state).state;

  // Off-course test (60 deg)
  assert.equal(triggerCatchOuterMarker(state).outcome, 'off_course');
  for (let i = 0; i < 6; i++) state = turnCrank(state, 1).state;
  assert.equal(formatBearing(state.bearingDegrees), '072°');

  // Beat 1: Catch Outer Marker
  const beat1 = triggerCatchOuterMarker(state);
  assert.equal(beat1.outcome, 'locked');
  state = beat1.state;
  assert.equal(state.crossingBeat, 1);

  // Early Proceed fails safely while E-4 is blocking approach
  assert.equal(triggerSignalProceed(state).outcome, 'too_early');
  assert.equal(getBuoyE4WorldState(state, 1.0).blockingApproach, true);

  // Beat 2: Signal Hold until E-4 clears
  state = triggerSignalHold(state).state;
  for (let i = 0; i < Math.ceil(E4_CROSSING_CLEAR_TIME / 0.05) + 2; i++) {
    state = stepGameSimulation(state, 0.05).state;
  }
  assert.equal(state.crossingBeat, 2);
  assert.equal(getBuoyE4WorldState(state, 1.0).blockingApproach, false);

  // Beat 3: Signal Proceed via repaired shutter
  const beat3 = triggerSignalProceed(state);
  assert.equal(beat3.outcome, 'proceeding');
  state = beat3.state;
  assert.equal(state.phase, 'rescue_sequence');

  // Optional Wheelhouse viewpoint + horn trigger
  const wh = teleportToNode(state, 'ferry_wheelhouse');
  assert.equal(wh.moved, true);
  state = blowWheelhouseHorn(wh.state);
  assert.equal(state.wheelhouseHornTriggered, true);

  // Advance rescue to Dawn Epilogue
  for (let i = 0; i < Math.ceil(RESCUE_SEQUENCE_DURATION / 0.05) + 2; i++) {
    state = stepGameSimulation(state, 0.05).state;
  }
  assert.equal(state.phase, 'dawn_epilogue');
  assert.equal(state.currentNode, 'jetty_head');

  // Epilogue: Meera ashore -> stamp chart -> hang in Radio Room -> closing bell & Tamil line
  assert.equal(stampCorrectedChart(state).stamped, false);
  state = speakMeeraAshore(state);
  state = teleportToNode(state, 'f1_desk').state;
  state = stampCorrectedChart(state).state;
  assert.equal(state.chartStamped, true);
  const hung = hangCorrectedChart(state, true);
  assert.equal(hung.hung, true);
  assert.equal(hung.state.bellRung, true);
  assert.ok(hung.state.subtitle?.tamilText?.includes('எல்லோரும்'));
});

test('Event Edition fast-track path, save isolation from Full Story, and legacy v1 save migration', () => {
  const store = createMemoryStorage();

  // Create Full Story campaign save at Chapter 2
  let campaign = startNewCampaign(createInitialGameState('screen'), true);
  campaign = { ...campaign, chapter: 2, phase: 'cottage_chart', overlayAligned: true };
  assert.equal(saveCheckpoint(campaign, store), true);

  // Start Event Edition — never overwrites campaign save
  let ev = startEventEdition(createInitialGameState('touch'));
  assert.equal(ev.mode, 'event');
  assert.equal(ev.generatorRunning, true);
  assert.equal(ev.boathouseUnlocked, true);
  assert.equal(saveCheckpoint(ev, store), true);
  assert.ok(store.getItem(EVENT_SAVE_STORAGE_KEY));

  // Verify campaign checkpoint untouched
  const loadedCampaign = loadCheckpoint(store, 'campaign');
  assert.equal(loadedCampaign?.chapter, 2);
  assert.equal(loadedCampaign?.mode, 'campaign');

  // Step through Event Edition core beats
  for (let i = 0; i < 4; i++) ev = turnRadioDial(ev, 1);
  ev = pressRadioListen(ev).state;
  for (let i = 0; i < 5; i++) ev = adjustBinocularsFocus(ev, 1).state;
  ev = recordObservationSketch(ev).state;
  for (let i = 0; i < 4; i++) ev = adjustTelescopeFocus(ev, 1).state;
  ev = openCottageDrawer(ev);
  for (let i = 0; i < 3; i++) ev = rotateChartOverlay(ev, 5).state;
  assert.equal(ev.chapter, 5);
  assert.equal(ev.phase, 'floor3_lantern');

  // Clear Event Edition does not delete Campaign save
  clearCheckpoint(store, 'event');
  assert.equal(loadCheckpoint(store, 'event'), null);
  assert.equal(loadCheckpoint(store, 'campaign')?.chapter, 2);

  // Legacy v1 save migration test
  const v1Store = createMemoryStorage();
  v1Store.setItem(
    LEGACY_SAVE_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      phase: 'floor2_generator',
      inputMode: 'screen',
      currentFloor: 2,
      currentNode: 'f2_cabinet',
      radioChannel: 16,
      radioSolved: true,
      doorUnlocked: true,
      cabinetOpen: true,
    })
  );
  const migrated = loadCheckpoint(v1Store, 'campaign');
  assert.ok(migrated);
  assert.equal(migrated?.chapter, 3);
  assert.equal(migrated?.phase, 'floor2_generator');
  assert.equal(migrated?.boathouseUnlocked, true);
  assert.ok(getActiveObjective(migrated!).length > 0);
  assert.ok(getStagedHint(migrated!) !== null);
});

test('Settings audio sub-sliders, skip handover, holdBeam compat, and broken storage safety', () => {
  const brokenStore: StorageLike = {
    getItem: () => {
      throw new Error('SecurityError');
    },
    setItem: () => {
      throw new Error('QuotaExceededError');
    },
    removeItem: () => {
      throw new Error('SecurityError');
    },
  };
  const defaults = createDefaultSettings();
  assert.equal(defaults.dialogueVolume, 0.95);
  saveSettings(defaults, brokenStore);
  assert.deepEqual(loadSettings(brokenStore), defaults);

  let s = startNewCampaign(createInitialGameState('screen'));
  s = skipHandover(s);
  assert.equal(s.phase, 'floor1_radio');

  s = { ...s, generatorRunning: true, drivePinSeated: true, lampSwitchOn: true, bearingDegrees: 72, crossingBeat: 0, phase: 'floor3_lantern' };
  const holdRes = triggerHoldBeam(s);
  assert.equal(holdRes.outcome, 'holding');
  s = ringAllClearBell({ ...holdRes.state, phase: 'dawn_epilogue' }, true);
  assert.equal(s.bellRung, true);
});
