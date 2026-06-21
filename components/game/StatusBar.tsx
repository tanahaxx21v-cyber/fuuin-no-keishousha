'use client'

import type { GameState } from '@/lib/game/types'
import { COMPANIONS, getExpToNext } from '@/lib/game/data'

interface Props {
  gs: GameState
  onSave?: () => void
  isMuted?: boolean
  onToggleMute?: () => void
}

export default function StatusBar({ gs, onSave, isMuted, onToggleMute }: Props) {
  const hpPct = Math.max(0, (gs.playerHp / gs.playerMaxHp) * 100)
  const mpPct = Math.max(0, (gs.playerMp / gs.playerMaxMp) * 100)
  const expToNext = getExpToNext(gs.playerLevel)
  const expPct = Math.min(100, (gs.playerExp / expToNext) * 100)
  const daysUrgent = gs.daysLeft <= 20
  const daysWarn = gs.daysLeft <= 40

  return (
    <div className="sticky top-0 z-30 bg-[#07071a] border-b-2 border-indigo-800 px-2 py-1.5 shadow-xl">
      <div className="flex items-center gap-2 flex-wrap max-w-4xl mx-auto">

        {/* Days */}
        <div className={`flex items-center gap-1 border-2 rounded px-2 py-0.5 font-black text-sm ${
          daysUrgent
            ? 'border-red-500 bg-red-950 text-red-400 animate-pulse'
            : daysWarn
            ? 'border-orange-600 bg-orange-950 text-orange-300'
            : 'border-indigo-700 bg-indigo-950 text-indigo-200'
        }`}>
          ⏰ <span className="text-lg font-black">{gs.daysLeft}</span>日
        </div>

        {/* Name / Level / EXP */}
        <div className="flex items-center gap-1 bg-slate-900 border-2 border-slate-700 rounded px-2 py-0.5">
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
          <span className="text-xs font-black text-red-400 w-5">HP</span>
          <div className="w-20 h-3.5 bg-gray-900 rounded-sm border border-gray-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                hpPct > 50 ? 'bg-gradient-to-r from-green-700 to-green-500'
                : hpPct > 25 ? 'bg-gradient-to-r from-yellow-700 to-yellow-500'
                : 'bg-gradient-to-r from-red-800 to-red-600'
              }`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-white">
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
        <div className="flex items-center gap-1 bg-amber-950 border-2 border-amber-800 rounded px-2 py-0.5">
          <span className="text-xs">💰</span>
          <span className="text-sm font-black text-amber-300">{gs.gold}</span>
          <span className="text-xs text-amber-700">G</span>
        </div>

        {/* Seal stones */}
        <div className="flex gap-1">
          {(['fire', 'storm', 'dark'] as const).map(stone => (
            <div
              key={stone}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all ${
                gs.sealStones.includes(stone)
                  ? 'border-amber-500 bg-amber-950 shadow shadow-amber-900/60'
                  : 'border-gray-700 bg-gray-900 opacity-30 grayscale'
              }`}
            >
              {stone === 'fire' ? '🔥' : stone === 'storm' ? '⚡' : '🌑'}
            </div>
          ))}
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
                      : 'bg-red-600'
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

        {/* Mute */}
        {onToggleMute && (
          <button
            onClick={onToggleMute}
            title={isMuted ? '音楽ON' : '音楽OFF'}
            className="text-xs bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 px-2 py-1 rounded font-bold text-slate-300 transition"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        )}

        {/* Save */}
        {onSave && (
          <button
            onClick={onSave}
            className="text-xs bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 px-2 py-1 rounded font-bold text-slate-300 transition"
          >
            💾
          </button>
        )}
      </div>
    </div>
  )
}
