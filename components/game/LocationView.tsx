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
  const canEnterDarkfort = loc.id === 'beast_forest' && gs.sealStones.length >= 3

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBackToMap}
          className="text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
        >
          ← マップへ
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">{loc.emoji} {loc.name}</h2>
          <div className="text-xs text-gray-400 capitalize">{loc.type === 'town' ? '🏘️ 町' : loc.type === 'dungeon' ? '⚔️ ダンジョン' : '🏯 城'}</div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 mb-4 text-sm text-gray-300 leading-relaxed">
        {loc.desc}
      </div>

      {/* Pending companion join (after boss defeat) */}
      {pendingJoin && (
        <div className="bg-purple-950/80 border-2 border-purple-600 rounded-xl p-4 mb-4 shadow-lg shadow-purple-900/30">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{pendingJoin.emoji}</span>
            <div>
              <div className="font-bold text-white">{pendingJoin.name}（{pendingJoin.cls}）</div>
              <div className="text-xs text-purple-300">仲間になりたがっている</div>
            </div>
          </div>
          <p className="text-sm text-gray-300 italic mb-3">「{pendingJoin.joinText}」</p>
          <div className="flex gap-2">
            <button
              onClick={() => onJoinCompanion(gs.pendingCompanionJoin!)}
              className="flex-1 py-2 bg-purple-700 hover:bg-purple-600 text-white font-semibold rounded-lg transition text-sm"
            >
              ✅ 仲間にする
            </button>
            <button
              onClick={onSkipCompanion}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition text-sm"
            >
              断る
            </button>
          </div>
        </div>
      )}

      {/* Companion encounter (before boss defeat, at town) */}
      {!pendingJoin && showCompanionJoin && loc.type === 'town' && (
        <div className="bg-indigo-950/80 border border-indigo-700 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{companion!.emoji}</span>
            <div>
              <div className="font-bold text-white">{companion!.name}（{companion!.cls}）</div>
              <div className="text-xs text-indigo-300">仲間候補</div>
            </div>
          </div>
          <p className="text-sm text-gray-300 italic mb-3">「{companion!.joinText}」</p>
          <div className="flex gap-2">
            <button
              onClick={() => onJoinCompanion(companion!.id)}
              className="flex-1 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-semibold rounded-lg transition text-sm"
            >
              ✅ 仲間にする
            </button>
            <button
              onClick={onSkipCompanion}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition text-sm"
            >
              断る
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-1 gap-2">
        {/* Town actions */}
        {loc.hasInn && (
          <button
            onClick={onInn}
            className="w-full py-3 bg-blue-800/60 hover:bg-blue-700/70 border border-blue-700/50 text-white rounded-xl transition text-sm font-medium text-left px-4"
          >
            <span className="text-base mr-2">🏨</span>
            <span className="font-semibold">宿屋で休む</span>
            <span className="text-xs text-gray-400 ml-2">（50G・1日消費・HP/MP全回復）</span>
          </button>
        )}

        {loc.shopItems && (
          <button
            onClick={onOpenShop}
            className="w-full py-3 bg-green-800/60 hover:bg-green-700/70 border border-green-700/50 text-white rounded-xl transition text-sm font-medium text-left px-4"
          >
            <span className="text-base mr-2">🛒</span>
            <span className="font-semibold">ショップ</span>
            <span className="text-xs text-gray-400 ml-2">アイテムを購入する</span>
          </button>
        )}

        {/* Dungeon actions */}
        {loc.type === 'dungeon' && !bossDefeated && (
          <>
            <button
              onClick={onEnterDungeon}
              className="w-full py-3 bg-orange-800/60 hover:bg-orange-700/70 border border-orange-700/50 text-white rounded-xl transition text-sm font-medium text-left px-4"
            >
              <span className="text-base mr-2">⚔️</span>
              <span className="font-semibold">ダンジョン探索</span>
              <span className="text-xs text-gray-400 ml-2">雑魚敵と戦う（EXP・Gゴールド獲得）</span>
            </button>
            <button
              onClick={onFightBoss}
              className="w-full py-3 bg-red-800/70 hover:bg-red-700/80 border border-red-600/50 text-white rounded-xl transition text-sm font-medium text-left px-4"
            >
              <span className="text-base mr-2">👑</span>
              <span className="font-semibold">ボスに挑む！</span>
              {loc.sealStone && !sealObtained && (
                <span className="text-xs text-yellow-400 ml-2">💎 封印石を守るボス</span>
              )}
            </button>
          </>
        )}

        {/* After boss defeat */}
        {loc.type === 'dungeon' && bossDefeated && (
          <>
            <div className="text-center py-2 text-green-400 text-sm">✅ ボス討伐済み</div>
            {!sealObtained && (
              <div className="text-center py-2 text-yellow-300 text-sm">💎 封印石入手済み</div>
            )}
            <button
              onClick={onEnterDungeon}
              className="w-full py-3 bg-gray-700/60 hover:bg-gray-600/70 border border-gray-600/50 text-gray-300 rounded-xl transition text-sm font-medium text-left px-4"
            >
              <span className="text-base mr-2">⚔️</span>
              <span className="font-semibold">再探索</span>
              <span className="text-xs text-gray-500 ml-2">EXP稼ぎ</span>
            </button>
          </>
        )}

        {/* Demon castle */}
        {loc.type === 'castle' && (
          <>
            {gs.sealStones.length < 3 ? (
              <div className="bg-red-950/60 border border-red-800 rounded-xl p-4 text-center">
                <div className="text-red-400 font-semibold">🔒 封印石が足りない</div>
                <div className="text-sm text-gray-400 mt-1">3つの封印石を全て集めてから挑め（{gs.sealStones.length}/3）</div>
              </div>
            ) : (
              <>
                <div className="bg-red-950/80 border border-red-700 rounded-xl p-3 text-center mb-1">
                  <div className="text-red-300 text-sm font-semibold">⚠️ 全ての封印石が揃った！魔王に挑め！</div>
                </div>
                <button
                  onClick={onFightBoss}
                  className="w-full py-3 bg-red-900 hover:bg-red-800 border border-red-600 text-white rounded-xl transition font-bold text-center animate-pulse"
                >
                  👑 魔王ダークルーラーに挑む！
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Party status */}
      {gs.party.length > 0 && (
        <div className="mt-4 bg-gray-900/60 border border-gray-700 rounded-xl p-3">
          <div className="text-xs text-gray-500 mb-2">現在のパーティ</div>
          <div className="flex flex-wrap gap-2">
            {gs.party.map(id => {
              const c = gs.companions[id]
              const def = COMPANIONS[id]
              if (!c.joined) return null
              return (
                <div key={id} className={`flex items-center gap-1.5 bg-gray-800 rounded-lg px-2 py-1 ${!c.alive ? 'opacity-40' : ''}`}>
                  <span>{def.emoji}</span>
                  <div>
                    <div className="text-xs font-medium text-white">{def.name}</div>
                    <div className="text-xs text-gray-400">HP {c.hp}/{c.maxHp}</div>
                  </div>
                  {!c.alive && <span className="text-xs text-red-400">💀</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
