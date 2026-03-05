import { useState, useCallback } from "react";
import type { Contact } from "@life-time-support/types/contact";
import type { ProblemDetail } from "@life-time-support/types/problem-details";
import type { SubmitStatus } from "./types";

export type { Contact, SubmitStatus };

export interface SubmitContactOptions {
  baseUrl: string;
  source?: string;
}

export interface UseSubmitContactReturn {
  submit: (data: Contact, turnstileToken: string) => Promise<boolean>;
  status: SubmitStatus;
  error: ProblemDetail | null;
  reset: () => void;
}

export function useSubmitContact(options: SubmitContactOptions): UseSubmitContactReturn {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState<ProblemDetail | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  const submit = useCallback(
    async (data: Contact, turnstileToken: string): Promise<boolean> => {
      setStatus("pending");
      setError(null);

      try {
        const url = new URL("/api/contact", options.baseUrl);
        if (options.source) {
          url.searchParams.set("source", options.source);
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "cf-turnstile-response": turnstileToken,
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          setStatus("success");
          return true;
        }

        const problem = await response
          .json()
          .then((json: ProblemDetail) => json)
          .catch((): null => null);

        setError(
          problem ?? {
            type: "about:blank",
            status: response.status,
            title: response.statusText,
          },
        );
        setStatus("error");
        return false;
      } catch {
        setError({
          type: "about:blank",
          status: 0,
          title: "Network Error",
          detail: "サーバーに接続できませんでした。ネットワーク接続を確認してください。",
        });
        setStatus("error");
        return false;
      }
    },
    [options.baseUrl, options.source],
  );

  return { submit, status, error, reset };
}
