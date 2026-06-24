import type { GameState } from './types'

export interface AchievementDef {
  id: string
  icon: string
  title: string
  desc: string
  check: (gs: GameState) => boolean
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'first_companion', icon: '🤝', title: '最初の出会い',   desc: '最初の仲間を仲間にした',        check: gs => Object.values(gs.companions).some(c => c.joined) },
  { id: 'full_party',      icon: '👥', title: '完全パーティ',   desc: '3人の仲間と旅した',            check: gs => gs.party.length >= 3 },
  { id: 'first_boss',      icon: '⚔️', title: '初討伐',         desc: '最初のボスを倒した',           check: gs => gs.defeatedBosses.length >= 1 },
  { id: 'three_bosses',    icon: '🏹', title: '討伐者',         desc: '3体のボスを倒した',            check: gs => gs.defeatedBosses.length >= 3 },
  { id: 'all_bosses',      icon: '👑', title: '伝説の討伐者',   desc: '全6体のボスを倒した',          check: gs => gs.defeatedBosses.length >= 6 },
  { id: 'first_stone',     icon: '💎', title: '封印の欠片',     desc: '最初の封印石を入手',           check: gs => gs.sealStones.length >= 1 },
  { id: 'two_stones',      icon: '🔮', title: '封印の継承',     desc: '2つの封印石を入手',            check: gs => gs.sealStones.length >= 2 },
  { id: 'all_stones',      icon: '✨', title: '三石揃いし者',   desc: '全ての封印石を入手',           check: gs => gs.sealStones.length >= 3 },
  { id: 'explorer_10',     icon: '🧭', title: '旅人',           desc: '10か所を訪問した',             check: gs => gs.visitedLocs.length >= 10 },
  { id: 'explorer_all',    icon: '🗺️', title: '大陸踏破',       desc: 'ルミナ大陸21か所を全て訪問',  check: gs => gs.visitedLocs.length >= 21 },
  { id: 'event_10',        icon: '📜', title: '記録者',         desc: '10件以上のイベントを体験',     check: gs => gs.completedEvents.length >= 10 },
  { id: 'event_30',        icon: '📖', title: '語り部',         desc: '30件以上のイベントを体験',     check: gs => gs.completedEvents.length >= 30 },
  { id: 'event_50',        icon: '📚', title: '大いなる語り部', desc: '50件以上のイベントを体験',     check: gs => gs.completedEvents.length >= 50 },
  { id: 'level_10',        icon: '⭐', title: '修行者',         desc: 'Lv10に到達した',              check: gs => gs.playerLevel >= 10 },
  { id: 'level_20',        icon: '🌟', title: '覚醒の勇者',     desc: 'Lv20に到達した',              check: gs => gs.playerLevel >= 20 },
  { id: 'rich_500',        icon: '💰', title: '商売人',         desc: '500G以上保持した',            check: gs => gs.gold >= 500 },
  { id: 'rich_2000',       icon: '💎', title: '大富豪',         desc: '2000G以上保持した',           check: gs => gs.gold >= 2000 },
  { id: 'zeno',            icon: '😈', title: '謎の魔族の絆',   desc: 'ゼノを仲間にした（隠しキャラ）', check: gs => gs.companions.zeno?.joined === true },
  { id: 'no_death',        icon: '💚', title: '誰も失わなかった', desc: '仲間が誰も死なずに3人加入',  check: gs => {
    const joined = Object.values(gs.companions).filter(c => c.joined)
    return joined.length >= 3 && joined.every(c => c.alive)
  }},
  { id: 'solo',            icon: '🗡️', title: '孤独な戦士',     desc: '仲間なしで2体以上のボスを倒した', check: gs => gs.party.length === 0 && gs.defeatedBosses.length >= 2 },
]
