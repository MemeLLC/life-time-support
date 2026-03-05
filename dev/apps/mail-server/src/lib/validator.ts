import { validator } from "hono/validator";
import type { z } from "@hono/zod-openapi";
import { HttpProblem } from "@life-time-support/types";

/**
 * Zod validation middleware for Hono routes.
 * Converts Zod validation errors into RFC 9457 HttpProblem responses.
 */
export const zodValidator = <T extends z.ZodType>(target: "json" | "query", schema: T) =>
  validator(target, (value, c) => {
    const result = schema.safeParse(value);
    if (!result.success) {
      return new HttpProblem({
        status: 422,
        title: "Validation Failed",
        detail: result.error.issues.map((i) => i.message).join(", "),
        instance: c.req.path,
      }).toResponse();
    }
    return result.data as z.output<T>;
  });
