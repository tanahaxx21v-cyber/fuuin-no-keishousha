'use client'

import { useState } from 'react'
import type { GameState, BattleUnit, Skill } from '@/lib/game/types'
import { ITEMS } from '@/lib/game/data'

interface Props {
  gs: GameState
  onAttack: (targetUid: string) => void
  onSkill: (skill: Skill, targetUid?: string) => void
  onItem: (itemId: string, targetUid: string) => void
  onFlee: () => void
  onClose: () => void
}

type ActionMode = 'select' | 'skill' | 'item' | 'target_attack' | 'target_skill' | 'target_item'

function HpBar({ hp, maxHp, size = 'md' }: { hp: number; maxHp: number; size?: 'sm' | 'md' }) {
  const pct = Math.max(0, (hp / maxHp) * 100)
  const h = size === 'sm' ? 'h-2' : 'h-3'
  return (
    <div className={`w-full ${h} bg-gray-900 rounded-sm border border-gray-700 overflow-hidden`}>
      <div
        className={`h-full transition-all duration-300 ${
          pct > 50 ? 'bg-gradient-to-r from-green-700 to-green-500'
          : pct > 25 ? 'bg-gradient-to-r from-yellow-700 to-yellow-500'
          : 'bg-gradient-to-r from-red-800 to-red-600'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function BattleScene({ gs, onAttack, onSkill, onItem, onFlee, onClose }: Props) {
  const b = gs.battle!
  const [mode, setMode] = useState<ActionMode>('select')
  const [pendingSkill, setPendingSkill] = useState<Skill | null>(null)
  const [pendingItemId, setPendingItemId] = useState<string | null>(null)

  const allies = b.units.filter(u => u.isAlly)
  const enemies = b.units.filter(u => !u.isAlly)
  const currentActor = b.units.find(u => u.uid === b.currentUid)
  const isPlayerTurn = currentActor?.isPlayer && b.phase === 'select_action'

  const playerUnit = b.units.find(u => u.isPlayer)!
  const aliveEnemies = enemies.filter(u => u.hp > 0)

  const availableItems = gs.inventory.filter(i => i.qty > 0)
  const recentLogs = b.logs.slice(-5)
  const isOver = b.phase === 'victory' || b.phase === 'defeat'

  function handleSelectTarget(unit: BattleUnit) {
    if (mode === 'target_attack') {
      onAttack(unit.uid)
      setMode('select')
    } else if (mode === 'target_skill' && pendingSkill) {
      onSkill(pendingSkill, unit.uid)
      setPendingSkill(null)
      setMode('select')
    } else if (mode === 'target_item' && pendingItemId) {
      onItem(pendingItemId, unit.uid)
      setPendingItemId(null)
      setMode('select')
    }
  }

  function handleSkillSelect(skill: Skill) {
    if (skill.target === 'enemy_all' || skill.target === 'ally_all' || skill.target === 'self') {
      onSkill(skill)
      setMode('select')
    } else if (skill.target === 'enemy_one') {
      setPendingSkill(skill)
      setMode('target_skill')
    } else if (skill.target === 'ally_one') {
      setPendingSkill(skill)
      setMode('target_skill')
    }
  }

  return (
    <div className="min-h-screen bg-[#07071a] flex flex-col p-2 gap-2">

      {/* Header */}
      <div className="flex items-center justify-between bg-[#0c0c24] border-2 border-indigo-800 rounded-xl px-3 py-2">
        <div className="font-black text-white text-sm">
          {b.isBoss ? '👑 BOSS BATTLE' : '⚔️ BATTLE'}
          <span className="text-indigo-500 font-normal text-xs ml-2">TURN {b.turn}</span>
        </div>
        <div className={`text-xs font-black px-2 py-0.5 rounded border-2 ${
          isPlayerTurn
            ? 'border-green-600 bg-green-950 text-green-400'
            : 'border-orange-700 bg-orange-950 text-orange-400'
        }`}>
          {isPlayerTurn ? '▶ あなたのターン' : '⏳ 待機中...'}
        </div>
      </div>

      {/* Enemies */}
      <div className="bg-[#0c0c24] border-2 border-red-900 rounded-xl p-3">
        <div className="text-xs font-black text-red-500 mb-2 tracking-widest">ENEMY</div>
        <div className="flex flex-wrap gap-2 justify-center">
          {enemies.map(e => {
            const isSelectable = (mode === 'target_attack' || mode === 'target_skill') && e.hp > 0
            return (
              <button
                key={e.uid}
                disabled={!isSelectable}
                onClick={() => isSelectable && handleSelectTarget(e)}
                className={`flex flex-col items-center rounded-xl p-3 min-w-[80px] transition-all border-2 ${
                  e.hp <= 0 ? 'opacity-25 border-gray-800 bg-gray-950'
                  : isSelectable ? 'border-red-500 bg-red-950/60 hover:bg-red-900/60 cursor-pointer scale-105 shadow-lg shadow-red-900/40'
                  : 'border-red-900/50 bg-red-950/20'
                }`}
              >
                <div className="text-4xl mb-1 drop-shadow">{e.emoji}</div>
                <div className="text-xs font-black text-white">{e.name}</div>
                <div className="w-full mt-1.5">
                  <HpBar hp={e.hp} maxHp={e.maxHp} />
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{e.hp}/{e.maxHp}</div>
                {e.statusEffects.length > 0 && (
                  <div className="text-xs mt-0.5">
                    {e.statusEffects.map(se => se.id === 'poison' ? '☠️' : se.id === 'stun' ? '💫' : '⬆️').join('')}
                  </div>
                )}
                {isSelectable && <div className="text-[10px] text-red-400 font-black mt-0.5">▲ タップ</div>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Battle log */}
      <div className="bg-[#080818] border-2 border-indigo-900/60 rounded-xl p-3 min-h-[72px] flex-1">
        <div className="flex flex-col-reverse gap-0.5">
          {recentLogs.map((log, i) => (
            <div key={i} className={`text-sm font-medium ${
              i === 0 ? 'font-black' : 'opacity-60'
            } ${
              log.type === 'damage' ? 'text-red-400'
              : log.type === 'heal' ? 'text-green-400'
              : log.type === 'critical' ? 'text-yellow-300'
              : log.type === 'death' ? 'text-gray-600 line-through'
              : log.type === 'status' ? 'text-purple-400'
              : log.type === 'system' ? 'text-cyan-300'
              : 'text-gray-300'
            }`}>
              {i === 0 ? '▶ ' : '　'}{log.text}
            </div>
          ))}
        </div>
      </div>

      {/* Allies */}
      <div className="bg-[#0c0c24] border-2 border-indigo-800 rounded-xl p-3">
        <div className="text-xs font-black text-indigo-400 mb-2 tracking-widest">PARTY</div>
        <div className="flex flex-wrap gap-2">
          {allies.map(a => {
            const isSelectable = (mode === 'target_item' || (mode === 'target_skill' && pendingSkill?.target === 'ally_one')) && a.hp > 0
            const mpPct = (a.mp / a.maxMp) * 100
            const isActing = a.uid === b.currentUid
            return (
              <button
                key={a.uid}
                disabled={!isSelectable}
                onClick={() => isSelectable && handleSelectTarget(a)}
                className={`flex flex-col items-center rounded-xl p-2 min-w-[70px] transition-all border-2 ${
                  a.hp <= 0 ? 'opacity-25 border-gray-800'
                  : isActing ? 'border-yellow-500 bg-yellow-950/40 ring-1 ring-yellow-400/30'
                  : isSelectable ? 'border-green-500 bg-green-950/40 hover:bg-green-900/40 cursor-pointer scale-105'
                  : 'border-indigo-800/50 bg-indigo-950/20'
                }`}
              >
                <div className="text-2xl mb-0.5">{a.emoji}</div>
                <div className="text-xs font-black text-white">{a.name}</div>
                <div className="w-full mt-1">
                  <HpBar hp={a.hp} maxHp={a.maxHp} size="sm" />
                </div>
                <div className="text-xs text-gray-400">{a.hp}/{a.maxHp}</div>
                <div className="w-full h-1.5 bg-gray-900 rounded-sm border border-gray-700 overflow-hidden mt-0.5">
                  <div className="h-full bg-gradient-to-r from-blue-800 to-blue-600" style={{ width: `${mpPct}%` }} />
                </div>
                <div className="text-xs text-blue-400">{a.mp}</div>
                {isSelectable && <div className="text-[10px] text-green-400 font-black mt-0.5">▲ タップ</div>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Command window */}
      {!isOver && (
        <div className="bg-[#0c0c24] border-2 border-amber-800 rounded-xl p-3">

          {mode === 'select' && isPlayerTurn && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => aliveEnemies.length === 1 ? onAttack(aliveEnemies[0].uid) : setMode('target_attack')}
                className="py-3 bg-red-900 hover:bg-red-800 border-2 border-red-600 text-white font-black rounded-xl transition text-base active:scale-95"
              >
                ⚔️ こうげき
              </button>
              <button
                onClick={() => setMode('skill')}
                className="py-3 bg-purple-900 hover:bg-purple-800 border-2 border-purple-600 text-white font-black rounded-xl transition text-base active:scale-95"
              >
                ✨ スキル
              </button>
              <button
                onClick={() => setMode('item')}
                disabled={availableItems.length === 0}
                className="py-3 bg-green-900 hover:bg-green-800 border-2 border-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-xl transition text-base active:scale-95"
              >
                🧪 アイテム
              </button>
              <button
                onClick={onFlee}
                disabled={b.isBoss}
                className="py-3 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 font-black rounded-xl transition text-base active:scale-95"
              >
                💨 にげる
              </button>
            </div>
          )}

          {mode === 'skill' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-black text-white">✨ スキルを選択</div>
                <button onClick={() => setMode('select')} className="text-xs text-gray-400 hover:text-white border border-gray-700 px-2 py-0.5 rounded">← もどる</button>
              </div>
              <div className="flex flex-col gap-1.5">
                {(playerUnit?.skills ?? []).map(skill => {
                  const canUse = (playerUnit?.mp ?? 0) >= skill.mpCost
                  return (
                    <button
                      key={skill.id}
                      disabled={!canUse}
                      onClick={() => handleSkillSelect(skill)}
                      className={`text-left px-3 py-2 rounded-xl border-2 transition ${
                        canUse
                          ? 'border-purple-700 bg-purple-950 hover:bg-purple-900 text-white active:scale-95'
                          : 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-black text-sm">{skill.name}</span>
                        <span className="text-xs text-blue-400 font-bold">MP {skill.mpCost}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{skill.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {mode === 'item' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-black text-white">🧪 アイテムを選択</div>
                <button onClick={() => setMode('select')} className="text-xs text-gray-400 hover:text-white border border-gray-700 px-2 py-0.5 rounded">← もどる</button>
              </div>
              {availableItems.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-3">アイテムがない</div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {availableItems.map(({ itemId, qty }) => {
                    const item = ITEMS[itemId]
                    if (!item) return null
                    return (
                      <button
                        key={itemId}
                        onClick={() => {
                          if (['heal_hp', 'heal_mp', 'heal_both', 'cure_status'].includes(item.effect)) {
                            setPendingItemId(itemId)
                            setMode('target_item')
                          }
                        }}
                        className="text-left px-3 py-2 rounded-xl border-2 border-green-800 bg-green-950 hover:bg-green-900 text-white transition active:scale-95"
                      >
                        <div className="flex justify-between">
                          <span className="font-black text-sm">{item.emoji} {item.name}</span>
                          <span className="text-xs text-gray-400 font-bold">x{qty}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {(mode === 'target_attack' || mode === 'target_skill' || mode === 'target_item') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-black text-yellow-300">
                  {mode === 'target_attack' ? '⚔️ 攻撃対象を選択'
                   : mode === 'target_item' ? '🧪 使用対象を選択'
                   : `✨ ${pendingSkill?.name}の対象を選択`}
                </div>
                <button
                  onClick={() => { setMode('select'); setPendingSkill(null); setPendingItemId(null) }}
                  className="text-xs text-gray-400 hover:text-white border border-gray-700 px-2 py-0.5 rounded"
                >← もどる</button>
              </div>
              <div className="text-xs text-gray-400">↑ 上のキャラクターをタップしてください</div>
            </div>
          )}

          {!isPlayerTurn && !isOver && (
            <div className="text-center text-sm text-gray-400 py-2 font-bold">
              {currentActor ? `${currentActor.name} のターン...` : '処理中...'}
            </div>
          )}
        </div>
      )}

      {/* Victory / Defeat */}
      {isOver && (
        <div className={`rounded-xl p-4 text-center border-2 ${
          b.phase === 'victory'
            ? 'bg-amber-950 border-amber-600 shadow-lg shadow-amber-900/40'
            : 'bg-red-950 border-red-700'
        }`}>
          <div className="text-3xl font-black mb-1">
            {b.phase === 'victory' ? '🎉 VICTORY！' : '💀 GAME OVER...'}
          </div>
          {b.phase === 'victory' && (
            <div className="text-sm text-gray-300 mb-3 font-bold">
              EXP +{b.rewardExp} / Gold +{b.rewardGold}G
              {b.sealStoneFound && (
                <div className="text-amber-300 font-black mt-1">💎 封印石を入手！</div>
              )}
            </div>
          )}
          <button
            onClick={onClose}
            className={`px-8 py-2.5 rounded-xl font-black border-2 transition active:scale-95 ${
              b.phase === 'victory'
                ? 'bg-amber-700 hover:bg-amber-600 border-amber-500 text-white'
                : 'bg-red-900 hover:bg-red-800 border-red-600 text-white'
            }`}
          >
            {b.phase === 'victory' ? '続ける ▶' : 'ゲームオーバーへ'}
          </button>
        </div>
      )}
    </div>
  )
}
