/**
 * 封印の継承者 QC品質チェックシミュレーター v2
 *
 * 旧版の問題：最適ルートのみテスト→常に1000/1000→何も検出できない
 * 新版の方針：
 *   1. 3タイプのプレイヤーをシミュレート（初心者/普通/最適）
 *   2. 実際のバトルをRNG込みで再現
 *   3. エンゲージメント指標（退屈ゾーン・仲間遭遇・イベント頻度）を測定
 *   4. ゲームバランス（ボス勝率・ゴールド経済・HP推移）を測定
 *   5. コンテンツ完成度を静的チェック
 *   6. 総合スコア（100点満点）で品質評価
 */

// ===== ゲームデータ =====
const LOCATIONS = {
  alseria:       { id:'alseria',       type:'town',    connections:['traveler_inn','checkpoint','great_bridge'], travelDays:{traveler_inn:1,checkpoint:1,great_bridge:2}, companionId:'gares',  hasInn:true,  bossId:null,  sealStone:null,  shopItems:['potion','ether','antidote'] },
  bern:          { id:'bern',          type:'town',    connections:['checkpoint','watchtower','trading_post'],   travelDays:{checkpoint:2,watchtower:2,trading_post:1},   companionId:'noa',    hasInn:true,  bossId:null,  sealStone:null,  shopItems:['potion','hi_potion','ether','antidote'] },
  sahal:         { id:'sahal',         type:'town',    connections:['bandit_hideout','coastal_road','desert_ruins','trading_post'], travelDays:{bandit_hideout:2,coastal_road:1,desert_ruins:3,trading_post:2}, companionId:'logan', hasInn:true, bossId:null, sealStone:null, shopItems:['hi_potion','ether','panacea','antidote'] },
  mirea:         { id:'mirea',         type:'town',    connections:['riverside','lighthouse','coastal_road'],    travelDays:{riverside:2,lighthouse:1,coastal_road:2},    companionId:'sig',    hasInn:true,  bossId:null,  sealStone:null,  shopItems:['potion','hi_potion','ether','panacea'] },
  elna:          { id:'elna',          type:'town',    connections:['forest_entrance','spirit_spring'],         travelDays:{forest_entrance:1,spirit_spring:1},           companionId:'bram',   hasInn:true,  bossId:null,  sealStone:null,  shopItems:['potion','hi_potion','ether'] },
  galdo:         { id:'galdo',         type:'town',    connections:['traveler_inn','watchtower','demon_mine','dragon_pass'], travelDays:{traveler_inn:2,watchtower:2,demon_mine:2,dragon_pass:3}, companionId:'cecil', hasInn:true, bossId:null, sealStone:null, shopItems:['hi_potion','panacea','ether','antidote'] },
  traveler_inn:  { id:'traveler_inn',  type:'relay',   connections:['alseria','galdo','forest_entrance'], travelDays:{alseria:1,galdo:2,forest_entrance:1}, companionId:null,   hasInn:true,  bossId:null,  sealStone:null },
  checkpoint:    { id:'checkpoint',    type:'relay',   connections:['alseria','bern','trading_post'],      travelDays:{alseria:1,bern:2,trading_post:2},     companionId:'gares',hasInn:false, bossId:null,  sealStone:null },
  great_bridge:  { id:'great_bridge',  type:'relay',   connections:['alseria','riverside'],               travelDays:{alseria:2,riverside:1},              companionId:null,   hasInn:false, bossId:null,  sealStone:null },
  riverside:     { id:'riverside',     type:'relay',   connections:['great_bridge','mirea','lighthouse'], travelDays:{great_bridge:1,mirea:2,lighthouse:1},  companionId:'finn', hasInn:true, bossId:null, sealStone:null },
  watchtower:    { id:'watchtower',    type:'relay',   connections:['bern','galdo'],                      travelDays:{bern:2,galdo:2},                     companionId:null,   hasInn:false, bossId:null,  sealStone:null },
  lighthouse:    { id:'lighthouse',    type:'dungeon', connections:['mirea','riverside'],                 travelDays:{mirea:1,riverside:1},                companionId:null,   hasInn:false, bossId:'tidal_king',    sealStone:null, enemyExp:18, enemyGold:15 },
  spirit_spring: { id:'spirit_spring', type:'relay',   connections:['elna','ancient_temple'],            travelDays:{elna:1,ancient_temple:2},             companionId:null,   hasInn:false, bossId:null,  sealStone:null },
  trading_post:  { id:'trading_post',  type:'relay',   connections:['bern','checkpoint','bandit_hideout','sahal'], travelDays:{bern:1,checkpoint:2,bandit_hideout:2,sahal:2}, companionId:'zeno', hasInn:false, bossId:null, sealStone:null },
  coastal_road:  { id:'coastal_road',  type:'relay',   connections:['mirea','sahal'],                    travelDays:{mirea:2,sahal:1},                    companionId:null,   hasInn:false, bossId:null,  sealStone:null },
  forest_entrance:{ id:'forest_entrance',type:'relay', connections:['traveler_inn','elna','dragon_pass'], travelDays:{traveler_inn:1,elna:1,dragon_pass:3}, companionId:null,   hasInn:false, bossId:null,  sealStone:null },
  demon_mine:    { id:'demon_mine',    type:'dungeon', connections:['galdo','dragon_pass'], travelDays:{galdo:2,dragon_pass:3}, companionId:'iris', hasInn:false, bossId:'mine_king',    sealStone:'fire',  enemyExp:33, enemyGold:27 },
  dragon_pass:   { id:'dragon_pass',   type:'dungeon', connections:['galdo','demon_mine','forest_entrance'], travelDays:{galdo:3,demon_mine:3,forest_entrance:3}, companionId:'elk', hasInn:false, bossId:'storm_dragon', sealStone:'storm', enemyExp:30, enemyGold:25 },
  bandit_hideout:{ id:'bandit_hideout',type:'dungeon', connections:['trading_post','sahal'], travelDays:{trading_post:2,sahal:2}, companionId:'vais', hasInn:false, bossId:'bandit_king', sealStone:null, enemyExp:20, enemyGold:18 },
  ancient_temple:{ id:'ancient_temple',type:'dungeon', connections:['spirit_spring'],     travelDays:{spirit_spring:2},   companionId:'mira',  hasInn:false, bossId:'forest_king',  sealStone:'dark', enemyExp:25, enemyGold:20 },
  desert_ruins:  { id:'desert_ruins',  type:'castle',  connections:['sahal'],             travelDays:{sahal:3},           companionId:null,    hasInn:false, bossId:'archive',      sealStone:null,   requireAllStones:true },
}

const BOSSES = {
  bandit_king:  { name:'盗賊王カルド',       hp:420,  atk:27, def:12, exp:225, gold:100, recommendedLevel:5  },
  mine_king:    { name:'鉱王グラドル',       hp:600,  atk:34, def:22, exp:450, gold:160, recommendedLevel:8  },
  storm_dragon: { name:'嵐竜ストームレックス', hp:900, atk:36, def:15, exp:420, gold:150, recommendedLevel:9  },
  tidal_king:   { name:'潮王ネブラ',         hp:560,  atk:33, def:17, exp:200, gold:130, recommendedLevel:7  },
  forest_king:  { name:'森王モルガ',         hp:1200, atk:38, def:19, exp:495, gold:180, recommendedLevel:11 },
  archive:      { name:'終末記録体アーカイブ', hp:1100, atk:45, def:25, exp:600, gold:300, recommendedLevel:15 },
}

const COMPANIONS = {
  gares:  { name:'ガレス',  joinLocId:'alseria',       locType:'town',    joinLevel:2, baseHp:130, baseAtk:14, baseDef:20, hpGrowth:15, atkGrowth:2, defGrowth:4, healer:false },
  liz:    { name:'リズ',    joinLocId:'alseria',       locType:'town',    joinLevel:2, baseHp:65,  baseAtk:9,  baseDef:9,  hpGrowth:7,  atkGrowth:1, defGrowth:1, healer:true  },
  noa:    { name:'ノア',    joinLocId:'bern',          locType:'town',    joinLevel:3, baseHp:75,  baseAtk:17, baseDef:8,  hpGrowth:8,  atkGrowth:3, defGrowth:1, healer:false },
  cecil:  { name:'セシル',  joinLocId:'galdo',         locType:'town',    joinLevel:4, baseHp:60,  baseAtk:22, baseDef:6,  hpGrowth:6,  atkGrowth:3, defGrowth:1, healer:false },
  bram:   { name:'ブラム',  joinLocId:'elna',          locType:'town',    joinLevel:3, baseHp:115, baseAtk:23, baseDef:14, hpGrowth:14, atkGrowth:3, defGrowth:2, healer:false },
  finn:   { name:'フィン',  joinLocId:'riverside',     locType:'relay',   joinLevel:2, baseHp:70,  baseAtk:13, baseDef:11, hpGrowth:10, atkGrowth:2, defGrowth:2, healer:false },
  vais:   { name:'ヴァイス',joinLocId:'bandit_hideout',locType:'dungeon', joinLevel:3, baseHp:75,  baseAtk:18, baseDef:8,  hpGrowth:8,  atkGrowth:2, defGrowth:1, healer:false },
  logan:  { name:'ローガン',joinLocId:'sahal',         locType:'town',    joinLevel:4, baseHp:120, baseAtk:27, baseDef:16, hpGrowth:13, atkGrowth:4, defGrowth:2, healer:false },
  iris:   { name:'イリス',  joinLocId:'demon_mine',    locType:'dungeon', joinLevel:4, baseHp:65,  baseAtk:20, baseDef:7,  hpGrowth:6,  atkGrowth:3, defGrowth:1, healer:false },
  sig:    { name:'シグ',    joinLocId:'mirea',         locType:'town',    joinLevel:3, baseHp:68,  baseAtk:14, baseDef:9,  hpGrowth:7,  atkGrowth:1, defGrowth:1, healer:false },
  elk:    { name:'エルク',  joinLocId:'dragon_pass',   locType:'dungeon', joinLevel:5, baseHp:105, baseAtk:24, baseDef:14, hpGrowth:11, atkGrowth:3, defGrowth:2, healer:false },
  mira:   { name:'ミラ',    joinLocId:'ancient_temple',locType:'dungeon', joinLevel:5, baseHp:75,  baseAtk:20, baseDef:11, hpGrowth:8,  atkGrowth:2, defGrowth:1, healer:true  },
  zeno:   { name:'ゼノ',    joinLocId:'trading_post',  locType:'relay',   joinLevel:7, baseHp:110, baseAtk:32, baseDef:16, hpGrowth:10, atkGrowth:4, defGrowth:2, healer:false },
}

// ===== ユーティリティ =====
function getExpToNext(level) { return level * 15 }

function calcPlayerStats(level) {
  return {
    maxHp: 100 + (level - 1) * 12,
    atk: 15 + (level - 1) * 2,
    def: 12 + (level - 1) * 2,
    mp: 40 + (level - 1) * 3,
  }
}

function bfsPath(from, to) {
  if (from === to) return [from]
  const visited = new Set([from])
  const queue = [[from, [from]]]
  while (queue.length) {
    const [cur, path] = queue.shift()
    for (const next of LOCATIONS[cur]?.connections ?? []) {
      if (!visited.has(next)) {
        visited.add(next)
        const np = [...path, next]
        if (next === to) return np
        queue.push([next, np])
      }
    }
  }
  return null
}

function pathDays(path) {
  let days = 0
  for (let i = 0; i < path.length - 1; i++) {
    days += LOCATIONS[path[i]].travelDays[path[i+1]] ?? 1
  }
  return days
}

// ===== バトルシミュレーション（実際のエンジン式: base = max(1, ATK - DEF/2) ） =====
// 各アタッカーが個別にダメージを計算。ボスはランダムに1ターゲットを攻撃
function simulateBattle(playerLevel, party, bossId, runs = 100) {
  const boss = BOSSES[bossId]
  if (!boss) return { winRate: 1, avgTurns: 1, avgHpPct: 1 }

  const stats = calcPlayerStats(playerLevel)
  const hasHealer = party.some(c => COMPANIONS[c]?.healer)

  // engine.tsと同じ計算式: baseX + (compLevel - 1) * xGrowth
  function getCompAtk(cid, pLevel) {
    const c = COMPANIONS[cid]
    if (!c) return 0
    const compLevel = Math.max(c.joinLevel, pLevel)
    return c.baseAtk + (compLevel - 1) * c.atkGrowth
  }
  function getCompDef(cid, pLevel) {
    const c = COMPANIONS[cid]
    if (!c) return 0
    const compLevel = Math.max(c.joinLevel, pLevel)
    return c.baseDef + (compLevel - 1) * c.defGrowth
  }
  function getCompHp(cid, pLevel) {
    const c = COMPANIONS[cid]
    if (!c) return 0
    const compLevel = Math.max(c.joinLevel, pLevel)
    return c.baseHp + (compLevel - 1) * c.hpGrowth
  }

  function roll() { return 0.8 + Math.random() * 0.4 }
  function dmgCalc(atk, def) { return Math.max(1, Math.floor((atk - def / 2) * roll())) }

  let wins = 0, totalTurns = 0, totalHpPct = 0

  for (let r = 0; r < runs; r++) {
    let playerHp  = stats.maxHp
    const compHps = party.map(c => getCompHp(c, playerLevel))
    let bossHp    = boss.hp
    let turns     = 0
    let healCharges = hasHealer ? 3 : 0
    let itemCharges = 3 // ポーション3個想定

    while (bossHp > 0 && playerHp > 0) {
      turns++
      if (turns > 80) break

      // === プレイヤー攻撃 ===
      bossHp -= dmgCalc(stats.atk, boss.def)
      if (bossHp <= 0) break

      // === 仲間攻撃（生存している仲間のみ）===
      for (let i = 0; i < party.length; i++) {
        if (compHps[i] > 0) {
          const compAtk = getCompAtk(party[i], playerLevel)
          bossHp -= dmgCalc(compAtk, boss.def)
          if (bossHp <= 0) break
        }
      }
      if (bossHp <= 0) break

      // === ボス攻撃（全生存者からランダムに1ターゲット選択）===
      // 30%でAoE（全員に攻撃、powerは1.2想定）
      const aoeChance = 0.3
      if (Math.random() < aoeChance) {
        const aoeBase = Math.max(1, boss.atk * 1.2 - stats.def / 2)
        const aoeDmg = Math.max(1, Math.floor(aoeBase * roll()))
        playerHp -= aoeDmg
        for (let i = 0; i < compHps.length; i++) {
          if (compHps[i] > 0) compHps[i] -= Math.floor(aoeDmg * 0.8)
        }
      } else {
        // 単体攻撃
        const aliveTargets = []
        aliveTargets.push({ type: 'player', idx: -1 })
        for (let i = 0; i < compHps.length; i++) {
          if (compHps[i] > 0) aliveTargets.push({ type: 'comp', idx: i })
        }
        const target = aliveTargets[Math.floor(Math.random() * aliveTargets.length)]
        if (target.type === 'player') {
          playerHp -= dmgCalc(boss.atk, stats.def)
        } else {
          const compDef = getCompDef(party[target.idx], playerLevel)
          compHps[target.idx] -= dmgCalc(boss.atk, compDef)
          if (compHps[target.idx] < 0) compHps[target.idx] = 0
        }
      }

      // === 回復アイテム/ヒーラー ===
      if (playerHp < stats.maxHp * 0.35 && itemCharges > 0) {
        playerHp = Math.min(stats.maxHp, playerHp + 80)
        itemCharges--
      }
      if (hasHealer && healCharges > 0 && playerHp < stats.maxHp * 0.5) {
        playerHp = Math.min(stats.maxHp, playerHp + Math.floor(stats.maxHp * 0.3))
        healCharges--
      }
    }

    const won = bossHp <= 0 && playerHp > 0
    if (won) { wins++; totalTurns += turns; totalHpPct += playerHp / stats.maxHp }
  }

  return {
    winRate: wins / runs,
    avgTurns: wins > 0 ? totalTurns / wins : 0,
    avgHpPct: wins > 0 ? totalHpPct / wins : 0,
  }
}

// ===== プレイヤー行動タイプ定義 =====
// optimal: 最適ルートを毎回辿る（旧シミュレーターと同じ）
// average: 目標を持ちながらも30%で寄り道や非効率な行動をする
// naive:   ほぼランダム。基本的な目標は理解しているが効率が悪い

function runSimulation(playerType, runs) {
  const results = {
    wins: 0, loses_time: 0, loses_battle: 0,
    totalLevel: 0, totalDaysLeft: 0, totalSeals: 0,
    totalCompanionsMet: 0, totalLocationsVisited: 0,
    totalGoldSpent: 0, goldPanic: 0,   // ゴールド不足でピンチになった回数
    boringStretchMax: [],               // 最大退屈ゾーン（日数）
    firstCompanionDay: [],              // 最初の仲間と出会うまでの日数
    bossAttempts: {},                   // ボスID→{tries, wins}
  }

  const SEAL_ORDER = ['demon_mine', 'dragon_pass', 'ancient_temple'] // 封印石3箇所

  for (let run = 0; run < runs; run++) {
    let daysLeft = 100
    let currentLoc = 'alseria'
    let level = 1, exp = 0, gold = 200
    let sealStones = [], defeatedBosses = [], joined = [], party = []
    let visitedLocs = new Set(['alseria'])
    let gameEnd = null
    let firstCompanionDay = null
    let boringStretch = 0, maxBoringStretch = 0
    let isNaive = playerType === 'naive'
    let isAverage = playerType === 'average'
    let isOptimal = playerType === 'optimal'

    function rng() { return Math.random() }
    function mistake() { return isNaive ? rng() < 0.4 : isAverage ? rng() < 0.2 : false }

    function gainExp(e) {
      exp += e
      while (exp >= getExpToNext(level) && level < 30) { exp -= getExpToNext(level); level++ }
    }

    function tryJoin(cid) {
      if (joined.includes(cid) || joined.length >= 3) return false
      // naive: 40%でスキップ; average: 15%でスキップ
      if (isNaive && rng() < 0.4) return false
      if (isAverage && rng() < 0.15) return false
      joined.push(cid)
      if (party.length < 3) party.push(cid)
      if (!firstCompanionDay) firstCompanionDay = 100 - daysLeft
      return true
    }

    function moveTo(dest) {
      if (currentLoc === dest) return true
      const path = bfsPath(currentLoc, dest)
      if (!path) return false
      // naive: 25%で寄り道（1拠点余分に回る）
      if (isNaive && rng() < 0.25 && path.length > 2) {
        const detour = LOCATIONS[path[1]]?.connections.find(c => c !== path[2] && c !== currentLoc)
        if (detour) {
          const days1 = LOCATIONS[path[1]].travelDays[detour] ?? 1
          daysLeft -= (LOCATIONS[currentLoc].travelDays[path[1]] ?? 1) + days1
          currentLoc = detour
          visitedLocs.add(detour)
          boringStretch++
          if (daysLeft <= 0) { gameEnd = 'time'; return false }
        }
      }
      for (let i = 1; i < path.length; i++) {
        const days = LOCATIONS[path[i-1]].travelDays[path[i]] ?? 1
        daysLeft -= days
        currentLoc = path[i]
        visitedLocs.add(path[i])
        if (daysLeft <= 0) { gameEnd = 'time'; return false }
        // エンカウント（relay/dungeon移動で30%）
        if (['relay','dungeon'].includes(LOCATIONS[path[i]].type) && rng() < 0.3) {
          gainExp(20 + level * 2)
          gold += 15
          boringStretch = 0 // エンカウントは退屈ゾーンをリセット
        } else {
          boringStretch++
        }
        maxBoringStretch = Math.max(maxBoringStretch, boringStretch)
      }
      return true
    }

    function grind(locId, times) {
      if (currentLoc !== locId) return
      const loc = LOCATIONS[locId]
      const e = (loc.enemyExp ?? 25)
      const g = (loc.enemyGold ?? 20)
      // naive: 半分しかグラインドしない可能性
      const actualTimes = isNaive ? Math.max(1, times - Math.floor(rng() * times)) : times
      for (let i = 0; i < actualTimes; i++) {
        gainExp(e * (1 + rng() * 0.5))
        gold += g * (1 + rng() * 0.3)
        boringStretch = 0
        daysLeft -= 1
        if (daysLeft <= 0) { gameEnd = 'time'; return }
      }
    }

    function fightBoss(locId) {
      const loc = LOCATIONS[locId]
      if (!loc.bossId || defeatedBosses.includes(loc.bossId)) return 'already'
      const bossId = loc.bossId
      if (!results.bossAttempts[bossId]) results.bossAttempts[bossId] = { tries: 0, wins: 0 }
      results.bossAttempts[bossId].tries++

      const { winRate } = simulateBattle(level, party, bossId, 5)
      const won = rng() < winRate

      boringStretch = 0 // ボス戦は退屈ゾーンをリセット
      if (won) {
        results.bossAttempts[bossId].wins++
        gainExp(BOSSES[bossId].exp)
        gold += BOSSES[bossId].gold
        if (loc.sealStone && !sealStones.includes(loc.sealStone)) sealStones.push(loc.sealStone)
        defeatedBosses.push(bossId)
        return 'win'
      } else {
        // 敗北: HPが低くなる、回復が必要
        if (gold >= 50 && loc.hasInn) { gold -= 50; daysLeft -= 1 } // 宿で回復
        return 'fail'
      }
    }

    function innRest() {
      if (!LOCATIONS[currentLoc]?.hasInn) return
      const cost = 50 // 簡略化
      if (gold >= cost) { gold -= cost; daysLeft -= 1; boringStretch = 0 }
    }

    function buyItems() {
      if (!LOCATIONS[currentLoc]?.shopItems) return
      if (gold >= 200 && !mistake()) {
        gold -= 120
        boringStretch = 0
      }
    }

    // ========== メインプレイ ==========

    // Phase0: アルセリア出発
    const alseriaLoc = LOCATIONS['alseria']
    if (alseriaLoc.companionId) tryJoin(alseriaLoc.companionId) // ガレス
    // リズも（同じ拠点）
    if (!mistake()) tryJoin('liz')
    buyItems()

    // Phase1: ガルドへ（naive: 30%でベルンに迷う）
    if (!gameEnd) {
      if (isNaive && rng() < 0.3) {
        moveTo('bern')
        if (!gameEnd && LOCATIONS['bern'].companionId) tryJoin(LOCATIONS['bern'].companionId)
        if (!gameEnd) moveTo('galdo')
      } else {
        moveTo('traveler_inn')
        if (!gameEnd) moveTo('galdo')
      }
      if (!gameEnd && LOCATIONS['galdo'].companionId) tryJoin(LOCATIONS['galdo'].companionId)
      buyItems()
    }

    // Phase2: 廃鉱山（炎の封印石）
    if (!gameEnd) {
      if (moveTo('demon_mine') && !gameEnd) {
        grind('demon_mine', isNaive ? 2 : 3)
        if (!gameEnd) {
          const r = fightBoss('demon_mine')
          if (r === 'win' && LOCATIONS['demon_mine'].companionId) tryJoin(LOCATIONS['demon_mine'].companionId)
          if (r === 'fail' && !gameEnd) {
            // リトライ1回
            grind('demon_mine', 2)
            if (!gameEnd) {
              const r2 = fightBoss('demon_mine')
              if (r2 === 'win' && LOCATIONS['demon_mine'].companionId) tryJoin(LOCATIONS['demon_mine'].companionId)
            }
          }
        }
      }
    }

    // Phase3: 竜の峠（嵐の封印石）
    // ※ mistake() で全スキップは現実的でない（石が足りなければどのプレイヤーも気づく）
    // 代わりに "naive は遠回りルートを取る" という形で非効率を表現
    if (!gameEnd) {
      if (isNaive && rng() < 0.4) {
        // 迷子: まずベルンへ行って時間ロス
        moveTo('bern')
        if (!gameEnd) moveTo('galdo')
      }
      if (!gameEnd && moveTo('dragon_pass') && !gameEnd) {
        grind('dragon_pass', isNaive ? 1 : isAverage ? 2 : 3)
        if (!gameEnd) {
          const r = fightBoss('dragon_pass')
          if (r === 'win' && LOCATIONS['dragon_pass'].companionId) tryJoin(LOCATIONS['dragon_pass'].companionId)
          if (r === 'fail' && !gameEnd) {
            grind('dragon_pass', isNaive ? 1 : 2)
            if (!gameEnd) {
              const r2 = fightBoss('dragon_pass')
              if (r2 === 'win') tryJoin(LOCATIONS['dragon_pass'].companionId ?? '')
            }
          }
        }
      }
    }

    // Phase4: 古代神殿（闇の封印石）
    if (!gameEnd) {
      // naive: エルナを通らずに迷う可能性
      if (isNaive && rng() < 0.3) {
        // 迷子になってタイムロス
        moveTo('bern')
        if (!gameEnd) moveTo('checkpoint')
        if (!gameEnd) moveTo('alseria')
      }
      if (!gameEnd && moveTo('elna')) {
        if (!gameEnd && LOCATIONS['elna'].companionId) tryJoin(LOCATIONS['elna'].companionId)
        innRest()
        if (!gameEnd && moveTo('spirit_spring') && !gameEnd && moveTo('ancient_temple')) {
          grind('ancient_temple', isNaive ? 1 : 2)
          if (!gameEnd) {
            const r = fightBoss('ancient_temple')
            if (r === 'win' && LOCATIONS['ancient_temple'].companionId) tryJoin(LOCATIONS['ancient_temple'].companionId)
            if (r === 'fail' && !gameEnd) {
              grind('ancient_temple', 2)
              if (!gameEnd) fightBoss('ancient_temple')
            }
          }
        }
      }
    }

    // Phase5: サハル → 砂漠遺跡
    if (!gameEnd && sealStones.length >= 3) {
      if (moveTo('sahal') && !gameEnd) {
        if (LOCATIONS['sahal'].companionId) tryJoin(LOCATIONS['sahal'].companionId)
        innRest()
        if (!gameEnd && moveTo('desert_ruins') && !gameEnd) {
          const r = fightBoss('desert_ruins')
          if (r === 'win') gameEnd = 'win'
          else if (!gameEnd) {
            // ラスボスリトライ（宿でHP回復してから）
            if (moveTo('sahal') && !gameEnd) {
              innRest()
              if (!gameEnd && moveTo('desert_ruins') && !gameEnd) {
                const r2 = fightBoss('desert_ruins')
                if (r2 === 'win') gameEnd = 'win'
                else if (!gameEnd) gameEnd = 'lose_battle'
              }
            }
          }
        }
      }
    } else if (!gameEnd) {
      gameEnd = 'time'
    }

    if (!gameEnd) gameEnd = 'time'

    // 結果集計
    if (gameEnd === 'win') {
      results.wins++
      results.totalLevel += level
      results.totalDaysLeft += Math.max(0, daysLeft)
    } else if (gameEnd === 'time') results.loses_time++
    else results.loses_battle++

    results.totalSeals += sealStones.length
    results.totalCompanionsMet += joined.length
    results.totalLocationsVisited += visitedLocs.size
    results.boringStretchMax.push(maxBoringStretch)
    if (firstCompanionDay !== null) results.firstCompanionDay.push(firstCompanionDay)
    if (gold < 0) results.goldPanic++
  }

  return results
}

// ===== ボス勝率の精密測定（100試行×各ボス）=====
function measureBossWinRates() {
  const bossMeasurements = {}
  // ボスごとに推奨レベル・標準パーティで勝率測定
  const testCases = [
    { id: 'bandit_king',  level: 5,  party: ['gares', 'liz'] },
    { id: 'mine_king',    level: 8,  party: ['gares', 'liz', 'cecil'] },
    { id: 'storm_dragon', level: 9,  party: ['gares', 'liz', 'bram'] },
    { id: 'tidal_king',   level: 7,  party: ['finn', 'sig'] },
    { id: 'forest_king',  level: 11, party: ['gares', 'bram', 'elk'] },
    { id: 'archive',      level: 15, party: ['gares', 'liz', 'mira'] },
  ]
  for (const tc of testCases) {
    const result = simulateBattle(tc.level, tc.party, tc.id, 200)
    bossMeasurements[tc.id] = { ...result, level: tc.level, party: tc.party }
  }
  return bossMeasurements
}

// ===== 静的品質チェック =====
function staticQualityCheck() {
  const issues = []

  // 1. 拠点到達可能性
  const allLocIds = Object.keys(LOCATIONS)
  const reachable = new Set(['alseria'])
  const q = ['alseria']
  while (q.length) {
    const cur = q.shift()
    for (const next of LOCATIONS[cur]?.connections ?? []) {
      if (!reachable.has(next)) { reachable.add(next); q.push(next) }
    }
  }
  const unreachable = allLocIds.filter(id => !reachable.has(id))
  if (unreachable.length > 0) issues.push({ sev:'CRITICAL', title:`到達不能拠点: ${unreachable.join(', ')}` })

  // 2. 封印石3種確認
  const sealTypes = [...new Set(Object.values(LOCATIONS).filter(l => l.sealStone).map(l => l.sealStone))]
  if (sealTypes.length < 3) issues.push({ sev:'CRITICAL', title:`封印石が${sealTypes.length}/3種しかない` })

  // 3. ラスボス到達条件
  if (!Object.values(LOCATIONS).find(l => l.requireAllStones && l.bossId))
    issues.push({ sev:'CRITICAL', title:'requireAllStones+bossIdの拠点が存在しない' })

  // 4. ボスID整合性
  for (const [id, loc] of Object.entries(LOCATIONS)) {
    if (loc.bossId && !BOSSES[loc.bossId])
      issues.push({ sev:'CRITICAL', title:`拠点${id}のbossId="${loc.bossId}"がBOSSESに未定義` })
  }

  // 5. 仲間加入拠点整合性
  for (const [cid, comp] of Object.entries(COMPANIONS)) {
    if (!LOCATIONS[comp.joinLocId])
      issues.push({ sev:'HIGH', title:`仲間${comp.name}のjoinLocId"${comp.joinLocId}"が存在しない` })
  }

  // 6. 接続の双方向性
  for (const [locId, loc] of Object.entries(LOCATIONS)) {
    for (const conn of loc.connections) {
      const target = LOCATIONS[conn]
      if (!target) { issues.push({ sev:'HIGH', title:`拠点${locId}がconnections内に存在しない拠点"${conn}"を参照` }); continue }
      if (!target.connections.includes(locId))
        issues.push({ sev:'MEDIUM', title:`接続が片方向のみ: ${locId}→${conn}（逆向きがない）` })
      if (!loc.travelDays[conn])
        issues.push({ sev:'MEDIUM', title:`移動日数が未設定: ${locId}→${conn}` })
    }
  }

  // 7. ダンジョンのenemyExp/enemyGold
  for (const [id, loc] of Object.entries(LOCATIONS)) {
    if (loc.type === 'dungeon' && !loc.bossId)
      issues.push({ sev:'LOW', title:`ダンジョン${id}にbossIdがない（ボスなしダンジョン）` })
  }

  // 8. 仲間が取得可能な数（最低でも3人以上必要）
  const accessibleCompanions = Object.entries(COMPANIONS).filter(([, c]) => reachable.has(c.joinLocId))
  if (accessibleCompanions.length < 3)
    issues.push({ sev:'HIGH', title:`加入可能な仲間が${accessibleCompanions.length}人しかいない（3人最低必要）` })

  return issues
}

// ===== スコア計算 =====
function calcScore(optimal, average, naive, bossMeasurements, staticIssues) {
  let score = 0
  const breakdown = {}

  // 1. クリア可能性 (25点)
  const optimalRate = optimal.wins / 333
  const avgRate = average.wins / 333
  const naiveRate = naive.wins / 333
  breakdown.clearability = Math.min(25,
    (optimalRate >= 0.95 ? 10 : optimalRate >= 0.85 ? 7 : optimalRate >= 0.7 ? 4 : optimalRate >= 0.5 ? 2 : 0) +
    (avgRate >= 0.7 ? 8 : avgRate >= 0.5 ? 5 : avgRate >= 0.3 ? 2 : 0) +
    (naiveRate >= 0.3 ? 7 : naiveRate >= 0.15 ? 4 : naiveRate >= 0.05 ? 1 : 0)
  )
  score += breakdown.clearability

  // 2. ボスバランス (20点)
  // シミュ限界: 無制限回復モデルのため全ボス勝率100%になりやすい
  // → 「戦闘ターン数」で難易度を判定（理想: 8〜20ターン、短すぎ=即死、長すぎ=ダレる）
  const bossIds = ['bandit_king', 'mine_king', 'storm_dragon', 'tidal_king', 'forest_king', 'archive']
  let bossScore = 0
  for (const bid of bossIds) {
    const m = bossMeasurements[bid]
    if (!m) continue
    const wr = m.winRate
    const turns = m.avgTurns
    if (wr < 0.1) {
      bossScore += 0   // 実質倒せない（HP要調整）
    } else if (turns >= 8 && turns <= 22) {
      bossScore += 3   // 理想的な戦闘長さ
    } else if (turns >= 5 && turns < 8) {
      bossScore += 2   // やや短い（少し緊張感不足）
    } else if (turns > 22 && turns <= 30) {
      bossScore += 2   // やや長い
    } else if (turns >= 3 && turns < 5) {
      bossScore += 1   // かなり短い（ほぼ瞬殺）
    } else {
      bossScore += 1   // 極端に長い or 短い
    }
  }
  breakdown.bossBalance = Math.min(20, Math.floor(bossScore * 20 / 18))
  score += breakdown.bossBalance

  // 3. エンゲージメント (20点)
  // 退屈ゾーン・最初の仲間遭遇タイミング・訪問拠点数
  const avgBoring = average.boringStretchMax.reduce((a,b)=>a+b,0) / average.boringStretchMax.length
  const avgFirstComp = average.firstCompanionDay.length > 0
    ? average.firstCompanionDay.reduce((a,b)=>a+b,0) / average.firstCompanionDay.length
    : 100
  const avgLocs = average.totalLocationsVisited / 333

  breakdown.engagement = Math.min(20,
    (avgBoring <= 3 ? 8 : avgBoring <= 6 ? 5 : avgBoring <= 10 ? 2 : 0) +
    (avgFirstComp <= 5 ? 7 : avgFirstComp <= 10 ? 5 : avgFirstComp <= 20 ? 2 : 0) +
    (avgLocs >= 12 ? 5 : avgLocs >= 8 ? 3 : avgLocs >= 5 ? 1 : 0)
  )
  score += breakdown.engagement

  // 4. データ整合性 (20点)
  const criticals = staticIssues.filter(i=>i.sev==='CRITICAL').length
  const highs = staticIssues.filter(i=>i.sev==='HIGH').length
  const mediums = staticIssues.filter(i=>i.sev==='MEDIUM').length
  breakdown.dataIntegrity = Math.max(0, 20 - criticals * 8 - highs * 3 - mediums * 1)
  score += breakdown.dataIntegrity

  // 5. リソース経済 (15点)
  const goldPanicRate = average.goldPanic / 333
  const avgComps = average.totalCompanionsMet / 333
  breakdown.economy = Math.min(15,
    (goldPanicRate < 0.05 ? 8 : goldPanicRate < 0.15 ? 5 : goldPanicRate < 0.3 ? 2 : 0) +
    (avgComps >= 3 ? 7 : avgComps >= 2 ? 5 : avgComps >= 1 ? 2 : 0)
  )
  score += breakdown.economy

  return { total: score, breakdown }
}

// ===== メイン実行 =====
const RUN_COUNT = parseInt(process.argv[2] || '333')

process.stdout.write('シミュレーション実行中...')
const optimal = runSimulation('optimal', RUN_COUNT)
process.stdout.write(' optimal完了...')
const average = runSimulation('average', RUN_COUNT)
process.stdout.write(' average完了...')
const naive   = runSimulation('naive',   RUN_COUNT)
process.stdout.write(' naive完了...')
const bossMeasurements = measureBossWinRates()
process.stdout.write(' ボス測定完了...')
const staticIssues = staticQualityCheck()
const { total, breakdown } = calcScore(optimal, average, naive, bossMeasurements, staticIssues)
console.log(' 完了\n')

const W = 72
const line = '='.repeat(W)
console.log(line)
console.log('  封印の継承者 — QC品質チェックレポート v2')
console.log(line)

// ─── クリア率 ───
console.log('\n【プレイヤータイプ別クリア率】 ← これが本当のバランス指標')
console.log(`  最適プレイ  : ${optimal.wins}/${RUN_COUNT} (${(optimal.wins/RUN_COUNT*100).toFixed(1)}%)  ← 常に100%でなければバランス崩壊`)
console.log(`  普通プレイ  : ${average.wins}/${RUN_COUNT} (${(average.wins/RUN_COUNT*100).toFixed(1)}%)  ← 70%以上が目標`)
console.log(`  初心者プレイ: ${naive.wins}/${RUN_COUNT}   (${(naive.wins/RUN_COUNT*100).toFixed(1)}%)  ← 30%以上が目標`)
if (naive.wins / RUN_COUNT < 0.1) console.log('  ⚠️  初心者がほぼクリアできない！難易度調整が必要')
if (average.wins / RUN_COUNT < 0.5) console.log('  ⚠️  普通プレイでもクリア率が低い！')

// ─── エンゲージメント ───
console.log('\n【エンゲージメント指標】')
const avgBoring = average.boringStretchMax.length > 0
  ? (average.boringStretchMax.reduce((a,b)=>a+b,0) / average.boringStretchMax.length).toFixed(1)
  : 'N/A'
const avgFirstComp = average.firstCompanionDay.length > 0
  ? (average.firstCompanionDay.reduce((a,b)=>a+b,0) / average.firstCompanionDay.length).toFixed(1)
  : '未遭遇'
const avgLocs = (average.totalLocationsVisited / RUN_COUNT).toFixed(1)
const avgComps = (average.totalCompanionsMet / RUN_COUNT).toFixed(1)
console.log(`  最大退屈ゾーン（何も起きない連続日数）: 平均 ${avgBoring}日 （目標: 5日以下）`)
console.log(`  最初の仲間と出会うまで             : 平均 ${avgFirstComp}日 （目標: 10日以内）`)
console.log(`  訪問拠点数                         : 平均 ${avgLocs}/21拠点`)
console.log(`  仲間加入数                         : 平均 ${avgComps}/3人`)
if (parseFloat(avgBoring) > 7) console.log('  ⚠️  退屈ゾーンが長い！序盤のイベント・エンカウント密度を上げるべき')
if (parseFloat(avgFirstComp) > 15) console.log('  ⚠️  仲間と出会うのが遅すぎる！序盤に仲間を案内すべき')

// ─── ボスバランス ───
console.log('\n【ボス難易度バランス】（推奨レベル・標準パーティで200試行）')
console.log('  理想: 8〜22ターンの戦闘（緊張感あり）。勝率は参考値（シミュ過大評価のため）')
const bossNames = { bandit_king:'盗賊王カルド', mine_king:'鉱王グラドル', storm_dragon:'嵐竜', tidal_king:'潮王ネブラ', forest_king:'森王モルガ', archive:'アーカイブ' }
for (const [bid, m] of Object.entries(bossMeasurements)) {
  const wr = (m.winRate * 100).toFixed(1)
  const turns = m.avgTurns.toFixed(1)
  let flag
  if (m.winRate < 0.1) flag = ' ⚠️ 倒せない'
  else if (m.avgTurns < 5) flag = ' ⚠️ 瞬殺（HP不足）'
  else if (m.avgTurns >= 8 && m.avgTurns <= 22) flag = ' ✅ 理想的'
  else if (m.avgTurns > 22) flag = ' ⚠️ 長すぎ'
  else flag = ' 🔶 やや短い'
  console.log(`  ${(bossNames[bid]||bid).padEnd(14)} Lv${String(m.level).padStart(2)} ${m.party.length}人 → 勝率${String(wr).padStart(5)}% | 平均${turns}ターン${flag}`)
}

// ─── リソース経済 ───
console.log('\n【リソース経済】')
const goldPanicRate = (average.goldPanic / RUN_COUNT * 100).toFixed(1)
console.log(`  ゴールド不足発生率: ${goldPanicRate}% （目標: 10%以下）`)
if (average.goldPanic / RUN_COUNT > 0.2) console.log('  ⚠️  ゴールドが慢性的に不足！敵のドロップか初期所持金を増やすべき')

// ─── 静的品質チェック ───
console.log('\n' + line)
console.log(`  静的データ整合性チェック: ${staticIssues.length}件`)
console.log(line)
const sevMap = { CRITICAL:'🔴', HIGH:'🟠', MEDIUM:'🟡', LOW:'🔵' }
if (staticIssues.length === 0) {
  console.log('  ✅ 全チェック通過')
} else {
  for (const issue of staticIssues) {
    console.log(`  ${sevMap[issue.sev]||'⚪'} [${issue.sev}] ${issue.title}`)
  }
}

// ─── 総合スコア ───
console.log('\n' + line)
const grade = total >= 90 ? 'S' : total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 55 ? 'C' : total >= 40 ? 'D' : 'F'
console.log(`  総合品質スコア: ${total}/100点  評価: ${grade}`)
console.log(line)
console.log(`  クリア可能性 : ${breakdown.clearability}/25点`)
console.log(`  ボスバランス : ${breakdown.bossBalance}/20点`)
console.log(`  エンゲージメント: ${breakdown.engagement}/20点`)
console.log(`  データ整合性 : ${breakdown.dataIntegrity}/20点`)
console.log(`  リソース経済 : ${breakdown.economy}/15点`)
console.log()

if (total < 70) {
  console.log('【改善が必要な項目】')
  if (breakdown.clearability < 18) console.log('  → 初心者・普通プレイのクリア率が低い。難易度下げるかヒントを増やす')
  if (breakdown.bossBalance < 14)  console.log('  → ボス勝率が理想範囲外。HPかATKを調整する')
  if (breakdown.engagement < 14)   console.log('  → 序盤が退屈。エンカウント率・仲間遭遇機会を増やす')
  if (breakdown.dataIntegrity < 16) console.log('  → データ不整合あり。上記CRITICALを先に修正する')
  if (breakdown.economy < 10)      console.log('  → ゴールドが足りない。敵のドロップ量か初期金額を調整する')
}
console.log(line)
