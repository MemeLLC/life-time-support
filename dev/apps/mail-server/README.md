# mail-server

ライフタイムサポートのお問い合わせフォーム用メール API サーバー。
Cloudflare Workers 上で動作する Hono アプリケーション。

## 技術スタック

- **ランタイム**: Cloudflare Workers
- **フレームワーク**: [Hono](https://hono.dev/) + [Zod OpenAPI](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
- **メール送信**: [Resend](https://resend.com/)
- **メールテンプレート**: [React Email](https://react.email/)
- **バリデーション**: [Zod](https://zod.dev/)（`@life-time-support/types` から共有スキーマを利用）
- **テスト**: [Vitest](https://vitest.dev/)

## API エンドポイント

| メソッド | パス                   | 説明                                              |
| -------- | ---------------------- | ------------------------------------------------- |
| `GET`    | `/health`              | ヘルスチェック                                    |
| `POST`   | `/api/contact`         | お問い合わせフォーム送信（管理者通知 + 自動返信） |
| `POST`   | `/api/contact/details` | 追加情報フォーム送信（間取り図添付対応）          |

すべての `/api/*` エンドポイントは Cloudflare Turnstile による認証が必要です。
リクエストヘッダーに `cf-turnstile-response` トークンを含めてください。

## セキュリティ

- **CORS**: 許可オリジンのホワイトリスト制御
- **Turnstile**: bot 対策トークン検証 + ホスト名検証
- **ファイルアップロード**: MIME タイプ・マジックバイト・サイズ・拡張子のバリデーション
- **エラーレスポンス**: [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457) 準拠

## 開発

```sh
pnpm dev
```

開発環境では Swagger UI が利用可能です。

- OpenAPI ドキュメント: `http://localhost:8787/doc`
- Swagger UI: `http://localhost:8787/ui`

### メールテンプレートのプレビュー

```sh
pnpm email:dev
```

`http://localhost:3000` でメールテンプレートをプレビューできます。

### テスト

```sh
pnpm test        # ウォッチモード
pnpm test:run    # 単発実行
```

### デプロイ

```sh
pnpm deploy
```

## 環境変数（Workers Secrets）

| 変数名                 | 説明                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`       | Resend API キー                                                                        |
| `EMAIL_ADMIN`          | 管理者通知メールの宛先                                                                 |
| `EMAIL_NOTIFICATION`   | 通知メールの送信元アドレス                                                             |
| `EMAIL_NOREPLY`        | 自動返信メールの送信元アドレス                                                         |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile シークレットキー                                                  |
| `ENVIRONMENT`          | 実行環境（`wrangler.jsonc` で `production` 定義済み。ローカルは `.dev.vars` で上書き） |

## ディレクトリ構成

```
src/
├── index.ts                  # アプリケーションエントリポイント（ミドルウェア・ルーティング・エラーハンドリング）
├── emails/                   # React Email テンプレート
│   ├── render.ts             # テンプレートレンダリング関数
│   ├── contact-notification.tsx
│   ├── contact-auto-reply.tsx
│   └── contact-details-notification.tsx
├── lib/                      # ユーティリティ
│   ├── email.ts              # Resend SDK ラッパー
│   ├── turnstile.ts          # Turnstile 検証
│   ├── sanitize-source.ts    # ソースパラメータのサニタイズ
│   └── validator.ts          # Zod バリデーションミドルウェア
├── openapi/                  # OpenAPI ドキュメント定義
│   ├── routes.ts
│   └── schemas.ts
└── routes/
    ├── health.ts
    └── api/
        ├── contact.ts        # お問い合わせ
        └── contact-details.ts # 追加情報（間取り図添付対応）
```
