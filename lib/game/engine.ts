import type {
  GameState, BattleState, BattleUnit, CompanionState,
  Skill, StatusEffect, SealStone, CompanionId, Difficulty, LocationId, BranchOption
} from './types'
import { COMPANIONS, ENEMIES, ITEMS, LOCATIONS, EVENTS, PLAYER_SKILL_SCHEDULE, getExpToNext, getDifficultyMultiplier, getItemPrice, getInnPrice } from './data'

// ===== INITIALIZATION =====

export function createInitialState(difficulty: Difficulty, playerName = 'レオン'): GameState {
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
      hp: def.baseHp + lvBonus * def.hpGrowth,
      maxHp: def.baseHp + lvBonus * def.hpGrowth,
      mp: def.baseMp + lvBonus * def.mpGrowth,
      maxMp: def.baseMp + lvBonus * def.mpGrowth,
      atk: def.baseAtk + lvBonus * def.atkGrowth,
      def: def.baseDef + lvBonus * def.defGrowth,
      spd: def.baseSpd + lvBonus * def.spdGrowth,
      level: def.joinLevel,
      exp: 0,
      statusEffects: [],
      learnedSkills: [],
    }
  }

  // Player starts with only Lv1 skill (勇者斬り)
  const startSkills = PLAYER_SKILL_SCHEDULE.filter(ps => ps.level <= 1).map(ps => ps.skill)

  return {
    phase: 'title',
    difficulty,
    playerName,
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
    playerSkills: startSkills,
    playerStatus: [],
    gold: 300,
    inventory: [{ itemId: 'potion', qty: 2 }, { itemId: 'ether', qty: 1 }],
    currentLocId: 'alseria',
    visitedLocs: ['alseria'],
    sealStones: [],
    defeatedBosses: [],
    companions,
    party: [],
    completedEvents: [],
    locVisitCounts: { alseria: 1 },
  }
}

// ===== ストーリー進行: エリアアクセス制限 =====
export function getAvailableConnections(state: GameState, locId: LocationId): LocationId[] {
  const loc = LOCATIONS[locId]
  if (!loc) return []
  return loc.connections.filter(connId => isLocationUnlocked(state, connId as LocationId))
}

function isLocationUnlocked(s: GameState, locId: LocationId): boolean {
  const lv = s.playerLevel
  const seals = s.sealStones
  const defeated = s.defeatedBosses
  const joined = Object.values(s.companions).filter(c => c.joined).map(c => c.id as string)
  switch (locId) {
    case 'alseria': case 'traveler_inn': case 'checkpoint':
    case 'galdo': case 'bern': case 'great_bridge': case 'watchtower':
      return true
    case 'riverside': case 'lighthouse':
      return lv >= 4 || joined.includes('gares')
    case 'spirit_spring': case 'forest_entrance':
      return lv >= 4
    case 'elna':
      return lv >= 5 || seals.length >= 1
    case 'ancient_temple':
      return seals.length >= 2
    case 'demon_mine':
      return lv >= 4
    case 'dragon_pass':
      return seals.includes('fire')
    case 'bandit_hideout':
      return lv >= 5
    case 'trading_post':
      return lv >= 5
    case 'sahal':
      return defeated.includes('bandit_king') || seals.length >= 1
    case 'coastal_road':
      return seals.length >= 1
    case 'mirea':
      return seals.length >= 2
    case 'desert_ruins':
      return seals.length >= 3
    default:
      return true
  }
}

// ===== イベント判定・実行 =====
export function checkLocationEvent(state: GameState): string | null {
  const joinedIds: string[] = Object.values(state.companions).filter(c => c.joined).map(c => c.id as string)
  for (const ev of EVENTS) {
    if (state.completedEvents.includes(ev.id)) continue
    const cond = ev.condition
    if (cond.atLoc !== state.currentLocId) continue
    if (cond.requiredCompanions && !cond.requiredCompanions.every(c => joinedIds.includes(c))) continue
    if (cond.anyCompanion && !cond.anyCompanion.some(c => joinedIds.includes(c))) continue
    if (cond.maxDaysLeft !== undefined && state.daysLeft > cond.maxDaysLeft) continue
    if (cond.minDaysLeft !== undefined && state.daysLeft < cond.minDaysLeft) continue
    if (cond.requiredSeals && !cond.requiredSeals.every(seal => state.sealStones.includes(seal))) continue
    if (cond.requiredDefeated && !cond.requiredDefeated.every(b => state.defeatedBosses.includes(b))) continue
    if (cond.minPlayerLevel !== undefined && state.playerLevel < cond.minPlayerLevel) continue
    if (cond.requiredEventCompleted && !cond.requiredEventCompleted.every(e => state.completedEvents.includes(e))) continue
    if (cond.blockIfEventCompleted && cond.blockIfEventCompleted.some(e => state.completedEvents.includes(e))) continue
    if (cond.minVisitCount !== undefined) {
      const visits = (state.locVisitCounts ?? {})[cond.atLoc] ?? 0
      if (visits < cond.minVisitCount) continue
    }
    return ev.id
  }
  return null
}

export function startEvent(state: GameState, eventId: string): GameState {
  const s = deepClone(state)
  s.activeEventId = eventId
  s.activeEventLine = 0
  s.phase = 'event'
  return s
}

export function advanceEvent(state: GameState): GameState {
  const s = deepClone(state)
  const ev = EVENTS.find(e => e.id === s.activeEventId)
  if (!ev) { s.phase = 'location'; s.activeEventId = undefined; s.activeEventLine = undefined; return s }
  const nextLine = (s.activeEventLine ?? 0) + 1
  if (nextLine >= ev.dialogues.length) {
    // 選択肢がある場合は分岐を保留
    if (ev.branch) {
      s.pendingBranch = { eventId: ev.id, prompt: ev.branch.prompt, options: ev.branch.options }
      s.activeEventId = undefined
      s.activeEventLine = undefined
      s.phase = 'location'
      return s
    }
    s.completedEvents.push(ev.id)
    s.activeEventId = undefined
    s.activeEventLine = undefined
    if (ev.reward) {
      applyEventReward(s, ev.reward)
    }
    s.phase = 'location'
  } else {
    s.activeEventLine = nextLine
  }
  return s
}

// ===== TRAVEL =====

export function travel(state: GameState, destId: LocationId): GameState {
  const s = deepClone(state)
  const loc = LOCATIONS[s.currentLocId]
  const destLoc = LOCATIONS[destId]
  const days = loc.travelDays[destId] ?? 1
  s.daysLeft -= days
  s.currentLocId = destId
  if (!s.visitedLocs.includes(destId)) s.visitedLocs.push(destId)
  s.locVisitCounts = s.locVisitCounts ?? {}
  s.locVisitCounts[destId] = (s.locVisitCounts[destId] ?? 0) + 1

  if (s.daysLeft <= 0) {
    s.daysLeft = 0
    s.phase = 'gameover'
    return s
  }

  // 中間地点（relay）のみランダムエンカウント/イベント発生
  // 町・ダンジョンでは発生しない
  if (destLoc.type === 'relay') {
    const roll = Math.random()

    if (roll < 0.30) {
      // 30%: 敵エンカウント
      const pool = destLoc.travelEnemyPool ?? []
      if (pool.length > 0) {
        const enemyId = pool[Math.floor(Math.random() * pool.length)]
        s.message = '⚠️ 移動中に敵に遭遇した！'
        return startBattle(s, [enemyId], false)
      }
    } else if (roll < 0.45) {
      // 15%: ランダムイベント
      const ev = Math.random()
      if (ev < 0.40) {
        const gold = Math.floor(Math.random() * 40) + 20
        s.gold += gold
        s.message = `💰 道中で ${gold}G を見つけた！`
      } else if (ev < 0.75) {
        const ex = s.inventory.find(i => i.itemId === 'potion')
        if (ex) ex.qty += 1
        else s.inventory.push({ itemId: 'potion', qty: 1 })
        s.message = '🧪 道中でポーションを拾った！'
      } else {
        const heal = Math.floor(s.playerMaxHp * 0.10)
        s.playerHp = Math.min(s.playerMaxHp, s.playerHp + heal)
        s.message = `✨ 清らかな泉を発見。HP が ${heal} 回復した！`
      }
    }
    // 55%: 何も起こらない
  }

  // castle型ロケーション到着時: 隠しキャラ出現判定
  if (destLoc.type === 'castle' && destLoc.companionId) {
    const cid = destLoc.companionId as CompanionId
    if (!s.companions[cid].joined && !s.pendingCompanionJoin) {
      s.pendingCompanionJoin = cid
    }
  }

  s.phase = 'location'
  return s
}

// ===== COMPANION JOIN =====

export function joinCompanion(state: GameState, companionId: CompanionId): GameState {
  const s = deepClone(state)
  // 仲間は合計3人まで（パーティ枠ではなく加入済み総数）
  const joinedCount = Object.values(s.companions).filter(c => c.joined).length
  if (joinedCount >= 3) {
    s.message = '仲間はすでに3人います。これ以上は仲間にできません。'
    s.pendingCompanionJoin = undefined
    return s
  }
  s.companions[companionId].joined = true
  // Auto-add to party if space available
  if (s.party.length < 3) {
    s.companions[companionId].inParty = true
    s.party.push(companionId)
  }
  s.pendingCompanionJoin = undefined
  return s
}

// ===== 選択肢決定 =====

export function chooseBranch(state: GameState, choiceIndex: number): GameState {
  if (!state.pendingBranch) return state
  const s = deepClone(state)
  const { eventId, options } = s.pendingBranch!
  const chosen = options[choiceIndex]
  s.pendingBranch = undefined

  // コスト不足チェック
  if (chosen?.cost && s.gold < chosen.cost) {
    s.message = `所持金が足りない！（${chosen.cost}G必要）`
    return s
  }
  if (chosen?.cost) s.gold -= chosen.cost

  s.completedEvents.push(eventId)

  if (chosen) {
    // 確率分岐
    if (chosen.winChance !== undefined) {
      const won = Math.random() < chosen.winChance
      const appliedReward = won ? chosen.reward : chosen.loseReward
      if (appliedReward) applyEventReward(s, appliedReward)
    } else if (chosen.reward) {
      applyEventReward(s, chosen.reward)
    }
  }
  return s
}

function applyEventReward(s: GameState, reward: { gold?: number; exp?: number; itemId?: string; itemQty?: number; fullHeal?: boolean; message: string }) {
  if (reward.fullHeal) {
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
  }
  if (reward.gold) s.gold += reward.gold
  if (reward.exp) {
    s.playerExp += reward.exp
    while (s.playerExp >= getExpToNext(s.playerLevel) && s.playerLevel < 30) {
      s.playerExp -= getExpToNext(s.playerLevel)
      s.playerLevel++
      s.playerMaxHp += 12; s.playerHp = Math.min(s.playerHp + 12, s.playerMaxHp)
      s.playerMaxMp += 5; s.playerMp = Math.min(s.playerMp + 5, s.playerMaxMp)
      s.playerAtk += 2; s.playerDef += 2; s.playerSpd += 1
      s.levelUpPending = true
      const newSkill = PLAYER_SKILL_SCHEDULE.find(ps => ps.level === s.playerLevel)
      if (newSkill && !s.playerSkills.some(sk => sk.id === newSkill.skill.id)) s.playerSkills.push(newSkill.skill)
    }
  }
  if (reward.itemId) {
    const ex = s.inventory.find(i => i.itemId === reward.itemId)
    if (ex) ex.qty += reward.itemQty ?? 1
    else s.inventory.push({ itemId: reward.itemId, qty: reward.itemQty ?? 1 })
  }
  if (reward.message) s.message = reward.message
}

export function skipCompanion(state: GameState): GameState {
  const s = deepClone(state)
  s.pendingCompanionJoin = undefined
  return s
}

// ===== INN =====

export function restAtInn(state: GameState): GameState {
  const s = deepClone(state)
  const totalDays = getDifficultyMultiplier(s.difficulty).days
  const cost = getInnPrice(s.daysLeft, totalDays)
  if (s.gold < cost) return { ...s, message: `所持金が足りません（${cost}G必要）` }
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
  const totalDays = getDifficultyMultiplier(s.difficulty).days
  const price = getItemPrice(itemId, s.daysLeft, totalDays)
  if (s.gold < price) return { ...s, message: '所持金が足りません' }
  s.gold -= price
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
      name: s.playerName,
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
          skills: [...def.skills, ...c.learnedSkills],
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

  s.battle = battle
  s.phase = 'battle'

  return s
}

// Process non-player turn (companion or enemy) — called from GameRoot useEffect
export function processNonPlayerTurn(state: GameState): GameState {
  if (!state.battle) return state
  const b = state.battle
  if (b.phase === 'victory' || b.phase === 'defeat') return state
  const actor = b.units.find(u => u.uid === b.currentUid)
  if (!actor || actor.isPlayer) return state
  const s = deepClone(state)
  const a = s.battle!.units.find(u => u.uid === s.battle!.currentUid)!
  if (a.isAlly) return processCompanionTurn(s)
  return processEnemyTurn(s)
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
    // MP不足 → 1ターン休憩して少し回復
    const mpRecover = Math.max(5, Math.floor(actor.maxMp * 0.08))
    actor.mp = Math.min(actor.maxMp, actor.mp + mpRecover)
    b.logs.push({ text: `💤 ${actor.name}はMPが足りず休憩した。MP+${mpRecover}回復。`, type: 'status' })
    return advanceTurn(s)
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

// ===== COMPANION AI =====

function processCompanionTurn(state: GameState): GameState {
  if (!state.battle) return state
  const s = deepClone(state)
  const b = s.battle!
  const actor = b.units.find(u => u.uid === b.currentUid)!
  if (!actor || actor.hp <= 0 || !actor.isAlly || actor.isPlayer) return s

  // Stun check
  const stun = actor.statusEffects.find(e => e.id === 'stun')
  if (stun) {
    stun.turnsLeft -= 1
    if (stun.turnsLeft <= 0) actor.statusEffects = actor.statusEffects.filter(e => e.id !== 'stun')
    b.logs.push({ text: `💫 ${actor.name}はスタンして動けない！`, type: 'status' })
    return advanceTurn(s)
  }

  const aliveEnemies = b.units.filter(u => !u.isAlly && u.hp > 0)
  if (aliveEnemies.length === 0) return advanceTurn(s)

  const aliveAllies = b.units.filter(u => u.isAlly && u.hp > 0)

  // Use healing skill if any ally is below 30% HP
  const lowHpAlly = aliveAllies
    .filter(u => u.hp < u.maxHp * 0.3)
    .sort((a, b) => a.hp - b.hp)[0]
  const healSkill = actor.skills.find(sk => sk.target === 'ally_one' && sk.effect === 'heal' && actor.mp >= sk.mpCost)
  if (lowHpAlly && healSkill) {
    actor.mp -= healSkill.mpCost
    applySkillEffect(b, actor, lowHpAlly, healSkill)
    b.logs.push({ text: `💚 ${actor.name}は「${healSkill.name}」を使った！`, type: 'heal' })
    return advanceTurn(s)
  }

  // Occasionally use offensive/support skill
  const offSkills = actor.skills.filter(sk =>
    (sk.target === 'enemy_one' || sk.target === 'enemy_all') && actor.mp >= sk.mpCost
  )
  const useSkill = offSkills.length > 0 && Math.random() < 0.35
  if (useSkill) {
    const skill = offSkills[Math.floor(Math.random() * offSkills.length)]
    actor.mp -= skill.mpCost
    const targets = skill.target === 'enemy_all' ? aliveEnemies : [aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]]
    for (const tgt of targets) applySkillEffect(b, actor, tgt, skill)
    b.logs.push({ text: `✨ ${actor.name}は「${skill.name}」を使った！`, type: 'status' })
    return advanceTurn(s)
  }

  // Normal attack on weakest enemy
  const target = aliveEnemies.reduce((weakest, e) => e.hp < weakest.hp ? e : weakest)
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

  // バトルログの上限管理（最大25件）
  if (b.logs.length > 25) b.logs = b.logs.slice(b.logs.length - 25)

  // Apply poison & decay buffs/debuffs for all units
  for (const unit of b.units) {
    if (unit.hp <= 0) continue
    const poison = unit.statusEffects.find(e => e.id === 'poison')
    if (poison) {
      const dmg = 8
      unit.hp = Math.max(0, unit.hp - dmg)
      b.logs.push({ text: `☠️ ${unit.name}は毒で${dmg}ダメージ！`, type: 'damage' })
      poison.turnsLeft -= 1
      if (poison.turnsLeft <= 0) unit.statusEffects = unit.statusEffects.filter(e => e.id !== 'poison')
    }
    // Decay atk_up, def_up, atk_down
    for (const buffId of ['atk_up', 'def_up', 'atk_down'] as const) {
      const eff = unit.statusEffects.find(e => e.id === buffId)
      if (eff) {
        eff.turnsLeft -= 1
        if (eff.turnsLeft <= 0) {
          unit.statusEffects = unit.statusEffects.filter(e => e.id !== buffId)
          if (buffId === 'atk_up') b.logs.push({ text: `${unit.name}のATK UPが切れた`, type: 'status' })
          else if (buffId === 'def_up') b.logs.push({ text: `${unit.name}のDEF UPが切れた`, type: 'status' })
          else if (buffId === 'atk_down') b.logs.push({ text: `${unit.name}の攻撃力が戻った`, type: 'status' })
        }
      }
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

  // 常に select_action で返す。仲間/敵ターンの処理は GameRoot の useEffect が遅延実行する。
  // ここで再帰すると全ターンが同期的に一瞬で終わってしまうため禁止。
  b.phase = 'select_action'

  return s
}

function applyBattleRewards(state: GameState): GameState {
  const s = deepClone(state)
  const b = s.battle!
  s.gold += b.rewardGold

  // Sync HP/MP back to game state
  syncBattleToState(s)

  const expGain = b.rewardExp

  // ===== プレイヤーEXP & レベルアップ =====
  s.playerExp += expGain
  while (s.playerExp >= getExpToNext(s.playerLevel) && s.playerLevel < 30) {
    s.playerExp -= getExpToNext(s.playerLevel)
    s.playerLevel += 1
    // 勇者クラス成長: HP+12, MP+5, ATK+2, DEF+2, SPD+1
    s.playerMaxHp += 12
    s.playerHp = Math.min(s.playerHp + 12, s.playerMaxHp)
    s.playerMaxMp += 5
    s.playerMp = Math.min(s.playerMp + 5, s.playerMaxMp)
    s.playerAtk += 2
    s.playerDef += 2
    s.playerSpd += 1
    s.levelUpPending = true
    b.logs.push({ text: `⭐ ${s.playerName}がLv${s.playerLevel}にレベルアップ！`, type: 'system' })
    // スキル習得チェック
    const newSkill = PLAYER_SKILL_SCHEDULE.find(ps => ps.level === s.playerLevel)
    if (newSkill && !s.playerSkills.some(sk => sk.id === newSkill.skill.id)) {
      s.playerSkills.push(newSkill.skill)
      b.logs.push({ text: `✨ 新スキル「${newSkill.skill.name}」を習得した！`, type: 'system' })
    }
  }

  // ===== 仲間EXP & レベルアップ（生存パーティメンバーのみ）=====
  for (const cid of s.party) {
    const c = s.companions[cid]
    if (!c.joined || !c.alive) continue
    const def = COMPANIONS[cid]
    c.exp += expGain
    while (c.exp >= getExpToNext(c.level) && c.level < 30) {
      c.exp -= getExpToNext(c.level)
      c.level += 1
      c.maxHp += def.hpGrowth
      c.hp = Math.min(c.hp + def.hpGrowth, c.maxHp)
      c.maxMp += def.mpGrowth
      c.mp = Math.min(c.mp + def.mpGrowth, c.maxMp)
      c.atk += def.atkGrowth
      c.def += def.defGrowth
      c.spd += def.spdGrowth
      b.logs.push({ text: `⭐ ${def.name}がLv${c.level}にレベルアップ！`, type: 'system' })
      // 仲間スキル習得チェック
      const newCompSkill = def.learnableSkills?.find(ls => ls.level === c.level)
      if (newCompSkill && !c.learnedSkills.some(sk => sk.id === newCompSkill.skill.id)) {
        c.learnedSkills.push(newCompSkill.skill)
        b.logs.push({ text: `✨ ${def.name}が「${newCompSkill.skill.name}」を習得した！`, type: 'system' })
      }
    }
  }

  // ===== 封印石入手 =====
  if (b.sealStoneFound && !s.sealStones.includes(b.sealStoneFound)) {
    s.sealStones.push(b.sealStoneFound)
    b.logs.push({ text: `💎 ${sealStoneName(b.sealStoneFound)}を手に入れた！`, type: 'system' })
  }

  // ===== ボス撃破 =====
  if (b.isBoss) {
    const bossUid = b.units.find(u => u.isBoss)?.uid
    if (bossUid) s.defeatedBosses.push(bossUid)

    if (b.isFinalBoss) {
      b.logs.push({ text: `🏆 終末記録体アーカイブを討伐した！ルミナ大陸に平和が戻った！`, type: 'system' })
      return s
    }

    // ダンジョンボス撃破後、仲間加入イベント
    const loc = LOCATIONS[s.currentLocId]
    if (loc.companionId && !s.companions[loc.companionId].joined) {
      s.pendingCompanionJoin = loc.companionId
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

// ===== うろつく（町・中継地での探索） =====

export function wander(state: GameState): GameState {
  const s = deepClone(state)
  s.daysLeft -= 1
  if (s.daysLeft <= 0) {
    s.daysLeft = 0
    s.phase = 'gameover'
    return s
  }

  const roll = Math.random()
  if (roll < 0.35) {
    const gold = Math.floor(Math.random() * 50) + 20
    s.gold += gold
    s.message = `💰 うろついていたら ${gold}G を見つけた！`
  } else if (roll < 0.55) {
    s.playerExp += 15
    while (s.playerExp >= getExpToNext(s.playerLevel) && s.playerLevel < 30) {
      s.playerExp -= getExpToNext(s.playerLevel)
      s.playerLevel++
      s.playerMaxHp += 12; s.playerHp = Math.min(s.playerHp + 12, s.playerMaxHp)
      s.playerMaxMp += 5; s.playerMp = Math.min(s.playerMp + 5, s.playerMaxMp)
      s.playerAtk += 2; s.playerDef += 2; s.playerSpd += 1
      s.levelUpPending = true
      const newSkill = PLAYER_SKILL_SCHEDULE.find(ps => ps.level === s.playerLevel)
      if (newSkill && !s.playerSkills.some(sk => sk.id === newSkill.skill.id)) s.playerSkills.push(newSkill.skill)
    }
    s.message = '💪 うろついて体を動かした。（EXP +15）'
  } else if (roll < 0.70) {
    const items: Array<{itemId: string; qty: number}> = [
      { itemId: 'potion', qty: 1 },
      { itemId: 'ether', qty: 1 },
      { itemId: 'antidote', qty: 1 },
    ]
    const found = items[Math.floor(Math.random() * items.length)]
    const ex = s.inventory.find(i => i.itemId === found.itemId)
    if (ex) ex.qty += 1
    else s.inventory.push({ itemId: found.itemId, qty: 1 })
    const itemNames: Record<string, string> = { potion: 'ポーション', ether: 'エーテル', antidote: '毒消し' }
    s.message = `🎁 うろついていたら${itemNames[found.itemId]}を見つけた！`
  } else if (roll < 0.80) {
    const heal = Math.floor(s.playerMaxHp * 0.15)
    s.playerHp = Math.min(s.playerMaxHp, s.playerHp + heal)
    s.message = `✨ 静かに休んでいたら回復した。（HP +${heal}）`
  } else {
    // 稀に小さな敵エンカウント（中継地のenemy pool使用）
    const loc = LOCATIONS[s.currentLocId]
    const pool = loc.travelEnemyPool ?? loc.enemyPool ?? []
    if (pool.length > 0) {
      const enemyId = pool[Math.floor(Math.random() * pool.length)]
      s.message = '⚠️ 怪しい影に気づいた！'
      return startBattle(s, [enemyId], false)
    }
    s.message = '……何も見つからなかった。1日が過ぎた。'
  }

  return s
}

// ===== DUNGEON =====

export function enterDungeon(state: GameState): GameState {
  const s = deepClone(state)
  const loc = LOCATIONS[s.currentLocId]
  if (!loc.enemyPool || !loc.bossId) return s

  // ダンジョン探索は1日消費
  s.daysLeft -= 1
  if (s.daysLeft <= 0) {
    s.daysLeft = 0
    s.phase = 'gameover'
    return s
  }

  const pool = loc.enemyPool
  const count = Math.floor(Math.random() * 3) + 1  // 1〜3体
  const enemies: string[] = []
  for (let i = 0; i < count; i++) {
    enemies.push(pool[Math.floor(Math.random() * pool.length)])
  }

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
  const atkMod = attacker.statusEffects.find(e => e.id === 'atk_up') ? 1.5
    : attacker.statusEffects.find(e => e.id === 'atk_down') ? 0.65 : 1
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
      const atkMod = actor.statusEffects.find(e => e.id === 'atk_up') ? 1.5
        : actor.statusEffects.find(e => e.id === 'atk_down') ? 0.65 : 1
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
      target.statusEffects = target.statusEffects.filter(e => e.id !== 'atk_up')
      if (!target.statusEffects.find(e => e.id === 'atk_down')) {
        target.statusEffects.push({ id: 'atk_down', name: 'ATK DOWN', turnsLeft: 3 })
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
