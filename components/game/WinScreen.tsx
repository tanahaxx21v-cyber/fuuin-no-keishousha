'use client'

import { useState } from 'react'
import type { GameState } from '@/lib/game/types'
import { COMPANIONS } from '@/lib/game/data'

interface Props {
  gs: GameState
  onRestart: () => void
}

const EPILOGUE_PAGES = [
  {
    title: '🏆 世界に平和が戻った',
    lines: [
      '終末記録体アーカイブが崩れ落ちた瞬間、砂漠の空に七色の光が走った。',
      '100年もの間、世界を脅かしてきた魔王の呪いが、ついに完全に消え去った。',
      '……ただし、その後の世界はというと。',
      'まあ、相変わらずの騒がしさだった。',
    ],
    bg: 'from-yellow-950 to-gray-950',
    accent: 'text-yellow-300',
  },
  {
    title: '📖 エピローグ ①　王都の人々',
    chars: [
      {
        emoji: '🛡️', name: 'ガレス',
        text: '世界を救った英雄として、「勇者の盾」の称号を授かった。喜ぶかと思いきや、「私は騎士団長であって"盾"ではない」と、授与式で国王に直談判。式が3時間延長になった。今も現役で王都を守っている。',
      },
      {
        emoji: '✨', name: 'リズ',
        text: '王都で癒しの院を開業した。評判を聞きつけた冒険者が後を絶たず、「ちょっと爪が割れた」程度でも押しかけてくる始末。以来、診察料に"英雄話を聞かされた場合の精神的苦痛費"を上乗せしている。',
      },
      {
        emoji: '🏹', name: 'ノア',
        text: '「俺、実はあの旅のキーパーソンだったんだよね」が口癖になり、酒場でだいたい5分で嫌われる。ただし腕前は本物で、今やルミナ最速の弓使いと呼ばれている。本人は「最強って言って」とよく訂正を求める。',
      },
    ],
    bg: 'from-indigo-950 to-gray-950',
    accent: 'text-indigo-300',
  },
  {
    title: '📖 エピローグ ②　研究と酒と剣',
    chars: [
      {
        emoji: '🔮', name: 'セシル',
        text: '旅から帰るなりラボに引きこもり、「魔王復活メカニズムの解明と封印石の理論的考察」を上下巻で出版。ベストセラーになったが、インタビューで毎回「感動しましたか？」と聞かれ、「論文に感動は不要です」と答え続けている。',
      },
      {
        emoji: '🪓', name: 'ブラム',
        text: '冒険後は故郷で居酒屋を開いた。客に旅の武勇伝を語り始めるので滞在時間が平均3時間を超え、近隣の宿屋から大変感謝されている。本人は完全に把握していない。',
      },
      {
        emoji: '⚔️', name: 'フィン',
        text: '見習い剣士の称号を返上するよう周囲に言われ続けているが、「いや、まだまだ修行中ですから」と断り続けている。現在Lv30相当の実力で、それを知らない盗賊が何人も病院送りになった。',
      },
    ],
    bg: 'from-orange-950 to-gray-950',
    accent: 'text-orange-300',
  },
  {
    title: '📖 エピローグ ③　訳ありの人々',
    chars: [
      {
        emoji: '🗡️', name: 'ヴァイス',
        text: '世界を救った後、なぜか元の盗賊稼業に戻った。ただし今は「悪いやつからだけ盗んで貧しいやつに配る」スタイル。いわゆる義賊だが、「俺はただの盗賊だ、美化すんな」と本人は否定している。',
      },
      {
        emoji: '⚒️', name: 'ローガン',
        text: '旅の後に書かれた英雄伝説の登場人物のひとり「寡黙の剣聖」として大人気。本人はファンクラブの存在を3年間知らなかった。知った日に「解散させろ」と言ったが、「それも格好いい！」と会員数が倍になった。',
      },
      {
        emoji: '💜', name: 'イリス',
        text: '魔王軍から正式に脱退届を出そうとしたが、組織自体がとっくに解散していた。拍子抜けしつつ、魔法雑貨屋を開業。魔族仕込みの魔法は強力すぎてたまに店舗が爆発する。近所からの苦情は週3件で安定している。',
      },
    ],
    bg: 'from-purple-950 to-gray-950',
    accent: 'text-purple-300',
  },
  {
    title: '📖 エピローグ ④　遠い地で生きる者たち',
    chars: [
      {
        emoji: '🎩', name: 'シグ',
        text: '英雄の旅に同行した唯一の詐欺師として名高い。帰還後は「本物の勇者が使った剣の破片」を売り始めた。欠片の総量が剣5本分になっても売れているので、本人も「世の中すごいな」と感心している。',
      },
      {
        emoji: '🐺', name: 'エルク',
        text: '旅の後、竜の峠に戻って静かに暮らす予定だったが、「封印の旅ゆかりの峠」として観光地化が進み、毎日20人以上の観光客が来るようになった。案内役として雇われ、今や峠一番の有名人である。本人は複雑な顔をしている。',
      },
      {
        emoji: '🌿', name: 'ミラ',
        text: '古代神殿に戻ったところ、聖地として開放された神殿に毎日観光客が押し寄せるようになっていた。「ここは神聖な場所です」と入口で300日以上伝え続けているが、一向に伝わっていない。隣に土産物屋が建った日は3日間ため息をついた。',
      },
    ],
    bg: 'from-green-950 to-gray-950',
    accent: 'text-green-300',
  },
  {
    title: '📖 エピローグ ⑤　謎の魔族と、そして勇者',
    chars: [
      {
        emoji: '😈', name: 'ゼノ（隠しキャラ）',
        text: '決戦の翌日、一言も言わずに姿を消した。その後ルミナ各地で「見知らぬ魔族に助けられた」という報告が相次いでいる。「私が助けたのではない。ただそこにいただけだ」——その声を聞いた者だけが、あの日の仲間だと気づく。',
        isHidden: true,
      },
    ],
    extra: (playerName: string) => [
      `そして勇者 ${playerName} は——`,
      '特に何かになるわけでもなく、また気づけば旅に出ていた。',
      '「次の封印石はもう存在しない」と周りは言う。',
      '本人は「それとこれとは別の話だ」と笑う。',
      '英雄とは、なにかを成し遂げた者ではなく、なにかを続けられる者のことを言うのかもしれない。',
    ],
    bg: 'from-slate-950 to-gray-950',
    accent: 'text-slate-300',
  },
]

const NAME_TO_ID: Record<string, string> = {
  'ガレス': 'gares', 'リズ': 'liz', 'ノア': 'noa', 'セシル': 'cecil',
  'ブラム': 'bram', 'フィン': 'finn', 'ヴァイス': 'vais', 'ローガン': 'logan',
  'イリス': 'iris', 'シグ': 'sig', 'エルク': 'elk', 'ミラ': 'mira', 'ゼノ（隠しキャラ）': 'zeno',
}

const COMPANION_MEMORIAL: Record<string, string> = {
  gares: '「守る」と誓った騎士の魂は、永遠に君と共にある。',
  liz: '神に仕えた神官の祈りが、今も空のどこかに響いている。',
  noa: '弓の弦に触れるたびに、あの笑顔を思い出すだろう。',
  cecil: '理論の果てに夢見た理想は、誰かが引き継いでくれる。',
  bram: '最後まで「もっと戦いたい」と思っていたに違いない。',
  finn: '見習いのまま倒れたが、その志は本物だった。',
  vais: '盗賊の生き様を最後まで貫いた。悔いはないはずだ。',
  logan: '執行人の鎖から解き放たれた魂が、今は静かに眠っている。',
  iris: '魔族と人間の間で揺れ続けた心が、ようやく安らいでいる。',
  sig: '「借りは来世で返す」と笑っていた。次は必ず返してもらおう。',
  elk: '獣の誇りを胸に散った槍使いの勇姿を、忘れないだろう。',
  mira: '風の精霊がエルフの魂を、故郷の森へ連れ帰ってくれるはずだ。',
  zeno: '謎多き魔族が最後に選んだのは、人間と共に戦うことだった。',
}

function getClearRank(daysLeft: number): { rank: string; color: string; label: string } {
  if (daysLeft >= 90) return { rank: 'SS', color: 'text-yellow-300', label: '完璧な封印！' }
  if (daysLeft >= 70) return { rank: 'S', color: 'text-yellow-400', label: '見事な勝利！' }
  if (daysLeft >= 50) return { rank: 'A', color: 'text-green-400', label: '余裕のクリア' }
  if (daysLeft >= 30) return { rank: 'B', color: 'text-blue-400', label: 'ギリギリ封印成功' }
  return { rank: 'C', color: 'text-gray-400', label: '崖っぷちの勝利' }
}

export default function WinScreen({ gs, onRestart }: Props) {
  const [page, setPage] = useState(0)
  const joinedCompanions = Object.values(gs.companions).filter(c => c.joined && c.alive)
  const deadCompanions = Object.values(gs.companions).filter(c => c.joined && !c.alive)
  const hasZeno = gs.companions.zeno?.joined
  const rank = getClearRank(gs.daysLeft)

  const isCompanionDead = (name: string) => {
    const id = NAME_TO_ID[name]
    if (!id) return false
    const c = gs.companions[id as keyof typeof gs.companions]
    return c?.joined && !c?.alive
  }

  const totalPages = EPILOGUE_PAGES.length + 1 // +1 for stats page

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">

        {/* STATS PAGE (last) */}
        {page === totalPages - 1 ? (
          <div className="text-center">
            <div className="text-5xl mb-3">🏆</div>
            <h1 className="text-3xl font-bold text-yellow-300 mb-1">クリア！</h1>
            <p className="text-gray-400 text-sm mb-5">残り{gs.daysLeft}日で封印の継承者となった</p>

            {/* クリアランク */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-3 flex items-center gap-4">
              <div className="text-center shrink-0">
                <div className={`text-5xl font-black ${rank.color}`} style={{ textShadow: '0 0 20px currentColor' }}>{rank.rank}</div>
                <div className="text-xs text-gray-500 mt-0.5">{rank.label}</div>
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs text-gray-400 mb-1">クリア評価基準（残り日数）</div>
                {[
                  { r: 'SS', d: '90日以上', c: 'text-yellow-300' },
                  { r: 'S', d: '70日以上', c: 'text-yellow-400' },
                  { r: 'A', d: '50日以上', c: 'text-green-400' },
                  { r: 'B', d: '30日以上', c: 'text-blue-400' },
                  { r: 'C', d: '30日未満', c: 'text-gray-400' },
                ].map(({ r, d, c }) => (
                  <div key={r} className={`text-xs flex gap-2 ${r === rank.rank ? c + ' font-black' : 'text-gray-600'}`}>
                    <span className="w-5">{r}</span><span>{d}</span>
                    {r === rank.rank && <span>← 今回</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4 text-left">
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider">クリア記録</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-400">最終レベル: </span><span className="text-white font-bold">Lv{gs.playerLevel}</span></div>
                <div><span className="text-gray-400">残り日数: </span><span className="text-yellow-300 font-bold">{gs.daysLeft}日</span></div>
                <div><span className="text-gray-400">所持金: </span><span className="text-yellow-400 font-bold">{gs.gold}G</span></div>
                <div><span className="text-gray-400">難易度: </span><span className="text-white font-bold">{{ easy: 'イージー', normal: 'ノーマル', hard: 'ハード' }[gs.difficulty] ?? gs.difficulty}</span></div>
                <div><span className="text-gray-400">訪問拠点: </span><span className="text-cyan-400 font-bold">{gs.visitedLocs.length}/21</span></div>
                <div><span className="text-gray-400">体験イベント: </span><span className="text-purple-400 font-bold">{gs.completedEvents.length}件</span></div>
                <div><span className="text-gray-400">倒したボス: </span><span className="text-red-400 font-bold">{gs.defeatedBosses.length}/6体</span></div>
                <div><span className="text-gray-400">最終HP: </span><span className="text-green-400 font-bold">{gs.playerHp}/{gs.playerMaxHp}</span></div>
              </div>
            </div>

            <div className="flex justify-center gap-3 mb-4">
              {['🔥 炎', '⚡ 嵐', '🌑 闇'].map(s => (
                <div key={s} className="text-sm text-yellow-300 bg-yellow-900/30 border border-yellow-800 px-3 py-1 rounded-full">✅ {s}の封印石</div>
              ))}
            </div>

            {joinedCompanions.length > 0 && (
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 mb-3 text-left">
                <div className="text-xs text-green-400 mb-2">共に戦った仲間 ({joinedCompanions.length}人)</div>
                <div className="flex flex-col gap-1.5">
                  {joinedCompanions.map(c => {
                    const def = COMPANIONS[c.id]
                    return (
                      <div key={c.id} className="flex items-center gap-2">
                        <span className="text-lg">{def.emoji}</span>
                        <span className="text-sm text-white font-bold flex-1">{def.name}</span>
                        <span className="text-xs text-gray-400">{def.cls}</span>
                        <span className="text-xs text-purple-400 font-black">Lv{c.level}</span>
                        <div className="text-xs text-gray-500">ATK{c.atk} DEF{c.def}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            {deadCompanions.length > 0 && (
              <div className="bg-gray-900/50 border border-red-900/60 rounded-xl p-3 mb-3 text-left">
                <div className="text-xs text-red-400 mb-2">冒険で命を落とした仲間 ({deadCompanions.length}人)</div>
                <div className="flex flex-col gap-2">
                  {deadCompanions.map(c => {
                    const def = COMPANIONS[c.id]
                    const memorial = COMPANION_MEMORIAL[c.id]
                    return (
                      <div key={c.id} className="bg-red-950/20 border border-red-900/40 rounded-lg px-3 py-2">
                        <div className="text-sm text-gray-500 line-through font-bold mb-0.5">
                          {def.emoji} {def.name} <span className="text-gray-600">Lv{c.level}</span>
                        </div>
                        {memorial && (
                          <div className="text-xs text-gray-600 italic">{memorial}</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 実績（動的計算） */}
            {(() => {
              const ACHIEVEMENT_DEFS = [
                { icon: '🤝', title: '最初の出会い',  check: (g: GameState) => Object.values(g.companions).some(c => c.joined) },
                { icon: '👥', title: '完全パーティ',  check: (g: GameState) => g.party.length >= 3 },
                { icon: '⚔️', title: '初討伐',        check: (g: GameState) => g.defeatedBosses.length >= 1 },
                { icon: '🏹', title: '討伐者',        check: (g: GameState) => g.defeatedBosses.length >= 3 },
                { icon: '💎', title: '封印の欠片',    check: (g: GameState) => g.sealStones.length >= 1 },
                { icon: '✨', title: '三石揃いし者',  check: (g: GameState) => g.sealStones.length >= 3 },
                { icon: '🧭', title: '旅人',          check: (g: GameState) => g.visitedLocs.length >= 10 },
                { icon: '🗺️', title: '冒険家',        check: (g: GameState) => g.visitedLocs.length >= 15 },
                { icon: '📖', title: '語り部',        check: (g: GameState) => g.completedEvents.length >= 30 },
                { icon: '🌟', title: '覚醒の勇者',   check: (g: GameState) => g.playerLevel >= 20 },
                { icon: '💰', title: '商売人',        check: (g: GameState) => g.gold >= 500 },
                { icon: '😈', title: '謎の魔族の絆', check: (g: GameState) => g.companions.zeno?.joined === true },
              ]
              const unlocked = ACHIEVEMENT_DEFS.filter(a => a.check(gs))
              if (unlocked.length === 0) return null
              return (
                <div className="bg-amber-950/60 border-2 border-amber-700 rounded-xl p-3 mb-3 text-left">
                  <div className="text-xs font-black text-amber-500 mb-2 tracking-widest">— 実績解除 {unlocked.length}/{ACHIEVEMENT_DEFS.length} —</div>
                  <div className="flex flex-wrap gap-1.5">
                    {unlocked.map((a, i) => (
                      <div key={i} className="flex items-center gap-1 bg-amber-900/40 border border-amber-700/50 rounded-lg px-2 py-1">
                        <span>{a.icon}</span>
                        <span className="text-xs font-bold text-amber-200">{a.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setPage(p => p - 1)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition text-sm"
              >
                ← 戻る
              </button>
              <button
                onClick={onRestart}
                className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl transition"
              >
                もう一度プレイ
              </button>
            </div>
          </div>
        ) : (
          /* EPILOGUE PAGES */
          (() => {
            const ep = EPILOGUE_PAGES[page]
            return (
              <div className={`bg-gradient-to-b ${ep.bg} rounded-2xl p-6 border border-gray-800 shadow-2xl`}>
                <div className="text-xs text-gray-500 mb-2 tracking-wider uppercase">エピローグ {page + 1} / {EPILOGUE_PAGES.length}</div>
                <h2 className={`text-xl font-bold ${ep.accent} mb-4`}>{ep.title}</h2>

                {/* Intro text (page 0) */}
                {'lines' in ep && ep.lines && (
                  <div className="space-y-3 mb-6">
                    {ep.lines.map((line, i) => (
                      <p key={i} className="text-gray-300 leading-relaxed text-sm">{line}</p>
                    ))}
                  </div>
                )}

                {/* Character epilogues */}
                {'chars' in ep && ep.chars && (
                  <div className="space-y-4 mb-4">
                    {ep.chars.map((ch) => {
                      // ゼノ: only show if player recruited him
                      if ('isHidden' in ch && ch.isHidden && !hasZeno) {
                        return (
                          <div key={ch.name} className="bg-black/30 border border-gray-700/50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl opacity-30">😈</span>
                              <span className="text-gray-600 font-semibold text-sm">??? — 謎の魔族</span>
                            </div>
                            <p className="text-gray-600 text-xs italic">「この者の消息は不明だ。」</p>
                          </div>
                        )
                      }
                      const dead = isCompanionDead(ch.name)
                      return (
                        <div key={ch.name} className={`bg-black/30 border rounded-xl p-4 ${dead ? 'border-red-900/60' : 'border-gray-700'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xl ${dead ? 'grayscale opacity-60' : ''}`}>{ch.emoji}</span>
                            <span className={`${dead ? 'text-gray-500' : ep.accent} font-semibold text-sm`}>{ch.name}</span>
                            {dead && <span className="text-xs text-red-700 font-bold ml-auto">💀 この旅で命を落とした</span>}
                          </div>
                          <p className={`text-sm leading-relaxed ${dead ? 'text-gray-600 italic' : 'text-gray-300'}`}>{ch.text}</p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Extra text (last epilogue page) */}
                {'extra' in ep && ep.extra && (
                  <div className="mt-4 space-y-2 border-t border-gray-700/50 pt-4">
                    {(() => {
                      const extraLines = ep.extra(gs.playerName)
                      return extraLines.map((line, i) => (
                        <p key={i} className={`text-sm leading-relaxed ${i === 0 ? 'text-gray-200 font-semibold' : i === extraLines.length - 1 ? 'text-gray-400 italic' : 'text-gray-300'}`}>{line}</p>
                      ))
                    })()}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3 mt-6">
                  {page > 0 && (
                    <button
                      onClick={() => setPage(p => p - 1)}
                      className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition text-sm"
                    >
                      ← 戻る
                    </button>
                  )}
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="flex-1 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-semibold rounded-xl transition text-sm"
                  >
                    {page === EPILOGUE_PAGES.length - 1 ? '📊 クリア記録を見る' : '次へ →'}
                  </button>
                </div>
              </div>
            )
          })()
        )}
      </div>
    </div>
  )
}
