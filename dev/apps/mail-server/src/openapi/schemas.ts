import { z } from "@hono/zod-openapi";

export const EmailSentSchema = z
  .object({
    id: z.string().openapi({ example: "email_abc123" }),
  })
  .openapi("EmailSent");

export const ProblemDetailSchema = z
  .object({
    type: z.string().openapi({ example: "about:blank" }),
    status: z.number().openapi({ example: 422 }),
    title: z.string().openapi({ example: "Validation Failed" }),
    detail: z.string().optional().openapi({ example: "必須です" }),
    instance: z.string().optional().openapi({ example: "/api/contact" }),
  })
  .openapi("ProblemDetail");
