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
2. **ショップ値上がりシステム** — 10日毎1割UP（PP4の経済的緊張感）

---

## 現在の実装状態

- `lib/game/types.ts` — GameEvent型・DialogueLine・イベント関連型・locVisitCounts・fullHeal定義済み
- `lib/game/data.ts` — EVENTS配列51件、仲間13人定義済み
- `lib/game/engine.ts` — getAvailableConnections・checkLocationEvent（minVisitCount対応）・startEvent・advanceEvent・applyEventReward（fullHeal対応）・wander・setParty実装済み
- `components/game/EventScene.tsx` — パワポケ4スタイルの会話画面（ボーダーカラーバグ修正済み）
- `components/game/WorldMap.tsx` — 21拠点マップ
- `components/game/GameRoot.tsx` — イベント統合・PartyManage統合・メッセージトースト色分け済み
- `components/game/LocationView.tsx` — うろつく・パーティ編成ボタン・低HPパーティ警告表示
- `components/game/StatusBar.tsx` — EXPバー追加済み
- `components/game/PartyManage.tsx` — パーティ編成画面（GameRootに統合済み）
- `components/game/BattleScene.tsx` — 状態異常アイコン・PP4スタイルバトル

## 直近の未解決課題

- [x] 連続イベント（requiredEventCompleted条件）— 実装済み
- [x] 選択肢システム（EventBranch分岐）— 実装済み
- [x] ガレス・リズ重複バグ — 修正済み
- [x] 各仲間のStage3（最終章）イベント — 実装済み
- [x] 残り日数ベース強制イベント — 実装済み
- [x] 訪問回数カウントシステム — 実装済み
- [ ] QCスコア → 190点以上（採点待ち）
- [ ] デプロイ（オーナー承認待ち）

---

## ルールの更新方法

「GAME_RULES.md を更新して」または「CLAUDE.md を更新して」と指示する。
重要な決定・変更があれば田中が自主的に両ファイルを更新する。
