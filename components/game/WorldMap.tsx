'use client'

import type { GameState, LocationId } from '@/lib/game/types'
import { LOCATIONS } from '@/lib/game/data'

interface Props {
  gs: GameState
  onTravel: (destId: LocationId) => void
  onEnterLocation: () => void
}

// Calibrated to actual positions on map.jpg
const MAP_POSITIONS: Partial<Record<LocationId, { x: number; y: number }>> = {
  galdo:           { x: 57, y: 31 },  // ガルド都市 ⑥
  alseria:         { x: 43, y: 47 },  // アルセリア王都 ①
  bern:            { x: 68, y: 42 },  // ベルン商業都市 ②
  elna:            { x: 16, y: 60 },  // エルナの里 ⑤
  sahal:           { x: 78, y: 68 },  // サハル砂漠都市 ③
  mirea:           { x: 44, y: 80 },  // ミレア港町 ④
  watchtower:      { x: 74, y: 27 },  // 見張り塔
  traveler_inn:    { x: 34, y: 38 },  // 旅人の宿
  checkpoint:      { x: 59, y: 44 },  // 関所
  great_bridge:    { x: 44, y: 57 },  // 大橋
  riverside:       { x: 35, y: 64 },  // 川辺の村
  lighthouse:      { x: 50, y: 88 },  // 灯台岬
  spirit_spring:   { x: 20, y: 52 },  // 浅緑の森
  trading_post:    { x: 61, y: 60 },  // 取引所
  coastal_road:    { x: 64, y: 73 },  // 沿岸街道
  forest_entrance: { x: 24, y: 34 },  // 魔獣の森
  demon_mine:      { x: 47, y: 21 },  // 魔鉱山
  dragon_pass:     { x: 60, y: 11 },  // 竜の峠
  bandit_hideout:  { x: 73, y: 55 },  // 盗賊の隠れ家
  ancient_temple:  { x: 15, y: 73 },  // 古代神殿
  desert_ruins:    { x: 88, y: 50 },  // 砂漠遺跡
}

export default function WorldMap({ gs, onTravel, onEnterLocation }: Props) {
  const currentLoc = LOCATIONS[gs.currentLocId]
  const connectedIds = currentLoc.connections
  const finalBossLocked = gs.sealStones.length < 3

  return (
    <div className="flex flex-col lg:flex-row gap-3 p-3 max-w-6xl mx-auto">

      {/* Map */}
      <div className="flex-1">
        <div className="text-xs font-black text-amber-400 mb-2 tracking-widest drop-shadow">🗺️ WORLD MAP — ルミナ大陸</div>

        <div className="relative border-2 border-amber-800 rounded-xl overflow-hidden shadow-2xl" style={{ paddingBottom: '68%' }}>
          {/* Map background image */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/fuuin-no-keishousha/images/map.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Very light overlay for contrast */}
          <div className="absolute inset-0 bg-black/10" />

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {Object.entries(LOCATIONS).map(([id, loc]) =>
              loc.connections.map(connId => {
                const from = MAP_POSITIONS[id as LocationId]
                const to = MAP_POSITIONS[connId]
                if (!from || !to) return null
                const isConnected = (id === gs.currentLocId && connectedIds.includes(connId as LocationId))
                  || (connId === gs.currentLocId && connectedIds.includes(id as LocationId))
                return (
                  <line
                    key={`${id}-${connId}`}
                    x1={`${from.x}%`} y1={`${from.y}%`}
                    x2={`${to.x}%`} y2={`${to.y}%`}
                    stroke={isConnected ? '#fbbf24' : 'rgba(255,255,255,0.3)'}
                    strokeWidth={isConnected ? 2.5 : 1}
                    strokeDasharray={isConnected ? 'none' : '4,4'}
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

            // Icon style based on state
            let iconBg = ''
            let iconRing = ''
            let iconOpacity = ''
            if (isCurrent) {
              iconBg = 'bg-amber-400 border-2 border-white shadow-lg shadow-amber-500/60'
              iconRing = 'ring-2 ring-white/70'
            } else if (isLocked) {
              iconBg = 'bg-gray-800/80 border border-gray-600'
              iconOpacity = 'opacity-40'
            } else if (canTravel) {
              iconBg = 'bg-white/90 border-2 border-indigo-400 hover:bg-white shadow-md'
              iconRing = 'hover:ring-2 hover:ring-indigo-300/70'
            } else if (isVisited) {
              iconBg = 'bg-white/60 border border-gray-400'
              iconOpacity = 'opacity-75'
            } else {
              iconBg = 'bg-gray-700/50 border border-gray-600'
              iconOpacity = 'opacity-25'
            }

            const shortName = loc.name
              .replace(/の\S+$/, '') // 「〜の〜」から後半除去
              .replace(/王都|商業|港町|廃|古代|砂漠/, '') // 修飾語除去
              .slice(0, 4)

            return (
              <button
                key={id}
                disabled={!canTravel}
                onClick={() => canTravel && onTravel(id)}
                className={`absolute z-10 flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 transition-all ${iconOpacity} ${canTravel ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'} ${isCurrent ? 'scale-110' : ''}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                {/* Town icon */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${iconBg} ${iconRing} transition-all`}>
                  {isLocked ? '🔒' : loc.emoji}
                </div>
                {/* Name label */}
                <div
                  className="mt-0.5 px-1 py-0.5 rounded text-[8px] font-black leading-none whitespace-nowrap"
                  style={{
                    background: isCurrent ? 'rgba(245,158,11,0.95)' : 'rgba(0,0,0,0.75)',
                    color: isCurrent ? '#000' : '#fff',
                    textShadow: isCurrent ? 'none' : '0 1px 2px rgba(0,0,0,0.8)',
                  }}
                >
                  {shortName}
                </div>
                {/* Travel days */}
                {canTravel && (
                  <div className="text-[7px] font-bold text-amber-300 mt-0.5"
                       style={{ textShadow: '0 1px 3px rgba(0,0,0,1)' }}>
                    {loc.travelDays[gs.currentLocId] ?? currentLoc.travelDays[id]}日
                  </div>
                )}
                {/* Current marker */}
                {isCurrent && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[10px] animate-bounce">▼</div>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded border-2 border-amber-300 bg-amber-500" /> 現在地</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded border-2 border-indigo-400 bg-indigo-900" /> 移動可</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded border-2 border-slate-500 bg-slate-800 opacity-70" /> 訪問済</div>
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
