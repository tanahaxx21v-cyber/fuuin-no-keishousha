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

// Enemy image crop: which section of the sprite sheet to show
type EnemyImgConfig = {
  file: 'enemies1' | 'enemies2'
  // Clip the image using a container with overflow:hidden
  // imgLeft/imgTop move the image within the container (negative = shift left/up)
  imgLeft: string
  imgTop: string
  imgWidth: string  // width of img element (>100% = zoom in)
}

function getEnemyImageConfig(locId: LocationId, isBoss: boolean): EnemyImgConfig {
  if (isBoss && (locId === 'desert_ruins' || locId === 'dragon_pass')) {
    // ラスボスエリア (bottom section of enemies1)
    return { file: 'enemies1', imgLeft: '-10%', imgTop: '-160%', imgWidth: '120%' }
  }
  switch (locId) {
    case 'demon_mine':
    case 'dragon_pass':
      // 山岳エリア enemies — top-left of enemies1
      return { file: 'enemies1', imgLeft: '0%', imgTop: '0%', imgWidth: '195%' }
    case 'desert_ruins':
      // 砂漠エリア enemies — top-right of enemies1
      return { file: 'enemies1', imgLeft: '-100%', imgTop: '0%', imgWidth: '200%' }
    case 'bandit_hideout':
      // 魔王軍 — right-center of enemies1
      return { file: 'enemies1', imgLeft: '-95%', imgTop: '-58%', imgWidth: '200%' }
    case 'ancient_temple':
    case 'forest_entrance':
      // 森エリア enemies
      return { file: 'enemies2', imgLeft: '0%', imgTop: '0%', imgWidth: '100%' }
    default:
      // 河川エリア / その他 — left-center of enemies1
      return { file: 'enemies1', imgLeft: '0%', imgTop: '-52%', imgWidth: '195%' }
  }
}

function HpBar({ hp, maxHp, color = 'green' }: { hp: number; maxHp: number; color?: 'green' | 'red' | 'blue' }) {
  const pct = Math.max(0, (hp / maxHp) * 100)
  const fill = color === 'red'
    ? (pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-400' : 'bg-red-500')
    : color === 'blue' ? 'bg-blue-400'
    : (pct > 50 ? 'bg-green-400' : pct > 25 ? 'bg-yellow-400' : 'bg-red-500')
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
  const recentLogs = b.logs.slice(-4)
  const isOver = b.phase === 'victory' || b.phase === 'defeat'
  const latestLog = b.logs[b.logs.length - 1]

  const imgCfg = getEnemyImageConfig(gs.currentLocId, b.isBoss)
  const imgSrc = `/fuuin-no-keishousha/images/${imgCfg.file}.jpg`

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
    <div className="flex flex-col min-h-screen bg-[#07071a]">

      {/* ===== TOP STATUS BAR (パワポケ風) ===== */}
      <div className="flex items-stretch gap-1 bg-[#1a1a3a] border-b-2 border-[#3a3a6a] px-2 py-1.5 shrink-0">
        {/* Turn / boss indicator */}
        <div className="flex items-center gap-1 mr-2">
          <span className="text-[10px] font-black text-yellow-300 bg-yellow-950/60 border border-yellow-700 px-1.5 py-0.5 rounded">
            {b.isBoss ? '👑BOSS' : `T${b.turn}`}
          </span>
        </div>

        {/* Player HP/MP */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[9px] font-black text-green-300 w-3">HP</span>
            <HpBar hp={playerUnit.hp} maxHp={playerUnit.maxHp} color="red" />
            <span className="text-[9px] text-white w-12 text-right">{playerUnit.hp}/{playerUnit.maxHp}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black text-blue-300 w-3">MP</span>
            <HpBar hp={playerUnit.mp} maxHp={playerUnit.maxMp} color="blue" />
            <span className="text-[9px] text-blue-200 w-12 text-right">{playerUnit.mp}/{playerUnit.maxMp}</span>
          </div>
        </div>

        {/* Ally compact status */}
        {allies.filter(a => !a.isPlayer).map(a => (
          <div key={a.uid} className="flex flex-col items-center justify-center px-1.5 border-l border-white/10">
            <span className="text-base leading-none">{a.emoji}</span>
            <div className="w-10 mt-0.5">
              <HpBar hp={a.hp} maxHp={a.maxHp} color="red" />
            </div>
            <span className="text-[8px] text-gray-400">{a.hp}</span>
          </div>
        ))}
      </div>

      {/* ===== BATTLE FIELD ===== */}
      <div className="relative shrink-0" style={{ height: '220px' }}>

        {/* Sky background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, #87ceeb 0%, #b0e0ff 55%, #c8f0a0 55%, #5aaa30 75%, #3d8020 100%)',
          }}
        />

        {/* Clouds */}
        <div className="absolute top-2 left-8 w-16 h-5 bg-white/80 rounded-full blur-sm" />
        <div className="absolute top-4 left-16 w-10 h-4 bg-white/60 rounded-full blur-sm" />
        <div className="absolute top-1 right-12 w-20 h-5 bg-white/70 rounded-full blur-sm" />

        {/* Enemy sprite sheet display */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '10px', width: '85%', maxWidth: '400px', height: '150px', overflow: 'hidden', borderRadius: '4px' }}>
          <img
            src={imgSrc}
            alt="enemies"
            style={{
              position: 'absolute',
              left: imgCfg.imgLeft,
              top: imgCfg.imgTop,
              width: imgCfg.imgWidth,
              imageRendering: 'pixelated',
              objectFit: 'none',
            }}
          />
          {/* Target overlay buttons for enemies */}
          {(mode === 'target_attack' || mode === 'target_skill') && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/20">
              {aliveEnemies.map(e => (
                <button
                  key={e.uid}
                  onClick={() => handleSelectTarget(e)}
                  className="flex flex-col items-center bg-red-600/80 border-2 border-red-300 rounded-lg px-3 py-2 hover:bg-red-500/80 active:scale-95 transition shadow-lg"
                >
                  <span className="text-white font-black text-xs">{e.name}</span>
                  <div className="w-16 mt-1">
                    <HpBar hp={e.hp} maxHp={e.maxHp} color="red" />
                  </div>
                  <span className="text-[10px] text-red-200">{e.hp}/{e.maxHp}</span>
                  <span className="text-[10px] text-yellow-300 font-black">▲ 選択</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Enemy names + HP below sprites */}
        {mode === 'select' && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
            {enemies.map(e => (
              <div key={e.uid} className={`flex flex-col items-center ${e.hp <= 0 ? 'opacity-20' : ''}`}>
                <div className="w-16">
                  <HpBar hp={e.hp} maxHp={e.maxHp} color="red" />
                </div>
                <span className="text-[9px] text-white font-black drop-shadow" style={{ textShadow: '1px 1px 0 #000' }}>
                  {e.name} {e.hp}/{e.maxHp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== MESSAGE BOX (パワポケ風: dark blue border) ===== */}
      <div className="mx-2 mt-1 shrink-0">
        <div
          className="border-2 rounded-lg px-3 py-2 min-h-[60px]"
          style={{
            backgroundColor: '#0a1040',
            borderColor: '#4060d0',
            boxShadow: 'inset 0 0 12px rgba(80,100,220,0.25)',
          }}
        >
          {latestLog ? (
            <div>
              <div className="text-sm font-black text-white leading-snug">
                ▶ {latestLog.text}
              </div>
              {recentLogs.slice(1, 3).map((log, i) => (
                <div key={i} className="text-xs text-gray-400 opacity-60 leading-snug mt-0.5">
                  　{log.text}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">…</div>
          )}
          {!isPlayerTurn && !isOver && (
            <div className="text-xs text-blue-300 mt-1 animate-pulse">
              {currentActor ? `${currentActor.name}のターン...` : '処理中...'}
            </div>
          )}
          {isPlayerTurn && mode === 'select' && (
            <div className="text-xs text-yellow-300 mt-1 font-bold">▼ コマンドを選択</div>
          )}
          {(mode === 'target_attack' || mode === 'target_skill' || mode === 'target_item') && (
            <div className="text-xs text-yellow-300 mt-1 font-bold">
              {mode === 'target_attack' ? '⚔️ 攻撃対象を選択してください'
               : mode === 'target_item' ? '🧪 使用対象を選択してください'
               : `✨ ${pendingSkill?.name}の対象を選択`}
            </div>
          )}
        </div>
      </div>

      {/* ===== ALLY TARGET SELECTION ===== */}
      {mode === 'target_item' || (mode === 'target_skill' && pendingSkill?.target === 'ally_one') ? (
        <div className="mx-2 mt-1 flex gap-2 shrink-0">
          {allies.filter(a => a.hp > 0).map(a => (
            <button
              key={a.uid}
              onClick={() => handleSelectTarget(a)}
              className="flex-1 flex flex-col items-center bg-green-900 border-2 border-green-500 rounded-lg py-2 hover:bg-green-800 active:scale-95 transition"
            >
              <span className="text-2xl">{a.emoji}</span>
              <span className="text-xs font-black text-white">{a.name}</span>
              <div className="w-14 mt-0.5"><HpBar hp={a.hp} maxHp={a.maxHp} color="red" /></div>
              <span className="text-[10px] text-green-300">HP {a.hp}/{a.maxHp}</span>
            </button>
          ))}
        </div>
      ) : null}

      {/* ===== COMMAND WINDOW ===== */}
      <div className="mx-2 mt-1 mb-2 flex-1 flex flex-col justify-end">

        {!isOver && isPlayerTurn && mode === 'select' && (
          <div className="grid grid-cols-4 gap-1">
            {[
              {
                label: 'こうげき', icon: '⚔️',
                color: 'bg-[#a02020] hover:bg-[#c02020] border-[#ff4040]',
                action: () => aliveEnemies.length === 1 ? onAttack(aliveEnemies[0].uid) : setMode('target_attack'),
              },
              {
                label: 'スキル', icon: '✨',
                color: 'bg-[#301860] hover:bg-[#401880] border-[#8040ff]',
                action: () => setMode('skill'),
              },
              {
                label: 'どうぐ', icon: '🧪',
                color: availableItems.length === 0
                  ? 'bg-gray-900 border-gray-700 opacity-40 cursor-not-allowed'
                  : 'bg-[#104820] hover:bg-[#186030] border-[#30c040]',
                action: () => availableItems.length > 0 && setMode('item'),
              },
              {
                label: 'にげる', icon: '💨',
                color: b.isBoss
                  ? 'bg-gray-900 border-gray-700 opacity-40 cursor-not-allowed'
                  : 'bg-[#202030] hover:bg-[#303050] border-[#606080]',
                action: () => !b.isBoss && onFlee(),
              },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={btn.action}
                className={`flex flex-col items-center justify-center py-2.5 border-2 rounded-lg transition active:scale-95 ${btn.color}`}
              >
                <span className="text-lg leading-none">{btn.icon}</span>
                <span className="text-[10px] font-black text-white mt-0.5">{btn.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Skill list */}
        {mode === 'skill' && (
          <div className="bg-[#0a1040] border-2 border-[#4060d0] rounded-lg p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-white">✨ スキル</span>
              <button onClick={() => setMode('select')} className="text-[10px] text-gray-400 border border-gray-700 px-2 py-0.5 rounded">← もどる</button>
            </div>
            <div className="flex flex-col gap-1">
              {(playerUnit?.skills ?? []).map(skill => {
                const canUse = (playerUnit?.mp ?? 0) >= skill.mpCost
                return (
                  <button
                    key={skill.id}
                    disabled={!canUse}
                    onClick={() => handleSkillSelect(skill)}
                    className={`text-left px-2 py-1.5 rounded border-2 transition text-sm ${
                      canUse
                        ? 'border-purple-700 bg-purple-950 hover:bg-purple-900 text-white active:scale-95'
                        : 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-black">{skill.name}</span>
                      <span className="text-blue-400 text-xs">MP {skill.mpCost}</span>
                    </div>
                    <div className="text-xs text-gray-400">{skill.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Item list */}
        {mode === 'item' && (
          <div className="bg-[#0a1040] border-2 border-[#4060d0] rounded-lg p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-white">🧪 どうぐ</span>
              <button onClick={() => setMode('select')} className="text-[10px] text-gray-400 border border-gray-700 px-2 py-0.5 rounded">← もどる</button>
            </div>
            <div className="flex flex-col gap-1">
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
                    className="text-left px-2 py-1.5 rounded border-2 border-green-800 bg-green-950 hover:bg-green-900 text-white transition active:scale-95 text-sm"
                  >
                    <div className="flex justify-between">
                      <span className="font-black">{item.emoji} {item.name}</span>
                      <span className="text-xs text-gray-400">x{qty}</span>
                    </div>
                    <div className="text-xs text-gray-400">{item.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Back button while targeting */}
        {(mode === 'target_attack' || mode === 'target_skill' || mode === 'target_item') && (
          <button
            onClick={() => { setMode('select'); setPendingSkill(null); setPendingItemId(null) }}
            className="mt-1 text-xs text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg"
          >
            ← もどる
          </button>
        )}
      </div>

      {/* ===== VICTORY / DEFEAT ===== */}
      {isOver && (
        <div className={`mx-2 mb-3 rounded-xl p-4 text-center border-2 ${
          b.phase === 'victory'
            ? 'bg-amber-950 border-amber-500 shadow-xl shadow-amber-900/40'
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
