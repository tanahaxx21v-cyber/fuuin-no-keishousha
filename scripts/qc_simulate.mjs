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
  traveler_inn:  { id:'traveler_inn',  type:'relay',   connections:['alseria','galdo','forest_entrance'], travelDays:{alseria:1,galdo:2,forest_entrance:1}, companionId:null,   hasInn:true,  bossId:null,  sealStone:null },
  checkpoint:    { id:'checkpoint',    type:'relay',   connections:['alseria','bern'],                    travelDays:{alseria:1,bern:2},                   companionId:null,   hasInn:false, bossId:null,  sealStone:null },
  great_bridge:  { id:'great_bridge',  type:'relay',   connections:['alseria','riverside'],               travelDays:{alseria:2,riverside:1},              companionId:null,   hasInn:false, bossId:null,  sealStone:null },
  riverside:     { id:'riverside',     type:'relay',   connections:['great_bridge','mirea','lighthouse'], travelDays:{great_bridge:1,mirea:2,lighthouse:1},  companionId:'finn', hasInn:true, bossId:null, sealStone:null },
  watchtower:    { id:'watchtower',    type:'relay',   connections:['bern','galdo'],                      travelDays:{bern:2,galdo:2},                     companionId:null,   hasInn:false, bossId:null,  sealStone:null },
  lighthouse:    { id:'lighthouse',    type:'relay',   connections:['mirea','riverside'],                 travelDays:{mirea:1,riverside:1},                companionId:null,   hasInn:false, bossId:null,  sealStone:null },
  spirit_spring: { id:'spirit_spring', type:'relay',   connections:['elna','ancient_temple'],            travelDays:{elna:1,ancient_temple:2},             companionId:null,   hasInn:false, bossId:null,  sealStone:null },
  trading_post:  { id:'trading_post',  type:'relay',   connections:['bern','checkpoint','bandit_hideout','sahal'], travelDays:{bern:1,checkpoint:2,bandit_hideout:2,sahal:2}, companionId:null, hasInn:false, bossId:null, sealStone:null },
  coastal_road:  { id:'coastal_road',  type:'relay',   connections:['mirea','sahal'],                    travelDays:{mirea:2,sahal:1},                    companionId:null,   hasInn:false, bossId:null,  sealStone:null },
  forest_entrance:{ id:'forest_entrance',type:'relay', connections:['traveler_inn','elna'],              travelDays:{traveler_inn:1,elna:1},               companionId:null,   hasInn:false, bossId:null,  sealStone:null },
  demon_mine:    { id:'demon_mine',    type:'dungeon', connections:['galdo'],             travelDays:{galdo:2},           companionId:'iris',  hasInn:false, bossId:'mine_king',    sealStone:'fire',  enemyExp:33, enemyGold:27 },
  dragon_pass:   { id:'dragon_pass',   type:'dungeon', connections:['galdo'],             travelDays:{galdo:3},           companionId:'elk',   hasInn:false, bossId:'storm_dragon', sealStone:'storm', enemyExp:30, enemyGold:25 },
  bandit_hideout:{ id:'bandit_hideout',type:'dungeon', connections:['trading_post','sahal'], travelDays:{trading_post:2,sahal:2}, companionId:'vais', hasInn:false, bossId:'bandit_king', sealStone:null, enemyExp:20, enemyGold:18 },
  ancient_temple:{ id:'ancient_temple',type:'dungeon', connections:['spirit_spring'],     travelDays:{spirit_spring:2},   companionId:'mira',  hasInn:false, bossId:'forest_king',  sealStone:'dark', enemyExp:25, enemyGold:20 },
  desert_ruins:  { id:'desert_ruins',  type:'castle',  connections:['sahal'],             travelDays:{sahal:3},           companionId:'zeno',  hasInn:false, bossId:'archive',      sealStone:null,   requireAllStones:true },
}

const BOSSES = {
  bandit_king:  { name:'盗賊王カルド',   hp:200,  atk:22, def:10, exp:100, gold:80  },
  mine_king:    { name:'鉱王グラドル',   hp:320,  atk:29, def:20, exp:200, gold:130 },
  storm_dragon: { name:'嵐竜ストームレックス', hp:340, atk:30, def:13, exp:180, gold:120 },
  forest_king:  { name:'森王モルガ',     hp:400,  atk:31, def:17, exp:220, gold:150 },
  archive:      { name:'終末記録体アーカイブ', hp:580, atk:40, def:22, exp:600, gold:300 },
}

const COMPANIONS = {
  gares:  { name:'ガレス',  joinLocId:'alseria',       locType:'town',    joinLevel:2, baseAtk:18, baseDef:22 },
  liz:    { name:'リズ',    joinLocId:'alseria',       locType:'town',    joinLevel:2, baseAtk:11, baseDef:11 },
  noa:    { name:'ノア',    joinLocId:'bern',          locType:'town',    joinLevel:3, baseAtk:23, baseDef:11 },
  cecil:  { name:'セシル',  joinLocId:'galdo',         locType:'town',    joinLevel:4, baseAtk:28, baseDef:9  },
  bram:   { name:'ブラム',  joinLocId:'elna',          locType:'town',    joinLevel:3, baseAtk:29, baseDef:18 },
  finn:   { name:'フィン',  joinLocId:'riverside',     locType:'relay',   joinLevel:2, baseAtk:15, baseDef:13 }, // BUG: relay type = can't join
  vais:   { name:'ヴァイス',joinLocId:'bandit_hideout',locType:'dungeon', joinLevel:3, baseAtk:20, baseDef:9  }, // via boss defeat
  logan:  { name:'ローガン',joinLocId:'sahal',         locType:'town',    joinLevel:4, baseAtk:43, baseDef:22 },
  iris:   { name:'イリス',  joinLocId:'demon_mine',    locType:'dungeon', joinLevel:4, baseAtk:29, baseDef:10 }, // via boss defeat
  sig:    { name:'シグ',    joinLocId:'mirea',         locType:'town',    joinLevel:3, baseAtk:15, baseDef:10 },
  elk:    { name:'エルク',  joinLocId:'dragon_pass',   locType:'dungeon', joinLevel:5, baseAtk:36, baseDef:22 }, // via boss defeat
  mira:   { name:'ミラ',    joinLocId:'ancient_temple',locType:'dungeon', joinLevel:5, baseAtk:29, baseDef:14 }, // via boss defeat
  zeno:   { name:'ゼノ',    joinLocId:'desert_ruins',  locType:'castle',  joinLevel:7, baseAtk:60, baseDef:28, isHidden:true }, // NEVER recruitable
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
      // BUG CHECK: 3人制限がengineにない
      // joinCompanionはparty.length < 3 のみチェック（joined totalは制限なし）
      if (joined.length >= 13) return false // 物理的上限のみ
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
    // 町の仲間加入（town型のみ正常加入可能）
    if (COMPANIONS.gares.locType === 'town' && currentLoc === 'alseria') tryJoinCompanion('gares')
    if (COMPANIONS.liz.locType === 'town' && currentLoc === 'alseria') tryJoinCompanion('liz')
    if (gameEnd) goto_final()

    // フィン加入チェック: riverside=relay → UIが表示されない
    // 実際のプレイでは riverside に行ってもフィンの加入UIが出ない
    // シミュレーターでは「バグのある挙動」を再現: フィンは加入不可
    // (town typeのみ showCompanionJoin が表示されるため)

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

// ===== 静的コード解析 =====
function staticAnalysis() {
  const bugs = []

  // BUG 1: フィンが加入不可
  bugs.push({
    severity: 'CRITICAL',
    title: 'フィン（川辺の村）が加入不可',
    detail: 'LocationView.tsx:80 の `loc.type === "town"` 条件により、relay型ロケーション（riverside）では仲間加入UIが表示されない。フィンは永遠に仲間にできない。',
    fix: '`loc.type === "town" || loc.type === "relay"` に変更するか、companionIdがある場所は全て表示する。'
  })

  // BUG 2: ゼノが絶対に加入不可
  bugs.push({
    severity: 'CRITICAL',
    title: 'ゼノ（砂漠遺跡）が絶対に加入不可',
    detail: 'engine.ts:582 で isFinalBoss=true の場合は早期return。pendingCompanionJoinがセットされない。ラスボス後はgame.win画面に遷移するためゼノの加入ダイアログは永遠に表示されない。',
    fix: 'ゼノを砂漠遺跡到着時（ボス戦前）に加入判定に変更するか、castle型でもcompanionId所持ロケーションで加入UIを表示する。'
  })

  // BUG 3: 3人制限の未実装
  bugs.push({
    severity: 'HIGH',
    title: '仲間3人上限が未実装',
    detail: 'engine.ts:129-138 の joinCompanion は party.length < 3（アクティブパーティ）しかチェックしない。「3人までしか仲間にできません」の設計に反し、全13人を加入済みにできる。',
    fix: 'joinCompanion で `Object.values(s.companions).filter(c => c.joined).length >= 3` チェックを追加。'
  })

  // BUG 4: ダンジョン探索で日数消費なし
  bugs.push({
    severity: 'HIGH',
    title: 'ダンジョン探索で日数が消費されない',
    detail: 'engine.ts:656 enterDungeon は battle を開始するが daysLeft を減らさない。ダンジョンで何度でも無限グラインド可能で100日制限が無意味になる。',
    fix: 'enterDungeon で daysLeft -= 1 を追加。宿屋休憩も daysLeft -= 1 はあるが、ダンジョン探索も消費すべき。'
  })

  // BUG 5: bossDefeated チェックのバグ
  bugs.push({
    severity: 'MEDIUM',
    title: 'enterDungeon の bossAlreadyDefeated が未使用',
    detail: 'engine.ts:661 で const bossAlreadyDefeated を計算しているが、その後一度も使われていない。ボス撃破後も「ダンジョン探索」ボタンが機能するのは LocationView で別途チェックしているが、engine 内のロジックに不整合がある。',
    fix: '未使用変数を削除するか、意図した形で使用する。'
  })

  // BUG 6: LocationView でダンジョン完了後も「ボス討伐済み」「封印石入手済み」が逆表示
  bugs.push({
    severity: 'MEDIUM',
    title: 'LocationView: ボス討伐済み表示のロジック矛盾',
    detail: 'LocationView.tsx:159-162: `bossDefeated` で「✅ ボス討伐済み」、`!sealObtained` で「💎 封印石入手済み」を表示している。`!sealObtained`（封印石を持っていない）なのに「封印石入手済み」と表示する誤り。',
    fix: '`{sealObtained && <div>💎 封印石入手済み</div>}` に修正。'
  })

  // BUG 7: LocationView で魔王名が不一致
  bugs.push({
    severity: 'LOW',
    title: '砂漠遺跡のボス名が不一致',
    detail: 'LocationView.tsx:191: 「魔王ヴァールドに挑む！」と表示されているが、bossId は archive（終末記録体アーカイブ）。魔王の名前がストーリーと一致していない。',
    fix: '「終末記録体アーカイブに挑む！」または世界観に合った名称に統一する。'
  })

  // BUG 8: ゲームオーバー後のセーブデータ
  bugs.push({
    severity: 'MEDIUM',
    title: 'ゲームオーバー後もセーブデータが残る',
    detail: 'closeBattle でgameoverになった後、古いセーブデータが localStorage に残る。次回起動時にゲームオーバー状態からロードされ、タイトル画面に戻れない。',
    fix: 'gameover/win 時に localStorage をクリア、またはセーブデータに phase=gameover の場合は無視する。'
  })

  // BUG 9: 仲間が全滅してもゲームオーバーにならない
  bugs.push({
    severity: 'MEDIUM',
    title: '仲間全滅でもゲームオーバーにならない（主人公のみ生存）',
    detail: '仲間が全員死亡しても主人公が生きていれば戦闘継続・ゲーム継続。3人制限（設計）との整合性上、全滅時の緊張感が失われる。',
    fix: '設計上の選択肢：主人公+仲間全滅でのみgameover、または仲間死亡イベントを強調する演出追加。'
  })

  // BALANCE 1: 序盤ゴールド不足
  bugs.push({
    severity: 'BALANCE',
    title: '序盤ゴールド不足',
    detail: '初期所持金200G、宿屋1回50G（1日消費）、ポーション100G。ガルドまでの移動に3日消費（150G宿屋）+ アイテム購入で即赤字になりやすい。',
    fix: '初期金額を300Gに増加、または序盤エリアの宿屋を30Gに設定。'
  })

  // BALANCE 2: EXP不足でLv20到達困難
  bugs.push({
    severity: 'BALANCE',
    title: 'Lv20クリア目標に対してEXPが不足',
    detail: 'Lv1→Lv20に必要なEXP: Σ(1×15 to 19×15) = 2,850。ラスボス以外の全ボス合計EXP: 100+200+180+220=700。敵単体EXP平均25、2,150EXP÷25=86回の雑魚戦が必要。100日でこれは厳しい（移動・イベント時間を考慮）。',
    fix: 'ボスEXPを1.5倍に増加、または敵EXPを全体的に30-40%増加。'
  })

  // BALANCE 3: ラスボスが強すぎる
  bugs.push({
    severity: 'BALANCE',
    title: 'ラスボス（終末記録体）がLv20相当パーティでも厳しい',
    detail: 'archive: HP580, ATK40, DEF22。Lv20プレイヤー: ATK53, DEF52。ダメージ: 53-11=42/ターン。必要ターン数: 580÷42≒14ターン。ボスダメージ: 40-26=14/ターン。HP340で14ターン持つが仲間3人分を考慮しても非常にギリギリ。',
    fix: 'アーカイブのHP580→460に減少、ATK40→36に減少。または 封印解放スキル（3.5倍）が機能する前提でバランス調整。'
  })

  // BALANCE 4: 仲間3人制限とルート設計の不整合
  bugs.push({
    severity: 'BALANCE',
    title: '仲間3人制限と推奨ルートの不整合',
    detail: 'メインルートで遭遇する仲間: ガレス、リズ（alseria）→セシル（galdo）→イリス（demon_mine）→エルク（dragon_pass）→ブラム（elna）→ミラ（ancient_temple）→ローガン（sahal）= 8人。3人制限だと誰を選ぶかの情報がゲーム内にない。',
    fix: '各仲間の特徴・役割説明をゲーム内に追加。または仲間制限を5人に変更（設計再考）。'
  })

  // BALANCE 5: 速度型キャラの優位性
  bugs.push({
    severity: 'BALANCE',
    title: '高速キャラ（ヴァイス SPD19, ミラ SPD18）が先制優位すぎる',
    detail: 'SPDが高いほど先に行動できるため、ヴァイス・ノア・ミラのような高SPDキャラが戦略的に必須になりがち。低SPDキャラ（ガレス SPD6, ローガン SPD7）の存在意義が薄れる。',
    fix: '「挑発」スキル（敵の攻撃対象を自分に固定）等でガレス/ローガンの低速を補う役割を追加。'
  })

  // UX 1: UI上でパーティ選択が不明確
  bugs.push({
    severity: 'UX',
    title: '仲間加入後のパーティ編成画面への誘導がない',
    detail: '仲間を加入させた後、そのままLocationViewに戻るだけで「パーティを編成してください」等の誘導がない。StatusBarの「👥 仲間」ボタンに気づかないユーザーは最適パーティを組めない。',
    fix: '仲間加入後に「パーティを変更しますか？」ダイアログを表示する。'
  })

  // UX 2: 制限時間の視覚的警告が弱い
  bugs.push({
    severity: 'UX',
    title: '残り日数の警告が20日以下しか表示されない',
    detail: 'StatusBar.tsx:22: daysLeft <= 20 でのみアニメーション表示。封印石0枚のまま残り50日になっても警告なし。初心者がゲームオーバーに気づかないまま進行する。',
    fix: '残り40日でオレンジ警告、20日で赤点滅に段階化。「このペースでは間に合いません」等のヒントを追加。'
  })

  // UX 3: セーブ削除の導線が不明
  bugs.push({
    severity: 'UX',
    title: 'セーブデータ削除の方法がゲーム内に表示されない',
    detail: 'handleDeleteSave 関数は存在するが、ゲーム内のどこからも呼び出せない。既存セーブがある場合、新しい難易度でのプレイ開始方法がわからない。',
    fix: 'タイトル画面に「セーブ削除」または「最初からはじめる」ボタンを追加。'
  })

  return bugs
}

// ===== メイン実行 =====
const { results, issues, issues_per_run } = simulate(100)
const bugs = staticAnalysis()

console.log('\n' + '='.repeat(70))
console.log('  封印の継承者 — QC 100回シミュレーション 結果レポート')
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
