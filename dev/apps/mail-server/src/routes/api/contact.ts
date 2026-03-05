import { Hono } from "hono";
import { contactSchema } from "@life-time-support/types/contact";
import type { Env } from "../../index";
import { sendEmail } from "../../lib/email";
import { buildIdempotencyKey } from "../../lib/idempotency-key";
import { sanitizeSource } from "../../lib/sanitize-source";
import { zodValidator } from "../../lib/validator";
import { renderContactAutoReply, renderContactNotification } from "../../emails/render";

export const contact = new Hono<Env>();

/**
 * POST /api/contact
 * お問い合わせフォーム送信 → Resend でメール送信
 */
contact.post("/", zodValidator("json", contactSchema), async (c) => {
  const data = c.req.valid("json");
  const source = sanitizeSource(c.req.query("source"));
  const resend = c.var.resend;
  const env = c.env.ENVIRONMENT ?? "production";
  const dryRun = env === "development";
  const turnstileToken = c.req.header("cf-turnstile-response") ?? "";
  const templateProps = { ...data, source };

  const [notificationHtml, autoReplyHtml, notificationKey, autoReplyKey] = await Promise.all([
    renderContactNotification(templateProps),
    renderContactAutoReply(data),
    buildIdempotencyKey("contact:notification", turnstileToken),
    buildIdempotencyKey("contact:auto-reply", turnstileToken),
  ]);

  // 通知メールが主目的。auto-reply 失敗は許容しログのみ。
  const [notification, autoReply] = await Promise.allSettled([
    sendEmail({
      resend,
      from: c.env.EMAIL_NOTIFICATION,
      to: c.env.EMAIL_ADMIN,
      subject: `【お問い合わせ】${data.name}様 - ${data.subject}`,
      html: notificationHtml,
      replyTo: data.email,
      tags: [
        { name: "env", value: env },
        { name: "category", value: "contact" },
        { name: "source", value: source },
      ],
      idempotencyKey: notificationKey,
      dryRun,
    }),
    sendEmail({
      resend,
      from: c.env.EMAIL_NOREPLY,
      to: data.email,
      subject: `お問い合わせが完了しました`,
      html: autoReplyHtml,
      tags: [
        { name: "env", value: env },
        { name: "category", value: "contact-auto-reply" },
        { name: "source", value: source },
      ],
      idempotencyKey: autoReplyKey,
      dryRun,
    }),
  ]);

  if (notification.status === "rejected") throw notification.reason;
  if (autoReply.status === "rejected") {
    console.error("[auto-reply] Failed to send:", autoReply.reason);
  }

  return c.json({ id: notification.value.id }, 200);
});
