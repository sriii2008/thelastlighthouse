import React from 'react';
import { Volume2, VolumeX, X } from 'lucide-react';
import type { GameSettings, QualityProfile, TextSizeSetting } from '../game/gameState';

interface SettingsModalProps {
  open: boolean;
  settings: GameSettings;
  onChange: (next: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ open, settings, onChange, onClose }) => {
  if (!open) return null;

  const update = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-[#c2933e]/35 bg-[#0e1a24] p-5 text-[#e8e3d5] shadow-2xl">
        <div className="mb-3 flex shrink-0 items-center justify-between border-b border-white/10 pb-3">
          <h2 id="settings-title" className="font-display-serif text-xl font-semibold tracking-wide text-amber-100">
            Audio & Comfort Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-[#152532] text-slate-200 hover:bg-[#1d3242] focus-visible:outline-2 focus-visible:outline-amber-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 text-sm">
          {/* Master Sound Toggle */}
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-slate-200">Master Audio</span>
            <button
              type="button"
              onClick={() => update('soundEnabled', !settings.soundEnabled)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-medium whitespace-nowrap transition-colors ${
                settings.soundEnabled
                  ? 'border-amber-500/60 bg-amber-600/20 text-amber-200'
                  : 'border-white/15 bg-[#152532] text-slate-400'
              }`}
            >
              {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {settings.soundEnabled ? 'Sound On' : 'Muted'}
            </button>
          </div>

          <label className="block">
            <div className="mb-1 flex justify-between text-xs text-slate-300">
              <span>Master Volume</span>
              <span className="font-mono-tabular">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.masterVolume}
              onChange={(e) => update('masterVolume', Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </label>

          {/* Separate Dialogue, Effects & Music Mixers */}
          <div className="grid gap-3 rounded-lg border border-white/10 bg-[#111f2b] p-3 sm:grid-cols-3">
            <label className="block">
              <div className="mb-1 flex justify-between text-[11px] text-slate-300">
                <span>Dialogue</span>
                <span className="font-mono-tabular">{Math.round(settings.dialogueVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.dialogueVolume}
                onChange={(e) => update('dialogueVolume', Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </label>

            <label className="block">
              <div className="mb-1 flex justify-between text-[11px] text-slate-300">
                <span>Effects</span>
                <span className="font-mono-tabular">{Math.round(settings.effectsVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.effectsVolume}
                onChange={(e) => update('effectsVolume', Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </label>

            <label className="block">
              <div className="mb-1 flex justify-between text-[11px] text-slate-300">
                <span>Music</span>
                <span className="font-mono-tabular">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.musicVolume}
                onChange={(e) => update('musicVolume', Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </label>
          </div>

          {/* Subtitles & Tamil */}
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-slate-200">Subtitles</span>
            <button
              type="button"
              onClick={() => update('subtitlesEnabled', !settings.subtitlesEnabled)}
              className={`rounded-lg border px-4 py-2 font-medium whitespace-nowrap transition-colors ${
                settings.subtitlesEnabled
                  ? 'border-amber-500/60 bg-amber-600/20 text-amber-200'
                  : 'border-white/15 bg-[#152532] text-slate-400'
              }`}
            >
              {settings.subtitlesEnabled ? 'Enabled' : 'Hidden'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-slate-200">Tamil Closing Line (Epilogue)</span>
            <button
              type="button"
              onClick={() => update('tamilClosingLine', !settings.tamilClosingLine)}
              className={`rounded-lg border px-4 py-2 font-medium whitespace-nowrap transition-colors ${
                settings.tamilClosingLine
                  ? 'border-amber-500/60 bg-amber-600/20 text-amber-200'
                  : 'border-white/15 bg-[#152532] text-slate-400'
              }`}
            >
              {settings.tamilClosingLine ? 'Tamil + English' : 'English Only'}
            </button>
          </div>

          {/* Reduced Lightning */}
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-slate-200">Reduced Lightning Flashes</span>
            <button
              type="button"
              onClick={() => update('reducedLightning', !settings.reducedLightning)}
              className={`rounded-lg border px-4 py-2 font-medium whitespace-nowrap transition-colors ${
                settings.reducedLightning
                  ? 'border-amber-500/60 bg-amber-600/20 text-amber-200'
                  : 'border-white/15 bg-[#152532] text-slate-400'
              }`}
            >
              {settings.reducedLightning ? 'Reduced' : 'Standard'}
            </button>
          </div>

          {/* Text Size */}
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-slate-200">Text Size</span>
            <div className="flex gap-1 rounded-lg bg-[#152532] p-1">
              {(['normal', 'large'] as TextSizeSetting[]).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => update('textSize', sz)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                    settings.textSize === sz ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Profile */}
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-slate-200">Graphics Quality</span>
            <div className="flex gap-1 rounded-lg bg-[#152532] p-1">
              {(['auto', 'mobile', 'high'] as QualityProfile[]).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => update('quality', q)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                    settings.quality === q ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Seated Eye Height */}
          <label className="block pt-1">
            <div className="mb-1 flex justify-between text-xs text-slate-300">
              <span>Seated Eye Height Adjustment</span>
              <span className="font-mono-tabular">
                {settings.seatedHeightOffset >= 0 ? '+' : ''}
                {settings.seatedHeightOffset.toFixed(2)} m
              </span>
            </div>
            <input
              type="range"
              min={-0.4}
              max={0.4}
              step={0.05}
              value={settings.seatedHeightOffset}
              onChange={(e) => update('seatedHeightOffset', Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </label>
        </div>

        <div className="mt-4 flex shrink-0 justify-end border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-500 focus-visible:outline-2 focus-visible:outline-amber-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
