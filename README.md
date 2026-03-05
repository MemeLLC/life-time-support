# Agent System

マーケティング、開発、デザイン、クリエイティブなど、ビジネスの全モジュールを支援するAIエージェントシステム。Claude Code と Codex の両方で動作する。

## セットアップ

### 1. 必要なツール

**AIコーディングエージェント**（いずれか、または両方）:

- [Claude Code](https://code.claude.com/docs/en/setup) — `curl -fsSL https://claude.ai/install.sh | bash`
- [Codex](https://github.com/openai/codex) — `npm install -g @openai/codex`

**ランタイム**:

- [Node.js](https://nodejs.org/) v20+（npm を含む）
- [Python](https://www.python.org/) 3.9+

**Python パッケージ**（画像・動画生成に必要）:

```bash
pip install google-genai
```

### 2. APIキーの設定

プロジェクトルートに `.env` を作成:

```
GEMINI_API_KEY=your-gemini-api-key
PAGE_SPEED_INSIGHTS_API_KEY=your-pagespeed-api-key
```

APIキーの取得先:
- Gemini: https://aistudio.google.com/apikey
- PageSpeed Insights: https://developers.google.com/speed/docs/insights/v5/get-started

### 3. macOS 通知の許可（Claude Code）

Claude Code はタスク完了時や権限要求時に macOS 通知を送る設定になっている。初回は通知の許可が必要。

1. **Script Editor.app** を開く
2. 以下を貼り付けて実行（▶ ボタン）:

```applescript
display notification "タスクが完了しました" with title "Claude Code" sound name "Glass"
```

3. 通知の許可ダイアログが表示されたら「許可」を選択

### 4. 使い始める

```bash
# Claude Code で開く
claude

# または Codex で開く
codex
```

`/スキル名` でスキルを呼び出して使う（例: `/copywriting`、`/seo-analysis`）。

## プロジェクト構造

```
{project-root}/
├── .agents/                    # エージェントシステム本体（Single Source of Truth）
│   ├── INSTRUCTIONS.md         # 共通指示書
│   └── skills/                 # スキル定義
│
├── .claude/                    # Claude Code 設定
│   ├── CLAUDE.md               # → .agents/INSTRUCTIONS.md（シンボリックリンク）
│   ├── settings.json
│   └── skills/                 # → .agents/skills/（シンボリックリンク）
│
├── .codex/                     # Codex 設定
│   ├── AGENTS.md               # → .agents/INSTRUCTIONS.md（シンボリックリンク）
│   ├── config.toml
│   └── skills/                 # → .agents/skills/（シンボリックリンク）
│
├── TODO.md                     # タスク管理
├── contexts/                   # プロジェクトに関する情報
│   ├── BRIEF.md                # プロジェクトブリーフ
│   ├── data/                   # [GitHub Actions専用] 定量データの自動取得
│   ├── profile/                # プロジェクト情報
│   ├── research/               # リサーチ・分析の成果物
│   ├── playbooks/              # 施策設計（仕様書・クリエイティブ成果物）
│   └── meetings/               # 会議記録
│
├── assets/                     # ブランド素材（ロゴ、画像、動画など）
├── dev/                        # プログラミング成果物（LP、Webアプリなど）
├── tmp/                        # 一時ファイル
├── scripts/                    # ローカル開発者用スクリプト
└── .env                        # APIキー（.gitignore で管理）
```

## GitHub Actions（定量データ自動取得）

`contexts/data/` 配下に、各プラットフォームのデータを毎日自動取得してCSVで蓄積する。

### 対応プラットフォーム

| ワークフロー | データソース | フラグ変数 |
|---|---|---|
| `fetch-ga4.yml` | Google Analytics 4 | `ENABLE_GA4` |
| `fetch-gsc.yml` | Google Search Console | `ENABLE_GSC` |

プロジェクトに応じてワークフローを追加できる（例: Meta Ads、Google Ads 等）。

### セットアップ手順

#### 1. サービスアカウントの招待

サービスアカウントのメールアドレスを各プラットフォームに招待する:

- **Google Analytics**: 管理 → プロパティ → プロパティのアクセス管理 →「閲覧者」として追加
- **Google Search Console**: 設定 → ユーザーと権限 →「制限付き」として追加

#### 2. GitHub Secrets の設定

| Secret 名 | 説明 | 必須 |
|---|---|---|
| `GCP_CLIENT_EMAIL` | サービスアカウントのメールアドレス | 全共通 |
| `GCP_PRIVATE_KEY` | サービスアカウントの秘密鍵（`-----BEGIN PRIVATE KEY-----` から `-----END PRIVATE KEY-----\n` まで） | 全共通 |
| `GA4_PROPERTY_ID` | GA4のプロパティID（数字のみ） | GA4 |
| `GSC_SITE_URL` | Search ConsoleのサイトURL（ドメインプロパティは `sc-domain:example.com`） | GSC |

#### 3. GitHub Variables の設定

使用するプラットフォームのフラグを `true` に設定:

```bash
gh variable set ENABLE_GA4 --body "true"
gh variable set ENABLE_GSC --body "true"
```

#### 一括設定

`.env` に値を設定済みであれば、以下のスクリプトで一括設定できる:

```bash
./scripts/setup-secrets.sh
```

### 出力先

```
contexts/data/
├── google-analytics/
│   ├── pages-YYYY-MM.csv            # ページ別アクセスデータ
│   ├── traffic-sources-YYYY-MM.csv  # 流入元データ
│   ├── events-YYYY-MM.csv           # イベントデータ
│   ├── devices-YYYY-MM.csv          # デバイス・ブラウザデータ
│   ├── demographics-YYYY-MM.csv     # 地域データ
│   └── custom-events-YYYY-MM.csv    # カスタムデータ（自動検出時のみ）
└── google-search-console/
    ├── queries-YYYY-MM.csv           # 検索クエリ × ページ × 国 × デバイス
    └── search-appearance-YYYY-MM.csv # 検索での見え方
```

## テンプレート同期

テンプレート側でスキルや設定が更新された場合、プロジェクト側で以下を実行して反映する:

```bash
./scripts/sync-template.sh
```

`.agents/`、`.claude/`、`.codex/`、`.gitignore` が上書き同期される。`contexts/` や `dev/` など、プロジェクト固有のデータには影響しない。

## Single Source of Truth 設計

- `.agents/` にスキル定義と指示書の実体を集約
- `.claude/` と `.codex/` はシンボリックリンクで `.agents/` を参照
- 変更は `.agents/` に加えるだけで Claude Code・Codex の両方に反映
