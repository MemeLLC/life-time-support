import { describe, it, expect, vi } from "vitest";
import type { Resend } from "resend";
import { HttpProblem } from "@life-time-support/types";
import { sendEmail } from "./email";

type MockResponse =
  | { data: { id: string }; error: null }
  | { data: null; error: { name: string; message: string } };

function createMockResend(response: MockResponse) {
  const sendMock = vi.fn().mockResolvedValue(response);
  const resend = { emails: { send: sendMock } } as unknown as Resend;
  return { resend, sendMock };
}

const baseOptions = {
  from: "test@example.com",
  to: "recipient@example.com",
  subject: "Test",
  html: "<p>Hello</p>",
};

describe("sendEmail", () => {
  it("skips Resend and returns dry-run id when dryRun is true", async () => {
    const sendMock = vi.fn();
    const resend = { emails: { send: sendMock } } as unknown as Resend;

    const result = await sendEmail({ resend, ...baseOptions, dryRun: true });

    expect(result.id).toMatch(/^dry-run-\d+$/);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns email id on success", async () => {
    const { resend } = createMockResend({
      data: { id: "email_123" },
      error: null,
    });

    const result = await sendEmail({ resend, ...baseOptions });

    expect(result).toEqual({ id: "email_123" });
  });

  it("throws HttpProblem 502 when data.id is missing", async () => {
    const { resend } = createMockResend({
      data: { id: "" },
      error: null,
    } as unknown as MockResponse);

    const error = await sendEmail({ resend, ...baseOptions }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpProblem);
    expect((error as HttpProblem).status).toBe(502);
  });

  it("passes correct parameters to Resend SDK", async () => {
    const { resend, sendMock } = createMockResend({
      data: { id: "email_123" },
      error: null,
    });

    await sendEmail({
      resend,
      ...baseOptions,
      to: ["a@example.com", "b@example.com"],
      replyTo: "reply@example.com",
      idempotencyKey: "contact/123",
    });

    expect(sendMock).toHaveBeenCalledWith(
      {
        from: "test@example.com",
        to: ["a@example.com", "b@example.com"],
        subject: "Test",
        html: "<p>Hello</p>",
        replyTo: "reply@example.com",
      },
      { idempotencyKey: "contact/123" },
    );
  });

  it("wraps string `to` in an array", async () => {
    const { resend, sendMock } = createMockResend({
      data: { id: "email_123" },
      error: null,
    });

    await sendEmail({ resend, ...baseOptions, to: "single@example.com" });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: ["single@example.com"] }),
      undefined,
    );
  });

  it("omits replyTo when not provided", async () => {
    const { resend, sendMock } = createMockResend({
      data: { id: "email_123" },
      error: null,
    });

    await sendEmail({ resend, ...baseOptions });

    expect(sendMock.mock.calls[0][0]).not.toHaveProperty("replyTo");
  });

  it("passes attachments when provided", async () => {
    const { resend, sendMock } = createMockResend({
      data: { id: "email_123" },
      error: null,
    });

    const attachments = [{ filename: "plan.pdf", content: "base64data" }];
    await sendEmail({ resend, ...baseOptions, attachments });

    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ attachments }), undefined);
  });

  it.each([
    { errorName: "validation_error", expectedStatus: 422 },
    { errorName: "missing_required_field", expectedStatus: 422 },
    { errorName: "rate_limit_exceeded", expectedStatus: 429 },
    { errorName: "not_found", expectedStatus: 404 },
    { errorName: "internal_server_error", expectedStatus: 502 },
    { errorName: "unknown_error", expectedStatus: 502 },
  ])(
    "throws HttpProblem with status $expectedStatus for '$errorName'",
    async ({ errorName, expectedStatus }) => {
      const { resend } = createMockResend({
        data: null,
        error: { name: errorName, message: "Something went wrong" },
      });

      const error = await sendEmail({ resend, ...baseOptions }).catch((e: unknown) => e);

      expect(error).toBeInstanceOf(HttpProblem);
      const problem = error as HttpProblem;
      expect(problem.status).toBe(expectedStatus);
      expect(problem.title).toBe("Email Delivery Failed");
    },
  );

  it("throws HttpProblem 502 when SDK rejects", async () => {
    const sendMock = vi.fn().mockRejectedValue(new Error("Network failure"));
    const resend = { emails: { send: sendMock } } as unknown as Resend;

    const error = await sendEmail({ resend, ...baseOptions }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpProblem);
    expect((error as HttpProblem).status).toBe(502);
  });

  it("omits tags from Resend payload when empty array is provided", async () => {
    const { resend, sendMock } = createMockResend({
      data: { id: "email_123" },
      error: null,
    });

    await sendEmail({ resend, ...baseOptions, tags: [] });

    expect(sendMock.mock.calls[0][0]).not.toHaveProperty("tags");
  });

  it("omits attachments from Resend payload when empty array is provided", async () => {
    const { resend, sendMock } = createMockResend({
      data: { id: "email_123" },
      error: null,
    });

    await sendEmail({ resend, ...baseOptions, attachments: [] });

    expect(sendMock.mock.calls[0][0]).not.toHaveProperty("attachments");
  });

  it("does not leak error details to the client", async () => {
    const { resend } = createMockResend({
      data: null,
      error: { name: "validation_error", message: "Secret internal info" },
    });

    const error = await sendEmail({ resend, ...baseOptions }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpProblem);
    const json = (error as HttpProblem).toJSON();
    expect(json).not.toHaveProperty("detail");
    expect(JSON.stringify(json)).not.toContain("Secret internal info");
  });
});
