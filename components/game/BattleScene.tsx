'use client'

import { useState } from 'react'
import type { GameState, BattleUnit, Skill, LocationId } from '@/lib/game/types'
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

// Use CSS background-image to crop sprite sheet — reliable across all screen sizes
type EnemyBg = { file: 'enemies1' | 'enemies2'; bgSize: string; bgPos: string }

function getEnemyBg(locId: LocationId, isBoss: boolean): EnemyBg {
  if (isBoss && locId === 'desert_ruins') {
    return { file: 'enemies1', bgSize: '220% auto', bgPos: '100% 100%' }
  }
  if (isBoss) {
    return { file: 'enemies1', bgSize: '200% auto', bgPos: '0% 100%' }
  }
  switch (locId) {
    case 'demon_mine':
    case 'dragon_pass':
      // 山岳エリア (enemies1 top-left)
      return { file: 'enemies1', bgSize: '200% auto', bgPos: '0% 8%' }
    case 'desert_ruins':
      // 砂漠エリア (enemies1 top-right)
      return { file: 'enemies1', bgSize: '200% auto', bgPos: '100% 8%' }
    case 'bandit_hideout':
      // 魔王軍 (enemies1 right-center)
      return { file: 'enemies1', bgSize: '200% auto', bgPos: '100% 48%' }
    case 'ancient_temple':
    case 'forest_entrance':
      // 森エリア (enemies2)
      return { file: 'enemies2', bgSize: 'cover', bgPos: 'center' }
    default:
      // 河川エリア (enemies1 left-center)
      return { file: 'enemies1', bgSize: '200% auto', bgPos: '0% 55%' }
  }
}

function HpBar({ hp, maxHp, color = 'green' }: { hp: number; maxHp: number; color?: 'green' | 'red' | 'blue' }) {
  const pct = Math.max(0, (hp / maxHp) * 100)
  const fill = color === 'blue' ? 'bg-blue-400'
    : pct > 50 ? 'bg-green-400'
    : pct > 25 ? 'bg-yellow-400'
    : 'bg-red-500'
  return (
    <div className="w-full h-2.5 bg-black/60 border border-white/20 overflow-hidden rounded-sm">
      <div className={`h-full transition-all duration-300 ${fill}`} style={{ width: `${pct}%` }} />
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
  const latestLog = b.logs[b.logs.length - 1]
  const recentLogs = b.logs.slice(-3)
  const isOver = b.phase === 'victory' || b.phase === 'defeat'

  const bg = getEnemyBg(gs.currentLocId, b.isBoss)
  const imgSrc = `/fuuin-no-keishousha/images/${bg.file}.jpg`

  function handleSelectTarget(unit: BattleUnit) {
    if (mode === 'target_attack') { onAttack(unit.uid); setMode('select') }
    else if (mode === 'target_skill' && pendingSkill) { onSkill(pendingSkill, unit.uid); setPendingSkill(null); setMode('select') }
    else if (mode === 'target_item' && pendingItemId) { onItem(pendingItemId, unit.uid); setPendingItemId(null); setMode('select') }
  }

  function handleSkillSelect(skill: Skill) {
    if (skill.target === 'enemy_all' || skill.target === 'ally_all' || skill.target === 'self') {
      onSkill(skill); setMode('select')
    } else if (skill.target === 'enemy_one') {
      setPendingSkill(skill); setMode('target_skill')
    } else {
      setPendingSkill(skill); setMode('target_skill')
    }
  }

  const cancelTarget = () => { setMode('select'); setPendingSkill(null); setPendingItemId(null) }

  return (
    <div className="bg-[#07071a] flex flex-col" style={{ minHeight: '100dvh' }}>

      {/* ===== TOP STATUS ===== */}
      <div className="flex items-stretch gap-1 bg-[#12123a] border-b-2 border-[#2a2a6a] px-2 py-1.5 shrink-0">
        <div className="flex items-center gap-1.5 mr-2">
          <span className={`text-xs font-black px-2 py-0.5 rounded border ${b.isBoss ? 'border-red-500 bg-red-950 text-red-300' : 'border-yellow-700 bg-yellow-950 text-yellow-400'}`}>
            {b.isBoss ? '👑BOSS' : `T${b.turn}`}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${isPlayerTurn ? 'border-green-600 bg-green-950 text-green-300' : 'border-orange-700 bg-orange-950 text-orange-400'}`}>
            {isPlayerTurn ? '▶あなた' : '⏳待機'}
          </span>
        </div>
        {/* Player HP/MP */}
        <div className="flex-1 flex flex-col justify-center gap-0.5">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black text-green-300 w-4">HP</span>
            <HpBar hp={playerUnit.hp} maxHp={playerUnit.maxHp} color="green" />
            <span className="text-[9px] text-white w-14 text-right">{playerUnit.hp}/{playerUnit.maxHp}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black text-blue-300 w-4">MP</span>
            <HpBar hp={playerUnit.mp} maxHp={playerUnit.maxMp} color="blue" />
            <span className="text-[9px] text-blue-200 w-14 text-right">{playerUnit.mp}/{playerUnit.maxMp}</span>
          </div>
        </div>
        {/* Ally compact HP */}
        {allies.filter(a => !a.isPlayer).map(a => (
          <div key={a.uid} className="flex flex-col items-center justify-center px-1.5 border-l border-white/10 min-w-[48px]">
            <span className="text-base leading-none">{a.emoji}</span>
            <div className="w-10 mt-0.5"><HpBar hp={a.hp} maxHp={a.maxHp} color="green" /></div>
            <span className="text-[8px] text-gray-400">{a.hp}/{a.maxHp}</span>
          </div>
        ))}
      </div>

      {/* ===== BATTLE FIELD ===== */}
      <div className="relative shrink-0" style={{ height: '200px' }}>
        {/* Sky + grass background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, #5ab4e8 0%, #8ed0f0 50%, #7fd45a 50%, #4aaa20 75%, #2d8010 100%)',
        }} />
        {/* Clouds */}
        <div className="absolute top-3 left-6 w-20 h-5 bg-white/75 rounded-full" style={{ filter: 'blur(3px)' }} />
        <div className="absolute top-5 left-20 w-12 h-3 bg-white/60 rounded-full" style={{ filter: 'blur(2px)' }} />
        <div className="absolute top-2 right-10 w-24 h-5 bg-white/70 rounded-full" style={{ filter: 'blur(3px)' }} />

        {/* Enemy sprite sheet — CSS background crop */}
        <div
          className="absolute"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            top: '8px',
            width: 'min(85%, 380px)',
            height: '140px',
            backgroundImage: `url('${imgSrc}')`,
            backgroundSize: bg.bgSize,
            backgroundPosition: bg.bgPos,
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated',
            borderRadius: '4px',
          }}
        >
          {/* Target buttons overlay */}
          {(mode === 'target_attack' || mode === 'target_skill') && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 rounded">
              {aliveEnemies.map(e => (
                <button
                  key={e.uid}
                  onClick={() => handleSelectTarget(e)}
                  className="flex flex-col items-center bg-red-700/90 border-2 border-red-300 rounded-lg px-3 py-2 hover:bg-red-600 active:scale-95 transition shadow-xl"
                >
                  <span className="text-white font-black text-xs">{e.name}</span>
                  <div className="w-16 mt-1"><HpBar hp={e.hp} maxHp={e.maxHp} color="red" /></div>
                  <span className="text-yellow-300 text-[10px] font-black mt-0.5">▲ 選択</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Enemy HP labels below sprites */}
        {mode === 'select' && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-4">
            {enemies.map(e => (
              <div key={e.uid} className={`flex flex-col items-center ${e.hp <= 0 ? 'opacity-20' : ''}`} style={{ minWidth: '72px' }}>
                <div className="w-18" style={{ width: '72px' }}><HpBar hp={e.hp} maxHp={e.maxHp} color="red" /></div>
                <span className="text-[9px] font-black" style={{ color: '#fff', textShadow: '0 1px 3px #000, 0 0 6px #000' }}>
                  {e.name} {e.hp}/{e.maxHp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== MESSAGE BOX ===== */}
      <div className="mx-2 mt-1 shrink-0">
        <div className="border-2 rounded-lg px-3 py-2"
          style={{ backgroundColor: '#080f38', borderColor: '#3050c8', boxShadow: 'inset 0 0 16px rgba(60,80,200,0.2)', minHeight: '60px' }}>
          {latestLog ? (
            <div>
              <div className="text-sm font-black text-white leading-snug">▶ {latestLog.text}</div>
              {recentLogs.slice(0, -1).map((log, i) => (
                <div key={i} className="text-xs text-gray-500 leading-snug mt-0.5 ml-3">{log.text}</div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600">…</div>
          )}
          {!isPlayerTurn && !isOver && (
            <div className="text-xs text-blue-400 mt-1 animate-pulse">
              {currentActor ? `${currentActor.name}のターン...` : '処理中...'}
            </div>
          )}
          {isPlayerTurn && mode === 'select' && <div className="text-xs text-yellow-300 mt-1 font-bold">▼ コマンドを選択</div>}
          {mode === 'target_attack' && <div className="text-xs text-yellow-300 mt-1 font-bold">⚔️ 攻撃する敵を選んでください</div>}
          {mode === 'target_skill' && <div className="text-xs text-yellow-300 mt-1 font-bold">✨ {pendingSkill?.name}の対象を選択</div>}
          {mode === 'target_item' && <div className="text-xs text-yellow-300 mt-1 font-bold">🧪 使用対象を選択してください</div>}
        </div>
      </div>

      {/* ===== ALLY TARGET SELECTION ===== */}
      {(mode === 'target_item' || (mode === 'target_skill' && pendingSkill?.target === 'ally_one')) && (
        <div className="mx-2 mt-1 flex gap-2 shrink-0">
          {allies.filter(a => a.hp > 0).map(a => (
            <button key={a.uid} onClick={() => handleSelectTarget(a)}
              className="flex-1 flex flex-col items-center bg-green-900 border-2 border-green-500 rounded-lg py-2 hover:bg-green-800 active:scale-95 transition">
              <span className="text-2xl">{a.emoji}</span>
              <span className="text-xs font-black text-white">{a.name}</span>
              <div className="w-14 mt-0.5"><HpBar hp={a.hp} maxHp={a.maxHp} color="green" /></div>
              <span className="text-[10px] text-green-300">HP {a.hp}/{a.maxHp}</span>
            </button>
          ))}
          <button onClick={cancelTarget} className="px-3 text-xs text-gray-400 border border-gray-700 rounded-lg">← もどる</button>
        </div>
      )}

      {/* ===== COMMAND AREA ===== */}
      {!isOver && (
        <div className="mx-2 mt-1 shrink-0">

          {/* Main command grid */}
          {isPlayerTurn && mode === 'select' && (
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'こうげき', icon: '⚔️', bg: 'bg-[#8a1515] hover:bg-[#aa2020] border-[#dd3030]',
                  action: () => aliveEnemies.length === 1 ? onAttack(aliveEnemies[0].uid) : setMode('target_attack') },
                { label: 'スキル', icon: '✨', bg: 'bg-[#2a1060] hover:bg-[#3a1880] border-[#7030e0]',
                  action: () => setMode('skill') },
                { label: 'どうぐ', icon: '🧪',
                  bg: availableItems.length === 0
                    ? 'bg-gray-900 border-gray-700 opacity-40 cursor-not-allowed'
                    : 'bg-[#0e3a18] hover:bg-[#186028] border-[#30b040]',
                  action: () => availableItems.length > 0 && setMode('item') },
                { label: 'にげる', icon: '💨',
                  bg: b.isBoss ? 'bg-gray-900 border-gray-700 opacity-40 cursor-not-allowed' : 'bg-[#1a1a2a] hover:bg-[#252540] border-[#505070]',
                  action: () => !b.isBoss && onFlee() },
              ].map(btn => (
                <button key={btn.label} onClick={btn.action}
                  className={`flex flex-col items-center justify-center py-3 border-2 rounded-xl transition active:scale-95 ${btn.bg}`}>
                  <span className="text-2xl leading-none">{btn.icon}</span>
                  <span className="text-xs font-black text-white mt-1">{btn.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Skill list */}
          {mode === 'skill' && (
            <div className="bg-[#080f38] border-2 border-[#3050c8] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-white">✨ スキルを選択</span>
                <button onClick={cancelTarget} className="text-xs text-gray-400 border border-gray-700 px-2 py-0.5 rounded">← もどる</button>
              </div>
              <div className="flex flex-col gap-1.5">
                {(playerUnit?.skills ?? []).map(skill => {
                  const ok = (playerUnit?.mp ?? 0) >= skill.mpCost
                  return (
                    <button key={skill.id} disabled={!ok} onClick={() => handleSkillSelect(skill)}
                      className={`text-left px-3 py-2 rounded-lg border-2 transition ${ok ? 'border-purple-700 bg-purple-950 hover:bg-purple-900 text-white active:scale-95' : 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed'}`}>
                      <div className="flex justify-between">
                        <span className="font-black text-sm">{skill.name}</span>
                        <span className="text-blue-400 text-xs font-bold">MP {skill.mpCost}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{skill.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Item list */}
          {mode === 'item' && (
            <div className="bg-[#080f38] border-2 border-[#3050c8] rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-white">🧪 どうぐを選択</span>
                <button onClick={cancelTarget} className="text-xs text-gray-400 border border-gray-700 px-2 py-0.5 rounded">← もどる</button>
              </div>
              <div className="flex flex-col gap-1.5">
                {availableItems.map(({ itemId, qty }) => {
                  const item = ITEMS[itemId]
                  if (!item) return null
                  return (
                    <button key={itemId}
                      onClick={() => { if (['heal_hp','heal_mp','heal_both','cure_status'].includes(item.effect)) { setPendingItemId(itemId); setMode('target_item') } }}
                      className="text-left px-3 py-2 rounded-lg border-2 border-green-800 bg-green-950 hover:bg-green-900 text-white transition active:scale-95">
                      <div className="flex justify-between">
                        <span className="font-black text-sm">{item.emoji} {item.name}</span>
                        <span className="text-xs text-gray-400">x{qty}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Back button for target modes */}
          {(mode === 'target_attack' || (mode === 'target_skill' && pendingSkill?.target !== 'ally_one') || mode === 'target_item') && mode !== 'target_item' && (
            <button onClick={cancelTarget}
              className="mt-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 px-4 py-1.5 rounded-lg w-full">
              ← もどる
            </button>
          )}

          {/* Waiting */}
          {!isPlayerTurn && !isOver && mode === 'select' && (
            <div className="text-center text-sm text-gray-500 py-3 font-bold">
              {currentActor ? `${currentActor.name} のターン...` : '処理中...'}
            </div>
          )}
        </div>
      )}

      {/* ===== VICTORY / DEFEAT ===== */}
      {isOver && (
        <div className={`mx-2 mt-2 rounded-xl p-5 text-center border-2 ${b.phase === 'victory' ? 'bg-amber-950 border-amber-500' : 'bg-red-950 border-red-700'}`}>
          <div className="text-3xl font-black mb-2">{b.phase === 'victory' ? '🎉 VICTORY！' : '💀 DEFEAT...'}</div>
          {b.phase === 'victory' && (
            <div className="text-sm text-gray-300 mb-3 font-bold">
              EXP +{b.rewardExp} / Gold +{b.rewardGold}G
              {b.sealStoneFound && <div className="text-amber-300 font-black mt-1">💎 封印石を入手！</div>}
            </div>
          )}
          <button onClick={onClose}
            className={`px-8 py-2.5 rounded-xl font-black border-2 transition active:scale-95 ${b.phase === 'victory' ? 'bg-amber-700 hover:bg-amber-600 border-amber-500 text-white' : 'bg-red-900 hover:bg-red-800 border-red-600 text-white'}`}>
            {b.phase === 'victory' ? '続ける ▶' : 'ゲームオーバーへ'}
          </button>
        </div>
      )}

      {/* bottom spacer */}
      <div className="h-4 shrink-0" />
    </div>
  )
}
