'use client'

// Web Audio API チップチューン音楽エンジン
// パワポケ4 GBAスタイルに合わせた8ビット風BGM/SFX

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let currentBgmStop: (() => void) | null = null
export let isMuted = false

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.35
    masterGain.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

const F: Record<string, number> = {
  R: 0,
  C3: 130.8, D3: 146.8, E3: 164.8, F3: 174.6, G3: 196.0, A3: 220.0, Bb3: 233.1, B3: 246.9,
  C4: 261.6, D4: 293.7, Eb4: 311.1, E4: 329.6, F4: 349.2, Fs4: 370.0, G4: 392.0, Ab4: 415.3, A4: 440.0, Bb4: 466.2, B4: 493.9,
  C5: 523.3, D5: 587.3, Eb5: 622.3, E5: 659.3, F5: 698.5, Fs5: 740.0, G5: 784.0, Ab5: 830.6, A5: 880.0, Bb5: 932.3, B5: 987.8,
  C6: 1046.5,
}

function schedNote(
  freq: number, t: number, dur: number,
  type: OscillatorType = 'square', vol = 0.11
) {
  if (!ctx || !masterGain || freq === 0) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.connect(g)
  g.connect(masterGain)
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.01, dur * 0.88))
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

type NoteSeq = Array<[string, number]>

function secPerBeat(bpm: number) { return 60 / bpm }

function seqDuration(seq: NoteSeq, bpm: number) {
  return seq.reduce((s, [, b]) => s + b * secPerBeat(bpm), 0)
}

function playLoop(
  seq: NoteSeq, bpm: number,
  type: OscillatorType = 'square', vol = 0.10
): () => void {
  let running = true
  const c = getCtx()
  let nextStart = c.currentTime + 0.08

  function schedule() {
    if (!running) return
    let t = nextStart
    for (const [n, beats] of seq) {
      const dur = beats * secPerBeat(bpm)
      if (!isMuted) schedNote(F[n] ?? 0, t, dur * 0.88, type, vol)
      t += dur
    }
    nextStart = t
    const waitMs = Math.max(80, (seqDuration(seq, bpm) - 0.4) * 1000)
    setTimeout(() => { if (running) schedule() }, waitMs)
  }

  schedule()
  return () => { running = false }
}

// ===== BGMシーケンス =====

// フィールドBGM — Gメジャー、明るく冒険的 (BPM 130)
const FIELD_SEQ: NoteSeq = [
  ['G4', 0.5], ['B4', 0.5], ['D5', 1.0],
  ['B4', 0.5], ['A4', 0.5], ['G4', 1.0],
  ['C5', 0.5], ['A4', 0.5], ['G4', 1.0],
  ['E4', 0.5], ['D4', 0.5], ['G4', 1.0],

  ['D5', 0.5], ['B4', 0.5], ['A4', 1.0],
  ['G4', 0.5], ['A4', 0.5], ['B4', 1.0],
  ['C5', 0.5], ['B4', 0.25], ['A4', 0.25], ['G4', 0.5], ['A4', 0.5],
  ['G4', 2.0],
]

// 町BGM — Fメジャー、穏やか・生活感 (BPM 108、triangle波でやわらかく)
const TOWN_SEQ: NoteSeq = [
  ['F4', 1.0], ['G4', 0.5], ['A4', 0.5],
  ['Bb4', 1.0], ['A4', 0.5], ['G4', 0.5],
  ['F4', 0.5], ['G4', 0.5], ['C5', 1.0],
  ['F4', 2.0],

  ['C5', 0.5], ['Bb4', 0.5], ['A4', 1.0],
  ['G4', 0.5], ['A4', 0.5], ['Bb4', 0.5], ['C5', 0.5],
  ['D5', 0.5], ['C5', 0.5], ['Bb4', 0.5], ['A4', 0.5],
  ['F4', 2.0],
]

// ダンジョンBGM — Dマイナー、重く不気味 (BPM 125)
const DUNGEON_SEQ: NoteSeq = [
  ['D4', 0.5], ['R', 0.25], ['D4', 0.25], ['F4', 0.5], ['R', 0.5],
  ['Eb4', 0.5], ['R', 0.25], ['Eb4', 0.25], ['G4', 0.5], ['R', 0.5],
  ['C4', 0.5], ['Bb3', 0.5], ['A3', 0.5], ['D4', 0.5],
  ['D4', 2.0],

  ['A4', 0.5], ['R', 0.25], ['G4', 0.25], ['F4', 0.5], ['Eb4', 0.5],
  ['D4', 0.5], ['R', 0.25], ['C4', 0.25], ['Bb3', 0.5], ['R', 0.5],
  ['A3', 0.5], ['Bb3', 0.5], ['C4', 0.5], ['D4', 0.5],
  ['D4', 2.0],
]

// バトルBGM — Eマイナー、緊張感・疾走感 (BPM 168)
const BATTLE_SEQ: NoteSeq = [
  ['E4', 0.25], ['E4', 0.25], ['G4', 0.25], ['R', 0.25],
  ['E4', 0.25], ['G4', 0.25], ['B4', 0.5],
  ['A4', 0.25], ['A4', 0.25], ['C5', 0.25], ['R', 0.25],
  ['G4', 0.5], ['B4', 0.5],

  ['D5', 0.25], ['D5', 0.25], ['E5', 0.25], ['R', 0.25],
  ['D5', 0.25], ['C5', 0.25], ['B4', 0.5],
  ['A4', 0.25], ['G4', 0.25], ['A4', 0.25], ['B4', 0.25],
  ['E4', 1.0], ['R', 0.5],
]

// ボスBGM — Cマイナー、重厚・ドラマチック (BPM 185)
const BOSS_SEQ: NoteSeq = [
  ['C5', 0.25], ['C5', 0.25], ['Eb5', 0.25], ['C5', 0.25],
  ['D5', 0.5], ['C5', 0.5],
  ['Bb4', 0.25], ['Bb4', 0.25], ['C5', 0.25], ['Bb4', 0.25],
  ['Ab4', 0.5], ['G4', 0.5],

  ['G5', 0.25], ['G5', 0.25], ['Ab5', 0.25], ['G5', 0.25],
  ['F5', 0.5], ['Eb5', 0.5],
  ['D5', 0.25], ['Eb5', 0.25], ['D5', 0.25], ['C5', 0.25],
  ['G4', 1.0], ['R', 0.5],
]

// ===== BGM制御 =====

export type BgmType = 'field' | 'town' | 'dungeon' | 'battle' | 'boss'

export function playBgm(type: BgmType) {
  stopBgm()
  if (isMuted) return
  getCtx()
  switch (type) {
    case 'field':
      currentBgmStop = playLoop(FIELD_SEQ, 130, 'square', 0.10)
      break
    case 'town':
      currentBgmStop = playLoop(TOWN_SEQ, 108, 'triangle', 0.12)
      break
    case 'dungeon':
      currentBgmStop = playLoop(DUNGEON_SEQ, 125, 'square', 0.10)
      break
    case 'battle':
      currentBgmStop = playLoop(BATTLE_SEQ, 168, 'square', 0.11)
      break
    case 'boss':
      currentBgmStop = playLoop(BOSS_SEQ, 185, 'square', 0.12)
      break
  }
}

export function stopBgm() {
  currentBgmStop?.()
  currentBgmStop = null
}

export function setMuted(v: boolean) {
  isMuted = v
  if (masterGain && ctx) {
    masterGain.gain.setValueAtTime(v ? 0 : 0.35, ctx.currentTime)
  }
  if (v) stopBgm()
}

export function toggleMute(): boolean {
  setMuted(!isMuted)
  return isMuted
}

// ===== SFX（効果音）— 全体的に音量2.5倍増大 =====

export function sfxAttack() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  schedNote(F.A4, t, 0.06, 'sawtooth', 0.45)
  schedNote(F.E4, t + 0.05, 0.06, 'sawtooth', 0.35)
  schedNote(F.C4, t + 0.10, 0.08, 'sawtooth', 0.25)
}

export function sfxSkill() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  schedNote(F.C4, t, 0.08, 'square', 0.30)
  schedNote(F.E4, t + 0.07, 0.08, 'square', 0.30)
  schedNote(F.G4, t + 0.14, 0.08, 'square', 0.30)
  schedNote(F.C5, t + 0.21, 0.20, 'square', 0.38)
}

export function sfxHeal() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  schedNote(F.E5, t, 0.10, 'triangle', 0.28)
  schedNote(F.G5, t + 0.09, 0.10, 'triangle', 0.28)
  schedNote(F.C5, t + 0.18, 0.28, 'triangle', 0.35)
}

export function sfxDamage() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  schedNote(F.C4, t, 0.04, 'sawtooth', 0.55)
  schedNote(F.A3, t + 0.04, 0.04, 'sawtooth', 0.45)
  schedNote(F.G3, t + 0.08, 0.06, 'sawtooth', 0.30)
}

export function sfxVictory() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  const fan: NoteSeq = [
    ['C4', 0.12], ['C4', 0.12], ['C4', 0.12],
    ['E4', 0.38],
    ['D4', 0.12], ['D4', 0.12], ['D4', 0.12],
    ['F4', 0.38],
    ['G4', 0.12], ['A4', 0.12], ['B4', 0.12], ['C5', 0.55],
  ]
  let cur = t
  for (const [n, b] of fan) {
    schedNote(F[n] ?? 0, cur, b * 0.85, 'square', 0.35)
    cur += b
  }
}

export function sfxDefeat() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  schedNote(F.G4, t, 0.35, 'triangle', 0.30)
  schedNote(F.Eb5, t + 0.35, 0.35, 'triangle', 0.25)
  schedNote(F.C4, t + 0.70, 0.45, 'triangle', 0.20)
  schedNote(F.G3, t + 1.15, 0.65, 'triangle', 0.15)
}

export function sfxLevelUp() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  const rise: NoteSeq = [
    ['C4', 0.10], ['E4', 0.10], ['G4', 0.10],
    ['C5', 0.10], ['E5', 0.10], ['G5', 0.30],
  ]
  let cur = t
  for (const [n, b] of rise) {
    schedNote(F[n] ?? 0, cur, b * 0.82, 'square', 0.33)
    cur += b
  }
}

export function sfxMenuSelect() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  schedNote(F.C5, t, 0.04, 'square', 0.22)
}

export function sfxCoin() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  schedNote(F.E5, t, 0.06, 'square', 0.27)
  schedNote(F.G5, t + 0.06, 0.09, 'square', 0.27)
}
