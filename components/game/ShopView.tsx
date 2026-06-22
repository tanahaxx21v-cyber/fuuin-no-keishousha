'use client'

import type { GameState } from '@/lib/game/types'
import { LOCATIONS, ITEMS, getItemPrice, getDifficultyMultiplier } from '@/lib/game/data'

interface Props {
  gs: GameState
  onBuy: (itemId: string) => void
  onClose: () => void
}

function getShopGreeting(gs: GameState): string {
  const daysLeft = gs.daysLeft
  if (daysLeft <= 10) return '……お客さん、もう時間がないんじゃないか？必要なものだけさっと選んでくれ。'
  if (daysLeft <= 20) return '急いでるね。厳選品だけ並べてある。早く選んでいきな！'
  if (daysLeft <= 40) return 'そろそろ物価が上がってきたね。早めに買っといた方がいいよ。'
  const byLoc: Record<string, string> = {
    alseria: 'いらっしゃいませ！王都一番の品揃えをご覧ください。大切な旅の準備はここで！',
    bern: 'よく来たね！商業都市ベルンの厳選品だよ。確かな品質を保証するよ。',
    sahal: 'お、砂漠の旅人かい。砂漠越えに必要なものは全部揃えたよ。特に解毒薬は多めに持ってくといい。',
    mirea: '遠い港から仕入れた品もあるよ。海路の旅にも、陸路にも使えるものばかりだ。',
    elna: 'エルフの里で育てた薬草を使ったものがいくつかあるよ。珍しいだろう？',
    galdo: 'ガルドまで来たか。ここが最後の補給地になることも多い。しっかり準備していきな。',
    bandit_hideout: '（こっそり）……盗賊のアジトなのに、なんで店開いてんだって？俺だって商売したいんだよ。',
    spirit_spring: '精霊の力が宿る地で、不思議と薬の効き目が増すような気がするね。',
    checkpoint: '関所の向こうは危険が増すよ。消耗品は多めに持っていくのが賢い旅人の知恵だ。',
  }
  return byLoc[gs.currentLocId] ?? 'いらっしゃい。何でも揃えてあるよ！気に入ったものがあれば遠慮なく！'
}

export default function ShopView({ gs, onBuy, onClose }: Props) {
  const loc = LOCATIONS[gs.currentLocId]
  const shopItems = loc.shopItems ?? []
  const totalDays = getDifficultyMultiplier(gs.difficulty).days
  const greeting = getShopGreeting(gs)

  return (
    <div className="p-3 max-w-lg mx-auto flex flex-col gap-3">

      {/* Header */}
      <div className="bg-[#0c0c24] border-2 border-green-800 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 rounded-lg transition"
          >
            ← もどる
          </button>
          <h2 className="text-xl font-black text-white">🛒 ショップ</h2>
          <div className="ml-auto flex items-center gap-1 bg-amber-950 border-2 border-amber-800 rounded-lg px-3 py-1">
            <span className="text-xs">💰</span>
            <span className="font-black text-amber-300">{gs.gold}</span>
            <span className="text-xs text-amber-700">G</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-xl shrink-0">🧑‍💼</span>
          <p className="text-sm text-green-200 italic leading-relaxed">「{greeting}」</p>
        </div>
      </div>

      {/* Price tier info */}
      {(() => {
        const daysSpent = totalDays - gs.daysLeft
        const tiers = Math.min(5, Math.floor(daysSpent / 10))
        if (tiers <= 0) return null
        return (
          <div className="bg-amber-950/60 border-2 border-amber-700 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-amber-400 text-xl">📈</span>
            <div className="text-xs text-amber-300 font-bold">物価上昇中（+{tiers * 10}%）経過日数: {daysSpent}日 — 早めに買おう！</div>
          </div>
        )
      })()}

      {/* Items */}
      <div className="bg-[#0c0c24] border-2 border-amber-800 rounded-xl p-3">
        <div className="text-xs font-black text-amber-500 mb-3 tracking-widest">— ラインナップ —</div>
        <div className="flex flex-col gap-2">
          {shopItems.map(itemId => {
            const item = ITEMS[itemId]
            if (!item) return null
            const currentPrice = getItemPrice(itemId, gs.daysLeft, totalDays)
            const isPriceUp = currentPrice > item.price
            const owned = gs.inventory.find(i => i.itemId === itemId)?.qty ?? 0
            const canBuy = gs.gold >= currentPrice
            const hpPct = gs.playerHp / gs.playerMaxHp
            const mpPct = gs.playerMp / gs.playerMaxMp
            const isRecommended = (
              (hpPct < 0.5 && (item.effect === 'heal_hp' || item.effect === 'heal_both')) ||
              (mpPct < 0.4 && (item.effect === 'heal_mp' || item.effect === 'heal_both')) ||
              (hpPct < 0.3 && item.effect === 'cure_status')
            )

            return (
              <div key={itemId} className={`bg-slate-900 border-2 rounded-xl p-4 flex items-center gap-3 ${
                isRecommended && canBuy ? 'border-yellow-600 ring-1 ring-yellow-500/30' : canBuy ? 'border-slate-700' : 'border-slate-800 opacity-60'
              }`}>
                <div className="text-4xl">{item.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-sm">{item.name}</span>
                    {isRecommended && canBuy && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-yellow-950 border border-yellow-600 text-yellow-400 animate-pulse">おすすめ</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                  {/* Recovery preview */}
                  {item.effect === 'heal_hp' && gs.playerHp < gs.playerMaxHp && (
                    <div className="text-[10px] text-green-400 font-bold mt-0.5">
                      HP {gs.playerHp} → {Math.min(gs.playerMaxHp, gs.playerHp + item.power)}（+{Math.min(item.power, gs.playerMaxHp - gs.playerHp)}）
                    </div>
                  )}
                  {item.effect === 'heal_mp' && gs.playerMp < gs.playerMaxMp && (
                    <div className="text-[10px] text-blue-400 font-bold mt-0.5">
                      MP {gs.playerMp} → {Math.min(gs.playerMaxMp, gs.playerMp + item.power)}（+{Math.min(item.power, gs.playerMaxMp - gs.playerMp)}）
                    </div>
                  )}
                  {item.effect === 'heal_both' && (
                    <div className="text-[10px] text-purple-400 font-bold mt-0.5">
                      HP +{Math.min(item.power, gs.playerMaxHp - gs.playerHp)} / MP +{Math.min(40, gs.playerMaxMp - gs.playerMp)}
                    </div>
                  )}
                  {owned > 0 && <div className="text-xs text-blue-400 font-bold mt-0.5">所持: {owned}個</div>}
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-black text-base ${isPriceUp ? 'text-red-400' : 'text-amber-300'}`}>
                    {currentPrice}G
                    {isPriceUp && <span className="text-xs text-red-500 ml-1">↑</span>}
                  </div>
                  {isPriceUp && <div className="text-xs text-gray-600 line-through">{item.price}G</div>}
                  <div className="flex gap-1 mt-1.5">
                    <button
                      onClick={() => onBuy(itemId)}
                      disabled={!canBuy}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-black border-2 transition active:scale-95 ${
                        canBuy
                          ? 'bg-green-900 hover:bg-green-800 border-green-600 text-white'
                          : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      ×1
                    </button>
                    <button
                      onClick={() => { onBuy(itemId); onBuy(itemId); onBuy(itemId) }}
                      disabled={gs.gold < currentPrice * 3}
                      className={`px-2 py-1.5 rounded-lg text-xs font-black border-2 transition active:scale-95 ${
                        gs.gold >= currentPrice * 3
                          ? 'bg-blue-900 hover:bg-blue-800 border-blue-600 text-white'
                          : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      ×3
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
