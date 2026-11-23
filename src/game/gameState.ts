export type GameMode = 'campaign' | 'event';

export type StoryChapter = 1 | 2 | 3 | 4 | 5 | 6; // 6 = Dawn Epilogue

export type GamePhase =
  | 'title'
  | 'jetty_opening'
  | 'floor1_radio'
  | 'cottage_chart'
  | 'open_leads' // Chapter 3: Tower Generator OR Boathouse in any order
  | 'floor2_generator'
  | 'boathouse_investigate'
  | 'signal_hut'
  | 'floor3_lantern'
  | 'rescue_sequence'
  | 'dawn_epilogue'
  | 'credits';

export type InputMode = 'screen' | 'touch' | 'phone-vr' | 'webxr';
export type QualityProfile = 'auto' | 'mobile' | 'high';
export type TextSizeSetting = 'normal' | 'large';

export type CartridgeId = 'AUX' | 'DRIVE' | 'BEACON';
export type SocketShape = 'circle' | 'triangle' | 'square';
export type DrumPatternId = 'single_3s' | 'double_flash' | 'quick_tri';
export type BuoyCardId = 'E-4' | 'D-2';

export type FloorId = 1 | 2 | 3;

export type AreaId =
  | 'jetty'
  | 'walkway'
  | 'cottage'
  | 'radio_room'
  | 'generator_gallery'
  | 'boathouse'
  | 'signal_hut'
  | 'lantern_room'
  | 'wheelhouse';

export type TeleportNodeId =
  | 'jetty_head'
  | 'walkway_yard'
  | 'cottage_table'
  | 'cottage_window'
  | 'f1_desk'
  | 'f1_door'
  | 'f2_cabinet'
  | 'f2_generator'
  | 'boathouse_slipway'
  | 'boathouse_upper'
  | 'signal_hut_shutter'
  | 'signal_hut_board'
  | 'f3_gear'
  | 'f3_window'
  | 'f3_balcony'
  | 'ferry_wheelhouse';

export interface GameSettings {
  soundEnabled: boolean;
  masterVolume: number; // 0..1
  dialogueVolume: number; // 0..1
  effectsVolume: number; // 0..1
  musicVolume: number; // 0..1
  subtitlesEnabled: boolean;
  reducedLightning: boolean;
  textSize: TextSizeSetting;
  quality: QualityProfile;
  seatedHeightOffset: number; // -0.4..0.4 meters
  tamilClosingLine: boolean;
}

export interface SubtitleState {
  speaker: string;
  text: string;
  tamilText?: string;
  elapsed: number;
  duration: number;
}

export interface Point2D {
  x: number;
  z: number;
}

export interface GameState {
  version: number;
  mode: GameMode;
  chapter: StoryChapter;
  phase: GamePhase;
  paused: boolean;
  inputMode: InputMode;

  // Spatial state (decoupled from story chapter so player can revisit any unlocked area)
  currentFloor: FloorId;
  currentArea: AreaId;
  currentNode: TeleportNodeId;
  playerPos: Point2D;
  binocularActive: boolean;
  binocularFocus: number; // 0..10 (target 7)
  telescopeActive: boolean;
  telescopeFocus: number; // 0..10 (target 6)
  slitViewActive: boolean;

  // Chapter 1: Jetty Opening + Radio Room & Three Lights
  lanternFastened: boolean;
  openingBellRung: boolean;
  openingFerryPassed: boolean;
  openingElapsed: number;
  powerCutTriggered: boolean;
  emergencyLightOn: boolean;

  radioChannel: number; // 10..20, starts at 12, target 16
  radioListening: boolean;
  radioSolved: boolean;
  radioFeedback: string | null;
  chartLit: boolean;
  lightsObserved: boolean;
  sketchRecorded: boolean;
  doorUnlocked: boolean; // Stairwell F1->F2 unlocked once tower power lead open

  // Chapter 2: Keeper's Cottage & Chart Overlay
  cottageKettleChecked: boolean;
  cottageTideMarksChecked: boolean;
  drawerOpened: boolean;
  overlayPlaced: boolean;
  overlayAngleDeg: number; // -20..20 in 5-deg steps, starts -15, target 0
  overlayAligned: boolean;
  cottageWindowMatched: boolean;
  muthuKeyGiven: boolean;
  boathouseUnlocked: boolean;

  // Chapter 3 Lead A: Tower Generator Gallery
  wiringPlateOpened: boolean;
  inspectionLampOn: boolean;
  cabinetOpen: boolean;
  selectedCartridge: CartridgeId | null;
  sockets: Record<SocketShape, CartridgeId | null>;
  socketError: string | null;
  isolatorPulled: boolean;
  generatorRunning: boolean;
  stairwellPowered: boolean;
  exteriorPowerRestored: boolean;

  // Chapter 3 Lead B: Boathouse & Tidal Slipway
  tideScaleChecked: boolean;
  telescopeReadBuoy: boolean;
  selectedBuoyCard: BuoyCardId | null;
  buoyCardConfirmed: boolean;
  selectedDrum: DrumPatternId | null;
  drumTestedMatch: boolean;
  boathouseLeadComplete: boolean;
  buoyAlertBroadcasted: boolean;

  // Chapter 4: Signal Hut & Harbor Plot Board
  shutterHousingOpen: boolean;
  shutterGearSeated: boolean;
  shutterTested: boolean;
  shutterSlitChecked: boolean;
  plotNorthMarker: boolean;
  plotSouthMarker: boolean;
  plotE4Drifting: boolean;
  plotRouteConfirmed: boolean;
  plotFeedback: string | null;

  // Chapter 5: Lantern Room 3-Beat Crossing + Optional Wheelhouse
  drivePinTaken: boolean;
  drivePinSeated: boolean;
  lampSwitchOn: boolean;
  bearingDegrees: number; // 56..84 in 2-deg detents, starts 60, target 72
  crossingBeat: 0 | 1 | 2 | 3; // 0: align & catch outer marker, 1: wait/signal Hold while E-4 crosses, 2: signal Proceed via shutter once clear, 3: ferry clearing channel
  e4ClearTimer: number; // 0..6.5s during beat 1 until E-4 clears breakwater marker
  holdBeamActive: boolean;
  holdBeamElapsed: number;
  beamFeedback: string | null;
  ferrySpeedPhase: 'holding' | 'approaching' | 'waiting_buoy' | 'clearing' | 'moored';

  // Rescue & Epilogue (Chapter 6)
  rescueElapsed: number; // 0..14s after Proceed
  hornBlown: boolean;
  wheelhouseHornTriggered: boolean;
  dawnMix: number; // 0..1
  meeraAshoreSpoken: boolean;
  chartStamped: boolean;
  chartHung: boolean;
  bellRung: boolean;
  closingLinePlayed: boolean;

  // Guidance & Narrative
  subtitle: SubtitleState | null;
  activeTransmission:
    | 'none'
    | 'muthu'
    | 'meera_distress'
    | 'meera_buoy'
    | 'meera_route'
    | 'meera_offcourse'
    | 'meera_hold'
    | 'meera_closing';
  hintStage: 0 | 1 | 2;
  shiftElapsedSeconds: number;
}

export const SAVE_STORAGE_KEY = 'last_lighthouse_campaign_save_v2';
export const LEGACY_SAVE_STORAGE_KEY = 'last_lighthouse_save_v1';
export const EVENT_SAVE_STORAGE_KEY = 'last_lighthouse_event_save_v1';
export const SETTINGS_STORAGE_KEY = 'last_lighthouse_settings_v2';
export const LEGACY_SETTINGS_STORAGE_KEY = 'last_lighthouse_settings_v1';
export const SAVE_VERSION = 2;

export const CARTRIDGE_TARGET_SOCKET: Record<CartridgeId, SocketShape> = {
  AUX: 'circle',
  DRIVE: 'triangle',
  BEACON: 'square',
};

export const MIN_CHANNEL = 10;
export const MAX_CHANNEL = 20;
export const TARGET_CHANNEL = 16;

export const MIN_BEARING = 56;
export const MAX_BEARING = 84;
export const TARGET_BEARING = 72;
export const BEARING_STEP = 2;
export const E4_CROSSING_CLEAR_TIME = 5.5;
export const HOLD_BEAM_DURATION = 5.0; // Kept for backwards compatibility in tests/HUD helpers
export const RESCUE_SEQUENCE_DURATION = 14.0;

export const AREA_OF_NODE: Record<TeleportNodeId, AreaId> = {
  jetty_head: 'jetty',
  walkway_yard: 'walkway',
  cottage_table: 'cottage',
  cottage_window: 'cottage',
  f1_desk: 'radio_room',
  f1_door: 'radio_room',
  f2_cabinet: 'generator_gallery',
  f2_generator: 'generator_gallery',
  boathouse_slipway: 'boathouse',
  boathouse_upper: 'boathouse',
  signal_hut_shutter: 'signal_hut',
  signal_hut_board: 'signal_hut',
  f3_gear: 'lantern_room',
  f3_window: 'lantern_room',
  f3_balcony: 'lantern_room',
  ferry_wheelhouse: 'wheelhouse',
};

export const FLOOR_OF_NODE: Record<TeleportNodeId, FloorId> = {
  jetty_head: 1,
  walkway_yard: 1,
  cottage_table: 1,
  cottage_window: 1,
  f1_desk: 1,
  f1_door: 1,
  f2_cabinet: 2,
  f2_generator: 2,
  boathouse_slipway: 1,
  boathouse_upper: 2,
  signal_hut_shutter: 1,
  signal_hut_board: 1,
  f3_gear: 3,
  f3_window: 3,
  f3_balcony: 3,
  ferry_wheelhouse: 3,
};

/**
 * Single source of truth for drifting Buoy E-4's world coordinates & double-flash signal.
 * Used identically by the 3D buoy mesh, the beacon light, binoculars/telescope target lock,
 * and the ferry Hold/Proceed timing check.
 */
export function getBuoyE4WorldState(
  state: Pick<GameState, 'chapter' | 'crossingBeat' | 'e4ClearTimer' | 'dawnMix' | 'buoyAlertBroadcasted'>,
  time: number
): { x: number; y: number; z: number; flashOn: boolean; blockingApproach: boolean } {
  // Double-flash cadence: two brief amber pulses every 2.4s
  const phase24 = time % 2.4;
  const flashOn = phase24 < 0.22 || (phase24 > 0.42 && phase24 < 0.64);

  const swellY = (Math.sin(time * 1.45) * 0.24 + Math.cos(time * 0.9) * 0.12) * (1 - state.dawnMix * 0.7);

  // Before Chapter 3 discovery, it drifts west-northwest from its broken mooring off East Shoal
  if (state.chapter < 3) {
    return {
      x: 52 + Math.sin(time * 0.18) * 1.6,
      y: swellY,
      z: 5.5 + Math.cos(time * 0.15) * 1.2,
      flashOn,
      blockingApproach: false,
    };
  }

  // During Chapter 3–5 beat 0, E-4 sits prominently across the ferry channel approach
  if (state.chapter <= 4 || (state.chapter === 5 && state.crossingBeat === 0)) {
    return {
      x: 47 + Math.sin(time * 0.22) * 1.1,
      y: swellY,
      z: -1.2 + Math.sin(time * 0.19) * 1.5,
      flashOn,
      blockingApproach: true,
    };
  }

  // During Chapter 5 beat 1 ("Hold"), E-4 sweeps Southward past the fixed North marker to clear the channel
  if (state.chapter === 5 && state.crossingBeat === 1) {
    const p = Math.min(1, state.e4ClearTimer / E4_CROSSING_CLEAR_TIME);
    return {
      x: 46.5 - p * 3.5,
      y: swellY,
      z: -1.2 + p * 12.2, // Clears south past z = +11 once timer completes
      flashOn,
      blockingApproach: p < 0.88,
    };
  }

  // Once cleared (beat >= 2 or dawn), rests well south of the breakwater arm
  return {
    x: 43,
    y: swellY,
    z: 11.8 + Math.sin(time * 0.2) * 0.4,
    flashOn,
    blockingApproach: false,
  };
}

export function createDefaultSettings(): GameSettings {
  return {
    soundEnabled: true,
    masterVolume: 0.85,
    dialogueVolume: 0.95,
    effectsVolume: 0.85,
    musicVolume: 0.65,
    subtitlesEnabled: true,
    reducedLightning: false,
    textSize: 'normal',
    quality: 'auto',
    seatedHeightOffset: 0,
    tamilClosingLine: true,
  };
}

export function createInitialGameState(
  inputMode: InputMode = 'screen',
  mode: GameMode = 'campaign'
): GameState {
  return {
    version: SAVE_VERSION,
    mode,
    chapter: 1,
    phase: 'title',
    paused: false,
    inputMode,

    currentFloor: 1,
    currentArea: 'jetty',
    currentNode: 'jetty_head',
    playerPos: { x: 27.5, z: 11.0 },
    binocularActive: false,
    binocularFocus: 2,
    telescopeActive: false,
    telescopeFocus: 2,
    slitViewActive: false,

    lanternFastened: false,
    openingBellRung: false,
    openingFerryPassed: false,
    openingElapsed: 0,
    powerCutTriggered: false,
    emergencyLightOn: false,

    radioChannel: 12,
    radioListening: false,
    radioSolved: false,
    radioFeedback: null,
    chartLit: false,
    lightsObserved: false,
    sketchRecorded: false,
    doorUnlocked: false,

    cottageKettleChecked: false,
    cottageTideMarksChecked: false,
    drawerOpened: false,
    overlayPlaced: false,
    overlayAngleDeg: -15,
    overlayAligned: false,
    cottageWindowMatched: false,
    muthuKeyGiven: false,
    boathouseUnlocked: false,

    wiringPlateOpened: false,
    inspectionLampOn: false,
    cabinetOpen: false,
    selectedCartridge: null,
    sockets: {
      circle: null,
      triangle: null,
      square: null,
    },
    socketError: null,
    isolatorPulled: false,
    generatorRunning: false,
    stairwellPowered: false,
    exteriorPowerRestored: false,

    tideScaleChecked: false,
    telescopeReadBuoy: false,
    selectedBuoyCard: null,
    buoyCardConfirmed: false,
    selectedDrum: null,
    drumTestedMatch: false,
    boathouseLeadComplete: false,
    buoyAlertBroadcasted: false,

    shutterHousingOpen: false,
    shutterGearSeated: false,
    shutterTested: false,
    shutterSlitChecked: false,
    plotNorthMarker: false,
    plotSouthMarker: false,
    plotE4Drifting: false,
    plotRouteConfirmed: false,
    plotFeedback: null,

    drivePinTaken: false,
    drivePinSeated: false,
    lampSwitchOn: false,
    bearingDegrees: 60,
    crossingBeat: 0,
    e4ClearTimer: 0,
    holdBeamActive: false,
    holdBeamElapsed: 0,
    beamFeedback: null,
    ferrySpeedPhase: 'approaching',

    rescueElapsed: 0,
    hornBlown: false,
    wheelhouseHornTriggered: false,
    dawnMix: 0,
    meeraAshoreSpoken: false,
    chartStamped: false,
    chartHung: false,
    bellRung: false,
    closingLinePlayed: false,

    subtitle: null,
    activeTransmission: 'none',
    hintStage: 0,
    shiftElapsedSeconds: 0,
  };
}

export function startNewCampaign(state: GameState, skipJettyIntro = false): GameState {
  const next = createInitialGameState(state.inputMode, 'campaign');
  if (skipJettyIntro) {
    return {
      ...next,
      chapter: 1,
      phase: 'floor1_radio',
      currentFloor: 1,
      currentArea: 'radio_room',
      currentNode: 'f1_desk',
      playerPos: { x: -0.35, z: 0.75 },
      lanternFastened: true,
      openingBellRung: true,
      openingFerryPassed: true,
      powerCutTriggered: true,
      emergencyLightOn: true,
      subtitle: {
        speaker: 'Storm Alert',
        text: 'The cyclone squall knocked out grid power. Tune the VHF radio to CH 16.',
        elapsed: 0,
        duration: 5.0,
      },
    };
  }
  return {
    ...next,
    chapter: 1,
    phase: 'jetty_opening',
    currentFloor: 1,
    currentArea: 'jetty',
    currentNode: 'jetty_head',
    playerPos: { x: 27.5, z: 11.0 },
    activeTransmission: 'muthu',
    subtitle: {
      speaker: 'Muthu',
      text: 'The squall’s coming fast. Steady that storm lantern bracket and ring the jetty bell for Thendral’s departure.',
      elapsed: 0,
      duration: 6.5,
    },
  };
}

/** Compatibility alias for baseline tests/UI */
export function startNewShift(state: GameState, skipHandover = false): GameState {
  return startNewCampaign(state, skipHandover);
}

/**
 * Event Edition (5-7 min showcase path):
 * Starts at Meera's 3-light call on CH 16 with Muthu having already restored main tower power.
 * Boathouse & Cottage are unlocked immediately for focused mystery + 3-beat crossing finale.
 */
export function startEventEdition(state: GameState): GameState {
  const next = createInitialGameState(state.inputMode, 'event');
  return {
    ...next,
    mode: 'event',
    chapter: 1,
    phase: 'floor1_radio',
    currentFloor: 1,
    currentArea: 'radio_room',
    currentNode: 'f1_desk',
    playerPos: { x: -0.35, z: 0.75 },
    lanternFastened: true,
    openingBellRung: true,
    openingFerryPassed: true,
    powerCutTriggered: true,
    emergencyLightOn: true,
    // Muthu already handled Floor 2 power in Event Edition
    doorUnlocked: true,
    wiringPlateOpened: true,
    inspectionLampOn: true,
    cabinetOpen: true,
    sockets: { circle: 'AUX', triangle: 'DRIVE', square: 'BEACON' },
    isolatorPulled: true,
    generatorRunning: true,
    stairwellPowered: true,
    exteriorPowerRestored: true,
    boathouseUnlocked: true,
    muthuKeyGiven: true,
    shutterHousingOpen: true,
    shutterGearSeated: true,
    shutterTested: true,
    activeTransmission: 'muthu',
    subtitle: {
      speaker: 'Muthu (Intercom)',
      text: 'I bypassed the generator breakers so the beacon lines are live. Tune CH 16 — Thendral’s calling about a third light!',
      elapsed: 0,
      duration: 6.5,
    },
  };
}

export function skipHandover(state: GameState): GameState {
  if (state.phase !== 'jetty_opening') return state;
  return {
    ...state,
    phase: 'floor1_radio',
    currentArea: 'radio_room',
    currentNode: 'f1_desk',
    currentFloor: 1,
    playerPos: { x: -0.35, z: 0.75 },
    lanternFastened: true,
    openingBellRung: true,
    openingFerryPassed: true,
    powerCutTriggered: true,
    emergencyLightOn: true,
    activeTransmission: 'none',
    subtitle: {
      speaker: 'Storm Alert',
      text: 'Transformer surge! Emergency amber bulb lit. Answer VHF Channel 16.',
      elapsed: 0,
      duration: 5.0,
    },
    hintStage: 0,
  };
}

// ============================================================================
// CHAPTER 1: JETTY OPENING, RADIO CH 16, BINOCULARS & OBSERVATION LOG
// ============================================================================

export function fastenJettyLantern(state: GameState): GameState {
  if (state.phase !== 'jetty_opening' || state.lanternFastened) return state;
  return {
    ...state,
    lanternFastened: true,
    subtitle: {
      speaker: 'Muthu',
      text: 'Bracket’s tight. Ring the jetty bell to clear M/V Thendral out before the storm breaks.',
      elapsed: 0,
      duration: 5.0,
    },
  };
}

export function ringOpeningBell(state: GameState): { state: GameState; rung: boolean } {
  if (state.phase !== 'jetty_opening') return { state, rung: false };
  if (!state.lanternFastened) {
    return {
      rung: false,
      state: {
        ...state,
        subtitle: {
          speaker: 'Muthu',
          text: 'Help me fasten this brass storm lantern to the bracket first so it doesn’t smash in the gale.',
          elapsed: 0,
          duration: 4.0,
        },
      },
    };
  }
  if (state.openingBellRung) return { state, rung: false };
  return {
    rung: true,
    state: {
      ...state,
      openingBellRung: true,
      openingFerryPassed: true,
      subtitle: {
        speaker: 'Jetty Watch',
        text: 'M/V Thendral answers with two short blasts as rain sweeps over the seawall. Get inside the Radio Room!',
        elapsed: 0,
        duration: 5.5,
      },
    },
  };
}

export function turnRadioDial(state: GameState, delta: -1 | 1): GameState {
  if (state.phase === 'title' || state.phase === 'jetty_opening') return state;
  const nextChannel = Math.max(MIN_CHANNEL, Math.min(MAX_CHANNEL, state.radioChannel + delta));
  if (nextChannel === state.radioChannel) return state;
  return {
    ...state,
    radioChannel: nextChannel,
    radioFeedback: null,
  };
}

export function pressRadioListen(state: GameState): { state: GameState; outcome: 'static' | 'distress' | 'replay' } {
  if (state.phase === 'title' || state.phase === 'jetty_opening') {
    return { state, outcome: 'static' };
  }

  if (state.radioSolved && state.radioChannel === TARGET_CHANNEL) {
    return {
      outcome: 'replay',
      state: {
        ...state,
        activeTransmission: 'meera_distress',
        subtitle: {
          speaker: 'Captain Meera (M/V Thendral)',
          text: 'Keeper, I have three lights ahead. Your chart shows two. Which one do I follow?',
          elapsed: 0,
          duration: 6.5,
        },
      },
    };
  }

  if (state.radioChannel === TARGET_CHANNEL) {
    return {
      outcome: 'distress',
      state: {
        ...state,
        radioListening: true,
        radioSolved: true,
        radioFeedback: 'CH 16 locked — Three-light anomaly reported',
        chartLit: true,
        doorUnlocked: state.mode === 'event' ? true : state.doorUnlocked,
        activeTransmission: 'meera_distress',
        hintStage: 0,
        subtitle: {
          speaker: 'Captain Meera (M/V Thendral)',
          text: 'Keeper, I have three lights ahead. Your chart shows two. Which one do I follow?',
          elapsed: 0,
          duration: 6.8,
        },
      },
    };
  }

  return {
    outcome: 'static',
    state: {
      ...state,
      radioFeedback: `CH ${state.radioChannel} — Squall static only. Harbor distress is on CH 16.`,
      subtitle: {
        speaker: 'VHF Static',
        text: `Channel ${state.radioChannel}: storm static only. Marine distress is on CH 16.`,
        elapsed: 0,
        duration: 3.5,
      },
    },
  };
}

export function toggleBinoculars(state: GameState, force?: boolean): GameState {
  const nextActive = force !== undefined ? force : !state.binocularActive;
  return {
    ...state,
    binocularActive: nextActive,
    telescopeActive: false,
    slitViewActive: false,
  };
}

export function adjustBinocularsFocus(state: GameState, delta: -1 | 1): { state: GameState; locked: boolean } {
  const nextFocus = Math.max(0, Math.min(10, state.binocularFocus + delta));
  const inFocus = nextFocus >= 6 && nextFocus <= 8;
  const newlyObserved = inFocus && state.radioSolved && !state.lightsObserved;
  return {
    locked: inFocus,
    state: {
      ...state,
      binocularActive: true,
      binocularFocus: nextFocus,
      lightsObserved: state.lightsObserved || newlyObserved,
      subtitle: newlyObserved
        ? {
            speaker: 'Binocular Sighting',
            text: 'Three blinking lights East-Northeast — and the third amber light is drifting past the crooked signal mast! Note this in the desk log.',
            elapsed: 0,
            duration: 6.0,
          }
        : state.subtitle,
    },
  };
}

export function recordObservationSketch(state: GameState): { state: GameState; recorded: boolean } {
  if (state.sketchRecorded) return { state, recorded: false };
  if (!state.radioSolved) {
    return {
      recorded: false,
      state: {
        ...state,
        subtitle: {
          speaker: 'Keeper Logbook',
          text: 'Tune the VHF radio to CH 16 first to hear what Captain Meera sees offshore.',
          elapsed: 0,
          duration: 3.5,
        },
      },
    };
  }
  if (!state.lightsObserved) {
    return {
      recorded: false,
      state: {
        ...state,
        subtitle: {
          speaker: 'Keeper Logbook',
          text: 'Inspect the three intermittent lights through the East window with the binoculars (focus ~7) before logging.',
          elapsed: 0,
          duration: 4.0,
        },
      },
    };
  }

  // In Event Edition, logging the observation immediately opens Boathouse & Cottage Chart
  if (state.mode === 'event') {
    return {
      recorded: true,
      state: {
        ...state,
        sketchRecorded: true,
        binocularActive: false,
        chapter: 3,
        phase: 'open_leads',
        ferrySpeedPhase: 'holding',
        activeTransmission: 'meera_buoy',
        hintStage: 0,
        subtitle: {
          speaker: 'Captain Meera (M/V Thendral)',
          text: 'Understood, holding offshore at slow bell. Identify that third light at the Boathouse and check the Cottage survey chart!',
          elapsed: 0,
          duration: 6.5,
        },
      },
    };
  }

  return {
    recorded: true,
    state: {
      ...state,
      sketchRecorded: true,
      binocularActive: false,
      chapter: 2,
      phase: 'cottage_chart',
      ferrySpeedPhase: 'holding',
      activeTransmission: 'meera_distress',
      hintStage: 0,
      subtitle: {
        speaker: 'Captain Meera (M/V Thendral)',
        text: 'A third moving light? I’ll hold slow offshore. Cross the covered walkway to Muthu’s cottage and check the old survey sheets!',
        elapsed: 0,
        duration: 6.5,
      },
    },
  };
}

// ============================================================================
// CHAPTER 2: KEEPER'S COTTAGE & SURVEY CHART OVERLAY
// ============================================================================

export function inspectCottageKettle(state: GameState): GameState {
  if (state.cottageKettleChecked) return state;
  return {
    ...state,
    cottageKettleChecked: true,
    subtitle: {
      speaker: 'Keeper’s Cottage',
      text: 'Cold brass kettle on the stove — Muthu’s been out in the yard since the first squall squawked.',
      elapsed: 0,
      duration: 4.5,
    },
  };
}

export function inspectCottageTideMarks(state: GameState): GameState {
  if (state.cottageTideMarksChecked) return state;
  return {
    ...state,
    cottageTideMarksChecked: true,
    subtitle: {
      speaker: 'Doorframe Tide Marks',
      text: '1978, 1994, 2008 cyclone surge notches carved into teak — tonight’s water is already past the first cut.',
      elapsed: 0,
      duration: 4.8,
    },
  };
}

export function openCottageDrawer(state: GameState): GameState {
  if (state.drawerOpened) return state;
  return {
    ...state,
    drawerOpened: true,
    overlayPlaced: true,
    subtitle: {
      speaker: 'Chart Table',
      text: 'Found a transparent hydrographic overlay! Rotate it until the lighthouse tower and boathouse marks align.',
      elapsed: 0,
      duration: 5.5,
    },
  };
}

export function rotateChartOverlay(state: GameState, deltaDeg: -5 | 5): { state: GameState; aligned: boolean } {
  if (!state.overlayPlaced) return { state, aligned: false };
  const nextDeg = Math.max(-20, Math.min(20, state.overlayAngleDeg + deltaDeg));
  const alignedNow = nextDeg === 0;
  const newlyAligned = alignedNow && !state.overlayAligned;

  // In Event Edition, aligning overlay unlocks Signal Hut / Plot / Lantern progression immediately if telescope done
  if (state.mode === 'event' && newlyAligned) {
    const canFinishChapter = state.telescopeReadBuoy;
    return {
      aligned: true,
      state: {
        ...state,
        overlayAngleDeg: nextDeg,
        overlayAligned: true,
        cottageWindowMatched: true,
        plotNorthMarker: true,
        plotSouthMarker: true,
        plotE4Drifting: true,
        plotRouteConfirmed: canFinishChapter,
        chapter: canFinishChapter ? 5 : state.chapter,
        phase: canFinishChapter ? 'floor3_lantern' : state.phase,
        subtitle: {
          speaker: 'Survey Overlay Aligned',
          text: canFinishChapter
            ? 'East Slipway and 072° approach confirmed! Climb to the Lantern Room for the crossing.'
            : 'Survey marks aligned! Head to the Boathouse upper landing to identify Buoy E-4 through the telescope.',
          elapsed: 0,
          duration: 5.5,
        },
      },
    };
  }

  return {
    aligned: alignedNow,
    state: {
      ...state,
      overlayAngleDeg: nextDeg,
      overlayAligned: state.overlayAligned || alignedNow,
      subtitle: newlyAligned
        ? {
            speaker: 'Survey Overlay Aligned',
            text: 'Registration marks locked! An eastern maintenance slipway and former Buoy E-4 show up just below the boathouse. Check the east window to match the shore.',
            elapsed: 0,
            duration: 6.0,
          }
        : state.subtitle,
    },
  };
}

export function checkCottageWindowMatch(state: GameState): GameState {
  if (!state.overlayAligned) {
    return {
      ...state,
      subtitle: {
        speaker: 'Cottage Window',
        text: 'Rain beats against the slipway outside. Align the chart overlay on the table first to trace the missing mark.',
        elapsed: 0,
        duration: 4.0,
      },
    };
  }
  return {
    ...state,
    cottageWindowMatched: true,
    subtitle: {
      speaker: 'Cottage Window',
      text: 'There it is — the stone slipway aligns dead-on with the blue-roofed boathouse outside. Speak with Muthu by the porch.',
      elapsed: 0,
      duration: 5.0,
    },
  };
}

export function talkMuthuCottage(state: GameState): { state: GameState; unlocked: boolean } {
  if (!state.overlayAligned) {
    return {
      unlocked: false,
      state: {
        ...state,
        activeTransmission: 'muthu',
        subtitle: {
          speaker: 'Muthu',
          text: 'Look in the chart table drawer first — the 1998 survey tracing sits under the harbor sheet.',
          elapsed: 0,
          duration: 4.5,
        },
      },
    };
  }
  if (state.muthuKeyGiven) return { state, unlocked: false };

  return {
    unlocked: true,
    state: {
      ...state,
      cottageWindowMatched: true,
      muthuKeyGiven: true,
      boathouseUnlocked: true,
      doorUnlocked: true,
      chapter: 3,
      phase: 'open_leads',
      activeTransmission: 'muthu',
      hintStage: 0,
      subtitle: {
        speaker: 'Muthu',
        text: 'I fitted that lamp myself. If it’s moving, the mooring’s gone. Take the boathouse key — check the buoy log there, and get the tower generator online!',
        elapsed: 0,
        duration: 7.0,
      },
    },
  };
}

// ============================================================================
// CHAPTER 3 LEAD A: TOWER GENERATOR GALLERY (ANY ORDER WITH BOATHOUSE)
// ============================================================================

export function openWiringPlate(state: GameState): GameState {
  if (state.wiringPlateOpened) return state;
  return {
    ...state,
    wiringPlateOpened: true,
    inspectionLampOn: true,
    subtitle: {
      speaker: 'Generator Gallery',
      text: 'Inspection lamp lit. The wiring diagram inside shows AUX ○, DRIVE △, BEACON □.',
      elapsed: 0,
      duration: 4.5,
    },
  };
}

export function toggleCabinetDoor(state: GameState): GameState {
  if (state.currentArea !== 'generator_gallery' && state.phase !== 'floor2_generator') return state;
  return {
    ...state,
    cabinetOpen: !state.cabinetOpen,
    socketError: null,
  };
}

export function selectCartridge(state: GameState, cartridge: CartridgeId): GameState {
  if (!state.cabinetOpen || state.isolatorPulled) return state;
  const alreadySeated = Object.values(state.sockets).includes(cartridge);
  if (alreadySeated) return state;
  return {
    ...state,
    selectedCartridge: state.selectedCartridge === cartridge ? null : cartridge,
    socketError: null,
  };
}

export function interactSocket(
  state: GameState,
  shape: SocketShape
): { state: GameState; outcome: 'inserted' | 'removed' | 'rejected' | 'noop' } {
  if (!state.cabinetOpen || state.isolatorPulled) {
    return { state, outcome: 'noop' };
  }

  const existing = state.sockets[shape];
  if (existing !== null) {
    return {
      outcome: 'removed',
      state: {
        ...state,
        sockets: {
          ...state.sockets,
          [shape]: null,
        },
        selectedCartridge: existing,
        socketError: null,
      },
    };
  }

  if (!state.selectedCartridge) {
    return {
      outcome: 'noop',
      state: {
        ...state,
        socketError: 'Select a fuse cartridge from the rack first.',
      },
    };
  }

  const expectedShape = CARTRIDGE_TARGET_SOCKET[state.selectedCartridge];
  if (expectedShape !== shape) {
    return {
      outcome: 'rejected',
      state: {
        ...state,
        socketError: `${state.selectedCartridge} cartridge rejected — key shape does not match ${shape.toUpperCase()} socket.`,
        subtitle: {
          speaker: 'Fuse Cabinet',
          text: 'Mechanical reject: match each cartridge label and shape to the diagram (AUX ○, DRIVE △, BEACON □).',
          elapsed: 0,
          duration: 4.0,
        },
      },
    };
  }

  return {
    outcome: 'inserted',
    state: {
      ...state,
      sockets: {
        ...state.sockets,
        [shape]: state.selectedCartridge,
      },
      selectedCartridge: null,
      socketError: null,
    },
  };
}

export function areAllCartridgesSeated(state: GameState): boolean {
  return (
    state.sockets.circle === 'AUX' &&
    state.sockets.triangle === 'DRIVE' &&
    state.sockets.square === 'BEACON'
  );
}

function checkChapter3Complete(next: GameState): GameState {
  if (next.generatorRunning && next.boathouseLeadComplete && next.chapter === 3) {
    return {
      ...next,
      chapter: 4,
      phase: 'signal_hut',
      buoyAlertBroadcasted: true,
      activeTransmission: 'meera_buoy',
      hintStage: 0,
      subtitle: {
        speaker: 'Captain Meera (M/V Thendral)',
        text: 'I see the double flash — it’s crossing my bow! Give me a trustworthy signal from the Signal Hut on the jetty!',
        elapsed: 0,
        duration: 7.0,
      },
    };
  }
  return next;
}

export function pullIsolatorLever(state: GameState): { state: GameState; powered: boolean } {
  if (state.isolatorPulled) {
    return { state, powered: true };
  }
  if (!areAllCartridgesSeated(state)) {
    return {
      powered: false,
      state: {
        ...state,
        socketError: 'Contactor locked — seat AUX ○, DRIVE △, and BEACON □ cartridges first.',
      },
    };
  }

  let next: GameState = {
    ...state,
    isolatorPulled: true,
    generatorRunning: true,
    stairwellPowered: true,
    exteriorPowerRestored: true,
    hintStage: 0,
    socketError: null,
    subtitle: {
      speaker: 'Generator Gallery',
      text: 'Main isolator engaged! Power surges up to the Lantern Room and across the yard to the Boathouse and Signal Hut.',
      elapsed: 0,
      duration: 5.5,
    },
  };
  next = checkChapter3Complete(next);
  return { powered: true, state: next };
}

// ============================================================================
// CHAPTER 3 LEAD B: BOATHOUSE & TIDAL SLIPWAY (WORKS WITH OR WITHOUT GENERATOR)
// ============================================================================

export function checkTideScale(state: GameState): GameState {
  if (state.tideScaleChecked) return state;
  return {
    ...state,
    tideScaleChecked: true,
    subtitle: {
      speaker: 'Tidal Slipway',
      text: 'Painted depth gauge reads 3.4 metres above datum — cyclone swell’s pushing up the lower timber beams.',
      elapsed: 0,
      duration: 4.5,
    },
  };
}

export function toggleTelescope(state: GameState, force?: boolean): GameState {
  const nextActive = force !== undefined ? force : !state.telescopeActive;
  return {
    ...state,
    telescopeActive: nextActive,
    binocularActive: false,
    slitViewActive: false,
  };
}

export function adjustTelescopeFocus(state: GameState, delta: -1 | 1): { state: GameState; locked: boolean } {
  const nextFocus = Math.max(0, Math.min(10, state.telescopeFocus + delta));
  const inFocus = nextFocus >= 5 && nextFocus <= 7;
  const newlyRead = inFocus && !state.telescopeReadBuoy;

  if (state.mode === 'event' && newlyRead) {
    const canFinishChapter = state.overlayAligned;
    return {
      locked: true,
      state: {
        ...state,
        telescopeActive: true,
        telescopeFocus: nextFocus,
        telescopeReadBuoy: true,
        buoyCardConfirmed: true,
        selectedBuoyCard: 'E-4',
        selectedDrum: 'double_flash',
        drumTestedMatch: true,
        boathouseLeadComplete: true,
        buoyAlertBroadcasted: true,
        plotNorthMarker: canFinishChapter,
        plotSouthMarker: canFinishChapter,
        plotE4Drifting: canFinishChapter,
        plotRouteConfirmed: canFinishChapter,
        chapter: canFinishChapter ? 5 : 3,
        phase: canFinishChapter ? 'floor3_lantern' : 'open_leads',
        activeTransmission: 'meera_buoy',
        subtitle: {
          speaker: 'Boathouse Telescope',
          text: canFinishChapter
            ? 'Double-flash amber — E-4 is adrift! Climb straight to the Lantern Room to bring M/V Thendral through.'
            : 'Double-flash amber hull mark reads E-4! Cross to the Cottage chart table to align the survey overlay.',
          elapsed: 0,
          duration: 6.0,
        },
      },
    };
  }

  return {
    locked: inFocus,
    state: {
      ...state,
      telescopeActive: true,
      telescopeFocus: nextFocus,
      telescopeReadBuoy: state.telescopeReadBuoy || newlyRead,
      subtitle: newlyRead
        ? {
            speaker: 'Boathouse Telescope',
            text: 'Between swells you spot a double-flash amber beacon and stenciled plate: E-4! Compare it with the two maintenance cards on the bench.',
            elapsed: 0,
            duration: 5.5,
          }
        : state.subtitle,
    },
  };
}

export function identifyBuoyCard(
  state: GameState,
  card: BuoyCardId
): { state: GameState; outcome: 'matched' | 'wrong' } {
  if (card === 'D-2') {
    return {
      outcome: 'wrong',
      state: {
        ...state,
        selectedBuoyCard: 'D-2',
        subtitle: {
          speaker: 'Maintenance Card D-2',
          text: 'D-2 is the outer deep single-flash buoy (3.0s interval) — the drifting light flashed twice quickly. Check Card E-4.',
          elapsed: 0,
          duration: 4.8,
        },
      },
    };
  }

  return {
    outcome: 'matched',
    state: {
      ...state,
      selectedBuoyCard: 'E-4',
      buoyCardConfirmed: true,
      telescopeActive: false,
      subtitle: {
        speaker: 'Maintenance Card E-4',
        text: 'E-4 — East Shoal marker, twin-pulse amber flash every 2.4s! Pick the matching flash drum from the parts rack and verify it on the bench tester.',
        elapsed: 0,
        duration: 5.5,
      },
    },
  };
}

export function selectFlashDrum(state: GameState, drum: DrumPatternId): GameState {
  return {
    ...state,
    selectedDrum: drum,
    subtitle: {
      speaker: 'Parts Rack',
      text: `Loaded ${
        drum === 'double_flash'
          ? 'Double-Flash Drum (Twin 0.2s Amber)'
          : drum === 'single_3s'
          ? 'Single-Pulse Drum (3.0s)'
          : 'Rapid Tri-Flash Drum'
      } onto the bench tester cradle.`,
      elapsed: 0,
      duration: 3.5,
    },
  };
}

export function testDrumOnBench(state: GameState): { state: GameState; matched: boolean } {
  if (!state.selectedDrum) {
    return {
      matched: false,
      state: {
        ...state,
        subtitle: {
          speaker: 'Bench Tester',
          text: 'Select a flash-pattern drum from the rack first (Bench runs on 12V battery backup even before main power).',
          elapsed: 0,
          duration: 4.0,
        },
      },
    };
  }

  if (state.selectedDrum !== 'double_flash') {
    return {
      matched: false,
      state: {
        ...state,
        subtitle: {
          speaker: 'Bench Tester',
          text: `${
            state.selectedDrum === 'single_3s' ? 'Single 3s pulse' : 'Rapid tri-flash'
          } doesn’t match the drifting buoy’s double-flash amber rhythm!`,
          elapsed: 0,
          duration: 4.5,
        },
      },
    };
  }

  let next: GameState = {
    ...state,
    drumTestedMatch: true,
    boathouseLeadComplete: true,
    buoyCardConfirmed: true,
    selectedBuoyCard: 'E-4',
    telescopeReadBuoy: true,
    buoyAlertBroadcasted: true,
    subtitle: {
      speaker: state.generatorRunning ? 'Bench Tester' : 'Bench Tester (12V Battery)',
      text: state.generatorRunning
        ? 'Twin-flash amber confirmed — Buoy E-4 has broken loose!'
        : 'Twin-flash amber confirmed on battery backup! Now restore tower power in Floor 2 Generator Gallery.',
      elapsed: 0,
      duration: 5.5,
    },
  };
  next = checkChapter3Complete(next);
  return { matched: true, state: next };
}

// ============================================================================
// CHAPTER 4: SIGNAL HUT SHUTTER REPAIR & HARBOR PLOT BOARD
// ============================================================================

export function openShutterHousing(state: GameState): GameState {
  if (state.shutterHousingOpen) return state;
  return {
    ...state,
    shutterHousingOpen: true,
    subtitle: {
      speaker: 'East Signal Shutter',
      text: 'The bronze drive coupling is slipped off its worm gear inside the housing. Seat the coupling gear back onto the shaft.',
      elapsed: 0,
      duration: 4.5,
    },
  };
}

export function seatShutterGear(state: GameState): { state: GameState; seated: boolean } {
  if (!state.shutterHousingOpen) {
    return {
      seated: false,
      state: {
        ...state,
        subtitle: {
          speaker: 'Signal Hut',
          text: 'Open the shutter inspection housing cover first.',
          elapsed: 0,
          duration: 3.0,
        },
      },
    };
  }
  if (state.shutterGearSeated) return { state, seated: true };
  return {
    seated: true,
    state: {
      ...state,
      shutterGearSeated: true,
      subtitle: {
        speaker: 'East Signal Shutter',
        text: 'Coupling gear seated cleanly on the spline. Pull the shutter test lever to verify smooth vane travel.',
        elapsed: 0,
        duration: 4.5,
      },
    },
  };
}

export function testShutterLever(state: GameState): { state: GameState; tested: boolean } {
  if (!state.shutterGearSeated) {
    return {
      tested: false,
      state: {
        ...state,
        subtitle: {
          speaker: 'East Signal Shutter',
          text: 'The handle slips freely — seat the disengaged coupling gear inside the housing first.',
          elapsed: 0,
          duration: 3.8,
        },
      },
    };
  }
  return {
    tested: true,
    state: {
      ...state,
      shutterTested: true,
      subtitle: {
        speaker: 'East Signal Shutter',
        text: 'Shutter blades snap open and shut without binding! Check the inspection slit to line up the breakwater arms, then plot the route.',
        elapsed: 0,
        duration: 5.0,
      },
    },
  };
}

export function toggleSlitView(state: GameState, force?: boolean): GameState {
  const next = force !== undefined ? force : !state.slitViewActive;
  return {
    ...state,
    slitViewActive: next,
    shutterSlitChecked: state.shutterSlitChecked || next,
    binocularActive: false,
    telescopeActive: false,
    subtitle: next
      ? {
          speaker: 'Shutter Sighting Slit',
          text: 'Through the brass slit, the North Red and South Green breakwater heads frame a clean 072° corridor.',
          elapsed: 0,
          duration: 4.5,
        }
      : state.subtitle,
  };
}

export function togglePlotPin(
  state: GameState,
  pin: 'north' | 'south' | 'e4'
): GameState {
  return {
    ...state,
    plotNorthMarker: pin === 'north' ? !state.plotNorthMarker : state.plotNorthMarker,
    plotSouthMarker: pin === 'south' ? !state.plotSouthMarker : state.plotSouthMarker,
    plotE4Drifting: pin === 'e4' ? !state.plotE4Drifting : state.plotE4Drifting,
    plotFeedback: null,
  };
}

export function confirmPlotBoard(state: GameState): { state: GameState; confirmed: boolean } {
  if (!state.shutterTested) {
    return {
      confirmed: false,
      state: {
        ...state,
        plotFeedback: 'Repair and test the jammed East Shutter first before broadcasting channel orders.',
        subtitle: {
          speaker: 'Signal Hut',
          text: 'Fix and test the East Shutter coupling first — we’ll need it to signal Proceed from the tower.',
          elapsed: 0,
          duration: 4.0,
        },
      },
    };
  }

  if (!state.plotNorthMarker || !state.plotSouthMarker) {
    return {
      confirmed: false,
      state: {
        ...state,
        plotFeedback: 'Plot both fixed breakwater shore markers (North & South) so Meera has visual gates.',
        activeTransmission: 'meera_route',
        subtitle: {
          speaker: 'Captain Meera (M/V Thendral)',
          text: 'Negative — I can’t confirm a corridor with only one fixed breakwater plotted. Give me both fixed entrance markers!',
          elapsed: 0,
          duration: 5.0,
        },
      },
    };
  }

  if (!state.plotE4Drifting) {
    return {
      confirmed: false,
      state: {
        ...state,
        plotFeedback: 'Mark Buoy E-4 as DRIFTING / UNTRUSTWORTHY so the bridge ignores its false double-flash!',
        activeTransmission: 'meera_route',
        subtitle: {
          speaker: 'Captain Meera (M/V Thendral)',
          text: 'Wait — you left the third light unmarked! If E-4 is adrift, flag it on the plot board so my helmsman ignores it!',
          elapsed: 0,
          duration: 5.2,
        },
      },
    };
  }

  return {
    confirmed: true,
    state: {
      ...state,
      plotRouteConfirmed: true,
      plotFeedback: 'Route locked: Follow fixed North/South markers on 072° E — ignore drifting E-4.',
      chapter: 5,
      phase: 'floor3_lantern',
      slitViewActive: false,
      activeTransmission: 'meera_route',
      hintStage: 0,
      subtitle: {
        speaker: 'Captain Meera (M/V Thendral)',
        text: 'Copy — North Red and South Green breakwaters confirmed, ignoring drifting E-4. Light the main Fresnel on 072° East!',
        elapsed: 0,
        duration: 6.5,
      },
    },
  };
}

// ============================================================================
// CHAPTER 5: LANTERN ROOM 3-BEAT CROSSING & OPTIONAL WHEELHOUSE
// ============================================================================

export function takeDrivePin(state: GameState): GameState {
  if (state.drivePinTaken) return state;
  return {
    ...state,
    drivePinTaken: true,
    beamFeedback: null,
  };
}

export function seatDrivePin(state: GameState): { state: GameState; seated: boolean } {
  if (state.drivePinSeated) return { state, seated: true };
  if (!state.drivePinTaken) {
    return {
      seated: false,
      state: {
        ...state,
        beamFeedback: 'Pick up the brass drive pin from the housing tray first.',
      },
    };
  }
  return {
    seated: true,
    state: {
      ...state,
      drivePinSeated: true,
      beamFeedback: null,
    },
  };
}

export function pullLampSwitch(state: GameState): { state: GameState; ignited: boolean } {
  if (state.lampSwitchOn) return { state, ignited: true };
  if (!state.generatorRunning) {
    return {
      ignited: false,
      state: {
        ...state,
        beamFeedback: 'No main power — restore the generator on Floor 2 first.',
      },
    };
  }
  if (!state.drivePinSeated) {
    return {
      ignited: false,
      state: {
        ...state,
        beamFeedback: 'Seat the drive pin in the gear coupling before igniting the lamp.',
      },
    };
  }
  return {
    ignited: true,
    state: {
      ...state,
      lampSwitchOn: true,
      hintStage: 0,
      beamFeedback: null,
      subtitle: {
        speaker: 'Lantern Room',
        text: 'Fresnel ignited! Crank to 072° East to catch the outer marker, then execute the 3-beat crossing.',
        elapsed: 0,
        duration: 5.5,
      },
    },
  };
}

export function turnCrank(state: GameState, deltaDirection: -1 | 1): { state: GameState; moved: boolean } {
  if (!state.drivePinSeated || state.phase === 'rescue_sequence' || state.phase === 'dawn_epilogue') {
    return { state, moved: false };
  }
  const nextBearing = Math.max(
    MIN_BEARING,
    Math.min(MAX_BEARING, state.bearingDegrees + deltaDirection * BEARING_STEP)
  );
  if (nextBearing === state.bearingDegrees) {
    return { state, moved: false };
  }

  return {
    moved: true,
    state: {
      ...state,
      bearingDegrees: nextBearing,
      holdBeamActive: false,
      holdBeamElapsed: 0,
      beamFeedback: null,
    },
  };
}

/** Beat 1: Catch Outer Breakwater Marker at 072° */
export function triggerCatchOuterMarker(state: GameState): {
  state: GameState;
  outcome: 'locked' | 'off_course' | 'not_ready';
} {
  if (!state.lampSwitchOn) {
    return {
      outcome: 'not_ready',
      state: {
        ...state,
        beamFeedback: 'Ignite the Fresnel lamp switch before signaling.',
      },
    };
  }
  if (state.bearingDegrees !== TARGET_BEARING) {
    return {
      outcome: 'off_course',
      state: {
        ...state,
        activeTransmission: 'meera_offcourse',
        beamFeedback: `Bearing ${formatBearing(state.bearingDegrees)} misses the outer marker! Align crank to 072° East.`,
        subtitle: {
          speaker: 'Captain Meera (M/V Thendral)',
          text: `Your beam at ${formatBearing(state.bearingDegrees)} misses the breakwater gate — swing to 072° East!`,
          elapsed: 0,
          duration: 5.0,
        },
      },
    };
  }

  return {
    outcome: 'locked',
    state: {
      ...state,
      crossingBeat: 1,
      e4ClearTimer: 0,
      ferrySpeedPhase: 'waiting_buoy',
      beamFeedback: null,
      activeTransmission: 'meera_hold',
      subtitle: {
        speaker: 'Captain Meera (M/V Thendral)',
        text: 'Outer marker caught! Wait — drifting E-4 is still crossing in front of the channel. Signal HOLD until it clears!',
        elapsed: 0,
        duration: 6.0,
      },
    },
  };
}

/** Beat 2: Signal HOLD while E-4 drifts across */
export function triggerSignalHold(state: GameState): { state: GameState; outcome: 'holding' | 'not_ready' } {
  if (state.crossingBeat < 1 || !state.lampSwitchOn) {
    return {
      outcome: 'not_ready',
      state: {
        ...state,
        beamFeedback: 'First align to 072° and Catch Outer Marker.',
      },
    };
  }
  return {
    outcome: 'holding',
    state: {
      ...state,
      holdBeamActive: true,
      ferrySpeedPhase: 'waiting_buoy',
      beamFeedback: 'Holding M/V Thendral outside breakwaters while E-4 drifts clear...',
      activeTransmission: 'meera_hold',
      subtitle: {
        speaker: 'Lantern Room',
        text: 'HOLD signaled! Keep watch from the balcony as drifting Buoy E-4 clears the north breakwater.',
        elapsed: 0,
        duration: 5.0,
      },
    },
  };
}

/** Beat 3: Operate Repaired Shutter to Signal PROCEED once E-4 clears channel */
export function triggerSignalProceed(state: GameState): {
  state: GameState;
  outcome: 'proceeding' | 'too_early' | 'not_ready';
} {
  if (state.crossingBeat < 1 || !state.lampSwitchOn) {
    return {
      outcome: 'not_ready',
      state: {
        ...state,
        beamFeedback: 'Catch the outer marker on 072° first.',
      },
    };
  }

  if (state.e4ClearTimer < E4_CROSSING_CLEAR_TIME * 0.85) {
    return {
      outcome: 'too_early',
      state: {
        ...state,
        activeTransmission: 'meera_hold',
        beamFeedback: 'Hold! E-4 is still crossing the approach — wait until it drifts south of the fixed marker!',
        subtitle: {
          speaker: 'Captain Meera (M/V Thendral)',
          text: 'Too soon — that drifting double-flash is still in our lane! Signal HOLD until it passes clear!',
          elapsed: 0,
          duration: 4.5,
        },
      },
    };
  }

  return {
    outcome: 'proceeding',
    state: {
      ...state,
      crossingBeat: 3,
      holdBeamActive: false,
      phase: 'rescue_sequence',
      rescueElapsed: 0,
      hornBlown: true,
      ferrySpeedPhase: 'clearing',
      beamFeedback: null,
      subtitle: {
        speaker: 'M/V Thendral',
        text: 'E-4 clear, PROCEED received! Full ahead on 072° East through the Vaanthurai breakwaters!',
        elapsed: 0,
        duration: 6.5,
      },
    },
  };
}

/** Legacy 1-button Hold Beam wrapper preserved for existing Floor 3 tests */
export function triggerHoldBeam(state: GameState): { state: GameState; outcome: 'holding' | 'off_course' | 'not_ready' } {
  if (state.phase === 'rescue_sequence' || state.phase === 'dawn_epilogue' || state.phase === 'credits') {
    return { state, outcome: 'not_ready' };
  }
  if (!state.lampSwitchOn) {
    return {
      outcome: 'not_ready',
      state: {
        ...state,
        beamFeedback: 'Ignite the Fresnel lamp switch before signaling the ferry.',
      },
    };
  }
  if (state.bearingDegrees !== TARGET_BEARING) {
    return {
      outcome: 'off_course',
      state: {
        ...state,
        holdBeamActive: false,
        holdBeamElapsed: 0,
        activeTransmission: 'meera_offcourse',
        beamFeedback: `Bearing ${formatBearing(state.bearingDegrees)} is outside East Channel (072°).`,
        subtitle: {
          speaker: 'Captain Meera (M/V Thendral)',
          text: `Your beam at ${formatBearing(state.bearingDegrees)} is outside the channel! Swing to 072° East.`,
          elapsed: 0,
          duration: 5.0,
        },
      },
    };
  }
  return {
    outcome: 'holding',
    state: {
      ...state,
      crossingBeat: Math.max(state.crossingBeat, 1) as 0 | 1 | 2 | 3,
      holdBeamActive: true,
      holdBeamElapsed: 0,
      beamFeedback: null,
      subtitle: {
        speaker: 'Lantern Room',
        text: 'Holding beam on 072° East Channel — watch E-4 drift clear of the marker!',
        elapsed: 0,
        duration: 5.0,
      },
    },
  };
}

export function blowWheelhouseHorn(state: GameState): GameState {
  if (state.phase !== 'rescue_sequence') return state;
  return {
    ...state,
    wheelhouseHornTriggered: true,
    subtitle: {
      speaker: 'Captain Meera (Wheelhouse)',
      text: 'Two short blasts — clearing the south jetty now!',
      elapsed: 0,
      duration: 4.0,
    },
  };
}

// ============================================================================
// CHAPTER 6: DAWN EPILOGUE (JETTY + RADIO ROOM STAMPED CHART)
// ============================================================================

export function speakMeeraAshore(state: GameState): GameState {
  if (state.phase !== 'dawn_epilogue' || state.meeraAshoreSpoken) return state;
  return {
    ...state,
    meeraAshoreSpoken: true,
    activeTransmission: 'meera_closing',
    subtitle: {
      speaker: 'Captain Meera',
      text: 'I saw Muthu’s brass storm lantern still burning on the post as we cleared the south wall. Here’s our bridge log — stamp the corrected chart upstairs!',
      elapsed: 0,
      duration: 7.5,
    },
  };
}

export function stampCorrectedChart(state: GameState): { state: GameState; stamped: boolean } {
  if (state.phase !== 'dawn_epilogue') return { state, stamped: false };
  if (state.mode !== 'event' && !state.meeraAshoreSpoken) {
    return {
      stamped: false,
      state: {
        ...state,
        subtitle: {
          speaker: 'Radio Room Chart',
          text: 'Head down to the Jetty first — Captain Meera has stepped ashore by M/V Thendral.',
          elapsed: 0,
          duration: 4.5,
        },
      },
    };
  }
  return {
    stamped: true,
    state: {
      ...state,
      chartStamped: true,
      subtitle: {
        speaker: 'Corrected Harbor Chart',
        text: 'Stamped "BUOY E-4 ADRIFT · 072° FIXED GATE VERIFIED". Hang the framed chart on the Radio Room wall.',
        elapsed: 0,
        duration: 5.0,
      },
    },
  };
}

export function hangCorrectedChart(state: GameState, useTamil: boolean): { state: GameState; hung: boolean } {
  if (state.phase !== 'dawn_epilogue' || !state.chartStamped) {
    return {
      hung: false,
      state: {
        ...state,
        subtitle: {
          speaker: 'Chart Frame',
          text: 'Stamp the corrected harbor chart on the desk before hanging it.',
          elapsed: 0,
          duration: 3.5,
        },
      },
    };
  }
  return {
    hung: true,
    state: {
      ...state,
      chartHung: true,
      bellRung: true,
      closingLinePlayed: true,
      activeTransmission: 'meera_closing',
      hintStage: 0,
      subtitle: {
        speaker: 'Captain Meera (M/V Thendral)',
        text: "We're alongside. Everyone's ashore. We saw your light.",
        tamilText: useTamil ? 'எல்லோரும் கரை சேர்ந்துவிட்டோம். உங்கள் வெளிச்சம் தெரிந்தது.' : undefined,
        elapsed: 0,
        duration: 7.5,
      },
    },
  };
}

export function ringAllClearBell(state: GameState, useTamil: boolean): GameState {
  if (state.phase !== 'dawn_epilogue') return state;
  return {
    ...state,
    bellRung: true,
    closingLinePlayed: true,
    activeTransmission: 'meera_closing',
    hintStage: 0,
    subtitle: {
      speaker: 'Captain Meera (M/V Thendral)',
      text: "We're alongside. Everyone's ashore. We saw your light.",
      tamilText: useTamil ? 'எல்லோரும் கரை சேர்ந்துவிட்டோம். உங்கள் வெளிச்சம் தெரிந்தது.' : undefined,
      elapsed: 0,
      duration: 7.5,
    },
  };
}

export function replayClosingLine(state: GameState, useTamil: boolean): GameState {
  if (state.phase !== 'dawn_epilogue' && state.phase !== 'credits') return state;
  return {
    ...state,
    closingLinePlayed: true,
    activeTransmission: 'meera_closing',
    subtitle: {
      speaker: 'Captain Meera (M/V Thendral)',
      text: "We're alongside. Everyone's ashore. We saw your light.",
      tamilText: useTamil ? 'எல்லோரும் கரை சேர்ந்துவிட்டோம். உங்கள் வெளிச்சம் தெரிந்தது.' : undefined,
      elapsed: 0,
      duration: 7.5,
    },
  };
}

// ============================================================================
// SPATIAL TELEPORTATION (SEPARATE FROM STORY PROGRESS)
// ============================================================================

export function isNodeUnlocked(state: GameState, node: TeleportNodeId): { ok: boolean; reason?: string; message?: string } {
  if (node === 'ferry_wheelhouse') {
    if (state.phase === 'rescue_sequence') return { ok: true };
    return {
      ok: false,
      reason: 'wheelhouse_closed',
      message: 'Wheelhouse viewpoint opens once M/V Thendral begins steering through the breakwaters.',
    };
  }

  if (node === 'f2_cabinet' || node === 'f2_generator') {
    if (!state.doorUnlocked) {
      return {
        ok: false,
        reason: 'locked_f1',
        message: 'Check the Radio Room logbook and Cottage chart first before heading up to the Generator Gallery.',
      };
    }
    return { ok: true };
  }

  if (node === 'f3_gear' || node === 'f3_window' || node === 'f3_balcony') {
    if (!state.stairwellPowered && state.chapter < 5) {
      return {
        ok: false,
        reason: 'locked_f2',
        message: 'Restore tower power in Floor 2 Generator Gallery before climbing to the Lantern Room.',
      };
    }
    return { ok: true };
  }

  if (node === 'boathouse_slipway' || node === 'boathouse_upper') {
    if (!state.boathouseUnlocked) {
      return {
        ok: false,
        reason: 'locked_boathouse',
        message: 'The blue-roofed Boathouse is padlocked. Speak with Muthu at the Cottage after aligning the survey chart.',
      };
    }
    return { ok: true };
  }

  if (node === 'cottage_table' || node === 'cottage_window') {
    if (state.phase === 'jetty_opening') {
      return {
        ok: false,
        reason: 'squall_opening',
        message: 'Finish the jetty opening bell first.',
      };
    }
    return { ok: true };
  }

  if (node === 'signal_hut_shutter' || node === 'signal_hut_board') {
    if (state.chapter < 4 && state.mode === 'campaign') {
      return {
        ok: false,
        reason: 'locked_signal_hut',
        message: 'Complete both Chapter 3 leads (Generator & Boathouse E-4) before setting signals at the Signal Hut.',
      };
    }
    return { ok: true };
  }

  return { ok: true };
}

export function teleportToNode(
  state: GameState,
  node: TeleportNodeId
): { state: GameState; moved: boolean; reason?: string } {
  const access = isNodeUnlocked(state, node);
  if (!access.ok) {
    return {
      moved: false,
      reason: access.reason,
      state: {
        ...state,
        subtitle: access.message
          ? {
              speaker: 'Access Locked',
              text: access.message,
              elapsed: 0,
              duration: 3.5,
            }
          : state.subtitle,
      },
    };
  }

  const nextArea = AREA_OF_NODE[node];
  const nextFloor = FLOOR_OF_NODE[node];

  // Phase follows spatial focus only where appropriate without blocking backtracking
  let nextPhase = state.phase;
  if (state.phase === 'open_leads') {
    if (nextArea === 'generator_gallery') nextPhase = 'floor2_generator';
    else if (nextArea === 'boathouse') nextPhase = 'boathouse_investigate';
  } else if (state.phase === 'floor2_generator' && nextArea === 'boathouse') {
    nextPhase = 'boathouse_investigate';
  } else if (state.phase === 'boathouse_investigate' && nextArea === 'generator_gallery') {
    nextPhase = 'floor2_generator';
  } else if (nextArea === 'lantern_room' && state.chapter >= 5 && state.phase === 'signal_hut') {
    nextPhase = 'floor3_lantern';
  }

  return {
    moved: true,
    state: {
      ...state,
      currentFloor: nextFloor,
      currentArea: nextArea,
      currentNode: node,
      phase: nextPhase,
      binocularActive: false,
      telescopeActive: false,
      slitViewActive: false,
      hintStage: 0,
    },
  };
}

// ============================================================================
// SIMULATION STEP
// ============================================================================

export function stepGameSimulation(state: GameState, rawDt: number): {
  state: GameState;
  events: string[];
} {
  const dt = Math.min(Math.max(rawDt, 0), 0.05);
  const events: string[] = [];
  if (state.paused || state.phase === 'title' || state.phase === 'credits') {
    return { state, events };
  }

  let next: GameState = {
    ...state,
    shiftElapsedSeconds: state.shiftElapsedSeconds + dt,
  };

  if (next.subtitle) {
    const elapsed = next.subtitle.elapsed + dt;
    if (elapsed >= next.subtitle.duration) {
      next = {
        ...next,
        subtitle: null,
        activeTransmission: 'none',
      };
    } else {
      next = {
        ...next,
        subtitle: {
          ...next.subtitle,
          elapsed,
        },
      };
    }
  }

  // Opening jetty sequence -> once bell rung + ferry passes, storm cuts grid & drives keeper inside Radio Room
  if (next.phase === 'jetty_opening') {
    const openingElapsed = next.openingElapsed + dt;
    next = { ...next, openingElapsed };
    if (next.openingBellRung && openingElapsed >= 5.2 && !next.powerCutTriggered) {
      next = {
        ...next,
        powerCutTriggered: true,
        emergencyLightOn: true,
        phase: 'floor1_radio',
        currentFloor: 1,
        currentArea: 'radio_room',
        currentNode: 'f1_desk',
        playerPos: { x: -0.35, z: 0.75 },
        activeTransmission: 'none',
        subtitle: {
          speaker: 'Storm Alert',
          text: 'The cyclone snaps the feeder line! Emergency lamp lit inside Radio Room. Answer VHF CH 16.',
          elapsed: 0,
          duration: 5.5,
        },
      };
      events.push('power_cut');
    }
  }

  // Chapter 5: Beat 1 -> Buoy E-4 gradually drifts clear once caught or held
  if ((next.phase === 'floor3_lantern' || next.chapter === 5) && next.crossingBeat === 1) {
    const prevClear = next.e4ClearTimer;
    const e4ClearTimer = Math.min(E4_CROSSING_CLEAR_TIME, prevClear + dt * (next.holdBeamActive ? 1.25 : 0.75));
    next = { ...next, e4ClearTimer };
    if (prevClear < E4_CROSSING_CLEAR_TIME * 0.85 && e4ClearTimer >= E4_CROSSING_CLEAR_TIME * 0.85) {
      next = {
        ...next,
        crossingBeat: 2,
        subtitle: {
          speaker: 'Balcony Lookout',
          text: 'Drifting E-4 has cleared the North marker! Operate the East Shutter to signal PROCEED!',
          elapsed: 0,
          duration: 6.0,
        },
      };
      events.push('e4_cleared');
    }
  }

  // Legacy floor3_lantern holdBeam countdown support when crossingBeat isn't used explicitly
  if (next.phase === 'floor3_lantern' && next.holdBeamActive && next.crossingBeat === 1 && next.mode === 'campaign' && !next.plotRouteConfirmed) {
    const holdElapsed = next.holdBeamElapsed + dt;
    if (holdElapsed >= HOLD_BEAM_DURATION) {
      next = {
        ...next,
        holdBeamActive: false,
        holdBeamElapsed: HOLD_BEAM_DURATION,
        phase: 'rescue_sequence',
        rescueElapsed: 0,
        hornBlown: true,
        ferrySpeedPhase: 'clearing',
        subtitle: {
          speaker: 'M/V Thendral',
          text: 'Beam sighted! Turning between the breakwaters now!',
          elapsed: 0,
          duration: 6.0,
        },
      };
      events.push('rescue_started');
    } else {
      next = { ...next, holdBeamElapsed: holdElapsed };
    }
  }

  // Rescue crossing sequence -> Dawn Epilogue on the Jetty
  if (next.phase === 'rescue_sequence') {
    const rescueElapsed = next.rescueElapsed + dt;
    if (rescueElapsed >= RESCUE_SEQUENCE_DURATION) {
      next = {
        ...next,
        rescueElapsed: RESCUE_SEQUENCE_DURATION,
        chapter: 6,
        phase: 'dawn_epilogue',
        ferrySpeedPhase: 'moored',
        currentFloor: 1,
        currentArea: 'jetty',
        currentNode: 'jetty_head',
        playerPos: { x: 27.5, z: 11.0 },
        dawnMix: 0.2,
        subtitle: {
          speaker: 'Dawn at Vaanthurai',
          text: 'First light breaks over Vaanthurai Harbor. M/V Thendral rests at the jetty — speak with Captain Meera ashore.',
          elapsed: 0,
          duration: 7.0,
        },
      };
      events.push('dawn_arrived');
    } else {
      next = { ...next, rescueElapsed };
    }
  } else if (next.phase === 'dawn_epilogue') {
    if (next.dawnMix < 1) {
      next = { ...next, dawnMix: Math.min(1, next.dawnMix + dt * 0.25) };
    }
  }

  return { state: next, events };
}

export function formatBearing(deg: number): string {
  return `${String(Math.round(deg)).padStart(3, '0')}°`;
}

export function getActiveObjective(state: GameState): string {
  if (state.phase === 'title') return 'Stand watch at Vaanthurai Harbor';
  if (state.phase === 'jetty_opening') {
    if (!state.lanternFastened) return 'Ch.1 · Fasten Muthu’s brass storm lantern on the jetty';
    if (!state.openingBellRung) return 'Ch.1 · Ring the jetty departure bell for M/V Thendral';
    return 'Ch.1 · Return inside as the squall breaks';
  }
  if (state.phase === 'floor1_radio' && state.chapter === 1) {
    if (!state.radioSolved) return 'Ch.1 · Answer the distress call on VHF CH 16';
    if (!state.lightsObserved) return 'Ch.1 · Focus binoculars on the 3 lights through the east window';
    return 'Ch.1 · Record the drifting third light in the desk log';
  }
  if (state.chapter === 2) {
    if (!state.drawerOpened) return 'Ch.2 · Search the Cottage chart table drawer';
    if (!state.overlayAligned) return 'Ch.2 · Rotate the transparent survey overlay until marks align';
    return 'Ch.2 · Speak with Muthu at the Cottage for the Boathouse key';
  }
  if (state.chapter === 3) {
    if (state.mode === 'event') {
      if (!state.telescopeReadBuoy) return 'Event · Identify drifting Buoy E-4 via Boathouse telescope';
      if (!state.overlayAligned) return 'Event · Align transparent survey overlay at Cottage chart table';
      return 'Event · Climb to Lantern Room for the crossing';
    }
    const gDone = state.generatorRunning;
    const bDone = state.boathouseLeadComplete;
    if (!gDone && !bDone) return 'Ch.3 · Open leads: Restore Generator (Floor 2) & ID Buoy E-4 (Boathouse)';
    if (!gDone) return 'Ch.3 · Restore Generator power on Floor 2';
    return 'Ch.3 · Complete Boathouse telescope & flash drum verification (E-4)';
  }
  if (state.chapter === 4) {
    if (!state.shutterHousingOpen) return 'Ch.4 · Open East Shutter housing in the Signal Hut';
    if (!state.shutterGearSeated) return 'Ch.4 · Seat the slipped coupling gear on the shutter';
    if (!state.shutterTested) return 'Ch.4 · Test the East Shutter lever';
    return 'Ch.4 · Plot both fixed breakwater gates & mark E-4 drifting on Plot Board';
  }
  if (state.chapter === 5) {
    if (state.phase === 'rescue_sequence') return 'Ch.5 · Watch M/V Thendral clear the Vaanthurai channel';
    if (!state.drivePinSeated) return 'Ch.5 · Take & seat the brass drive pin on the Fresnel turret';
    if (!state.lampSwitchOn) return 'Ch.5 · Ignite the main Fresnel lamp switch';
    if (state.crossingBeat === 0) return 'Ch.5 · Crank beam to 072° East & Catch Outer Marker';
    if (state.crossingBeat === 1) return 'Ch.5 · Signal HOLD while drifting E-4 crosses the approach';
    return 'Ch.5 · Operate repaired East Shutter to signal PROCEED!';
  }
  if (state.phase === 'dawn_epilogue') {
    if (state.mode !== 'event' && !state.meeraAshoreSpoken) return 'Epilogue · Speak with Captain Meera on the dawn jetty';
    if (!state.chartStamped) return 'Epilogue · Stamp the corrected harbor chart in the Radio Room';
    if (!state.chartHung) return 'Epilogue · Hang the corrected chart on the Radio Room wall';
    return 'Epilogue · All ashore — Complete shift when ready';
  }
  return 'Watch complete';
}

export function getStagedHint(state: GameState): { propName: string; detail: string } | null {
  switch (state.chapter) {
    case 1:
      if (state.phase === 'jetty_opening') {
        return !state.lanternFastened
          ? { propName: 'Brass Storm Lantern (Jetty)', detail: 'Click the lantern bracket beside Muthu to fasten it.' }
          : { propName: 'Jetty Departure Bell', detail: 'Ring the brass bell on the jetty post to clear M/V Thendral.' };
      }
      if (!state.radioSolved) {
        return {
          propName: 'VHF Marine Radio (Radio Desk)',
          detail:
            state.radioChannel === TARGET_CHANNEL
              ? 'Press the red LISTEN button to answer Captain Meera.'
              : `Tune right from CH ${state.radioChannel} to CH 16, then press LISTEN.`,
        };
      }
      if (!state.lightsObserved) {
        return {
          propName: 'Binoculars (East Window)',
          detail: 'Open the Binoculars and adjust focus until step 6–8 locks onto the 3 intermittent lights.',
        };
      }
      return {
        propName: 'Desk Logbook',
        detail: 'Click the watch logbook on the Radio Desk to sketch the third drifting light.',
      };
    case 2:
      if (!state.drawerOpened) {
        return { propName: 'Cottage Chart Table Drawer', detail: 'Open the drawer on Muthu’s chart table across the covered walkway.' };
      }
      if (!state.overlayAligned) {
        return {
          propName: 'Transparent Survey Overlay',
          detail: `Rotate the overlay from ${state.overlayAngleDeg}° to 0° until lighthouse and boathouse marks align.`,
        };
      }
      return { propName: 'Keeper Muthu (Cottage Porch)', detail: 'Speak with Muthu to collect the Boathouse key.' };
    case 3:
      if (state.currentArea === 'boathouse' || (state.generatorRunning && !state.boathouseLeadComplete)) {
        if (!state.telescopeReadBuoy) {
          return {
            propName: 'Mounted Telescope (Boathouse Upper)',
            detail: 'Climb the tide scale landing and focus the telescope (step 5–7) between swells.',
          };
        }
        if (!state.buoyCardConfirmed) {
          return { propName: 'Maintenance Cards', detail: 'Select Card E-4 (Double-Flash Amber) on the bench.' };
        }
        return {
          propName: 'Flash Drum Rack & Bench Tester',
          detail: 'Select the Double-Flash drum and test it on the bench tester.',
        };
      }
      if (!state.cabinetOpen) {
        return { propName: 'Fuse Cabinet (Floor 2)', detail: 'Open the cabinet door and inspect the wiring diagram.' };
      }
      if (!areAllCartridgesSeated(state)) {
        return { propName: 'Keyed Fuse Cartridges', detail: 'Match AUX ○, DRIVE △, BEACON □ to their sockets.' };
      }
      return { propName: 'Main Isolator Lever', detail: 'Pull the red-handled isolator lever on the generator.' };
    case 4:
      if (!state.shutterGearSeated) {
        return { propName: 'East Shutter Housing (Signal Hut)', detail: 'Open the shutter cover and seat the disengaged coupling gear.' };
      }
      if (!state.shutterTested) {
        return { propName: 'Shutter Test Lever', detail: 'Pull the test lever to confirm crisp shutter movement.' };
      }
      return {
        propName: 'Harbor Plot Board',
        detail: 'Enable North Gate, South Gate, and Buoy E-4 Drifting, then confirm the plotted route.',
      };
    case 5:
      if (!state.drivePinSeated) {
        return { propName: 'Drive Pin Tray & Coupling', detail: 'Take the brass drive pin and seat it on the turret gear.' };
      }
      if (!state.lampSwitchOn) {
        return { propName: 'Fresnel Lamp Switch', detail: 'Pull the switch to ignite the main halogen core.' };
      }
      if (state.crossingBeat === 0) {
        return { propName: 'Hand Crank (072° E)', detail: `Crank from ${formatBearing(state.bearingDegrees)} to 072° and select Catch Outer Marker.` };
      }
      if (state.crossingBeat === 1) {
        return { propName: 'Signal HOLD & Balcony Watch', detail: 'Signal HOLD while drifting E-4 finishes clearing the channel.' };
      }
      return { propName: 'East Shutter PROCEED', detail: 'Signal PROCEED using the repaired shutter once E-4 clears the north breakwater.' };
    case 6:
      if (!state.meeraAshoreSpoken && state.mode !== 'event') {
        return { propName: 'Captain Meera (Dawn Jetty)', detail: 'Speak with Captain Meera standing beside M/V Thendral.' };
      }
      if (!state.chartStamped) {
        return { propName: 'Radio Room Chart Stamp', detail: 'Return to Floor 1 Radio Desk and stamp the corrected harbor chart.' };
      }
      return { propName: 'Wall Chart Frame', detail: 'Hang the stamped chart in its frame to close your watch.' };
  }
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function getSafeStorage(storage?: StorageLike): StorageLike | null {
  if (storage) return storage;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

function storageKeyForMode(mode: GameMode): string {
  return mode === 'event' ? EVENT_SAVE_STORAGE_KEY : SAVE_STORAGE_KEY;
}

export function saveCheckpoint(state: GameState, storage?: StorageLike): boolean {
  const store = getSafeStorage(storage);
  if (!store || state.phase === 'title') return false;
  try {
    const payload: GameState = {
      ...state,
      paused: false,
      subtitle: null,
      binocularActive: false,
      telescopeActive: false,
      slitViewActive: false,
    };
    store.setItem(storageKeyForMode(state.mode), JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

interface LegacyV1Save {
  version?: number;
  phase?: string;
  inputMode?: InputMode;
  currentFloor?: FloorId;
  currentNode?: string;
  radioChannel?: number;
  radioSolved?: boolean;
  chartLit?: boolean;
  doorUnlocked?: boolean;
  cabinetOpen?: boolean;
  sockets?: Record<SocketShape, CartridgeId | null>;
  isolatorPulled?: boolean;
  generatorRunning?: boolean;
  stairwellPowered?: boolean;
  drivePinTaken?: boolean;
  drivePinSeated?: boolean;
  lampSwitchOn?: boolean;
  bearingDegrees?: number;
  bellRung?: boolean;
  closingLinePlayed?: boolean;
  shiftElapsedSeconds?: number;
}

export function migrateLegacyV1Save(rawParsed: LegacyV1Save): GameState | null {
  if (!rawParsed || !rawParsed.phase || rawParsed.phase === 'title') return null;
  const base = createInitialGameState(rawParsed.inputMode ?? 'screen', 'campaign');

  // Map v1 phases into valid v2 checkpoints with reachable next action
  let chapter: StoryChapter = 1;
  let phase: GamePhase = 'floor1_radio';
  let currentNode: TeleportNodeId = 'f1_desk';

  if (rawParsed.phase === 'floor1_radio' || rawParsed.phase === 'handover') {
    chapter = rawParsed.doorUnlocked ? 3 : 1;
    phase = rawParsed.doorUnlocked ? 'floor2_generator' : 'floor1_radio';
    currentNode = rawParsed.doorUnlocked ? 'f2_cabinet' : 'f1_desk';
  } else if (rawParsed.phase === 'floor2_generator') {
    chapter = 3;
    phase = 'floor2_generator';
    currentNode = rawParsed.currentNode === 'f2_generator' ? 'f2_generator' : 'f2_cabinet';
  } else if (rawParsed.phase === 'floor3_lantern') {
    chapter = 5;
    phase = 'floor3_lantern';
    currentNode = rawParsed.currentNode === 'f3_balcony' ? 'f3_balcony' : 'f3_gear';
  } else if (rawParsed.phase === 'rescue_sequence') {
    chapter = 5;
    phase = 'rescue_sequence';
    currentNode = 'f3_balcony';
  } else if (rawParsed.phase === 'dawn_epilogue' || rawParsed.phase === 'credits') {
    chapter = 6;
    phase = 'dawn_epilogue';
    currentNode = 'jetty_head';
  }

  const migrated: GameState = {
    ...base,
    chapter,
    phase,
    currentFloor: FLOOR_OF_NODE[currentNode],
    currentArea: AREA_OF_NODE[currentNode],
    currentNode,
    lanternFastened: true,
    openingBellRung: true,
    openingFerryPassed: true,
    powerCutTriggered: true,
    emergencyLightOn: true,
    radioChannel: rawParsed.radioChannel ?? 16,
    radioSolved: Boolean(rawParsed.radioSolved || chapter >= 2),
    chartLit: Boolean(rawParsed.chartLit || chapter >= 2),
    lightsObserved: chapter >= 2,
    sketchRecorded: chapter >= 2,
    doorUnlocked: Boolean(rawParsed.doorUnlocked || chapter >= 3),
    drawerOpened: chapter >= 3,
    overlayPlaced: chapter >= 3,
    overlayAngleDeg: chapter >= 3 ? 0 : -15,
    overlayAligned: chapter >= 3,
    cottageWindowMatched: chapter >= 3,
    muthuKeyGiven: chapter >= 3,
    boathouseUnlocked: chapter >= 3,
    cabinetOpen: Boolean(rawParsed.cabinetOpen || chapter >= 4),
    wiringPlateOpened: Boolean(rawParsed.cabinetOpen || chapter >= 4),
    inspectionLampOn: Boolean(rawParsed.cabinetOpen || chapter >= 4),
    sockets: rawParsed.sockets ?? (chapter >= 4 ? { circle: 'AUX', triangle: 'DRIVE', square: 'BEACON' } : base.sockets),
    isolatorPulled: Boolean(rawParsed.isolatorPulled || chapter >= 4),
    generatorRunning: Boolean(rawParsed.generatorRunning || chapter >= 4),
    stairwellPowered: Boolean(rawParsed.stairwellPowered || chapter >= 4),
    exteriorPowerRestored: Boolean(rawParsed.generatorRunning || chapter >= 4),
    telescopeReadBuoy: chapter >= 4,
    buoyCardConfirmed: chapter >= 4,
    selectedBuoyCard: chapter >= 4 ? 'E-4' : null,
    selectedDrum: chapter >= 4 ? 'double_flash' : null,
    drumTestedMatch: chapter >= 4,
    boathouseLeadComplete: chapter >= 4,
    shutterHousingOpen: chapter >= 5,
    shutterGearSeated: chapter >= 5,
    shutterTested: chapter >= 5,
    plotNorthMarker: chapter >= 5,
    plotSouthMarker: chapter >= 5,
    plotE4Drifting: chapter >= 5,
    plotRouteConfirmed: chapter >= 5,
    drivePinTaken: Boolean(rawParsed.drivePinTaken),
    drivePinSeated: Boolean(rawParsed.drivePinSeated),
    lampSwitchOn: Boolean(rawParsed.lampSwitchOn),
    bearingDegrees: rawParsed.bearingDegrees ?? 60,
    dawnMix: phase === 'dawn_epilogue' ? 1 : 0,
    bellRung: Boolean(rawParsed.bellRung),
    closingLinePlayed: Boolean(rawParsed.closingLinePlayed),
    shiftElapsedSeconds: rawParsed.shiftElapsedSeconds ?? 0,
  };

  return {
    ...migrated,
    subtitle: {
      speaker: 'Checkpoint Migrated',
      text: getActiveObjective(migrated),
      elapsed: 0,
      duration: 4.5,
    },
  };
}

export function loadCheckpoint(storage?: StorageLike, mode: GameMode = 'campaign'): GameState | null {
  const store = getSafeStorage(storage);
  if (!store) return null;
  try {
    const raw = store.getItem(storageKeyForMode(mode));
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GameState>;
      if (parsed && parsed.version === SAVE_VERSION && parsed.phase && parsed.phase !== 'title') {
        const base = createInitialGameState(parsed.inputMode ?? 'screen', parsed.mode ?? mode);
        const restored: GameState = {
          ...base,
          ...parsed,
          mode,
          paused: false,
          binocularActive: false,
          telescopeActive: false,
          slitViewActive: false,
        };
        return {
          ...restored,
          subtitle: {
            speaker: mode === 'event' ? 'Event Session Resumed' : 'Checkpoint Restored',
            text: getActiveObjective(restored),
            elapsed: 0,
            duration: 4.0,
          },
        };
      }
    }

    // Attempt clean v1 -> v2 migration for campaign mode
    if (mode === 'campaign') {
      const legacyRaw = store.getItem(LEGACY_SAVE_STORAGE_KEY);
      if (legacyRaw) {
        return migrateLegacyV1Save(JSON.parse(legacyRaw) as LegacyV1Save);
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function clearCheckpoint(storage?: StorageLike, mode: GameMode = 'campaign'): void {
  const store = getSafeStorage(storage);
  if (!store) return;
  try {
    store.removeItem(storageKeyForMode(mode));
  } catch {
    // Ignore storage error
  }
}

export function saveSettings(settings: GameSettings, storage?: StorageLike): void {
  const store = getSafeStorage(storage);
  if (!store) return;
  try {
    store.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage error
  }
}

export function loadSettings(storage?: StorageLike): GameSettings {
  const defaults = createDefaultSettings();
  const store = getSafeStorage(storage);
  if (!store) return defaults;
  try {
    const raw = store.getItem(SETTINGS_STORAGE_KEY) || store.getItem(LEGACY_SETTINGS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    const clamp01 = (val: unknown, fb: number) => Math.max(0, Math.min(1, Number(val ?? fb)));
    return {
      ...defaults,
      ...parsed,
      masterVolume: clamp01(parsed.masterVolume, defaults.masterVolume),
      dialogueVolume: clamp01(parsed.dialogueVolume, defaults.dialogueVolume),
      effectsVolume: clamp01(parsed.effectsVolume, defaults.effectsVolume),
      musicVolume: clamp01(parsed.musicVolume, defaults.musicVolume),
      seatedHeightOffset: Math.max(-0.4, Math.min(0.4, Number(parsed.seatedHeightOffset ?? 0))),
    };
  } catch {
    return defaults;
  }
}
