'use client'

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let bgmGain: GainNode | null = null  // BGM専用ゲイン — stop時にここを0にして即座に無音化
let currentBgmStop: (() => void) | null = null
export let isMuted = false

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.32
    masterGain.connect(ctx.destination)
    bgmGain = ctx.createGain()
    bgmGain.gain.value = 1.0
    bgmGain.connect(masterGain)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

const F: Record<string, number> = {
  R: 0,
  C2: 65.4, D2: 73.4, E2: 82.4, F2: 87.3, G2: 98.0, A2: 110.0, Bb2: 116.5, B2: 123.5,
  C3: 130.8, D3: 146.8, E3: 164.8, F3: 174.6, G3: 196.0, A3: 220.0, Bb3: 233.1, B3: 246.9,
  C4: 261.6, D4: 293.7, Eb4: 311.1, E4: 329.6, F4: 349.2, Fs4: 370.0, G4: 392.0, Ab4: 415.3,
  A4: 440.0, Bb4: 466.2, B4: 493.9,
  C5: 523.3, D5: 587.3, Eb5: 622.3, E5: 659.3, F5: 698.5, Fs5: 740.0, G5: 784.0, Ab5: 830.6,
  A5: 880.0, Bb5: 932.3, B5: 987.8,
  C6: 1046.5,
}

function schedNote(
  freq: number, t: number, dur: number,
  type: OscillatorType = 'square', vol = 0.11,
  throughBgmGain = false
) {
  if (!ctx || !masterGain || freq === 0) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.connect(g)
  g.connect(throughBgmGain && bgmGain ? bgmGain : masterGain)
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.01, dur * 0.85))
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

type NoteSeq = Array<[string, number]>
type Voice = { seq: NoteSeq; type: OscillatorType; vol: number }

function spb(bpm: number) { return 60 / bpm }
function seqDur(seq: NoteSeq, bpm: number) { return seq.reduce((s, [, b]) => s + b * spb(bpm), 0) }

function playMultiLoop(voices: Voice[], bpm: number): () => void {
  let running = true
  const c = getCtx()
  const loopDur = Math.max(...voices.map(v => seqDur(v.seq, bpm)))
  let nextStart = c.currentTime + 0.08

  function schedule() {
    if (!running) return
    const t = nextStart
    for (const { seq, type, vol } of voices) {
      let cur = t
      for (const [n, beats] of seq) {
        const dur = beats * spb(bpm)
        if (!isMuted) schedNote(F[n] ?? 0, cur, dur * 0.85, type, vol, true)
        cur += dur
      }
    }
    nextStart = t + loopDur
    const waitMs = Math.max(80, (loopDur - 0.5) * 1000)
    setTimeout(() => { if (running) schedule() }, waitMs)
  }

  schedule()
  return () => { running = false }
}

// ===== BGMシーケンス =====

// フィールドBGM — Gメジャー 英雄的・冒険感 BPM130
// 3声: メロディ(square)・ハーモニー(triangle)・ベース(sawtooth)
const FIELD_MEL: NoteSeq = [
  ['G4',0.5],['B4',0.5],['D5',1.0], ['B4',0.5],['A4',0.5],['G4',1.0],
  ['C5',0.5],['E5',0.5],['D5',0.5],['C5',0.5], ['B4',0.5],['A4',0.5],['G4',1.0],
  ['D5',0.5],['B4',0.5],['A4',1.0], ['G4',0.5],['A4',0.5],['B4',1.0],
  ['E5',0.25],['D5',0.25],['C5',0.25],['B4',0.25],['A4',0.5],['G4',0.5],
  ['G4',2.0],
]
const FIELD_HAR: NoteSeq = [
  ['E4',0.5],['G4',0.5],['B4',1.0], ['G4',0.5],['Fs4',0.5],['E4',1.0],
  ['A4',0.5],['C5',0.5],['B4',0.5],['A4',0.5], ['G4',0.5],['Fs4',0.5],['E4',1.0],
  ['B4',0.5],['G4',0.5],['Fs4',1.0], ['E4',0.5],['Fs4',0.5],['G4',1.0],
  ['C5',0.25],['B4',0.25],['A4',0.25],['G4',0.25],['Fs4',0.5],['E4',0.5],
  ['E4',2.0],
]
const FIELD_BAS: NoteSeq = [
  ['G3',1.0],['R',1.0], ['C3',1.0],['R',1.0],
  ['A3',1.0],['R',1.0], ['D3',1.0],['R',1.0],
  ['G3',1.0],['D3',1.0], ['E3',1.0],['C3',1.0],
  ['D3',0.5],['C3',0.5],['B2',0.5],['A2',0.5],
  ['G2',2.0],
]

// 町BGM — Fメジャー 暖かく生活感 BPM108
const TOWN_MEL: NoteSeq = [
  ['F4',0.5],['G4',0.5],['A4',0.5],['Bb4',0.5], ['C5',1.0],['A4',1.0],
  ['G4',0.5],['A4',0.5],['Bb4',0.5],['G4',0.5], ['F4',2.0],
  ['C5',0.5],['Bb4',0.5],['A4',1.0], ['Bb4',0.5],['C5',0.5],['D5',1.0],
  ['C5',0.5],['Bb4',0.5],['A4',0.5],['G4',0.5], ['F4',2.0],
]
const TOWN_HAR: NoteSeq = [
  ['C4',0.5],['E4',0.5],['F4',0.5],['G4',0.5], ['A4',1.0],['F4',1.0],
  ['E4',0.5],['F4',0.5],['G4',0.5],['E4',0.5], ['C4',2.0],
  ['A4',0.5],['G4',0.5],['F4',1.0], ['G4',0.5],['A4',0.5],['Bb4',1.0],
  ['A4',0.5],['G4',0.5],['F4',0.5],['E4',0.5], ['C4',2.0],
]
const TOWN_BAS: NoteSeq = [
  ['F3',1.0],['C3',1.0], ['F3',1.0],['C3',1.0],
  ['Bb2',1.0],['F3',1.0], ['F3',1.0],['C3',1.0],
  ['F3',1.0],['C3',1.0], ['Bb2',1.0],['F3',1.0],
  ['A2',1.0],['Bb2',1.0], ['F2',2.0],
]

// ダンジョンBGM — Dマイナー 不気味・緊張 BPM110
const DUN_MEL: NoteSeq = [
  ['D4',0.5],['R',0.25],['D4',0.25],['F4',0.5],['Eb4',0.5],
  ['D4',0.5],['C4',0.5],['Bb3',1.0],
  ['A3',0.5],['Bb3',0.25],['A3',0.25],['G3',0.5],['A3',0.5],
  ['D4',2.0],
  ['F4',0.5],['G4',0.25],['F4',0.25],['Eb4',0.5],['D4',0.5],
  ['C4',0.5],['D4',0.25],['Eb4',0.25],['F4',1.0],
  ['E4',0.5],['Eb4',0.5],['D4',0.5],['C4',0.5],
  ['D4',2.0],
]
const DUN_BAS: NoteSeq = [
  ['D3',1.0],['R',1.0],['D3',0.5],['C3',0.5],
  ['Bb2',1.0],['A2',1.0],
  ['D3',1.0],['R',1.0],['A2',0.5],['Bb2',0.5],
  ['D3',2.0],
  ['F3',1.0],['R',1.0],['Eb3',0.5],['D3',0.5],
  ['C3',1.0],['Bb2',1.0],
  ['A2',0.5],['Bb2',0.5],['C3',0.5],['D3',0.5],
  ['D3',2.0],
]

// バトルBGM — Eマイナー 疾走・緊迫 BPM172
const BATTLE_MEL: NoteSeq = [
  ['E5',0.25],['D5',0.25],['B4',0.25],['A4',0.25], ['G4',0.25],['A4',0.25],['B4',0.5],
  ['E5',0.25],['Fs5',0.25],['G5',0.25],['Fs5',0.25], ['E5',0.5],['D5',0.5],
  ['G5',0.25],['Fs5',0.25],['E5',0.25],['D5',0.25], ['C5',0.25],['D5',0.25],['E5',0.5],
  ['B4',0.25],['C5',0.25],['D5',0.25],['C5',0.25], ['B4',1.0],
  ['A4',0.25],['B4',0.25],['C5',0.25],['B4',0.25], ['A4',0.5],['G4',0.5],
  ['Fs4',0.25],['G4',0.25],['A4',0.25],['B4',0.25], ['C5',0.5],['B4',0.5],
  ['G4',0.25],['A4',0.25],['B4',0.25],['A4',0.25], ['G4',0.25],['Fs4',0.25],['E4',0.5],
  ['E4',1.5],['R',0.5],
]
const BATTLE_BAS: NoteSeq = [
  ['E3',0.25],['R',0.25],['E3',0.25],['R',0.25], ['E3',0.25],['R',0.25],['E3',0.25],['R',0.25],
  ['A3',0.25],['R',0.25],['A3',0.25],['R',0.25], ['D3',0.25],['R',0.25],['D3',0.25],['R',0.25],
  ['C3',0.25],['R',0.25],['C3',0.25],['R',0.25], ['G3',0.25],['R',0.25],['G3',0.25],['R',0.25],
  ['B3',0.25],['R',0.25],['B3',0.25],['R',0.25], ['B3',1.0],
  ['A3',0.25],['R',0.25],['A3',0.25],['R',0.25], ['E3',0.25],['R',0.25],['E3',0.25],['R',0.25],
  ['D3',0.25],['R',0.25],['D3',0.25],['R',0.25], ['G3',0.25],['R',0.25],['G3',0.25],['R',0.25],
  ['C3',0.25],['R',0.25],['C3',0.25],['R',0.25], ['B2',0.25],['R',0.25],['B2',0.25],['R',0.25],
  ['E3',1.5],['R',0.5],
]

// ボスBGM — Cマイナー 重厚・ドラマチック BPM180
const BOSS_MEL: NoteSeq = [
  ['C5',0.25],['C5',0.25],['Eb5',0.25],['C5',0.25], ['G4',0.5],['Ab4',0.5],
  ['Bb4',0.25],['Bb4',0.25],['C5',0.25],['Bb4',0.25], ['Ab4',0.5],['G4',0.5],
  ['G5',0.25],['G5',0.25],['Ab5',0.25],['G5',0.25], ['F5',0.5],['Eb5',0.5],
  ['D5',0.25],['Eb5',0.25],['D5',0.25],['C5',0.25], ['G4',0.25],['Ab4',0.25],['G4',0.5],
  ['Eb5',0.25],['F5',0.25],['G5',0.25],['Ab5',0.25], ['G5',0.5],['F5',0.5],
  ['Eb5',0.25],['D5',0.25],['Eb5',0.25],['F5',0.25], ['G5',1.0],
  ['Ab5',0.25],['G5',0.25],['F5',0.25],['Eb5',0.25], ['D5',0.5],['C5',0.5],
  ['C5',1.5],['R',0.5],
]
const BOSS_HAR: NoteSeq = [
  ['Eb4',0.5],['F4',0.5], ['C4',0.5],['Eb4',0.5],
  ['G4',0.5],['Ab4',0.5], ['F4',0.5],['Eb4',0.5],
  ['Eb5',0.5],['F5',0.5], ['D5',0.5],['C5',0.5],
  ['B4',0.25],['C5',0.25],['B4',0.25],['Bb4',0.25], ['Eb4',0.5],['F4',0.5],
  ['C5',0.5],['D5',0.5], ['Bb4',0.5],['C5',0.5],
  ['G4',0.5],['Ab4',0.5], ['Bb4',0.5],['C5',0.5],
  ['F5',0.25],['Eb5',0.25],['D5',0.25],['C5',0.25], ['Bb4',0.5],['Ab4',0.5],
  ['G4',1.5],['R',0.5],
]
const BOSS_BAS: NoteSeq = [
  ['C3',0.25],['R',0.25],['C3',0.25],['G2',0.25], ['C3',0.25],['R',0.25],['Eb3',0.25],['R',0.25],
  ['Bb2',0.25],['R',0.25],['Bb2',0.25],['F2',0.25], ['Ab2',0.25],['R',0.25],['G2',0.25],['R',0.25],
  ['C3',0.25],['R',0.25],['G2',0.25],['R',0.25], ['F2',0.25],['R',0.25],['Eb3',0.25],['R',0.25],
  ['G2',0.25],['R',0.25],['G2',0.25],['R',0.25], ['C2',1.0],
  ['Eb3',0.25],['R',0.25],['Eb3',0.25],['R',0.25], ['F3',0.25],['R',0.25],['G3',0.25],['R',0.25],
  ['Ab2',0.25],['R',0.25],['Ab2',0.25],['R',0.25], ['Bb2',0.25],['R',0.25],['C3',0.25],['R',0.25],
  ['F2',0.25],['R',0.25],['F2',0.25],['R',0.25], ['G2',0.25],['R',0.25],['Ab2',0.25],['R',0.25],
  ['C3',1.5],['R',0.5],
]

// ===== BGM制御 =====

export type BgmType = 'field' | 'town' | 'dungeon' | 'battle' | 'boss'

export function playBgm(type: BgmType) {
  stopBgm()
  if (isMuted) return
  const c = getCtx()
  // キューに残った旧BGM音符を無音化してから新BGMを開始
  if (bgmGain) {
    bgmGain.gain.cancelScheduledValues(c.currentTime)
    bgmGain.gain.setValueAtTime(1.0, c.currentTime)
  }
  switch (type) {
    case 'field':
      currentBgmStop = playMultiLoop([
        { seq: FIELD_MEL, type: 'square',   vol: 0.10 },
        { seq: FIELD_HAR, type: 'triangle', vol: 0.06 },
        { seq: FIELD_BAS, type: 'sawtooth', vol: 0.08 },
      ], 130)
      break
    case 'town':
      currentBgmStop = playMultiLoop([
        { seq: TOWN_MEL, type: 'triangle', vol: 0.11 },
        { seq: TOWN_HAR, type: 'triangle', vol: 0.06 },
        { seq: TOWN_BAS, type: 'sawtooth', vol: 0.07 },
      ], 108)
      break
    case 'dungeon':
      currentBgmStop = playMultiLoop([
        { seq: DUN_MEL, type: 'square',   vol: 0.10 },
        { seq: DUN_BAS, type: 'sawtooth', vol: 0.09 },
      ], 110)
      break
    case 'battle':
      currentBgmStop = playMultiLoop([
        { seq: BATTLE_MEL, type: 'square',   vol: 0.11 },
        { seq: BATTLE_BAS, type: 'sawtooth', vol: 0.09 },
      ], 172)
      break
    case 'boss':
      currentBgmStop = playMultiLoop([
        { seq: BOSS_MEL, type: 'square',   vol: 0.11 },
        { seq: BOSS_HAR, type: 'triangle', vol: 0.06 },
        { seq: BOSS_BAS, type: 'sawtooth', vol: 0.09 },
      ], 180)
      break
  }
}

export function stopBgm() {
  currentBgmStop?.()
  currentBgmStop = null
  // キューに入っている音符を即座に無音化（重複防止の核心）
  if (bgmGain && ctx) {
    bgmGain.gain.cancelScheduledValues(ctx.currentTime)
    bgmGain.gain.setValueAtTime(0, ctx.currentTime)
  }
}

export function setMuted(v: boolean) {
  isMuted = v
  if (masterGain && ctx) {
    masterGain.gain.setValueAtTime(v ? 0 : 0.32, ctx.currentTime)
  }
  if (v) stopBgm()
}

export function toggleMute(): boolean {
  setMuted(!isMuted)
  return isMuted
}

// ===== SFX =====

export function sfxAttack() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  schedNote(F.A4, t, 0.06, 'sawtooth', 0.42)
  schedNote(F.E4, t + 0.05, 0.06, 'sawtooth', 0.32)
  schedNote(F.C4, t + 0.10, 0.08, 'sawtooth', 0.22)
}

export function sfxSkill() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  schedNote(F.C4, t,      0.08, 'square', 0.28)
  schedNote(F.E4, t+0.07, 0.08, 'square', 0.28)
  schedNote(F.G4, t+0.14, 0.08, 'square', 0.28)
  schedNote(F.C5, t+0.21, 0.20, 'square', 0.36)
}

export function sfxHeal() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  schedNote(F.E5, t,      0.10, 'triangle', 0.26)
  schedNote(F.G5, t+0.09, 0.10, 'triangle', 0.26)
  schedNote(F.C5, t+0.18, 0.28, 'triangle', 0.32)
}

export function sfxDamage() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  schedNote(F.C4, t,      0.04, 'sawtooth', 0.50)
  schedNote(F.A3, t+0.04, 0.04, 'sawtooth', 0.40)
  schedNote(F.G3, t+0.08, 0.06, 'sawtooth', 0.28)
}

export function sfxVictory() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  const fan: NoteSeq = [
    ['C4',0.12],['C4',0.12],['C4',0.12], ['E4',0.38],
    ['D4',0.12],['D4',0.12],['D4',0.12], ['F4',0.38],
    ['G4',0.12],['A4',0.12],['B4',0.12], ['C5',0.55],
  ]
  let cur = t
  for (const [n, b] of fan) {
    schedNote(F[n] ?? 0, cur, b * 0.85, 'square', 0.33)
    cur += b
  }
}

export function sfxDefeat() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  schedNote(F.G4,  t,      0.35, 'triangle', 0.28)
  schedNote(F.Eb5, t+0.35, 0.35, 'triangle', 0.23)
  schedNote(F.C4,  t+0.70, 0.45, 'triangle', 0.18)
  schedNote(F.G3,  t+1.15, 0.65, 'triangle', 0.13)
}

export function sfxLevelUp() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  const rise: NoteSeq = [
    ['C4',0.10],['E4',0.10],['G4',0.10],
    ['C5',0.10],['E5',0.10],['G5',0.30],
  ]
  let cur = t
  for (const [n, b] of rise) {
    schedNote(F[n] ?? 0, cur, b * 0.82, 'square', 0.30)
    cur += b
  }
}

export function sfxMenuSelect() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  schedNote(F.C5, t, 0.04, 'square', 0.20)
}

export function sfxCoin() {
  if (isMuted) return
  const c = getCtx(); const t = c.currentTime
  schedNote(F.E5, t,      0.06, 'square', 0.25)
  schedNote(F.G5, t+0.06, 0.09, 'square', 0.25)
}
