'use client'

import type { GameState } from '@/lib/game/types'
import { LOCATIONS, ITEMS } from '@/lib/game/data'

interface Props {
  gs: GameState
  onBuy: (itemId: string) => void
  onClose: () => void
}

export default function ShopView({ gs, onBuy, onClose }: Props) {
  const loc = LOCATIONS[gs.currentLocId]
  const shopItems = loc.shopItems ?? []

  return (
    <div className="p-3 max-w-lg mx-auto flex flex-col gap-3">

      {/* Header */}
      <div className="bg-[#0c0c24] border-2 border-green-800 rounded-xl p-4 flex items-center gap-3">
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

      {/* Items */}
      <div className="bg-[#0c0c24] border-2 border-amber-800 rounded-xl p-3">
        <div className="text-xs font-black text-amber-500 mb-3 tracking-widest">— ラインナップ —</div>
        <div className="flex flex-col gap-2">
          {shopItems.map(itemId => {
            const item = ITEMS[itemId]
            if (!item) return null
            const owned = gs.inventory.find(i => i.itemId === itemId)?.qty ?? 0
            const canBuy = gs.gold >= item.price

            return (
              <div key={itemId} className={`bg-slate-900 border-2 rounded-xl p-4 flex items-center gap-3 ${canBuy ? 'border-slate-700' : 'border-slate-800 opacity-60'}`}>
                <div className="text-4xl">{item.emoji}</div>
                <div className="flex-1">
                  <div className="font-black text-white text-sm">{item.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                  {owned > 0 && <div className="text-xs text-blue-400 font-bold mt-0.5">所持: {owned}個</div>}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-amber-300 font-black text-base">{item.price}G</div>
                  <button
                    onClick={() => onBuy(itemId)}
                    disabled={!canBuy}
                    className={`mt-1.5 px-4 py-1.5 rounded-lg text-sm font-black border-2 transition active:scale-95 ${
                      canBuy
                        ? 'bg-green-900 hover:bg-green-800 border-green-600 text-white'
                        : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    購入
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
