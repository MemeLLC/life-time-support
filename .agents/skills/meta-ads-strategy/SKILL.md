---
name: meta-ads-strategy
description: "Meta（Facebook/Instagram）広告の運用戦略を立案し、キャンペーン目的・広告フォーマット・配置面の選定、キャンペーン構造の設計、クリエイティブ・コピーの仕様書作成までを一貫して支援する。ユーザーが以下のいずれかに言及した場合に使用する：「Meta広告の戦略を立てたい」「Facebook広告を始めたい」「Instagram広告を設計したい」「Meta広告のキャンペーン設計」「どの広告フォーマットが良いか」「リール広告の戦略」「コレクション広告を設計」「リード広告を設計」「カルーセル広告の設計」「Meta広告のクリエイティブ仕様書」「Meta広告の運用指示書を作って」「ASCを使うべきか」「Advantage+の設計」「Meta広告で集客したい」「Meta広告の改善」「Facebook/Instagram広告のキャンペーン構成」「Meta広告の設計書」「Meta広告の戦略書」「Meta広告のコピーを書いて」「Meta広告のクリエイティブブリーフ」。"
---

# Meta Ads 戦略・設計スキル

Meta（Facebook/Instagram）広告のキャンペーン設計、クリエイティブ・コピーの仕様書作成、運用指示書の作成を一貫して支援する。

## ワークフロー

```
Step 1: 情報収集     → ビジネス状況・予算・目標を把握する
    ↓
Step 2: 戦略立案     → キャンペーン目的・フォーマット・配置面・構造を決める
    ↓
Step 3: クリエイティブ設計 → 各フォーマット別のクリエイティブ・コピー仕様を作成する
    ↓
Step 4: 仕様書作成   → 運用指示書・戦略書・クリエイティブブリーフを出力する
```

---

## Step 1: 情報収集

以下を確認する。未提供なら質問する。`contexts/` にビジネスプロファイルや競合分析がある場合はそこから取得する。

### 必須情報

| カテゴリ | 確認事項 |
|---------|---------|
| **ビジネスモデル** | EC / リード獲得 / アプリ / 店舗集客 / SaaS / ブランド認知のどれか |
| **商材** | 何を売る/訴求するか（商品、サービス、無料トライアル、資料DLなど） |
| **目標** | 主要KPIは何か（CPA、ROAS、CPL等）。目標値があれば数値も |
| **予算** | 月次 or 日次の広告予算 |
| **LP** | 遷移先のランディングページURL |
| **ターゲット** | 誰に届けたいか（地域、年齢層、性別、興味関心など） |

### 状況把握（あれば）

| カテゴリ | 確認事項 |
|---------|---------|
| **既存運用** | 現在Meta広告を運用中か。課題は何か |
| **CVデータ** | 過去30日のCV件数（入札戦略・ASC適用の判断に影響） |
| **クリエイティブ** | 動画・画像素材はあるか、制作体制はあるか |
| **計測** | Meta Pixel / Conversions API は設定済みか |
| **商品カタログ** | Meta Business Managerの商品カタログはあるか（EC向け） |

---

## Step 2: 戦略立案

### 2-1. キャンペーン目的の選定

Meta広告は6つのキャンペーン目的に統合されている。**目的の選択はアルゴリズムの最適化方向を決定するため最重要。**

| 目的 | 概要 | 適したビジネス | 推奨フォーマット |
|------|------|--------------|----------------|
| **Awareness** | ブランド認知・リーチ最大化 | 新規ブランド、イベント | 動画/リールズ、画像 |
| **Traffic** | 特定URLへのクリック最大化 | メディア、LP送客 | 画像、カルーセル |
| **Engagement** | いいね・シェア・動画視聴を促進 | コンテンツ、イベント | 動画/リールズ |
| **Leads** | 見込み客の連絡先情報を取得 | B2B、不動産、教育 | リード広告、画像 |
| **App Promotion** | アプリインストール促進 | モバイルアプリ、ゲーム | 動画、プレイアブル |
| **Sales** | 購入・CVを最大化 | EC、D2C、サブスク | コレクション、カルーセル |

> **原則:** ECやリード獲得が主目的なら、最初から**Sales**を選ぶのがデフォルト。

各目的の詳細仕様（パフォーマンス目標、最適化イベント、ビジネスタイプ別選定等）は [ad-types-and-placements.md](references/ad-types-and-placements.md) §1 を参照。

### 2-2. ビジネスタイプ別 推奨構成

| ビジネスタイプ | キャンペーン目的 | キャンペーン構造 | 配置面 | 入札戦略 |
|---------------|----------------|----------------|-------|---------|
| **EC / D2C** | Sales（ASC推奨） | 2CP: テスト+スケール | Advantage+（全自動） | 最低コスト → ROAS目標 |
| **B2Bリード** | Leads / Sales | 3CP: Sales+Awareness+RT | FB/IG Feed（AN除外検討） | コストキャップ |
| **SaaS** | Leads → Sales | 3CP: Sales+Awareness+RT | FB/IG Feed | 最低コスト → コストキャップ |
| **ローカル** | Awareness + Sales | 3CP: Awareness+Sales+RT | FB Feed+Marketplace+IG | 最低コスト |
| **アプリ** | App Promotion | 2CP: テスト+スケール | Advantage+（全自動） | 最低コスト → バリュー |
| **ブランド** | Awareness | 1CP: Awareness | Advantage+（Reels重視） | 最低コスト |

キャンペーン構造パターン（2CP/3CP）、予算配分、学習フェーズ管理の詳細は [campaign-structure.md](references/campaign-structure.md) を参照。

### 2-3. 広告フォーマット選定マトリクス

| 目的 | 第1推奨 | 第2推奨 | 第3推奨 |
|------|--------|--------|--------|
| **認知** | 動画/リールズ | カルーセル | 画像 |
| **トラフィック** | 画像 | カルーセル | 動画 |
| **エンゲージメント** | 動画/リールズ | カルーセル | 画像 |
| **リード獲得** | リード広告 | 動画 | 画像 |
| **EC販売** | コレクション | カルーセル | 動的商品広告 |
| **非EC販売** | 動画 | 画像 | カルーセル |

各フォーマットの詳細仕様（解像度、ファイルサイズ、パフォーマンス特性等）は [ad-types-and-placements.md](references/ad-types-and-placements.md) §2 を参照。

### 2-4. 配置面の基本方針

- **CV目的（Sales/Leads/App）:** Advantage+ Placements がデフォルト推奨（CPA最大32%低下）
- **配置面を制限すると:** 個別CPMは下がっても全体CPAは上がるケースが多い
- **B2Bリード:** Audience Networkは除外検討

配置面の全一覧（19+）、品質ティア、セーフゾーン仕様は [ad-types-and-placements.md](references/ad-types-and-placements.md) §3 を参照。

### 2-5. 選定後のアクション

選定したら以下を提示してユーザーに方向性の確認を取る:
1. 推奨するキャンペーン目的とその理由
2. キャンペーン構成の概要（何本のキャンペーン、各キャンペーンの役割）
3. 推奨フォーマットと配置面
4. 入札戦略と予算配分

---

## Step 3: クリエイティブ設計

### クリエイティブの重要性

Meta広告のパフォーマンスの**70〜80%はクリエイティブの品質**に依存する。Andromedaアルゴリズムにより、Metaはクリエイティブの内容から配信先を判断する。

### 設計の基本原則

- **多様性 > 量**: 類似バリエーションの量産ではなく、根本的に異なるコンセプトを展開する
- **1広告 = 1メッセージ**: 複数の訴求を詰め込まない
- **9:16をマスターデザイン**: Reelsのセーフゾーン（下部35%空け）に合わせれば全配置面で安全
- **字幕は必須**: ユーザーの80%は音声OFFで視聴
- **4:5 > 1:1**: フィードで最大15%パフォーマンス向上

クリエイティブ多様性、配置面別設計ルール、テストサイクル、ファネル別戦略の詳細は [creative-strategy.md](references/creative-strategy.md) を参照。

### フォーマット別の設計詳細

各フォーマットの詳細な制作仕様は、以下のリファレンスを参照する:

| フォーマット | 参照先 | 主な設計項目 |
|-------------|--------|------------|
| 画像広告 | [creative-production.md](references/creative-production.md) §2 | デザインパターン7種、コピーテンプレート |
| 動画広告 | [creative-production.md](references/creative-production.md) §3 | Hook→Body→CTA構成、セーフゾーン、6クリエイティブタイプ |
| カルーセル広告 | [creative-production.md](references/creative-production.md) §4 | 5ビート構成、6構成パターン |
| コレクション広告 | [creative-production.md](references/creative-production.md) §5 | カバー設計、IEテンプレート4種 |
| リード広告 | [creative-production.md](references/creative-production.md) §6 | フォームタイプ3種、質問設計フロー |
| Instant Experience | [creative-production.md](references/creative-production.md) §7 | 推奨コンテンツ構成 |

### コピーの基本設計

| 要素 | 推奨文字数 | 本数 |
|------|-----------|------|
| メインテキスト | 125文字以内 | 3〜5パターン |
| 見出し | 27文字以内 | 3〜5パターン |
| 説明文 | 27文字以内 | 1〜3パターン |
| CTA | プリセットから選択 | 1つ |

フック設計（16タイプ）、訴求軸（8種）、CTAボタン選定の詳細は [creative-production.md](references/creative-production.md) §1 を参照。

---

## Step 4: 仕様書作成

選定した戦略に基づいて、具体的な設計仕様書を作成する。

### 参照すべきリファレンス

| テーマ | リファレンス | 主な内容 |
|-------|------------|---------|
| 目的・フォーマット・配置面 | [ad-types-and-placements.md](references/ad-types-and-placements.md) | 6目的の詳細、フォーマット別仕様、19+配置面、ベンチマーク |
| 設定・ターゲティング・入札 | [campaign-setup.md](references/campaign-setup.md) | 初期セットアップ、Pixel/CAPI、オーディエンス、入札戦略、ASC |
| 構造・予算・KPI | [campaign-structure.md](references/campaign-structure.md) | 2/3CP構造、予算配分、学習フェーズ管理、KPI、命名規則 |
| クリエイティブ戦略 | [creative-strategy.md](references/creative-strategy.md) | 多様性原則、配置面別設計、テストサイクル、ファネル別戦略 |
| フォーマット別制作 | [creative-production.md](references/creative-production.md) | 各フォーマット別の制作ガイド |
| 出力テンプレート | [output-templates.md](references/output-templates.md) | 戦略書、設計メモ、クリエイティブブリーフのテンプレート |

### 仕様書に含める項目

1. **戦略サマリー**: 目標、ターゲット、キャンペーン目的の選定理由
2. **キャンペーン構成表**: 全キャンペーンの一覧（目的、入札、予算配分、配置面）
3. **フォーマット別の設計詳細**: 各広告フォーマットの具体的設計
4. **クリエイティブ制作指示**: 必要な素材の一覧と制作要件
5. **コピー設計**: メインテキスト・見出し・説明文の案
6. **計測設計**: Pixel/CAPI設定、CV定義
7. **運用スケジュール**: 立ち上げ〜学習期間〜最適化の各フェーズ
8. **KPIと評価基準**: 成功の定義と測定方法

仕様書のテンプレートは [output-templates.md](references/output-templates.md) を参照。
出力先はプロジェクトのディレクトリ構造に従う。

---

## 関連スキル

| スキル | 使い分け |
|-------|---------|
| **copywriting** | LP全体のコピーを書く場合 |
| **landing-page-composition** | 広告遷移先のLP構成を設計する場合 |
| **cro** | 既存LPのコンバージョン率を改善する場合 |
| **analytics-tracking** | GA4/GTM/Meta Pixelのコンバージョン計測を設計・実装する場合 |
| **competitor-analysis** | 競合の広告戦略を調査する場合 |
| **image-generation** | 広告用のバナー・画像クリエイティブを生成する場合 |
| **video-generation** | 広告用の動画クリエイティブを生成する場合 |
| **google-ads-strategy** | Google Adsの広告戦略を立案する場合 |
