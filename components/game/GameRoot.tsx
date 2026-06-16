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

export default function GameRoot() {
  const [gs, setGs] = useState<GameState>(() => createInitialState('normal'))

  const update = useCallback((fn: (s: GameState) => GameState) => {
    setGs(prev => {
      const next = fn(prev)
      return next
    })
  }, [])

  const handleStart = (diff: Difficulty) => {
    setGs(createInitialState(diff))
    setGs(prev => ({ ...prev, phase: 'prologue' }))
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
        <StatusBar gs={gs} onOpenParty={handleOpenParty} />
      )}

      {/* Level up overlay */}
      {gs.levelUpPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-yellow-900/90 border-2 border-yellow-400 rounded-2xl p-8 text-center shadow-2xl">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-yellow-300">レベルアップ！</div>
            <div className="text-lg text-yellow-100 mt-1">Lv {gs.playerLevel} になった！</div>
            <div className="text-sm text-yellow-200 mt-3">HP・MP・攻撃・防御・速度が上昇した！</div>
            <button
              onClick={handleDismissLevelUp}
              className="mt-4 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg"
            >
              確認
            </button>
          </div>
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
        {gs.phase === 'title' && <TitleScreen onStart={handleStart} />}
        {gs.phase === 'prologue' && <PrologueScreen onDone={handlePrologueDone} />}
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
        {gs.phase === 'win' && <WinScreen gs={gs} onRestart={() => setGs(createInitialState('normal'))} />}
        {gs.phase === 'gameover' && <GameOverScreen gs={gs} onRestart={() => setGs(createInitialState('normal'))} />}
      </div>
    </div>
  )
}

function PrologueScreen({ onDone }: { onDone: () => void }) {
  const [page, setPage] = useState(0)
  const pages = [
    {
      title: '100年前の誓い',
      text: '100年前、伝説の勇者は3つの封印石の力を結集し、世界を滅ぼそうとした魔王ダークルーラーを封じ込めた。その代償として勇者は命を落とし、封印石は世界各地へと散逸した。',
    },
    {
      title: '崩壊する封印',
      text: 'そして今、100日後に封印は完全に崩壊する。\n\n魔王が復活すれば、この世界は闇に覆われる。\n\nそれを防げるのは——伝説の勇者の血を引く、あなただけ。',
    },
    {
      title: '旅の始まり',
      text: '王都リーベルの城で、王が告げた。\n\n「後継者よ。3つの封印石を集め、魔王を再び封じよ。\n仲間を集め、ダンジョンを攻略し、100日以内に魔王城へ向かえ。」\n\nあなたは剣を握り、旅立つ決意をした。',
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
