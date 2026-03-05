---
name: pdf-doc
version: 1.0.0
description: >
  React + Tailwind で構造化されたPDF文書（テキスト選択・リンク可能）を生成するスキル。
  Playwright の page.pdf() を使い、ネイティブPDFとして書き出す。
  ユーザーが以下のいずれかに言及した場合に使用する：
  「請求書を作って」「見積書を作成」「契約書」「納品書」「PDF文書」
  「レポートをPDFで」「文書をPDFに」「領収書」「注文書」「PDF書き出し」。
---

# PDF文書作成

React + Vite + Tailwind CSS でA4文書を作成し、Playwright の `page.pdf()` で構造化PDF（テキスト選択・コピー・リンク可能）として書き出す。各ページは独立した React コンポーネントとして実装する。

全ての作業はこのスキル内の `workspace/` ディレクトリで行う。プロジェクトのルートディレクトリを汚さない。

## ディレクトリ構造

```
pdf-doc/                            # このスキルのディレクトリ
├── SKILL.md
├── scripts/                        # テンプレートファイル（変更しない）
│   └── templates/                  # 文書テンプレート（Git管理）
│       ├── invoice/                # 請求書テンプレート
│       │   ├── Page01.tsx
│       │   ├── index.ts
│       │   └── logo.svg
│       ├── quotation/              # 見積書テンプレート
│       │   ├── Page01.tsx
│       │   ├── index.ts
│       │   └── logo.svg
│       └── contract/               # 契約書テンプレート
│           ├── Page01.tsx
│           ├── Page02.tsx
│           ├── index.ts
│           └── logo.svg
└── workspace/                      # 作業ディレクトリ（.gitignore済み）
    ├── src/
    │   ├── components/
    │   │   └── Page.tsx            # A4ページラッパー（794x1123px）
    │   ├── pages/                  # ★ ここにページを作成する
    │   │   ├── index.ts
    │   │   └── Page01.tsx
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    ├── scripts/
    │   └── export-pdf.ts
    ├── out/                        # PDF出力先
    ├── package.json
    └── vite.config.ts
```

## ワークフロー

### 0. ワークフロー全体像

1. **要件の確認** — どのような文書を作るかユーザーと確認する。目的・内容・フォーマットなど。指示が明確であればスキップ可
2. **情報の収集** — 関連ファイルの読み込みや Web 検索で素材を集める。既に十分な情報があればスキップ可
3. **セットアップ** — `workspace/` の初期構築（初回のみ）
4. **ページの作成** — React コンポーネントとしてページを実装する
5. **プレビュー確認** — ブラウザでプレビューし、フィードバックを受けて修正する
6. **PDF エクスポート** — 最終版を PDF に書き出し、ユーザーが指定した場所にコピーする

---

### 1. セットアップ

`workspace/` が既にセットアップ済みなら（`workspace/node_modules` が存在すれば）このステップはスキップする。

`workspace/` が存在しない場合、スキルの `scripts/` からコピーして構築する:

```bash
SKILL_DIR="<このスキルのディレクトリパス>"
WS="$SKILL_DIR/workspace"

mkdir -p "$WS/src/components" "$WS/src/pages" "$WS/scripts" "$WS/out"

# テンプレートファイルをコピー
cp "$SKILL_DIR/scripts/package.json"        "$WS/package.json"
cp "$SKILL_DIR/scripts/index.html"          "$WS/index.html"
cp "$SKILL_DIR/scripts/vite.config.ts"      "$WS/vite.config.ts"
cp "$SKILL_DIR/scripts/tsconfig.json"       "$WS/tsconfig.json"
cp "$SKILL_DIR/scripts/tsconfig.app.json"   "$WS/tsconfig.app.json"
cp "$SKILL_DIR/scripts/tsconfig.node.json"  "$WS/tsconfig.node.json"
cp "$SKILL_DIR/scripts/main.tsx"            "$WS/src/main.tsx"
cp "$SKILL_DIR/scripts/index.css"           "$WS/src/index.css"
cp "$SKILL_DIR/scripts/App.tsx"             "$WS/src/App.tsx"
cp "$SKILL_DIR/scripts/Page.tsx"            "$WS/src/components/Page.tsx"
cp "$SKILL_DIR/scripts/export-pdf.ts"       "$WS/scripts/export-pdf.ts"

cd "$WS" && npm install
```

### 2. テンプレートの適用（テンプレートがある場合）

`scripts/templates/` に文書テンプレートがある場合、ページファイルを workspace にコピーして使う:

```bash
SKILL_DIR="<このスキルのディレクトリパス>"
cp "$SKILL_DIR/scripts/templates/invoice/"*.{tsx,ts} "$SKILL_DIR/workspace/src/pages/"
```

利用可能なテンプレート:

| テンプレート | パス | 説明 |
|-------------|------|------|
| **請求書** | `templates/invoice/` | 合同会社Meme の請求書。可変フィールド（請求先・明細・日付等）をファイル上部で編集して使う |
| **見積書** | `templates/quotation/` | 合同会社Meme の見積書。件名・有効期限・明細等をファイル上部で編集して使う |
| **契約書** | `templates/contract/` | 業務委託契約書（2ページ）。甲乙情報・条項・署名欄をファイル上部で編集して使う |

コピー後、`Page01.tsx` 上部の可変フィールドを編集するだけで文書が完成する。

### 3. ページの新規作成（テンプレートがない場合）

各ページは `workspace/src/pages/` に独立したコンポーネントファイルとして作成する。

```tsx
// workspace/src/pages/Page01.tsx
import { Page } from '../components/Page'

export function Page01() {
  return (
    <Page>
      <div className="p-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">請求書</h1>
        <p className="text-base text-gray-600">内容をここに記述</p>
      </div>
    </Page>
  )
}
```

作成したページは `workspace/src/pages/index.ts` の配列に追加する:

```ts
import type { ComponentType } from 'react'
import { Page01 } from './Page01'

export const pages: ComponentType[] = [Page01]
```

#### Page コンポーネントの props

| prop | 型 | デフォルト | 説明 |
|------|----|-----------|------|
| `children` | `ReactNode` | — | ページの中身 |
| `className` | `string` | `""` | 追加の Tailwind クラス |

#### A4サイズについて

- **ピクセルサイズ**: 794 x 1123 px（96dpi 相当の A4）
- **印刷サイズ**: 210 x 297 mm
- レイアウトはこのサイズに収まるように設計する
- `overflow-hidden` が設定されているため、はみ出した内容は切り取られる

### 4. プレビュー

```bash
cd <SKILL_DIR>/workspace && npm run dev
```

ブラウザで開くと、全ページが縦に並んで表示される。ウィンドウサイズに応じて自動的にスケールされる。

### 5. PDF 書き出し

```bash
cd <SKILL_DIR>/workspace && npm run export
```

`workspace/out/document.pdf` に出力される。

特徴:
- テキスト選択・コピーが可能
- リンクがクリック可能
- 印刷品質のベクターPDF

ユーザーが指定した場所に PDF をコピーする:
```bash
cp <SKILL_DIR>/workspace/out/document.pdf <ユーザー指定のパス>
```

### 6. 新しい文書を作る場合

前回の `workspace/src/pages/` の中身をクリアして新しいページを作成する。workspace の基盤ファイル（Page.tsx, App.tsx, node_modules 等）はそのまま再利用する。
