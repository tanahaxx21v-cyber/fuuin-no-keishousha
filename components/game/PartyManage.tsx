'use client'

import { useState } from 'react'
import type { GameState, CompanionId } from '@/lib/game/types'
import { COMPANIONS } from '@/lib/game/data'
import { CharPortrait } from './CharPortrait'

interface Props {
  gs: GameState
  onSetParty: (party: CompanionId[]) => void
  onClose: () => void
}

export default function PartyManage({ gs, onSetParty, onClose }: Props) {
  const [draft, setDraft] = useState<CompanionId[]>(
    gs.party.filter(id => gs.companions[id]?.alive)
  )
  const [detailId, setDetailId] = useState<CompanionId | null>(null)

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
      <div className="bg-[#0c0c24] border-2 border-indigo-700 p-4 flex items-center gap-3">
        <button
          onClick={onClose}
          className="text-xs font-bold text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 transition"
        >
          ← もどる
        </button>
        <h2 className="text-xl font-black text-white">👥 パーティ編成</h2>
        <div className="ml-auto bg-indigo-950 border-2 border-indigo-700 px-3 py-1">
          <span className="font-black text-white">{draft.length}</span>
          <span className="text-indigo-400 text-sm">/3</span>
        </div>
      </div>

      {/* Draft slots */}
      <div className="bg-[#0c0c24] border-2 border-amber-800 p-3">
        <div className="text-xs font-black text-amber-500 mb-2 tracking-widest">— 選択中のパーティ —</div>
        <div className="flex gap-2">
          {[0, 1, 2].map(i => {
            const memberId = draft[i]
            const def = memberId ? COMPANIONS[memberId] : null
            return (
              <div key={i} className={`flex-1 border-2 flex flex-col items-center justify-center gap-1 py-1.5 transition ${def ? 'border-amber-600 bg-amber-950' : 'border-slate-700 bg-slate-900'}`} style={{ minHeight: 68 }}>
                {def ? (
                  <>
                    <div className="overflow-hidden border border-amber-700">
                      <CharPortrait charId={memberId!} size={44} rounded={0} />
                    </div>
                    <div className="text-[10px] font-black text-white">{def.name}</div>
                  </>
                ) : (
                  <div className="text-xs text-slate-600 font-bold">空き</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Characters reference image */}
      <div className="bg-[#0c0c24] border-2 border-indigo-700 overflow-hidden">
        <div className="text-xs font-black text-indigo-400 px-3 pt-3 pb-1 tracking-widest">— 仲間キャラクター図鑑 —</div>
        <img
          src="/fuuin-no-keishousha/images/characters.jpg"
          alt="characters"
          className="w-full object-contain max-h-40"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Companion list */}
      <div className="bg-[#0c0c24] border-2 border-indigo-700 p-3">
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
                <div key={def.id} className="relative">
                  <button
                    onClick={() => toggle(def.id)}
                    className={`w-full flex items-center gap-3 border-2 p-3 text-left transition-all active:scale-95 ${
                      inDraft
                        ? 'border-amber-500 bg-[#0a0500]'
                        : draft.length >= 3
                        ? 'border-slate-700 bg-slate-900 opacity-50 cursor-not-allowed'
                        : 'border-slate-700 bg-slate-900 hover:border-indigo-600 hover:bg-indigo-950'
                    }`}
                  >
                    <div className="shrink-0 overflow-hidden border border-slate-600">
                      <CharPortrait charId={def.id} size={48} rounded={0} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-white">{def.name}</span>
                        <span className="text-xs text-gray-400 font-bold">{def.cls}</span>
                        <span className="text-xs text-purple-400 font-black">Lv{c.level}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-20 h-2.5 bg-gray-900 border border-gray-700 overflow-hidden">
                          <div className={`h-full ${hpPct > 50 ? 'bg-green-600' : hpPct > 25 ? 'bg-yellow-600' : 'bg-red-700'}`} style={{ width: `${hpPct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 font-bold">HP {c.hp}/{c.maxHp}</span>
                        <span className="text-xs text-blue-400 font-bold">MP {c.mp}/{c.maxMp}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5 font-bold">ATK {c.atk} · DEF {c.def} · SPD {c.spd}</div>
                    </div>
                    <div className={`w-6 h-6 border-2 flex items-center justify-center shrink-0 font-black transition ${
                      inDraft ? 'border-amber-400 bg-amber-500 text-black text-xs' : 'border-slate-600 bg-slate-900'
                    }`}>
                      {inDraft ? slotNum : ''}
                    </div>
                  </button>
                  {/* スキル詳細ボタン */}
                  <button
                    onClick={e => { e.stopPropagation(); setDetailId(detailId === def.id ? null : def.id) }}
                    className="absolute top-2 right-10 text-[10px] text-indigo-400 hover:text-indigo-200 border border-indigo-800 bg-indigo-950 px-1.5 py-0.5 font-bold"
                  >
                    スキル
                  </button>
                  {/* スキル詳細パネル */}
                  {detailId === def.id && (
                    <div className="mt-1 bg-slate-900 border border-indigo-700 px-3 py-2">
                      <div className="text-[10px] text-indigo-400 font-black mb-1.5">✨ {def.name}のスキル</div>
                      {[...def.skills, ...c.learnedSkills].map(sk => (
                        <div key={sk.id} className="flex justify-between items-start text-xs py-0.5 border-b border-slate-800 last:border-0">
                          <div>
                            <span className="font-black text-white">{sk.name}</span>
                            <span className="text-gray-500 ml-2">{sk.desc}</span>
                          </div>
                          <span className="text-blue-400 font-bold shrink-0 ml-2">MP {sk.mpCost}</span>
                        </div>
                      ))}
                      {def.learnableSkills && def.learnableSkills.filter(ls => ls.level > c.level).length > 0 && (
                        <div className="text-[10px] text-gray-600 mt-1.5">
                          次のスキル: Lv{def.learnableSkills.filter(ls => ls.level > c.level)[0].level}「{def.learnableSkills.filter(ls => ls.level > c.level)[0].skill.name}」
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* チーム合計ステータス */}
      {draft.length > 0 && (() => {
        const totalAtk = draft.reduce((sum, id) => sum + (gs.companions[id]?.atk ?? 0), 0)
        const totalDef = draft.reduce((sum, id) => sum + (gs.companions[id]?.def ?? 0), 0)
        const totalSpd = draft.reduce((sum, id) => sum + (gs.companions[id]?.spd ?? 0), 0)
        const avgHpPct = draft.reduce((sum, id) => {
          const c = gs.companions[id]
          return sum + (c ? c.hp / c.maxHp : 0)
        }, 0) / draft.length
        return (
          <div className="bg-[#0c0c24] border-2 border-slate-700 p-3">
            <div className="text-xs font-black text-slate-400 mb-2 tracking-widest">— パーティ合計ステータス —</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-[10px] text-gray-500 font-bold">ATK合計</div>
                <div className="text-red-400 font-black text-base">{totalAtk}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-bold">DEF合計</div>
                <div className="text-blue-400 font-black text-base">{totalDef}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-bold">SPD合計</div>
                <div className="text-yellow-400 font-black text-base">{totalSpd}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-bold">平均HP</div>
                <div className={`font-black text-base ${avgHpPct > 0.5 ? 'text-green-400' : avgHpPct > 0.25 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {Math.round(avgHpPct * 100)}%
                </div>
              </div>
            </div>
            {avgHpPct < 0.5 && (
              <div className="text-xs text-yellow-400 font-bold mt-2 text-center">⚠️ HP不足。宿屋で回復してから出発推奨</div>
            )}
          </div>
        )
      })()}

      <button
        onClick={handleConfirm}
        disabled={draft.length === 0}
        className={`w-full py-4 border-2 text-white font-black text-lg transition active:scale-95 ${
          draft.length === 0
            ? 'bg-slate-900 border-slate-700 text-gray-600 cursor-not-allowed opacity-50'
            : 'bg-indigo-800 hover:bg-indigo-700 border-indigo-500'
        }`}
      >
        {draft.length === 0 ? '仲間を1人以上選択してください' : `✅ 確定（${draft.length}人選択中）`}
      </button>
    </div>
  )
}
