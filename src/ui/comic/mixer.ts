// The mixer: turns an AudioCue into sound. Web Audio, because <audio loop>
// cannot loop an MP3 without a gap and a road-trip bed that hiccups every
// two minutes is worse than silence. Three looping channels (music,
// ambience, engine) crossfade between tracks; one-shots fire on a fourth.
// Browsers keep the context suspended until the player touches the page,
// so nothing here throws when there is no sound yet — it just waits.

import type { AudioId, AudioSfxId } from '../assets';
import type { AudioCue, EngineBed } from './audio';

export interface MixerSources {
  audio(id: AudioId): string | null;
  audioSfx(id: AudioSfxId): string | null;
}

export interface Mixer {
  /** Make the sound match the cue. Safe to call before the context is unlocked. */
  apply(cue: AudioCue): void;
  /** Fire one sound effect now (keystrokes, clicks the planner never sees). */
  play(id: AudioSfxId): void;
  /** Sound on or off. Off suspends the context: loops hold their place. */
  setEnabled(on: boolean): void;
  isEnabled(): boolean;
  /** Call from a user gesture: resumes the context the browser started suspended. */
  unlock(): void;
  /** Stop everything and release the context. */
  dispose(): void;
}

interface Channel {
  gain: GainNode;
  /** The id playing (or loading) on this channel. */
  id: string | null;
  source: AudioBufferSourceNode | null;
  /** Bumped on every change so a slow load for an old track is ignored. */
  token: number;
  fade: number;
}

/** Channel gains, tuned against the brief: music −16 LUFS, beds −22 LUFS, van beds hot. */
const LEVELS = { music: 0.55, ambience: 0.8, engine: 0.28, sfx: 0.9 } as const;
const FADES = { music: 0.6, ambience: 1.2, engine: 0.35 } as const;

/** Sounds worth having in memory before they are needed: everything that fires on a keypress. */
const PRELOAD: readonly AudioSfxId[] = [
  'ui-select',
  'ui-back',
  'ui-page-turn',
  'ui-type-key',
  'ui-type-ding',
  'ui-error',
  'ui-notice',
  'ui-balloon-pop',
  'kaching',
  'vroom',
  'zzz',
];

function contextClass(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  const w = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

export function createMixer(sources: MixerSources, options: { enabled: boolean; loops: ReadonlySet<AudioId> }): Mixer {
  const Ctx = contextClass();
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let enabled = options.enabled;
  let disposed = false;
  const buffers = new Map<string, Promise<AudioBuffer | null>>();
  const channels: Record<'music' | 'ambience' | 'engine', Channel | null> = { music: null, ambience: null, engine: null };
  let sfxGain: GainNode | null = null;
  let pendingCue: AudioCue | null = null;

  function ensureContext(): AudioContext | null {
    if (ctx || !Ctx || disposed) return ctx;
    try {
      ctx = new Ctx();
    } catch {
      return null;
    }
    master = ctx.createGain();
    master.gain.value = enabled ? 1 : 0;
    master.connect(ctx.destination);
    for (const name of ['music', 'ambience', 'engine'] as const) {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(master);
      channels[name] = { gain, id: null, source: null, token: 0, fade: FADES[name] };
    }
    sfxGain = ctx.createGain();
    sfxGain.gain.value = LEVELS.sfx;
    sfxGain.connect(master);
    if (!enabled) void ctx.suspend();
    document.addEventListener('visibilitychange', onVisibility);
    return ctx;
  }

  function onVisibility(): void {
    if (!ctx || !enabled) return;
    if (document.hidden) void ctx.suspend();
    else void ctx.resume();
  }

  function load(url: string): Promise<AudioBuffer | null> {
    let promise = buffers.get(url);
    if (!promise) {
      promise = (async () => {
        const context = ensureContext();
        if (!context) return null;
        try {
          const response = await fetch(url);
          if (!response.ok) return null;
          const bytes = await response.arrayBuffer();
          return await context.decodeAudioData(bytes);
        } catch {
          return null;
        }
      })();
      buffers.set(url, promise);
    }
    return promise;
  }

  function stopSource(channel: Channel, at: number, fade: number): void {
    const old = channel.source;
    if (!old) return;
    channel.source = null;
    try {
      old.stop(at + fade + 0.05);
    } catch {
      /* already stopped */
    }
  }

  async function setLoop(name: 'music' | 'ambience' | 'engine', id: string | null, url: string | null, loop: boolean, level: number): Promise<void> {
    const context = ensureContext();
    const channel = channels[name];
    if (!context || !channel) return;
    if (channel.id === id) return;
    channel.id = id;
    const token = ++channel.token;
    const now = context.currentTime;
    const outgoing = channel.gain;
    outgoing.gain.cancelScheduledValues(now);
    outgoing.gain.setValueAtTime(outgoing.gain.value, now);
    outgoing.gain.linearRampToValueAtTime(0, now + channel.fade);
    stopSource(channel, now, channel.fade);
    window.setTimeout(() => {
      if (channel.gain !== outgoing) outgoing.disconnect();
    }, (channel.fade + 0.2) * 1000);
    if (!url) return;

    const buffer = await load(url);
    if (!buffer || channel.token !== token || disposed) return;
    // A previous fade-out may still be running on the shared gain; start the new
    // source on a fresh node so the two never fight.
    const gain = context.createGain();
    gain.gain.value = 0;
    gain.connect(master!);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.connect(gain);
    const start = context.currentTime;
    gain.gain.linearRampToValueAtTime(level, start + channel.fade);
    source.start(start);
    channel.gain = gain;
    channel.source = source;
  }

  function playSfx(url: string | null): void {
    const context = ensureContext();
    if (!context || !url || !enabled || context.state !== 'running') return;
    void load(url).then((buffer) => {
      if (!buffer || disposed || !sfxGain) return;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(sfxGain);
      source.start();
    });
  }

  function applyNow(cue: AudioCue): void {
    void setLoop('music', cue.music, cue.music ? sources.audio(cue.music) : null, cue.music ? options.loops.has(cue.music) : true, LEVELS.music);
    void setLoop('ambience', cue.ambience, cue.ambience ? sources.audioSfx(cue.ambience) : null, true, LEVELS.ambience);
    const engine: EngineBed | null = cue.engine;
    void setLoop('engine', engine, engine ? sources.audioSfx(engine) : null, true, LEVELS.engine);
    for (const id of cue.sfx) playSfx(sources.audioSfx(id));
    for (const id of cue.stings) playSfx(sources.audio(id));
  }

  function preload(): void {
    if (!enabled) return;
    for (const id of PRELOAD) {
      const url = sources.audioSfx(id);
      if (url) void load(url);
    }
  }

  preload();

  return {
    apply(cue) {
      if (disposed) return;
      const context = ensureContext();
      if (!context || context.state !== 'running') {
        // Nothing can sound yet; remember the latest cue for the unlock.
        pendingCue = cue;
        return;
      }
      applyNow(cue);
    },
    play(id) {
      if (!disposed) playSfx(sources.audioSfx(id));
    },
    setEnabled(on) {
      enabled = on;
      const context = ensureContext();
      if (!context || !master) return;
      master.gain.value = on ? 1 : 0;
      if (on) {
        preload();
        void context.resume().then(() => {
          if (pendingCue) {
            const cue = pendingCue;
            pendingCue = null;
            applyNow(cue);
          }
        });
      } else void context.suspend();
    },
    isEnabled: () => enabled,
    unlock() {
      const context = ensureContext();
      if (!context || !enabled) return;
      if (context.state === 'running') return;
      void context.resume().then(() => {
        if (pendingCue && !disposed) {
          const cue = pendingCue;
          pendingCue = null;
          applyNow(cue);
        }
      });
    },
    dispose() {
      disposed = true;
      document.removeEventListener('visibilitychange', onVisibility);
      for (const name of ['music', 'ambience', 'engine'] as const) {
        const channel = channels[name];
        if (channel?.source) {
          try {
            channel.source.stop();
          } catch {
            /* already stopped */
          }
        }
        channels[name] = null;
      }
      void ctx?.close().catch(() => undefined);
      ctx = null;
      master = null;
      sfxGain = null;
      buffers.clear();
    },
  };
}
