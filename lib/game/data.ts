import type { CompanionDef, EnemyDef, ItemDef, LocationDef, Skill, LevelSkill, CompanionId, LocationId, GameEvent } from './types'

// ===== PLAYER SKILLS — 全習得スキル一覧 =====
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
  {
    id: 'judgement',
    name: '天命の一撃',
    desc: '勇者の運命が宿る必殺技。全敵に強烈なダメージ。',
    mpCost: 22, target: 'enemy_all', effect: 'damage', power: 2.0,
  },
  {
    id: 'undying_vow',
    name: '不死の誓い',
    desc: '決して諦めない誓いの力。自身のHPを大回復する。',
    mpCost: 28, target: 'self', effect: 'heal', power: 150,
  },
]

// ===== PLAYER SKILL SCHEDULE (レベルで習得) =====
export const PLAYER_SKILL_SCHEDULE: LevelSkill[] = [
  { level: 1,  skill: PLAYER_SKILLS[0] }, // 勇者斬り
  { level: 5,  skill: PLAYER_SKILLS[1] }, // 鼓舞
  { level: 10, skill: PLAYER_SKILLS[2] }, // 守護の誓い
  { level: 15, skill: PLAYER_SKILLS[3] }, // 封印解放
  { level: 20, skill: PLAYER_SKILLS[4] }, // 天命の一撃
  { level: 25, skill: PLAYER_SKILLS[5] }, // 不死の誓い
]

// ===== COMPANIONS (13人) =====
export const COMPANIONS: Record<CompanionId, CompanionDef> = {
  gares: {
    id: 'gares', name: 'ガレス', cls: '騎士', emoji: '🛡️',
    desc: '王都の騎士団長を務めていた。誇り高く真面目で面倒見が良い。',
    joinLocId: 'alseria',
    joinText: '「レオン殿。私ガレスが剣と盾で貴殿を守ろう。騎士の誇りにかけて。」',
    baseHp: 130, baseMp: 25, baseAtk: 14, baseDef: 20, baseSpd: 6, joinLevel: 2,
    hpGrowth: 15, mpGrowth: 2, atkGrowth: 2, defGrowth: 4, spdGrowth: 0,
    skills: [
      { id: 'shield_bash', name: '盾撃', desc: '盾で敵をスタンさせる。', mpCost: 6, target: 'enemy_one', effect: 'stun', power: 1.2 },
      { id: 'iron_wall', name: '鉄壁', desc: '自分の防御力を大幅に上昇させる。', mpCost: 8, target: 'self', effect: 'def_up', power: 1 },
    ],
    learnableSkills: [
      { level: 10, skill: { id: 'knight_vow', name: '聖騎士の誓い', desc: '騎士の誓いで仲間を癒す。味方全体のHPを回復。', mpCost: 18, target: 'ally_all', effect: 'heal', power: 35 } },
    ],
  },
  liz: {
    id: 'liz', name: 'リズ', cls: '神官', emoji: '✨',
    desc: '優しく穏やかな性格。信仰心が厚く、仲間の支えとなる存在。',
    joinLocId: 'alseria',
    joinText: '「神様の導きがあなたをここへ連れてきた。私の癒しの力、お役に立てれば。」',
    baseHp: 65, baseMp: 95, baseAtk: 9, baseDef: 9, baseSpd: 9, joinLevel: 2,
    hpGrowth: 7, mpGrowth: 10, atkGrowth: 1, defGrowth: 1, spdGrowth: 1,
    skills: [
      { id: 'heal', name: '癒し', desc: '味方1体のHPを50回復する。', mpCost: 6, target: 'ally_one', effect: 'heal', power: 50 },
      { id: 'holy_light', name: '聖なる光', desc: '味方全体のHPを25回復。', mpCost: 14, target: 'ally_all', effect: 'heal', power: 25 },
    ],
    learnableSkills: [
      { level: 10, skill: { id: 'great_heal', name: '大いなる癒し', desc: '神の奇跡。味方全体のHPを大幅に回復する。', mpCost: 22, target: 'ally_all', effect: 'heal', power: 60 } },
    ],
  },
  noa: {
    id: 'noa', name: 'ノア', cls: '弓使い', emoji: '🏹',
    desc: '明るく快活な性格。遠距離攻撃が得意で、行動も俊敏。',
    joinLocId: 'bern',
    joinText: '「俺、この旅に参加したい！遠くの敵はぜんぶ俺に任せといて！」',
    baseHp: 75, baseMp: 35, baseAtk: 17, baseDef: 8, baseSpd: 15, joinLevel: 3,
    hpGrowth: 8, mpGrowth: 3, atkGrowth: 3, defGrowth: 1, spdGrowth: 2,
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
    hpGrowth: 6, mpGrowth: 12, atkGrowth: 3, defGrowth: 1, spdGrowth: 1,
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
    hpGrowth: 14, mpGrowth: 2, atkGrowth: 3, defGrowth: 2, spdGrowth: 1,
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
    hpGrowth: 10, mpGrowth: 3, atkGrowth: 2, defGrowth: 2, spdGrowth: 2,
    skills: [
      { id: 'young_slash', name: '若き剣閃', desc: '気合いの一撃。成長中の力が宿る。', mpCost: 6, target: 'enemy_one', effect: 'damage', power: 1.6 },
      { id: 'guts', name: '根性', desc: '気力で自分を奮い立たせ攻撃力UP。', mpCost: 5, target: 'self', effect: 'atk_up', power: 1 },
    ],
    learnableSkills: [
      { level: 8, skill: { id: 'brave_slash', name: '勇躍の一閃', desc: '一人前になった証。全力の斬撃で敵1体に強力なダメージ。', mpCost: 12, target: 'enemy_one', effect: 'damage', power: 2.8 } },
    ],
  },
  vais: {
    id: 'vais', name: 'ヴァイス', cls: '元盗賊団長', emoji: '🗡️',
    desc: '過去に裏切られた経験を持つ。口は悪いが根は仲間思い。',
    joinLocId: 'bandit_hideout',
    joinText: '「チッ……負けたか。いいだろう。どうせ居場所もない。しばらく付き合ってやる。」',
    baseHp: 75, baseMp: 40, baseAtk: 18, baseDef: 8, baseSpd: 16, joinLevel: 3,
    hpGrowth: 8, mpGrowth: 4, atkGrowth: 2, defGrowth: 1, spdGrowth: 3,
    skills: [
      { id: 'poison_blade', name: '毒刃', desc: '毒を塗った刃で攻撃し毒状態にする。', mpCost: 5, target: 'enemy_one', effect: 'poison', power: 1.0 },
      { id: 'shadow_rush', name: '影走り', desc: '闇に紛れた超高速の奇襲。', mpCost: 8, target: 'enemy_one', effect: 'damage', power: 1.9 },
    ],
  },
  logan: {
    id: 'logan', name: 'ローガン', cls: '元処刑人', emoji: '⚒️',
    desc: '罪人を裁いてきた過去を持つ。無口で寡黙だが、信念は固い。HP・ATKが最高クラス。',
    joinLocId: 'sahal',
    joinText: '「……魔王を倒すか。それが罪滅ぼしになるなら、力を貸そう。」',
    baseHp: 120, baseMp: 20, baseAtk: 27, baseDef: 16, baseSpd: 7, joinLevel: 4,
    hpGrowth: 13, mpGrowth: 2, atkGrowth: 4, defGrowth: 2, spdGrowth: 0,
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
    hpGrowth: 6, mpGrowth: 12, atkGrowth: 3, defGrowth: 1, spdGrowth: 1,
    skills: [
      { id: 'magic_bullet', name: '魔弾', desc: '魔王軍仕込みの魔法弾。敵1体に大ダメージ。', mpCost: 9, target: 'enemy_one', effect: 'damage', power: 2.2 },
      { id: 'dark_explosion', name: '闇爆発', desc: '闇の力を爆発させ敵全体を攻撃。', mpCost: 14, target: 'enemy_all', effect: 'damage', power: 1.6 },
    ],
    learnableSkills: [
      { level: 12, skill: { id: 'dark_army_awaken', name: '魔王軍覚醒', desc: '封印された魔王軍の力を解放。敵全体に圧倒的なダメージ。', mpCost: 24, target: 'enemy_all', effect: 'damage', power: 2.5 } },
    ],
  },
  sig: {
    id: 'sig', name: 'シグ', cls: '詐欺師', emoji: '🎩',
    desc: 'お金儲けが大好きなちゃっかり者。口が上手く、情報収集が得意。',
    joinLocId: 'mirea',
    joinText: '「へへ、封印石探しか。俺、情報網があるんだよね。一緒に行けば得するよ、絶対。」',
    baseHp: 68, baseMp: 45, baseAtk: 14, baseDef: 9, baseSpd: 14, joinLevel: 3,
    hpGrowth: 7, mpGrowth: 5, atkGrowth: 1, defGrowth: 1, spdGrowth: 3,
    skills: [
      { id: 'smoke_screen', name: '煙幕', desc: '煙幕を張り敵全体の攻撃力を下げる。', mpCost: 6, target: 'enemy_all', effect: 'debuff_atk', power: 1 },
      { id: 'vital_strike', name: '急所突き', desc: '急所を正確に狙いスタン状態にする。', mpCost: 10, target: 'enemy_one', effect: 'stun', power: 1.8 },
    ],
  },
  elk: {
    id: 'elk', name: 'エルク', cls: '獣人・槍使い', emoji: '🐺',
    desc: '寡黙でクール。戦闘能力が高く、仲間を守ることに忠実。後半合流のため高スペック。',
    joinLocId: 'dragon_pass',
    joinText: '「……お前たちは強い。この峠を越えるなら俺が案内しよう。ついでに旅に加わる。」',
    baseHp: 105, baseMp: 28, baseAtk: 24, baseDef: 14, baseSpd: 14, joinLevel: 5,
    hpGrowth: 11, mpGrowth: 3, atkGrowth: 3, defGrowth: 2, spdGrowth: 2,
    skills: [
      { id: 'wolf_claw', name: '狼の爪', desc: '鋭い爪で敵1体を切り裂く。', mpCost: 8, target: 'enemy_one', effect: 'damage', power: 2.1 },
      { id: 'pack_howl', name: '群狼の咆哮', desc: '魂の咆哮で敵全体の攻撃力を大幅に下げる。', mpCost: 10, target: 'enemy_all', effect: 'debuff_atk', power: 2 },
    ],
  },
  mira: {
    id: 'mira', name: 'ミラ', cls: 'エルフ・弓術士', emoji: '🌿',
    desc: '森の民の出身。自然を愛し、穏やかで思慮深い性格。MP・速度が最高クラスのレアキャラ。',
    joinLocId: 'ancient_temple',
    joinText: '「古代神殿を守ってきた。……あなたならば封印石を任せられる。共に行きましょう。」',
    baseHp: 75, baseMp: 70, baseAtk: 20, baseDef: 11, baseSpd: 16, joinLevel: 5,
    hpGrowth: 8, mpGrowth: 8, atkGrowth: 2, defGrowth: 1, spdGrowth: 2,
    skills: [
      { id: 'spirit_arrow', name: '精霊の矢', desc: '精霊の力が宿る矢。敵1体に大ダメージ。', mpCost: 9, target: 'enemy_one', effect: 'damage', power: 2.3 },
      { id: 'forest_blessing', name: '森の加護', desc: '自然の加護で味方全体の防御力を上昇。', mpCost: 12, target: 'ally_all', effect: 'def_up', power: 1 },
    ],
  },
  zeno: {
    id: 'zeno', name: 'ゼノ', cls: '魔族', emoji: '😈',
    desc: '最も強力な隠しキャラ。交易所に潜伏中の謎の魔族。全ステータスが最高クラスで、強力な魔族スキルを持つ。',
    joinLocId: 'trading_post',
    joinText: '「魔王の使いじゃない。奴を倒したい理由が、俺にもある。……一時的な同盟だ。」',
    baseHp: 110, baseMp: 110, baseAtk: 32, baseDef: 16, baseSpd: 15, joinLevel: 7,
    isHidden: true,
    hpGrowth: 10, mpGrowth: 11, atkGrowth: 4, defGrowth: 2, spdGrowth: 1,
    skills: [
      { id: 'demon_power', name: '魔族の力', desc: '魔族の秘めた力を解放し敵1体を粉砕。', mpCost: 15, target: 'enemy_one', effect: 'damage', power: 3.5 },
      { id: 'demon_gate', name: '魔界門', desc: '魔界の門を開き敵全体に猛攻撃。', mpCost: 18, target: 'enemy_all', effect: 'damage', power: 2.0 },
    ],
    learnableSkills: [
      { level: 8, skill: { id: 'demon_release', name: '魔族解放', desc: '魔族の真の力を解放。自身の攻撃力を大幅に上昇させる。', mpCost: 14, target: 'self', effect: 'atk_up', power: 1 } },
    ],
  },
}

// ===== ENEMIES =====
export const ENEMIES: Record<string, EnemyDef> = {
  // 序盤
  wolf: {
    id: 'wolf', name: '山狼', emoji: '🐺',
    hp: 32, mp: 0, atk: 9, def: 4, spd: 10,
    skills: [], exp: 16, gold: 10,
  },
  goblin: {
    id: 'goblin', name: 'ゴブリン兵', emoji: '👺',
    hp: 45, mp: 10, atk: 12, def: 6, spd: 9,
    skills: [{ id: 'stab', name: '突き', desc: '素早い刺突。', mpCost: 4, target: 'enemy_one', effect: 'damage', power: 1.3 }],
    exp: 24, gold: 18,
  },
  bandit: {
    id: 'bandit', name: '盗賊', emoji: '🗡️',
    hp: 50, mp: 15, atk: 14, def: 7, spd: 12,
    skills: [{ id: 'poison_knife', name: '毒ナイフ', desc: '毒を塗った刃。', mpCost: 5, target: 'enemy_one', effect: 'poison', power: 1.0 }],
    exp: 28, gold: 24,
  },
  // 中盤
  fire_elemental: {
    id: 'fire_elemental', name: '炎精霊', emoji: '🔥',
    hp: 60, mp: 30, atk: 17, def: 8, spd: 11,
    skills: [{ id: 'fire_blast', name: '炎弾', desc: '炎の塊を放つ。', mpCost: 8, target: 'enemy_one', effect: 'damage', power: 1.7 }],
    exp: 40, gold: 32,
  },
  mine_golem: {
    id: 'mine_golem', name: '鉱山ゴーレム', emoji: '⛏️',
    hp: 80, mp: 0, atk: 18, def: 14, spd: 5,
    skills: [], exp: 46, gold: 36,
  },
  storm_bird: {
    id: 'storm_bird', name: '嵐鳥', emoji: '🦅',
    hp: 55, mp: 20, atk: 20, def: 6, spd: 18,
    skills: [{ id: 'gale', name: '旋風', desc: '翼で竜巻を起こす。', mpCost: 8, target: 'enemy_all', effect: 'damage', power: 1.1 }],
    exp: 36, gold: 28,
  },
  desert_scorpion: {
    id: 'desert_scorpion', name: '砂漠サソリ', emoji: '🦂',
    hp: 65, mp: 10, atk: 19, def: 9, spd: 13,
    skills: [{ id: 'sting', name: '猛毒の針', desc: '強力な毒を注入する。', mpCost: 6, target: 'enemy_one', effect: 'poison', power: 1.1 }],
    exp: 42, gold: 34,
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
    exp: 495, gold: 180, isBoss: true, sealStone: 'dark',
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
    exp: 225, gold: 100, isBoss: true,
  },
  mine_king: {
    id: 'mine_king', name: '鉱王グラドル', emoji: '💎',
    hp: 250, mp: 60, atk: 29, def: 20, spd: 8,
    skills: [
      { id: 'crystal_rush', name: 'クリスタルラッシュ', desc: '水晶の刃で全体を切り裂く。', mpCost: 14, target: 'enemy_all', effect: 'damage', power: 1.3 },
      { id: 'ore_shield', name: '鉱石の盾', desc: '鉱石の盾で防御力を大幅に上げる。', mpCost: 10, target: 'self', effect: 'def_up', power: 1 },
      { id: 'daichi_no_ikari', name: '大地の怒り', desc: '大地を揺らし1体に超強力な一撃。', mpCost: 16, target: 'enemy_one', effect: 'damage', power: 2.8 },
    ],
    exp: 450, gold: 160, isBoss: true, sealStone: 'fire',
  },
  storm_dragon: {
    id: 'storm_dragon', name: '嵐竜ストームレックス', emoji: '🌩️',
    hp: 340, mp: 80, atk: 30, def: 13, spd: 17,
    skills: [
      { id: 'storm_blast', name: '嵐の爆風', desc: '全体に嵐ダメージ。', mpCost: 14, target: 'enemy_all', effect: 'damage', power: 1.4 },
      { id: 'lightning_dive', name: '雷撃落とし', desc: '1体に超強力な雷。', mpCost: 12, target: 'enemy_one', effect: 'damage', power: 2.6 },
    ],
    exp: 420, gold: 150, isBoss: true, sealStone: 'storm',
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
    hp: 460, mp: 150, atk: 36, def: 20, spd: 14,
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
    desc: 'ベルンとサハルを結ぶ中間の交易拠点。東西の商品が集まり、情報も豊富。盗賊アジトへの入口でもある。謎の魔族が潜んでいるという噂も。',
    connections: ['bern', 'checkpoint', 'bandit_hideout', 'sahal'],
    travelDays: { bern: 1, checkpoint: 2, bandit_hideout: 2, sahal: 2 },
    companionId: 'zeno',
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
    desc: '砂漠の奥に眠る古代遺跡。世界の記録を刻む終末記録体アーカイブが待ち受ける禁断の地。3つの封印石を持つ者だけが真の決戦に挑める。',
    connections: ['sahal'],
    travelDays: { sahal: 3 },
    enemyPool: ['sabotenu', 'sunabukuro', 'hibikamen', 'mizunomin', 'ruins_guardian', 'tsugihagi_hei', 'baketsu_hei', 'memo_hei', 'sansec_general', 'mirror_lady', 'ito_kiri'],
    bossId: 'archive',
    requireAllStones: true,
  },
}

// Lv20クリア目標。Lv20到達必要EXP: 190 * 15 = 2850
export function getExpToNext(level: number): number {
  return level * 15
}

export function getDifficultyMultiplier(difficulty: string): { days: number; enemyHpMult: number; playerHpMult: number } {
  switch (difficulty) {
    case 'easy':  return { days: 120, enemyHpMult: 0.7,  playerHpMult: 1.3 }
    case 'hard':  return { days: 80,  enemyHpMult: 1.4,  playerHpMult: 0.8 }
    default:      return { days: 100, enemyHpMult: 1.0,  playerHpMult: 1.0 }
  }
}

// ===== EVENTS (パワポケ4スタイル: 条件付きイベント) =====
export const EVENTS: GameEvent[] = [
  {
    id: 'alseria_gares_homecoming', title: 'ガレスの帰還',
    condition: { atLoc: 'alseria', requiredCompanions: ['gares'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: 'アルセリア王都。かつてこの国を守った騎士団の本拠地。ガレスは城門の前で足を止めた。' },
      { speaker: 'gares', speakerName: 'ガレス', text: '……久しぶりだな。この城の門構えは変わらない。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ガレス、あなたはここで騎士団長を務めていたんですよね？' },
      { speaker: 'gares', speakerName: 'ガレス', text: '三年前まではな。だが魔王の呪いで仲間を次々と失い……俺は団長の資格を失った。' },
      { speaker: 'gares', speakerName: 'ガレス', text: '今は違う。お前と共に戦うことで、あの日の誓いを果たせる。…行くぞ、レオン。' },
      { speaker: 'narrator', speakerName: '', text: 'ガレスの瞳に、かつての騎士の炎が戻った気がした。' },
    ],
    reward: { exp: 30, message: 'ガレスとの絆が深まった！（EXP +30）' },
  },
  {
    id: 'alseria_liz_prayer', title: 'リズの祈り',
    condition: { atLoc: 'alseria', requiredCompanions: ['liz'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '王都の礼拝堂。リズは静かに祭壇の前に膝をついた。' },
      { speaker: 'liz', speakerName: 'リズ', text: '……神様。どうか、このルミナ大陸に平和をお与えください。' },
      { speaker: 'player', speakerName: 'レオン', text: 'リズ……いつもそんな風に祈ってるんですか？' },
      { speaker: 'liz', speakerName: 'リズ', text: 'ええ。でも今日は少し違います。……あなたのために、祈っています。' },
      { speaker: 'liz', speakerName: 'リズ', text: '封印石を集める旅は危険です。でも私は信じています。あなたなら必ずできる。' },
      { speaker: 'player', speakerName: 'レオン', text: 'リズ……ありがとう。必ずやり遂げてみせます。' },
    ],
    reward: { exp: 20, message: 'リズの祈りで心が安らいだ！（EXP +20）' },
  },
  {
    id: 'bern_noa_market', title: 'ノアと商業都市',
    condition: { atLoc: 'bern', requiredCompanions: ['noa'] },
    dialogues: [
      { speaker: 'noa', speakerName: 'ノア', text: 'うわあ！すごい！めちゃくちゃ賑わってる！こんな大きな市場、生まれて初めて見た！' },
      { speaker: 'player', speakerName: 'レオン', text: 'ここはルミナ大陸最大の商業都市だからね。' },
      { speaker: 'noa', speakerName: 'ノア', text: 'ちょっと待って、あそこの屋台めっちゃ旨そう！…レオン、お金ちょっと貸してくれない？' },
      { speaker: 'noa', speakerName: 'ノア', text: 'ヘヘ！あ、そうだ！さっきの商人が言ってた。北の廃鉱山に強い魔物が増えてるって！気をつけて行こうぜ！' },
    ],
    reward: { gold: 60, message: '商人との縁でゴールドを得た！（+60G）' },
  },
  {
    id: 'galdo_cecil_library', title: 'セシルの魔法塔',
    condition: { atLoc: 'galdo', requiredCompanions: ['cecil'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: 'ガルドの奥、山間に建つ魔法塔。セシルはここにかつて暮らしていた。' },
      { speaker: 'cecil', speakerName: 'セシル', text: 'ここが私の研究室があった塔。…懐かしい。' },
      { speaker: 'player', speakerName: 'レオン', text: 'セシル、なんでここを出たんですか？' },
      { speaker: 'cecil', speakerName: 'セシル', text: '…魔王の封印が解けると知ったから。塔で研究するより、現場に出た方が役に立てると思って。' },
      { speaker: 'cecil', speakerName: 'セシル', text: '私は感情が苦手。でも、あなたを見ていると……なんというか。不思議な気持ちになる。' },
    ],
    reward: { exp: 50, message: 'セシルが封印の知識を共有した！（EXP +50）' },
  },
  {
    id: 'elna_bram_hometown', title: 'ブラムの故郷',
    condition: { atLoc: 'elna', requiredCompanions: ['bram'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '森の里エルナ。ブラムは懐かしそうに木々を見上げた。' },
      { speaker: 'bram', speakerName: 'ブラム', text: 'ガッハッハ！ここだここだ！俺の故郷！懐かしい匂いがする！' },
      { speaker: 'bram', speakerName: 'ブラム', text: '……実はな、親父がここに住んでいた。魔物にやられちまったんだ、昔。だから俺は旅に出た。' },
      { speaker: 'bram', speakerName: 'ブラム', text: '魔王を倒すことは……親父への誓いでもある。レオン、頼んだぞ！' },
    ],
    reward: { exp: 40, gold: 30, message: 'ブラムの気合いで全員鼓舞！（EXP +40, +30G）' },
  },
  {
    id: 'riverside_finn_dream', title: 'フィンの夢',
    condition: { atLoc: 'riverside', requiredCompanions: ['finn'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '夕暮れの川辺。フィンは静かに川を見つめていた。' },
      { speaker: 'finn', speakerName: 'フィン', text: '……なあレオンさん、俺、子供の頃からずっと夢があって。' },
      { speaker: 'finn', speakerName: 'フィン', text: '「伝説の冒険者」になること！昔、旅の人が話してくれた冒険譚がすごくかっこよくて。俺もそうなりたいって。' },
      { speaker: 'player', speakerName: 'レオン', text: 'フィン……必ず一緒に伝説を作ろう。' },
    ],
    reward: { exp: 35, message: 'フィンの気持ちが通じた！（EXP +35）' },
  },
  {
    id: 'demon_mine_iris_confession', title: 'イリスの告白',
    condition: { atLoc: 'demon_mine', requiredCompanions: ['iris'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '廃鉱山の深部。イリスは古い魔法陣の前で立ち止まった。' },
      { speaker: 'iris', speakerName: 'イリス', text: '……ここは、私が魔王軍として初めて使役魔法を使った場所。' },
      { speaker: 'iris', speakerName: 'イリス', text: 'いいえ。ここに来たかったの。……ちゃんとけじめをつけたかった。' },
      { speaker: 'iris', speakerName: 'イリス', text: '私は過去から逃げ続けていた。でもあなたと一緒に魔王を倒せば、少しは贖罪になれるかもしれない。' },
      { speaker: 'player', speakerName: 'レオン', text: '過去は変えられない。でも今のあなたは確かに仲間だ。それで十分です。' },
    ],
    reward: { exp: 60, message: 'イリスの力が目覚めた！（EXP +60）' },
  },
  {
    id: 'bandit_hideout_vais_past', title: 'ヴァイスの傷跡',
    condition: { atLoc: 'bandit_hideout', requiredCompanions: ['vais'] },
    dialogues: [
      { speaker: 'vais', speakerName: 'ヴァイス', text: 'チッ……まだこいつらの巣がある。' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '……ある。俺はここの盗賊団の一員だった。昔の話だ。' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '仲間だと思ってたやつらに裏切られた。金のために俺を売った。……だから俺は人を信じない。' },
      { speaker: 'player', speakerName: 'レオン', text: 'でも今、あなたはここにいる。信じることを諦めてないから、でしょう？' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '……うるせえ。でも……悪くない、とは思ってる。今の旅が。' },
    ],
    reward: { exp: 55, message: 'ヴァイスの技が研ぎ澄まされた！（EXP +55）' },
  },
  {
    id: 'sahal_logan_atonement', title: 'ローガンの贖罪',
    condition: { atLoc: 'sahal', requiredCompanions: ['logan'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: 'サハルの砂漠市場。ローガンは見覚えのある顔を見つけ、立ち止まった。' },
      { speaker: 'logan', speakerName: 'ローガン', text: '……私はかつて、あなたの息子を処刑した者です。' },
      { speaker: 'narrator', speakerName: '', text: '老婆は長い沈黙の後、ゆっくりとローガンの手を握った。' },
      { speaker: 'logan', speakerName: 'ローガン', text: 'レオン……私が旅に出た理由は、力だけじゃない。罪を背負って生きることの意味を、探している。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ローガンさん……あなたの力は今、世界を救うために使われている。それもまた、贖罪になるはずです。' },
    ],
    reward: { exp: 65, message: 'ローガンの決意が固まった！（EXP +65）' },
  },
  {
    id: 'mirea_sig_identity', title: 'シグの秘密',
    condition: { atLoc: 'mirea', requiredCompanions: ['sig'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: 'ミレア港。夕日が海を赤く染める中、シグは港の一隅で海を見つめていた。' },
      { speaker: 'sig', speakerName: 'シグ', text: '…この海か。五年ぶりだな。' },
      { speaker: 'sig', speakerName: 'シグ', text: 'まあね。……実はさ。俺、本当は商人の息子なんだ。親父が海賊に船を沈められてね。全部無くした。' },
      { speaker: 'sig', speakerName: 'シグ', text: 'だから詐欺師をやって生きてきた。でもそれも、いつか親父の夢だった商船を買うための金を稼ぐためで。' },
      { speaker: 'player', speakerName: 'レオン', text: 'シグ……その夢、諦めるなよ。魔王を倒したら、一緒に考えよう。' },
    ],
    reward: { gold: 80, message: 'シグが隠し財産を分けてくれた！（+80G）' },
  },
  {
    id: 'dragon_pass_elk_clan', title: 'エルクの誓い',
    condition: { atLoc: 'dragon_pass', requiredCompanions: ['elk'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '嵐吹き荒れる竜の峠。エルクは峠の頂で大きく深呼吸をした。' },
      { speaker: 'elk', speakerName: 'エルク', text: 'ここは……俺の一族の地だった。百年前、魔王に滅ぼされた。' },
      { speaker: 'elk', speakerName: 'エルク', text: 'いい。この峠を守ることは、一族への誓いだ。……だが今は、より大きな戦いがある。' },
      { speaker: 'elk', speakerName: 'エルク', text: 'お前と共に魔王を倒すことで、一族の魂も報われる。俺の槍、全力で振るう。' },
    ],
    reward: { exp: 70, message: 'エルクの獣人の力が覚醒した！（EXP +70）' },
  },
  {
    id: 'ancient_temple_mira_seal_history', title: '封印の歴史',
    condition: { atLoc: 'ancient_temple', requiredCompanions: ['mira'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '月光差し込む古代神殿。ミラは祭壇の前で静かに語り始めた。' },
      { speaker: 'mira', speakerName: 'ミラ', text: '三百年前、七人の賢者が世界を救うために魔王の力を三つに分けて封じた。それが炎・嵐・闇の封印石。' },
      { speaker: 'mira', speakerName: 'ミラ', text: 'その勇者こそが……あなただと、古文書は記している。レオン。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ミラ……俺が、勇者？' },
      { speaker: 'narrator', speakerName: '', text: '封印石が淡く輝いた。レオンの中で何かが目覚めていく感覚があった。' },
    ],
    reward: { exp: 80, message: '封印の真実が明かされた！（EXP +80）' },
  },
  {
    id: 'trading_post_zeno_revelation', title: 'ゼノの真実',
    condition: { atLoc: 'trading_post', requiredCompanions: ['zeno'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '交易所の外れ。ゼノが静かに夜空を見上げながら言った。' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: 'お前はなぜ、魔王を倒そうとする。正義か？使命か？' },
      { speaker: 'player', speakerName: 'レオン', text: 'みんなを守るため。それだけだ。' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '……そういうことか。私は魔族だが魔王の考えには賛同できない。強者が弱者を踏みにじるだけの世界など、価値がない。' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '一つ教えよう。砂漠遺跡の最奥、終末記録体の弱点は封印石の共鳴だ。封印解放スキルで仕留めろ。' },
    ],
    reward: { exp: 100, message: 'ゼノから戦術を学んだ！（EXP +100）' },
  },
  {
    id: 'spirit_spring_healing_miracle', title: '精霊の祝福',
    condition: { atLoc: 'spirit_spring' },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '精霊の泉。水面が青白く輝き、小さな光の粒子が漂っている。' },
      { speaker: 'narrator', speakerName: '精霊', text: '「勇者よ。汝の旅の意志を感じた。我らが加護を受けよ……」' },
      { speaker: 'narrator', speakerName: '', text: '温かな光がパーティ全員を包み込んだ。傷が癒え、疲れが消えていく。' },
    ],
    reward: { exp: 25, message: '精霊の祝福で回復した！（EXP +25）' },
  },
  {
    id: 'great_bridge_merchant_encounter', title: '怪しい商人',
    condition: { atLoc: 'great_bridge', minDaysLeft: 70 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '大橋の上。フードを深くかぶった商人が荷車を止めて待っていた。' },
      { speaker: 'narrator', speakerName: '怪しい商人', text: '「旅人よ。私はルミナ中を旅する商人。良いものをお見せしましょう……」' },
      { speaker: 'narrator', speakerName: '', text: '商人は特製のハイポーションを渡してくれた。本物だった。' },
    ],
    reward: { itemId: 'hi_potion', itemQty: 2, message: '特製ハイポーションを2本入手！' },
  },
  {
    id: 'traveler_inn_rumor_about_seals', title: '旅人の噂話',
    condition: { atLoc: 'traveler_inn', maxDaysLeft: 90 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '旅人の宿の酒場。冒険者風の男が声をかけてきた。' },
      { speaker: 'narrator', speakerName: '旅の冒険者', text: '「おい、お前さん封印石を探してるだろう？俺にはわかる。」' },
      { speaker: 'narrator', speakerName: '冒険者', text: '「廃鉱山と竜の峠は特に手強い。ボスは封印解放を使え。」' },
      { speaker: 'narrator', speakerName: '', text: '先人の言葉が重くのしかかった。でも同時に、力をもらった気がした。' },
    ],
    reward: { gold: 50, message: '先人の餞別を受け取った！（+50G）' },
  },
]
