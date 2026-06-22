#!/usr/bin/env node
// Convert markdown files to PDF via Chrome headless.
// Usage: node scripts/md_to_pdf.mjs <input.md> <output.pdf>
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

// Install marked locally if missing
try { await import("marked"); } catch {
  console.log("Installing marked...");
  execFileSync("npm", ["install", "marked", "--no-save", "--silent"], { stdio: "inherit", shell: true });
}
const { marked } = await import("marked");

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) { console.error("usage: md_to_pdf.mjs <input.md> <output.pdf>"); process.exit(2); }

const md = fs.readFileSync(inPath, "utf8");
const body = marked.parse(md);
const title = path.basename(inPath, ".md");

const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  @page { size: letter; margin: 0.5in 0.6in; }
  html, body { font-family: -apple-system, "Segoe UI", system-ui, sans-serif; color: #1a1a1a; font-size: 10.5pt; line-height: 1.45; }
  h1 { font-size: 18pt; color: #1a1a1a; border-bottom: 2px solid #B8862B; padding-bottom: 4px; margin: 0 0 8px; page-break-after: avoid; }
  h2 { font-size: 13pt; color: #B8862B; margin: 18px 0 6px; page-break-after: avoid; }
  h3 { font-size: 11pt; color: #1a1a1a; margin: 12px 0 4px; page-break-after: avoid; }
  p, li { font-size: 10.5pt; }
  ul, ol { padding-left: 20px; margin: 4px 0 8px; }
  li { margin: 2px 0; }
  blockquote { border-left: 3px solid #B8862B; background: #FAF6EE; padding: 6px 10px; margin: 8px 0; font-size: 10pt; }
  code { background: #f4f1e8; padding: 1px 4px; border-radius: 2px; font-size: 9.5pt; }
  table { border-collapse: collapse; margin: 8px 0; font-size: 9.5pt; width: 100%; page-break-inside: avoid; }
  th, td { border: 1px solid #ddd; padding: 4px 8px; text-align: left; vertical-align: top; }
  th { background: #FAF6EE; font-weight: 600; }
  hr { border: none; border-top: 1px solid #ddd; margin: 14px 0; }
  strong { color: #1a1a1a; }
</style></head><body>${body}</body></html>`;

const tmp = path.join(os.tmpdir(), `mdpdf_${Date.now()}.html`);
fs.writeFileSync(tmp, html);
const tmpUrl = "file:///" + tmp.replace(/\\/g, "/");

execFileSync(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  `--print-to-pdf=${outPath}`,
  tmpUrl,
], { stdio: "inherit" });

fs.unlinkSync(tmp);
console.log("wrote:", outPath, fs.statSync(outPath).size, "bytes");
