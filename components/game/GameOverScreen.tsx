'use client'

import type { GameState } from '@/lib/game/types'
import { COMPANIONS } from '@/lib/game/data'

interface Props {
  gs: GameState
  onRestart: () => void
}

const BOSS_NAMES: Record<string, string> = {
  bandit_king: '🗡️ 盗賊王ドラグ',
  mine_king: '⛏️ 鉱王グルバ',
  storm_dragon: '🐉 嵐竜ヴォルテクス',
  forest_king: '🌿 森王オーキン',
  tidal_king: '🌊 潮王ネブラ',
  archive: '💀 終末記録体アーカイブ',
}

const SEAL_NAMES: Record<string, string> = {
  fire: '🔥 炎の封印石',
  storm: '⚡ 嵐の封印石',
  dark: '🌑 闇の封印石',
}

export default function GameOverScreen({ gs, onRestart }: Props) {
  const reason = gs.daysLeft <= 0 ? '日数が尽きた' : 'パーティが全滅した'
  const joinedCompanions = Object.values(gs.companions).filter(c => c.joined && c.alive)
  const deadCompanions = Object.values(gs.companions).filter(c => c.joined && !c.alive)
  const defeatedBosses = (gs.defeatedBosses ?? []).filter(id => BOSS_NAMES[id])

  return (
    <div className="min-h-screen bg-[#07071a] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">

        <div className="text-7xl mb-4 drop-shadow-2xl">💀</div>
        <h1 className="text-5xl font-black text-red-500 mb-2 tracking-wider"
            style={{ textShadow: '0 0 30px rgba(239,68,68,0.5)' }}>
          GAME OVER
        </h1>
        <p className="text-gray-400 mb-5 font-bold">{reason}……魔王の封印は解けてしまった。</p>

        {/* 基本記録 */}
        <div className="bg-[#0c0c24] border-2 border-red-900 rounded-xl p-4 mb-3 text-left">
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
              <span className="text-gray-500 font-bold">所持金</span>
              <div className="text-amber-300 font-black text-lg">{gs.gold}G</div>
            </div>
            <div>
              <span className="text-gray-500 font-bold">難易度</span>
              <div className="text-white font-black text-lg">{{ easy: 'イージー', normal: 'ノーマル', hard: 'ハード' }[gs.difficulty] ?? gs.difficulty}</div>
            </div>
          </div>
        </div>

        {/* 封印石 */}
        <div className="bg-[#0c0c24] border-2 border-red-900 rounded-xl p-4 mb-3 text-left">
          <div className="text-xs font-black text-red-400 mb-2 tracking-widest">— 封印石 {gs.sealStones.length}/3 —</div>
          <div className="flex gap-2 flex-wrap">
            {(['fire', 'storm', 'dark'] as const).map(stone => (
              <div key={stone} className={`text-xs font-bold px-3 py-1 rounded-full border ${
                gs.sealStones.includes(stone)
                  ? 'border-amber-600 bg-amber-950 text-amber-300'
                  : 'border-gray-700 bg-gray-900 text-gray-600'
              }`}>
                {gs.sealStones.includes(stone) ? '✅' : '✗'} {SEAL_NAMES[stone]}
              </div>
            ))}
          </div>
        </div>

        {/* 討伐ボス */}
        {defeatedBosses.length > 0 && (
          <div className="bg-[#0c0c24] border-2 border-red-900 rounded-xl p-4 mb-3 text-left">
            <div className="text-xs font-black text-red-400 mb-2 tracking-widest">— 討伐したボス ({defeatedBosses.length}体) —</div>
            <div className="flex flex-col gap-1">
              {defeatedBosses.map(id => (
                <div key={id} className="text-sm text-gray-300 font-bold">👑 {BOSS_NAMES[id]}</div>
              ))}
            </div>
          </div>
        )}

        {/* 仲間 */}
        {(joinedCompanions.length > 0 || deadCompanions.length > 0) && (
          <div className="bg-[#0c0c24] border-2 border-red-900 rounded-xl p-4 mb-4 text-left">
            <div className="text-xs font-black text-red-400 mb-2 tracking-widest">— 仲間 —</div>
            {joinedCompanions.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-green-400 font-bold mb-1">生き残った仲間</div>
                <div className="flex flex-wrap gap-2">
                  {joinedCompanions.map(c => (
                    <span key={c.id} className="text-sm text-white font-bold">
                      {COMPANIONS[c.id]?.emoji} {COMPANIONS[c.id]?.name} <span className="text-purple-400">Lv{c.level}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {deadCompanions.length > 0 && (
              <div>
                <div className="text-xs text-red-400 font-bold mb-1">命を落とした仲間</div>
                <div className="flex flex-wrap gap-2">
                  {deadCompanions.map(c => (
                    <span key={c.id} className="text-sm text-gray-500 line-through font-bold">
                      {COMPANIONS[c.id]?.emoji} {COMPANIONS[c.id]?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
