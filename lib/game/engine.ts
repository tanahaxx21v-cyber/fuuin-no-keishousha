import type {
  GameState, BattleState, BattleUnit, CompanionState,
  Skill, StatusEffect, SealStone, CompanionId, Difficulty, LocationId
} from './types'
import { COMPANIONS, ENEMIES, ITEMS, LOCATIONS, PLAYER_SKILLS, getExpToNext, getDifficultyMultiplier } from './data'

// ===== INITIALIZATION =====

export function createInitialState(difficulty: Difficulty): GameState {
  const { days, playerHpMult } = getDifficultyMultiplier(difficulty)

  const baseHp = Math.floor(100 * playerHpMult)
  const companions: Record<CompanionId, CompanionState> = {} as Record<CompanionId, CompanionState>

  const companionIds: CompanionId[] = [
    'gares', 'liz', 'noa', 'cecil', 'bram', 'finn',
    'vais', 'logan', 'iris', 'sig', 'elk', 'mira', 'zeno',
  ]

  for (const id of companionIds) {
    const def = COMPANIONS[id]
    const lvBonus = (def.joinLevel - 1)
    companions[id] = {
      id,
      joined: false,
      alive: true,
      inParty: false,
      hp: def.baseHp + lvBonus * 10,
      maxHp: def.baseHp + lvBonus * 10,
      mp: def.baseMp + lvBonus * 5,
      maxMp: def.baseMp + lvBonus * 5,
      atk: def.baseAtk + lvBonus * 2,
      def: def.baseDef + lvBonus * 2,
      spd: def.baseSpd + Math.floor(lvBonus * 0.5),
      level: def.joinLevel,
      exp: 0,
      statusEffects: [],
    }
  }

  return {
    phase: 'title',
    difficulty,
    daysLeft: days,
    playerHp: baseHp,
    playerMaxHp: baseHp,
    playerMp: 50,
    playerMaxMp: 50,
    playerAtk: 15,
    playerDef: 12,
    playerSpd: 10,
    playerLevel: 1,
    playerExp: 0,
    playerSkills: PLAYER_SKILLS,
    playerStatus: [],
    gold: 200,
    inventory: [{ itemId: 'potion', qty: 2 }, { itemId: 'ether', qty: 1 }],
    currentLocId: 'alseria',
    visitedLocs: ['alseria'],
    sealStones: [],
    defeatedBosses: [],
    companions,
    party: [],
  }
}

// ===== TRAVEL =====

export function travel(state: GameState, destId: LocationId): GameState {
  const s = deepClone(state)
  const loc = LOCATIONS[s.currentLocId]
  const days = loc.travelDays[destId] ?? 1
  s.daysLeft -= days
  s.currentLocId = destId
  if (!s.visitedLocs.includes(destId)) s.visitedLocs.push(destId)
  if (s.daysLeft <= 0) {
    s.daysLeft = 0
    s.phase = 'gameover'
  } else {
    s.phase = 'location'
  }
  return s
}

// ===== COMPANION JOIN =====

export function joinCompanion(state: GameState, companionId: CompanionId): GameState {
  const s = deepClone(state)
  s.companions[companionId].joined = true
  // Auto-add to party if space available
  if (s.party.length < 3) {
    s.companions[companionId].inParty = true
    s.party.push(companionId)
  }
  s.pendingCompanionJoin = undefined
  return s
}

export function skipCompanion(state: GameState): GameState {
  const s = deepClone(state)
  s.pendingCompanionJoin = undefined
  return s
}

// ===== INN =====

export function restAtInn(state: GameState): GameState {
  const s = deepClone(state)
  const cost = 50
  if (s.gold < cost) return { ...s, message: '所持金が足りません（50G必要）' }
  s.gold -= cost
  s.daysLeft -= 1
  s.playerHp = s.playerMaxHp
  s.playerMp = s.playerMaxMp
  s.playerStatus = []
  for (const id of Object.keys(s.companions) as CompanionId[]) {
    const c = s.companions[id]
    if (c.joined && c.alive) {
      c.hp = c.maxHp
      c.mp = c.maxMp
      c.statusEffects = []
    }
  }
  if (s.daysLeft <= 0) {
    s.daysLeft = 0
    s.phase = 'gameover'
  }
  return s
}

// ===== SHOP =====

export function buyItem(state: GameState, itemId: string): GameState {
  const s = deepClone(state)
  const item = ITEMS[itemId]
  if (!item) return state
  if (s.gold < item.price) return { ...s, message: '所持金が足りません' }
  s.gold -= item.price
  const existing = s.inventory.find(i => i.itemId === itemId)
  if (existing) existing.qty += 1
  else s.inventory.push({ itemId, qty: 1 })
  return s
}

// ===== BATTLE INIT =====

export function startBattle(state: GameState, enemyIds: string[], isBoss: boolean): GameState {
  const s = deepClone(state)
  const { enemyHpMult } = getDifficultyMultiplier(s.difficulty)

  const allies: BattleUnit[] = [
    {
      uid: 'player',
      name: 'レオン',
      emoji: '⚔️',
      hp: s.playerHp,
      maxHp: s.playerMaxHp,
      mp: s.playerMp,
      maxMp: s.playerMaxMp,
      atk: s.playerAtk,
      def: s.playerDef,
      spd: s.playerSpd,
      skills: s.playerSkills,
      statusEffects: [...s.playerStatus],
      isAlly: true,
      isPlayer: true,
    },
    ...s.party
      .filter(id => s.companions[id].joined && s.companions[id].alive)
      .map(id => {
        const c = s.companions[id]
        const def = COMPANIONS[id]
        return {
          uid: id,
          name: def.name,
          emoji: def.emoji,
          hp: c.hp,
          maxHp: c.maxHp,
          mp: c.mp,
          maxMp: c.maxMp,
          atk: c.atk,
          def: c.def,
          spd: c.spd,
          skills: def.skills,
          statusEffects: [...c.statusEffects],
          isAlly: true,
          companionId: id,
        } as BattleUnit
      }),
  ]

  const enemies: BattleUnit[] = enemyIds.map((id, i) => {
    const e = ENEMIES[id]
    const hp = Math.floor(e.hp * enemyHpMult)
    return {
      uid: `enemy_${i}_${id}`,
      name: e.name,
      emoji: e.emoji,
      hp,
      maxHp: hp,
      mp: e.mp,
      maxMp: e.mp,
      atk: e.atk,
      def: e.def,
      spd: e.spd,
      skills: e.skills,
      statusEffects: [],
      isAlly: false,
      isBoss: e.isBoss,
      sealStone: e.sealStone,
    } as BattleUnit
  })

  const allUnits = [...allies, ...enemies]
  const turnQueue = buildTurnQueue(allUnits)

  const battle: BattleState = {
    units: allUnits,
    phase: 'select_action',
    turnQueue,
    currentUid: turnQueue[0],
    logs: [{ text: isBoss ? '⚔️ ボスが現れた！' : '⚔️ 敵が現れた！', type: 'system' }],
    rewardExp: enemyIds.reduce((sum, id) => sum + (ENEMIES[id]?.exp ?? 0), 0),
    rewardGold: enemyIds.reduce((sum, id) => sum + (ENEMIES[id]?.gold ?? 0), 0),
    sealStoneFound: isBoss ? ENEMIES[enemyIds[0]]?.sealStone : undefined,
    isBoss,
    isFinalBoss: isBoss && enemyIds[0] === 'archive',
    turn: 1,
  }

  // If first actor is enemy, auto-resolve immediately
  const firstUnit = allUnits.find(u => u.uid === turnQueue[0])
  if (firstUnit && !firstUnit.isAlly) {
    s.battle = battle
    return processEnemyTurn(s)
  }

  s.battle = battle
  s.phase = 'battle'
  return s
}

function buildTurnQueue(units: BattleUnit[]): string[] {
  return [...units]
    .filter(u => u.hp > 0)
    .sort((a, b) => b.spd - a.spd)
    .map(u => u.uid)
}

// ===== BATTLE ACTIONS =====

export function battleAttack(state: GameState, targetUid: string): GameState {
  if (!state.battle) return state
  const s = deepClone(state)
  const b = s.battle!
  const attacker = b.units.find(u => u.uid === b.currentUid)!
  const target = b.units.find(u => u.uid === targetUid)!

  const result = calcDamage(attacker, target)
  applyDamage(b, target, result.dmg, result.crit)
  b.logs.push({
    text: result.crit
      ? `💥 ${attacker.name}の会心の一撃！${target.name}に${result.dmg}ダメージ！`
      : `⚔️ ${attacker.name}の攻撃！${target.name}に${result.dmg}ダメージ`,
    type: result.crit ? 'critical' : 'damage',
  })

  return advanceTurn(s)
}

export function battleSkill(state: GameState, skill: Skill, targetUid?: string): GameState {
  if (!state.battle) return state
  const s = deepClone(state)
  const b = s.battle!
  const actor = b.units.find(u => u.uid === b.currentUid)!

  if (actor.mp < skill.mpCost) {
    b.logs.push({ text: `💫 MPが足りない！`, type: 'system' })
    b.phase = 'select_action'
    return s
  }
  actor.mp -= skill.mpCost

  const targets = resolveTargets(b, skill, actor, targetUid)

  for (const tgt of targets) {
    applySkillEffect(b, actor, tgt, skill)
  }

  b.logs.push({ text: `✨ ${actor.name}は「${skill.name}」を使った！`, type: 'status' })

  return advanceTurn(s)
}

export function battleUseItem(state: GameState, itemId: string, targetUid: string): GameState {
  if (!state.battle) return state
  const s = deepClone(state)
  const b = s.battle!
  const item = ITEMS[itemId]
  if (!item) return state

  const invItem = s.inventory.find(i => i.itemId === itemId)
  if (!invItem || invItem.qty <= 0) return state
  invItem.qty -= 1
  if (invItem.qty === 0) s.inventory = s.inventory.filter(i => i.itemId !== itemId)

  const target = b.units.find(u => u.uid === targetUid)!

  if (item.effect === 'heal_hp') {
    const healed = Math.min(item.power, target.maxHp - target.hp)
    target.hp += healed
    b.logs.push({ text: `🧪 ${target.name}のHPが${healed}回復！`, type: 'heal' })
  } else if (item.effect === 'heal_mp') {
    const healed = Math.min(item.power, target.maxMp - target.mp)
    target.mp += healed
    b.logs.push({ text: `✨ ${target.name}のMPが${healed}回復！`, type: 'heal' })
  } else if (item.effect === 'heal_both') {
    const healedHp = Math.min(item.power, target.maxHp - target.hp)
    const healedMp = Math.min(40, target.maxMp - target.mp)
    target.hp += healedHp
    target.mp += healedMp
    b.logs.push({ text: `🌿 ${target.name}のHP+${healedHp}、MP+${healedMp}回復！`, type: 'heal' })
  } else if (item.effect === 'cure_status') {
    target.statusEffects = []
    b.logs.push({ text: `🫙 ${target.name}の状態異常が回復！`, type: 'status' })
  }

  return advanceTurn(s)
}

export function battleFlee(state: GameState): GameState {
  if (!state.battle) return state
  const s = deepClone(state)
  if (s.battle!.isBoss) {
    s.battle!.logs.push({ text: '❌ ボス戦からは逃げられない！', type: 'system' })
    s.battle!.phase = 'select_action'
    return s
  }
  const success = Math.random() < 0.6
  if (success) {
    s.battle = undefined
    s.phase = 'location'
    return s
  }
  s.battle!.logs.push({ text: '💨 逃げられなかった！', type: 'system' })
  return advanceTurn(s)
}

// ===== ENEMY AI =====

function processEnemyTurn(state: GameState): GameState {
  if (!state.battle) return state
  const s = deepClone(state)
  const b = s.battle!
  const actor = b.units.find(u => u.uid === b.currentUid)!
  if (!actor || actor.hp <= 0 || actor.isAlly) return s

  // Stun check
  const stun = actor.statusEffects.find(e => e.id === 'stun')
  if (stun) {
    stun.turnsLeft -= 1
    if (stun.turnsLeft <= 0) actor.statusEffects = actor.statusEffects.filter(e => e.id !== 'stun')
    b.logs.push({ text: `💫 ${actor.name}はスタンして動けない！`, type: 'status' })
    return advanceTurn(s)
  }

  const aliveAllies = b.units.filter(u => u.isAlly && u.hp > 0)
  if (aliveAllies.length === 0) return s

  // Occasionally use skill
  const useSkill = actor.skills.length > 0 && actor.mp >= actor.skills[0].mpCost && Math.random() < 0.3
  if (useSkill) {
    const skill = actor.skills[Math.floor(Math.random() * actor.skills.length)]
    if (actor.mp >= skill.mpCost) {
      actor.mp -= skill.mpCost
      const targets = skill.target === 'enemy_all'
        ? aliveAllies
        : [aliveAllies[Math.floor(Math.random() * aliveAllies.length)]]
      for (const tgt of targets) applySkillEffect(b, actor, tgt, skill)
      b.logs.push({ text: `🔥 ${actor.name}は「${skill.name}」を使った！`, type: 'status' })
      return advanceTurn(s)
    }
  }

  // Normal attack on random ally
  const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)]
  const result = calcDamage(actor, target)
  applyDamage(b, target, result.dmg, result.crit)
  b.logs.push({
    text: result.crit
      ? `💥 ${actor.name}の会心！${target.name}に${result.dmg}ダメージ！`
      : `⚔️ ${actor.name}の攻撃！${target.name}に${result.dmg}ダメージ`,
    type: result.crit ? 'critical' : 'damage',
  })

  return advanceTurn(s)
}

// ===== TURN MANAGEMENT =====

function advanceTurn(state: GameState): GameState {
  if (!state.battle) return state
  const s = deepClone(state)
  const b = s.battle!

  // Apply poison to all units
  for (const unit of b.units) {
    const poison = unit.statusEffects.find(e => e.id === 'poison')
    if (poison && unit.hp > 0) {
      const dmg = 8
      unit.hp = Math.max(0, unit.hp - dmg)
      b.logs.push({ text: `☠️ ${unit.name}は毒で${dmg}ダメージ！`, type: 'damage' })
      poison.turnsLeft -= 1
      if (poison.turnsLeft <= 0) unit.statusEffects = unit.statusEffects.filter(e => e.id !== 'poison')
    }
  }

  // Check victory/defeat
  const aliveEnemies = b.units.filter(u => !u.isAlly && u.hp > 0)
  const aliveAllies = b.units.filter(u => u.isAlly && u.hp > 0)

  if (aliveEnemies.length === 0) {
    b.phase = 'victory'
    b.logs.push({ text: `🎉 勝利！`, type: 'system' })
    return applyBattleRewards(s)
  }
  if (aliveAllies.length === 0) {
    b.phase = 'defeat'
    b.logs.push({ text: `💀 全滅...`, type: 'death' })
    return s
  }

  // Next turn: rebuild queue of alive units, advance index
  const aliveUids = b.units.filter(u => u.hp > 0).map(u => u.uid)
  const currentIndex = b.turnQueue.indexOf(b.currentUid)
  let nextIndex = currentIndex + 1

  // Cycle through alive units
  let tries = 0
  while (tries < b.turnQueue.length) {
    const candidateUid = b.turnQueue[nextIndex % b.turnQueue.length]
    if (aliveUids.includes(candidateUid)) {
      b.currentUid = candidateUid
      break
    }
    nextIndex++
    tries++
  }

  // Rebuild queue periodically (every round)
  if (nextIndex >= b.turnQueue.length) {
    b.turnQueue = buildTurnQueue(b.units.filter(u => u.hp > 0))
    b.currentUid = b.turnQueue[0]
    b.turn += 1
  }

  const nextActor = b.units.find(u => u.uid === b.currentUid)
  if (!nextActor || nextActor.isAlly) {
    b.phase = 'select_action'
  } else {
    b.phase = 'select_action'
    return processEnemyTurn(s)
  }

  return s
}

function applyBattleRewards(state: GameState): GameState {
  const s = deepClone(state)
  const b = s.battle!
  s.gold += b.rewardGold

  // Sync HP/MP back to game state
  syncBattleToState(s)

  // EXP gain
  const expGain = b.rewardExp
  s.playerExp += expGain
  const expNeeded = getExpToNext(s.playerLevel)
  if (s.playerExp >= expNeeded) {
    s.playerExp -= expNeeded
    s.playerLevel += 1
    s.playerMaxHp += 10
    s.playerHp = Math.min(s.playerHp + 10, s.playerMaxHp)
    s.playerMaxMp += 5
    s.playerAtk += 2
    s.playerDef += 2
    s.playerSpd += 1
    s.levelUpPending = true
    b.logs.push({ text: `⭐ レベルアップ！Lv${s.playerLevel}になった！`, type: 'system' })
  }

  // Seal stone
  if (b.sealStoneFound && !s.sealStones.includes(b.sealStoneFound)) {
    s.sealStones.push(b.sealStoneFound)
    b.logs.push({ text: `💎 ${sealStoneName(b.sealStoneFound)}を手に入れた！`, type: 'system' })
  }

  // Boss defeated
  if (b.isBoss) {
    const bossUid = b.units.find(u => u.isBoss)?.uid
    if (bossUid) s.defeatedBosses.push(bossUid)

    // Final boss → win
    if (b.isFinalBoss) {
      b.logs.push({ text: `🏆 魔王ヴァールドを討伐した！ルミナ大陸に平和が戻る！`, type: 'system' })
      return s
    }

    // Companion join event at dungeon
    const loc = LOCATIONS[s.currentLocId]
    if (loc.companionId) {
      const cid = loc.companionId
      if (!s.companions[cid].joined) {
        s.pendingCompanionJoin = cid
      }
    }
  }

  return s
}

function syncBattleToState(state: GameState) {
  const b = state.battle!
  const playerUnit = b.units.find(u => u.isPlayer)
  if (playerUnit) {
    state.playerHp = Math.max(0, playerUnit.hp)
    state.playerMp = playerUnit.mp
    state.playerStatus = playerUnit.statusEffects
  }
  for (const unit of b.units) {
    if (unit.companionId) {
      const c = state.companions[unit.companionId]
      if (c) {
        c.hp = Math.max(0, unit.hp)
        c.mp = unit.mp
        c.statusEffects = unit.statusEffects
        if (unit.hp <= 0) c.alive = false
      }
    }
  }
}

export function closeBattle(state: GameState): GameState {
  const s = deepClone(state)
  if (!s.battle) return s

  const defeated = s.battle.phase === 'defeat'
  const isFinal = s.battle.isFinalBoss && s.battle.phase === 'victory'
  syncBattleToState(s)
  s.battle = undefined

  if (defeated) {
    s.phase = 'gameover'
  } else if (isFinal) {
    s.phase = 'win'
  } else {
    s.phase = 'location'
  }
  return s
}

// ===== PARTY MANAGEMENT =====

export function setParty(state: GameState, newParty: CompanionId[]): GameState {
  const s = deepClone(state)
  // Reset all inParty flags
  for (const id of Object.keys(s.companions) as CompanionId[]) {
    s.companions[id].inParty = false
  }
  s.party = newParty.slice(0, 3)
  for (const id of s.party) {
    if (s.companions[id].joined && s.companions[id].alive) {
      s.companions[id].inParty = true
    }
  }
  return s
}

// ===== DUNGEON =====

export function enterDungeon(state: GameState): GameState {
  const s = deepClone(state)
  const loc = LOCATIONS[s.currentLocId]
  if (!loc.enemyPool || !loc.bossId) return s

  const bossAlreadyDefeated = s.defeatedBosses.some(id => id.includes(loc.bossId!.replace('boss_', '')))

  // Random enemies then boss
  const pool = loc.enemyPool
  const enemies = [
    pool[Math.floor(Math.random() * pool.length)],
    pool[Math.floor(Math.random() * pool.length)],
  ]

  return startBattle(s, enemies, false)
}

export function fightBoss(state: GameState): GameState {
  const s = deepClone(state)
  const loc = LOCATIONS[s.currentLocId]
  if (!loc.bossId) return s
  if (s.defeatedBosses.some(id => id.includes(loc.bossId!))) {
    return { ...s, message: 'ボスは既に倒した。' }
  }
  return startBattle(s, [loc.bossId], true)
}

// ===== WIN CHECK =====

export function checkWinCondition(state: GameState): GameState {
  const s = deepClone(state)
  const loc = LOCATIONS[s.currentLocId]

  // Check if all 3 seal stones are collected and at demon castle
  if (s.currentLocId === 'desert_ruins' && s.sealStones.length === 3) {
    // Already handled by fightBoss → battle victory
  }
  return s
}

// ===== HELPER FUNCTIONS =====

function calcDamage(attacker: BattleUnit, target: BattleUnit): { dmg: number; crit: boolean } {
  const atkMod = attacker.statusEffects.find(e => e.id === 'atk_up') ? 1.5 : 1
  const defMod = target.statusEffects.find(e => e.id === 'def_up') ? 0.6 : 1
  const base = Math.max(1, (attacker.atk * atkMod) - (target.def * defMod / 2))
  const variance = base * 0.2 * (Math.random() * 2 - 1)
  const crit = Math.random() < 0.1
  const dmg = Math.max(1, Math.floor((base + variance) * (crit ? 1.5 : 1)))
  return { dmg, crit }
}

function applyDamage(battle: BattleState, target: BattleUnit, dmg: number, _crit: boolean) {
  target.hp = Math.max(0, target.hp - dmg)
  if (target.hp <= 0) {
    battle.logs.push({ text: `💀 ${target.name}は倒れた！`, type: 'death' })
  }
}

function resolveTargets(battle: BattleState, skill: Skill, actor: BattleUnit, targetUid?: string): BattleUnit[] {
  switch (skill.target) {
    case 'enemy_all':
      return battle.units.filter(u => u.isAlly !== actor.isAlly && u.hp > 0)
    case 'ally_all':
      return battle.units.filter(u => u.isAlly === actor.isAlly && u.hp > 0)
    case 'self':
      return [actor]
    case 'enemy_one':
    case 'ally_one':
      return targetUid ? battle.units.filter(u => u.uid === targetUid) : []
    default:
      return []
  }
}

function applySkillEffect(battle: BattleState, actor: BattleUnit, target: BattleUnit, skill: Skill) {
  switch (skill.effect) {
    case 'damage':
    case 'boss_bonus': {
      const atkMod = actor.statusEffects.find(e => e.id === 'atk_up') ? 1.5 : 1
      const defMod = target.statusEffects.find(e => e.id === 'def_up') ? 0.6 : 1
      const sealBonus = skill.effect === 'boss_bonus' ? 1.5 : 1.0
      const base = Math.max(1, (actor.atk * atkMod * skill.power * sealBonus) - (target.def * defMod / 2))
      const dmg = Math.max(1, Math.floor(base * (0.9 + Math.random() * 0.2)))
      applyDamage(battle, target, dmg, false)
      battle.logs.push({ text: `💥 ${target.name}に${dmg}ダメージ！`, type: 'damage' })
      break
    }
    case 'heal': {
      const healed = Math.min(skill.power, target.maxHp - target.hp)
      target.hp += healed
      battle.logs.push({ text: `💚 ${target.name}のHPが${healed}回復！`, type: 'heal' })
      break
    }
    case 'poison': {
      if (!target.statusEffects.find(e => e.id === 'poison')) {
        target.statusEffects.push({ id: 'poison', name: '毒', turnsLeft: 4 })
        battle.logs.push({ text: `☠️ ${target.name}は毒状態になった！`, type: 'status' })
      }
      // Also deal some damage
      const result = calcDamage(actor, target)
      applyDamage(battle, target, Math.floor(result.dmg * skill.power), false)
      break
    }
    case 'stun': {
      if (!target.statusEffects.find(e => e.id === 'stun')) {
        target.statusEffects.push({ id: 'stun', name: 'スタン', turnsLeft: 2 })
        battle.logs.push({ text: `💫 ${target.name}はスタンした！`, type: 'status' })
      }
      const result = calcDamage(actor, target)
      applyDamage(battle, target, Math.floor(result.dmg * skill.power), false)
      break
    }
    case 'atk_up': {
      if (!target.statusEffects.find(e => e.id === 'atk_up')) {
        target.statusEffects.push({ id: 'atk_up', name: '攻撃UP', turnsLeft: 3 })
        battle.logs.push({ text: `⬆️ ${target.name}の攻撃力が上がった！`, type: 'status' })
      }
      break
    }
    case 'def_up': {
      if (!target.statusEffects.find(e => e.id === 'def_up')) {
        target.statusEffects.push({ id: 'def_up', name: '防御UP', turnsLeft: 3 })
        battle.logs.push({ text: `🛡️ ${target.name}の防御力が上がった！`, type: 'status' })
      }
      break
    }
    case 'debuff_atk': {
      // Remove atk_up if any, add debuff
      target.statusEffects = target.statusEffects.filter(e => e.id !== 'atk_up')
      if (!target.statusEffects.find(e => e.id === 'atk_up')) {
        battle.logs.push({ text: `⬇️ ${target.name}の攻撃力が下がった！`, type: 'status' })
      }
      break
    }
  }
}

function sealStoneName(stone: SealStone): string {
  const names = { fire: '炎の封印石', storm: '嵐の封印石', dark: '闇の封印石' }
  return names[stone]
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}
