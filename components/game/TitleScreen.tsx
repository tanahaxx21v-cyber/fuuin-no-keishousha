'use client'

import { useState } from 'react'
import type { Difficulty } from '@/lib/game/types'

interface Props {
  onStart: (diff: Difficulty) => void
  onContinue?: () => void
  onDeleteSave?: () => void
  hasSave?: boolean
}

const DIFFICULTIES: { id: Difficulty; name: string; days: number; desc: string; color: string }[] = [
  { id: 'easy',   name: 'イージー', days: 120, desc: '敵HP ×0.7', color: '#4ade80' },
  { id: 'normal', name: 'ノーマル', days: 100, desc: '標準設定',  color: '#fbbf24' },
  { id: 'hard',   name: 'ハード',   days: 80,  desc: '敵HP ×1.4', color: '#f87171' },
]

export default function TitleScreen({ onStart, onContinue, onDeleteSave, hasSave }: Props) {
  const [selected, setSelected] = useState<Difficulty>('normal')
  const [showNewGame, setShowNewGame] = useState(!hasSave)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#07071a]">
      <div className="w-full max-w-xs px-6">

        {/* ===== タイトルブロック ===== */}
        <div className="text-center mb-8">
          <div className="text-[9px] text-indigo-700 tracking-[0.5em] uppercase mb-5">FANTASY RPG</div>

          {/* タイトルフレーム */}
          <div className="border-t-2 border-b-2 border-indigo-900 py-5 mb-4" style={{ borderTop: '2px solid #2d2d60', borderBottom: '2px solid #2d2d60' }}>
            <h1 className="text-5xl font-black text-white leading-tight tracking-wide">
              封印の<br/>継承者
            </h1>
          </div>

          <div className="text-[9px] text-gray-800 tracking-[0.35em] mb-6">FUUIN NO KEISHOUSHA</div>

          {/* 封印石 */}
          <div className="flex justify-center gap-6">
            {[
              { icon: '🔥', label: '炎' },
              { icon: '⚡', label: '嵐' },
              { icon: '🌑', label: '闇' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 border border-[#2d2d60] flex items-center justify-center text-xl bg-[#0a0a1e]">
                  {s.icon}
                </div>
                <div className="text-[9px] text-gray-700 tracking-wider">{s.label}封印石</div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== メニュー ===== */}
        <div className="flex flex-col gap-0">

          {/* コンティニュー */}
          {hasSave && onContinue && (
            <button
              onClick={onContinue}
              className="w-full px-4 py-3 text-left flex items-center gap-3 bg-[#0d0d28] border border-[#2d2d60] hover:bg-[#111130] mb-3"
            >
              <span className="text-indigo-400 font-black text-sm">▶</span>
              <span className="font-black text-base text-white tracking-wider">コンティニュー</span>
            </button>
          )}

          {/* 難易度選択 */}
          {showNewGame && (
            <>
              <div className="border border-[#2d2d60] overflow-hidden mb-3">
                <div className="bg-[#0a0a1e] border-b border-[#2d2d60] px-4 py-2">
                  <span className="text-[10px] text-indigo-700 tracking-[0.4em] font-black">難 易 度 選 択</span>
                </div>
                {DIFFICULTIES.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelected(d.id)}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#0d0d28] border-b border-[#1a1a38] last:border-b-0"
                  >
                    <span className="w-3 text-xs font-black" style={{ color: selected === d.id ? '#818cf8' : 'transparent' }}>▶</span>
                    <span className="font-black text-sm" style={{ color: selected === d.id ? '#ffffff' : '#6b7280' }}>
                      {d.name}
                    </span>
                    <span className="text-[9px] ml-auto" style={{ color: selected === d.id ? d.color : '#374151' }}>
                      {d.days}日 / {d.desc}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => { if (hasSave && onDeleteSave) onDeleteSave(); onStart(selected) }}
                className="w-full py-3 px-4 bg-[#3d1f00] hover:bg-[#4d2a00] border border-[#92400e] text-white font-black text-base tracking-wider mb-1"
              >
                ⚔ {hasSave ? '新規ゲーム開始' : 'ゲームスタート'}
              </button>
            </>
          )}

          {/* 新規ゲームの表示トグル（セーブあり時のみ） */}
          {hasSave && (
            <button
              onClick={() => setShowNewGame(v => !v)}
              className="mt-1 w-full text-[10px] text-gray-800 hover:text-gray-600 text-center py-1.5"
            >
              {showNewGame ? '▲ 新規ゲームを隠す' : '▼ 最初から始める（セーブ上書き）'}
            </button>
          )}
        </div>

        <div className="mt-8 text-center text-[9px] text-gray-800 tracking-wide">
          ※ 仲間はHP0で永続死亡（復活不可）
        </div>
      </div>
    </div>
  )
}
