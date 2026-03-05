import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing env var: ${name}`);
    process.exit(1);
  }
  return value;
}

function escapeCSV(v: string): string {
  return v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v;
}

/**
 * Append rows to a CSV file. If the file doesn't exist, create it with headers.
 * Skips rows whose date already exists in the file (deduplication by date column).
 */
export function appendCSV(filePath: string, headers: string[], newRows: string[][]): number {
  mkdirSync(dirname(filePath), { recursive: true });

  let existingDates = new Set<string>();

  if (existsSync(filePath)) {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.trim().split("\n");
    // Skip header, collect dates (first column)
    for (let i = 1; i < lines.length; i++) {
      const date = lines[i].split(",")[0].replace(/"/g, "");
      existingDates.add(date);
    }
  }

  // Filter out rows with dates that already exist
  const freshRows = newRows.filter((row) => !existingDates.has(row[0]));

  if (freshRows.length === 0) {
    return 0;
  }

  const csvLines = freshRows.map((r) => r.map(escapeCSV).join(",")).join("\n") + "\n";

  if (!existsSync(filePath)) {
    writeFileSync(filePath, headers.map(escapeCSV).join(",") + "\n" + csvLines);
  } else {
    writeFileSync(filePath, readFileSync(filePath, "utf-8") + csvLines);
  }

  return freshRows.length;
}
