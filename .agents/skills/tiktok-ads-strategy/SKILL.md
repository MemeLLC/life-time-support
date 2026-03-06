---
name: tiktok-ads-strategy
description: TikTok広告の運用戦略を立案し、最適な広告タイプの選定からキャンペーン設計、クリエイティブ設計、運用仕様書の作成までを支援する。ユーザーがTikTok広告・TikTok Adsに言及した場合に使用する。
---

# TikTok Ads 戦略・設計スキル

TikTok広告の戦略立案から仕様書作成までを一貫して支援する。17種類の広告タイプから最適な組み合わせを選定し、「Don't Make Ads, Make TikToks」の原則に基づくクリエイティブ設計と運用設計を行う。

## ディレクトリ構成

```
tiktok-ads-strategy/
├── SKILL.md                          # 本ファイル（ワークフロー・広告タイプ選定・設計指針）
└── references/
    ├── campaign-strategy.md           # キャンペーン構造・ターゲティング・入札・スケーリング
    ├── creative-fundamentals.md       # 動画構成・UGC・音声・クリエイティブ運用・日本市場
    ├── output-templates.md            # 仕様書テンプレート（フル版・簡易版・クリエイティブブリーフ）
    ├── in-feed-ads.md                 # In-Feed Ads（最も汎用的なオークション型広告）
    ├── spark-ads.md                   # Spark Ads（オーガニック投稿の広告転用）
    ├── carousel-ads.md                # Carousel Ads（複数画像のスワイプ広告）
    ├── topview.md                     # TopView（起動直後の全画面広告）
    ├── brand-takeover.md              # Brand Takeover（カテゴリ独占の全画面広告）
    ├── top-feed.md                    # Top Feed（In-Feed最上位枠）
    ├── reach-and-frequency.md         # Reach & Frequency（配信保証型）
    ├── branded-hashtag-challenge.md   # Branded Hashtag Challenge（UGC参加型）
    ├── branded-effects.md             # Branded Effects（ARフィルター・エフェクト）
    ├── branded-mission.md             # Branded Mission（UGCクラウドソーシング）
    ├── search-ads.md                  # Search Ads（TikTok内検索広告）
    ├── video-shopping-ads.md          # Video Shopping Ads（TikTok Shop連携）
    ├── dynamic-showcase-ads.md        # Dynamic Showcase Ads（カタログ連携リタゲ）
    ├── gmv-max.md                     # GMV Max（TikTok Shop全自動最適化）
    ├── lead-generation-ads.md         # Lead Generation Ads（アプリ内フォーム）
    ├── messaging-ads.md               # Messaging Ads（DM/チャット型）
    └── playable-ads.md                # Playable Ads（HTML5インタラクティブ）
```

## ワークフロー

```
Step 1: 情報収集         → ビジネス情報・目的・予算・ターゲットを整理
    ↓
Step 2: 広告タイプ選定    → 17種類から目的・予算に最適なタイプを選定
    ↓
Step 3: 戦略・クリエイティブ設計  → キャンペーン構造・ターゲティング・クリエイティブを設計
    ↓
Step 4: 仕様書作成        → 運用仕様書・クリエイティブ仕様書を出力
```

---

## Step 1: 情報収集

`contexts/` ディレクトリに既存の情報がある場合はまず参照する。不足する情報はユーザーにヒアリングする。

### 必須情報

| カテゴリ | 確認事項 |
|---------|---------|
| ビジネス概要 | 業種、商品・サービス内容、ターゲット層、USP |
| 広告目的 | 認知拡大 / トラフィック / コンバージョン / アプリインストール / リード獲得 / EC売上 |
| 予算 | 月間予算、日予算の目安（最低: キャンペーン$50/日、広告グループ$20/日） |
| ターゲット | 年齢、性別、地域、興味関心カテゴリ |
| KPI | 目標CPA / ROAS / CPL / CPI / CPM など |
| クリエイティブ素材 | 既存動画・画像の有無、UGC活用の可否、インフルエンサー起用の可否 |

### 状況把握（あれば）

| カテゴリ | 確認事項 |
|---------|---------|
| 既存運用 | 過去のTikTok広告実績（CTR, CVR, CPA, ROAS） |
| 他媒体実績 | Google / Meta / LINE など他媒体の運用実績 |
| TikTokアカウント | ビジネスアカウントの有無、フォロワー数、オーガニック投稿の状況 |
| TikTok Shop | TikTok Shop利用の有無、商品カタログの有無 |
| 競合 | TikTokでの競合広告の状況 |
| 法規制 | 景表法・薬機法・ステマ規制（2023年10月〜）への対応状況 |

---

## Step 2: 広告タイプ選定

TikTok広告は **オークション型（運用型）** と **予約型** の2つの購入方式がある。

| 方式 | 特徴 | 最低予算 | 適したケース |
|-----|------|---------|-------------|
| オークション型 | セルフサーブ、柔軟な予算調整、パフォーマンス最適化 | $20/日〜 | パフォーマンス重視、テスト、中小予算 |
| 予約型 | 営業担当経由、固定CPM、配信保証 | $45,000〜 | ブランディング、大規模リーチ、カテゴリ独占 |

### 広告タイプ早見表

#### ■ フィード内広告

| 広告タイプ | 方式 | 主な目的 | 予算目安 | リファレンス |
|-----------|------|---------|---------|------------|
| In-Feed Ads | オークション | CV/トラフィック/認知 | $20/日〜 | [in-feed-ads.md](references/in-feed-ads.md) |
| Spark Ads | オークション | エンゲージメント/CV | $20/日〜 | [spark-ads.md](references/spark-ads.md) |
| Carousel Ads | オークション | EC/アプリ | $20/日〜 | [carousel-ads.md](references/carousel-ads.md) |

#### ■ プレミアムリーチ（全画面・優先表示）

| 広告タイプ | 方式 | 主な目的 | 予算目安 | リファレンス |
|-----------|------|---------|---------|------------|
| TopView | 予約 | ブランド認知（最大インパクト） | $50,000〜/日 | [topview.md](references/topview.md) |
| Brand Takeover | 予約 | ブランド認知（カテゴリ独占） | $50,000〜/日 | [brand-takeover.md](references/brand-takeover.md) |
| Top Feed | 予約(R&F) | ブランド認知（In-Feed最上位） | 固定CPM | [top-feed.md](references/top-feed.md) |

#### ■ ブランドエンゲージメント

| 広告タイプ | 方式 | 主な目的 | 予算目安 | リファレンス |
|-----------|------|---------|---------|------------|
| Reach & Frequency | 予約 | リーチ/フリークエンシー制御 | 固定CPM | [reach-and-frequency.md](references/reach-and-frequency.md) |
| Branded Hashtag Challenge | 予約 | UGC/大規模エンゲージメント | $150,000+ | [branded-hashtag-challenge.md](references/branded-hashtag-challenge.md) |
| Branded Effects | 予約 | インタラクティブ体験 | $45,000〜 | [branded-effects.md](references/branded-effects.md) |
| Branded Mission | 予約 | UGCクラウドソーシング | $50,000+ | [branded-mission.md](references/branded-mission.md) |

#### ■ 検索広告

| 広告タイプ | 方式 | 主な目的 | 予算目安 | リファレンス |
|-----------|------|---------|---------|------------|
| Search Ads | オークション | 検索意図CV | $30/日〜 | [search-ads.md](references/search-ads.md) |

#### ■ コマース（EC・ショッピング）

| 広告タイプ | 方式 | 主な目的 | 予算目安 | リファレンス |
|-----------|------|---------|---------|------------|
| Video Shopping Ads (VSA) | オークション | EC売上 | 柔軟 | [video-shopping-ads.md](references/video-shopping-ads.md) |
| Dynamic Showcase Ads (DSA) | オークション | リターゲティング | $500/キャンペーン〜 | [dynamic-showcase-ads.md](references/dynamic-showcase-ads.md) |
| GMV Max | 自動最適化 | EC売上最大化 | AOV×10/日 | [gmv-max.md](references/gmv-max.md) |

#### ■ リード・メッセージ・インタラクティブ

| 広告タイプ | 方式 | 主な目的 | 予算目安 | リファレンス |
|-----------|------|---------|---------|------------|
| Lead Generation Ads | オークション | リード獲得 | $20/日〜 | [lead-generation-ads.md](references/lead-generation-ads.md) |
| Messaging Ads | オークション | 会話/リード（東南アジア中心） | $20/日〜 | [messaging-ads.md](references/messaging-ads.md) |
| Playable Ads | オークション(Pangle) | アプリインストール | 柔軟 | [playable-ads.md](references/playable-ads.md) |

各広告タイプの詳細な活用シーン・設計仕様は、早見表のリファレンスリンク先を参照。

### ビジネス目的別の推奨構成

| ビジネスタイプ | 推奨広告タイプ | 備考 |
|-------------|-------------|------|
| EC（中小規模） | In-Feed + Spark + VSA or GMV Max | Smart+併用推奨。UGC活用でCVR向上 |
| EC（大規模） | TopView + R&F + GMV Max + Spark | ブランディング×パフォーマンスの併用 |
| アプリ（ゲーム） | In-Feed + Playable + Smart+ App | AEO: 90インストール/日目標、Pangle活用 |
| アプリ（非ゲーム） | In-Feed + Spark + Smart+ App | UGCレビュー系クリエイティブが有効 |
| リード獲得（B2B） | In-Feed + Lead Gen + Search | インスタントフォーム、教育コンテンツ中心 |
| リード獲得（B2C） | Spark + Lead Gen + Messaging | UGC + インスタントフォームの組み合わせ |
| ブランド認知（大規模） | TopView + HTC + Branded Effects + R&F | 予約型中心、インフルエンサーシーディング必須 |
| ブランド認知（中規模） | R&F + Spark + Top Feed | 固定CPMでフリークエンシー制御 |
| 店舗集客 | In-Feed + Spark + Search | ローカルターゲティング、$20/日〜 |

### 予算別の推奨

| 月予算 | 推奨構成 |
|-------|---------|
| 〜$1,000 | In-Feed or Spark（1キャンペーン、2-3広告グループ） |
| $1,000〜$5,000 | In-Feed + Spark + Search（テスト→スケール構成） |
| $5,000〜$20,000 | 上記 + Lead Gen or VSA（目的別に追加） |
| $20,000〜$50,000 | Smart+ 併用、複数目的のキャンペーン運用 |
| $50,000+ | 予約型（TopView/R&F）+ オークション型の併用 |

### 選定後のアクション

広告タイプを選定したら、以下をユーザーに提示して合意を取る：

1. 選定した広告タイプとその理由
2. 各タイプの想定予算配分
3. キャンペーン目的と最適化イベント
4. 想定KPI（CPM / CPC / CPA / ROAS の目安）

---

## Step 3: 戦略・クリエイティブ設計

キャンペーン構造、ターゲティング、入札、クリエイティブを設計する。詳細は以下のリファレンスを参照。

- キャンペーン構造・ターゲティング・入札・スケーリング → [campaign-strategy.md](references/campaign-strategy.md)
- クリエイティブの原則・動画構成・ツール・日本市場 → [creative-fundamentals.md](references/creative-fundamentals.md)
- 各広告タイプ固有の設計 → Step 2 の各リファレンスファイル

### 3-1. キャンペーン構造設計

- **3層構造**: キャンペーン（戦略）→ 広告グループ（戦術）→ 広告（実行）
- **テスト vs スケール分離**: ABO（テスト用 20-30%予算）→ CBO（スケール用 70-80%予算）
- **Smart+**: 月$1,500以上の予算で手動比較を推奨。80%のケースで手動を上回る
- **ラーニングフェーズ**: 50コンバージョン/7日。予算 = 目標CPA × 20（最低）〜 × 50（理想）

### 3-2. ターゲティング設計

- **2025年のトレンド**: ブロードターゲティングが主流（狭いターゲティング比 CPA -15%, CVR +20%）
- **リターゲティング**: カート放棄7日、一般訪問者30-60日、高額商品60-180日
- **類似オーディエンス**: 購入者 > カート追加 > リード > 高エンゲージ視聴者 > 全訪問者

### 3-3. クリエイティブ設計の原則

**「Don't Make Ads, Make TikToks」** — TikTokのネイティブコンテンツに溶け込むクリエイティブが最も効果的。

- **UGC**: プロ制作比 +22% 効果、+55% ROI。79%のユーザーがUGCで購買を決定
- **最初の3秒**: 視聴完了率の71%を決定。3秒視聴者の45%が30秒以上視聴
- **動画構成**: フック(0-3秒) → ボディ(10-20秒) → CTA(3-5秒)
- **クリエイティブ疲労**: Metaの4倍速（高予算で3日 vs Meta 2週間）。3-5日ごとのマイクロリフレッシュ推奨
- **音声**: 68%のユーザーが音楽付きTikTokをより記憶。CML（商用音楽ライブラリ）使用

### 3-4. 命名規則

キャンペーン・広告グループ・広告に統一的な命名規則を設定する。

```
キャンペーン: {目的}_{広告タイプ}_{ターゲット}_{地域}
広告グループ: {ターゲティング種別}_{詳細}_{入札戦略}
広告: {クリエイティブ種別}_{内容}_{バージョン}

例:
CV_InFeed_Broad_JP
Interest_Beauty25-34_CostCap
UGC_ProductReview_v1
```

---

## Step 4: 仕様書作成

Step 2 で選定した広告タイプのリファレンスと [campaign-strategy.md](references/campaign-strategy.md)・[creative-fundamentals.md](references/creative-fundamentals.md) を参照して仕様書を作成する。出力テンプレートは [output-templates.md](references/output-templates.md) を使用。出力先はプロジェクトのディレクトリ構造に従う。

---

## 関連スキル

| スキル | 使い分け |
|-------|---------|
| **copywriting** | 広告コピー・LP コピーの本格的な作成が必要な場合 |
| **landing-page-composition** | 広告の遷移先 LP の構成設計が必要な場合 |
| **cro** | 広告の遷移先ページの CVR 改善が必要な場合 |
| **analytics-tracking** | GA4・GTM・TikTok Pixel の計測設計が必要な場合 |
| **competitor-analysis** | TikTok上の競合広告を詳しく分析したい場合 |
| **image-generation** | 広告用サムネイル・バナー画像を AI で生成したい場合 |
| **video-generation** | 広告用の動画クリエイティブを生成したい場合 |
| **google-ads-strategy** | Google 広告と TikTok 広告を併用する場合 |
| **meta-ads-strategy** | Meta 広告と TikTok 広告を併用する場合 |
