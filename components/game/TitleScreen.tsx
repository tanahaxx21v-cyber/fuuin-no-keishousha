'use client'

import { useState } from 'react'
import type { Difficulty } from '@/lib/game/types'

interface Props {
  onStart: (diff: Difficulty) => void
  onDeleteSave?: () => void
  hasSave?: boolean
}

const DIFFICULTIES: { id: Difficulty; name: string; desc: string; color: string }[] = [
  { id: 'easy', name: 'イージー', desc: '日数120日・敵HP70%・推奨初心者', color: 'border-green-600 bg-green-900/30 hover:bg-green-800/40' },
  { id: 'normal', name: 'ノーマル', desc: '日数100日・通常設定・推奨プレイ', color: 'border-yellow-600 bg-yellow-900/30 hover:bg-yellow-800/40' },
  { id: 'hard', name: 'ハード', desc: '日数80日・敵HP140%・仲間永続死', color: 'border-red-700 bg-red-900/30 hover:bg-red-800/40' },
]

export default function TitleScreen({ onStart, onDeleteSave, hasSave }: Props) {
  const [selected, setSelected] = useState<Difficulty>('normal')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 to-gray-950 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-9xl opacity-5 select-none">⚔️</div>

      <div className="relative z-10 text-center px-6 w-full max-w-lg">
        {/* Title */}
        <div className="mb-2 text-purple-400 text-sm tracking-[0.3em] uppercase">Fantasy RPG</div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-1 tracking-wide">封印の継承者</h1>
        <div className="text-gray-400 text-sm mb-8">100日で3つの封印石を集め、魔王を倒せ</div>

        {/* Seal stones preview */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-red-900/60 border border-red-700 flex items-center justify-center text-lg">🔥</div>
            <div className="text-xs text-gray-500 mt-1">炎</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-blue-900/60 border border-blue-700 flex items-center justify-center text-lg">⚡</div>
            <div className="text-xs text-gray-500 mt-1">嵐</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-purple-900/60 border border-purple-700 flex items-center justify-center text-lg">🌑</div>
            <div className="text-xs text-gray-500 mt-1">闇</div>
          </div>
        </div>

        {/* Difficulty select */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-3">難易度を選んでください</div>
          <div className="flex flex-col gap-2">
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                onClick={() => setSelected(d.id)}
                className={`border rounded-xl px-4 py-3 text-left transition-all ${d.color} ${selected === d.id ? 'ring-2 ring-white/30 scale-[1.02]' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">{d.name}</span>
                  {selected === d.id && <span className="text-white text-xs">◀ 選択中</span>}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onStart(selected)}
          className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-lg rounded-xl transition shadow-lg shadow-yellow-900/40"
        >
          ゲームスタート ⚔️
        </button>

        <div className="mt-4 text-xs text-gray-600">
          ハードモードでは仲間が死亡すると永続的に失います
        </div>

        {hasSave && onDeleteSave && (
          <button
            onClick={onDeleteSave}
            className="mt-3 text-xs text-gray-600 hover:text-red-400 underline transition"
          >
            🗑️ セーブデータを削除して最初から始める
          </button>
        )}
      </div>
    </div>
  )
}
