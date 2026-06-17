'use client'

import type { GameState } from '@/lib/game/types'
import { LOCATIONS } from '@/lib/game/data'

interface Props {
  gs: GameState
  onOpenParty: () => void
  onSave?: () => void
}

const SEAL_ICONS: Record<string, string> = { fire: '🔥', storm: '⚡', dark: '🌑' }

export default function StatusBar({ gs, onOpenParty, onSave }: Props) {
  const loc = LOCATIONS[gs.currentLocId]
  const hpPct = Math.max(0, (gs.playerHp / gs.playerMaxHp) * 100)
  const mpPct = Math.max(0, (gs.playerMp / gs.playerMaxMp) * 100)

  return (
    <div className="bg-gray-900/95 border-b border-gray-800 px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm sticky top-0 z-30">
      {/* Days left */}
      <div className={`font-bold ${gs.daysLeft <= 20 ? 'text-red-400 animate-pulse' : gs.daysLeft <= 40 ? 'text-orange-400' : 'text-yellow-300'}`}>
        ⏰ 残{gs.daysLeft}日
        {gs.daysLeft <= 40 && gs.daysLeft > 20 && <span className="text-xs ml-1 font-normal opacity-80">！急いで</span>}
        {gs.daysLeft <= 20 && <span className="text-xs ml-1 font-normal">！！タイムリミット</span>}
      </div>

      {/* HP */}
      <div className="flex items-center gap-1">
        <span className="text-red-400 text-xs">HP</span>
        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${hpPct}%` }}
          />
        </div>
        <span className="text-xs text-gray-300">{gs.playerHp}/{gs.playerMaxHp}</span>
      </div>

      {/* MP */}
      <div className="flex items-center gap-1">
        <span className="text-blue-400 text-xs">MP</span>
        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${mpPct}%` }} />
        </div>
        <span className="text-xs text-gray-300">{gs.playerMp}/{gs.playerMaxMp}</span>
      </div>

      {/* Name & Level & Gold */}
      <div className="text-xs text-purple-300 font-semibold">{gs.playerName}</div>
      <div className="text-xs text-gray-400">Lv{gs.playerLevel}</div>
      <div className="text-xs text-yellow-400">💰 {gs.gold}G</div>

      {/* Seal stones */}
      <div className="flex gap-1">
        {(['fire', 'storm', 'dark'] as const).map(stone => (
          <span
            key={stone}
            className={`text-base ${gs.sealStones.includes(stone) ? 'opacity-100' : 'opacity-20'}`}
            title={stone === 'fire' ? '炎の封印石' : stone === 'storm' ? '嵐の封印石' : '闇の封印石'}
          >
            {SEAL_ICONS[stone]}
          </span>
        ))}
      </div>

      {/* Location */}
      <div className="text-xs text-gray-500 ml-auto hidden sm:block">
        {loc.emoji} {loc.name}
      </div>

      {/* Party — disabled during battle */}
      <button
        onClick={gs.phase === 'battle' ? undefined : onOpenParty}
        disabled={gs.phase === 'battle'}
        className={`text-xs px-2 py-1 rounded-lg transition ${gs.phase === 'battle' ? 'bg-gray-800 text-gray-600 cursor-default' : 'bg-gray-700 hover:bg-gray-600'}`}
      >
        👥 仲間 {gs.party.filter(id => gs.companions[id].alive).length}/3
      </button>

      {/* Save */}
      {onSave && (
        <button
          onClick={onSave}
          className="text-xs bg-indigo-800 hover:bg-indigo-700 px-2 py-1 rounded-lg transition"
        >
          💾
        </button>
      )}
    </div>
  )
}
