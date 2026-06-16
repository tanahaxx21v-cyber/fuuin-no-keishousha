export type GamePhase =
  | 'title' | 'prologue' | 'worldmap' | 'location'
  | 'battle' | 'shop' | 'party_manage' | 'win' | 'gameover'

export type Difficulty = 'easy' | 'normal' | 'hard'

export type LocationId =
  | 'royal_city'    // 王都リーベル
  | 'volca_town'    // 炎の街ヴォルカ
  | 'elda_village'  // 迷いの森の里エルダ
  | 'marina_port'   // 港町マリナ
  | 'rune_city'     // 廃都ルーン
  | 'mist_village'  // 霧の里ミスト
  | 'ignis_dungeon' // 炎山イグニス
  | 'stormia_tower' // 嵐の塔ストーミア
  | 'shadowgrave'   // 暗黒の森シャドウグレイブ
  | 'darkfort'      // 魔王城ダークフォート

export type CompanionId =
  | 'gordon' | 'liria' | 'sera' | 'dan' | 'flare' | 'kain'
  | 'win' | 'march' | 'belk' | 'noel' | 'ain' | 'sofia'

export type SealStone = 'fire' | 'storm' | 'dark'

export type StatusEffectId = 'poison' | 'stun' | 'atk_up' | 'def_up'

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
  type: 'town' | 'dungeon' | 'castle'
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
  pendingSkill?: Skill
  pendingItemId?: string
  rewardExp: number
  rewardGold: number
  sealStoneFound?: SealStone
  isBoss: boolean
  turn: number
}

export interface GameState {
  phase: GamePhase
  difficulty: Difficulty
  daysLeft: number

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
}
