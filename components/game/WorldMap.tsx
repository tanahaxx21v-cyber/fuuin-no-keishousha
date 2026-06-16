'use client'

import type { GameState, LocationId } from '@/lib/game/types'
import { LOCATIONS } from '@/lib/game/data'

interface Props {
  gs: GameState
  onTravel: (destId: LocationId) => void
  onEnterLocation: () => void
}

// Pixel positions for each location on the map (percentage-based)
const MAP_POSITIONS: Partial<Record<LocationId, { x: number; y: number }>> = {
  royal_city:     { x: 35, y: 20 },
  volca_town:     { x: 65, y: 15 },
  elda_village:   { x: 25, y: 42 },
  marina_port:    { x: 55, y: 50 },
  rune_city:      { x: 30, y: 65 },
  mist_village:   { x: 50, y: 78 },
  ignis_dungeon:  { x: 80, y: 10 },
  stormia_tower:  { x: 72, y: 55 },
  shadowgrave:    { x: 65, y: 82 },
  darkfort:       { x: 50, y: 93 },
}

const LOCATION_TYPE_COLORS: Record<string, string> = {
  town: 'bg-blue-700 border-blue-500 hover:bg-blue-600',
  dungeon: 'bg-orange-800 border-orange-600 hover:bg-orange-700',
  castle: 'bg-red-900 border-red-700 hover:bg-red-800',
}

export default function WorldMap({ gs, onTravel, onEnterLocation }: Props) {
  const currentLoc = LOCATIONS[gs.currentLocId]
  const connectedIds = currentLoc.connections

  const canEnterDarkfort = gs.currentLocId === 'darkfort' || connectedIds.includes('darkfort')
  const darkfortLocked = !gs.sealStones.length || gs.sealStones.length < 3

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-6xl mx-auto">
      {/* Map */}
      <div className="flex-1">
        <h2 className="text-lg font-bold text-gray-200 mb-3">🗺️ ワールドマップ</h2>

        <div className="relative bg-gray-900 border border-gray-700 rounded-xl overflow-hidden" style={{ paddingBottom: '75%' }}>
          {/* Map background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-gray-950 to-purple-950/30" />

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {Object.entries(LOCATIONS).map(([id, loc]) =>
              loc.connections.map(connId => {
                const from = MAP_POSITIONS[id as LocationId]
                const to = MAP_POSITIONS[connId]
                if (!from || !to) return null
                const isActive = id === gs.currentLocId || connId === gs.currentLocId
                return (
                  <line
                    key={`${id}-${connId}`}
                    x1={`${from.x}%`} y1={`${from.y}%`}
                    x2={`${to.x}%`} y2={`${to.y}%`}
                    stroke={isActive ? '#6366f1' : '#374151'}
                    strokeWidth={isActive ? 2 : 1}
                    strokeDasharray={isActive ? 'none' : '4,4'}
                  />
                )
              })
            )}
          </svg>

          {/* Location nodes */}
          {(Object.entries(LOCATIONS) as [LocationId, typeof LOCATIONS[LocationId]][]).map(([id, loc]) => {
            const pos = MAP_POSITIONS[id]
            if (!pos) return null

            const isCurrent = id === gs.currentLocId
            const isConnected = connectedIds.includes(id)
            const isVisited = gs.visitedLocs.includes(id)
            const isLocked = id === 'darkfort' && darkfortLocked
            const canTravel = isConnected && !isCurrent && !isLocked

            const typeColor = isCurrent
              ? 'bg-yellow-600 border-yellow-400 ring-2 ring-yellow-400/50'
              : isLocked
              ? 'bg-gray-800 border-gray-600 opacity-50 cursor-not-allowed'
              : canTravel
              ? `${LOCATION_TYPE_COLORS[loc.type]} cursor-pointer`
              : isVisited
              ? 'bg-gray-700 border-gray-600 opacity-70 cursor-default'
              : 'bg-gray-800 border-gray-700 opacity-40 cursor-default'

            return (
              <button
                key={id}
                disabled={!canTravel}
                onClick={() => canTravel && onTravel(id)}
                className={`absolute z-10 flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 transition-all ${typeColor} border rounded-lg px-1.5 py-1 text-center shadow-lg`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, minWidth: '60px' }}
              >
                <span className="text-base leading-none">{loc.emoji}</span>
                <span className="text-[9px] text-white leading-tight mt-0.5 font-medium">{loc.name.split('の').slice(-1)[0].slice(0, 5)}</span>
                {canTravel && (
                  <span className="text-[8px] text-white/70">{loc.travelDays[gs.currentLocId] ?? currentLoc.travelDays[id]}日</span>
                )}
                {isLocked && <span className="text-[8px] text-red-400">🔒</span>}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-600" /> 現在地</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-700" /> 町</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-800" /> ダンジョン</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-900" /> 城</div>
        </div>
      </div>

      {/* Current location info */}
      <div className="w-full lg:w-72 shrink-0">
        <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">現在地</div>
          <div className="text-xl font-bold text-white mb-1">
            {currentLoc.emoji} {currentLoc.name}
          </div>
          <div className="text-sm text-gray-400 mb-3 leading-relaxed">{currentLoc.desc}</div>

          {/* Location features */}
          <div className="flex flex-wrap gap-2 mb-3 text-xs">
            {currentLoc.hasInn && <span className="bg-blue-900/50 border border-blue-700/50 text-blue-300 px-2 py-0.5 rounded">🏨 宿屋</span>}
            {currentLoc.shopItems && <span className="bg-green-900/50 border border-green-700/50 text-green-300 px-2 py-0.5 rounded">🛒 ショップ</span>}
            {currentLoc.sealStone && !gs.sealStones.includes(currentLoc.sealStone) && (
              <span className="bg-yellow-900/50 border border-yellow-700/50 text-yellow-300 px-2 py-0.5 rounded">💎 封印石</span>
            )}
            {currentLoc.companionId && !gs.companions[currentLoc.companionId].joined && (
              <span className="bg-purple-900/50 border border-purple-700/50 text-purple-300 px-2 py-0.5 rounded">👤 仲間</span>
            )}
          </div>

          <button
            onClick={onEnterLocation}
            className="w-full py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white font-semibold rounded-lg transition text-sm"
          >
            {currentLoc.name}を探索する →
          </button>
        </div>

        {/* Seal stones status */}
        <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-4 mt-3">
          <div className="text-xs text-gray-500 mb-2">封印石の収集状況</div>
          {([
            { stone: 'fire' as const, name: '炎の封印石', icon: '🔥', loc: '炎山イグニス' },
            { stone: 'storm' as const, name: '嵐の封印石', icon: '⚡', loc: '嵐の塔ストーミア' },
            { stone: 'dark' as const, name: '闇の封印石', icon: '🌑', loc: '暗黒の森' },
          ]).map(({ stone, name, icon, loc: locName }) => (
            <div key={stone} className="flex items-center gap-2 py-1">
              <span className={`text-lg ${gs.sealStones.includes(stone) ? '' : 'grayscale opacity-30'}`}>{icon}</span>
              <div className="flex-1">
                <div className={`text-xs font-medium ${gs.sealStones.includes(stone) ? 'text-white' : 'text-gray-500'}`}>{name}</div>
                {!gs.sealStones.includes(stone) && <div className="text-xs text-gray-600">{locName}</div>}
              </div>
              {gs.sealStones.includes(stone) && <span className="text-xs text-green-400">入手済み</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
