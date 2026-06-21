'use client'

import type { GameState, CompanionId } from '@/lib/game/types'
import { LOCATIONS, COMPANIONS, ENEMIES, getInnPrice, getDifficultyMultiplier } from '@/lib/game/data'

interface Props {
  gs: GameState
  onBackToMap: () => void
  onInn: () => void
  onOpenShop: () => void
  onEnterDungeon: () => void
  onFightBoss: () => void
  onJoinCompanion: (id: CompanionId) => void
  onSkipCompanion: () => void
  onWander?: () => void
  onOpenPartyManage?: () => void
}

function getRoleBadge(cls: string): { label: string; color: string } {
  if (cls === '騎士' || cls === '戦士') return { label: '🛡️ タンク型', color: 'text-blue-300' }
  if (cls === '神官') return { label: '💚 ヒーラー型', color: 'text-green-300' }
  if (cls === '魔法使い' || cls === '元魔王軍魔導士') return { label: '🔮 魔法型', color: 'text-purple-300' }
  if (cls === '弓使い' || cls === 'エルフ・弓術士') return { label: '🏹 遠距離型', color: 'text-amber-300' }
  return { label: '⚔️ アタッカー型', color: 'text-red-300' }
}

export default function LocationView({
  gs, onBackToMap, onInn, onOpenShop, onEnterDungeon, onFightBoss, onJoinCompanion, onSkipCompanion, onWander, onOpenPartyManage
}: Props) {
  const loc = LOCATIONS[gs.currentLocId]
  const companion = loc.companionId ? COMPANIONS[loc.companionId] : undefined
  const companionState = companion ? gs.companions[companion.id] : undefined
  const showCompanionJoin = companion && companionState && !companionState.joined
  const pendingJoin = gs.pendingCompanionJoin ? COMPANIONS[gs.pendingCompanionJoin] : undefined

  const bossDefeated = loc.bossId ? gs.defeatedBosses.includes(loc.bossId) : false
  const sealObtained = loc.sealStone ? gs.sealStones.includes(loc.sealStone) : false
  const joinedCount = Object.values(gs.companions).filter(c => c.joined).length

  const totalDays = getDifficultyMultiplier(gs.difficulty).days
  const typeLabel = loc.type === 'town' ? '🏘️ 町' : loc.type === 'dungeon' ? '⚔️ ダンジョン' : loc.type === 'relay' ? '🛖 中継地' : '🏯 城'
  const typeBorder = loc.type === 'town' ? 'border-indigo-700' : loc.type === 'dungeon' ? 'border-orange-800' : loc.type === 'relay' ? 'border-slate-600' : 'border-red-800'

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
          {joinedCount >= 3 && (
            <div className="text-xs text-amber-400 font-bold mb-2 text-center">⚠️ 仲間は3人まで。断るか、現在の仲間と交代できません。</div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onJoinCompanion(gs.pendingCompanionJoin!)}
              disabled={joinedCount >= 3}
              className="flex-1 py-2.5 bg-purple-800 hover:bg-purple-700 border-2 border-purple-600 text-white font-black rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
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
              <div className="flex items-center gap-2">
                <div className="text-xs text-indigo-300 font-bold">{companion!.cls}</div>
                {(() => { const r = getRoleBadge(companion!.cls); return <div className={`text-xs font-black ${r.color}`}>{r.label}</div> })()}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-300 italic mb-3 border-l-2 border-indigo-700 pl-3">「{companion!.joinText}」</p>
          <p className="text-xs text-gray-400 mb-3 leading-relaxed">{companion!.desc}</p>
          {/* 実スタット表示 */}
          {(() => {
            const cs = gs.companions[companion!.id]
            return (
              <div className="grid grid-cols-4 gap-1 mb-3 bg-slate-900/70 rounded-lg px-3 py-2 border border-slate-700">
                {[
                  { label: 'HP', value: cs.maxHp, color: 'text-green-400' },
                  { label: 'ATK', value: cs.atk, color: 'text-red-400' },
                  { label: 'DEF', value: cs.def, color: 'text-blue-400' },
                  { label: 'SPD', value: cs.spd, color: 'text-yellow-400' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-[9px] text-gray-500 font-bold">{s.label}</div>
                    <div className={`text-sm font-black ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>
            )
          })()}
          {joinedCount >= 3 ? (
            <div className="bg-red-950/60 border border-red-700 rounded-lg p-2 mb-2 text-xs text-red-300 font-bold text-center">
              ⚠️ 仲間は3人まで。現在 {joinedCount}/3 人加入済み。
            </div>
          ) : (
            <div className="text-xs text-gray-500 mb-2">仲間枠: {joinedCount}/3 人</div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onJoinCompanion(companion!.id)}
              disabled={joinedCount >= 3}
              className="flex-1 py-2.5 bg-indigo-800 hover:bg-indigo-700 disabled:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed border-2 border-indigo-600 text-white font-black rounded-xl transition active:scale-95"
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

          {onOpenPartyManage && Object.values(gs.companions).some(c => c.joined && c.alive) && (() => {
            const notInParty = Object.values(gs.companions).some(c => c.joined && c.alive && !gs.party.includes(c.id as CompanionId))
            return (
              <button
                onClick={onOpenPartyManage}
                className={`w-full py-3 px-4 rounded-xl transition text-left flex items-center gap-3 active:scale-95 border-2 ${
                  notInParty
                    ? 'bg-purple-900 hover:bg-purple-800 border-purple-500 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                }`}
              >
                <span className="text-xl">👥</span>
                <div>
                  <div className="font-black text-sm">パーティ編成</div>
                  <div className={`text-xs ${notInParty ? 'text-purple-300 font-bold' : 'text-gray-400'}`}>
                    {notInParty ? '⚠️ 未参戦の仲間がいます！メンバーを組み替えよう' : '仲間の組み合わせを変更する'}
                  </div>
                </div>
              </button>
            )
          })()}

          {loc.hasInn && (
            <button
              onClick={onInn}
              className="w-full py-3 px-4 bg-blue-950 hover:bg-blue-900 border-2 border-blue-700 text-white rounded-xl transition text-left flex items-center gap-3 active:scale-95"
            >
              <span className="text-xl">🏨</span>
              <div>
                <div className="font-black text-sm">宿屋で休む</div>
                <div className="text-xs text-gray-400">{getInnPrice(gs.daysLeft, totalDays)}G・1日消費・HP/MP全回復</div>
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
              {/* パーティ低HP警告 */}
              {(() => {
                const aliveParty = gs.party.filter(id => gs.companions[id].alive)
                const allUnits = [{ hp: gs.playerHp, maxHp: gs.playerMaxHp }, ...aliveParty.map(id => gs.companions[id])]
                const avgHpPct = allUnits.length > 0
                  ? allUnits.reduce((sum, u) => sum + u.hp / u.maxHp, 0) / allUnits.length
                  : 1
                return avgHpPct < 0.5 ? (
                  <div className="bg-yellow-950/80 border border-yellow-700 rounded-lg px-3 py-2 text-xs text-yellow-300 font-bold">
                    ⚠️ HP平均 {Math.round(avgHpPct * 100)}%。宿屋で回復してから挑むと安全です。
                  </div>
                ) : null
              })()}
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
                  {loc.bossId && ENEMIES[loc.bossId] && (() => {
                    const boss = ENEMIES[loc.bossId!]
                    const { enemyHpMult } = getDifficultyMultiplier(gs.difficulty)
                    const bossHp = Math.floor(boss.hp * enemyHpMult)
                    return (
                      <div className="text-xs text-red-300 font-bold mt-0.5">
                        {boss.emoji} {boss.name} — HP {bossHp} / ATK {boss.atk}
                        {loc.sealStone && !sealObtained && <span className="text-amber-400 ml-2">💎 封印石あり</span>}
                      </div>
                    )
                  })()}
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

          {(loc.type === 'town' || loc.type === 'relay') && onWander && (
            <button
              onClick={onWander}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-white rounded-xl transition text-left flex items-center gap-3 active:scale-95"
            >
              <span className="text-xl">🚶</span>
              <div>
                <div className="font-black text-sm">うろつく</div>
                <div className="text-xs text-gray-400">1日消費・アイテム/EXP/Gをランダムに発見</div>
              </div>
            </button>
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
          {gs.party.some(id => gs.companions[id].alive && gs.companions[id].hp < gs.companions[id].maxHp * 0.3) && (
            <div className="text-xs text-yellow-400 font-bold mb-2">⚠️ HPが危険な仲間がいます。宿屋で回復を！</div>
          )}
          <div className="flex flex-wrap gap-2">
            {gs.party.map(id => {
              const c = gs.companions[id]
              const def = COMPANIONS[id]
              if (!c.joined) return null
              const hpPct = (c.hp / c.maxHp) * 100
              const isLowHp = c.alive && hpPct < 30
              return (
                <div key={id} className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${!c.alive ? 'bg-slate-900 border-red-900 opacity-40' : isLowHp ? 'bg-red-950 border-red-700 animate-pulse' : 'bg-slate-800 border-slate-700'}`}>
                  <span className="text-xl">{def.emoji}</span>
                  <div>
                    <div className="text-xs font-black text-white">{def.name}</div>
                    <div className="w-16 h-1.5 bg-gray-900 rounded-sm overflow-hidden mt-0.5">
                      <div className={`h-full ${hpPct > 50 ? 'bg-green-600' : hpPct > 25 ? 'bg-yellow-600' : 'bg-red-700'}`} style={{ width: `${hpPct}%` }} />
                    </div>
                    <div className={`text-xs ${isLowHp ? 'text-red-400 font-bold' : 'text-gray-500'}`}>HP {c.hp}/{c.maxHp}</div>
                  </div>
                  {!c.alive && <span className="text-xs text-red-500 font-black">💀永眠</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
