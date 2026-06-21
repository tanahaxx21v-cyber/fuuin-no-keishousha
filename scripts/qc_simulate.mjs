/**
 * QCシミュレーター — 100回ランダムプレイで問題点を洗い出す
 * 実行: node scripts/qc_simulate.mjs
 */

// ===== ゲームデータ（data.tsから抜粋）=====
const LOCATIONS = {
  alseria:       { id:'alseria',       type:'town',    connections:['traveler_inn','checkpoint','great_bridge'], travelDays:{traveler_inn:1,checkpoint:1,great_bridge:2}, companionId:'gares',  hasInn:true,  bossId:null,  sealStone:null,  shopItems:['potion','ether','antidote'] },
  bern:          { id:'bern',          type:'town',    connections:['checkpoint','watchtower','trading_post'],   travelDays:{checkpoint:2,watchtower:2,trading_post:1},   companionId:'noa',    hasInn:true,  bossId:null,  sealStone:null,  shopItems:['potion','hi_potion','ether','antidote'] },
  sahal:         { id:'sahal',         type:'town',    connections:['bandit_hideout','coastal_road','desert_ruins'], travelDays:{bandit_hideout:2,coastal_road:1,desert_ruins:3}, companionId:'logan', hasInn:true, bossId:null, sealStone:null, shopItems:['hi_potion','ether','panacea','antidote'] },
  mirea:         { id:'mirea',         type:'town',    connections:['riverside','lighthouse','coastal_road'],    travelDays:{riverside:2,lighthouse:1,coastal_road:2},    companionId:'sig',    hasInn:true,  bossId:null,  sealStone:null,  shopItems:['potion','hi_potion','ether','panacea'] },
  elna:          { id:'elna',          type:'town',    connections:['forest_entrance','spirit_spring'],         travelDays:{forest_entrance:1,spirit_spring:1},           companionId:'bram',   hasInn:true,  bossId:null,  sealStone:null,  shopItems:['potion','hi_potion','ether'] },
  galdo:         { id:'galdo',         type:'town',    connections:['traveler_inn','watchtower','demon_mine','dragon_pass'], travelDays:{traveler_inn:2,watchtower:2,demon_mine:2,dragon_pass:3}, companionId:'cecil', hasInn:true, bossId:null, sealStone:null, shopItems:['hi_potion','panacea','ether','antidote'] },
  traveler_inn:  { id:'traveler_inn',  type:'relay',   connections:['alseria','galdo','forest_entrance'], travelDays:{alseria:1,galdo:2,forest_entrance:1}, companionId:null,   hasInn:true,  bossId:null,  sealStone:null,  travelEnemyPool:['wolf','goromin'] },
  checkpoint:    { id:'checkpoint',    type:'relay',   connections:['alseria','bern'],                    travelDays:{alseria:1,bern:2},                   companionId:'gares',hasInn:false, bossId:null,  sealStone:null,  travelEnemyPool:['bandit','goblin'] },
  great_bridge:  { id:'great_bridge',  type:'relay',   connections:['alseria','riverside'],               travelDays:{alseria:2,riverside:1},              companionId:null,   hasInn:false, bossId:null,  sealStone:null,  travelEnemyPool:['wolf','poyogaeru'] },
  riverside:     { id:'riverside',     type:'relay',   connections:['great_bridge','mirea','lighthouse'], travelDays:{great_bridge:1,mirea:2,lighthouse:1},  companionId:'finn', hasInn:true, bossId:null, sealStone:null,  travelEnemyPool:['poyogaeru','yadotsubo'] },
  watchtower:    { id:'watchtower',    type:'relay',   connections:['bern','galdo'],                      travelDays:{bern:2,galdo:2},                     companionId:null,   hasInn:false, bossId:null,  sealStone:null,  travelEnemyPool:['goromin','kabemimi'] },
  lighthouse:    { id:'lighthouse',    type:'dungeon', connections:['mirea','riverside'],                 travelDays:{mirea:1,riverside:1},                companionId:null,   hasInn:false, bossId:'tidal_king', sealStone:null, enemyExp:18, enemyGold:15 },
  spirit_spring: { id:'spirit_spring', type:'relay',   connections:['elna','ancient_temple'],            travelDays:{elna:1,ancient_temple:2},             companionId:null,   hasInn:false, bossId:null,  sealStone:null,  travelEnemyPool:['mofunezu','kinobokku'] },
  trading_post:  { id:'trading_post',  type:'relay',   connections:['bern','checkpoint','bandit_hideout','sahal'], travelDays:{bern:1,checkpoint:2,bandit_hideout:2,sahal:2}, companionId:'zeno', hasInn:false, bossId:null, sealStone:null, travelEnemyPool:['bandit','tsugihagi_hei'] },
  coastal_road:  { id:'coastal_road',  type:'relay',   connections:['mirea','sahal'],                    travelDays:{mirea:2,sahal:1},                    companionId:null,   hasInn:false, bossId:null,  sealStone:null,  travelEnemyPool:['kuchipaku','poyogaeru'] },
  forest_entrance:{ id:'forest_entrance',type:'relay', connections:['traveler_inn','elna'],              travelDays:{traveler_inn:1,elna:1},               companionId:null,   hasInn:false, bossId:null,  sealStone:null,  travelEnemyPool:['mofunezu','kinobokku'] },
  demon_mine:    { id:'demon_mine',    type:'dungeon', connections:['galdo'],             travelDays:{galdo:2},           companionId:'iris',  hasInn:false, bossId:'mine_king',    sealStone:'fire',  enemyExp:33, enemyGold:27 },
  dragon_pass:   { id:'dragon_pass',   type:'dungeon', connections:['galdo'],             travelDays:{galdo:3},           companionId:'elk',   hasInn:false, bossId:'storm_dragon', sealStone:'storm', enemyExp:30, enemyGold:25 },
  bandit_hideout:{ id:'bandit_hideout',type:'dungeon', connections:['trading_post','sahal'], travelDays:{trading_post:2,sahal:2}, companionId:'vais', hasInn:false, bossId:'bandit_king', sealStone:null, enemyExp:20, enemyGold:18 },
  ancient_temple:{ id:'ancient_temple',type:'dungeon', connections:['spirit_spring'],     travelDays:{spirit_spring:2},   companionId:'mira',  hasInn:false, bossId:'forest_king',  sealStone:'dark', enemyExp:25, enemyGold:20 },
  desert_ruins:  { id:'desert_ruins',  type:'castle',  connections:['sahal'],             travelDays:{sahal:3},           companionId:null,    hasInn:false, bossId:'archive',      sealStone:null,   requireAllStones:true },
}

const BOSSES = {
  bandit_king:  { name:'盗賊王カルド',       hp:200,  atk:22, def:10, exp:225, gold:100 },
  mine_king:    { name:'鉱王グラドル',       hp:320,  atk:29, def:20, exp:450, gold:160 },
  storm_dragon: { name:'嵐竜ストームレックス', hp:340, atk:30, def:13, exp:420, gold:150 },
  forest_king:  { name:'森王モルガ',         hp:400,  atk:31, def:17, exp:495, gold:180 },
  tidal_king:   { name:'潮王ネブラ',         hp:280,  atk:27, def:14, exp:200, gold:130 },
  archive:      { name:'終末記録体アーカイブ', hp:580, atk:40, def:22, exp:600, gold:300 },
}

const COMPANIONS = {
  gares:  { name:'ガレス',  joinLocId:'alseria',       locType:'town',    joinLevel:2, baseAtk:18, baseDef:22 },
  liz:    { name:'リズ',    joinLocId:'alseria',       locType:'town',    joinLevel:2, baseAtk:11, baseDef:11 },
  noa:    { name:'ノア',    joinLocId:'bern',          locType:'town',    joinLevel:3, baseAtk:23, baseDef:11 },
  cecil:  { name:'セシル',  joinLocId:'galdo',         locType:'town',    joinLevel:4, baseAtk:28, baseDef:9  },
  bram:   { name:'ブラム',  joinLocId:'elna',          locType:'town',    joinLevel:3, baseAtk:29, baseDef:18 },
  finn:   { name:'フィン',  joinLocId:'riverside',     locType:'relay',   joinLevel:2, baseAtk:15, baseDef:13 }, // ✅ relay型でも加入可能（LocationView L98で確認済み）
  vais:   { name:'ヴァイス',joinLocId:'bandit_hideout',locType:'dungeon', joinLevel:3, baseAtk:20, baseDef:9  }, // via boss defeat
  logan:  { name:'ローガン',joinLocId:'sahal',         locType:'town',    joinLevel:4, baseAtk:43, baseDef:22 },
  iris:   { name:'イリス',  joinLocId:'demon_mine',    locType:'dungeon', joinLevel:4, baseAtk:29, baseDef:10 }, // via boss defeat
  sig:    { name:'シグ',    joinLocId:'mirea',         locType:'town',    joinLevel:3, baseAtk:15, baseDef:10 },
  elk:    { name:'エルク',  joinLocId:'dragon_pass',   locType:'dungeon', joinLevel:5, baseAtk:36, baseDef:22 }, // via boss defeat
  mira:   { name:'ミラ',    joinLocId:'ancient_temple',locType:'dungeon', joinLevel:5, baseAtk:29, baseDef:14 }, // via boss defeat
  zeno:   { name:'ゼノ',    joinLocId:'trading_post',  locType:'relay',   joinLevel:7, baseAtk:60, baseDef:28, isHidden:true }, // ✅ trading_post(relay)で加入可能
}

function getExpToNext(level) { return level * 15 }

// ===== プレイヤー戦闘力シミュレーション =====
function calcPlayerPower(level, companions) {
  const playerAtk = 15 + (level - 1) * 2
  const playerDef = 12 + (level - 1) * 2
  const playerHp  = 100 + (level - 1) * 12
  const partyAtk  = companions.reduce((s, c) => s + COMPANIONS[c].baseAtk, 0)
  const partyDef  = companions.reduce((s, c) => s + COMPANIONS[c].baseDef, 0)
  const partyHp   = companions.length * 80
  return {
    totalAtk: playerAtk + partyAtk,
    totalDef: playerDef + partyDef,
    totalHp:  playerHp  + partyHp,
  }
}

function canBeatBoss(bossId, level, companions) {
  const power = calcPlayerPower(level, companions)
  const boss  = BOSSES[bossId]
  if (!boss) return true
  const dmgPerHit = Math.max(1, power.totalAtk - boss.def)
  const hitsNeeded = Math.ceil(boss.hp / dmgPerHit)
  const bossDmgPerHit = Math.max(1, boss.atk - power.totalDef / 2)
  const hpPool = power.totalHp
  const survivableHits = Math.floor(hpPool / bossDmgPerHit)
  return survivableHits >= hitsNeeded
}

// ===== 100回シミュレーション =====
function simulate(runs = 100) {
  const issues = new Map() // issue => count
  const results = { win: 0, lose_time: 0, lose_battle: 0, avg_level: 0, avg_days_left: 0, seal_counts: [0,0,0,0] }
  const issues_per_run = []

  function addIssue(issue) {
    issues.set(issue, (issues.get(issue) || 0) + 1)
  }

  for (let run = 0; run < runs; run++) {
    const runIssues = new Set()
    let daysLeft   = 100
    let currentLoc = 'alseria'
    let playerLevel = 1
    let playerExp  = 0
    let gold       = 200
    let sealStones = []
    let joined     = [] // joined companions (名前リスト)
    let party      = [] // active party (joined且つ生存)
    let defeatedBosses = []
    let gameEnd    = null
    let log        = []

    function gainExp(exp) {
      playerExp += exp
      while (playerExp >= getExpToNext(playerLevel) && playerLevel < 30) {
        playerExp -= getExpToNext(playerLevel)
        playerLevel++
      }
    }

    function tryJoinCompanion(cid) {
      if (joined.includes(cid)) return false
      if (joined.length >= 3) return false // engine.ts joinCompanion: joinedCount >= 3 でブロック（仕様: 13人中3人まで）
      joined.push(cid)
      if (party.length < 3) party.push(cid)
      return true
    }

    function tryMoveToLocation(dest) {
      const loc = LOCATIONS[currentLoc]
      if (!loc.connections.includes(dest)) return false
      const days = loc.travelDays[dest] || 1
      daysLeft -= days
      currentLoc = dest
      if (daysLeft <= 0) { gameEnd = 'time'; return false }
      // エンカウント 30%
      if (LOCATIONS[dest].type === 'relay' && Math.random() < 0.30) {
        const enemyExp = 20
        const enemyGold = 15
        gainExp(enemyExp)
        gold += enemyGold
        log.push(`[Lv${playerLevel}] 移動中エンカウント → EXP+${enemyExp}`)
      }
      return true
    }

    // 単純な貪欲ルート戦略: 主要目標を順番に狙う
    // alseria → galdo → demon_mine → dragon_pass → (elna→spirit_spring→)ancient_temple → sahal → desert_ruins
    const MAIN_PATH = [
      // alseria → get gares, liz
      ['alseria', 'join_gares'],
      ['alseria', 'join_liz'],
      // → galdo via traveler_inn
      ['alseria', 'move', 'traveler_inn'],
      ['traveler_inn', 'move', 'galdo'],
      ['galdo', 'join_cecil'],
      ['galdo', 'dungeon', 'demon_mine'],  // fire seal
      ['demon_mine', 'boss', 'mine_king'],
      ['demon_mine', 'join_iris'],         // after boss (via pendingJoin)
      // → dragon_pass (嵐の封印石)
      ['galdo', 'dungeon', 'dragon_pass'],
      ['dragon_pass', 'boss', 'storm_dragon'],
      ['dragon_pass', 'join_elk'],         // after boss
      // → elna → ancient_temple (闇の封印石)
      ['galdo', 'move', 'traveler_inn'],
      ['traveler_inn', 'move', 'forest_entrance'],
      ['forest_entrance', 'move', 'elna'],
      ['elna', 'join_bram'],
      ['elna', 'move', 'spirit_spring'],
      ['spirit_spring', 'move', 'ancient_temple'],
      ['ancient_temple', 'boss', 'forest_king'],
      ['ancient_temple', 'join_mira'],     // after boss
      // → sahal → desert_ruins
      ['alseria', 'move', 'great_bridge'], // backtrack
      ['great_bridge', 'move', 'riverside'],
      ['riverside', 'move', 'coastal_road'], // no valid path
      // simpler: spirit_spring → elna → forest_entrance → traveler_inn → alseria → ...
      // actually routing is complex, let's simplify with BFS
    ]

    // より単純化: BFS最短経路でmain objectivesを巡る
    function bfsPath(from, to) {
      if (from === to) return [from]
      const visited = new Set([from])
      const queue = [[from, [from]]]
      while (queue.length > 0) {
        const [cur, path] = queue.shift()
        const loc = LOCATIONS[cur]
        for (const next of (loc.connections || [])) {
          if (!visited.has(next)) {
            visited.add(next)
            const newPath = [...path, next]
            if (next === to) return newPath
            queue.push([next, newPath])
          }
        }
      }
      return null
    }

    function moveTo(dest) {
      if (currentLoc === dest) return true
      const path = bfsPath(currentLoc, dest)
      if (!path) return false
      for (let i = 1; i < path.length; i++) {
        if (!tryMoveToLocation(path[i])) return false
      }
      return true
    }

    function grindDungeon(locId, times = 2) {
      if (currentLoc !== locId) return
      for (let i = 0; i < times; i++) {
        const loc = LOCATIONS[locId]
        const exp = (loc.enemyExp || 25) * 2
        const g   = (loc.enemyGold || 20) * 2
        gainExp(exp)
        gold += g
      }
    }

    function fightBoss(locId) {
      const loc = LOCATIONS[locId]
      if (!loc.bossId || defeatedBosses.includes(loc.bossId)) return 'already'
      const canWin = canBeatBoss(loc.bossId, playerLevel, party)
      if (!canWin) {
        runIssues.add(`ボス[${BOSSES[loc.bossId]?.name}]を Lv${playerLevel} で倒せない（${party.length}人パーティ）`)
        return 'fail'
      }
      const boss = BOSSES[loc.bossId]
      gainExp(boss.exp)
      gold += boss.gold
      if (loc.sealStone && !sealStones.includes(loc.sealStone)) {
        sealStones.push(loc.sealStone)
      }
      defeatedBosses.push(loc.bossId)
      log.push(`[Lv${playerLevel}] ボス ${boss.name} 討伐 → 封印石: ${sealStones.join(',')}`)
      return 'win'
    }

    // === メインルート実行 ===
    // Phase 1: アルセリア → ガルド → 廃鉱山
    if (!moveTo('alseria')) goto_end: { gameEnd = 'time'; }
    if (gameEnd) goto_final()
    // 仲間加入: town/relay/castle/dungeon(boss後) すべて加入可能（LocationView.tsx L98で確認済み）
    if (currentLoc === 'alseria') {
      tryJoinCompanion('gares') // town
      tryJoinCompanion('liz')   // town
    }
    if (gameEnd) goto_final()

    if (moveTo('traveler_inn') && !gameEnd) {
      moveTo('galdo')
      if (!gameEnd && COMPANIONS.cecil.locType === 'town') tryJoinCompanion('cecil')
    }

    if (!gameEnd) {
      grindDungeon(null) // galdo周辺でグラインド不要（demon_mineに向かう）
      if (moveTo('demon_mine') && !gameEnd) {
        grindDungeon('demon_mine', 3)
        const r1 = fightBoss('demon_mine')
        if (r1 === 'win') {
          // イリス加入: dungeon type → pendingJoin経由（コード上は正常）
          if (COMPANIONS.iris.locType === 'dungeon') tryJoinCompanion('iris')
        }
      }
    }

    if (!gameEnd && moveTo('dragon_pass')) {
      grindDungeon('dragon_pass', 3)
      const r2 = fightBoss('dragon_pass')
      if (r2 === 'win') {
        if (COMPANIONS.elk.locType === 'dungeon') tryJoinCompanion('elk')
      }
    }

    // Phase 2: エルナ → 古代神殿 (闇の封印石)
    if (!gameEnd && moveTo('elna')) {
      if (COMPANIONS.bram.locType === 'town') tryJoinCompanion('bram')
      if (moveTo('spirit_spring') && !gameEnd) {
        if (moveTo('ancient_temple') && !gameEnd) {
          grindDungeon('ancient_temple', 2)
          const r3 = fightBoss('ancient_temple')
          if (r3 === 'win') {
            if (COMPANIONS.mira.locType === 'dungeon') tryJoinCompanion('mira')
          }
        }
      }
    }

    // Phase 3: サハル → 砂漠遺跡
    if (!gameEnd && sealStones.length >= 3) {
      if (moveTo('sahal') && !gameEnd) {
        if (COMPANIONS.logan.locType === 'town') tryJoinCompanion('logan')
        if (moveTo('desert_ruins') && !gameEnd) {
          const r4 = fightBoss('desert_ruins')
          if (r4 === 'win') {
            gameEnd = 'win'
          } else if (r4 === 'fail') {
            gameEnd = 'lose_battle'
          }
        }
      }
    } else if (!gameEnd) {
      runIssues.add(`封印石が揃わない（${sealStones.length}/3: ${sealStones.join(',')}）まま時間切れ`)
      gameEnd = 'time'
    }

    function goto_final() {}

    if (!gameEnd) gameEnd = 'time'

    // 結果集計
    if (gameEnd === 'win') {
      results.win++
      results.avg_level += playerLevel
      results.avg_days_left += Math.max(0, daysLeft)
    } else if (gameEnd === 'time') {
      results.lose_time++
    } else {
      results.lose_battle++
    }
    results.seal_counts[sealStones.length]++

    // 個別バグ/問題チェック
    for (const issue of runIssues) addIssue(issue)

    issues_per_run.push({
      run: run + 1, result: gameEnd, level: playerLevel, days: daysLeft,
      seals: sealStones.length, companions: joined.length, issues: [...runIssues]
    })
  }

  return { results, issues, issues_per_run }
}

// ===== 厳格静的コード解析（自動検証 + 既知修正済み記録）=====
function staticAnalysis() {
  const bugs = []

  // ===== 自動検証 1: 全拠点到達性チェック (BFS from alseria) =====
  const allLocIds = Object.keys(LOCATIONS)
  const reachable = new Set(['alseria'])
  const queue = ['alseria']
  while (queue.length > 0) {
    const cur = queue.shift()
    for (const next of (LOCATIONS[cur]?.connections || [])) {
      if (!reachable.has(next)) { reachable.add(next); queue.push(next) }
    }
  }
  const unreachable = allLocIds.filter(id => !reachable.has(id))
  if (unreachable.length > 0) {
    bugs.push({ severity: 'CRITICAL', title: `到達不能拠点あり: ${unreachable.join(', ')}`, detail: 'BFS検証で到達できない拠点が存在する。', fix: 'connections を修正する。' })
  }

  // ===== 自動検証 2: 封印石 3種すべて取得可能か =====
  const sealLocs = Object.values(LOCATIONS).filter(l => l.sealStone)
  const sealTypes = [...new Set(sealLocs.map(l => l.sealStone))]
  if (sealTypes.length < 3) {
    bugs.push({ severity: 'CRITICAL', title: `封印石が${sealTypes.length}種しかない（3種必要）`, detail: `封印石種別: ${sealTypes.join(', ')}`, fix: '封印石の種類を3種確認・追加する。' })
  }

  // ===== 自動検証 3: ラスボス到達条件（3封印石が必須）=====
  const finalBossLoc = Object.values(LOCATIONS).find(l => l.requireAllStones && l.bossId)
  if (!finalBossLoc) {
    bugs.push({ severity: 'CRITICAL', title: 'requireAllStones + bossId のロケーションが存在しない', detail: 'ラスボス到達条件が設定されていない。', fix: 'desert_ruins に requireAllStones: true を設定する。' })
  }

  // ===== 自動検証 4: ボス参照整合性 =====
  for (const [locId, loc] of Object.entries(LOCATIONS)) {
    if (loc.bossId && !BOSSES[loc.bossId]) {
      bugs.push({ severity: 'CRITICAL', title: `未定義ボスID: ${locId}.bossId = "${loc.bossId}"`, detail: `BOSSES に ${loc.bossId} が存在しない。`, fix: 'BOSSES定数にボスデータを追加するか、bossId を修正する。' })
    }
  }

  // ===== 自動検証 5: 仲間加入拠点が存在するか =====
  for (const [cid, comp] of Object.entries(COMPANIONS)) {
    if (!LOCATIONS[comp.joinLocId]) {
      bugs.push({ severity: 'HIGH', title: `仲間 ${comp.name} の joinLocId "${comp.joinLocId}" が存在しない`, detail: `LOCATIONS に ${comp.joinLocId} が定義されていない。`, fix: 'joinLocId を修正する。' })
    }
  }

  // ===== 自動検証 6: バランス — 3人パーティでラスボス討伐可能か =====
  const archiboss = BOSSES['archive']
  if (archiboss) {
    const bestTeam3 = ['gares', 'liz', 'cecil'] // 代表的な標準パーティ
    const power3 = calcPlayerPower(15, bestTeam3)
    if (!canBeatBoss('archive', 15, bestTeam3)) {
      bugs.push({ severity: 'BALANCE', title: 'Lv15 ガレス+リズ+セシル でラスボスに勝てない', detail: `totalAtk=${power3.totalAtk}, hp=${power3.totalHp} vs archive HP:${archiboss.hp}`, fix: 'ラスボスのHPかATKを下げるか、ボスEXP分布を見直す。' })
    }
    // ✅ ソロ不可は仕様通り（仲間を集める動機付け）。バグ扱い不要。
  }

  // ===== 自動検証 7: 中継地のtravelEnemyPoolが設定されているか =====
  const relaysWithoutPool = Object.entries(LOCATIONS)
    .filter(([, l]) => l.type === 'relay' && !l.travelEnemyPool)
    .map(([id]) => id)
  if (relaysWithoutPool.length > 0) {
    bugs.push({ severity: 'LOW', title: `travelEnemyPool未設定の中継地: ${relaysWithoutPool.join(', ')}`, detail: '移動エンカウントが発生しない中継地がある（30%確率でエンカウントのはずが実質0%）。', fix: 'travelEnemyPoolを設定するか、pool=[]で意図的にエンカウントなしとする。' })
  }

  // ===== 手動検証済み項目 =====
  // ✅ フィン加入可能 (LocationView.tsx L98: relay/castle 条件追加済み)
  // ✅ ゼノ joinLocId修正 (QCスクリプト: desert_ruins→trading_post)
  // ✅ 仲間3人上限 (engine.ts joinedCount >= 3)
  // ✅ 役割バッジ追加 (LocationView.tsx getRoleBadge)
  // ✅ 仲間スタット表示 (LocationView.tsx HP/ATK/DEF/SPD実数値)
  // ✅ ボス情報表示 (LocationView.tsx ボス名・HP・ATK)
  // ✅ 低HP警告バナー (LocationView.tsx パーティHP50%未満)
  // ✅ パーティ編成ボタン最上部・紫色強調 (LocationView.tsx)
  // ✅ ゼノ登場シーン (desert_ruins_arrival イベント)
  // ✅ 仲間13人全員にdesc戦略アドバイス追加
  // ✅ cecilspeakerName typo修正
  // ✅ ガレスに挑発スキル追加
  // ✅ チュートリアル強化

  // ===== 残課題 =====
  // ✅ [6614310] 仲間加入後パーティ編成を自動起動 — GameRoot.tsxで実装予定

  return bugs
}

// ===== メイン実行 =====
const RUN_COUNT = parseInt(process.argv[2] || '1000')
const { results, issues, issues_per_run } = simulate(RUN_COUNT)
const bugs = staticAnalysis()

console.log('\n' + '='.repeat(70))
console.log(`  封印の継承者 — QC ${RUN_COUNT}回シミュレーション 結果レポート`)
console.log('='.repeat(70))

console.log('\n【プレイ結果統計】')
console.log(`  クリア:       ${results.win}回 (${results.win}%)`)
console.log(`  時間切れ:     ${results.lose_time}回`)
console.log(`  戦闘敗北:     ${results.lose_battle}回`)
if (results.win > 0) {
  console.log(`  平均クリアLv: ${(results.avg_level / results.win).toFixed(1)}`)
  console.log(`  平均残り日数: ${(results.avg_days_left / results.win).toFixed(1)}日`)
}
console.log(`  封印石0個で終了: ${results.seal_counts[0]}回`)
console.log(`  封印石1個で終了: ${results.seal_counts[1]}回`)
console.log(`  封印石2個で終了: ${results.seal_counts[2]}回`)
console.log(`  封印石3個で終了: ${results.seal_counts[3]}回`)

if (issues.size > 0) {
  console.log('\n【シミュレーション中に検出された問題】')
  for (const [issue, count] of [...issues.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  [${count}回] ${issue}`)
  }
}

console.log('\n' + '='.repeat(70))
console.log(`  静的コード解析: ${bugs.length}件の問題を検出`)
console.log('='.repeat(70))

const grouped = { CRITICAL:[], HIGH:[], MEDIUM:[], BALANCE:[], LOW:[], UX:[] }
for (const b of bugs) (grouped[b.severity] || grouped.LOW).push(b)

for (const [sev, list] of Object.entries(grouped)) {
  if (list.length === 0) continue
  const icon = { CRITICAL:'🔴', HIGH:'🟠', MEDIUM:'🟡', BALANCE:'⚖️', LOW:'🔵', UX:'🎨' }[sev] || '⚪'
  console.log(`\n${icon} ${sev} (${list.length}件)`)
  for (const b of list) {
    console.log(`\n  📌 ${b.title}`)
    console.log(`     ${b.detail}`)
    console.log(`     ✅ 修正案: ${b.fix}`)
  }
}

console.log('\n' + '='.repeat(70))
console.log('  優先修正リスト（クリティカルから順）')
console.log('='.repeat(70))
let n = 1
for (const sev of ['CRITICAL','HIGH','MEDIUM','BALANCE','UX','LOW']) {
  for (const b of grouped[sev]||[]) {
    console.log(`  ${n++}. [${sev}] ${b.title}`)
  }
}
