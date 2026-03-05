---
name: slide-deck
version: 1.0.0
description: >
  React + Tailwind でプレゼン資料（スライドデッキ）を作成し、Playwright + pdf-lib で PDF に書き出すスキル。
  ユーザーが以下のいずれかに言及した場合に使用する：
  「資料を作りたい」「スライドを作って」「プレゼン資料」「PDF資料」「提案書を作りたい」
  「報告書をスライドで」「デッキを作って」「発表資料」「ピッチデッキ」
  「スライドを追加して」「スライドを修正して」「資料をPDFで書き出して」。
  copywritingスキルやimage-generationスキルと組み合わせて使うことも有効。
---

# スライドデッキ作成

React + Vite + Tailwind CSS でスライドを作成し、Playwright でスクリーンショットを撮り、pdf-lib で PDF にまとめる。各スライドは独立した React コンポーネントなので、recharts（チャート）、react-icons（アイコン）、qrcode.react（QRコード）など任意のライブラリが使える。

全ての作業はこのスキル内の `workspace/` ディレクトリで行う。プロジェクトのルートディレクトリを汚さない。

## ディレクトリ構造

```
slide-deck/                         # このスキルのディレクトリ
├── SKILL.md
├── scripts/                        # テンプレートファイル（変更しない）
│   └── assets/
│       └── logo.svg               # 自社ロゴ
└── workspace/                      # 作業ディレクトリ（.gitignore済み）
    ├── src/
    │   ├── assets/
    │   │   └── logo.svg           # 自社ロゴ（セットアップ時にコピー）
    │   ├── components/
    │   │   └── Slide.tsx           # スライド外枠テンプレート（1280x720）
    │   ├── slides/                 # ★ ここにスライドを作成する
    │   │   ├── index.ts
    │   │   ├── Slide1.tsx
    │   │   └── ...
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    ├── scripts/
    │   └── export-slides.ts
    ├── out/slides/                  # 書き出し先
    ├── package.json
    └── vite.config.ts
```

## ワークフロー

### 0. ワークフロー全体像

スライド作成は以下の流れで進める。各ステップは状況に応じてスキップ可能。

1. **要件の確認** — どのような資料を作るかユーザーと確認する。目的・対象者・ボリューム感など。指示が明確であればスキップ可
2. **情報の収集** — 関連ファイルの読み込みや Web 検索で素材を集める。既に十分な情報があればスキップ可
3. **構成の確認** — スライドの構成をユーザーに提示して確認を取る。全体のストーリー展開と、各スライドで何を伝えるかを明示する
4. **スタイルの確認** — 色彩テーマ・トーンをユーザーに確認する。特に要望がなければ自己判断で進める
5. **セットアップ** — `workspace/` の初期構築（初回のみ）
6. **スライドの作成** — React コンポーネントとしてスライドを実装する
7. **プレビュー確認** — 書き出した PNG をユーザーに見せ、フィードバックを受けて修正する
8. **PDF エクスポート** — 最終版を PDF に書き出し、ユーザーが指定した場所にコピーする

---

### 1. セットアップ

`workspace/` が既にセットアップ済みなら（`workspace/node_modules` が存在すれば）このステップはスキップする。

`workspace/` が存在しない場合、スキルの `scripts/` からコピーして構築する:

```bash
SKILL_DIR="<このスキルのディレクトリパス>"
WS="$SKILL_DIR/workspace"

mkdir -p "$WS/src/components" "$WS/src/slides" "$WS/src/assets" "$WS/scripts"

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
cp "$SKILL_DIR/scripts/Slide.tsx"           "$WS/src/components/Slide.tsx"
cp "$SKILL_DIR/scripts/export-slides.ts"    "$WS/scripts/export-slides.ts"
cp "$SKILL_DIR/scripts/assets/logo.svg"    "$WS/src/assets/logo.svg"

cd "$WS" && npm install
```

### 2. スライドの作成

各スライドは `workspace/src/slides/` に独立したコンポーネントファイルとして作成する。

```tsx
// workspace/src/slides/Slide1.tsx
import { Slide } from '../components/Slide'

export function Slide1() {
  return (
    <Slide>
      <div className="flex flex-col items-center justify-center h-full p-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-8">タイトル</h1>
        <p className="text-2xl text-gray-600">サブタイトル</p>
      </div>
    </Slide>
  )
}
```

作成したスライドは `workspace/src/slides/index.ts` の配列に追加する:

```ts
import type { ComponentType } from 'react'
import { Slide1 } from './Slide1'
import { Slide2 } from './Slide2'

export const slides: ComponentType[] = [Slide1, Slide2]
```

#### Slide コンポーネントの props

| prop | 型 | デフォルト | 説明 |
|------|----|-----------|------|
| `children` | `ReactNode` | — | スライドの中身 |
| `bg` | `string` | `"bg-white"` | Tailwind の背景クラス |
| `className` | `string` | `""` | 追加の Tailwind クラス |

#### 利用可能なライブラリ

- **recharts** — 棒グラフ、折れ線グラフ、円グラフなど。日本語テキスト対応。
- **react-icons** — `react-icons/fi`（Feather）、`react-icons/hi`（Heroicons）など多数のアイコンセット。
- **qrcode.react** — `<QRCodeSVG value="https://..." size={128} />` でQRコード生成。

#### 自社ロゴの使用

`src/assets/logo.svg` に自社ロゴが配置されている。スライド内で以下のように使う:

```tsx
import logoSvg from '../assets/logo.svg'

// 使用例
<img src={logoSvg} alt="Logo" className="h-8" />
```

### 3. プレビュー

```bash
cd <SKILL_DIR>/workspace && npm run dev
```

ブラウザで開くと、前へ/次へボタンでスライドを切り替えできる。ウィンドウサイズに応じて自動的にスケールされる。

### 4. PDF 書き出し

```bash
cd <SKILL_DIR>/workspace && npm run export
```

`workspace/out/slides/` に以下が出力される:
- `slide-01.png`, `slide-02.png`, ... — 個別 PNG（2x解像度）
- `slides.pdf` — 全スライドを1つにまとめた PDF

ユーザーが指定した場所に PDF をコピーする:
```bash
cp <SKILL_DIR>/workspace/out/slides/slides.pdf <ユーザー指定のパス>
```

解像度を変更したい場合: `SCALE=3 npm run export`

### 5. 新しい資料を作る場合

前回の `workspace/src/slides/` の中身をクリアして新しいスライドを作成する。workspace の基盤ファイル（Slide.tsx, App.tsx, node_modules 等）はそのまま再利用する。

## デザインガイドライン

スライドは 1280x720px（16:9）。デザインの詳細は `references/design-guide.md` を参照すること。

要点:
- **余白**: 各辺に最低10%のマージン。`p-16` 以上を基本に
- **フォントサイズ**: タイトル `text-4xl`〜`text-6xl`、本文 `text-xl`〜`text-2xl`、1スライド3種類以内
- **色数**: 3-4色に制限（ベース70% / メイン25% / アクセント5%）。本文は `gray-800`〜`gray-900`
- **1スライド1メッセージ**: テキスト量は100-150文字、箇条書きは6項目以内
- **視覚的階層**: サイズ・太さ・色のコントラストで情報の重要度を表現
- **リッチデザイン**: テキストだけのスライドは作らない。全スライドにビジュアル要素（アイコン、カード、チャート、図解、ヒーロー数字など）を入れる。レイアウトパターンを混ぜてリズムを作る。詳細は `references/design-guide.md` のセクション6を参照
