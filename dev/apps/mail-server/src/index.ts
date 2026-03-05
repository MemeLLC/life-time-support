import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { Resend } from "resend";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { HttpProblem } from "@life-time-support/types";
import { verifyTurnstile } from "./lib/turnstile";
import { contact } from "./routes/api/contact";
import { contactDetails } from "./routes/api/contact-details";
import { health } from "./routes/health";
import { registerOpenAPIRoutes } from "./openapi/routes";

interface Bindings {
  RESEND_API_KEY: string;
  EMAIL_ADMIN: string;
  EMAIL_NOTIFICATION: string;
  EMAIL_NOREPLY: string;
  TURNSTILE_SECRET_KEY: string;
  ENVIRONMENT?: string;
}

export interface Env {
  Bindings: Bindings;
  Variables: {
    resend: Resend;
  };
}

const app = new OpenAPIHono<Env>();

// --- Middleware ---

const DEFAULT_ORIGINS = ["https://lp.life-time-support.com", "https://life-time-support.com"];
const ALLOWED_TURNSTILE_HOSTS = ["lp.life-time-support.com", "life-time-support.com"];

app.use(
  "/api/*",
  cors({
    origin: (origin, c) => {
      // cors() のコールバックの c は Hono ジェネリクスが欠落しているためキャストが必要
      const env = (c as unknown as { env: Bindings }).env;
      if (env.ENVIRONMENT === "development") return origin;
      return DEFAULT_ORIGINS.includes(origin) ? origin : "";
    },
    allowHeaders: ["Content-Type", "cf-turnstile-response"],
  }),
);

app.use("/api/*", async (c, next) => {
  const token = c.req.header("cf-turnstile-response");
  if (!token) {
    throw new HttpProblem({
      status: 403,
      title: "Forbidden",
      detail: "Missing Turnstile token",
      instance: c.req.path,
    });
  }

  const ip = c.req.header("CF-Connecting-IP");
  const result = await verifyTurnstile(token, c.env.TURNSTILE_SECRET_KEY, ip ?? undefined);
  if (!result.success) {
    throw new HttpProblem({
      status: 403,
      title: "Forbidden",
      detail: "Turnstile verification failed",
      instance: c.req.path,
    });
  }

  if (c.env.ENVIRONMENT !== "development" && !ALLOWED_TURNSTILE_HOSTS.includes(result.hostname)) {
    throw new HttpProblem({
      status: 403,
      title: "Forbidden",
      detail: "Turnstile hostname mismatch",
      instance: c.req.path,
    });
  }

  await next();
});

app.use("/api/*", async (c, next) => {
  c.set("resend", new Resend(c.env.RESEND_API_KEY));
  await next();
});

// --- Routes ---

app.route("/health", health);
app.route("/api/contact", contact);
app.route("/api/contact/details", contactDetails);

// --- OpenAPI ---

registerOpenAPIRoutes(app.openAPIRegistry);

app.openAPIRegistry.registerComponent("securitySchemes", "turnstile", {
  type: "apiKey",
  in: "header",
  name: "cf-turnstile-response",
  description: "Cloudflare Turnstile 検証トークン",
});

app.use("/doc", async (c, next) => {
  if (c.env.ENVIRONMENT !== "development") return c.notFound();
  await next();
});

app.use("/ui", async (c, next) => {
  if (c.env.ENVIRONMENT !== "development") return c.notFound();
  await next();
});

app.doc("/doc", {
  openapi: "3.1.0",
  info: {
    title: "ライフタイムサポート メールAPI",
    version: "1.0.0",
    description: "お問い合わせフォームの送信とメール通知を行うAPIです。",
  },
});

app.get("/ui", swaggerUI({ url: "/doc" }));

// --- Error handling ---

app.notFound((c) => {
  return new HttpProblem({
    status: 404,
    title: "Not Found",
    instance: c.req.path,
  }).toResponse();
});

app.onError((err, c) => {
  if (err instanceof HttpProblem) {
    return err.toResponse();
  }

  if (err instanceof HTTPException) {
    return new HttpProblem({
      status: err.status,
      title: err.message,
      instance: c.req.path,
    }).toResponse();
  }

  console.error(err);
  return new HttpProblem({
    status: 500,
    title: "Internal Server Error",
    instance: c.req.path,
  }).toResponse();
});

export default app;
