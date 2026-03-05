/**
 * Turnstile トークンを SHA-256 ハッシュ化し、prefix 付きの固定長 idempotencyKey を生成する。
 * Resend の idempotencyKey 長制限を超えないよう、トークンをそのまま使わずハッシュ化する。
 */
export async function buildIdempotencyKey(prefix: string, token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashHex = [...new Uint8Array(hashBuffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${prefix}:${hashHex}`;
}
