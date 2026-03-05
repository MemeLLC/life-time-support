import { useState, useCallback } from "react";

export interface UseTurnstileReturn {
  /** 検証成功後のトークン。未取得・失効時は null */
  token: string | null;
  /** Turnstile サイトキー */
  siteKey: string;
  /** トークン取得成功時のコールバック */
  onSuccess: (token: string) => void;
  /** トークン失効時のコールバック */
  onExpire: () => void;
}

/**
 * Turnstile のトークン状態管理フック
 *
 * `Turnstile` コンポーネントと組み合わせて使う。
 * トークンの取得・失効を `useState` で管理し、
 * `Turnstile` に渡す props をまとめて返す。
 *
 * @example
 * ```tsx
 * const { token, ...turnstileProps } = useTurnstile(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY);
 *
 * <Turnstile {...turnstileProps} />
 * <button disabled={!token} onClick={() => submit(data, token!)}>送信</button>
 * ```
 */
export function useTurnstile(siteKey: string): UseTurnstileReturn {
  const [token, setToken] = useState<string | null>(null);
  const onExpire = useCallback(() => setToken(null), []);

  return { token, siteKey, onSuccess: setToken, onExpire };
}
