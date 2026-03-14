# 音楽生成プロンプトガイド

Lyria RealTime で高品質な音楽を生成するためのプロンプト作成リファレンス。

---

## 基本原則

- **プロンプトは英語で書く**
- ジャンル + 楽器 + ムード を組み合わせると効果的
- 複数プロンプトの重み付けで細かなブレンドが可能

---

## 対応ジャンル（一部）

Acid Jazz, Afrobeat, Ambient, Baroque, Bebop, Bluegrass, Blues, Bossa Nova, Breakbeat, Celtic, Chamber Music, Chillwave, Chiptune, Classical, Country, Cumbia, Dark Ambient, Deep House, Disco, Downtempo, Dream Pop, Drum and Bass, Dub, Dubstep, EDM, Electro Swing, Electronic, Emo, Experimental, Flamenco, Folk, Funk, Future Bass, Garage Rock, Glitch, Gospel, Grime, Grunge, Hard Rock, Hardstyle, Heavy Metal, Hip Hop, House, IDM, Indie, Industrial, Jazz, Jungle, K-Pop, Latin, Lo-fi, Lounge, Mathcore, Minimal, Motown, Neo-Soul, New Wave, Noise, Nu Metal, Opera, Orchestral, Pop, Post-Punk, Post-Rock, Progressive Rock, Psytrance, Punk, R&B, Ragtime, Reggae, Reggaeton, Rock, Salsa, Shoegaze, Ska, Soul, Synthpop, Synthwave, Techno, Trance, Trap, Trip Hop, Vaporwave, World Music

---

## 対応楽器（一部）

### 弦楽器
303 Acid Bass, Acoustic Guitar, Banjo, Bass Guitar, Cello, Double Bass, Electric Guitar, Harp, Mandolin, Sitar, Ukulele, Viola, Violin

### 鍵盤
Accordion, Clavinet, Electric Piano, Hammond Organ, Harpsichord, Melodica, Piano, Rhodes, Synthesizer, Wurlitzer

### 管楽器
Bagpipes, Clarinet, Didgeridoo, Flute, French Horn, Harmonica, Oboe, Recorder, Saxophone, Trombone, Trumpet, Tuba

### 打楽器
Bongos, Cajon, Congas, Cowbell, Cymbals, Djembe, Drum Machine, Drums, Glockenspiel, Marimba, Steel Drums, Tabla, Timpani, Triangle, Vibraphone, Xylophone

### 電子音源
808 Bass, Analog Synth, Arpeggiator, FM Synth, Modular Synth, Pad Synth, Sampler, Theremin, Vocoder

---

## ムード・ディスクリプター（一部）

Aggressive, Ambient, Bright, Calm, Cheerful, Cinematic, Dark, Dreamy, Driving, Emotional, Energetic, Epic, Ethereal, Funky, Glitchy, Groovy, Happy, Haunting, Heavy, Hypnotic, Intense, Jazzy, Laid-back, Melancholic, Mellow, Mysterious, Nostalgic, Peaceful, Playful, Powerful, Psychedelic, Relaxing, Romantic, Sad, Serene, Soulful, Spacious, Sultry, Upbeat, Uplifting, Warm

---

## 生成モード

| モード | 説明 | 用途 |
|--------|------|------|
| **QUALITY** | 最高品質の生成（デフォルト） | 本番用途、最終出力 |
| **DIVERSITY** | バリエーション重視 | アイデア探索、複数パターンの試行 |
| **VOCALIZATION** | ボーカリゼーション（楽器としての声）を生成 | ハミング、コーラス、スキャット等の声素材 |

---

## スケール一覧

| スケール | 定数名 |
|----------|--------|
| C Major | `C_MAJOR` |
| C Minor | `C_MINOR` |
| D Major | `D_MAJOR` |
| D Minor | `D_MINOR` |
| E Major | `E_MAJOR` |
| E Minor | `E_MINOR` |
| F Major | `F_MAJOR` |
| F Minor | `F_MINOR` |
| G Major | `G_MAJOR` |
| G Minor | `G_MINOR` |
| A Major | `A_MAJOR` |
| A Minor | `A_MINOR` |

---

## パラメータチューニングガイド

### guidance（プロンプト忠実度: 0.0〜6.0）
- **低い値（0.0-2.0）**: プロンプトから自由に逸脱。意外性のある結果
- **中間（3.0-4.0）**: バランスの取れた忠実度（デフォルト: 4.0）
- **高い値（5.0-6.0）**: プロンプトに厳密に従う。予測可能な結果

### density（音の密度: 0.0〜1.0）
- **低い（0.0-0.3）**: スパースでミニマル。アンビエント、ダウンテンポ向き
- **中間（0.4-0.6）**: 標準的な密度
- **高い（0.7-1.0）**: 音が密集。EDM、オーケストラ、激しいロック向き

### brightness（音の明るさ: 0.0〜1.0）
- **低い（0.0-0.3）**: 暗く、重い音色。ダーク・アンビエント、ドゥーム向き
- **中間（0.4-0.6）**: ナチュラルな音色
- **高い（0.7-1.0）**: 明るく、鮮やかな音色。ポップ、チルウェーブ向き

### temperature（バリエーション: 0.0〜3.0）
- **低い（0.0-0.5）**: 予測可能で安定した出力
- **中間（0.8-1.5）**: 適度なバリエーション（デフォルト: 1.1）
- **高い（2.0-3.0）**: 予測不能でクリエイティブな出力

---

## プロンプトテンプレート

### BGM系
```
lo-fi hip hop beats, mellow piano chords, vinyl crackle, relaxing study music
```

```
ambient electronic, soft pads, gentle arpeggios, spacious reverb, meditation music
```

### 動画BGM
```
cinematic orchestral, epic strings, powerful brass, building tension, trailer music
```

```
upbeat corporate pop, acoustic guitar, claps, cheerful and motivating, presentation background
```

### SNS・広告向け
```
energetic trap beat, 808 bass, hi-hats, catchy melody, social media music
```

```
tropical house, steel drums, bright synths, summer vibes, uplifting and danceable
```

### ゲーム・アプリ
```
chiptune, retro game music, 8-bit arpeggios, energetic and playful
```

```
dark ambient, eerie textures, distant thunder, horror game atmosphere
```

---

## 重み付きプロンプトの活用例

複数のプロンプトを重み付けしてブレンドする:

```bash
# ジャズとエレクトロニカのブレンド
--prompts '[{"text":"smooth jazz, saxophone solo","weight":1.0},{"text":"glitchy electronic beats","weight":0.5}]'

# ロックベースにアンビエントを薄く混ぜる
--prompts '[{"text":"hard rock, distorted guitar, driving drums","weight":1.0},{"text":"ethereal ambient pads","weight":0.3}]'
```

重みが大きいほどそのプロンプトの影響が強くなる。生成中にプロンプトを変更すればスムーズなトランジションも可能。

---

## ステム分離の活用

ベースやドラムの個別ミュート・抽出で、用途に合わせたステム素材を生成できる:

| オプション | 出力内容 | 用途 |
|------------|----------|------|
| （指定なし） | フルミックス | そのまま使えるBGM |
| `--mute-drums` | ドラム以外 | ドラムを別トラックに差し替えたい時 |
| `--mute-bass` | ベース以外 | ベースラインを別に作りたい時 |
| `--only-bass-and-drums` | ベース+ドラムのみ | リズムセクションだけ欲しい時 |
