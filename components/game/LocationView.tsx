'use client'

import type { GameState, CompanionId } from '@/lib/game/types'
import { LOCATIONS, COMPANIONS } from '@/lib/game/data'

interface Props {
  gs: GameState
  onBackToMap: () => void
  onInn: () => void
  onOpenShop: () => void
  onEnterDungeon: () => void
  onFightBoss: () => void
  onJoinCompanion: (id: CompanionId) => void
  onSkipCompanion: () => void
}

export default function LocationView({
  gs, onBackToMap, onInn, onOpenShop, onEnterDungeon, onFightBoss, onJoinCompanion, onSkipCompanion
}: Props) {
  const loc = LOCATIONS[gs.currentLocId]
  const companion = loc.companionId ? COMPANIONS[loc.companionId] : undefined
  const companionState = companion ? gs.companions[companion.id] : undefined
  const showCompanionJoin = companion && companionState && !companionState.joined
  const pendingJoin = gs.pendingCompanionJoin ? COMPANIONS[gs.pendingCompanionJoin] : undefined

  const bossDefeated = loc.bossId ? gs.defeatedBosses.some(id => id.includes(loc.bossId!)) : false
  const sealObtained = loc.sealStone ? gs.sealStones.includes(loc.sealStone) : false

  const typeLabel = loc.type === 'town' ? '🏘️ 町' : loc.type === 'dungeon' ? '⚔️ ダンジョン' : '🏯 城'
  const typeBorder = loc.type === 'town' ? 'border-indigo-700' : loc.type === 'dungeon' ? 'border-orange-800' : 'border-red-800'

  return (
    <div className="p-3 max-w-2xl mx-auto flex flex-col gap-3">

      {/* Header */}
      <div className={`bg-[#0c0c24] border-2 ${typeBorder} rounded-xl p-4`}>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBackToMap}
            className="text-xs font-bold text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 rounded-lg transition"
          >
            ← マップへ
          </button>
          <div>
            <h2 className="text-xl font-black text-white">{loc.emoji} {loc.name}</h2>
            <div className="text-xs text-gray-400 font-bold">{typeLabel}</div>
          </div>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{loc.desc}</p>
      </div>

      {/* Pending companion join (after boss defeat) */}
      {pendingJoin && (
        <div className="bg-[#0c0c24] border-2 border-purple-600 rounded-xl p-4 shadow-lg shadow-purple-900/30">
          <div className="text-xs font-black text-purple-400 mb-3 tracking-widest">— 仲間加入イベント —</div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{pendingJoin.emoji}</span>
            <div>
              <div className="font-black text-white text-base">{pendingJoin.name}</div>
              <div className="text-xs text-purple-300 font-bold">{pendingJoin.cls}</div>
            </div>
          </div>
          <p className="text-sm text-gray-300 italic mb-4 border-l-2 border-purple-700 pl-3">「{pendingJoin.joinText}」</p>
          <div className="flex gap-2">
            <button
              onClick={() => onJoinCompanion(gs.pendingCompanionJoin!)}
              className="flex-1 py-2.5 bg-purple-800 hover:bg-purple-700 border-2 border-purple-600 text-white font-black rounded-xl transition active:scale-95"
            >
              ✅ 仲間にする
            </button>
            <button
              onClick={onSkipCompanion}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-gray-300 font-bold rounded-xl transition active:scale-95"
            >
              断る
            </button>
          </div>
        </div>
      )}

      {/* Companion encounter at town/relay/castle */}
      {!pendingJoin && showCompanionJoin && (loc.type === 'town' || loc.type === 'relay' || loc.type === 'castle') && (
        <div className="bg-[#0c0c24] border-2 border-indigo-600 rounded-xl p-4">
          <div className="text-xs font-black text-indigo-400 mb-3 tracking-widest">— 仲間候補に出会った —</div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{companion!.emoji}</span>
            <div>
              <div className="font-black text-white text-base">{companion!.name}</div>
              <div className="text-xs text-indigo-300 font-bold">{companion!.cls}</div>
            </div>
          </div>
          <p className="text-sm text-gray-300 italic mb-4 border-l-2 border-indigo-700 pl-3">「{companion!.joinText}」</p>
          <div className="flex gap-2">
            <button
              onClick={() => onJoinCompanion(companion!.id)}
              className="flex-1 py-2.5 bg-indigo-800 hover:bg-indigo-700 border-2 border-indigo-600 text-white font-black rounded-xl transition active:scale-95"
            >
              ✅ 仲間にする
            </button>
            <button
              onClick={onSkipCompanion}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-gray-300 font-bold rounded-xl transition active:scale-95"
            >
              断る
            </button>
          </div>
        </div>
      )}

      {/* Action menu */}
      <div className="bg-[#0c0c24] border-2 border-amber-800 rounded-xl p-3">
        <div className="text-xs font-black text-amber-500 mb-3 tracking-widest">— コマンド —</div>
        <div className="flex flex-col gap-2">

          {loc.hasInn && (
            <button
              onClick={onInn}
              className="w-full py-3 px-4 bg-blue-950 hover:bg-blue-900 border-2 border-blue-700 text-white rounded-xl transition text-left flex items-center gap-3 active:scale-95"
            >
              <span className="text-xl">🏨</span>
              <div>
                <div className="font-black text-sm">宿屋で休む</div>
                <div className="text-xs text-gray-400">50G・1日消費・HP/MP全回復</div>
              </div>
            </button>
          )}

          {loc.shopItems && (
            <button
              onClick={onOpenShop}
              className="w-full py-3 px-4 bg-green-950 hover:bg-green-900 border-2 border-green-700 text-white rounded-xl transition text-left flex items-center gap-3 active:scale-95"
            >
              <span className="text-xl">🛒</span>
              <div>
                <div className="font-black text-sm">ショップ</div>
                <div className="text-xs text-gray-400">アイテムを購入する</div>
              </div>
            </button>
          )}

          {loc.type === 'dungeon' && !bossDefeated && (
            <>
              <button
                onClick={onEnterDungeon}
                className="w-full py-3 px-4 bg-orange-950 hover:bg-orange-900 border-2 border-orange-700 text-white rounded-xl transition text-left flex items-center gap-3 active:scale-95"
              >
                <span className="text-xl">⚔️</span>
                <div>
                  <div className="font-black text-sm">ダンジョン探索</div>
                  <div className="text-xs text-gray-400">雑魚敵と戦う（EXP・Gold獲得）</div>
                </div>
              </button>
              <button
                onClick={onFightBoss}
                className="w-full py-3 px-4 bg-red-950 hover:bg-red-900 border-2 border-red-600 text-white rounded-xl transition text-left flex items-center gap-3 active:scale-95"
              >
                <span className="text-xl">👑</span>
                <div>
                  <div className="font-black text-sm">ボスに挑む！</div>
                  {loc.sealStone && !sealObtained && (
                    <div className="text-xs text-amber-400 font-bold">💎 封印石を守るボス</div>
                  )}
                </div>
              </button>
            </>
          )}

          {loc.type === 'dungeon' && bossDefeated && (
            <>
              <div className="flex gap-2 text-sm">
                <span className="text-green-400 font-black">✅ ボス討伐済み</span>
                {sealObtained && <span className="text-amber-300 font-black">💎 封印石入手済み</span>}
              </div>
              <button
                onClick={onEnterDungeon}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-gray-300 rounded-xl transition text-left flex items-center gap-3 active:scale-95"
              >
                <span className="text-xl">⚔️</span>
                <div>
                  <div className="font-black text-sm">再探索（EXP稼ぎ）</div>
                </div>
              </button>
            </>
          )}

          {loc.type === 'castle' && (
            gs.sealStones.length < 3 ? (
              <div className="bg-red-950/60 border-2 border-red-800 rounded-xl p-4 text-center">
                <div className="text-red-400 font-black">🔒 封印石が足りない</div>
                <div className="text-sm text-gray-400 mt-1">3つの封印石を全て集めてから挑め（{gs.sealStones.length}/3）</div>
              </div>
            ) : (
              <>
                <div className="bg-red-950/80 border-2 border-red-700 rounded-xl p-3 text-center">
                  <div className="text-red-300 font-black">⚠️ 全ての封印石が揃った！</div>
                </div>
                <button
                  onClick={onFightBoss}
                  className="w-full py-4 bg-red-900 hover:bg-red-800 border-2 border-red-500 text-white rounded-xl font-black text-lg text-center animate-pulse transition active:scale-95"
                >
                  👑 終末記録体アーカイブに挑む！
                </button>
              </>
            )
          )}
        </div>
      </div>

      {/* Party status */}
      {gs.party.length > 0 && (
        <div className="bg-[#0c0c24] border-2 border-slate-700 rounded-xl p-3">
          <div className="text-xs font-black text-slate-400 mb-2 tracking-widest">— 現在のパーティ —</div>
          <div className="flex flex-wrap gap-2">
            {gs.party.map(id => {
              const c = gs.companions[id]
              const def = COMPANIONS[id]
              if (!c.joined) return null
              const hpPct = (c.hp / c.maxHp) * 100
              return (
                <div key={id} className={`flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 ${!c.alive ? 'opacity-40' : ''}`}>
                  <span className="text-xl">{def.emoji}</span>
                  <div>
                    <div className="text-xs font-black text-white">{def.name}</div>
                    <div className="w-16 h-1.5 bg-gray-900 rounded-sm overflow-hidden mt-0.5">
                      <div className={`h-full ${hpPct > 50 ? 'bg-green-600' : hpPct > 25 ? 'bg-yellow-600' : 'bg-red-700'}`} style={{ width: `${hpPct}%` }} />
                    </div>
                    <div className="text-xs text-gray-500">HP {c.hp}/{c.maxHp}</div>
                  </div>
                  {!c.alive && <span className="text-xs text-red-500 font-black">💀</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
