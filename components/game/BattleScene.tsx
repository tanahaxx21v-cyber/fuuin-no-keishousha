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

// characters.jpg: 7 columns × 2 rows grid
// bgPos formula: X = (col/6)*100 %, Y = row*100 %
const CHAR_GRID: Record<string, { col: number; row: number }> = {
  player: { col: 0, row: 0 },
  gares:  { col: 1, row: 0 },
  liz:    { col: 2, row: 0 },
  noa:    { col: 3, row: 0 },
  cecil:  { col: 4, row: 0 },
  bram:   { col: 5, row: 0 },
  finn:   { col: 6, row: 0 },
  vais:   { col: 0, row: 1 },
  logan:  { col: 1, row: 1 },
  iris:   { col: 2, row: 1 },
  sig:    { col: 3, row: 1 },
  elk:    { col: 4, row: 1 },
  mira:   { col: 5, row: 1 },
  zeno:   { col: 6, row: 1 },
}

function CharPortrait({ charId, size, isActive = false, isDead = false }: {
  charId: string; size: number; isActive?: boolean; isDead?: boolean
}) {
  const pos = CHAR_GRID[charId] ?? { col: 0, row: 0 }
  const bgPosX = `${(pos.col / 6) * 100}%`
  const bgPosY = `${pos.row * 100}%`
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundImage: "url('/fuuin-no-keishousha/images/characters.jpg')",
        backgroundSize: '700% 200%',
        backgroundPosition: `${bgPosX} ${bgPosY}`,
        imageRendering: 'pixelated',
        borderRadius: '4px',
        border: isActive ? '2px solid #ffdd00' : '2px solid rgba(255,255,255,0.2)',
        opacity: isDead ? 0.3 : 1,
        filter: isDead ? 'grayscale(100%)' : 'none',
        flexShrink: 0,
      }}
    />
  )
}

// Enemy sprite sheet crop using CSS background
type EnemyBg = { file: 'enemies1' | 'enemies2'; bgSize: string; bgPos: string }
function getEnemyBg(locId: LocationId, isBoss: boolean): EnemyBg {
  if (isBoss && locId === 'desert_ruins') return { file: 'enemies1', bgSize: '200% auto', bgPos: '100% 100%' }
  if (isBoss) return { file: 'enemies1', bgSize: '200% auto', bgPos: '0% 100%' }
  switch (locId) {
    case 'demon_mine':
    case 'dragon_pass':
      return { file: 'enemies1', bgSize: '200% auto', bgPos: '0% 8%' }
    case 'desert_ruins':
      return { file: 'enemies1', bgSize: '200% auto', bgPos: '100% 8%' }
    case 'bandit_hideout':
      return { file: 'enemies1', bgSize: '200% auto', bgPos: '100% 48%' }
    case 'ancient_temple':
    case 'forest_entrance':
      return { file: 'enemies2', bgSize: 'cover', bgPos: 'center' }
    default:
      return { file: 'enemies1', bgSize: '200% auto', bgPos: '0% 55%' }
  }
}

function HpBar({ hp, maxHp, color = 'green' }: { hp: number; maxHp: number; color?: 'green' | 'blue' }) {
  const pct = Math.max(0, (hp / maxHp) * 100)
  const fill = color === 'blue' ? 'bg-blue-400'
    : pct > 50 ? 'bg-green-400' : pct > 25 ? 'bg-yellow-400' : 'bg-red-500'
  return (
    <div className="w-full h-2 bg-black/50 border border-white/20 overflow-hidden rounded-sm">
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
  const prevLogs = b.logs.slice(-4, -1)
  const isOver = b.phase === 'victory' || b.phase === 'defeat'

  const bg = getEnemyBg(gs.currentLocId, b.isBoss)
  const imgSrc = `/fuuin-no-keishousha/images/${bg.file}.jpg`

  function handleSelectTarget(unit: BattleUnit) {
    if (mode === 'target_attack') { onAttack(unit.uid); setMode('select') }
    else if (mode === 'target_skill' && pendingSkill) { onSkill(pendingSkill, unit.uid); setPendingSkill(null); setMode('select') }
    else if (mode === 'target_item' && pendingItemId) { onItem(pendingItemId, unit.uid); setPendingItemId(null); setMode('select') }
  }

  function handleSkillSelect(skill: Skill) {
    if (['enemy_all', 'ally_all', 'self'].includes(skill.target)) { onSkill(skill); setMode('select') }
    else if (skill.target === 'enemy_one') { setPendingSkill(skill); setMode('target_skill') }
    else { setPendingSkill(skill); setMode('target_skill') }
  }

  const cancelTarget = () => { setMode('select'); setPendingSkill(null); setPendingItemId(null) }

  return (
    <div className="bg-[#07071a] flex flex-col">

      {/* ===== STATUS BAR ===== */}
      <div className="flex items-stretch bg-[#12123a] border-b-2 border-[#2a2a6a] px-2 py-1 shrink-0 gap-2">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-black px-2 py-0.5 rounded border ${b.isBoss ? 'border-red-500 bg-red-950 text-red-300' : 'border-yellow-700 bg-yellow-950 text-yellow-400'}`}>
            {b.isBoss ? '👑BOSS' : `T${b.turn}`}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${isPlayerTurn ? 'border-green-600 bg-green-950 text-green-300' : 'border-slate-700 bg-slate-950 text-slate-400'}`}>
            {isPlayerTurn ? '▶ あなたのターン' : '⏳ 待機中...'}
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-0.5">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black text-green-300 w-4">HP</span>
            <HpBar hp={playerUnit.hp} maxHp={playerUnit.maxHp} />
            <span className="text-[9px] text-white w-16 text-right">{playerUnit.hp}/{playerUnit.maxHp}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black text-blue-300 w-4">MP</span>
            <HpBar hp={playerUnit.mp} maxHp={playerUnit.maxMp} color="blue" />
            <span className="text-[9px] text-blue-200 w-16 text-right">{playerUnit.mp}/{playerUnit.maxMp}</span>
          </div>
        </div>
      </div>

      {/* ===== BATTLE FIELD ===== */}
      <div className="relative shrink-0" style={{ height: '220px' }}>

        {/* Sky + grass background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, #5ab4e8 0%, #90d0f0 52%, #70c840 52%, #3a9a20 72%, #287010 100%)',
        }} />
        <div className="absolute top-3 left-8 w-20 h-5 bg-white/70 rounded-full" style={{ filter: 'blur(4px)' }} />
        <div className="absolute top-1 right-16 w-28 h-5 bg-white/60 rounded-full" style={{ filter: 'blur(4px)' }} />

        {/* LEFT: Player + ally portraits */}
        <div className="absolute left-2 bottom-4 flex flex-col-reverse gap-1 items-start" style={{ zIndex: 10 }}>
          {/* Player character (largest) */}
          <div className="flex flex-col items-center">
            <CharPortrait
              charId="player"
              size={80}
              isActive={currentActor?.isPlayer}
              isDead={playerUnit.hp <= 0}
            />
            <div className="w-20 mt-0.5"><HpBar hp={playerUnit.hp} maxHp={playerUnit.maxHp} /></div>
          </div>
          {/* Allies */}
          {allies.filter(a => !a.isPlayer).map(a => {
            const charId = a.companionId ?? 'gares'
            return (
              <div key={a.uid} className="flex items-center gap-1">
                <CharPortrait
                  charId={charId}
                  size={52}
                  isActive={a.uid === b.currentUid}
                  isDead={a.hp <= 0}
                />
                <div className="flex flex-col gap-0.5" style={{ width: 44 }}>
                  <HpBar hp={a.hp} maxHp={a.maxHp} />
                  <span className="text-[8px] text-white font-bold" style={{ textShadow: '0 1px 2px #000' }}>{a.name}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* RIGHT: Enemy sprite sheet */}
        <div
          className="absolute right-2"
          style={{
            top: '8px',
            width: 'calc(60% - 8px)',
            height: '175px',
            backgroundImage: `url('${imgSrc}')`,
            backgroundSize: bg.bgSize,
            backgroundPosition: bg.bgPos,
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated',
            borderRadius: '4px',
            zIndex: 5,
          }}
        >
          {/* Target select overlay */}
          {(mode === 'target_attack' || (mode === 'target_skill' && pendingSkill?.target === 'enemy_one')) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/30 rounded">
              {aliveEnemies.map(e => (
                <button key={e.uid} onClick={() => handleSelectTarget(e)}
                  className="flex items-center gap-2 bg-red-800/90 border-2 border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-600 active:scale-95 transition shadow-xl w-4/5">
                  <span className="text-white font-black text-xs flex-1 text-left">{e.name}</span>
                  <div className="w-16"><HpBar hp={e.hp} maxHp={e.maxHp} /></div>
                  <span className="text-yellow-300 text-[10px] font-black">▲</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Enemy HP labels */}
        {mode === 'select' && (
          <div className="absolute right-2" style={{ bottom: '2px', width: 'calc(60% - 8px)' }}>
            <div className="flex flex-wrap justify-center gap-2">
              {enemies.map(e => (
                <div key={e.uid} className={`flex flex-col items-center ${e.hp <= 0 ? 'opacity-20' : ''}`} style={{ minWidth: 60 }}>
                  <div style={{ width: 60 }}><HpBar hp={e.hp} maxHp={e.maxHp} /></div>
                  <span className="text-[8px] font-black" style={{ color: '#fff', textShadow: '0 1px 3px #000,0 0 6px #000' }}>
                    {e.name} {e.hp}/{e.maxHp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== ALLY TARGET (for items/heal skills) ===== */}
      {(mode === 'target_item' || (mode === 'target_skill' && pendingSkill?.target === 'ally_one')) && (
        <div className="mx-2 mt-1 flex gap-2">
          {allies.filter(a => a.hp > 0).map(a => (
            <button key={a.uid} onClick={() => handleSelectTarget(a)}
              className="flex-1 flex items-center gap-2 bg-green-900 border-2 border-green-500 rounded-xl p-2 hover:bg-green-800 active:scale-95 transition">
              <CharPortrait charId={a.companionId ?? (a.isPlayer ? 'player' : 'gares')} size={40} />
              <div className="flex-1">
                <span className="text-xs font-black text-white block">{a.name}</span>
                <div className="w-full mt-0.5"><HpBar hp={a.hp} maxHp={a.maxHp} /></div>
                <span className="text-[9px] text-green-300">HP {a.hp}/{a.maxHp}</span>
              </div>
            </button>
          ))}
          <button onClick={cancelTarget} className="px-3 text-xs text-gray-400 border border-gray-700 rounded-xl">← もどる</button>
        </div>
      )}

      {/* ===== MESSAGE BOX ===== */}
      <div className="mx-2 mt-1 shrink-0">
        <div className="border-2 rounded-xl px-3 py-2"
          style={{ backgroundColor: '#080f38', borderColor: '#2848c0', boxShadow: 'inset 0 0 16px rgba(50,70,190,0.2)', minHeight: '56px' }}>
          {latestLog ? (
            <>
              <div className="text-sm font-black text-white leading-snug">▶ {latestLog.text}</div>
              {prevLogs.reverse().map((log, i) => (
                <div key={i} className="text-xs text-gray-500 leading-snug mt-0.5 ml-3">{log.text}</div>
              ))}
            </>
          ) : <div className="text-sm text-gray-600">…</div>}
          {isPlayerTurn && mode === 'select' && <div className="text-xs text-yellow-300 mt-1 font-bold">▼ コマンドを選択</div>}
          {!isPlayerTurn && !isOver && (
            <div className="text-xs text-blue-400 mt-1 animate-pulse">
              {currentActor ? `${currentActor.name}のターン...` : '処理中...'}
            </div>
          )}
        </div>
      </div>

      {/* ===== COMMANDS ===== */}
      {!isOver && (
        <div className="mx-2 mt-1.5 mb-3">

          {isPlayerTurn && mode === 'select' && (
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: 'こうげき', icon: '⚔️', bg: 'bg-[#8a1515] hover:bg-[#aa2020] border-[#dd3030]',
                  action: () => aliveEnemies.length === 1 ? onAttack(aliveEnemies[0].uid) : setMode('target_attack') },
                { label: 'スキル', icon: '✨', bg: 'bg-[#2a1060] hover:bg-[#3a1880] border-[#7030e0]',
                  action: () => setMode('skill') },
                { label: 'どうぐ', icon: '🧪',
                  bg: availableItems.length === 0 ? 'bg-gray-900 border-gray-700 opacity-40 cursor-not-allowed' : 'bg-[#0e3a18] hover:bg-[#186028] border-[#30b040]',
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

          {mode === 'skill' && (
            <div className="bg-[#080f38] border-2 border-[#2848c0] rounded-xl p-3">
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
                        <span className="text-blue-400 text-xs">MP {skill.mpCost}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{skill.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {mode === 'item' && (
            <div className="bg-[#080f38] border-2 border-[#2848c0] rounded-xl p-3">
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

          {(mode === 'target_attack' || mode === 'target_skill') && pendingSkill?.target !== 'ally_one' && (
            <button onClick={cancelTarget} className="mt-1 text-xs text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded-xl w-full">
              ← もどる
            </button>
          )}

          {!isPlayerTurn && !isOver && mode === 'select' && (
            <div className="text-center text-sm text-gray-500 py-3">
              {currentActor ? `${currentActor.name} のターン...` : '処理中...'}
            </div>
          )}
        </div>
      )}

      {/* ===== VICTORY / DEFEAT ===== */}
      {isOver && (
        <div className={`mx-2 mt-2 mb-3 rounded-xl p-5 text-center border-2 ${b.phase === 'victory' ? 'bg-amber-950 border-amber-500' : 'bg-red-950 border-red-700'}`}>
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
    </div>
  )
}
