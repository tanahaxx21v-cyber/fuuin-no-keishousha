'use client'

import { useState, useEffect, useRef } from 'react'
import type { GameState, BattleUnit, Skill, CompanionId } from '@/lib/game/types'
import { ITEMS, COMPANIONS } from '@/lib/game/data'
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

function EnemyDisplay({ enemies, isBoss, isTargetingEnemies, onSelectTarget }: {
  enemies: BattleUnit[]
  isBoss: boolean
  isTargetingEnemies: boolean
  onSelectTarget: (e: BattleUnit) => void
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

          return (
            <div key={e.uid} className={`flex flex-col items-center gap-0.5 transition-opacity ${dead ? 'opacity-15' : ''}`}>
              <button
                onClick={() => isTargetingEnemies && !dead && onSelectTarget(e)}
                disabled={!isTargetingEnemies || dead}
                className={`relative flex items-center justify-center transition-transform ${
                  isTargetingEnemies && !dead
                    ? 'cursor-pointer scale-110 animate-pulse'
                    : 'cursor-default'
                }`}
                style={{
                  filter: isBoss && !dead
                    ? 'drop-shadow(0 0 18px rgba(255,30,30,0.9)) drop-shadow(0 0 6px rgba(255,100,0,0.7))'
                    : isTargetingEnemies && !dead
                    ? 'drop-shadow(0 0 10px rgba(255,220,0,0.8))'
                    : 'drop-shadow(0 0 5px rgba(255,255,255,0.25))',
                }}
              >
                <span style={{ fontSize, lineHeight: 1 }}>{emoji}</span>
                {isTargetingEnemies && !dead && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-300 font-black text-lg animate-bounce">▼</span>
                )}
                {isBoss && !dead && (
                  <span className="absolute -top-2 -right-2 text-xs font-black text-red-400 animate-pulse">💀</span>
                )}
              </button>
              {/* HP bar + numbers + name + status */}
              <div style={{ width: isLarge ? 96 : 68 }}>
                <div className="w-full bg-black/70 border border-white/20 rounded-sm overflow-hidden" style={{ height: isBoss ? 5 : 3 }}>
                  <div className="h-full transition-all duration-300" style={{ width: `${hpPct}%`, backgroundColor: hpFill }} />
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <span className="font-black" style={{ fontSize: 9, color: isBoss ? '#fca5a5' : '#d1d5db', textShadow: '0 1px 3px #000' }}>
                    {e.name}
                  </span>
                  <span className="font-black" style={{ fontSize: 9, color: dead ? '#6b7280' : hpFill, textShadow: '0 1px 3px #000' }}>
                    {dead ? '---' : `${e.hp}/${e.maxHp}`}
                  </span>
                </div>
                {e.statusEffects.length > 0 && (
                  <div className="flex justify-center gap-0.5 mt-0.5">
                    {e.statusEffects.map(ef => (
                      <span key={ef.id} style={{ fontSize: 10 }}>{statusIcon(ef.id)}</span>
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
  const [critFlash, setCritFlash] = useState(false)
  const [deathFlash, setDeathFlash] = useState(false)
  const [deadCompanion, setDeadCompanion] = useState<{ id: CompanionId; lastWord: string } | null>(null)
  const prevLogLen = useRef(0)
  const prevAllyHp = useRef<Record<string, number>>({})

  useEffect(() => {
    if (b.logs.length > prevLogLen.current) {
      const newLogs = b.logs.slice(prevLogLen.current)
      if (newLogs.some(l => l.type === 'critical')) {
        setCritFlash(true)
        setTimeout(() => setCritFlash(false), 350)
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
    else if (skill.target === 'enemy_one') { setPendingSkill(skill); setMode('target_skill') }
    else { setPendingSkill(skill); setMode('target_skill') }
  }

  const cancelTarget = () => { setMode('select'); setPendingSkill(null); setPendingItemId(null) }

  return (
    <div className="bg-[#07071a] flex flex-col min-h-screen" style={playerDanger ? { boxShadow: 'inset 0 0 0 3px rgba(220,38,38,0.7)', animation: 'pulse 1s ease-in-out infinite' } : {}}>

      {/* 仲間死亡追悼オーバーレイ */}
      {deadCompanion && (() => {
        const def = COMPANIONS[deadCompanion.id]
        if (!def) return null
        return (
          <div className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none">
            <div className="bg-black/80 backdrop-blur-sm absolute inset-0" />
            <div className="relative z-10 text-center px-8 py-10 rounded-2xl border-2 border-gray-700 bg-[#0a0a20]/95 shadow-2xl max-w-xs mx-4"
              style={{ animation: 'fadeIn 0.4s ease' }}
            >
              <div className="text-xs font-black text-gray-500 tracking-widest mb-3">— FALLEN HERO —</div>
              <div className="text-8xl mb-3" style={{ filter: 'grayscale(0.6) drop-shadow(0 0 24px rgba(100,100,200,0.4))' }}>{def.emoji}</div>
              <div className="text-xl font-black text-white mb-0.5">{def.name}</div>
              <div className="text-xs text-gray-500 mb-4">{def.cls}</div>
              <div className="text-sm text-gray-300 italic leading-relaxed mb-5 border-l-2 border-gray-600 pl-3 text-left">
                「{deadCompanion.lastWord}」
              </div>
              <div className="text-2xl">💀</div>
              <div className="text-xs text-red-400 font-black mt-1">永眠</div>
            </div>
          </div>
        )
      })()}

      {/* ===== ステータスバー（上部）===== */}
      <div className="flex items-stretch bg-[#12123a] border-b-2 border-[#2848c0] px-2 py-1 shrink-0 gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs font-black px-2 py-0.5 rounded border ${
            b.isBoss
              ? 'border-red-500 bg-red-950 text-red-300'
              : 'border-yellow-700 bg-yellow-950 text-yellow-400'
          }`}>
            {b.isBoss ? '👑BOSS' : `T${b.turn}`}
          </span>
          {b.bossRaged && (
            <span className="text-xs font-black px-2 py-0.5 rounded border border-red-600 bg-red-950 text-red-400 animate-pulse">
              💢激怒
            </span>
          )}
          {playerDanger && (
            <span className="text-xs font-black px-2 py-0.5 rounded border border-red-500 bg-red-950 text-red-300 animate-pulse">
              ⚠️危機
            </span>
          )}
          {b.isBoss && enemies.find(e => e.isBoss && e.hp > 0 && e.hp <= e.maxHp * 0.3) && (
            <span className="text-xs font-black px-2 py-0.5 rounded border border-orange-500 bg-orange-950 text-orange-300 animate-pulse">
              🌋瀕死
            </span>
          )}
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
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
                <span key={e.id} className="text-[9px] bg-slate-900 border border-slate-700 rounded px-1 leading-tight" style={{ color: e.id === 'poison' ? '#f87171' : e.id === 'stun' ? '#fde047' : e.id === 'atk_down' ? '#fca5a5' : '#86efac' }}>
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
          <div className="absolute inset-0 z-50 pointer-events-none rounded" style={{ background: 'rgba(255,230,0,0.18)', transition: 'opacity 0.35s' }} />
        )}
        {deathFlash && (
          <div className="absolute inset-0 z-50 pointer-events-none rounded" style={{ background: 'rgba(180,0,0,0.2)', transition: 'opacity 0.4s' }} />
        )}

        {/* 空 + 草地の背景（パワポケ4スタイル）*/}
        <div className="absolute inset-0" style={{
          background: b.isBoss
            ? 'linear-gradient(to bottom, #1a0a2e 0%, #2d1060 48%, #3a0a20 48%, #1a0508 80%, #0d0305 100%)'
            : 'linear-gradient(to bottom, #4a9ed8 0%, #7ac8ee 50%, #62b830 50%, #2e8a18 74%, #1a5a08 100%)',
        }} />
        {/* 雲 (通常戦闘) */}
        {!b.isBoss && (
          <>
            <div className="absolute" style={{ top: 8, left: 20, width: 80, height: 20, background: 'rgba(255,255,255,0.7)', borderRadius: '50%', filter: 'blur(5px)' }} />
            <div className="absolute" style={{ top: 4, right: 48, width: 104, height: 20, background: 'rgba(255,255,255,0.55)', borderRadius: '50%', filter: 'blur(5px)' }} />
            <div className="absolute" style={{ top: 16, right: 16, width: 56, height: 14, background: 'rgba(255,255,255,0.45)', borderRadius: '50%', filter: 'blur(3px)' }} />
            <div className="absolute" style={{ top: 28, left: 120, width: 48, height: 12, background: 'rgba(255,255,255,0.35)', borderRadius: '50%', filter: 'blur(4px)' }} />
          </>
        )}
        {/* ボス戦: 赤黒い禍々しい雰囲気 */}
        {b.isBoss && (
          <>
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 70% 40%, rgba(180,20,20,0.25) 0%, transparent 70%)' }} />
            <div className="absolute" style={{ top: 8, right: 24, width: 120, height: 32, background: 'rgba(180,0,0,0.18)', borderRadius: '50%', filter: 'blur(12px)' }} />
            <div className="absolute" style={{ top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,0,0,0.015) 40px, rgba(255,0,0,0.015) 41px)', pointerEvents: 'none' }} />
          </>
        )}

        {/* 左エリア: プレイヤー + 仲間スプライト */}
        <div className="absolute left-2 bottom-3 flex flex-col-reverse gap-1 items-start" style={{ zIndex: 10, maxWidth: '40%' }}>
          <div className="flex flex-col items-center gap-0.5">
            <CharPortrait charId="player" size={92} isActive={currentActor?.isPlayer} isDead={playerUnit.hp <= 0} rounded={6} />
            <div style={{ width: 92 }}><HpBar hp={playerUnit.hp} maxHp={playerUnit.maxHp} /></div>
          </div>
          {allies.filter(a => !a.isPlayer).map(a => {
            const charId = a.companionId ?? 'gares'
            const statusIcons = a.statusEffects.map(e =>
              e.id === 'poison' ? '☠️' : e.id === 'stun' ? '💫' : e.id === 'atk_up' ? '⬆️' : e.id === 'def_up' ? '🛡️' : e.id === 'atk_down' ? '⬇️' : ''
            ).filter(Boolean)
            return (
              <div key={a.uid} className="flex items-center gap-1.5">
                <CharPortrait charId={charId} size={62} isActive={a.uid === b.currentUid} isDead={a.hp <= 0} rounded={4} />
                <div className="flex flex-col gap-0.5" style={{ width: 60 }}>
                  <HpBar hp={a.hp} maxHp={a.maxHp} />
                  <div className="flex items-center justify-between gap-0.5">
                    <span className="text-[9px] text-white font-bold leading-none truncate" style={{ textShadow: '0 1px 3px #000' }}>
                      {a.name}
                    </span>
                    {statusIcons.map((ic, i) => <span key={i} style={{ fontSize: 9 }}>{ic}</span>)}
                  </div>
                  <span className="text-[9px] font-bold leading-none" style={{ color: a.hp / a.maxHp > 0.5 ? '#4ade80' : a.hp / a.maxHp > 0.25 ? '#facc15' : '#ef4444', textShadow: '0 1px 3px #000' }}>
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
        />
      </div>

      {/* ===== 味方ターゲット選択（アイテム/回復スキル用）===== */}
      {(mode === 'target_item' || (mode === 'target_skill' && pendingSkill?.target === 'ally_one')) && (
        <div className="mx-2 mt-1 flex gap-1.5">
          {allies.filter(a => a.hp > 0).map(a => (
            <button key={a.uid} onClick={() => handleSelectTarget(a)}
              className="flex-1 flex items-center gap-2 bg-green-900/90 border-2 border-green-500 rounded-xl p-2 hover:bg-green-800 active:scale-95 transition">
              <CharPortrait charId={a.companionId ?? (a.isPlayer ? 'player' : 'gares')} size={40} />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-black text-white block truncate">{a.name}</span>
                <div className="w-full mt-0.5"><HpBar hp={a.hp} maxHp={a.maxHp} /></div>
                <span className="text-[9px] text-green-300">{a.hp}/{a.maxHp}</span>
              </div>
            </button>
          ))}
          <button onClick={cancelTarget} className="px-3 text-xs text-gray-400 border border-gray-700 rounded-xl shrink-0">← もどる</button>
        </div>
      )}

      {/* ===== メッセージボックス（パワポケ4スタイル：濃紺・下部）===== */}
      <div className="mx-2 mt-1.5 shrink-0">
        <div className="border-2 rounded-xl px-3 py-2"
          style={{
            backgroundColor: '#080f38',
            borderColor: b.bossRaged ? '#dc2626' : '#2848c0',
            boxShadow: b.bossRaged
              ? 'inset 0 0 18px rgba(220,38,38,0.15), 0 0 10px rgba(220,38,38,0.2)'
              : 'inset 0 0 18px rgba(50,70,190,0.2), 0 0 10px rgba(40,72,192,0.15)',
            minHeight: '62px',
          }}>
          {latestLog ? (
            <>
              <div className="text-sm font-black leading-snug" style={{ color: logColor(latestLog.type) }}>▶ {latestLog.text}</div>
              {b.logs.slice(-5, -1).reverse().map((log, i) => (
                <div key={i} className="text-xs leading-snug mt-0.5 ml-3" style={{ color: logColor(log.type), opacity: Math.max(0.35, 0.65 - i * 0.1) }}>{log.text}</div>
              ))}
            </>
          ) : (
            <div className="text-sm text-gray-600">…</div>
          )}
          {isPlayerTurn && mode === 'select' && (
            <div className="text-xs text-yellow-300 mt-1 font-bold animate-pulse">▼ コマンドを選択</div>
          )}
          {!isPlayerTurn && !isOver && (
            <div className="text-xs text-blue-400 mt-1 animate-pulse">
              {currentActor ? `${currentActor.name} のターン...` : '処理中...'}
            </div>
          )}
        </div>
      </div>

      {/* ===== コマンド ===== */}
      {!isOver && (
        <div className="mx-2 mt-1.5 mb-3">

          {isPlayerTurn && mode === 'select' && (
            <div className="grid grid-cols-4 gap-1.5">
              {[
                {
                  label: 'こうげき', icon: '⚔️',
                  bg: 'bg-[#8a1515] hover:bg-[#aa2020] border-[#dd3030]',
                  action: () => aliveEnemies.length === 1 ? onAttack(aliveEnemies[0].uid) : setMode('target_attack'),
                  disabled: false,
                },
                {
                  label: 'スキル', icon: '✨',
                  bg: 'bg-[#2a1060] hover:bg-[#3a1880] border-[#7030e0]',
                  action: () => setMode('skill'),
                  disabled: false,
                },
                {
                  label: 'どうぐ', icon: '🧪',
                  bg: availableItems.length === 0
                    ? 'bg-gray-900 border-gray-700 opacity-40 cursor-not-allowed'
                    : 'bg-[#0e3a18] hover:bg-[#186028] border-[#30b040]',
                  action: () => availableItems.length > 0 && setMode('item'),
                  disabled: availableItems.length === 0,
                },
                {
                  label: 'にげる', icon: '💨',
                  bg: b.isBoss
                    ? 'bg-gray-900 border-gray-700 opacity-40 cursor-not-allowed'
                    : 'bg-[#1a1a2a] hover:bg-[#252540] border-[#505070]',
                  action: () => !b.isBoss && onFlee(),
                  disabled: b.isBoss,
                },
              ].map(btn => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  disabled={btn.disabled}
                  className={`flex flex-col items-center justify-center py-3 border-2 rounded-xl transition active:scale-95 ${btn.bg}`}
                >
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
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                {(playerUnit?.skills ?? []).map(skill => {
                  const ok = (playerUnit?.mp ?? 0) >= skill.mpCost
                  const targetLabel = skill.target === 'enemy_all' ? '全敵' : skill.target === 'ally_all' ? '全味方' : skill.target === 'self' ? '自分' : '1体'
                  return (
                    <button key={skill.id} disabled={!ok} onClick={() => handleSkillSelect(skill)}
                      className={`text-left px-3 py-2 rounded-lg border-2 transition ${
                        ok
                          ? 'border-purple-700 bg-purple-950 hover:bg-purple-900 text-white active:scale-95'
                          : 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed'
                      }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-black text-sm">{skill.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500 text-[9px]">{targetLabel}</span>
                          <span className={`text-xs font-bold ${ok ? 'text-blue-400' : 'text-red-500'}`}>
                            MP {skill.mpCost}
                          </span>
                          {!ok && <span className="text-[9px] text-red-600 font-bold">不足</span>}
                        </div>
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
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
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

      {/* ===== 勝利 / 敗北 ===== */}
      {isOver && (
        <div className={`mx-2 mt-2 mb-3 rounded-2xl border-2 overflow-hidden ${
          b.phase === 'victory'
            ? b.isBoss ? 'bg-amber-950 border-amber-400' : 'bg-amber-950 border-amber-600'
            : 'bg-red-950 border-red-700'
        }`}
          style={b.phase === 'victory' && b.isBoss
            ? { boxShadow: '0 0 40px rgba(251,191,36,0.3)' }
            : {}}
        >
          {/* ボス勝利ヘッダー */}
          {b.phase === 'victory' && b.isBoss && (
            <div className="bg-gradient-to-r from-amber-900 to-yellow-900 px-4 py-2 text-center">
              <div className="text-xs font-black text-amber-300 tracking-widest animate-pulse">👑 BOSS DEFEATED 👑</div>
            </div>
          )}

          <div className="p-5 text-center">
            <div className={`font-black mb-2 ${b.phase === 'victory' ? 'text-4xl' : 'text-3xl text-red-400'}`}
              style={b.phase === 'victory' ? { textShadow: '0 0 20px rgba(251,191,36,0.5)' } : {}}>
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
                  <div className="bg-amber-900/50 border-2 border-amber-400 rounded-xl px-4 py-2 text-amber-200 font-black animate-pulse"
                    style={{ boxShadow: '0 0 20px rgba(251,191,36,0.3)' }}>
                    💎 封印石を入手！
                  </div>
                )}
                {/* レベルアップ */}
                {b.logs.filter(l => l.type === 'system' && l.text.includes('レベルアップ')).map((l, i) => (
                  <div key={i} className="text-yellow-300 font-black text-sm">⭐ {l.text.replace('⭐ ', '')}</div>
                ))}
                {/* 仲間の勝利セリフ */}
                {allies.filter(a => !a.isPlayer && a.hp > 0).length > 0 && (() => {
                  const alive = allies.filter(a => !a.isPlayer && a.hp > 0)
                  const speaker = alive[b.turn % alive.length]
                  const quotes = ['やったな！', '悪くない戦いだ。', '次も任せろ！', '一緒に戦えて光栄だ。', '勝ったぞ！']
                  return (
                    <div className="text-xs text-gray-400 italic">「{quotes[b.turn % quotes.length]}」—— {speaker.name}</div>
                  )
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
              className={`px-10 py-3 rounded-xl font-black border-2 transition active:scale-95 text-lg ${
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
