'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { GameState, Difficulty, LocationId, CompanionId, Skill } from '@/lib/game/types'
import {
  createInitialState, travel, joinCompanion, skipCompanion, isOneTimeCompanion,
  restAtInn, buyItem, enterDungeon, fightBoss, battleAttack,
  battleSkill, battleUseItem, battleFlee, closeBattle,
  processNonPlayerTurn, processPlayerStun, checkLocationEvent, startEvent, advanceEvent, skipToEventEnd,
  chooseBranch, wander, campRest, useItemOutOfBattle, setParty, getAvailableConnections,
  setCompanionOrder,
} from '@/lib/game/engine'
import { LOCATIONS, ITEMS } from '@/lib/game/data'
import {
  playBgm, stopBgm, toggleMute, isMuted,
  sfxAttack, sfxSkill, sfxHeal, sfxVictory, sfxDefeat, sfxLevelUp, sfxMenuSelect, sfxCoin,
} from '@/lib/game/audio'
import TitleScreen from './TitleScreen'
import { CharPortrait } from './CharPortrait'
import WorldMap from './WorldMap'
import LocationView from './LocationView'
import BattleScene from './BattleScene'
import ShopView from './ShopView'
import WinScreen from './WinScreen'
import GameOverScreen from './GameOverScreen'
import StatusBar from './StatusBar'
import EventScene from './EventScene'
import PartyManage from './PartyManage'
import AlbumScreen from './AlbumScreen'
import { ACHIEVEMENT_DEFS } from '@/lib/game/achievements'

const SAVE_KEY = 'fuuin_save_v2'

function saveGame(gs: GameState) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(gs)) } catch {}
}

function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GameState
    if (!parsed.phase || !parsed.playerLevel) return null
    if (parsed.phase === 'gameover' || parsed.phase === 'win') return null
    if (parsed.companions) {
      for (const id of Object.keys(parsed.companions) as (keyof typeof parsed.companions)[]) {
        if (!parsed.companions[id].learnedSkills) parsed.companions[id].learnedSkills = []
      }
    }
    if (!parsed.completedEvents) parsed.completedEvents = []
    if (!parsed.locVisitCounts) parsed.locVisitCounts = {}
    if (!parsed.playerStatus) parsed.playerStatus = []
    if (!parsed.playerSkills) parsed.playerSkills = []
    if (!parsed.defeatedBosses) parsed.defeatedBosses = []
    if (!parsed.party) parsed.party = []
    // 旧セーブデータ互換: 死亡仲間をpartyから除外
    if (parsed.companions) parsed.party = parsed.party.filter((id: string) => (parsed.companions as Record<string, { alive?: boolean }>)[id]?.alive)
    if (!parsed.inventory) parsed.inventory = []
    if (!parsed.sealStones) parsed.sealStones = []
    if (!parsed.achievements) parsed.achievements = []
    if (!parsed.notifiedAchievements) parsed.notifiedAchievements = []
    return parsed
  } catch { return null }
}

export default function GameRoot() {
  // SSRとクライアントのlocalStorageミスマッチを防ぐため、初期状態はtitleで固定しuseEffectで読み込む
  const [gs, setGs] = useState<GameState>(() => createInitialState('normal'))
  const [hasSave, setHasSave] = useState(false)
  const [pendingDiff, setPendingDiff] = useState<Difficulty | null>(null)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [muted, setMuted] = useState(false)
  const [sealFlash, setSealFlash] = useState<'fire' | 'storm' | 'dark' | null>(null)
  const [battleSpeed, setBattleSpeed] = useState<'normal' | 'fast'>('normal')
  const [autoBattle, setAutoBattle] = useState(false)
  const [diceRolling, setDiceRolling] = useState(false)
  const prevSealStonesRef = useRef<string[]>([])
  const [achievementToast, setAchievementToast] = useState<{ icon: string; title: string; desc: string } | null>(null)
  const achToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const saved = loadGame()
    if (saved) {
      setHasSave(true)
      // Don't auto-load — show title screen so player can choose Continue vs New Game
    }
  }, [])

  const update = useCallback((fn: (s: GameState) => GameState) => {
    setGs(prev => {
      const next = fn(prev)
      if (next.phase === 'gameover' || next.phase === 'win') {
        // ゲームオーバー・クリア時はセーブを削除
        try { localStorage.removeItem(SAVE_KEY) } catch {}
      } else if (next.phase !== 'battle') {
        saveGame(next)
      }
      return next
    })
  }, [])

  const handleManualSave = () => {
    saveGame(gs)
    setHasSave(true)
    setSaveMsg('セーブしました！')
    setTimeout(() => setSaveMsg(null), 2000)
  }

  const handleContinue = () => {
    const saved = loadGame()
    if (saved) setGs(saved)
  }

  const handleDeleteSave = () => {
    try { localStorage.removeItem(SAVE_KEY) } catch {}
    setGs(createInitialState('normal'))
    setHasSave(false)
    setPendingDiff(null)
  }

  const handleStart = (diff: Difficulty) => {
    setPendingDiff(diff)
  }

  const handleNameConfirm = (name: string) => {
    if (!pendingDiff) return
    const newGs = createInitialState(pendingDiff, name)
    setGs({ ...newGs, phase: 'prologue' })
    setPendingDiff(null)
  }

  const handlePrologueDone = () => {
    setGs(prev => ({ ...prev, phase: 'worldmap' }))
  }

  const handleReturnToTitle = () => {
    stopBgm()
    setGs(prev => ({ ...prev, phase: 'title', battle: undefined, activeEventId: undefined, pendingBranch: undefined, message: undefined }))
  }

  const handleTravel = (destId: LocationId) => {
    update(s => {
      const traveled = travel(s, destId)
      if (traveled.phase !== 'location') return traveled
      const eventId = checkLocationEvent(traveled)
      if (eventId) return startEvent(traveled, eventId)
      return traveled
    })
  }

  const handleEnterLocation = () => {
    setGs(prev => {
      const withLoc = { ...prev, phase: 'location' as const }
      const eventId = checkLocationEvent(withLoc)
      if (eventId) return startEvent(withLoc, eventId)
      return withLoc
    })
  }

  const handleEventAdvance = () => {
    update(s => {
      const next = advanceEvent(s)
      if (next.phase === 'location' && !next.pendingBranch && !next.pendingCompanionJoin) {
        const eventId = checkLocationEvent(next)
        if (eventId) return startEvent(next, eventId)
      }
      return next
    })
  }

  const handleSkipAllEvent = () => {
    update(s => skipToEventEnd(s))
  }

  const handleChooseBranch = (idx: number) => {
    const opt = gs.pendingBranch?.options[idx]
    const checkAndChain = (s: GameState) => {
      const next = chooseBranch(s, idx)
      if (next.phase === 'location' && !next.pendingBranch && !next.pendingCompanionJoin) {
        const eventId = checkLocationEvent(next)
        if (eventId) return startEvent(next, eventId)
      }
      return next
    }
    if (opt?.winChance !== undefined) {
      setDiceRolling(true)
      setTimeout(() => {
        setDiceRolling(false)
        update(s => checkAndChain(s))
      }, 1500)
    } else {
      update(s => checkAndChain(s))
    }
  }

  const handleBackToMap = () => {
    setGs(prev => ({ ...prev, phase: 'worldmap', message: undefined }))
  }

  const handleInn = () => {
    update(s => {
      const rested = restAtInn(s)
      if (rested.phase === 'location') {
        const eventId = checkLocationEvent(rested)
        if (eventId) return startEvent(rested, eventId)
      }
      return rested
    })
  }

  const handleBuyItem = (itemId: string) => {
    update(s => buyItem(s, itemId))
  }

  const handleOpenShop = () => {
    setGs(prev => ({ ...prev, phase: 'shop' }))
  }

  const handleCloseShop = () => {
    setGs(prev => ({ ...prev, phase: 'location' }))
  }

  const handleJoinCompanion = (id: CompanionId) => {
    update(s => {
      const next = joinCompanion(s, id)
      // 仲間加入後、パーティに入っていない仲間がいたら自動でパーティ編成を開く
      const hasUnpartied = Object.values(next.companions).some(
        c => c.joined && c.alive && !next.party.includes(c.id as CompanionId)
      )
      if (hasUnpartied) return { ...next, phase: 'party_manage' as const }
      return next
    })
  }

  const handleWander = (mode: 'gold' | 'train' | 'explore') => {
    update(s => {
      const wandered = wander(s, mode)
      if (wandered.phase === 'location') {
        const eventId = checkLocationEvent(wandered)
        if (eventId) return startEvent(wandered, eventId)
      }
      return wandered
    })
  }

  const handleSetCompanionOrder = useCallback((uid: string, order: import('@/lib/game/types').CompanionOrder) => {
    update(s => setCompanionOrder(s, uid, order))
  }, [])

  const handleCampRest = () => {
    update(s => campRest(s))
  }

  const handleUseItemOutOfBattle = (itemId: string, targetId: string) => {
    update(s => useItemOutOfBattle(s, itemId, targetId as 'player'))
  }

  const handleOpenPartyManage = () => {
    setGs(prev => ({ ...prev, phase: 'party_manage' }))
  }

  const handleOpenAlbum = () => {
    setGs(prev => ({ ...prev, phase: 'album' as GameState['phase'] }))
  }

  const handleCloseAlbum = () => {
    setGs(prev => ({ ...prev, phase: 'location' }))
  }

  const handleSetParty = (party: CompanionId[]) => {
    update(s => setParty(s, party))
  }

  const handleClosePartyManage = () => {
    setGs(prev => ({ ...prev, phase: 'location' }))
  }

  const handleSkipCompanion = () => {
    update(s => skipCompanion(s))
  }

  const handleEnterDungeon = (mode: 'careful' | 'aggressive' = 'careful') => {
    update(s => enterDungeon(s, mode))
  }

  const handleFightBoss = () => {
    update(s => fightBoss(s))
  }

  const handleBattleAttack = (targetUid: string) => {
    sfxAttack()
    update(s => battleAttack(s, targetUid))
  }

  const handleBattleSkill = (skill: Skill, targetUid?: string) => {
    if (['heal', 'def_up', 'atk_up'].includes(skill.effect)) sfxHeal()
    else sfxSkill()
    update(s => battleSkill(s, skill, targetUid))
  }

  const handleBattleItem = (itemId: string, targetUid: string) => {
    sfxHeal()
    update(s => battleUseItem(s, itemId, targetUid))
  }

  const handleBattleFlee = () => {
    update(s => {
      const fled = battleFlee(s)
      if (fled.phase === 'location') {
        const eventId = checkLocationEvent(fled)
        if (eventId) return startEvent(fled, eventId)
      }
      return fled
    })
  }

  const handleCloseBattle = () => {
    update(s => {
      const closed = closeBattle(s)
      if (closed.phase === 'location') {
        const eventId = checkLocationEvent(closed)
        if (eventId) return startEvent(closed, eventId)
      }
      return closed
    })
  }

  const handleDismissLevelUp = () => {
    setGs(prev => ({ ...prev, levelUpPending: false }))
  }

  // フェーズ・ロケーション変化に応じてBGMを切り替え
  useEffect(() => {
    if (gs.phase === 'worldmap') {
      playBgm('field')
    } else if (gs.phase === 'location' || gs.phase === 'shop') {
      const loc = LOCATIONS[gs.currentLocId]
      if (loc?.type === 'dungeon') playBgm('dungeon')
      else playBgm('town')
    } else if (gs.phase === 'battle' && gs.battle) {
      playBgm(gs.battle.isBoss ? 'boss' : 'battle')
    } else if (gs.phase === 'title' || gs.phase === 'prologue') {
      stopBgm()
    }
  }, [gs.phase, gs.battle?.isBoss, gs.currentLocId])

  // バトル終了時のSFX
  useEffect(() => {
    if (!gs.battle) return
    if (gs.battle.phase === 'victory') { sfxVictory(); stopBgm() }
    if (gs.battle.phase === 'defeat') { sfxDefeat(); stopBgm() }
  }, [gs.battle?.phase])

  // レベルアップSFX
  useEffect(() => {
    if (gs.levelUpPending) sfxLevelUp()
  }, [gs.levelUpPending])

  // 封印石取得演出
  useEffect(() => {
    const prev = prevSealStonesRef.current
    const curr = gs.sealStones
    const newStone = curr.find(s => !prev.includes(s)) as 'fire' | 'storm' | 'dark' | undefined
    if (newStone) {
      setSealFlash(newStone)
      setTimeout(() => setSealFlash(null), 4000)
    }
    prevSealStonesRef.current = [...curr]
  }, [gs.sealStones])

  // 中盤実績解除トースト通知
  useEffect(() => {
    if (gs.phase === 'title' || gs.phase === 'win' || gs.phase === 'gameover') return
    const notified = gs.notifiedAchievements ?? []
    const newUnlocks = ACHIEVEMENT_DEFS.filter(a => !notified.includes(a.id) && a.check(gs))
    if (newUnlocks.length === 0) return
    const ids = newUnlocks.map(a => a.id)
    setGs(prev => ({ ...prev, notifiedAchievements: [...(prev.notifiedAchievements ?? []), ...ids] }))
    const first = newUnlocks[0]
    setAchievementToast({ icon: first.icon, title: first.title, desc: first.desc })
    if (achToastTimerRef.current) clearTimeout(achToastTimerRef.current)
    achToastTimerRef.current = setTimeout(() => setAchievementToast(null), 4000)
  }, [gs.companions, gs.defeatedBosses, gs.sealStones, gs.visitedLocs, gs.completedEvents, gs.playerLevel, gs.gold, gs.party])

  // メッセージトーストを4秒後に自動消去
  useEffect(() => {
    if (!gs.message) return
    const timer = setTimeout(() => setGs(prev => ({ ...prev, message: undefined })), 4000)
    return () => clearTimeout(timer)
  }, [gs.message])

  // バトル中に仲間・敵のターンを自動処理（スタン中プレイヤーも自動スキップ）
  useEffect(() => {
    if (gs.phase !== 'battle' || !gs.battle) return
    const b = gs.battle
    if (b.phase === 'victory' || b.phase === 'defeat') return
    const currentActor = b.units.find(u => u.uid === b.currentUid)
    if (!currentActor) return
    // スタン中のプレイヤーターンは自動スキップ
    if (currentActor.isPlayer && b.phase === 'select_action') {
      const isStunned = currentActor.statusEffects.some(e => e.id === 'stun')
      if (!isStunned) return
      const delay = battleSpeed === 'fast' ? 700 : 1400
      const timer = setTimeout(() => update(s => processPlayerStun(s)), delay)
      return () => clearTimeout(timer)
    }
    if (currentActor.isPlayer) return
    const delay = battleSpeed === 'fast' ? 600 : 1600
    const timer = setTimeout(() => {
      update(s => processNonPlayerTurn(s))
    }, delay)
    return () => clearTimeout(timer)
  }, [gs.battle?.currentUid, gs.battle?.phase, gs.phase])

  // オートバトル：スキル優先・HP危機時は回復、複数敵はスキル、それ以外は最弱敵攻撃
  useEffect(() => {
    if (!autoBattle || gs.phase !== 'battle' || !gs.battle) return
    const b = gs.battle
    if (b.phase === 'victory' || b.phase === 'defeat') return
    const currentActor = b.units.find(u => u.uid === b.currentUid)
    if (!currentActor?.isPlayer || b.phase !== 'select_action') return
    const aliveEnemies = b.units.filter(u => !u.isAlly && u.hp > 0)
    if (aliveEnemies.length === 0) return
    const player = b.units.find(u => u.isPlayer)!
    const delay = battleSpeed === 'fast' ? 400 : 900
    const timer = setTimeout(() => {
      // Priority 1: heal item if HP < 25%
      if (player.hp / player.maxHp < 0.25) {
        const found = gs.inventory.find(i => {
          const item = ITEMS[i.itemId]
          return i.qty > 0 && item && ['heal_hp', 'heal_both'].includes(item.effect)
        })
        if (found) { sfxHeal(); update(s => battleUseItem(s, found.itemId, player.uid)); return }
      }
      // Priority 2: attack skill if multiple enemies or HP high
      const totalHpPct = aliveEnemies.reduce((sum, e) => sum + e.hp, 0) / aliveEnemies.reduce((sum, e) => sum + e.maxHp, 0)
      const atkSkill = (player.skills ?? []).find(sk =>
        (sk.target === 'enemy_one' || sk.target === 'enemy_all') && player.mp >= sk.mpCost * 2
      )
      if (atkSkill && (aliveEnemies.length >= 2 || totalHpPct > 0.65)) {
        if (atkSkill.target === 'enemy_all') { sfxSkill(); update(s => battleSkill(s, atkSkill)); return }
        const weakest = aliveEnemies.reduce((a, b) => b.hp < a.hp ? b : a)
        sfxSkill(); update(s => battleSkill(s, atkSkill, weakest.uid)); return
      }
      // Priority 3: attack weakest enemy
      const weakest = aliveEnemies.reduce((a, b) => b.hp < a.hp ? b : a)
      sfxAttack()
      update(s => battleAttack(s, weakest.uid))
    }, delay)
    return () => clearTimeout(timer)
  }, [gs.battle?.currentUid, gs.battle?.phase, autoBattle])

  return (
    <div className="min-h-screen bg-[#020208] text-gray-100 flex flex-col items-center">
      <div className="w-full max-w-[480px] flex flex-col min-h-screen relative" style={{ borderLeft: '1px solid #1a1a30', borderRight: '1px solid #1a1a30' }}>
      {/* Status bar — shown during gameplay */}
      {['worldmap', 'location', 'battle', 'shop', 'event', 'party_manage'].includes(gs.phase) && (
        <StatusBar
          gs={gs}
          onSave={handleManualSave}
          isMuted={muted}
          onToggleMute={() => {
            const next = toggleMute()
            setMuted(next)
          }}
          onReturnToTitle={handleReturnToTitle}
          battleSpeed={battleSpeed}
          onToggleBattleSpeed={() => setBattleSpeed(s => s === 'normal' ? 'fast' : 'normal')}
          autoBattle={autoBattle}
          onToggleAutoBattle={() => setAutoBattle(a => !a)}
        />
      )}

      {/* Level up overlay */}
      {gs.levelUpPending && (() => {
        const newLvSkill = [5,10,15,20,25].includes(gs.playerLevel)
        const lastSkill = newLvSkill && gs.playerSkills.length > 0 ? gs.playerSkills[gs.playerSkills.length - 1] : null
        const lvFlavor = gs.playerLevel >= 25 ? 'もはや人の域を超えた。魔王を打ち倒す力がある。'
          : gs.playerLevel >= 20 ? `戦いが、${gs.playerName}を別の何かに変えていく。`
          : gs.playerLevel >= 15 ? 'もう以前の自分ではない。仲間が信じてくれている。'
          : gs.playerLevel >= 10 ? '傷を乗り越えた数だけ、確かに強くなった。'
          : gs.playerLevel >= 5 ? '旅の疲れが、いつの間にか力に変わっていた。'
          : '小さな一歩。だが確実に、前に進んでいる。'
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: '#08080f' }}>
            <div className="bg-[#0c0c24] border-2 border-amber-500 max-w-sm w-full mx-4">
              <div className="border-b border-amber-800 px-4 py-2.5 flex items-center gap-3" style={{ background: '#1a0e00' }}>
                <span className="text-xl">⭐</span>
                <div>
                  <div className="text-xs font-black text-amber-500 tracking-widest">LEVEL UP!</div>
                  <div className="text-sm text-white font-bold">{gs.playerName} <span className="text-amber-400 font-black">Lv {gs.playerLevel}</span></div>
                </div>
              </div>
              <div className="px-4 py-3">
              <div className="text-[11px] text-amber-200 font-bold mb-2.5 leading-snug border-l-2 border-amber-700 pl-2">{lvFlavor}</div>
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {[
                  { label: 'HP', val: '+12', cur: gs.playerMaxHp, color: '#4ade80' },
                  { label: 'MP', val: '+5', cur: gs.playerMaxMp, color: '#60a5fa' },
                  { label: 'ATK', val: '+2', cur: gs.playerAtk, color: '#f87171' },
                  { label: 'DEF', val: '+2', cur: gs.playerDef, color: '#93c5fd' },
                  { label: 'SPD', val: '+1', cur: gs.playerSpd, color: '#fbbf24' },
                ].map(s => (
                  <div key={s.label} className="bg-[#0c0c24] border border-[#2a2a4a] py-2 text-center">
                    <div className="text-[10px] text-gray-500 font-bold">{s.label}</div>
                    <div className="text-sm font-black" style={{ color: s.color }}>{s.val}</div>
                    <div className="text-[9px] text-gray-600 font-bold">{s.cur}</div>
                  </div>
                ))}
              </div>
              {lastSkill && (
                <div className="bg-purple-950 border-2 border-purple-500 px-4 py-2.5 mb-3">
                  <div className="text-xs text-purple-400 font-black mb-0.5">✨ 新スキル習得！</div>
                  <div className="font-black text-purple-200 text-base">「{lastSkill.name}」</div>
                  <div className="flex items-center justify-center gap-3 mt-1 mb-1">
                    <span className="text-[10px] text-blue-400 font-bold bg-blue-950 border border-blue-700 px-2 py-0.5">MP {lastSkill.mpCost}</span>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {lastSkill.target === 'enemy_one' ? '敵1体' : lastSkill.target === 'enemy_all' ? '敵全体' : lastSkill.target === 'ally_all' ? '味方全体' : lastSkill.target === 'ally_one' ? '味方1体' : '自分'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">{lastSkill.desc}</div>
                </div>
              )}
              <button
                onClick={handleDismissLevelUp}
                className="px-8 py-2.5 bg-amber-700 hover:bg-amber-600 border-2 border-amber-500 text-white font-black w-full"
              >
                先へ進む ▶
              </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 封印石取得演出 */}
      {sealFlash && (() => {
        const cfg = {
          fire:  { icon: '🔥', name: '炎の封印石', color: '#ef4444', bg: '#450a0a', border: '#b91c1c' },
          storm: { icon: '⚡', name: '嵐の封印石', color: '#60a5fa', bg: '#0c1a45', border: '#1d4ed8' },
          dark:  { icon: '🌑', name: '闇の封印石', color: '#c4b5fd', bg: '#2e1065', border: '#6d28d9' },
        }[sealFlash]
        return (
          <div
            className="fixed inset-0 z-[55] flex items-center justify-center pointer-events-none"
            style={{ background: '#08080f' }}
          >
            <div
              className="text-center border-2 px-10 py-8"
              style={{ background: cfg.bg, borderColor: cfg.border }}
            >
              <div style={{ fontSize: 48, lineHeight: 1 }}>{cfg.icon}</div>
              <div className="text-xl font-black mt-3" style={{ color: cfg.color }}>
                封印石を入手！
              </div>
              <div className="text-base font-bold text-white mt-1">{cfg.name}</div>
              <div className="text-xs text-gray-400 mt-2">封印石 {gs.sealStones.length}/3</div>
            </div>
          </div>
        )
      })()}

      {/* 実績解除トースト */}
      {achievementToast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3 border-2"
          style={{ background: '#1c1208', borderColor: '#d97706', minWidth: 260, maxWidth: 340 }}
        >
          <span style={{ fontSize: 28 }}>{achievementToast.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black tracking-widest" style={{ color: '#f59e0b' }}>🏆 実績解除！</div>
            <div className="text-sm font-black text-white mt-0.5 truncate">{achievementToast.title}</div>
            <div className="text-[10px] text-gray-400 mt-0.5 truncate">{achievementToast.desc}</div>
          </div>
        </div>
      )}

      {/* Save notification */}
      {saveMsg && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-950 border-2 border-green-600 text-green-300 px-4 py-2 text-sm font-black">
          💾 {saveMsg}
        </div>
      )}

      {/* Message toast */}
      {gs.message && (() => {
        const msg = gs.message!
        const isJoin = /^✅/.test(msg)
        const isSuccess = /^(💰|🎁|✨|🎉|💪|⭐|💎|🏆)/.test(msg)
        const isWarn = /^(⚠️|☠️|💀)/.test(msg)
        if (isJoin) return (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-purple-950 border-2 border-purple-400 px-5 py-3 text-sm font-black max-w-sm text-center">
            <div className="text-purple-200">{msg}</div>
          </div>
        )
        const cls = isSuccess
          ? 'bg-green-950 border-green-600 text-green-200'
          : isWarn
          ? 'bg-yellow-950 border-yellow-600 text-yellow-200'
          : 'bg-indigo-950 border-indigo-600 text-indigo-200'
        return (
          <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-40 ${cls} border-2 px-4 py-2 text-sm font-black max-w-xs text-center`}>
            {msg}
          </div>
        )
      })()}

      {/* Main content */}
      <div className="flex-1">
        {gs.phase === 'title' && !pendingDiff && (
          <TitleScreen
            onStart={handleStart}
            onContinue={hasSave ? handleContinue : undefined}
            onDeleteSave={hasSave ? handleDeleteSave : undefined}
            hasSave={hasSave}
          />
        )}
        {gs.phase === 'title' && pendingDiff && <NamingScreen onConfirm={handleNameConfirm} />}
        {gs.phase === 'prologue' && <PrologueScreen onDone={handlePrologueDone} playerName={gs.playerName} daysLeft={gs.daysLeft} />}
        {gs.phase === 'worldmap' && (
          <WorldMap
            gs={gs}
            onTravel={handleTravel}
            onEnterLocation={handleEnterLocation}
            getAvailableConnections={(locId) => getAvailableConnections(gs, locId)}
          />
        )}
        {gs.phase === 'location' && (
          <LocationView
            gs={gs}
            onBackToMap={handleBackToMap}
            onInn={handleInn}
            onOpenShop={handleOpenShop}
            onEnterDungeon={handleEnterDungeon}
            onFightBoss={handleFightBoss}
            onJoinCompanion={handleJoinCompanion}
            onSkipCompanion={handleSkipCompanion}
            onWander={handleWander}
            onCampRest={handleCampRest}
            onOpenPartyManage={handleOpenPartyManage}
            onUseItem={handleUseItemOutOfBattle}
            onOpenAlbum={handleOpenAlbum}
          />
        )}
        {gs.phase === 'party_manage' && (
          <PartyManage gs={gs} onSetParty={handleSetParty} onClose={handleClosePartyManage} />
        )}
        {gs.phase === 'album' && (
          <AlbumScreen gs={gs} onClose={handleCloseAlbum} />
        )}
        {gs.phase === 'battle' && gs.battle && (
          <BattleScene
            gs={gs}
            onAttack={handleBattleAttack}
            onSkill={handleBattleSkill}
            onItem={handleBattleItem}
            onFlee={handleBattleFlee}
            onClose={handleCloseBattle}
            onSetCompanionOrder={handleSetCompanionOrder}
          />
        )}
        {gs.phase === 'shop' && (
          <ShopView gs={gs} onBuy={handleBuyItem} onClose={handleCloseShop} />
        )}
        {gs.phase === 'event' && gs.activeEventId && (
          <div className="relative">
            <LocationView
              gs={{ ...gs, phase: 'location' }}
              onBackToMap={() => {}} onInn={() => {}} onOpenShop={() => {}}
              onEnterDungeon={() => {}} onFightBoss={() => {}}
              onJoinCompanion={() => {}} onSkipCompanion={() => {}}
            />
            <EventScene gs={gs} onAdvance={handleEventAdvance} onSkipAll={handleSkipAllEvent} />
          </div>
        )}
        {/* サイコロ演出 */}
        {diceRolling && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ background: '#0a0a12' }}>
            <div className="text-center">
              <div className="text-2xl mb-3">🎲</div>
              <div className="text-xl font-black text-yellow-300">運命を決める…</div>
            </div>
          </div>
        )}

        {gs.pendingBranch && gs.phase === 'location' && !diceRolling && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-end pb-8 px-4" style={{ background: '#060608' }}>
            <div className="w-full max-w-md bg-[#0c0c24] border-2 border-amber-600 p-5">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-black text-amber-500 tracking-widest">— 選択 —</div>
                <div className="text-xs font-black text-amber-300 bg-amber-950 border border-amber-800 px-2 py-0.5">💰 {gs.gold}G</div>
              </div>
              {gs.pendingBranch.prompt && (
                <div className="text-base font-bold text-white text-center mb-4 px-2">{gs.pendingBranch.prompt}</div>
              )}
              <div className="flex flex-col gap-3">
                {gs.pendingBranch.options.map((opt, i) => {
                  const cantAfford = opt.cost !== undefined && gs.gold < opt.cost
                  return (
                    <button
                      key={i}
                      onClick={() => handleChooseBranch(i)}
                      disabled={cantAfford}
                      className="w-full py-3 px-4 bg-indigo-900 hover:bg-indigo-800 border-2 border-indigo-500 text-white font-black text-sm text-left disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <div>▶ {opt.label}</div>
                      {opt.cost !== undefined && (
                        <div className={`text-xs mt-0.5 font-bold ${cantAfford ? 'text-red-400' : 'text-amber-400'}`}>
                          {cantAfford ? '⚠️ 所持金不足 — ' : '💰 '}{opt.cost}G 必要
                        </div>
                      )}
                      {opt.winChance !== undefined && (
                        <div className="text-xs text-yellow-400 mt-0.5 font-bold">⚡ 成功確率: {Math.round(opt.winChance * 100)}%</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
        {gs.phase === 'win' && <WinScreen gs={gs} onRestart={() => { setGs(createInitialState('normal')); setPendingDiff(null); setHasSave(false) }} />}
        {gs.phase === 'gameover' && <GameOverScreen gs={gs} onRestart={() => { setGs(createInitialState('normal')); setPendingDiff(null); setHasSave(false) }} />}
      </div>
      </div>
    </div>
  )
}

function NamingScreen({ onConfirm }: { onConfirm: (name: string) => void }) {
  const [name, setName] = useState('レオン')
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07071a] p-6">
      <div className="w-full max-w-xs">
        <div className="bg-[#0c0c24] border-2 border-indigo-900 p-6">
          <div className="border-b border-indigo-900 pb-3 mb-5 text-center">
            <div className="text-[10px] text-indigo-700 tracking-[0.5em] uppercase mb-2">NAME ENTRY</div>
            <div className="flex justify-center mb-3">
              <div className="overflow-hidden border border-amber-800">
                <CharPortrait charId="player" size={72} rounded={0} />
              </div>
            </div>
            <div className="text-sm font-black text-white">勇者の名前を入力</div>
            <div className="text-[10px] text-gray-600 mt-0.5">最大8文字</div>
          </div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value.slice(0, 8))}
            maxLength={8}
            className="w-full bg-[#060615] border border-indigo-900 px-4 py-3 text-white text-center text-xl font-black mb-4 focus:outline-none focus:border-indigo-600"
            placeholder="レオン"
          />
          <button
            onClick={() => onConfirm((name.trim() || 'レオン'))}
            className="w-full py-3 bg-indigo-900 hover:bg-indigo-800 border border-indigo-700 text-white font-black text-base"
          >
            この名前で冒険へ ▶
          </button>
        </div>
      </div>
    </div>
  )
}

function PrologueScreen({ onDone, playerName, daysLeft }: { onDone: () => void; playerName: string; daysLeft: number }) {
  const [page, setPage] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTypingDone, setIsTypingDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pages: { title: string; text: string; icon: string; accent: string }[] = [
    {
      title: '100年前の誓い',
      icon: '⚔️',
      accent: 'border-indigo-700',
      text: '100年前、世界が滅びかけた夜があった。\n\n闇を支配する魔王が3つの封印石の力を貪り、ルミナ大陸を呑み込もうとしたとき——たった一人の勇者が立ち向かった。\n\n伝説の勇者は命と引き換えに魔王を封じ、3つの封印石は世界の各地へと散らばった。',
    },
    {
      title: '封印の崩壊',
      icon: '⌛',
      accent: 'border-red-800',
      text: `そして100年が経った今、封印は限界を迎えようとしている。\n\nあと${daysLeft}日。\n\nその日を境に、魔王は完全に復活する。\n\nかつて命を救った誓いが、再び試されようとしていた。`,
    },
    {
      title: '王の命',
      icon: '👑',
      accent: 'border-amber-800',
      text: `王都アルセリアの玉座の間で、老いた王が告げた。\n\n「${playerName}よ、お前こそ100年前の勇者の血を引く者。」\n\n「3つの封印石を集め、砂漠の遺跡へ向かえ。${daysLeft}日以内に魔王を再び封じなければ、この世界は終わる。」\n\n王の言葉は重かった。だが——`,
    },
    {
      title: '旅立ちの朝',
      icon: '🌅',
      accent: 'border-purple-800',
      text: `${playerName}は城の門を出た。\n\n旅の途中で出会う人々の中に、きっと仲間がいる。一人では届かない場所も、共に戦えば道が開ける。\n\nだが忘れるな——仲間は一度倒れれば、二度と立ち上がらない。その命の重さを胸に刻んで進め。\n\n封印の継承者として。`,
    },
  ]

  useEffect(() => {
    const fullText = pages[page].text
    setDisplayedText('')
    setIsTypingDone(false)
    if (timerRef.current) clearInterval(timerRef.current)
    let idx = 0
    timerRef.current = setInterval(() => {
      idx++
      if (idx >= fullText.length) {
        setDisplayedText(fullText)
        setIsTypingDone(true)
        clearInterval(timerRef.current!)
      } else {
        setDisplayedText(fullText.slice(0, idx))
      }
    }, 20)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleClick = () => {
    if (!isTypingDone) {
      if (timerRef.current) clearInterval(timerRef.current)
      setDisplayedText(pages[page].text)
      setIsTypingDone(true)
    }
  }

  const current = pages[page]
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07071a] p-4" onClick={handleClick}>
      <div className="w-full max-w-sm">
        <div className={`bg-[#0c0c24] border-2 ${current.accent} p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">{current.icon}</span>
            <div>
              <div className="text-xs font-black text-indigo-400 tracking-widest">PROLOGUE {page + 1}/{pages.length}</div>
              <h2 className="text-xl font-black text-white">{current.title}</h2>
            </div>
          </div>
          <div style={{ minHeight: 120 }}>
            <p className="text-gray-300 leading-snug whitespace-pre-line text-sm font-bold">
              {displayedText}
              {!isTypingDone && (
                <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 align-text-bottom" />
              )}
            </p>
          </div>
          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-1">
              {pages.map((_, i) => (
                <div key={i} className={`h-2 ${i === page ? 'bg-indigo-400 w-4' : i < page ? 'bg-indigo-700 w-2' : 'bg-gray-700 w-2'}`} />
              ))}
            </div>
            {isTypingDone && (page < pages.length - 1 ? (
              <button
                onClick={e => { e.stopPropagation(); setPage(p => p + 1) }}
                className="px-6 py-2 bg-indigo-900 hover:bg-indigo-800 border border-indigo-700 text-white font-black text-sm"
              >
                次へ ▶
              </button>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); onDone() }}
                className="px-6 py-2 bg-amber-800 hover:bg-amber-700 border border-amber-600 text-white font-black text-sm"
              >
                旅に出る ⚔️
              </button>
            ))}
            {!isTypingDone && (
              <div className="text-xs text-gray-600 font-bold">タップでスキップ</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
