'use client'

import type { GameState } from '@/lib/game/types'
import { COMPANIONS } from '@/lib/game/data'

interface Props {
  gs: GameState
  onRestart: () => void
}

export default function WinScreen({ gs, onRestart }: Props) {
  const survivingCompanions = Object.values(gs.companions).filter(c => c.joined && c.alive)
  const deadCompanions = Object.values(gs.companions).filter(c => c.joined && !c.alive)

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-4xl font-bold text-yellow-300 mb-2">勇者よ、世界を救った！</h1>
        <p className="text-gray-400 mb-6">
          魔王ダークルーラーを討伐し、封印の力を取り戻した。<br />
          残り{gs.daysLeft}日でクリア達成！
        </p>

        {/* Stats */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4 text-left">
          <div className="text-sm text-gray-400 mb-3">クリア結果</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-400">最終レベル: </span><span className="text-white font-bold">Lv{gs.playerLevel}</span></div>
            <div><span className="text-gray-400">残り日数: </span><span className="text-yellow-300 font-bold">{gs.daysLeft}日</span></div>
            <div><span className="text-gray-400">所持金: </span><span className="text-yellow-400 font-bold">{gs.gold}G</span></div>
            <div><span className="text-gray-400">難易度: </span><span className="text-white font-bold capitalize">{gs.difficulty}</span></div>
          </div>
        </div>

        {/* Seal stones */}
        <div className="flex justify-center gap-4 mb-4">
          {['🔥 炎の封印石', '⚡ 嵐の封印石', '🌑 闇の封印石'].map(s => (
            <div key={s} className="text-sm text-yellow-300">✅ {s}</div>
          ))}
        </div>

        {/* Companions */}
        {survivingCompanions.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4 text-left">
            <div className="text-sm text-green-400 mb-2">生存した仲間 ({survivingCompanions.length}人)</div>
            <div className="flex flex-wrap gap-2">
              {survivingCompanions.map(c => (
                <div key={c.id} className="flex items-center gap-1 text-sm text-white">
                  <span>{COMPANIONS[c.id].emoji}</span>
                  <span>{COMPANIONS[c.id].name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {deadCompanions.length > 0 && (
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 mb-4 text-left">
            <div className="text-sm text-red-400 mb-2">冒険で命を落とした仲間 ({deadCompanions.length}人)</div>
            <div className="flex flex-wrap gap-2">
              {deadCompanions.map(c => (
                <div key={c.id} className="flex items-center gap-1 text-sm text-gray-500 line-through">
                  <span>{COMPANIONS[c.id].emoji}</span>
                  <span>{COMPANIONS[c.id].name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onRestart}
          className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-lg rounded-xl transition mt-2"
        >
          もう一度プレイする
        </button>
      </div>
    </div>
  )
}
