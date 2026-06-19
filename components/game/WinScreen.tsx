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

export default function WinScreen({ gs, onRestart }: Props) {
  const [page, setPage] = useState(0)
  const joinedCompanions = Object.values(gs.companions).filter(c => c.joined && c.alive)
  const deadCompanions = Object.values(gs.companions).filter(c => c.joined && !c.alive)
  const hasZeno = gs.companions.zeno?.joined

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

            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4 text-left">
              <div className="text-xs text-gray-400 mb-3 uppercase tracking-wider">クリア記録</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-400">最終レベル: </span><span className="text-white font-bold">Lv{gs.playerLevel}</span></div>
                <div><span className="text-gray-400">残り日数: </span><span className="text-yellow-300 font-bold">{gs.daysLeft}日</span></div>
                <div><span className="text-gray-400">所持金: </span><span className="text-yellow-400 font-bold">{gs.gold}G</span></div>
                <div><span className="text-gray-400">難易度: </span><span className="text-white font-bold">{{ easy: 'イージー', normal: 'ノーマル', hard: 'ハード' }[gs.difficulty] ?? gs.difficulty}</span></div>
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
                <div className="flex flex-wrap gap-2">
                  {joinedCompanions.map(c => (
                    <span key={c.id} className="text-sm text-white">{COMPANIONS[c.id].emoji} {COMPANIONS[c.id].name}</span>
                  ))}
                </div>
              </div>
            )}
            {deadCompanions.length > 0 && (
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-3 mb-3 text-left">
                <div className="text-xs text-red-400 mb-2">冒険で命を落とした仲間 ({deadCompanions.length}人)</div>
                <div className="flex flex-wrap gap-2">
                  {deadCompanions.map(c => (
                    <span key={c.id} className="text-sm text-gray-500 line-through">{COMPANIONS[c.id].emoji} {COMPANIONS[c.id].name}</span>
                  ))}
                </div>
              </div>
            )}

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
                    {ep.extra(gs.playerName).map((line, i) => (
                      <p key={i} className={`text-sm leading-relaxed ${i === 0 ? 'text-gray-200 font-semibold' : i === ep.extra(gs.playerName).length - 1 ? 'text-gray-400 italic' : 'text-gray-300'}`}>{line}</p>
                    ))}
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
