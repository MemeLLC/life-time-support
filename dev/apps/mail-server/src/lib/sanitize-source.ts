const SOURCE_PATTERN = /^[A-Za-z0-9_-]{1,256}$/;

export function sanitizeSource(raw: string | undefined): string {
  return raw && SOURCE_PATTERN.test(raw) ? raw : "unknown";
}
