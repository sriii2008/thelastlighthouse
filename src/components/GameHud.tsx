import React, { useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Compass,
  Eye,
  HelpCircle,
  Pause,
  RotateCcw,
  Settings,
  Ship,
  Smartphone,
  Volume2,
} from 'lucide-react';
import {
  E4_CROSSING_CLEAR_TIME,
  formatBearing,
  getActiveObjective,
  getStagedHint,
  isNodeUnlocked,
  type GameSettings,
  type GameState,
  type TeleportNodeId,
} from '../game/gameState';
import { TELEPORT_NODES } from '../three/worldBuilder';

interface GameHudProps {
  state: GameState;
  settings: GameSettings;
  hoverTarget: { actionId: string; label: string } | null;
  dwellProgress: number;
  sensorStatus: 'checking' | 'active' | 'unavailable';
  isPortrait: boolean;
  onSkipHandover: () => void;
  onAction: (actionId: string) => void;
  onTouchMove: (vx: number, vz: number) => void;
  onPauseToggle: () => void;
  onOpenSettings: () => void;
  onAdvanceHint: () => void;
  onRecenterVr: () => void;
  onSwitchToTouchFallback: () => void;
  onExitVrMode: () => void;
  onFinishToCredits: () => void;
  onRestartShift: () => void;
  onReturnToTitle: () => void;
  onReplayTransmission: () => void;
}

const AREA_LABELS: Record<GameState['currentArea'], string> = {
  jetty: 'Jetty',
  walkway: 'Walkway',
  cottage: 'Cottage',
  radio_room: 'Radio Room',
  generator_gallery: 'Generator',
  boathouse: 'Boathouse',
  signal_hut: 'Signal Hut',
  lantern_room: 'Lantern',
  wheelhouse: 'Wheelhouse',
};

export const GameHud: React.FC<GameHudProps> = ({
  state,
  settings,
  hoverTarget,
  dwellProgress,
  sensorStatus,
  isPortrait,
  onSkipHandover,
  onAction,
  onTouchMove,
  onPauseToggle,
  onOpenSettings,
  onAdvanceHint,
  onRecenterVr,
  onSwitchToTouchFallback,
  onExitVrMode,
  onFinishToCredits,
  onRestartShift,
  onReturnToTitle,
  onReplayTransmission,
}) => {
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const stickRef = useRef<HTMLDivElement | null>(null);
  const [stickOffset, setStickOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const isStereo = state.inputMode === 'phone-vr';
  const isLarge = settings.textSize === 'large';
  const objective = getActiveObjective(state);
  const hint = state.hintStage > 0 ? getStagedHint(state) : null;

  const availableNodes = (Object.keys(TELEPORT_NODES) as TeleportNodeId[]).filter((id) => {
    if (id === 'ferry_wheelhouse') return false;
    return isNodeUnlocked(state, id).ok;
  });

  const handleStickPointer = (e: React.PointerEvent<HTMLDivElement>, active: boolean) => {
    if (!active || !stickRef.current) {
      setStickOffset({ x: 0, y: 0 });
      onTouchMove(0, 0);
      return;
    }
    const rect = stickRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.36;
    const dx = Math.max(-maxR, Math.min(maxR, e.clientX - cx));
    const dy = Math.max(-maxR, Math.min(maxR, e.clientY - cy));
    setStickOffset({ x: dx, y: dy });
    onTouchMove(dx / maxR, dy / maxR);
  };

  if (state.paused) {
    return (
      <div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Watch Paused"
      >
        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-[#c2933e]/35 bg-[#0e1a24] p-6 text-[#e8e3d5] shadow-2xl">
          <h2 className="font-display-serif text-2xl font-semibold text-amber-100">Watch Paused</h2>
          <p className="mt-1 text-xs text-slate-400">
            Ch.{state.chapter} · {AREA_LABELS[state.currentArea]} · {objective}
          </p>

          {hint && (
            <div className="mt-4 rounded-lg border border-amber-500/30 bg-[#152431] p-3 text-sm">
              <div className="text-xs font-semibold tracking-wide text-amber-300 uppercase">
                Hint · {hint.propName}
              </div>
              {state.hintStage >= 2 && <p className="mt-1 text-slate-200">{hint.detail}</p>}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onPauseToggle}
              className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-500"
            >
              Resume Watch
            </button>
            {hint === null || state.hintStage < 2 ? (
              <button
                type="button"
                onClick={onAdvanceHint}
                className="w-full rounded-lg border border-amber-500/40 bg-[#152532] px-4 py-2.5 text-sm font-medium text-amber-200 hover:bg-[#1b3040]"
              >
                {state.hintStage === 0 ? 'Show Hint (Target Prop)' : 'Show Exact Next Step'}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onOpenSettings}
              className="w-full rounded-lg border border-white/15 bg-[#152532] px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-[#1d3242]"
            >
              Audio & Comfort Settings
            </button>
            <button
              type="button"
              onClick={onRestartShift}
              className="w-full rounded-lg border border-white/15 bg-[#152532] px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-[#1d3242]"
            >
              Restart {state.mode === 'event' ? 'Event Edition' : 'Campaign'}
            </button>
            <button
              type="button"
              onClick={onReturnToTitle}
              className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Return to Title
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isStereo) {
    return (
      <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3">
        <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-[#09131c]/90 px-3 py-1.5 text-xs text-amber-100">
            <span>Phone VR Stereo</span>
            {isPortrait && (
              <span className="text-amber-400">· Rotate to Landscape for Cardboard</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {sensorStatus === 'unavailable' && (
              <button
                type="button"
                onClick={onSwitchToTouchFallback}
                className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Gyro Unavailable · Touch Fallback</span>
              </button>
            )}
            <button
              type="button"
              onClick={onRecenterVr}
              className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-[#0e1a24]/90 px-3 py-1.5 text-xs font-medium text-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Recenter</span>
            </button>
            <button
              type="button"
              onClick={onExitVrMode}
              className="rounded-lg border border-white/20 bg-[#0e1a24]/90 px-3 py-1.5 text-xs font-medium text-slate-200"
            >
              Exit VR
            </button>
          </div>
        </div>

        <div className="pointer-events-none fixed inset-y-0 left-1/2 w-px bg-white/20" />
      </div>
    );
  }

  const areaBadge =
    state.currentArea === 'radio_room'
      ? `VHF CH ${state.radioChannel}`
      : state.currentArea === 'generator_gallery'
      ? state.generatorRunning
        ? 'GEN ONLINE'
        : 'GEN OFFLINE'
      : state.currentArea === 'lantern_room'
      ? `BEARING ${formatBearing(state.bearingDegrees)}`
      : state.currentArea === 'cottage'
      ? `OVERLAY ${state.overlayAngleDeg > 0 ? `+${state.overlayAngleDeg}` : state.overlayAngleDeg}°`
      : state.currentArea === 'boathouse'
      ? state.telescopeReadBuoy
        ? 'BUOY E-4'
        : 'SLIPWAY'
      : state.currentArea === 'signal_hut'
      ? state.shutterTested
        ? 'SHUTTER OK'
        : 'SHUTTER JAM'
      : state.currentArea === 'wheelhouse'
      ? 'M/V THENDRAL HELM'
      : 'VAANTHURAI';

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3 md:p-5">
      {/* Top Perimeter */}
      <div className="flex items-start justify-between gap-3">
        <div className="pointer-events-auto max-w-md rounded-lg border border-[#c2933e]/30 bg-[#0b151e]/92 px-4 py-2.5 shadow-lg">
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
            <span>{state.mode === 'event' ? 'Event' : `Ch.${state.chapter}`}</span>
            <span aria-hidden="true">·</span>
            <span>{AREA_LABELS[state.currentArea]}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{areaBadge}</span>
          </div>
          <p className={`mt-0.5 font-medium text-[#f1ece1] ${isLarge ? 'text-base' : 'text-sm'}`}>
            {objective}
          </p>

          {state.chapter === 5 && state.crossingBeat === 1 && (
            <div className="mt-2">
              <div className="mb-0.5 flex justify-between text-[10px] text-amber-200">
                <span>Drifting E-4 Clearing Breakwater</span>
                <span className="font-mono-tabular">
                  {Math.min(100, Math.round((state.e4ClearTimer / (E4_CROSSING_CLEAR_TIME * 0.85)) * 100))}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full bg-emerald-400 transition-all duration-75"
                  style={{
                    width: `${Math.min(100, (state.e4ClearTimer / (E4_CROSSING_CLEAR_TIME * 0.85)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {hint && (
            <div className="mt-2 border-t border-white/10 pt-1.5 text-xs text-amber-200">
              <span className="font-semibold">Hint: {hint.propName}</span>
              {state.hintStage >= 2 && <span className="block text-slate-300">{hint.detail}</span>}
            </div>
          )}
        </div>

        {/* Right Utilities */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
          {state.phase === 'jetty_opening' && (
            <button
              type="button"
              onClick={onSkipHandover}
              className="rounded-lg border border-amber-400/40 bg-[#0e1a24]/92 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-[#162836] whitespace-nowrap"
            >
              Skip Squall Intro
            </button>
          )}

          {state.phase === 'rescue_sequence' && (
            <button
              type="button"
              onClick={() =>
                onAction(
                  state.currentNode === 'ferry_wheelhouse'
                    ? 'teleport_f3_balcony'
                    : 'teleport_ferry_wheelhouse'
                )
              }
              className="flex items-center gap-1.5 rounded-lg border border-sky-400/45 bg-sky-900/80 px-3 py-2 text-xs font-semibold text-sky-100 hover:bg-sky-800 whitespace-nowrap"
            >
              <Ship className="h-3.5 w-3.5" />
              <span>
                {state.currentNode === 'ferry_wheelhouse' ? 'Return to Balcony' : 'View Wheelhouse'}
              </span>
            </button>
          )}

          {(state.radioSolved || state.closingLinePlayed) && (
            <button
              type="button"
              onClick={onReplayTransmission}
              title="Replay Captain Meera's transmission"
              className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#0e1a24]/92 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white whitespace-nowrap"
            >
              <Volume2 className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">Replay Radio</span>
            </button>
          )}

          {state.phase === 'dawn_epilogue' && (state.chartHung || state.bellRung) && (
            <button
              type="button"
              onClick={onFinishToCredits}
              className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 whitespace-nowrap"
            >
              Complete Watch
            </button>
          )}

          <button
            type="button"
            onClick={onAdvanceHint}
            aria-label="Show hint"
            title="Show hint (H)"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-[#0e1a24]/92 text-slate-200 hover:border-amber-400/50 hover:text-white"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Audio and comfort settings"
            title="Settings"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-[#0e1a24]/92 text-slate-200 hover:border-amber-400/50 hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onPauseToggle}
            aria-label="Pause watch"
            title="Pause (Esc)"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-[#0e1a24]/92 text-slate-200 hover:border-amber-400/50 hover:text-white"
          >
            <Pause className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Optical Focus Status Pill when looking through Binoculars / Telescope / Slit */}
      {(state.binocularActive || state.telescopeActive || state.slitViewActive) && (
        <div className="pointer-events-auto fixed left-1/2 top-20 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-amber-400/40 bg-[#081119]/92 px-3 py-1.5 text-xs text-amber-100">
          <Eye className="h-3.5 w-3.5 text-amber-400" />
          <span>
            {state.binocularActive
              ? `Binoculars Focus: ${state.binocularFocus}/10 (Aim East Window · Target 7)`
              : state.telescopeActive
              ? `Telescope Focus: ${state.telescopeFocus}/10 (Aim East Channel · Target 6)`
              : 'Signal Shutter Sighting Slit (072° Corridor)'}
          </span>
          <button
            type="button"
            onClick={() =>
              onAction(
                state.binocularActive
                  ? 'radio_binoculars'
                  : state.telescopeActive
                  ? 'boathouse_telescope_toggle'
                  : 'shut_look_slit'
              )
            }
            className="ml-1 rounded bg-white/10 px-2 py-0.5 text-[11px] hover:bg-white/20"
          >
            Lower
          </button>
        </div>
      )}

      {/* Center Reticle Target Label */}
      {hoverTarget && (
        <div className="pointer-events-none fixed left-1/2 top-[54%] -translate-x-1/2">
          <div className="rounded-md border border-amber-400/35 bg-[#09131c]/90 px-3 py-1 text-xs font-medium text-amber-100 shadow-md whitespace-nowrap">
            {hoverTarget.label}
            {dwellProgress > 0.05 && ` · ${Math.round(dwellProgress * 100)}%`}
          </div>
        </div>
      )}

      {/* Touch Thumbstick when Touch Mode active */}
      {state.inputMode === 'touch' &&
        state.currentArea !== 'wheelhouse' &&
        !state.binocularActive &&
        !state.telescopeActive && (
          <div
            ref={stickRef}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              handleStickPointer(e, true);
            }}
            onPointerMove={(e) => {
              if (e.buttons > 0) handleStickPointer(e, true);
            }}
            onPointerUp={(e) => handleStickPointer(e, false)}
            onPointerCancel={(e) => handleStickPointer(e, false)}
            className="pointer-events-auto fixed bottom-44 left-3 flex h-20 w-20 touch-none items-center justify-center rounded-full border border-amber-400/35 bg-[#0b151e]/85 sm:bottom-24 sm:left-4 sm:h-24 sm:w-24"
            aria-label="Walk Thumbstick"
          >
            <div
              className="h-8 w-8 rounded-full border border-amber-300/60 bg-amber-500/75 sm:h-9 sm:w-9"
              style={{ transform: `translate(${stickOffset.x}px, ${stickOffset.y}px)` }}
            />
          </div>
        )}

      {/* Bottom Area: Subtitles + Collapsible Station Controls & Harbor Waypoints */}
      <div className="flex flex-col items-center gap-2">
        {settings.subtitlesEnabled && state.subtitle && (
          <div
            className={`pointer-events-none max-w-2xl rounded-lg border border-white/10 bg-[#081119]/92 px-5 py-2.5 text-center shadow-xl ${
              state.inputMode === 'touch' ? 'ml-24 sm:ml-0' : ''
            } ${isLarge ? 'text-base' : 'text-sm'}`}
          >
            <div className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
              {state.subtitle.speaker}
            </div>
            <div className="mt-0.5 text-[#f4efe4]">{state.subtitle.text}</div>
            {state.subtitle.tamilText && (
              <div className="mt-1 text-xs text-amber-200/90">{state.subtitle.tamilText}</div>
            )}
          </div>
        )}

        <div className="pointer-events-auto flex flex-col items-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((v) => !v)}
            aria-label={dockCollapsed ? 'Show controls and harbor map' : 'Hide controls'}
            className="mb-1 flex items-center gap-1 rounded-t-md border border-b-0 border-white/15 bg-[#0b151e]/92 px-3 py-1 text-[11px] font-medium text-slate-300 hover:text-white"
          >
            {dockCollapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span>{dockCollapsed ? 'Show Harbor Stations' : 'Hide'}</span>
          </button>

          {!dockCollapsed && (
            <div className="flex max-w-[95vw] flex-col items-center gap-1.5 rounded-xl border border-white/12 bg-[#0b151e]/94 p-2 shadow-xl">
              {/* Station Contextual Actions */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {hoverTarget && (
                  <button
                    type="button"
                    onClick={() => onAction(hoverTarget.actionId)}
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 whitespace-nowrap"
                  >
                    Use: {hoverTarget.label}
                  </button>
                )}

                {/* CHAPTER 1 JETTY OPENING */}
                {state.phase === 'jetty_opening' && (
                  <>
                    {!state.lanternFastened && (
                      <button
                        type="button"
                        onClick={() => onAction('jetty_help_lantern')}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 whitespace-nowrap"
                      >
                        Fasten Storm Lantern
                      </button>
                    )}
                    {state.lanternFastened && !state.openingBellRung && (
                      <button
                        type="button"
                        onClick={() => onAction('jetty_ring_bell')}
                        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 whitespace-nowrap"
                      >
                        Ring Jetty Bell
                      </button>
                    )}
                  </>
                )}

                {/* RADIO ROOM */}
                {state.currentArea === 'radio_room' && state.phase !== 'dawn_epilogue' && (
                  <>
                    <button
                      type="button"
                      onClick={() => onAction('radio_dial_left')}
                      className="rounded-lg border border-white/15 bg-[#152532] px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-[#1e3344]"
                    >
                      Dial -CH
                    </button>
                    <button
                      type="button"
                      onClick={() => onAction('radio_dial_right')}
                      className="rounded-lg border border-white/15 bg-[#152532] px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-[#1e3344]"
                    >
                      Dial +CH
                    </button>
                    <button
                      type="button"
                      onClick={() => onAction('radio_listen')}
                      className="rounded-lg bg-[#991b1b] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#b91c1c]"
                    >
                      LISTEN (CH {state.radioChannel})
                    </button>
                    {state.radioSolved && (
                      <>
                        <button
                          type="button"
                          onClick={() => onAction('radio_binoculars')}
                          className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                            state.binocularActive
                              ? 'border-amber-400 bg-amber-600 text-white'
                              : 'border-white/15 bg-[#152532] text-slate-200'
                          }`}
                        >
                          {state.binocularActive ? 'Lower Binoculars' : 'Binoculars'}
                        </button>
                        {state.binocularActive && (
                          <>
                            <button
                              type="button"
                              onClick={() => onAction('radio_binoc_out')}
                              className="rounded-lg border border-white/15 bg-[#152532] px-2.5 py-1.5 text-xs text-slate-200"
                            >
                              Focus -
                            </button>
                            <button
                              type="button"
                              onClick={() => onAction('radio_binoc_in')}
                              className="rounded-lg border border-white/15 bg-[#152532] px-2.5 py-1.5 text-xs text-slate-200"
                            >
                              Focus + ({state.binocularFocus})
                            </button>
                          </>
                        )}
                        {state.lightsObserved && !state.sketchRecorded && (
                          <button
                            type="button"
                            onClick={() => onAction('radio_record_sketch')}
                            className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
                          >
                            Log 3rd Light Sketch
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* KEEPER'S COTTAGE */}
                {state.currentArea === 'cottage' && (
                  <>
                    {!state.cottageKettleChecked && (
                      <button
                        type="button"
                        onClick={() => onAction('cottage_inspect_kettle')}
                        className="rounded-lg border border-white/15 bg-[#152532] px-2.5 py-1.5 text-xs text-slate-200"
                      >
                        Check Kettle
                      </button>
                    )}
                    {!state.cottageTideMarksChecked && (
                      <button
                        type="button"
                        onClick={() => onAction('cottage_inspect_tidemarks')}
                        className="rounded-lg border border-white/15 bg-[#152532] px-2.5 py-1.5 text-xs text-slate-200"
                      >
                        Tide Marks
                      </button>
                    )}
                    {!state.drawerOpened ? (
                      <button
                        type="button"
                        onClick={() => onAction('cottage_open_drawer')}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Open Chart Drawer
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onAction('cottage_overlay_left')}
                          className="rounded-lg border border-white/15 bg-[#152532] px-2.5 py-1.5 text-xs text-slate-200"
                        >
                          Rotate Overlay -5°
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction('cottage_overlay_right')}
                          className="rounded-lg border border-white/15 bg-[#152532] px-2.5 py-1.5 text-xs text-slate-200"
                        >
                          Rotate Overlay +5° ({state.overlayAngleDeg}°)
                        </button>
                      </>
                    )}
                    {state.overlayAligned && !state.cottageWindowMatched && (
                      <button
                        type="button"
                        onClick={() => onAction('cottage_window_check')}
                        className="rounded-lg border border-sky-400/40 bg-sky-900/70 px-2.5 py-1.5 text-xs text-sky-100"
                      >
                        Match East Window
                      </button>
                    )}
                    {state.overlayAligned && !state.muthuKeyGiven && state.mode === 'campaign' && (
                      <button
                        type="button"
                        onClick={() => onAction('cottage_talk_muthu')}
                        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Speak with Muthu (Key)
                      </button>
                    )}
                  </>
                )}

                {/* GENERATOR GALLERY */}
                {state.currentArea === 'generator_gallery' && (
                  <>
                    {!state.wiringPlateOpened && (
                      <button
                        type="button"
                        onClick={() => onAction('gen_wiring_plate')}
                        className="rounded-lg border border-amber-400/40 bg-[#152532] px-2.5 py-1.5 text-xs text-amber-200"
                      >
                        Inspect Wiring Plate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onAction('gen_door_toggle')}
                      className="rounded-lg border border-white/15 bg-[#152532] px-2.5 py-1.5 text-xs text-slate-200"
                    >
                      {state.cabinetOpen ? 'Close Cabinet' : 'Open Cabinet'}
                    </button>
                    {state.cabinetOpen && !state.isolatorPulled && (
                      <>
                        {(['AUX', 'DRIVE', 'BEACON'] as const).map((cid) => {
                          if (Object.values(state.sockets).includes(cid)) return null;
                          const sym = cid === 'AUX' ? '○' : cid === 'DRIVE' ? '△' : '□';
                          return (
                            <button
                              key={cid}
                              type="button"
                              onClick={() => onAction(`gen_cartridge_${cid}`)}
                              className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                                state.selectedCartridge === cid
                                  ? 'border-amber-400 bg-amber-600 text-white'
                                  : 'border-white/15 bg-[#152532] text-amber-200'
                              }`}
                            >
                              {cid} {sym}
                            </button>
                          );
                        })}
                        {(['circle', 'triangle', 'square'] as const).map((shp, idx) => {
                          const filled = state.sockets[shp];
                          const sym = shp === 'circle' ? '○' : shp === 'triangle' ? '△' : '□';
                          return (
                            <button
                              key={shp}
                              type="button"
                              onClick={() => onAction(`gen_socket_${shp}`)}
                              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                                filled
                                  ? 'border-emerald-400/50 bg-emerald-900/50 text-emerald-200'
                                  : 'border-white/15 bg-[#111e29] text-slate-200'
                              }`}
                            >
                              {filled ? `S${idx + 1}: ${filled}` : `S${idx + 1} ${sym}`}
                            </button>
                          );
                        })}
                      </>
                    )}
                    {!state.isolatorPulled && (
                      <button
                        type="button"
                        onClick={() => onAction('gen_isolator')}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Pull Isolator
                      </button>
                    )}
                  </>
                )}

                {/* BOATHOUSE */}
                {state.currentArea === 'boathouse' && (
                  <>
                    {!state.tideScaleChecked && (
                      <button
                        type="button"
                        onClick={() => onAction('boathouse_check_tide')}
                        className="rounded-lg border border-white/15 bg-[#152532] px-2.5 py-1.5 text-xs text-slate-200"
                      >
                        Check Tide Scale
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onAction('boathouse_telescope_toggle')}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                        state.telescopeActive
                          ? 'border-amber-400 bg-amber-600 text-white'
                          : 'border-white/15 bg-[#152532] text-slate-200'
                      }`}
                    >
                      {state.telescopeActive ? 'Leave Telescope' : 'Use Telescope'}
                    </button>
                    {state.telescopeActive && (
                      <>
                        <button
                          type="button"
                          onClick={() => onAction('boathouse_focus_out')}
                          className="rounded-lg border border-white/15 bg-[#152532] px-2.5 py-1.5 text-xs text-slate-200"
                        >
                          Focus -
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction('boathouse_focus_in')}
                          className="rounded-lg border border-white/15 bg-[#152532] px-2.5 py-1.5 text-xs text-slate-200"
                        >
                          Focus + ({state.telescopeFocus})
                        </button>
                      </>
                    )}
                    {state.telescopeReadBuoy && !state.buoyCardConfirmed && (
                      <>
                        <button
                          type="button"
                          onClick={() => onAction('boathouse_card_e4')}
                          className="rounded-lg border border-amber-400/50 bg-[#152532] px-2.5 py-1.5 text-xs font-semibold text-amber-200"
                        >
                          Card E-4
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction('boathouse_card_d2')}
                          className="rounded-lg border border-white/15 bg-[#152532] px-2.5 py-1.5 text-xs text-slate-200"
                        >
                          Card D-2
                        </button>
                      </>
                    )}
                    {state.buoyCardConfirmed && !state.drumTestedMatch && (
                      <>
                        <button
                          type="button"
                          onClick={() => onAction('boathouse_drum_single_3s')}
                          className={`rounded-lg border px-2 py-1.5 text-xs ${
                            state.selectedDrum === 'single_3s'
                              ? 'border-amber-400 bg-amber-600 text-white'
                              : 'border-white/15 bg-[#152532] text-slate-200'
                          }`}
                        >
                          Single 3s
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction('boathouse_drum_double_flash')}
                          className={`rounded-lg border px-2 py-1.5 text-xs ${
                            state.selectedDrum === 'double_flash'
                              ? 'border-amber-400 bg-amber-600 text-white'
                              : 'border-white/15 bg-[#152532] text-slate-200'
                          }`}
                        >
                          Double-Flash
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction('boathouse_drum_quick_tri')}
                          className={`rounded-lg border px-2 py-1.5 text-xs ${
                            state.selectedDrum === 'quick_tri'
                              ? 'border-amber-400 bg-amber-600 text-white'
                              : 'border-white/15 bg-[#152532] text-slate-200'
                          }`}
                        >
                          Tri-Flash
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction('boathouse_test_drum')}
                          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Test Bench (12V)
                        </button>
                      </>
                    )}
                  </>
                )}

                {/* SIGNAL HUT */}
                {state.currentArea === 'signal_hut' && (
                  <>
                    {!state.shutterHousingOpen && (
                      <button
                        type="button"
                        onClick={() => onAction('shut_open_housing')}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Open Shutter Cover
                      </button>
                    )}
                    {state.shutterHousingOpen && !state.shutterGearSeated && (
                      <button
                        type="button"
                        onClick={() => onAction('shut_seat_gear')}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Seat Coupling Gear
                      </button>
                    )}
                    {state.shutterGearSeated && !state.shutterTested && (
                      <button
                        type="button"
                        onClick={() => onAction('shut_test_lever')}
                        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Pull Shutter Test Lever
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onAction('shut_look_slit')}
                      className="rounded-lg border border-white/15 bg-[#152532] px-2.5 py-1.5 text-xs text-slate-200"
                    >
                      {state.slitViewActive ? 'Exit Slit' : 'Sighting Slit'}
                    </button>
                    {state.shutterTested && !state.plotRouteConfirmed && (
                      <>
                        <button
                          type="button"
                          onClick={() => onAction('shut_pin_north')}
                          className={`rounded-lg border px-2 py-1.5 text-xs ${
                            state.plotNorthMarker
                              ? 'border-emerald-400/60 bg-emerald-900/50 text-emerald-200'
                              : 'border-white/15 bg-[#152532] text-slate-300'
                          }`}
                        >
                          North Gate
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction('shut_pin_south')}
                          className={`rounded-lg border px-2 py-1.5 text-xs ${
                            state.plotSouthMarker
                              ? 'border-emerald-400/60 bg-emerald-900/50 text-emerald-200'
                              : 'border-white/15 bg-[#152532] text-slate-300'
                          }`}
                        >
                          South Gate
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction('shut_pin_e4')}
                          className={`rounded-lg border px-2 py-1.5 text-xs ${
                            state.plotE4Drifting
                              ? 'border-amber-400/70 bg-amber-800/60 text-amber-100'
                              : 'border-white/15 bg-[#152532] text-slate-300'
                          }`}
                        >
                          Flag E-4 Drifting
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction('shut_confirm_route')}
                          className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Confirm Route (072° E)
                        </button>
                      </>
                    )}
                  </>
                )}

                {/* LANTERN ROOM 3-BEAT CROSSING */}
                {state.currentArea === 'lantern_room' && state.phase === 'floor3_lantern' && (
                  <>
                    {!state.drivePinTaken && (
                      <button
                        type="button"
                        onClick={() => onAction('lantern_take_pin')}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Take Drive Pin
                      </button>
                    )}
                    {state.drivePinTaken && !state.drivePinSeated && (
                      <button
                        type="button"
                        onClick={() => onAction('lantern_seat_pin')}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Seat Drive Pin
                      </button>
                    )}
                    {state.drivePinSeated && !state.lampSwitchOn && (
                      <button
                        type="button"
                        onClick={() => onAction('lantern_lamp_switch')}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Ignite Lamp
                      </button>
                    )}
                    {state.lampSwitchOn && (
                      <>
                        <button
                          type="button"
                          onClick={() => onAction('lantern_crank_left')}
                          className="rounded-lg border border-white/15 bg-[#152532] px-2.5 py-1.5 text-xs text-slate-200"
                        >
                          Crank -2°
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction('lantern_crank_right')}
                          className="rounded-lg border border-white/15 bg-[#152532] px-2.5 py-1.5 text-xs text-slate-200"
                        >
                          Crank +2° ({formatBearing(state.bearingDegrees)})
                        </button>
                        {state.crossingBeat === 0 && (
                          <button
                            type="button"
                            onClick={() => onAction('lantern_catch_marker')}
                            className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            Beat 1: Catch Outer Marker
                          </button>
                        )}
                        {state.crossingBeat >= 1 && state.crossingBeat < 3 && (
                          <>
                            <button
                              type="button"
                              onClick={() => onAction('lantern_signal_hold')}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                state.holdBeamActive
                                  ? 'border border-amber-300 bg-amber-700 text-white'
                                  : 'bg-[#334155] text-slate-100'
                              }`}
                            >
                              Beat 2: Signal HOLD
                            </button>
                            <button
                              type="button"
                              onClick={() => onAction('lantern_signal_proceed')}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${
                                state.crossingBeat >= 2
                                  ? 'bg-emerald-600 hover:bg-emerald-500'
                                  : 'bg-emerald-900/60 opacity-80'
                              }`}
                            >
                              Beat 3: Shutter PROCEED
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* FERRY WHEELHOUSE VIEWPOINT */}
                {state.currentArea === 'wheelhouse' && state.phase === 'rescue_sequence' && (
                  <button
                    type="button"
                    onClick={() => onAction('ferry_blow_horn')}
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
                  >
                    Sound Two-Blast Horn
                  </button>
                )}

                {/* CHAPTER 6 DAWN EPILOGUE */}
                {state.phase === 'dawn_epilogue' && (
                  <>
                    {!state.meeraAshoreSpoken && state.mode !== 'event' && (
                      <button
                        type="button"
                        onClick={() => onAction('epilogue_talk_meera')}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Speak with Captain Meera
                      </button>
                    )}
                    {!state.chartStamped && (
                      <button
                        type="button"
                        onClick={() => onAction('epilogue_stamp_chart')}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Stamp Corrected Chart (Radio Room)
                      </button>
                    )}
                    {state.chartStamped && !state.chartHung && (
                      <button
                        type="button"
                        onClick={() => onAction('epilogue_hang_chart')}
                        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Hang Chart on Wall
                      </button>
                    )}
                    {!state.bellRung && (
                      <button
                        type="button"
                        onClick={() => onAction('balcony_ring_bell')}
                        className="rounded-lg border border-amber-400/40 bg-[#152532] px-3 py-1.5 text-xs font-semibold text-amber-200"
                      >
                        Ring All-Clear Bell
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Relevant Unlocked Harbor Locations */}
              <div className="flex max-w-[90vw] flex-nowrap items-center gap-1 overflow-x-auto border-t border-white/10 pt-1.5">
                <span className="mr-1 flex shrink-0 items-center gap-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  <Compass className="h-3 w-3 text-amber-400" />
                  <span>Go:</span>
                </span>
                {availableNodes.map((id) => {
                  const node = TELEPORT_NODES[id];
                  const active = state.currentNode === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onAction(`teleport_${id}`)}
                      className={`rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap transition-colors ${
                        active
                          ? 'border border-amber-400/45 bg-[#1e3545] text-amber-200'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {node.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
