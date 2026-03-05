import { describe, it, expect, vi, beforeAll, beforeEach, afterEach, afterAll } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import Form from "./_Form";

vi.mock("@life-time-support/components/turnstile", () => ({
  useTurnstile: () => ({
    token: "mock-token",
    siteKey: "test-key",
    onSuccess: vi.fn(),
    onExpire: vi.fn(),
  }),
  Turnstile: () => null,
}));

interface FetchResponse {
  ok: boolean;
  status?: number;
  statusText?: string;
  json?: () => Promise<unknown>;
}

const validData = {
  name: "山田 太郎",
  nameKana: "やまだ たろう",
  phone: "090-1234-5678",
  email: "example@email.com",
  subject: "資料請求",
};

function fillTextInput(placeholder: string, value: string) {
  const input = screen.getByPlaceholderText(placeholder);
  fireEvent.change(input, { target: { value } });
  fireEvent.blur(input);
  return input;
}

async function selectSubject() {
  const trigger =
    screen.queryByRole("combobox") ??
    (screen.getByText("ご相談内容を選択してください").closest("button") as HTMLElement);
  fireEvent.mouseDown(trigger);
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  const listbox = await screen.findByRole("listbox");
  const option = within(listbox).getByRole("option", {
    name: validData.subject,
  });
  fireEvent.click(option);
}

async function fillValidForm() {
  fillTextInput("山田 太郎", validData.name);
  fillTextInput("やまだ たろう", validData.nameKana);
  fillTextInput("090-1234-5678", validData.phone);
  fillTextInput("example@email.com", validData.email);
  await selectSubject();
}

describe("Form", () => {
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
      get: () => "http://localhost/contact",
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
    sessionStorage.clear();
  });

  it("renders required inputs and submit button", () => {
    render(<Form />);

    expect(screen.getByText("お問い合わせ")).not.toBeNull();
    expect(screen.getByPlaceholderText("山田 太郎")).not.toBeNull();
    expect(screen.getByPlaceholderText("やまだ たろう")).not.toBeNull();
    expect(screen.getByPlaceholderText("090-1234-5678")).not.toBeNull();
    expect(screen.getByPlaceholderText("example@email.com")).not.toBeNull();
    expect(screen.getByText("ご相談内容を選択してください")).not.toBeNull();
    expect(screen.getByRole("button", { name: "送信する" })).not.toBeNull();
  });

  it("shows validation errors on blur", async () => {
    render(<Form />);

    const input = screen.getByPlaceholderText("山田 太郎");
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText("必須です")).not.toBeNull();
    });
  });

  it("submits valid form data, saves to sessionStorage and redirects", async () => {
    render(<Form />);

    await fillValidForm();

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    const [requestUrl, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect((requestUrl as URL).href).toContain("/api/contact");
    expect(options!.method).toBe("POST");
    expect(options!.headers).toEqual(
      expect.objectContaining({
        "Content-Type": "application/json",
        "cf-turnstile-response": "mock-token",
      }),
    );
    expect(JSON.parse(options!.body as string)).toEqual(validData);

    await waitFor(() => {
      const stored = sessionStorage.getItem("contactFormData");
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!)).toEqual(validData);
      expect(locationHrefSetter).toHaveBeenCalledWith("/contact/details");
    });
  });

  it("shows error message when server responds with failure", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.reject(new Error("no body")),
      } as FetchResponse),
    ) as unknown as typeof fetch;

    render(<Form />);

    await fillValidForm();

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText("送信に失敗しました。しばらくしてから再度お試しください。"),
      ).not.toBeNull();
    });
  });

  it("shows error message when network fails", async () => {
    globalThis.fetch = vi.fn(() => Promise.reject(new Error("network"))) as unknown as typeof fetch;

    render(<Form />);

    await fillValidForm();

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText("送信に失敗しました。しばらくしてから再度お試しください。"),
      ).not.toBeNull();
    });
  });

  describe("nameKana auto-fill", () => {
    it("auto-fills nameKana from IME composition", async () => {
      render(<Form />);

      const nameInput = screen.getByPlaceholderText("山田 太郎");
      const nameKanaInput = screen.getByPlaceholderText<HTMLInputElement>("やまだ たろう");

      // Simulate IME composition for "やまだ"
      fireEvent.compositionUpdate(nameInput, { data: "やまだ" });
      fireEvent.compositionEnd(nameInput, { data: "山田" });

      await waitFor(() => {
        expect(nameKanaInput.value).toBe("やまだ");
      });

      // Simulate IME composition for "たろう"
      fireEvent.compositionUpdate(nameInput, { data: "たろう" });
      fireEvent.compositionEnd(nameInput, { data: "太郎" });

      await waitFor(() => {
        expect(nameKanaInput.value).toBe("やまだたろう");
      });
    });

    it("clears nameKana when name is cleared", async () => {
      render(<Form />);

      const nameInput = screen.getByPlaceholderText("山田 太郎");
      const nameKanaInput = screen.getByPlaceholderText<HTMLInputElement>("やまだ たろう");

      // Fill name and nameKana
      fireEvent.compositionUpdate(nameInput, { data: "やまだ" });
      fireEvent.compositionEnd(nameInput, { data: "山田" });
      fireEvent.change(nameInput, { target: { value: "山田" } });

      await waitFor(() => {
        expect(nameKanaInput.value).toBe("やまだ");
      });

      // Clear name field
      fireEvent.change(nameInput, { target: { value: "" } });

      await waitFor(() => {
        expect(nameKanaInput.value).toBe("");
      });
    });

    it("does not auto-fill nameKana for non-hiragana composition", () => {
      render(<Form />);

      const nameInput = screen.getByPlaceholderText("山田 太郎");
      const nameKanaInput = screen.getByPlaceholderText<HTMLInputElement>("やまだ たろう");

      // Simulate composition with katakana (should not auto-fill)
      fireEvent.compositionUpdate(nameInput, { data: "ヤマダ" });
      fireEvent.compositionEnd(nameInput, { data: "ヤマダ" });

      expect(nameKanaInput.value).toBe("");
    });
  });

  afterAll(() => {
    HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
  });
});
