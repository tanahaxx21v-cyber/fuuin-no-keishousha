'use client'

import { useState } from 'react'
import type { GameState, CompanionId } from '@/lib/game/types'
import { COMPANIONS } from '@/lib/game/data'

interface Props {
  gs: GameState
  onSetParty: (party: CompanionId[]) => void
  onClose: () => void
}

export default function PartyManage({ gs, onSetParty, onClose }: Props) {
  const [draft, setDraft] = useState<CompanionId[]>([...gs.party])

  const joinedCompanions = (Object.values(COMPANIONS)).filter(
    c => gs.companions[c.id].joined && gs.companions[c.id].alive
  )

  function toggle(id: CompanionId) {
    if (draft.includes(id)) {
      setDraft(draft.filter(d => d !== id))
    } else if (draft.length < 3) {
      setDraft([...draft, id])
    }
  }

  function handleConfirm() {
    onSetParty(draft)
    onClose()
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg transition">← もどる</button>
        <h2 className="text-xl font-bold text-white">👥 パーティ編成</h2>
        <div className="ml-auto text-sm text-gray-400">{draft.length}/3</div>
      </div>

      {joinedCompanions.length === 0 ? (
        <div className="text-center text-gray-500 py-8">まだ仲間がいない</div>
      ) : (
        <div className="flex flex-col gap-2 mb-4">
          {joinedCompanions.map(def => {
            const c = gs.companions[def.id]
            const inDraft = draft.includes(def.id)
            const hpPct = (c.hp / c.maxHp) * 100

            return (
              <button
                key={def.id}
                onClick={() => toggle(def.id)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  inDraft ? 'border-yellow-500 bg-yellow-900/20 ring-1 ring-yellow-500/50' : 'border-gray-700 bg-gray-900/50 hover:border-gray-500'
                }`}
              >
                <span className="text-3xl">{def.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{def.name}</span>
                    <span className="text-xs text-gray-400">{def.cls}</span>
                    <span className="text-xs text-purple-400">Lv{c.level}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${hpPct}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">HP {c.hp}/{c.maxHp}</span>
                    <span className="text-xs text-blue-400">MP {c.mp}/{c.maxMp}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">ATK{c.atk} DEF{c.def} SPD{c.spd}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${inDraft ? 'border-yellow-400 bg-yellow-500' : 'border-gray-600'}`}>
                  {inDraft && <span className="text-xs text-black font-bold">{draft.indexOf(def.id) + 1}</span>}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <button
        onClick={handleConfirm}
        className="w-full py-3 bg-indigo-700 hover:bg-indigo-600 text-white font-bold rounded-xl transition"
      >
        ✅ 確定（{draft.length}人選択中）
      </button>
    </div>
  )
}
