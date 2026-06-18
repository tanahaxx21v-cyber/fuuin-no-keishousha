'use client'

import type { GameState, LocationId } from '@/lib/game/types'
import { LOCATIONS } from '@/lib/game/data'

interface Props {
  gs: GameState
  onTravel: (destId: LocationId) => void
  onEnterLocation: () => void
  getAvailableConnections?: (locId: LocationId) => LocationId[]
}

// ===== マップ座標 — 重なりを避けた広めの配置 =====
const MAP_POS: Partial<Record<LocationId, { x: number; y: number }>> = {
  demon_mine:      { x: 30, y: 9  },
  dragon_pass:     { x: 55, y: 5  },
  galdo:           { x: 67, y: 18 },
  watchtower:      { x: 59, y: 28 },
  forest_entrance: { x: 10, y: 27 },
  spirit_spring:   { x: 16, y: 41 },
  elna:            { x: 13, y: 57 },
  ancient_temple:  { x: 8,  y: 72 },
  traveler_inn:    { x: 36, y: 25 },
  checkpoint:      { x: 50, y: 35 },
  alseria:         { x: 40, y: 50 },
  great_bridge:    { x: 38, y: 64 },
  riverside:       { x: 26, y: 70 },
  bern:            { x: 74, y: 37 },
  trading_post:    { x: 68, y: 51 },
  bandit_hideout:  { x: 80, y: 60 },
  sahal:           { x: 82, y: 72 },
  desert_ruins:    { x: 92, y: 63 },
  coastal_road:    { x: 60, y: 76 },
  mirea:           { x: 44, y: 83 },
  lighthouse:      { x: 52, y: 89 },
}

const LOC_CFG: Partial<Record<LocationId, { icon: string; color: string; border: string; shape: 'castle'|'town'|'relay'|'dungeon'|'final'; label: string }>> = {
  alseria:         { icon: '🏰', color: '#3a2060', border: '#b090ff', shape: 'castle', label: 'アルセリア' },
  galdo:           { icon: '🏯', color: '#2a3060', border: '#8090ff', shape: 'castle', label: 'ガルド' },
  bern:            { icon: '🏛️', color: '#203a50', border: '#6ab0d0', shape: 'castle', label: 'ベルン' },
  elna:            { icon: '🌲', color: '#1a4020', border: '#60c060', shape: 'town',   label: 'エルナの里' },
  sahal:           { icon: '🏜️', color: '#503a10', border: '#d0a040', shape: 'town',   label: 'サハル' },
  mirea:           { icon: '⚓', color: '#102040', border: '#4080c0', shape: 'town',   label: 'ミレア港' },
  traveler_inn:    { icon: '🏠', color: '#2a2a1a', border: '#90804a', shape: 'relay', label: '旅人の宿' },
  checkpoint:      { icon: '🚧', color: '#2a2020', border: '#907050', shape: 'relay', label: '関所' },
  great_bridge:    { icon: '🌉', color: '#1a2030', border: '#507090', shape: 'relay', label: '大橋' },
  riverside:       { icon: '🌊', color: '#1a2828', border: '#407878', shape: 'relay', label: '川辺の村' },
  watchtower:      { icon: '🗼', color: '#282020', border: '#806040', shape: 'relay', label: '見張り塔' },
  lighthouse:      { icon: '💡', color: '#101828', border: '#305080', shape: 'relay', label: '灯台岬' },
  spirit_spring:   { icon: '💧', color: '#182418', border: '#408040', shape: 'relay', label: '精霊の泉' },
  trading_post:    { icon: '🛒', color: '#282018', border: '#806030', shape: 'relay', label: '交易所' },
  coastal_road:    { icon: '🛣️', color: '#182028', border: '#405868', shape: 'relay', label: '沿岸街道' },
  forest_entrance: { icon: '🌑', color: '#101a10', border: '#40a040', shape: 'dungeon', label: '魔獣の森' },
  demon_mine:      { icon: '⛏️', color: '#1a1010', border: '#d04040', shape: 'dungeon', label: '廃鉱山' },
  dragon_pass:     { icon: '🐉', color: '#1a1020', border: '#a040d0', shape: 'dungeon', label: '竜の峠' },
  bandit_hideout:  { icon: '🗡️', color: '#20180a', border: '#c08020', shape: 'dungeon', label: '盗賊アジト' },
  ancient_temple:  { icon: '🏚️', color: '#181020', border: '#8050c0', shape: 'dungeon', label: '古代神殿' },
  desert_ruins:    { icon: '💀', color: '#201010', border: '#e04040', shape: 'final',   label: '砂漠遺跡' },
}

function getConnectionPairs(): Array<[LocationId, LocationId]> {
  const seen = new Set<string>()
  const pairs: Array<[LocationId, LocationId]> = []
  for (const [id, loc] of Object.entries(LOCATIONS) as [LocationId, typeof LOCATIONS[LocationId]][]) {
    for (const connId of loc.connections) {
      const key = [id, connId].sort().join('|')
      if (!seen.has(key) && MAP_POS[id] && MAP_POS[connId as LocationId]) {
        seen.add(key)
        pairs.push([id, connId as LocationId])
      }
    }
  }
  return pairs
}
const CONN_PAIRS = getConnectionPairs()

// ラベル位置オフセット（ノードからのずれ）
const LABEL_OFFSET: Partial<Record<LocationId, { dx?: number; dy?: number }>> = {
  dragon_pass: { dy: -13 }, demon_mine: { dx: -24, dy: -10 },
  galdo: { dx: 22 }, watchtower: { dx: 22 },
  forest_entrance: { dx: -26 }, spirit_spring: { dx: -28 }, elna: { dx: -24 }, ancient_temple: { dx: -28 },
  traveler_inn: { dy: 13 }, checkpoint: { dx: 22 },
  alseria: { dy: 15 }, great_bridge: { dx: -26 }, riverside: { dx: -24 },
  bern: { dx: 24 }, trading_post: { dx: 24 }, bandit_hideout: { dx: 24 },
  sahal: { dx: 24 }, desert_ruins: { dx: 26 },
  coastal_road: { dy: 13 }, mirea: { dy: 15 }, lighthouse: { dy: 13 },
}

export default function WorldMap({ gs, onTravel, onEnterLocation, getAvailableConnections }: Props) {
  const currentLoc = LOCATIONS[gs.currentLocId]
  const connectedIds = getAvailableConnections
    ? getAvailableConnections(gs.currentLocId)
    : currentLoc.connections
  const finalBossLocked = gs.sealStones.length < 3

  return (
    <div className="flex flex-col gap-2 p-2 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <span className="text-amber-400 font-black text-xs tracking-widest">🗺️ ルミナ大陸</span>
        <div className="ml-auto flex items-center gap-3 text-xs">
          <span className="text-gray-400">残り <span className="text-amber-300 font-black">{gs.daysLeft}</span>日</span>
          <span className="text-gray-400">封印石 <span className="text-amber-300 font-black">{gs.sealStones.length}</span>/3</span>
        </div>
      </div>

      {/* メインマップ */}
      <div className="relative border-2 border-amber-800/60 rounded-xl overflow-hidden shadow-2xl" style={{ paddingBottom: '96%' }}>
        {/* 地形背景 */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 28% 45% at 12% 48%, #1a4020 0%, transparent 70%),
            radial-gradient(ellipse 22% 30% at 10% 72%, #152818 0%, transparent 60%),
            radial-gradient(ellipse 32% 28% at 42% 8%,  #352515 0%, transparent 65%),
            radial-gradient(ellipse 28% 38% at 88% 65%, #402808 0%, transparent 65%),
            radial-gradient(ellipse 28% 25% at 50% 88%, #102030 0%, transparent 60%),
            linear-gradient(165deg, #1e2e10 0%, #2a3a18 25%, #384828 50%, #2e3c22 75%, #182838 100%)
          `,
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          <span style={{ position:'absolute', left:'7%',  top:'19%', fontSize:9, color:'rgba(100,180,100,0.3)', fontWeight:'bold', transform:'rotate(-10deg)' }}>森林地帯</span>
          <span style={{ position:'absolute', left:'35%', top:'2%',  fontSize:9, color:'rgba(150,120,80,0.3)',  fontWeight:'bold' }}>山岳地帯</span>
          <span style={{ position:'absolute', left:'76%', top:'47%', fontSize:9, color:'rgba(200,160,60,0.3)',  fontWeight:'bold', transform:'rotate(5deg)' }}>砂漠地帯</span>
          <span style={{ position:'absolute', left:'30%', top:'88%', fontSize:9, color:'rgba(60,130,200,0.3)',  fontWeight:'bold' }}>沿岸・海域</span>
        </div>

        {/* 接続線 */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 3 }}>
          {CONN_PAIRS.map(([a, b]) => {
            const from = MAP_POS[a]!
            const to   = MAP_POS[b]!
            const isActive =
              (a === gs.currentLocId && connectedIds.includes(b)) ||
              (b === gs.currentLocId && connectedIds.includes(a))
            return (
              <g key={`${a}-${b}`}>
                <line x1={`${from.x}%`} y1={`${from.y}%`} x2={`${to.x}%`} y2={`${to.y}%`}
                  stroke="rgba(0,0,0,0.6)" strokeWidth={isActive ? 5 : 3} />
                <line x1={`${from.x}%`} y1={`${from.y}%`} x2={`${to.x}%`} y2={`${to.y}%`}
                  stroke={isActive ? 'rgba(255,210,80,0.95)' : 'rgba(180,160,100,0.25)'}
                  strokeWidth={isActive ? 3 : 1.5}
                  strokeDasharray={isActive ? 'none' : '6,5'} />
              </g>
            )
          })}
        </svg>

        {/* ロケーションノード */}
        {(Object.entries(MAP_POS) as [LocationId, { x: number; y: number }][]).map(([locId, pos]) => {
          const loc = LOCATIONS[locId]; if (!loc) return null
          const cfg = LOC_CFG[locId]
          const isCurrent   = locId === gs.currentLocId
          const isConnected = connectedIds.includes(locId)
          const isVisited   = gs.visitedLocs.includes(locId)
          const isLocked    = locId === 'desert_ruins' && finalBossLocked
          const canTravel   = isConnected && !isCurrent && !isLocked
          const shape = cfg?.shape ?? 'relay'
          const isCastle = shape === 'castle' || shape === 'final'
          const isDungeon = shape === 'dungeon'
          const size = shape === 'final' ? 42 : isCurrent ? 40 : isCastle ? 36 : isDungeon ? 30 : 26
          const bg     = isCurrent ? '#7a5010' : canTravel ? '#1a3a60' : cfg?.color ?? '#1e1e1e'
          const border = isCurrent ? '#ffd000' : canTravel ? '#60c0ff' : isLocked ? '#303030' : cfg?.border ?? '#505050'
          const glow   = isCurrent ? '0 0 14px 5px rgba(255,210,0,0.9)' : canTravel ? '0 0 10px 3px rgba(80,180,255,0.75)' : 'none'
          const opacity = isLocked ? 0.15 : (!isVisited && !canTravel && !isCurrent) ? 0.2 : 1
          const lo = LABEL_OFFSET[locId] ?? {}
          const days = loc.travelDays[gs.currentLocId] ?? (canTravel ? currentLoc.travelDays[locId] : undefined)

          return (
            <div key={locId} style={{ position:'absolute', left:`${pos.x}%`, top:`${pos.y}%`, transform:'translate(-50%,-50%)', zIndex: isCurrent ? 25 : canTravel ? 18 : 10, opacity }}>
              <button
                disabled={!canTravel}
                onClick={() => canTravel && onTravel(locId)}
                title={loc.name}
                style={{
                  width: size, height: size,
                  borderRadius: shape === 'final' ? '6px' : isCastle ? '8px' : isDungeon ? '4px' : '50%',
                  backgroundColor: bg, border: `${isCurrent ? 3 : 2}px solid ${border}`,
                  boxShadow: glow, cursor: canTravel ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: shape === 'final' ? 20 : isCastle ? 18 : isDungeon ? 15 : 13,
                  transition: 'all 0.15s', padding: 0, position: 'relative',
                }}
                className={canTravel ? 'hover:scale-110 active:scale-95' : ''}
              >
                {cfg?.icon ?? '📍'}
                {isVisited && !isCurrent && (
                  <span style={{ position:'absolute', top:-4, right:-4, fontSize:8, background:'#204820', border:'1px solid #40a040', borderRadius:'50%', width:10, height:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#60c060', fontWeight:'bold' }}>✓</span>
                )}
                {canTravel && days !== undefined && (
                  <span style={{ position:'absolute', bottom:-7, left:'50%', transform:'translateX(-50%)', fontSize:8, background:'#0a2040', border:'1px solid #4080c0', borderRadius:4, padding:'0 3px', color:'#80c8ff', fontWeight:'bold', whiteSpace:'nowrap' }}>{days}日</span>
                )}
                {loc.sealStone && !gs.sealStones.includes(loc.sealStone) && (
                  <span style={{ position:'absolute', top:-5, left:-5, fontSize:10 }}>💎</span>
                )}
                {loc.sealStone && gs.sealStones.includes(loc.sealStone) && (
                  <span style={{ position:'absolute', top:-5, left:-5, fontSize:10 }}>✅</span>
                )}
              </button>
              {/* ラベル */}
              <div style={{
                position:'absolute',
                left: lo.dx ? (lo.dx > 0 ? `calc(50% + ${size/2 + 3}px)` : `calc(50% - ${size/2 + 3}px)`) : '50%',
                top:  lo.dy !== undefined ? `calc(50% + ${lo.dy}px)` : `calc(50% + ${size/2 + 3}px)`,
                transform: lo.dx ? (lo.dx > 0 ? 'translateY(-50%)' : 'translate(-100%,-50%)') : 'translateX(-50%)',
                pointerEvents: 'none', zIndex: 30, whiteSpace: 'nowrap',
              }}>
                <span style={{
                  display:'inline-block', fontSize: isCurrent ? 10 : isCastle ? 9.5 : 8.5,
                  fontWeight: isCurrent ? '900' : isCastle ? '800' : '700',
                  color: isCurrent ? '#ffd060' : canTravel ? '#90d8ff' : isVisited ? '#909880' : '#60605a',
                  background:'rgba(0,0,0,0.72)', borderRadius:3, padding:'1px 3px',
                  border: isCurrent ? '1px solid rgba(255,208,80,0.4)' : 'none',
                }}>
                  {isCurrent ? '📍 ' : ''}{cfg?.label ?? loc.name}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 凡例 */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-gray-400 px-1">
        {[
          { s:{ width:12, height:12, borderRadius:4, background:'#3a2060', border:'2px solid #ffd000' }, l:'現在地' },
          { s:{ width:10, height:10, borderRadius:3, background:'#1a3a60', border:'1.5px solid #60c0ff' }, l:'移動可能' },
          { s:{ width:10, height:10, borderRadius:'50%', background:'#1e1e1e', border:'1.5px solid #505050' }, l:'未訪問' },
          { s:{ width:10, height:10, borderRadius:2, background:'#1a1010', border:'1.5px solid #d04040' }, l:'ダンジョン' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1"><div style={item.s} /><span>{item.l}</span></div>
        ))}
        <div className="flex items-center gap-1"><span>💎</span><span>封印石</span></div>
        <div className="flex items-center gap-1">
          <span style={{fontSize:8,background:'#0a2040',border:'1px solid #4080c0',borderRadius:3,padding:'0 2px',color:'#80c8ff'}}>N日</span>
          <span>移動日数</span>
        </div>
      </div>

      {/* 現在地パネル */}
      <div className="bg-[#0c0c24] border-2 border-indigo-700 rounded-xl p-3 shadow-xl">
        <div className="text-[10px] font-black text-indigo-400 mb-1.5 tracking-widest">— 現在地 —</div>
        <div className="text-xl font-black text-white mb-1">{currentLoc.emoji} {currentLoc.name}</div>
        <div className="text-xs text-gray-400 mb-2 leading-relaxed">{currentLoc.desc}</div>
        <div className="flex flex-wrap gap-1 mb-3">
          {currentLoc.hasInn && <span className="text-[10px] font-bold bg-blue-950 border border-blue-700 text-blue-300 px-1.5 py-0.5 rounded-full">🏨 宿屋</span>}
          {currentLoc.shopItems && <span className="text-[10px] font-bold bg-green-950 border border-green-700 text-green-300 px-1.5 py-0.5 rounded-full">🛒 ショップ</span>}
          {currentLoc.sealStone && !gs.sealStones.includes(currentLoc.sealStone) && <span className="text-[10px] font-bold bg-amber-950 border border-amber-700 text-amber-300 px-1.5 py-0.5 rounded-full">💎 封印石あり</span>}
          {currentLoc.companionId && !gs.companions[currentLoc.companionId].joined && <span className="text-[10px] font-bold bg-purple-950 border border-purple-700 text-purple-300 px-1.5 py-0.5 rounded-full">👤 仲間が待っている</span>}
        </div>
        <button onClick={onEnterLocation} className="w-full py-2.5 bg-indigo-800 hover:bg-indigo-700 border-2 border-indigo-500 text-white font-black rounded-xl transition active:scale-95 text-sm">
          {currentLoc.name}を探索 ▶
        </button>
      </div>

      {/* 封印石進捗 */}
      <div className="bg-[#0c0c24] border-2 border-amber-800/60 rounded-xl p-3">
        <div className="text-[10px] font-black text-amber-500 mb-2 tracking-widest">— 封印石の進捗 —</div>
        <div className="flex gap-2">
          {([
            { stone:'fire'  as const, name:'炎の封印石', icon:'🔥', loc:'廃鉱山' },
            { stone:'storm' as const, name:'嵐の封印石', icon:'⚡', loc:'竜の峠' },
            { stone:'dark'  as const, name:'闇の封印石', icon:'🌑', loc:'古代神殿' },
          ]).map(({ stone, name, icon, loc: locName }) => {
            const obtained = gs.sealStones.includes(stone)
            return (
              <div key={stone} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border transition-all ${obtained ? 'border-amber-500 bg-amber-950/50' : 'border-gray-700 bg-gray-900/20 opacity-40 grayscale'}`}>
                <span className="text-2xl">{icon}</span>
                <span className={`text-[9px] font-black text-center leading-tight ${obtained ? 'text-amber-300' : 'text-gray-500'}`}>
                  {obtained ? name : locName + 'で入手'}
                </span>
              </div>
            )
          })}
        </div>
        {gs.sealStones.length < 3 && (
          <div className="mt-2 text-[10px] text-gray-500 text-center">あと{3 - gs.sealStones.length}個集めれば砂漠遺跡に入れる</div>
        )}
      </div>
    </div>
  )
}
