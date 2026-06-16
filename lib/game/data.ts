import type { CompanionDef, EnemyDef, ItemDef, LocationDef, Skill, CompanionId, LocationId } from './types'

// ===== PLAYER SKILLS (レオン) =====
export const PLAYER_SKILLS: Skill[] = [
  {
    id: 'hero_slash',
    name: '勇者斬り',
    desc: '正義の力が宿る一撃。敵1体に強力なダメージ。',
    mpCost: 10, target: 'enemy_one', effect: 'damage', power: 2.2,
  },
  {
    id: 'rally',
    name: '鼓舞',
    desc: '仲間を鼓舞し、味方全体の攻撃力を上昇させる。',
    mpCost: 8, target: 'ally_all', effect: 'atk_up', power: 1,
  },
  {
    id: 'protect',
    name: '守護の誓い',
    desc: '味方1体を守る。対象の防御力を大幅に上昇。',
    mpCost: 10, target: 'ally_one', effect: 'def_up', power: 1,
  },
  {
    id: 'seal_release',
    name: '封印解放',
    desc: '封印石の力を解放する。ボス戦で絶大なダメージ。',
    mpCost: 20, target: 'enemy_one', effect: 'boss_bonus', power: 3.5,
  },
]

// ===== COMPANIONS (13人) =====
export const COMPANIONS: Record<CompanionId, CompanionDef> = {
  gares: {
    id: 'gares', name: 'ガレス', cls: '騎士', emoji: '🛡️',
    desc: '王都の騎士団長を務めていた。誇り高く真面目で面倒見が良い。',
    joinLocId: 'alseria',
    joinText: '「レオン殿。私ガレスが剣と盾で貴殿を守ろう。騎士の誇りにかけて。」',
    baseHp: 130, baseMp: 25, baseAtk: 14, baseDef: 20, baseSpd: 6, joinLevel: 2,
    skills: [
      { id: 'shield_bash', name: '盾撃', desc: '盾で敵をスタンさせる。', mpCost: 6, target: 'enemy_one', effect: 'stun', power: 1.2 },
      { id: 'iron_wall', name: '鉄壁', desc: '自分の防御力を大幅に上昇させる。', mpCost: 8, target: 'self', effect: 'def_up', power: 1 },
    ],
  },
  liz: {
    id: 'liz', name: 'リズ', cls: '神官', emoji: '✨',
    desc: '優しく穏やかな性格。信仰心が厚く、仲間の支えとなる存在。',
    joinLocId: 'alseria',
    joinText: '「神様の導きがあなたをここへ連れてきた。私の癒しの力、お役に立てれば。」',
    baseHp: 65, baseMp: 95, baseAtk: 9, baseDef: 9, baseSpd: 9, joinLevel: 2,
    skills: [
      { id: 'heal', name: '癒し', desc: '味方1体のHPを50回復する。', mpCost: 6, target: 'ally_one', effect: 'heal', power: 50 },
      { id: 'holy_light', name: '聖なる光', desc: '味方全体のHPを25回復。', mpCost: 14, target: 'ally_all', effect: 'heal', power: 25 },
    ],
  },
  noa: {
    id: 'noa', name: 'ノア', cls: '弓使い', emoji: '🏹',
    desc: '明るく快活な性格。遠距離攻撃が得意で、行動も俊敏。',
    joinLocId: 'bern',
    joinText: '「俺、この旅に参加したい！遠くの敵はぜんぶ俺に任せといて！」',
    baseHp: 75, baseMp: 35, baseAtk: 17, baseDef: 8, baseSpd: 15, joinLevel: 3,
    skills: [
      { id: 'rapid_shot', name: '連射', desc: '敵1体に矢を連続で射る。', mpCost: 7, target: 'enemy_one', effect: 'damage', power: 1.9 },
      { id: 'scatter', name: '散弾', desc: '敵全体に矢の雨を降らせる。', mpCost: 10, target: 'enemy_all', effect: 'damage', power: 1.2 },
    ],
  },
  cecil: {
    id: 'cecil', name: 'セシル', cls: '魔法使い', emoji: '🔮',
    desc: '知的でクール。魔法の扱いに長け、我が道を行くタイプ。',
    joinLocId: 'galdo',
    joinText: '「……封印石か。理論的には可能。私が同行すれば成功率が上がる。それだけよ。」',
    baseHp: 60, baseMp: 85, baseAtk: 22, baseDef: 6, baseSpd: 12, joinLevel: 4,
    skills: [
      { id: 'fireball', name: '炎球', desc: '炎の球で敵全体を焼き払う。', mpCost: 12, target: 'enemy_all', effect: 'damage', power: 1.4 },
      { id: 'thunder', name: '雷撃', desc: '雷を1体に集中させる。', mpCost: 10, target: 'enemy_one', effect: 'damage', power: 2.5 },
    ],
  },
  bram: {
    id: 'bram', name: 'ブラム', cls: '戦士', emoji: '🪓',
    desc: '豪快で頼れる兄貴分。戦いの経験が豊富で、力仕事はお手の物。',
    joinLocId: 'elna',
    joinText: '「ガッハッハ！面白え旅じゃねえか！俺も連れてけ。この斧、貸してやるぜ！」',
    baseHp: 115, baseMp: 25, baseAtk: 23, baseDef: 14, baseSpd: 8, joinLevel: 3,
    skills: [
      { id: 'axe_swing', name: '大斧振り', desc: '大斧で敵全体を薙ぎ払う。', mpCost: 8, target: 'enemy_all', effect: 'damage', power: 1.3 },
      { id: 'earth_crush', name: '大地砕き', desc: '地面を叩き割る超重撃。', mpCost: 12, target: 'enemy_one', effect: 'damage', power: 2.8 },
    ],
  },
  finn: {
    id: 'finn', name: 'フィン', cls: '見習い剣士', emoji: '⚔️',
    desc: '元気いっぱいの熱血少年。いつか立派な冒険者になるのが夢。',
    joinLocId: 'riverside',
    joinText: '「お、お兄さん！冒険者ですよね？俺も連れてってください！絶対役に立ちます！」',
    baseHp: 70, baseMp: 30, baseAtk: 13, baseDef: 11, baseSpd: 12, joinLevel: 2,
    skills: [
      { id: 'young_slash', name: '若き剣閃', desc: '気合いの一撃。成長中の力が宿る。', mpCost: 6, target: 'enemy_one', effect: 'damage', power: 1.6 },
      { id: 'guts', name: '根性', desc: '気力で自分を奮い立たせ攻撃力UP。', mpCost: 5, target: 'self', effect: 'atk_up', power: 1 },
    ],
  },
  vais: {
    id: 'vais', name: 'ヴァイス', cls: '元盗賊団長', emoji: '🗡️',
    desc: '過去に裏切られた経験を持つ。口は悪いが根は仲間思い。',
    joinLocId: 'bandit_hideout',
    joinText: '「チッ……負けたか。いいだろう。どうせ居場所もない。しばらく付き合ってやる。」',
    baseHp: 75, baseMp: 40, baseAtk: 18, baseDef: 8, baseSpd: 16, joinLevel: 3,
    skills: [
      { id: 'poison_blade', name: '毒刃', desc: '毒を塗った刃で攻撃し毒状態にする。', mpCost: 5, target: 'enemy_one', effect: 'poison', power: 1.0 },
      { id: 'shadow_rush', name: '影走り', desc: '闇に紛れた超高速の奇襲。', mpCost: 8, target: 'enemy_one', effect: 'damage', power: 1.9 },
    ],
  },
  logan: {
    id: 'logan', name: 'ローガン', cls: '元処刑人', emoji: '⚒️',
    desc: '罪人を裁いてきた過去を持つ。無口で寡黙だが、信念は固い。',
    joinLocId: 'sahal',
    joinText: '「……魔王を倒すか。それが罪滅ぼしになるなら、力を貸そう。」',
    baseHp: 110, baseMp: 20, baseAtk: 25, baseDef: 15, baseSpd: 7, joinLevel: 4,
    skills: [
      { id: 'execution', name: '処刑の一撃', desc: '過去の経験が宿る渾身の一撃。', mpCost: 12, target: 'enemy_one', effect: 'damage', power: 3.0 },
      { id: 'intimidate', name: '威圧', desc: '恐ろしい眼光で敵全体の攻撃力を下げる。', mpCost: 7, target: 'enemy_all', effect: 'debuff_atk', power: 1 },
    ],
  },
  iris: {
    id: 'iris', name: 'イリス', cls: '元魔王軍魔導士', emoji: '💜',
    desc: 'かつて魔王軍に仕えていた。自由を求めて逃げ出したが、過去に苦しむことも。',
    joinLocId: 'demon_mine',
    joinText: '「魔王軍から逃げて、ここに隠れていた。……あなたが魔王を倒すというなら、協力する。」',
    baseHp: 65, baseMp: 90, baseAtk: 20, baseDef: 7, baseSpd: 11, joinLevel: 4,
    skills: [
      { id: 'magic_bullet', name: '魔弾', desc: '魔王軍仕込みの魔法弾。敵1体に大ダメージ。', mpCost: 9, target: 'enemy_one', effect: 'damage', power: 2.2 },
      { id: 'dark_explosion', name: '闇爆発', desc: '闇の力を爆発させ敵全体を攻撃。', mpCost: 14, target: 'enemy_all', effect: 'damage', power: 1.6 },
    ],
  },
  sig: {
    id: 'sig', name: 'シグ', cls: '詐欺師', emoji: '🎩',
    desc: 'お金儲けが大好きなちゃっかり者。口が上手く、情報収集が得意。',
    joinLocId: 'mirea',
    joinText: '「へへ、封印石探しか。俺、情報網があるんだよね。一緒に行けば得するよ、絶対。」',
    baseHp: 68, baseMp: 45, baseAtk: 14, baseDef: 9, baseSpd: 14, joinLevel: 3,
    skills: [
      { id: 'smoke_screen', name: '煙幕', desc: '煙幕を張り敵全体の攻撃力を下げる。', mpCost: 6, target: 'enemy_all', effect: 'debuff_atk', power: 1 },
      { id: 'vital_strike', name: '急所突き', desc: '急所を正確に狙いスタン状態にする。', mpCost: 10, target: 'enemy_one', effect: 'stun', power: 1.8 },
    ],
  },
  elk: {
    id: 'elk', name: 'エルク', cls: '獣人・槍使い', emoji: '🐺',
    desc: '寡黙でクール。戦闘能力が高く、仲間を守ることに忠実。',
    joinLocId: 'dragon_pass',
    joinText: '「……お前たちは強い。この峠を越えるなら俺が案内しよう。ついでに旅に加わる。」',
    baseHp: 100, baseMp: 25, baseAtk: 22, baseDef: 12, baseSpd: 13, joinLevel: 5,
    skills: [
      { id: 'wolf_claw', name: '狼の爪', desc: '鋭い爪で敵1体を切り裂く。', mpCost: 8, target: 'enemy_one', effect: 'damage', power: 2.1 },
      { id: 'pack_howl', name: '群狼の咆哮', desc: '魂の咆哮で敵全体の攻撃力を大幅に下げる。', mpCost: 10, target: 'enemy_all', effect: 'debuff_atk', power: 2 },
    ],
  },
  mira: {
    id: 'mira', name: 'ミラ', cls: 'エルフ・弓術士', emoji: '🌿',
    desc: '森の民の出身。自然を愛し、穏やかで思慮深い性格。',
    joinLocId: 'ancient_temple',
    joinText: '「古代神殿を守ってきた。……あなたならば封印石を任せられる。共に行きましょう。」',
    baseHp: 72, baseMp: 60, baseAtk: 19, baseDef: 10, baseSpd: 15, joinLevel: 5,
    skills: [
      { id: 'spirit_arrow', name: '精霊の矢', desc: '精霊の力が宿る矢。敵1体に大ダメージ。', mpCost: 9, target: 'enemy_one', effect: 'damage', power: 2.3 },
      { id: 'forest_blessing', name: '森の加護', desc: '自然の加護で味方全体の防御力を上昇。', mpCost: 12, target: 'ally_all', effect: 'def_up', power: 1 },
    ],
  },
  zeno: {
    id: 'zeno', name: 'ゼノ', cls: '魔族', emoji: '😈',
    desc: '目的は謎に包まれている。加入条件が特殊で、仲間になるかはプレイヤー次第。',
    joinLocId: 'desert_ruins',
    joinText: '「……面白い。お前が魔王を倒せるか見てやろう。私が手を貸せば、可能性は上がる。」',
    baseHp: 95, baseMp: 100, baseAtk: 28, baseDef: 14, baseSpd: 13, joinLevel: 6,
    isHidden: true,
    skills: [
      { id: 'demon_power', name: '魔族の力', desc: '魔族の秘めた力を解放し敵1体を粉砕。', mpCost: 15, target: 'enemy_one', effect: 'damage', power: 3.5 },
      { id: 'demon_gate', name: '魔界門', desc: '魔界の門を開き敵全体に猛攻撃。', mpCost: 18, target: 'enemy_all', effect: 'damage', power: 2.0 },
    ],
  },
}

// ===== ENEMIES =====
export const ENEMIES: Record<string, EnemyDef> = {
  // 序盤
  wolf: {
    id: 'wolf', name: '山狼', emoji: '🐺',
    hp: 32, mp: 0, atk: 9, def: 4, spd: 10,
    skills: [], exp: 12, gold: 8,
  },
  goblin: {
    id: 'goblin', name: 'ゴブリン兵', emoji: '👺',
    hp: 45, mp: 10, atk: 12, def: 6, spd: 9,
    skills: [{ id: 'stab', name: '突き', desc: '素早い刺突。', mpCost: 4, target: 'enemy_one', effect: 'damage', power: 1.3 }],
    exp: 18, gold: 15,
  },
  bandit: {
    id: 'bandit', name: '盗賊', emoji: '🗡️',
    hp: 50, mp: 15, atk: 14, def: 7, spd: 12,
    skills: [{ id: 'poison_knife', name: '毒ナイフ', desc: '毒を塗った刃。', mpCost: 5, target: 'enemy_one', effect: 'poison', power: 1.0 }],
    exp: 22, gold: 20,
  },
  // 中盤
  fire_elemental: {
    id: 'fire_elemental', name: '炎精霊', emoji: '🔥',
    hp: 60, mp: 30, atk: 17, def: 8, spd: 11,
    skills: [{ id: 'fire_blast', name: '炎弾', desc: '炎の塊を放つ。', mpCost: 8, target: 'enemy_one', effect: 'damage', power: 1.7 }],
    exp: 30, gold: 25,
  },
  mine_golem: {
    id: 'mine_golem', name: '鉱山ゴーレム', emoji: '⛏️',
    hp: 80, mp: 0, atk: 18, def: 14, spd: 5,
    skills: [], exp: 35, gold: 28,
  },
  storm_bird: {
    id: 'storm_bird', name: '嵐鳥', emoji: '🦅',
    hp: 55, mp: 20, atk: 20, def: 6, spd: 18,
    skills: [{ id: 'gale', name: '旋風', desc: '翼で竜巻を起こす。', mpCost: 8, target: 'enemy_all', effect: 'damage', power: 1.1 }],
    exp: 28, gold: 22,
  },
  desert_scorpion: {
    id: 'desert_scorpion', name: '砂漠サソリ', emoji: '🦂',
    hp: 65, mp: 10, atk: 19, def: 9, spd: 13,
    skills: [{ id: 'sting', name: '猛毒の針', desc: '強力な毒を注入する。', mpCost: 6, target: 'enemy_one', effect: 'poison', power: 1.1 }],
    exp: 32, gold: 26,
  },
  // 森エリア
  mofunezu: {
    id: 'mofunezu', name: 'モフネズ', emoji: '🐿️',
    hp: 28, mp: 0, atk: 8, def: 3, spd: 10,
    skills: [
      { id: 'tackle_m', name: 'たいあたり', desc: '体当たり攻撃。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.0 },
      { id: 'gnaw', name: 'かじる', desc: '鋭い歯で噛みつく。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.2 },
    ],
    exp: 10, gold: 6,
  },
  kinobokku: {
    id: 'kinobokku', name: 'キノボック', emoji: '🍄',
    hp: 42, mp: 35, atk: 11, def: 6, spd: 7,
    skills: [
      { id: 'poison_spore', name: 'どくほうし', desc: '毒の胞子をまき散らす。', mpCost: 6, target: 'enemy_one', effect: 'poison', power: 1.0 },
      { id: 'sleep_spore', name: 'ねむりほうし', desc: '眠り胞子でスタン状態にする。', mpCost: 8, target: 'enemy_one', effect: 'stun', power: 1.0 },
      { id: 'spore_shower', name: 'ほうしまき', desc: '胞子を全体にまき散らす。', mpCost: 10, target: 'enemy_all', effect: 'damage', power: 1.0 },
    ],
    exp: 18, gold: 12,
  },
  donguraa: {
    id: 'donguraa', name: 'ドングラー', emoji: '🌰',
    hp: 68, mp: 15, atk: 14, def: 13, spd: 5,
    skills: [
      { id: 'tackle_d', name: 'たいあたり', desc: '重い体で体当たり。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.1 },
      { id: 'acorn_guard', name: 'ぼうぎょ', desc: '帽子をかぶり防御力を上げる。', mpCost: 8, target: 'self', effect: 'def_up', power: 1 },
    ],
    exp: 25, gold: 18,
  },
  hari_wolf: {
    id: 'hari_wolf', name: 'ハリオオカミ', emoji: '🐺',
    hp: 58, mp: 22, atk: 19, def: 8, spd: 17,
    skills: [
      { id: 'scratch_hw', name: 'ひっかく', desc: '鋭い爪で引っかく。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.2 },
      { id: 'spine_shot', name: 'ハリとばし', desc: '背中の針を全体に飛ばす。', mpCost: 8, target: 'enemy_all', effect: 'damage', power: 0.9 },
      { id: 'bite_hw', name: 'かみつく', desc: '強力な顎で噛みつく。', mpCost: 6, target: 'enemy_one', effect: 'damage', power: 1.8 },
    ],
    exp: 32, gold: 24,
  },
  mori_doll: {
    id: 'mori_doll', name: '森人形', emoji: '🪆',
    hp: 72, mp: 18, atk: 16, def: 11, spd: 6,
    skills: [
      { id: 'grab', name: 'つかむ', desc: '強引に掴みスタン状態にする。', mpCost: 8, target: 'enemy_one', effect: 'stun', power: 1.3 },
      { id: 'eerie_stare', name: 'みつめる', desc: '不気味な視線で攻撃力を下げる。', mpCost: 6, target: 'enemy_one', effect: 'debuff_atk', power: 1 },
    ],
    exp: 38, gold: 30,
  },
  forest_king: {
    id: 'forest_king', name: '森王モルガ', emoji: '🦌',
    hp: 400, mp: 90, atk: 31, def: 17, spd: 11,
    skills: [
      { id: 'king_scratch', name: 'ひっかく', desc: '巨大な爪で引っかく。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.5 },
      { id: 'stomp', name: 'ふみつけ', desc: '重い足で踏みつける。全体攻撃。', mpCost: 12, target: 'enemy_all', effect: 'damage', power: 1.2 },
      { id: 'seed_scatter', name: 'たねまき', desc: '毒の種を全体にまき散らす。', mpCost: 14, target: 'enemy_all', effect: 'poison', power: 1.0 },
      { id: 'vine_call', name: 'つるのよびごえ', desc: '蔓を操り自身の攻撃力を大幅アップ。', mpCost: 10, target: 'self', effect: 'atk_up', power: 1 },
    ],
    exp: 220, gold: 150, isBoss: true, sealStone: 'dark',
  },
  // ===== 山岳エリア（廃鉱山・竜の峠）=====
  goromin: {
    id: 'goromin', name: 'ゴロミン', emoji: '🪨',
    hp: 40, mp: 0, atk: 11, def: 7, spd: 6,
    skills: [
      { id: 'iwa_koro', name: 'いわコロ', desc: '岩のように転がりぶつかる。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.0 },
      { id: 'taiatar_g', name: 'たいあたり', desc: '体当たりで押しつぶす。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.1 },
    ],
    exp: 14, gold: 9,
  },
  tsuru_hammer: {
    id: 'tsuru_hammer', name: 'ツルハンマー', emoji: '⛏️',
    hp: 35, mp: 10, atk: 15, def: 4, spd: 10,
    skills: [
      { id: 'hammer_buri', name: 'ハンマーぶり', desc: '鉱道具を全力で振り下ろす。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.6 },
      { id: 'hori_okoshi', name: 'ほりおこし', desc: '掘り起こしてスタン状態にする。', mpCost: 8, target: 'enemy_one', effect: 'stun', power: 1.0 },
    ],
    exp: 17, gold: 11,
  },
  kabemimi: {
    id: 'kabemimi', name: 'カベミミ', emoji: '🦇',
    hp: 50, mp: 15, atk: 13, def: 9, spd: 7,
    skills: [
      { id: 'kabedon', name: 'かべドン', desc: '岩壁に叩きつける。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.3 },
      { id: 'choushu', name: 'チョウシュ', desc: '壁に耳を当て弱点を察知。攻撃力を下げる。', mpCost: 7, target: 'enemy_one', effect: 'debuff_atk', power: 1 },
    ],
    exp: 20, gold: 14,
  },
  ganseki_bou: {
    id: 'ganseki_bou', name: 'ガンセキ坊', emoji: '🗿',
    hp: 78, mp: 0, atk: 14, def: 17, spd: 3,
    skills: [
      { id: 'omoi_tsubushi', name: 'おもいつぶし', desc: '重い体でゆっくり押しつぶす。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.8 },
      { id: 'katamaru', name: 'かたまる', desc: '石のように固まり防御力を上げる。', mpCost: 8, target: 'self', effect: 'def_up', power: 1 },
    ],
    exp: 27, gold: 19,
  },
  // ===== 砂漠エリア（砂漠遺跡）=====
  sabotenu: {
    id: 'sabotenu', name: 'サボテヌ', emoji: '🌵',
    hp: 55, mp: 0, atk: 14, def: 7, spd: 9,
    skills: [
      { id: 'toge_atari', name: 'とげあたり', desc: '鋭いとげを刺して毒状態にする。', mpCost: 0, target: 'enemy_one', effect: 'poison', power: 1.0 },
      { id: 'saboten_kick', name: 'サボテンキック', desc: 'とげだらけの足で蹴る。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.3 },
    ],
    exp: 22, gold: 16,
  },
  sunabukuro: {
    id: 'sunabukuro', name: 'スナブクロ', emoji: '🎒',
    hp: 70, mp: 10, atk: 12, def: 13, spd: 5,
    skills: [
      { id: 'suna_arashi', name: 'すなあらし', desc: '砂を全体に撒き散らす。', mpCost: 8, target: 'enemy_all', effect: 'damage', power: 1.0 },
      { id: 'omoi_crush', name: 'おもいつぶし', desc: '重い砂袋で叩きつける。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.5 },
    ],
    exp: 24, gold: 18,
  },
  hibikamen: {
    id: 'hibikamen', name: 'ヒビカメン', emoji: '🗺️',
    hp: 60, mp: 25, atk: 17, def: 8, spd: 10,
    skills: [
      { id: 'noroi', name: 'のろい', desc: '遺跡の呪いで全体の攻撃力を下げる。', mpCost: 10, target: 'enemy_all', effect: 'debuff_atk', power: 1 },
      { id: 'inishie_honoo', name: 'いにしえのほのお', desc: '古代の炎を放つ。', mpCost: 8, target: 'enemy_one', effect: 'damage', power: 1.6 },
    ],
    exp: 26, gold: 20,
  },
  mizunomin: {
    id: 'mizunomin', name: 'ミズノミン', emoji: '🫙',
    hp: 45, mp: 30, atk: 11, def: 6, spd: 13,
    skills: [
      { id: 'mizu_housya', name: 'みずほうしゃ', desc: '水筒から水を勢いよく噴射する。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.2 },
      { id: 'uruoi', name: 'うるおい', desc: '自分を水で潤し防御力を上げる。', mpCost: 8, target: 'self', effect: 'def_up', power: 1 },
    ],
    exp: 20, gold: 14,
  },
  // ===== 魔王軍 一般兵（砂漠遺跡 後半）=====
  tsugihagi_hei: {
    id: 'tsugihagi_hei', name: 'ツギハギ兵', emoji: '🪡',
    hp: 72, mp: 15, atk: 21, def: 11, spd: 11,
    skills: [
      { id: 'tsugihagi_giri', name: 'つぎはぎぎり', desc: '継ぎはぎだらけの剣で斬りつける。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.5 },
      { id: 'gamushara', name: 'がむしゃら', desc: '我武者羅に攻撃し自身の攻撃力を上げる。', mpCost: 8, target: 'self', effect: 'atk_up', power: 1 },
    ],
    exp: 42, gold: 34,
  },
  baketsu_hei: {
    id: 'baketsu_hei', name: 'バケツ兵', emoji: '🪣',
    hp: 80, mp: 0, atk: 19, def: 16, spd: 7,
    skills: [
      { id: 'baketsu_naguri', name: 'バケツなぐり', desc: 'バケツを全力で叩きつける。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.4 },
      { id: 'jourou_maki', name: 'じょうろまき', desc: 'じょうろで水をかけスタンさせる。', mpCost: 8, target: 'enemy_one', effect: 'stun', power: 1.0 },
    ],
    exp: 44, gold: 36,
  },
  memo_hei: {
    id: 'memo_hei', name: 'メモ兵', emoji: '📝',
    hp: 65, mp: 25, atk: 17, def: 9, spd: 13,
    skills: [
      { id: 'memo_nage', name: 'メモなげ', desc: 'メモを丸めて投げつける。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.2 },
      { id: 'jouhou_koukou', name: 'じょうほうこうかん', desc: '弱点情報を共有し攻撃力を下げる。', mpCost: 8, target: 'enemy_one', effect: 'debuff_atk', power: 1 },
    ],
    exp: 40, gold: 32,
  },
  // ===== 魔王軍 幹部（砂漠遺跡 深部）=====
  sansec_general: {
    id: 'sansec_general', name: '三秒将軍', emoji: '🎭',
    hp: 110, mp: 40, atk: 25, def: 14, spd: 13,
    skills: [
      { id: 'kimaguregiri', name: 'きまぐれぎり', desc: '気まぐれな一撃。毎回威力が変わる。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.6 },
      { id: 'hanka_no_sakebi', name: 'へんかのさけび', desc: '豹変して自身の攻撃力を大幅に上げる。', mpCost: 10, target: 'self', effect: 'atk_up', power: 1 },
    ],
    exp: 75, gold: 58,
  },
  mirror_lady: {
    id: 'mirror_lady', name: '鏡面婦人', emoji: '🪞',
    hp: 95, mp: 65, atk: 22, def: 12, spd: 15,
    skills: [
      { id: 'kyoumen_hansha', name: 'きょうめんはんしゃ', desc: '鏡で光を反射し敵を攻撃。', mpCost: 8, target: 'enemy_one', effect: 'damage', power: 1.4 },
      { id: 'maboroshi', name: 'まぼろし', desc: '幻を見せスタン状態にする。', mpCost: 12, target: 'enemy_one', effect: 'stun', power: 1.0 },
      { id: 'majo_no_hitomi', name: 'まじょのひとみ', desc: '魔女の瞳で攻撃力を下げる。', mpCost: 10, target: 'enemy_one', effect: 'debuff_atk', power: 1 },
    ],
    exp: 80, gold: 62,
  },
  ito_kiri: {
    id: 'ito_kiri', name: '糸切り郷', emoji: '🕷️',
    hp: 105, mp: 50, atk: 23, def: 11, spd: 16,
    skills: [
      { id: 'ito_shibari', name: 'いとしばり', desc: '糸で縛りスタン状態にする。', mpCost: 8, target: 'enemy_one', effect: 'stun', power: 1.0 },
      { id: 'kumosu_zan', name: 'くものすざん', desc: '蜘蛛の巣で全体を切り裂く。', mpCost: 12, target: 'enemy_all', effect: 'damage', power: 1.1 },
      { id: 'ayatsuri', name: 'あやつりにんぎょう', desc: '糸で操り自身の攻撃力を上げる。', mpCost: 10, target: 'self', effect: 'atk_up', power: 1 },
    ],
    exp: 85, gold: 66,
  },
  // ===== 河川・海岸エリア（ダンジョン未決定）=====
  poyogaeru: {
    id: 'poyogaeru', name: 'ポヨガエル', emoji: '🐸',
    hp: 48, mp: 20, atk: 10, def: 5, spd: 14,
    skills: [
      { id: 'fuwa_tobi', name: 'ふわとび', desc: 'ぷくっとふくらんで飛びかかりスタンさせる。', mpCost: 8, target: 'enemy_one', effect: 'stun', power: 1.0 },
      { id: 'shita_uchi', name: 'したうち', desc: '長い舌でぺちんと叩く。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.3 },
    ],
    exp: 14, gold: 9,
  },
  yadotsubo: {
    id: 'yadotsubo', name: 'ヤドツボ', emoji: '🫙',
    hp: 62, mp: 0, atk: 12, def: 15, spd: 4,
    skills: [
      { id: 'tsubo_komori', name: 'ツボにひきこもる', desc: '壺に隠れ防御力を大幅に上げる。', mpCost: 8, target: 'self', effect: 'def_up', power: 1 },
      { id: 'hasami_kudaki', name: 'ハサミくだき', desc: '大きなハサミで強力に挟む。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.5 },
    ],
    exp: 19, gold: 14,
  },
  mokumokumo: {
    id: 'mokumokumo', name: 'モクモクモ', emoji: '🌊',
    hp: 70, mp: 28, atk: 11, def: 8, spd: 8,
    skills: [
      { id: 'matowari_tsuku', name: 'まとわりつく', desc: '藻が絡みついてスタン状態にする。', mpCost: 8, target: 'enemy_one', effect: 'stun', power: 1.0 },
      { id: 'doku_no_moku', name: 'どくのもく', desc: '毒を帯びた藻でダメージを与える。', mpCost: 6, target: 'enemy_one', effect: 'poison', power: 1.0 },
    ],
    exp: 21, gold: 15,
  },
  kuchipaku: {
    id: 'kuchipaku', name: 'クチパク', emoji: '🐡',
    hp: 55, mp: 0, atk: 17, def: 5, spd: 15,
    skills: [
      { id: 'gabu_nomi', name: 'がぶのみ', desc: '大きな口でまるごと噛みつく。', mpCost: 0, target: 'enemy_one', effect: 'damage', power: 1.9 },
      { id: 'hageshii_nagare', name: 'はげしいながれ', desc: '激流を起こして全体を攻撃する。', mpCost: 8, target: 'enemy_all', effect: 'damage', power: 0.9 },
    ],
    exp: 23, gold: 17,
  },
  // ===== ボス =====
  bandit_king: {
    id: 'bandit_king', name: '盗賊王カルド', emoji: '👑',
    hp: 200, mp: 30, atk: 22, def: 10, spd: 14,
    skills: [
      { id: 'triple_slash', name: '三連斬り', desc: '三段連続攻撃。', mpCost: 10, target: 'enemy_one', effect: 'damage', power: 2.0 },
      { id: 'smoke_bomb', name: '煙幕爆弾', desc: '敵全体の攻撃力を下げる。', mpCost: 8, target: 'enemy_all', effect: 'debuff_atk', power: 1 },
    ],
    exp: 100, gold: 80, isBoss: true,
  },
  mine_king: {
    id: 'mine_king', name: '鉱王グラドル', emoji: '💎',
    hp: 320, mp: 60, atk: 29, def: 20, spd: 8,
    skills: [
      { id: 'crystal_rush', name: 'クリスタルラッシュ', desc: '水晶の刃で全体を切り裂く。', mpCost: 14, target: 'enemy_all', effect: 'damage', power: 1.3 },
      { id: 'ore_shield', name: '鉱石の盾', desc: '鉱石の盾で防御力を大幅に上げる。', mpCost: 10, target: 'self', effect: 'def_up', power: 1 },
      { id: 'daichi_no_ikari', name: '大地の怒り', desc: '大地を揺らし1体に超強力な一撃。', mpCost: 16, target: 'enemy_one', effect: 'damage', power: 2.8 },
    ],
    exp: 200, gold: 130, isBoss: true, sealStone: 'fire',
  },
  storm_dragon: {
    id: 'storm_dragon', name: '嵐竜ストームレックス', emoji: '🌩️',
    hp: 340, mp: 80, atk: 30, def: 13, spd: 17,
    skills: [
      { id: 'storm_blast', name: '嵐の爆風', desc: '全体に嵐ダメージ。', mpCost: 14, target: 'enemy_all', effect: 'damage', power: 1.4 },
      { id: 'lightning_dive', name: '雷撃落とし', desc: '1体に超強力な雷。', mpCost: 12, target: 'enemy_one', effect: 'damage', power: 2.6 },
    ],
    exp: 180, gold: 120, isBoss: true, sealStone: 'storm',
  },
  ruins_guardian: {
    id: 'ruins_guardian', name: '遺跡守ラザーム', emoji: '🗿',
    hp: 200, mp: 60, atk: 26, def: 16, spd: 9,
    skills: [
      { id: 'inishie_sabaki', name: 'いにしえのさばき', desc: '古代の力で全体を裁く。', mpCost: 14, target: 'enemy_all', effect: 'damage', power: 1.3 },
      { id: 'razaam_ikari', name: 'ラザームのいかり', desc: '怒りで自身の攻撃力を大幅に上げる。', mpCost: 10, target: 'self', effect: 'atk_up', power: 1 },
      { id: 'fuji_kome', name: 'ふうじこめ', desc: '遺跡の力で1体を封じスタンさせる。', mpCost: 8, target: 'enemy_one', effect: 'stun', power: 1.0 },
    ],
    exp: 90, gold: 70, isBoss: false,
  },
  tidal_king: {
    id: 'tidal_king', name: '潮王ネブラ', emoji: '🐳',
    hp: 380, mp: 80, atk: 28, def: 15, spd: 13,
    skills: [
      { id: 'taida_no_nami', name: 'たいだのなみ', desc: '怠惰な大波で全体を攻撃する。', mpCost: 13, target: 'enemy_all', effect: 'damage', power: 1.3 },
      { id: 'kaitei_shihai', name: 'かいていのしはい', desc: '海底から全体の攻撃力を下げる。', mpCost: 10, target: 'enemy_all', effect: 'debuff_atk', power: 1 },
      { id: 'uzushio', name: 'うずしお', desc: '渦潮に巻き込みスタンさせる。', mpCost: 10, target: 'enemy_one', effect: 'stun', power: 1.0 },
    ],
    exp: 200, gold: 130, isBoss: true,
  },
  archive: {
    id: 'archive', name: '終末記録体アーカイブ', emoji: '📚',
    hp: 580, mp: 150, atk: 40, def: 22, spd: 14,
    skills: [
      { id: 'kiroku_sabaki', name: 'きろくのさばき', desc: '世界の記録が全体に降り注ぐ。', mpCost: 18, target: 'enemy_all', effect: 'damage', power: 1.7 },
      { id: 'kako_no_kodama', name: 'かこのこだま', desc: '過去の記録が全体の攻撃力を下げる。', mpCost: 14, target: 'enemy_all', effect: 'debuff_atk', power: 1 },
      { id: 'mirai_no_fuuin', name: 'みらいのふういん', desc: '未来を封じ1体をスタン状態にする。', mpCost: 12, target: 'enemy_one', effect: 'stun', power: 1.0 },
      { id: 'sekai_no_kiroku', name: 'せかいのきろく', desc: '世界全ての記録を解放する最強の一撃。', mpCost: 25, target: 'enemy_one', effect: 'damage', power: 3.5 },
    ],
    exp: 600, gold: 300, isBoss: true,
  },
}

// ===== ITEMS =====
export const ITEMS: Record<string, ItemDef> = {
  potion:    { id: 'potion',    name: 'ポーション',   emoji: '🧪', desc: 'HPを50回復する。',           effect: 'heal_hp',   power: 50,  price: 100 },
  hi_potion: { id: 'hi_potion', name: 'ハイポーション',emoji: '💊', desc: 'HPを120回復する。',          effect: 'heal_hp',   power: 120, price: 250 },
  ether:     { id: 'ether',     name: 'エーテル',     emoji: '✨', desc: 'MPを30回復する。',           effect: 'heal_mp',   power: 30,  price: 120 },
  panacea:   { id: 'panacea',   name: '万能薬',       emoji: '🌿', desc: 'HP100・MP40回復する。',     effect: 'heal_both', power: 100, price: 300 },
  antidote:  { id: 'antidote',  name: '毒消し',       emoji: '🫙', desc: '毒・スタン状態を回復する。', effect: 'cure_status',power: 0,  price: 80  },
}

// ===== LOCATIONS (ルミナ大陸) =====
export const LOCATIONS: Record<LocationId, LocationDef> = {
  // ===== 6 TOWNS =====
  alseria: {
    id: 'alseria', name: 'アルセリア王都', emoji: '🏰',
    type: 'town',
    desc: 'ルミナ大陸の中心に位置する王国の首都。封印石の探索はここから始まる。騎士団が守る堅牢な城壁都市。',
    connections: ['traveler_inn', 'checkpoint', 'great_bridge'],
    travelDays: { traveler_inn: 1, checkpoint: 1, great_bridge: 2 },
    companionId: 'gares',
    shopItems: ['potion', 'ether', 'antidote'],
    hasInn: true,
  },
  bern: {
    id: 'bern', name: 'ベルン商業都市', emoji: '🏛️',
    type: 'town',
    desc: '東の商業の要所。多くの商人が集まり、様々な情報が飛び交う。傭兵の溜まり場でもある。',
    connections: ['checkpoint', 'watchtower', 'trading_post'],
    travelDays: { checkpoint: 2, watchtower: 2, trading_post: 1 },
    companionId: 'noa',
    shopItems: ['potion', 'hi_potion', 'ether', 'antidote'],
    hasInn: true,
  },
  sahal: {
    id: 'sahal', name: 'サハル砂漠都市', emoji: '🏜️',
    type: 'town',
    desc: '東の砂漠に築かれた都市。砂漠の民が暮らす異国情緒あふれる場所。裏の取引も盛んに行われている。',
    connections: ['bandit_hideout', 'coastal_road', 'desert_ruins'],
    travelDays: { bandit_hideout: 2, coastal_road: 1, desert_ruins: 3 },
    companionId: 'logan',
    shopItems: ['hi_potion', 'ether', 'panacea', 'antidote'],
    hasInn: true,
  },
  mirea: {
    id: 'mirea', name: 'ミレア港町', emoji: '⚓',
    type: 'town',
    desc: '南の海に面した賑やかな港町。海路の交差点で、船でしか行けない場所へ出航できる。',
    connections: ['riverside', 'lighthouse', 'coastal_road'],
    travelDays: { riverside: 2, lighthouse: 1, coastal_road: 2 },
    companionId: 'sig',
    shopItems: ['potion', 'hi_potion', 'ether', 'panacea'],
    hasInn: true,
  },
  elna: {
    id: 'elna', name: 'エルナの里', emoji: '🌲',
    type: 'town',
    desc: '森の中の小さな里。エルフや獣人が暮らす自然豊かな場所。精霊とのつながりが深い。',
    connections: ['forest_entrance', 'spirit_spring'],
    travelDays: { forest_entrance: 1, spirit_spring: 1 },
    companionId: 'bram',
    shopItems: ['potion', 'hi_potion', 'ether'],
    hasInn: true,
  },
  galdo: {
    id: 'galdo', name: 'ガルド皆都市', emoji: '🏯',
    type: 'town',
    desc: '北方の軍事都市。王国軍の重要な拠点となっている。各地の冒険者が集まる探索の起点。',
    connections: ['traveler_inn', 'watchtower', 'demon_mine', 'dragon_pass'],
    travelDays: { traveler_inn: 2, watchtower: 2, demon_mine: 2, dragon_pass: 3 },
    companionId: 'cecil',
    shopItems: ['hi_potion', 'panacea', 'ether', 'antidote'],
    hasInn: true,
  },

  // ===== RELAY POINTS =====
  traveler_inn: {
    id: 'traveler_inn', name: '旅人の宿', emoji: '🏨',
    type: 'relay',
    desc: 'アルセリアとガルドを結ぶ街道沿いの宿屋。旅人の憩いの場。北方への拠点。',
    connections: ['alseria', 'galdo', 'forest_entrance'],
    travelDays: { alseria: 1, galdo: 2, forest_entrance: 1 },
    hasInn: true,
    shopItems: ['potion', 'antidote'],
    travelEnemyPool: ['wolf', 'goromin'],
  },
  checkpoint: {
    id: 'checkpoint', name: '東関所', emoji: '🚧',
    type: 'relay',
    desc: 'アルセリアとベルンを結ぶ東の交通の要衝。往来する商人と旅人を監視している。',
    connections: ['alseria', 'bern'],
    travelDays: { alseria: 1, bern: 2 },
    shopItems: ['potion'],
    travelEnemyPool: ['bandit', 'goblin'],
  },
  great_bridge: {
    id: 'great_bridge', name: '大橋', emoji: '🌉',
    type: 'relay',
    desc: 'ルーテ大河に架かる大きな橋。南北をつなぐ重要な通路。川の流れを眺めながら渡る。',
    connections: ['alseria', 'riverside'],
    travelDays: { alseria: 2, riverside: 1 },
    travelEnemyPool: ['wolf', 'poyogaeru'],
  },
  riverside: {
    id: 'riverside', name: '川辺の村', emoji: '🏡',
    type: 'relay',
    desc: '大河のほとりにある小さな村。旅人の中継地点として機能している。フィンがここで冒険者を目指している。',
    connections: ['great_bridge', 'mirea', 'lighthouse'],
    travelDays: { great_bridge: 1, mirea: 2, lighthouse: 1 },
    companionId: 'finn',
    hasInn: true,
    shopItems: ['potion', 'ether'],
    travelEnemyPool: ['poyogaeru', 'yadotsubo', 'mokumokumo'],
  },
  watchtower: {
    id: 'watchtower', name: '見張り塔', emoji: '🗼',
    type: 'relay',
    desc: 'ベルンとガルドを結ぶ街道の中継地点。兵士が北方の動向を監視している。',
    connections: ['bern', 'galdo'],
    travelDays: { bern: 2, galdo: 2 },
    travelEnemyPool: ['goromin', 'kabemimi'],
  },
  lighthouse: {
    id: 'lighthouse', name: '灯台岬', emoji: '🏮',
    type: 'relay',
    desc: '南西の岬に立つ灯台。海路の目印で、ミレアと川辺の村を結ぶ沿岸の中継地。',
    connections: ['mirea', 'riverside'],
    travelDays: { mirea: 1, riverside: 1 },
    shopItems: ['potion', 'antidote'],
    travelEnemyPool: ['kuchipaku', 'mokumokumo'],
  },
  spirit_spring: {
    id: 'spirit_spring', name: '精霊の泉', emoji: '💧',
    type: 'relay',
    desc: 'エルナの里の近くにある精霊が宿る泉。癒しの力があり、大橋や古代神殿への道が分かれる場所。',
    connections: ['elna', 'ancient_temple'],
    travelDays: { elna: 1, ancient_temple: 2 },
    travelEnemyPool: ['mofunezu', 'kinobokku', 'hari_wolf'],
  },
  trading_post: {
    id: 'trading_post', name: '交易所', emoji: '🏪',
    type: 'relay',
    desc: 'ベルンとサハルを結ぶ中間の交易拠点。東西の商品が集まり、情報も豊富。盗賊アジトへの入口でもある。',
    connections: ['bern', 'checkpoint', 'bandit_hideout', 'sahal'],
    travelDays: { bern: 1, checkpoint: 2, bandit_hideout: 2, sahal: 2 },
    shopItems: ['potion', 'hi_potion', 'ether', 'antidote'],
    travelEnemyPool: ['bandit', 'tsugihagi_hei'],
  },
  coastal_road: {
    id: 'coastal_road', name: '海岸街道', emoji: '🌊',
    type: 'relay',
    desc: '南東海岸沿いの街道。ミレアとサハルを海沿いに結ぶルート。砂漠の入口にも近い。',
    connections: ['mirea', 'sahal'],
    travelDays: { mirea: 2, sahal: 1 },
    travelEnemyPool: ['kuchipaku', 'poyogaeru', 'sabotenu'],
  },
  forest_entrance: {
    id: 'forest_entrance', name: '森の入口', emoji: '🌿',
    type: 'relay',
    desc: '旅人の宿とエルナの里を結ぶ森の入口。深い緑に囲まれた静かな場所。',
    connections: ['traveler_inn', 'elna'],
    travelDays: { traveler_inn: 1, elna: 1 },
    travelEnemyPool: ['mofunezu', 'kinobokku'],
  },

  // ===== DUNGEONS =====
  demon_mine: {
    id: 'demon_mine', name: '廃鉱山', emoji: '⛏️',
    type: 'dungeon',
    desc: '北西の山中に潜む廃坑。岩石の魔物が棲み、炎の封印石が眠ると言われる。鉱王グラドルが支配する。',
    connections: ['galdo'],
    travelDays: { galdo: 2 },
    companionId: 'iris',
    sealStone: 'fire',
    enemyPool: ['goromin', 'tsuru_hammer', 'kabemimi', 'ganseki_bou'],
    bossId: 'mine_king',
  },
  dragon_pass: {
    id: 'dragon_pass', name: '竜の峠', emoji: '🐲',
    type: 'dungeon',
    desc: '北方山脈の最も険しい峠。嵐の封印石を守る嵐竜が潜む。エルクがここを守護している。',
    connections: ['galdo'],
    travelDays: { galdo: 3 },
    companionId: 'elk',
    sealStone: 'storm',
    enemyPool: ['goromin', 'tsuru_hammer', 'kabemimi', 'ganseki_bou'],
    bossId: 'storm_dragon',
  },
  bandit_hideout: {
    id: 'bandit_hideout', name: '盗賊アジト', emoji: '💀',
    type: 'dungeon',
    desc: '山道の奥にある盗賊の拠点。ヴァイスの過去と深く関わっている。裏の情報が手に入るかもしれない。',
    connections: ['trading_post', 'sahal'],
    travelDays: { trading_post: 2, sahal: 2 },
    companionId: 'vais',
    enemyPool: ['bandit', 'goblin', 'wolf'],
    bossId: 'bandit_king',
  },
  ancient_temple: {
    id: 'ancient_temple', name: '古代神殿', emoji: '🏛️',
    type: 'dungeon',
    desc: '森の奥にひっそりとたたずむ古代の遺跡。闇の封印石が祀られ、エルフのミラが守護している。特別な儀式が必要。',
    connections: ['spirit_spring'],
    travelDays: { spirit_spring: 2 },
    companionId: 'mira',
    sealStone: 'dark',
    enemyPool: ['mofunezu', 'kinobokku', 'donguraa', 'hari_wolf', 'mori_doll'],
    bossId: 'forest_king',
  },
  desert_ruins: {
    id: 'desert_ruins', name: '砂漠遺跡', emoji: '🌑',
    type: 'castle',
    desc: '砂漠の奥に眠る古代遺跡。世界の記録を刻む終末記録体アーカイブが待ち受ける禁断の地。3つの封印石を持つ者だけが真の決戦に挑める。謎めいた魔族ゼノもここにいる。',
    connections: ['sahal'],
    travelDays: { sahal: 3 },
    companionId: 'zeno',
    enemyPool: ['sabotenu', 'sunabukuro', 'hibikamen', 'mizunomin', 'ruins_guardian', 'tsugihagi_hei', 'baketsu_hei', 'memo_hei', 'sansec_general', 'mirror_lady', 'ito_kiri'],
    bossId: 'archive',
    requireAllStones: true,
  },
}

export function getExpToNext(level: number): number {
  return level * 35
}

export function getDifficultyMultiplier(difficulty: string): { days: number; enemyHpMult: number; playerHpMult: number } {
  switch (difficulty) {
    case 'easy':  return { days: 120, enemyHpMult: 0.7,  playerHpMult: 1.3 }
    case 'hard':  return { days: 80,  enemyHpMult: 1.4,  playerHpMult: 0.8 }
    default:      return { days: 100, enemyHpMult: 1.0,  playerHpMult: 1.0 }
  }
}
