import React from 'react';
import { Anchor, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import type { GameState } from '../game/gameState';

interface CreditsScreenProps {
  state: GameState;
  onReplayShift: () => void;
  onResetForNextEventVisitor: () => void;
  onReturnToTitle: () => void;
  onReplayClosing: () => void;
}

export const CreditsScreen: React.FC<CreditsScreenProps> = ({
  state,
  onReplayShift,
  onResetForNextEventVisitor,
  onReturnToTitle,
  onReplayClosing,
}) => {
  const mins = Math.floor(state.shiftElapsedSeconds / 60);
  const secs = Math.floor(state.shiftElapsedSeconds % 60);
  const isEvent = state.mode === 'event';

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#081119]/90 p-6">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#c2933e]/35 bg-[#0e1a24] p-7 text-[#e8e3d5] shadow-2xl">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold tracking-widest text-amber-400 uppercase">
          <div className="flex items-center gap-2">
            <Anchor className="h-4 w-4" />
            <span>Dawn · Vaanthurai Harbor</span>
          </div>
          <span className="rounded border border-white/15 bg-[#152532] px-2.5 py-0.5 text-[11px] text-amber-200">
            {isEvent ? 'Event Edition' : 'Full Story'}
          </span>
        </div>

        <h1 className="font-display-serif mt-2 text-3xl font-semibold text-[#f4efe4] sm:text-4xl">
          M/V Thendral Safely Alongside
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          “We’re alongside. Everyone’s ashore. We saw your light.” — Captain Meera
        </p>

        {/* Debrief Metrics */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-y border-white/10 py-4 text-center sm:grid-cols-4">
          <div>
            <div className="text-xs text-slate-400">Watch Duration</div>
            <div className="font-mono-tabular mt-1 text-xl font-semibold text-amber-200">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Channel Bearing</div>
            <div className="font-mono-tabular mt-1 text-xl font-semibold text-amber-200">072° E</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Missing Light</div>
            <div className="font-mono-tabular mt-1 text-xl font-semibold text-amber-200">
              Buoy E-4
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Chart Status</div>
            <div className="font-mono-tabular mt-1 text-xl font-semibold text-emerald-300">
              {state.chartHung ? 'Verified' : 'Logged'}
            </div>
          </div>
        </div>

        {/* Credits */}
        <div className="mt-5 grid gap-4 text-xs text-slate-300 sm:grid-cols-2">
          <div>
            <div className="font-semibold tracking-wider text-amber-300 uppercase">Production</div>
            <ul className="mt-1.5 space-y-1 text-slate-300">
              <li>The Last Lighthouse: The Missing Light</li>
              <li>Vaanthurai Waterfront & Props — Procedural Three.js</li>
              <li>Characters — Muthu & Captain Meera (Original Meshes)</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold tracking-wider text-amber-300 uppercase">Audio & VR</div>
            <ul className="mt-1.5 space-y-1 text-slate-300">
              <li>Harbor Soundscape & Score — Procedural Web Audio</li>
              <li>Voice Lines — Local Browser Speech Synthesis</li>
              <li>Play Modes — Desktop, Android Touch, Stereo VR & WebXR</li>
            </ul>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          {isEvent ? (
            <button
              type="button"
              data-start="true"
              onClick={onResetForNextEventVisitor}
              className="flex items-center gap-2 rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-500 whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4" />
              <span>Next Visitor (Fresh Event)</span>
            </button>
          ) : (
            <button
              type="button"
              data-start="true"
              onClick={onReplayShift}
              className="flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-500 whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Play Again</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReturnToTitle}
            className="rounded-lg border border-white/20 bg-[#152532] px-5 py-3 text-sm font-medium text-slate-200 hover:bg-[#1d3242] whitespace-nowrap"
          >
            Return to Title
          </button>

          <button
            type="button"
            onClick={onReplayClosing}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-amber-400/30 px-4 py-3 text-xs font-medium text-amber-200 hover:bg-amber-600/15 whitespace-nowrap"
          >
            <Volume2 className="h-4 w-4" />
            <span>Replay Closing Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
