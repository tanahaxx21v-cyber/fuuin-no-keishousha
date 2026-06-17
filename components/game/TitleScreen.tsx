'use client'

import { useState } from 'react'
import type { Difficulty } from '@/lib/game/types'

interface Props {
  onStart: (diff: Difficulty) => void
  onDeleteSave?: () => void
  hasSave?: boolean
}

const DIFFICULTIES: { id: Difficulty; name: string; desc: string; color: string; textColor: string }[] = [
  { id: 'easy',   name: 'イージー', desc: '日数120日 / 敵HP70% / 推奨：初心者', color: 'border-green-600 bg-green-950 hover:bg-green-900', textColor: 'text-green-400' },
  { id: 'normal', name: 'ノーマル', desc: '日数100日 / 通常設定 / 推奨プレイ',   color: 'border-amber-600 bg-amber-950 hover:bg-amber-900',   textColor: 'text-amber-400' },
  { id: 'hard',   name: 'ハード',   desc: '日数80日 / 敵HP140% / 仲間永続死',   color: 'border-red-700 bg-red-950 hover:bg-red-900',         textColor: 'text-red-400' },
]

export default function TitleScreen({ onStart, onDeleteSave, hasSave }: Props) {
  const [selected, setSelected] = useState<Difficulty>('normal')

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07071a] relative overflow-hidden p-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Title block */}
        <div className="text-center mb-8">
          <div className="text-indigo-400 text-xs font-black tracking-[0.4em] uppercase mb-2">Fantasy RPG</div>
          <h1 className="text-5xl font-black text-white mb-1 tracking-wide drop-shadow-lg"
              style={{ textShadow: '0 0 30px rgba(99,102,241,0.5)' }}>
            封印の継承者
          </h1>
          <div className="text-gray-400 text-sm mt-2">100日で3つの封印石を集め、魔王を倒せ</div>

          {/* Seal stones preview */}
          <div className="flex justify-center gap-6 mt-5">
            {[
              { icon: '🔥', label: '炎', color: 'border-red-700 bg-red-950' },
              { icon: '⚡', label: '嵐', color: 'border-blue-700 bg-blue-950' },
              { icon: '🌑', label: '闇', color: 'border-purple-700 bg-purple-950' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <div className={`w-12 h-12 rounded-full border-2 ${s.color} flex items-center justify-center text-2xl`}>{s.icon}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty select */}
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
          onClick={() => onStart(selected)}
          className="w-full py-4 bg-amber-700 hover:bg-amber-600 border-2 border-amber-500 text-white font-black text-xl rounded-xl transition shadow-xl shadow-amber-900/40 active:scale-95"
        >
          ⚔️ ゲームスタート
        </button>

        {hasSave && onDeleteSave && (
          <button
            onClick={onDeleteSave}
            className="mt-3 w-full text-xs text-gray-600 hover:text-red-400 transition text-center"
          >
            🗑️ セーブデータを削除して最初から始める
          </button>
        )}

        <div className="mt-4 text-center text-xs text-gray-700">
          ハードモードでは仲間の死が永続します
        </div>
      </div>
    </div>
  )
}
