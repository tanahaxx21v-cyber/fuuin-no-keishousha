'use client'

import type { GameState } from '@/lib/game/types'

interface Props {
  gs: GameState
  onRestart: () => void
}

export default function GameOverScreen({ gs, onRestart }: Props) {
  const reason = gs.daysLeft <= 0 ? '日数が尽きた' : 'パーティが全滅した'

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">💀</div>
        <h1 className="text-4xl font-bold text-red-400 mb-2">GAME OVER</h1>
        <p className="text-gray-400 mb-6">{reason}……魔王の封印は解けてしまった。</p>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-6 text-left text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-gray-400">最終レベル: </span><span className="text-white">Lv{gs.playerLevel}</span></div>
            <div><span className="text-gray-400">残り日数: </span><span className="text-red-400">{gs.daysLeft}日</span></div>
            <div><span className="text-gray-400">封印石: </span><span className="text-white">{gs.sealStones.length}/3</span></div>
            <div><span className="text-gray-400">難易度: </span><span className="text-white capitalize">{gs.difficulty}</span></div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold text-lg rounded-xl transition"
        >
          タイトルへ戻る
        </button>
      </div>
    </div>
  )
}
