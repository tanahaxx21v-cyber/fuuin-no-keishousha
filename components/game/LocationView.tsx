'use client'

import { useState, useEffect } from 'react'
import type { GameState, CompanionId } from '@/lib/game/types'
import { LOCATIONS, COMPANIONS, ENEMIES, ITEMS, getInnPrice, getDifficultyMultiplier } from '@/lib/game/data'
import { CharPortrait, CharPortraitLarge, hasCharPortrait } from './CharPortrait'

// ダンジョン危険度マッピング（ボスの強さから判定）
const DUNGEON_DANGER: Record<string, { rank: string; color: string; label: string }> = {
  bandit_king:  { rank: '★★☆☆☆', color: '#fb923c', label: '中級' },
  tidal_king:   { rank: '★★★☆☆', color: '#f97316', label: '上級' },
  mine_king:    { rank: '★★★☆☆', color: '#f97316', label: '上級' },
  storm_dragon: { rank: '★★★★☆', color: '#ef4444', label: '危険' },
  forest_king:  { rank: '★★★★☆', color: '#ef4444', label: '危険' },
  archive:      { rank: '★★★★★', color: '#dc2626', label: '最終決戦' },
}

interface Props {
  gs: GameState
  onBackToMap: () => void
  onInn: () => void
  onOpenShop: () => void
  onEnterDungeon: () => void
  onFightBoss: () => void
  onJoinCompanion: (id: CompanionId) => void
  onSkipCompanion: () => void
  onWander?: () => void
  onCampRest?: () => void
  onOpenPartyManage?: () => void
  onUseItem?: (itemId: string, targetId: 'player' | CompanionId) => void
  onOpenAlbum?: () => void
}

function getRoleBadge(cls: string): { label: string; color: string } {
  if (cls === '騎士' || cls === '戦士') return { label: '🛡️ タンク型', color: 'text-blue-300' }
  if (cls === '神官') return { label: '💚 ヒーラー型', color: 'text-green-300' }
  if (cls === '魔法使い' || cls === '元魔王軍魔導士') return { label: '🔮 魔法型', color: 'text-purple-300' }
  if (cls === '弓使い' || cls === 'エルフ・弓術士') return { label: '🏹 遠距離型', color: 'text-amber-300' }
  return { label: '⚔️ アタッカー型', color: 'text-red-300' }
}

// 仲間の場所到着フレーバーセリフ（PP4スタイル：場所タイプ別）
const COMPANION_LOC_LINES: Partial<Record<CompanionId, { town: string[]; relay: string[]; dungeon: string[] }>> = {
  gares: {
    town: ['ここは見張りを増やした方がいいな。', 'まず宿屋で装備を確認しよう。', '町の人たちを守ることが我々の使命だ。'],
    relay: ['油断するな。いつでも剣を抜けるようにしておけ。', 'ここで一息つくか。でも警戒は怠るな。', '次の目的地への道を確認しておく。'],
    dungeon: ['戦闘態勢を整えろ。ここからが本番だ。', '俺が先頭に立つ。後ろは任せた。', '敵の気配がする……慎重に行こう。'],
  },
  liz: {
    town: ['神殿があれば祈っておきたいわ。', 'お腹すいた……料理屋はどこかな。', '人が多いと安心するね。'],
    relay: ['自然の中は心が洗われる気がする。', 'ここでしばらく休もうよ。疲れたでしょ？', 'みんな怪我はない？'],
    dungeon: ['怖い……でも、みんながいるから大丈夫。', '回復魔法は準備万端よ。頼ってね。', '光よ、私たちを守り給え……'],
  },
  noa: {
    town: ['矢の補充はここでできるかな？', '人混みは動きにくい。弓が引きにくいよ。', '情報収集するなら町が一番ね。'],
    relay: ['視界が広くて気持ちいい！矢が遠くまで飛びそう。', '風向きを確認しておかないとね。', 'こういう場所は好き。開放感があって。'],
    dungeon: ['薄暗いと弓が使いにくい……でもやってみせる！', '敵の位置を見極めてから撃つよ。', 'ここの敵に弓は有効かな？'],
  },
  cecil: {
    town: ['図書館か知識人がいれば魔法書の情報が欲しいわ。', '理論的に考えれば、ここに補給品があるはず。', '……賑やか。でも悪くない。'],
    relay: ['魔力が自然に回復する気がする。不思議ね。', 'データを収集しておくわ。地形が重要よ。', '……静かね。集中できる。'],
    dungeon: ['魔法の実験に最適なフィールドね。', '魔力感知を強化しておいたわ。準備完了。', 'ここの敵には火か雷が効くと思う。理論上。'],
  },
  bram: {
    town: ['腹が減った！何か食えるものはあるか？', '強い奴がいたら手合わせを頼もうか。', 'うるさい場所は苦手だが……まあいい。'],
    relay: ['いい空気だ。体が動く気がする！', 'ここで一戦やってみるか？……敵がいないか。', '旅の途中は嫌いじゃない。'],
    dungeon: ['よし来た！ここからが楽しくなる！', 'どんな敵が来ても返り討ちにしてやる！', 'ボスはどこだ？早く戦いたい！'],
  },
  finn: {
    town: ['すごい……こんな大きな町、初めて来ました。', '修行になること、何かないかな。', 'た、立派な街ですね！'],
    relay: ['ここで野宿したことがあります。懐かしい。', '休憩の間に素振りをしておきます！', '道が合ってるか不安です……'],
    dungeon: ['初めてのダンジョン……緊張します。', '先輩の背中を見て学びます！', 'て、手が震えてる……大丈夫、大丈夫。'],
  },
  vais: {
    town: ['昔、この手の場所で仕事をしてたな。', '町の雰囲気で何が起きてるか読める。俺は慣れてる。', '…ちょっと懐かしい。いい思い出ばかりじゃないが。'],
    relay: ['こういう場所で野宿するのは慣れてる。', '見張りはやっとく。眠れよ。', '昔の仲間と来たことある……今は別々だけどな。'],
    dungeon: ['暗くて狭い場所は好きじゃないが……慣れてはいる。', 'トラップに気をつけろよ。元盗賊の勘だ。', 'こういう場所は逃げ道を先に確認する習慣がある。'],
  },
  logan: {
    town: ['人が多い。…苦手だ。', '……にぎやかだな。', 'ここにいるのが正しいのか、今でも疑問だが。'],
    relay: ['……いい場所だ。静かで。', '誰とも話さなくていいのがいい。', '自然の中なら少し落ち着ける。'],
    dungeon: ['ここは生か死かだ。覚悟はいいか。', '……暗い。でも心地よい。', '俺の仕事は……前に出て盾になることだ。'],
  },
  iris: {
    town: ['人間の街……不思議な感じ。でも悪くない。', '怪しまれてないかな、私……。', 'こんなに温かい場所があるんだね、人間の世界にも。'],
    relay: ['魔族の世界とは空気が違う。新鮮だわ。', 'もし敵が来ても、私が守ります。', '……旅って、こういうものなのね。'],
    dungeon: ['魔族の力を使ってもいいですか？……いざとなったら。', 'ここの魔力が乱れている。何かいる。', 'みんながいるから、怖くない。'],
  },
  sig: {
    town: ['お、金の匂いがする！何か儲かるものない？', '情報は金と同じ価値がある。聞き込みしてくるよ。', 'こういう場所が一番落ち着く〜。'],
    relay: ['こんな辺鄙な場所で何か掘り出し物はないかな。', '稼ぎのない旅は性に合わないな〜。', 'ここで何かいい話はないかなあ。'],
    dungeon: ['ここの宝箱、全部漁っていい？', 'リスクとリターンの計算は……うん、許容範囲。', '宝が眠ってたりするかも！楽しみ！'],
  },
  elk: {
    town: ['獣人が来るといやな顔をするやつがいる。慣れてるがな。', '町の食い物は美味いが量が少ない。', '早く出発したいな。閉じた場所は苦手だ。'],
    relay: ['風が気持ちいい。槍の練習に最適だ！', 'このくらい開けた場所なら思い切り動ける。', '獣の勘が告げる……何かいるぞ。'],
    dungeon: ['閉所は好きじゃないが、戦いには変わりない。', '俺の槍は狭い場所でも使える。問題ない。', '敵の匂いがする。準備しろ。'],
  },
  mira: {
    town: ['人間の街は騒がしい……エルフの里とは大違いね。', '良い薬草があれば買っておきたい。', 'ここの人たちは何を思って生きているのかしら。'],
    relay: ['森があると落ち着く。木の声が聞こえる気がして。', 'エルフにとって旅の中継地は故郷みたいなものよ。', '風が変わった。天気が崩れるかも。'],
    dungeon: ['ここは自然の摂理に反する場所ね……慎重に行きましょう。', 'エルフの矢は暗闇でも標的を外さないわ。', '生命の気配が薄い……何かが棲んでいる。'],
  },
  zeno: {
    town: ['……人間の街か。落ち着かない。', '私のことを怖れている目がある……当然か。', '人間の世界を理解しようとしているが……難しい。'],
    relay: ['ここは……まだ許容範囲だ。', '魔族の感覚で言えば、この場所は中立だ。', '……面白い場所だ。記憶に留めておこう。'],
    dungeon: ['魔族の目には、ここが本来の戦場に見える。', '力が解放される感覚がある……制御はできている。', '人間と魔族が共に戦う場所……奇妙だが、嫌いではない。'],
  },
}

export default function LocationView({
  gs, onBackToMap, onInn, onOpenShop, onEnterDungeon, onFightBoss, onJoinCompanion, onSkipCompanion, onWander, onCampRest, onOpenPartyManage, onUseItem, onOpenAlbum
}: Props) {
  const [itemPanelOpen, setItemPanelOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [showArrival, setShowArrival] = useState(false)
  const [showBossConfirm, setShowBossConfirm] = useState(false)
  const loc = LOCATIONS[gs.currentLocId]

  useEffect(() => {
    const isFirstVisit = (gs.locVisitCounts?.[gs.currentLocId] ?? 1) === 1
    if (isFirstVisit) setShowArrival(true)
  }, [gs.currentLocId])

  const companion = loc.companionId ? COMPANIONS[loc.companionId] : undefined
  const companionState = companion ? gs.companions[companion.id] : undefined
  const showCompanionJoin = companion && companionState && !companionState.joined
  const pendingJoin = gs.pendingCompanionJoin ? COMPANIONS[gs.pendingCompanionJoin] : undefined

  const bossDefeated = loc.bossId ? gs.defeatedBosses.includes(loc.bossId) : false
  const sealObtained = loc.sealStone ? gs.sealStones.includes(loc.sealStone) : false
  const joinedCount = Object.values(gs.companions).filter(c => c.joined).length

  const totalDays = getDifficultyMultiplier(gs.difficulty).days
  const typeLabel = loc.type === 'town' ? '🏘️ 町' : loc.type === 'dungeon' ? '⚔️ ダンジョン' : loc.type === 'relay' ? '🛖 中継地' : '🏯 城'
  const typeBorder = loc.type === 'town' ? 'border-indigo-700' : loc.type === 'dungeon' ? 'border-orange-800' : loc.type === 'relay' ? 'border-slate-600' : 'border-red-800'

  // 仲間フレーバーセリフ（決定論的：訪問回数×仲間インデックスで選択）
  const aliveParty = gs.party.filter(id => gs.companions[id]?.alive)
  const locVisit = gs.locVisitCounts?.[gs.currentLocId] ?? 1
  let flavorLine: { speakerId: CompanionId; line: string } | null = null
  if (aliveParty.length > 0) {
    const speakerIdx = (locVisit - 1) % aliveParty.length
    const speakerId = aliveParty[speakerIdx] as CompanionId
    const linesForType = COMPANION_LOC_LINES[speakerId]?.[loc.type as 'town' | 'relay' | 'dungeon']
    if (linesForType && linesForType.length > 0) {
      const lineIdx = Math.floor((locVisit - 1) / aliveParty.length) % linesForType.length
      flavorLine = { speakerId, line: linesForType[lineIdx] }
    }
  }

  // 仲間なし時のプレイヤー独白（PP4スタイル：主人公の内面）
  const SOLO_LINES: Partial<Record<string, { town: string[]; relay: string[]; dungeon: string[]; castle: string[] }>> = {
    _: {
      town: [
        '……まだ一人だ。誰か、信頼できる仲間を見つけなければ。',
        'この町のどこかに、一緒に戦ってくれる人がいるかもしれない。',
        '封印石を集めるには、仲間の力が必要だ。急がなくては……',
        '人の声が聞こえる。温かい。でも、急ぎの旅だ。',
      ],
      relay: [
        'ここで一息つくか。……でも、一人旅は心細い。',
        '封印石のことを考えると、立ち止まってなどいられない。',
        '誰かいればと思うが……今は先を急ごう。',
      ],
      dungeon: [
        '一人でここに踏み込むのは……無謀かもしれない。でも、やるしかない。',
        '力を蓄えなければ。仲間がいればもっと楽なのだが……',
        '封印石はここにある。怖れている場合じゃない。',
      ],
      castle: [
        '封印石を集めなければ、ここには入れない。まだ旅は続く。',
        '……今は力を蓄える時だ。',
      ],
    },
  }
  let soloLine: string | null = null
  if (aliveParty.length === 0) {
    const lines = SOLO_LINES._?.[loc.type as 'town' | 'relay' | 'dungeon' | 'castle'] ?? SOLO_LINES._?.town ?? []
    if (lines.length > 0) {
      soloLine = lines[(locVisit - 1) % lines.length]
    }
  }

  // 初訪問オーバーレイ表示パラメータ
  const arrivalBg =
    loc.type === 'dungeon' ? 'from-red-950/95 via-[#07071a]/95 to-[#07071a]/95'
    : loc.type === 'town'  ? 'from-indigo-950/95 via-[#07071a]/95 to-[#07071a]/95'
    : 'from-slate-900/95 via-[#07071a]/95 to-[#07071a]/95'
  const arrivalBorder =
    loc.type === 'dungeon' ? 'border-orange-600'
    : loc.type === 'town'  ? 'border-indigo-500'
    : 'border-slate-500'
  const dangerInfo = loc.bossId ? DUNGEON_DANGER[loc.bossId] : null

  return (
    <div className="p-3 max-w-2xl mx-auto flex flex-col gap-3">

      {/* 初訪問オーバーレイ */}
      {showArrival && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center cursor-pointer"
          style={{ background: 'rgba(4,4,20,0.88)' }}
          onClick={() => setShowArrival(false)}
        >
          <div className={`relative max-w-sm w-full mx-6 rounded-2xl border-2 ${arrivalBorder} bg-gradient-to-b ${arrivalBg} p-8 text-center shadow-2xl`}
            style={{ animation: 'fadeIn 0.5s ease' }}
          >
            {/* タイプラベル */}
            <div className="text-xs font-black text-gray-400 tracking-widest uppercase mb-3">{typeLabel}</div>
            {/* 絵文字 */}
            <div className="text-7xl mb-4" style={{ filter: 'drop-shadow(0 0 18px rgba(255,255,200,0.4))' }}>{loc.emoji}</div>
            {/* 地名 */}
            <div className="text-3xl font-black text-white mb-1" style={{ textShadow: '0 0 20px rgba(150,150,255,0.5)' }}>{loc.name}</div>
            {/* 説明文 */}
            <div className="text-sm text-gray-400 leading-relaxed mb-4 px-2">{loc.desc}</div>
            {/* ダンジョン危険度 */}
            {dangerInfo && (
              <div className="inline-flex items-center gap-2 bg-red-950/80 border border-red-700 rounded-lg px-4 py-1.5 mb-4">
                <span className="text-xs font-black text-red-400">危険度</span>
                <span className="text-sm text-orange-300">{dangerInfo.rank}</span>
                <span className="text-xs font-black px-1.5 py-0.5 rounded text-white"
                  style={{ background: dangerInfo.color }}
                >{dangerInfo.label}</span>
              </div>
            )}
            {/* 初訪問バッジ */}
            <div className="text-xs text-indigo-400 font-bold mb-4">✦ 初めての訪問 ✦</div>
            {/* 閉じるヒント */}
            <div className="text-xs text-gray-600 animate-pulse">タップして続ける</div>
          </div>
        </div>
      )}

      {/* ボス挑戦確認ダイアログ */}
      {showBossConfirm && loc.bossId && ENEMIES[loc.bossId] && (() => {
        const boss = ENEMIES[loc.bossId!]
        const { enemyHpMult } = getDifficultyMultiplier(gs.difficulty)
        const bossHp = Math.floor(boss.hp * enemyHpMult)
        const playerHpPct = gs.playerHp / gs.playerMaxHp
        const aliveParty = gs.party.filter(id => gs.companions[id]?.alive)
        const allUnits = [{ name: gs.playerName, hp: gs.playerHp, maxHp: gs.playerMaxHp }, ...aliveParty.map(id => ({ name: COMPANIONS[id]?.name ?? id, hp: gs.companions[id].hp, maxHp: gs.companions[id].maxHp }))]
        const avgHpPct = allUnits.reduce((s, u) => s + u.hp / u.maxHp, 0) / allUnits.length
        const isLowHp = avgHpPct < 0.5
        return (
          <div className="fixed inset-0 z-[80] flex items-center justify-center" style={{ background: 'rgba(4,4,10,0.92)' }}>
            <div className="relative max-w-sm w-full mx-4 rounded-2xl border-2 border-red-600 bg-gradient-to-b from-red-950 to-[#1a0808] p-6 text-center shadow-2xl" style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="text-xs font-black text-red-500 tracking-widest mb-3">⚠️ BOSS BATTLE 確認</div>
              <div className="text-5xl mb-2" style={{ filter: 'drop-shadow(0 0 20px rgba(255,50,50,0.6))' }}>{boss.emoji}</div>
              <div className="text-xl font-black text-red-200 mb-1">{boss.name}</div>
              <div className="flex justify-center gap-4 text-sm font-black mb-4">
                <span className="text-red-400">HP {bossHp}</span>
                <span className="text-orange-400">ATK {boss.atk}</span>
                <span className="text-blue-400">DEF {boss.def}</span>
              </div>
              <div className="bg-black/40 border border-slate-700 rounded-xl p-3 mb-3 text-left">
                <div className="text-[10px] font-black text-slate-400 mb-2 tracking-widest">現在のパーティ状態</div>
                {allUnits.map((u, i) => {
                  const pct = u.hp / u.maxHp * 100
                  const fill = pct > 50 ? '#4ade80' : pct > 25 ? '#facc15' : '#ef4444'
                  return (
                    <div key={i} className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-gray-300 font-bold w-14 truncate">{u.name}</span>
                      <div className="flex-1 h-2 bg-gray-900 rounded-sm border border-gray-700 overflow-hidden">
                        <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: fill }} />
                      </div>
                      <span className="text-[10px] font-black" style={{ color: fill }}>{u.hp}/{u.maxHp}</span>
                    </div>
                  )
                })}
              </div>
              {isLowHp && (
                <div className="bg-yellow-950/80 border border-yellow-700 rounded-lg px-3 py-2 text-xs text-yellow-300 font-bold mb-3">
                  ⚠️ HP平均 {Math.round(avgHpPct * 100)}%。宿屋での回復を推奨します。
                </div>
              )}
              {loc.sealStone && !gs.sealStones.includes(loc.sealStone) && (
                <div className="bg-amber-950/60 border border-amber-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-bold mb-3">
                  💎 勝利で封印石を入手できます！
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowBossConfirm(false); onFightBoss() }}
                  className="flex-1 py-2.5 bg-red-800 hover:bg-red-700 border-2 border-red-500 text-white font-black rounded-xl transition active:scale-95 text-sm"
                >
                  ⚔️ 挑む！
                </button>
                <button
                  onClick={() => setShowBossConfirm(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-gray-300 font-black rounded-xl transition active:scale-95 text-sm"
                >
                  引き返す
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Header */}
      <div className={`bg-[#0c0c24] border-2 ${typeBorder} rounded-xl p-4`}>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBackToMap}
            className="text-xs font-bold text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 rounded-lg transition"
          >
            ← マップへ
          </button>
          <div>
            <h2 className="text-xl font-black text-white">{loc.emoji} {loc.name}</h2>
            <div className="text-xs text-gray-400 font-bold">{typeLabel}</div>
          </div>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{loc.desc}</p>
      </div>

      {/* プレイヤー独白（仲間なし時）*/}
      {soloLine && (
        <div className="bg-[#0c0c24] border border-slate-700 rounded-xl px-4 py-2.5 flex items-start gap-3">
          <span className="text-2xl shrink-0 mt-0.5">🧑</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 font-bold mb-0.5">{gs.playerName}（心の声）</div>
            <div className="text-sm text-gray-300 italic leading-relaxed">「{soloLine}」</div>
          </div>
        </div>
      )}

      {/* 仲間フレーバーセリフ（PP4スタイル：場所到着コメント）*/}
      {flavorLine && (() => {
        const def = COMPANIONS[flavorLine.speakerId]
        return (
          <div className="bg-[#0c0c24] border border-slate-700 rounded-xl px-4 py-2.5 flex items-start gap-3">
            <div className="shrink-0 rounded-lg overflow-hidden border border-slate-600 mt-0.5">
              <CharPortrait charId={flavorLine.speakerId} size={36} rounded={4} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 font-bold mb-0.5">{def.emoji} {def.name}</div>
              <div className="text-sm text-gray-200 italic leading-relaxed">「{flavorLine.line}」</div>
            </div>
          </div>
        )
      })()}

      {/* 仲間加入UIはイベント(pendingJoin)経由のみ — フルスクリーン演出 */}
      {pendingJoin && (() => {
        const cs = gs.companions[pendingJoin.id]
        const COMPANION_GLOW: Record<string, string> = {
          gares:'#3b82f6', liz:'#ec4899', noa:'#22c55e', cecil:'#a855f7',
          bram:'#f97316', finn:'#06b6d4', vais:'#ef4444', logan:'#a8a29e',
          iris:'#8b5cf6', sig:'#eab308', elk:'#14b8a6', mira:'#10b981', zeno:'#d946ef',
        }
        const glow = COMPANION_GLOW[pendingJoin.id] ?? '#a855f7'
        return (
          <div
            className="fixed inset-0 z-40 flex flex-col"
            style={{ background: '#030608' }}
          >
            {/* キャラクターエリア */}
            <div className="flex-1 relative overflow-hidden flex items-end justify-center">
              <div className="absolute inset-0 pointer-events-none" style={{
                background: `radial-gradient(ellipse 80% 60% at 50% 100%, ${glow}22 0%, transparent 65%)`,
              }} />
              <div className="absolute bottom-0 left-0 right-0" style={{
                height: 1,
                background: `linear-gradient(to right, transparent, ${glow}60, transparent)`,
              }} />
              <div
                className="relative z-10"
                style={{
                  marginBottom: -8,
                  filter: `drop-shadow(0 0 32px ${glow}60) drop-shadow(0 10px 20px rgba(0,0,0,0.9))`,
                }}
              >
                {hasCharPortrait(pendingJoin.id)
                  ? <CharPortraitLarge charId={pendingJoin.id} w={164} h={324} />
                  : (
                    <div className="flex items-end justify-center" style={{ width: 164, height: 200 }}>
                      <span style={{ fontSize: 110, lineHeight: 1 }}>{pendingJoin.emoji}</span>
                    </div>
                  )
                }
              </div>
            </div>

            {/* 情報エリア */}
            <div className="relative z-20 px-3 pb-4 shrink-0">
              {/* 名前タブ */}
              <div className="ml-3 mb-0 flex">
                <div className="px-4 py-1.5 text-sm font-black rounded-t-xl border-t-2 border-x-2"
                  style={{ color: glow, borderColor: glow, background: '#0a0a1a', boxShadow: `0 -6px 16px ${glow}20` }}>
                  {pendingJoin.emoji} {pendingJoin.name} — {pendingJoin.cls}
                </div>
              </div>

              {/* メインボックス */}
              <div className="overflow-hidden border-2 rounded-b-xl rounded-tr-xl"
                style={{ background: 'rgba(2,4,14,0.97)', borderColor: glow, boxShadow: `0 0 40px ${glow}20` }}>

                {/* 加入セリフ */}
                <div className="px-5 py-4">
                  <p className="text-sm text-gray-100 font-bold leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.95)' }}>
                    「{pendingJoin.joinText}」
                  </p>
                </div>

                {/* ステータス */}
                <div className="px-4 pb-3">
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-900/80 rounded-lg px-3 py-2.5 border border-slate-700 mb-3">
                    {[
                      { label: 'HP', value: cs.maxHp, color: '#4ade80' },
                      { label: 'ATK', value: cs.atk, color: '#f87171' },
                      { label: 'DEF', value: cs.def, color: '#60a5fa' },
                      { label: 'SPD', value: cs.spd, color: '#fbbf24' },
                    ].map(stat => (
                      <div key={stat.label} className="text-center">
                        <div className="text-[9px] text-gray-500 font-bold mb-0.5">{stat.label}</div>
                        <div className="text-base font-black" style={{ color: stat.color }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {joinedCount >= 3 && (
                    <div className="text-xs text-amber-400 font-bold mb-2.5 text-center bg-amber-950/50 rounded-lg py-1.5 border border-amber-800">
                      ⚠️ 仲間はすでに3人。これ以上は加入できません。
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => onJoinCompanion(gs.pendingCompanionJoin!)}
                      disabled={joinedCount >= 3}
                      className="flex-1 py-3 font-black text-white rounded-xl transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border-2"
                      style={{ background: `${glow}33`, borderColor: glow, boxShadow: `0 0 16px ${glow}30` }}
                    >
                      ✅ 仲間にする
                    </button>
                    <button
                      onClick={onSkipCompanion}
                      className="px-5 py-3 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-gray-300 font-bold rounded-xl transition active:scale-95"
                    >
                      断る
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 仲間加入UIはイベント(pendingJoin)経由のみ — 自動表示廃止 */}

      {/* ダンジョン危険情報パネル（ボス未討伐時のみ）*/}
      {loc.type === 'dungeon' && !bossDefeated && loc.bossId && ENEMIES[loc.bossId] && (() => {
        const boss = ENEMIES[loc.bossId!]
        const { enemyHpMult } = getDifficultyMultiplier(gs.difficulty)
        const bossHp = Math.floor(boss.hp * enemyHpMult)
        const danger = DUNGEON_DANGER[loc.bossId!]
        return (
          <div className="bg-[#100808] border-2 border-red-900 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-red-900/50" style={{ background: 'rgba(180,0,0,0.12)' }}>
              <span className="text-red-400 text-sm font-black animate-pulse">⚠</span>
              <span className="text-xs font-black text-red-400 tracking-widest">— 危険区域 —</span>
              {danger && (
                <span className="ml-auto text-xs font-black px-2 py-0.5 rounded border border-red-800"
                  style={{ color: danger.color, borderColor: danger.color, background: `${danger.color}18` }}>
                  {danger.label}
                </span>
              )}
            </div>
            <div className="px-4 py-3 flex items-center gap-4">
              <div className="text-4xl" style={{ filter: 'drop-shadow(0 0 8px rgba(255,50,50,0.6))' }}>
                {boss.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-white text-sm">{boss.name}</div>
                {danger && (
                  <div className="text-xs mt-0.5" style={{ color: danger.color }}>{danger.rank}</div>
                )}
                <div className="flex gap-3 mt-1.5">
                  <span className="text-[11px] text-red-300 font-bold">HP {bossHp}</span>
                  <span className="text-[11px] text-orange-300 font-bold">ATK {boss.atk}</span>
                  {loc.sealStone && !sealObtained && (
                    <span className="text-[11px] text-amber-400 font-bold">💎 封印石あり</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Action menu */}
      <div className="bg-[#0c0c24] border-2 border-amber-800 rounded-xl p-3">
        <div className="text-xs font-black text-amber-500 mb-3 tracking-widest">— コマンド —</div>
        <div className="flex flex-col gap-2">

          {onOpenPartyManage && Object.values(gs.companions).some(c => c.joined && c.alive) && (() => {
            const notInParty = Object.values(gs.companions).some(c => c.joined && c.alive && !gs.party.includes(c.id as CompanionId))
            return (
              <button
                onClick={onOpenPartyManage}
                className={`w-full py-3 px-4 rounded-xl transition text-left flex items-center gap-3 active:scale-95 border-2 ${
                  notInParty
                    ? 'bg-purple-900 hover:bg-purple-800 border-purple-500 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                }`}
              >
                <span className="text-xl">👥</span>
                <div>
                  <div className="font-black text-sm">パーティ編成</div>
                  <div className={`text-xs ${notInParty ? 'text-purple-300 font-bold' : 'text-gray-400'}`}>
                    {notInParty ? '⚠️ 未参戦の仲間がいます！メンバーを組み替えよう' : '仲間の組み合わせを変更する'}
                  </div>
                </div>
              </button>
            )
          })()}

          {loc.hasInn && (() => {
            const innPrice = getInnPrice(gs.daysLeft, totalDays)
            const canAfford = gs.gold >= innPrice
            const hpMissing = gs.playerMaxHp - gs.playerHp
            const mpMissing = gs.playerMaxMp - gs.playerMp
            const isFullHp = hpMissing === 0 && mpMissing === 0
            return (
              <button
                onClick={onInn}
                disabled={!canAfford}
                className={`w-full py-3 px-4 border-2 text-white rounded-xl transition text-left flex items-center gap-3 active:scale-95 ${
                  canAfford ? 'bg-blue-950 hover:bg-blue-900 border-blue-700' : 'bg-slate-900 border-slate-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="text-xl">🏨</span>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm">宿屋で休む</div>
                  <div className="text-xs text-gray-400">{innPrice}G・1日消費</div>
                  {!isFullHp && canAfford && (
                    <div className="text-xs text-green-400 font-bold mt-0.5">
                      {hpMissing > 0 && `HP +${hpMissing}`}{hpMissing > 0 && mpMissing > 0 && ' / '}{mpMissing > 0 && `MP +${mpMissing}`}
                    </div>
                  )}
                  {isFullHp && <div className="text-xs text-gray-500 mt-0.5">HP・MP満タン（宿泊不要）</div>}
                  {!canAfford && <div className="text-xs text-red-400 mt-0.5">所持金不足（{innPrice}G必要）</div>}
                </div>
              </button>
            )
          })()}

          {loc.shopItems && (
            <button
              onClick={onOpenShop}
              className="w-full py-3 px-4 bg-green-950 hover:bg-green-900 border-2 border-green-700 text-white rounded-xl transition text-left flex items-center gap-3 active:scale-95"
            >
              <span className="text-xl">🛒</span>
              <div>
                <div className="font-black text-sm">ショップ</div>
                <div className="text-xs text-gray-400">アイテムを購入する</div>
              </div>
            </button>
          )}

          {loc.type === 'dungeon' && !bossDefeated && (
            <>
              {/* パーティ低HP警告 */}
              {(() => {
                const aliveParty = gs.party.filter(id => gs.companions[id].alive)
                const allUnits = [{ hp: gs.playerHp, maxHp: gs.playerMaxHp }, ...aliveParty.map(id => gs.companions[id])]
                const avgHpPct = allUnits.length > 0
                  ? allUnits.reduce((sum, u) => sum + u.hp / u.maxHp, 0) / allUnits.length
                  : 1
                return avgHpPct < 0.5 ? (
                  <div className="bg-yellow-950/80 border border-yellow-700 rounded-lg px-3 py-2 text-xs text-yellow-300 font-bold">
                    ⚠️ HP平均 {Math.round(avgHpPct * 100)}%。宿屋で回復してから挑むと安全です。
                  </div>
                ) : null
              })()}
              <button
                onClick={onEnterDungeon}
                className="w-full py-3 px-4 bg-orange-950 hover:bg-orange-900 border-2 border-orange-700 text-white rounded-xl transition text-left flex items-center gap-3 active:scale-95"
              >
                <span className="text-xl">⚔️</span>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm">ダンジョン探索</div>
                  {loc.enemyPool && loc.enemyPool.length > 0 ? (() => {
                    const pool = loc.enemyPool!
                    const uniqueIds = pool.filter((id, i) => pool.indexOf(id) === i)
                    const enemyEmojis = uniqueIds.slice(0, 3).map(id => ENEMIES[id]?.emoji ?? '👾').join(' ')
                    return (
                      <div className="text-xs text-orange-300 mt-0.5">
                        {enemyEmojis} 出現：{uniqueIds.slice(0, 3).map(id => ENEMIES[id]?.name ?? id).join('・')}
                        {uniqueIds.length > 3 && ' ほか'}
                      </div>
                    )
                  })() : (
                    <div className="text-xs text-gray-400">雑魚敵と戦う（EXP・Gold獲得）</div>
                  )}
                </div>
              </button>
              <button
                onClick={() => setShowBossConfirm(true)}
                className="w-full py-3 px-4 bg-red-950 hover:bg-red-900 border-2 border-red-600 text-white rounded-xl transition text-left flex items-center gap-3 active:scale-95"
              >
                <span className="text-xl">👑</span>
                <div>
                  <div className="font-black text-sm">ボスに挑む！</div>
                  {loc.bossId && ENEMIES[loc.bossId] && (() => {
                    const boss = ENEMIES[loc.bossId!]
                    const { enemyHpMult } = getDifficultyMultiplier(gs.difficulty)
                    const bossHp = Math.floor(boss.hp * enemyHpMult)
                    return (
                      <div className="text-xs text-red-300 font-bold mt-0.5">
                        {boss.emoji} {boss.name} — HP {bossHp} / ATK {boss.atk}
                        {loc.sealStone && !sealObtained && <span className="text-amber-400 ml-2">💎 封印石あり</span>}
                      </div>
                    )
                  })()}
                </div>
              </button>
            </>
          )}

          {loc.type === 'dungeon' && bossDefeated && (
            <>
              <div className="flex gap-2 text-sm">
                <span className="text-green-400 font-black">✅ ボス討伐済み</span>
                {sealObtained && <span className="text-amber-300 font-black">💎 封印石入手済み</span>}
              </div>
              <button
                onClick={onEnterDungeon}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-gray-300 rounded-xl transition text-left flex items-center gap-3 active:scale-95"
              >
                <span className="text-xl">⚔️</span>
                <div>
                  <div className="font-black text-sm">再探索（EXP稼ぎ）</div>
                </div>
              </button>
            </>
          )}

          {(loc.type === 'town' || loc.type === 'relay' || loc.type === 'castle') && onWander && (
            <button
              onClick={onWander}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-white rounded-xl transition text-left flex items-center gap-3 active:scale-95"
            >
              <span className="text-xl">🚶</span>
              <div>
                <div className="font-black text-sm">うろつく</div>
                <div className="text-xs text-gray-400">
                  1日消費・
                  {loc.type === 'town' ? '市場でG発見・訓練・行商人' : loc.type === 'castle' ? '廃墟探索・G発見・訓練' : '野外探索・アイテム発見・回復'}
                </div>
              </div>
            </button>
          )}

          {(loc.type === 'relay' || loc.type === 'castle') && onCampRest && (() => {
            const healable = gs.playerHp < gs.playerMaxHp || gs.playerMp < gs.playerMaxMp || gs.party.some(id => gs.companions[id]?.alive && (gs.companions[id].hp < gs.companions[id].maxHp || gs.companions[id].mp < gs.companions[id].maxMp))
            return (
              <button
                onClick={onCampRest}
                disabled={!healable}
                className={`w-full py-3 px-4 rounded-xl border-2 transition text-left flex items-center gap-3 active:scale-95 ${
                  healable
                    ? 'bg-teal-950 hover:bg-teal-900 border-teal-700 text-white'
                    : 'bg-slate-900 border-slate-700 text-gray-600 opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="text-xl">🏕️</span>
                <div>
                  <div className="font-black text-sm">野営して休む</div>
                  <div className={`text-xs ${healable ? 'text-teal-400' : 'text-gray-600'}`}>
                    {healable ? '無料・日数消費なし・HP 30%・MP 10%回復' : '既にHP・MP満タン'}
                  </div>
                </div>
              </button>
            )
          })()}


          {onOpenAlbum && (
            <button
              onClick={onOpenAlbum}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 text-gray-400 hover:text-white rounded-xl transition text-left flex items-center gap-3 active:scale-95"
            >
              <span className="text-xl">📚</span>
              <div>
                <div className="font-black text-sm text-gray-300">冒険記録</div>
                <div className="text-xs text-gray-600">実績・ボス討伐・旅の統計を確認</div>
              </div>
            </button>
          )}

          {loc.type === 'castle' && (
            gs.sealStones.length < 3 ? (
              <div className="bg-red-950/60 border-2 border-red-800 rounded-xl p-4 text-center">
                <div className="text-red-400 font-black">🔒 封印石が足りない</div>
                <div className="text-sm text-gray-400 mt-1">3つの封印石を全て集めてから挑め（{gs.sealStones.length}/3）</div>
              </div>
            ) : (
              <>
                <div className="bg-red-950/80 border-2 border-red-700 rounded-xl p-3 text-center">
                  <div className="text-red-300 font-black">⚠️ 全ての封印石が揃った！</div>
                </div>
                <button
                  onClick={() => setShowBossConfirm(true)}
                  className="w-full py-4 bg-red-900 hover:bg-red-800 border-2 border-red-500 text-white rounded-xl font-black text-lg text-center animate-pulse transition active:scale-95"
                >
                  👑 終末記録体アーカイブに挑む！
                </button>
              </>
            )
          )}
        </div>
      </div>

      {/* アイテム使用パネル */}
      {onUseItem && gs.inventory.filter(i => i.qty > 0 && ['heal_hp','heal_mp','heal_both'].includes(ITEMS[i.itemId]?.effect ?? '')).length > 0 && (
        <div className="bg-[#0c0c24] border-2 border-teal-800/60 rounded-xl overflow-hidden">
          <button
            onClick={() => setItemPanelOpen(v => !v)}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-teal-950/30 transition"
          >
            <span className="text-lg">🎒</span>
            <div className="flex-1">
              <div className="font-black text-sm text-white">アイテムを使う</div>
              <div className="text-[11px] text-teal-400">HP/MP回復アイテム（戦闘外使用可）</div>
            </div>
            <span className="text-gray-500 text-sm">{itemPanelOpen ? '▲' : '▼'}</span>
          </button>
          {itemPanelOpen && (
            <div className="px-3 pb-3 border-t border-teal-800/40">
              {/* アイテム選択 */}
              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                {gs.inventory.filter(i => i.qty > 0 && ITEMS[i.itemId]).map(slot => {
                  const item = ITEMS[slot.itemId]
                  if (!['heal_hp','heal_mp','heal_both'].includes(item.effect)) return null
                  return (
                    <button
                      key={slot.itemId}
                      onClick={() => setSelectedItemId(selectedItemId === slot.itemId ? null : slot.itemId)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-bold transition ${
                        selectedItemId === slot.itemId
                          ? 'border-teal-400 bg-teal-950 text-white'
                          : 'border-slate-600 bg-slate-900 text-gray-300 hover:border-teal-700'
                      }`}
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <div className="text-left">
                        <div className="flex items-center gap-1">
                          <span>{item.name}</span>
                          <span className="text-gray-500">×{slot.qty}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-normal">{item.desc}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
              {/* ターゲット選択 */}
              {selectedItemId && (
                <div>
                  <div className="text-[11px] text-teal-400 font-black mb-2">▶ 誰に使う？</div>
                  <div className="flex flex-wrap gap-2">
                    {/* プレイヤー */}
                    <button
                      onClick={() => { onUseItem(selectedItemId, 'player'); setSelectedItemId(null); setItemPanelOpen(false) }}
                      className="flex items-center gap-2 bg-indigo-950 border border-indigo-700 rounded-lg px-3 py-2 text-xs font-bold text-white hover:bg-indigo-900 transition active:scale-95"
                    >
                      <span>🧑</span>
                      <div>
                        <div>{gs.playerName}</div>
                        <div className="text-indigo-400">HP {gs.playerHp}/{gs.playerMaxHp}</div>
                      </div>
                    </button>
                    {/* 仲間 */}
                    {gs.party.filter(id => gs.companions[id]?.alive).map(id => {
                      const c = gs.companions[id]
                      const def = COMPANIONS[id]
                      return (
                        <button
                          key={id}
                          onClick={() => { onUseItem(selectedItemId, id); setSelectedItemId(null); setItemPanelOpen(false) }}
                          className="flex items-center gap-2 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 transition active:scale-95"
                        >
                          <CharPortrait charId={id} size={32} rounded={4} />
                          <div>
                            <div>{def.name}</div>
                            <div className="text-gray-400">HP {c.hp}/{c.maxHp}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Party status */}
      {gs.party.length > 0 && (
        <div className="bg-[#0c0c24] border-2 border-slate-700 rounded-xl p-3">
          <div className="text-xs font-black text-slate-400 mb-2 tracking-widest">— 現在のパーティ —</div>
          {gs.party.some(id => gs.companions[id].alive && gs.companions[id].hp < gs.companions[id].maxHp * 0.3) && (
            <div className="text-xs text-yellow-400 font-bold mb-2">⚠️ HPが危険な仲間がいます。宿屋で回復を！</div>
          )}
          <div className="flex flex-wrap gap-2">
            {gs.party.map(id => {
              const c = gs.companions[id]
              const def = COMPANIONS[id]
              if (!c.joined) return null
              const hpPct = (c.hp / c.maxHp) * 100
              const isLowHp = c.alive && hpPct < 30
              return (
                <div key={id} className={`flex items-center gap-2 rounded-lg px-2 py-2 border ${!c.alive ? 'bg-slate-900 border-red-900 opacity-40' : isLowHp ? 'bg-red-950 border-red-700 animate-pulse' : 'bg-slate-800 border-slate-700'}`}>
                  <CharPortrait charId={id} size={40} isDead={!c.alive} rounded={6} />
                  <div>
                    <div className="text-xs font-black text-white">{def.name}</div>
                    <div className="w-16 h-1.5 bg-gray-900 rounded-sm overflow-hidden mt-0.5">
                      <div className={`h-full ${hpPct > 50 ? 'bg-green-600' : hpPct > 25 ? 'bg-yellow-600' : 'bg-red-700'}`} style={{ width: `${hpPct}%` }} />
                    </div>
                    <div className={`text-xs ${isLowHp ? 'text-red-400 font-bold' : 'text-gray-500'}`}>HP {c.hp}/{c.maxHp}</div>
                  </div>
                  {!c.alive && <span className="text-xs text-red-500 font-black">💀永眠</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
