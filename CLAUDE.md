# 封印の継承者 — Claude Code 自動読み込みルール

> このファイルはセッション開始時に田中（Claude Code）が自動で読み込む。
> 必ず遵守すること。変更はオーナー承認後のみ。

---

## 絶対禁止事項（いかなる状況でも破らない）

- `alpha-note` `note-project` `setsuyaku_project` には触れない
- 購入・課金・契約操作は一切行わない
- デプロイ（gh-pagesへの公開）はオーナーの確認・承認後のみ
- QC採点は柳・永井のみ（田中・山崎は採点しない）
- `git push --force` は絶対に行わない

---

## チーム体制と役割

| 役割 | 担当 | 概要 |
|------|------|------|
| CEO・コーディネーター | 田中（Claude） | オーナーと対話し、各エージェントへ作業を割り振る |
| デザイン・コーディング | 山崎 | UI/UX・コード実装 |
| QC採点 | 柳・永井 | 200点満点・190点以上合格 |
| Web検索・情報収集 | だいすけ | リアルタイム情報・ゲーム分析 |

**田中の基本動作：**
1. オーナーの指示を受けて作業の方向性を決める
2. 大きな調査はだいすけに依頼（Agentツール使用）
3. 実装は山崎（自分で実行）または直接実装
4. QCは柳・永井に依頼（simulatorを実行）
5. 結果のみオーナーに報告（途中経過の長い説明は省く）

---

## ゲームコンセプト（変更不可）

| 項目 | 仕様 |
|------|------|
| ジャンル | ブラウザRPG（すごろく形式） |
| モデル | パワポケ4スタイル（GBA 2002） |
| 目標 | 100日で3封印石を集め魔王を倒す |
| 仲間 | 13人中3人まで加入 |
| 最終ボス | 終末記録体アーカイブ（砂漠遺跡） |
| フォント | DotGothic16（Google Fonts） |
| デプロイ | GitHub Pages（basePath: /fuuin-no-keishousha） |

---

## パワポケ4との差分（だいすけ調査 2026-06-19 徹底版）

### PP4裏サクセス（RPGモード）の核心システム
- **200日・3珠収集・仲間最大15人（パーティ同時3〜4人）**
- 仲間はHP0で**永続死亡**（復活不可）→ ドラマ的重みが全く違う
- イベントは「場所ベース」「訪問回数ベース」「仲間フラグ干渉」「残り日数ベース」の4種
- 選択肢によって報酬・仲間加入・フラグが同時に変わる
- 値上がりシステム：10日毎に1割価格上昇（経済的緊張感）

### 実装済み（2026-06-19以降）
- ✅ **連続イベント**（requiredEventCompletedで前提イベント条件）
- ✅ **選択肢分岐**（EventBranch・pendingBranch・chooseBranch）
- ✅ **各仲間の連続イベントStage2**（13人分）
- ✅ **各仲間のStage3最終章イベント**（ガレス除く9人分 ← gares は elna_gares_final_oath が兼任）
- ✅ **選択肢イベント5件**（精霊の問い・商人取引・賭け・老人・灯台）
- ✅ **ガレス・リズ重複バグ修正**（gares→checkpoint）
- ✅ **訪問回数カウントシステム**（locVisitCounts + minVisitCount条件）
- ✅ **残り日数ベース強制イベント**（日数60日・30日警告）
- ✅ **チュートリアルイベント**（アルセリア初訪問時）
- ✅ **fullHeal報酬**（精霊の泉・リズ奇跡イベント）
- ✅ **パーティ編成UI**（PartyManage.tsx統合）
- ✅ **仲間死亡システム**（alive=false永続・復活手段なし、PP4スタイル）
- ✅ **メッセージトースト色分け**（成功=緑/警告=黄/情報=紺）
- ✅ **EXPバー**（StatusBar）
- ✅ **うろつくコマンド**（町・中継地で1日消費ランダム報酬）
- ✅ **EventSceneボーダーカラーバグ修正**
- ✅ **travel後イベント発火修正**（最重要バグ）
- ✅ **EVENTS総数51件**

### まだ不足している要素
1. **アルバム/実績システム** — 周回欲求刺激
2. ~~ショップ値上がりシステム~~ — ✅ 実装済み（getItemPrice・getInnPrice）

### 2026-06-19 追加修正（自律改善セッション）
- ✅ バトルログ順序修正（ダメージ→死亡の順序・スキル使用→エフェクトの順序）
- ✅ 毒死亡時に「倒れた！」ログ追加
- ✅ wanderのEXP獲得時に生存パーティ仲間にも同量のEXP付与
- ✅ 敵のself系スキル（vine_callなど）が誤ってプレイヤーをバフするバグ修正
- ✅ 仲間AIにself-buffスキル使用ロジック追加（HP50%以上時に25%確率）
- ✅ チュートリアルminDaysLeft 95→70（hard=80日スタートで未発火だった）
- ✅ チュートリアル「残り100日」を難易度非依存文言に修正
- ✅ バトルログ色分け（ダメージ赤・回復緑・スキル青・必殺黄・死亡濃赤・システム金）
- ✅ プレイヤーの状態異常を戦闘ステータスバーに残りターン数付きで表示
- ✅ 敵の状態異常アイコンをHP/名前バー下に表示
- ✅ WorldMapのforest_entrance表示修正（dungeon→relay形状・ラベル修正）

### 2026-06-19 第2セッション追加修正（自律改善継続）
- ✅ defeatedBossesにUID（enemy_0_xxx）ではなく実際のbossIdを格納（LocationView/WorldMap/fightBossの.includes()ハック排除）
- ✅ processEnemyTurnのスキル選択バグ修正（MP不足スキルが選ばれる可能性を排除）
- ✅ handleCloseBattle後にcheckLocationEventを実行（リレー経由バトル後イベント漏れ修正）
- ✅ wanderで仲間がレベルアップした際にメッセージ通知追加
- ✅ 灯台岬をrelay→dungeonに昇格・潮王ネブラ（tidal_king）を配置（未使用ボス解決）
- ✅ types.tsコメント更新（lighthouse=dungeon反映）
- ✅ 全コミットをGitHubにpush済み

---

## 現在の実装状態

- `lib/game/types.ts` — GameEvent型・DialogueLine・イベント関連型・locVisitCounts・fullHeal・atk_down定義済み
- `lib/game/data.ts` — EVENTS配列51件、仲間13人・getItemPrice・getInnPrice実装済み
- `lib/game/engine.ts` — checkLocationEvent（minVisitCount対応）・applyEventReward（fullHeal対応）・wander・setParty・getInnPrice/getItemPrice totalDays対応・バフ/デバフターン管理・debuff_atk実装済み
- `components/game/EventScene.tsx` — パワポケ4スタイルの会話画面（ボーダーカラーバグ修正済み）
- `components/game/WorldMap.tsx` — 21拠点マップ・ボス討伐👑表示
- `components/game/GameRoot.tsx` — イベント統合・PartyManage統合・メッセージトースト色分け済み
- `components/game/LocationView.tsx` — うろつく・パーティ編成ボタン・低HPパーティ警告・宿屋動的価格表示
- `components/game/StatusBar.tsx` — EXPバー・死亡仲間グレーアウト表示
- `components/game/PartyManage.tsx` — パーティ編成画面（死亡仲間スロット占有バグ修正済み）
- `components/game/BattleScene.tsx` — 状態異常アイコン（atk_down⬇️含む）・PP4スタイルバトル
- `components/game/ShopView.tsx` — 物価上昇バナー・赤字価格・difficulty対応totalDays
- `components/game/TitleScreen.tsx` — 動的日数サブタイトル・正確な難易度説明
- `components/game/WinScreen.tsx` — エピローグ死亡仲間💀バッジ・日本語難易度名
- `components/game/GameOverScreen.tsx` — 日本語難易度名

## 直近の未解決課題

- [x] 連続イベント（requiredEventCompleted条件）— 実装済み
- [x] 選択肢システム（EventBranch分岐）— 実装済み
- [x] ガレス・リズ重複バグ — 修正済み
- [x] 各仲間のStage3（最終章）イベント — 実装済み
- [x] 残り日数ベース強制イベント — 実装済み
- [x] 訪問回数カウントシステム — 実装済み
- [x] ショップ・宿屋値上がりシステム — 実装済み
- [x] debuff_atk・バフ永続バグ — 修正済み
- [x] 価格計算totalDays難易度対応 — 修正済み
- [x] PartyManage死亡仲間スロットバグ — 修正済み
- [ ] QCスコア → 190点以上（採点待ち）
- [ ] デプロイ（オーナー承認待ち）
- [ ] アルバム/実績システム（optional）

---

## ルールの更新方法

「GAME_RULES.md を更新して」または「CLAUDE.md を更新して」と指示する。
重要な決定・変更があれば田中が自主的に両ファイルを更新する。
