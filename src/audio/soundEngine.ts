import type { AreaId, GameSettings } from '../game/gameState';

export type ScoreMood = 'silent' | 'storm' | 'powered' | 'dawn';

export interface SoundSourceCoords {
  x: number;
  y: number;
  z: number;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private noiseBuffer: AudioBuffer | null = null;
  private rainGain: GainNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private tinRoofRainGain: GainNode | null = null;
  private surfGain: GainNode | null = null;
  private jettySlapGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private radioStaticGain: GainNode | null = null;
  private radioStaticFilter: BiquadFilterNode | null = null;
  private generatorGain: GainNode | null = null;
  private generatorFilter: BiquadFilterNode | null = null;
  private generatorOsc: OscillatorNode | null = null;

  private rainPanner: PannerNode | null = null;
  private tinRoofPanner: PannerNode | null = null;
  private jettySlapPanner: PannerNode | null = null;
  private mastPanner: PannerNode | null = null;
  private radioPanner: PannerNode | null = null;
  private generatorPanner: PannerNode | null = null;
  private bellPanner: PannerNode | null = null;
  private ferryPanner: PannerNode | null = null;

  private currentMood: ScoreMood = 'silent';
  private scoreTimer: number | null = null;
  private mastTapTimer: number | null = null;
  private scoreStep = 0;
  private dialogueDucking = false;
  private lastUtteranceId = 0;
  private currentArea: AreaId = 'jetty';
  private dawnMix = 0;

  private settings: GameSettings = {
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

  private unlocked = false;

  public unlock(): boolean {
    if (typeof window === 'undefined') return false;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return false;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.setupGraph();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.unlocked = true;
    this.applySettings(this.settings);
    return true;
  }

  public isUnlocked(): boolean {
    return this.unlocked;
  }

  public applySettings(settings: GameSettings): void {
    this.settings = settings;
    if (!this.ctx || !this.masterGain) return;
    const target = settings.soundEnabled ? settings.masterVolume : 0;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setTargetAtTime(target, now, 0.08);
    if (this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(0.95 * settings.effectsVolume, now, 0.08);
    }
    this.updateDucking();
  }

  public setDialogueDucking(active: boolean): void {
    this.dialogueDucking = active;
    this.updateDucking();
  }

  private updateDucking(): void {
    if (!this.ctx || !this.ambienceGain || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const duckFactor = this.dialogueDucking ? 0.35 : 1.0;
    const fxScale = this.settings.effectsVolume;
    const musScale = this.settings.musicVolume;
    this.ambienceGain.gain.setTargetAtTime(0.68 * fxScale * duckFactor, now, 0.18);
    this.musicGain.gain.setTargetAtTime(0.55 * musScale * duckFactor, now, 0.25);
  }

  private createPanner(x: number, y: number, z: number): PannerNode | null {
    if (!this.ctx) return null;
    try {
      const p = this.ctx.createPanner();
      p.panningModel = 'HRTF';
      p.distanceModel = 'inverse';
      p.refDistance = 3.0;
      p.maxDistance = 120;
      p.rolloffFactor = 1.0;
      p.positionX.value = x;
      p.positionY.value = y;
      p.positionZ.value = z;
      return p;
    } catch {
      return null;
    }
  }

  private setupGraph(): void {
    if (!this.ctx) return;
    const ctx = this.ctx;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = this.settings.soundEnabled ? this.settings.masterVolume : 0;
    this.masterGain.connect(ctx.destination);

    this.ambienceGain = ctx.createGain();
    this.ambienceGain.gain.value = 0.68 * this.settings.effectsVolume;
    this.ambienceGain.connect(this.masterGain);

    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0.55 * this.settings.musicVolume;
    this.musicGain.connect(this.masterGain);

    this.sfxGain = ctx.createGain();
    this.sfxGain.gain.value = 0.95 * this.settings.effectsVolume;
    this.sfxGain.connect(this.masterGain);

    // 3-second noise buffer
    const sr = ctx.sampleRate;
    const len = sr * 3;
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.04 * white) / 1.04;
      data[i] = last * 2.5 + white * 0.35;
    }
    this.noiseBuffer = buf;

    // Positional harbor sound emitters
    this.rainPanner = this.createPanner(0, 4, 2);
    this.tinRoofPanner = this.createPanner(6, 4.8, 22); // Blue-roofed boathouse
    this.jettySlapPanner = this.createPanner(27, 0.5, 11); // Hollow water slap beneath jetty
    this.mastPanner = this.createPanner(20, 5.0, 10); // Crooked signal mast halyard
    this.radioPanner = this.createPanner(0.3, 3.6, -0.5);
    this.generatorPanner = this.createPanner(0.1, 7.6, -1.1);
    this.bellPanner = this.createPanner(3.5, 12.0, 2.4);
    this.ferryPanner = this.createPanner(56, 2.0, -8);

    [this.rainPanner, this.tinRoofPanner, this.jettySlapPanner].forEach((p) => {
      p?.connect(this.ambienceGain!);
    });
    [this.mastPanner, this.radioPanner, this.generatorPanner, this.bellPanner, this.ferryPanner].forEach((p) => {
      p?.connect(this.sfxGain!);
    });

    // Main rain bed (filter adjusts indoor vs outdoor!)
    const rainSrc = ctx.createBufferSource();
    rainSrc.buffer = this.noiseBuffer;
    rainSrc.loop = true;
    this.rainFilter = ctx.createBiquadFilter();
    this.rainFilter.type = 'bandpass';
    this.rainFilter.frequency.value = 1750;
    this.rainFilter.Q.value = 0.65;
    this.rainGain = ctx.createGain();
    this.rainGain.gain.value = 0.16;
    rainSrc.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    if (this.rainPanner) this.rainGain.connect(this.rainPanner);
    else this.rainGain.connect(this.ambienceGain);
    rainSrc.start();

    // Metal boathouse roof rain patter (crisp high-mid metallic hiss)
    const tinSrc = ctx.createBufferSource();
    tinSrc.buffer = this.noiseBuffer;
    tinSrc.loop = true;
    const tinFilter = ctx.createBiquadFilter();
    tinFilter.type = 'bandpass';
    tinFilter.frequency.value = 3400;
    tinFilter.Q.value = 1.9;
    this.tinRoofRainGain = ctx.createGain();
    this.tinRoofRainGain.gain.value = 0.04;
    tinSrc.connect(tinFilter);
    tinFilter.connect(this.tinRoofRainGain);
    if (this.tinRoofPanner) this.tinRoofRainGain.connect(this.tinRoofPanner);
    else this.tinRoofRainGain.connect(this.ambienceGain);
    tinSrc.start();

    // General coastal surf bed
    const surfSrc = ctx.createBufferSource();
    surfSrc.buffer = this.noiseBuffer;
    surfSrc.loop = true;
    const surfFilter = ctx.createBiquadFilter();
    surfFilter.type = 'lowpass';
    surfFilter.frequency.value = 340;
    this.surfGain = ctx.createGain();
    this.surfGain.gain.value = 0.22;
    surfSrc.connect(surfFilter);
    surfFilter.connect(this.surfGain);
    this.surfGain.connect(this.ambienceGain);
    surfSrc.start();

    // Hollow jetty plank surf resonance
    const slapSrc = ctx.createBufferSource();
    slapSrc.buffer = this.noiseBuffer;
    slapSrc.loop = true;
    const slapFilter = ctx.createBiquadFilter();
    slapFilter.type = 'bandpass';
    slapFilter.frequency.value = 195;
    slapFilter.Q.value = 2.4;
    this.jettySlapGain = ctx.createGain();
    this.jettySlapGain.gain.value = 0.08;
    slapSrc.connect(slapFilter);
    slapFilter.connect(this.jettySlapGain);
    if (this.jettySlapPanner) this.jettySlapGain.connect(this.jettySlapPanner);
    else this.jettySlapGain.connect(this.ambienceGain);
    slapSrc.start();

    // Tower wind & draft loop
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = this.noiseBuffer;
    windSrc.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 420;
    windFilter.Q.value = 2.6;
    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0.08;
    windSrc.connect(windFilter);
    windFilter.connect(this.windGain);
    this.windGain.connect(this.ambienceGain);
    windSrc.start();

    // Radio static loop
    const staticSrc = ctx.createBufferSource();
    staticSrc.buffer = this.noiseBuffer;
    staticSrc.loop = true;
    this.radioStaticFilter = ctx.createBiquadFilter();
    this.radioStaticFilter.type = 'bandpass';
    this.radioStaticFilter.frequency.value = 2200;
    this.radioStaticFilter.Q.value = 1.4;
    this.radioStaticGain = ctx.createGain();
    this.radioStaticGain.gain.value = 0;
    staticSrc.connect(this.radioStaticFilter);
    this.radioStaticFilter.connect(this.radioStaticGain);
    if (this.radioPanner) this.radioStaticGain.connect(this.radioPanner);
    else this.radioStaticGain.connect(this.sfxGain);
    staticSrc.start();

    // Generator rumble (filtered down when heard outside generator gallery)
    this.generatorOsc = ctx.createOscillator();
    this.generatorOsc.type = 'sawtooth';
    this.generatorOsc.frequency.value = 54;
    this.generatorFilter = ctx.createBiquadFilter();
    this.generatorFilter.type = 'lowpass';
    this.generatorFilter.frequency.value = 180;
    this.generatorGain = ctx.createGain();
    this.generatorGain.gain.value = 0;
    this.generatorOsc.connect(this.generatorFilter);
    this.generatorFilter.connect(this.generatorGain);
    if (this.generatorPanner) this.generatorGain.connect(this.generatorPanner);
    else this.generatorGain.connect(this.ambienceGain);
    this.generatorOsc.start();

    // Periodic rope tap against crooked signal mast during squall
    if (this.mastTapTimer === null) {
      this.mastTapTimer = window.setInterval(() => {
        if (!this.ctx || this.ctx.state !== 'running') return;
        const stormAmount = 1 - this.dawnMix;
        if (stormAmount < 0.25) return;
        if (this.currentArea === 'jetty' || this.currentArea === 'signal_hut' || this.currentArea === 'walkway') {
          this.playTone(620 + Math.random() * 80, 0.04, 'triangle', 0.06 * stormAmount, 410, this.mastPanner);
        }
      }, 1650);
    }
  }

  public updateListener(pos: SoundSourceCoords, forward: SoundSourceCoords, up: SoundSourceCoords): void {
    if (!this.ctx) return;
    const listener = this.ctx.listener;
    if (listener.positionX) {
      listener.positionX.value = pos.x;
      listener.positionY.value = pos.y;
      listener.positionZ.value = pos.z;
      listener.forwardX.value = forward.x;
      listener.forwardY.value = forward.y;
      listener.forwardZ.value = forward.z;
      listener.upX.value = up.x;
      listener.upY.value = up.y;
      listener.upZ.value = up.z;
    }
  }

  public updateEnvironmentState(opts: {
    floor: 1 | 2 | 3;
    area: AreaId;
    dawnMix: number;
    generatorRunning: boolean;
    radioChannel: number;
    radioSolved: boolean;
    phase: string;
    ferryPos?: SoundSourceCoords;
  }): void {
    if (!this.ctx) return;
    this.currentArea = opts.area;
    this.dawnMix = opts.dawnMix;
    const now = this.ctx.currentTime;
    const stormAmount = 1 - opts.dawnMix;
    const isOutdoors = opts.area === 'jetty' || opts.area === 'walkway' || opts.area === 'wheelhouse';

    if (this.rainGain && this.rainFilter) {
      const areaRainScale =
        opts.area === 'jetty' || opts.area === 'walkway'
          ? 1.25
          : opts.area === 'lantern_room'
          ? 1.05
          : opts.area === 'generator_gallery'
          ? 0.42
          : 0.72;
      this.rainFilter.frequency.setTargetAtTime(isOutdoors ? 2200 : 1200, now, 0.2);
      this.rainGain.gain.setTargetAtTime(0.17 * stormAmount * areaRainScale, now, 0.25);
    }

    if (this.tinRoofRainGain) {
      const roofScale = opts.area === 'boathouse' ? 0.24 : 0.03;
      this.tinRoofRainGain.gain.setTargetAtTime(roofScale * stormAmount, now, 0.25);
    }

    if (this.jettySlapGain) {
      const slapScale = opts.area === 'jetty' || opts.area === 'signal_hut' ? 0.19 : 0.03;
      this.jettySlapGain.gain.setTargetAtTime(slapScale * (0.3 + stormAmount * 0.7), now, 0.3);
    }

    if (this.surfGain) {
      this.surfGain.gain.setTargetAtTime(0.08 + 0.2 * stormAmount, now, 0.35);
    }

    if (this.windGain) {
      const windLevel =
        opts.area === 'lantern_room' || opts.area === 'jetty' ? 0.14 : opts.area === 'generator_gallery' ? 0.09 : 0.05;
      this.windGain.gain.setTargetAtTime(windLevel * stormAmount, now, 0.3);
    }

    if (this.radioStaticGain && this.radioStaticFilter) {
      const showStatic = opts.phase === 'floor1_radio' && !opts.radioSolved && opts.area === 'radio_room';
      if (showStatic) {
        const dist = Math.abs(opts.radioChannel - 16);
        const clarity = dist === 0 ? 0.025 : 0.065 + Math.min(dist, 4) * 0.015;
        this.radioStaticFilter.frequency.setTargetAtTime(1400 + dist * 350, now, 0.08);
        this.radioStaticGain.gain.setTargetAtTime(clarity, now, 0.08);
      } else {
        this.radioStaticGain.gain.setTargetAtTime(0, now, 0.15);
      }
    }

    if (this.generatorGain && this.generatorFilter) {
      const insideGen = opts.area === 'generator_gallery';
      const insideTower = opts.area === 'radio_room' || opts.area === 'lantern_room';
      const genLevel = opts.generatorRunning ? (insideGen ? 0.2 : insideTower ? 0.055 : 0.012) : 0;
      this.generatorFilter.frequency.setTargetAtTime(insideGen ? 260 : 95, now, 0.25);
      this.generatorGain.gain.setTargetAtTime(genLevel, now, 0.35);
    }

    if (opts.ferryPos && this.ferryPanner) {
      this.ferryPanner.positionX.setTargetAtTime(opts.ferryPos.x, now, 0.1);
      this.ferryPanner.positionY.setTargetAtTime(opts.ferryPos.y, now, 0.1);
      this.ferryPanner.positionZ.setTargetAtTime(opts.ferryPos.z, now, 0.1);
    }
  }

  public setScoreMood(mood: ScoreMood): void {
    if (this.currentMood === mood) return;
    this.currentMood = mood;
    if (this.scoreTimer !== null) {
      window.clearInterval(this.scoreTimer);
      this.scoreTimer = null;
    }
    if (mood === 'silent') return;

    const triggerPulse = () => {
      if (!this.ctx || !this.musicGain || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      const chords: Record<Exclude<ScoreMood, 'silent'>, number[][]> = {
        storm: [
          [110, 164.81, 207.65],
          [98, 146.83, 196],
          [87.31, 130.81, 174.61],
          [82.41, 123.47, 164.81],
        ],
        powered: [
          [130.81, 196, 246.94, 293.66],
          [146.83, 220, 261.63, 329.63],
          [110, 164.81, 246.94, 329.63],
          [123.47, 196, 293.66],
        ],
        dawn: [
          [174.61, 220, 261.63, 329.63],
          [196, 246.94, 293.66, 392],
          [130.81, 196, 261.63, 329.63],
          [164.81, 246.94, 329.63, 392],
        ],
      };
      const seq = chords[mood];
      const notes = seq[this.scoreStep % seq.length];
      this.scoreStep++;

      notes.forEach((freq, i) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = mood === 'storm' ? 'triangle' : 'sine';
        osc.frequency.value = freq;
        const start = now + i * (mood === 'dawn' ? 0.14 : 0.08);
        const dur = mood === 'storm' ? 3.2 : 3.8;
        g.gain.setValueAtTime(0.0001, start);
        g.gain.linearRampToValueAtTime(mood === 'storm' ? 0.045 : 0.055, start + 0.6);
        g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        osc.connect(g);
        g.connect(this.musicGain);
        osc.start(start);
        osc.stop(start + dur + 0.05);
      });
    };

    triggerPulse();
    this.scoreTimer = window.setInterval(triggerPulse, mood === 'storm' ? 3600 : 3400);
  }

  private playTone(
    freq: number,
    dur: number,
    type: OscillatorType = 'sine',
    gainVal = 0.25,
    endFreq?: number,
    targetNode?: AudioNode | null
  ): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + dur);
    }
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(gainVal, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(g);
    g.connect(targetNode || this.sfxGain);
    osc.start(now);
    osc.stop(now + dur + 0.03);
  }

  private playNoiseBurst(dur: number, freq: number, q: number, gainVal: number, targetNode?: AudioNode | null): void {
    if (!this.ctx || !this.noiseBuffer || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gainVal, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(targetNode || this.sfxGain);
    src.start(now);
    src.stop(now + dur + 0.02);
  }

  public playTransformerThump(): void {
    this.playTone(92, 0.55, 'sawtooth', 0.45, 34);
    this.playNoiseBurst(0.28, 360, 1.2, 0.35);
  }

  public playDialClick(channel: number): void {
    this.playTone(720 + channel * 28, 0.045, 'triangle', 0.18, 420, this.radioPanner);
  }

  public playListenStatic(): void {
    this.playNoiseBurst(0.45, 2400, 1.1, 0.25, this.radioPanner);
    this.playTone(320, 0.14, 'square', 0.08, 220, this.radioPanner);
  }

  public playRadioClearChime(): void {
    this.playTone(880, 0.18, 'sine', 0.18, undefined, this.radioPanner);
    window.setTimeout(() => this.playTone(1318.5, 0.28, 'sine', 0.18, undefined, this.radioPanner), 110);
  }

  public playDoorUnlock(): void {
    this.playTone(210, 0.14, 'triangle', 0.26, 130);
    window.setTimeout(() => this.playTone(480, 0.12, 'sine', 0.22, 620), 90);
  }

  public playCabinetLatch(): void {
    this.playTone(380, 0.09, 'square', 0.16, 180, this.generatorPanner);
    this.playNoiseBurst(0.12, 950, 2, 0.18, this.generatorPanner);
  }

  public playCartridgeInsert(): void {
    this.playTone(280, 0.11, 'triangle', 0.24, 520, this.generatorPanner);
    window.setTimeout(() => this.playTone(660, 0.12, 'sine', 0.18, undefined, this.generatorPanner), 60);
  }

  public playCartridgeReject(): void {
    this.playTone(170, 0.18, 'sawtooth', 0.22, 115);
    window.setTimeout(() => this.playTone(135, 0.2, 'sawtooth', 0.2, 95), 130);
  }

  public playCartridgeRemove(): void {
    this.playTone(420, 0.09, 'triangle', 0.18, 240, this.generatorPanner);
  }

  public playIsolatorLever(): void {
    this.playTone(120, 0.45, 'sawtooth', 0.34, 68, this.generatorPanner);
    this.playNoiseBurst(0.24, 650, 1.5, 0.28, this.generatorPanner);
    window.setTimeout(() => this.playTone(240, 0.6, 'triangle', 0.22, 320, this.generatorPanner), 180);
  }

  public playDrivePinClink(): void {
    this.playTone(1180, 0.14, 'triangle', 0.22, 840);
    this.playTone(1760, 0.1, 'sine', 0.14);
  }

  public playLampIgnite(): void {
    this.playTone(180, 0.55, 'sawtooth', 0.26, 440);
    this.playNoiseBurst(0.35, 1100, 1.2, 0.18);
  }

  public playCrankDetent(bearing: number): void {
    this.playTone(300 + (bearing - 56) * 8, 0.055, 'triangle', 0.2, 190);
  }

  public playOverlaySlide(): void {
    this.playNoiseBurst(0.14, 2800, 0.9, 0.12);
    this.playTone(540, 0.05, 'sine', 0.1, 610);
  }

  public playDoubleFlashBench(matched: boolean): void {
    const pulse = (delay: number, pitch: number) => {
      window.setTimeout(() => this.playTone(pitch, 0.12, 'sine', 0.22), delay);
    };
    if (matched) {
      pulse(0, 920);
      pulse(320, 920);
    } else {
      pulse(0, 290);
    }
  }

  public playShutterVane(): void {
    this.playNoiseBurst(0.09, 1400, 2.2, 0.24);
    this.playTone(240, 0.08, 'square', 0.16, 150);
    window.setTimeout(() => this.playTone(320, 0.07, 'square', 0.14, 190), 140);
  }

  public playChartStamp(): void {
    this.playTone(125, 0.14, 'triangle', 0.3, 62);
    this.playNoiseBurst(0.08, 600, 1.5, 0.24);
  }

  /** Recurring Vaanthurai two-short-blast ferry horn motif */
  public playDoubleShortHorn(): void {
    const singleBlast = (delayMs: number) => {
      window.setTimeout(() => {
        this.playTone(116.54, 0.72, 'sawtooth', 0.34, 114, this.ferryPanner);
        this.playTone(146.83, 0.72, 'sawtooth', 0.26, 144, this.ferryPanner);
      }, delayMs);
    };
    singleBlast(0);
    singleBlast(950);
  }

  public playShipHorn(): void {
    this.playDoubleShortHorn();
  }

  public playAllClearBell(): void {
    const partials = [784, 1568, 2352, 3136];
    partials.forEach((f, idx) => {
      this.playTone(f, 2.2 - idx * 0.35, 'sine', 0.22 / (idx + 1), undefined, this.bellPanner);
    });
  }

  public playTeleportWhoosh(): void {
    this.playNoiseBurst(0.18, 700, 1.1, 0.1);
  }

  public getVoiceAvailability(): { supported: boolean; voiceCount: number; hasTamil: boolean } {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return { supported: false, voiceCount: 0, hasTamil: false };
    }
    const voices = window.speechSynthesis.getVoices();
    const hasTamil = voices.some((v) => v.lang.toLowerCase().startsWith('ta'));
    return { supported: true, voiceCount: voices.length, hasTamil };
  }

  public speakLine(
    text: string,
    speaker: 'muthu' | 'meera',
    opts?: { tamilText?: string; onEnd?: () => void }
  ): void {
    if (!this.settings.soundEnabled || this.settings.dialogueVolume <= 0.02) return;
    this.setDialogueDucking(true);
    const utterToken = ++this.lastUtteranceId;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      globalThis.setTimeout(() => {
        if (this.lastUtteranceId === utterToken) {
          this.setDialogueDucking(false);
          opts?.onEnd?.();
        }
      }, 3200);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const voices = window.speechSynthesis.getVoices();
      const tamilVoice = opts?.tamilText
        ? voices.find((v) => v.lang.toLowerCase().startsWith('ta'))
        : undefined;

      const spokenText = tamilVoice && opts?.tamilText ? opts.tamilText : text;
      const utter = new SpeechSynthesisUtterance(spokenText);
      utter.volume = Math.min(1, this.settings.masterVolume * this.settings.dialogueVolume);
      utter.rate = speaker === 'muthu' ? 0.92 : 0.98;
      utter.pitch = speaker === 'muthu' ? 0.85 : 1.08;

      if (tamilVoice) {
        utter.voice = tamilVoice;
        utter.lang = tamilVoice.lang;
      } else {
        const enVoice =
          voices.find((v) => v.lang.toLowerCase().includes('en-in')) ||
          voices.find((v) => v.lang.toLowerCase().startsWith('en'));
        if (enVoice) utter.voice = enVoice;
      }

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        if (this.lastUtteranceId === utterToken) {
          this.setDialogueDucking(false);
          opts?.onEnd?.();
        }
      };
      utter.onend = finish;
      utter.onerror = finish;
      window.speechSynthesis.speak(utter);
      window.setTimeout(finish, 7000);
    } catch {
      this.setDialogueDucking(false);
    }
  }

  public stopSpeech(): void {
    this.lastUtteranceId++;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
    this.setDialogueDucking(false);
  }

  public dispose(): void {
    this.stopSpeech();
    if (this.scoreTimer !== null) {
      window.clearInterval(this.scoreTimer);
      this.scoreTimer = null;
    }
    if (this.mastTapTimer !== null) {
      window.clearInterval(this.mastTapTimer);
      this.mastTapTimer = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export const soundEngine = new SoundEngine();
