# Veo 3.1 プロンプトガイド（詳細リファレンス）

プロンプトは英語で書くこと。このガイドの説明は日本語だが、実際のプロンプトはすべて英語で記述する。

---

## 目次

1. [5要素フォーミュラ](#5要素フォーミュラ)
2. [カメラワーク辞書](#カメラワーク辞書)
3. [音声・セリフの演出](#音声セリフの演出)
4. [ネガティブプロンプト](#ネガティブプロンプト)
5. [タイムスタンプ・プロンプティング](#タイムスタンププロンプティング)
6. [高度なワークフロー](#高度なワークフロー)
7. [段階的プロンプト改善](#段階的プロンプト改善)
8. [用途別プロンプトテンプレート](#用途別プロンプトテンプレート)

---

## 5要素フォーミュラ

高品質な動画を生成するための基本構造。5つの要素を組み合わせてプロンプトを構築する。

```
[Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]
```

| 要素 | 説明 | 例 |
|------|------|-----|
| **Cinematography** | カメラワーク・構図 | `Medium shot`, `Crane shot`, `Slow pan` |
| **Subject** | 主役・被写体 | `a tired corporate worker`, `a golden retriever` |
| **Action** | 動き・行動 | `rubbing his temples`, `running through a meadow` |
| **Context** | 環境・背景 | `in a cluttered office late at night`, `on a sunlit beach` |
| **Style & Ambiance** | 雰囲気・ライティング・スタイル | `Retro aesthetic, shot on 1980s color film, slightly grainy` |

### フォーミュラ適用例

```
Medium shot, a tired corporate worker, rubbing his temples in exhaustion,
in front of a bulky 1980s computer in a cluttered office late at night.
The scene is lit by the harsh fluorescent overhead lights and the green
glow of the monochrome monitor. Retro aesthetic, shot as if on 1980s
color film, slightly grainy.
```

---

## カメラワーク辞書

### カメラムーブメント

| 用語 | 効果 | 使いどころ |
|------|------|-----------|
| `Dolly shot` | カメラが被写体に向かって/離れて移動 | 親密さや緊張感を演出 |
| `Tracking shot` | 被写体を追いかけるように横移動 | 動きのあるシーン |
| `Crane shot` | カメラが上下に大きく移動 | スケール感・壮大さの演出 |
| `Aerial view` / `Drone shot` | 上空からの俯瞰 | 風景・ロケーション全体の紹介 |
| `Slow pan` | ゆっくりと水平に回転 | 風景のゆったりした紹介 |
| `POV shot` | 一人称視点 | 没入感・臨場感 |
| `Static camera` | カメラ固定 | 対話シーン・安定感 |
| `Handheld` | 手持ちカメラ風の揺れ | ドキュメンタリー・臨場感 |

### 構図・ショットサイズ

| 用語 | 説明 |
|------|------|
| `Wide shot` / `Establishing shot` | 全景。環境全体を見せる |
| `Medium shot` | 腰から上。会話シーンの基本 |
| `Close-up` | 顔のアップ。表情・感情の強調 |
| `Extreme close-up` | 目や手など細部のアップ |
| `Low angle` | 下から見上げる。力強さ・威圧感 |
| `High angle` | 上から見下ろす。脆弱さ・孤立感 |
| `Two-shot` | 2人を同時に映す。対話シーン |
| `Over-the-shoulder` | 肩越しのショット。対話の臨場感 |
| `Top-down shot` | 真上からの俯瞰。作業・料理シーン |

### レンズ・フォーカス

| 用語 | 効果 |
|------|------|
| `Shallow depth of field` | 背景ボケ。被写体を際立たせる |
| `Deep focus` | 全体にピントが合う。環境の詳細を見せる |
| `Wide-angle lens` | 広い画角。空間の広がり |
| `Macro lens` | 極小の被写体を大きく映す |
| `Soft focus` | 柔らかいフォーカス。夢幻的な雰囲気 |
| `Lens flare` | レンズへの光の反射。ドラマチック |

### ライティング

| 用語 | 雰囲気 |
|------|--------|
| `Golden hour` | 日の出/日没の暖かい光 |
| `Blue hour` | 日没直後の青みがかった光 |
| `Natural lighting` | 自然光。リアルな雰囲気 |
| `Dramatic spotlight` | スポットライト。舞台的 |
| `Neon glow` | ネオンの色彩。サイバーパンク |
| `Harsh fluorescent` | 蛍光灯。オフィス・病院 |
| `Dappled sunlight` | 木漏れ日 |
| `Backlit` / `Silhouette` | 逆光。ドラマチック |
| `Warm tones` | 暖色系。親密さ・安心感 |
| `Cool blue tones` | 寒色系。孤独・緊張 |

---

## 音声・セリフの演出

Veo 3.1はプロンプトに基づいて映像と同期した音声を自動生成できる。3種類の音声要素を組み合わせる。

### セリフ（Dialogue）

引用符で囲んでセリフを指定する。話者と話し方も指定できる。

```
A woman says, "We have to leave now."
The detective looks up and says in a weary voice, "Of all the offices in this town, you had to walk into mine."
She replies with a slight smile, "You were highly recommended."
```

**ポイント**:
- セリフは必ず引用符 `" "` で囲む
- 話者の感情・声のトーンを添える（`in a weary voice`, `whispered`, `voice tight with fear`）
- 複数人の会話も可能

### 効果音（SFX）

効果音を明示的に記述する。`SFX:` プレフィックスを使うと明確になる。

```
SFX: thunder cracks in the distance
SFX: glass shattering on the floor
Engine roaring loudly. Tires screeching on wet pavement.
The rustle of dense leaves, distant exotic bird calls.
```

### 環境音（Ambient Noise）

背景の雰囲気を音で演出する。

```
Ambient noise: the quiet hum of a starship bridge
Ambient noise: the distant chatter of a busy café
Upbeat background music plays softly.
A swelling, gentle orchestral score begins to play.
```

### 音声演出の完全な例

```
Misty Pacific Northwest forest, two exhausted hikers discover fresh claw marks
on a tree. The man turns to the woman and says, "That's no ordinary bear."
The woman replies, voice tight with fear, "Then what is it?"
SFX: rough bark scraping, snapping twigs. Ambient: a lone bird chirps in the
distance, wind through pine needles.
```

---

## ネガティブプロンプト

### 基本ルール: 命令形ではなく名詞・形容詞で書く

ネガティブプロンプトは「〜するな」ではなく、除外したい要素を名詞で列挙する。

| NG | OK |
|----|----|
| `Don't include walls` | `walls, urban structures` |
| `No blurry images` | `blurry, out of focus` |
| `Remove all text` | `text, watermark, subtitle` |

### 推奨ネガティブプロンプト

品質を上げるための汎用的なネガティブプロンプト:

```
blurry, low quality, distorted faces, text overlay, watermark, shaky camera, artifacts
```

特定用途向け:
- **リアル系**: `cartoon, anime, 3D render, CGI look, oversaturated`
- **アニメ系**: `photorealistic, live action, natural skin texture`
- **商品系**: `people, hands, text, logo, cluttered background`

---

## タイムスタンプ・プロンプティング

8秒の動画内で複数ショットを時間指定して配置できる。1つの生成で複数カットの映像を作れる強力なテクニック。

### 構文

```
[00:00-00:02] ショット1の説明
[00:02-00:04] ショット2の説明
[00:04-00:06] ショット3の説明
[00:06-00:08] ショット4の説明
```

### 例: 探検家シーン

```
[00:00-00:02] Medium shot from behind a young female explorer with a leather
satchel and messy brown hair in a ponytail, as she pushes aside a large jungle
vine to reveal a hidden path.
[00:02-00:04] Reverse shot of the explorer's freckled face, her expression filled
with awe as she gazes upon ancient, moss-covered ruins in the background.
SFX: The rustle of dense leaves, distant exotic bird calls.
[00:04-00:06] Tracking shot following the explorer as she steps into the clearing
and runs her hand over the intricate carvings on a crumbling stone wall.
Emotion: Wonder and reverence.
[00:06-00:08] Wide, high-angle crane shot, revealing the lone explorer standing
small in the center of the vast, forgotten temple complex, half-swallowed by
the jungle. SFX: A swelling, gentle orchestral score begins to play.
```

### ポイント

- 各セグメントごとにカメラワーク・構図を変えることで映像にリズムが生まれる
- SFXや音声も各セグメントに配置できる
- キャラクターの外見の詳細は最初のセグメントで記述し、後続で参照させる

---

## 高度なワークフロー

### ワークフロー1: First and Last Frame（フレーム補間）

開始画像と終了画像を指定し、その間を自然にアニメーションさせるテクニック。カメラの大きな移動や変形表現に有効。

1. **image-generation** スキルで開始画像を生成
2. **image-generation** スキルで終了画像を生成
3. Veo の First and Last Frame 機能で2枚をつなぐ

プロンプト例:
```
The camera performs a smooth 180-degree arc shot, starting with the
front-facing view of the singer and circling around her to seamlessly
end on the POV shot from behind her on stage. The singer sings "when
you look me in the eyes, I can see a million stars."
```

### ワークフロー2: Ingredients to Video（キャラクター一貫性）

参照画像を「材料」として提供し、一貫したキャラクター・スタイルで複数ショットを生成するテクニック。

1. キャラクターや環境の参照画像を用意
2. プロンプトで参照画像を言及しつつシーンを記述

プロンプト例:
```
Using the provided images for the detective, the woman, and the office
setting, create a medium shot of the detective behind his desk. He looks
up at the woman and says in a weary voice, "Of all the offices in this
town, you had to walk into mine."
```

### ワークフロー3: Image-to-Videoのベストプラクティス

- 開始フレームとして最もイメージに近い画像を選ぶ
- プロンプトでは画像の内容を繰り返さず、**動き・変化**を記述する
- 顔を強調したい場合は `portrait` を含める

---

## 段階的プロンプト改善

1回で完璧なプロンプトを書こうとせず、段階的に詳細を追加して改善する。

### ステップ1: 基本（被写体 + 動作）
```
A woman walking on a beach.
```

### ステップ2: 具体化（表情・動作の詳細）
```
A woman walking along a beach, content and relaxed, looking toward the
horizon at sunset.
```

### ステップ3: カメラワーク追加
```
Tracking shot, a woman walking along a beach, content and relaxed,
looking toward the horizon at sunset.
```

### ステップ4: 雰囲気・スタイル追加
```
Tracking shot, a woman walking along a beach, content and relaxed,
looking toward the horizon at sunset. Warm golden light, gentle waves
lapping at her feet, shallow depth of field. Cinematic, shot on 35mm
film with slight grain.
```

### ステップ5: 音声 + ネガティブプロンプト追加
```
Tracking shot, a woman walking along a beach, content and relaxed,
looking toward the horizon at sunset. Warm golden light, gentle waves
lapping at her feet, shallow depth of field. Cinematic, shot on 35mm
film with slight grain. Ambient: gentle waves, distant seagulls, soft
wind.
```
+ `--negative-prompt "text, watermark, blurry, shaky camera"`

---

## 用途別プロンプトテンプレート

### 商品紹介動画

```
[Cinematography]: Slow dolly shot circling around the product
[Subject]: [商品名/種類]
[Context]: Clean white studio with soft gradient lighting
[Style]: Hyper-realistic, product photography aesthetic, shallow depth of field
[Audio]: Ambient: subtle, elegant electronic music
```

例:
```
Slow dolly shot circling around a sleek matte-black wireless headphone
on a reflective surface. Clean white studio with soft gradient lighting
from above. Hyper-realistic, product photography aesthetic, shallow
depth of field highlighting the premium materials. Ambient: subtle,
elegant electronic music.
```

### SNSショート動画（9:16）

```
[Cinematography]: Dynamic handheld or POV shot
[Subject]: [被写体]
[Action]: Energetic, attention-grabbing movement
[Style]: Vibrant colors, fast-paced, trending aesthetic
```

### シネマティック風景

```
[Cinematography]: Aerial drone shot / crane shot
[Subject]: [風景の種類]
[Context]: Time of day, weather, season
[Style]: Cinematic, epic scale, natural color grading
[Audio]: Ambient soundscape + orchestral music
```

例:
```
Aerial drone shot following a winding river through a dense autumn
forest. The trees are ablaze with red, orange, and gold leaves.
Morning mist rises from the water surface. Cinematic, epic scale,
natural color grading. Ambient: flowing water, rustling leaves.
A gentle orchestral score swells.
```

### 対話シーン

```
[Cinematography]: Medium shot / two-shot / over-the-shoulder
[Subject]: Characters with specific appearance details
[Action]: Dialogue with emotional cues
[Context]: Setting that supports the mood
[Audio]: Dialogue in quotes + ambient sounds
```

### 料理・レシピ動画

```
[Cinematography]: Top-down shot / close-up / slow motion
[Subject]: Food preparation steps
[Context]: Kitchen setting with specific lighting
[Style]: Warm, appetizing color grading
[Audio]: SFX of cooking sounds (sizzling, chopping, pouring)
```
