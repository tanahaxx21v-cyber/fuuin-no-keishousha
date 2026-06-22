'use client'

import { useState } from 'react'
import type { Difficulty } from '@/lib/game/types'

interface Props {
  onStart: (diff: Difficulty) => void
  onContinue?: () => void
  onDeleteSave?: () => void
  hasSave?: boolean
}

const DIFFICULTIES: { id: Difficulty; name: string; desc: string; days: number; color: string; textColor: string }[] = [
  { id: 'easy',   name: 'イージー', desc: '日数120日 / 敵HP70% / 推奨：初心者',   days: 120, color: 'border-green-600 bg-green-950 hover:bg-green-900', textColor: 'text-green-400' },
  { id: 'normal', name: 'ノーマル', desc: '日数100日 / 通常設定 / 推奨プレイ',     days: 100, color: 'border-amber-600 bg-amber-950 hover:bg-amber-900',   textColor: 'text-amber-400' },
  { id: 'hard',   name: 'ハード',   desc: '日数80日 / 敵HP140% / 極限難易度',     days: 80,  color: 'border-red-700 bg-red-950 hover:bg-red-900',         textColor: 'text-red-400' },
]

// タイトル画面の星パーティクル（静的な位置で点滅）
const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: (i * 7 + 3) % 100,
  y: (i * 13 + 7) % 100,
  size: (i % 3) + 1,
  delay: (i * 0.17) % 3,
  dur: 2 + (i % 3),
}))

export default function TitleScreen({ onStart, onContinue, onDeleteSave, hasSave }: Props) {
  const [selected, setSelected] = useState<Difficulty>('normal')
  const [showNewGame, setShowNewGame] = useState(!hasSave)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07071a] relative overflow-hidden p-4">
      {/* 星空背景 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {STARS.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              opacity: 0.4,
              animation: `pulse ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-900/25 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-blue-900/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Title block */}
        <div className="text-center mb-8">
          <div className="text-indigo-400 text-xs font-black tracking-[0.4em] uppercase mb-2">Fantasy RPG</div>
          <h1 className="text-5xl font-black text-white mb-1 tracking-wide drop-shadow-lg"
              style={{
                textShadow: '0 0 30px rgba(99,102,241,0.6), 0 0 60px rgba(139,92,246,0.3)',
                animation: 'pulse 3s ease-in-out infinite',
              }}>
            封印の継承者
          </h1>
          <div className="text-indigo-300/70 text-xs font-bold tracking-[0.2em] mt-1">
            ─ FUUIN NO KEISHOUSHA ─
          </div>
          <div className="text-gray-400 text-sm mt-2">{DIFFICULTIES.find(d => d.id === selected)!.days}日で3つの封印石を集め、魔王を倒せ</div>

          {/* Seal stones preview */}
          <div className="flex justify-center gap-6 mt-5">
            {[
              { icon: '🔥', label: '炎の封印石', color: 'border-red-700 bg-red-950', glow: 'rgba(239,68,68,0.4)', delay: '0s' },
              { icon: '⚡', label: '嵐の封印石', color: 'border-blue-700 bg-blue-950', glow: 'rgba(59,130,246,0.4)', delay: '1s' },
              { icon: '🌑', label: '闇の封印石', color: 'border-purple-700 bg-purple-950', glow: 'rgba(168,85,247,0.4)', delay: '2s' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <div
                  className={`w-12 h-12 rounded-full border-2 ${s.color} flex items-center justify-center text-2xl`}
                  style={{
                    boxShadow: `0 0 12px ${s.glow}`,
                    animation: `pulse 2s ease-in-out ${s.delay} infinite`,
                  }}
                >{s.icon}</div>
                <div className="text-[10px] text-gray-500 font-bold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue button — shown only when save exists */}
        {hasSave && onContinue && (
          <div className="mb-4">
            <button
              onClick={onContinue}
              className="w-full py-4 bg-indigo-800 hover:bg-indigo-700 border-2 border-indigo-500 text-white font-black text-xl rounded-xl transition shadow-xl shadow-indigo-900/40 active:scale-95"
            >
              📂 コンティニュー
            </button>
            <button
              onClick={() => setShowNewGame(v => !v)}
              className="mt-2 w-full text-xs text-gray-500 hover:text-gray-300 transition text-center"
            >
              {showNewGame ? '▲ 新規ゲームを隠す' : '▼ 新規ゲームを開始する（セーブ上書き）'}
            </button>
          </div>
        )}

        {/* Difficulty select */}
        {showNewGame && (
          <>
            <div className="bg-[#0c0c24] border-2 border-indigo-700 rounded-xl p-4 mb-4 shadow-xl">
              <div className="text-xs font-black text-indigo-400 mb-3 tracking-wider">— 難易度を選択 —</div>
              <div className="flex flex-col gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelected(d.id)}
                    className={`border-2 rounded-lg px-4 py-3 text-left transition-all ${d.color} ${selected === d.id ? 'ring-2 ring-white/20 scale-[1.02]' : 'opacity-80'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-black text-base ${d.textColor}`}>{d.name}</span>
                      {selected === d.id && <span className="text-white text-xs font-bold">◀ 選択中</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { if (hasSave && onDeleteSave) onDeleteSave(); onStart(selected) }}
              className="w-full py-4 bg-amber-700 hover:bg-amber-600 border-2 border-amber-500 text-white font-black text-xl rounded-xl transition shadow-xl shadow-amber-900/40 active:scale-95"
            >
              ⚔️ {hasSave ? '新規ゲーム開始（セーブ上書き）' : 'ゲームスタート'}
            </button>
          </>
        )}

        <div className="mt-4 text-center text-xs text-gray-700">
          ※ 全難易度: 仲間がHP0になると永続的に死亡します（復活不可）
        </div>
      </div>
    </div>
  )
}
