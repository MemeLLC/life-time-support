import { describe, it, expect } from "vitest";
import {
  renderContactNotification,
  renderContactAutoReply,
  renderContactDetailsNotification,
} from "./render";
import { formatYearMonth } from "./contact-details-notification";
import type { ContactNotificationProps } from "./contact-notification";
import type { ContactAutoReplyProps } from "./contact-auto-reply";
import type { ContactDetailsNotificationProps } from "./contact-details-notification";

const contactProps: ContactAutoReplyProps = {
  name: "山田 太郎",
  nameKana: "やまだ たろう",
  phone: "090-1234-5678",
  email: "taro@example.com",
  subject: "資料請求",
};

const notificationProps: ContactNotificationProps = {
  ...contactProps,
  source: "landing-page",
};

const detailsProps: ContactDetailsNotificationProps = {
  contact: contactProps,
  propertyType: "新築マンション",
  considering: ["フロアコーティング"],
  source: "landing-page",
};

describe("renderContactNotification", () => {
  it("renders HTML containing contact name and subject", async () => {
    const html = await renderContactNotification(notificationProps);

    expect(html).toContain("山田 太郎");
    expect(html).toContain("資料請求");
    expect(html).toContain("landing-page");
  });

  it("renders valid HTML document", async () => {
    const html = await renderContactNotification(notificationProps);

    expect(html).toContain("<!DOCTYPE html");
    expect(html).toContain("</html>");
  });
});

describe("renderContactAutoReply", () => {
  it("renders HTML containing greeting with customer name", async () => {
    const html = await renderContactAutoReply(contactProps);

    expect(html).toContain("山田 太郎");
    expect(html).toContain("お問い合わせありがとうございます");
  });

  it("renders all contact field labels", async () => {
    const html = await renderContactAutoReply(contactProps);

    expect(html).toContain("お名前");
    expect(html).toContain("ふりがな");
    expect(html).toContain("電話番号");
    expect(html).toContain("メールアドレス");
    expect(html).toContain("ご相談内容");
  });
});

describe("renderContactDetailsNotification", () => {
  it("renders HTML containing contact and details info", async () => {
    const html = await renderContactDetailsNotification(detailsProps);

    expect(html).toContain("山田 太郎");
    expect(html).toContain("新築マンション");
    expect(html).toContain("フロアコーティング");
  });

  it("renders floor plan section when floorPlanSrc is provided", async () => {
    const html = await renderContactDetailsNotification({
      ...detailsProps,
      floorPlanSrc: "cid:floorPlan",
    });

    expect(html).toContain("間取り図");
    expect(html).toContain("cid:floorPlan");
  });

  it("omits floor plan section when floorPlanSrc is not provided", async () => {
    const html = await renderContactDetailsNotification(detailsProps);

    expect(html).not.toContain("cid:floorPlan");
  });
});

describe("formatYearMonth", () => {
  it("returns formatted string with both year and month", () => {
    expect(formatYearMonth("2026", "4")).toBe("2026年4月");
  });

  it("returns year only when month is not provided", () => {
    expect(formatYearMonth("2026", undefined)).toBe("2026年");
  });

  it("returns month only when year is not provided", () => {
    expect(formatYearMonth(undefined, "4")).toBe("4月");
  });

  it("returns undefined when neither year nor month is provided", () => {
    expect(formatYearMonth(undefined, undefined)).toBeUndefined();
  });
});
