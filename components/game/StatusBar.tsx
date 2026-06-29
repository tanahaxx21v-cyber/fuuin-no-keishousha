'use client'

import { useState } from 'react'
import type { GameState } from '@/lib/game/types'
import { COMPANIONS, getExpToNext, getDifficultyMultiplier } from '@/lib/game/data'

interface Props {
  gs: GameState
  onSave?: () => void
  isMuted?: boolean
  onToggleMute?: () => void
  onReturnToTitle?: () => void
  battleSpeed?: 'normal' | 'fast'
  onToggleBattleSpeed?: () => void
  autoBattle?: boolean
  onToggleAutoBattle?: () => void
}

export default function StatusBar({ gs, onSave, isMuted, onToggleMute, onReturnToTitle, battleSpeed, onToggleBattleSpeed, autoBattle, onToggleAutoBattle }: Props) {
  const [confirmReturn, setConfirmReturn] = useState(false)
  const hpPct = Math.max(0, (gs.playerHp / gs.playerMaxHp) * 100)
  const mpPct = Math.max(0, (gs.playerMp / gs.playerMaxMp) * 100)
  const expToNext = getExpToNext(gs.playerLevel)
  const expPct = Math.min(100, (gs.playerExp / expToNext) * 100)
  const daysUrgent = gs.daysLeft <= 20
  const daysWarn = gs.daysLeft <= 40
  const daysEncounterUp = gs.daysLeft <= 30
  const totalDays = getDifficultyMultiplier(gs.difficulty).days
  const currentDay = totalDays - gs.daysLeft + 1

  return (
    <div className="sticky top-0 z-30 bg-[#07071a] border-b-2 border-indigo-800 px-2 py-1.5">
      <div className="flex items-center gap-2 flex-wrap max-w-4xl mx-auto">

        {/* Days */}
        <div className={`flex items-center gap-1 border-2 px-2 py-0.5 font-black text-sm ${
          daysUrgent
            ? 'border-red-500 bg-red-950 text-red-400 animate-pulse'
            : daysWarn
            ? 'border-orange-600 bg-orange-950 text-orange-300'
            : 'border-indigo-700 bg-indigo-950 text-indigo-200'
        }`}>
          <span className="text-[9px] text-gray-600 font-bold mr-0.5">{currentDay}日目</span>
          ⏰ <span className="text-lg font-black">{gs.daysLeft}</span>日
          {daysEncounterUp && <span className="text-[9px] font-black text-red-400 ml-0.5">⚔↑</span>}
        </div>

        {/* Name / Level / EXP */}
        <div className="flex items-center gap-1 bg-[#0c0c24] border-2 border-[#2a2a4a] px-2 py-0.5">
          <span className="text-xs font-bold text-gray-200">{gs.playerName}</span>
          <span className="text-[#2a2a4a]">·</span>
          <span className="text-xs text-[#8888aa]">Lv</span>
          <span className="text-sm font-black text-white">{gs.playerLevel}</span>
          <div className="w-12 h-2 bg-gray-900 border border-gray-700 overflow-hidden ml-1" title={`EXP ${gs.playerExp}/${expToNext}`}>
            <div
              className="h-full bg-purple-600 transition-all duration-500"
              style={{ width: `${expPct}%` }}
            />
          </div>
        </div>

        {/* HP */}
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-black w-5 ${hpPct <= 25 ? 'text-red-400 animate-pulse' : 'text-red-400'}`}>HP</span>
          <div className="w-20 h-3.5 bg-gray-900 border border-gray-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                hpPct > 50 ? 'bg-green-600'
                : hpPct > 25 ? 'bg-yellow-600'
                : 'bg-red-600 animate-pulse'
              }`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <span className={`text-xs font-bold ${hpPct <= 25 ? 'text-red-400 font-black' : 'text-white'}`}>
            {gs.playerHp}<span className="text-gray-600 font-bold">/{gs.playerMaxHp}</span>
          </span>
        </div>

        {/* MP */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-blue-400 w-5">MP</span>
          <div className="w-14 h-3.5 bg-gray-900 border border-gray-700 overflow-hidden">
            <div
              className="h-full bg-blue-700 transition-all duration-300"
              style={{ width: `${mpPct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-white">
            {gs.playerMp}<span className="text-gray-600 font-bold">/{gs.playerMaxMp}</span>
          </span>
        </div>

        {/* Gold */}
        <div className="flex items-center gap-1 bg-amber-950 border-2 border-amber-800 px-2 py-0.5">
          <span className="text-xs">💰</span>
          <span className="text-sm font-black text-amber-300">{gs.gold}</span>
          <span className="text-xs text-amber-700">G</span>
        </div>

        {/* Status effects */}
        {gs.playerStatus && gs.playerStatus.length > 0 && (
          <div className="flex items-center gap-0.5">
            {gs.playerStatus.map(ef => (
              <div
                key={ef.id}
                className="text-xs px-1.5 py-0.5 border font-black"
                style={
                  ef.id === 'poison'
                    ? { background: '#1a0a2e', borderColor: '#7c3aed', color: '#c084fc' }
                    : ef.id === 'stun'
                    ? { background: '#1a1a00', borderColor: '#ca8a04', color: '#fde047' }
                    : ef.id === 'atk_down'
                    ? { background: '#0a1a2e', borderColor: '#1d4ed8', color: '#60a5fa' }
                    : { background: '#0f172a', borderColor: '#475569', color: '#94a3b8' }
                }
                title={`${ef.id === 'poison' ? '毒' : ef.id === 'stun' ? 'スタン' : ef.id === 'atk_down' ? 'ATK低下' : ef.id}（残${ef.turnsLeft}T）`}
              >
                {ef.id === 'poison' ? '☠️' : ef.id === 'stun' ? '⚡' : ef.id === 'atk_down' ? '⬇️' : '❓'}
                <span className="text-[9px] ml-0.5">{ef.turnsLeft}</span>
              </div>
            ))}
          </div>
        )}

        {/* Seal stones */}
        <div className="flex items-center gap-1" title="封印石（目標: 3つ集めて魔王を封じろ）">
          <span className="text-[9px] text-gray-700 font-black mr-0.5">🎯</span>
          {([
            { id: 'fire',  emoji: '🔥', name: '炎',   hint: '廃鉱山の鉱王を倒せ' },
            { id: 'storm', emoji: '⚡', name: '嵐',   hint: '竜の峠の嵐竜を倒せ' },
            { id: 'dark',  emoji: '🌑', name: '闇',   hint: '古代神殿の森王を倒せ' },
          ] as const).map(stone => {
            const has = gs.sealStones.includes(stone.id)
            return (
              <div
                key={stone.id}
                className={`w-6 h-6 border-2 flex items-center justify-center text-xs ${
                  has ? 'border-amber-500 bg-amber-950' : 'border-indigo-900 bg-[#0c0c24] opacity-55'
                }`}
                title={has ? `${stone.name}の封印石（取得済み）` : `${stone.name}の封印石 — ${stone.hint}`}
              >
                {stone.emoji}
              </div>
            )
          })}
          <span className={`text-[10px] font-black ml-0.5 ${gs.sealStones.length > 0 ? 'text-amber-500' : 'text-indigo-700'}`}>{gs.sealStones.length}/3</span>
        </div>

        {/* Party display (non-clickable) with HP bars */}
        <div className="ml-auto flex items-center gap-2">
          {gs.party.map(id => {
            const c = gs.companions[id]
            const def = COMPANIONS[id]
            if (!def) return null
            const hpPct = c.alive ? Math.max(0, (c.hp / c.maxHp) * 100) : 0
            return (
              <div key={id} className="flex flex-col items-center gap-0.5" title={c.alive ? `${def.name} HP ${c.hp}/${c.maxHp}` : `${def.name}（永眠）`}>
                <span className={`text-xl leading-none ${c.alive ? '' : 'grayscale opacity-30'}`}>
                  {def.emoji}
                </span>
                <div className="w-7 h-1.5 bg-gray-900 border border-gray-700 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      !c.alive ? 'bg-gray-700'
                      : hpPct > 50 ? 'bg-green-500'
                      : hpPct > 25 ? 'bg-yellow-500'
                      : 'bg-red-600 animate-pulse'
                    }`}
                    style={{ width: `${hpPct}%` }}
                  />
                </div>
              </div>
            )
          })}
          {gs.party.length === 0 && (
            <span className="text-xs text-gray-600 font-bold">仲間なし</span>
          )}
        </div>

        {/* Battle speed */}
        {onToggleBattleSpeed && gs.phase === 'battle' && (
          <button
            onClick={onToggleBattleSpeed}
            title={battleSpeed === 'fast' ? '通常速度に切り替え' : '高速バトルに切り替え'}
            className={`text-xs border-2 px-2 py-1 font-bold ${
              battleSpeed === 'fast'
                ? 'bg-yellow-950 border-yellow-600 text-yellow-300'
                : 'bg-[#0c0c24] hover:bg-[#111130] border-[#2a2a4a] text-[#8888aa]'
            }`}
          >
            {battleSpeed === 'fast' ? '⚡速' : '▶速'}
          </button>
        )}
        {/* Auto battle */}
        {onToggleAutoBattle && gs.phase === 'battle' && (
          <button
            onClick={onToggleAutoBattle}
            title={autoBattle ? 'オートバトルOFF' : 'オートバトルON（プレイヤーが自動で攻撃）'}
            className={`text-xs border-2 px-2 py-1 font-bold ${
              autoBattle
                ? 'bg-green-950 border-green-600 text-green-300'
                : 'bg-[#0c0c24] hover:bg-[#111130] border-[#2a2a4a] text-[#8888aa]'
            }`}
          >
            {autoBattle ? '🤖AUTO' : '🤖'}
          </button>
        )}

        {/* Mute */}
        {onToggleMute && (
          <button
            onClick={onToggleMute}
            title={isMuted ? '音楽ON' : '音楽OFF'}
            className="text-xs bg-[#0c0c24] hover:bg-[#111130] border-2 border-[#2a2a4a] px-2 py-1 font-bold text-[#8888aa]"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        )}

        {/* Save */}
        {onSave && (
          <button
            onClick={onSave}
            className="text-xs bg-[#0c0c24] hover:bg-[#111130] border-2 border-[#2a2a4a] px-2 py-1 font-bold text-[#8888aa]"
          >
            💾
          </button>
        )}

        {/* Return to title */}
        {onReturnToTitle && (
          <button
            onClick={() => setConfirmReturn(true)}
            className="text-xs bg-[#0c0c24] hover:bg-red-950 border-2 border-[#2a2a4a] hover:border-red-700 px-2 py-1 font-bold text-[#6666aa] hover:text-red-300"
            title="タイトルに戻る"
          >
            🏠
          </button>
        )}
      </div>

      {/* Confirm return to title overlay */}
      {confirmReturn && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black">
          <div className="bg-[#0c0c24] border-2 border-red-700 p-6 text-center max-w-xs w-full mx-4">
            <div className="text-2xl mb-3">🏠</div>
            <div className="text-base font-black text-white mb-1">タイトルに戻る</div>
            <div className="text-xs text-gray-400 mb-4">セーブデータは保持されます。<br/>現在の進行状況を保存してから戻りますか？</div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  onSave?.()
                  setConfirmReturn(false)
                  onReturnToTitle?.()
                }}
                className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 border-2 border-indigo-600 text-white font-black text-sm"
              >
                💾 保存して戻る
              </button>
              <button
                onClick={() => {
                  setConfirmReturn(false)
                  onReturnToTitle?.()
                }}
                className="px-4 py-2 bg-red-950 hover:bg-red-900 border-2 border-red-700 text-red-300 font-black text-sm"
              >
                保存せず戻る
              </button>
            </div>
            <button
              onClick={() => setConfirmReturn(false)}
              className="mt-3 text-xs text-gray-500 hover:text-gray-300"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
