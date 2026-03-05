#!/usr/bin/env python3
"""
Veo 3.1 — 開始/終了画像から動画を生成する（First & Last Frame）

使い方:
  python3 keyframes_to_video.py "プロンプト" 開始画像パス 終了画像パス [出力ファイル名] [オプション...]

注意: durationは8秒固定（First & Last Frame機能の制約）

オプション:
  --aspect-ratio <16:9|9:16>        アスペクト比（デフォルト: 16:9）
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

SUPPORTED_EXTENSIONS = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
}


def load_env():
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


def load_image(path: str) -> types.Image:
    ext = os.path.splitext(path)[1].lower()
    mime = SUPPORTED_EXTENSIONS.get(ext)
    if not mime:
        print(f"エラー: 未対応の画像形式です: {ext}", file=sys.stderr)
        print(f"  対応形式: {', '.join(SUPPORTED_EXTENSIONS.keys())}", file=sys.stderr)
        sys.exit(1)
    with open(path, "rb") as f:
        data = f.read()
    return types.Image(image_bytes=data, mime_type=mime)


def main():
    parser = argparse.ArgumentParser(description="Veo 3.1 first & last frame")
    parser.add_argument("prompt", help="動画生成プロンプト")
    parser.add_argument("first_image", help="開始画像パス")
    parser.add_argument("last_image", help="終了画像パス")
    parser.add_argument("output", nargs="?", default="generated_video.mp4", help="出力ファイル名")
    parser.add_argument("--aspect-ratio", default="16:9")
    parser.add_argument("--resolution", default="720p")
    parser.add_argument("--negative-prompt", default=None)
    parser.add_argument("--person-generation", default=None)
    parser.add_argument("--poll-interval", type=int, default=10)
    args = parser.parse_args()

    load_env()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("エラー: GEMINI_API_KEY が設定されていません。", file=sys.stderr)
        sys.exit(1)

    for path in [args.first_image, args.last_image]:
        if not os.path.isfile(path):
            print(f"エラー: 画像が見つかりません: {path}", file=sys.stderr)
            sys.exit(1)

    client = genai.Client(api_key=api_key)
    model = "veo-3.1-generate-preview"
    first_image = load_image(args.first_image)
    last_image = load_image(args.last_image)

    print(f"🎬 Veo 3.1 First & Last Frame 生成中...")
    print(f"   モデル: {model}")
    print(f"   開始画像: {args.first_image}")
    print(f"   終了画像: {args.last_image}")
    print(f"   プロンプト: {args.prompt}")
    print(f"   アスペクト比: {args.aspect_ratio}")
    print(f"   長さ: 8秒（固定）")
    print(f"   解像度: {args.resolution}")

    config = types.GenerateVideosConfig(
        aspect_ratio=args.aspect_ratio,
        duration_seconds=8,
        resolution=args.resolution,
        last_frame=last_image,
    )
    if args.negative_prompt:
        config.negative_prompt = args.negative_prompt
    if args.person_generation:
        config.person_generation = args.person_generation

    operation = client.models.generate_videos(
        model=model,
        prompt=args.prompt,
        image=first_image,
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
