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
  const totalDays = getDifficultyMultiplier(gs.difficulty).days
  const currentDay = totalDays - gs.daysLeft + 1

  return (
    <div className="sticky top-0 z-30 bg-[#07071a] border-b-2 border-indigo-800 px-2 py-1.5 shadow-xl">
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
        </div>

        {/* Name / Level / EXP */}
        <div className="flex items-center gap-1 bg-slate-900 border-2 border-slate-700 px-2 py-0.5">
          <span className="text-xs font-bold text-slate-200">{gs.playerName}</span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400">Lv</span>
          <span className="text-sm font-black text-white">{gs.playerLevel}</span>
          <div className="w-12 h-2 bg-gray-900 rounded-sm border border-gray-700 overflow-hidden ml-1" title={`EXP ${gs.playerExp}/${expToNext}`}>
            <div
              className="h-full bg-gradient-to-r from-purple-700 to-purple-400 transition-all duration-500"
              style={{ width: `${expPct}%` }}
            />
          </div>
        </div>

        {/* HP */}
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-black w-5 ${hpPct <= 25 ? 'text-red-400 animate-pulse' : 'text-red-400'}`}>HP</span>
          <div className="w-20 h-3.5 bg-gray-900 rounded-sm border border-gray-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                hpPct > 50 ? 'bg-gradient-to-r from-green-700 to-green-500'
                : hpPct > 25 ? 'bg-gradient-to-r from-yellow-700 to-yellow-500'
                : 'bg-gradient-to-r from-red-800 to-red-600 animate-pulse'
              }`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <span className={`text-xs font-bold ${hpPct <= 25 ? 'text-red-400 font-black' : 'text-white'}`}>
            {gs.playerHp}<span className="text-gray-600 font-normal">/{gs.playerMaxHp}</span>
          </span>
        </div>

        {/* MP */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-blue-400 w-5">MP</span>
          <div className="w-14 h-3.5 bg-gray-900 rounded-sm border border-gray-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-800 to-blue-500 transition-all duration-300"
              style={{ width: `${mpPct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-white">
            {gs.playerMp}<span className="text-gray-600 font-normal">/{gs.playerMaxMp}</span>
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
        <div className="flex items-center gap-1">
          {(['fire', 'storm', 'dark'] as const).map(stone => {
            const has = gs.sealStones.includes(stone)
            const glow = stone === 'fire' ? 'rgba(239,68,68,0.5)' : stone === 'storm' ? 'rgba(59,130,246,0.5)' : 'rgba(168,85,247,0.5)'
            return (
              <div
                key={stone}
                className={`w-6 h-6 border-2 flex items-center justify-center text-xs transition-all duration-500 ${
                  has ? 'border-amber-500 bg-amber-950' : 'border-gray-700 bg-gray-900 opacity-30 grayscale'
                }`}
                style={has ? { boxShadow: `0 0 8px ${glow}`, animation: 'pulse 2s ease-in-out infinite' } : {}}
                title={has ? `${stone === 'fire' ? '炎' : stone === 'storm' ? '嵐' : '闇'}の封印石（取得済み）` : '未取得'}
              >
                {stone === 'fire' ? '🔥' : stone === 'storm' ? '⚡' : '🌑'}
              </div>
            )
          })}
          <span className="text-[10px] text-gray-600 font-bold ml-0.5">{gs.sealStones.length}/3</span>
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
                <div className="w-7 h-1.5 bg-gray-900 rounded-sm border border-gray-700 overflow-hidden">
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
            className={`text-xs border-2 px-2 py-1 font-bold transition ${
              battleSpeed === 'fast'
                ? 'bg-yellow-950 border-yellow-600 text-yellow-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
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
            className={`text-xs border-2 px-2 py-1 font-bold transition ${
              autoBattle
                ? 'bg-green-950 border-green-600 text-green-300 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
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
            className="text-xs bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 px-2 py-1 font-bold text-slate-300 transition"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        )}

        {/* Save */}
        {onSave && (
          <button
            onClick={onSave}
            className="text-xs bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 px-2 py-1 font-bold text-slate-300 transition"
          >
            💾
          </button>
        )}

        {/* Return to title */}
        {onReturnToTitle && (
          <button
            onClick={() => setConfirmReturn(true)}
            className="text-xs bg-slate-900 hover:bg-red-950 border-2 border-slate-700 hover:border-red-700 px-2 py-1 font-bold text-slate-400 hover:text-red-300 transition"
            title="タイトルに戻る"
          >
            🏠
          </button>
        )}
      </div>

      {/* Confirm return to title overlay */}
      {confirmReturn && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
          <div className="bg-[#0c0c24] border-2 border-red-700 p-6 text-center shadow-2xl max-w-xs w-full mx-4">
            <div className="text-3xl mb-3">🏠</div>
            <div className="text-base font-black text-white mb-1">タイトルに戻る</div>
            <div className="text-xs text-gray-400 mb-4">セーブデータは保持されます。<br/>現在の進行状況を保存してから戻りますか？</div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  onSave?.()
                  setConfirmReturn(false)
                  onReturnToTitle?.()
                }}
                className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 border-2 border-indigo-600 text-white font-black text-sm transition active:scale-95"
              >
                💾 保存して戻る
              </button>
              <button
                onClick={() => {
                  setConfirmReturn(false)
                  onReturnToTitle?.()
                }}
                className="px-4 py-2 bg-red-950 hover:bg-red-900 border-2 border-red-700 text-red-300 font-black text-sm transition active:scale-95"
              >
                保存せず戻る
              </button>
            </div>
            <button
              onClick={() => setConfirmReturn(false)}
              className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
