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
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg transition">← もどる</button>
        <h2 className="text-xl font-bold text-white">🛒 ショップ</h2>
        <div className="ml-auto text-yellow-400 font-semibold">💰 {gs.gold}G</div>
      </div>

      <div className="flex flex-col gap-2">
        {shopItems.map(itemId => {
          const item = ITEMS[itemId]
          if (!item) return null
          const owned = gs.inventory.find(i => i.itemId === itemId)?.qty ?? 0
          const canBuy = gs.gold >= item.price

          return (
            <div key={itemId} className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-center gap-4">
              <div className="text-3xl">{item.emoji}</div>
              <div className="flex-1">
                <div className="font-semibold text-white text-sm">{item.name}</div>
                <div className="text-xs text-gray-400">{item.desc}</div>
                {owned > 0 && <div className="text-xs text-blue-400 mt-0.5">所持: {owned}個</div>}
              </div>
              <div className="text-right">
                <div className="text-yellow-400 font-bold text-sm">{item.price}G</div>
                <button
                  onClick={() => onBuy(itemId)}
                  disabled={!canBuy}
                  className={`mt-1 px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                    canBuy ? 'bg-green-700 hover:bg-green-600 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
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
  )
}
