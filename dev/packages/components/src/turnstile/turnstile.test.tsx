import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { Turnstile } from "./turnstile";

type RenderOptions = Parameters<NonNullable<typeof window.turnstile>["render"]>[1];

const SCRIPT_ID = "cf-turnstile-script";
const win = window as unknown as Record<string, unknown>;

async function importFresh() {
  vi.resetModules();
  const mod = await import("./turnstile");
  return mod.loadScript;
}

function mockTurnstileApi() {
  const api = {
    render: vi.fn().mockReturnValue("widget-1"),
    remove: vi.fn(),
    reset: vi.fn(),
    getResponse: vi.fn(),
    isExpired: vi.fn(),
  };
  window.turnstile = api;
  return api;
}

function capturedOptions(api: ReturnType<typeof mockTurnstileApi>) {
  return api.render.mock.calls[0][1] as RenderOptions;
}

describe("loadScript", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    delete win.turnstile;
    delete win.onTurnstileLoad;
  });

  it("window.turnstile が既に存在すれば即 resolve する", async () => {
    win.turnstile = {};
    const loadScript = await importFresh();

    await loadScript();

    expect(document.getElementById(SCRIPT_ID)).toBeNull();
  });

  it("script 要素を作成し、onTurnstileLoad で resolve する", async () => {
    const loadScript = await importFresh();
    const promise = loadScript();

    const script = document.getElementById(SCRIPT_ID);
    expect(script).not.toBeNull();
    expect(script?.getAttribute("src")).toContain("turnstile");

    window.onTurnstileLoad!();
    await promise;
  });

  it("失敗時に script を DOM から除去し、リトライで新しい script を作成する", async () => {
    const loadScript = await importFresh();

    // 1回目: エラー
    const promise1 = loadScript();
    const script1 = document.getElementById(SCRIPT_ID) as HTMLScriptElement;
    script1.dispatchEvent(new Event("error"));

    await expect(promise1).rejects.toThrow("Failed to load Turnstile script");
    expect(document.getElementById(SCRIPT_ID)).toBeNull();

    // 2回目: 成功
    const promise2 = loadScript();
    expect(document.getElementById(SCRIPT_ID)).not.toBeNull();

    window.onTurnstileLoad!();
    await promise2;
  });

  it("複数同時呼び出しが同じ Promise を共有する", async () => {
    const loadScript = await importFresh();

    const promise1 = loadScript();
    const promise2 = loadScript();

    expect(promise1).toBe(promise2);
    expect(document.querySelectorAll(`#${SCRIPT_ID}`)).toHaveLength(1);

    window.onTurnstileLoad!();
    await Promise.all([promise1, promise2]);
  });
});

describe("Turnstile component", () => {
  beforeEach(() => {
    cleanup();
    delete window.onTurnstileLoad;
    delete window.turnstile;
  });

  it("mount 時に turnstile.render を呼ぶ", async () => {
    const api = mockTurnstileApi();

    render(<Turnstile siteKey="test-key" />);

    await waitFor(() => {
      expect(api.render).toHaveBeenCalledWith(
        expect.any(HTMLDivElement),
        expect.objectContaining({ sitekey: "test-key" }),
      );
    });
  });

  it("unmount 時に turnstile.remove を呼ぶ", async () => {
    const api = mockTurnstileApi();

    const { unmount } = render(<Turnstile siteKey="test-key" />);
    await waitFor(() => expect(api.render).toHaveBeenCalled());

    unmount();

    expect(api.remove).toHaveBeenCalledWith("widget-1");
  });

  it("onSuccess コールバックが呼ばれる", async () => {
    const api = mockTurnstileApi();
    const onSuccess = vi.fn();

    render(<Turnstile siteKey="test-key" onSuccess={onSuccess} />);
    await waitFor(() => expect(api.render).toHaveBeenCalled());

    capturedOptions(api).callback!("test-token");

    expect(onSuccess).toHaveBeenCalledWith("test-token");
  });

  it("onError コールバックが MAX_RESET_RETRIES 超過後に呼ばれる", async () => {
    const api = mockTurnstileApi();
    const onError = vi.fn();

    render(<Turnstile siteKey="test-key" onError={onError} />);
    await waitFor(() => expect(api.render).toHaveBeenCalled());

    const errorCallback = capturedOptions(api)["error-callback"]!;

    // 最初の 3 回はリトライ（onError は呼ばれない）
    for (let i = 0; i < 3; i++) {
      errorCallback("600010");
      expect(onError).not.toHaveBeenCalled();
    }

    // 4 回目で onError が伝搬される
    errorCallback("600010");
    expect(onError).toHaveBeenCalledWith("600010");
  });

  it("onExpire コールバックが呼ばれる", async () => {
    const api = mockTurnstileApi();
    const onExpire = vi.fn();

    render(<Turnstile siteKey="test-key" onExpire={onExpire} />);
    await waitFor(() => expect(api.render).toHaveBeenCalled());

    capturedOptions(api)["expired-callback"]!();

    expect(onExpire).toHaveBeenCalled();
  });

  it("エラー時に turnstile.reset() が呼ばれる", async () => {
    const api = mockTurnstileApi();

    render(<Turnstile siteKey="test-key" />);
    await waitFor(() => expect(api.render).toHaveBeenCalled());

    capturedOptions(api)["error-callback"]!("600010");

    expect(api.reset).toHaveBeenCalledWith("widget-1");
  });

  it("成功時にリセットカウンタがクリアされ再度リトライできる", async () => {
    const api = mockTurnstileApi();
    const onError = vi.fn();

    render(<Turnstile siteKey="test-key" onError={onError} />);
    await waitFor(() => expect(api.render).toHaveBeenCalled());

    const errorCallback = capturedOptions(api)["error-callback"]!;
    const successCallback = capturedOptions(api).callback!;

    // 2 回エラー → リトライ
    errorCallback("600010");
    errorCallback("600010");
    expect(api.reset).toHaveBeenCalledTimes(2);

    // 成功 → カウンタリセット
    successCallback("token-1");

    // 再度 3 回までリトライできる
    errorCallback("600010");
    errorCallback("600010");
    errorCallback("600010");
    expect(onError).not.toHaveBeenCalled();

    // 4 回目で伝搬
    errorCallback("600010");
    expect(onError).toHaveBeenCalledWith("600010");
  });

  it("props で theme / size / action を渡せる", async () => {
    const api = mockTurnstileApi();

    render(<Turnstile siteKey="test-key" theme="dark" size="compact" action="login" />);
    await waitFor(() => expect(api.render).toHaveBeenCalled());

    const opts = capturedOptions(api);
    expect(opts.theme).toBe("dark");
    expect(opts.size).toBe("compact");
    expect(opts.action).toBe("login");
  });
});
