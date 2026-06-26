'use client'

import type { GameState } from '@/lib/game/types'
import { COMPANIONS } from '@/lib/game/data'

interface Props {
  gs: GameState
  onRestart: () => void
}

const BOSS_NAMES: Record<string, string> = {
  bandit_king: '🗡️ 盗賊王カルド',
  mine_king: '💎 鉱王グラドル',
  storm_dragon: '🌩️ 嵐竜ストームレックス',
  forest_king: '🦌 森王モルガ',
  tidal_king: '🐳 潮王ネブラ',
  archive: '📚 終末記録体アーカイブ',
}

const SEAL_NAMES: Record<string, string> = {
  fire: '🔥 炎の封印石',
  storm: '⚡ 嵐の封印石',
  dark: '🌑 闇の封印石',
}

// 死亡した仲間への追悼コメント（PP4スタイル）
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

function getGameOverMessage(gs: GameState): { heading: string; body: string } {
  const bossCount = (gs.defeatedBosses ?? []).length
  const isTimeout = gs.daysLeft <= 0

  if (isTimeout && bossCount === 0) {
    return { heading: '……何も成し遂げられなかった', body: '旅立ったばかりの勇者に、時間が容赦しなかった。' }
  }
  if (isTimeout && gs.sealStones.length >= 2) {
    return { heading: 'あと一歩……だったのに', body: '封印石は揃いかけていた。しかし運命は残酷だった。' }
  }
  if (isTimeout && bossCount >= 1) {
    return { heading: '時が……尽きた', body: '確かな歩みがあった。しかし、それでも届かなかった。' }
  }
  if (isTimeout) {
    return { heading: '時間が……足りなかった', body: '残り日数ゼロ。魔王の封印を完成させることができなかった。' }
  }
  if (bossCount >= 3) {
    return { heading: '最後の壁を越えられなかった', body: '封印石は全て揃っていた。だが、最後の一戦で力尽きた。' }
  }
  if (gs.daysLeft <= 10) {
    return { heading: '崖っぷちで……倒れた', body: '残り僅かな日数の中で、精一杯戦った。それは確かだ。' }
  }
  return { heading: '力……尽きた', body: '旅はここで終わった。しかし、立ち上がった勇気は消えない。' }
}

export default function GameOverScreen({ gs, onRestart }: Props) {
  const { heading, body } = getGameOverMessage(gs)
  const joinedCompanions = Object.values(gs.companions).filter(c => c.joined && c.alive)
  const deadCompanions = Object.values(gs.companions).filter(c => c.joined && !c.alive)
  const defeatedBosses = (gs.defeatedBosses ?? []).filter(id => BOSS_NAMES[id])

  return (
    <div className="min-h-screen bg-[#07071a] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">

        <div className="border-2 border-red-900 px-6 py-5 mb-4 text-center" style={{ background: '#0a0202' }}>
          <div className="text-2xl mb-2">💀</div>
          <h1 className="text-2xl font-black text-red-500 tracking-wider">GAME OVER</h1>
        </div>
        <div className="text-base font-black text-red-300 mb-1">{heading}</div>
        <p className="text-gray-500 mb-4 text-sm font-bold">{body}</p>

        {/* 基本記録 */}
        <div className="bg-[#0c0c24] border-2 border-red-900 p-4 mb-3 text-left">
          <div className="text-xs font-black text-red-400 mb-3 tracking-widest">— 記録 —</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 font-bold">最終レベル</span>
              <div className="text-white font-black text-lg">Lv{gs.playerLevel}</div>
            </div>
            <div>
              <span className="text-gray-500 font-bold">残り日数</span>
              <div className="text-red-400 font-black text-lg">{gs.daysLeft}日</div>
            </div>
            <div>
              <span className="text-gray-500 font-bold">所持金</span>
              <div className="text-amber-300 font-black text-lg">{gs.gold}G</div>
            </div>
            <div>
              <span className="text-gray-500 font-bold">難易度</span>
              <div className="text-white font-black text-lg">{{ easy: 'イージー', normal: 'ノーマル', hard: 'ハード' }[gs.difficulty] ?? gs.difficulty}</div>
            </div>
          </div>
        </div>

        {/* 封印石 */}
        <div className="bg-[#0c0c24] border-2 border-red-900 p-4 mb-3 text-left">
          <div className="text-xs font-black text-red-400 mb-2 tracking-widest">— 封印石 {gs.sealStones.length}/3 —</div>
          <div className="flex gap-2 flex-wrap">
            {(['fire', 'storm', 'dark'] as const).map(stone => (
              <div key={stone} className={`text-xs font-bold px-3 py-1 border ${
                gs.sealStones.includes(stone)
                  ? 'border-amber-600 bg-amber-950 text-amber-300'
                  : 'border-gray-700 bg-gray-900 text-gray-600'
              }`}>
                {gs.sealStones.includes(stone) ? '✅' : '✗'} {SEAL_NAMES[stone]}
              </div>
            ))}
          </div>
        </div>

        {/* 討伐ボス */}
        {defeatedBosses.length > 0 && (
          <div className="bg-[#0c0c24] border-2 border-red-900 p-4 mb-3 text-left">
            <div className="text-xs font-black text-red-400 mb-2 tracking-widest">— 討伐したボス ({defeatedBosses.length}体) —</div>
            <div className="flex flex-col gap-1">
              {defeatedBosses.map(id => (
                <div key={id} className="text-sm text-gray-300 font-bold">👑 {BOSS_NAMES[id]}</div>
              ))}
            </div>
          </div>
        )}

        {/* 仲間 */}
        {(joinedCompanions.length > 0 || deadCompanions.length > 0) && (
          <div className="bg-[#0c0c24] border-2 border-red-900 p-4 mb-4 text-left">
            <div className="text-xs font-black text-red-400 mb-2 tracking-widest">— 仲間 —</div>
            {joinedCompanions.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-green-400 font-bold mb-1">生き残った仲間</div>
                <div className="flex flex-wrap gap-2">
                  {joinedCompanions.map(c => (
                    <span key={c.id} className="text-sm text-white font-bold">
                      {COMPANIONS[c.id]?.emoji} {COMPANIONS[c.id]?.name} <span className="text-purple-400">Lv{c.level}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {deadCompanions.length > 0 && (
              <div>
                <div className="text-xs text-red-400 font-bold mb-2">命を落とした仲間</div>
                <div className="flex flex-col gap-2">
                  {deadCompanions.map(c => {
                    const def = COMPANIONS[c.id]
                    const memorial = COMPANION_MEMORIAL[c.id]
                    return (
                      <div key={c.id} className="bg-red-950 border border-red-900 px-3 py-2">
                        <div className="text-sm text-gray-500 line-through font-bold mb-0.5">
                          {def?.emoji} {def?.name} <span className="text-gray-600">Lv{c.level}</span>
                        </div>
                        {memorial && (
                          <div className="text-xs text-gray-600">{memorial}</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onRestart}
          className="w-full py-4 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-white font-black text-xl transition"
        >
          タイトルへ戻る
        </button>
      </div>
    </div>
  )
}
