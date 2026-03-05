import { Hono } from "hono";
import type { Env } from "../index";

export const health = new Hono<Env>();

health.get("/", (c) => {
  return c.json({ status: "ok" }, 200);
});
