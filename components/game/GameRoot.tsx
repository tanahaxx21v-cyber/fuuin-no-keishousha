'use client'

import { useState, useCallback } from 'react'
import type { GameState, Difficulty, LocationId, CompanionId, Skill } from '@/lib/game/types'
import {
  createInitialState, travel, joinCompanion, skipCompanion,
  restAtInn, buyItem, enterDungeon, fightBoss, battleAttack,
  battleSkill, battleUseItem, battleFlee, closeBattle, setParty
} from '@/lib/game/engine'
import TitleScreen from './TitleScreen'
import WorldMap from './WorldMap'
import LocationView from './LocationView'
import BattleScene from './BattleScene'
import ShopView from './ShopView'
import PartyManage from './PartyManage'
import WinScreen from './WinScreen'
import GameOverScreen from './GameOverScreen'
import StatusBar from './StatusBar'

const SAVE_KEY = 'fuuin_save_v1'

function saveGame(gs: GameState) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(gs)) } catch {}
}

function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GameState
    // 基本バリデーション
    if (!parsed.phase || !parsed.playerLevel) return null
    // learnedSkillsが旧セーブにない場合は補完
    if (parsed.companions) {
      for (const id of Object.keys(parsed.companions) as (keyof typeof parsed.companions)[]) {
        if (!parsed.companions[id].learnedSkills) parsed.companions[id].learnedSkills = []
      }
    }
    return parsed
  } catch { return null }
}

export default function GameRoot() {
  const [gs, setGs] = useState<GameState>(() => loadGame() ?? createInitialState('normal'))
  const [pendingDiff, setPendingDiff] = useState<Difficulty | null>(null)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const update = useCallback((fn: (s: GameState) => GameState) => {
    setGs(prev => {
      const next = fn(prev)
      // 戦闘中以外は自動セーブ
      if (next.phase !== 'battle') saveGame(next)
      return next
    })
  }, [])

  const handleManualSave = () => {
    saveGame(gs)
    setSaveMsg('セーブしました！')
    setTimeout(() => setSaveMsg(null), 2000)
  }

  const handleDeleteSave = () => {
    try { localStorage.removeItem(SAVE_KEY) } catch {}
    setGs(createInitialState('normal'))
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

  const handleTravel = (destId: LocationId) => {
    update(s => travel(s, destId))
  }

  const handleEnterLocation = () => {
    setGs(prev => ({ ...prev, phase: 'location' }))
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

  const handleOpenParty = () => {
    setGs(prev => ({ ...prev, phase: 'party_manage' }))
  }

  const handleCloseParty = () => {
    setGs(prev => ({ ...prev, phase: 'location' }))
  }

  const handleSetParty = (party: CompanionId[]) => {
    update(s => setParty(s, party))
  }

  const handleJoinCompanion = (id: CompanionId) => {
    update(s => joinCompanion(s, id))
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
    update(s => battleAttack(s, targetUid))
  }

  const handleBattleSkill = (skill: Skill, targetUid?: string) => {
    update(s => battleSkill(s, skill, targetUid))
  }

  const handleBattleItem = (itemId: string, targetUid: string) => {
    update(s => battleUseItem(s, itemId, targetUid))
  }

  const handleBattleFlee = () => {
    update(s => battleFlee(s))
  }

  const handleCloseBattle = () => {
    update(s => closeBattle(s))
  }

  const handleDismissLevelUp = () => {
    setGs(prev => ({ ...prev, levelUpPending: false }))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Status bar — shown during gameplay */}
      {['worldmap', 'location', 'battle', 'shop', 'party_manage'].includes(gs.phase) && (
        <StatusBar gs={gs} onOpenParty={handleOpenParty} onSave={handleManualSave} />
      )}

      {/* Level up overlay */}
      {gs.levelUpPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-yellow-900/90 border-2 border-yellow-400 rounded-2xl p-8 text-center shadow-2xl max-w-sm w-full mx-4">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-yellow-300">レベルアップ！</div>
            <div className="text-xl text-yellow-100 mt-1">{gs.playerName} → Lv {gs.playerLevel}</div>
            <div className="text-sm text-yellow-200 mt-3 space-y-1">
              <div>HP / MP / ATK / DEF / SPD が上昇！</div>
              {gs.playerSkills.length > 0 && (() => {
                const lastSkill = gs.playerSkills[gs.playerSkills.length - 1]
                const newLvSkill = [5,10,15,20,25].includes(gs.playerLevel)
                return newLvSkill ? (
                  <div className="text-purple-300 font-semibold mt-2">✨ 新スキル「{lastSkill.name}」を習得！</div>
                ) : null
              })()}
            </div>
            <button
              onClick={handleDismissLevelUp}
              className="mt-4 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg"
            >
              確認
            </button>
          </div>
        </div>
      )}

      {/* Save notification */}
      {saveMsg && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-900/90 border border-green-600 text-green-300 px-4 py-2 rounded-lg text-sm shadow-lg">
          💾 {saveMsg}
        </div>
      )}

      {/* Message toast */}
      {gs.message && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-red-900/90 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm shadow-lg">
          {gs.message}
          <button
            onClick={() => setGs(prev => ({ ...prev, message: undefined }))}
            className="ml-3 text-red-400 hover:text-red-200"
          >✕</button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1">
        {gs.phase === 'title' && !pendingDiff && <TitleScreen onStart={handleStart} />}
        {gs.phase === 'title' && pendingDiff && <NamingScreen onConfirm={handleNameConfirm} />}
        {gs.phase === 'prologue' && <PrologueScreen onDone={handlePrologueDone} playerName={gs.playerName} />}
        {gs.phase === 'worldmap' && (
          <WorldMap gs={gs} onTravel={handleTravel} onEnterLocation={handleEnterLocation} />
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
          />
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
        {gs.phase === 'party_manage' && (
          <PartyManage gs={gs} onSetParty={handleSetParty} onClose={handleCloseParty} />
        )}
        {gs.phase === 'win' && <WinScreen gs={gs} onRestart={() => { setGs(createInitialState('normal')); setPendingDiff(null) }} />}
        {gs.phase === 'gameover' && <GameOverScreen gs={gs} onRestart={() => { setGs(createInitialState('normal')); setPendingDiff(null) }} />}
      </div>
    </div>
  )
}

function NamingScreen({ onConfirm }: { onConfirm: (name: string) => void }) {
  const [name, setName] = useState('レオン')
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6">
      <div className="max-w-md w-full">
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-8 shadow-2xl text-center">
          <div className="text-5xl mb-4">⚔️</div>
          <h2 className="text-2xl font-bold text-white mb-2">勇者の名前</h2>
          <p className="text-gray-400 text-sm mb-6">あなたの名前を入力してください（最大8文字）</p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value.slice(0, 8))}
            maxLength={8}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-center text-xl mb-6 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="レオン"
          />
          <button
            onClick={() => onConfirm((name.trim() || 'レオン'))}
            className="w-full py-3 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-lg transition text-lg"
          >
            この名前で冒険へ →
          </button>
        </div>
      </div>
    </div>
  )
}

function PrologueScreen({ onDone, playerName }: { onDone: () => void; playerName: string }) {
  const [page, setPage] = useState(0)
  const pages = [
    {
      title: '100年前の誓い',
      text: '100年前、伝説の勇者は3つの封印石の力を結集し、世界を滅ぼそうとした魔王ダークルーラーを封じ込めた。その代償として勇者は命を落とし、封印石は世界各地へと散逸した。',
    },
    {
      title: '崩壊する封印',
      text: 'そして今、100日後に封印は完全に崩壊する。\n\n魔王が復活すれば、この世界は闇に覆われる。\n\nそれを防げるのは——伝説の勇者の血を引く者だけ。',
    },
    {
      title: '旅の始まり',
      text: `王都アルセリアの城で、王が告げた。\n\n「${playerName}よ。3つの封印石を集め、魔王を再び封じよ。\n仲間を集め、ダンジョンを攻略し、100日以内に砂漠遺跡へ向かえ。」\n\n${playerName}は剣を握り、旅立つ決意をした。`,
    },
  ]

  const current = pages[page]
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-8 shadow-2xl">
          <div className="text-sm text-purple-400 mb-2 tracking-wider">プロローグ {page + 1}/{pages.length}</div>
          <h2 className="text-2xl font-bold text-white mb-4">{current.title}</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line text-base">{current.text}</p>
          <div className="mt-8 flex justify-end">
            {page < pages.length - 1 ? (
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-2 bg-purple-700 hover:bg-purple-600 text-white font-semibold rounded-lg transition"
              >
                次へ →
              </button>
            ) : (
              <button
                onClick={onDone}
                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg transition"
              >
                旅に出る ⚔️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
