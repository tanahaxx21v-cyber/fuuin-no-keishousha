'use client'

import type { GameState, LocationId } from '@/lib/game/types'
import { LOCATIONS } from '@/lib/game/data'

interface Props {
  gs: GameState
  onTravel: (destId: LocationId) => void
  onEnterLocation: () => void
}

// ===== マップ座標（CSS %値）=====
// パワポケ4スタイル: すごろく形式のゲームボード
// 北: 山岳・魔鉱山 / 東: 砂漠 / 西: 森 / 南: 海岸
const MAP_POSITIONS: Partial<Record<LocationId, { x: number; y: number }>> = {
  // 主要都市
  alseria:       { x: 42, y: 50 },  // アルセリア王都 (中央)
  galdo:         { x: 55, y: 24 },  // ガルド都市 (北)
  bern:          { x: 67, y: 43 },  // ベルン商業都市 (東)
  elna:          { x: 18, y: 55 },  // エルナの里 (西)
  sahal:         { x: 78, y: 65 },  // サハル砂漠都市 (南東)
  mirea:         { x: 42, y: 80 },  // ミレア港町 (南)

  // 中継地点
  watchtower:    { x: 64, y: 28 },  // 見張り塔
  traveler_inn:  { x: 34, y: 38 },  // 旅人の宿
  checkpoint:    { x: 56, y: 37 },  // 関所
  great_bridge:  { x: 48, y: 62 },  // 大橋
  riverside:     { x: 30, y: 66 },  // 川辺の村
  lighthouse:    { x: 52, y: 88 },  // 灯台岬
  spirit_spring: { x: 20, y: 44 },  // 浅緑の森
  trading_post:  { x: 64, y: 54 },  // 取引所
  coastal_road:  { x: 62, y: 73 },  // 沿岸街道

  // ダンジョン
  forest_entrance: { x: 16, y: 34 }, // 魔獣の森
  demon_mine:      { x: 44, y: 18 }, // 魔鉱山
  dragon_pass:     { x: 57, y: 10 }, // 竜の峠
  bandit_hideout:  { x: 75, y: 52 }, // 盗賊の隠れ家
  ancient_temple:  { x: 10, y: 70 }, // 古代神殿
  desert_ruins:    { x: 88, y: 56 }, // 砂漠遺跡
}

// 地形エリア（ロケーションIDとエリア色の対応）
const TERRAIN: Partial<Record<LocationId, string>> = {
  forest_entrance: 'forest', spirit_spring: 'forest', elna: 'forest', ancient_temple: 'forest',
  demon_mine: 'mountain', dragon_pass: 'mountain', galdo: 'mountain', watchtower: 'mountain',
  desert_ruins: 'desert', sahal: 'desert', bandit_hideout: 'desert',
  mirea: 'sea', lighthouse: 'sea', coastal_road: 'sea',
}

// ロケーション種別アイコン
const LOC_ICON: Partial<Record<LocationId, string>> = {
  alseria: '🏰', galdo: '🏰', bern: '🏛️', elna: '🌲', sahal: '🏜️', mirea: '⚓',
  watchtower: '🗼', traveler_inn: '🏠', checkpoint: '🚧', great_bridge: '🌉',
  riverside: '🏘️', lighthouse: '💡', spirit_spring: '💧', trading_post: '🛒',
  coastal_road: '🛣️', forest_entrance: '⚔️', demon_mine: '⚔️', dragon_pass: '🐉',
  bandit_hideout: '🗡️', ancient_temple: '🏚️', desert_ruins: '💀',
}

const TERRAIN_COLORS: Record<string, string> = {
  forest:   '#2d6a2d',
  mountain: '#5a4a3a',
  desert:   '#b08040',
  sea:      '#1a5a8a',
}

export default function WorldMap({ gs, onTravel, onEnterLocation }: Props) {
  const currentLoc = LOCATIONS[gs.currentLocId]
  const connectedIds = currentLoc.connections
  const finalBossLocked = gs.sealStones.length < 3

  const isDungeon = (id: LocationId) =>
    ['forest_entrance', 'demon_mine', 'dragon_pass', 'bandit_hideout', 'ancient_temple', 'desert_ruins'].includes(id)

  const isCity = (id: LocationId) =>
    ['alseria', 'galdo', 'bern', 'elna', 'sahal', 'mirea'].includes(id)

  return (
    <div className="flex flex-col gap-2 p-2 max-w-2xl mx-auto">

      {/* マップタイトル */}
      <div className="flex items-center gap-2">
        <div className="text-xs font-black text-amber-400 tracking-widest">🗺️ ルミナ大陸 ワールドマップ</div>
        <div className="ml-auto text-xs text-gray-500 font-bold">
          残り<span className="text-amber-300 font-black">{gs.daysLeft}</span>日
        </div>
      </div>

      {/* メインマップエリア */}
      <div
        className="relative border-2 border-amber-800/60 rounded-xl overflow-hidden shadow-2xl"
        style={{ paddingBottom: '70%' }}
      >
        {/* マップ背景（地形グラデーション）*/}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 30% 40% at 15% 42%, #1a5020 0%, transparent 100%),
            radial-gradient(ellipse 25% 35% at 10% 70%, #1a4a18 0%, transparent 100%),
            radial-gradient(ellipse 35% 30% at 55% 12%, #3a2a1a 0%, transparent 100%),
            radial-gradient(ellipse 30% 40% at 85% 60%, #7a5020 0%, transparent 100%),
            radial-gradient(ellipse 25% 30% at 50% 88%, #1a3a6a 0%, transparent 100%),
            linear-gradient(160deg, #2a3518 0%, #3a5028 30%, #4a6030 55%, #3a4a28 75%, #2a3a48 100%)
          `,
        }} />

        {/* 格子のテクスチャ（GBA風）*/}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, transparent 1px, transparent 20px, rgba(255,255,255,0.5) 20px), repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0px, transparent 1px, transparent 20px, rgba(255,255,255,0.5) 20px)',
        }} />

        {/* 接続線 */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
          {/* 道路線（接続関係に基づく）*/}
          {(Object.entries(LOCATIONS) as [LocationId, typeof LOCATIONS[LocationId]][]).map(([id, loc]) =>
            loc.connections.map(connId => {
              const from = MAP_POSITIONS[id as LocationId]
              const to = MAP_POSITIONS[connId]
              if (!from || !to) return null
              // 重複排除（idがconnIdより辞書順で前のペアのみ描画）
              if (id > connId) return null
              const isCurrConn =
                (id === gs.currentLocId && connectedIds.includes(connId as LocationId)) ||
                (connId === gs.currentLocId && connectedIds.includes(id as LocationId))
              return (
                <line
                  key={`${id}-${connId}`}
                  x1={`${from.x}%`} y1={`${from.y}%`}
                  x2={`${to.x}%`} y2={`${to.y}%`}
                  stroke={isCurrConn ? 'rgba(255,200,80,0.85)' : 'rgba(200,180,120,0.30)'}
                  strokeWidth={isCurrConn ? 2.5 : 1.2}
                  strokeDasharray={isCurrConn ? 'none' : '5,4'}
                />
              )
            })
          )}
        </svg>

        {/* ロケーションノード */}
        {(Object.entries(LOCATIONS) as [LocationId, typeof LOCATIONS[LocationId]][]).map(([id, loc]) => {
          const pos = MAP_POSITIONS[id as LocationId]
          if (!pos) return null

          const locId = id as LocationId
          const isCurrent = locId === gs.currentLocId
          const isConnected = connectedIds.includes(locId)
          const isVisited = gs.visitedLocs.includes(locId)
          const isLocked = locId === 'desert_ruins' && finalBossLocked
          const canTravel = isConnected && !isCurrent && !isLocked
          const city = isCity(locId)
          const dungeon = isDungeon(locId)
          const icon = LOC_ICON[locId] ?? '📍'
          const terrain = TERRAIN[locId]
          const terrainColor = terrain ? TERRAIN_COLORS[terrain] : '#3a5028'

          // ノードスタイル
          const nodeSize = isCurrent ? 44 : city ? 38 : dungeon ? 34 : 28
          const borderColor = isCurrent
            ? '#ffd700'
            : canTravel
            ? '#60b8ff'
            : isVisited
            ? '#808880'
            : '#303828'
          const shadowStyle = isCurrent
            ? '0 0 16px 6px rgba(255,215,0,0.8), 0 0 4px rgba(255,215,0,1)'
            : canTravel
            ? '0 0 10px 3px rgba(80,170,255,0.7)'
            : 'none'
          const bgColor = isCurrent
            ? '#c07820'
            : canTravel
            ? '#203060'
            : terrain ? terrainColor : '#303028'
          const opacity = isLocked ? 0.2 : (!isVisited && !canTravel && !isCurrent) ? 0.22 : 1

          return (
            <button
              key={locId}
              disabled={!canTravel}
              onClick={() => canTravel && onTravel(locId)}
              title={`${loc.name}${canTravel ? ` (${loc.travelDays[gs.currentLocId] ?? currentLoc.travelDays[locId]}日)` : ''}`}
              style={{
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: nodeSize,
                height: nodeSize,
                borderRadius: city || isCurrent ? '6px' : dungeon ? '4px' : '50%',
                backgroundColor: bgColor,
                border: `${isCurrent ? 3 : canTravel ? 2.5 : 1.5}px solid ${borderColor}`,
                boxShadow: shadowStyle,
                opacity,
                cursor: canTravel ? 'pointer' : 'default',
                transform: 'translate(-50%, -50%)',
                zIndex: isCurrent ? 20 : canTravel ? 15 : 10,
                transition: 'all 0.2s',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isCurrent ? 18 : city ? 16 : 14,
              }}
            >
              {icon}
            </button>
          )
        })}

        {/* 現在地ラベル */}
        {(() => {
          const pos = MAP_POSITIONS[gs.currentLocId]
          if (!pos) return null
          return (
            <div
              className="absolute z-30 pointer-events-none"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -125%)',
              }}
            >
              <div className="bg-amber-900/95 border border-amber-500 rounded-md px-1.5 py-0.5 text-[9px] font-black text-amber-200 whitespace-nowrap shadow-lg">
                📍 {currentLoc.name}
              </div>
            </div>
          )
        })()}
      </div>

      {/* 凡例 */}
      <div className="flex flex-wrap gap-2 text-[10px] text-gray-400 px-1">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded" style={{ background: '#c07820', border: '2px solid #ffd700' }} />
          <span>現在地</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 rounded-sm" style={{ background: '#203060', border: '2px solid #60b8ff' }} />
          <span>移動可能</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-600 border border-gray-500" />
          <span>訪問済</span>
        </div>
        <div className="flex items-center gap-1">
          <span>⚔️</span><span>ダンジョン</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🏰</span><span>都市</span>
        </div>
      </div>

      {/* 現在地情報パネル */}
      <div className="bg-[#0c0c24] border-2 border-indigo-700 rounded-xl p-3 shadow-xl">
        <div className="text-[10px] font-black text-indigo-400 mb-1.5 tracking-widest">— 現在地 —</div>
        <div className="text-xl font-black text-white mb-1">
          {currentLoc.emoji} {currentLoc.name}
        </div>
        <div className="text-xs text-gray-400 mb-2 leading-relaxed">{currentLoc.desc}</div>

        <div className="flex flex-wrap gap-1 mb-3">
          {currentLoc.hasInn && (
            <span className="text-[10px] font-bold bg-blue-950 border border-blue-700 text-blue-300 px-1.5 py-0.5 rounded-full">🏨 宿屋</span>
          )}
          {currentLoc.shopItems && (
            <span className="text-[10px] font-bold bg-green-950 border border-green-700 text-green-300 px-1.5 py-0.5 rounded-full">🛒 ショップ</span>
          )}
          {currentLoc.sealStone && !gs.sealStones.includes(currentLoc.sealStone) && (
            <span className="text-[10px] font-bold bg-amber-950 border border-amber-700 text-amber-300 px-1.5 py-0.5 rounded-full">💎 封印石</span>
          )}
          {currentLoc.companionId && !gs.companions[currentLoc.companionId].joined && (
            <span className="text-[10px] font-bold bg-purple-950 border border-purple-700 text-purple-300 px-1.5 py-0.5 rounded-full">👤 仲間</span>
          )}
        </div>

        <button
          onClick={onEnterLocation}
          className="w-full py-2.5 bg-indigo-800 hover:bg-indigo-700 border-2 border-indigo-500 text-white font-black rounded-xl transition active:scale-95 text-sm"
        >
          {currentLoc.name}を探索 ▶
        </button>
      </div>

      {/* 封印石進捗 */}
      <div className="bg-[#0c0c24] border-2 border-amber-800/60 rounded-xl p-3">
        <div className="text-[10px] font-black text-amber-500 mb-2 tracking-widest">— 封印石 —</div>
        <div className="flex gap-3">
          {([
            { stone: 'fire' as const, name: '炎', icon: '🔥', loc: '廃鉱山' },
            { stone: 'storm' as const, name: '嵐', icon: '⚡', loc: '竜の峠' },
            { stone: 'dark' as const, name: '闇', icon: '🌑', loc: '古代神殿' },
          ]).map(({ stone, name, icon, loc: locName }) => {
            const obtained = gs.sealStones.includes(stone)
            return (
              <div key={stone} className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-lg border ${
                obtained
                  ? 'border-amber-600 bg-amber-950/40'
                  : 'border-gray-700 bg-gray-900/30 opacity-40'
              }`}>
                <span className={`text-2xl ${obtained ? '' : 'grayscale'}`}>{icon}</span>
                <span className={`text-[9px] font-black ${obtained ? 'text-amber-300' : 'text-gray-500'}`}>
                  {obtained ? name + '取得済' : locName}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
