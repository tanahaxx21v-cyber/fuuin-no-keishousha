'use client'

import type { GameState } from '@/lib/game/types'

interface Props {
  gs: GameState
  onRestart: () => void
}

export default function GameOverScreen({ gs, onRestart }: Props) {
  const reason = gs.daysLeft <= 0 ? '日数が尽きた' : 'パーティが全滅した'

  return (
    <div className="min-h-screen bg-[#07071a] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">

        <div className="text-7xl mb-4 drop-shadow-2xl">💀</div>
        <h1 className="text-5xl font-black text-red-500 mb-2 tracking-wider"
            style={{ textShadow: '0 0 30px rgba(239,68,68,0.5)' }}>
          GAME OVER
        </h1>
        <p className="text-gray-400 mb-8 font-bold">{reason}……魔王の封印は解けてしまった。</p>

        <div className="bg-[#0c0c24] border-2 border-red-900 rounded-xl p-5 mb-6 text-left">
          <div className="text-xs font-black text-red-400 mb-3 tracking-widest">— 記録 —</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 font-bold">最終レベル</span>
              <div className="text-white font-black text-lg">Lv{gs.playerLevel}</div>
            </div>
            <div>
              <span className="text-gray-500 font-bold">残り日数</span>
              <div className="text-red-400 font-black text-lg">{gs.daysLeft}日</div>
            </div>
            <div>
              <span className="text-gray-500 font-bold">封印石</span>
              <div className="text-white font-black text-lg">{gs.sealStones.length}<span className="text-gray-500 text-sm font-normal">/3</span></div>
            </div>
            <div>
              <span className="text-gray-500 font-bold">難易度</span>
              <div className="text-white font-black text-lg capitalize">{gs.difficulty}</div>
            </div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-4 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-white font-black text-xl rounded-xl transition active:scale-95"
        >
          タイトルへ戻る
        </button>
      </div>
    </div>
  )
}
