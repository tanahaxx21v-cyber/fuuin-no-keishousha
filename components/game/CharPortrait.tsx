// キャラクタースプライト: characters.jpg (1988×1194px, 7列×2行)
const CHAR_ORIG_W = 1988
const CHAR_ORIG_H = 1194
const CHAR_COLS = 7
const CHAR_TITLE_PX = 70
const CHAR_ROW_PX = 562

const CHAR_GRID: Record<string, { col: number; row: number }> = {
  player: { col: 0, row: 0 },
  gares:  { col: 1, row: 0 },
  liz:    { col: 2, row: 0 },
  noa:    { col: 3, row: 0 },
  cecil:  { col: 4, row: 0 },
  bram:   { col: 5, row: 0 },
  finn:   { col: 6, row: 0 },
  vais:   { col: 0, row: 1 },
  logan:  { col: 1, row: 1 },
  iris:   { col: 2, row: 1 },
  sig:    { col: 3, row: 1 },
  elk:    { col: 4, row: 1 },
  mira:   { col: 5, row: 1 },
  zeno:   { col: 6, row: 1 },
}

function calcPortraitBgPos(col: number, row: number, size: number) {
  const scale = (CHAR_COLS * size) / CHAR_ORIG_W
  const bgH = CHAR_ORIG_H * scale
  const scrollW = CHAR_COLS * size - size
  const scrollH = bgH - size
  const bgPosX = scrollW > 0 ? `${(col * size / scrollW) * 100}%` : '0%'
  const targetY = (CHAR_TITLE_PX + row * CHAR_ROW_PX) * scale
  const bgPosY = scrollH > 0 ? `${Math.min(100, (targetY / scrollH) * 100)}%` : '0%'
  return { bgPosX, bgPosY }
}

// 縦長ポートレート用（w×h 矩形、キャラクター全身表示用）
function calcPortraitBgPosRect(col: number, row: number, w: number, h: number) {
  const bgW = CHAR_COLS * w
  const bgH = (CHAR_ORIG_H / CHAR_ORIG_W) * bgW
  const scrollW = bgW - w
  const scrollH = bgH - h
  const bgPosX = scrollW > 0 ? `${(col * w / scrollW) * 100}%` : '0%'
  const targetY = (CHAR_TITLE_PX + row * CHAR_ROW_PX) * (bgW / CHAR_ORIG_W)
  const bgPosY = scrollH > 0 ? `${Math.min(100, (targetY / scrollH) * 100)}%` : '0%'
  return { bgPosX, bgPosY }
}

export function CharPortrait({ charId, size, isActive = false, isDead = false, rounded = 0 }: {
  charId: string
  size: number
  isActive?: boolean
  isDead?: boolean
  rounded?: number
}) {
  const pos = CHAR_GRID[charId] ?? { col: 0, row: 0 }
  const { bgPosX, bgPosY } = calcPortraitBgPos(pos.col, pos.row, size)

  return (
    <div
      className={isDead ? 'opacity-30' : ''}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: rounded,
        border: isActive
          ? '2px solid #ffd700'
          : isDead
          ? '2px solid #7a2020'
          : '1px solid #2a2a3a',
        filter: isDead ? 'grayscale(80%)' : 'none',
        backgroundImage: `url('/fuuin-no-keishousha/images/characters.jpg')`,
        backgroundSize: `${CHAR_COLS * 100}% auto`,
        backgroundPosition: `${bgPosX} ${bgPosY}`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    />
  )
}

// PP4スタイル会話シーン用縦長ポートレート（160×320でキャラ全身表示）
export function CharPortraitLarge({ charId, w = 160, h = 320 }: {
  charId: string
  w?: number
  h?: number
}) {
  const pos = CHAR_GRID[charId] ?? { col: 0, row: 0 }
  const { bgPosX, bgPosY } = calcPortraitBgPosRect(pos.col, pos.row, w, h)
  return (
    <div
      style={{
        width: w,
        height: h,
        flexShrink: 0,
        backgroundImage: `url('/fuuin-no-keishousha/images/characters.jpg')`,
        backgroundSize: `${CHAR_COLS * 100}% auto`,
        backgroundPosition: `${bgPosX} ${bgPosY}`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    />
  )
}

export function hasCharPortrait(charId: string): boolean {
  return charId in CHAR_GRID
}
