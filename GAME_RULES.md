# 封印の継承者 — ゲーム開発ルールブック

> 最終更新: 2026-06-18  
> 管理: 田中CEO（Claude Code）  
> 適用範囲: このゲームの全実装に適用する。変更時はこのファイルも必ず更新すること。

---

## 1. ゲームコンセプト（変更不可）

| 項目 | 仕様 |
|------|------|
| ジャンル | ブラウザRPG（すごろく形式） |
| モデル | パワポケ4（GBA 2002）の世界観・イベント設計 |
| 目標 | 100日以内に3つの封印石を集め魔王を倒す |
| 主人公 | レオン（名前変更可） |
| 仲間 | 13人中3人まで選択 |
| ロケーション数 | 21（町6・中継地11・ダンジョン4） |
| 封印石 | 炎（廃鉱山）・嵐（竜の峠）・闇（古代神殿） |
| 最終ボス | アーカイブ（砂漠遺跡） |

---

## 2. チーム体制と役割分担

| 役割 | エージェント | 担当内容 |
|------|-------------|---------|
| CEO / 実装統括 | 田中（Claude） | オーナーとの対話・実装方針決定・全コード実装 |
| デザイン | 山崎 | UI/UXデザイン・サイト作成支援 |
| QC採点 | 柳・永井 | 200点満点採点（合格190点以上）|
| Web検索 | だいすけ | リアルタイム情報収集 |

### チーム運用ルール
- **田中はオーナーと対話し、各エージェントへ仕事を割り振る**
- 大きな実装はサブエージェントに依頼して並列処理
- QCは必ず柳・永井が採点（田中・山崎は採点しない）
- 購入・課金・契約操作は絶対に行わない
- デプロイはオーナー確認後のみ（GitHubへのpushはOK）

---

## 3. デザイン原則（パワポケ4準拠）

### ビジュアル
- **配色**: 濃紺 `#07071a` 背景、amber/indigo アクセント
- **メッセージボックス**: 濃紺背景・白文字（GBAスタイル）
- **キャラ**: characters.jpg スプライトシート（7×n グリッド）
- **敵**: 絵文字表示（画像ファイル不使用）
- **マップ**: CSS描画ベース、地形ゾーン色分け、全拠点ラベル表示

### ゲームバランス
- 難易度: イージー（120日・敵HP70%）/ ノーマル（100日・100%）/ ハード（80日・140%）
- EXP: `level × 15` で次レベルへ
- 仲間上限: **3人まで**（ゲーム内に説明表示必須）
- 宿屋: 50G / 1日消費
- 初期所持金: 300G / ポーション×2・エーテル×1

---

## 4. ストーリー進行ロック設計

| フェーズ | 条件 | 開放されるエリア |
|---------|------|----------------|
| 序盤 | 開始時から | alseria, traveler_inn, checkpoint, galdo, bern, great_bridge, watchtower |
| 中盤① | Lv4 または ガレス加入 | riverside, lighthouse |
| 中盤② | Lv4 | spirit_spring, forest_entrance |
| 中盤③ | Lv5 または 封印石1個 | elna |
| 中盤④ | Lv4 | demon_mine（廃鉱山）|
| 中盤⑤ | 炎の封印石取得後 | dragon_pass（竜の峠）|
| 中盤⑥ | Lv5 | bandit_hideout, trading_post |
| 後半① | 盗賊王撃破 または 封印石1個 | sahal |
| 後半② | 封印石1個 | coastal_road |
| 後半③ | 封印石2個 | mirea, lighthouse, ancient_temple |
| 終盤 | 封印石3個 | desert_ruins（最終決戦）|

---

## 5. イベントシステム設計（パワポケ4スタイル）

### 基本ルール
- 条件が揃った状態で特定ロケーションを訪問すると自動発火
- 1イベント1回のみ（completedEvents に記録）
- イベント後に報酬（EXP / ゴールド / アイテム）

### 実装済みイベント一覧（16件）

| ID | 場所 | 条件 | 概要 |
|----|------|------|------|
| alseria_gares_homecoming | アルセリア | ガレス加入 | 騎士団長の帰還 |
| alseria_liz_prayer | アルセリア | リズ加入 | 礼拝堂での祈り |
| bern_noa_market | ベルン | ノア加入 | 市場で大はしゃぎ |
| galdo_cecil_library | ガルド | セシル加入 | 魔法塔の記憶 |
| elna_bram_hometown | エルナ | ブラム加入 | 亡き父への誓い |
| riverside_finn_dream | 川辺の村 | フィン加入 | 冒険者への夢 |
| demon_mine_iris_confession | 廃鉱山 | イリス加入 | 魔王軍時代の告白 |
| bandit_hideout_vais_past | 盗賊アジト | ヴァイス加入 | 裏切られた過去 |
| sahal_logan_atonement | サハル | ローガン加入 | 贖罪の旅 |
| mirea_sig_identity | ミレア | シグ加入 | 商人の息子の秘密 |
| dragon_pass_elk_clan | 竜の峠 | エルク加入 | 滅びた一族の誓い |
| ancient_temple_mira_seal_history | 古代神殿 | ミラ加入 | 封印の真実 |
| desert_ruins_zeno_revelation | 砂漠遺跡 | ゼノ加入 | 魔族の反逆 |
| spirit_spring_healing_miracle | 精霊の泉 | 条件なし | 精霊の祝福（一回限り）|
| great_bridge_merchant_encounter | 大橋 | 70日以上残 | 怪しい商人（期間限定）|
| traveler_inn_rumor_about_seals | 旅人の宿 | 90日以下 | 先人の情報 |

---

## 6. バトルシステム

- **行動順**: SPDの高い順
- **ダメージ計算**: `max(1, ATK - DEF*0.5) × [0.9-1.1]`
- **スキル**: MPコスト制。boss_bonusは3.5倍効果
- **ボスHP**: bandit_king 200 / mine_king 320 / storm_dragon 340 / forest_king 400 / archive 460
- **ターン遅延**: 非プレイヤーターンは1600ms後に処理
- **BGM切替**: 町→town BGM / ダンジョン→dungeon BGM / ボス戦→boss BGM

---

## 7. 技術スタック

| 項目 | 仕様 |
|------|------|
| フレームワーク | Next.js 14 App Router |
| スタイリング | Tailwind CSS |
| 言語 | TypeScript |
| デプロイ | GitHub Pages（静的エクスポート）|
| basePath | `/fuuin-no-keishousha` |
| Node.js | v20.20.2（nvm管理）|

### デプロイ手順（安全な方法）
```bash
npm run build
# out/ ディレクトリを gh-pages ブランチに直接コピー
git worktree add /tmp/gh-deploy gh-pages
cp -r out/* /tmp/gh-deploy/
cd /tmp/gh-deploy && git add -A && git commit -m "deploy" && git push
```

---

## 8. QCスコアリング（柳・永井採点）

| カテゴリ | 配点 |
|---------|------|
| クリア可能性 | 30点 |
| ボスバランス | 20点 |
| ゴールド経済 | 18点 |
| バグ修正率 | 18点 |
| 音楽・効果音 | 16点 |
| キャラ表示 | 16点 |
| バトル演出 | 18点 |
| UX・画面遷移 | 18点 |
| 世界観・整合性 | 16点 |
| 総合楽しさ | 30点 |
| **合計** | **200点** |

**合格基準: 190点以上**

---

## 9. 禁止事項

- alpha-note・note-project・setsuyaku_project への接触
- 購入・課金・契約操作
- オーナー確認なしのデプロイ
- QCスコアの改ざん・自己採点（田中・山崎による採点禁止）
