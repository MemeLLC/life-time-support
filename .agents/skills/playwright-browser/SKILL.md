---
name: playwright-browser
description: >-
  playwright-coreベースのブラウザ自動操作CLIツールを使い、
  Webページのスクレイピング、スクリーンショット撮影、Google検索、複数ステップのブラウザ操作を実行する。
  ユーザーが以下のいずれかに言及した場合に使用する:
  「サイトを開いて」「ページの内容を取得して」「スクリーンショットを撮って」
  「Webサイトをスクレイピング」「Google検索して」「検索結果を取得」
  「競合サイトを見て」「LPを確認して」「広告ライブラリを調べて」
  「ブラウザで操作して」「ページのmeta情報を取得」「サイト構造を調査」。
  各リサーチスキル（market-analysis、competitor-analysis、regulatory-research）と
  組み合わせてリサーチの情報収集に活用できる。
  seo-analysisスキルと組み合わせて実際のページ構造を取得する際にも有用。
---

# Playwright Browser CLI

このスキルの `scripts/browser.mjs` を Bash ツールで実行してWebブラウザ操作を行う。
出力はすべてJSON形式。ユーザーのインストール済みChromeで動作する。

**対象: 認証（ログイン）不要な公開Webページのタスクのみ。**
ログインが必要なサイト（管理画面、会員限定ページ等）には使えない。

## パス解決

このスキルのディレクトリは以下のいずれかのパスで参照できる（すべて同一の実体を指す）:

- `.agents/skills/playwright-browser`
- `.claude/skills/playwright-browser`
- `.codex/skills/playwright-browser`

以下のドキュメントでは `$SKILL_DIR` と表記する。
実行時は上記いずれかの実パスに置き換えること。

初回は依存関係をインストールする:
```bash
npm install --prefix $SKILL_DIR
```

## コマンド一覧

### scrape — ページコンテンツ抽出

```bash
node $SKILL_DIR/scripts/browser.mjs scrape <url> [--selector <css>]
```

タイトル、meta情報（OGP含む）、見出し、リンク、画像、テキストをJSON取得。
`--selector` で特定要素のみ抽出可能。

```bash
# ページ全体
node $SKILL_DIR/scripts/browser.mjs scrape https://example.com

# mainセクションのみ
node $SKILL_DIR/scripts/browser.mjs scrape https://example.com --selector "main"
```

### screenshot — スクリーンショット撮影

```bash
node $SKILL_DIR/scripts/browser.mjs screenshot <url> [--output <path>] [--full-page] [--wait <ms>]
```

デフォルト保存先: `./screenshots/<timestamp>.png`
ページ読み込み後、自動的にネットワークが安定するまで待機してからスクリーンショットを撮影する（SPAや動的サイトでもレンダリング完了後の状態をキャプチャ）。
`--wait` で追加の待機時間を指定可能（アニメーションや遅延ロードが多いサイト向け）。

```bash
# ビューポートのみ
node $SKILL_DIR/scripts/browser.mjs screenshot https://example.com --output ./screenshots/example.png

# ページ全体
node $SKILL_DIR/scripts/browser.mjs screenshot https://example.com --output ./screenshots/example-full.png --full-page

# アニメーション完了まで追加で2秒待機
node $SKILL_DIR/scripts/browser.mjs screenshot https://example.com --output ./screenshots/example.png --wait 2000
```

### search — Google検索

```bash
node $SKILL_DIR/scripts/browser.mjs search <query> [--num <n>] [--lang <code>]
```

タイトル、URL、スニペットを含む検索結果JSON。デフォルト10件、日本語。
Bot検知される場合は `--headful` を付けてCAPTCHAを手動解決する。

```bash
node $SKILL_DIR/scripts/browser.mjs search "マーケティング自動化" --num 5
```

### interact — 複数ステップ操作

```bash
node $SKILL_DIR/scripts/browser.mjs interact <url> --actions '<json_array>'
```

1回のブラウザセッション内で複数アクションを順次実行する。
Google Ads Transparency Center、Google Trends等の動的サイト操作に使う。

```bash
node $SKILL_DIR/scripts/browser.mjs interact "https://adstransparency.google.com/" --actions '[
  {"action": "wait", "time": 2000},
  {"action": "fill", "selector": "input[type=text]", "value": "検索語"},
  {"action": "wait", "time": 2000},
  {"action": "click", "selector": "[role=option]"},
  {"action": "wait", "time": 4000},
  {"action": "screenshot", "path": "./screenshots/result.png"}
]'
```

**アクション一覧:**

| アクション | パラメータ | 用途 |
|-----------|-----------|------|
| `click` | `selector` | 要素クリック |
| `fill` | `selector`, `value` | テキスト入力 |
| `select` | `selector`, `value` | セレクトボックス選択 |
| `wait` | `selector` or `time` | 要素出現待ち or ms待機 |
| `screenshot` | `path`, `fullPage`, `wait`(ms) | スクリーンショット（自動でnetworkidle待機） |
| `scrape` | `selector`（任意） | コンテンツ抽出 |
| `scroll` | `to`(`bottom`/`top`) / `y` / `selector` | スクロール |
| `evaluate` | `expression` | 任意JS実行 |

## 共通オプション

| オプション | デフォルト | 説明 |
|-----------|-----------|------|
| `--headful` | false | ブラウザウィンドウを表示 |
| `--timeout <ms>` | 30000 | タイムアウト |
| `--wait <ms>` | 800 | networkidle後の追加待機時間（screenshotコマンド用） |
| `--user-agent <str>` | Chrome UA | カスタムUser-Agent |

## よくあるワークフロー

### 競合サイト調査

```bash
# 1. サイト構造を取得
node $SKILL_DIR/scripts/browser.mjs scrape https://competitor.com --selector "main"

# 2. フルページスクリーンショット
node $SKILL_DIR/scripts/browser.mjs screenshot https://competitor.com --output ./screenshots/competitor.png --full-page
```

### 検索 → 各ページ取得

```bash
# 1. Google検索
node $SKILL_DIR/scripts/browser.mjs search "ターゲットキーワード" --num 5

# 2. 結果のURLをscrapeで取得（出力JSONからURLを取り出して順次実行）
node $SKILL_DIR/scripts/browser.mjs scrape https://result-url-1.com
node $SKILL_DIR/scripts/browser.mjs scrape https://result-url-2.com
```

### 広告調査（Google Ads Transparency Center）

```bash
node $SKILL_DIR/scripts/browser.mjs interact "https://adstransparency.google.com/" --actions '[
  {"action": "wait", "time": 2000},
  {"action": "fill", "selector": "input[type=text]", "value": "広告主名"},
  {"action": "wait", "time": 2000},
  {"action": "click", "selector": "[role=option]"},
  {"action": "wait", "time": 4000},
  {"action": "screenshot", "path": "./screenshots/ads.png", "fullPage": true}
]'
```

## 注意事項

- Google検索はBot検知される場合がある。エラーが出たら `--headful` を試す
- エラーは `{"error": "メッセージ"}` でstderrに出力、exit code 1
- スクリーンショットは `./screenshots/` に保存するのが慣例
- interactのactionsはJSON文字列としてシングルクォートで囲む
- 出力JSONが大きい場合はselectorで対象を絞る
