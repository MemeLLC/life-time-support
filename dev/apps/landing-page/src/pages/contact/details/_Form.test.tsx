import { describe, it, expect, vi, beforeAll, beforeEach, afterEach, afterAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DetailsForm from "./_Form";
import { CONTACT_FORM_STORAGE_KEY } from "../_Form";
import type { Contact } from "@life-time-support/types/contact";

vi.mock("@life-time-support/components/turnstile", () => ({
  useTurnstile: () => ({
    token: "mock-token",
    siteKey: "test-key",
    onSuccess: vi.fn(),
    onExpire: vi.fn(),
  }),
  Turnstile: () => null,
}));

const contactData: Contact = {
  name: "山田 太郎",
  nameKana: "やまだ たろう",
  phone: "090-1234-5678",
  email: "example@email.com",
  subject: "資料請求",
};

function seedSessionStorage() {
  sessionStorage.setItem(CONTACT_FORM_STORAGE_KEY, JSON.stringify(contactData));
}

interface FetchResponse {
  ok: boolean;
}

describe("DetailsForm", () => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
  const originalFetch = globalThis.fetch;
  const locationHrefSetter = vi.fn();

  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
    Object.defineProperty(window, "location", {
      value: { ...window.location },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window.location, "href", {
      set: locationHrefSetter,
      get: () => "http://localhost/contact/details",
      configurable: true,
    });
  });

  beforeEach(() => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({ ok: true } as FetchResponse),
    ) as unknown as typeof fetch;
    sessionStorage.clear();
    locationHrefSetter.mockClear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("renders fallback when no contact data in sessionStorage", async () => {
    render(<DetailsForm />);

    await waitFor(() => {
      expect(screen.getByText("お問い合わせ情報が見つかりません")).not.toBeNull();
    });

    expect(screen.getByText("お問い合わせフォームへ")).not.toBeNull();
  });

  it("renders all form fields when contact data exists", async () => {
    seedSessionStorage();
    render(<DetailsForm />);

    await waitFor(() => {
      expect(screen.getByText("お問い合わせありがとうございます")).not.toBeNull();
    });

    expect(screen.getByText("施工先物件")).not.toBeNull();
    expect(screen.getByPlaceholderText("○○マンション")).not.toBeNull();
    expect(screen.getByText("入居予定時期（年）")).not.toBeNull();
    expect(screen.getByText("入居予定時期（月）")).not.toBeNull();
    expect(screen.getByText("内覧会時期（年）")).not.toBeNull();
    expect(screen.getByText("内覧会時期（月）")).not.toBeNull();
    expect(screen.getByText("間取り図")).not.toBeNull();
    expect(screen.getByPlaceholderText("紹介者のお名前")).not.toBeNull();
    expect(screen.getByPlaceholderText("紹介コード")).not.toBeNull();
    expect(screen.getByPlaceholderText("ご自由にご記入ください")).not.toBeNull();
    expect(screen.getByRole("button", { name: "送信する" })).not.toBeNull();
  });

  it("submits empty form successfully and redirects to /thanks", async () => {
    seedSessionStorage();

    render(<DetailsForm />);

    await waitFor(() => {
      expect(screen.getByText("お問い合わせありがとうございます")).not.toBeNull();
    });

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    const [requestUrl, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect((requestUrl as URL).href).toContain("/api/contact/details");
    expect(options!.method).toBe("POST");
    expect(options!.body).toBeInstanceOf(FormData);

    await waitFor(() => {
      expect(locationHrefSetter).toHaveBeenCalledWith("/thanks");
    });
  });

  it("submit button is disabled when all fields are empty", async () => {
    seedSessionStorage();
    render(<DetailsForm />);

    await waitFor(() => {
      expect(screen.getByText("お問い合わせありがとうございます")).not.toBeNull();
    });

    expect(screen.getByRole("button", { name: "送信する" })).toBeDisabled();
  });

  it("submit button is enabled when a field has a value", async () => {
    seedSessionStorage();
    render(<DetailsForm />);

    await waitFor(() => {
      expect(screen.getByText("お問い合わせありがとうございます")).not.toBeNull();
    });

    fireEvent.change(screen.getByPlaceholderText("○○マンション"), {
      target: { value: "テストマンション" },
    });

    expect(screen.getByRole("button", { name: "送信する" })).toBeEnabled();
  });

  it("displays personalized thank-you message with contact name", async () => {
    seedSessionStorage();
    render(<DetailsForm />);

    await waitFor(() => {
      expect(screen.getByText(/山田 太郎様、お問い合わせありがとうございます/)).not.toBeNull();
    });
  });

  afterAll(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });
});
