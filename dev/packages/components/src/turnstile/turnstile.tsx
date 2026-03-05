"use client";

/**
 * Cloudflare Turnstile React コンポーネント
 *
 * Turnstile の explicit rendering API をラップし、
 * スクリプトの動的ロード・ウィジェットのライフサイクル管理を行う。
 *
 * @example 基本的な使い方
 * ```tsx
 * const [token, setToken] = useState<string | null>(null);
 *
 * <Turnstile
 *   siteKey={import.meta.env.PUBLIC_TURNSTILE_SITE_KEY}
 *   onSuccess={(t) => setToken(t)}
 *   onExpire={() => setToken(null)}
 * />
 *
 * <button disabled={!token} onClick={handleSubmit}>送信</button>
 * ```
 *
 * @example API リクエスト時にトークンをヘッダーに付与
 * ```ts
 * await fetch("/api/contact", {
 *   method: "POST",
 *   headers: {
 *     "Content-Type": "application/json",
 *     "cf-turnstile-response": token,
 *   },
 *   body: JSON.stringify(data),
 * });
 * ```
 *
 * @example ローカル開発（ダミーキー）
 * ```tsx
 * // .dev.vars に PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA を設定
 * // ダミー Site Key は常に成功するトークンを返す
 * <Turnstile siteKey="1x00000000000000000000AA" onSuccess={setToken} />
 * ```
 *
 * @see https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
 */
import type React from "react";
import { useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  getResponse: (widgetId: string) => string | undefined;
  isExpired: (widgetId: string) => boolean;
}

interface TurnstileRenderOptions {
  sitekey: string;
  callback?: (token: string) => void;
  "error-callback"?: (errorCode: string) => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "flexible" | "compact";
  action?: string;
  cdata?: string;
  appearance?: "always" | "execute" | "interaction-only";
}

const MAX_RESET_RETRIES = 3;
const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";

export interface TurnstileProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onError"> {
  siteKey: string;
  onSuccess?: (token: string) => void;
  onError?: (errorCode: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "flexible" | "compact";
  action?: string;
  cdata?: string;
  appearance?: "always" | "execute" | "interaction-only";
}

let scriptPromise: Promise<void> | null = null;

/** @internal テスト用にエクスポート */
export function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    window.onTurnstileLoad = () => resolve();
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_URL;
    script.async = true;
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error("Failed to load Turnstile script"));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function Turnstile({
  siteKey,
  onSuccess,
  onError,
  onExpire,
  theme = "auto",
  size = "normal",
  action,
  cdata,
  appearance,
  ...props
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const resetCountRef = useRef(0);

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  onExpireRef.current = onExpire;

  const handleSuccess = useCallback((token: string) => {
    resetCountRef.current = 0;
    onSuccessRef.current?.(token);
  }, []);

  const handleError = useCallback((errorCode: string) => {
    if (resetCountRef.current < MAX_RESET_RETRIES && widgetIdRef.current && window.turnstile) {
      resetCountRef.current++;
      window.turnstile.reset(widgetIdRef.current);
      return;
    }
    onErrorRef.current?.(errorCode);
  }, []);

  const handleExpire = useCallback(() => {
    onExpireRef.current?.();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    void loadScript()
      .then(() => {
        if (cancelled || !window.turnstile || !containerRef.current) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: handleSuccess,
          "error-callback": handleError,
          "expired-callback": handleExpire,
          theme,
          size,
          action,
          cdata,
          appearance,
        });
      })
      .catch(() => {
        if (!cancelled) handleError("script-load-error");
      });

    return () => {
      cancelled = true;
      resetCountRef.current = 0;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme, size, action, cdata, appearance, handleSuccess, handleError, handleExpire]);

  return <div ref={containerRef} {...props} />;
}
