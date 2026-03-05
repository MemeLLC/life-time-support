import type { AstroIntegration } from "astro";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

interface FontOptimizerOptions {
  family: string;
  weights: number[];
  display?: string;
  cssVariable: string;
  fallbacks?: string[];
}

const WOFF2_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const MAX_TEXT_CHARS = 1000;

export default function fontOptimizer(options: FontOptimizerOptions): AstroIntegration {
  return {
    name: "font-optimizer",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const distDir = fileURLToPath(dir);

        const htmlFiles = await collectHtmlFiles(distDir);
        if (htmlFiles.length === 0) return;

        const chars = new Set<string>();
        for (const file of htmlFiles) {
          const html = await readFile(file, "utf-8");
          extractCharacters(html, chars);
        }

        const uniqueChars = [...chars].join("");
        console.log(`[font-optimizer] Found ${uniqueChars.length} unique characters`);

        if (uniqueChars.length === 0) return;

        if (uniqueChars.length > MAX_TEXT_CHARS) {
          console.warn(
            `[font-optimizer] ${uniqueChars.length} characters exceeds ${MAX_TEXT_CHARS} limit, skipping optimization`,
          );
          return;
        }

        const fontCss = await fetchSubsettedCss(options, uniqueChars);
        if (!fontCss) return;

        const { css, preloadPaths } = await downloadAndRewriteFonts(fontCss, distDir);

        const fallbacks = options.fallbacks?.join(", ") ?? "sans-serif";
        const fullCss = `${css}\n:root { ${options.cssVariable}: '${options.family}', ${fallbacks}; }`;

        await injectIntoHtml(htmlFiles, fullCss, preloadPaths);

        console.log(`[font-optimizer] Done. Injected into ${htmlFiles.length} HTML files`);
      },
    },
  };
}

async function collectHtmlFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".html")) {
      results.push(join(entry.parentPath, entry.name));
    }
  }
  return results;
}

function extractCharacters(html: string, chars: Set<string>) {
  const bodyMatch = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
  if (!bodyMatch) return;

  let text = bodyMatch[1];
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  text = text.replace(/<[^>]+>/g, "");

  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)));

  for (const char of text) {
    if (char.trim()) {
      chars.add(char);
    }
  }
}

async function fetchSubsettedCss(
  options: FontOptimizerOptions,
  uniqueChars: string,
): Promise<string | null> {
  const family = options.family.replace(/ /g, "+");
  const weightsParam = options.weights.join(";");
  const display = options.display ?? "swap";
  const textParam = encodeURIComponent(uniqueChars);

  const cssUrl = `https://fonts.googleapis.com/css2?family=${family}:wght@${weightsParam}&display=${display}&text=${textParam}`;

  const res = await fetch(cssUrl, {
    headers: { "User-Agent": WOFF2_USER_AGENT },
  });

  if (!res.ok) {
    console.error(`[font-optimizer] Failed to fetch Google Fonts CSS: ${res.status}`);
    return null;
  }

  return res.text();
}

async function downloadAndRewriteFonts(
  css: string,
  distDir: string,
): Promise<{ css: string; preloadPaths: string[] }> {
  const fontDir = join(distDir, "_fonts");
  await mkdir(fontDir, { recursive: true });

  const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g;
  let rewrittenCss = css;
  const preloadPaths: string[] = [];
  let fontIndex = 0;
  let match;

  while ((match = urlRegex.exec(css)) !== null) {
    const remoteUrl = match[1];
    const fileName = `noto-sans-jp-subset-${fontIndex++}.woff2`;
    const localPath = `/_fonts/${fileName}`;

    const res = await fetch(remoteUrl);
    if (!res.ok) {
      console.warn(`[font-optimizer] Failed to download font: ${res.status}`);
      continue;
    }

    const buffer = await res.arrayBuffer();
    await writeFile(join(fontDir, fileName), Buffer.from(buffer));

    const sizeKiB = (buffer.byteLength / 1024).toFixed(1);
    console.log(`[font-optimizer] Downloaded ${fileName} (${sizeKiB} KiB)`);

    rewrittenCss = rewrittenCss.replace(remoteUrl, localPath);
    preloadPaths.push(localPath);
  }

  return { css: rewrittenCss, preloadPaths };
}

async function injectIntoHtml(
  htmlFiles: string[],
  css: string,
  preloadPaths: string[],
): Promise<void> {
  const preloadLinks = preloadPaths
    .map((p) => `<link rel="preload" href="${p}" as="font" type="font/woff2" crossorigin>`)
    .join("\n");

  const injection = `${preloadLinks}\n<style>${css}</style>`;

  for (const file of htmlFiles) {
    let html = await readFile(file, "utf-8");
    html = html.replace("</head>", `${injection}\n</head>`);
    await writeFile(file, html);
  }
}
