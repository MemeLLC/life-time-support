import { Hono } from "hono";
import type { z } from "@hono/zod-openapi";
import { HttpProblem } from "@life-time-support/types";
import { contactSchema } from "@life-time-support/types/contact";
import {
  contactDetailsSchema,
  FLOOR_PLAN_EXTENSIONS,
  FLOOR_PLAN_MAX_SIZE,
  FLOOR_PLAN_MIME_TYPES,
} from "@life-time-support/types/contact-details";
import type { Env } from "../../index";
import { sendEmail } from "../../lib/email";
import { buildIdempotencyKey } from "../../lib/idempotency-key";
import { sanitizeSource } from "../../lib/sanitize-source";
import { renderContactDetailsNotification } from "../../emails/render";

// --- Helpers ---

const SAFE_EXTENSIONS = new Set<string>(FLOOR_PLAN_EXTENSIONS);

function sanitizeFilename(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "png";
  return `floor-plan.${SAFE_EXTENSIONS.has(ext) ? ext : "png"}`;
}

/** [offset, expected bytes] pairs for each MIME type */
const MAGIC_SIGNATURES: [string, [number, number[]][]][] = [
  ["image/png", [[0, [0x89, 0x50, 0x4e, 0x47]]]],
  ["image/jpeg", [[0, [0xff, 0xd8, 0xff]]]],
  [
    "image/webp",
    [
      [0, [0x52, 0x49, 0x46, 0x46]], // "RIFF"
      [8, [0x57, 0x45, 0x42, 0x50]], // "WEBP"
    ],
  ],
];

function detectMimeType(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer.slice(0, 12));
  for (const [mime, checks] of MAGIC_SIGNATURES) {
    if (checks.every(([offset, sig]) => sig.every((b, i) => bytes[offset + i] === b))) return mime;
  }
  return null;
}

/**
 * FormData から JSON 文字列フィールドを取得し、Zod スキーマでバリデーションする。
 */
function parseFormDataField<T extends z.ZodTypeAny>(
  formData: FormData,
  fieldName: string,
  schema: T,
  instance: string,
): z.infer<T> {
  const raw = formData.get(fieldName);
  if (typeof raw !== "string") {
    throw new HttpProblem({
      status: 400,
      title: "Bad Request",
      detail: `Missing ${fieldName} field`,
      instance,
    });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new HttpProblem({
      status: 400,
      title: "Bad Request",
      detail: `Invalid ${fieldName} JSON`,
      instance,
    });
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new HttpProblem({
      status: 422,
      title: "Validation Failed",
      detail: result.error.issues.map((i) => i.message).join(", "),
      instance,
    });
  }
  return result.data as z.infer<T>;
}

interface FloorPlanAttachment {
  filename: string;
  content: string;
  contentType: string;
  contentId: string;
}

/**
 * FormData から間取り図ファイルを取得し、MIME/マジックバイト検証・Base64 エンコードを行う。
 * ファイルが存在しないか空の場合は undefined を返す。
 */
async function processFloorPlan(
  formData: FormData,
  instance: string,
): Promise<FloorPlanAttachment | undefined> {
  // formData.get() の戻り値は FormDataEntryValue (string | File) | null だが、
  // Hono の型定義では File 型が推論されないため as unknown as でキャストしている。
  const file = formData.get("floorPlan") as unknown as File | string | null;
  if (file === null || typeof file === "string" || file.size === 0) return undefined;

  if (!FLOOR_PLAN_MIME_TYPES.includes(file.type as (typeof FLOOR_PLAN_MIME_TYPES)[number])) {
    throw new HttpProblem({
      status: 422,
      title: "Validation Failed",
      detail: "Floor plan must be PNG, JPEG, or WebP",
      instance,
    });
  }
  if (file.size > FLOOR_PLAN_MAX_SIZE) {
    throw new HttpProblem({
      status: 422,
      title: "Validation Failed",
      detail: "Floor plan must be 5MB or less",
      instance,
    });
  }

  const buffer = await file.arrayBuffer();
  const detectedMime = detectMimeType(buffer);
  if (!detectedMime) {
    throw new HttpProblem({
      status: 422,
      title: "Validation Failed",
      detail: "Floor plan must be PNG, JPEG, or WebP",
      instance,
    });
  }

  return {
    filename: sanitizeFilename(file.name),
    content: Buffer.from(buffer).toString("base64"),
    contentType: detectedMime,
    contentId: "floorPlan",
  };
}

// --- Route ---

export const contactDetails = new Hono<Env>();

/**
 * POST /api/contact/details
 * 追加情報フォーム送信 → Resend でメール送信（添付ファイル対応）
 */
const MAX_BODY_SIZE = 6 * 1024 * 1024; // 5MB file + JSON fields margin

contactDetails.post("/", async (c) => {
  // Content-Length による早期拒否（最適化目的。唯一の防御線ではない）
  const contentLength = parseInt(c.req.header("Content-Length") ?? "0", 10);
  if (contentLength > MAX_BODY_SIZE) {
    throw new HttpProblem({ status: 413, title: "Payload Too Large", instance: c.req.path });
  }

  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    throw new HttpProblem({
      status: 400,
      title: "Bad Request",
      detail: "Invalid FormData",
      instance: c.req.path,
    });
  }

  const contactData = parseFormDataField(formData, "contact", contactSchema, c.req.path);
  const details = parseFormDataField(formData, "details", contactDetailsSchema, c.req.path);
  const floorPlanAttachment = await processFloorPlan(formData, c.req.path);

  const source = sanitizeSource(c.req.query("source"));
  const resend = c.var.resend;
  const env = c.env.ENVIRONMENT ?? "production";
  const dryRun = env === "development";
  const turnstileToken = c.req.header("cf-turnstile-response") ?? "";

  const html = await renderContactDetailsNotification({
    ...details,
    contact: contactData,
    source,
    floorPlanSrc: floorPlanAttachment ? "cid:floorPlan" : undefined,
  });

  const { id } = await sendEmail({
    resend,
    from: c.env.EMAIL_NOTIFICATION,
    to: c.env.EMAIL_ADMIN,
    subject: `【お問い合わせ詳細】${contactData.name}様 - 追加情報`,
    html,
    replyTo: contactData.email,
    attachments: floorPlanAttachment ? [floorPlanAttachment] : undefined,
    tags: [
      { name: "env", value: env },
      { name: "category", value: "contact-details" },
      { name: "source", value: source },
    ],
    idempotencyKey: await buildIdempotencyKey("contact-details", turnstileToken),
    dryRun,
  });

  return c.json({ id }, 200);
});
