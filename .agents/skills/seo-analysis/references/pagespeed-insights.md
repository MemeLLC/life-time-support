# PageSpeed Insights データ取得リファレンス

SEO 分析で PageSpeed Insights API を使い、パフォーマンス・CWV・SEO監査項目・アクセシビリティを取得・分析する手順。

---

## 前提

- `.env` に `PAGE_SPEED_INSIGHTS_API_KEY` が設定済み
- `jq` がインストール済み
- 出力先はプロジェクトのディレクトリ構造に従う

---

## 基本フロー: JSON 取得 → スコア・CWV・改善機会の抽出

`strategy=mobile` でモバイル結果を取得する。デスクトップも必要な場合は `strategy=desktop` で再取得する。

```bash
# 1. JSON 取得＆保存（全カテゴリ取得）
source .env && curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=[対象URL]&key=$PAGE_SPEED_INSIGHTS_API_KEY&category=performance&category=seo&category=accessibility&category=best-practices&strategy=mobile" > <出力先>/psi-[ページ種別]-mobile.json

# 2. 全体スコアの抽出
jq '.lighthouseResult.categories | to_entries[] | {(.key): (.value.score * 100)}' <出力先>/psi-[ページ種別]-mobile.json

# 3. Core Web Vitals の抽出
jq '{LCP: .lighthouseResult.audits["largest-contentful-paint"].displayValue, FCP: .lighthouseResult.audits["first-contentful-paint"].displayValue, TBT: .lighthouseResult.audits["total-blocking-time"].displayValue, CLS: .lighthouseResult.audits["cumulative-layout-shift"].displayValue, SI: .lighthouseResult.audits["speed-index"].displayValue}' <出力先>/psi-[ページ種別]-mobile.json

# 4. 改善の機会（削減可能な時間が大きい順）
jq '[.lighthouseResult.audits | to_entries[] | select(.value.details.type == "opportunity") | {id: .key, title: .value.title, savings_ms: .value.details.overallSavingsMs}] | sort_by(-.savings_ms)' <出力先>/psi-[ページ種別]-mobile.json
```

- レスポンス JSON は巨大なため、必ず `jq` で必要なデータを抽出して確認する

---

## SEO 監査向け追加分析

### SEO 監査項目の個別結果

```bash
# passed（合格）の SEO 監査項目
jq '[.lighthouseResult.categories.seo.auditRefs[] | .id as $id | {id: $id, score: .lighthouseResult.audits[$id].score, title: .lighthouseResult.audits[$id].title}] | map(select(.score == 1))' <出力先>/psi-[ページ種別]-mobile.json

# 上記が複雑な場合のシンプル版: SEO カテゴリの全監査項目を一覧
jq '.lighthouseResult.categories.seo.auditRefs[].id' <出力先>/psi-[ページ種別]-mobile.json

# 各 SEO 監査項目のスコアとタイトル
jq '[.lighthouseResult.categories.seo.auditRefs[].id] as $ids | [.lighthouseResult.audits | to_entries[] | select(.key == ($ids[])) | {id: .key, score: .value.score, title: .value.title}]' <出力先>/psi-[ページ種別]-mobile.json

# failed（不合格）の SEO 監査項目のみ
jq '[.lighthouseResult.categories.seo.auditRefs[].id] as $ids | [.lighthouseResult.audits | to_entries[] | select(.key == ($ids[])) | select(.value.score != null and .value.score < 1) | {id: .key, score: .value.score, title: .value.title, description: .value.description}]' <出力先>/psi-[ページ種別]-mobile.json
```

### アクセシビリティ監査の失敗項目

```bash
jq '[.lighthouseResult.categories.accessibility.auditRefs[].id] as $ids | [.lighthouseResult.audits | to_entries[] | select(.key == ($ids[])) | select(.value.score != null and .value.score < 1) | {id: .key, score: .value.score, title: .value.title}]' <出力先>/psi-[ページ種別]-mobile.json
```

### 診断情報（DOM サイズ、リクエスト数など）

```bash
jq '[.lighthouseResult.audits | to_entries[] | select(.value.details.type == "diagnostic" or (.value.details.type == "table" and .value.score != null and .value.score < 1)) | {id: .key, title: .value.title, displayValue: .value.displayValue, score: .value.score}] | sort_by(.score)' <出力先>/psi-[ページ種別]-mobile.json
```

---

## モバイル vs デスクトップの比較取得

```bash
source .env

TARGET_URL="[対象URL]"
PAGE="[ページ種別]"

# モバイル
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${TARGET_URL}&key=$PAGE_SPEED_INSIGHTS_API_KEY&category=performance&category=seo&category=accessibility&category=best-practices&strategy=mobile" > <出力先>/psi-${PAGE}-mobile.json

# デスクトップ
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${TARGET_URL}&key=$PAGE_SPEED_INSIGHTS_API_KEY&category=performance&category=seo&category=accessibility&category=best-practices&strategy=desktop" > <出力先>/psi-${PAGE}-desktop.json

# スコア比較
echo "=== Mobile ===" && jq '.lighthouseResult.categories | to_entries[] | {(.key): (.value.score * 100)}' <出力先>/psi-${PAGE}-mobile.json
echo "=== Desktop ===" && jq '.lighthouseResult.categories | to_entries[] | {(.key): (.value.score * 100)}' <出力先>/psi-${PAGE}-desktop.json
```

---

## 複数ページの一括取得

```bash
source .env

declare -A PAGES=(
  ["home"]="https://example.com/"
  ["lp"]="https://example.com/lp"
  ["service"]="https://example.com/service"
)

for PAGE in "${!PAGES[@]}"; do
  URL="${PAGES[$PAGE]}"
  echo "Fetching: ${PAGE} (${URL})"
  curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${URL}&key=$PAGE_SPEED_INSIGHTS_API_KEY&category=performance&category=seo&category=accessibility&category=best-practices&strategy=mobile" > "<出力先>/psi-${PAGE}-mobile.json"
  jq '.lighthouseResult.categories | to_entries[] | {(.key): (.value.score * 100)}' "<出力先>/psi-${PAGE}-mobile.json"
  echo "---"
done
```

---

## Core Web Vitals 判定基準

| 指標 | Good | Needs Improvement | Poor |
|------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s – 4.0s | > 4.0s |
| **FID** (First Input Delay) | ≤ 100ms | 100ms – 300ms | > 300ms |
| **INP** (Interaction to Next Paint) | ≤ 200ms | 200ms – 500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |
| **FCP** (First Contentful Paint) | ≤ 1.8s | 1.8s – 3.0s | > 3.0s |
| **TBT** (Total Blocking Time) | ≤ 200ms | 200ms – 600ms | > 600ms |
| **TTFB** (Time to First Byte) | ≤ 800ms | 800ms – 1800ms | > 1800ms |
| **SI** (Speed Index) | ≤ 3.4s | 3.4s – 5.8s | > 5.8s |

- **LCP・INP・CLS** が Google のランキングシグナルとして使用される Core Web Vitals
- **FID** は INP に置き換えられた（2024年3月〜）
- **TBT** は lab データでの INP の代替指標として有用
