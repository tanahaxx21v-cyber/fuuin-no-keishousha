'use client'

import type { GameState } from '@/lib/game/types'
import { COMPANIONS, getDifficultyMultiplier } from '@/lib/game/data'
import { ACHIEVEMENT_DEFS } from '@/lib/game/achievements'

interface Props {
  gs: GameState
  onClose: () => void
}

const BOSS_INFO: { id: string; name: string; emoji: string; location: string }[] = [
  { id: 'bandit_king',  name: '盗賊王カルド',             emoji: '🗡️', location: '盗賊アジト' },
  { id: 'mine_king',   name: '鉱王グラドル',             emoji: '💎', location: '廃鉱山' },
  { id: 'tidal_king',  name: '潮王ネブラ',               emoji: '🐳', location: '灯台岬' },
  { id: 'storm_dragon',name: '嵐竜ストームレックス',     emoji: '🌩️', location: '竜の峠' },
  { id: 'forest_king', name: '森王モルガ',               emoji: '🦌', location: '古代神殿' },
  { id: 'archive',     name: '終末記録体アーカイブ',     emoji: '📚', location: '砂漠遺跡' },
]

export default function AlbumScreen({ gs, onClose }: Props) {
  const totalDays = getDifficultyMultiplier(gs.difficulty).days
  const elapsedDays = totalDays - gs.daysLeft
  const joinedCompanions = Object.values(gs.companions).filter(c => c.joined)
  const deadCompanions = joinedCompanions.filter(c => !c.alive)
  const aliveCompanions = joinedCompanions.filter(c => c.alive)

  const unlockedAchs = ACHIEVEMENT_DEFS.filter(a => a.check(gs))
  const lockedAchs = ACHIEVEMENT_DEFS.filter(a => !a.check(gs))

  return (
    <div className="p-3 max-w-lg mx-auto flex flex-col gap-3">

      {/* Header */}
      <div className="bg-[#0c0c24] border-2 border-amber-700 p-4 flex items-center gap-3">
        <button
          onClick={onClose}
          className="text-xs font-bold text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 transition"
        >
          ← もどる
        </button>
        <h2 className="text-xl font-black text-white">📚 冒険記録</h2>
        <div className="ml-auto text-xs text-amber-400 font-bold">
          {elapsedDays}日目
        </div>
      </div>

      {/* 旅の統計 */}
      <div className="bg-[#0c0c24] border-2 border-indigo-700 p-4">
        <div className="text-xs font-black text-indigo-400 mb-3 tracking-widest">— 旅の記録 —</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 p-2 text-center">
            <div className="text-[10px] text-gray-500 font-bold">経過日数</div>
            <div className="text-xl font-black text-amber-300">{elapsedDays}<span className="text-xs text-gray-600">/{totalDays}日</span></div>
            <div className="w-full h-1.5 bg-gray-800 mt-1 overflow-hidden">
              <div className="h-full bg-amber-600" style={{ width: `${Math.min(100, (elapsedDays / totalDays) * 100)}%` }} />
            </div>
          </div>
          <div className="bg-slate-900 p-2 text-center">
            <div className="text-[10px] text-gray-500 font-bold">訪問拠点</div>
            <div className="text-xl font-black text-cyan-300">{gs.visitedLocs.length}<span className="text-xs text-gray-600">/21</span></div>
            <div className="w-full h-1.5 bg-gray-800 mt-1 overflow-hidden">
              <div className="h-full bg-cyan-700" style={{ width: `${Math.min(100, (gs.visitedLocs.length / 21) * 100)}%` }} />
            </div>
          </div>
          <div className="bg-slate-900 p-2 text-center">
            <div className="text-[10px] text-gray-500 font-bold">体験イベント</div>
            <div className="text-xl font-black text-purple-300">{gs.completedEvents.length}<span className="text-xs text-gray-600">件</span></div>
          </div>
          <div className="bg-slate-900 p-2 text-center">
            <div className="text-[10px] text-gray-500 font-bold">所持金</div>
            <div className="text-xl font-black text-yellow-300">{gs.gold}<span className="text-xs text-gray-600">G</span></div>
          </div>
        </div>
      </div>

      {/* 封印石 */}
      <div className="bg-[#0c0c24] border-2 border-amber-700 p-3">
        <div className="text-xs font-black text-amber-500 mb-2 tracking-widest">— 封印石 {gs.sealStones.length}/3 —</div>
        <div className="flex gap-3 justify-around">
          {[
            { id: 'fire' as const,  icon: '🔥', name: '炎の封印石',  glow: 'rgba(239,68,68,0.4)', border: '#b91c1c' },
            { id: 'storm' as const, icon: '⚡', name: '嵐の封印石',  glow: 'rgba(59,130,246,0.4)', border: '#1d4ed8' },
            { id: 'dark' as const,  icon: '🌑', name: '闇の封印石',  glow: 'rgba(168,85,247,0.4)', border: '#7e22ce' },
          ].map(s => {
            const has = gs.sealStones.includes(s.id)
            return (
              <div key={s.id} className="flex flex-col items-center gap-1">
                <div
                  className={`w-12 h-12 border-2 flex items-center justify-center text-2xl transition-all ${has ? '' : 'grayscale opacity-30'}`}
                  style={has ? { borderColor: s.border, animation: 'pulse 2s ease-in-out infinite' } : { borderColor: '#374151', backgroundColor: '#111827' }}
                >{s.icon}</div>
                <div className={`text-[9px] font-bold ${has ? 'text-amber-300' : 'text-gray-600'}`}>{has ? '✅ ' : '✗ '}{s.name}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ボス討伐 */}
      <div className="bg-[#0c0c24] border-2 border-red-900 p-3">
        <div className="text-xs font-black text-red-400 mb-2 tracking-widest">— ボス討伐 {gs.defeatedBosses.length}/6 —</div>
        <div className="grid grid-cols-2 gap-1.5">
          {BOSS_INFO.map(b => {
            const defeated = gs.defeatedBosses.includes(b.id)
            return (
              <div key={b.id} className={`flex items-center gap-2 px-2 py-1.5 border ${
                defeated ? 'bg-amber-950/40 border-amber-700/60' : 'bg-gray-900/50 border-gray-800 opacity-50'
              }`}>
                <span className="text-base">{b.emoji}</span>
                <div className="min-w-0">
                  <div className={`text-[10px] font-black truncate ${defeated ? 'text-white' : 'text-gray-600 line-through'}`}>{b.name}</div>
                  <div className="text-[9px] text-gray-600">{b.location}</div>
                </div>
                {defeated && <span className="text-[10px] text-amber-400 ml-auto shrink-0">👑</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* 仲間 */}
      {joinedCompanions.length > 0 && (
        <div className="bg-[#0c0c24] border-2 border-indigo-700 p-3">
          <div className="text-xs font-black text-indigo-400 mb-2 tracking-widest">— 仲間たち —</div>
          <div className="flex flex-col gap-1.5">
            {aliveCompanions.map(c => {
              const def = COMPANIONS[c.id]
              const hpPct = c.hp / c.maxHp * 100
              return (
                <div key={c.id} className="flex items-center gap-2 bg-slate-900 px-2 py-1.5">
                  <span className="text-lg">{def?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white">{def?.name}</span>
                      <span className="text-[9px] text-purple-400 font-bold">Lv{c.level}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-16 h-1.5 bg-gray-800 rounded-sm overflow-hidden">
                        <div className={`h-full ${hpPct > 50 ? 'bg-green-600' : hpPct > 25 ? 'bg-yellow-600' : 'bg-red-700'}`} style={{ width: `${hpPct}%` }} />
                      </div>
                      <span className="text-[9px] text-gray-500">{c.hp}/{c.maxHp}</span>
                    </div>
                  </div>
                </div>
              )
            })}
            {deadCompanions.map(c => {
              const def = COMPANIONS[c.id]
              return (
                <div key={c.id} className="flex items-center gap-2 bg-red-950/20 border border-red-900/40 px-2 py-1.5 opacity-60">
                  <span className="text-lg grayscale">{def?.emoji}</span>
                  <span className="text-xs text-gray-600 line-through font-bold">{def?.name} Lv{c.level}</span>
                  <span className="text-[9px] text-red-700 ml-auto">💀 永眠</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 実績 */}
      <div className="bg-[#0c0c24] border-2 border-amber-800 p-3">
        <div className="text-xs font-black text-amber-500 mb-2 tracking-widest">— 実績 {unlockedAchs.length}/{ACHIEVEMENT_DEFS.length} —</div>
        <div className="flex flex-col gap-1.5">
          {unlockedAchs.map(a => (
            <div key={a.id} className="flex items-center gap-2 bg-amber-950/30 border border-amber-700/50 px-2 py-1.5">
              <span className="text-base">{a.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-amber-200">{a.title}</div>
                <div className="text-[9px] text-gray-500">{a.desc}</div>
              </div>
              <span className="text-[10px] text-amber-400 font-bold shrink-0">✅</span>
            </div>
          ))}
          {lockedAchs.map(a => (
            <div key={a.id} className="flex items-center gap-2 bg-gray-900/30 border border-gray-800 px-2 py-1.5 opacity-50">
              <span className="text-base grayscale">{a.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-gray-600">{a.title}</div>
                <div className="text-[9px] text-gray-700">{a.desc}</div>
              </div>
              <span className="text-[10px] text-gray-700 font-bold shrink-0">🔒</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
