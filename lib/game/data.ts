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
    desc: '元王都の騎士団長。誇り高く真面目で面倒見が良い。東関所で旅人の安全を守りながら機会を窺っている。',
    joinLocId: 'checkpoint',
    joinText: '「旅人か。……封印石を探しているとは感じていた。俺はガレス。元騎士団長だ。共に行こう。」',
    baseHp: 130, baseMp: 25, baseAtk: 14, baseDef: 20, baseSpd: 6, joinLevel: 2,
    hpGrowth: 15, mpGrowth: 2, atkGrowth: 2, defGrowth: 4, spdGrowth: 0,
    skills: [
      { id: 'shield_bash', name: '盾撃', desc: '盾で敵をスタンさせる。', mpCost: 6, target: 'enemy_one', effect: 'stun', power: 1.2 },
      { id: 'iron_wall', name: '鉄壁', desc: '自分の防御力を大幅に上昇させる。', mpCost: 8, target: 'self', effect: 'def_up', power: 1 },
      { id: 'provoke', name: '挑発', desc: '敵を挑発して攻撃力を下げる。自身のDEFも上昇。', mpCost: 10, target: 'enemy_all', effect: 'debuff_atk', power: 1 },
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

// PP4スタイル値上がりシステム：10日消費ごとに1割UP（最大5割UP）
export function getItemPrice(itemId: string, daysLeft: number, totalDays = 100): number {
  const item = ITEMS[itemId]
  if (!item) return 0
  const daysSpent = totalDays - daysLeft
  const tiers = Math.min(5, Math.floor(daysSpent / 10))
  return Math.floor(item.price * (1 + tiers * 0.1))
}

// 宿屋も同じ値上がりシステム（基本50G）
export function getInnPrice(daysLeft: number, totalDays = 100): number {
  const daysSpent = totalDays - daysLeft
  const tiers = Math.min(5, Math.floor(daysSpent / 10))
  return Math.floor(50 * (1 + tiers * 0.1))
}

// ===== LOCATIONS (ルミナ大陸) =====
export const LOCATIONS: Record<LocationId, LocationDef> = {
  // ===== 6 TOWNS =====
  alseria: {
    id: 'alseria', name: 'アルセリア王都', emoji: '🏰',
    type: 'town',
    desc: 'ルミナ大陸の中心に位置する王国の首都。封印石の探索はここから始まる。騎士団が守る堅牢な城壁都市。礼拝堂では神官リズが人々を癒している。',
    connections: ['traveler_inn', 'checkpoint', 'great_bridge'],
    travelDays: { traveler_inn: 1, checkpoint: 1, great_bridge: 2 },
    companionId: 'liz',
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
    desc: 'アルセリアとベルンを結ぶ東の交通の要衝。往来する商人と旅人を監視している。元騎士団長ガレスがここで旅人の護衛をしているという噂がある。',
    connections: ['alseria', 'bern'],
    travelDays: { alseria: 1, bern: 2 },
    companionId: 'gares',
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
    type: 'dungeon',
    desc: '南西の岬に立つ古い灯台。海の魔物が棲みつき、地下には潮王ネブラが支配する異空間が広がる。入口には小さな商人が店を開いている。',
    connections: ['mirea', 'riverside'],
    travelDays: { mirea: 1, riverside: 1 },
    shopItems: ['potion', 'antidote'],
    enemyPool: ['poyogaeru', 'yadotsubo', 'mokumokumo', 'kuchipaku'],
    bossId: 'tidal_king',
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
    enemyPool: ['goromin', 'tsuru_hammer', 'kabemimi', 'ganseki_bou', 'fire_elemental', 'mine_golem'],
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
    enemyPool: ['goromin', 'tsuru_hammer', 'kabemimi', 'ganseki_bou', 'storm_bird'],
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
    enemyPool: ['sabotenu', 'sunabukuro', 'hibikamen', 'mizunomin', 'ruins_guardian', 'tsugihagi_hei', 'baketsu_hei', 'memo_hei', 'sansec_general', 'mirror_lady', 'ito_kiri', 'desert_scorpion'],
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

  // ===== チュートリアルイベント（最初のアルセリア到着時） =====
  {
    id: 'alseria_tutorial', title: '勇者の旅立ち',
    condition: { atLoc: 'alseria', minDaysLeft: 70 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: 'ルミナ大陸の中心、アルセリア王都。あなたの旅はここから始まる。' },
      { speaker: 'narrator', speakerName: '老賢者', text: '「若き勇者よ。三つの封印石を集め、魔王の力を封じよ。炎・嵐・闇の石が各地に眠っている。」' },
      { speaker: 'narrator', speakerName: '老賢者', text: '「北の廃鉱山に炎の石、北東の竜の峠に嵐の石、南の古代神殿に闇の石がある。仲間を集め、力をつけて挑め。」' },
      { speaker: 'narrator', speakerName: '老賢者', text: '「まずは西の東関所を経由してガルドの町へ。廃鉱山はガルドから北に続く。仲間はここアルセリアや各地の町で出会えるぞ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '……わかった。まずガルドを目指す。必ず三つ揃えて魔王を倒す！' },
      { speaker: 'narrator', speakerName: '', text: 'いざ、旅を始めよう。マップ画面の拠点をタップして移動できる。仲間との絆がこの旅を支える。' },
    ],
    reward: { exp: 20, message: '✨ 旅の目的を確認した！（EXP +20）' },
  },


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
    reward: { exp: 25, fullHeal: true, message: '✨ 精霊の祝福でパーティ全員のHP/MPが全回復！（EXP +25）' },
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

  // ===== 連続イベント Stage2（各仲間） =====

  {
    id: 'bern_gares_shadow', title: 'ガレスの追跡',
    condition: { atLoc: 'bern', requiredCompanions: ['gares'], requiredEventCompleted: ['alseria_gares_homecoming'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: 'ベルン商業都市の裏通り。ガレスが足を止め、鋭い視線を路地に向けた。' },
      { speaker: 'gares', speakerName: 'ガレス', text: '……付けられている。魔王軍の斥候だ。' },
      { speaker: 'player', speakerName: 'レオン', text: 'わかりますか、ガレス？' },
      { speaker: 'gares', speakerName: 'ガレス', text: '三年間、戦場を渡り歩いた勘だ。俺たちが封印石を集めているのを奴らは知っている。急がねば。' },
      { speaker: 'gares', speakerName: 'ガレス', text: '……レオン。もし俺が倒れても、旅を続けてくれ。それが俺の唯一の願いだ。' },
      { speaker: 'player', speakerName: 'レオン', text: '倒れる前提の話はやめてください。俺たちは必ず一緒に終わらせる。' },
    ],
    reward: { exp: 45, message: 'ガレスとの信頼が深まった！（EXP +45）' },
  },
  {
    id: 'elna_gares_final_oath', title: '騎士の最終誓い',
    condition: { atLoc: 'elna', requiredCompanions: ['gares'], requiredEventCompleted: ['bern_gares_shadow'], minPlayerLevel: 10 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: 'エルナの里の森の泉。ガレスは剣を水面にかざし、静かに目を閉じた。' },
      { speaker: 'gares', speakerName: 'ガレス', text: '騎士として誓いを新たにする……レオンと共に、必ず三つの封印石を集め魔王を倒す。この剣に誓って。' },
      { speaker: 'narrator', speakerName: '', text: 'ガレスの剣が微かに輝いた。どこかから祝福の風が吹いた気がした。' },
      { speaker: 'gares', speakerName: 'ガレス', text: 'レオン……俺はお前を誇りに思う。こんな言葉を言う日が来るとは思わなかったが。' },
    ],
    reward: { exp: 80, message: 'ガレスの誓いで力が漲った！（EXP +80）' },
  },

  {
    id: 'great_bridge_liz_child', title: 'リズと迷子',
    condition: { atLoc: 'great_bridge', requiredCompanions: ['liz'], requiredEventCompleted: ['alseria_liz_prayer'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '大橋の上。泣いている小さな子供がいた。リズはすぐに駆け寄った。' },
      { speaker: 'liz', speakerName: 'リズ', text: '大丈夫？どこから来たの？…怖くないよ。' },
      { speaker: 'narrator', speakerName: '', text: '子供はリズに抱きついた。しばらくして、心配した両親が橋を走ってきた。' },
      { speaker: 'liz', speakerName: 'リズ', text: 'よかった……神様のお導きね。' },
      { speaker: 'player', speakerName: 'レオン', text: 'リズはいつも、困っている人を放っておけないんですね。' },
      { speaker: 'liz', speakerName: 'リズ', text: '……そうかもしれません。でも、誰かの笑顔を見るのが好きなんです。それがあれば、どんな旅でも乗り越えられる気がして。' },
    ],
    reward: { exp: 40, message: 'リズの優しさが心に染みた！（EXP +40）' },
  },
  {
    id: 'spirit_spring_liz_miracle', title: '癒しの奇跡',
    condition: { atLoc: 'spirit_spring', requiredCompanions: ['liz'], requiredEventCompleted: ['great_bridge_liz_child'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '精霊の泉。リズは手を泉に浸し、静かに祈り始めた。' },
      { speaker: 'liz', speakerName: 'リズ', text: '……神様。この旅のみんなをお守りください。' },
      { speaker: 'narrator', speakerName: '', text: '泉が眩しく輝き、温かな光がパーティを包んだ。傷ついていた体が癒され、疲れが消えていく。' },
      { speaker: 'player', speakerName: 'レオン', text: 'リズ……これは？' },
      { speaker: 'liz', speakerName: 'リズ', text: '精霊の力を少し借りました。……みんなのために、私にできる最大のことです。' },
    ],
    reward: { exp: 70, fullHeal: true, itemId: 'panacea', itemQty: 2, message: '✨ リズの奇跡でパーティ全員のHP/MPが全回復！（EXP +70・万能薬×2）' },
  },

  {
    id: 'watchtower_noa_rival', title: 'ノアのライバル',
    condition: { atLoc: 'watchtower', requiredCompanions: ['noa'], requiredEventCompleted: ['bern_noa_market'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '見張り塔の展望台。ノアは遠くの的を見つめ、弓を構えた。' },
      { speaker: 'noa', speakerName: 'ノア', text: '……俺、昔は弓の大会で負けてばかりだったんだよ。同い年の奴に。' },
      { speaker: 'player', speakerName: 'レオン', text: '今のあなたを見て、信じられますか？' },
      { speaker: 'noa', speakerName: 'ノア', text: 'ははっ、そうだよな！あいつを見返すために毎日練習したんだ。今なら絶対負けない！……あ、遠くに魔王軍の旗が見える。急ごう！' },
    ],
    reward: { exp: 35, message: 'ノアの射撃精度が増した！（EXP +35）' },
  },

  {
    id: 'traveler_inn_cecil_research', title: 'セシルの研究',
    condition: { atLoc: 'traveler_inn', requiredCompanions: ['cecil'], requiredEventCompleted: ['galdo_cecil_library'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '夜の宿屋。セシルは古い羊皮紙を広げ、熱心に何かを書き込んでいた。' },
      { speaker: 'player', speakerName: 'レオン', text: 'セシル、まだ起きていたんですか？' },
      { speaker: 'cecil', speakerName: 'セシル', text: '……封印石の共鳴を解析していた。三つ揃えば力が指数関数的に増大する。魔王軍がそれを恐れているのは正しい。' },
      { speaker: 'cecil', speakerName: 'セシル', text: 'あなたには正直に言う。……この旅、私は論理的に勝率を計算していた。でも今は違う計算をしている。' },
      { speaker: 'player', speakerName: 'レオン', text: '違う計算？' },
      { speaker: 'cecil', speakerName: 'セシル', text: '……あなたがいれば、勝てると。根拠はない。でも確かに、そう感じている。' },
    ],
    reward: { exp: 55, message: 'セシルの魔法理論を聞いた！（EXP +55）' },
  },

  {
    id: 'forest_entrance_bram_wrestle', title: 'ブラムの鍛錬',
    condition: { atLoc: 'forest_entrance', requiredCompanions: ['bram'], requiredEventCompleted: ['elna_bram_hometown'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '森の入口。ブラムが大きな岩を素手で持ち上げようとしている。' },
      { speaker: 'bram', speakerName: 'ブラム', text: 'ガッハッハ！これくらいの岩、ちょろいぜ！……ぬっ！……んんん！！' },
      { speaker: 'narrator', speakerName: '', text: '轟音と共に岩が転がった。ブラムは汗だくで笑っている。' },
      { speaker: 'player', speakerName: 'レオン', text: 'いつもそんなに鍛えてるんですか？' },
      { speaker: 'bram', speakerName: 'ブラム', text: '当然だ！魔王を倒すには力がいる。お前も鍛えるか？……まあ、俺ほどには無理だろうけどな！ガッハッハ！' },
    ],
    reward: { exp: 30, message: 'ブラムと鍛錬した！（EXP +30）' },
  },

  {
    id: 'checkpoint_finn_resolve', title: 'フィンの決意',
    condition: { atLoc: 'checkpoint', requiredCompanions: ['finn'], requiredEventCompleted: ['riverside_finn_dream'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '東関所の外れ。フィンが真剣な表情で剣の素振りをしていた。' },
      { speaker: 'player', speakerName: 'レオン', text: 'フィン、一人で何をしてるんだ？' },
      { speaker: 'finn', speakerName: 'フィン', text: 'あ、レオンさん！……俺、もっと強くなりたくて。いつまでも足を引っ張りたくないから。' },
      { speaker: 'finn', speakerName: 'フィン', text: 'ここまで連れてきてもらって……俺、変わりたいんです。本物の冒険者に。' },
      { speaker: 'player', speakerName: 'レオン', text: 'フィン……その気持ち、絶対に諦めるな。お前は確実に強くなってる。' },
      { speaker: 'finn', speakerName: 'フィン', text: 'ありがとうございます！絶対に一人前になります！！' },
    ],
    reward: { exp: 40, message: 'フィンが一回り成長した！（EXP +40）' },
  },

  {
    id: 'trading_post_vais_secret', title: 'ヴァイスの隠し財産',
    condition: { atLoc: 'trading_post', requiredCompanions: ['vais'], requiredEventCompleted: ['bandit_hideout_vais_past'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '交易所の裏手。ヴァイスが建物の壁を指でなぞり、ある場所で止まった。' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: 'ここだ。……ちょっと待ってろ。' },
      { speaker: 'narrator', speakerName: '', text: '石を外すと、小さな布袋が現れた。ヴァイスは舌打ちしつつも、口元が緩んでいる。' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '昔の非常用資金だ。……使ってやる。お前たちのために。勘違いするなよ、俺の気まぐれだ。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ヴァイス……ありがとう。' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: 'だから感謝すんなって言ってんだろ。……うるさい奴だ。でも……まあ、悪くはないな。' },
    ],
    reward: { gold: 150, exp: 30, message: 'ヴァイスから隠し財産を受け取った！（+150G, EXP +30）' },
  },

  {
    id: 'coastal_road_logan_past', title: 'ローガンの回想',
    condition: { atLoc: 'coastal_road', requiredCompanions: ['logan'], requiredEventCompleted: ['sahal_logan_atonement'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '海岸街道。波音の中で、ローガンが沖を見つめながら口を開いた。' },
      { speaker: 'logan', speakerName: 'ローガン', text: '……私は十五年、処刑人を続けた。正義のためと信じて。だが、魔王の呪いで国が混乱し、無実の者も多く裁いた。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ローガンさん……' },
      { speaker: 'logan', speakerName: 'ローガン', text: '今さら慰めは要らない。ただ……魔王を倒すことが、私の最後の「正しいこと」だと信じている。あなたと一緒なら、それができる気がする。' },
    ],
    reward: { exp: 60, message: 'ローガンの覚悟が伝わった！（EXP +60）' },
  },

  {
    id: 'dragon_pass_iris_freedom', title: 'イリスの解放',
    condition: { atLoc: 'dragon_pass', requiredCompanions: ['iris'], requiredEventCompleted: ['demon_mine_iris_confession'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '竜の峠の頂上。強風の中、イリスは空を見上げた。' },
      { speaker: 'iris', speakerName: 'イリス', text: '……空が広い。魔王軍にいた頃は、こんな空を見る余裕もなかった。' },
      { speaker: 'iris', speakerName: 'イリス', text: 'あなたと旅をして……初めて自分が「自由」だと感じた。怖いけど、嬉しい。' },
      { speaker: 'player', speakerName: 'レオン', text: 'これからも、ずっと自由でいてください。魔王を倒した後も。' },
      { speaker: 'narrator', speakerName: '', text: 'イリスの紫の目に、静かな光が灯った。' },
    ],
    reward: { exp: 65, message: 'イリスの魔力が解放された！（EXP +65）' },
  },

  {
    id: 'lighthouse_sig_plan', title: 'シグの大計画',
    condition: { atLoc: 'lighthouse', requiredCompanions: ['sig'], requiredEventCompleted: ['mirea_sig_identity'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '灯台岬。シグが海を見ながらニヤリと笑った。' },
      { speaker: 'sig', speakerName: 'シグ', text: 'レオン、聞いてくれよ。俺、魔王倒したあとの計画があるんだ。' },
      { speaker: 'player', speakerName: 'レオン', text: '計画？' },
      { speaker: 'sig', speakerName: 'シグ', text: '「魔王討伐記念品」を売り出すんだ。魔王軍の武器とか、封印石のレプリカとか。絶対売れるって！で、その資金で親父の船を……' },
      { speaker: 'player', speakerName: 'レオン', text: 'シグらしい計画ですね……でも、夢に向かってるのは本当のことだ。' },
      { speaker: 'sig', speakerName: 'シグ', text: 'へへ……バカにするなよ。でもありがと。……久々に真剣に夢の話した気がする。' },
    ],
    reward: { gold: 100, message: 'シグと夢を語り合った！（+100G）' },
  },

  {
    id: 'galdo_elk_ancestors', title: 'エルクの先祖',
    condition: { atLoc: 'galdo', requiredCompanions: ['elk'], requiredEventCompleted: ['dragon_pass_elk_clan'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: 'ガルドの軍事都市。エルクは旧い石碑の前で足を止めた。' },
      { speaker: 'elk', speakerName: 'エルク', text: '……百年前、俺の一族がここを守った記録がある。' },
      { speaker: 'player', speakerName: 'レオン', text: 'エルク、あなたの一族はすごい。' },
      { speaker: 'elk', speakerName: 'エルク', text: '俺はただの生き残りだ。でも……先祖が守ったものを、今度は俺が守る番だ。あなたと共に。' },
      { speaker: 'narrator', speakerName: '', text: '石碑に刻まれた一族の紋章が、エルクの体のものと同じだと気づいた。' },
    ],
    reward: { exp: 75, message: 'エルクの獣人の血が呼応した！（EXP +75）' },
  },

  {
    id: 'elna_mira_prophecy', title: 'ミラの予言',
    condition: { atLoc: 'elna', requiredCompanions: ['mira'], requiredEventCompleted: ['ancient_temple_mira_seal_history'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: 'エルナの里。ミラはエルフの長老と静かに会話を交わした後、レオンのもとへ来た。' },
      { speaker: 'mira', speakerName: 'ミラ', text: '……長老から聞いた。あなたはこの旅の終わりに、大きな選択を迫られると。' },
      { speaker: 'player', speakerName: 'レオン', text: '選択？' },
      { speaker: 'mira', speakerName: 'ミラ', text: '詳しくは言えない。でも……私はその時、あなたの傍にいる。どんな選択をしても、私は信じています。' },
      { speaker: 'narrator', speakerName: '', text: 'ミラの言葉が、不思議と重く、温かく響いた。' },
    ],
    reward: { exp: 90, message: '古代エルフの加護を受けた！（EXP +90）' },
  },

  {
    id: 'sahal_zeno_demon_world', title: 'ゼノの故郷',
    condition: { atLoc: 'sahal', requiredCompanions: ['zeno'], requiredEventCompleted: ['trading_post_zeno_revelation'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: 'サハルの夜。ゼノは砂漠を見つめながら、珍しく自分から語り始めた。' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '……私の故郷は砂漠の向こうにある魔界だ。だが魔王が支配してから、あそこは地獄になった。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ゼノ……だから魔王を倒したいと？' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '……そう単純ではない。だが……あなたと旅をして、少し考えが変わった。力だけが世界を変えるのではないと。' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '魔王を倒した後、私は魔界を変えに戻る。……いつか、また会えるかもしれない。' },
    ],
    reward: { exp: 100, message: 'ゼノの本心を知った！（EXP +100）' },
  },

  // ===== 選択肢イベント（PP4スタイル：分岐） =====

  {
    id: 'spirit_spring_fairy_wish', title: '精霊の問い',
    condition: { atLoc: 'spirit_spring', requiredEventCompleted: ['spirit_spring_healing_miracle'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '精霊の泉。水面に映る光が揺れ、小さな声が聞こえた気がした。' },
      { speaker: 'narrator', speakerName: '精霊の声', text: '「……勇者よ。一つだけ願いを叶えよう。何を望む？」' },
      { speaker: 'player', speakerName: 'レオン', text: '……' },
    ],
    branch: {
      prompt: '精霊に何を願う？',
      options: [
        { label: '「強さを……力をください」', reward: { exp: 120, message: '精霊の加護で力を得た！（EXP +120）' } },
        { label: '「旅の資金を……」', reward: { gold: 200, message: '精霊の恵みでゴールドを得た！（+200G）' } },
        { label: '「仲間の癒しを……」', reward: { itemId: 'panacea', itemQty: 3, message: '精霊の恵みで万能薬×3を得た！' } },
      ],
    },
  },

  {
    id: 'checkpoint_merchant_deal', title: '謎の商人の取引',
    condition: { atLoc: 'checkpoint', minDaysLeft: 60 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '東関所。フードを深くかぶった商人がこっそりと声をかけてきた。' },
      { speaker: 'narrator', speakerName: '謎の商人', text: '「旅人よ……秘密の情報を売ろう。廃鉱山のボスの弱点だ。代わりに100Gいただきたい」' },
      { speaker: 'player', speakerName: 'レオン', text: '……怪しい。どうする？' },
    ],
    branch: {
      prompt: '商人の取引に応じるか？',
      options: [
        { label: '100G払って情報を買う', cost: 100, reward: { exp: 60, message: '廃鉱山ボスの弱点を知った！（EXP +60, -100G）' } },
        { label: '無視して通り過ぎる', reward: { exp: 10, message: '正しい判断だったかもしれない……（EXP +10）' } },
      ],
    },
  },

  {
    id: 'traveler_inn_gamble', title: '賭け勝負',
    condition: { atLoc: 'traveler_inn', minDaysLeft: 50 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '旅人の宿の奥の部屋。カードゲームをしている旅人たちが声をかけてきた。' },
      { speaker: 'narrator', speakerName: '旅人A', text: '「お前さん、腕試しにどうだ？50G賭けてみないか？運があれば倍になるぞ」' },
    ],
    branch: {
      prompt: '賭け勝負を受けるか？',
      options: [
        {
          label: '50G賭けて勝負する',
          cost: 50,
          winChance: 0.5,
          reward: { gold: 150, exp: 20, message: '賭けに勝った！運が良かった！（+150G, EXP +20）' },
          loseReward: { exp: 10, message: '賭けに負けた……50G失った。（EXP +10）' },
        },
        { label: '断って早く休む', reward: { exp: 15, message: '賢明な判断だった。（EXP +15）' } },
      ],
    },
  },

  {
    id: 'great_bridge_old_man', title: '老商人の荷物',
    condition: { atLoc: 'great_bridge', minDaysLeft: 40 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '大橋の上。大きな荷物を運ぶ老商人が立ち止まり、苦しそうにしている。' },
      { speaker: 'narrator', speakerName: '老商人', text: '「ふうっ……すみません、旅人様。荷物が重くて……助けていただけませんかな？」' },
    ],
    branch: {
      prompt: '老商人を助けるか？',
      options: [
        { label: '一緒に橋を渡るのを手伝う', reward: { gold: 80, exp: 25, message: '老商人が感謝の品をくれた！（+80G, EXP +25）' } },
        { label: '急いでいるから断る', reward: { exp: 5, message: 'その日は後味が悪かった……（EXP +5）' } },
      ],
    },
  },

  {
    id: 'lighthouse_beacon_fire', title: '灯台の狼煙',
    condition: { atLoc: 'lighthouse', maxDaysLeft: 70 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '灯台岬。灯台守が慌てた様子でやってきた。' },
      { speaker: 'narrator', speakerName: '灯台守', text: '「助けてくれ！嵐で信号火が消えた！沖に船がいるのに……火をつけるには薪が必要なんだ！」' },
    ],
    branch: {
      prompt: '灯台守を助けるか？',
      options: [
        { label: '薪を探して信号火をつける', reward: { exp: 50, itemId: 'hi_potion', itemQty: 2, message: '船から礼の品が届いた！（EXP +50・ハイポーション×2）' } },
        { label: '封印石探しが優先だと断る', reward: { exp: 5, message: '後ろ髪を引かれながら先を急いだ……（EXP +5）' } },
      ],
    },
  },

  // ===== ロケーション特殊イベント（PP4の訪問回数スタイル） =====

  {
    id: 'desert_ruins_arrival', title: '決戦の地へ',
    condition: { atLoc: 'desert_ruins', requiredSeals: ['fire', 'storm', 'dark'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '砂漠遺跡の入口。三つの封印石が揃い、ここへ来ることができた。' },
      { speaker: 'narrator', speakerName: '', text: '遺跡の奥から、言いようのない力の気配が漂ってくる。これが……終末記録体アーカイブの気配か。' },
      { speaker: 'player', speakerName: 'レオン', text: '……これで全部揃った。あとは前に進むだけだ。' },
      { speaker: 'narrator', speakerName: '', text: '封印石が三つ、静かに輝き始めた。まるで「準備ができた」と告げているかのように。' },
    ],
    reward: { exp: 80, message: '決戦の覚悟が固まった！（EXP +80）' },
  },

  {
    id: 'alseria_seal_two_report', title: '王への中間報告',
    condition: { atLoc: 'alseria', requiredSeals: ['fire', 'storm'], blockIfEventCompleted: ['desert_ruins_arrival'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: 'アルセリア王都。封印石を二つ持ってここへ戻ってきた。街の人々が驚いた目でこちらを見る。' },
      { speaker: 'narrator', speakerName: '街の人', text: '「あなたが封印石を集めている勇者様ですか！？王都中で話題になっています！」' },
      { speaker: 'player', speakerName: 'レオン', text: 'まだ一つ残っている。でももうすぐだ。' },
      { speaker: 'narrator', speakerName: '', text: '王都の人々の期待の目が、重くも温かくもあった。三つ目の封印石を必ず見つけよう。' },
    ],
    reward: { exp: 80, gold: 100, message: '王都の人々の期待を受けた！（EXP +80, +100G）' },
  },

  {
    id: 'watchtower_enemy_sighting', title: '敵軍の動き',
    condition: { atLoc: 'watchtower', minDaysLeft: 50, maxDaysLeft: 80 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '見張り塔。兵士たちが騒がしい。塔に登ると、遠くに魔王軍の旗が見えた。' },
      { speaker: 'narrator', speakerName: '兵士', text: '「魔王軍が集結している！？なんてことだ……」' },
      { speaker: 'player', speakerName: 'レオン', text: 'まずい。早く封印石を揃えないと。' },
      { speaker: 'narrator', speakerName: '', text: '時間のプレッシャーを改めて感じた。急がなければ。' },
    ],
    reward: { exp: 30, message: '敵の動向を把握した！（EXP +30）' },
  },

  // ===== 仲間 Stage3（最終章・残り日数ベース）=====

  {
    id: 'galdo_cecil_final_study', title: 'セシルの最後の研究',
    condition: { atLoc: 'galdo', requiredCompanions: ['cecil'], requiredEventCompleted: ['traveler_inn_cecil_research'], maxDaysLeft: 25 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: 'ガルドの魔法塔。セシルは分厚い魔法書を抱えて現れた。' },
      { speaker: 'cecil', speakerName: 'セシル', text: '……レオン。私はずっとこの旅のために準備していた。封印魔法の禁断書を解読した。' },
      { speaker: 'player', speakerName: 'レオン', text: 'セシル、それは……？' },
      { speaker: 'cecil', speakerName: 'セシル', text: '最終決戦で私が使える特殊な術式。魔王の防壁を一時的に破る魔法だ。危険だが、試す価値はある。' },
      { speaker: 'narrator', speakerName: '', text: 'セシルの瞳が真剣な光を帯びた。知識の塊が、戦士へと変わる瞬間だった。' },
    ],
    reward: { exp: 90, message: '⭐ セシルの覚悟が伝わった！（EXP +90）' },
  },

  {
    id: 'elna_bram_final_resolve', title: 'ブラムの覚悟',
    condition: { atLoc: 'elna', requiredCompanions: ['bram'], requiredEventCompleted: ['forest_entrance_bram_wrestle'], maxDaysLeft: 25 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: 'エルナの里。ブラムの故郷の墓地。彼は小さな墓石の前で頭を下げた。' },
      { speaker: 'bram', speakerName: 'ブラム', text: 'おやじ……最後の戦いに行ってくる。俺が誇れる戦士になれたかはわからん。でも……前を向いて戦う。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ブラム……' },
      { speaker: 'bram', speakerName: 'ブラム', text: 'ガハハ！泣いてねえぞ。目にゴミが入っただけだ！行くぞ、レオン！俺の大斧を振るわせてくれ！' },
    ],
    reward: { exp: 80, message: '⭐ ブラムとの絆が深まった！（EXP +80）' },
  },

  {
    id: 'riverside_finn_final_growth', title: 'フィンの成長',
    condition: { atLoc: 'riverside', requiredCompanions: ['finn'], requiredEventCompleted: ['checkpoint_finn_resolve'], maxDaysLeft: 25 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '川辺の村。水が静かに流れる。フィンが川面を見つめながら立っていた。' },
      { speaker: 'finn', speakerName: 'フィン', text: 'レオン先輩……俺、最初は足手まといだって思ってたんです。でも今は違う。一人じゃないってわかって……強くなれた気がします。' },
      { speaker: 'player', speakerName: 'レオン', text: 'フィン、お前は最初から強かった。成長したのは気持ちだ。' },
      { speaker: 'finn', speakerName: 'フィン', text: '……！先輩！！ありがとうございます！最後まで、絶対ついていきます！！' },
      { speaker: 'narrator', speakerName: '', text: 'フィンの目に力が宿った。見習い剣士が、真の戦士になった瞬間だった。' },
    ],
    reward: { exp: 85, message: '⭐ フィンが真の戦士に！（EXP +85）' },
  },

  {
    id: 'demon_mine_iris_final_resolve', title: 'イリスの解放',
    condition: { atLoc: 'demon_mine', requiredCompanions: ['iris'], requiredEventCompleted: ['dragon_pass_iris_freedom'], maxDaysLeft: 25 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '廃鉱山の入口。イリスは魔王軍の紋章が刻まれた石板を見つめた。' },
      { speaker: 'iris', speakerName: 'イリス', text: '……私は長い間、この紋章を見るたびに恐怖を感じた。でも今は違う。' },
      { speaker: 'iris', speakerName: 'イリス', text: 'レオン。私が魔王軍にいた時、こんな場所に何度も来た。次は敵として戻る。……それでいい。' },
      { speaker: 'player', speakerName: 'レオン', text: 'イリス、お前の過去は関係ない。今一緒に戦ってくれる、それだけで充分だ。' },
      { speaker: 'narrator', speakerName: '', text: 'イリスは静かに微笑んだ。過去から解き放たれた、清廉な笑顔だった。' },
    ],
    reward: { exp: 95, message: '⭐ イリスの過去から解放！（EXP +95）' },
  },

  {
    id: 'mirea_sig_grand_plan', title: 'シグの大計画・最終版',
    condition: { atLoc: 'mirea', requiredCompanions: ['sig'], requiredEventCompleted: ['lighthouse_sig_plan'], maxDaysLeft: 25 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: 'ミレア港町の波止場。シグが複雑な図面を広げた。' },
      { speaker: 'sig', speakerName: 'シグ', text: 'さあ、最後の大勝負だ！砂漠遺跡への最短ルートを完璧に計算した。それとね……魔王の弱点も調べといたよ。' },
      { speaker: 'player', speakerName: 'レオン', text: 'シグ、本当に色々調べてたんですね。感心した。' },
      { speaker: 'sig', speakerName: 'シグ', text: '詐欺師はね、情報が命なんだ。でも今回は本物の情報だよ。……レオン、信じてくれるよね？' },
      { speaker: 'narrator', speakerName: '', text: 'シグの表情に、いつもの軽さの裏に熱いものが宿った。彼は本気だった。' },
    ],
    reward: { gold: 150, exp: 80, message: '💰 シグの情報力で補給金を確保！（EXP +80, +150G）' },
  },

  {
    id: 'alseria_liz_final_blessing', title: 'リズの最後の祝福',
    condition: { atLoc: 'alseria', requiredCompanions: ['liz'], requiredEventCompleted: ['spirit_spring_liz_miracle'], maxDaysLeft: 25 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: 'アルセリアの礼拝堂。夜明け前。リズが一人で祈っていた。' },
      { speaker: 'liz', speakerName: 'リズ', text: '……神様。どうかレオンをお守りください。この戦いを乗り越えられますように。' },
      { speaker: 'narrator', speakerName: '', text: 'レオンが入ってきたことに気づいたリズは、驚いて立ち上がった。' },
      { speaker: 'liz', speakerName: 'リズ', text: 'レ、レオン……いつからそこに？' },
      { speaker: 'player', speakerName: 'レオン', text: 'リズ、いつも俺のために祈ってくれてありがとう。今度は俺があなたを守る番だ。' },
      { speaker: 'liz', speakerName: 'リズ', text: '……（しばらく黙って、やがて微笑んで）　わかりました。最後まで共に戦います。あなたのそばで。' },
    ],
    reward: { exp: 90, fullHeal: true, message: '✨ リズの最後の祝福！パーティ全員HP/MPが全回復！（EXP +90）' },
  },

  {
    id: 'checkpoint_noa_rival_finale', title: 'ノアの誓い',
    condition: { atLoc: 'checkpoint', requiredCompanions: ['noa'], requiredEventCompleted: ['watchtower_noa_rival'], maxDaysLeft: 25 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '東関所。かつてノアが見張りをしていた場所。彼は懐かしそうに辺りを見回した。' },
      { speaker: 'noa', speakerName: 'ノア', text: 'ここから旅が始まったんだよな……。あの頃は自分がこんな戦いに加わるとは思ってなかった。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ノア、もし怖ければ……' },
      { speaker: 'noa', speakerName: 'ノア', text: '怖い？ははっ！怖いに決まってるよ！でも一つだけ確かなことがある。レオン、お前のそばにいたい。それだけだよ。' },
      { speaker: 'narrator', speakerName: '', text: 'ノアの屈託のない笑顔が、最終決戦前夜の重い空気を吹き飛ばした。' },
    ],
    reward: { exp: 80, gold: 50, message: '⭐ ノアとの絆が最高潮に！（EXP +80, +50G）' },
  },

  // ===== 残り日数ベース強制イベント（PP4スタイル）=====
  {
    id: 'alseria_day60_warning', title: '王都の危機',
    condition: { atLoc: 'alseria', maxDaysLeft: 60, minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '残り60日。アルセリア王都に緊張が走っている。' },
      { speaker: 'narrator', speakerName: '衛兵隊長', text: '「勇者！魔王軍の斥候が王都近くまで来ている。急いでくれ！」' },
      { speaker: 'player', speakerName: 'レオン', text: '（あと60日か。封印石はいくつ揃えた……？）' },
      { speaker: 'narrator', speakerName: '', text: '時間が迫っている。急がなければ。' },
    ],
    reward: { exp: 40, message: '⚠️ 残り60日の警告！急いで封印石を集めよ！（EXP +40）' },
  },

  {
    id: 'alseria_day30_crisis', title: '最後の訴え',
    condition: { atLoc: 'alseria', maxDaysLeft: 30, minDaysLeft: 25 },
    dialogues: [
      { speaker: 'narrator', speakerName: '', text: '残り30日。王都は半包囲状態。民衆が避難を始めている。' },
      { speaker: 'narrator', speakerName: '王', text: '「勇者よ……残り30日だ。封印石を揃えて砂漠遺跡へ急いでくれ。頼むぞ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '絶対に間に合わせる！' },
      { speaker: 'narrator', speakerName: '', text: '最後の戦いが近づいている。' },
    ],
    reward: { exp: 60, gold: 200, message: '⚠️ 残り30日！王から激励の資金を受け取った！（EXP +60, +200G）' },
  },

  // ===== 訪問回数ベースイベント（minVisitCount活用）=====
  {
    id: 'bern_repeat_merchant', title: 'ベルンの情報屋',
    condition: { atLoc: 'bern', minVisitCount: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '情報屋', text: '「何度もベルンへようこそ。君のことは目を付けていたよ。」' },
      { speaker: 'narrator', speakerName: '情報屋', text: '「実は……封印石の隠し場所について噂がある。廃鉱山の奥深くに古い祭壇があるらしい。」' },
      { speaker: 'player', speakerName: 'レオン', text: '……ありがとう。参考にする。' },
      { speaker: 'narrator', speakerName: '情報屋', text: '「代わりに少し持っていってくれ。商売の足しにするといい。」' },
    ],
    reward: { gold: 100, exp: 25, message: '💰 情報屋から情報と資金をもらった！（+100G, EXP +25）' },
  },

  {
    id: 'traveler_inn_repeat_chef', title: '宿の料理人',
    condition: { atLoc: 'traveler_inn', minVisitCount: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '宿の料理人', text: '「また来てくれたかい、勇者さん。常連には特別メニューがあるんだ。」' },
      { speaker: 'narrator', speakerName: '宿の料理人', text: '「大陸を旅する勇者の体には、これが一番だ。たくさん食べてくれ！」' },
      { speaker: 'player', speakerName: 'レオン', text: '（温かい食事は力が出る……！）' },
    ],
    reward: { exp: 30, itemId: 'hi_potion', itemQty: 1, message: '🍖 宿の特製料理でHPが回復！ハイポーションをもらった！（EXP +30）' },
  },

  // ===== STAGE 3 最終章（ヴァイス・ローガン・エルク・ミラ・ゼノ）=====
  {
    id: 'vais_bandit_final_showdown', title: 'ヴァイスの決別',
    condition: { atLoc: 'bandit_hideout', maxDaysLeft: 25, requiredEventCompleted: ['trading_post_vais_secret'] },
    dialogues: [
      { speaker: 'vais', speakerName: 'ヴァイス', text: '……ここか。俺がかつて仲間と根城にしていた場所だ。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'ヴァイスはゆっくりと廃墟を歩き、かつての仲間たちの面影を見つめた。' },
      { speaker: 'player', speakerName: 'レオン', text: '……お前、ここに来たかったのか？' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '過去に決別するためだ。……俺はもう逃げない。お前たちと一緒に戦う。それが俺の答えだ。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'ヴァイスの目に、かつてない決意の光が宿った。' },
    ],
    reward: { exp: 80, gold: 150, message: '🗡️ ヴァイスが過去と決別した！（EXP +80, +150G）' },
  },

  {
    id: 'logan_mirea_last_resolve', title: 'ローガンの贖罪・完結',
    condition: { atLoc: 'mirea', maxDaysLeft: 25, requiredEventCompleted: ['coastal_road_logan_past'] },
    dialogues: [
      { speaker: 'logan', speakerName: 'ローガン', text: '……港の波音を聞くと、あの日のことを思い出す。俺が手を下した命の声が。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ローガン……' },
      { speaker: 'logan', speakerName: 'ローガン', text: '俺に出来ることは後悔し続けることじゃない。残りの命を使い切ることだ。' },
      { speaker: 'logan', speakerName: 'ローガン', text: '……頼む。最後までついていかせてくれ。それが俺の贖罪だ。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '波が静かに砂浜を洗う。ローガンの言葉は、海に溶けていった。' },
    ],
    reward: { exp: 80, gold: 150, message: '⚒️ ローガンが前を向く決意を固めた！（EXP +80, +150G）' },
  },

  {
    id: 'elk_dragon_pass_final_vow', title: 'エルクの誓い・完結',
    condition: { atLoc: 'dragon_pass', maxDaysLeft: 25, requiredEventCompleted: ['galdo_elk_ancestors'] },
    dialogues: [
      { speaker: 'elk', speakerName: 'エルク', text: '……峠の風が強い。先祖たちもここを歩いたのか。' },
      { speaker: 'player', speakerName: 'レオン', text: 'エルク、お前の先祖はここで何を守っていたんだ？' },
      { speaker: 'elk', speakerName: 'エルク', text: '竜と人間の約束……それを守り続けることだ。俺も、その誓いを受け継ぐ。' },
      { speaker: 'elk', speakerName: 'エルク', text: 'お前と戦うことで、その意味がわかってきた。一緒に最後まで行くぞ。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '峠の奥から、遠い竜の鳴き声が響いた。まるで祝福するかのように。' },
    ],
    reward: { exp: 80, gold: 150, message: '🐺 エルクが先祖の誓いを継承した！（EXP +80, +150G）' },
  },

  {
    id: 'mira_ancient_temple_final_truth', title: 'ミラの真実',
    condition: { atLoc: 'ancient_temple', maxDaysLeft: 25, requiredEventCompleted: ['elna_mira_prophecy'] },
    dialogues: [
      { speaker: 'mira', speakerName: 'ミラ', text: '……この神殿には、エルフの先人たちが記した封印の記録が眠っている。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'ミラは石板の前に立ち、古代エルフ語を読み始めた。その目に涙が滲む。' },
      { speaker: 'mira', speakerName: 'ミラ', text: '……封印は一人では解けない。人間とエルフが共に戦う時にのみ……。' },
      { speaker: 'player', speakerName: 'レオン', text: '俺たちが、その「共に」だ。ミラ。' },
      { speaker: 'mira', speakerName: 'ミラ', text: '（静かに微笑む）……そうね。私もそう信じたい。行きましょう。' },
    ],
    reward: { exp: 80, gold: 150, message: '🌿 ミラが古代記録の真実を知った！（EXP +80, +150G）' },
  },

  {
    id: 'zeno_trading_post_final_bond', title: 'ゼノの誓約',
    condition: { atLoc: 'trading_post', maxDaysLeft: 25, requiredEventCompleted: ['sahal_zeno_demon_world'] },
    dialogues: [
      { speaker: 'zeno', speakerName: 'ゼノ', text: '……ここで言っておこう。俺は魔族だが、お前に忠誠を誓う。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ゼノ……急にどうした？' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '魔族の血が騒いでいる。魔王が復活に近づいている証だ。……だから今はっきりさせておきたかった。' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '俺の力はお前のために使う。例え魔族の掟に反しても。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'ゼノの瞳が赤く光り、消えた。その言葉に嘘はなかった。' },
    ],
    reward: { exp: 80, gold: 150, message: '😈 ゼノが忠誠を誓った！（EXP +80, +150G）' },
  },

  // ===== STAGE 4 (全13人 maxDaysLeft:50) =====
  {
    id: 'gares_stage4_knighthood', title: 'ガレスの誓い・深化',
    condition: { atLoc: 'alseria', maxDaysLeft: 50, requiredEventCompleted: ['elna_gares_final_oath'] },
    dialogues: [
      { speaker: 'gares', speakerName: 'ガレス', text: '王都を見るたびに思う。俺はなぜ騎士になったのかと。' },
      { speaker: 'player', speakerName: 'レオン', text: 'その答えは見つかったか？' },
      { speaker: 'gares', speakerName: 'ガレス', text: 'ああ……お前と旅して分かった。守るべきものがあるから剣を持つ。それだけだ。' },
      { speaker: 'gares', speakerName: 'ガレス', text: '俺はお前を守る。この命が続く限りな。' },
    ],
    reward: { exp: 100, gold: 200, message: '🛡️ ガレスとの絆が深まった！（EXP +100, +200G）' },
  },

  {
    id: 'liz_stage4_faith', title: 'リズの信仰・深化',
    condition: { atLoc: 'spirit_spring', maxDaysLeft: 50, requiredEventCompleted: ['alseria_liz_final_blessing'] },
    dialogues: [
      { speaker: 'liz', speakerName: 'リズ', text: 'ここの泉は……特別な感じがします。神様の声が近い気がして。' },
      { speaker: 'player', speakerName: 'レオン', text: 'リズにとって、神様って何なんだ？' },
      { speaker: 'liz', speakerName: 'リズ', text: '……あなたが隣にいてくれること、それが私にとっての奇跡です。神様に感謝しています。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '泉の水が光り、リズの周りに小さな光の粒が舞った。' },
    ],
    reward: { exp: 100, fullHeal: true, message: '✨ リズの祈りでパーティ全回復！（EXP +100）' },
  },

  {
    id: 'noa_stage4_hunt', title: 'ノアの狩り・深化',
    condition: { atLoc: 'watchtower', maxDaysLeft: 50, requiredEventCompleted: ['checkpoint_noa_rival_finale'] },
    dialogues: [
      { speaker: 'noa', speakerName: 'ノア', text: '見て！あそこに珍しい鳥がいる。でも……撃てない。' },
      { speaker: 'player', speakerName: 'レオン', text: 'なんで？お前の腕なら余裕だろう？' },
      { speaker: 'noa', speakerName: 'ノア', text: '……旅をしてから、生命の大切さが分かってきたの。戦いは仕方ない。でも無駄に命は取りたくない。' },
      { speaker: 'noa', speakerName: 'ノア', text: 'それを教えてくれたのは、あなたよ。ありがとう。' },
    ],
    reward: { exp: 100, gold: 200, message: '🏹 ノアが命の意味を理解した！（EXP +100, +200G）' },
  },

  {
    id: 'cecil_stage4_power', title: 'セシルの魔力・深化',
    condition: { atLoc: 'galdo', maxDaysLeft: 50, requiredEventCompleted: ['galdo_cecil_final_study'] },
    dialogues: [
      { speaker: 'cecil', speakerName: 'セシル', text: 'ガルド魔法塔の資料を読んだら、封印魔法の根本が分かってきた！' },
      { speaker: 'player', speakerName: 'レオン', text: 'それは封印石に関係あるのか？' },
      { speaker: 'cecil', speakerName: 'セシル', text: '大いに！魔王は封印を解こうとしている。でも私が封印を強化する魔法を使えば……！' },
      { speaker: 'cecil', speakerName: 'セシル', text: 'あなたと一緒なら、きっと出来る。絶対に魔王を封印してみせる！' },
    ],
    reward: { exp: 100, gold: 200, message: '🔮 セシルが封印魔法の秘密を解明！（EXP +100, +200G）' },
  },

  {
    id: 'bram_stage4_warrior', title: 'ブラムの戦士道・深化',
    condition: { atLoc: 'elna', maxDaysLeft: 50, requiredEventCompleted: ['elna_bram_final_resolve'] },
    dialogues: [
      { speaker: 'bram', speakerName: 'ブラム', text: 'エルナの里に来るたびに、故郷が恋しくなる。でも……もう戻れないな。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ブラム、どうした？' },
      { speaker: 'bram', speakerName: 'ブラム', text: '俺の戦士の道は、戦場で死ぬことだと思っていた。でも違った。生きて帰ることで守るんだ。' },
      { speaker: 'bram', speakerName: 'ブラム', text: '最後まで生き抜くぞ。お前と一緒に！' },
    ],
    reward: { exp: 100, gold: 200, message: '🪓 ブラムが戦士道の真意に気づいた！（EXP +100, +200G）' },
  },

  {
    id: 'finn_stage4_swordsmanship', title: 'フィンの剣術・深化',
    condition: { atLoc: 'riverside', maxDaysLeft: 50, requiredEventCompleted: ['riverside_finn_final_growth'] },
    dialogues: [
      { speaker: 'finn', speakerName: 'フィン', text: '……川の流れを見ていると、剣の動きが分かる気がするんだ。' },
      { speaker: 'player', speakerName: 'レオン', text: '川と剣術がどう繋がるんだ？' },
      { speaker: 'finn', speakerName: 'フィン', text: '流れに逆らわず、でも確実に前進する。……俺もそうありたい。' },
      { speaker: 'finn', speakerName: 'フィン', text: '俺はまだ見習いだけど……あなたと戦って、本物の剣士になれた気がする！' },
    ],
    reward: { exp: 100, gold: 200, message: '⚔️ フィンの剣技が更に磨かれた！（EXP +100, +200G）' },
  },

  {
    id: 'vais_stage4_redemption', title: 'ヴァイスの贖罪・深化',
    condition: { atLoc: 'trading_post', maxDaysLeft: 50, requiredEventCompleted: ['vais_bandit_final_showdown'] },
    dialogues: [
      { speaker: 'vais', speakerName: 'ヴァイス', text: '交易所で昔の被害者に会った。……俺のことを覚えていたが、怒らなかった。' },
      { speaker: 'player', speakerName: 'レオン', text: 'そうか……' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '「今は世界を救おうとしていると聞いた。頑張れ」と言ってくれた。……なんで泣けてくるんだろうな。' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: 'その人の言葉を、胸に刻んで戦う。絶対に最後まで行くぞ。' },
    ],
    reward: { exp: 100, gold: 200, message: '🗡️ ヴァイスが許しを受けた！（EXP +100, +200G）' },
  },

  {
    id: 'logan_stage4_past', title: 'ローガンの過去・深化',
    condition: { atLoc: 'sahal', maxDaysLeft: 50, requiredEventCompleted: ['logan_mirea_last_resolve'] },
    dialogues: [
      { speaker: 'logan', speakerName: 'ローガン', text: 'サハルの砂漠は……俺が最後の仕事をした場所だ。死刑執行人として。' },
      { speaker: 'player', speakerName: 'レオン', text: 'それが……お前の贖罪の始まりか。' },
      { speaker: 'logan', speakerName: 'ローガン', text: 'ああ。俺は間違った命令に従った。でもお前と出会って……自分で考えて戦うことを学んだ。' },
      { speaker: 'logan', speakerName: 'ローガン', text: '今度は正しい戦いをする。一緒に来てくれるな？' },
    ],
    reward: { exp: 100, gold: 200, message: '⚒️ ローガンが自らの意思で戦う決意をした！（EXP +100, +200G）' },
  },

  {
    id: 'iris_stage4_magic', title: 'イリスの魔法・深化',
    condition: { atLoc: 'demon_mine', maxDaysLeft: 50, requiredEventCompleted: ['demon_mine_iris_final_resolve'] },
    dialogues: [
      { speaker: 'iris', speakerName: 'イリス', text: '廃鉱山の魔素が……濃くなっている。魔王の力が増しているわ。' },
      { speaker: 'player', speakerName: 'レオン', text: 'イリス、大丈夫か？その力に引っ張られないか？' },
      { speaker: 'iris', speakerName: 'イリス', text: '……前なら危なかったかも。でも今は違う。あなたがいるから、引き戻される場所がある。' },
      { speaker: 'iris', speakerName: 'イリス', text: '私の魔法を世界を守るために使う。それが決まったの。' },
    ],
    reward: { exp: 100, gold: 200, message: '💜 イリスが魔力の使い方を定めた！（EXP +100, +200G）' },
  },

  {
    id: 'sig_stage4_truth', title: 'シグの本音・深化',
    condition: { atLoc: 'mirea', maxDaysLeft: 50, requiredEventCompleted: ['mirea_sig_grand_plan'] },
    dialogues: [
      { speaker: 'sig', speakerName: 'シグ', text: '……実はさ、最初は金目当てでお前に近づいたんだ。白状するよ。' },
      { speaker: 'player', speakerName: 'レオン', text: '知ってた。だから最初から財布は渡さなかった。' },
      { speaker: 'sig', speakerName: 'シグ', text: '（笑）……さすが。でも今は違う。本当に信じてる。お前なら魔王を倒せるって。' },
      { speaker: 'sig', speakerName: 'シグ', text: '俺のトリックは全部お前のために使う。詐欺師の誓いだ。' },
    ],
    reward: { exp: 100, gold: 300, message: '🎩 シグが本音を明かした！（EXP +100, +300G）' },
  },

  {
    id: 'elk_stage4_instinct', title: 'エルクの本能・深化',
    condition: { atLoc: 'forest_entrance', maxDaysLeft: 50, requiredEventCompleted: ['elk_dragon_pass_final_vow'] },
    dialogues: [
      { speaker: 'elk', speakerName: 'エルク', text: 'この森……獣人の血が騒ぐ。何かが来る。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '森の奥から大型の野生獣が現れたが、エルクが低い唸り声を上げると立ち去った。' },
      { speaker: 'player', speakerName: 'レオン', text: 'すごいな……' },
      { speaker: 'elk', speakerName: 'エルク', text: '獣人は自然と話せる。この力を戦いに活かすぞ。共に行こう、相棒。' },
    ],
    reward: { exp: 100, gold: 200, message: '🐺 エルクの野生本能が覚醒した！（EXP +100, +200G）' },
  },

  {
    id: 'mira_stage4_forest', title: 'ミラの森の声・深化',
    condition: { atLoc: 'elna', maxDaysLeft: 50, requiredEventCompleted: ['mira_ancient_temple_final_truth'] },
    dialogues: [
      { speaker: 'mira', speakerName: 'ミラ', text: '……エルナの森が語りかけてくる。封印が弱まっている、と。' },
      { speaker: 'player', speakerName: 'レオン', text: '木が話すのか？' },
      { speaker: 'mira', speakerName: 'ミラ', text: 'エルフには聞こえるの。自然の声が。……あなたにも聞かせてあげたい。でもそれは言葉じゃなくて、感じるものだから。' },
      { speaker: 'mira', speakerName: 'ミラ', text: '急ぎましょう。時間がない。でも……あなたと歩けて良かった。' },
    ],
    reward: { exp: 100, gold: 200, message: '🌿 ミラが自然の警告を受け取った！（EXP +100, +200G）' },
  },

  {
    id: 'zeno_stage4_demon', title: 'ゼノの魔族の血・深化',
    condition: { atLoc: 'desert_ruins', maxDaysLeft: 50, requiredEventCompleted: ['zeno_trading_post_final_bond'] },
    dialogues: [
      { speaker: 'zeno', speakerName: 'ゼノ', text: 'この砂漠に来ると……魔王の気配が強くなる。俺の血が反応している。' },
      { speaker: 'player', speakerName: 'レオン', text: '大丈夫か、ゼノ？' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '問題ない。むしろ俺の血が道標になる。魔王の弱点を感じ取れるはずだ。' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '最後の戦いで、俺の力を見せてやる。人間でも魔族でもない……俺自身の力を。' },
    ],
    reward: { exp: 100, gold: 200, message: '😈 ゼノが魔族の血を力に変えた！（EXP +100, +200G）' },
  },

  // ===== STAGE 5 (全13人 maxDaysLeft:35) =====
  {
    id: 'gares_stage5_final', title: '騎士の誓い・最終',
    condition: { atLoc: 'checkpoint', maxDaysLeft: 35, requiredEventCompleted: ['gares_stage4_knighthood'] },
    dialogues: [
      { speaker: 'gares', speakerName: 'ガレス', text: '関所を通るたびに……どれだけ遠くまで来たかを実感する。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ガレス、最後まで頼むぞ。' },
      { speaker: 'gares', speakerName: 'ガレス', text: '……言われるまでもない。俺の盾はお前のためにある。騎士の誓いだ。絶対に守り抜く。' },
    ],
    reward: { exp: 120, gold: 250, message: '🛡️ ガレスの守護の誓い！（EXP +120, +250G）' },
  },

  {
    id: 'liz_stage5_final', title: 'リズの光・最終',
    condition: { atLoc: 'alseria', maxDaysLeft: 35, requiredEventCompleted: ['liz_stage4_faith'] },
    dialogues: [
      { speaker: 'liz', speakerName: 'リズ', text: '王都に戻るたびに、私は何のために戦っているか確かめます。' },
      { speaker: 'player', speakerName: 'レオン', text: 'その答えは？' },
      { speaker: 'liz', speakerName: 'リズ', text: '……あなたとこの世界を守るため。それだけで十分です。行きましょう。神様も見ています。' },
    ],
    reward: { exp: 120, gold: 250, message: '✨ リズの光が仲間を照らす！（EXP +120, +250G）' },
  },

  {
    id: 'noa_stage5_final', title: 'ノアの矢・最終',
    condition: { atLoc: 'bern', maxDaysLeft: 35, requiredEventCompleted: ['noa_stage4_hunt'] },
    dialogues: [
      { speaker: 'noa', speakerName: 'ノア', text: 'ベルンの賑わいを見ると、守りたいって気持ちが燃えてくる。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ノア、準備はいいか？' },
      { speaker: 'noa', speakerName: 'ノア', text: '当然！私の矢は絶対に外れない。あなたの隣で戦う。それが私の答えよ！' },
    ],
    reward: { exp: 120, gold: 250, message: '🏹 ノアの必中の誓い！（EXP +120, +250G）' },
  },

  {
    id: 'cecil_stage5_final', title: 'セシルの魔法・最終',
    condition: { atLoc: 'galdo', maxDaysLeft: 35, requiredEventCompleted: ['cecil_stage4_power'] },
    dialogues: [
      { speaker: 'cecil', speakerName: 'セシル', text: '魔法塔の最高位の本を読んだ。……私が求めていた魔法がここにあった。' },
      { speaker: 'player', speakerName: 'レオン', text: 'どんな魔法だ？' },
      { speaker: 'cecil', speakerName: 'セシル', text: '魔王の核を直接封印する魔法！ただし術者が全魔力を使い切る。でもやる。絶対に。' },
    ],
    reward: { exp: 120, gold: 250, message: '🔮 セシルが禁断の封印魔法を習得！（EXP +120, +250G）' },
  },

  {
    id: 'bram_stage5_final', title: 'ブラムの鉄腕・最終',
    condition: { atLoc: 'great_bridge', maxDaysLeft: 35, requiredEventCompleted: ['bram_stage4_warrior'] },
    dialogues: [
      { speaker: 'bram', speakerName: 'ブラム', text: '大橋を渡るたびに、俺たちがどれだけ戦ってきたかを思い出す。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ブラム、最後の戦いはお前の力が必要だぞ。' },
      { speaker: 'bram', speakerName: 'ブラム', text: 'わかってる！俺の斧は魔王の頭にお見舞いしてやる！行くぞ！' },
    ],
    reward: { exp: 120, gold: 250, message: '🪓 ブラムの豪腕が覚醒！（EXP +120, +250G）' },
  },

  {
    id: 'finn_stage5_final', title: 'フィンの覚悟・最終',
    condition: { atLoc: 'riverside', maxDaysLeft: 35, requiredEventCompleted: ['finn_stage4_swordsmanship'] },
    dialogues: [
      { speaker: 'finn', speakerName: 'フィン', text: 'あの日、夢を語ったこの川辺で……俺は変わった。見習い剣士から、本物になった。' },
      { speaker: 'player', speakerName: 'レオン', text: 'フィン……立派になったな。' },
      { speaker: 'finn', speakerName: 'フィン', text: '全部あなたのおかげです。最後の戦い、俺が先頭を行きます！任せてください！' },
    ],
    reward: { exp: 120, gold: 250, message: '⚔️ フィンが真の剣士に覚醒！（EXP +120, +250G）' },
  },

  {
    id: 'vais_stage5_final', title: 'ヴァイスの刃・最終',
    condition: { atLoc: 'bandit_hideout', maxDaysLeft: 35, requiredEventCompleted: ['vais_stage4_redemption'] },
    dialogues: [
      { speaker: 'vais', speakerName: 'ヴァイス', text: '盗賊の巣窟だったここも……もう昔の話だ。俺も変わった。' },
      { speaker: 'player', speakerName: 'レオン', text: 'お前の過去は変えられない。でも未来は変えられる。' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '……ああ。この刃で世界を守る。それが俺の新しい生き方だ。' },
    ],
    reward: { exp: 120, gold: 250, message: '🗡️ ヴァイスの刃が正義の剣に！（EXP +120, +250G）' },
  },

  {
    id: 'logan_stage5_final', title: 'ローガンの鉄槌・最終',
    condition: { atLoc: 'coastal_road', maxDaysLeft: 35, requiredEventCompleted: ['logan_stage4_past'] },
    dialogues: [
      { speaker: 'logan', speakerName: 'ローガン', text: '海岸を歩くたびに……俺の心が軽くなっていく気がする。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ローガン、お前の力が必要だ。' },
      { speaker: 'logan', speakerName: 'ローガン', text: 'もちろんだ。この鉄槌で、魔王を打ち砕く。今度こそ正しい戦いを。' },
    ],
    reward: { exp: 120, gold: 250, message: '⚒️ ローガンの魂の一撃！（EXP +120, +250G）' },
  },

  {
    id: 'iris_stage5_final', title: 'イリスの解放・最終',
    condition: { atLoc: 'ancient_temple', maxDaysLeft: 35, requiredEventCompleted: ['iris_stage4_magic'] },
    dialogues: [
      { speaker: 'iris', speakerName: 'イリス', text: '古代神殿に来ると……昔の自分が浮かぶ。魔王軍の一員だった頃の。' },
      { speaker: 'player', speakerName: 'レオン', text: 'それは過去だ。今のお前は違う。' },
      { speaker: 'iris', speakerName: 'イリス', text: '（微笑）……ありがとう。そう言ってくれるから私は戦える。全魔力で魔王を打ち倒す！' },
    ],
    reward: { exp: 120, gold: 250, message: '💜 イリスが全魔力を解放！（EXP +120, +250G）' },
  },

  {
    id: 'sig_stage5_final', title: 'シグの大博打・最終',
    condition: { atLoc: 'lighthouse', maxDaysLeft: 35, requiredEventCompleted: ['sig_stage4_truth'] },
    dialogues: [
      { speaker: 'sig', speakerName: 'シグ', text: '灯台から見える水平線……あの向こうに何がある？' },
      { speaker: 'player', speakerName: 'レオン', text: '未来があるんじゃないか？' },
      { speaker: 'sig', speakerName: 'シグ', text: '（笑）いいね！俺は今まで生き残るために騙し続けた。でも今回の博打は命がけで……勝つつもりだ！' },
    ],
    reward: { exp: 120, gold: 350, message: '🎩 シグが最後の大博打に挑む！（EXP +120, +350G）' },
  },

  {
    id: 'elk_stage5_final', title: 'エルクの咆哮・最終',
    condition: { atLoc: 'dragon_pass', maxDaysLeft: 35, requiredEventCompleted: ['elk_stage4_instinct'] },
    dialogues: [
      { speaker: 'elk', speakerName: 'エルク', text: '竜の峠を越えれば……もう後は魔王しかいない。血が滾る。' },
      { speaker: 'player', speakerName: 'レオン', text: 'エルク、一緒に行くぞ。' },
      { speaker: 'elk', speakerName: 'エルク', text: '当然だ！獣人の槍で、魔王を貫く！うおおおぉ！' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'エルクの咆哮が峠に響き渡った。' },
    ],
    reward: { exp: 120, gold: 250, message: '🐺 エルクが覚醒の咆哮！（EXP +120, +250G）' },
  },

  {
    id: 'mira_stage5_final', title: 'ミラの最後の矢・最終',
    condition: { atLoc: 'elna', maxDaysLeft: 35, requiredEventCompleted: ['mira_stage4_forest'] },
    dialogues: [
      { speaker: 'mira', speakerName: 'ミラ', text: 'エルナの森が……最後の別れを告げている気がする。でも悲しくない。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ミラ……' },
      { speaker: 'mira', speakerName: 'ミラ', text: '私の命を懸けた矢は、魔王の心臓を射抜く。森の加護と共に！' },
    ],
    reward: { exp: 120, gold: 250, message: '🌿 ミラの魂の一矢！（EXP +120, +250G）' },
  },

  {
    id: 'zeno_stage5_final', title: 'ゼノの覚悟・最終',
    condition: { atLoc: 'sahal', maxDaysLeft: 35, requiredEventCompleted: ['zeno_stage4_demon'] },
    dialogues: [
      { speaker: 'zeno', speakerName: 'ゼノ', text: '砂漠の熱さが……俺を故郷の魔界に連れ戻そうとする。でも行かない。' },
      { speaker: 'player', speakerName: 'レオン', text: 'ゼノ、最後まで一緒に行くぞ。' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '……ああ。俺はもう魔族でも人間でもない。お前の仲間だ。それだけで十分だ。' },
    ],
    reward: { exp: 120, gold: 250, message: '😈 ゼノが真の仲間の絆を結んだ！（EXP +120, +250G）' },
  },

  // ===== 訪問回数ベースイベント・第2弾 =====
  {
    id: 'alseria_visit2_old_knight', title: '老騎士の助言',
    condition: { atLoc: 'alseria', minVisitCount: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '老騎士', text: '「何度も王都に来るとは……真剣に旅をしているのだな。」' },
      { speaker: 'narrator', speakerName: '老騎士', text: '「若い頃の俺も、そうだった。これを持っていけ。旅に役立つはずだ。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'ありがとうございます。必ず魔王を倒します。' },
    ],
    reward: { gold: 200, exp: 30, message: '⚔️ 老騎士から支援を受けた！（+200G, EXP +30）' },
  },

  {
    id: 'alseria_visit3_princess', title: '王女の激励',
    condition: { atLoc: 'alseria', minVisitCount: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: '王女', text: '「何度もこの城に来てくださるのね。勇者様。」' },
      { speaker: 'narrator', speakerName: '王女', text: '「私には何もできないけれど……あなたのことを毎日祈っています。どうか無事で帰ってきてください。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（その祈りが、力になる……）ありがとう。必ず戻ります。' },
    ],
    reward: { exp: 50, itemId: 'panacea', itemQty: 1, message: '👑 王女から万能薬をもらった！（EXP +50）' },
  },

  {
    id: 'bern_visit2_auction', title: 'ベルンの競売',
    condition: { atLoc: 'bern', minVisitCount: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '競売人', text: '「いらっしゃい！今日は珍しい品が競売に出ているよ。」' },
      { speaker: 'narrator', speakerName: '競売人', text: '「封印の時代に使われた古い護符だ。常連のあなたに特別価格で譲ろう。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（これは……役に立ちそうだ。）いただこう。' },
    ],
    reward: { gold: 150, exp: 30, itemId: 'ether', itemQty: 2, message: '🏪 競売で護符（エーテル×2）を入手！（+150G, EXP +30）' },
  },

  {
    id: 'bern_visit3_festival', title: 'ベルンの祭り',
    condition: { atLoc: 'bern', minVisitCount: 6 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'ちょうど商業都市ベルンの年に一度の祭りに当たった。町は活気に溢れている。' },
      { speaker: 'narrator', speakerName: '屋台の主人', text: '「勇者様！祭りの特別料理を食べていきな。腹が減っちゃ戦えないぜ！」' },
      { speaker: 'player', speakerName: 'レオン', text: '（うまい……！力がみなぎってくる！）' },
    ],
    reward: { exp: 60, fullHeal: true, message: '🎉 ベルンの祭り料理でパーティ全回復！（EXP +60）' },
  },

  {
    id: 'sahal_visit2_spice', title: 'サハルの香辛料商人',
    condition: { atLoc: 'sahal', minVisitCount: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '香辛料商人', text: '「また来てくれたね。砂漠の旅は体に堪えるだろう。これを飲め。」' },
      { speaker: 'narrator', speakerName: '香辛料商人', text: '「砂漠の薬草から作った特製薬だ。疲れが吹き飛ぶぞ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（不思議な味だが……体が軽くなった！）ありがとう。' },
    ],
    reward: { exp: 35, itemId: 'potion', itemQty: 3, message: '🌶️ 砂漠の特製薬！ポーション×3をもらった！（EXP +35）' },
  },

  {
    id: 'sahal_visit3_oasis', title: 'サハルの隠しオアシス',
    condition: { atLoc: 'sahal', minVisitCount: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: '砂漠の案内人', text: '「何度も砂漠に来るとは、真の旅人だ。秘密を教えよう。」' },
      { speaker: 'narrator', speakerName: '砂漠の案内人', text: '「町の裏に隠しオアシスがある。昔の封印術士が使っていた場所だ。霊水が湧いているぞ。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '霊水を飲むと、体の疲れが一瞬で消えた。' },
    ],
    reward: { exp: 50, fullHeal: true, message: '💧 砂漠の霊水でパーティ全回復！（EXP +50）' },
  },

  {
    id: 'mirea_visit2_fisherman', title: 'ミレアの老漁師',
    condition: { atLoc: 'mirea', minVisitCount: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '老漁師', text: '「また来たか、若いの。今日は大漁でな、魚を分けてやろう。」' },
      { speaker: 'narrator', speakerName: '老漁師', text: '「昔、俺もお前くらいの頃に海を越えて旅したもんだ。若い頃は無敵だと思ってたよ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '老漁師でも、怖いと思うことはありましたか？' },
      { speaker: 'narrator', speakerName: '老漁師', text: '「毎日だよ。でも、怖いから気をつける。それが長生きの秘訣だ。大事にしな。」' },
    ],
    reward: { exp: 30, gold: 120, message: '🐟 老漁師から知恵と資金をもらった！（EXP +30, +120G）' },
  },

  {
    id: 'mirea_visit3_sailor', title: 'ミレアの航海士',
    condition: { atLoc: 'mirea', minVisitCount: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: '航海士', text: '「噂の勇者か！何度もここに来るとは、港が気に入ったか？」' },
      { speaker: 'narrator', speakerName: '航海士', text: '「海を越えた島に、封印の時代の地図が残っているという。俺の船なら届けられるが……今は魔の海域が危険でな。」' },
      { speaker: 'narrator', speakerName: '航海士', text: '「代わりに、俺が持っていた古地図の一部をやろう。役に立つかもしれん。」' },
    ],
    reward: { gold: 250, exp: 40, message: '⚓ 航海士から古地図の情報を受けた！（+250G, EXP +40）' },
  },

  {
    id: 'elna_visit2_elder', title: 'エルナの長老の知恵',
    condition: { atLoc: 'elna', minVisitCount: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '長老', text: '「また来たか。若者よ。森は君を歓迎している。」' },
      { speaker: 'narrator', speakerName: '長老', text: '「封印石は、ただの石ではない。それぞれに宿る精霊の意思がある。戦いの前に、石に語りかけてみなさい。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（石に語りかける……？ 試してみよう。）ありがとうございます。' },
    ],
    reward: { exp: 45, message: '🌿 長老から封印石の秘密を聞いた！（EXP +45）' },
  },

  {
    id: 'elna_visit3_forest_blessing', title: '森の精霊の祝福',
    condition: { atLoc: 'elna', minVisitCount: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'エルナの森の奥から、淡い光が漂ってきた。' },
      { speaker: 'narrator', speakerName: '森の精霊', text: '「……人間の子よ。何度もこの森を訪れ、我々の里を守ろうとしてくれている。」' },
      { speaker: 'narrator', speakerName: '森の精霊', text: '「我らの加護を与えよう。魔王との戦いに、この力を役立てるがよい。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '森の光がパーティを包み、傷が癒えていった。' },
    ],
    reward: { exp: 70, fullHeal: true, message: '🌳 森の精霊の加護でパーティ全回復！（EXP +70）' },
  },

  {
    id: 'galdo_visit2_inventor', title: 'ガルドの発明家',
    condition: { atLoc: 'galdo', minVisitCount: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '発明家', text: '「おお！また来てくれたか。ちょうど新しい発明が完成したところだ。」' },
      { speaker: 'narrator', speakerName: '発明家', text: '「これを使うと、魔物の弱点が事前に分かる鑑定装置だ。テスト版だが……使ってみてくれ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（これは……すごい。ボスとの戦いで使えそうだ。）ありがとう！' },
    ],
    reward: { exp: 40, gold: 180, message: '⚙️ 発明家から特製装備をもらった！（EXP +40, +180G）' },
  },

  {
    id: 'galdo_visit3_archmage', title: 'ガルドの大魔法使い',
    condition: { atLoc: 'galdo', minVisitCount: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: '大魔法使い', text: '「久しいな、勇者よ。貴君の力は着実に伸びている。」' },
      { speaker: 'narrator', speakerName: '大魔法使い', text: '「最後の封印石、闇の封印石は特別な力を持つ。古代神殿で必ず使え。これが封印の強化魔法だ。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'ありがとうございます。必ず活かします。' },
      { speaker: 'narrator', speakerName: '大魔法使い', text: '「頑張りなさい。世界の命運が、貴君の双肩にかかっている。」' },
    ],
    reward: { exp: 80, itemId: 'ether', itemQty: 3, message: '🔮 大魔法使いからエーテル×3と知恵を授けられた！（EXP +80）' },
  },

  {
    id: 'traveler_inn_visit3', title: '宿の親父の昔話',
    condition: { atLoc: 'traveler_inn', minVisitCount: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: '宿の親父', text: '「何度も来てくれるね。常連扱いさせてもらうよ。」' },
      { speaker: 'narrator', speakerName: '宿の親父', text: '「若い頃、俺も封印石を探して旅したんだ。結局見つからなかったが……お前はきっと違う。」' },
      { speaker: 'narrator', speakerName: '宿の親父', text: '「今夜の宿代はいらん。精一杯戦ってきなよ。」' },
    ],
    reward: { exp: 40, fullHeal: true, message: '🏠 宿の親父が無料で泊めてくれた！パーティ全回復！（EXP +40）' },
  },

  {
    id: 'checkpoint_visit2_guard', title: '関所の衛兵の情報',
    condition: { atLoc: 'checkpoint', minVisitCount: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '衛兵', text: '「また通ってくれるか。最近、魔物の動きが変だと思わないか？」' },
      { speaker: 'narrator', speakerName: '衛兵', text: '「廃鉱山の方から、異常な熱気が漂ってくる。封印石に関係があるのかもしれん。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'そうか……注意して向かう。ありがとう。' },
      { speaker: 'narrator', speakerName: '衛兵', text: '「気をつけろよ。お前たちが頼りだ。」' },
    ],
    reward: { exp: 25, gold: 80, message: '🗺️ 関所の衛兵から情報を得た！（EXP +25, +80G）' },
  },

  {
    id: 'great_bridge_visit2_toll', title: '大橋の橋番',
    condition: { atLoc: 'great_bridge', minVisitCount: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '橋番', text: '「また渡るのか。橋を使ってくれるのはありがたい。」' },
      { speaker: 'narrator', speakerName: '橋番', text: '「実は昨日、見たことのない黒い霧が橋の向こうから来た。魔王の使者かもしれん。気をつけろよ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '教えてくれてありがとう。先を急ぐ。' },
    ],
    reward: { exp: 20, gold: 60, message: '🌉 橋番から情報を受け取った！（EXP +20, +60G）' },
  },

  {
    id: 'great_bridge_visit3_traveler', title: '大橋の旅人',
    condition: { atLoc: 'great_bridge', minVisitCount: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: '旅人', text: '「おや、また会ったね。私も長い旅をしているが……君は本当によく動いているな。」' },
      { speaker: 'narrator', speakerName: '旅人', text: '「これを受け取ってくれ。旅の中で見つけた不思議な石だ。何かの力があると思うが、私には使いこなせない。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'ありがとう。大切に使わせてもらいます。' },
    ],
    reward: { exp: 45, itemId: 'panacea', itemQty: 1, message: '🌉 旅人から万能薬を受け取った！（EXP +45）' },
  },

  {
    id: 'riverside_visit2_kids', title: '川辺の子供たち',
    condition: { atLoc: 'riverside', minVisitCount: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '子供', text: '「あ！また来た！勇者さんだ！」' },
      { speaker: 'narrator', speakerName: '子供', text: '「この前の魔物退治のお礼に、僕たちで集めたよ。これ、受け取って！」' },
      { speaker: 'player', speakerName: 'レオン', text: '（子供たちが……ありがとう。）絶対に魔王を倒すよ。約束する。' },
      { speaker: 'narrator', speakerName: '子供', text: '「うん！待ってる！」' },
    ],
    reward: { exp: 35, gold: 100, message: '👦 川辺の子供たちから募金をもらった！（EXP +35, +100G）' },
  },

  {
    id: 'watchtower_visit2_soldier', title: '見張り塔の兵士',
    condition: { atLoc: 'watchtower', minVisitCount: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '兵士', text: '「また来たか、勇者。北の方に魔物が集まっているのが見えた。注意しろ。」' },
      { speaker: 'narrator', speakerName: '兵士', text: '「俺にできることは見張ることだけだ。だが、お前たちが頑張っているのは知っている。これを持っていけ。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'ありがとう。必ず成功させる。' },
    ],
    reward: { exp: 25, itemId: 'potion', itemQty: 2, message: '🗼 見張り塔の兵士からポーション×2をもらった！（EXP +25）' },
  },

  {
    id: 'spirit_spring_visit2', title: '精霊の泉・再訪',
    condition: { atLoc: 'spirit_spring', minVisitCount: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '精霊', text: '「また来たな、人間の子よ。泉はいつでも貴方を待っていた。」' },
      { speaker: 'narrator', speakerName: '精霊', text: '「旅の疲れを洗い流すがよい。そして……魔王との戦いに備えよ。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '泉の水が輝き、パーティ全員の傷が瞬く間に癒えた。' },
    ],
    reward: { exp: 50, fullHeal: true, message: '💧 精霊の泉でパーティ全回復！（EXP +50）' },
  },

  {
    id: 'trading_post_visit2', title: '交易所の贈り物',
    condition: { atLoc: 'trading_post', minVisitCount: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '交易所の主人', text: '「久しぶり！また来てくれたんだね。商売繁盛はお前さんのおかげだよ。」' },
      { speaker: 'narrator', speakerName: '交易所の主人', text: '「最近、遠方からも品が届くようになった。特別に仕入れたばかりの品を君にあげよう。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'ありがとう。助かります。' },
    ],
    reward: { exp: 30, itemId: 'hi_potion', itemQty: 2, message: '🏪 交易所からハイポーション×2の贈り物！（EXP +30）' },
  },

  {
    id: 'coastal_road_visit2_sailor', title: '海岸街道の船乗り歌',
    condition: { atLoc: 'coastal_road', minVisitCount: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '船乗り', text: '「よう！またこの道を通るのか。海岸に慣れてきたな。」' },
      { speaker: 'narrator', speakerName: '船乗り', text: '「船乗りの歌を聞かせてやろう。勇気が出るぞ！」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '豪快な歌声が波音と混じり合い、パーティの士気が高まった。' },
      { speaker: 'player', speakerName: 'レオン', text: '（……力が湧いてくる。行こう。）' },
    ],
    reward: { exp: 35, gold: 90, message: '🌊 船乗り歌で気力回復！（EXP +35, +90G）' },
  },

  {
    id: 'forest_entrance_visit2_hunter', title: '森の入口の猟師',
    condition: { atLoc: 'forest_entrance', minVisitCount: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '猟師', text: '「また来たか。この森は最近、魔物が増えた。何か異変が起きている。」' },
      { speaker: 'narrator', speakerName: '猟師', text: '「古代神殿の方から……黒い霧が広がってきているんだ。早く何とかしてくれ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '必ず対処する。この罠の仕掛け方を教えてくれないか？参考にしたい。' },
      { speaker: 'narrator', speakerName: '猟師', text: '「ああ、いくらでも教えよう。お前たちが頼りだからな。」' },
    ],
    reward: { exp: 30, gold: 100, message: '🌲 猟師から森の知恵と支援をもらった！（EXP +30, +100G）' },
  },

  {
    id: 'lighthouse_visit2_keeper', title: '灯台守の秘密',
    condition: { atLoc: 'lighthouse', minVisitCount: 2 },
    dialogues: [
      { speaker: 'narrator', speakerName: '灯台守', text: '「また来てくれたか。潮王ネブラを倒した後でも来てくれるとは……。」' },
      { speaker: 'narrator', speakerName: '灯台守', text: '「実は灯台の下の洞窟に、昔の封印術士が残した品がある。ずっと誰かに渡したかったんだ。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'ありがとうございます。大切に使います。' },
    ],
    reward: { exp: 50, itemId: 'panacea', itemQty: 2, message: '🏮 灯台守から秘蔵の万能薬×2をもらった！（EXP +50）' },
  },

  {
    id: 'demon_mine_visit2_echo', title: '廃鉱山の深奥',
    condition: { atLoc: 'demon_mine', minVisitCount: 2 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '廃鉱山の奥深くから、古い言語で刻まれた石板が見つかった。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '「炎の封印石は、炎の怒りを鎮める者にのみ力を与える。怒りではなく、守護の心で使え……」' },
      { speaker: 'player', speakerName: 'レオン', text: '（守護の心……忘れないようにしよう。）' },
    ],
    reward: { exp: 45, gold: 120, message: '⛏️ 廃鉱山の古石板から封印の知識を得た！（EXP +45, +120G）' },
  },

  {
    id: 'dragon_pass_visit2_shrine', title: '竜の峠の小祠',
    condition: { atLoc: 'dragon_pass', minVisitCount: 2 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '峠の中腹に、小さな祠があった。竜の鱗が供えられている。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '祠の石板には「嵐を越えた者に、嵐の力が宿る」と記されていた。' },
      { speaker: 'player', speakerName: 'レオン', text: '（これは……嵐の封印石の言葉か。戒めとして覚えておこう。）' },
    ],
    reward: { exp: 45, gold: 120, message: '🐲 竜の峠の祠から嵐の知識を得た！（EXP +45, +120G）' },
  },

  {
    id: 'bandit_hideout_visit2_ghost', title: '盗賊アジトの怨念',
    condition: { atLoc: 'bandit_hideout', minVisitCount: 2 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'アジトの奥から、かすかな叫び声が聞こえた。幽霊だろうか……。' },
      { speaker: 'narrator', speakerName: '声', text: '「……盗賊王を倒した者よ……感謝する……我らの怨念を解き放ってくれた……」' },
      { speaker: 'player', speakerName: 'レオン', text: '（ここで命を落とした人たちか……安らかに。）' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '声は消え、代わりに輝く何かがその場に残された。' },
    ],
    reward: { exp: 60, gold: 200, message: '💀 怨念を鎮め、遺品を受け取った！（EXP +60, +200G）' },
  },

  {
    id: 'ancient_temple_visit2_inscription', title: '古代神殿の石刻',
    condition: { atLoc: 'ancient_temple', minVisitCount: 2 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '神殿の奥に、古代語で刻まれた巨大な壁画があった。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '封印の儀式の絵と、三つの封印石が揃った時の光景が描かれている。' },
      { speaker: 'player', speakerName: 'レオン', text: '（これが……三石が揃った時の姿か。もうすぐだ。）' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '壁画の前に跪くと、体の奥から力が湧いてきた。' },
    ],
    reward: { exp: 70, gold: 150, message: '🏛️ 古代壁画から封印の真実を学んだ！（EXP +70, +150G）' },
  },

  {
    id: 'riverside_visit3_storyteller', title: '川辺の語り部',
    condition: { atLoc: 'riverside', minVisitCount: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: '語り部', text: '「旅人よ、何度もここを通るね。少し話を聞かせてくれ。」' },
      { speaker: 'narrator', speakerName: '語り部', text: '「百年前、この川沿いに勇者が通った。魔王を封印する旅の途中だった。その話を伝えるのが私の役目だ。」' },
      { speaker: 'narrator', speakerName: '語り部', text: '「そして今、また勇者が同じ川を歩いている。歴史は繰り返される……でも今度こそ、永遠に終わらせてくれ。」' },
    ],
    reward: { exp: 55, gold: 130, message: '📖 語り部から封印の歴史を聞いた！（EXP +55, +130G）' },
  },

  {
    id: 'watchtower_visit3_signal', title: '見張り塔の狼煙',
    condition: { atLoc: 'watchtower', minVisitCount: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: '兵士長', text: '「久しぶりだな、勇者。今日、塔から狼煙を上げさせてもらった。」' },
      { speaker: 'narrator', speakerName: '兵士長', text: '「各地の守備隊に「勇者が頑張っている」という知らせを送ったんだ。みんなお前を応援している。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（みんなが……）ありがとう。その期待に応える。' },
    ],
    reward: { exp: 60, gold: 200, message: '🗼 各地からの応援メッセージが力になった！（EXP +60, +200G）' },
  },

  {
    id: 'spirit_spring_visit3_great_fairy', title: '大精霊の顕現',
    condition: { atLoc: 'spirit_spring', minVisitCount: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '精霊の泉が激しく光り、巨大な精霊の姿が現れた。' },
      { speaker: 'narrator', speakerName: '大精霊', text: '「人間の子よ……何度もここを訪れ、この地を守ろうとしている。我々精霊は感銘を受けた。」' },
      { speaker: 'narrator', speakerName: '大精霊', text: '「最後の戦いに、我らの全力の加護を送ろう。魔王に打ち勝つことを信じている。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '光が溢れ、パーティ全員の体に精霊のオーラが宿った。' },
    ],
    reward: { exp: 90, fullHeal: true, message: '✨ 大精霊の加護でパーティ完全回復！（EXP +90）' },
  },

  {
    id: 'coastal_road_visit3_lighthouse_signal', title: '海岸の灯台信号',
    condition: { atLoc: 'coastal_road', minVisitCount: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '海岸沿いを歩いていると、遠くの灯台から光信号が来た。' },
      { speaker: 'narrator', speakerName: 'シグ', text: '……あれ、モールス符号だ。「勇者よ、海の向こうも応援している」って書いてある。' },
      { speaker: 'player', speakerName: 'レオン', text: '（知らない人たちも……応援してくれているのか。）行くぞ。みんなのために。' },
    ],
    reward: { exp: 40, gold: 140, message: '🌊 遠方からの応援信号を受け取った！（EXP +40, +140G）' },
  },

  {
    id: 'forest_entrance_visit3_ancient_tree', title: '森の入口の古木',
    condition: { atLoc: 'forest_entrance', minVisitCount: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '森の入口に立つ千年の古木が、何か語りかけてくるような気がした。' },
      { speaker: 'mira', speakerName: 'ミラ', text: '……この木が言っている。「長い時間を見守ってきた。今こそ、その時だ。」と。' },
      { speaker: 'player', speakerName: 'レオン', text: '千年の木が……俺たちを見守っていたのか。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '古木の枝から、一枚の葉が舞い落ちた。緑の光を帯びている。' },
    ],
    reward: { exp: 65, fullHeal: true, message: '🌳 千年の古木の加護でパーティ全回復！（EXP +65）' },
  },

  {
    id: 'trading_post_visit3_mysterious_trader', title: '交易所の謎商人',
    condition: { atLoc: 'trading_post', minVisitCount: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: '謎の商人', text: '「……やっと来た。ずっと待っていたよ、勇者。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'お前は……誰だ？ 会ったことがないが。' },
      { speaker: 'narrator', speakerName: '謎の商人', text: '「私は封印の時代から存在する商人だ。何百年も待っていた。魔王を倒せる人間を。」' },
      { speaker: 'narrator', speakerName: '謎の商人', text: '「これを受け取れ。魔王の弱点を知っている者にしか渡せない秘薬だ。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '商人は秘薬を渡すと、霧の中に消えた。' },
    ],
    reward: { exp: 80, itemId: 'panacea', itemQty: 3, message: '🌟 謎の商人から万能薬×3の秘薬をもらった！（EXP +80）' },
  },

  // ===== ボス討伐後イベント =====
  {
    id: 'after_bandit_king_celebration', title: '盗賊王討伐の祝い',
    condition: { atLoc: 'bern', requiredDefeated: ['bandit_king'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '商人ギルド長', text: '「聞いたぞ！盗賊王カルドを討伐したそうだな！おかげで交易路が安全になった！」' },
      { speaker: 'narrator', speakerName: '商人ギルド長', text: '「ギルド一同、礼を言う。微力ながら、旅の資金を援助させてもらおう。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'ありがとうございます。次の戦いに使わせてもらいます。' },
    ],
    reward: { exp: 60, gold: 400, message: '🎊 商人ギルドから討伐報酬！（EXP +60, +400G）' },
  },

  {
    id: 'after_mine_king_celebration', title: '鉱王討伐の祝い',
    condition: { atLoc: 'alseria', requiredDefeated: ['mine_king'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '国王', text: '「鉱王グラドルを討伐し、炎の封印石を確保したとの報告を受けた。よくやった！」' },
      { speaker: 'narrator', speakerName: '国王', text: '「廃鉱山周辺の村人たちが、ようやく平和に暮らせる。この功績は大きい。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'まだ旅は続きます。次の封印石を必ず手に入れます。' },
      { speaker: 'narrator', speakerName: '国王', text: '「うむ。国の支援を惜しまぬ。これを持っていけ。」' },
    ],
    reward: { exp: 80, gold: 500, message: '💎 国王から炎の封印石討伐報酬！（EXP +80, +500G）' },
  },

  {
    id: 'after_storm_dragon_celebration', title: '嵐竜討伐の祝い',
    condition: { atLoc: 'galdo', requiredDefeated: ['storm_dragon'] },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ガルドの長老', text: '「嵐竜ストームレックスを倒したか……百年ぶりに峠の霧が晴れたぞ。」' },
      { speaker: 'narrator', speakerName: 'ガルドの長老', text: '「この都市を代表して礼を言う。嵐の封印石……大切に使ってくれ。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'はい。必ず魔王を封印します。' },
    ],
    reward: { exp: 80, gold: 500, message: '🌩️ ガルドの長老から嵐竜討伐報酬！（EXP +80, +500G）' },
  },

  {
    id: 'after_forest_king_celebration', title: '森王討伐の祝い',
    condition: { atLoc: 'elna', requiredDefeated: ['forest_king'] },
    dialogues: [
      { speaker: 'narrator', speakerName: 'エルナの族長', text: '「森王モルガが討たれた……これで古代神殿の闇の封印石を手に入れられる。」' },
      { speaker: 'narrator', speakerName: 'エルナの族長', text: '「里を代表してお礼をしたい。旅に必要なものを用意した。使ってくれ。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'ありがとうございます。これで三石全て揃います。' },
    ],
    reward: { exp: 100, gold: 600, itemId: 'panacea', itemQty: 2, message: '🦌 エルナの里から森王討伐報酬！（EXP +100, +600G, 万能薬×2）' },
  },

  {
    id: 'after_tidal_king_celebration', title: '潮王討伐の祝い',
    condition: { atLoc: 'mirea', requiredDefeated: ['tidal_king'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '漁師の長', text: '「潮王ネブラが倒れた！！漁に出られなかった海が、ようやく開いたぞ！」' },
      { speaker: 'narrator', speakerName: '漁師の長', text: '「港の民みんなの感謝を受け取れ。これはほんの気持ちだ。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'みなさんが安全に漁に出られるようになってよかった。' },
    ],
    reward: { exp: 70, gold: 450, message: '🐳 ミレア港から潮王討伐報酬！（EXP +70, +450G）' },
  },

  // ===== 日数マイルストーンイベント =====
  {
    id: 'day_milestone_80', title: '旅の始まり・80日目',
    condition: { atLoc: 'alseria', maxDaysLeft: 80, minDaysLeft: 75 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '旅を始めて20日が経つ。まだ多くのことが分からないが……前には進めている。' },
      { speaker: 'player', speakerName: 'レオン', text: '（残り80日……まだ時間はある。でも、急がなければ。）' },
    ],
    reward: { exp: 20, message: '📅 旅の第1マイルストーン達成！（EXP +20）' },
  },

  {
    id: 'day_milestone_70', title: '旅の中間・70日目',
    condition: { atLoc: 'bern', maxDaysLeft: 70, minDaysLeft: 65 },
    dialogues: [
      { speaker: 'narrator', speakerName: '旅人', text: '「旅も30日目か。君の顔つきが最初と全然違う。鍛えられてきたね。」' },
      { speaker: 'player', speakerName: 'レオン', text: '戦いを重ねるごとに……何かが変わっていく気がします。' },
      { speaker: 'narrator', speakerName: '旅人', text: '「それが成長だよ。残りの旅も頑張れ。」' },
    ],
    reward: { exp: 25, gold: 80, message: '📅 旅の第2マイルストーン達成！（EXP +25, +80G）' },
  },

  {
    id: 'day_milestone_50', title: '旅の折り返し・50日目',
    condition: { atLoc: 'galdo', maxDaysLeft: 50, minDaysLeft: 45 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '残り50日。旅はちょうど折り返しを過ぎた頃だ。' },
      { speaker: 'gares', speakerName: 'ガレス', text: '……封印石は集まっているか？急ぐ必要があるぞ。' },
      { speaker: 'player', speakerName: 'レオン', text: '分かってる。でも仲間の力を信じれば……必ず出来る。' },
    ],
    reward: { exp: 35, gold: 100, message: '📅 旅の折り返しマイルストーン達成！（EXP +35, +100G）' },
  },

  {
    id: 'day_milestone_40', title: '佳境の40日前',
    condition: { atLoc: 'checkpoint', maxDaysLeft: 40, minDaysLeft: 38 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '残り40日。魔王の気配が徐々に濃くなっている。' },
      { speaker: 'narrator', speakerName: '衛兵', text: '「最近、空が暗くなってきた。早めに決着をつけてくれ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '必ずやる……！みんな、もう少し頑張れるか！？' },
    ],
    reward: { exp: 40, gold: 120, message: '📅 決戦への道・40日前マイルストーン！（EXP +40, +120G）' },
  },

  {
    id: 'day_milestone_20', title: '最終決戦前・20日目',
    condition: { atLoc: 'sahal', maxDaysLeft: 20, minDaysLeft: 18 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '残り20日。魔王の影が砂漠の空に映し出される。' },
      { speaker: 'narrator', speakerName: '砂漠の老人', text: '「……勇者よ。時間がない。これを持っていけ。最後の戦いに備えよ。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'ありがとうございます。必ず魔王を倒します！' },
    ],
    reward: { exp: 60, itemId: 'hi_potion', itemQty: 3, message: '⚠️ 最終決戦20日前！ハイポーション×3を受け取った！（EXP +60）' },
  },

  {
    id: 'day_milestone_10', title: '決戦前夜・10日前',
    condition: { atLoc: 'alseria', maxDaysLeft: 10, minDaysLeft: 8 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '残り10日。世界が魔王の気配に震えている。' },
      { speaker: 'narrator', speakerName: '国王', text: '「……勇者よ。これが最後の別れになるかもしれない。だが……信じているぞ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '必ず帰ってきます。魔王の首を土産に。' },
    ],
    reward: { exp: 80, gold: 500, fullHeal: true, message: '⚠️ 決戦10日前！国王から全回復＆500G！（EXP +80）' },
  },

  // ===== 仲間コンビイベント =====
  {
    id: 'gares_liz_faith_discussion', title: 'ガレスとリズの信仰問答',
    condition: { atLoc: 'spirit_spring', anyCompanion: ['gares', 'liz'] },
    dialogues: [
      { speaker: 'gares', speakerName: 'ガレス', text: 'リズ、お前はなぜ神に仕えようと思ったんだ？' },
      { speaker: 'liz', speakerName: 'リズ', text: '……弱い人を助けたかったから。神の力を借りれば、もっと多くの人を癒せると思って。' },
      { speaker: 'gares', speakerName: 'ガレス', text: '俺は騎士として剣で守る。お前は神官として癒しで守る。……結局、同じ目標だな。' },
      { speaker: 'liz', speakerName: 'リズ', text: '（微笑み）ええ。だから私たちは仲間なんです、ガレスさん。' },
    ],
    reward: { exp: 45, message: '🛡️✨ ガレスとリズの絆が深まった！（EXP +45）' },
  },

  {
    id: 'noa_bram_competition', title: 'ノアとブラムの力比べ',
    condition: { atLoc: 'forest_entrance', anyCompanion: ['noa', 'bram'] },
    dialogues: [
      { speaker: 'noa', speakerName: 'ノア', text: 'ねえブラム、どっちが遠くの木を打ち抜けるか勝負しよう！' },
      { speaker: 'bram', speakerName: 'ブラム', text: 'お、面白い！俺は斧で、お前は矢でか？ただし距離は同じにしろよ。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '二人の勝負は接戦となったが……' },
      { speaker: 'noa', speakerName: 'ノア', text: 'やった！私の勝ち！ブラム、また挑戦してね！' },
      { speaker: 'bram', speakerName: 'ブラム', text: '……くそ。次は負けないぞ！（でも……楽しかった。）' },
    ],
    reward: { exp: 40, message: '🏹🪓 ノアとブラムの友情が深まった！（EXP +40）' },
  },

  {
    id: 'finn_vais_thief_lesson', title: 'フィンとヴァイスの秘技',
    condition: { atLoc: 'trading_post', anyCompanion: ['finn', 'vais'] },
    dialogues: [
      { speaker: 'finn', speakerName: 'フィン', text: 'ヴァイスさん……昔、盗賊だった頃の技って、今でも使いますか？' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '……戦闘では使わない。でも、罠の外し方や建物の急所は今でも分かる。なぜだ？' },
      { speaker: 'finn', speakerName: 'フィン', text: '教えてもらえませんか？密偵の技は、戦いの役に立つと思って。' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '（笑）……いいだろう。お前なら悪用しないと信じてる。少しだけ教えてやる。' },
    ],
    reward: { exp: 50, gold: 100, message: '⚔️🗡️ フィンとヴァイスが技を学び合った！（EXP +50, +100G）' },
  },

  {
    id: 'logan_iris_redemption', title: 'ローガンとイリスの共感',
    condition: { atLoc: 'demon_mine', anyCompanion: ['logan', 'iris'] },
    dialogues: [
      { speaker: 'iris', speakerName: 'イリス', text: '……ローガン、あなたも過去に間違ったことをしたと言っていたわね。' },
      { speaker: 'logan', speakerName: 'ローガン', text: 'ああ。処刑人として多くの命を奪った。今でも夢に見る。' },
      { speaker: 'iris', speakerName: 'イリス', text: '私も……魔王軍にいた頃、人を傷つけた。その罪は消えない。でも……一緒に贖えるかな。' },
      { speaker: 'logan', speakerName: 'ローガン', text: '（静かに頷く）……一緒に戦おう。それが俺たちの答えだ。' },
    ],
    reward: { exp: 55, message: '⚒️💜 ローガンとイリスが互いを理解した！（EXP +55）' },
  },

  {
    id: 'sig_elk_wild_plan', title: 'シグとエルクの奇策',
    condition: { atLoc: 'coastal_road', anyCompanion: ['sig', 'elk'] },
    dialogues: [
      { speaker: 'sig', speakerName: 'シグ', text: 'エルク、ちょっと聞いてくれ。魔物の動きを先読みして、罠を仕掛けたらどうだ？' },
      { speaker: 'elk', speakerName: 'エルク', text: '……面白い。俺の獣人の嗅覚で敵を感知して、お前の罠に誘い込むか。' },
      { speaker: 'sig', speakerName: 'シグ', text: '完璧なコンビじゃないか！これで次の戦いは楽勝だ！' },
      { speaker: 'elk', speakerName: 'エルク', text: '……まあ、試してみるか。ただし、俺まで罠にかかるなよ。' },
    ],
    reward: { exp: 45, gold: 120, message: '🎩🐺 シグとエルクの奇策が生まれた！（EXP +45, +120G）' },
  },

  {
    id: 'mira_liz_healer_bond', title: 'ミラとリズの癒し手の絆',
    condition: { atLoc: 'elna', anyCompanion: ['mira', 'liz'] },
    dialogues: [
      { speaker: 'mira', speakerName: 'ミラ', text: 'リズ……あなたの癒しの魔法は、神官の技とは少し違うわね。どこで学んだの？' },
      { speaker: 'liz', speakerName: 'リズ', text: '神殿での修行と……人々の痛みを見続けた経験から、自然と。ミラは？' },
      { speaker: 'mira', speakerName: 'ミラ', text: '森と自然から学んだわ。植物の力を引き出す……。二人で合わせれば、もっと強い癒しになりそう。' },
      { speaker: 'liz', speakerName: 'リズ', text: '（目を輝かせて）一緒に研究しましょう！きっと皆の役に立てる！' },
    ],
    reward: { exp: 50, fullHeal: true, message: '🌿✨ ミラとリズが癒しの研究を始めた！パーティ全回復！（EXP +50）' },
  },

  {
    id: 'zeno_gares_rival_respect', title: 'ゼノとガレスの相互尊重',
    condition: { atLoc: 'dragon_pass', anyCompanion: ['zeno', 'gares'] },
    dialogues: [
      { speaker: 'gares', speakerName: 'ガレス', text: '……ゼノ。俺はお前のことを最初は信用していなかった。魔族だからな。' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '知ってる。俺もお前の「騎士の誇り」ってやつが鬱陶しかった。' },
      { speaker: 'gares', speakerName: 'ガレス', text: '……だが、今は違う。お前の戦いぶりは本物だ。認める。' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '……（珍しく笑う）騎士に認められるとは思わなかった。悪くないな。' },
    ],
    reward: { exp: 55, gold: 150, message: '😈🛡️ ゼノとガレスが互いを認め合った！（EXP +55, +150G）' },
  },

  {
    id: 'cecilsig_magic_scam', title: 'セシルとシグの奇妙な協力',
    condition: { atLoc: 'bern', anyCompanion: ['cecil', 'sig'] },
    dialogues: [
      { speaker: 'sig', speakerName: 'シグ', text: 'セシル、ちょっと頼んでいいか。その光の魔法を使って観客を集めてくれ。』' },
      { speaker: 'cecil', speakerName: 'セシル', text: 'な、なんのために？魔法はショーに使うものじゃないわよ！' },
      { speaker: 'sig', speakerName: 'シグ', text: '集まった人から募金を集めて、全部旅の資金にする。詐欺じゃなくて……パフォーマンスだよ！' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'セシルの魔法ショーは大成功。集まった募金は相当な額になった。' },
    ],
    reward: { exp: 45, gold: 350, message: '🔮🎩 セシルとシグの即興ショーが大成功！（EXP +45, +350G）' },
  },

  {
    id: 'bram_elk_warrior_bond', title: 'ブラムとエルクの戦士の絆',
    condition: { atLoc: 'galdo', anyCompanion: ['bram', 'elk'] },
    dialogues: [
      { speaker: 'bram', speakerName: 'ブラム', text: 'エルク！お前の槍捌き、見るたびに惚れ惚れするぞ！' },
      { speaker: 'elk', speakerName: 'エルク', text: 'お前の斧も負けていないぞ。どこで学んだ？' },
      { speaker: 'bram', speakerName: 'ブラム', text: '故郷の村の鍛冶師に。十年以上、毎日振り続けた。' },
      { speaker: 'elk', speakerName: 'エルク', text: '俺も獣人の長から百の型を学んだ。……一手合わせるか？訓練として。' },
      { speaker: 'bram', speakerName: 'ブラム', text: '望むところだ！いくぞ！！' },
    ],
    reward: { exp: 50, gold: 130, message: '🪓🐺 ブラムとエルクが訓練で絆を深めた！（EXP +50, +130G）' },
  },

  {
    id: 'finn_noa_young_bond', title: 'フィンとノアの若手コンビ',
    condition: { atLoc: 'riverside', anyCompanion: ['finn', 'noa'] },
    dialogues: [
      { speaker: 'finn', speakerName: 'フィン', text: 'ノア、お前ってすごいな……弓の技術が全然違う。俺も剣を極めたい。' },
      { speaker: 'noa', speakerName: 'ノア', text: 'フィンの剣もすごいよ！あの速さは私には無理。お互いにいいとこがあるって思う。' },
      { speaker: 'finn', speakerName: 'フィン', text: '……ノア、もし旅が終わったら……一緒にまた修行しようぜ。いつか俺に弓を教えてくれ。' },
      { speaker: 'noa', speakerName: 'ノア', text: '（笑顔）もちろん！約束！まずは魔王を倒してからね！' },
    ],
    reward: { exp: 45, message: '⚔️🏹 フィンとノアが将来の約束を交わした！（EXP +45）' },
  },

  {
    id: 'logan_mira_nature_warrior', title: 'ローガンとミラの自然観',
    condition: { atLoc: 'elna', anyCompanion: ['logan', 'mira'] },
    dialogues: [
      { speaker: 'mira', speakerName: 'ミラ', text: 'ローガン、あなたは自然に詳しいの？ずっと観察しているみたいだけど。' },
      { speaker: 'logan', speakerName: 'ローガン', text: '……処刑人だった頃、多くの時間を独りで過ごした。自然だけが友だった。' },
      { speaker: 'mira', speakerName: 'ミラ', text: 'そう……。自然は正直ね。人間と違って、裏切らない。' },
      { speaker: 'logan', speakerName: 'ローガン', text: 'ああ。今は……お前たちも信じられるようになった。それで十分だ。' },
    ],
    reward: { exp: 50, message: '⚒️🌿 ローガンとミラが心を開き合った！（EXP +50）' },
  },

  {
    id: 'iris_zeno_dark_power', title: 'イリスとゼノの闇の力',
    condition: { atLoc: 'bandit_hideout', anyCompanion: ['iris', 'zeno'] },
    dialogues: [
      { speaker: 'iris', speakerName: 'イリス', text: '……ゼノ、あなたも感じる？この場所に残る魔の気配。' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: 'ああ。魔族の血が反応する。でもこれは……魔王とは違う種類の闇だ。' },
      { speaker: 'iris', speakerName: 'イリス', text: '私たちみたいな存在は、こういう力に敏感ね。それが弱点でもあり、強みでもある。' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '……その「強み」を最後の戦いで使う。お前も同じだろう。' },
    ],
    reward: { exp: 55, gold: 140, message: '💜😈 イリスとゼノが闇の力を理解し合った！（EXP +55, +140G）' },
  },

  // ===== 封印石獲得後イベント =====
  {
    id: 'seal_fire_acquired', title: '炎の封印石を手に入れて',
    condition: { atLoc: 'traveler_inn', requiredSeals: ['fire'] },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '廃鉱山から戻り、宿で休息を取る。炎の封印石が手に入った。' },
      { speaker: 'player', speakerName: 'レオン', text: '（一つ目の封印石……。残り二つだ。急がなければ。）' },
      { speaker: 'narrator', speakerName: '宿の主人', text: '「おかえり！噂を聞いたよ！廃鉱山を制覇したってね！今夜は特別にご馳走するよ！」' },
    ],
    reward: { exp: 50, fullHeal: true, message: '🔥 炎の封印石を持ち帰り祝宴！パーティ全回復！（EXP +50）' },
  },

  {
    id: 'seal_storm_acquired', title: '嵐の封印石を手に入れて',
    condition: { atLoc: 'galdo', requiredSeals: ['storm'] },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '竜の峠から帰還した。嵐の封印石が輝きを放っている。' },
      { speaker: 'narrator', speakerName: 'ガルドの魔導士', text: '「見事！二つ目の封印石を手に入れたのだな！残り一つ……最後の戦いが近い！」' },
      { speaker: 'player', speakerName: 'レオン', text: '残り一つ。古代神殿の闇の封印石……最後の戦いに備えよう。' },
    ],
    reward: { exp: 70, gold: 300, message: '🌩️ 嵐の封印石獲得を祝う！（EXP +70, +300G）' },
  },

  {
    id: 'seal_all_three_acquired', title: '三石揃う',
    condition: { atLoc: 'alseria', requiredSeals: ['fire', 'storm', 'dark'] },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '三つの封印石が揃った。それぞれが呼応するように光り輝く。' },
      { speaker: 'narrator', speakerName: '国王', text: '「ついに……三石全てが揃ったか！勇者よ、あとは砂漠遺跡の魔王を倒すのみだ！」' },
      { speaker: 'player', speakerName: 'レオン', text: '……ここまで来た。仲間たちと共に、必ず終わらせる。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'パーティの全員が、決意を新たにした。最終決戦は近い。' },
    ],
    reward: { exp: 120, gold: 800, fullHeal: true, message: '🌟 三封印石集結！国王から最大報酬！（EXP +120, +800G, 全回復）' },
  },

  // ===== NPC・環境フレーバーイベント =====
  {
    id: 'alseria_library_scholar', title: '王都の学者',
    condition: { atLoc: 'alseria', minDaysLeft: 50 },
    dialogues: [
      { speaker: 'narrator', speakerName: '学者', text: '「ちょうど良いところに！封印の研究をしているんだが、実物を見た人間が必要でね。」' },
      { speaker: 'player', speakerName: 'レオン', text: '何を知りたいんですか？' },
      { speaker: 'narrator', speakerName: '学者', text: '「封印石に触れた時の感触を教えてくれ。研究の役に立てる……というより、単純に好奇心だが！」' },
      { speaker: 'player', speakerName: 'レオン', text: '……温かくて、何か語りかけてくる感じです。石に意思があるような。' },
      { speaker: 'narrator', speakerName: '学者', text: '「素晴らしい！お礼に文献を渡そう。封印石の使い方が書いてある。」' },
    ],
    reward: { exp: 35, gold: 120, message: '📚 学者の研究に協力した！（EXP +35, +120G）' },
  },

  {
    id: 'alseria_blacksmith', title: '王都の鍛冶師',
    condition: { atLoc: 'alseria', minVisitCount: 2 },
    dialogues: [
      { speaker: 'narrator', speakerName: '鍛冶師', text: '「お前さんの武器、見せてみろ。……うむ、戦いで随分酷使しとるな。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'それほど激しい戦いが続いていて……。' },
      { speaker: 'narrator', speakerName: '鍛冶師', text: '「手入れしてやろう。魔物相手には切れ味が命だ。タダでいい。世界を救う旅にかける金は惜しまん。」' },
    ],
    reward: { exp: 30, gold: 100, message: '⚒️ 鍛冶師が武器を無料で手入れしてくれた！（EXP +30, +100G）' },
  },

  {
    id: 'bern_underground_info', title: 'ベルンの地下情報屋',
    condition: { atLoc: 'bern', minDaysLeft: 40 },
    dialogues: [
      { speaker: 'narrator', speakerName: '情報屋', text: '「……こっちに来い。誰にも聞かれたくない話がある。」' },
      { speaker: 'narrator', speakerName: '情報屋', text: '「砂漠遺跡に魔王が動きをかけている。封印石が全て揃う前に、奴は力を解放しようとしているようだ。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'それは……急がなければ。でも、どこでその情報を？' },
      { speaker: 'narrator', speakerName: '情報屋', text: '「それは言えない。だがこれは本当の話だ。急げ。これは俺からの「投資」だ。世界が滅びたら商売にならん。」' },
    ],
    reward: { exp: 40, gold: 200, message: '🕵️ 地下情報屋から極秘情報を入手！（EXP +40, +200G）' },
  },

  {
    id: 'bern_traveling_bard', title: 'ベルンの吟遊詩人',
    condition: { atLoc: 'bern', minVisitCount: 2, minDaysLeft: 30 },
    dialogues: [
      { speaker: 'narrator', speakerName: '吟遊詩人', text: '「旅の勇者よ！あなたの物語を歌にしたいのです！少し聞かせてください。」' },
      { speaker: 'player', speakerName: 'レオン', text: '……俺の話を歌に？ 特別なことは何も……。' },
      { speaker: 'narrator', speakerName: '吟遊詩人', text: '「いいえ！魔王に立ち向かう旅人の物語は、それだけで伝説です！あなたが戻ってきたら、大ホールで歌いましょう！」' },
      { speaker: 'player', speakerName: 'レオン', text: '（少し気恥ずかしいが……悪くないな。）楽しみにしています。' },
    ],
    reward: { exp: 25, gold: 80, message: '🎵 吟遊詩人があなたの物語を歌にすると約束した！（EXP +25, +80G）' },
  },

  {
    id: 'sahal_desert_monk', title: 'サハルの砂漠僧',
    condition: { atLoc: 'sahal', minDaysLeft: 40 },
    dialogues: [
      { speaker: 'narrator', speakerName: '砂漠の僧', text: '「……旅人よ。砂漠に来たなら、心を鎮める時間を取りなさい。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'でも、急ぎの旅で……。' },
      { speaker: 'narrator', speakerName: '砂漠の僧', text: '「急げば急ぐほど、見落とすものがある。五分だけ目を閉じなさい。砂漠は多くを語りかけてくる。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '言われた通りに目を閉じると、不思議な静けさが体を包んだ。疲れが癒えていく。' },
    ],
    reward: { exp: 40, fullHeal: true, message: '🏜️ 砂漠の僧の瞑想でパーティ全回復！（EXP +40）' },
  },

  {
    id: 'sahal_caravan', title: 'サハルの隊商',
    condition: { atLoc: 'sahal', minVisitCount: 2 },
    dialogues: [
      { speaker: 'narrator', speakerName: '隊商の頭', text: '「おう！また会ったな、勇者。砂漠の越え方、習得したか？」' },
      { speaker: 'player', speakerName: 'レオン', text: 'だいぶ慣れてきました。乾燥と砂が大変ですが。' },
      { speaker: 'narrator', speakerName: '隊商の頭', text: '「隊商のコツを教えてやろう。砂漠では南の岩陰が最も涼しい。そこで休めば体力を保てる。あとこれ、砂漠産の特産品だ。受け取れ。」' },
    ],
    reward: { exp: 30, itemId: 'panacea', itemQty: 1, message: '🐪 砂漠の隊商から砂漠の知恵と万能薬！（EXP +30）' },
  },

  {
    id: 'mirea_dock_worker', title: 'ミレアの港湾労働者',
    condition: { atLoc: 'mirea', minDaysLeft: 50 },
    dialogues: [
      { speaker: 'narrator', speakerName: '港湾労働者', text: '「おい、勇者とやら！ちょっと荷運びを手伝ってくれないか？重たくてな。」' },
      { speaker: 'player', speakerName: 'レオン', text: '……いいですよ。（重い荷物を担ぐ）』' },
      { speaker: 'narrator', speakerName: '港湾労働者', text: '「助かった！あんた力持ちだな。お礼をするよ。最近は魔物のせいで船も出せない。早く安全になって欲しいもんだ。」' },
    ],
    reward: { exp: 25, gold: 150, message: '⚓ 港湾の仕事を手伝って報酬を得た！（EXP +25, +150G）' },
  },

  {
    id: 'mirea_mermaid_legend', title: 'ミレアの人魚伝説',
    condition: { atLoc: 'mirea', minDaysLeft: 30 },
    dialogues: [
      { speaker: 'narrator', speakerName: '漁師の女房', text: '「知ってるかい？この港には昔、人魚が住んでいたって伝説があるんだよ。」' },
      { speaker: 'narrator', speakerName: '漁師の女房', text: '「人魚は嵐の前に漁師たちに警告を出してくれたそうだ。今の嵐も……もしかしたら警告なのかもしれないね。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（魔王の嵐への警告……急がなければ。）大切な話をありがとう。' },
    ],
    reward: { exp: 30, message: '🧜 人魚伝説から新たな示唆を得た！（EXP +30）' },
  },

  {
    id: 'elna_herbalist', title: 'エルナの薬草師',
    condition: { atLoc: 'elna', minDaysLeft: 50 },
    dialogues: [
      { speaker: 'narrator', speakerName: '薬草師', text: '「旅人さん！ちょうど良かった。新しい薬を試してくれる人を探していたんだ。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'どんな薬ですか……？ 怪しくはないですよね？' },
      { speaker: 'narrator', speakerName: '薬草師', text: '「失礼な！エルフの秘伝、森の生命力を凝縮した薬だよ。体の傷を急速に治す。試してみて。効くから！」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '薬を飲んだ瞬間、体の隅々まで温かいものが広がった。確かに……これは効く。' },
    ],
    reward: { exp: 35, itemId: 'hi_potion', itemQty: 2, message: '🌿 エルフの秘薬でハイポーション×2を得た！（EXP +35）' },
  },

  {
    id: 'elna_forest_spirit_dance', title: 'エルナの精霊祭り',
    condition: { atLoc: 'elna', minVisitCount: 4 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '夜になると、エルナの里で精霊の踊りが始まった。光の球が舞い、木々が揺れる。' },
      { speaker: 'narrator', speakerName: 'エルフの踊り子', text: '「一年に一度の精霊祭りよ。あなたも参加してみて！精霊が力を授けてくれる。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '踊りの輪に加わると、温かい光が体を包んだ。疲れが吹き飛んでいく。' },
    ],
    reward: { exp: 60, fullHeal: true, message: '🎭 精霊祭りでパーティ全回復！（EXP +60）' },
  },

  {
    id: 'galdo_clockmaker', title: 'ガルドの時計師',
    condition: { atLoc: 'galdo', minDaysLeft: 45 },
    dialogues: [
      { speaker: 'narrator', speakerName: '時計師', text: '「あんた、すごく急いで旅してるね。時計を持ってないだろう？これをあげよう。」' },
      { speaker: 'narrator', speakerName: '時計師', text: '「砂時計だ。１時間が計れる。戦いの中で時間を感じる感覚……それが生死を分けることもある。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（時間を大切に……）ありがとうございます。絶対に無駄にしません。' },
    ],
    reward: { exp: 30, gold: 100, message: '⏳ 時計師から砂時計をもらった！（EXP +30, +100G）' },
  },

  {
    id: 'galdo_magic_university', title: 'ガルドの魔法大学',
    condition: { atLoc: 'galdo', minDaysLeft: 60 },
    dialogues: [
      { speaker: 'narrator', speakerName: '学生', text: '「先生！勇者さんが来ています！特別講義をお願いできませんか？！」' },
      { speaker: 'narrator', speakerName: '魔法教授', text: '「それは素晴らしい！勇者様、学生たちに封印石の経験を聞かせてもらえますか？」' },
      { speaker: 'player', speakerName: 'レオン', text: '……良いですよ。（話しながら）実際に戦ってみると、教科書には書かれていないことが多いですよ。' },
      { speaker: 'narrator', speakerName: '学生', text: '「すごい……！頑張ってください！」（歓声）' },
    ],
    reward: { exp: 50, gold: 200, message: '🎓 魔法大学で特別講義をした！（EXP +50, +200G）' },
  },

  {
    id: 'traveler_inn_war_veteran', title: '宿の退役軍人',
    condition: { atLoc: 'traveler_inn', minDaysLeft: 50 },
    dialogues: [
      { speaker: 'narrator', speakerName: '退役兵', text: '「……俺も若い頃は戦った。魔物との戦いで右腕を失った。でも後悔はしていない。」' },
      { speaker: 'player', speakerName: 'レオン', text: '……それは、なぜですか？' },
      { speaker: 'narrator', speakerName: '退役兵', text: '「守りたいものがあったからだ。お前も同じだろう？なら、俺みたいに生き残れ。生きて帰ることが、最初の勝利だ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '……ありがとうございます。肝に銘じます。' },
    ],
    reward: { exp: 40, itemId: 'potion', itemQty: 3, message: '🏅 退役兵の言葉が力になった！ポーション×3！（EXP +40）' },
  },

  {
    id: 'traveler_inn_runaway_child', title: '宿の迷子',
    condition: { atLoc: 'traveler_inn', minVisitCount: 4 },
    dialogues: [
      { speaker: 'narrator', speakerName: '子供', text: '（泣いている）「……お母さんが……いない……」' },
      { speaker: 'player', speakerName: 'レオン', text: 'どうした？お母さんはどこだ？' },
      { speaker: 'narrator', speakerName: '子供', text: '「旅の途中で……迷子に……」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'しばらく探すと、宿の奥で泣き崩れている母親が見つかった。子供を抱き合う二人を見て、温かい気持ちになった。' },
      { speaker: 'narrator', speakerName: '母親', text: '「ありがとうございます！！この子を守ってくれて……。お礼を受け取ってください！」' },
    ],
    reward: { exp: 35, gold: 200, message: '👶 迷子を助けた！（EXP +35, +200G）' },
  },

  {
    id: 'checkpoint_deserter', title: '関所の脱走兵',
    condition: { atLoc: 'checkpoint', minDaysLeft: 40 },
    dialogues: [
      { speaker: 'narrator', speakerName: '若い兵士', text: '「……俺はもう、こんな戦いは嫌だ。家に帰りたい……」' },
      { speaker: 'player', speakerName: 'レオン', text: '……お前は逃げようとしているのか。' },
      { speaker: 'narrator', speakerName: '若い兵士', text: '「そうだ！何が悪い！こんな巨大な魔王なんかに……勝てるわけが」' },
      { speaker: 'player', speakerName: 'レオン', text: '俺も怖い。仲間たちも怖い。でも逃げたら、お前の家族が危険になる。それでも逃げるか？' },
      { speaker: 'narrator', speakerName: '若い兵士', text: '「……（長い沈黙）……やっぱり、戦う。……お前みたいな人が戦っているなら、俺も。」' },
    ],
    reward: { exp: 50, gold: 150, message: '🗺️ 脱走兵を思いとどまらせた！（EXP +50, +150G）' },
  },

  {
    id: 'great_bridge_ferry_man', title: '大橋の渡し守',
    condition: { atLoc: 'great_bridge', minDaysLeft: 50 },
    dialogues: [
      { speaker: 'narrator', speakerName: '渡し守', text: '「橋が使えない時のために、小舟を用意しているんだがね……最近、川の魔物が増えて困っている。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'その魔物、退治しましょうか？ 旅の途中ですが。' },
      { speaker: 'narrator', speakerName: '渡し守', text: '「本当かい！？ありがたい！退治してくれたら、次に渡る時は無料にするよ！」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '川の魔物を退治すると、渡し守は大喜びでお礼を弾んでくれた。' },
    ],
    reward: { exp: 45, gold: 180, message: '🌉 渡し守の依頼を達成！（EXP +45, +180G）' },
  },

  {
    id: 'riverside_abandoned_dog', title: '川辺の捨て犬',
    condition: { atLoc: 'riverside', minDaysLeft: 60 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '川辺に、怪我をした子犬が一匹、震えていた。' },
      { speaker: 'player', speakerName: 'レオン', text: '（……どうした？ 一人か？）' },
      { speaker: 'liz', speakerName: 'リズ', text: '怪我をしているわ……。癒しの魔法を使わせて。（子犬に触れる）よし、これで大丈夫。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '子犬は元気になり、近くの農家に引き取られた。農家の人は大喜びでお礼を渡してくれた。' },
    ],
    reward: { exp: 30, gold: 120, message: '🐶 子犬を助けた！農家からお礼！（EXP +30, +120G）' },
  },

  {
    id: 'riverside_flood_warning', title: '川辺の洪水の危機',
    condition: { atLoc: 'riverside', minDaysLeft: 40 },
    dialogues: [
      { speaker: 'narrator', speakerName: '農夫', text: '「助けてくれ！川が溢れそうで！魔物が水源の岩を壊したんだ！」' },
      { speaker: 'player', speakerName: 'レオン', text: '行こう、皆！岩を直すか、魔物を排除するかだ！' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '素早く魔物を片付け、岩を修復した。農家の村は洪水を免れた。' },
      { speaker: 'narrator', speakerName: '農夫', text: '「命の恩人だ！本当にありがとう……！」' },
    ],
    reward: { exp: 55, gold: 250, message: '🌊 洪水の危機から村を救った！（EXP +55, +250G）' },
  },

  {
    id: 'watchtower_night_watch', title: '見張り塔の夜番',
    condition: { atLoc: 'watchtower', minDaysLeft: 45 },
    dialogues: [
      { speaker: 'narrator', speakerName: '兵士', text: '「今夜の夜番が一人倒れてしまって……代わりに見張りをお願いできますか？」' },
      { speaker: 'player', speakerName: 'レオン', text: 'わかりました。少しなら。（数時間見張りをする）' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '見張りの間、遠くに魔物の影を確認した。詳細な位置を兵士に報告すると、事前に撃退できた。' },
      { speaker: 'narrator', speakerName: '兵士長', text: '「助かりました！本当に目がいいんですね。お礼に武器の手入れを。」' },
    ],
    reward: { exp: 40, gold: 160, message: '🗼 夜番を代わりに務めた！（EXP +40, +160G）' },
  },

  {
    id: 'spirit_spring_koi_legend', title: '精霊の泉の黄金鯉',
    condition: { atLoc: 'spirit_spring', minDaysLeft: 60 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '精霊の泉に、黄金色に輝く鯉が泳いでいた。見ていると、こちらを向いた。' },
      { speaker: 'narrator', speakerName: '黄金鯉', text: '（テレパシーで）「……人間の子よ。お前の心は真摯だ。この泉の精霊に代わり、力を授けよう。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（鯉が……話している？）』' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '鯉は光の粒を吐き出し、それがパーティに降り注いだ。体が軽くなる。' },
    ],
    reward: { exp: 65, fullHeal: true, message: '🐟 黄金鯉の祝福でパーティ全回復！（EXP +65）' },
  },

  {
    id: 'trading_post_stolen_goods', title: '交易所の盗品騒動',
    condition: { atLoc: 'trading_post', minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: '商人', text: '「盗まれた！昨日の夜、大切な荷物が消えた！誰か犯人を見つけてくれ！」' },
      { speaker: 'player', speakerName: 'レオン', text: 'どんな荷物だ？何か手がかりは？' },
      { speaker: 'narrator', speakerName: '商人', text: '「薬草の入った箱だ。近くに足跡が……小さい。子供かもしれない。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '追いかけると、空腹の孤児が見つかった。商人に話すと……「いいさ、必要なら持っていけ。俺が馬鹿だった」と言い、孤児を引き取った。' },
    ],
    reward: { exp: 45, gold: 200, message: '🏪 盗品騒動を解決した！孤児に安住の地が！（EXP +45, +200G）' },
  },

  {
    id: 'coastal_road_shipwreck', title: '海岸街道の難破船',
    condition: { atLoc: 'coastal_road', minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '海岸に、難破した小さな船が流れ着いていた。中に生存者がいる。' },
      { speaker: 'narrator', speakerName: '生存者', text: '「助けてくれ……！嵐に遭って……仲間が……」' },
      { speaker: 'player', speakerName: 'レオン', text: 'リズ、癒しを！他の仲間は船の残骸を確認してくれ！' },
      { speaker: 'narrator', speakerName: '生存者', text: '「（回復して）ありがとう……！船に積んでいた荷物がまだあるはずだ。使ってくれ。お礼だ。」' },
    ],
    reward: { exp: 50, gold: 300, itemId: 'hi_potion', itemQty: 1, message: '⚓ 難破船の生存者を救助！（EXP +50, +300G, ハイポーション）' },
  },

  {
    id: 'forest_entrance_lost_traveler', title: '森の入口の迷子旅人',
    condition: { atLoc: 'forest_entrance', minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: '迷子旅人', text: '「助かった……！もう二日も森で迷っていて……。出口が見つからなくて……。」' },
      { speaker: 'player', speakerName: 'レオン', text: '案内しますよ。どこへ行きたいですか？' },
      { speaker: 'narrator', speakerName: '迷子旅人', text: '「エルナの里に。……本当にありがとう。お礼にこれを。今は使えないものだけど、きっとあなたには価値がある。」' },
    ],
    reward: { exp: 35, gold: 220, message: '🌲 迷子の旅人を助けた！（EXP +35, +220G）' },
  },

  {
    id: 'demon_mine_trapped_miner', title: '廃鉱山の閉じ込められた鉱夫',
    condition: { atLoc: 'demon_mine', minDaysLeft: 40 },
    dialogues: [
      { speaker: 'narrator', speakerName: '鉱夫の声', text: '（奥から）「……誰かいるか！助けてくれ！岩が崩れて出られない！」' },
      { speaker: 'player', speakerName: 'レオン', text: '今行く！（岩を砕いて道を開ける）' },
      { speaker: 'narrator', speakerName: '鉱夫', text: '「あんたが勇者か！命の恩人だ……！実は魔物を調査しに来たのだが、囚われてしまって。これを渡す。封印石のある場所を示す地図だ。」' },
    ],
    reward: { exp: 55, gold: 250, message: '⛏️ 廃鉱山の鉱夫を救出！秘密の地図を入手！（EXP +55, +250G）' },
  },

  {
    id: 'dragon_pass_mountain_hermit', title: '竜の峠の仙人',
    condition: { atLoc: 'dragon_pass', minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: '仙人', text: '「……久しぶりに人間を見た。何十年ぶりかな。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'こんな峠に一人で？ 何をしているんですか？' },
      { speaker: 'narrator', speakerName: '仙人', text: '「修行だよ。封印の力を維持するための……。わしも昔、魔王と戦った。敗れたが、ここで次の勇者を待ち続けた。お前がその人か。」' },
      { speaker: 'narrator', speakerName: '仙人', text: '「長年の修行で蓄えた力を、全てお前に渡そう。もうわしの役目は終わった。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '仙人は光の玉を手渡すと、静かに消えた。' },
    ],
    reward: { exp: 90, gold: 300, message: '🧙 仙人の長年の力を受け継いだ！（EXP +90, +300G）' },
  },

  {
    id: 'bandit_hideout_reformed_bandit', title: '改心した元盗賊',
    condition: { atLoc: 'bandit_hideout', minDaysLeft: 45 },
    dialogues: [
      { speaker: 'narrator', speakerName: '元盗賊', text: '「……お前さんたちか。盗賊王を倒したという。俺は元部下だが……改心した。」' },
      { speaker: 'player', speakerName: 'レオン', text: '今は何をしているんだ？' },
      { speaker: 'narrator', speakerName: '元盗賊', text: '「仲間の遺品を集めて、家族に届けている。……遅すぎるが、できることをするしかない。」' },
      { speaker: 'narrator', speakerName: '元盗賊', text: '「お前たちには世話になった。これ、仲間が持っていた秘蔵の品だ。役立ててくれ。」' },
    ],
    reward: { exp: 50, itemId: 'hi_potion', itemQty: 2, message: '💀 改心した元盗賊からハイポーション×2！（EXP +50）' },
  },

  {
    id: 'ancient_temple_priest', title: '古代神殿の最後の神官',
    condition: { atLoc: 'ancient_temple', minDaysLeft: 30 },
    dialogues: [
      { speaker: 'narrator', speakerName: '老神官', text: '「……待っていた。この神殿の最後の守り人として、ずっとここにいた。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'どれくらい……いたんですか？' },
      { speaker: 'narrator', speakerName: '老神官', text: '「百年だ。封印が弱まってから、ずっと。でも……お前が来てくれた。私の役目は終わった。この神殿の全ての力を、お前に継承しよう。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '神官は神聖な光を放ち、それがパーティに降り注いだ。神官の姿は光の中に溶けていった。' },
    ],
    reward: { exp: 100, fullHeal: true, message: '🏛️ 最後の神官の加護を受けた！パーティ全回復！（EXP +100）' },
  },

  {
    id: 'desert_ruins_guardian_spirit', title: '砂漠遺跡の守護霊',
    condition: { atLoc: 'desert_ruins', minDaysLeft: 15 },
    dialogues: [
      { speaker: 'narrator', speakerName: '守護霊', text: '「……お前が来るのを待っていた。砂漠遺跡の守護者として。」' },
      { speaker: 'player', speakerName: 'レオン', text: '守護者？ お前は……魔王の手先か？' },
      { speaker: 'narrator', speakerName: '守護霊', text: '「違う。かつてここで魔王と戦い、命を落とした勇者だ。魔王を倒せなかった無念で……今も留まっている。」' },
      { speaker: 'narrator', speakerName: '守護霊', text: '「今度こそ……頼む。俺の分まで戦ってくれ。これが俺の最後の力だ。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '守護霊が光の粒となり、消えた。その力がパーティに宿る。' },
    ],
    reward: { exp: 100, gold: 500, fullHeal: true, message: '🌑 先代勇者の力を引き継いだ！（EXP +100, +500G, 全回復）' },
  },

  // ===== 追加選択肢イベント =====
  {
    id: 'alseria_royal_request', title: '王の試練',
    condition: { atLoc: 'alseria', minDaysLeft: 60, minPlayerLevel: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: '国王', text: '「勇者よ。お前を試したい。ひとつ頼みを聞いてくれるか。」' },
      { speaker: 'narrator', speakerName: '国王', text: '「困っている村人を助けるか、封印石の情報を先に集めるか……どちらを優先してくれるか、判断を見たい。」' },
    ],
    branch: {
      prompt: '国王の試練。あなたはどちらを選ぶ？',
      options: [
        {
          label: '村人を助ける',
          reward: { exp: 80, gold: 200, message: '👑 王に認められた！村人を優先した正義の心を評価された！（EXP +80, +200G）' },
        },
        {
          label: '封印石を優先する',
          reward: { exp: 60, gold: 300, message: '🗡️ 王に認められた！目標への意志の強さを評価された！（EXP +60, +300G）' },
        },
      ],
    },
  },

  {
    id: 'bern_merchant_gamble', title: '商人の大博打',
    condition: { atLoc: 'bern', minDaysLeft: 50 },
    dialogues: [
      { speaker: 'narrator', speakerName: '商人', text: '「特別な取引を持ちかけよう。賭けに乗るか？」' },
      { speaker: 'narrator', speakerName: '商人', text: '「300Gを賭ければ、成功すれば3倍になる。失敗したらゼロだ。成功率は……まあ、半々ってとこだ。どうする？」' },
    ],
    branch: {
      prompt: '商人の賭け。どうする？',
      options: [
        {
          label: '賭けに乗る（300G）',
          cost: 300,
          winChance: 0.5,
          reward: { gold: 900, exp: 50, message: '🎲 大当たり！賭けに勝った！（+900G, EXP +50）' },
          loseReward: { exp: 20, message: '🎲 賭けに負けた……（EXP +20）' },
        },
        {
          label: '断る',
          reward: { exp: 15, message: '💰 慎重な判断をした！（EXP +15）' },
        },
      ],
    },
  },

  {
    id: 'sahal_desert_oracle', title: '砂漠の予言者',
    condition: { atLoc: 'sahal', minDaysLeft: 45 },
    dialogues: [
      { speaker: 'narrator', speakerName: '予言者', text: '「……旅人よ。私の予言を聞くか？代金は500Gだ。」' },
      { speaker: 'narrator', speakerName: '予言者', text: '「未来を知ることは、助けになることも、恐怖になることもある。それでも聞くか？」' },
    ],
    branch: {
      prompt: '砂漠の予言者の問い。聞くか？',
      options: [
        {
          label: '予言を聞く（500G）',
          cost: 500,
          reward: { exp: 70, gold: 200, message: '🔮 予言を聞いた！「三石揃えば、道は開ける」……（EXP +70, +200G）' },
        },
        {
          label: '断る（未来は自分で切り開く）',
          reward: { exp: 30, message: '🌄 自らの力で未来を切り開く決意をした！（EXP +30）' },
        },
      ],
    },
  },

  {
    id: 'elna_tree_offering', title: 'エルナの霊木への奉納',
    condition: { atLoc: 'elna', minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'エルフの老人', text: '「旅人よ。この霊木に奉納をしてみないか。自分の大切なものを、木の根元に置くのだ。」' },
      { speaker: 'narrator', speakerName: 'エルフの老人', text: '「見返りを求めない奉納こそ、精霊に喜ばれる。だが……もちろん、答えてくれることもある。」' },
    ],
    branch: {
      prompt: '霊木への奉納。何を捧げる？',
      options: [
        {
          label: '200Gを奉納する',
          cost: 200,
          winChance: 0.7,
          reward: { exp: 80, fullHeal: true, message: '🌳 精霊が応えた！パーティ全回復！（EXP +80）' },
          loseReward: { exp: 40, message: '🌳 静かな感謝が返ってきた。（EXP +40）' },
        },
        {
          label: '奉納しない',
          reward: { exp: 10, message: '🌳 霊木の前で一礼した。（EXP +10）' },
        },
      ],
    },
  },

  {
    id: 'galdo_magic_duel', title: 'ガルドの魔法決闘',
    condition: { atLoc: 'galdo', minPlayerLevel: 7 },
    dialogues: [
      { speaker: 'narrator', speakerName: '魔法使いの弟子', text: '「あなたが勇者の仲間ですか？腕試しがしたい。魔法決闘で！」' },
      { speaker: 'narrator', speakerName: '魔法使いの弟子', text: '「もちろん本気じゃないけど……賭けを加えれば面白い。どうですか？」' },
    ],
    branch: {
      prompt: '魔法決闘の申し込み。どうする？',
      options: [
        {
          label: '決闘を受ける（300G賭け）',
          cost: 300,
          winChance: 0.65,
          reward: { exp: 100, gold: 600, message: '⚡ 魔法決闘に勝利！（EXP +100, +600G）' },
          loseReward: { exp: 50, message: '⚡ 惜しくも敗北。いい勉強になった。（EXP +50）' },
        },
        {
          label: '丁重に断る',
          reward: { exp: 20, message: '🔮 今は旅を優先した。（EXP +20）' },
        },
      ],
    },
  },

  {
    id: 'lighthouse_mystery_bottle', title: '灯台のボトルメッセージ',
    condition: { atLoc: 'lighthouse', minDaysLeft: 35 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '灯台の岩場に、瓶が流れ着いていた。中に手紙が入っている。' },
      { speaker: 'narrator', speakerName: '手紙の内容', text: '「海の向こうから。あなたのことは風の噂で聞きました。頑張ってください。世界中があなたを信じています。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（海の向こうからも……）' },
    ],
    branch: {
      prompt: '手紙に返事を書くか？',
      options: [
        {
          label: '返事を書いて海に流す',
          reward: { exp: 50, gold: 100, message: '🏮 ボトルメッセージに返事を書いた！（EXP +50, +100G）' },
        },
        {
          label: 'そっと胸にしまう',
          reward: { exp: 35, message: '🏮 メッセージを心の支えにした。（EXP +35）' },
        },
      ],
    },
  },

  {
    id: 'coastal_road_stranded_ship', title: '海岸の漂着船の交渉',
    condition: { atLoc: 'coastal_road', minDaysLeft: 48 },
    dialogues: [
      { speaker: 'narrator', speakerName: '船長', text: '「助けてくれ……船が嵐で浜に乗り上げた。このままでは沈む。」' },
      { speaker: 'narrator', speakerName: '船長', text: '「修理の手伝いをしてくれたら、持っている積み荷を分けよう。それともこの古地図を渡そうか？ どちらがいい？」' },
    ],
    branch: {
      prompt: '船長の申し出。どちらを受け取る？',
      options: [
        {
          label: '積み荷（回復アイテム）をもらう',
          reward: { exp: 45, itemId: 'hi_potion', itemQty: 2, message: '⚓ 修理を手伝い、ハイポーション×2をもらった！（EXP +45）' },
        },
        {
          label: '古地図をもらう',
          reward: { exp: 55, gold: 350, message: '⚓ 修理を手伝い、古地図を換金した！（EXP +55, +350G）' },
        },
      ],
    },
  },

  {
    id: 'forest_entrance_fairy_gift', title: '森入口の妖精の申し出',
    condition: { atLoc: 'forest_entrance', minDaysLeft: 50 },
    dialogues: [
      { speaker: 'narrator', speakerName: '妖精', text: '「旅人さん！力を貸してくれたら、お礼をするよ！どちらがいい？」' },
      { speaker: 'narrator', speakerName: '妖精', text: '「森の薬草をたくさん、または……特別な加護を！どっちがいいか決めて！」' },
    ],
    branch: {
      prompt: '妖精の申し出。どちらを選ぶ？',
      options: [
        {
          label: '薬草（アイテム）をもらう',
          reward: { exp: 40, itemId: 'panacea', itemQty: 2, message: '🧚 妖精から万能薬×2をもらった！（EXP +40）' },
        },
        {
          label: '加護（EXP）をもらう',
          reward: { exp: 90, message: '🧚 妖精の加護で経験値を得た！（EXP +90）' },
        },
      ],
    },
  },

  {
    id: 'demon_mine_trapped_spirit', title: '廃鉱山の囚われた精霊',
    condition: { atLoc: 'demon_mine', minDaysLeft: 35 },
    dialogues: [
      { speaker: 'narrator', speakerName: '精霊の声', text: '「……助けて……ここに閉じ込められて……長い……」' },
      { speaker: 'player', speakerName: 'レオン', text: '誰かいるのか！？ 声はどこから……？' },
      { speaker: 'narrator', speakerName: '精霊の声', text: '「岩の奥に……岩を砕いてくれれば……自由に……なれる……でも岩を砕くには時間とお前たちの力が必要だ……」' },
    ],
    branch: {
      prompt: '精霊を助けるか？',
      options: [
        {
          label: '岩を砕いて助ける（時間を使う）',
          reward: { exp: 70, fullHeal: true, message: '✨ 精霊を解放した！感謝の加護でパーティ全回復！（EXP +70）' },
        },
        {
          label: '旅を優先して先へ進む',
          reward: { exp: 20, message: '⛏️ 心が痛むが先へ進んだ。（EXP +20）' },
        },
      ],
    },
  },

  {
    id: 'dragon_pass_frozen_warrior', title: '竜の峠の凍った戦士',
    condition: { atLoc: 'dragon_pass', minDaysLeft: 48 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '峠の岩陰に、氷漬けになった甲冑の戦士がいた。……かすかに生きている。' },
      { speaker: 'narrator', speakerName: '凍った戦士', text: '（かすかに）「……解いてくれ……嵐竜に……やられて……何年も……」' },
    ],
    branch: {
      prompt: '凍った戦士をどうする？',
      options: [
        {
          label: '火で溶かして助ける',
          reward: { exp: 65, gold: 400, message: '🔥 戦士を解放した！長年の感謝で報酬を受けた！（EXP +65, +400G）' },
        },
        {
          label: '先を急ぐ（見守るだけ）',
          reward: { exp: 15, message: '🏔️ 心に留めて先へ進んだ。（EXP +15）' },
        },
      ],
    },
  },

  // ===== 追加ストーリーイベント =====
  {
    id: 'alseria_spy_discovered', title: '王城の密偵',
    condition: { atLoc: 'alseria', minPlayerLevel: 6 },
    dialogues: [
      { speaker: 'narrator', speakerName: '衛兵', text: '「勇者！王城に怪しい者が紛れ込んだ！追跡をお願いしたい！」' },
      { speaker: 'player', speakerName: 'レオン', text: 'わかった！（追跡する）' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '密偵を追い詰めると、魔王軍の斥候だと分かった。情報を得た後、衛兵に引き渡した。' },
      { speaker: 'narrator', speakerName: '衛兵', text: '「見事だ！魔王軍の内部情報が手に入った。これを報酬として受け取れ。」' },
    ],
    reward: { exp: 60, gold: 350, message: '🏰 密偵を捕縛！魔王軍の情報を入手！（EXP +60, +350G）' },
  },

  {
    id: 'bern_market_thief', title: 'ベルンの市場荒らし',
    condition: { atLoc: 'bern', minPlayerLevel: 4 },
    dialogues: [
      { speaker: 'narrator', speakerName: '商人', text: '「待て！泥棒！！」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '市場で窃盗が起きた。逃げる犯人を追う！' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '（追いかけの末に）……捕まえた！ 犯人を商人に引き渡す。' },
      { speaker: 'narrator', speakerName: '商人', text: '「ありがとう！！この商品を全部買ってくれた値段で渡すよ！」' },
    ],
    reward: { exp: 45, gold: 280, message: '🏃 市場の窃盗犯を捕まえた！（EXP +45, +280G）' },
  },

  {
    id: 'sahal_sand_storm_shelter', title: 'サハルの砂嵐避難',
    condition: { atLoc: 'sahal', minDaysLeft: 35 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '突然の砂嵐が来た！素早く建物に逃げ込む。' },
      { speaker: 'narrator', speakerName: '宿の主人', text: '「よく逃げられた！この砂嵐は魔王の力が原因だと言われている。早く何とかしてくれ……」' },
      { speaker: 'player', speakerName: 'レオン', text: '必ず解決する。今は嵐が過ぎるまで待とう。……（宿の人たちと話す）' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '嵐の間、宿の人々と語り合った。多くの人が魔王を恐れ、勇者を待ち望んでいることを知った。' },
    ],
    reward: { exp: 40, gold: 150, message: '🌪️ 砂嵐を乗り越えた！（EXP +40, +150G）' },
  },

  {
    id: 'mirea_sea_monster', title: 'ミレアの港の海魔物',
    condition: { atLoc: 'mirea', minPlayerLevel: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: '漁師', text: '「助けてくれ！港に巨大な海魔物が現れた！船が壊される！」' },
      { speaker: 'player', speakerName: 'レオン', text: '行こう！（港に向かう）' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '激しい戦闘の末、海魔物を港から追い払った。港には歓声が上がった。' },
      { speaker: 'narrator', speakerName: '港の人々', text: '「勇者万歳！！ありがとう！！」' },
    ],
    reward: { exp: 70, gold: 380, message: '🌊 港の海魔物を退治！港の英雄に！（EXP +70, +380G）' },
  },

  {
    id: 'elna_forest_fire', title: 'エルナの森の火事',
    condition: { atLoc: 'elna', minPlayerLevel: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '森の端が燃えている！魔物が放火したようだ。' },
      { speaker: 'mira', speakerName: 'ミラ', text: '（叫ぶ）森が！早く消火を！！' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '仲間たちと協力して、水を運び、魔物を排除し、ようやく火を消すことができた。' },
      { speaker: 'mira', speakerName: 'ミラ', text: '（泣きながら）良かった……。ありがとう、みんな。この森を守ってくれて。' },
    ],
    reward: { exp: 65, gold: 300, message: '🔥 エルナの森の火事を消し止めた！（EXP +65, +300G）' },
  },

  {
    id: 'galdo_experiment_accident', title: 'ガルドの実験事故',
    condition: { atLoc: 'galdo', minPlayerLevel: 6 },
    dialogues: [
      { speaker: 'narrator', speakerName: '魔法使い', text: '「大変だ！学生の実験が暴走して制御不能になった！助けを！」' },
      { speaker: 'player', speakerName: 'レオン', text: 'わかった！どこだ！（走る）' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '暴走した魔法陣と戦い、制御を取り戻した。学生たちは無事だった。' },
      { speaker: 'narrator', speakerName: '魔法教授', text: '「本当に助かりました。実験の謝礼と、情報をお渡しします。」' },
    ],
    reward: { exp: 60, gold: 320, message: '⚗️ ガルドの実験事故を解決！（EXP +60, +320G）' },
  },

  {
    id: 'traveler_inn_haunting', title: '旅人の宿の幽霊騒動',
    condition: { atLoc: 'traveler_inn', minPlayerLevel: 4 },
    dialogues: [
      { speaker: 'narrator', speakerName: '宿の主人', text: '「助かった……最近、宿に幽霊が出るって噂で客が来ないんだ。調べてくれないか？」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '調査すると、幽霊の正体は封印の失敗で霊体になってしまった旅人だった。リズの力で成仏させた。' },
      { speaker: 'liz', speakerName: 'リズ', text: '安らかに……。（成仏の祈りを捧げる）' },
      { speaker: 'narrator', speakerName: '宿の主人', text: '「すごい！幽霊がいなくなった！何日でも無料で泊まっていいよ！」' },
    ],
    reward: { exp: 50, fullHeal: true, message: '👻 旅人の宿の幽霊を成仏させた！全回復！（EXP +50）' },
  },

  {
    id: 'checkpoint_spy_network', title: '関所の密告',
    condition: { atLoc: 'checkpoint', minPlayerLevel: 6 },
    dialogues: [
      { speaker: 'narrator', speakerName: '関所長', text: '「……実は、この関所にも魔王軍の密偵が潜んでいたという密告があった。」' },
      { speaker: 'narrator', speakerName: '関所長', text: '「内部を洗い出す手伝いをしてもらえるか？ お前たちなら怪しい者を見分けられるはずだ。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '調査の末、密偵を一人発見した。取り調べで魔王軍の動向を聞き出した。' },
    ],
    reward: { exp: 65, gold: 400, message: '🗺️ 関所の密偵を摘発！貴重な情報を得た！（EXP +65, +400G）' },
  },

  {
    id: 'great_bridge_ambush', title: '大橋の待ち伏せ',
    condition: { atLoc: 'great_bridge', minPlayerLevel: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '橋の中ほどで、魔王軍の兵士が待ち伏せしていた！' },
      { speaker: 'narrator', speakerName: '魔王軍兵士', text: '「勇者よ……ここを通らせるわけにはいかない！」' },
      { speaker: 'player', speakerName: 'レオン', text: 'これ以上、俺たちの邪魔をするな！（戦闘）' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '激しい戦いの末、魔王軍を退けた。橋を無事に渡ることができた。' },
    ],
    reward: { exp: 70, gold: 350, message: '🌉 大橋の待ち伏せを撃退！（EXP +70, +350G）' },
  },

  {
    id: 'riverside_poison_water', title: '川辺の毒の川',
    condition: { atLoc: 'riverside', minPlayerLevel: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: '農夫', text: '「川の水が黒くなった！作物が枯れていく！」' },
      { speaker: 'player', speakerName: 'レオン', text: '上流に何かある。確認しに行こう。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '上流で毒の魔物が水源を汚染していた。倒すと川の水が元に戻っていった。' },
      { speaker: 'narrator', speakerName: '農夫', text: '「奇跡だ！川が綺麗になった！ありがとう！！」' },
    ],
    reward: { exp: 60, gold: 300, message: '💧 川の毒を浄化した！（EXP +60, +300G）' },
  },

  {
    id: 'watchtower_kite_signal', title: '見張り塔の凧信号',
    condition: { atLoc: 'watchtower', minPlayerLevel: 3 },
    dialogues: [
      { speaker: 'narrator', speakerName: '兵士', text: '「昔の戦いで使った凧信号を修復したい。勇者の印章を使って信号凧を作ってもいいか？」' },
      { speaker: 'player', speakerName: 'レオン', text: '……構わない。それが役に立つなら。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '勇者の印章入りの凧が空に舞い上がる。各地で「勇者が戦っている」という知らせが届いた。' },
      { speaker: 'narrator', speakerName: '兵士', text: '「凧のおかげで、各地の部隊の士気が上がった！本当にありがとう！」' },
    ],
    reward: { exp: 45, gold: 200, message: '🪁 各地の士気が上がった！（EXP +45, +200G）' },
  },

  {
    id: 'spirit_spring_dry_up', title: '精霊の泉が涸れる',
    condition: { atLoc: 'spirit_spring', minPlayerLevel: 6 },
    dialogues: [
      { speaker: 'narrator', speakerName: '精霊', text: '「……魔王の力が強まった。泉の力が弱まっている……」' },
      { speaker: 'player', speakerName: 'レオン', text: '何が出来るか？ 精霊、力を貸してくれ！' },
      { speaker: 'narrator', speakerName: '精霊', text: '「お前の封印石の力を少し分けてくれれば……泉を回復できる。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'プレイヤーが力を分け与えると、泉が輝きを取り戻した。精霊は大きく笑顔になった。' },
    ],
    reward: { exp: 80, fullHeal: true, message: '💧 泉を回復させた！大精霊の感謝でパーティ全回復！（EXP +80）' },
  },

  {
    id: 'trading_post_caravan_attack', title: '交易所への襲撃',
    condition: { atLoc: 'trading_post', minPlayerLevel: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '交易所に魔物の一団が押し寄せてきた！商人たちが逃げ惑う。' },
      { speaker: 'player', speakerName: 'レオン', text: 'みんな、構えろ！（戦闘）' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '激戦の末、魔物を全て排除した。商人たちは安堵の息をついた。' },
      { speaker: 'narrator', speakerName: '商人ギルド代表', text: '「本当にありがとう！全員無事だ！報酬を受け取ってくれ！」' },
    ],
    reward: { exp: 70, gold: 450, message: '🏪 交易所への魔物の襲撃を撃退！（EXP +70, +450G）' },
  },

  {
    id: 'coastal_road_treasure_chest', title: '海岸街道の宝箱',
    condition: { atLoc: 'coastal_road', minPlayerLevel: 4 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '海岸の岩場に、古い宝箱が半分砂に埋まっていた。' },
      { speaker: 'player', speakerName: 'レオン', text: '（掘り起こして開けてみると……）' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '封印の時代の護符と金貨が入っていた。かなり価値があるようだ。' },
    ],
    reward: { exp: 50, gold: 500, message: '💰 海岸の宝箱を発見！（EXP +50, +500G）' },
  },

  {
    id: 'forest_entrance_bug_collector', title: '森の昆虫採集家',
    condition: { atLoc: 'forest_entrance', minDaysLeft: 65 },
    dialogues: [
      { speaker: 'narrator', speakerName: '昆虫採集家', text: '「ねえ、旅人さん！変な虫を見なかった？光る緑色の虫を探しているんだけど！」' },
      { speaker: 'player', speakerName: 'レオン', text: '（探してみると……）あ、これか？ 木の葉の裏に光っている虫が。' },
      { speaker: 'narrator', speakerName: '昆虫採集家', text: '「それ！！やったあ！ありがとう！お礼に、これ。虫の研究で集めた情報費！」' },
    ],
    reward: { exp: 25, gold: 150, message: '🐛 光る虫を見つけた！（EXP +25, +150G）' },
  },

  {
    id: 'demon_mine_gas_pocket', title: '廃鉱山の毒ガス',
    condition: { atLoc: 'demon_mine', minDaysLeft: 45 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '鉱山の深部で、毒ガスが漏れていることに気づいた。' },
      { speaker: 'narrator', speakerName: 'セシル', text: '「危険よ！このまま進むと……！でも、魔法で換気できるかもしれない。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'セシルの魔法でガスを散らし、安全な経路を確保した。' },
      { speaker: 'narrator', speakerName: '近くにいた作業員', text: '「助かりました！危うく命を落とすところだった。これを持っていってください。」' },
    ],
    reward: { exp: 50, itemId: 'antidote', itemQty: 3, message: '⛏️ 毒ガスを退散させた！毒消し×3をもらった！（EXP +50）' },
  },

  {
    id: 'bandit_hideout_prisoner', title: '盗賊アジトの囚人',
    condition: { atLoc: 'bandit_hideout', minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: '囚人', text: '「……助けてください……盗賊に捕らわれて何週間も……！」' },
      { speaker: 'player', speakerName: 'レオン', text: '解放する！（鎖を断ち切る）' },
      { speaker: 'narrator', speakerName: '囚人', text: '「ありがとう……！実は私、魔法の研究者で……封印に関する資料を持っていた。盗賊に奪われたが、頭の中には全部残っている。これを書き記したものをどうぞ。」' },
    ],
    reward: { exp: 55, gold: 350, message: '🔓 囚人を解放！貴重な封印の資料を得た！（EXP +55, +350G）' },
  },

  {
    id: 'ancient_temple_moon_ritual', title: '古代神殿の月光儀式',
    condition: { atLoc: 'ancient_temple', minDaysLeft: 40 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '夜の古代神殿に、月の光が降り注いだ。壁の紋様が光り輝く。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '紋様の光が文字を形成した……「月の夜に力を試す者に、古の力を与えん」' },
      { speaker: 'player', speakerName: 'レオン', text: '（月明かりの中、封印石を掲げると……）' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '神殿全体が輝き、パーティに古の力が宿った。' },
    ],
    reward: { exp: 85, gold: 400, message: '🌕 月光儀式で古の力を得た！（EXP +85, +400G）' },
  },

  {
    id: 'desert_ruins_old_map', title: '砂漠遺跡の古地図',
    condition: { atLoc: 'desert_ruins', minDaysLeft: 20 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '砂漠遺跡の入口近く、砂に半分埋もれた石板があった。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '石板には遺跡の内部地図が刻まれていた。魔王の居室への最短経路が分かる。' },
      { speaker: 'player', speakerName: 'レオン', text: '（これで迷わなくて済む。……行くぞ、皆！）' },
    ],
    reward: { exp: 60, message: '🗺️ 砂漠遺跡の内部地図を発見！（EXP +60）' },
  },

  // ===== 難易度依存マイルストーン =====
  {
    id: 'hard_mode_day60_struggle', title: '困難な旅の60日目',
    condition: { atLoc: 'sahal', maxDaysLeft: 60, minDaysLeft: 58 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '過酷な旅が続いている。敵は強く、資金も厳しい。それでも……進み続ける。' },
      { speaker: 'player', speakerName: 'レオン', text: '（疲れた……でも。まだ諦めるわけにはいかない。）' },
      { speaker: 'narrator', speakerName: '砂漠の老人', text: '「旅人よ。砂漠は強い者を歓迎する。弱い者を鍛えることで、な。頑張りなさい。」' },
    ],
    reward: { exp: 45, itemId: 'potion', itemQty: 2, message: '💪 困難を乗り越えた！（EXP +45, ポーション×2）' },
  },

  {
    id: 'mid_journey_reflection', title: '旅の中間回顧',
    condition: { atLoc: 'great_bridge', maxDaysLeft: 55, minDaysLeft: 52 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '橋の上で立ち止まると、旅を振り返る気持ちになった。' },
      { speaker: 'player', speakerName: 'レオン', text: '（仲間たちと出会い、戦い、ここまで来た。まだまだこれからだ……。）' },
      { speaker: 'gares', speakerName: 'ガレス', text: '……何を考えている？ 感傷に浸るのはまだ早いぞ。' },
      { speaker: 'player', speakerName: 'レオン', text: '（笑）そうだな。行こう、ガレス。まだ先がある。' },
    ],
    reward: { exp: 40, gold: 120, message: '🌉 旅の中間地点を通過した！（EXP +40, +120G）' },
  },

  {
    id: 'gares_liz_escort_mission', title: 'ガレスとリズの護送任務',
    condition: { atLoc: 'checkpoint', anyCompanion: ['gares', 'liz'] },
    dialogues: [
      { speaker: 'narrator', speakerName: '老婦人', text: '「……あのう。エルナの里まで護送してもらえないでしょうか。一人で行くには……」' },
      { speaker: 'gares', speakerName: 'ガレス', text: '……お前、俺たちの旅のペースで大丈夫か？ 危険だぞ。' },
      { speaker: 'liz', speakerName: 'リズ', text: 'ガレスさん！助けましょう。それが勇者の仲間の役目です！（微笑み）' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'エルナへの道中、老婦人の昔話を聞きながら旅した。無事に届けることができた。' },
    ],
    reward: { exp: 50, gold: 180, message: '🛡️✨ 老婦人をエルナまで無事に護送した！（EXP +50, +180G）' },
  },

  {
    id: 'noa_sig_information_gathering', title: 'ノアとシグの情報収集',
    condition: { atLoc: 'bern', anyCompanion: ['noa', 'sig'] },
    dialogues: [
      { speaker: 'sig', speakerName: 'シグ', text: 'ノア、俺の情報収集に付き合ってくれ。俺一人じゃ怪しまれる。' },
      { speaker: 'noa', speakerName: 'ノア', text: '（眉をひそめ）……また詐欺まがいのことをするんじゃないでしょうね。' },
      { speaker: 'sig', speakerName: 'シグ', text: '今回はちゃんとした情報収集！……ちょっとだけ演技が入るけど。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '二人の奇妙なコンビ演技で、魔王軍の動向に関する貴重な情報が集まった。' },
    ],
    reward: { exp: 55, gold: 250, message: '🏹🎩 ノアとシグの情報収集が大成功！（EXP +55, +250G）' },
  },

  {
    id: 'bram_finn_training_match', title: 'ブラムとフィンの特訓',
    condition: { atLoc: 'great_bridge', anyCompanion: ['bram', 'finn'] },
    dialogues: [
      { speaker: 'finn', speakerName: 'フィン', text: 'ブラムさん！特訓に付き合ってください！まだまだ強くなりたい！' },
      { speaker: 'bram', speakerName: 'ブラム', text: '（ニヤリと）ようやくそういう気持ちになったか。いいだろう！全力でいくぞ！！' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '橋の上で激しい特訓が行われた。フィンは何度も倒れながらも立ち上がった。' },
      { speaker: 'bram', speakerName: 'ブラム', text: '……合格だ。本物の戦士の根性だ。俺が認めてやる。' },
    ],
    reward: { exp: 65, gold: 150, message: '🪓⚔️ ブラムとフィンの特訓が実を結んだ！（EXP +65, +150G）' },
  },

  {
    id: 'vais_mira_nature_talk', title: 'ヴァイスとミラの自然談義',
    condition: { atLoc: 'forest_entrance', anyCompanion: ['vais', 'mira'] },
    dialogues: [
      { speaker: 'vais', speakerName: 'ヴァイス', text: '……ミラ、お前は盗賊なんかと旅することを、嫌だと思わないのか？' },
      { speaker: 'mira', speakerName: 'ミラ', text: '……最初は警戒したわ。でも森は過去を問わない。今のあなたを見ている。私も同じ。' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '（静かに）……エルフはそういう考え方をするのか。不思議だな。' },
      { speaker: 'mira', speakerName: 'ミラ', text: '人間もそうあれるわよ。あなたはもう変わっているから。』' },
    ],
    reward: { exp: 50, gold: 140, message: '🗡️🌿 ヴァイスとミラが心を通わせた！（EXP +50, +140G）' },
  },

  {
    id: 'zeno_finn_age_difference', title: 'ゼノとフィンの世代差',
    condition: { atLoc: 'riverside', anyCompanion: ['zeno', 'finn'] },
    dialogues: [
      { speaker: 'finn', speakerName: 'フィン', text: 'ゼノさん……魔族ってどのくらい生きるんですか？' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '……人間の十倍は普通だ。お前みたいな若造が何千人も生まれて死ぬのを見てきた。』' },
      { speaker: 'finn', speakerName: 'フィン', text: 'それは……寂しくないですか？' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '（静かに）……正直に言うと。今がいちばん、生きていると感じる。お前たちと一緒だから、かな。' },
    ],
    reward: { exp: 50, message: '😈⚔️ ゼノとフィンが異世代で理解し合った！（EXP +50）' },
  },

  {
    id: 'iris_sig_con_artist', title: 'イリスとシグの見抜き合い',
    condition: { atLoc: 'trading_post', anyCompanion: ['iris', 'sig'] },
    dialogues: [
      { speaker: 'iris', speakerName: 'イリス', text: 'シグ……今、その商人を騙そうとしてたでしょう。見えてたわよ。' },
      { speaker: 'sig', speakerName: 'シグ', text: 'えっ！？ ……さすが元魔王軍、観察眼が鋭い。本当に何も逃さないね。' },
      { speaker: 'iris', speakerName: 'イリス', text: '……私も人を騙すことがあった。だから分かる。そのやり方は、いつか自分に返ってくる。' },
      { speaker: 'sig', speakerName: 'シグ', text: '（しばらく沈黙して）……わかった。今回は正直にいく。……たまには。』' },
    ],
    reward: { exp: 50, gold: 160, message: '💜🎩 イリスとシグが本音をぶつけ合った！（EXP +50, +160G）' },
  },

  {
    id: 'elk_logan_wilderness_survival', title: 'エルクとローガンの野外訓練',
    condition: { atLoc: 'coastal_road', anyCompanion: ['elk', 'logan'] },
    dialogues: [
      { speaker: 'elk', speakerName: 'エルク', text: '……ローガン、野外で生き残る術を知っているか？ 俺の故郷では基本だが。' },
      { speaker: 'logan', speakerName: 'ローガン', text: '処刑人の頃、荒野を一人で移動することがあった。独学で覚えた。' },
      { speaker: 'elk', speakerName: 'エルク', text: '（驚いた様子で）……知ってる奴がいたか。じゃあ比べてみよう。どちらが上かな？' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '二人の競い合いで、パーティ全体の野外生存スキルが大幅に向上した。' },
    ],
    reward: { exp: 55, gold: 170, message: '🐺⚒️ エルクとローガンの野外訓練でパーティが強化！（EXP +55, +170G）' },
  },

  {
    id: 'gares_noa_strategy_talk', title: 'ガレスとノアの戦術論',
    condition: { atLoc: 'watchtower', anyCompanion: ['gares', 'noa'] },
    dialogues: [
      { speaker: 'gares', speakerName: 'ガレス', text: 'ノア、最前線に突っ込みすぎだ。後衛の弓使いが前に出てどうする。' },
      { speaker: 'noa', speakerName: 'ノア', text: '仲間が危なければ、私が動くしかないじゃない。後衛でじっとしてられない！' },
      { speaker: 'gares', speakerName: 'ガレス', text: '……（ため息）気持ちは分かる。だが戦術上、お前が生き残ることが最も重要だ。弓が使えなくなると困る。' },
      { speaker: 'noa', speakerName: 'ノア', text: '（少し納得）……わかった。でも限界に来たら動くからね！』' },
    ],
    reward: { exp: 50, gold: 140, message: '🛡️🏹 ガレスとノアの戦術が向上した！（EXP +50, +140G）' },
  },

  {
    id: 'liz_cecil_magic_exchange', title: 'リズとセシルの魔法交換',
    condition: { atLoc: 'spirit_spring', anyCompanion: ['liz', 'cecil'] },
    dialogues: [
      { speaker: 'liz', speakerName: 'リズ', text: 'セシル、あなたの魔法って神官の術とは全然違うのね。仕組みを教えてもらえる？' },
      { speaker: 'cecil', speakerName: 'セシル', text: 'もちろん！私の魔力は自然から引き出すの。リズの神聖魔法は神の力を借りるでしょう？』' },
      { speaker: 'liz', speakerName: 'リズ', text: '（目を輝かせて）合わせれば……もしかして、すごい力になるかも！' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '二人が泉の前で魔法を試した。光と魔力が混合し、かつてない輝きを放った。' },
    ],
    reward: { exp: 60, fullHeal: true, message: '✨🔮 リズとセシルの合同魔法！パーティ全回復！（EXP +60）' },
  },

  // ===== 追加NPC・ランダムストーリーイベント（第2弾）=====
  {
    id: 'alseria_orphanage', title: '王都の孤児院',
    condition: { atLoc: 'alseria', minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: '孤児院の修道女', text: '「勇者様！子供たちがあなたのことを聞いて、どうしても会いたいと言っていて……」' },
      { speaker: 'narrator', speakerName: '子供たち', text: '「勇者だ！本物だ！すごい！」（子供たちが集まってくる）' },
      { speaker: 'player', speakerName: 'レオン', text: '（照れながら）俺はそんな大したもんじゃないけど……でも頑張るよ。みんなのために。' },
      { speaker: 'narrator', speakerName: '子供たち', text: '「やったあ！魔王倒してね！！」' },
    ],
    reward: { exp: 35, gold: 100, message: '👶 孤児院の子供たちに元気をもらった！（EXP +35, +100G）' },
  },

  {
    id: 'alseria_veteran_healer', title: '王都の老癒し師',
    condition: { atLoc: 'alseria', minDaysLeft: 40 },
    dialogues: [
      { speaker: 'narrator', speakerName: '老癒し師', text: '「旅で傷を負っているな。座りなさい。これが最後の癒し薬だ……受け取れ。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'でも、先生には必要では……？' },
      { speaker: 'narrator', speakerName: '老癒し師', text: '「わしは年老いた。もう戦えない体だ。だが、君たちを通じて、まだ戦える。遠慮するな。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '老癒し師の手が震えながらも、確かな力を持って薬を差し出した。' },
    ],
    reward: { exp: 45, itemId: 'panacea', itemQty: 2, message: '🏛️ 老癒し師から万能薬×2と想いを受け取った！（EXP +45）' },
  },

  {
    id: 'bern_armorer', title: 'ベルンの防具職人',
    condition: { atLoc: 'bern', minDaysLeft: 45 },
    dialogues: [
      { speaker: 'narrator', speakerName: '防具職人', text: '「魔王に立ち向かう装備が欲しいか？ 俺の最高傑作を見せよう。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'これは……素晴らしい出来だ。でも高そうで……。' },
      { speaker: 'narrator', speakerName: '防具職人', text: '「いや、世界を救う勇者からは金を取らん！腕が上がる装備の代わりに、生き残って帰ってこい。それが俺への返礼だ。」' },
    ],
    reward: { exp: 50, gold: 400, message: '🛡️ 防具職人から最高の装備と支援を受けた！（EXP +50, +400G）' },
  },

  {
    id: 'bern_trade_routes', title: 'ベルンの交易路情報',
    condition: { atLoc: 'bern', minDaysLeft: 60 },
    dialogues: [
      { speaker: 'narrator', speakerName: '商人団長', text: '「魔物が増えてから交易路が荒れている。あなたの旅の情報を共有してもらえないか？」' },
      { speaker: 'player', speakerName: 'レオン', text: '俺が知っていることなら。（情報を交換する）' },
      { speaker: 'narrator', speakerName: '商人団長', text: '「ありがとう！これで安全な迂回路が分かった。情報提供料として、これを受け取ってくれ。」' },
    ],
    reward: { exp: 30, gold: 280, message: '🗺️ 交易路情報を交換した！（EXP +30, +280G）' },
  },

  {
    id: 'sahal_dancing_lights', title: 'サハルの砂漠の踊り',
    condition: { atLoc: 'sahal', minDaysLeft: 60 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '夜のサハルで、砂漠の祭りが行われていた。炎の踊りが夜空を照らす。' },
      { speaker: 'narrator', speakerName: '踊り子', text: '「旅人さん、一緒に踊りませんか？砂漠の神に旅の安全を祈ってもらいましょう！」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '慣れない踊りに戸惑いながらも、祭りに参加した。夜明けまで続く宴は、旅の疲れを癒してくれた。' },
    ],
    reward: { exp: 40, fullHeal: true, message: '🔥 砂漠の祭りに参加！パーティ全回復！（EXP +40）' },
  },

  {
    id: 'sahal_ancient_ruins_nearby', title: 'サハルの古遺跡の話',
    condition: { atLoc: 'sahal', minDaysLeft: 50 },
    dialogues: [
      { speaker: 'narrator', speakerName: '考古学者', text: '「砂漠のすぐ外れに小さな遺跡を発見した。でも危険で近づけなくて……」' },
      { speaker: 'player', speakerName: 'レオン', text: 'それは砂漠遺跡とは別の場所ですか？' },
      { speaker: 'narrator', speakerName: '考古学者', text: '「別の場所だ。だが……そこに封印石の知識を記した石板があると思う。調べられたら、連絡してくれ。この金は先払いだ。」' },
    ],
    reward: { exp: 35, gold: 300, message: '🏜️ 考古学者から依頼と先払いを受けた！（EXP +35, +300G）' },
  },

  {
    id: 'mirea_lighthouse_keeper', title: 'ミレアの旧灯台守',
    condition: { atLoc: 'mirea', minDaysLeft: 45 },
    dialogues: [
      { speaker: 'narrator', speakerName: '旧灯台守', text: '「……灯台岬の守り人をやめてから何年経つかな。あの灯台に今は誰もいない。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'なぜやめたんですか？' },
      { speaker: 'narrator', speakerName: '旧灯台守', text: '「魔物が怖くてな……。でも潮王が倒れたと聞いて、また戻れるかもしれない。お前さんのおかげだ。」' },
      { speaker: 'narrator', speakerName: '旧灯台守', text: '「これを持っていけ。灯台の秘密の倉庫に残していった品だ。」' },
    ],
    reward: { exp: 45, gold: 250, itemId: 'ether', itemQty: 2, message: '⚓ 旧灯台守からの感謝！エーテル×2！（EXP +45, +250G）' },
  },

  {
    id: 'elna_youth_warrior', title: 'エルナの若き戦士',
    condition: { atLoc: 'elna', minPlayerLevel: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: '若いエルフ', text: '「お前が勇者か！俺も一緒に戦わせてくれ！！」' },
      { speaker: 'player', speakerName: 'レオン', text: '気持ちはわかる。でも今は里を守る役目がある。ここで頑張れ。' },
      { speaker: 'narrator', speakerName: '若いエルフ', text: '「……（悔しそうに）わかった。でも、俺もいつか戦えるくらい強くなる。約束する！」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '若いエルフの目に、眩しいほどの光が宿った。その熱意が、不思議と力になった。' },
    ],
    reward: { exp: 40, gold: 160, message: '🌿 若いエルフの闘志が力になった！（EXP +40, +160G）' },
  },

  {
    id: 'galdo_stargazer', title: 'ガルドの星見師',
    condition: { atLoc: 'galdo', minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: '星見師', text: '「星が語っている……今夜は特別な配置だ。封印の儀式に最もふさわしい夜だ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '星が……封印に関係あるんですか？' },
      { speaker: 'narrator', speakerName: '星見師', text: '「封印石は星の力を借りて作られた。だから、星が揃う夜に力が最大になる。次の戦いの前に星を見ておくといい。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '星見師の望遠鏡で夜空を眺めた。星の光が何かを語りかけてくるような気がした。' },
    ],
    reward: { exp: 45, message: '🌟 星の予言を受けた！（EXP +45）' },
  },

  {
    id: 'traveler_inn_lost_letter', title: '宿で見つけた手紙',
    condition: { atLoc: 'traveler_inn', minDaysLeft: 60 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '宿の部屋に、前の宿泊者が忘れていった手紙があった。' },
      { speaker: 'narrator', speakerName: '手紙の内容', text: '「旅する者へ。この道は険しいが、諦めるな。私もかつてこの宿に泊まり、諦めかけた。でも前に進んだことで、人生が変わった。あなたも必ず——」' },
      { speaker: 'player', speakerName: 'レオン', text: '（……誰が書いたんだろう。でも、心に沁みる。）' },
    ],
    reward: { exp: 30, message: '✉️ 旅人の手紙から励ましを得た！（EXP +30）' },
  },

  {
    id: 'checkpoint_army_training', title: '関所での軍の訓練',
    condition: { atLoc: 'checkpoint', minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: '将軍', text: '「おお！勇者が来たか。丁度良い。兵士たちの訓練に付き合ってもらえないか？」' },
      { speaker: 'player', speakerName: 'レオン', text: 'それは構いませんが……（全力でいいですか？）' },
      { speaker: 'narrator', speakerName: '将軍', text: '「当然！お手柔らかに！（笑）」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '訓練の相手を務めた。兵士たちも鍛えられたが……プレイヤーもいい汗をかいた。' },
    ],
    reward: { exp: 50, gold: 220, message: '⚔️ 関所の軍訓練に参加した！（EXP +50, +220G）' },
  },

  {
    id: 'great_bridge_river_troll', title: '大橋の川鬼',
    condition: { atLoc: 'great_bridge', minPlayerLevel: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '橋の下から、大きな影が現れた。川鬼だ！橋を渡れない。' },
      { speaker: 'narrator', speakerName: '川鬼', text: '「橋を渡りたければ、謎を解け！解けなければ、川に落とすぞ！」' },
      { speaker: 'player', speakerName: 'レオン', text: '（試してみよう）……いいだろう。謎を出してくれ。' },
      { speaker: 'narrator', speakerName: '川鬼', text: '（謎を出し、プレイヤーが正解すると）「……正解だ。通っていいぞ。お前は賢い……これをやる。」' },
    ],
    reward: { exp: 45, gold: 200, message: '🌉 川鬼の謎を解いた！（EXP +45, +200G）' },
  },

  {
    id: 'riverside_water_sprite', title: '川辺の水の精霊',
    condition: { atLoc: 'riverside', minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: '水の精霊', text: '「……人間の子よ。この川に何度も来るのね。何を求めて？」' },
      { speaker: 'player', speakerName: 'レオン', text: '魔王を倒すための力……と。いや、仲間と自分を信じることかもしれない。' },
      { speaker: 'narrator', speakerName: '水の精霊', text: '「良い答えね。力だけを求める者には何も与えない。でもあなたには……川の祝福を贈りましょう。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '川の水が一瞬輝き、パーティ全員の体が軽くなった。' },
    ],
    reward: { exp: 55, fullHeal: true, message: '💧 川の水の精霊の祝福！パーティ全回復！（EXP +55）' },
  },

  {
    id: 'watchtower_eagle_scout', title: '見張り塔の鷹匠',
    condition: { atLoc: 'watchtower', minDaysLeft: 58 },
    dialogues: [
      { speaker: 'narrator', speakerName: '鷹匠', text: '「勇者さん！うちの鷹を使ってくれ。偵察に使えば、敵の動向が分かるぞ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '本当か！？ 頼む！（鷹を空に放つ）' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '鷹が帰ってきた。持ってきた羽根には……次の目的地付近の敵情報が記されていた。' },
      { speaker: 'narrator', speakerName: '鷹匠', text: '「よかった！この情報、役立てよ。鷹への礼は最後に生還することだ。」' },
    ],
    reward: { exp: 45, gold: 180, message: '🦅 鷹匠の鷹が情報を持ち帰った！（EXP +45, +180G）' },
  },

  {
    id: 'spirit_spring_wish_stone', title: '精霊の泉の願い石',
    condition: { atLoc: 'spirit_spring', minDaysLeft: 45 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '精霊の泉の底に、光る石が見えた。「願い石」という伝説の石だろうか。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '石を取り出すと、温かい光が手のひらに広がる。' },
      { speaker: 'player', speakerName: 'レオン', text: '（心の中で願う……みんなが無事に旅を終えられるように。）' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '石が輝いた。願いが届いた気がした。' },
    ],
    reward: { exp: 60, gold: 200, message: '💎 願い石を見つけた！願いが力になった！（EXP +60, +200G）' },
  },

  {
    id: 'trading_post_rare_map', title: '交易所の秘密の品',
    condition: { atLoc: 'trading_post', minDaysLeft: 50 },
    dialogues: [
      { speaker: 'narrator', speakerName: '骨董商', text: '「これは……珍しい客だ。これを見てもらえるか？ 古い品なんだが……。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（見ると）これは……封印石の起源が描かれた絵巻物だ！' },
      { speaker: 'narrator', speakerName: '骨董商', text: '「分かるか！？ 売り物にするつもりだったが……勇者に見せてよかった。持っていってくれ。封印の旅に役立てるなら本望だ。」' },
    ],
    reward: { exp: 70, gold: 200, message: '📜 封印石の起源絵巻物を入手！（EXP +70, +200G）' },
  },

  {
    id: 'coastal_road_ghost_ship', title: '海岸街道の幽霊船',
    condition: { atLoc: 'coastal_road', minDaysLeft: 43 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '深夜の海岸に、光のない船が漂っていた。幽霊船の伝説がある。' },
      { speaker: 'sig', speakerName: 'シグ', text: '（興奮気味に）あれは……！幽霊船に積まれた財宝の話は本当だったのか！？』' },
      { speaker: 'player', speakerName: 'レオン', text: '（慎重に近づくと）……中に何かいる。でも敵ではなさそうだ。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '船の中には封印の時代に沈んだ宝が残っていた。幽霊船の守り主に礼を言い、宝の一部を受け取った。' },
    ],
    reward: { exp: 65, gold: 550, message: '👻 幽霊船の宝を発見！（EXP +65, +550G）' },
  },

  {
    id: 'forest_entrance_fireflies', title: '森の入口の蛍',
    condition: { atLoc: 'forest_entrance', minDaysLeft: 60 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '夜の森の入口に、無数の蛍が舞っていた。光の回廊のようだ。' },
      { speaker: 'liz', speakerName: 'リズ', text: '……綺麗……（思わず立ち止まる）こんな夜に旅をしているなんて。』' },
      { speaker: 'player', speakerName: 'レオン', text: '……こういう景色が、旅を続ける理由の一つかもしれない。（少しだけ立ち止まって眺める）' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'しばしの休憩。心が穏やかになった。疲れが癒えていく。' },
    ],
    reward: { exp: 30, fullHeal: true, message: '✨ 蛍の光の中で心が癒えた！パーティ全回復！（EXP +30）' },
  },

  {
    id: 'demon_mine_crystals', title: '廃鉱山の封印結晶',
    condition: { atLoc: 'demon_mine', minDaysLeft: 50 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '鉱山の奥に、炎色に輝く結晶が群生していた。これは……封印の副産物だろうか。' },
      { speaker: 'narrator', speakerName: 'イリス', text: '「……この結晶、魔力を帯びている。危険じゃないけど……力を吸収できるかも。」' },
      { speaker: 'player', speakerName: 'レオン', text: '試してみよう。（結晶に触れると）おお……力が！' },
    ],
    reward: { exp: 70, gold: 250, message: '💎 廃鉱山の封印結晶から力を吸収！（EXP +70, +250G）' },
  },

  {
    id: 'dragon_pass_ice_cave', title: '竜の峠の氷の洞窟',
    condition: { atLoc: 'dragon_pass', minDaysLeft: 50 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '峠の脇道に、氷の洞窟が口を開けていた。中が光っている。' },
      { speaker: 'narrator', speakerName: 'エルク', text: '「……獣の気配がする。でも怒っていない。入っても大丈夫だ。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '洞窟の奥に、古代の封印術士が残した秘宝があった。' },
    ],
    reward: { exp: 60, gold: 400, message: '🧊 峠の氷洞窟で秘宝を発見！（EXP +60, +400G）' },
  },

  {
    id: 'bandit_hideout_secret_room', title: '盗賊アジトの秘密の部屋',
    condition: { atLoc: 'bandit_hideout', minDaysLeft: 50 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'アジトの壁に隠し扉を発見した。その先に秘密の部屋が。' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '……俺が盗賊だった頃、こういう隠し部屋の作り方を知っている。（壁を調べる）やっぱりあった。』' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '部屋の中には、盗賊団が長年かけて集めた財宝が残されていた。' },
    ],
    reward: { exp: 55, gold: 600, message: '💀 盗賊アジトの秘密の財宝を発見！（EXP +55, +600G）' },
  },

  {
    id: 'ancient_temple_guardian_test', title: '古代神殿の守護者の試験',
    condition: { atLoc: 'ancient_temple', minPlayerLevel: 7 },
    dialogues: [
      { speaker: 'narrator', speakerName: '守護者の声', text: '「……封印石を求める者よ。我らの試験に合格せねば、先には進めぬ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（覚悟を決めて）受けてみせる。何でも試してくれ。' },
      { speaker: 'narrator', speakerName: '守護者の声', text: '「……勇気がある。それだけで、半分は合格だ。残りは力を見せよ。（戦い）……合格。先に進むがよい。」' },
    ],
    reward: { exp: 80, gold: 350, message: '🏛️ 古代神殿の試験に合格した！（EXP +80, +350G）' },
  },

  // ===== 仲間固有中盤イベント =====
  {
    id: 'gares_patrol_mission', title: 'ガレスの斥候任務',
    condition: { atLoc: 'watchtower', anyCompanion: ['gares'], minDaysLeft: 55 },
    dialogues: [
      { speaker: 'gares', speakerName: 'ガレス', text: '……見張り塔から、少し偵察に行ってくる。付き合うか？' },
      { speaker: 'player', speakerName: 'レオン', text: '俺も行く。一人は危険だ。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '二人で偵察に出た。魔王軍の小部隊を発見し、情報を持ち帰った。' },
      { speaker: 'gares', speakerName: 'ガレス', text: '……お前と組むと、安心して戦える。騎士として、それは最高の信頼だ。' },
    ],
    reward: { exp: 55, gold: 200, message: '🛡️ ガレスと偵察任務を成功させた！（EXP +55, +200G）' },
  },

  {
    id: 'liz_healing_clinic', title: 'リズの無料診療所',
    condition: { atLoc: 'riverside', anyCompanion: ['liz'], minDaysLeft: 55 },
    dialogues: [
      { speaker: 'liz', speakerName: 'リズ', text: '……村に病人が多いわ。少し診てあげても良いですか？ 旅の時間を使いますが。' },
      { speaker: 'player', speakerName: 'レオン', text: 'もちろんだ。大切なことだ。（リズが治療をする様子を見守る）' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'リズが一人一人丁寧に癒していく。村人たちの感謝が溢れた。' },
      { speaker: 'liz', speakerName: 'リズ', text: '（優しく笑って）……これが私の役目。ありがとう、待ってくれて。行きましょう。' },
    ],
    reward: { exp: 50, gold: 180, message: '✨ リズが村の病人を癒した！（EXP +50, +180G）' },
  },

  {
    id: 'noa_arrows_hunt', title: 'ノアの矢の補充',
    condition: { atLoc: 'forest_entrance', anyCompanion: ['noa'], minDaysLeft: 50 },
    dialogues: [
      { speaker: 'noa', speakerName: 'ノア', text: '森でいい材料を見つけた！矢を補充するから、少し待ってて。' },
      { speaker: 'player', speakerName: 'レオン', text: '手伝うか？' },
      { speaker: 'noa', speakerName: 'ノア', text: '大丈夫！でも……一緒にいてくれると嬉しい。（照れながら）矢の作り方を見てみる？ 面白いよ！』' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'ノアが手際よく矢を作るのを見た。その技術は見事だった。' },
    ],
    reward: { exp: 40, itemId: 'potion', itemQty: 2, message: '🏹 ノアが矢を補充！ポーション×2も確保！（EXP +40）' },
  },

  {
    id: 'cecil_magic_research_break', title: 'セシルの研究休憩',
    condition: { atLoc: 'galdo', anyCompanion: ['cecil'], minDaysLeft: 52 },
    dialogues: [
      { speaker: 'cecil', speakerName: 'セシル', text: '魔法塔で少し研究を続けさせてもらえますか？ 封印に関して、もう少しで解明できそうで！' },
      { speaker: 'player', speakerName: 'レオン', text: '俺も少し休めるな。良いよ。（数時間後）』' },
      { speaker: 'cecil', speakerName: 'セシル', text: '（興奮して戻ってくる）わかった！封印石の共鳴原理が！これで戦いが変わる！！' },
    ],
    reward: { exp: 60, gold: 200, message: '🔮 セシルが封印石の秘密を解明した！（EXP +60, +200G）' },
  },

  {
    id: 'bram_arm_wrestling', title: 'ブラムの腕相撲',
    condition: { atLoc: 'bern', anyCompanion: ['bram'], minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: '酒場の客', text: '「ここらで一番強い男と腕相撲で勝負！腕に自信のある奴はいるか！？」' },
      { speaker: 'bram', speakerName: 'ブラム', text: '（ニヤリと）俺がやる。見てろよ。（テーブルへ）』' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'ブラムは十人連続で勝ち続けた。酒場が大盛り上がりになった。' },
      { speaker: 'bram', speakerName: 'ブラム', text: '（景品を持って）戦利品だ！旅の役に立てよ！（大笑い）』' },
    ],
    reward: { exp: 45, gold: 350, message: '🪓 ブラムが腕相撲で圧勝！（EXP +45, +350G）' },
  },

  {
    id: 'finn_street_performance', title: 'フィンの路上演武',
    condition: { atLoc: 'bern', anyCompanion: ['finn'], minDaysLeft: 60 },
    dialogues: [
      { speaker: 'finn', speakerName: 'フィン', text: '（ためらいながら）……ちょっと、剣の演武を見せても良いですか？ 腕試しに。' },
      { speaker: 'player', speakerName: 'レオン', text: 'やってみろ。俺も見ていてやる。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'フィンの剣舞は人々を集め、観客が拍手を送った。投げ銭が集まった。' },
      { speaker: 'finn', speakerName: 'フィン', text: '（照れて）……こんなに受け取るとは思わなかった。旅の資金にします！！』' },
    ],
    reward: { exp: 40, gold: 270, message: '⚔️ フィンの演武が大成功！（EXP +40, +270G）' },
  },

  {
    id: 'vais_lockpicking', title: 'ヴァイスの鍵開け',
    condition: { atLoc: 'checkpoint', anyCompanion: ['vais'], minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: '衛兵', text: '「助かった！重要な書類を入れた金庫の鍵を無くしてしまって……」' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '……（ため息）俺に任せろ。昔取った杵柄だ。（3秒で開ける）』' },
      { speaker: 'narrator', speakerName: '衛兵', text: '「え？ もう開いた！？ 本当にありがとう！！これ、お礼です。」' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '……（複雑な顔）まあ、良い方向に使えたな。』' },
    ],
    reward: { exp: 40, gold: 230, message: '🗡️ ヴァイスのスキルで鍵を開けた！（EXP +40, +230G）' },
  },

  {
    id: 'logan_bouncer', title: 'ローガンの用心棒',
    condition: { atLoc: 'bern', anyCompanion: ['logan'], minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: '商人', text: '「一日、用心棒をしてもらえないか？ 荷物を運ぶ際に護衛が必要で。」' },
      { speaker: 'logan', speakerName: 'ローガン', text: '……（プレイヤーに目で確認）構わんか？ 一時間もあれば終わる。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'ローガンが護衛した商人の荷物は、途中で魔物に狙われたが、全て無事だった。' },
      { speaker: 'narrator', speakerName: '商人', text: '「頼もしかった！本当にありがとう。また頼む！」' },
    ],
    reward: { exp: 45, gold: 280, message: '⚒️ ローガンが護衛任務を完遂！（EXP +45, +280G）' },
  },

  {
    id: 'iris_magic_performance', title: 'イリスの魔法演示',
    condition: { atLoc: 'galdo', anyCompanion: ['iris'], minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: '魔法大学の教授', text: '「元魔王軍の魔導士がいると聞いた……学生たちに、敵側の魔法を見せてもらえないか？」' },
      { speaker: 'iris', speakerName: 'イリス', text: '（少し躊躇って）……いいわ。でも、攻撃魔法だけよ。（演示する）』' },
      { speaker: 'narrator', speakerName: '学生たち', text: '「すごい……！本当に違うんだ……魔王軍の魔法は！」（驚きの声）' },
      { speaker: 'iris', speakerName: 'イリス', text: '（静かに）この力を人を傷つけるためじゃなく……守るために使う。それが私の選択よ。' },
    ],
    reward: { exp: 60, gold: 300, message: '💜 イリスが魔法演示で学生を感動させた！（EXP +60, +300G）' },
  },

  {
    id: 'sig_con_for_good', title: 'シグの義賊',
    condition: { atLoc: 'sahal', anyCompanion: ['sig'], minDaysLeft: 50 },
    dialogues: [
      { speaker: 'sig', speakerName: 'シグ', text: '……実はあの富裕商人、旅人から法外な値で物を売りつけてるんだ。ちょっと「お礼」をしてくる。』' },
      { speaker: 'player', speakerName: 'レオン', text: '（シグ……）』' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'シグは持ち前の話術で商人から詐欺被害の分を取り戻し、被害者に分配した。' },
      { speaker: 'sig', speakerName: 'シグ', text: '（ニヤリと）お前にも少し分けよう。義賊の取り分だ。俺はそういうのが好きなんだよ。』' },
    ],
    reward: { exp: 55, gold: 400, message: '🎩 シグの義賊作戦が成功！（EXP +55, +400G）' },
  },

  {
    id: 'elk_beast_taming', title: 'エルクの野獣なだめ',
    condition: { atLoc: 'forest_entrance', anyCompanion: ['elk'], minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: '村人', text: '「大変だ！森から凶暴な熊が出てきた！誰か助けてくれ！」' },
      { speaker: 'elk', speakerName: 'エルク', text: '任せろ。（熊の前に立ち、低い声で話しかける）』' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '不思議なことに、熊はエルクの声を聞いて落ち着き、森へ戻っていった。' },
      { speaker: 'narrator', speakerName: '村人', text: '「す、すごい……！ありがとうございます！！お礼を！」' },
    ],
    reward: { exp: 50, gold: 280, message: '🐺 エルクが熊を鎮めた！（EXP +50, +280G）' },
  },

  {
    id: 'mira_plant_knowledge', title: 'ミラの薬草知識',
    condition: { atLoc: 'elna', anyCompanion: ['mira'], minDaysLeft: 55 },
    dialogues: [
      { speaker: 'mira', speakerName: 'ミラ', text: 'この森には……回復に使える草が生えている。少し時間を下さい。集めてきます。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'ミラは素早く森を歩き、多くの薬草を集めてきた。手際の良さに驚く。' },
      { speaker: 'mira', speakerName: 'ミラ', text: '（嬉しそうに）これで当分大丈夫。エルフは植物と友達なの。森が教えてくれるから。」' },
    ],
    reward: { exp: 45, itemId: 'potion', itemQty: 4, message: '🌿 ミラが薬草を集めた！ポーション×4！（EXP +45）' },
  },

  {
    id: 'zeno_demon_warning', title: 'ゼノの魔族警告',
    condition: { atLoc: 'desert_ruins', anyCompanion: ['zeno'], minDaysLeft: 25 },
    dialogues: [
      { speaker: 'zeno', speakerName: 'ゼノ', text: '……待て。この遺跡、魔族の罠が仕掛けられている。俺にしか分からない類の。' },
      { speaker: 'player', speakerName: 'レオン', text: 'どこだ？ 回避できるか？' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '俺についてくれば、全部回避できる。こういう時の俺の役目だ。……信じてくれ。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'ゼノの案内で、巧妙に仕掛けられた魔族の罠を全て回避した。' },
    ],
    reward: { exp: 80, message: '😈 ゼノが魔族の罠を全て回避した！（EXP +80）' },
  },

  // ===== 封印石・魔王関連の追加イベント =====
  {
    id: 'seal_fire_power_up', title: '炎の封印石の覚醒',
    condition: { atLoc: 'demon_mine', requiredSeals: ['fire'], minPlayerLevel: 8 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '廃鉱山を再訪すると、炎の封印石が激しく輝きを増した。' },
      { speaker: 'narrator', speakerName: '炎の精霊', text: '「……お前は力を増した。炎の石もそれに応える。本来の力を解放しよう。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（封印石が……反応している！）' },
    ],
    reward: { exp: 90, message: '🔥 炎の封印石が更なる力を解放した！（EXP +90）' },
  },

  {
    id: 'seal_storm_power_up', title: '嵐の封印石の覚醒',
    condition: { atLoc: 'dragon_pass', requiredSeals: ['storm'], minPlayerLevel: 9 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '竜の峠で、嵐の封印石が轟音と共に輝き始めた。' },
      { speaker: 'narrator', speakerName: '嵐の精霊', text: '「……お前の力が高まった。嵐の石も共鳴する。真の力を使いこなせ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（石が……嵐の力を呼び覚ます！）' },
    ],
    reward: { exp: 90, message: '🌩️ 嵐の封印石が更なる力を解放した！（EXP +90）' },
  },

  {
    id: 'seal_dark_power_up', title: '闇の封印石の覚醒',
    condition: { atLoc: 'ancient_temple', requiredSeals: ['dark'], minPlayerLevel: 10 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '古代神殿で、闇の封印石が怪しい光を放ち始めた。だが……恐怖ではなく、力を感じる。' },
      { speaker: 'narrator', speakerName: '闇の精霊', text: '「……お前は十分な力をつけた。闇の石は最も強い。使いこなすには……揺るぎない心が必要だ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（……この力を使いこなす。必ず。）' },
    ],
    reward: { exp: 100, message: '🌑 闇の封印石が最大の力を解放した！（EXP +100）' },
  },

  {
    id: 'demon_lord_premonition', title: '魔王の予兆',
    condition: { atLoc: 'sahal', maxDaysLeft: 30, minDaysLeft: 27 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '砂漠の空が突然黒く染まった。魔王の力が溢れ出している。' },
      { speaker: 'narrator', speakerName: 'ゼノ', text: '「……時間がない。魔王が動いている。今すぐ砂漠遺跡へ向かわないと……！」' },
      { speaker: 'player', speakerName: 'レオン', text: '行くぞ、皆！これが最後の戦いになるかもしれない！！' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'パーティは決意を固め、砂漠遺跡へと急いだ。' },
    ],
    reward: { exp: 70, gold: 300, message: '⚠️ 魔王の予兆を感じた！急いで砂漠遺跡へ！（EXP +70, +300G）' },
  },

  {
    id: 'world_tremor_event', title: '世界の震え',
    condition: { atLoc: 'alseria', maxDaysLeft: 15, minDaysLeft: 12 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '突然、大地が揺れた。魔王が封印を解こうとしている証拠だ。' },
      { speaker: 'narrator', speakerName: '国王', text: '「勇者！世界が終わる前に、急げ！砂漠遺跡へ！」' },
      { speaker: 'player', speakerName: 'レオン', text: 'わかっています。……行ってきます、陛下。絶対に戻ります。' },
    ],
    reward: { exp: 80, gold: 600, fullHeal: true, message: '⚠️ 世界の震えを感じた！国王から激励を受けた！（EXP +80, +600G, 全回復）' },
  },

  {
    id: 'last_night_camp', title: '最後の野営',
    condition: { atLoc: 'desert_ruins', maxDaysLeft: 8, minDaysLeft: 5 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '砂漠遺跡の前で、最後の野営をすることにした。焚き火を囲む仲間たち。' },
      { speaker: 'gares', speakerName: 'ガレス', text: '……お前と旅して良かった。騎士として言う。本当に、良かった。' },
      { speaker: 'liz', speakerName: 'リズ', text: '明日の戦い……神様、どうかみんなを守ってください。（静かに祈る）' },
      { speaker: 'player', speakerName: 'レオン', text: 'みんな……ありがとう。一緒に来てくれて。絶対に、全員で帰ろう。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '焚き火が静かに燃える。決戦の夜。' },
    ],
    reward: { exp: 100, fullHeal: true, message: '🔥 最後の野営。パーティ全回復！（EXP +100）' },
  },

  // ===== 追加バラエティイベント（300件達成） =====
  {
    id: 'alseria_arena', title: '王都の闘技場',
    condition: { atLoc: 'alseria', minPlayerLevel: 5, minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: '闘技場主', text: '「おい勇者！うちの闘技場で腕試しをしていかないか？賞金もあるぞ！」' },
      { speaker: 'player', speakerName: 'レオン', text: '……少しなら。旅の訓練にもなる。（戦う）' },
      { speaker: 'narrator', speakerName: '観客', text: '「やった！勇者が勝った！すごい！」（歓声）' },
      { speaker: 'narrator', speakerName: '闘技場主', text: '「見事だ！賞金を渡そう。また来てくれよ！」' },
    ],
    reward: { exp: 55, gold: 400, message: '🏟️ 闘技場で優勝！（EXP +55, +400G）' },
  },

  {
    id: 'bern_food_contest', title: 'ベルンの料理コンテスト',
    condition: { atLoc: 'bern', minDaysLeft: 58 },
    dialogues: [
      { speaker: 'narrator', speakerName: '司会者', text: '「ちょうど良かった！料理コンテストの審査員が足りなくて……一品食べてもらえませんか？」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'プレイヤーは審査員として、各シェフの料理を食べ比べた。どれも美味しい。' },
      { speaker: 'player', speakerName: 'レオン', text: '（これは……全部最高だ。決められない……！）' },
      { speaker: 'narrator', speakerName: '司会者', text: '「お礼に優勝者の特製料理を持ち帰り用にどうぞ！」' },
    ],
    reward: { exp: 35, fullHeal: true, message: '🍲 料理コンテストの審査員を務めた！全回復！（EXP +35）' },
  },

  {
    id: 'sahal_mirage', title: 'サハルの蜃気楼',
    condition: { atLoc: 'sahal', minDaysLeft: 48 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '砂漠に蜃気楼が現れた。遠くに立派な都市が見える。' },
      { speaker: 'narrator', speakerName: 'セシル', text: '「あれは……封印の時代の都市の残像かも？ 蜃気楼に過去が映ることがあると伝説に……」' },
      { speaker: 'player', speakerName: 'レオン', text: '（見ると……人々が平和に暮らしている風景。あの頃に戻すために戦うんだ。）' },
    ],
    reward: { exp: 50, message: '🌅 蜃気楼に過去の平和な世界を見た！（EXP +50）' },
  },

  {
    id: 'mirea_pearl_diver', title: 'ミレアの真珠採り',
    condition: { atLoc: 'mirea', minDaysLeft: 52 },
    dialogues: [
      { speaker: 'narrator', speakerName: '真珠採り', text: '「勇者よ！海が危険で潜れないが……この珍しい真珠を渡す。お守りになるはずだ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（澄んだ光を放つ真珠……確かに不思議な力を感じる。）ありがとう。大切にします。' },
      { speaker: 'narrator', speakerName: '真珠採り', text: '「海が安全になったら、また潜れる。それも、あなたのおかげだから。」' },
    ],
    reward: { exp: 40, gold: 200, message: '🦪 真珠採りから真珠のお守りをもらった！（EXP +40, +200G）' },
  },

  {
    id: 'elna_tree_planting', title: 'エルナの植樹祭',
    condition: { atLoc: 'elna', minDaysLeft: 62 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'エルフの長老', text: '「丁度良い！今日は植樹祭だ。一本植えていかないか？ 百年後もここに残るぞ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（苗を受け取り、地面に植える）……百年後、誰かがこれを見るのか。' },
      { speaker: 'narrator', speakerName: 'エルフの長老', text: '「そうだ。あなたが植えた木は、勇者の木として語り継がれよう。祝福を込めて。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '苗を植えると、不思議な温もりが体を包んだ。' },
    ],
    reward: { exp: 45, gold: 150, message: '🌱 エルナに勇者の木を植えた！（EXP +45, +150G）' },
  },

  {
    id: 'galdo_telescope', title: 'ガルドの天体望遠鏡',
    condition: { atLoc: 'galdo', minDaysLeft: 62 },
    dialogues: [
      { speaker: 'narrator', speakerName: '天文学者', text: '「夜に来るなら、特別なものを見せてあげよう。私の望遠鏡だ。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '望遠鏡を覗くと、星が近くに見えた。封印石と同じ色の星が三つある。' },
      { speaker: 'narrator', speakerName: '天文学者', text: '「あの三星は「封印の三光星」。魔王が倒される時に揃って輝くと言われている。今夜は特に明るい……。」' },
    ],
    reward: { exp: 45, message: '🔭 封印の三光星を観測した！（EXP +45）' },
  },

  {
    id: 'traveler_inn_storytelling', title: '宿の物語の夜',
    condition: { atLoc: 'traveler_inn', minDaysLeft: 65 },
    dialogues: [
      { speaker: 'narrator', speakerName: '旅の老人', text: '「夜が長い。昔話をしてやろう。百年前、勇者が同じ旅をした話だ。」' },
      { speaker: 'narrator', speakerName: '旅の老人', text: '「その勇者は……力がなく、仲間も少なかった。でも諦めなかった。そして最後に魔王を封印した。」' },
      { speaker: 'narrator', speakerName: '旅の老人', text: '「君も、きっとそうなれる。力より、諦めない心だ。」' },
    ],
    reward: { exp: 40, message: '📖 先代勇者の物語を聞いた！（EXP +40）' },
  },

  {
    id: 'checkpoint_letter_delivery', title: '関所の手紙配達',
    condition: { atLoc: 'checkpoint', minDaysLeft: 60 },
    dialogues: [
      { speaker: 'narrator', speakerName: '兵士', text: '「旅をするなら、この手紙を次の町で届けてもらえないか？家族への手紙だ。戦場にいて届けられなくて。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'わかりました。ベルンを通るので、届けます。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '後にベルンで家族に手紙を届けた。家族は喜び、お礼をくれた。' },
    ],
    reward: { exp: 30, gold: 170, message: '✉️ 兵士の家族への手紙を届けた！（EXP +30, +170G）' },
  },

  {
    id: 'great_bridge_artist', title: '大橋の画家',
    condition: { atLoc: 'great_bridge', minDaysLeft: 60 },
    dialogues: [
      { speaker: 'narrator', speakerName: '画家', text: '「橋を渡る旅人を描いているんです！あなたの肖像画を描かせてください！名前を残したくて。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（少し照れながら）いいですよ。でも早めにお願いします。急ぎの旅なので。' },
      { speaker: 'narrator', speakerName: '画家', text: '「描けた！これは永遠に残る絵になります。お礼に、絵筆で作った幸運のお守りをどうぞ。」' },
    ],
    reward: { exp: 30, gold: 130, message: '🎨 画家に肖像画を描いてもらった！（EXP +30, +130G）' },
  },

  {
    id: 'riverside_fortune_teller', title: '川辺の占い師',
    condition: { atLoc: 'riverside', minDaysLeft: 62 },
    dialogues: [
      { speaker: 'narrator', speakerName: '占い師', text: '「占いをしてやろうか？ 旅の行く先を水晶に映してやる。」' },
      { speaker: 'narrator', speakerName: '占い師', text: '（水晶を覗いて）「……光と闇が混じり合い、最後に光が勝る。それがお前の未来だ。信じるかは、お前次第。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（……光が勝る。信じよう。）ありがとう。' },
    ],
    reward: { exp: 35, gold: 100, message: '🔮 占い師から未来の言葉をもらった！（EXP +35, +100G）' },
  },

  {
    id: 'watchtower_night_sky', title: '見張り塔からの夜空',
    condition: { atLoc: 'watchtower', minDaysLeft: 62 },
    dialogues: [
      { speaker: 'narrator', speakerName: '兵士', text: '「たまには塔の上に登ってみなよ。夜景が最高だぞ。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '塔の上に登ると、広大な星空と遠くまで広がる大地が見えた。' },
      { speaker: 'player', speakerName: 'レオン', text: '（……こんなに広い世界を守るために戦っているのか。改めて実感する。）' },
      { speaker: 'narrator', speakerName: '兵士', text: '「この景色、守りたいだろう？ だから俺たちは戦う。」' },
    ],
    reward: { exp: 35, message: '🌃 見張り塔から夜景を見て決意を固めた！（EXP +35）' },
  },

  {
    id: 'spirit_spring_children', title: '精霊の泉の子供たち',
    condition: { atLoc: 'spirit_spring', minDaysLeft: 62 },
    dialogues: [
      { speaker: 'narrator', speakerName: '子供', text: '「勇者さん！精霊の泉で一緒に遊んでいかない？精霊が出てくるかもよ！』' },
      { speaker: 'player', speakerName: 'レオン', text: '（少しだけ……）いいよ。どんな遊びをするんだ？' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '子供たちと泉で遊んでいると、本当に小さな精霊の光が舞った。子供たちは大喜びした。' },
      { speaker: 'narrator', speakerName: '子供', text: '「やったあ！見えた！精霊だ！勇者さんのおかげだ！！」' },
    ],
    reward: { exp: 30, fullHeal: true, message: '✨ 子供たちと精霊の泉で遊んだ！全回復！（EXP +30）' },
  },

  {
    id: 'trading_post_musician', title: '交易所の旅芸人',
    condition: { atLoc: 'trading_post', minDaysLeft: 62 },
    dialogues: [
      { speaker: 'narrator', speakerName: '旅芸人', text: '「旅人よ、一曲聴いていかないか？遠い国の歌だ。力が湧くと評判でな。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '旅芸人の歌声は力強く、心の奥まで響いた。仲間たちも思わず立ち止まって聞き入った。' },
      { speaker: 'player', speakerName: 'レオン', text: '（……こんな歌を守るために戦うんだ。）素晴らしい歌だ。ありがとう。' },
      { speaker: 'narrator', speakerName: '旅芸人', text: '「魔王を倒したら、祝いの歌を贈るよ。楽しみにしていてくれ！」' },
    ],
    reward: { exp: 35, gold: 120, message: '🎵 旅芸人の歌で力をもらった！（EXP +35, +120G）' },
  },

  {
    id: 'coastal_road_message_bottle2', title: '海岸街道の第二のボトル',
    condition: { atLoc: 'coastal_road', minDaysLeft: 60 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'また海岸にボトルが流れ着いていた。拾ってみると……' },
      { speaker: 'narrator', speakerName: '手紙の内容', text: '「最初にボトルを送った者です。あなたが返事を書いてくれて嬉しかった。私は海の向こうで、あなたの戦いを信じています。必ず勝てる。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（……この人も。世界中で待っている人がいる。）行こう。みんなのために。' },
    ],
    reward: { exp: 40, message: '🌊 海の向こうからの励ましが届いた！（EXP +40）' },
  },

  {
    id: 'forest_entrance_mushroom', title: '森入口の不思議なキノコ',
    condition: { atLoc: 'forest_entrance', minDaysLeft: 63 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '森の入口に、巨大で輝くキノコがあった。触れると不思議な光を放つ。' },
      { speaker: 'narrator', speakerName: 'セシル', text: '「これは……精霊が宿ったキノコ！ 非常に珍しい！ 食べても大丈夫なはずだけど……」' },
      { speaker: 'player', speakerName: 'レオン', text: '（試してみると）おお……体が軽くなった！力がみなぎる！！' },
    ],
    reward: { exp: 50, fullHeal: true, message: '🍄 精霊キノコでパーティ全回復！（EXP +50）' },
  },

  {
    id: 'demon_mine_crystal_cave', title: '廃鉱山の水晶洞窟',
    condition: { atLoc: 'demon_mine', minDaysLeft: 58 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '鉱山の奥に、水晶が壁一面に生えた洞窟があった。' },
      { speaker: 'narrator', speakerName: 'イリス', text: '「……この水晶は封印の残滓を吸収している。精製すれば、強力な魔法石になる。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'イリスが水晶を精製した。魔法石が光り輝く。' },
    ],
    reward: { exp: 60, itemId: 'ether', itemQty: 3, message: '💎 廃鉱山の水晶を精製！エーテル×3！（EXP +60）' },
  },

  {
    id: 'dragon_pass_ancient_sword', title: '竜の峠の古剣',
    condition: { atLoc: 'dragon_pass', minDaysLeft: 58 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '峠の岩壁に、古い剣が突き刺さっていた。封印の時代のものだろうか。' },
      { speaker: 'narrator', speakerName: 'ガレス', text: '「……この剣は。伝説の「嵐断ち」の剣では……！？ 百年前の勇者が使ったという……」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '剣を岩から抜くと、不思議な光が溢れた。その力が……プレイヤーに宿る。' },
    ],
    reward: { exp: 80, gold: 400, message: '⚔️ 伝説の剣の力を受け継いだ！（EXP +80, +400G）' },
  },

  {
    id: 'bandit_hideout_treasure_map', title: '盗賊アジトの宝の地図',
    condition: { atLoc: 'bandit_hideout', minDaysLeft: 55 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'アジトの壁に隠されていた地図を見つけた。「大橋の東の岩陰に財宝あり」と書いてある。' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: 'ヴァイス：……これは本物だ。盗賊王直筆の地図。信用できる。行ってみるか？」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '（後に大橋で確認すると、小さな宝箱が見つかった。）' },
    ],
    reward: { exp: 55, gold: 700, message: '🗺️ 宝の地図を発見し財宝を掘り当てた！（EXP +55, +700G）' },
  },

  {
    id: 'ancient_temple_song_stone', title: '古代神殿の音石',
    condition: { atLoc: 'ancient_temple', minDaysLeft: 45 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '神殿の一角に、触れると音楽を奏でる不思議な石があった。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'その音楽は……封印の儀式で使われた古い祝福の歌だ。リズが思わず共に歌い始めた。' },
      { speaker: 'liz', speakerName: 'リズ', text: '（歌いながら）……パーティに神様の加護が宿りました。行きましょう。' },
    ],
    reward: { exp: 65, fullHeal: true, message: '🎵 音石の加護でパーティ全回復！（EXP +65）' },
  },

  {
    id: 'desert_ruins_pre_battle', title: '砂漠遺跡の前夜祭',
    condition: { atLoc: 'desert_ruins', minDaysLeft: 10 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '砂漠遺跡の外で、近隣の村人たちが集まっていた。' },
      { speaker: 'narrator', speakerName: '村人代表', text: '「勇者よ！私たちも一緒に応援したい！これが全員分の祈りだ！！」' },
      { speaker: 'player', speakerName: 'レオン', text: '（……みんなの想いが。）ありがとう。必ず、魔王を倒す！！' },
      { speaker: 'narrator', speakerName: '村人たち', text: '「頑張れ！！！」（全員で声援）' },
    ],
    reward: { exp: 90, gold: 800, fullHeal: true, message: '🌟 村人たちの想いを受け取った！（EXP +90, +800G, 全回復）' },
  },

  {
    id: 'gares_finn_mentor', title: 'ガレスとフィンの師弟',
    condition: { atLoc: 'checkpoint', anyCompanion: ['gares', 'finn'] },
    dialogues: [
      { speaker: 'finn', speakerName: 'フィン', text: 'ガレスさん！俺の剣術、見てもらえますか？どこが足りないか。' },
      { speaker: 'gares', speakerName: 'ガレス', text: '（観察して）……腰が浮いている。もっと大地を踏みしめろ。力は地から来る。』' },
      { speaker: 'finn', speakerName: 'フィン', text: '（直してみると）……あ！違う！ずっと違和感があったのが解決した！！』' },
      { speaker: 'gares', speakerName: 'ガレス', text: '（わずかに微笑む）……素直に学べる奴は伸びる。将来が楽しみだ、フィン。' },
    ],
    reward: { exp: 55, gold: 150, message: '🛡️⚔️ ガレスとフィンの師弟関係が深まった！（EXP +55, +150G）' },
  },

  {
    id: 'liz_noa_hope', title: 'リズとノアの希望',
    condition: { atLoc: 'riverside', anyCompanion: ['liz', 'noa'] },
    dialogues: [
      { speaker: 'liz', speakerName: 'リズ', text: 'ノア……怖い時は、ありますか？ 私はあるの。正直に言うと。' },
      { speaker: 'noa', speakerName: 'ノア', text: '（驚いて）リズも？ ……私もある。でも恐怖を認めたら、次に何をすべきか見えてくる気がする。' },
      { speaker: 'liz', speakerName: 'リズ', text: '……そうね。怖いから、もっと強く祈る。あなたたちが無事でいられるように。' },
      { speaker: 'noa', speakerName: 'ノア', text: '（ふわっと微笑む）……私は、みんなを守るために矢を射る。怖くても、前へ。' },
    ],
    reward: { exp: 50, message: '✨🏹 リズとノアが弱さを認め合い絆を深めた！（EXP +50）' },
  },

  {
    id: 'bram_zeno_clash', title: 'ブラムとゼノの衝突',
    condition: { atLoc: 'great_bridge', anyCompanion: ['bram', 'zeno'] },
    dialogues: [
      { speaker: 'bram', speakerName: 'ブラム', text: '……ゼノ、正直に聞く。お前は魔族だ。最後の最後に魔王の側に戻るんじゃないか？』' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '（鋭く）……それを言うか。ブラム、お前は正直な男だな。（少しの沈黙）……俺は戻らない。誓う。' },
      { speaker: 'bram', speakerName: 'ブラム', text: '……なぜ信じられる？' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '信じるかどうかは、お前の自由だ。でも俺は行動で示す。それだけだ。' },
      { speaker: 'bram', speakerName: 'ブラム', text: '（しばらくして）……わかった。俺は見ている。お前の行動を。』' },
    ],
    reward: { exp: 55, gold: 130, message: '🪓😈 ブラムとゼノが率直な対話をした！（EXP +55, +130G）' },
  },

  {
    id: 'sig_mira_flowers', title: 'シグとミラの花',
    condition: { atLoc: 'elna', anyCompanion: ['sig', 'mira'] },
    dialogues: [
      { speaker: 'sig', speakerName: 'シグ', text: '（エルナの花をこっそり摘んで）ミラ……これ。似合うと思って。」' },
      { speaker: 'mira', speakerName: 'ミラ', text: '（驚いて）え……シグが、こんなことを？ ありがとう。（少し照れる）でも……この花、エルナでは神聖な花よ？』' },
      { speaker: 'sig', speakerName: 'シグ', text: '（焦る）え！？ まずかった……？」' },
      { speaker: 'mira', speakerName: 'ミラ', text: '（笑って）大丈夫。でも返してね。（花を受け取る）……ありがとう、シグ。珍しいところがある人ね。』' },
    ],
    reward: { exp: 45, message: '🌺🎩 シグとミラの微笑ましい一幕！（EXP +45）' },
  },

  {
    id: 'gares_logan_veterans', title: 'ガレスとローガンの戦場談義',
    condition: { atLoc: 'watchtower', anyCompanion: ['gares', 'logan'] },
    dialogues: [
      { speaker: 'gares', speakerName: 'ガレス', text: '……ローガン。お前は多くの戦場を経験したか？' },
      { speaker: 'logan', speakerName: 'ローガン', text: 'ああ。処刑人として各地を回った。戦場ではないが……死を身近に見てきた。』' },
      { speaker: 'gares', speakerName: 'ガレス', text: '俺も同じだ。騎士として多くの仲間を失った。……生き残った者の責任は、重い。' },
      { speaker: 'logan', speakerName: 'ローガン', text: '……そうだな。だから俺たちは、ここで戦っている。失った命に報いるために。' },
    ],
    reward: { exp: 50, gold: 140, message: '🛡️⚒️ ガレスとローガンが戦場の経験を語り合った！（EXP +50, +140G）' },
  },

  {
    id: 'noa_elk_nature_hunt', title: 'ノアとエルクの自然体験',
    condition: { atLoc: 'forest_entrance', anyCompanion: ['noa', 'elk'] },
    dialogues: [
      { speaker: 'noa', speakerName: 'ノア', text: '（囁くように）エルク、あの鹿……見て。すごく大きい。』' },
      { speaker: 'elk', speakerName: 'エルク', text: '……（低く）動くな。鹿は敏感だ。（静かにじっとする）』' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '二人は長い間、静かに鹿を観察した。やがて鹿は気配を感じて去った。' },
      { speaker: 'noa', speakerName: 'ノア', text: '（しみじみ）……きれいだったね。戦いの前にこういう時間があって、よかった。』' },
    ],
    reward: { exp: 40, message: '🦌🏹 ノアとエルクが自然の美しさを共に見た！（EXP +40）' },
  },

  {
    id: 'finn_iris_magic_lesson', title: 'フィンとイリスの魔法レッスン',
    condition: { atLoc: 'galdo', anyCompanion: ['finn', 'iris'] },
    dialogues: [
      { speaker: 'finn', speakerName: 'フィン', text: 'イリスさん、魔法を少し教えてもらえますか？ 剣だけじゃなく、もっと幅を広げたくて！' },
      { speaker: 'iris', speakerName: 'イリス', text: '（意外そうに）……剣士が魔法？ 珍しいわね。でも……基礎なら教えられる。』' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'イリスが丁寧に基礎魔法を教えた。フィンは覚えが早く、すぐに小さな光を出せるようになった。' },
      { speaker: 'finn', speakerName: 'フィン', text: '光った！！俺が魔法を使った！！感謝します、イリスさん！！』' },
    ],
    reward: { exp: 55, gold: 150, message: '⚔️💜 フィンとイリスの師弟レッスン！（EXP +55, +150G）' },
  },

  {
    id: 'cecil_bram_unlikely_pair', title: 'セシルとブラムの奇妙なコンビ',
    condition: { atLoc: 'elna', anyCompanion: ['cecil', 'bram'] },
    dialogues: [
      { speaker: 'cecil', speakerName: 'セシル', text: 'ブラム！封印魔法の実験台になってくれない？攻撃魔法を一人に集中して……！' },
      { speaker: 'bram', speakerName: 'ブラム', text: '……（複雑な顔で）まあ、研究のためなら。でも手加減しろよ。』' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '実験は予想以上の結果を出した。セシルが大興奮し、ブラムはため息をついた。' },
      { speaker: 'cecil', speakerName: 'セシル', text: '素晴らしい！！ブラムの頑丈さは研究材料として最高！！次は……」' },
      { speaker: 'bram', speakerName: 'ブラム', text: '「次はない。（きっぱり）』' },
    ],
    reward: { exp: 50, gold: 160, message: '🔮🪓 セシルとブラムの珍実験が成功！（EXP +50, +160G）' },
  },

  {
    id: 'vais_zeno_dark_past', title: 'ヴァイスとゼノの過去',
    condition: { atLoc: 'bandit_hideout', anyCompanion: ['vais', 'zeno'] },
    dialogues: [
      { speaker: 'zeno', speakerName: 'ゼノ', text: '……ヴァイス、お前も闇の中を生きてきたな。俺と似ている。』' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '……（しばらく黙って）そうかもしれない。でも俺は人間で、お前は魔族だ。違いはある。』' },
      { speaker: 'zeno', speakerName: 'ゼノ', text: '「違いより、同じところが多い。どちらも「前」を選んだ。それだけで十分だと、俺は思う。』' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '……（静かに頷く）……そうだな。』' },
    ],
    reward: { exp: 55, gold: 170, message: '🗡️😈 ヴァイスとゼノが魂の共鳴をした！（EXP +55, +170G）' },
  },

  {
    id: 'mira_logan_silent_bond', title: 'ミラとローガンの無言の絆',
    condition: { atLoc: 'coastal_road', anyCompanion: ['mira', 'logan'] },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '海沿いを歩くミラとローガン。しばらく二人は無言で並んで歩いていた。' },
      { speaker: 'mira', speakerName: 'ミラ', text: '……（ふいに）ローガン、怖い？' },
      { speaker: 'logan', speakerName: 'ローガン', text: '……ああ。でも、お前たちと一緒だから、まだ動ける。』' },
      { speaker: 'mira', speakerName: 'ミラ', text: '（優しく）私も同じよ。（また二人で黙って歩く）' },
    ],
    reward: { exp: 45, message: '🌿⚒️ ミラとローガンの無言の絆が深まった！（EXP +45）' },
  },

  {
    id: 'sig_elk_treasure_finding', title: 'シグとエルクの秘境探索',
    condition: { atLoc: 'forest_entrance', anyCompanion: ['sig', 'elk'] },
    dialogues: [
      { speaker: 'sig', speakerName: 'シグ', text: 'エルク！俺の直感に従ってくれ。この森のどこかに「財宝」が隠れてる気がする！』' },
      { speaker: 'elk', speakerName: 'エルク', text: '……俺の嗅覚でも、金属の匂いがある。（うなずく）案内する。』' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'エルクの嗅覚とシグの直感が合わさり、森の奥に古い宝箱を発見した！' },
      { speaker: 'sig', speakerName: 'シグ', text: '（大喜びで）これが本物の宝探し！！エルク、最高のコンビじゃないか！！』' },
    ],
    reward: { exp: 60, gold: 500, message: '🎩🐺 シグとエルクが森の宝を発見！（EXP +60, +500G）' },
  },

  {
    id: 'gares_bram_drink', title: 'ガレスとブラムの一杯',
    condition: { atLoc: 'bern', anyCompanion: ['gares', 'bram'] },
    dialogues: [
      { speaker: 'bram', speakerName: 'ブラム', text: '（居酒屋で）ガレス、一杯どうだ！旅の疲れを癒そうぜ！』' },
      { speaker: 'gares', speakerName: 'ガレス', text: '……任務中だが。（しぶしぶ座る）一杯だけだ。』' },
      { speaker: 'bram', speakerName: 'ブラム', text: '（大きな声で）乾杯！！（グラスを打ち合わせる）魔王を倒したら、また飲もうぜ！』' },
      { speaker: 'gares', speakerName: 'ガレス', text: '（珍しく柔らかい表情で）……ああ。必ず。乾杯だ、ブラム。』' },
    ],
    reward: { exp: 45, gold: 120, message: '🛡️🪓 ガレスとブラムが乾杯した！（EXP +45, +120G）' },
  },

  {
    id: 'liz_mira_healing_nature', title: 'リズとミラの大地の癒し',
    condition: { atLoc: 'elna', anyCompanion: ['liz', 'mira'] },
    dialogues: [
      { speaker: 'mira', speakerName: 'ミラ', text: 'リズ、一緒に試したいことがある。神聖魔法と自然魔法を同時に使ったら……』' },
      { speaker: 'liz', speakerName: 'リズ', text: 'やってみましょう！（二人で同時に魔法を発動）』' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '光と緑の力が混じり合い、エルナ全体が淡い光に包まれた。里の人々が感嘆した。' },
      { speaker: 'narrator', speakerName: 'エルフの長老', text: '「……これが神と自然の共鳴か。素晴らしい……。」' },
    ],
    reward: { exp: 65, fullHeal: true, message: '✨🌿 リズとミラの合同魔法が奇跡を起こした！全回復！（EXP +65）' },
  },

  // ===== 最終補完バッチ（300件達成）=====
  {
    id: 'alseria_final_feast', title: '王都の最後の宴',
    condition: { atLoc: 'alseria', maxDaysLeft: 12, minDaysLeft: 9 },
    dialogues: [
      { speaker: 'narrator', speakerName: '国王', text: '「……出発前に、最後の宴を設けた。短い時間だが……仲間と共に食べてくれ。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '王城の大広間に、豪華な料理が並んだ。仲間たちが静かに、しかし力強く食事した。' },
      { speaker: 'player', speakerName: 'レオン', text: '（……この食事の味を、忘れないようにしよう。生きて帰るための理由に。）' },
    ],
    reward: { exp: 80, fullHeal: true, message: '🏰 王都最後の宴！パーティ全回復！（EXP +80）' },
  },

  {
    id: 'bern_last_shopping', title: 'ベルンでの最後の買い物',
    condition: { atLoc: 'bern', maxDaysLeft: 18, minDaysLeft: 15 },
    dialogues: [
      { speaker: 'narrator', speakerName: '商人', text: '「勇者！最後の出撃前か。うちの全在庫、特別価格で出すよ！！」' },
      { speaker: 'narrator', speakerName: '商人', text: '「商売なんかより、世界が救われる方が大切だ。全力で準備してくれ！！」' },
      { speaker: 'player', speakerName: 'レオン', text: 'ありがとう。……必ず戻ってくる。報告しに。' },
    ],
    reward: { exp: 50, gold: 500, message: '🏪 最後の出撃前、商人から特別な支援！（EXP +50, +500G）' },
  },

  {
    id: 'sahal_last_prayer', title: 'サハルの最後の祈り',
    condition: { atLoc: 'sahal', maxDaysLeft: 20, minDaysLeft: 17 },
    dialogues: [
      { speaker: 'narrator', speakerName: '砂漠の神官', text: '「勇者よ。砂漠の神に、最後の祈りを捧げさせてもらえないか。あなたたちのために。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '神官の祈りが砂漠に響いた。砂が舞い、星が一瞬瞬いた。' },
      { speaker: 'narrator', speakerName: '砂漠の神官', text: '「……砂漠の神が応えた。必ず、あなたたちを見守るだろう。」' },
    ],
    reward: { exp: 60, fullHeal: true, message: '🏜️ 砂漠の神の祝福！パーティ全回復！（EXP +60）' },
  },

  {
    id: 'mirea_last_voyage', title: 'ミレアの最後の出航',
    condition: { atLoc: 'mirea', maxDaysLeft: 20, minDaysLeft: 16 },
    dialogues: [
      { speaker: 'narrator', speakerName: '老漁師', text: '「……港の皆が、お前さんを見送りに来た。最後の出航前にな。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '港には大勢の人が集まっていた。皆が手を振る。' },
      { speaker: 'player', speakerName: 'レオン', text: '（……この人たちのために。絶対に帰ってくる。）行ってきます！！' },
    ],
    reward: { exp: 65, gold: 450, message: '⚓ ミレアの港の人々に見送られた！（EXP +65, +450G）' },
  },

  {
    id: 'elna_last_forest_song', title: 'エルナの最後の森の歌',
    condition: { atLoc: 'elna', maxDaysLeft: 20, minDaysLeft: 16 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '夜のエルナで、エルフたちが送別の歌を歌い始めた。' },
      { speaker: 'narrator', speakerName: 'エルフの長老', text: '「……これは、英雄の旅立ちに贈る古い歌だ。覚えておいてくれ。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '歌声が森に響き渡る。ミラが静かに涙をこらえた。' },
    ],
    reward: { exp: 60, fullHeal: true, message: '🌿 エルフの送別歌でパーティ全回復！（EXP +60）' },
  },

  {
    id: 'galdo_final_enchant', title: 'ガルドの最後の魔法強化',
    condition: { atLoc: 'galdo', maxDaysLeft: 20, minDaysLeft: 16 },
    dialogues: [
      { speaker: 'narrator', speakerName: '大魔法使い', text: '「……勇者よ。決戦前に来てくれたか。ガルド魔法塔の全魔力で、お前たちを強化しよう。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '魔法塔の光が集まり、パーティ全員の体を包んだ。力が増した感覚がある。' },
      { speaker: 'narrator', speakerName: '大魔法使い', text: '「これが我らにできる最大の支援だ。勝ち抜くのは、お前たち自身だ。頑張れ……！」' },
    ],
    reward: { exp: 90, gold: 400, fullHeal: true, message: '⚡ ガルド魔法塔の全力強化！（EXP +90, +400G, 全回復）' },
  },

  {
    id: 'traveler_inn_last_night', title: '宿の最後の夜',
    condition: { atLoc: 'traveler_inn', maxDaysLeft: 18, minDaysLeft: 14 },
    dialogues: [
      { speaker: 'narrator', speakerName: '宿の主人', text: '「……最後の夜か。今夜は無料で泊めよう。たっぷり休んでいけ。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '久しぶりに柔らかいベッドで眠った。体の疲れが抜けていく。' },
      { speaker: 'narrator', speakerName: '宿の主人', text: '「（朝に）……よく眠れたか。腹ごしらえをして、行ってこい。待ってるぞ。」' },
    ],
    reward: { exp: 55, fullHeal: true, message: '🏠 宿の最後の夜。パーティ全回復！（EXP +55）' },
  },

  {
    id: 'checkpoint_last_pass', title: '関所の最後の通過',
    condition: { atLoc: 'checkpoint', maxDaysLeft: 15, minDaysLeft: 11 },
    dialogues: [
      { speaker: 'narrator', speakerName: '関所長', text: '「……もう行くのか。この関所を、これが最後に通ることになるかもしれないな。」' },
      { speaker: 'player', speakerName: 'レオン', text: '帰りも通ります。必ず。' },
      { speaker: 'narrator', speakerName: '関所長', text: '「（目頭を押さえて）……そうだな。帰りを待つ。全員で、な。行ってこい！！」' },
    ],
    reward: { exp: 55, gold: 300, message: '🗺️ 関所の仲間たちに見送られた！（EXP +55, +300G）' },
  },

  {
    id: 'great_bridge_last_crossing', title: '大橋の最後の渡り',
    condition: { atLoc: 'great_bridge', maxDaysLeft: 12, minDaysLeft: 9 },
    dialogues: [
      { speaker: 'narrator', speakerName: '橋番', text: '「……これが最後の橋渡しになるかもしれない。ゆっくり行くか、急ぐか。自分で決めろ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '……急ぐ。でも、橋を振り返って見ていくよ。何度も渡った橋だから。' },
      { speaker: 'narrator', speakerName: '橋番', text: '「（静かに送り出す）……帰ってこい。この橋で待ってる。」' },
    ],
    reward: { exp: 55, gold: 200, message: '🌉 大橋を最後に渡り決戦へ！（EXP +55, +200G）' },
  },

  {
    id: 'riverside_final_reflection', title: '川辺の最終回顧',
    condition: { atLoc: 'riverside', maxDaysLeft: 22, minDaysLeft: 19 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '最後に川辺で立ち止まった。水の音が優しく響く。' },
      { speaker: 'finn', speakerName: 'フィン', text: '……最初にここで夢を語ったのを、覚えていますか？ あの頃の俺には、今の俺が信じられない。' },
      { speaker: 'player', speakerName: 'レオン', text: '俺も同じだ。でも……今は信じられる。俺たちなら出来る、って。' },
      { speaker: 'finn', speakerName: 'フィン', text: '（力強く頷いて）はい！！行きましょう！！' },
    ],
    reward: { exp: 70, gold: 300, message: '💧 川辺で最後の決意を固めた！（EXP +70, +300G）' },
  },

  {
    id: 'spirit_spring_final_blessing', title: '精霊の泉の最後の祝福',
    condition: { atLoc: 'spirit_spring', maxDaysLeft: 20, minDaysLeft: 16 },
    dialogues: [
      { speaker: 'narrator', speakerName: '大精霊', text: '「……人間の子よ。最後の戦いに向かうのだな。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'はい。三石が揃いました。魔王を封印しに行きます。' },
      { speaker: 'narrator', speakerName: '大精霊', text: '「我らの全力の加護を送ろう。精霊の泉の力、全て貸してやる。……勝てる。お前ならば。」' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '泉全体が輝き、その光がパーティを包んだ。こんなにも力強い感覚は初めてだった。' },
    ],
    reward: { exp: 100, fullHeal: true, message: '💧 大精霊の最終祝福！（EXP +100, 全回復）' },
  },

  {
    id: 'trading_post_last_deal', title: '交易所の最後の取引',
    condition: { atLoc: 'trading_post', maxDaysLeft: 22, minDaysLeft: 18 },
    dialogues: [
      { speaker: 'narrator', speakerName: '交易所の主人', text: '「決戦前の準備か。これを持っていけ。在庫の全部だ。」' },
      { speaker: 'player', speakerName: 'レオン', text: 'そんな……全部は受け取れない。' },
      { speaker: 'narrator', speakerName: '交易所の主人', text: '「いいんだ！世界が救われなかったら商売も出来ない。これは「投資」だ。必ずリターンをくれ！」' },
      { speaker: 'player', speakerName: 'レオン', text: '（笑って）……わかった。必ず勝ってくる！！' },
    ],
    reward: { exp: 70, itemId: 'hi_potion', itemQty: 3, message: '🏪 交易所からハイポーション×3！最後の支援！（EXP +70）' },
  },

  {
    id: 'lighthouse_beacon_final', title: '灯台の最後の光',
    condition: { atLoc: 'lighthouse', maxDaysLeft: 22, minDaysLeft: 18 },
    dialogues: [
      { speaker: 'narrator', speakerName: '灯台守', text: '「今夜、灯台の光を最大にする。砂漠遺跡まで届くように。お前たちが帰る道標にしよう。」' },
      { speaker: 'player', speakerName: 'レオン', text: '……ありがとう。その光を目指して、必ず帰ってくる。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '灯台の光が海を照らした。遠くからでも見える、希望の光。' },
    ],
    reward: { exp: 60, fullHeal: true, message: '🏮 灯台の光が希望になった！パーティ全回復！（EXP +60）' },
  },

  {
    id: 'coastal_road_last_walk', title: '海岸街道の最後の散歩',
    condition: { atLoc: 'coastal_road', maxDaysLeft: 22, minDaysLeft: 18 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '決戦前の最後の海岸。波の音が静かに響く。' },
      { speaker: 'narrator', speakerName: 'ローガン', text: '（静かに海を見て）……この海の向こうにも人々が生きている。それを守るために、俺たちは戦う。' },
      { speaker: 'player', speakerName: 'レオン', text: 'そうだ。……行こう、みんな。最後の戦いへ。' },
    ],
    reward: { exp: 65, gold: 300, message: '🌊 海岸で最後の決意。決戦へ！（EXP +65, +300G）' },
  },

  {
    id: 'forest_entrance_last_path', title: '森の入口の最後の小道',
    condition: { atLoc: 'forest_entrance', maxDaysLeft: 20, minDaysLeft: 16 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '森の入口を最後に通り過ぎる。木々が静かに揺れる。' },
      { speaker: 'mira', speakerName: 'ミラ', text: '……（木々に触れて）森よ。私はもうすぐ帰れないかもしれない。でも……あなたたちの代わりに戦う。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: '木々が一斉に光った。まるで「行ってこい」と言うように。' },
      { speaker: 'mira', speakerName: 'ミラ', text: '（涙をこらえて笑う）……ありがとう。行きます。' },
    ],
    reward: { exp: 65, fullHeal: true, message: '🌲 森の加護でパーティ全回復！（EXP +65）' },
  },

  {
    id: 'demon_mine_fire_seal_final', title: '廃鉱山の炎の記憶',
    condition: { atLoc: 'demon_mine', maxDaysLeft: 22, minDaysLeft: 18 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '鉱山で最後の確認をする。炎の封印石が力強く輝いている。' },
      { speaker: 'narrator', speakerName: '炎の精霊', text: '「……この炎の力は本物だ。魔王を焼き尽くせるだけの力がある。信じろ。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（……炎の石が応えている。準備は出来た。）' },
    ],
    reward: { exp: 70, message: '🔥 炎の封印石が最後の力を授けた！（EXP +70）' },
  },

  {
    id: 'bandit_hideout_last_echo', title: '盗賊アジトの最後のこだま',
    condition: { atLoc: 'bandit_hideout', maxDaysLeft: 18, minDaysLeft: 14 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '最後にアジトを通り過ぎると、ヴァイスが足を止めた。' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '（小声で）……かつての仲間たち。俺はこれから本物の戦いに行く。見ていてくれ。' },
      { speaker: 'narrator', speakerName: 'ナレーター', text: 'アジトの廃墟から、わずかな風が吹いた。背中を押すように。' },
      { speaker: 'vais', speakerName: 'ヴァイス', text: '（前を向いて）……行こう。これが俺の答えだ。' },
    ],
    reward: { exp: 70, message: '🗡️ ヴァイスが最後の決意を固めた！（EXP +70）' },
  },

  {
    id: 'dragon_pass_final_storm', title: '竜の峠の最後の嵐',
    condition: { atLoc: 'dragon_pass', maxDaysLeft: 18, minDaysLeft: 14 },
    dialogues: [
      { speaker: 'narrator', speakerName: 'ナレーター', text: '決戦前夜、竜の峠で小さな嵐が起きた。しかし……怖くなかった。' },
      { speaker: 'narrator', speakerName: '嵐竜の残影', text: '「……嵐竜の力が、封印石を通じて届いている。最後の戦いで使え。」' },
      { speaker: 'player', speakerName: 'レオン', text: '（……倒した敵の力まで、俺たちを助けてくれるのか。必ず、応えてみせる。）' },
    ],
    reward: { exp: 75, message: '🌩️ 嵐竜の力が封印石に宿った！（EXP +75）' },
  },
]
