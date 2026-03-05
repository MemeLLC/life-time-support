import { HttpProblem } from "@life-time-support/types";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileBase {
  "error-codes": string[];
  messages: string[];
}

interface TurnstileSuccess extends TurnstileBase {
  success: true;
  challenge_ts: string;
  hostname: string;
  action: string;
  cdata: string;
  metadata: { ephemeral_id: string };
}

interface TurnstileFailure extends TurnstileBase {
  success: false;
}

export type TurnstileResult = TurnstileSuccess | TurnstileFailure;

export async function verifyTurnstile(
  token: string,
  secretKey: string,
  ip?: string,
): Promise<TurnstileResult> {
  const body: Record<string, string> = {
    secret: secretKey,
    response: token,
  };
  if (ip) body.remoteip = ip;

  let res: Response;
  try {
    res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body),
    });
  } catch {
    throw new HttpProblem({
      status: 502,
      title: "Turnstile Verification Unavailable",
    });
  }

  if (!res.ok) {
    throw new HttpProblem({
      status: 502,
      title: "Turnstile Verification Unavailable",
    });
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new HttpProblem({
      status: 502,
      title: "Turnstile Verification Unavailable",
    });
  }

  if (typeof data !== "object" || data === null || !("success" in data)) {
    throw new HttpProblem({
      status: 502,
      title: "Turnstile Verification Unavailable",
    });
  }

  return data as TurnstileResult;
}
