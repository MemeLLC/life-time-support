#!/usr/bin/env python3
"""
Veo 3.1 — テキストから動画を生成する（text-to-video）

使い方:
  python3 text_to_video.py "プロンプト" [出力ファイル名] [オプション...]

オプション:
  --aspect-ratio <16:9|9:16>        アスペクト比（デフォルト: 16:9）
  --duration <4|6|8>                長さ（秒）（デフォルト: 8）
  --resolution <720p|1080p|4k>      解像度（デフォルト: 720p）
  --negative-prompt <text>          除外したい要素
  --person-generation <allow_all|allow_adult>  人物生成の許可
  --poll-interval <seconds>         ポーリング間隔（デフォルト: 10）
"""

import argparse
import os
import sys
import time

from google import genai
from google.genai import types


def load_env():
    """プロジェクトルートの .env を読み込む"""
    if os.environ.get("GEMINI_API_KEY"):
        return
    script_dir = os.path.dirname(os.path.abspath(__file__))
    env_file = os.path.join(script_dir, "..", "..", "..", "..", ".env")
    env_file = os.path.normpath(env_file)
    if os.path.isfile(env_file):
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, value = line.partition("=")
                    os.environ[key.strip()] = value.strip()


def main():
    parser = argparse.ArgumentParser(description="Veo 3.1 text-to-video")
    parser.add_argument("prompt", help="動画生成プロンプト")
    parser.add_argument("output", nargs="?", default="generated_video.mp4", help="出力ファイル名")
    parser.add_argument("--aspect-ratio", default="16:9", help="アスペクト比")
    parser.add_argument("--duration", type=int, default=8, help="長さ（秒）")
    parser.add_argument("--resolution", default="720p", help="解像度")
    parser.add_argument("--negative-prompt", default=None, help="除外要素")
    parser.add_argument("--person-generation", default=None, help="人物生成の許可")
    parser.add_argument("--poll-interval", type=int, default=10, help="ポーリング間隔（秒）")
    args = parser.parse_args()

    load_env()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("エラー: GEMINI_API_KEY が設定されていません。", file=sys.stderr)
        sys.exit(1)

    client = genai.Client(api_key=api_key)
    model = "veo-3.1-generate-preview"

    print(f"🎬 Veo 3.1 Text-to-Video 生成中...")
    print(f"   モデル: {model}")
    print(f"   プロンプト: {args.prompt}")
    print(f"   アスペクト比: {args.aspect_ratio}")
    print(f"   長さ: {args.duration}秒")
    print(f"   解像度: {args.resolution}")

    config = types.GenerateVideosConfig(
        aspect_ratio=args.aspect_ratio,
        duration_seconds=args.duration,
        resolution=args.resolution,
    )
    if args.negative_prompt:
        config.negative_prompt = args.negative_prompt
    if args.person_generation:
        config.person_generation = args.person_generation

    operation = client.models.generate_videos(
        model=model,
        prompt=args.prompt,
        config=config,
    )

    print(f"\n⏳ 生成完了を待機中...（{args.poll_interval}秒間隔でポーリング）")

    while not operation.done:
        time.sleep(args.poll_interval)
        operation = client.operations.get(operation)
        print(".", end="", flush=True)
    print()

    if not operation.response or not operation.response.generated_videos:
        print("❌ 動画の生成に失敗しました。", file=sys.stderr)
        sys.exit(1)

    video = operation.response.generated_videos[0]

    print("📥 動画をダウンロード中...")
    client.files.download(file=video.video)
    video.video.save(args.output)

    print(f"\n✅ 動画を保存しました: {args.output}")


if __name__ == "__main__":
    main()
