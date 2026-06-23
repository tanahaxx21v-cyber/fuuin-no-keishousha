'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { GameState, Difficulty, LocationId, CompanionId, Skill } from '@/lib/game/types'
import {
  createInitialState, travel, joinCompanion, skipCompanion, isOneTimeCompanion,
  restAtInn, buyItem, enterDungeon, fightBoss, battleAttack,
  battleSkill, battleUseItem, battleFlee, closeBattle,
  processNonPlayerTurn, checkLocationEvent, startEvent, advanceEvent, skipToEventEnd,
  chooseBranch, wander, campRest, useItemOutOfBattle, setParty, getAvailableConnections,
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
    if (!parsed.inventory) parsed.inventory = []
    if (!parsed.sealStones) parsed.sealStones = []
    if (!parsed.achievements) parsed.achievements = []
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
    update(s => advanceEvent(s))
  }

  const handleSkipAllEvent = () => {
    update(s => skipToEventEnd(s))
  }

  const handleChooseBranch = (idx: number) => {
    const opt = gs.pendingBranch?.options[idx]
    if (opt?.winChance !== undefined) {
      setDiceRolling(true)
      setTimeout(() => {
        setDiceRolling(false)
        update(s => chooseBranch(s, idx))
      }, 1500)
    } else {
      update(s => chooseBranch(s, idx))
    }
  }

  const handleBackToMap = () => {
    setGs(prev => ({ ...prev, phase: 'worldmap', message: undefined }))
  }

  const handleInn = () => {
    update(s => restAtInn(s))
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

  const handleWander = () => {
    update(s => wander(s))
  }

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

  const handleEnterDungeon = () => {
    update(s => enterDungeon(s))
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

  // メッセージを3秒後に自動クリア
  useEffect(() => {
    if (!gs.message) return
    const timer = setTimeout(() => {
      setGs(prev => ({ ...prev, message: undefined }))
    }, 3000)
    return () => clearTimeout(timer)
  }, [gs.message])

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

  // バトル中に仲間・敵のターンを自動処理（バトル開始時は全員MAXHPで表示してから実行）
  useEffect(() => {
    if (gs.phase !== 'battle' || !gs.battle) return
    const b = gs.battle
    if (b.phase === 'victory' || b.phase === 'defeat') return
    const currentActor = b.units.find(u => u.uid === b.currentUid)
    if (!currentActor || currentActor.isPlayer) return
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
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
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
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.15) 0%, rgba(0,0,0,0.85) 70%)' }}>
            <div className="bg-[#0c0c24] border-2 border-amber-500 rounded-2xl px-8 py-7 text-center shadow-2xl max-w-sm w-full mx-4"
                 style={{ boxShadow: '0 0 60px rgba(245,158,11,0.4), 0 0 20px rgba(245,158,11,0.2)' }}>
              <div className="text-6xl mb-2" style={{ filter: 'drop-shadow(0 0 16px rgba(245,158,11,0.8))' }}>⭐</div>
              <div className="text-3xl font-black text-amber-300 tracking-wider" style={{ textShadow: '0 0 20px rgba(245,158,11,0.6)' }}>LEVEL UP!</div>
              <div className="text-lg text-white font-bold mt-1">{gs.playerName} <span className="text-amber-400 text-2xl font-black">Lv {gs.playerLevel}</span></div>
              <div className="grid grid-cols-5 gap-1.5 mt-4 mb-3">
                {[
                  { label: 'HP', val: '+12', color: '#4ade80' },
                  { label: 'MP', val: '+5', color: '#60a5fa' },
                  { label: 'ATK', val: '+2', color: '#f87171' },
                  { label: 'DEF', val: '+2', color: '#93c5fd' },
                  { label: 'SPD', val: '+1', color: '#fbbf24' },
                ].map(s => (
                  <div key={s.label} className="bg-slate-900 border border-slate-700 rounded-lg py-2 text-center">
                    <div className="text-[10px] text-gray-500 font-bold">{s.label}</div>
                    <div className="text-sm font-black" style={{ color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
              {lastSkill && (
                <div className="bg-purple-950/80 border-2 border-purple-500 rounded-xl px-4 py-2.5 mb-3"
                     style={{ boxShadow: '0 0 20px rgba(168,85,247,0.3)' }}>
                  <div className="text-xs text-purple-400 font-black mb-0.5">✨ 新スキル習得！</div>
                  <div className="font-black text-purple-200 text-base">「{lastSkill.name}」</div>
                  <div className="flex items-center justify-center gap-3 mt-1 mb-1">
                    <span className="text-[10px] text-blue-400 font-bold bg-blue-950 border border-blue-700 px-2 py-0.5 rounded">MP {lastSkill.mpCost}</span>
                    <span className="text-[10px] text-gray-400 font-bold">
                      {lastSkill.target === 'enemy_one' ? '敵1体' : lastSkill.target === 'enemy_all' ? '敵全体' : lastSkill.target === 'ally_all' ? '味方全体' : lastSkill.target === 'ally_one' ? '味方1体' : '自分'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">{lastSkill.desc}</div>
                </div>
              )}
              <button
                onClick={handleDismissLevelUp}
                className="px-8 py-2.5 bg-amber-700 hover:bg-amber-600 border-2 border-amber-500 text-white font-black rounded-xl transition active:scale-95 w-full"
              >
                確認 ▶
              </button>
            </div>
          </div>
        )
      })()}

      {/* 封印石取得演出 */}
      {sealFlash && (() => {
        const cfg = {
          fire:  { icon: '🔥', name: '炎の封印石', color: '#ef4444', bg: '#450a0a', border: '#b91c1c', glow: 'rgba(239,68,68,0.4)' },
          storm: { icon: '⚡', name: '嵐の封印石', color: '#60a5fa', bg: '#0c1a45', border: '#1d4ed8', glow: 'rgba(96,165,250,0.4)' },
          dark:  { icon: '🌑', name: '闇の封印石', color: '#c4b5fd', bg: '#2e1065', border: '#6d28d9', glow: 'rgba(196,181,253,0.4)' },
        }[sealFlash]
        return (
          <div
            className="fixed inset-0 z-[55] flex items-center justify-center pointer-events-none"
            style={{ background: `radial-gradient(ellipse at center, ${cfg.glow} 0%, rgba(0,0,0,0.7) 60%)` }}
          >
            <div
              className="text-center border-2 rounded-2xl px-10 py-8"
              style={{ background: cfg.bg, borderColor: cfg.border, boxShadow: `0 0 60px ${cfg.glow}` }}
            >
              <div style={{ fontSize: 72, lineHeight: 1, filter: `drop-shadow(0 0 20px ${cfg.color})` }}>{cfg.icon}</div>
              <div className="text-2xl font-black mt-3" style={{ color: cfg.color, textShadow: `0 0 20px ${cfg.color}` }}>
                封印石を入手！
              </div>
              <div className="text-base font-bold text-white mt-1">{cfg.name}</div>
              <div className="text-xs text-gray-400 mt-2">封印石 {gs.sealStones.length}/3</div>
            </div>
          </div>
        )
      })()}

      {/* Save notification */}
      {saveMsg && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-950 border-2 border-green-600 text-green-300 px-4 py-2 rounded-xl text-sm font-black shadow-xl">
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
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-purple-950 border-2 border-purple-400 px-5 py-3 rounded-2xl text-sm font-black shadow-2xl max-w-sm text-center"
            style={{ boxShadow: '0 0 30px rgba(168,85,247,0.4)' }}>
            <div className="text-purple-200">{msg}</div>
          </div>
        )
        const cls = isSuccess
          ? 'bg-green-950 border-green-600 text-green-200'
          : isWarn
          ? 'bg-yellow-950 border-yellow-600 text-yellow-200'
          : 'bg-indigo-950 border-indigo-600 text-indigo-200'
        return (
          <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-40 ${cls} border-2 px-4 py-2 rounded-xl text-sm font-black shadow-xl max-w-xs text-center`}>
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
          <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
            <div className="text-center">
              <div className="text-8xl mb-3" style={{ animation: 'diceSpin 0.35s linear infinite' }}>🎲</div>
              <div className="text-xl font-black text-yellow-300 animate-pulse">運命を決める…</div>
            </div>
          </div>
        )}

        {gs.pendingBranch && gs.phase === 'location' && !diceRolling && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-end pb-8 px-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div className="w-full max-w-md bg-[#0c0c24] border-2 border-amber-600 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-black text-amber-500 tracking-widest">— 選択 —</div>
                <div className="text-xs font-black text-amber-300 bg-amber-950 border border-amber-800 rounded px-2 py-0.5">💰 {gs.gold}G</div>
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
                      className="w-full py-3 px-4 bg-indigo-900 hover:bg-indigo-800 border-2 border-indigo-500 text-white font-black rounded-xl transition active:scale-95 text-sm text-left disabled:opacity-40 disabled:cursor-not-allowed"
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
  )
}

function NamingScreen({ onConfirm }: { onConfirm: (name: string) => void }) {
  const [name, setName] = useState('レオン')
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07071a] p-6">
      <div className="max-w-md w-full">
        <div className="bg-[#0c0c24] border-2 border-indigo-700 rounded-2xl p-8 shadow-2xl text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-2xl overflow-hidden border-2 border-amber-600" style={{ boxShadow: '0 0 24px rgba(245,158,11,0.4)' }}>
              <CharPortrait charId="player" size={96} rounded={12} />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">勇者の名前</h2>
          <p className="text-gray-400 text-sm mb-6 font-bold">あなたの名前を入力してください（最大8文字）</p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value.slice(0, 8))}
            maxLength={8}
            className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl px-4 py-3 text-white text-center text-xl font-black mb-6 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="レオン"
          />
          <button
            onClick={() => onConfirm((name.trim() || 'レオン'))}
            className="w-full py-3.5 bg-indigo-800 hover:bg-indigo-700 border-2 border-indigo-500 text-white font-black rounded-xl transition text-lg active:scale-95"
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
    <div className="min-h-screen flex items-center justify-center bg-[#07071a] p-6" onClick={handleClick}>
      <div className="max-w-2xl w-full">
        <div className={`bg-[#0c0c24] border-2 ${current.accent} rounded-2xl p-8 shadow-2xl transition-all duration-500`}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{current.icon}</span>
            <div>
              <div className="text-xs font-black text-indigo-400 tracking-widest">PROLOGUE {page + 1}/{pages.length}</div>
              <h2 className="text-xl font-black text-white">{current.title}</h2>
            </div>
          </div>
          <div style={{ minHeight: 120 }}>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm font-medium">
              {displayedText}
              {!isTypingDone && (
                <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 align-text-bottom animate-pulse" style={{ borderRadius: 1 }} />
              )}
            </p>
          </div>
          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-1">
              {pages.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === page ? 'bg-indigo-400 w-4' : i < page ? 'bg-indigo-700' : 'bg-gray-700'}`} />
              ))}
            </div>
            {isTypingDone && (page < pages.length - 1 ? (
              <button
                onClick={e => { e.stopPropagation(); setPage(p => p + 1) }}
                className="px-8 py-2.5 bg-indigo-800 hover:bg-indigo-700 border-2 border-indigo-600 text-white font-black rounded-xl transition active:scale-95"
              >
                次へ ▶
              </button>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); onDone() }}
                className="px-8 py-2.5 bg-amber-700 hover:bg-amber-600 border-2 border-amber-500 text-white font-black rounded-xl transition active:scale-95 shadow-lg shadow-amber-900/50"
              >
                旅に出る ⚔️
              </button>
            ))}
            {!isTypingDone && (
              <div className="text-xs text-gray-600 font-bold animate-pulse">タップでスキップ</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
