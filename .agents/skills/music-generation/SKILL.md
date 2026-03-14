---
name: music-generation
description: AI音楽を生成するスキル。テキストプロンプトからインストゥルメンタル音楽をリアルタイム生成し、WAVファイルとして保存する。ユーザーが音楽生成・AI音楽・BGM作成・Lyriaに言及した場合に使用する。
---

# 音楽生成（Lyria RealTime）

Google Lyria RealTime APIを使い、ユーザーの要求に応じたインストゥルメンタル音楽を生成する。

## ディレクトリ構成

```
music-generation/
├── SKILL.md                        # 本ファイル（ワークフロー・スクリプト使用法・オプション）
├── references/
│   └── prompt-guide.md             # プロンプト詳細リファレンス（ジャンル・楽器・ムード辞書・パラメータチューニング・テンプレート）
└── scripts/
    └── generate_music.py           # テキスト → 音楽（WAV出力）
```

## Lyria RealTimeの強み

- **リアルタイムストリーミング生成**: WebSocketベースの低遅延ストリーミングで音楽を生成
- **ジャンル・楽器・ムードの自由な指定**: 40以上のジャンル、60以上の楽器、豊富なムードディスクリプターに対応
- **重み付きプロンプト**: 複数のプロンプトを重み付けしてブレンドし、独自のサウンドを生成
- **リアルタイムパラメータ制御**: BPM、密度、明るさ、ガイダンスなどを細かく調整
- **ステム分離**: ベース・ドラムのミュート/抽出で用途別の素材を生成
- **ボーカリゼーション**: VOCALIZATIONモードでハミング・コーラス・スキャットなどの声素材を生成

---

## 前提条件

- プロジェクトルートの `.env` に `GEMINI_API_KEY` が設定されていること（スクリプトが自動読み込み）
- `uv` がインストール済みであること（依存パッケージは `uv run --with` で自動解決される）

APIキーは Google AI Studio（https://aistudio.google.com/apikey）から取得する。

---

## 基本ワークフロー

### 音楽を生成する前に

ユーザーから以下の情報を収集する（未提供なら質問する）:

1. **用途**: 何に使う音楽か？（動画BGM、SNS、広告、ゲーム、リラックス等）
2. **ジャンル・雰囲気**: どんなジャンルや雰囲気か？（lo-fi、EDM、ジャズ、シネマティック等）
3. **長さ**: 何秒の音楽が必要か？（デフォルト: 30秒）
4. **テンポ**: BPMの指定はあるか？
5. **楽器**: 特定の楽器を使いたいか？
6. **その他**: ステム分離やボーカリゼーションの必要性

### 音楽を生成する

`scripts/generate_music.py`（このスキルディレクトリ内）を使用する:

```bash
uv run --with google-genai python3 .agents/skills/music-generation/scripts/generate_music.py "プロンプト" [出力ファイル名] [オプション...]
```

例:
```bash
# 基本的な音楽生成（30秒）
uv run --with google-genai python3 .agents/skills/music-generation/scripts/generate_music.py \
  "lo-fi hip hop beats, mellow piano, vinyl crackle, relaxing study music"

# 出力ファイル名とBPMを指定
uv run --with google-genai python3 .agents/skills/music-generation/scripts/generate_music.py \
  "energetic rock, distorted electric guitar, driving drums, powerful" \
  rock_bgm.wav \
  --bpm 140 --duration 60

# 縦型動画BGM（短め）
uv run --with google-genai python3 .agents/skills/music-generation/scripts/generate_music.py \
  "upbeat tropical house, bright synths, steel drums, summer vibes" \
  short_bgm.wav \
  --duration 15

# シネマティックなBGM（高ガイダンス）
uv run --with google-genai python3 .agents/skills/music-generation/scripts/generate_music.py \
  "cinematic orchestral, epic strings, powerful brass, building tension" \
  trailer_music.wav \
  --guidance 5.5 --duration 45

# ボーカリゼーション（コーラス素材）
uv run --with google-genai python3 .agents/skills/music-generation/scripts/generate_music.py \
  "ethereal choir, angelic harmonies, slow and serene" \
  choir.wav \
  --mode VOCALIZATION

# ドラムレスのBGM（ナレーション動画向け）
uv run --with google-genai python3 .agents/skills/music-generation/scripts/generate_music.py \
  "gentle acoustic guitar, soft piano, warm and peaceful" \
  narration_bgm.wav \
  --mute-drums

# リズムセクションのみ（ビートメイキング素材）
uv run --with google-genai python3 .agents/skills/music-generation/scripts/generate_music.py \
  "funky drum pattern, groovy bass line, tight rhythm" \
  rhythm_stem.wav \
  --only-bass-and-drums --bpm 100

# 複数プロンプトのブレンド
uv run --with google-genai python3 .agents/skills/music-generation/scripts/generate_music.py \
  --prompts '[{"text":"smooth jazz, saxophone solo","weight":1.0},{"text":"glitchy electronic beats","weight":0.5}]' \
  jazz_electronic.wav \
  --duration 30

# スケールとシードを指定（再現性のある生成）
uv run --with google-genai python3 .agents/skills/music-generation/scripts/generate_music.py \
  "ambient electronic, soft pads, gentle arpeggios" \
  ambient.wav \
  --scale A_MINOR --seed 42
```

---

## オプション一覧

| オプション | 値 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `--duration` | 秒数 | `30` | 生成する長さ（秒） |
| `--bpm` | `60`〜`200` | モデル自動判定 | テンポ |
| `--guidance` | `0.0`〜`6.0` | `4.0` | プロンプト忠実度（高い=忠実） |
| `--density` | `0.0`〜`1.0` | モデル自動判定 | 音の密度 |
| `--brightness` | `0.0`〜`1.0` | モデル自動判定 | 音の明るさ |
| `--temperature` | `0.0`〜`3.0` | `1.1` | バリエーション |
| `--scale` | スケール名 | 指定なし | スケール（例: `C_MAJOR`, `A_MINOR`） |
| `--mode` | `QUALITY`, `DIVERSITY`, `VOCALIZATION` | `QUALITY` | 生成モード |
| `--mute-bass` | フラグ | `false` | ベースをミュート |
| `--mute-drums` | フラグ | `false` | ドラムをミュート |
| `--only-bass-and-drums` | フラグ | `false` | ベースとドラムのみ出力 |
| `--seed` | `0`〜`2147483647` | ランダム | シード値（再現性） |
| `--sample-rate` | Hz | `48000` | サンプルレート |
| `--prompts` | JSON配列 | なし | 重み付きプロンプト |

---

## プロンプト作成ガイド

プロンプトは英語で書くこと。`[ジャンル] + [楽器] + [ムード/雰囲気]` の組み合わせが基本。複数プロンプトの重み付けでブレンドも可能。対応ジャンル・楽器・ムードの一覧、パラメータチューニングの詳細、用途別テンプレートは [prompt-guide.md](references/prompt-guide.md) を参照。

---

## 制限事項

- **インストゥルメンタルのみ**: 歌詞付きの歌は生成不可（VOCALIZATIONモードはハミング・スキャット等のみ）
- **セーフティフィルター**: プロンプトにフィルターが適用され、不適切なプロンプトは無視される
- **電子透かし**: 出力音声にはSynthIDの電子透かしが常に埋め込まれる
- **実験的モデル**: `lyria-realtime-exp` は実験的モデルのため仕様変更の可能性がある
- **WebSocket接続**: リアルタイムストリーミングのためネットワーク接続が必要

---

## トラブルシューティング

| 問題 | 対処法 |
|------|--------|
| `GEMINI_API_KEY` が未設定 | プロジェクトルートの `.env` に `GEMINI_API_KEY=your-key` を追加 |
| `google-genai` が見つからない | `uv` がインストールされているか確認する（スクリプトは `uv run --with` で自動解決） |
| WebSocket接続エラー | ネットワーク接続を確認。APIキーのv1alphaアクセス権限を確認 |
| 音声データが空 | プロンプトがセーフティフィルターでブロックされた可能性。プロンプトを調整する |
| BPM/スケール変更が反映されない | BPMとスケールの変更にはコンテキストリセットが必要（スクリプトは初回設定のため影響なし） |
| 生成音質が低い | `--mode QUALITY` を明示指定。`--guidance` を 4.0〜5.0 に上げる |
| 意図と違う音楽が出る | プロンプトを具体的にする。ジャンル + 楽器 + ムードを明示する |

---

## 関連スキル

- **video-generation**: 生成した音楽を動画のBGMとして使用する場合に組み合わせて使用
- **image-generation**: 音楽に合わせたカバーアート・サムネイルを生成する場合に組み合わせて使用
