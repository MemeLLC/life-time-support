---
name: video-generation
description: AI動画を生成・編集するスキル。テキストから動画生成、画像から動画生成に対応。音声・セリフ・効果音の同期生成も可能。ユーザーが動画生成・AI動画・Veoに言及した場合に使用する。
---

# 動画生成（Veo 3.1）

Google Veo 3.1 APIを使い、ユーザーの要求に応じた高品質な動画を生成する。

## ディレクトリ構成

```
video-generation/
├── SKILL.md                        # 本ファイル（ワークフロー・スクリプト使用法・オプション）
├── references/
│   └── prompt-guide.md             # プロンプト詳細リファレンス（5要素フォーミュラ・カメラワーク辞書・音声演出・テンプレート）
└── scripts/
    ├── text_to_video.py            # テキスト → 動画（基本の生成スクリプト）
    ├── image_to_video.py           # 画像 → 動画（開始フレーム指定）
    ├── keyframes_to_video.py       # 開始+終了画像 → 動画（フレーム補間）
    └── refs_to_video.py            # 参照画像 → 動画（キャラクター・商品の一貫性保持）
```

## Veo 3.1の強み

- **音声・セリフの同期生成**: プロンプトにセリフや効果音の指示を含めると、映像に合った音声が自動生成される
- **高品質な映像**: 最大4K解像度、最大8秒の動画を生成
- **Image-to-Video**: 静止画を動画のスタート地点として指定し、そこから動画を生成できる
- **First & Last Frame**: 開始画像と終了画像を指定し、間を自然に補間する動画を生成できる
- **Ingredients to Video**: 最大3枚の参照画像（人物・物・スタイル）の見た目を保って動画を生成できる
- **ネガティブプロンプト**: 生成してほしくない要素を明示的に除外できる

---

## 前提条件

- プロジェクトルートの `.env` に `GEMINI_API_KEY` が設定されていること（スクリプトが自動読み込み）
- `uv` がインストール済みであること（依存パッケージは `uv run --with` で自動解決される）

APIキーは Google AI Studio（https://aistudio.google.com/apikey）から取得する。

---

## 基本ワークフロー

### 動画を生成する前に

ユーザーから以下の情報を収集する（未提供なら質問する）:

1. **用途**: 何に使う動画か？（SNS投稿、商品紹介、広告、プレゼン等）
2. **シーンの内容**: 何を映すか？ どんな動きがあるか？
3. **セリフ・音声**: セリフや効果音が必要か？ ある場合、具体的な内容は？
4. **アスペクト比**: 横型（16:9）かスマホ縦型（9:16）か？
5. **長さ**: 4秒、6秒、8秒のいずれか？
6. **参照画像**: スタート地点にしたい画像はあるか？

### 推奨ワークフロー: 画像生成 → 確認 → 動画生成

動画生成はコストが高く、やり直しにも時間がかかるため、**まず image-generation スキルで画像を生成し、ユーザーに方向性を確認してから動画を生成する**のが推奨フロー。

用途に応じて3つのパターンを使い分ける:

#### パターンA: 開始フレーム → Image-to-Video（基本）

最も汎用的なパターン。シーンの構図・被写体を事前に固定できる。

1. **image-generation** で開始フレーム画像を生成
2. ユーザーに見せて **「この方向性の動画でよいか？」を確認**
3. OKなら **image_to_video.py** で動画を生成

#### パターンB: 開始 + 終了フレーム → First & Last Frame（カメラ移動・変化表現）

視点の大きな移動、昼→夜、変形などの変化を表現したい場合。

1. **image-generation** で開始フレームと終了フレームの2枚を生成
2. ユーザーに見せて **「この始点と終点の間を補間する動画でよいか？」を確認**
3. OKなら **keyframes_to_video.py** で動画を生成

#### パターンC: 参照画像素材 → Ingredients to Video（キャラクター・商品の一貫性）

特定のキャラクター・商品・スタイルの見た目を保ちたい場合。広告やシリーズ動画で特に有効。

1. **image-generation** で参照画像（人物・商品・背景など）を1〜3枚生成
2. ユーザーに見せて **「これらの素材を使った動画でよいか？」を確認**
3. OKなら **refs_to_video.py** で動画を生成

#### どのパターンを使うか？

| 用途 | パターン |
|------|----------|
| 一般的な動画（風景、商品紹介、SNS） | A: 開始フレーム → Image-to-Video |
| カメラの回り込み、視点変化、タイムラプス | B: 開始 + 終了フレーム → First & Last Frame |
| キャラクターや商品の見た目を統一した複数カット | C: 参照画像素材 → Ingredients to Video |
| 簡易的な動画、テスト生成 | 直接 text-to-video（画像生成を省略） |

**ユーザーが既に参照画像を持っている場合は画像生成をスキップし、該当するスクリプトを直接使う。**

### テキストから動画を生成する（text-to-video）

`scripts/text_to_video.py`（このスキルディレクトリ内）を使用する:

```bash
uv run --with google-genai python3 .agents/skills/video-generation/scripts/text_to_video.py "プロンプト" [出力ファイル名] [オプション...]
```

例:
```bash
# 基本的な動画生成
uv run --with google-genai python3 .agents/skills/video-generation/scripts/text_to_video.py \
  "A golden retriever running through a sunlit meadow in slow motion. Cinematic look."

# 縦型ショート動画
uv run --with google-genai python3 .agents/skills/video-generation/scripts/text_to_video.py \
  "A barista making latte art in a cozy cafe. Close-up shot." \
  cafe_short.mp4 \
  --aspect-ratio 9:16 --duration 6

# セリフ・音声付き動画
uv run --with google-genai python3 .agents/skills/video-generation/scripts/text_to_video.py \
  "A woman standing in front of a whiteboard, speaking to the camera: 'Today we'll learn about solar energy.' The room has soft ambient sounds." \
  presentation.mp4

# ネガティブプロンプト付き
uv run --with google-genai python3 .agents/skills/video-generation/scripts/text_to_video.py \
  "Aerial view of Tokyo at sunset. Cinematic drone footage." \
  tokyo_aerial.mp4 \
  --negative-prompt "text, watermark, blurry, low quality"
```

### 画像から動画を生成する（image-to-video）

静止画をスタート地点にして動画を生成する場合は `scripts/image_to_video.py` を使用する:

```bash
uv run --with google-genai python3 .agents/skills/video-generation/scripts/image_to_video.py "プロンプト" 入力画像パス [出力ファイル名] [オプション...]
```

例:
```bash
# 商品写真から動画を生成
uv run --with google-genai python3 .agents/skills/video-generation/scripts/image_to_video.py \
  "The product slowly rotates on a turntable. Soft studio lighting." \
  product.png product_video.mp4

# 風景写真をアニメーション化
uv run --with google-genai python3 .agents/skills/video-generation/scripts/image_to_video.py \
  "Clouds slowly move across the sky. A gentle breeze rustles the leaves." \
  landscape.jpg landscape_animated.mp4
```

### 開始/終了画像から動画を生成する（First & Last Frame）

開始画像と終了画像を指定し、その間を自然にアニメーションさせる場合は `scripts/keyframes_to_video.py` を使用する。
カメラの大きな移動や視点の変化、変形表現に有効。durationは8秒固定。

```bash
uv run --with google-genai python3 .agents/skills/video-generation/scripts/keyframes_to_video.py "プロンプト" 開始画像パス 終了画像パス [出力ファイル名] [オプション...]
```

例:
```bash
# 歌手の正面→背面へのカメラ回り込み
uv run --with google-genai python3 .agents/skills/video-generation/scripts/keyframes_to_video.py \
  "The camera performs a smooth 180-degree arc shot, starting with the front-facing view of the singer and circling around her." \
  singer_front.png singer_back.png singer_arc.mp4

# 昼→夜のタイムラプス
uv run --with google-genai python3 .agents/skills/video-generation/scripts/keyframes_to_video.py \
  "Time-lapse of a city skyline transitioning from day to night. Lights gradually turn on." \
  city_day.jpg city_night.jpg timelapse.mp4
```

### 参照画像から動画を生成する（Ingredients to Video）

最大3枚の参照画像（人物・物・背景など）の見た目を保ったまま動画を生成する場合は `scripts/refs_to_video.py` を使用する。
キャラクターの一貫性を保った複数ショットの生成に有効。

```bash
uv run --with google-genai python3 .agents/skills/video-generation/scripts/refs_to_video.py "プロンプト" --images 画像1 [画像2] [画像3] [オプション...]
```

例:
```bash
# キャラクター画像を参照して対話シーンを生成
uv run --with google-genai python3 .agents/skills/video-generation/scripts/refs_to_video.py \
  "The detective behind his desk looks up and says in a weary voice, 'Of all the offices in this town, you had to walk into mine.'" \
  --images detective.png office_setting.png \
  --output detective_scene.mp4

# 商品の参照画像を使って広告動画を生成
uv run --with google-genai python3 .agents/skills/video-generation/scripts/refs_to_video.py \
  "A sleek product showcase with soft studio lighting. The headphone rotates slowly on a reflective surface." \
  --images headphone_front.png headphone_side.png \
  --output product_ad.mp4 --aspect-ratio 9:16
```

---

## オプション一覧

| オプション | 値 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `--aspect-ratio` | `16:9`, `9:16` | `16:9` | 横型 or 縦型 |
| `--duration` | `4`, `6`, `8` | `8` | 動画の長さ（秒） |
| `--resolution` | `720p`, `1080p`, `4k` | `720p` | 解像度（1080p/4kは8秒のみ） |
| `--negative-prompt` | テキスト | なし | 除外したい要素（※Ingredients to Videoでは非対応） |
| `--person-generation` | `allow_all` | なし | 人物生成の許可（`allow_adult`は非対応） |
| `--poll-interval` | 秒数 | `10` | ポーリング間隔 |

---

## プロンプト作成ガイド

プロンプトは英語で書くこと。`[Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]` の5要素フォーミュラで構成する。セリフは引用符、効果音は `SFX:`、環境音は `Ambient:` で指定する。カメラワーク辞書・音声演出の詳細・用途別テンプレートは [prompt-guide.md](references/prompt-guide.md) を参照。

---

## 制限事項

- 動画生成は非同期処理のため、生成完了まで数分かかる場合がある
- 1回のリクエストで生成できる動画は最大8秒
- 1080pおよび4K解像度は8秒の動画でのみ使用可能
- 人物生成にはセーフティフィルターが適用される（地域によって制限あり）
- APIにはレート制限がある
- 生成された動画にはSynthIDの電子透かしが埋め込まれる

---

## トラブルシューティング

| 問題 | 対処法 |
|------|--------|
| `GEMINI_API_KEY` が未設定 | プロジェクトルートの `.env` に `GEMINI_API_KEY=your-key` を追加 |
| 生成に時間がかかる | 動画生成は数分かかるのが正常。`--poll-interval` でポーリング間隔を調整可能 |
| セーフティフィルターでブロック | プロンプトを調整する。`--person-generation allow_all` を試す |
| 解像度1080p/4kでエラー | `--duration 8` を指定する（高解像度は8秒のみ対応） |
| 動画が短すぎる/長すぎる | `--duration` で4/6/8秒を明示的に指定する |
| 意図と違う動画が出る | プロンプトを具体的にする。カメラワークや動きを詳細に指示する |

---

## 関連スキル

- **image-generation**: 動画のスタート画像・参照画像を生成する場合に組み合わせて使用
