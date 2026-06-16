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
  const aliveAllies = allies.filter(u => u.hp > 0)

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

  const availableItems = gs.inventory.filter(i => i.qty > 0)
  const recentLogs = b.logs.slice(-5)

  const isOver = b.phase === 'victory' || b.phase === 'defeat'

  return (
    <div className="min-h-screen bg-gray-950 p-3 flex flex-col gap-3">
      {/* Battle header */}
      <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-xl px-3 py-2">
        <div className="text-sm font-semibold text-white">
          {b.isBoss ? '👑 ボスバトル' : '⚔️ バトル'} — ターン {b.turn}
        </div>
        <div className="text-xs text-gray-400">
          {b.phase === 'select_action' && isPlayerTurn ? '🟢 あなたのターン' : '🔴 敵のターン'}
        </div>
      </div>

      {/* Enemies */}
      <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-3">
        <div className="text-xs text-gray-500 mb-2">敵</div>
        <div className="flex flex-wrap gap-2">
          {enemies.map(e => {
            const isSelectable = (mode === 'target_attack' || mode === 'target_skill') && e.hp > 0
            const hpPct = (e.hp / e.maxHp) * 100
            return (
              <button
                key={e.uid}
                disabled={!isSelectable}
                onClick={() => isSelectable && handleSelectTarget(e)}
                className={`flex flex-col items-center bg-gray-800 rounded-xl p-3 min-w-[80px] transition-all
                  ${e.hp <= 0 ? 'opacity-30' : ''}
                  ${isSelectable ? 'border-2 border-red-500 hover:bg-red-900/30 cursor-pointer scale-105' : 'border border-gray-700'}
                `}
              >
                <div className="text-3xl mb-1">{e.emoji}</div>
                <div className="text-xs font-semibold text-white">{e.name}</div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <div className={`h-full rounded-full ${hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${hpPct}%` }} />
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{e.hp}/{e.maxHp}</div>
                {e.statusEffects.length > 0 && (
                  <div className="text-xs mt-0.5">{e.statusEffects.map(se => se.id === 'poison' ? '☠️' : se.id === 'stun' ? '💫' : '⬆️').join('')}</div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Allies */}
      <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-3">
        <div className="text-xs text-gray-500 mb-2">味方</div>
        <div className="flex flex-wrap gap-2">
          {allies.map(a => {
            const isSelectable = (mode === 'target_item' || (mode === 'target_skill' && pendingSkill?.target === 'ally_one')) && a.hp > 0
            const hpPct = (a.hp / a.maxHp) * 100
            const mpPct = (a.mp / a.maxMp) * 100
            const isActing = a.uid === b.currentUid
            return (
              <button
                key={a.uid}
                disabled={!isSelectable}
                onClick={() => isSelectable && handleSelectTarget(a)}
                className={`flex flex-col items-center bg-gray-800 rounded-xl p-2 min-w-[75px] transition-all
                  ${a.hp <= 0 ? 'opacity-30' : ''}
                  ${isActing ? 'ring-2 ring-yellow-400' : ''}
                  ${isSelectable ? 'border-2 border-green-500 hover:bg-green-900/30 cursor-pointer scale-105' : 'border border-gray-700'}
                `}
              >
                <div className="text-2xl mb-1">{a.emoji}</div>
                <div className="text-xs font-semibold text-white">{a.name}</div>
                <div className="w-full h-1.5 bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <div className={`h-full rounded-full ${hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${hpPct}%` }} />
                </div>
                <div className="text-xs text-gray-400">{a.hp}/{a.maxHp}</div>
                <div className="w-full h-1 bg-gray-700 rounded-full mt-0.5 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${mpPct}%` }} />
                </div>
                <div className="text-xs text-blue-400">{a.mp}/{a.maxMp}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Battle log */}
      <div className="bg-black/60 border border-gray-800 rounded-xl p-3 min-h-[80px]">
        <div className="flex flex-col-reverse gap-0.5">
          {recentLogs.map((log, i) => (
            <div key={i} className={`text-sm ${
              log.type === 'damage' ? 'text-red-300' :
              log.type === 'heal' ? 'text-green-300' :
              log.type === 'critical' ? 'text-yellow-300 font-semibold' :
              log.type === 'death' ? 'text-gray-500 line-through' :
              log.type === 'status' ? 'text-purple-300' :
              log.type === 'system' ? 'text-blue-300 font-semibold' :
              'text-gray-300'
            }`}>
              {log.text}
            </div>
          ))}
        </div>
      </div>

      {/* Action panel */}
      {!isOver && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-3">
          {mode === 'select' && isPlayerTurn && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { if (aliveEnemies.length === 1) { onAttack(aliveEnemies[0].uid) } else { setMode('target_attack') } }}
                className="py-3 bg-red-800 hover:bg-red-700 text-white font-semibold rounded-xl transition"
              >
                ⚔️ こうげき
              </button>
              <button
                onClick={() => setMode('skill')}
                className="py-3 bg-purple-800 hover:bg-purple-700 text-white font-semibold rounded-xl transition"
              >
                ✨ スキル
              </button>
              <button
                onClick={() => setMode('item')}
                disabled={availableItems.length === 0}
                className="py-3 bg-green-800 hover:bg-green-700 disabled:opacity-40 text-white font-semibold rounded-xl transition"
              >
                🧪 アイテム
              </button>
              <button
                onClick={onFlee}
                disabled={b.isBoss}
                className="py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-white font-semibold rounded-xl transition"
              >
                💨 にげる
              </button>
            </div>
          )}

          {mode === 'skill' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-white">スキルを選択</div>
                <button onClick={() => setMode('select')} className="text-xs text-gray-400 hover:text-white">← もどる</button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {(playerUnit?.skills ?? []).map(skill => {
                  const canUse = (playerUnit?.mp ?? 0) >= skill.mpCost
                  return (
                    <button
                      key={skill.id}
                      disabled={!canUse}
                      onClick={() => handleSkillSelect(skill)}
                      className={`text-left px-3 py-2 rounded-xl border transition ${canUse ? 'border-purple-700 bg-purple-900/30 hover:bg-purple-800/40 text-white' : 'border-gray-700 bg-gray-800/30 text-gray-500 cursor-not-allowed'}`}
                    >
                      <div className="flex justify-between">
                        <span className="font-semibold text-sm">{skill.name}</span>
                        <span className="text-xs text-blue-400">MP {skill.mpCost}</span>
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
                <div className="text-sm font-semibold text-white">アイテムを選択</div>
                <button onClick={() => setMode('select')} className="text-xs text-gray-400 hover:text-white">← もどる</button>
              </div>
              {availableItems.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-3">アイテムがない</div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {availableItems.map(({ itemId, qty }) => {
                    const item = ITEMS[itemId]
                    if (!item) return null
                    return (
                      <button
                        key={itemId}
                        onClick={() => {
                          if (item.effect === 'heal_hp' || item.effect === 'heal_mp' || item.effect === 'heal_both' || item.effect === 'cure_status') {
                            setPendingItemId(itemId)
                            setMode('target_item')
                          }
                        }}
                        className="text-left px-3 py-2 rounded-xl border border-green-700 bg-green-900/30 hover:bg-green-800/40 text-white transition"
                      >
                        <div className="flex justify-between">
                          <span className="font-semibold text-sm">{item.emoji} {item.name}</span>
                          <span className="text-xs text-gray-400">x{qty}</span>
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
                <div className="text-sm font-semibold text-yellow-300">
                  {mode === 'target_attack' ? '⚔️ 攻撃対象を選択' :
                   mode === 'target_item' ? '🧪 使用対象を選択' :
                   `✨ ${pendingSkill?.name}の対象を選択`}
                </div>
                <button onClick={() => { setMode('select'); setPendingSkill(null); setPendingItemId(null) }} className="text-xs text-gray-400 hover:text-white">← もどる</button>
              </div>
              <div className="text-xs text-gray-400">↑ 上のキャラクターをタップ</div>
            </div>
          )}

          {!isPlayerTurn && !isOver && (
            <div className="text-center text-sm text-gray-400 py-2">
              {currentActor ? `${currentActor.name}のターン...` : '処理中...'}
            </div>
          )}
        </div>
      )}

      {/* Victory / Defeat */}
      {isOver && (
        <div className={`rounded-xl p-4 text-center border ${b.phase === 'victory' ? 'bg-yellow-900/40 border-yellow-600' : 'bg-red-950/60 border-red-700'}`}>
          <div className="text-2xl font-bold mb-1">
            {b.phase === 'victory' ? '🎉 勝利！' : '💀 全滅...'}
          </div>
          {b.phase === 'victory' && (
            <div className="text-sm text-gray-300 mb-3">
              EXP +{b.rewardExp} / Gold +{b.rewardGold}G
              {b.sealStoneFound && <div className="text-yellow-300 font-semibold mt-1">💎 封印石を入手！</div>}
            </div>
          )}
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-xl font-bold transition ${b.phase === 'victory' ? 'bg-yellow-600 hover:bg-yellow-500 text-black' : 'bg-red-800 hover:bg-red-700 text-white'}`}
          >
            {b.phase === 'victory' ? '続ける' : 'ゲームオーバーへ'}
          </button>
        </div>
      )}
    </div>
  )
}
