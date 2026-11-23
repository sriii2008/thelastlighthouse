import { useCallback, useEffect, useRef, useState } from 'react';
import { soundEngine } from './audio/soundEngine';
import { CreditsScreen } from './components/CreditsScreen';
import { GameHud } from './components/GameHud';
import { SettingsModal } from './components/SettingsModal';
import { TitleScreen } from './components/TitleScreen';
import {
  adjustBinocularsFocus,
  adjustTelescopeFocus,
  blowWheelhouseHorn,
  checkCottageWindowMatch,
  checkTideScale,
  clearCheckpoint,
  confirmPlotBoard,
  createInitialGameState,
  fastenJettyLantern,
  hangCorrectedChart,
  identifyBuoyCard,
  inspectCottageKettle,
  inspectCottageTideMarks,
  interactSocket,
  loadCheckpoint,
  loadSettings,
  openCottageDrawer,
  openShutterHousing,
  openWiringPlate,
  pressRadioListen,
  pullIsolatorLever,
  pullLampSwitch,
  recordObservationSketch,
  replayClosingLine,
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
  toggleBinoculars,
  toggleCabinetDoor,
  togglePlotPin,
  toggleSlitView,
  toggleTelescope,
  triggerCatchOuterMarker,
  triggerHoldBeam,
  triggerSignalHold,
  triggerSignalProceed,
  turnCrank,
  turnRadioDial,
  type BuoyCardId,
  type CartridgeId,
  type DrumPatternId,
  type GameSettings,
  type GameState,
  type InputMode,
  type SocketShape,
  type TeleportNodeId,
} from './game/gameState';
import { LighthouseEngine } from './three/LighthouseEngine';

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<LighthouseEngine | null>(null);

  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [campaignCheckpoint, setCampaignCheckpoint] = useState<GameState | null>(() =>
    loadCheckpoint(undefined, 'campaign')
  );
  const [eventCheckpoint, setEventCheckpoint] = useState<GameState | null>(() =>
    loadCheckpoint(undefined, 'event')
  );

  const [gameState, setGameState] = useState<GameState>(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const autostart = params?.get('autostart') === '1';
    const isEvent = params?.get('mode') === 'event';
    const initialMode: InputMode = params?.get('stereo') === '1' ? 'phone-vr' : 'screen';
    const base = createInitialGameState(initialMode, isEvent ? 'event' : 'campaign');
    if (!autostart) return base;
    return isEvent ? startEventEdition(base) : startNewCampaign(base, false);
  });

  const stateRef = useRef<GameState>(gameState);
  const settingsRef = useRef<GameSettings>(settings);
  stateRef.current = gameState;
  settingsRef.current = settings;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [webXrSupported, setWebXrSupported] = useState(false);
  const [hoverTarget, setHoverTarget] = useState<{ actionId: string; label: string } | null>(null);
  const [dwellProgress, setDwellProgress] = useState(0);
  const [fadeOpacity, setFadeOpacity] = useState(0);
  const [sensorStatus, setSensorStatus] = useState<'checking' | 'active' | 'unavailable'>('checking');
  const [contextLost, setContextLost] = useState(false);
  const [isPortrait, setIsPortrait] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false
  );

  const refreshCheckpointBadges = useCallback(() => {
    setCampaignCheckpoint(loadCheckpoint(undefined, 'campaign'));
    setEventCheckpoint(loadCheckpoint(undefined, 'event'));
  }, []);

  const persistCheckpoint = useCallback(
    (st: GameState) => {
      saveCheckpoint(st);
      if (st.mode === 'event') setEventCheckpoint(st);
      else setCampaignCheckpoint(st);
    },
    []
  );

  const commitState = useCallback((next: GameState) => {
    stateRef.current = next;
    setGameState(next);
  }, []);

  useEffect(() => {
    const bodyState =
      gameState.phase === 'title'
        ? 'title'
        : gameState.phase === 'credits'
        ? 'gameover'
        : gameState.paused
        ? 'paused'
        : 'playing';
    document.body.dataset.state = bodyState;
    document.body.dataset.phase = gameState.phase;
    document.body.dataset.chapter = String(gameState.chapter);
    document.body.dataset.mode = gameState.mode;
  }, [gameState.phase, gameState.paused, gameState.chapter, gameState.mode]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.xr?.isSessionSupported) {
      navigator.xr
        .isSessionSupported('immersive-vr')
        .then((ok) => setWebXrSupported(Boolean(ok)))
        .catch(() => setWebXrSupported(false));
    }
  }, []);

  useEffect(() => {
    const onResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
      engineRef.current?.handleResize();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    soundEngine.applySettings(settings);
    saveSettings(settings);
    engineRef.current?.applyQualityProfile(settings);
    engineRef.current?.updateSeatedHeight(
      settings.seatedHeightOffset,
      stateRef.current.currentNode,
      stateRef.current.phase
    );
  }, [settings]);

  useEffect(() => {
    if (gameState.phase === 'title') {
      soundEngine.setScoreMood('silent');
    } else if (gameState.phase === 'dawn_epilogue' || gameState.phase === 'credits') {
      soundEngine.setScoreMood('dawn');
    } else if (gameState.generatorRunning) {
      soundEngine.setScoreMood('powered');
    } else {
      soundEngine.setScoreMood('storm');
    }
  }, [gameState.phase, gameState.generatorRunning]);

  const handleAction = useCallback(
    (actionId: string) => {
      soundEngine.unlock();
      const curr = stateRef.current;
      const cfg = settingsRef.current;

      // Teleportation between harbor stations
      if (actionId.startsWith('teleport_')) {
        const nodeId = actionId.replace('teleport_', '') as TeleportNodeId;
        const res = teleportToNode(curr, nodeId);
        commitState(res.state);
        if (res.moved) {
          soundEngine.playTeleportWhoosh();
          engineRef.current?.fadeTeleportToNode(nodeId, cfg);
        } else {
          soundEngine.playCartridgeReject();
        }
        return;
      }

      if (actionId === 'door_f1_up') {
        const res = teleportToNode(curr, 'f2_cabinet');
        commitState(res.state);
        if (res.moved) {
          soundEngine.playTeleportWhoosh();
          engineRef.current?.fadeTeleportToNode('f2_cabinet', cfg);
        } else {
          soundEngine.playCartridgeReject();
        }
        return;
      }

      if (actionId === 'door_f2_down') {
        const res = teleportToNode(curr, 'f1_desk');
        commitState(res.state);
        if (res.moved) {
          soundEngine.playTeleportWhoosh();
          engineRef.current?.fadeTeleportToNode('f1_desk', cfg);
        }
        return;
      }

      if (actionId === 'door_f2_up') {
        const res = teleportToNode(curr, 'f3_gear');
        commitState(res.state);
        if (res.moved) {
          soundEngine.playTeleportWhoosh();
          engineRef.current?.fadeTeleportToNode('f3_gear', cfg);
          persistCheckpoint(res.state);
        } else {
          soundEngine.playCartridgeReject();
        }
        return;
      }

      if (actionId === 'door_f3_down') {
        const res = teleportToNode(curr, 'f2_generator');
        commitState(res.state);
        if (res.moved) {
          soundEngine.playTeleportWhoosh();
          engineRef.current?.fadeTeleportToNode('f2_generator', cfg);
        }
        return;
      }

      // Chapter 1: Jetty Opening
      if (actionId === 'jetty_help_lantern') {
        const next = fastenJettyLantern(curr);
        if (next !== curr) {
          commitState(next);
          soundEngine.playDrivePinClink();
          engineRef.current?.triggerGloveAnimation('lever');
        }
        return;
      }

      if (actionId === 'jetty_ring_bell') {
        const res = ringOpeningBell(curr);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('lever');
        if (res.rung) {
          soundEngine.playAllClearBell();
          window.setTimeout(() => soundEngine.playDoubleShortHorn(), 450);
        } else {
          soundEngine.playCartridgeReject();
        }
        return;
      }

      // Chapter 1: Radio Room & Binoculars
      if (actionId === 'radio_dial_left' || actionId === 'radio_dial_right') {
        const delta = actionId === 'radio_dial_left' ? -1 : 1;
        const next = turnRadioDial(curr, delta);
        if (next !== curr) {
          commitState(next);
          soundEngine.playDialClick(next.radioChannel);
          engineRef.current?.triggerGloveAnimation('turn');
        }
        return;
      }

      if (actionId === 'radio_listen' || actionId === 'radio_replay') {
        const targetState =
          actionId === 'radio_replay' && curr.radioSolved ? { ...curr, radioChannel: 16 } : curr;
        const res = pressRadioListen(targetState);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('press');

        if (res.outcome === 'static') {
          soundEngine.playListenStatic();
        } else {
          soundEngine.playRadioClearChime();
          if (res.outcome === 'distress') {
            persistCheckpoint(res.state);
          }
          soundEngine.speakLine(
            'Keeper, I have three lights ahead. Your chart shows two. Which one do I follow?',
            'meera'
          );
        }
        return;
      }

      if (actionId === 'radio_binoculars') {
        const next = toggleBinoculars(curr);
        commitState(next);
        if (next.binocularActive) {
          engineRef.current?.setLookAngles(-1.25, -0.05);
        } else {
          engineRef.current?.syncImmediateRender();
        }
        soundEngine.playTeleportWhoosh();
        return;
      }

      if (actionId === 'radio_binoc_in' || actionId === 'radio_binoc_out') {
        const res = adjustBinocularsFocus(curr, actionId === 'radio_binoc_in' ? 1 : -1);
        commitState(res.state);
        engineRef.current?.syncImmediateRender();
        soundEngine.playDialClick(res.state.binocularFocus + 10);
        return;
      }

      if (actionId === 'radio_record_sketch') {
        const res = recordObservationSketch(curr);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('press');
        if (res.recorded) {
          soundEngine.playChartStamp();
          persistCheckpoint(res.state);
        } else {
          soundEngine.playCartridgeReject();
        }
        return;
      }

      // Chapter 2: Keeper's Cottage
      if (actionId === 'cottage_inspect_kettle') {
        commitState(inspectCottageKettle(curr));
        soundEngine.playDrivePinClink();
        return;
      }

      if (actionId === 'cottage_inspect_tidemarks') {
        commitState(inspectCottageTideMarks(curr));
        soundEngine.playDialClick(12);
        return;
      }

      if (actionId === 'cottage_open_drawer') {
        const next = openCottageDrawer(curr);
        if (next !== curr) {
          commitState(next);
          soundEngine.playOverlaySlide();
          engineRef.current?.triggerGloveAnimation('lever');
        }
        return;
      }

      if (actionId === 'cottage_overlay_left' || actionId === 'cottage_overlay_right') {
        const res = rotateChartOverlay(curr, actionId === 'cottage_overlay_left' ? -5 : 5);
        commitState(res.state);
        soundEngine.playOverlaySlide();
        engineRef.current?.triggerGloveAnimation('turn');
        if (res.aligned) {
          soundEngine.playRadioClearChime();
          persistCheckpoint(res.state);
        }
        return;
      }

      if (actionId === 'cottage_window_check') {
        const next = checkCottageWindowMatch(curr);
        commitState(next);
        soundEngine.playDialClick(15);
        return;
      }

      if (actionId === 'cottage_talk_muthu') {
        const res = talkMuthuCottage(curr);
        commitState(res.state);
        if (res.unlocked) {
          soundEngine.playDoorUnlock();
          soundEngine.playDrivePinClink();
          persistCheckpoint(res.state);
          soundEngine.speakLine(
            'I fitted that lamp myself. Take the boathouse key and get the generator online!',
            'muthu'
          );
        } else {
          soundEngine.playCartridgeReject();
        }
        return;
      }

      // Chapter 3 Lead A: Generator Gallery
      if (actionId === 'gen_wiring_plate') {
        const next = openWiringPlate(curr);
        commitState(next);
        soundEngine.playCabinetLatch();
        engineRef.current?.triggerGloveAnimation('lever');
        return;
      }

      if (actionId === 'gen_door_toggle') {
        const next = toggleCabinetDoor(curr);
        if (next !== curr) {
          commitState(next);
          soundEngine.playCabinetLatch();
          engineRef.current?.triggerGloveAnimation('lever');
        }
        return;
      }

      if (actionId.startsWith('gen_cartridge_')) {
        const cid = actionId.replace('gen_cartridge_', '') as CartridgeId;
        const next = selectCartridge(curr, cid);
        if (next !== curr) {
          commitState(next);
          soundEngine.playDialClick(14);
          engineRef.current?.triggerGloveAnimation('press');
        }
        return;
      }

      if (actionId.startsWith('gen_socket_')) {
        const shape = actionId.replace('gen_socket_', '') as SocketShape;
        const res = interactSocket(curr, shape);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('press');
        if (res.outcome === 'inserted') soundEngine.playCartridgeInsert();
        else if (res.outcome === 'removed') soundEngine.playCartridgeRemove();
        else if (res.outcome === 'rejected') {
          soundEngine.playCartridgeReject();
          engineRef.current?.triggerRejectShake();
        }
        return;
      }

      if (actionId === 'gen_isolator') {
        const res = pullIsolatorLever(curr);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('lever');
        if (res.powered) {
          soundEngine.playIsolatorLever();
          persistCheckpoint(res.state);
        } else {
          soundEngine.playCartridgeReject();
        }
        return;
      }

      // Chapter 3 Lead B: Boathouse
      if (actionId === 'boathouse_check_tide') {
        commitState(checkTideScale(curr));
        soundEngine.playDialClick(11);
        return;
      }

      if (actionId === 'boathouse_telescope_toggle') {
        const next = toggleTelescope(curr);
        commitState(next);
        if (next.telescopeActive) {
          engineRef.current?.setLookAngles(-1.42, -0.05);
        } else {
          engineRef.current?.syncImmediateRender();
        }
        soundEngine.playTeleportWhoosh();
        return;
      }

      if (actionId === 'boathouse_focus_in' || actionId === 'boathouse_focus_out') {
        const res = adjustTelescopeFocus(curr, actionId === 'boathouse_focus_in' ? 1 : -1);
        commitState(res.state);
        engineRef.current?.syncImmediateRender();
        soundEngine.playDialClick(res.state.telescopeFocus + 10);
        if (res.locked) {
          soundEngine.playRadioClearChime();
          persistCheckpoint(res.state);
        }
        return;
      }

      if (actionId === 'boathouse_card_e4' || actionId === 'boathouse_card_d2') {
        const card = (actionId === 'boathouse_card_e4' ? 'E-4' : 'D-2') as BuoyCardId;
        const res = identifyBuoyCard(curr, card);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('press');
        if (res.outcome === 'matched') soundEngine.playRadioClearChime();
        else soundEngine.playCartridgeReject();
        return;
      }

      if (actionId.startsWith('boathouse_drum_')) {
        const drum = actionId.replace('boathouse_drum_', '') as DrumPatternId;
        commitState(selectFlashDrum(curr, drum));
        soundEngine.playCartridgeInsert();
        engineRef.current?.triggerGloveAnimation('press');
        return;
      }

      if (actionId === 'boathouse_test_drum') {
        const res = testDrumOnBench(curr);
        commitState(res.state);
        soundEngine.playDoubleFlashBench(res.matched);
        engineRef.current?.triggerGloveAnimation('lever');
        if (res.matched) {
          persistCheckpoint(res.state);
          if (res.state.chapter === 4) {
            soundEngine.speakLine(
              'I see the double flash crossing my bow! Give me a clear signal from the Signal Hut!',
              'meera'
            );
          }
        }
        return;
      }

      // Chapter 4: Signal Hut & Plot Board
      if (actionId === 'shut_open_housing') {
        commitState(openShutterHousing(curr));
        soundEngine.playCabinetLatch();
        engineRef.current?.triggerGloveAnimation('lever');
        return;
      }

      if (actionId === 'shut_seat_gear') {
        const res = seatShutterGear(curr);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('press');
        if (res.seated) soundEngine.playCartridgeInsert();
        else soundEngine.playCartridgeReject();
        return;
      }

      if (actionId === 'shut_test_lever') {
        const res = testShutterLever(curr);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('lever');
        if (res.tested) soundEngine.playShutterVane();
        else soundEngine.playCartridgeReject();
        return;
      }

      if (actionId === 'shut_look_slit') {
        const next = toggleSlitView(curr);
        commitState(next);
        if (next.slitViewActive) {
          engineRef.current?.setLookAngles(-1.55, -0.05);
        } else {
          engineRef.current?.syncImmediateRender();
        }
        soundEngine.playTeleportWhoosh();
        return;
      }

      if (actionId === 'shut_pin_north' || actionId === 'shut_pin_south' || actionId === 'shut_pin_e4') {
        const pin =
          actionId === 'shut_pin_north' ? 'north' : actionId === 'shut_pin_south' ? 'south' : 'e4';
        commitState(togglePlotPin(curr, pin));
        soundEngine.playDialClick(15);
        engineRef.current?.triggerGloveAnimation('press');
        return;
      }

      if (actionId === 'shut_confirm_route') {
        const res = confirmPlotBoard(curr);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('lever');
        if (res.confirmed) {
          soundEngine.playRadioClearChime();
          persistCheckpoint(res.state);
          soundEngine.speakLine(
            'Copy — North Red and South Green breakwaters confirmed, ignoring drifting E-4. Light the main Fresnel on 072 East!',
            'meera'
          );
        } else {
          soundEngine.playCartridgeReject();
        }
        return;
      }

      // Chapter 5: Lantern Room 3-Beat Crossing + Wheelhouse
      if (actionId === 'lantern_take_pin') {
        const next = takeDrivePin(curr);
        if (next !== curr) {
          commitState(next);
          soundEngine.playDrivePinClink();
          engineRef.current?.triggerGloveAnimation('press');
        }
        return;
      }

      if (actionId === 'lantern_seat_pin') {
        const res = seatDrivePin(curr);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('press');
        if (res.seated) soundEngine.playDrivePinClink();
        else soundEngine.playCartridgeReject();
        return;
      }

      if (actionId === 'lantern_lamp_switch') {
        const res = pullLampSwitch(curr);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('lever');
        if (res.ignited) {
          soundEngine.playLampIgnite();
          persistCheckpoint(res.state);
        } else {
          soundEngine.playCartridgeReject();
        }
        return;
      }

      if (actionId === 'lantern_crank_left' || actionId === 'lantern_crank_right') {
        const dir = actionId === 'lantern_crank_left' ? -1 : 1;
        const res = turnCrank(curr, dir);
        if (res.moved) {
          commitState(res.state);
          soundEngine.playCrankDetent(res.state.bearingDegrees);
          engineRef.current?.triggerGloveAnimation('crank');
        }
        return;
      }

      if (actionId === 'lantern_catch_marker') {
        const res = triggerCatchOuterMarker(curr);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('press');
        if (res.outcome === 'locked') {
          soundEngine.playRadioClearChime();
          soundEngine.speakLine(
            'Outer marker caught! Hold — drifting E-4 is still crossing in front of the channel!',
            'meera'
          );
        } else {
          soundEngine.playCartridgeReject();
        }
        return;
      }

      if (actionId === 'lantern_signal_hold') {
        const res = triggerSignalHold(curr);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('press');
        if (res.outcome === 'holding') soundEngine.playDialClick(16);
        else soundEngine.playCartridgeReject();
        return;
      }

      if (actionId === 'lantern_signal_proceed') {
        const res = triggerSignalProceed(curr);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('lever');
        if (res.outcome === 'proceeding') {
          soundEngine.playShutterVane();
          soundEngine.playDoubleShortHorn();
          persistCheckpoint(res.state);
          soundEngine.speakLine('E-4 clear, Proceed received! Full ahead on 072 East!', 'meera');
        } else {
          soundEngine.playCartridgeReject();
        }
        return;
      }

      if (actionId === 'lantern_hold_beam') {
        const res = triggerHoldBeam(curr);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('press');
        if (res.outcome === 'off_course') soundEngine.playCartridgeReject();
        else if (res.outcome === 'holding') soundEngine.playRadioClearChime();
        return;
      }

      if (actionId === 'ferry_blow_horn') {
        const next = blowWheelhouseHorn(curr);
        commitState(next);
        soundEngine.playDoubleShortHorn();
        engineRef.current?.triggerGloveAnimation('lever');
        return;
      }

      // Chapter 6: Dawn Epilogue
      if (actionId === 'epilogue_talk_meera') {
        const next = speakMeeraAshore(curr);
        commitState(next);
        soundEngine.playRadioClearChime();
        soundEngine.speakLine(
          "I saw Muthu's brass storm lantern still burning on the post as we cleared the south wall. Stamp the corrected chart upstairs!",
          'meera'
        );
        return;
      }

      if (actionId === 'epilogue_stamp_chart') {
        const res = stampCorrectedChart(curr);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('press');
        if (res.stamped) {
          soundEngine.playChartStamp();
          persistCheckpoint(res.state);
        } else {
          soundEngine.playCartridgeReject();
        }
        return;
      }

      if (actionId === 'epilogue_hang_chart') {
        const res = hangCorrectedChart(curr, cfg.tamilClosingLine);
        commitState(res.state);
        engineRef.current?.triggerGloveAnimation('lever');
        if (res.hung) {
          soundEngine.playAllClearBell();
          window.setTimeout(() => soundEngine.playDoubleShortHorn(), 420);
          persistCheckpoint(res.state);
          soundEngine.speakLine(
            "We're alongside. Everyone's ashore. We saw your light.",
            'meera',
            {
              tamilText: cfg.tamilClosingLine
                ? 'எல்லோரும் கரை சேர்ந்துவிட்டோம். உங்கள் வெளிச்சம் தெரிந்தது.'
                : undefined,
            }
          );
        } else {
          soundEngine.playCartridgeReject();
        }
        return;
      }

      if (actionId === 'balcony_ring_bell') {
        const next = ringAllClearBell(curr, cfg.tamilClosingLine);
        if (next !== curr) {
          commitState(next);
          soundEngine.playAllClearBell();
          window.setTimeout(() => soundEngine.playDoubleShortHorn(), 450);
          engineRef.current?.triggerGloveAnimation('lever');
          persistCheckpoint(next);
          soundEngine.speakLine(
            "We're alongside. Everyone's ashore. We saw your light.",
            'meera',
            {
              tamilText: cfg.tamilClosingLine
                ? 'எல்லோரும் கரை சேர்ந்துவிட்டோம். உங்கள் வெளிச்சம் தெரிந்தது.'
                : undefined,
            }
          );
        }
      }
    },
    [commitState, persistCheckpoint]
  );

  // Mount Three.js engine once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let lastHoverAction = '';
    let lastDwellBucket = -1;

    const engine = new LighthouseEngine(container, {
      getState: () => stateRef.current,
      getSettings: () => settingsRef.current,
      onAction: (id) => handleAction(id),
      onTick: (dt) => {
        const curr = stateRef.current;
        const stepped = stepGameSimulation(curr, dt);
        if (stepped.events.includes('power_cut')) {
          soundEngine.playTransformerThump();
          engineRef.current?.fadeTeleportToNode('f1_desk', settingsRef.current);
        }
        if (stepped.events.includes('e4_cleared')) {
          soundEngine.playRadioClearChime();
        }
        if (stepped.events.includes('rescue_started')) {
          soundEngine.playDoubleShortHorn();
          persistCheckpoint(stepped.state);
        }
        if (stepped.events.includes('dawn_arrived')) {
          soundEngine.playDoubleShortHorn();
          persistCheckpoint(stepped.state);
          engineRef.current?.fadeTeleportToNode('jetty_head', settingsRef.current);
        }

        if (stepped.state !== curr) {
          const phaseChanged = stepped.state.phase !== curr.phase;
          const chapterChanged = stepped.state.chapter !== curr.chapter;
          const beatChanged = stepped.state.crossingBeat !== curr.crossingBeat;
          const subChanged = stepped.state.subtitle?.text !== curr.subtitle?.text;
          const clearChanged =
            Math.floor(stepped.state.e4ClearTimer * 10) !== Math.floor(curr.e4ClearTimer * 10);
          const rescueChanged =
            Math.floor(stepped.state.rescueElapsed) !== Math.floor(curr.rescueElapsed);

          stateRef.current = stepped.state;
          if (phaseChanged || chapterChanged || beatChanged || subChanged || clearChanged || rescueChanged) {
            setGameState(stepped.state);
          }
        }
      },
      onHoverChange: (hover, dwell) => {
        const nextAction = hover?.actionId ?? '';
        const dwellBucket = Math.floor(dwell * 20);
        if (nextAction !== lastHoverAction || dwellBucket !== lastDwellBucket) {
          lastHoverAction = nextAction;
          lastDwellBucket = dwellBucket;
          setHoverTarget(hover);
          setDwellProgress(dwell);
        }
      },
      onTeleportFade: (op) => setFadeOpacity(op),
      onSensorStatus: (s) => setSensorStatus(s),
      onWebXrEnded: () => {
        const next = { ...stateRef.current, inputMode: 'screen' as InputMode };
        commitState(next);
        engineRef.current?.handleResize();
      },
      onContextLost: (lost) => setContextLost(lost),
    });

    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [commitState, handleAction, persistCheckpoint]);

  // Global keyboard shortcuts (Esc / P pause, H hint)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const curr = stateRef.current;
      if (curr.phase === 'title' || curr.phase === 'credits') return;

      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (settingsOpen) {
          setSettingsOpen(false);
          return;
        }
        const nextPaused = !curr.paused;
        if (nextPaused) {
          engineRef.current?.exitPointerLock();
          soundEngine.stopSpeech();
        }
        commitState({ ...curr, paused: nextPaused });
      } else if (e.key.toLowerCase() === 'h' && !curr.paused) {
        const nextHint = curr.hintStage === 0 ? 1 : curr.hintStage === 1 ? 2 : 0;
        commitState({ ...curr, hintStage: nextHint });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commitState, settingsOpen]);

  const enterSelectedMode = useCallback(async (mode: InputMode) => {
    if (mode === 'phone-vr') {
      await engineRef.current?.enablePhoneVrSensors();
      engineRef.current?.handleResize();
    } else {
      engineRef.current?.disablePhoneVrSensors();
      if (mode === 'webxr') {
        const entered = await engineRef.current?.enterWebXr();
        if (!entered) {
          return 'screen' as InputMode;
        }
      }
      engineRef.current?.handleResize();
    }
    return mode;
  }, []);

  const launchFresh = useCallback(
    async (modeChoice: 'campaign' | 'event') => {
      soundEngine.unlock();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      const desiredInput = stateRef.current.inputMode;
      const resolvedInput =
        desiredInput === 'phone-vr' || desiredInput === 'webxr'
          ? await enterSelectedMode(desiredInput)
          : desiredInput;
      if (resolvedInput === 'screen' || resolvedInput === 'touch') {
        engineRef.current?.disablePhoneVrSensors();
        engineRef.current?.handleResize();
      }

      const next =
        modeChoice === 'event'
          ? startEventEdition({ ...stateRef.current, inputMode: resolvedInput })
          : startNewCampaign({ ...stateRef.current, inputMode: resolvedInput }, false);
      commitState(next);
      engineRef.current?.snapCameraToState(next, settingsRef.current);
      engineRef.current?.handleResize();

      if (modeChoice === 'event') {
        soundEngine.speakLine(
          'I bypassed the generator breakers so the beacon lines are live. Tune CH 16!',
          'muthu'
        );
      } else {
        soundEngine.speakLine(
          "The squall's coming fast. Steady that storm lantern bracket and ring the jetty bell for Thendral's departure.",
          'muthu'
        );
      }
    },
    [commitState, enterSelectedMode]
  );

  const resumeSaved = useCallback(
    async (modeChoice: 'campaign' | 'event') => {
      soundEngine.unlock();
      const saved = loadCheckpoint(undefined, modeChoice);
      if (!saved) return;
      const resolvedInput = await enterSelectedMode(stateRef.current.inputMode);
      const next = { ...saved, inputMode: resolvedInput, paused: false };
      commitState(next);
      engineRef.current?.snapCameraToState(next, settingsRef.current);
      engineRef.current?.handleResize();
    },
    [commitState, enterSelectedMode]
  );

  const handleResetEventSave = useCallback(() => {
    clearCheckpoint(undefined, 'event');
    refreshCheckpointBadges();
  }, [refreshCheckpointBadges]);

  const handleSkipHandover = useCallback(() => {
    soundEngine.unlock();
    soundEngine.stopSpeech();
    soundEngine.playTransformerThump();
    const next = skipHandover(stateRef.current);
    commitState(next);
    engineRef.current?.fadeTeleportToNode('f1_desk', settingsRef.current);
  }, [commitState]);

  const handlePauseToggle = useCallback(() => {
    const curr = stateRef.current;
    const nextPaused = !curr.paused;
    if (nextPaused) {
      engineRef.current?.exitPointerLock();
      soundEngine.stopSpeech();
    }
    commitState({ ...curr, paused: nextPaused });
  }, [commitState]);

  const handleAdvanceHint = useCallback(() => {
    const curr = stateRef.current;
    const nextStage: 0 | 1 | 2 = curr.hintStage === 0 ? 1 : curr.hintStage === 1 ? 2 : 0;
    commitState({ ...curr, hintStage: nextStage });
  }, [commitState]);

  const handleRestartShift = useCallback(() => {
    soundEngine.unlock();
    soundEngine.stopSpeech();
    const activeMode = stateRef.current.mode;
    clearCheckpoint(undefined, activeMode);
    refreshCheckpointBadges();
    const next =
      activeMode === 'event'
        ? startEventEdition(stateRef.current)
        : startNewCampaign(stateRef.current, false);
    commitState(next);
    engineRef.current?.snapCameraToState(next, settingsRef.current);
  }, [commitState, refreshCheckpointBadges]);

  const handleReturnToTitle = useCallback(() => {
    soundEngine.stopSpeech();
    engineRef.current?.exitPointerLock();
    engineRef.current?.disablePhoneVrSensors();
    engineRef.current?.exitWebXr();
    const next = createInitialGameState(
      stateRef.current.inputMode === 'webxr' ? 'screen' : stateRef.current.inputMode,
      stateRef.current.mode
    );
    commitState(next);
    engineRef.current?.snapCameraToState(next, settingsRef.current);
    engineRef.current?.handleResize();
    refreshCheckpointBadges();
  }, [commitState, refreshCheckpointBadges]);

  const handleReplayTransmission = useCallback(() => {
    soundEngine.unlock();
    const curr = stateRef.current;
    if (curr.phase === 'dawn_epilogue' || curr.phase === 'credits' || curr.closingLinePlayed) {
      const next = replayClosingLine(curr, settingsRef.current.tamilClosingLine);
      commitState(next);
      soundEngine.speakLine(
        "We're alongside. Everyone's ashore. We saw your light.",
        'meera',
        {
          tamilText: settingsRef.current.tamilClosingLine
            ? 'எல்லோரும் கரை சேர்ந்துவிட்டோம். உங்கள் வெளிச்சம் தெரிந்தது.'
            : undefined,
        }
      );
    } else if (curr.radioSolved) {
      const res = pressRadioListen({ ...curr, radioChannel: 16 });
      commitState(res.state);
      soundEngine.playRadioClearChime();
      soundEngine.speakLine(
        'Keeper, I have three lights ahead. Your chart shows two. Which one do I follow?',
        'meera'
      );
    }
  }, [commitState]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#09131c]">
      <div
        ref={mountRef}
        data-testid="lighthouse-canvas-container"
        className="fixed inset-0 z-0"
      />

      {fadeOpacity > 0.01 && (
        <div
          className="pointer-events-none fixed inset-0 z-30 bg-[#050b10]"
          style={{ opacity: fadeOpacity }}
        />
      )}

      {contextLost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09131c]/95 p-6 text-center">
          <div className="max-w-md space-y-4 rounded-xl border border-amber-400/40 bg-[#0e1a24] p-6">
            <h2 className="font-display-serif text-xl font-semibold text-amber-200">
              Graphics Context Interrupted
            </h2>
            <p className="text-sm text-slate-300">
              The 3D viewport was reset by the browser. Reload to resume from your saved checkpoint.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-500"
            >
              Reload Lighthouse
            </button>
          </div>
        </div>
      )}

      {gameState.phase === 'title' && (
        <TitleScreen
          selectedMode={gameState.inputMode}
          webXrSupported={webXrSupported}
          campaignCheckpoint={campaignCheckpoint}
          eventCheckpoint={eventCheckpoint}
          onSelectMode={(mode) => {
            commitState({ ...gameState, inputMode: mode });
            engineRef.current?.handleResize();
          }}
          onStartCampaign={() => launchFresh('campaign')}
          onResumeCampaign={() => resumeSaved('campaign')}
          onStartEvent={() => launchFresh('event')}
          onResumeEvent={() => resumeSaved('event')}
          onResetEvent={handleResetEventSave}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      {gameState.phase !== 'title' && gameState.phase !== 'credits' && (
        <GameHud
          state={gameState}
          settings={settings}
          hoverTarget={hoverTarget}
          dwellProgress={dwellProgress}
          sensorStatus={sensorStatus}
          isPortrait={isPortrait}
          onSkipHandover={handleSkipHandover}
          onAction={handleAction}
          onTouchMove={(vx, vz) => engineRef.current?.setTouchMoveVector(vx, vz)}
          onPauseToggle={handlePauseToggle}
          onOpenSettings={() => setSettingsOpen(true)}
          onAdvanceHint={handleAdvanceHint}
          onRecenterVr={() => engineRef.current?.recenterOrientation()}
          onSwitchToTouchFallback={() => {
            engineRef.current?.disablePhoneVrSensors();
            commitState({ ...gameState, inputMode: 'touch' });
            engineRef.current?.handleResize();
          }}
          onExitVrMode={() => {
            engineRef.current?.disablePhoneVrSensors();
            engineRef.current?.exitWebXr();
            commitState({ ...gameState, inputMode: 'screen' });
            engineRef.current?.handleResize();
          }}
          onFinishToCredits={() => {
            engineRef.current?.exitPointerLock();
            commitState({ ...gameState, phase: 'credits', paused: false });
          }}
          onRestartShift={handleRestartShift}
          onReturnToTitle={handleReturnToTitle}
          onReplayTransmission={handleReplayTransmission}
        />
      )}

      {gameState.phase === 'credits' && (
        <CreditsScreen
          state={gameState}
          onReplayShift={handleRestartShift}
          onResetForNextEventVisitor={() => {
            clearCheckpoint(undefined, 'event');
            refreshCheckpointBadges();
            launchFresh('event');
          }}
          onReturnToTitle={handleReturnToTitle}
          onReplayClosing={handleReplayTransmission}
        />
      )}

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onChange={setSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
