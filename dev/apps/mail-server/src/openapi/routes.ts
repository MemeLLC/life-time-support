import { z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";
import { contactSchema } from "@life-time-support/types/contact";
import { EmailSentSchema, ProblemDetailSchema } from "./schemas";

const ErrorResponses = {
  400: {
    description: "不正なリクエストボディ",
    content: { "application/problem+json": { schema: ProblemDetailSchema } },
  },
  422: {
    description: "バリデーションエラー",
    content: { "application/problem+json": { schema: ProblemDetailSchema } },
  },
  403: {
    description: "Turnstile 検証失敗",
    content: { "application/problem+json": { schema: ProblemDetailSchema } },
  },
  404: {
    description: "リソースが見つからない",
    content: { "application/problem+json": { schema: ProblemDetailSchema } },
  },
  413: {
    description: "ペイロードサイズ超過",
    content: { "application/problem+json": { schema: ProblemDetailSchema } },
  },
  429: {
    description: "レート制限超過",
    content: { "application/problem+json": { schema: ProblemDetailSchema } },
  },
  502: {
    description: "メール送信失敗",
    content: { "application/problem+json": { schema: ProblemDetailSchema } },
  },
} as const;

/**
 * Register all OpenAPI path documentation on the given registry.
 * This is purely documentation — route handlers are defined separately.
 */
export function registerOpenAPIRoutes(registry: OpenAPIHono["openAPIRegistry"]) {
  // GET /health
  registry.registerPath({
    method: "get",
    path: "/health",
    tags: ["Health"],
    summary: "ヘルスチェック",
    responses: {
      200: {
        description: "サービス正常稼働中",
        content: {
          "application/json": {
            schema: z.object({ status: z.string().openapi({ example: "ok" }) }),
          },
        },
      },
    },
  });

  // POST /api/contact
  registry.registerPath({
    method: "post",
    path: "/api/contact",
    tags: ["Contact"],
    summary: "お問い合わせフォーム送信",
    description: "管理者への通知メールとお客様への自動返信メールを送信します。",
    security: [{ turnstile: [] }],
    request: {
      query: z.object({
        source: z
          .string()
          .optional()
          .openapi({ example: "landing-page", description: "流入元識別子" }),
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: contactSchema.openapi("ContactRequest"),
          },
        },
      },
    },
    responses: {
      200: {
        description: "メール送信成功",
        content: { "application/json": { schema: EmailSentSchema } },
      },
      ...ErrorResponses,
    },
  });

  // POST /api/contact/details
  registry.registerPath({
    method: "post",
    path: "/api/contact/details",
    tags: ["Contact"],
    summary: "詳細お問い合わせフォーム送信",
    description:
      "物件の追加情報と間取り図（任意）を含む通知メールを送信します。multipart/form-data を使用。",
    security: [{ turnstile: [] }],
    request: {
      query: z.object({
        source: z.string().optional().openapi({ example: "landing-page" }),
      }),
      body: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: z
              .object({
                contact: z.string().openapi({
                  description: "お問い合わせ情報の JSON 文字列",
                  example: JSON.stringify({
                    name: "山田 太郎",
                    nameKana: "やまだ たろう",
                    phone: "09012345678",
                    email: "taro@example.com",
                    subject: "資料請求",
                  }),
                }),
                details: z.string().openapi({
                  description: "詳細情報の JSON 文字列",
                  example: JSON.stringify({
                    propertyType: "新築マンション",
                    considering: ["フロアコーティング"],
                  }),
                }),
                floorPlan: z.string().optional().openapi({
                  description: "間取り図画像（PNG/JPEG/WebP、最大 5MB）",
                  format: "binary",
                }),
              })
              .openapi("ContactDetailsFormData"),
          },
        },
      },
    },
    responses: {
      200: {
        description: "メール送信成功",
        content: { "application/json": { schema: EmailSentSchema } },
      },
      ...ErrorResponses,
    },
  });
}
