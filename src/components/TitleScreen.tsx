import React, { useEffect } from 'react';
import {
  Compass,
  Glasses,
  Monitor,
  Play,
  RotateCcw,
  Settings,
  Smartphone,
  Timer,
  Trash2,
} from 'lucide-react';
import type { GameState, InputMode } from '../game/gameState';

interface TitleScreenProps {
  selectedMode: InputMode;
  webXrSupported: boolean;
  campaignCheckpoint: GameState | null;
  eventCheckpoint: GameState | null;
  onSelectMode: (mode: InputMode) => void;
  onStartCampaign: () => void;
  onResumeCampaign: () => void;
  onStartEvent: () => void;
  onResumeEvent: () => void;
  onResetEvent: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedMode,
  webXrSupported,
  campaignCheckpoint,
  eventCheckpoint,
  onSelectMode,
  onStartCampaign,
  onResumeCampaign,
  onStartEvent,
  onResumeEvent,
  onResetEvent,
  onOpenSettings,
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'BUTTON' || activeTag === 'INPUT') return;
        e.preventDefault();
        onStartCampaign();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onStartCampaign]);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-5 md:p-10">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-r from-[#071018]/90 via-[#071018]/55 to-transparent" />

      {/* Top Row: Location Anchor + Settings */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs tracking-widest text-amber-200/80 uppercase">
          <Compass className="h-4 w-4 text-amber-400" />
          <span>Vaanthurai Harbor</span>
          <span aria-hidden="true">·</span>
          <span>Tamil Nadu Coast</span>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="pointer-events-auto flex items-center gap-2 rounded-lg border border-white/15 bg-[#0e1a24]/92 px-4 py-2 text-sm font-medium text-slate-200 hover:border-amber-400/50 hover:text-white focus-visible:outline-2 focus-visible:outline-amber-400 whitespace-nowrap"
        >
          <Settings className="h-4 w-4 text-amber-400" />
          <span>Settings</span>
        </button>
      </div>

      {/* Main Left Lockup */}
      <div className="pointer-events-auto max-w-2xl space-y-5">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 64 40" className="h-9 w-14 text-amber-400" aria-hidden="true">
              <path d="M28 38 L30 12 L34 12 L36 38 Z" fill="currentColor" opacity="0.85" />
              <rect x="27" y="9" width="10" height="4" rx="1" fill="currentColor" />
              <path d="M32 4 L36 9 L28 9 Z" fill="currentColor" />
              <path d="M36 11 L62 5 L62 17 Z" fill="currentColor" opacity="0.28" />
              <path d="M28 11 L2 5 L2 17 Z" fill="currentColor" opacity="0.28" />
            </svg>
            <span className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">
              The Missing Light
            </span>
          </div>

          <h1 className="font-display-serif text-4xl font-semibold tracking-wide text-[#f4efe4] sm:text-5xl md:text-6xl text-balance">
            The Last Lighthouse
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base">
            When a cyclone squall blacks out Vaanthurai Harbor, Captain Meera spots three lights ahead where only two belong. Trace the drifting beacon across the waterfront and guide M/V Thendral home.
          </p>
        </div>

        {/* Input / VR Mode Selector */}
        <div className="space-y-1.5">
          <span className="block text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Play Mode
          </span>
          <div className="inline-flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-[#0b151e]/95 p-1.5">
            <button
              type="button"
              onClick={() => onSelectMode('screen')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                selectedMode === 'screen'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span>Screen / Laptop</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectMode('touch')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                selectedMode === 'touch'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>Android Touch</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectMode('phone-vr')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                selectedMode === 'phone-vr'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Glasses className="h-4 w-4" />
              <span>Phone VR (Stereo)</span>
            </button>

            {webXrSupported && (
              <button
                type="button"
                onClick={() => onSelectMode('webxr')}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedMode === 'webxr'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Glasses className="h-4 w-4" />
                <span>Immersive WebXR</span>
              </button>
            )}
          </div>
        </div>

        {/* Two Edition Cards: Full Story vs Event Edition (Isolated Progress) */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col justify-between rounded-xl border border-amber-500/35 bg-[#0c1822]/92 p-4 shadow-lg">
            <div>
              <div className="text-xs font-semibold tracking-wider text-amber-300 uppercase">
                Full Story Campaign
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                5 chapters + dawn epilogue across the jetty, cottage, boathouse, signal hut, and tower.
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                data-start="true"
                onClick={onStartCampaign}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-500 whitespace-nowrap"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Start Full Story</span>
              </button>
              {campaignCheckpoint && (
                <button
                  type="button"
                  onClick={onResumeCampaign}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-[#13222e] px-3 py-2.5 text-xs font-medium text-amber-100 hover:bg-[#1a2e3d] whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                  <span>Resume Ch.{campaignCheckpoint.chapter}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-sky-400/30 bg-[#0c1822]/92 p-4 shadow-lg">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-sky-300 uppercase">
                <Timer className="h-3.5 w-3.5" />
                <span>Event Edition · 5–7 min</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                Public booth showcase with tower power live, fast-tracked mystery leads, and isolated save slot.
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                data-event-start="true"
                onClick={onStartEvent}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-sky-400/45 bg-sky-700/80 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 whitespace-nowrap"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Start Event</span>
              </button>
              {eventCheckpoint && (
                <>
                  <button
                    type="button"
                    onClick={onResumeEvent}
                    className="flex items-center gap-1.5 rounded-lg border border-sky-400/40 bg-[#13222e] px-3 py-2.5 text-xs font-medium text-sky-100 hover:bg-[#1a2e3d] whitespace-nowrap"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-sky-300" />
                    <span>Resume</span>
                  </button>
                  <button
                    type="button"
                    onClick={onResetEvent}
                    title="1-click clear Event Edition progress for next visitor"
                    className="flex items-center gap-1 rounded-lg border border-white/15 bg-[#13222e] px-2.5 py-2.5 text-xs text-slate-300 hover:border-red-400/50 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Reset</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Hint */}
      <div className="text-xs text-slate-400">
        <span>Walk: WASD / Thumbstick / Waypoint Pads</span>
        <span className="mx-2" aria-hidden="true">·</span>
        <span>Look: Mouse / Drag / Gaze</span>
        <span className="mx-2" aria-hidden="true">·</span>
        <span>Interact: Click / E / 0.8s Gaze</span>
      </div>
    </div>
  );
};
