'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { GameState } from '@/lib/game/types'
import { EVENTS } from '@/lib/game/data'
import { CharPortraitLarge, hasCharPortrait } from './CharPortrait'

interface Props {
  gs: GameState
  onAdvance: () => void
  onSkipAll?: () => void
}

type SpeakerCfg = {
  emoji: string
  color: string
  border: string
  glow: string
  nameBg: string
}

const SPEAKER_DISPLAY: Record<string, string> = {
  player: 'レオン', gares: 'ガレス', liz: 'リズ', noa: 'ノア',
  cecil: 'セシル', bram: 'ブラム', finn: 'フィン', vais: 'ヴァイス',
  logan: 'ローガン', iris: 'イリス', sig: 'シグ', elk: 'エルク',
  mira: 'ミラ', zeno: 'ゼノ',
}

const resolveText = (text: string, playerName: string) =>
  text.replace(/\{playerName\}/g, playerName)

function getSpeakerConfig(speaker: string): SpeakerCfg {
  const configs: Record<string, SpeakerCfg> = {
    player:   { emoji: '⚔️', color: '#fcd34d', border: '#d97706', glow: '#f59e0b', nameBg: '#451a03' },
    narrator: { emoji: '📜', color: '#9ca3af', border: '#374151', glow: '#4b5563', nameBg: '#111827' },
    gares:    { emoji: '🛡️', color: '#93c5fd', border: '#1d4ed8', glow: '#3b82f6', nameBg: '#1e3a8a' },
    liz:      { emoji: '✨', color: '#f9a8d4', border: '#be185d', glow: '#ec4899', nameBg: '#831843' },
    noa:      { emoji: '🏹', color: '#86efac', border: '#15803d', glow: '#22c55e', nameBg: '#14532d' },
    cecil:    { emoji: '🔮', color: '#d8b4fe', border: '#7e22ce', glow: '#a855f7', nameBg: '#3b0764' },
    bram:     { emoji: '🪓', color: '#fdba74', border: '#c2410c', glow: '#f97316', nameBg: '#431407' },
    finn:     { emoji: '⚔️', color: '#67e8f9', border: '#0e7490', glow: '#06b6d4', nameBg: '#083344' },
    vais:     { emoji: '🗡️', color: '#fca5a5', border: '#b91c1c', glow: '#ef4444', nameBg: '#450a0a' },
    logan:    { emoji: '⚒️', color: '#d6d3d1', border: '#57534e', glow: '#a8a29e', nameBg: '#1c1917' },
    iris:     { emoji: '💜', color: '#c4b5fd', border: '#6d28d9', glow: '#8b5cf6', nameBg: '#2e1065' },
    sig:      { emoji: '🎩', color: '#fde68a', border: '#a16207', glow: '#eab308', nameBg: '#422006' },
    elk:      { emoji: '🐺', color: '#5eead4', border: '#0f766e', glow: '#14b8a6', nameBg: '#042f2e' },
    mira:     { emoji: '🌿', color: '#6ee7b7', border: '#047857', glow: '#10b981', nameBg: '#022c22' },
    zeno:     { emoji: '😈', color: '#f0abfc', border: '#a21caf', glow: '#d946ef', nameBg: '#4a044e' },
  }
  return configs[speaker] ?? { emoji: '👤', color: '#9ca3af', border: '#374151', glow: '#4b5563', nameBg: '#111827' }
}

const CHAR_DELAY = 32 // ms per character

export default function EventScene({ gs, onAdvance, onSkipAll }: Props) {
  const ev = EVENTS.find(e => e.id === gs.activeEventId)

  const lineIdx = gs.activeEventLine ?? 0
  const line = ev?.dialogues[lineIdx]

  const [displayedText, setDisplayedText] = useState('')
  const [isTypingDone, setIsTypingDone] = useState(false)
  const [portraitVisible, setPortraitVisible] = useState(true)
  const prevSpeakerRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // テキストのタイプライターエフェクト
  useEffect(() => {
    if (!line?.text) return

    // スピーカーが変わったらポートレートをフェード
    if (prevSpeakerRef.current !== null && prevSpeakerRef.current !== line.speaker) {
      setPortraitVisible(false)
      setTimeout(() => setPortraitVisible(true), 80)
    }
    prevSpeakerRef.current = line.speaker

    setDisplayedText('')
    setIsTypingDone(false)

    if (timerRef.current) clearInterval(timerRef.current)

    let idx = 0
    const fullText = resolveText(line.text, gs.playerName)
    timerRef.current = setInterval(() => {
      idx++
      if (idx >= fullText.length) {
        setDisplayedText(fullText)
        setIsTypingDone(true)
        clearInterval(timerRef.current!)
      } else {
        setDisplayedText(fullText.slice(0, idx))
      }
    }, CHAR_DELAY)

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIdx, gs.activeEventId])

  const handleClick = useCallback(() => {
    if (!isTypingDone && line?.text) {
      // 全文を即時表示
      if (timerRef.current) clearInterval(timerRef.current)
      setDisplayedText(resolveText(line.text, gs.playerName))
      setIsTypingDone(true)
    } else {
      onAdvance()
    }
  }, [isTypingDone, line, onAdvance])

  if (!ev || !line) return null

  const isNarrator = line.speaker === 'narrator'
  const isLast = lineIdx >= ev.dialogues.length - 1
  const cfg = getSpeakerConfig(line.speaker)
  const displayName = line.speaker === 'player'
    ? gs.playerName
    : (line.speakerName ?? SPEAKER_DISPLAY[line.speaker] ?? line.speaker)
  const hasPortrait = !isNarrator && hasCharPortrait(line.speaker)

  const progress = lineIdx + 1
  const total = ev.dialogues.length
  const dotCount = Math.min(total, 16)

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col select-none"
      style={{ background: '#030608' }}
      onClick={handleClick}
    >
      {/* ===== タイトルバー ===== */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b shrink-0"
        style={{ background: '#030608', borderColor: '#1a1f2e' }}
      >
        <div className="text-xs font-black text-indigo-400 tracking-widest">📖 {ev.title}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: '#374151' }}>{progress} / {total}</span>
          {onSkipAll && !isLast && (
            <button
              onClick={e => { e.stopPropagation(); onSkipAll() }}
              className="text-[10px] font-bold px-2 py-0.5 border border-gray-700 bg-gray-900 text-gray-500 hover:text-gray-300 hover:border-gray-500"
            >
              全スキップ ▶▶
            </button>
          )}
        </div>
      </div>

      {/* ===== 進行バー ===== */}
      <div className="h-0.5 shrink-0" style={{ background: '#0d0f1a' }}>
        <div
          className="h-full"
          style={{
            width: `${(progress / total) * 100}%`,
            background: isNarrator ? '#3730a3' : cfg.glow,
          }}
        />
      </div>

      {/* ===== キャラクターエリア ===== */}
      <div className="flex-1 relative overflow-hidden flex items-end justify-center">

        {/* 境界線（スピーカーカラー）*/}
        {!isNarrator && (
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: 1, background: cfg.border }}
          />
        )}

        {/* ナレーター表示 */}
        {isNarrator && (
          <>
            {/* 星ドット（静的・PP4ピクセルスタイル）*/}
            <div className="absolute inset-0 pointer-events-none">
              {([
                [8,12],[22,35],[45,8],[67,55],[83,20],[15,70],[55,40],[90,75],
                [30,85],[72,15],[48,62],[10,48],[88,38],[36,22],[60,80],
              ] as [number,number][]).map(([l,t], i) => (
                <div key={i} className="absolute bg-[#3a3460]"
                  style={{ left: `${l}%`, top: `${t}%`, width: 2, height: 2 }}
                />
              ))}
            </div>
            {/* 中央スクロール */}
            <div className="relative flex flex-col items-center justify-center pb-20 gap-2" style={{ zIndex: 5 }}>
              <div style={{ fontSize: 56 }}>📜</div>
              <div style={{
                fontSize: 10,
                color: '#5a5070',
                fontWeight: 'bold',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
              }}>─ Narrator ─</div>
            </div>
          </>
        )}

        {/* キャラクターポートレート */}
        {!isNarrator && (
          <div
            className="relative z-10"
            style={{
              marginBottom: -8,
              opacity: portraitVisible ? 1 : 0,
            }}
          >
            {hasPortrait ? (
              <CharPortraitLarge charId={line.speaker} w={164} h={324} />
            ) : (
              <div
                className="flex items-end justify-center"
                style={{ width: 164, height: 200 }}
              >
                <span style={{ fontSize: 110, lineHeight: 1 }}>{cfg.emoji}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== 会話ダイアログエリア ===== */}
      <div className="relative z-20 px-3 pb-4 shrink-0">

        {/* スピーカー名タブ */}
        {!isNarrator && (
          <div className="ml-3 mb-0 flex">
            <div
              className="px-4 py-1.5 text-sm font-black border-t-2 border-x-2"
              style={{
                color: cfg.color,
                borderColor: cfg.border,
                background: cfg.nameBg,
              }}
            >
              {cfg.emoji} {displayName}
            </div>
          </div>
        )}

        {/* メイン会話ボックス */}
        <div
          className="overflow-hidden border-2"
          style={{
            borderRadius: 0,
            background: '#02040e',
            borderColor: isNarrator ? '#1f2937' : cfg.border,
          }}
        >
          {/* セリフ本文 */}
          <div className="px-5 py-4" style={{ minHeight: 82 }}>
            <p
              className="leading-snug font-bold"
              style={{
                fontSize: 15,
                color: isNarrator ? '#9ca3af' : '#f1f5f9',
                fontStyle: 'normal',
              }}
            >
              {isNarrator && (
                <span style={{ color: '#4b5563', marginRight: 4 }}>《</span>
              )}
              {displayedText}
              {/* タイプ中カーソル */}
              {!isTypingDone && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 2,
                    height: '1em',
                    background: cfg.glow,
                    marginLeft: 2,
                    verticalAlign: 'text-bottom',
                  }}
                />
              )}
              {isNarrator && isTypingDone && (
                <span style={{ color: '#4b5563', marginLeft: 4 }}>》</span>
              )}
            </p>
          </div>

          {/* 下部: 進行ドット + タップ案内 */}
          <div className="px-5 pb-3 flex items-center justify-between">
            <div className="flex gap-1 items-center">
              {Array.from({ length: dotCount }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === lineIdx ? 14 : 6,
                    height: 5,
                    background: i === lineIdx
                      ? cfg.glow
                      : i < lineIdx
                      ? '#312e81'
                      : '#1f2937',
                  }}
                />
              ))}
              {total > 16 && (
                <span style={{ fontSize: 10, color: '#374151', marginLeft: 2 }}>…</span>
              )}
            </div>
            <div
              className="text-xs font-black"
              style={{
                color: !isTypingDone ? '#374151' : isLast ? cfg.glow : '#6b7280',
              }}
            >
              {!isTypingDone
                ? 'タップでスキップ'
                : isLast
                ? ev.branch
                  ? '▶ 選択肢へ'
                  : ev.reward
                  ? '▶ 受け取る'
                  : '▶ 閉じる'
                : 'タップして続ける ▶'}
            </div>
          </div>
        </div>

        {/* 報酬プレビュー（最終コマのみ）*/}
        {isLast && isTypingDone && ev.reward && (
          <div
            className="mt-2 px-4 py-2.5 border-2 text-center"
            style={{
              background: '#1c0a00',
              borderColor: '#92400e',
            }}
          >
            <div className="text-xs font-black" style={{ color: '#fbbf24' }}>
              🎁 {ev.reward.message}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
