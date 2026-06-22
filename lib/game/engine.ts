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
const COMPANION_IDS = new Set(['gares','liz','noa','cecil','bram','finn','vais','logan','iris','sig','elk','mira','zeno'])

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
    // 未加入仲間がセリフを話すイベントは初対面イベント(isMeetingEvent)のみ許可
    if (!ev.isMeetingEvent) {
      const hasUnmetSpeaker = ev.dialogues.some(
        d => COMPANION_IDS.has(d.speaker) && !joinedIds.includes(d.speaker)
      )
      if (hasUnmetSpeaker) continue
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

export function skipToEventEnd(state: GameState): GameState {
  const s = deepClone(state)
  const ev = EVENTS.find(e => e.id === s.activeEventId)
  if (!ev) return s
  s.activeEventLine = ev.dialogues.length - 1
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

  // 移動中ランダムイベント（全ロケーション型で発生）
  {
    const roll = Math.random()
    const TRAVEL_FLAVOR: Partial<Record<LocationId, string[]>> = {
      dragon_pass:    ['龍の峠を越える間、強風が吹き荒れた。', '遠くで竜のうなり声が聞こえた。身が引き締まる。'],
      demon_mine:     ['廃鉱山の入口に近づくにつれ、硫黄の臭いが漂ってきた。', '坑道の入口付近に古い血痕が残っていた。'],
      ancient_temple: ['古代神殿への道は暗い森の中を抜けていく。', 'どこからか古代語の詠唱声が聞こえた気がした。'],
      desert_ruins:   ['砂漠の熱風が容赦なく吹きつける。', '地平線の彼方に遺跡のシルエットが見え始めた。'],
      coastal_road:   ['潮風が心地よく吹いてきた。', '波音が旅の疲れを和らげる。'],
      spirit_spring:  ['精霊の泉に近づくと、空気が澄んでいくのを感じた。', '淡い光の粒が漂っている。'],
      lighthouse:     ['灯台の光が遠くで明滅している。', '波の音が激しくなってきた。'],
    }
    const flavorMsgs = TRAVEL_FLAVOR[destId] ?? []

    if (roll < 0.28) {
      // 28%: 敵エンカウント
      const pool = destLoc.travelEnemyPool ?? []
      if (pool.length > 0) {
        const enemyId = pool[Math.floor(Math.random() * pool.length)]
        s.message = '⚠️ 移動中に敵に遭遇した！'
        return startBattle(s, [enemyId], false)
      }
    } else if (roll < 0.40) {
      // 12%: 金/アイテム/回復
      const ev = Math.random()
      if (ev < 0.35) {
        const gold = Math.floor(Math.random() * 40) + 15
        s.gold += gold
        s.message = `💰 道中で ${gold}G を見つけた！`
      } else if (ev < 0.65) {
        const ex = s.inventory.find(i => i.itemId === 'potion')
        if (ex) ex.qty += 1
        else s.inventory.push({ itemId: 'potion', qty: 1 })
        s.message = '🧪 道中でポーションを拾った！'
      } else {
        const heal = Math.floor(s.playerMaxHp * 0.10)
        s.playerHp = Math.min(s.playerMaxHp, s.playerHp + heal)
        s.message = `✨ 清らかな泉を発見。HP が ${heal} 回復した！`
      }
    } else if (flavorMsgs.length > 0 && roll < 0.55) {
      // 15% (if flavor exists): 地形フレーバーメッセージ
      s.message = flavorMsgs[Math.floor(Math.random() * flavorMsgs.length)]
    }
    // それ以外: 何も起こらない（サイレント移動）
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
    const def = COMPANIONS[companionId]
    s.message = `✅ ${def.name}が仲間になった！「パーティ編成」でメンバーを組み替えよう。`
  } else {
    const def = COMPANIONS[companionId]
    s.message = `✅ ${def.name}が仲間になった！「パーティ編成」で出撃メンバーを選ぼう。`
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

  // コスト不足チェック（pendingBranchは維持して再選択できるようにする）
  if (chosen?.cost && s.gold < chosen.cost) {
    s.message = `所持金が足りない！（${chosen.cost}G必要）`
    return s
  }
  s.pendingBranch = undefined
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

function applyEventReward(s: GameState, reward: { gold?: number; exp?: number; itemId?: string; itemQty?: number; fullHeal?: boolean; pendingJoin?: CompanionId; message: string }) {
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
  if (reward.pendingJoin && !s.companions[reward.pendingJoin].joined) {
    s.pendingCompanionJoin = reward.pendingJoin
  }
  if (reward.message) s.message = reward.message
}

// 仲間加入を断った時のセリフ（PP4スタイルの重みのある選択）
const COMPANION_REJECTED_LINES: Partial<Record<CompanionId, string[]>> = {
  gares: ['……そうか。お前の選択を尊重しよう。', '……わかった。己の道を行け。'],
  liz: ['……そう……。でも、いつでも声をかけてね。', '……もし気が変わったら、また来て。'],
  noa: ['え、ほんとに？……残念。でも仕方ないか。', '……そっか。気をつけてね。'],
  cecil: ['……判断が早いのは好きよ。でも間違いじゃないかは確認した？', '……ふん、私は必要とされなかったのね。'],
  bram: ['チッ、腰抜けめ！……なんてね、気が変わったら来い。', 'まあ……その判断もひとつの強さか。'],
  finn: ['あっ……そうですか……。またいつでも！', '……えと……わかりました！またいつか！'],
  vais: ['フッ、賢明じゃないか。俺みたいなのと組んでも碌なことがない。', 'そうか。俺も強制はしない主義だ。'],
  logan: ['……そうか。俺も構わん。', '……己の選択だ。後悔しないならそれでいい。'],
  iris: ['……そう……。仕方ないわね。魔族だものね。', '……いいの。慣れてるから。'],
  sig: ['あれあれ、断られちゃったよ〜。まあいいや、また別の機会に！', '冷たいね〜。でも覚えといて。'],
  elk: ['……お前が決めたならそうしろ。俺の槍は準備できてるがな。', '獣は強制しない。お前が選んだことだ。'],
  mira: ['……そう。自然の流れに任せましょう。', '……いつか縁があれば、また。'],
  zeno: ['……人間らしい選択だ。', '……興味深い判断だ。記憶しておこう。'],
}

export function skipCompanion(state: GameState): GameState {
  const s = deepClone(state)
  const skipped = s.pendingCompanionJoin
  s.pendingCompanionJoin = undefined
  if (skipped) {
    const def = COMPANIONS[skipped]
    const lines = COMPANION_REJECTED_LINES[skipped] ?? ['……そうか。']
    const line = lines[Math.floor(Math.random() * lines.length)]
    s.message = `${def.emoji}${def.name}「${line}」`
  }
  return s
}

// ===== INN =====

const INN_FLAVOR_TEXTS: string[] = [
  '🌙 一夜の休息が体の疲れを癒した。明日への英気を養った。',
  '🌙 宿の主人が「気をつけて」と声をかけてくれた。旅は続く。',
  '🌙 久しぶりに布団で眠った。旅の疲れが溶けていった。',
  '🌙 夜中に遠くで狼の遠吠えが聞こえた。でも今夜は安全だ。',
  '🌙 食事と休息。それだけで明日への力が戻ってくる。',
  '🌙 仲間と少し話した。笑える話もあった。それだけで十分だ。',
  '🌙 月明かりの下、次の目的地を地図で確認した。',
  '🌙 静かな夜だった。旅の途中で、こんな夜が貴重に思えてくる。',
  '🌙 宿の暖炉の火が、旅の疲れをやさしく溶かしていった。',
  '🌙 夕食が美味しかった。ありきたりな料理でも、旅の後は格別だ。',
  '🌙 仲間のいびきが聞こえた。……それすらも、今は心強い。',
  '🌙 窓から星空が見えた。あの光のどこかに、故郷があるのかもしれない。',
  '🌙 明日は良い日になる気がする。根拠はないが、そんな気がする。',
  '🌙 宿の子供が「勇者さんですか？」と聞いてきた。まだ道半ばだよ、と答えた。',
]

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
  s.message = INN_FLAVOR_TEXTS[Math.floor(Math.random() * INN_FLAVOR_TEXTS.length)]
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

  // ボス開幕台詞（PP4スタイル）
  const BOSS_OPENING_LINES: Record<string, string> = {
    bandit_king: '「フフ……よくここまで来た。だが、お前たちの旅はここで終わりだ！」',
    mine_king: '「愚かな侵入者め！この鉱山は俺の王国だ！貴様らの骨で床を飾ってやろう！」',
    storm_dragon: '「……小さき命よ、嵐に飲まれよ！」',
    forest_king: '「この森の全ての命が、貴様らを拒絶する！」',
    tidal_king: '「潮の力に逆らうとは……愚か者め！波に飲まれて消えろ！」',
    archive: '「記録せよ……この世界の終わりを。全ては記録に刻まれ、消える運命だ！」',
  }

  const bossId = isBoss ? enemyIds[0] : null
  const openingLog: BattleState['logs'][0][] = []
  if (isBoss && bossId && BOSS_OPENING_LINES[bossId]) {
    const bossName = ENEMIES[bossId]?.name ?? ''
    openingLog.push({ text: `${ENEMIES[bossId]?.emoji ?? '👹'} ${bossName}が立ちはだかった！`, type: 'system' })
    openingLog.push({ text: `${BOSS_OPENING_LINES[bossId]}`, type: 'system' })
  } else {
    openingLog.push({ text: '⚔️ 敵が現れた！', type: 'system' })
  }

  const battle: BattleState = {
    units: allUnits,
    phase: 'select_action',
    turnQueue,
    currentUid: turnQueue[0],
    logs: openingLog,
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
  if (actor.isAlly) return processCompanionTurn(state)
  return processEnemyTurn(state)
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
  const attacker = b.units.find(u => u.uid === b.currentUid)
  const target = b.units.find(u => u.uid === targetUid)
  if (!attacker || !target) return state

  const result = calcDamage(attacker, target)
  const died = applyDamage(target, result.dmg)
  b.logs.push({
    text: result.crit
      ? `💥 ${attacker.name}の会心の一撃！${target.name}に${result.dmg}ダメージ！`
      : `⚔️ ${attacker.name}の攻撃！${target.name}に${result.dmg}ダメージ`,
    type: result.crit ? 'critical' : 'damage',
  })
  if (died) addDeathLog(b, target)

  return advanceTurn(s)
}

export function battleSkill(state: GameState, skill: Skill, targetUid?: string): GameState {
  if (!state.battle) return state
  const s = deepClone(state)
  const b = s.battle!
  const actor = b.units.find(u => u.uid === b.currentUid)
  if (!actor) return state

  if (actor.mp < skill.mpCost) {
    // MP不足 → 1ターン休憩して少し回復
    const mpRecover = Math.max(5, Math.floor(actor.maxMp * 0.08))
    actor.mp = Math.min(actor.maxMp, actor.mp + mpRecover)
    b.logs.push({ text: `💤 ${actor.name}はMPが足りず休憩した。MP+${mpRecover}回復。`, type: 'status' })
    return advanceTurn(s)
  }
  actor.mp -= skill.mpCost
  b.logs.push({ text: `✨ ${actor.name}は「${skill.name}」を使った！`, type: 'status' })

  const targets = resolveTargets(b, skill, actor, targetUid)
  for (const tgt of targets) {
    applySkillEffect(b, actor, tgt, skill)
  }

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

  const target = b.units.find(u => u.uid === targetUid)
  if (!target) return state

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
    syncBattleToState(s)
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
  const actor = b.units.find(u => u.uid === b.currentUid)
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

  // ボス激怒フェーズ判定（HP50%以下で初回突入）
  if (actor.isBoss && !b.bossRaged && actor.hp <= actor.maxHp * 0.5) {
    b.bossRaged = true
    b.logs.push({ text: `💢 ${actor.name}が激怒した！攻撃が激化する！`, type: 'system' })
  }
  // ボス瀕死フェーズ（HP30%以下）：さらにATK+30%・スキル率75%
  const isBossDying = actor.isBoss && actor.hp <= actor.maxHp * 0.3
  if (isBossDying && !b.logs.some(l => l.text.includes('最後の力'))) {
    b.logs.push({ text: `🔥 ${actor.name}が最後の力を振り絞る！`, type: 'system' })
  }
  const isRaging = actor.isBoss && b.bossRaged
  const bossAtkMult = isBossDying ? 1.3 : 1.0

  // Occasionally use skill (only pick from affordable skills)
  const affordableSkills = actor.skills.filter(sk => actor.mp >= sk.mpCost)
  const skillChance = isBossDying ? 0.75 : isRaging ? 0.55 : 0.3
  const useSkill = affordableSkills.length > 0 && Math.random() < skillChance
  if (useSkill) {
    // 激怒中は最大ダメージスキルを優先
    const skill = isRaging
      ? affordableSkills.reduce((best, sk) => sk.power > best.power ? sk : best, affordableSkills[0])
      : affordableSkills[Math.floor(Math.random() * affordableSkills.length)]
    actor.mp -= skill.mpCost
    const logPrefix = isBossDying ? '🌋' : isRaging ? '💥' : '🔥'
    b.logs.push({ text: `${logPrefix} ${actor.name}は「${skill.name}」を使った！`, type: 'status' })
    const targets = skill.target === 'enemy_all'
      ? aliveAllies
      : skill.target === 'self'
      ? [actor]
      : [aliveAllies[Math.floor(Math.random() * aliveAllies.length)]]
    for (const tgt of targets) applySkillEffect(b, actor, tgt, skill)
    return advanceTurn(s)
  }

  // 激怒中はHPが最も低いアライを狙う（弱者集中攻撃）
  const target = isRaging
    ? [...aliveAllies].sort((a, b) => a.hp - b.hp)[0]
    : aliveAllies[Math.floor(Math.random() * aliveAllies.length)]
  const result = calcDamage(actor, target)
  const boostedDmg = Math.floor(result.dmg * bossAtkMult)
  const diedFromAtk = applyDamage(target, boostedDmg)
  b.logs.push({
    text: result.crit
      ? `💥 ${actor.name}の会心！${target.name}に${boostedDmg}ダメージ！`
      : isBossDying
      ? `🌋 ${actor.name}の渾身の一撃！${target.name}に${boostedDmg}ダメージ！`
      : `⚔️ ${actor.name}の攻撃！${target.name}に${boostedDmg}ダメージ`,
    type: result.crit ? 'critical' : 'damage',
  })
  if (diedFromAtk) addDeathLog(b, target)

  return advanceTurn(s)
}

// ===== COMPANION AI =====

function processCompanionTurn(state: GameState): GameState {
  if (!state.battle) return state
  const s = deepClone(state)
  const b = s.battle!
  const actor = b.units.find(u => u.uid === b.currentUid)
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
  const lowHpAllies = aliveAllies.filter(u => u.hp < u.maxHp * 0.3)
  const lowHpAlly = [...lowHpAllies].sort((a, b) => a.hp - b.hp)[0]
  const healAllSkill = actor.skills.find(sk => sk.target === 'ally_all' && sk.effect === 'heal' && actor.mp >= sk.mpCost)
  const healOneSkill = actor.skills.find(sk => sk.target === 'ally_one' && sk.effect === 'heal' && actor.mp >= sk.mpCost)
  // ally_all heal when multiple allies are low, ally_one heal when just one is low
  if (lowHpAllies.length >= 2 && healAllSkill) {
    actor.mp -= healAllSkill.mpCost
    b.logs.push({ text: `💚 ${actor.name}は「${healAllSkill.name}」を使った！`, type: 'heal' })
    for (const tgt of aliveAllies) applySkillEffect(b, actor, tgt, healAllSkill)
    return advanceTurn(s)
  }
  if (lowHpAlly && healOneSkill) {
    actor.mp -= healOneSkill.mpCost
    b.logs.push({ text: `💚 ${actor.name}は「${healOneSkill.name}」を使った！`, type: 'heal' })
    applySkillEffect(b, actor, lowHpAlly, healOneSkill)
    return advanceTurn(s)
  }

  // Occasionally use self-buff when HP is healthy
  const selfBuffSkills = actor.skills.filter(sk => sk.target === 'self' && actor.mp >= sk.mpCost)
  if (selfBuffSkills.length > 0 && actor.hp > actor.maxHp * 0.5 && Math.random() < 0.25) {
    const skill = selfBuffSkills[Math.floor(Math.random() * selfBuffSkills.length)]
    actor.mp -= skill.mpCost
    b.logs.push({ text: `✨ ${actor.name}は「${skill.name}」を使った！`, type: 'status' })
    applySkillEffect(b, actor, actor, skill)
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
    b.logs.push({ text: `✨ ${actor.name}は「${skill.name}」を使った！`, type: 'status' })
    const targets = skill.target === 'enemy_all' ? aliveEnemies : [aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]]
    for (const tgt of targets) applySkillEffect(b, actor, tgt, skill)
    return advanceTurn(s)
  }

  // Normal attack on weakest enemy
  const target = aliveEnemies.reduce((weakest, e) => e.hp < weakest.hp ? e : weakest)
  const result = calcDamage(actor, target)
  const diedFromAtk = applyDamage(target, result.dmg)
  b.logs.push({
    text: result.crit
      ? `💥 ${actor.name}の会心！${target.name}に${result.dmg}ダメージ！`
      : `⚔️ ${actor.name}の攻撃！${target.name}に${result.dmg}ダメージ`,
    type: result.crit ? 'critical' : 'damage',
  })
  if (diedFromAtk) addDeathLog(b, target)

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
      if (unit.hp <= 0) addDeathLog(b, unit, '毒で倒れた')
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
  const playerUnit = b.units.find(u => u.isPlayer)

  // プレイヤー死亡はゲームオーバー（JRPGスタンダード：主人公が倒れたら全滅扱い）
  if (playerUnit && playerUnit.hp <= 0) {
    b.phase = 'defeat'
    b.logs.push({ text: `💀 ${playerUnit.name}は倒れた... 旅はここで終わった。`, type: 'death' })
    return s
  }

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
    const bossUnit = b.units.find(u => u.isBoss)
    if (bossUnit) {
      // UID形式 "enemy_0_<bossId>" から実際のbossIdを抽出して格納
      const actualBossId = bossUnit.uid.replace(/^enemy_\d+_/, '')
      s.defeatedBosses.push(actualBossId)
    }

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

  // 勝利後の仲間コメント（BattleSceneのVICTORYパネルに表示）
  if (!b.isFinalBoss) {
    const alivePartyUnits = b.units.filter(u => u.isAlly && !u.isPlayer && u.hp > 0 && u.companionId)
    if (alivePartyUnits.length > 0) {
      const speaker = alivePartyUnits[Math.floor(Math.random() * alivePartyUnits.length)]
      if (speaker.companionId) {
        const lines = COMPANION_BATTLE_COMMENTS[speaker.companionId] ?? []
        if (lines.length > 0) {
          const line = lines[Math.floor(Math.random() * lines.length)]
          b.logs.push({ text: `${speaker.emoji}${speaker.name}「${line}」`, type: 'system' })
        }
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

// 仲間の死亡時最後のセリフ（PP4スタイル最大の感動ポイント）
const COMPANION_DEATH_WORDS: Partial<Record<CompanionId, string[]>> = {
  gares: ['……守れなかった……申し訳ない……', '行け……お前たちが……希望だ……', '騎士として……悔いはない……', '次は……頼んだぞ……'],
  liz: ['……神様……なぜ……', 'みんな……生きてね……', '光に……包まれる……', 'お願い……諦めないで……'],
  noa: ['まだ……矢が……残って……', 'ごめん……役に……立てなかった……', '次の一射が……見たかった……', 'みんな……頑張って……'],
  cecil: ['魔力が……尽きた……', '計算が……狂った……ここで……', 'バカな……私が……ここで……', '悔しい……まだやれた……'],
  bram: ['まだ……戦える……', 'この……この程度で……くそっ……', '強い奴が……いたな……', 'お前たちに……任せる……'],
  finn: ['怖かった……でも……戦えた……', '先輩……ごめんなさい……', '夢中で……剣を振ったら……', 'もっと……強くなりたかった……'],
  vais: ['まさか……俺が……こんな場所で……', '賭けに……負けた……な……', '散り際は……悪くない……', 'みんなに……借りが……できたな……'],
  logan: ['……ようやく……楽に……なれる……', '死刑執行人が……処刑される……か……', 'よかった……また……誰かを……', '……罪を……償えた……か……'],
  iris: ['魔族の血も……ここまで……か……', 'あなた達と……戦えて……', '闇は……もう……恐くない……', '……最後まで……人として……'],
  sig: ['うわ……本当に……死ぬとは……', 'こりゃ……賭けに……負けた……', '借りは……来世で……', 'ははっ……最悪な……結末だ……'],
  elk: ['槍が……まだ……折れてないのに……', '群れに……負けるとは……', 'お前たちを……信じる……', '獣の死に際……見せてやる……'],
  mira: ['エルフの命も……有限か……', '風よ……最後に……吹いてくれ……', '森に……帰れる……かしら……', '弓を……引き継いで……'],
  zeno: ['……魔族は……こうして……消えていく……', '面白い旅だった……な……', '人間と……一緒に……死ぬとは……', '……また……会おう……'],
}

// 仲間が死亡した後の生き残った仲間の追悼コメント（PP4最大の感動シーン）
const COMPANION_MOURNING_RESPONSES: Partial<Record<CompanionId, string[]>> = {
  gares: ['……次は絶対に守る。', '……仇は俺が取る。', '……立つ。まだ戦いは終わっていない。'],
  liz: ['……どうして……どうしてなの……', '光よ……この魂を……安らかに……', '……泣いてる場合じゃない。前へ進まないと……'],
  noa: ['……嘘でしょ……', '……矢を向けてやる。仇のために。', '……ごめん……守れなかった……'],
  cecil: ['……計算が……狂った……', '……この痛み、魔力に変える。奴らへの怒りで。', '……泣かない。今は泣かない。'],
  bram: ['……くそっ！死なせてなるか！……死なせてしまった……', '……強くなる。もっと。', '……待ってろ、すぐに仇を取ってやる。'],
  finn: ['……え……え……？', '……先輩……！……絶対に強くなります……', '……泣かないって決めたのに……'],
  vais: ['……こんな顔で泣く俺を見られたくなかったが……', '……借りは返してもらう。あいつに。', '……いなくなるとは思ってなかった。本当に。'],
  logan: ['……俺よりお前が先に逝くとは思わなかった……', '……仇を取る。それが俺にできることだ。', '……強くなる。死者の分まで。'],
  iris: ['……嫌……そんな……', '……この力、あなたの分まで使う。', '……人間も魔族も、死は同じなのね……'],
  sig: ['……笑えない……珍しく笑えない……', '……借りがまたひとつできた。絶対に返す。', '……遊んでる場合じゃなかった……'],
  elk: ['……獣は仲間の死を忘れない。ずっと憶えている。', '……槍に誓う。仇を打つ。', '……お前は強かった……だから悔しい……'],
  mira: ['……森の精霊に祈る。安らかに眠れと。', '……この矢、あなたの魂と共に放つ。', '……風が……泣いているようね……'],
  zeno: ['……人間の死を見るのは……つらいな。', '……面白い奴だった。もったいない。', '……魔族の世界でも、仲間の死は同じだ。痛い。'],
}

// 仲間の戦闘後一言コメント（PP4スタイル）
const COMPANION_BATTLE_COMMENTS: Partial<Record<CompanionId, string[]>> = {
  gares: ['よし、全員無事か確認しろ！', '怯むな、まだ戦いは続く！', '傷は後で手当てする、先を急ごう。', '騎士として当然の結果だ。'],
  liz: ['よかった……皆、怪我はない？', '光よ、感謝します。', '神官として恥じない戦いだったわ。', '次は回復に集中するね！'],
  noa: ['全弾命中……だね。', '見てよ、一本も無駄にしなかったよ！', '弓は嘘をつかない。', '次はもっと上手く狙えるよ！'],
  cecil: ['魔法の消費が激しい……でも勝てたわ。', '理論通り！完璧ね。', '次はもっと効率的に行くわ。', 'フッ、この程度かしら。'],
  bram: ['まだまだ！もっと強い奴はいないのか！', 'この拳に感謝しろよ。', 'いい汗かいたな。', '余裕の勝利だな！'],
  finn: ['やったー！勝ったよ！', '少し慌てたけど……ちゃんと戦えた！', '先輩、見てましたか？', '次はもっとカッコよく戦います！'],
  vais: ['はっ、こんなもんか。', '抵抗する前に終わらせてやったのに。', '盗賊時代の方がよほどキツかったぜ。', '楽な仕事だったな。'],
  logan: ['……問題ない。', '死体に挨拶はいらん。', '弱い。次だ。', '倒れるのが仕事だったな、奴らは。'],
  iris: ['この力、まだ制御できています。', '魔族の力を使わずに倒せたわ。', '……ありがとう、一緒に戦ってくれて。', '私の魔法、役に立った？'],
  sig: ['はっはー！余裕余裕！', '勝ち確だと思ってたぜ。', 'いいね、報酬が楽しみだ。', 'また一つ、借りができたね〜。'],
  elk: ['ふんッ！こんなやつら、俺の槍には届かん。', '獣の勘は正しかった。', '次はもっと速く片付けるぞ。', '群れで来ようと関係ない！'],
  mira: ['エルフの弓は裏切らないわ。', '静かに、でも確実に。', '風が味方してくれたの。', '悪いけど、手を抜いていたわ。'],
  zeno: ['……興味深い戦法だった。', '魔族の血が騒いだ。', '……次は私が先に動こう。', '人間と戦うのは……悪くない。'],
}

export function closeBattle(state: GameState): GameState {
  const s = deepClone(state)
  if (!s.battle) return s

  const defeated = s.battle.phase === 'defeat'
  const isFinal = s.battle.isFinalBoss && s.battle.phase === 'victory'
  syncBattleToState(s)
  s.battle = undefined

  // バトル終了時（勝利・敗北問わず）ステータス異常をクリア（JRPGスタンダード）
  s.playerStatus = []
  const newlyDead: string[] = []
  for (const id of Object.keys(s.companions) as CompanionId[]) {
    const c = s.companions[id]
    if (c.joined && c.alive) {
      c.statusEffects = []
    } else if (c.joined && !c.alive) {
      newlyDead.push(COMPANIONS[id]?.name ?? id)
    }
  }
  // 死亡した仲間をパーティから除外（PP4スタイル: 永続死亡で即使用不可）
  const aliveAfterBattle = s.party.filter(id => s.companions[id]?.alive)
  s.party = aliveAfterBattle
  if (newlyDead.length > 0) {
    // 生き残った仲間の追悼コメントをメッセージに付加（PP4最大の感動シーン）
    let mournerMsg = ''
    if (aliveAfterBattle.length > 0) {
      const mourner = aliveAfterBattle[Math.floor(Math.random() * aliveAfterBattle.length)] as CompanionId
      const def = COMPANIONS[mourner]
      const lines = COMPANION_MOURNING_RESPONSES[mourner] ?? ['……']
      const line = lines[Math.floor(Math.random() * lines.length)]
      mournerMsg = `\n${def.emoji}${def.name}「${line}」`
    }
    s.message = `💀 ${newlyDead.join('・')}が永眠した……二度と戦えない${mournerMsg}`
  } else if (!defeated && !isFinal) {
    // 勝利後の仲間一言コメント
    const aliveParty = s.party.filter(id => s.companions[id]?.alive)
    if (aliveParty.length > 0) {
      const speakerId = aliveParty[Math.floor(Math.random() * aliveParty.length)]
      const def = COMPANIONS[speakerId]
      const lines = COMPANION_BATTLE_COMMENTS[speakerId] ?? ['よし、先を急ごう。']
      const line = lines[Math.floor(Math.random() * lines.length)]
      s.message = `${def.emoji}${def.name}「${line}」`
    }
  }

  if (defeated) {
    s.phase = 'gameover'
  } else if (isFinal) {
    s.phase = 'win'
    s.achievements = calcAchievements(s)
  } else {
    s.phase = 'location'
  }
  return s
}

function calcAchievements(s: GameState): string[] {
  const achs: string[] = []
  const joinedAll = Object.values(s.companions).filter(c => c.joined)
  const deadComps = joinedAll.filter(c => !c.alive)
  const aliveComps = joinedAll.filter(c => c.alive)
  const zenoJoined = s.companions.zeno?.joined
  const totalLocs = 21 // ルミナ大陸の全ロケーション数

  achs.push('🏆 封印の継承者 — 魔王の封印を成し遂げた！')

  // 難易度
  if (s.difficulty === 'hard') achs.push('💀 鬼神の猛者 — ハード難易度でクリア！')
  else if (s.difficulty === 'normal') achs.push('⚔️ 百年の誓い — ノーマルでクリア！')
  else achs.push('🌱 旅の始まり — イージーでクリア！')

  // 残り日数
  if (s.daysLeft >= 90) achs.push('🌩️ 瞬殺 — 残り90日以上！伝説の速さ！')
  else if (s.daysLeft >= 70) achs.push('⚡ 電光石火 — 残り70日以上でクリア！（SS評価達成）')
  else if (s.daysLeft >= 50) achs.push('🌟 手際よし — 残り50日以上でクリア！')
  else if (s.daysLeft <= 5) achs.push('🕯️ 最後の灯 — 残り5日以内の奇跡的勝利！')
  else if (s.daysLeft <= 10) achs.push('🔥 土壇場の英雄 — 残り10日以内のギリギリ勝利！')

  // ハードSS
  if (s.difficulty === 'hard' && s.daysLeft >= 40) achs.push('🔱 修羅道の覇者 — ハードで残り40日以上！')

  // 仲間
  if (deadComps.length === 0 && joinedAll.length >= 3) achs.push('💚 誰も失わなかった — 3人の仲間を全員生還させた！')
  else if (deadComps.length === 0 && joinedAll.length > 0) achs.push('💚 誰も失わなかった — 仲間を全員生還させた！')
  if (deadComps.length > 0) achs.push(`💔 散った仲間たち — ${deadComps.length}人の仲間を失った`)
  if (joinedAll.length === 0) achs.push('🗡️ 孤独な戦士 — 仲間なしで魔王を封印した！')
  if (aliveComps.length >= 3) achs.push('👥 最強パーティ — 3人の仲間と共に勝利！')

  // 隠しキャラ
  if (zenoJoined) achs.push('😈 謎の魔族の絆 — ゼノを仲間にした（隠しキャラ加入）')

  // プレイヤーレベル
  if (s.playerLevel >= 25) achs.push('⚔️ 覚醒の勇者 — Lv25以上でクリア！最強到達！')
  else if (s.playerLevel >= 20) achs.push('💪 勇者の覚醒 — Lv20以上でクリア！')

  // ボス討伐
  const allBossIds = ['bandit_king','mine_king','storm_dragon','forest_king','tidal_king','archive']
  const defeatedAll = allBossIds.every(id => s.defeatedBosses.includes(id))
  if (defeatedAll) achs.push('👑 全ボス討伐 — 全てのボスを倒した伝説の勇者！')
  else if (s.defeatedBosses.length >= 4) achs.push('🏹 熟練の討伐者 — 4体以上のボスを倒した！')

  // 所持金
  if (s.gold >= 3000) achs.push('💎 黄金王 — クリア時に3000G以上保持！')
  else if (s.gold >= 1000) achs.push('💰 大富豪 — クリア時に1000G以上保持！')

  // 探索
  if (s.visitedLocs.length >= totalLocs) achs.push('🗺️ 大陸踏破 — ルミナ大陸の全ロケーションを訪問！')
  else if (s.visitedLocs.length >= 15) achs.push('🧭 冒険家 — 15か所以上のロケーションを訪問！')

  // アイテム
  const totalItems = s.inventory.reduce((sum, i) => sum + i.qty, 0)
  if (totalItems >= 10) achs.push('🎒 準備万端 — 10個以上のアイテムを持ってクリア！')

  // クリアイベント数
  if (s.completedEvents.length >= 30) achs.push('📖 物語の語り部 — 30以上のイベントを体験した！')
  else if (s.completedEvents.length >= 15) achs.push('📜 旅の記録者 — 15以上のイベントを体験した！')

  return achs
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

// ===== 戦闘外アイテム使用（ロケーション画面から） =====
export function useItemOutOfBattle(state: GameState, itemId: string, targetId: 'player' | CompanionId): GameState {
  const s = deepClone(state)
  const slot = s.inventory.find(i => i.itemId === itemId)
  if (!slot || slot.qty <= 0) return { ...s, message: 'アイテムがない。' }
  const item = ITEMS[itemId]
  if (!item) return { ...s, message: '不明なアイテムだ。' }

  slot.qty -= 1
  if (slot.qty === 0) s.inventory = s.inventory.filter(i => i.itemId !== itemId)

  if (targetId === 'player') {
    if (item.effect === 'heal_hp') {
      const healed = Math.min(item.power, s.playerMaxHp - s.playerHp)
      s.playerHp = Math.min(s.playerMaxHp, s.playerHp + item.power)
      s.message = `🧪 ${item.name}を使った。HP +${healed}`
    } else if (item.effect === 'heal_mp') {
      const healed = Math.min(item.power, s.playerMaxMp - s.playerMp)
      s.playerMp = Math.min(s.playerMaxMp, s.playerMp + item.power)
      s.message = `✨ ${item.name}を使った。MP +${healed}`
    } else if (item.effect === 'heal_both') {
      const hp = Math.min(item.power, s.playerMaxHp - s.playerHp)
      const mp = Math.min(40, s.playerMaxMp - s.playerMp)
      s.playerHp = Math.min(s.playerMaxHp, s.playerHp + item.power)
      s.playerMp = Math.min(s.playerMaxMp, s.playerMp + 40)
      s.message = `🌿 ${item.name}を使った。HP +${hp}・MP +${mp}`
    } else {
      s.message = `${item.name}を使った。`
    }
  } else {
    const c = s.companions[targetId]
    if (!c || !c.alive) return { ...s, message: 'その仲間は回復できない。' }
    if (item.effect === 'heal_hp') {
      const healed = Math.min(item.power, c.maxHp - c.hp)
      c.hp = Math.min(c.maxHp, c.hp + item.power)
      const def = COMPANIONS[targetId]
      s.message = `🧪 ${def.name}に${item.name}を使った。HP +${healed}`
    } else if (item.effect === 'heal_mp') {
      const healed = Math.min(item.power, c.maxMp - c.mp)
      c.mp = Math.min(c.maxMp, c.mp + item.power)
      const def = COMPANIONS[targetId]
      s.message = `✨ ${def.name}に${item.name}を使った。MP +${healed}`
    } else if (item.effect === 'heal_both') {
      const hp = Math.min(item.power, c.maxHp - c.hp)
      c.hp = Math.min(c.maxHp, c.hp + item.power)
      c.mp = Math.min(c.maxMp, c.mp + 40)
      const def = COMPANIONS[targetId]
      s.message = `🌿 ${def.name}に${item.name}を使った。HP +${hp}`
    } else {
      s.message = `${item.name}を使った。`
    }
  }
  return s
}

// ===== 野営して休む（中継地での無料部分回復） =====
export function campRest(state: GameState): GameState {
  const s = deepClone(state)
  const healPct = 0.3
  const playerHeal = Math.floor(s.playerMaxHp * healPct)
  s.playerHp = Math.min(s.playerMaxHp, s.playerHp + playerHeal)

  const CAMP_QUOTES: Partial<Record<string, string[]>> = {
    gares: ['「体を休めておけ。明日の戦いに備えろ。」', '「野営か……懐かしい感じがするな。」'],
    liz: ['「ゆっくり休もう。回復魔法より睡眠が一番よ。」', '「焚き火がきれいね。こんな夜は好き。」'],
    noa: ['「星が綺麗！ルミナって広いんだね〜。」', '「やっぱり自然の中での休憩が一番好き。」'],
    cecil: ['「……休息も戦略のひとつよ。批判はしないわ。」', '「次の行動を計画する時間でもある。」'],
    bram: ['「飯はないのか……まあ、休めるだけマシか。」', '「ぐっすり眠れそうだ。」'],
    finn: ['「野外で眠るの、実は苦手で……でも慣れました！」', '「先輩、明日もよろしくお願いします！」'],
    vais: ['「盗賊時代は毎晩こんな感じだったな。」', '「……やっぱり仲間と過ごす夜は悪くない。」'],
    iris: ['「焚き火、魔族でも暖かく感じるんですね……」', '「久しぶりに穏やかな気持ちになれた気がします。」'],
    sig: ['「星を見ながら一杯やりたいところだが……まあいいか。」', '「良い夜だ。次の儲け話を考えよう。」'],
    elk: ['「風が心地いい。獣の感覚が研ぎ澄まされる。」', '「……ゆっくり休もう。体が資本だ。」'],
    mira: ['「精霊の声が聞こえる気がします。この地は清らかですね。」', '「エルフは夜露が好きなんです。」'],
    zeno: ['「……休息か。人間は案外、こういう時間を大切にするんだな。」'],
  }
  let campQuote = ''
  const alivePartyIds = s.party.filter(id => s.companions[id]?.alive)
  if (alivePartyIds.length > 0) {
    const randomId = alivePartyIds[Math.floor(Math.random() * alivePartyIds.length)]
    const quotes = CAMP_QUOTES[randomId] ?? []
    if (quotes.length > 0) {
      const companionName = COMPANIONS[randomId as keyof typeof COMPANIONS]?.name ?? randomId
      campQuote = ` ${companionName}${quotes[Math.floor(Math.random() * quotes.length)]}`
    }
  }
  for (const cid of s.party) {
    const c = s.companions[cid]
    if (c.joined && c.alive) {
      const cheal = Math.floor(c.maxHp * healPct)
      c.hp = Math.min(c.maxHp, c.hp + cheal)
    }
  }
  s.message = `🏕️ 野営して体を休めた。HP +${playerHeal}（仲間も同様に回復）${campQuote}`
  return s
}

// ===== うろつく（町・中継地での探索） =====

// wanderフレーバーテキスト（場所タイプ別・PP4スタイル）
const WANDER_GOLD_TEXTS: Record<string, string[]> = {
  town: [
    '市場の片隅に落ちているのを見つけた',
    '宿屋のテーブルの下に転がっていた',
    '路地裏でこぼれたコインを拾った',
    '露天商の後ろに忘れられていた',
    '喧嘩の後の現場に転がっていた',
  ],
  relay: [
    '草むらの中に隠されていた',
    '古い石碑の陰に埋めてあった',
    '木の根元の穴にしまわれていた',
    '道端に落ちているのを見つけた',
    '旅人が置き忘れたものを拾った',
  ],
  dungeon: [
    '岩の隙間に落ちていた',
    '以前の冒険者が残した戦利品だ',
    '崩れた壁の中から出てきた',
    '怪しい宝箱から漏れていた',
  ],
}

const WANDER_TRAIN_TEXTS: string[][] = [
  ['剣の素振りを続けた。体が熱くなる。'],
  ['壁に向かって技の練習をした。'],
  ['呼吸法を意識しながら走り込んだ。'],
  ['仲間に手合わせを頼んで体を動かした。'],
  ['夜明けまで基礎練習を繰り返した。'],
  ['過去の戦いを思い出しながら訓練した。'],
]

const WANDER_ITEM_PLACES: Record<string, string> = {
  town: '市場の外れに',
  relay: '茂みの中に',
  dungeon: '岩陰に',
  castle: '庭園の隅に',
}

const WANDER_REST_TEXTS: string[] = [
  '木陰で横になり、しばらく目を閉じた。',
  '泉のほとりで体を休めた。',
  '旅の疲れを癒すように、ぼんやりと座っていた。',
  '何もしない時間が、逆に力をくれた。',
  '仲間と他愛もない話をしながら一休みした。',
]

export function wander(state: GameState): GameState {
  const s = deepClone(state)
  s.daysLeft -= 1
  if (s.daysLeft <= 0) {
    s.daysLeft = 0
    s.phase = 'gameover'
    return s
  }

  const loc = LOCATIONS[s.currentLocId]
  const locType = loc?.type ?? 'relay'

  const roll = Math.random()
  if (roll < 0.35) {
    const goldBase = Math.floor(15 + s.playerLevel * 3)
    const gold = Math.floor(Math.random() * goldBase) + goldBase
    s.gold += gold
    const texts = WANDER_GOLD_TEXTS[locType] ?? WANDER_GOLD_TEXTS.relay
    const place = texts[Math.floor(Math.random() * texts.length)]
    s.message = `💰 ${place} ${gold}G を見つけた！`
  } else if (roll < 0.55) {
    const expGain = Math.floor(10 + s.playerLevel * 2.5)
    s.playerExp += expGain
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
    const leveledUpNames: string[] = []
    const learnedSkillMsgs: string[] = []
    for (const cid of s.party) {
      const c = s.companions[cid]
      if (!c.joined || !c.alive) continue
      const def = COMPANIONS[cid]
      c.exp += expGain
      while (c.exp >= getExpToNext(c.level) && c.level < 30) {
        c.exp -= getExpToNext(c.level)
        c.level++
        c.maxHp += def.hpGrowth; c.hp = Math.min(c.hp + def.hpGrowth, c.maxHp)
        c.maxMp += def.mpGrowth; c.mp = Math.min(c.mp + def.mpGrowth, c.maxMp)
        c.atk += def.atkGrowth; c.def += def.defGrowth; c.spd += def.spdGrowth
        const newCompSkill = def.learnableSkills?.find(ls => ls.level === c.level)
        if (newCompSkill && !c.learnedSkills.some(sk => sk.id === newCompSkill.skill.id)) {
          c.learnedSkills.push(newCompSkill.skill)
          learnedSkillMsgs.push(`${def.name}が「${newCompSkill.skill.name}」を習得！`)
        }
        leveledUpNames.push(def.name)
      }
    }
    const trainText = WANDER_TRAIN_TEXTS[Math.floor(Math.random() * WANDER_TRAIN_TEXTS.length)][0]
    const lvMsg = leveledUpNames.length > 0 ? ` ⭐${leveledUpNames.join('・')}もレベルアップ！` : ''
    const skMsg = learnedSkillMsgs.length > 0 ? ` ✨${learnedSkillMsgs.join(' ')}` : ''
    s.message = `💪 ${trainText}（EXP +${expGain}）${lvMsg}${skMsg}`
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
    const place = WANDER_ITEM_PLACES[locType] ?? 'どこかに'
    s.message = `🎁 ${place}${itemNames[found.itemId]}を見つけた！`
  } else if (roll < 0.78) {
    const heal = Math.floor(s.playerMaxHp * 0.15)
    s.playerHp = Math.min(s.playerMaxHp, s.playerHp + heal)
    const restText = WANDER_REST_TEXTS[Math.floor(Math.random() * WANDER_REST_TEXTS.length)]
    s.message = `✨ ${restText}（HP +${heal}）`
  } else if (roll < 0.87) {
    // 稀に小さな敵エンカウント（中継地のenemy pool使用）
    const pool = loc.travelEnemyPool ?? loc.enemyPool ?? []
    if (pool.length > 0) {
      const enemyId = pool[Math.floor(Math.random() * pool.length)]
      s.message = '⚠️ 怪しい影に気づいた！'
      return startBattle(s, [enemyId], false)
    }
    const nothingTexts = [
      '……何も見つからなかった。1日が過ぎた。',
      '……静かな一日だった。',
    ]
    s.message = nothingTexts[Math.floor(Math.random() * nothingTexts.length)]
  } else if (roll < 0.93) {
    // 謎の行商人（高額アイテムを格安で売る）
    const discountItems = [
      { itemId: 'hi_potion', name: 'ハイポーション', normalPrice: 250, deal: 60 },
      { itemId: 'panacea', name: '万能薬', normalPrice: 300, deal: 80 },
      { itemId: 'ether', name: 'エーテル', normalPrice: 120, deal: 35 },
    ]
    const pick = discountItems[Math.floor(Math.random() * discountItems.length)]
    if (s.gold >= pick.deal) {
      s.gold -= pick.deal
      const ex = s.inventory.find(i => i.itemId === pick.itemId)
      if (ex) ex.qty += 1
      else s.inventory.push({ itemId: pick.itemId, qty: 1 })
      s.message = `🧙 謎の行商人に出会った。「通りすがりの者よ……${pick.name}を${pick.deal}Gで特別に売ろう」。買った！（通常価格${pick.normalPrice}G）`
    } else {
      s.message = `🧙 謎の行商人に出会ったが、手持ちが${pick.deal}G足りなかった。次の機会に……`
    }
  } else {
    // 危険を察知して回避（仲間からの警告）
    const alivePartyIds = s.party.filter(id => s.companions[id]?.alive)
    const warnerNames: Record<string, string> = {
      gares: 'ガレス', liz: 'リズ', noa: 'ノア', vais: 'ヴァイス',
      finn: 'フィン', bram: 'ブラム', elk: 'エルク', mira: 'ミラ',
    }
    const warned = alivePartyIds.find(id => warnerNames[id])
    const warner = warned ? warnerNames[warned] : null
    const avoidTexts = [
      '周囲に強敵の気配を感じて引き返した。慎重な判断だ。',
      '罠の痕跡を見つけて迂回した。何事もなくてよかった。',
      '嵐の予兆を察して早めに宿を探した。天候に助けられた。',
    ]
    const txt = avoidTexts[Math.floor(Math.random() * avoidTexts.length)]
    s.message = warner ? `👀 ${warner}「危ない！引き返そう」——${txt}` : `👀 直感が働いた——${txt}`
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
  if (s.defeatedBosses.includes(loc.bossId!)) {
    return { ...s, message: 'ボスは既に倒した。' }
  }
  if (loc.requireAllStones && s.sealStones.length < 3) {
    return { ...s, message: '3つの封印石が全て必要だ。' }
  }
  return startBattle(s, [loc.bossId], true)
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

function applyDamage(target: BattleUnit, dmg: number): boolean {
  target.hp = Math.max(0, target.hp - dmg)
  return target.hp <= 0
}

function addDeathLog(b: BattleState, target: BattleUnit, cause = '倒れた') {
  if (target.companionId) {
    const words = COMPANION_DEATH_WORDS[target.companionId] ?? []
    if (words.length > 0) {
      const word = words[Math.floor(Math.random() * words.length)]
      b.logs.push({ text: `${target.emoji}${target.name}「${word}」`, type: 'system' })
    }
  }
  b.logs.push({ text: `💀 ${target.name}は${cause}！`, type: 'death' })

  // 仲間が倒れると生き残り全員が怒り（ATK+15%・2ターン）
  if (target.isAlly && !target.isPlayer) {
    const survivors = b.units.filter(u => u.isAlly && u.hp > 0 && u.uid !== target.uid)
    if (survivors.length > 0) {
      for (const ally of survivors) {
        const existing = ally.statusEffects.find(e => e.id === 'atk_up')
        if (existing) {
          existing.turnsLeft = Math.max(existing.turnsLeft, 2)
        } else {
          ally.statusEffects.push({ id: 'atk_up', name: '怒り', turnsLeft: 2 })
        }
      }
      b.logs.push({ text: `🔥 仲間の死に激怒！生存者の攻撃力が上昇！`, type: 'system' })
    }
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
      const died = applyDamage(target, dmg)
      battle.logs.push({ text: `💥 ${target.name}に${dmg}ダメージ！`, type: 'damage' })
      if (died) addDeathLog(battle, target)
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
      const result = calcDamage(actor, target)
      const pdmg = Math.floor(result.dmg * skill.power)
      const pdied = applyDamage(target, pdmg)
      if (pdmg > 0) battle.logs.push({ text: `💥 ${target.name}に${pdmg}ダメージ！`, type: 'damage' })
      if (pdied) addDeathLog(battle, target)
      break
    }
    case 'stun': {
      if (!target.statusEffects.find(e => e.id === 'stun')) {
        target.statusEffects.push({ id: 'stun', name: 'スタン', turnsLeft: 2 })
        battle.logs.push({ text: `💫 ${target.name}はスタンした！`, type: 'status' })
      }
      const result = calcDamage(actor, target)
      const sdmg = Math.floor(result.dmg * skill.power)
      const sdied = applyDamage(target, sdmg)
      if (sdmg > 0) battle.logs.push({ text: `💥 ${target.name}に${sdmg}ダメージ！`, type: 'damage' })
      if (sdied) addDeathLog(battle, target)
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
