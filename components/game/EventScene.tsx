'use client'

import type { GameState } from '@/lib/game/types'
import { EVENTS } from '@/lib/game/data'
import { CharPortraitLarge, hasCharPortrait } from './CharPortrait'

interface Props {
  gs: GameState
  onAdvance: () => void
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

export default function EventScene({ gs, onAdvance }: Props) {
  const ev = EVENTS.find(e => e.id === gs.activeEventId)
  if (!ev) return null

  const lineIdx = gs.activeEventLine ?? 0
  const line = ev.dialogues[lineIdx]
  if (!line) return null

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
      onClick={onAdvance}
    >
      {/* ===== タイトルバー ===== */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b shrink-0"
        style={{ background: 'rgba(3,6,8,0.98)', borderColor: '#1a1f2e' }}
      >
        <div className="text-xs font-black text-indigo-400 tracking-widest">📖 {ev.title}</div>
        <div className="text-xs font-bold" style={{ color: '#374151' }}>{progress} / {total}</div>
      </div>

      {/* ===== 進行バー ===== */}
      <div className="h-0.5 shrink-0" style={{ background: '#0d0f1a' }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${(progress / total) * 100}%`,
            background: isNarrator ? '#3730a3' : cfg.glow,
          }}
        />
      </div>

      {/* ===== キャラクターエリア ===== */}
      <div className="flex-1 relative overflow-hidden flex items-end justify-center">

        {/* 背景グラデーション（スピーカーカラー）*/}
        {!isNarrator && (
          <>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 80% 60% at 50% 100%, ${cfg.glow}18 0%, transparent 65%)`,
              }}
            />
            {/* 床の光沢ライン */}
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: 1,
                background: `linear-gradient(to right, transparent, ${cfg.glow}40, transparent)`,
              }}
            />
            {/* 床の反射 */}
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: 24,
                background: `linear-gradient(to top, ${cfg.glow}08, transparent)`,
              }}
            />
          </>
        )}

        {/* ナレーター表示 */}
        {isNarrator && (
          <div className="flex flex-col items-center justify-center pb-16 gap-3">
            <div style={{ fontSize: 72, opacity: 0.12, filter: 'grayscale(100%)' }}>📜</div>
          </div>
        )}

        {/* キャラクターポートレート */}
        {!isNarrator && (
          <div
            className="relative z-10"
            style={{
              marginBottom: -8,
              filter: `drop-shadow(0 0 28px ${cfg.glow}55) drop-shadow(0 8px 16px rgba(0,0,0,0.8))`,
              transition: 'filter 0.3s',
            }}
          >
            {hasPortrait ? (
              <CharPortraitLarge charId={line.speaker} w={164} h={324} />
            ) : (
              /* ポートレートなしのキャラはビッグ絵文字で代用 */
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

        {/* スピーカー名タブ（会話ボックス上部に浮かぶ）*/}
        {!isNarrator && (
          <div className="ml-3 mb-0 flex">
            <div
              className="px-4 py-1.5 text-sm font-black rounded-t-xl border-t-2 border-x-2"
              style={{
                color: cfg.color,
                borderColor: cfg.border,
                background: cfg.nameBg,
                boxShadow: `0 -6px 16px ${cfg.glow}18`,
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
            borderRadius: isNarrator ? 12 : '4px 12px 12px 12px',
            background: 'rgba(2,4,14,0.97)',
            borderColor: isNarrator ? '#1f2937' : cfg.border,
            boxShadow: `0 0 40px ${cfg.glow}20, inset 0 1px 0 ${cfg.glow}12`,
          }}
        >
          {/* セリフ本文 */}
          <div className="px-5 py-4" style={{ minHeight: 82 }}>
            <p
              className="leading-relaxed font-bold"
              style={{
                fontSize: 15,
                color: isNarrator ? '#9ca3af' : '#f1f5f9',
                fontStyle: isNarrator ? 'italic' : 'normal',
                textShadow: '0 1px 4px rgba(0,0,0,0.95)',
              }}
            >
              {isNarrator && (
                <span style={{ color: '#4b5563', marginRight: 4 }}>《</span>
              )}
              {line.text}
              {isNarrator && (
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
                  className="rounded-full transition-all duration-300"
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
                color: isLast ? cfg.glow : '#374151',
                animation: isLast ? 'pulse 1.5s ease-in-out infinite' : 'none',
              }}
            >
              {isLast
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
        {isLast && ev.reward && (
          <div
            className="mt-2 px-4 py-2.5 rounded-xl border-2 text-center"
            style={{
              background: '#1c0a00',
              borderColor: '#92400e',
              boxShadow: '0 0 20px rgba(245,158,11,0.15)',
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
