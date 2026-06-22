'use client'

import type { GameState } from '@/lib/game/types'
import { COMPANIONS, getDifficultyMultiplier } from '@/lib/game/data'

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

const ACHIEVEMENT_DEFS: { id: string; icon: string; title: string; desc: string; check: (gs: GameState) => boolean }[] = [
  { id: 'first_companion', icon: '🤝', title: '最初の出会い', desc: '最初の仲間を仲間にした', check: gs => Object.values(gs.companions).some(c => c.joined) },
  { id: 'full_party',      icon: '👥', title: '完全パーティ', desc: '3人の仲間と一緒に旅した', check: gs => gs.party.length >= 3 },
  { id: 'first_boss',      icon: '⚔️', title: '初討伐',       desc: '最初のボスを倒した',    check: gs => gs.defeatedBosses.length >= 1 },
  { id: 'three_bosses',    icon: '🏹', title: '討伐者',       desc: '3体のボスを倒した',     check: gs => gs.defeatedBosses.length >= 3 },
  { id: 'first_stone',     icon: '💎', title: '封印の欠片',   desc: '最初の封印石を入手',   check: gs => gs.sealStones.length >= 1 },
  { id: 'two_stones',      icon: '🔮', title: '封印の継承',   desc: '2つの封印石を入手',    check: gs => gs.sealStones.length >= 2 },
  { id: 'all_stones',      icon: '✨', title: '三石揃いし者', desc: '全ての封印石を入手',   check: gs => gs.sealStones.length >= 3 },
  { id: 'explorer_10',     icon: '🧭', title: '旅人',         desc: '10か所を訪問した',      check: gs => gs.visitedLocs.length >= 10 },
  { id: 'explorer_15',     icon: '🗺️', title: '冒険家',       desc: '15か所を訪問した',      check: gs => gs.visitedLocs.length >= 15 },
  { id: 'event_10',        icon: '📜', title: '記録者',       desc: '10件以上のイベント体験', check: gs => gs.completedEvents.length >= 10 },
  { id: 'event_30',        icon: '📖', title: '語り部',       desc: '30件以上のイベント体験', check: gs => gs.completedEvents.length >= 30 },
  { id: 'level_15',        icon: '⭐', title: '修行者',       desc: 'Lv15に到達した',        check: gs => gs.playerLevel >= 15 },
  { id: 'level_20',        icon: '🌟', title: '覚醒の勇者',   desc: 'Lv20に到達した',        check: gs => gs.playerLevel >= 20 },
  { id: 'rich_500',        icon: '💰', title: '商売人',       desc: '500G以上保持した',      check: gs => gs.gold >= 500 },
  { id: 'zeno',            icon: '😈', title: '謎の魔族の絆', desc: 'ゼノを仲間にした',      check: gs => gs.companions.zeno?.joined === true },
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
      <div className="bg-[#0c0c24] border-2 border-amber-700 rounded-xl p-4 flex items-center gap-3">
        <button
          onClick={onClose}
          className="text-xs font-bold text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 rounded-lg transition"
        >
          ← もどる
        </button>
        <h2 className="text-xl font-black text-white">📚 冒険記録</h2>
        <div className="ml-auto text-xs text-amber-400 font-bold">
          {elapsedDays}日目
        </div>
      </div>

      {/* 旅の統計 */}
      <div className="bg-[#0c0c24] border-2 border-indigo-700 rounded-xl p-4">
        <div className="text-xs font-black text-indigo-400 mb-3 tracking-widest">— 旅の記録 —</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 rounded-lg p-2 text-center">
            <div className="text-[10px] text-gray-500 font-bold">経過日数</div>
            <div className="text-xl font-black text-amber-300">{elapsedDays}<span className="text-xs text-gray-600">/{totalDays}日</span></div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-amber-600 rounded-full" style={{ width: `${Math.min(100, (elapsedDays / totalDays) * 100)}%` }} />
            </div>
          </div>
          <div className="bg-slate-900 rounded-lg p-2 text-center">
            <div className="text-[10px] text-gray-500 font-bold">訪問拠点</div>
            <div className="text-xl font-black text-cyan-300">{gs.visitedLocs.length}<span className="text-xs text-gray-600">/21</span></div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-cyan-700 rounded-full" style={{ width: `${Math.min(100, (gs.visitedLocs.length / 21) * 100)}%` }} />
            </div>
          </div>
          <div className="bg-slate-900 rounded-lg p-2 text-center">
            <div className="text-[10px] text-gray-500 font-bold">体験イベント</div>
            <div className="text-xl font-black text-purple-300">{gs.completedEvents.length}<span className="text-xs text-gray-600">件</span></div>
          </div>
          <div className="bg-slate-900 rounded-lg p-2 text-center">
            <div className="text-[10px] text-gray-500 font-bold">所持金</div>
            <div className="text-xl font-black text-yellow-300">{gs.gold}<span className="text-xs text-gray-600">G</span></div>
          </div>
        </div>
      </div>

      {/* 封印石 */}
      <div className="bg-[#0c0c24] border-2 border-amber-700 rounded-xl p-3">
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
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl transition-all ${has ? '' : 'grayscale opacity-30'}`}
                  style={has ? { borderColor: s.border, boxShadow: `0 0 16px ${s.glow}`, animation: 'pulse 2s ease-in-out infinite' } : { borderColor: '#374151', backgroundColor: '#111827' }}
                >{s.icon}</div>
                <div className={`text-[9px] font-bold ${has ? 'text-amber-300' : 'text-gray-600'}`}>{has ? '✅ ' : '✗ '}{s.name}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ボス討伐 */}
      <div className="bg-[#0c0c24] border-2 border-red-900 rounded-xl p-3">
        <div className="text-xs font-black text-red-400 mb-2 tracking-widest">— ボス討伐 {gs.defeatedBosses.length}/6 —</div>
        <div className="grid grid-cols-2 gap-1.5">
          {BOSS_INFO.map(b => {
            const defeated = gs.defeatedBosses.includes(b.id)
            return (
              <div key={b.id} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 border ${
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
        <div className="bg-[#0c0c24] border-2 border-indigo-700 rounded-xl p-3">
          <div className="text-xs font-black text-indigo-400 mb-2 tracking-widest">— 仲間たち —</div>
          <div className="flex flex-col gap-1.5">
            {aliveCompanions.map(c => {
              const def = COMPANIONS[c.id]
              const hpPct = c.hp / c.maxHp * 100
              return (
                <div key={c.id} className="flex items-center gap-2 bg-slate-900 rounded-lg px-2 py-1.5">
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
                <div key={c.id} className="flex items-center gap-2 bg-red-950/20 border border-red-900/40 rounded-lg px-2 py-1.5 opacity-60">
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
      <div className="bg-[#0c0c24] border-2 border-amber-800 rounded-xl p-3">
        <div className="text-xs font-black text-amber-500 mb-2 tracking-widest">— 実績 {unlockedAchs.length}/{ACHIEVEMENT_DEFS.length} —</div>
        <div className="flex flex-col gap-1.5">
          {unlockedAchs.map(a => (
            <div key={a.id} className="flex items-center gap-2 bg-amber-950/30 border border-amber-700/50 rounded-lg px-2 py-1.5">
              <span className="text-base">{a.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-amber-200">{a.title}</div>
                <div className="text-[9px] text-gray-500">{a.desc}</div>
              </div>
              <span className="text-[10px] text-amber-400 font-bold shrink-0">✅</span>
            </div>
          ))}
          {lockedAchs.map(a => (
            <div key={a.id} className="flex items-center gap-2 bg-gray-900/30 border border-gray-800 rounded-lg px-2 py-1.5 opacity-50">
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
