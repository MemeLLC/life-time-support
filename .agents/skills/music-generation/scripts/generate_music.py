#!/usr/bin/env python3
"""
Lyria RealTime — テキストプロンプトからインストゥルメンタル音楽を生成する

使い方:
  python3 generate_music.py "プロンプト" [出力ファイル名] [オプション...]

オプション:
  --duration <seconds>       生成する長さ（秒）（デフォルト: 30）
  --bpm <60-200>             テンポ（デフォルト: モデル自動判定）
  --guidance <0.0-6.0>       プロンプト忠実度（デフォルト: 4.0）
  --density <0.0-1.0>        音の密度（デフォルト: モデル自動判定）
  --brightness <0.0-1.0>     音の明るさ（デフォルト: モデル自動判定）
  --temperature <0.0-3.0>    バリエーション（デフォルト: 1.1）
  --scale <scale_name>       スケール（例: C_MAJOR, A_MINOR）
  --mode <QUALITY|DIVERSITY|VOCALIZATION>  生成モード（デフォルト: QUALITY）
  --mute-bass                ベースをミュート
  --mute-drums               ドラムをミュート
  --only-bass-and-drums      ベースとドラムのみ
  --seed <int>               シード値（再現性）
  --sample-rate <hz>         サンプルレート（デフォルト: 48000）
  --prompts <json>           複数の重み付きプロンプト（JSON配列）
                             例: '[{"text":"lo-fi hip hop","weight":1.0},{"text":"jazz piano","weight":0.5}]'
"""

import argparse
import asyncio
import json
import os
import struct
import sys

from google import genai
from google.genai import types


def load_env():
    """プロジェクトルートの .env を読み込む"""
    if os.environ.get("GEMINI_API_KEY"):
        return
    script_dir = os.path.dirname(os.path.abspath(__file__))
    env_file = os.path.normpath(os.path.join(script_dir, "..", "..", "..", "..", ".env"))
    if os.path.isfile(env_file):
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, value = line.partition("=")
                    os.environ[key.strip()] = value.strip()


def write_wav(filename, pcm_data, sample_rate=48000, channels=2, bits_per_sample=16):
    """PCMデータをWAVファイルとして書き出す"""
    data_size = len(pcm_data)
    byte_rate = sample_rate * channels * bits_per_sample // 8
    block_align = channels * bits_per_sample // 8

    with open(filename, "wb") as f:
        # RIFF header
        f.write(b"RIFF")
        f.write(struct.pack("<I", 36 + data_size))
        f.write(b"WAVE")
        # fmt chunk
        f.write(b"fmt ")
        f.write(struct.pack("<I", 16))  # chunk size
        f.write(struct.pack("<H", 1))   # PCM format
        f.write(struct.pack("<H", channels))
        f.write(struct.pack("<I", sample_rate))
        f.write(struct.pack("<I", byte_rate))
        f.write(struct.pack("<H", block_align))
        f.write(struct.pack("<H", bits_per_sample))
        # data chunk
        f.write(b"data")
        f.write(struct.pack("<I", data_size))
        f.write(pcm_data)


async def generate(args):
    load_env()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("エラー: GEMINI_API_KEY が設定されていません。", file=sys.stderr)
        sys.exit(1)

    client = genai.Client(api_key=api_key, http_options={"api_version": "v1alpha"})
    model = "models/lyria-realtime-exp"

    # 重み付きプロンプトの構成
    if args.prompts:
        prompt_list = json.loads(args.prompts)
        weighted_prompts = [
            types.WeightedPrompt(text=p["text"], weight=p.get("weight", 1.0))
            for p in prompt_list
        ]
    else:
        weighted_prompts = [types.WeightedPrompt(text=args.prompt, weight=1.0)]

    prompt_desc = ", ".join(f'"{p.text}" (weight={p.weight})' for p in weighted_prompts)
    print(f"🎵 Lyria RealTime 音楽生成中...")
    print(f"   モデル: {model}")
    print(f"   プロンプト: {prompt_desc}")
    print(f"   長さ: {args.duration}秒")

    # 生成設定
    config_kwargs = {}
    if args.bpm is not None:
        config_kwargs["bpm"] = args.bpm
        print(f"   BPM: {args.bpm}")
    if args.guidance is not None:
        config_kwargs["guidance"] = args.guidance
    if args.density is not None:
        config_kwargs["density"] = args.density
    if args.brightness is not None:
        config_kwargs["brightness"] = args.brightness
    if args.temperature is not None:
        config_kwargs["temperature"] = args.temperature
    if args.scale is not None:
        config_kwargs["scale"] = args.scale
        print(f"   スケール: {args.scale}")
    if args.mode:
        config_kwargs["music_generation_mode"] = args.mode
        print(f"   モード: {args.mode}")
    if args.mute_bass:
        config_kwargs["mute_bass"] = True
    if args.mute_drums:
        config_kwargs["mute_drums"] = True
    if args.only_bass_and_drums:
        config_kwargs["only_bass_and_drums"] = True
    if args.seed is not None:
        config_kwargs["seed"] = args.seed
        print(f"   シード: {args.seed}")

    sample_rate = args.sample_rate
    channels = 2
    bits_per_sample = 16
    bytes_per_second = sample_rate * channels * (bits_per_sample // 8)
    target_bytes = args.duration * bytes_per_second

    audio_buffer = bytearray()
    done = asyncio.Event()

    async def receive_audio(session):
        """ストリーミング音声データを受信してバッファに蓄積する"""
        try:
            async for message in session.receive():
                if hasattr(message, "server_content") and message.server_content:
                    sc = message.server_content
                    if hasattr(sc, "audio_chunks") and sc.audio_chunks:
                        for chunk in sc.audio_chunks:
                            audio_buffer.extend(chunk.data)
                            elapsed = len(audio_buffer) / bytes_per_second
                            sys.stdout.write(f"\r   録音中: {elapsed:.1f}秒 / {args.duration}秒")
                            sys.stdout.flush()
                            if len(audio_buffer) >= target_bytes:
                                done.set()
                                return
        except Exception as e:
            print(f"\n⚠️  受信エラー: {e}", file=sys.stderr)
            done.set()

    async with client.aio.live.music.connect(model=model) as session:
        # プロンプトを設定
        await session.set_weighted_prompts(prompts=weighted_prompts)

        # 生成設定を適用
        if config_kwargs:
            config = types.LiveMusicGenerationConfig(**config_kwargs)
            await session.set_music_generation_config(config=config)

        # 再生開始
        await session.play()

        # 音声受信タスクを開始
        recv_task = asyncio.create_task(receive_audio(session))

        # 指定時間分の音声が溜まるまで待機
        await done.wait()

        # 停止
        await session.stop()
        recv_task.cancel()
        try:
            await recv_task
        except asyncio.CancelledError:
            pass

    print()

    if not audio_buffer:
        print("❌ 音声データが取得できませんでした。", file=sys.stderr)
        sys.exit(1)

    # 指定長さにトリム
    pcm_data = bytes(audio_buffer[:target_bytes])

    # WAV書き出し
    write_wav(args.output, pcm_data, sample_rate=sample_rate, channels=channels)
    actual_duration = len(pcm_data) / bytes_per_second
    print(f"\n✅ 音楽を保存しました: {args.output} ({actual_duration:.1f}秒)")


def main():
    parser = argparse.ArgumentParser(description="Lyria RealTime 音楽生成")
    parser.add_argument("prompt", nargs="?", default=None, help="音楽生成プロンプト")
    parser.add_argument("output", nargs="?", default="generated_music.wav", help="出力ファイル名")
    parser.add_argument("--duration", type=int, default=30, help="生成する長さ（秒）")
    parser.add_argument("--bpm", type=int, default=None, help="テンポ（60-200）")
    parser.add_argument("--guidance", type=float, default=None, help="プロンプト忠実度（0.0-6.0）")
    parser.add_argument("--density", type=float, default=None, help="音の密度（0.0-1.0）")
    parser.add_argument("--brightness", type=float, default=None, help="音の明るさ（0.0-1.0）")
    parser.add_argument("--temperature", type=float, default=None, help="バリエーション（0.0-3.0）")
    parser.add_argument("--scale", default=None, help="スケール（例: C_MAJOR, A_MINOR）")
    parser.add_argument("--mode", default=None, choices=["QUALITY", "DIVERSITY", "VOCALIZATION"], help="生成モード")
    parser.add_argument("--mute-bass", action="store_true", help="ベースをミュート")
    parser.add_argument("--mute-drums", action="store_true", help="ドラムをミュート")
    parser.add_argument("--only-bass-and-drums", action="store_true", help="ベースとドラムのみ")
    parser.add_argument("--seed", type=int, default=None, help="シード値（再現性）")
    parser.add_argument("--sample-rate", type=int, default=48000, help="サンプルレート（デフォルト: 48000）")
    parser.add_argument("--prompts", default=None, help='重み付きプロンプト（JSON配列）')
    args = parser.parse_args()

    if not args.prompt and not args.prompts:
        parser.error("プロンプトまたは --prompts を指定してください")

    asyncio.run(generate(args))


if __name__ == "__main__":
    main()
