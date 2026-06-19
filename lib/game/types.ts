export type GamePhase =
  | 'title' | 'prologue' | 'worldmap' | 'location'
  | 'battle' | 'shop' | 'party_manage' | 'event' | 'win' | 'gameover'

// ===== EVENTS =====
export interface DialogueLine {
  speaker: string
  speakerName: string
  text: string
}

export interface EventCondition {
  atLoc: LocationId
  requiredCompanions?: string[]
  anyCompanion?: string[]
  maxDaysLeft?: number
  minDaysLeft?: number
  requiredSeals?: ('fire'|'storm'|'dark')[]
  requiredDefeated?: string[]
  minPlayerLevel?: number
  requiredEventCompleted?: string[]  // 前提イベントID（連続イベント用）
  blockIfEventCompleted?: string[]   // これらが完了済みなら発生しない
  minVisitCount?: number             // 訪問回数が指定値以上の時に発生
}

export interface EventReward {
  gold?: number
  exp?: number
  itemId?: string
  itemQty?: number
  fullHeal?: boolean   // パーティ全員HP/MPを全回復
  message: string
}

export interface BranchOption {
  label: string
  reward?: EventReward
  winChance?: number      // 0〜1の確率でrewardを得る（省略時は100%）
  loseReward?: EventReward // winChance失敗時の報酬
  cost?: number           // 選択に必要なG（不足時はブロック）
}

export interface EventBranch {
  prompt: string
  options: BranchOption[]
}

export interface GameEvent {
  id: string
  title: string
  condition: EventCondition
  dialogues: DialogueLine[]
  reward?: EventReward
  branch?: EventBranch  // 最後のセリフ後に選択肢表示
}

export type Difficulty = 'easy' | 'normal' | 'hard'

export type LocationId =
  // 6 towns
  | 'alseria'        // アルセリア王都 ①
  | 'bern'           // ベルン商業都市 ②
  | 'sahal'          // サハル砂漠都市 ③
  | 'mirea'          // ミレア港町 ④
  | 'elna'           // エルナの里 ⑤
  | 'galdo'          // ガルド皆都市 ⑥
  // 9 relay points
  | 'traveler_inn'   // 旅人の宿
  | 'checkpoint'     // 東関所
  | 'great_bridge'   // 大橋
  | 'riverside'      // 川辺の村
  | 'watchtower'     // 見張り塔
  | 'spirit_spring'  // 精霊の泉
  | 'trading_post'   // 交易所
  | 'coastal_road'   // 海岸街道
  | 'forest_entrance'// 森の入口
  // dungeons & special
  | 'lighthouse'     // 灯台岬（潮王ネブラ）
  | 'demon_mine'     // 廃鉱山（炎の封印石）
  | 'dragon_pass'    // 竜の峠（嵐の封印石）
  | 'bandit_hideout' // 盗賊アジト
  | 'ancient_temple' // 古代神殿（闇の封印石）
  | 'desert_ruins'   // 砂漠遺跡（魔王最終決戦）

export type CompanionId =
  | 'gares'   // ガレス 騎士
  | 'liz'     // リズ 神官
  | 'noa'     // ノア 弓使い
  | 'cecil'   // セシル 魔法使い
  | 'bram'    // ブラム 戦士
  | 'finn'    // フィン 見習い剣士
  | 'vais'    // ヴァイス 元盗賊団長
  | 'logan'   // ローガン 元処刑人
  | 'iris'    // イリス 元魔王軍魔導士
  | 'sig'     // シグ 詐欺師
  | 'elk'     // エルク 獣人・槍使い
  | 'mira'    // ミラ エルフ・弓術士
  | 'zeno'    // ゼノ 隠しキャラ・魔族

export type SealStone = 'fire' | 'storm' | 'dark'

export type StatusEffectId = 'poison' | 'stun' | 'atk_up' | 'def_up' | 'atk_down'

export interface StatusEffect {
  id: StatusEffectId
  name: string
  turnsLeft: number
}

export interface Skill {
  id: string
  name: string
  desc: string
  mpCost: number
  target: 'enemy_one' | 'enemy_all' | 'ally_one' | 'ally_all' | 'self'
  effect: 'damage' | 'heal' | 'poison' | 'stun' | 'atk_up' | 'def_up' | 'debuff_atk' | 'boss_bonus'
  power: number
}

export interface LevelSkill {
  level: number
  skill: Skill
}

export interface CompanionDef {
  id: CompanionId
  name: string
  cls: string
  emoji: string
  desc: string
  joinLocId: LocationId
  joinText: string
  baseHp: number
  baseMp: number
  baseAtk: number
  baseDef: number
  baseSpd: number
  joinLevel: number
  skills: Skill[]
  isHidden?: boolean
  // Per-level stat growth
  hpGrowth: number
  mpGrowth: number
  atkGrowth: number
  defGrowth: number
  spdGrowth: number
  learnableSkills?: LevelSkill[]
}

export interface EnemyDef {
  id: string
  name: string
  emoji: string
  hp: number
  mp: number
  atk: number
  def: number
  spd: number
  skills: Skill[]
  exp: number
  gold: number
  isBoss?: boolean
  sealStone?: SealStone
}

export interface ItemDef {
  id: string
  name: string
  emoji: string
  desc: string
  effect: 'heal_hp' | 'heal_mp' | 'heal_both' | 'cure_status'
  power: number
  price: number
}

export interface LocationDef {
  id: LocationId
  name: string
  emoji: string
  type: 'town' | 'relay' | 'dungeon' | 'castle'
  desc: string
  connections: LocationId[]
  travelDays: Partial<Record<LocationId, number>>
  companionId?: CompanionId
  sealStone?: SealStone
  enemyPool?: string[]
  bossId?: string
  shopItems?: string[]
  hasInn?: boolean
  requireAllStones?: boolean
  travelEnemyPool?: string[]
}

// ===== Runtime State =====

export interface CompanionState {
  id: CompanionId
  joined: boolean
  alive: boolean
  inParty: boolean
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  atk: number
  def: number
  spd: number
  level: number
  exp: number
  statusEffects: StatusEffect[]
  learnedSkills: Skill[]
}

export interface BattleUnit {
  uid: string
  name: string
  emoji: string
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  atk: number
  def: number
  spd: number
  skills: Skill[]
  statusEffects: StatusEffect[]
  isAlly: boolean
  isPlayer?: boolean
  companionId?: CompanionId
  isBoss?: boolean
  sealStone?: SealStone
}

export type BattleActionPhase =
  | 'select_action'
  | 'select_skill'
  | 'select_item'
  | 'select_target'
  | 'resolving'
  | 'victory'
  | 'defeat'

export interface BattleLog {
  text: string
  type: 'normal' | 'damage' | 'heal' | 'critical' | 'status' | 'death' | 'system'
}

export interface BattleState {
  units: BattleUnit[]
  phase: BattleActionPhase
  turnQueue: string[]
  currentUid: string
  logs: BattleLog[]
  rewardExp: number
  rewardGold: number
  sealStoneFound?: SealStone
  isBoss: boolean
  isFinalBoss: boolean
  turn: number
}

export interface GameState {
  phase: GamePhase
  difficulty: Difficulty
  daysLeft: number
  playerName: string

  playerHp: number
  playerMaxHp: number
  playerMp: number
  playerMaxMp: number
  playerAtk: number
  playerDef: number
  playerSpd: number
  playerLevel: number
  playerExp: number
  playerSkills: Skill[]
  playerStatus: StatusEffect[]

  gold: number
  inventory: Array<{ itemId: string; qty: number }>

  currentLocId: LocationId
  visitedLocs: LocationId[]
  sealStones: SealStone[]
  defeatedBosses: string[]

  companions: Record<CompanionId, CompanionState>
  party: CompanionId[]

  battle?: BattleState

  pendingCompanionJoin?: CompanionId
  levelUpPending?: boolean
  message?: string

  // イベントシステム
  completedEvents: string[]
  activeEventId?: string
  activeEventLine?: number
  pendingBranch?: { eventId: string; prompt?: string; options: BranchOption[] }

  // 訪問回数カウント（PP4スタイル）
  locVisitCounts: Partial<Record<LocationId, number>>
}
