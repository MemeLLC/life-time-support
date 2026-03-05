import type { Resend } from "resend";
import { HttpProblem } from "@life-time-support/types";

interface Attachment {
  filename: string;
  content: string; // Base64 encoded
  contentType?: string;
  contentId?: string;
}

interface Tag {
  name: string;
  value: string;
}

export interface SendEmailOptions {
  resend: Resend;
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: Attachment[];
  tags?: Tag[];
  idempotencyKey?: string;
  /** When true, log the email instead of sending it. */
  dryRun?: boolean;
}

/**
 * Send an email via Resend SDK.
 * Throws {@link HttpProblem} on failure.
 */
export async function sendEmail({
  resend,
  from,
  to,
  subject,
  html,
  replyTo,
  attachments,
  tags,
  idempotencyKey,
  dryRun,
}: SendEmailOptions): Promise<{ id: string }> {
  if (dryRun) {
    const id = `dry-run-${Date.now()}`;
    console.log(`[email] DRY RUN (${id}):`, {
      from,
      to,
      subject,
      replyTo,
      attachments: attachments?.length ?? 0,
      tags,
    });
    return { id };
  }

  let data: { id: string } | null;
  let error: { name: string; message: string } | null;
  try {
    ({ data, error } = await resend.emails.send(
      {
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo && { replyTo }),
        ...(attachments?.length && { attachments }),
        ...(tags?.length && { tags }),
      },
      idempotencyKey ? { idempotencyKey } : undefined,
    ));
  } catch (e) {
    console.error("[email] Resend SDK error:", e);
    throw new HttpProblem({ status: 502, title: "Email Delivery Failed" });
  }

  if (error) {
    console.error("[email] Resend error:", error.name, error.message);

    const statusMap: Record<string, number> = {
      validation_error: 422,
      missing_required_field: 422,
      rate_limit_exceeded: 429,
      not_found: 404,
    };

    throw new HttpProblem({
      status: statusMap[error.name] ?? 502,
      title: "Email Delivery Failed",
    });
  }

  if (!data?.id) {
    throw new HttpProblem({ status: 502, title: "Email Delivery Failed" });
  }

  return { id: data.id };
}
