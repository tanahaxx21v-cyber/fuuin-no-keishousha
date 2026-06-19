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

// ===== キャラクタースプライト設定 =====
// characters.jpg: 1988×1194px, 7列×2行
// タイトルバー: 上部70px, 行0: y=70〜632 (562px), 行1: y=632〜1194 (562px)
const CHAR_ORIG_W = 1988
const CHAR_ORIG_H = 1194
const CHAR_COLS = 7
const CHAR_TITLE_PX = 70
const CHAR_ROW_PX = 562

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

// background-size: '700% auto' でアスペクト比を保ちながら正確な位置を計算
function calcPortraitBgPos(col: number, row: number, size: number) {
  const scale = (CHAR_COLS * size) / CHAR_ORIG_W
  const bgH = CHAR_ORIG_H * scale
  const scrollW = CHAR_COLS * size - size
  const scrollH = bgH - size
  const bgPosX = scrollW > 0 ? `${(col * size / scrollW) * 100}%` : '0%'
  const targetY = (CHAR_TITLE_PX + row * CHAR_ROW_PX) * scale
  const bgPosY = scrollH > 0 ? `${Math.min(100, (targetY / scrollH) * 100)}%` : '0%'
  return { bgPosX, bgPosY }
}

function CharPortrait({ charId, size, isActive = false, isDead = false }: {
  charId: string; size: number; isActive?: boolean; isDead?: boolean
}) {
  const pos = CHAR_GRID[charId] ?? { col: 0, row: 0 }
  const { bgPosX, bgPosY } = calcPortraitBgPos(pos.col, pos.row, size)

  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 4,
        border: isActive
          ? '2px solid #ffd700'
          : isDead
          ? '2px solid rgba(255,80,80,0.4)'
          : '2px solid rgba(255,255,255,0.15)',
        opacity: isDead ? 0.35 : 1,
        filter: isDead ? 'grayscale(80%)' : 'none',
        boxShadow: isActive ? '0 0 8px 2px rgba(255,215,0,0.5)' : 'none',
        backgroundImage: `url('/fuuin-no-keishousha/images/characters.jpg')`,
        backgroundSize: `${CHAR_COLS * 100}% auto`,
        backgroundPosition: `${bgPosX} ${bgPosY}`,
        backgroundRepeat: 'no-repeat',
      }}
    />
  )
}

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
  const fontSize = isLarge ? '5rem' : enemies.length <= 2 ? '3.5rem' : '2.5rem'

  return (
    <div className="absolute right-1 top-1" style={{ width: 'calc(58% - 4px)', bottom: 4, zIndex: 5 }}>
      <div className="flex flex-col items-center justify-center h-full gap-2">
        {enemies.map(e => {
          const dead = e.hp <= 0
          const emoji = e.emoji || getEnemyEmoji(e.uid, e.name)
          const hpPct = Math.max(0, (e.hp / e.maxHp) * 100)
          const hpFill = hpPct > 50 ? '#4ade80' : hpPct > 25 ? '#facc15' : '#ef4444'

          return (
            <div key={e.uid} className={`flex flex-col items-center gap-0.5 transition-opacity ${dead ? 'opacity-20' : ''}`}>
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
                    ? 'drop-shadow(0 0 12px rgba(255,50,50,0.8))'
                    : isTargetingEnemies && !dead
                    ? 'drop-shadow(0 0 8px rgba(255,200,0,0.7))'
                    : 'drop-shadow(0 0 4px rgba(255,255,255,0.3))',
                }}
              >
                <span style={{ fontSize, lineHeight: 1 }}>{emoji}</span>
                {isTargetingEnemies && !dead && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-yellow-300 font-black text-base animate-bounce">▼</span>
                )}
              </button>
              {/* HP bar + name + status */}
              <div style={{ width: isLarge ? 80 : 56 }}>
                <div className="w-full h-1.5 bg-black/60 border border-white/20 rounded-sm overflow-hidden">
                  <div className="h-full transition-all duration-300" style={{ width: `${hpPct}%`, backgroundColor: hpFill }} />
                </div>
                <div className="text-[8px] font-black text-center mt-0.5" style={{ color: '#fff', textShadow: '0 1px 3px #000,0 0 6px #000' }}>
                  {e.name}
                </div>
                {e.statusEffects.length > 0 && (
                  <div className="flex justify-center gap-0.5 mt-0.5">
                    {e.statusEffects.map(ef => (
                      <span key={ef.id} style={{ fontSize: 9 }}>{statusIcon(ef.id)}</span>
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
    <div className="bg-[#07071a] flex flex-col min-h-screen">

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
      <div className="relative shrink-0" style={{ height: '220px' }}>

        {/* 空 + 草地の背景（パワポケ4スタイル）*/}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, #5ab4e8 0%, #90d0f0 52%, #70c840 52%, #3a9a20 72%, #287010 100%)',
        }} />
        <div className="absolute" style={{ top: 6, left: 24, width: 72, height: 18, background: 'rgba(255,255,255,0.75)', borderRadius: '50%', filter: 'blur(4px)' }} />
        <div className="absolute" style={{ top: 2, right: 56, width: 96, height: 18, background: 'rgba(255,255,255,0.6)', borderRadius: '50%', filter: 'blur(4px)' }} />
        <div className="absolute" style={{ top: 12, right: 20, width: 48, height: 12, background: 'rgba(255,255,255,0.5)', borderRadius: '50%', filter: 'blur(3px)' }} />

        {/* 左エリア: プレイヤー + 仲間スプライト */}
        <div className="absolute left-2 bottom-3 flex flex-col-reverse gap-1 items-start" style={{ zIndex: 10, maxWidth: '38%' }}>
          <div className="flex flex-col items-center gap-0.5">
            <CharPortrait charId="player" size={80} isActive={currentActor?.isPlayer} isDead={playerUnit.hp <= 0} />
            <div style={{ width: 80 }}><HpBar hp={playerUnit.hp} maxHp={playerUnit.maxHp} /></div>
          </div>
          {allies.filter(a => !a.isPlayer).map(a => {
            const charId = a.companionId ?? 'gares'
            const statusIcons = a.statusEffects.map(e =>
              e.id === 'poison' ? '☠️' : e.id === 'stun' ? '💫' : e.id === 'atk_up' ? '⬆️' : e.id === 'def_up' ? '🛡️' : e.id === 'atk_down' ? '⬇️' : ''
            ).filter(Boolean)
            return (
              <div key={a.uid} className="flex items-center gap-1">
                <CharPortrait charId={charId} size={52} isActive={a.uid === b.currentUid} isDead={a.hp <= 0} />
                <div className="flex flex-col gap-0.5" style={{ width: 46 }}>
                  <HpBar hp={a.hp} maxHp={a.maxHp} />
                  <div className="flex items-center gap-0.5">
                    <span className="text-[8px] text-white font-bold leading-none truncate" style={{ textShadow: '0 1px 3px #000' }}>
                      {a.name}
                    </span>
                    {statusIcons.map((ic, i) => <span key={i} style={{ fontSize: 8 }}>{ic}</span>)}
                  </div>
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
            borderColor: '#2848c0',
            boxShadow: 'inset 0 0 18px rgba(50,70,190,0.2), 0 0 10px rgba(40,72,192,0.15)',
            minHeight: '62px',
          }}>
          {latestLog ? (
            <>
              <div className="text-sm font-black leading-snug" style={{ color: logColor(latestLog.type) }}>▶ {latestLog.text}</div>
              {[...prevLogs].reverse().map((log, i) => (
                <div key={i} className="text-xs leading-snug mt-0.5 ml-3" style={{ color: logColor(log.type), opacity: 0.55 }}>{log.text}</div>
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
                  return (
                    <button key={skill.id} disabled={!ok} onClick={() => handleSkillSelect(skill)}
                      className={`text-left px-3 py-2 rounded-lg border-2 transition ${
                        ok
                          ? 'border-purple-700 bg-purple-950 hover:bg-purple-900 text-white active:scale-95'
                          : 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed'
                      }`}>
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
        <div className={`mx-2 mt-2 mb-3 rounded-xl p-5 text-center border-2 ${
          b.phase === 'victory'
            ? 'bg-amber-950 border-amber-500'
            : 'bg-red-950 border-red-700'
        }`}>
          <div className="text-3xl font-black mb-2">
            {b.phase === 'victory' ? '🎉 VICTORY！' : '💀 DEFEAT...'}
          </div>
          {b.phase === 'victory' && (
            <div className="text-sm text-gray-300 mb-3 font-bold">
              EXP +{b.rewardExp} / Gold +{b.rewardGold}G
              {b.sealStoneFound && <div className="text-amber-300 font-black mt-1">💎 封印石を入手！</div>}
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
