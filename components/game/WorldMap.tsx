'use client'

import type { GameState, LocationId } from '@/lib/game/types'
import { LOCATIONS } from '@/lib/game/data'

interface Props {
  gs: GameState
  onTravel: (destId: LocationId) => void
  onEnterLocation: () => void
}

const MAP_POSITIONS: Partial<Record<LocationId, { x: number; y: number }>> = {
  galdo:           { x: 52, y: 25 },
  alseria:         { x: 45, y: 47 },
  bern:            { x: 72, y: 43 },
  elna:            { x: 14, y: 44 },
  sahal:           { x: 82, y: 63 },
  mirea:           { x: 50, y: 78 },
  watchtower:      { x: 82, y: 25 },
  traveler_inn:    { x: 44, y: 35 },
  checkpoint:      { x: 57, y: 47 },
  great_bridge:    { x: 44, y: 58 },
  riverside:       { x: 45, y: 68 },
  lighthouse:      { x: 34, y: 78 },
  spirit_spring:   { x: 27, y: 55 },
  trading_post:    { x: 65, y: 58 },
  coastal_road:    { x: 68, y: 73 },
  forest_entrance: { x: 22, y: 42 },
  demon_mine:      { x: 27, y: 22 },
  dragon_pass:     { x: 55, y: 8  },
  bandit_hideout:  { x: 68, y: 62 },
  ancient_temple:  { x: 10, y: 70 },
  desert_ruins:    { x: 88, y: 78 },
}

const NODE_STYLE: Record<string, string> = {
  town:    'bg-blue-900 border-blue-500 hover:bg-blue-800',
  dungeon: 'bg-orange-900 border-orange-600 hover:bg-orange-800',
  castle:  'bg-red-950 border-red-700 hover:bg-red-900',
  relay:   'bg-slate-800 border-slate-600 hover:bg-slate-700',
}

export default function WorldMap({ gs, onTravel, onEnterLocation }: Props) {
  const currentLoc = LOCATIONS[gs.currentLocId]
  const connectedIds = currentLoc.connections
  const finalBossLocked = gs.sealStones.length < 3

  return (
    <div className="flex flex-col lg:flex-row gap-3 p-3 max-w-6xl mx-auto">

      {/* Map */}
      <div className="flex-1">
        <div className="text-xs font-black text-indigo-400 mb-2 tracking-widest">🗺️ WORLD MAP</div>

        <div className="relative bg-[#0c0c24] border-2 border-indigo-800 rounded-xl overflow-hidden shadow-xl" style={{ paddingBottom: '72%' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-[#080818] to-purple-950/30" />

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {Object.entries(LOCATIONS).map(([id, loc]) =>
              loc.connections.map(connId => {
                const from = MAP_POSITIONS[id as LocationId]
                const to = MAP_POSITIONS[connId]
                if (!from || !to) return null
                const isActive = id === gs.currentLocId || connId === gs.currentLocId
                const isConnected = id === gs.currentLocId && connectedIds.includes(connId as LocationId)
                  || connId === gs.currentLocId && connectedIds.includes(id as LocationId)
                return (
                  <line
                    key={`${id}-${connId}`}
                    x1={`${from.x}%`} y1={`${from.y}%`}
                    x2={`${to.x}%`} y2={`${to.y}%`}
                    stroke={isConnected ? '#6366f1' : isActive ? '#4338ca' : '#1e1e3a'}
                    strokeWidth={isConnected ? 2.5 : isActive ? 1.5 : 1}
                    strokeDasharray={isConnected ? 'none' : isActive ? 'none' : '4,4'}
                    opacity={isConnected ? 0.9 : isActive ? 0.5 : 0.4}
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
            const isLocked = id === 'desert_ruins' && finalBossLocked
            const canTravel = isConnected && !isCurrent && !isLocked

            let nodeClass = ''
            if (isCurrent) {
              nodeClass = 'bg-amber-700 border-amber-400 ring-2 ring-amber-400/50 shadow-lg shadow-amber-900/60'
            } else if (isLocked) {
              nodeClass = 'bg-gray-900 border-gray-700 opacity-50 cursor-not-allowed'
            } else if (canTravel) {
              nodeClass = `${NODE_STYLE[loc.type] ?? NODE_STYLE.relay} cursor-pointer shadow-md`
            } else if (isVisited) {
              nodeClass = 'bg-slate-800 border-slate-600 opacity-60 cursor-default'
            } else {
              nodeClass = 'bg-gray-900 border-gray-800 opacity-30 cursor-default'
            }

            return (
              <button
                key={id}
                disabled={!canTravel}
                onClick={() => canTravel && onTravel(id)}
                className={`absolute z-10 flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 transition-all border-2 rounded-lg px-1.5 py-1 text-center ${nodeClass}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, minWidth: '58px' }}
              >
                <span className="text-base leading-none">{loc.emoji}</span>
                <span className="text-[9px] text-white leading-tight mt-0.5 font-black">
                  {loc.name.split('の').slice(-1)[0].slice(0, 5)}
                </span>
                {canTravel && (
                  <span className="text-[8px] text-indigo-300 font-bold">
                    {loc.travelDays[gs.currentLocId] ?? currentLoc.travelDays[id]}日
                  </span>
                )}
                {isLocked && <span className="text-[8px] text-red-400">🔒</span>}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded border border-amber-500 bg-amber-700" /> 現在地</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded border border-blue-500 bg-blue-900" /> 町</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded border border-orange-600 bg-orange-900" /> ダンジョン</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded border border-red-700 bg-red-950" /> 城</div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-3">

        {/* Current location */}
        <div className="bg-[#0c0c24] border-2 border-indigo-700 rounded-xl p-4 shadow-xl">
          <div className="text-xs font-black text-indigo-400 mb-2 tracking-widest">— 現在地 —</div>
          <div className="text-2xl font-black text-white mb-1">
            {currentLoc.emoji} {currentLoc.name}
          </div>
          <div className="text-sm text-gray-400 mb-3 leading-relaxed">{currentLoc.desc}</div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {currentLoc.hasInn && (
              <span className="text-xs font-bold bg-blue-950 border border-blue-700 text-blue-300 px-2 py-0.5 rounded-full">🏨 宿屋</span>
            )}
            {currentLoc.shopItems && (
              <span className="text-xs font-bold bg-green-950 border border-green-700 text-green-300 px-2 py-0.5 rounded-full">🛒 ショップ</span>
            )}
            {currentLoc.sealStone && !gs.sealStones.includes(currentLoc.sealStone) && (
              <span className="text-xs font-bold bg-amber-950 border border-amber-700 text-amber-300 px-2 py-0.5 rounded-full">💎 封印石</span>
            )}
            {currentLoc.companionId && !gs.companions[currentLoc.companionId].joined && (
              <span className="text-xs font-bold bg-purple-950 border border-purple-700 text-purple-300 px-2 py-0.5 rounded-full">👤 仲間</span>
            )}
          </div>

          <button
            onClick={onEnterLocation}
            className="w-full py-3 bg-indigo-800 hover:bg-indigo-700 border-2 border-indigo-500 text-white font-black rounded-xl transition active:scale-95"
          >
            {currentLoc.name}を探索 ▶
          </button>
        </div>

        {/* Seal stone progress */}
        <div className="bg-[#0c0c24] border-2 border-amber-800 rounded-xl p-4">
          <div className="text-xs font-black text-amber-500 mb-3 tracking-widest">— 封印石 —</div>
          {([
            { stone: 'fire' as const, name: '炎の封印石', icon: '🔥', loc: '廃鉱山' },
            { stone: 'storm' as const, name: '嵐の封印石', icon: '⚡', loc: '竜の峠' },
            { stone: 'dark' as const, name: '闇の封印石', icon: '🌑', loc: '古代神殿' },
          ]).map(({ stone, name, icon, loc: locName }) => {
            const obtained = gs.sealStones.includes(stone)
            return (
              <div key={stone} className={`flex items-center gap-2 py-1.5 border-b border-slate-800 last:border-0 ${obtained ? '' : 'opacity-50'}`}>
                <span className={`text-xl ${obtained ? '' : 'grayscale'}`}>{icon}</span>
                <div className="flex-1">
                  <div className={`text-xs font-black ${obtained ? 'text-white' : 'text-gray-500'}`}>{name}</div>
                  {!obtained && <div className="text-xs text-gray-600">{locName}で入手</div>}
                </div>
                {obtained
                  ? <span className="text-xs font-black text-green-400 border border-green-700 px-1.5 py-0.5 rounded">取得済</span>
                  : <span className="text-xs text-gray-600">未取得</span>
                }
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
