'use client'

import { useState, useEffect, useRef } from 'react'
import type { GameState, BattleUnit, Skill, CompanionId } from '@/lib/game/types'
import { ITEMS, COMPANIONS, getExpToNext, LOCATIONS } from '@/lib/game/data'
import { CharPortrait } from './CharPortrait'

interface Props {
  gs: GameState
  onAttack: (targetUid: string) => void
  onSkill: (skill: Skill, targetUid?: string) => void
  onItem: (itemId: string, targetUid: string) => void
  onFlee: () => void
  onClose: () => void
}

type ActionMode = 'select' | 'skill' | 'item' | 'target_attack' | 'target_skill' | 'target_item'


// ===== 敵絵文字マッピング =====
const ENEMY_EMOJI_MAP: [string, string][] = [
  ['goblin', '👺'], ['wolf', '🐺'], ['bandit', '🗡️'], ['skeleton', '💀'],
  ['zombie', '🧟'], ['orc', '👹'], ['slime', '🫧'], ['bat', '🦇'],
  ['spider', '🕷️'], ['snake', '🐍'], ['dragon', '🐉'], ['wyvern', '🐉'],
  ['ghost', '👻'], ['golem', '🗿'], ['demon', '😈'], ['dark', '🌑'],
  ['fire', '🔥'], ['ice', '❄️'], ['thunder', '⚡'], ['poison', '☠️'],
  ['knight', '🛡️'], ['witch', '🧙'], ['mage', '🔮'], ['archer', '🏹'],
  ['troll', '👹'], ['undead', '💀'], ['wyrm', '🐉'], ['archive', '👁️'],
  ['ruler', '🌑'], ['king', '👑'], ['lord', '👑'],
]

function getEnemyEmoji(uid: string, name: string): string {
  const key = (uid + ' ' + name).toLowerCase()
  for (const [pattern, emoji] of ENEMY_EMOJI_MAP) {
    if (key.includes(pattern)) return emoji
  }
  return '👾'
}

function EnemyDisplay({ enemies, isBoss, isTargetingEnemies, onSelectTarget, hitUnits, healUnits, floatingNums }: {
  enemies: BattleUnit[]
  isBoss: boolean
  isTargetingEnemies: boolean
  onSelectTarget: (e: BattleUnit) => void
  hitUnits: Set<string>
  healUnits: Set<string>
  floatingNums: { uid: string; val: string; color: string; id: number }[]
}) {
  const isLarge = isBoss || enemies.length === 1
  const fontSize = isBoss ? '6rem' : isLarge ? '4.5rem' : enemies.length <= 2 ? '3.5rem' : '2.5rem'

  return (
    <div className="absolute right-1 top-1" style={{ width: 'calc(58% - 4px)', bottom: 4, zIndex: 5 }}>
      <div className="flex flex-col items-center justify-center h-full gap-2">
        {enemies.map(e => {
          const dead = e.hp <= 0
          const emoji = e.emoji || getEnemyEmoji(e.uid, e.name)
          const hpPct = Math.max(0, (e.hp / e.maxHp) * 100)
          const hpFill = hpPct > 50 ? '#4ade80' : hpPct > 25 ? '#facc15' : '#ef4444'
          const isHit = hitUnits.has(e.uid)
          const isHeal = healUnits.has(e.uid)
          const myFloats = floatingNums.filter(f => f.uid === e.uid)

          return (
            <div key={e.uid} className={`flex flex-col items-center gap-0.5 ${dead ? 'opacity-15' : ''}`}>
              <button
                onClick={() => isTargetingEnemies && !dead && onSelectTarget(e)}
                disabled={!isTargetingEnemies || dead}
                className={`relative flex items-center justify-center ${
                  isTargetingEnemies && !dead
                    ? 'cursor-pointer'
                    : 'cursor-default'
                }`}
                style={{
                  background: isHit ? 'rgba(239,68,68,0.35)' : isHeal ? 'rgba(74,222,128,0.25)' : 'transparent',
                  borderRadius: 0,
                }}
              >
                <span style={{ fontSize, lineHeight: 1, display: 'block' }}>{emoji}</span>
                {/* フローティングダメージ/ヒール数字 */}
                {myFloats.map(f => (
                  <span
                    key={f.id}
                    className="absolute font-black pointer-events-none"
                    style={{
                      color: f.color,
                      fontSize: isBoss ? 22 : 16,
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      animation: 'floatUp 0.9s ease-out forwards',
                      zIndex: 20,
                    }}
                  >{f.val}</span>
                ))}
                {isTargetingEnemies && !dead && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-300 font-black text-lg">▼</span>
                )}
                {isBoss && !dead && (
                  <span className="absolute -top-2 -right-2 text-xs font-black text-red-400">💀</span>
                )}
              </button>
              {/* 敵名 + 状態異常のみ（PP4仕様：敵HPは非表示）*/}
              <div style={{ width: isLarge ? 96 : 68 }}>
                <div className="text-center mt-0.5">
                  <span className="font-black" style={{ fontSize: 9, color: isBoss ? '#fca5a5' : '#d1d5db' }}>
                    {dead ? '---' : e.name}
                  </span>
                </div>
                {e.statusEffects.length > 0 && (
                  <div className="flex justify-center gap-0.5 mt-0.5 flex-wrap">
                    {e.statusEffects.map(ef => (
                      <span key={ef.id} style={{ fontSize: 9, background: '#0a0a0a', border: '1px solid #333344', borderRadius: 0, padding: '0 2px', display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                        {statusIcon(ef.id)}<span style={{ color: '#d1d5db', fontSize: 8 }}>{ef.turnsLeft}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function statusIcon(id: string): string {
  switch (id) {
    case 'poison': return '☠️'
    case 'stun': return '💫'
    case 'atk_up': return '⬆️'
    case 'def_up': return '🛡️'
    case 'atk_down': return '⬇️'
    default: return ''
  }
}

function logColor(type: string): string {
  switch (type) {
    case 'damage': return '#fca5a5'
    case 'critical': return '#fde047'
    case 'heal': return '#86efac'
    case 'death': return '#f87171'
    case 'status': return '#93c5fd'
    case 'system': return '#fcd34d'
    default: return '#ffffff'
  }
}

function HpBar({ hp, maxHp, color = 'green' }: { hp: number; maxHp: number; color?: 'green' | 'blue' }) {
  const pct = Math.max(0, (hp / maxHp) * 100)
  const fill = color === 'blue' ? 'bg-blue-400'
    : pct > 50 ? 'bg-green-400' : pct > 25 ? 'bg-yellow-400' : 'bg-red-500'
  return (
    <div className="w-full h-2 bg-[#0a0a0a] border border-gray-700 overflow-hidden">
      <div className={`h-full transition-all duration-300 ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function BattleScene({ gs, onAttack, onSkill, onItem, onFlee, onClose }: Props) {
  const b = gs.battle!
  const [mode, setMode] = useState<ActionMode>('select')
  const [pendingSkill, setPendingSkill] = useState<Skill | null>(null)
  const [pendingItemId, setPendingItemId] = useState<string | null>(null)
  const [critFlash, setCritFlash] = useState(false)
  const [critText, setCritText] = useState(false)
  const [deathFlash, setDeathFlash] = useState(false)
  const [spellCast, setSpellCast] = useState<{ label: string; color: string } | null>(null)
  const [deadCompanion, setDeadCompanion] = useState<{ id: CompanionId; lastWord: string } | null>(null)
  const [showBossIntro, setShowBossIntro] = useState(b.isBoss && b.turn <= 1)
  const [hitUnits, setHitUnits] = useState<Set<string>>(new Set())
  const [healUnits, setHealUnits] = useState<Set<string>>(new Set())
  const [floatingNums, setFloatingNums] = useState<{ uid: string; val: string; color: string; id: number }[]>([])
  const floatIdRef = useRef(0)
  const prevLogLen = useRef(0)
  const prevAllyHp = useRef<Record<string, number>>({})

  useEffect(() => {
    if (b.logs.length > prevLogLen.current) {
      const newLogs = b.logs.slice(prevLogLen.current)
      if (newLogs.some(l => l.type === 'critical')) {
        setCritFlash(true)
        setCritText(true)
        setTimeout(() => setCritFlash(false), 350)
        setTimeout(() => setCritText(false), 700)
      }
      // ヒット/ヒールエフェクト
      const newHit = new Set<string>()
      const newHeal = new Set<string>()
      const newFloats: { uid: string; val: string; color: string; id: number }[] = []
      for (const log of newLogs) {
        if (log.type === 'damage' || log.type === 'critical') {
          const match = log.text.match(/(\d+)ダメージ/)
          const target = b.units.find(u => log.text.includes(u.name))
          if (target) {
            newHit.add(target.uid)
            if (match) newFloats.push({ uid: target.uid, val: `-${match[1]}`, color: log.type === 'critical' ? '#fbbf24' : '#ef4444', id: floatIdRef.current++ })
          }
        } else if (log.type === 'heal') {
          const match = log.text.match(/(\d+)回復/)
          const target = b.units.find(u => log.text.includes(u.name))
          if (target) {
            newHeal.add(target.uid)
            if (match) newFloats.push({ uid: target.uid, val: `+${match[1]}`, color: '#4ade80', id: floatIdRef.current++ })
          }
        }
      }
      if (newHit.size > 0) {
        setHitUnits(newHit)
        setTimeout(() => setHitUnits(new Set()), 300)
      }
      if (newHeal.size > 0) {
        setHealUnits(newHeal)
        setTimeout(() => setHealUnits(new Set()), 400)
      }
      if (newFloats.length > 0) {
        setFloatingNums(prev => [...prev, ...newFloats])
        setTimeout(() => setFloatingNums(prev => prev.filter(n => !newFloats.some(nf => nf.id === n.id))), 900)
      }
      // スキル発動演出
      const skillLog = newLogs.find(l => l.type === 'status' && l.text.includes('を使った'))
      if (skillLog) {
        const SPELL_COLORS: [string, { label: string; color: string }][] = [
          ['炎', { label: '🔥 FIRE！', color: '#ff6030' }],
          ['火', { label: '🔥 BLAZE！', color: '#ff5020' }],
          ['雷', { label: '⚡ THUNDER！', color: '#ffe050' }],
          ['光', { label: '✨ HOLY！', color: '#ffffb0' }],
          ['聖', { label: '✨ HOLY！', color: '#ffe0ff' }],
          ['癒し', { label: '💚 HEAL！', color: '#60ff90' }],
          ['回復', { label: '💚 CURE！', color: '#50ff80' }],
          ['毒', { label: '☠️ POISON！', color: '#a040ff' }],
          ['氷', { label: '❄️ ICE！', color: '#80e8ff' }],
          ['嵐', { label: '🌪️ STORM！', color: '#80b0ff' }],
          ['斬', { label: '⚔️ SLASH！', color: '#ffe0a0' }],
          ['波', { label: '💫 WAVE！', color: '#60d0ff' }],
        ]
        const matched = SPELL_COLORS.find(([key]) => skillLog.text.includes(key))
        if (matched) {
          setSpellCast(matched[1])
          setTimeout(() => setSpellCast(null), 600)
        }
      }
      if (newLogs.some(l => l.type === 'death')) {
        setDeathFlash(true)
        setTimeout(() => setDeathFlash(false), 400)
        // Detect companion death for overlay
        for (const unit of b.units.filter(u => u.isAlly && u.companionId && !u.isPlayer)) {
          const prev = prevAllyHp.current[unit.uid] ?? unit.maxHp
          if (prev > 0 && unit.hp <= 0) {
            const lastWordLog = newLogs.find(l => l.type === 'system' && l.text.includes(unit.name))
            const lastWord = lastWordLog?.text.match(/「(.+)」/)?.[1] ?? '……'
            setDeadCompanion({ id: unit.companionId as CompanionId, lastWord })
            setTimeout(() => setDeadCompanion(null), 4000)
          }
        }
      }
    }
    // Track ally HP
    for (const unit of b.units.filter(u => u.isAlly && u.companionId)) {
      prevAllyHp.current[unit.uid] = unit.hp
    }
    prevLogLen.current = b.logs.length
  }, [b.logs.length])

  const allies = b.units.filter(u => u.isAlly)
  const enemies = b.units.filter(u => !u.isAlly)
  const currentActor = b.units.find(u => u.uid === b.currentUid)
  const isPlayerTurn = currentActor?.isPlayer && b.phase === 'select_action'
  const playerUnit = b.units.find(u => u.isPlayer)!
  const aliveEnemies = enemies.filter(u => u.hp > 0)
  const availableItems = gs.inventory.filter(i => i.qty > 0)
  const latestLog = b.logs[b.logs.length - 1]
  const prevLogs = b.logs.slice(-3, -1)
  const isOver = b.phase === 'victory' || b.phase === 'defeat'
  const playerDanger = playerUnit.hp > 0 && playerUnit.hp / playerUnit.maxHp <= 0.15

  const isTargetingEnemies = mode === 'target_attack' || (mode === 'target_skill' && pendingSkill?.target === 'enemy_one')

  function handleSelectTarget(unit: BattleUnit) {
    if (mode === 'target_attack') { onAttack(unit.uid); setMode('select') }
    else if (mode === 'target_skill' && pendingSkill) { onSkill(pendingSkill, unit.uid); setPendingSkill(null); setMode('select') }
    else if (mode === 'target_item' && pendingItemId) { onItem(pendingItemId, unit.uid); setPendingItemId(null); setMode('select') }
  }

  function handleSkillSelect(skill: Skill) {
    if (['enemy_all', 'ally_all', 'self'].includes(skill.target)) { onSkill(skill); setMode('select') }
    else if (skill.target === 'enemy_one') {
      if (aliveEnemies.length === 1) { onSkill(skill, aliveEnemies[0].uid); setMode('select') }
      else { setPendingSkill(skill); setMode('target_skill') }
    }
    else { setPendingSkill(skill); setMode('target_skill') }
  }

  const cancelTarget = () => { setMode('select'); setPendingSkill(null); setPendingItemId(null) }

  function handleAutoAction() {
    if (!isPlayerTurn) return
    // Priority 1: heal self if HP < 30%
    if (playerUnit.hp / playerUnit.maxHp < 0.30) {
      const healItem = availableItems.find(({ itemId }) => {
        const item = ITEMS[itemId]
        return item && ['heal_hp', 'heal_both'].includes(item.effect)
      })
      if (healItem) { onItem(healItem.itemId, playerUnit.uid); return }
      const selfHeal = (playerUnit.skills ?? []).find(sk =>
        sk.target === 'self' && playerUnit.mp >= sk.mpCost && sk.effect === 'heal'
      )
      if (selfHeal) { onSkill(selfHeal, playerUnit.uid); return }
    }
    // Priority 2: attack skill if MP comfortable and enemies remain
    const totalEnemyHpPct = aliveEnemies.length > 0
      ? aliveEnemies.reduce((s, e) => s + e.hp, 0) / aliveEnemies.reduce((s, e) => s + e.maxHp, 0)
      : 0
    const atkSkill = (playerUnit.skills ?? []).find(sk =>
      (sk.target === 'enemy_one' || sk.target === 'enemy_all') &&
      playerUnit.mp >= sk.mpCost * 2 // keep at least 1 more use in reserve
    )
    if (atkSkill && (aliveEnemies.length >= 2 || totalEnemyHpPct > 0.60)) {
      if (atkSkill.target === 'enemy_all') { onSkill(atkSkill); return }
      const weakest = aliveEnemies.reduce((a, b) => b.hp < a.hp ? b : a)
      onSkill(atkSkill, weakest.uid)
      return
    }
    // Priority 3: basic attack on weakest enemy
    if (aliveEnemies.length > 0) {
      const weakest = aliveEnemies.reduce((a, b) => b.hp < a.hp ? b : a)
      onAttack(weakest.uid)
    }
  }

  return (
    <div className="bg-[#07071a] flex flex-col min-h-screen">

      {/* ボスバトル開始演出 */}
      {showBossIntro && (() => {
        const boss = b.units.find(u => u.isBoss)
        if (!boss) return null
        const openingLine = b.logs.find(l => l.type === 'system' && l.text.includes('「'))?.text ?? ''
        return (
          <div
            className="fixed inset-0 z-[95] flex items-center justify-center cursor-pointer"
            style={{ background: '#040008' }}
            onClick={() => setShowBossIntro(false)}
          >
            <div className="relative max-w-xs mx-4 border-2 border-red-700" style={{ background: '#07010a' }}>
              <div className="border-b border-red-900 px-4 py-2 flex items-center gap-3" style={{ background: '#150000' }}>
                <span className="text-2xl">{boss.emoji}</span>
                <div>
                  <div className="text-xs font-black text-red-600 tracking-widest">⚠ BOSS BATTLE</div>
                  <div className="text-base font-black text-white">{boss.name}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-[10px] text-orange-400 font-black">ATK {boss.atk}</div>
                  <div className="text-[10px] text-blue-400 font-black">DEF {boss.def}</div>
                </div>
              </div>
              {openingLine && (
                <div className="px-4 py-3 border-b border-red-900">
                  <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-red-800 pl-3">
                    「{openingLine}」
                  </p>
                </div>
              )}
              <div className="px-4 py-2 text-center">
                <div className="text-[10px] text-gray-700">▶ タップして戦闘開始</div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 仲間死亡追悼オーバーレイ */}
      {deadCompanion && (() => {
        const def = COMPANIONS[deadCompanion.id]
        if (!def) return null
        return (
          <div className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none">
            <div className="bg-[#0a0a10] absolute inset-0" />
            <div className="relative z-10 border-2 border-gray-700 bg-[#0a0a20] max-w-xs mx-4">
              <div className="border-b border-gray-700 px-4 py-2 flex items-center gap-2" style={{ background: '#0a0a0e' }}>
                <span className="text-xs font-black text-gray-600 tracking-widest">— FALLEN HERO —</span>
                <span className="ml-auto text-xs text-red-500 font-black">💀 永眠</span>
              </div>
              <div className="px-4 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl grayscale opacity-60">{def.emoji}</span>
                  <div>
                    <div className="text-base font-black text-gray-400 line-through">{def.name}</div>
                    <div className="text-xs text-gray-600">{def.cls}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400 leading-relaxed border-l-2 border-gray-700 pl-3">
                  「{deadCompanion.lastWord}」
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ===== ステータスバー（上部）===== */}
      <div className="flex items-stretch bg-[#12123a] border-b-2 border-[#2848c0] px-2 py-1 shrink-0 gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs font-black px-2 py-0.5 border ${
            b.isBoss
              ? 'border-red-500 bg-red-950 text-red-300'
              : 'border-yellow-700 bg-yellow-950 text-yellow-400'
          }`}>
            {b.isBoss ? '👑BOSS' : `T${b.turn}`}
          </span>
          {b.bossRaged && (
            <span className="text-xs font-black px-2 py-0.5 border border-red-600 bg-red-950 text-red-400 animate-pulse">
              💢激怒
            </span>
          )}
          {playerDanger && (
            <span className="text-xs font-black px-2 py-0.5 border border-red-500 bg-red-950 text-red-300 animate-pulse">
              ⚠️危機
            </span>
          )}
          {b.isBoss && enemies.find(e => e.isBoss && e.hp > 0 && e.hp <= e.maxHp * 0.3) && (
            <span className="text-xs font-black px-2 py-0.5 border border-orange-500 bg-orange-950 text-orange-300 animate-pulse">
              🌋瀕死
            </span>
          )}
          <span className={`text-xs font-bold px-2 py-0.5 border ${
            isPlayerTurn
              ? 'border-green-600 bg-green-950 text-green-300'
              : 'border-slate-700 bg-slate-950 text-slate-400'
          }`}>
            {isPlayerTurn ? '▶ あなたのターン' : `⏳ ${currentActor?.name ?? ''}のターン`}
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-0.5 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black text-green-300 w-4">HP</span>
            <HpBar hp={playerUnit.hp} maxHp={playerUnit.maxHp} />
            <span className="text-[9px] text-white w-16 text-right shrink-0">{playerUnit.hp}/{playerUnit.maxHp}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black text-blue-300 w-4">MP</span>
            <HpBar hp={playerUnit.mp} maxHp={playerUnit.maxMp} color="blue" />
            <span className="text-[9px] text-blue-200 w-16 text-right shrink-0">{playerUnit.mp}/{playerUnit.maxMp}</span>
          </div>
          {playerUnit.statusEffects.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {playerUnit.statusEffects.map(e => (
                <span key={e.id} className="text-[9px] bg-slate-900 border border-slate-700 px-1 leading-tight" style={{ color: e.id === 'poison' ? '#f87171' : e.id === 'stun' ? '#fde047' : e.id === 'atk_down' ? '#fca5a5' : '#86efac' }}>
                  {statusIcon(e.id)}{e.turnsLeft}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== バトルフィールド ===== */}
      <div className="relative shrink-0" style={{ height: '256px' }}>
        {/* クリティカル・死亡フラッシュ */}
        {critFlash && (
          <div className="absolute inset-0 z-50 pointer-events-none" style={{ background: 'rgba(255,230,0,0.18)', transition: 'opacity 0.35s' }} />
        )}
        {critText && (
          <div className="absolute inset-x-0 top-1/3 z-50 pointer-events-none flex justify-center">
            <div className="text-2xl font-black text-yellow-300 px-3 py-1"
              style={{ animation: 'fadeIn 0.1s ease, fadeOut 0.4s ease 0.3s forwards' }}>
              ✦ CRITICAL! ✦
            </div>
          </div>
        )}
        {spellCast && (
          <div className="absolute inset-x-0 top-2/5 z-50 pointer-events-none flex justify-center" style={{ top: '40%' }}>
            <div className="text-xl font-black px-3 py-1"
              style={{ color: spellCast.color, animation: 'fadeIn 0.1s ease, fadeOut 0.35s ease 0.25s forwards' }}>
              {spellCast.label}
            </div>
          </div>
        )}
        {deathFlash && (
          <div className="absolute inset-0 z-50 pointer-events-none" style={{ background: 'rgba(180,0,0,0.2)', transition: 'opacity 0.4s' }} />
        )}

        {/* バトル背景（場所タイプ別）*/}
        {(() => {
          const locType = LOCATIONS[gs.currentLocId]?.type ?? 'relay'
          const isDungeon = !b.isBoss && locType === 'dungeon'
          const bg = b.isBoss
            ? 'linear-gradient(to bottom, #1a0a2e 0%, #2d1060 48%, #3a0a20 48%, #1a0508 80%, #0d0305 100%)'
            : isDungeon
            ? 'linear-gradient(to bottom, #0a0a14 0%, #141428 45%, #1e1e0a 45%, #14140a 80%, #0a0a08 100%)'
            : 'linear-gradient(to bottom, #4a9ed8 0%, #7ac8ee 50%, #62b830 50%, #2e8a18 74%, #1a5a08 100%)'
          return <div className="absolute inset-0" style={{ background: bg }} />
        })()}
        {/* 雲 (野外通常戦闘 — フラット矩形でGBAピクセル風) */}
        {!b.isBoss && LOCATIONS[gs.currentLocId]?.type !== 'dungeon' && (
          <>
            <div className="absolute" style={{ top: 8, left: 20, width: 80, height: 10, background: '#c8e4f4' }} />
            <div className="absolute" style={{ top: 4, right: 48, width: 104, height: 10, background: '#b8daf0' }} />
            <div className="absolute" style={{ top: 16, right: 16, width: 56, height: 8, background: '#a8d0ec' }} />
            <div className="absolute" style={{ top: 28, left: 120, width: 48, height: 8, background: '#98c8e8' }} />
          </>
        )}

        {/* 左エリア: プレイヤー + 仲間スプライト */}
        <div className="absolute left-2 bottom-3 flex flex-col-reverse gap-1 items-start" style={{ zIndex: 10, maxWidth: '40%' }}>
          {/* プレイヤースプライト */}
          <div className="flex flex-col items-center gap-0.5 relative">
            <div style={{ position: 'relative' }}>
              <CharPortrait charId="player" size={92} isActive={currentActor?.isPlayer} isDead={playerUnit.hp <= 0} rounded={0} />
              {/* プレイヤーヒットフラッシュ */}
              {hitUnits.has(playerUnit.uid) && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: 0, background: 'rgba(239,68,68,0.45)', pointerEvents: 'none' }} />
              )}
              {healUnits.has(playerUnit.uid) && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: 0, background: 'rgba(74,222,128,0.3)', pointerEvents: 'none' }} />
              )}
              {/* プレイヤーフローティングダメージ数字 */}
              {floatingNums.filter(f => f.uid === playerUnit.uid).map(f => (
                <span key={f.id} className="absolute font-black pointer-events-none"
                  style={{ color: f.color, fontSize: 16, top: '-20px', left: '50%', transform: 'translateX(-50%)', animation: 'floatUp 0.9s ease-out forwards', zIndex: 20 }}>
                  {f.val}
                </span>
              ))}
            </div>
            <div style={{ width: 92 }}><HpBar hp={playerUnit.hp} maxHp={playerUnit.maxHp} /></div>
          </div>
          {/* 仲間スプライト */}
          {allies.filter(a => !a.isPlayer).map(a => {
            const charId = a.companionId ?? 'gares'
            const statusIcons = a.statusEffects.map(e =>
              e.id === 'poison' ? '☠️' : e.id === 'stun' ? '💫' : e.id === 'atk_up' ? '⬆️' : e.id === 'def_up' ? '🛡️' : e.id === 'atk_down' ? '⬇️' : ''
            ).filter(Boolean)
            const isHit = hitUnits.has(a.uid)
            const isHeal = healUnits.has(a.uid)
            const myFloats = floatingNums.filter(f => f.uid === a.uid)
            return (
              <div key={a.uid} className="flex items-center gap-1.5">
                {/* 仲間ポートレート（ヒットエフェクト付き）*/}
                <div style={{ position: 'relative' }}>
                  <CharPortrait charId={charId} size={62} isActive={a.uid === b.currentUid} isDead={a.hp <= 0} rounded={0} />
                  {isHit && (
                    <div style={{ position: 'absolute', inset: 0, borderRadius: 0, background: 'rgba(239,68,68,0.45)', pointerEvents: 'none' }} />
                  )}
                  {isHeal && (
                    <div style={{ position: 'absolute', inset: 0, borderRadius: 0, background: 'rgba(74,222,128,0.3)', pointerEvents: 'none' }} />
                  )}
                  {myFloats.map(f => (
                    <span key={f.id} className="absolute font-black pointer-events-none"
                      style={{ color: f.color, fontSize: 13, top: '-18px', left: '50%', transform: 'translateX(-50%)', animation: 'floatUp 0.9s ease-out forwards', zIndex: 20 }}>
                      {f.val}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-0.5" style={{ width: 60 }}>
                  <HpBar hp={a.hp} maxHp={a.maxHp} />
                  <div className="flex items-center justify-between gap-0.5">
                    <span className="text-[9px] text-white font-bold leading-none truncate">
                      {a.name}
                    </span>
                    {statusIcons.map((ic, i) => <span key={i} style={{ fontSize: 9 }}>{ic}</span>)}
                  </div>
                  <span className="text-[9px] font-bold leading-none" style={{ color: a.hp / a.maxHp > 0.5 ? '#4ade80' : a.hp / a.maxHp > 0.25 ? '#facc15' : '#ef4444' }}>
                    {a.hp <= 0 ? '---' : `HP ${a.hp}/${a.maxHp}`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* 右エリア: 敵（絵文字ベース）*/}
        <EnemyDisplay
          enemies={enemies}
          isBoss={b.isBoss}
          isTargetingEnemies={isTargetingEnemies}
          onSelectTarget={handleSelectTarget}
          hitUnits={hitUnits}
          healUnits={healUnits}
          floatingNums={floatingNums}
        />
      </div>

      {/* ===== 味方ターゲット選択（アイテム/回復スキル用）===== */}
      {(mode === 'target_item' || (mode === 'target_skill' && pendingSkill?.target === 'ally_one')) && (
        <div className="mx-2 mt-1 flex gap-1.5">
          {allies.filter(a => a.hp > 0).map(a => (
            <button key={a.uid} onClick={() => handleSelectTarget(a)}
              className="flex-1 flex items-center gap-2 bg-green-900 border-2 border-green-500 p-2 hover:bg-green-800">
              <CharPortrait charId={a.companionId ?? (a.isPlayer ? 'player' : 'gares')} size={40} />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-black text-white block truncate">{a.name}</span>
                <div className="w-full mt-0.5"><HpBar hp={a.hp} maxHp={a.maxHp} /></div>
                <span className="text-[9px] text-green-300">{a.hp}/{a.maxHp}</span>
              </div>
            </button>
          ))}
          <button onClick={cancelTarget} className="px-3 text-xs text-gray-400 border border-gray-700 shrink-0">← もどる</button>
        </div>
      )}

      {/* ===== メッセージボックス（パワポケ4スタイル：濃紺・下部）===== */}
      <div className="mx-2 mt-1.5 shrink-0">
        <div className="border-2 px-3 py-2"
          style={{
            backgroundColor: '#080f38',
            borderColor: b.bossRaged ? '#dc2626' : '#1a2860',
            minHeight: '62px',
          }}>
          {latestLog ? (
            <>
              <div className="text-sm font-black leading-snug" style={{ color: logColor(latestLog.type) }}>▶ {latestLog.text}</div>
              {b.logs.slice(-5, -1).reverse().map((log, i) => (
                <div key={i} className="text-xs leading-snug mt-0.5 ml-3" style={{ color: '#4b5563' }}>{log.text}</div>
              ))}
            </>
          ) : (
            <div className="text-sm text-gray-600">…</div>
          )}
          {isPlayerTurn && mode === 'select' && !playerUnit.statusEffects.some(e => e.id === 'stun') && (
            <div className="text-xs text-yellow-300 mt-1 font-bold">▼ コマンドを選択</div>
          )}
          {isPlayerTurn && playerUnit.statusEffects.some(e => e.id === 'stun') && (
            <div className="text-xs text-yellow-600 mt-1 font-bold">💫 スタン中 — 自動スキップ待機中...</div>
          )}
          {!isPlayerTurn && !isOver && (
            <div className="text-xs text-blue-400 mt-1">
              {currentActor ? `${currentActor.name} のターン...` : '処理中...'}
            </div>
          )}
        </div>
      </div>

      {/* ===== コマンド ===== */}
      {!isOver && (
        <div className="mx-2 mt-1.5 mb-3">

          {isPlayerTurn && mode === 'select' && !playerUnit.statusEffects.some(e => e.id === 'stun') && (
            <div className="border border-[#1a2860] overflow-hidden" style={{ background: '#08102a', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              {[
                {
                  label: 'こうげき', icon: '⚔',
                  color: '#fca5a5',
                  action: () => aliveEnemies.length === 1 ? onAttack(aliveEnemies[0].uid) : setMode('target_attack'),
                  disabled: false,
                },
                {
                  label: 'スキル', icon: '✦',
                  color: '#c4b5fd',
                  action: () => setMode('skill'),
                  disabled: false,
                },
                {
                  label: 'どうぐ', icon: '◎',
                  color: availableItems.length === 0 ? '#374151' : '#86efac',
                  action: () => availableItems.length > 0 && setMode('item'),
                  disabled: availableItems.length === 0,
                },
                {
                  label: b.isBoss ? 'にげる' : '逃走',
                  icon: '→',
                  color: b.isBoss ? '#374151' : '#94a3b8',
                  action: () => !b.isBoss && onFlee(),
                  disabled: b.isBoss,
                },
              ].map((btn, i) => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  disabled={btn.disabled}
                  className={`flex items-center gap-2.5 px-4 py-3 text-left hover:bg-[#0d1848] ${
                    i % 2 === 0 ? 'border-r border-[#1a2860]' : ''
                  } ${i < 2 ? 'border-b border-[#1a2860]' : ''}`}
                >
                  <span className="text-sm font-black w-4 text-center leading-none shrink-0" style={{ color: btn.color }}>{btn.icon}</span>
                  <span className="text-sm font-black" style={{ color: btn.disabled ? '#4b5563' : '#e2e8f0' }}>{btn.label}</span>
                </button>
              ))}
            </div>
          )}

          {mode === 'skill' && (
            <div className="border border-[#1a2860]" style={{ background: '#08102a' }}>
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a2860]">
                <span className="text-xs font-black text-indigo-400 tracking-wider">スキルを選択</span>
                <button onClick={cancelTarget} className="text-xs text-gray-500 hover:text-gray-300 px-2">← もどる</button>
              </div>
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                {(playerUnit?.skills ?? []).map(skill => {
                  const ok = (playerUnit?.mp ?? 0) >= skill.mpCost
                  const targetLabel = skill.target === 'enemy_all' ? '全敵' : skill.target === 'ally_all' ? '全味方' : skill.target === 'self' ? '自分' : '1体'
                  // 予想ダメージ/回復量を計算
                  const estimate = (() => {
                    if (skill.effect === 'damage' || skill.effect === 'boss_bonus') {
                      const avgEnemyDef = aliveEnemies.length > 0
                        ? aliveEnemies.reduce((s, e) => s + e.def, 0) / aliveEnemies.length
                        : 0
                      const est = Math.max(1, Math.floor(playerUnit.atk * skill.power - avgEnemyDef / 2))
                      return { label: `~${est}`, color: '#fca5a5' }
                    }
                    if (skill.effect === 'heal') {
                      const est = Math.min(skill.power, playerUnit.maxHp - playerUnit.hp)
                      return { label: `+${est}HP`, color: '#86efac' }
                    }
                    return null
                  })()
                  return (
                    <button key={skill.id} disabled={!ok} onClick={() => handleSkillSelect(skill)}
                      className={`text-left px-3 py-2.5 border-b border-[#1a2860] last:border-b-0 flex items-center gap-2 ${
                        ok
                          ? 'hover:bg-[#0d1848] text-white'
                          : 'text-gray-600 cursor-not-allowed'
                      }`}>
                      <span className="text-xs font-black w-3 shrink-0" style={{ color: ok ? '#818cf8' : 'transparent' }}>▶</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-sm">{skill.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {estimate && (
                              <span className="text-[9px] font-black" style={{ color: estimate.color }}>{estimate.label}</span>
                            )}
                            <span className="text-gray-600 text-[9px]">{targetLabel}</span>
                            <span className={`text-xs font-bold ${ok ? 'text-blue-400' : 'text-red-600'}`}>
                              MP {skill.mpCost}
                            </span>
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{skill.desc}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {mode === 'item' && (
            <div className="border border-[#1a2860] overflow-hidden" style={{ background: '#08102a' }}>
              <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a2860]">
                <span className="text-xs font-black text-green-500 tracking-wider">どうぐを選択</span>
                <button onClick={cancelTarget} className="text-xs text-gray-500 hover:text-gray-300 px-2">← もどる</button>
              </div>
              <div className="flex flex-col max-h-36 overflow-y-auto">
                {availableItems.map(({ itemId, qty }) => {
                  const item = ITEMS[itemId]
                  if (!item) return null
                  return (
                    <button key={itemId}
                      onClick={() => {
                        if (['heal_hp', 'heal_mp', 'heal_both', 'cure_status'].includes(item.effect)) {
                          setPendingItemId(itemId)
                          setMode('target_item')
                        }
                      }}
                      className="text-left px-3 py-2.5 border-b border-[#1a2860] last:border-b-0 flex items-center gap-2 hover:bg-[#0d1848] text-white">
                      <span className="text-xs font-black text-green-400 w-3">▶</span>
                      <span className="font-black text-sm flex-1">{item.emoji} {item.name}</span>
                      <span className="text-xs text-gray-500">×{qty}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {isPlayerTurn && mode === 'select' && !playerUnit.statusEffects.some(e => e.id === 'stun') && (
            <button
              onClick={handleAutoAction}
              className="w-full mt-1 py-1.5 border-t border-[#1a2860] text-xs font-black text-slate-500 hover:text-slate-300 hover:bg-[#0d1040] tracking-wider"
              style={{ background: '#08102a' }}
            >
              ⚡ オート（AI最適行動）
            </button>
          )}

          {(mode === 'target_attack' || mode === 'target_skill') && pendingSkill?.target !== 'ally_one' && (
            <div className="flex flex-col items-center gap-1.5 mt-1">
              <div className="text-xs font-black text-yellow-400 tracking-wide">
                {mode === 'target_attack' ? '⚔️ 攻撃する敵をタップ' : `✨ ${pendingSkill?.name} — 対象をタップ`}
              </div>
              <button onClick={cancelTarget} className="text-xs text-gray-400 hover:text-white border border-gray-700 px-4 py-1.5 w-full">
                ← もどる
              </button>
            </div>
          )}

          {!isPlayerTurn && !isOver && mode === 'select' && (
            <div className="text-center text-sm text-gray-500 py-3">
              {currentActor ? `${currentActor.name} のターン...` : '処理中...'}
            </div>
          )}
        </div>
      )}

      {/* ===== 勝利 / 敗北 ===== */}
      {isOver && (
        <div className={`mx-2 mt-2 mb-3 border-2 overflow-hidden ${
          b.phase === 'victory'
            ? b.isBoss ? 'bg-amber-950 border-amber-400' : 'bg-amber-950 border-amber-600'
            : 'bg-red-950 border-red-700'
        }`}
         
        >
          {/* ボス勝利ヘッダー */}
          {b.phase === 'victory' && b.isBoss && (
            <div className="bg-amber-950 border-b border-amber-700 px-4 py-2 text-center">
              <div className="text-xs font-black text-amber-300 tracking-widest">👑 BOSS DEFEATED 👑</div>
            </div>
          )}

          <div className="p-5 text-center">
            <div className={`font-black mb-2 ${b.phase === 'victory' ? 'text-3xl' : 'text-2xl text-red-400'}`}
             >
              {b.phase === 'victory' ? '🎉 VICTORY！' : '💀 DEFEAT...'}
            </div>

            {b.phase === 'victory' && (
              <div className="space-y-1.5 mb-4">
                {/* EXP・Gold・ターン数 */}
                <div className="flex justify-center gap-4 text-base font-black">
                  <span className="text-purple-300">EXP +{b.rewardExp}</span>
                  <span className="text-amber-300">+{b.rewardGold}G</span>
                  <span className="text-gray-500 text-xs self-center">{b.turn}ターン</span>
                </div>
                {/* EXPバー + レベルアップまで */}
                {gs.playerLevel < 30 && (() => {
                  const expToNext = getExpToNext(gs.playerLevel)
                  const expPct = Math.min(100, (gs.playerExp / expToNext) * 100)
                  const remaining = expToNext - gs.playerExp
                  const isClose = remaining <= b.rewardExp * 2
                  return (
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center gap-2 w-full justify-center">
                        <div className="w-32 h-2 bg-gray-900 border border-gray-700 overflow-hidden">
                          <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${expPct}%` }} />
                        </div>
                        <span className="text-[10px] text-purple-400 font-bold">Lv{gs.playerLevel}</span>
                      </div>
                      {isClose && (
                        <span className="text-[10px] text-yellow-400 font-black">あと{remaining}EXP でレベルアップ！</span>
                      )}
                    </div>
                  )
                })()}
                {/* 生存HP率 */}
                {(() => {
                  const hpPct = Math.round(playerUnit.hp / playerUnit.maxHp * 100)
                  const color = hpPct > 60 ? 'text-green-400' : hpPct > 30 ? 'text-yellow-400' : 'text-red-400'
                  return (
                    <div className={`text-xs font-bold ${color}`}>
                      HP残{hpPct}%で生還
                    </div>
                  )
                })()}
                {/* 封印石 */}
                {b.sealStoneFound && (
                  <div className="bg-amber-900 border-2 border-amber-400 px-4 py-2 text-amber-200 font-black">
                    💎 封印石を入手！
                  </div>
                )}
                {/* レベルアップ */}
                {b.logs.filter(l => l.type === 'system' && l.text.includes('レベルアップ')).map((l, i) => (
                  <div key={i} className="text-yellow-300 font-black text-sm">⭐ {l.text.replace('⭐ ', '')}</div>
                ))}
                {/* 仲間の勝利セリフ（バトルログから取得） */}
                {(() => {
                  const companionLog = b.logs.slice().reverse().find(l => l.type === 'system' && /「.+」/.test(l.text) && !l.text.startsWith('👹'))
                  if (companionLog) return (
                    <div className="text-xs text-gray-300 bg-slate-900 border border-slate-700 px-3 py-1.5">{companionLog.text}</div>
                  )
                  const alive = allies.filter(a => !a.isPlayer && a.hp > 0)
                  if (alive.length === 0) return null
                  const speaker = alive[b.turn % alive.length]
                  return <div className="text-xs text-gray-400">「次も頼んだぞ。」—— {speaker.name}</div>
                })()}
                {/* 死亡した仲間 */}
                {allies.filter(a => !a.isPlayer && a.hp <= 0).map(a => (
                  <div key={a.uid} className="text-red-400 font-bold text-xs">💔 {a.name} は力尽きた……</div>
                ))}
              </div>
            )}

            {b.phase === 'defeat' && (
              <p className="text-red-300 text-sm mb-3 font-bold">力尽きてしまった……</p>
            )}

            <button
              onClick={onClose}
              className={`px-10 py-3 font-black border-2 text-lg ${
                b.phase === 'victory'
                  ? b.isBoss
                    ? 'bg-amber-600 hover:bg-amber-500 border-amber-300 text-white'
                    : 'bg-amber-700 hover:bg-amber-600 border-amber-500 text-white'
                  : 'bg-red-900 hover:bg-red-800 border-red-600 text-white'
              }`}
            >
              {b.phase === 'victory' ? '続ける ▶' : 'ゲームオーバーへ'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
