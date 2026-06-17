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

  const joinedCompanions = Object.values(COMPANIONS).filter(
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
    <div className="p-3 max-w-lg mx-auto flex flex-col gap-3">

      {/* Header */}
      <div className="bg-[#0c0c24] border-2 border-indigo-700 rounded-xl p-4 flex items-center gap-3">
        <button
          onClick={onClose}
          className="text-xs font-bold text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 rounded-lg transition"
        >
          ← もどる
        </button>
        <h2 className="text-xl font-black text-white">👥 パーティ編成</h2>
        <div className="ml-auto bg-indigo-950 border-2 border-indigo-700 rounded-lg px-3 py-1">
          <span className="font-black text-white">{draft.length}</span>
          <span className="text-indigo-400 text-sm">/3</span>
        </div>
      </div>

      {/* Draft slots */}
      <div className="bg-[#0c0c24] border-2 border-amber-800 rounded-xl p-3">
        <div className="text-xs font-black text-amber-500 mb-2 tracking-widest">— 選択中のパーティ —</div>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => {
            const memberId = draft[i]
            const def = memberId ? COMPANIONS[memberId] : null
            return (
              <div key={i} className={`flex-1 h-14 rounded-xl border-2 flex items-center justify-center transition ${def ? 'border-amber-600 bg-amber-950/40' : 'border-dashed border-slate-700 bg-slate-900/50'}`}>
                {def ? (
                  <div className="text-center">
                    <div className="text-2xl">{def.emoji}</div>
                    <div className="text-xs font-black text-white">{def.name}</div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 font-bold">空き</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Companion list */}
      <div className="bg-[#0c0c24] border-2 border-indigo-700 rounded-xl p-3">
        <div className="text-xs font-black text-indigo-400 mb-2 tracking-widest">— 仲間一覧（タップで選択） —</div>
        {joinedCompanions.length === 0 ? (
          <div className="text-center text-gray-500 py-8 font-bold">まだ仲間がいない</div>
        ) : (
          <div className="flex flex-col gap-2">
            {joinedCompanions.map(def => {
              const c = gs.companions[def.id]
              const inDraft = draft.includes(def.id)
              const hpPct = (c.hp / c.maxHp) * 100
              const slotNum = draft.indexOf(def.id) + 1

              return (
                <button
                  key={def.id}
                  onClick={() => toggle(def.id)}
                  className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all active:scale-95 ${
                    inDraft
                      ? 'border-amber-500 bg-amber-950/30'
                      : draft.length >= 3
                      ? 'border-slate-700 bg-slate-900/50 opacity-50 cursor-not-allowed'
                      : 'border-slate-700 bg-slate-900/50 hover:border-indigo-600 hover:bg-indigo-950/30'
                  }`}
                >
                  <span className="text-3xl">{def.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-white">{def.name}</span>
                      <span className="text-xs text-gray-400 font-bold">{def.cls}</span>
                      <span className="text-xs text-purple-400 font-black">Lv{c.level}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-20 h-2.5 bg-gray-900 rounded-sm border border-gray-700 overflow-hidden">
                        <div className={`h-full ${hpPct > 50 ? 'bg-green-600' : hpPct > 25 ? 'bg-yellow-600' : 'bg-red-700'}`} style={{ width: `${hpPct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 font-bold">HP {c.hp}/{c.maxHp}</span>
                      <span className="text-xs text-blue-400 font-bold">MP {c.mp}/{c.maxMp}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5 font-bold">ATK {c.atk} · DEF {c.def} · SPD {c.spd}</div>
                  </div>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 font-black transition ${
                    inDraft ? 'border-amber-400 bg-amber-500 text-black text-sm' : 'border-slate-600 bg-slate-900'
                  }`}>
                    {inDraft ? slotNum : ''}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <button
        onClick={handleConfirm}
        className="w-full py-4 bg-indigo-800 hover:bg-indigo-700 border-2 border-indigo-500 text-white font-black text-lg rounded-xl transition active:scale-95 shadow-xl"
      >
        ✅ 確定（{draft.length}人選択中）
      </button>
    </div>
  )
}
