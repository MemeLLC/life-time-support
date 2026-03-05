import { useState, useCallback } from "react";
import type { Contact } from "@life-time-support/types/contact";
import type { ContactDetails } from "@life-time-support/types/contact-details";
import type { ProblemDetail } from "@life-time-support/types/problem-details";
import type { SubmitStatus } from "./types";

export type { Contact, ContactDetails, SubmitStatus };

export interface SubmitContactDetailsData {
  contact: Contact;
  details: ContactDetails;
  floorPlan?: File;
}

export interface SubmitContactDetailsOptions {
  baseUrl: string;
  source?: string;
}

export interface UseSubmitContactDetailsReturn {
  submit: (data: SubmitContactDetailsData, turnstileToken: string) => Promise<boolean>;
  status: SubmitStatus;
  error: ProblemDetail | null;
  reset: () => void;
}

export function useSubmitContactDetails(
  options: SubmitContactDetailsOptions,
): UseSubmitContactDetailsReturn {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState<ProblemDetail | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  const submit = useCallback(
    async (data: SubmitContactDetailsData, turnstileToken: string): Promise<boolean> => {
      setStatus("pending");
      setError(null);

      try {
        const url = new URL("/api/contact/details", options.baseUrl);
        if (options.source) {
          url.searchParams.set("source", options.source);
        }

        const formData = new FormData();
        formData.append("contact", JSON.stringify(data.contact));
        formData.append("details", JSON.stringify(data.details));
        if (data.floorPlan) {
          formData.append("floorPlan", data.floorPlan);
        }

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "cf-turnstile-response": turnstileToken,
          },
          body: formData,
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
