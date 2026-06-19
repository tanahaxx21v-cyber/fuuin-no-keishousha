'use client'

import type { GameState } from '@/lib/game/types'
import { EVENTS } from '@/lib/game/data'
import { COMPANIONS } from '@/lib/game/data'

interface Props {
  gs: GameState
  onAdvance: () => void
}

// スピーカーごとのアイコン・カラー設定
function getSpeakerConfig(speaker: string) {
  const compConfigs: Record<string, { emoji: string; color: string; bg: string; border: string }> = {
    player:   { emoji: '⚔️', color: 'text-amber-300',  bg: 'bg-amber-950/90', border: 'border-amber-600' },
    narrator: { emoji: '',   color: 'text-gray-300',   bg: 'bg-gray-900/80',  border: 'border-gray-600'  },
    gares:    { emoji: '🛡️', color: 'text-blue-300',   bg: 'bg-blue-950/90',  border: 'border-blue-600'  },
    liz:      { emoji: '✨', color: 'text-pink-300',   bg: 'bg-pink-950/90',  border: 'border-pink-600'  },
    noa:      { emoji: '🏹', color: 'text-green-300',  bg: 'bg-green-950/90', border: 'border-green-600' },
    cecil:    { emoji: '🔮', color: 'text-purple-300', bg: 'bg-purple-950/90',border: 'border-purple-600'},
    bram:     { emoji: '🪓', color: 'text-orange-300', bg: 'bg-orange-950/90',border: 'border-orange-600'},
    finn:     { emoji: '⚔️', color: 'text-cyan-300',   bg: 'bg-cyan-950/90',  border: 'border-cyan-600'  },
    vais:     { emoji: '🗡️', color: 'text-red-300',    bg: 'bg-red-950/90',   border: 'border-red-700'   },
    logan:    { emoji: '⚒️', color: 'text-stone-300',  bg: 'bg-stone-900/90', border: 'border-stone-600' },
    iris:     { emoji: '💜', color: 'text-violet-300', bg: 'bg-violet-950/90',border: 'border-violet-600'},
    sig:      { emoji: '🎩', color: 'text-yellow-300', bg: 'bg-yellow-950/90',border: 'border-yellow-600'},
    elk:      { emoji: '🐺', color: 'text-teal-300',   bg: 'bg-teal-950/90',  border: 'border-teal-600'  },
    mira:     { emoji: '🌿', color: 'text-emerald-300',bg: 'bg-emerald-950/90',border: 'border-emerald-600'},
    zeno:     { emoji: '😈', color: 'text-fuchsia-300',bg: 'bg-fuchsia-950/90',border: 'border-fuchsia-600'},
  }
  return compConfigs[speaker] ?? { emoji: '👤', color: 'text-gray-300', bg: 'bg-gray-900/80', border: 'border-gray-600' }
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

  // 進行インジケーター
  const progress = lineIdx + 1
  const total = ev.dialogues.length

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={onAdvance}
    >
      {/* イベントタイトル */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-b border-indigo-800/50">
        <div className="text-xs font-black text-indigo-400 tracking-widest">📖 {ev.title}</div>
        <div className="text-xs text-gray-600 font-bold">{progress} / {total}</div>
      </div>

      {/* 進行バー */}
      <div className="h-0.5 bg-indigo-950">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${(progress / total) * 100}%` }}
        />
      </div>

      {/* 背景イラストエリア（スペース確保）*/}
      <div className="flex-1 flex items-end justify-center px-4 pb-2">
        {/* キャラ表示（ナレーターは非表示）*/}
        {!isNarrator && (
          <div className="mb-4 flex flex-col items-center gap-1">
            <div
              className={`flex items-center justify-center rounded-full border-2 ${cfg.border}`}
              style={{
                width: 72, height: 72,
                fontSize: 36,
                background: 'rgba(10,10,30,0.9)',
                boxShadow: `0 0 24px rgba(99,102,241,0.4)`,
              }}
            >
              {cfg.emoji}
            </div>
            <div className={`text-xs font-black px-3 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
              {line.speakerName}
            </div>
          </div>
        )}
      </div>

      {/* 会話ボックス（パワポケ4スタイル: 濃紺背景） */}
      <div className="px-3 pb-4">
        <div
          className={`rounded-xl border-2 shadow-2xl overflow-hidden ${
            isNarrator
              ? 'border-gray-600 bg-gray-950/95'
              : `${cfg.border} ${cfg.bg}`
          }`}
          style={{
            boxShadow: isNarrator ? '0 0 20px rgba(0,0,0,0.5)' : `0 0 25px rgba(99,102,241,0.2)`,
          }}
        >
          {/* スピーカー名バー */}
          {!isNarrator && (
            <div className={`px-4 py-1.5 border-b ${cfg.border} bg-black/30`}>
              <span className={`text-sm font-black ${cfg.color}`}>
                {cfg.emoji} {line.speakerName}
              </span>
            </div>
          )}

          {/* テキスト本体 */}
          <div className="px-4 py-4">
            <p
              className={`leading-relaxed font-bold text-base ${
                isNarrator ? 'text-gray-300 italic text-sm' : 'text-white'
              }`}
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
            >
              {isNarrator ? <span className="text-gray-400">《</span> : null}
              {line.text}
              {isNarrator ? <span className="text-gray-400">》</span> : null}
            </p>
          </div>

          {/* 続きインジケーター */}
          <div className="px-4 pb-3 flex items-center justify-between">
            <div className="flex gap-1">
              {ev.dialogues.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === lineIdx ? 'bg-amber-400 scale-125' : i < lineIdx ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <div className={`text-xs font-black ${isLast ? 'text-amber-400 animate-pulse' : 'text-gray-500'}`}>
              {isLast
                ? ev.reward ? '▶ 完了して報酬を受け取る' : '▶ 閉じる'
                : '画面タップで続ける ▶'
              }
            </div>
          </div>
        </div>

        {/* 報酬プレビュー（最後のコマのみ）*/}
        {isLast && ev.reward && (
          <div className="mt-2 px-4 py-2.5 bg-amber-950/80 border-2 border-amber-600 rounded-xl text-center">
            <div className="text-xs font-black text-amber-400">🎁 {ev.reward.message}</div>
          </div>
        )}
      </div>
    </div>
  )
}
