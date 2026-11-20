/**
 * Dosya: scripts/stamp-sw.mjs
 * Açıklama: sw.js içindeki APP_SHELL_URLS dosyalarının içerik hash'ine göre
 * önbellek sürümünü otomatik damgalar veya --check ile güncelliğini doğrular.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const swPath = path.join(rootDir, "sw.js");
const swText = fs.readFileSync(swPath, "utf8");

const listMatch = swText.match(/const APP_SHELL_URLS\s*=\s*\[([\s\S]*?)\];/);
const urls = listMatch ? [...listMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
const hashTargets = [...new Set([...urls, "./data.js"])];

const TEXT_EXTS = new Set([".html", ".css", ".js", ".mjs", ".json", ".webmanifest", ".svg"]);

const hash = crypto.createHash("sha256");
for (const entry of hashTargets) {
  const rel = entry === "./" ? "index.html" : entry.replace(/^\.\//, "");
  const full = path.join(rootDir, rel);
  if (fs.existsSync(full) && fs.statSync(full).isFile()) {
    hash.update(rel);
    const ext = path.extname(full).toLowerCase();
    if (TEXT_EXTS.has(ext)) {
      hash.update(fs.readFileSync(full, "utf8").replace(/\r\n/g, "\n"), "utf8");
    } else {
      hash.update(fs.readFileSync(full));
    }
  }
}
const stamp = hash.digest("hex").slice(0, 8);
const nextSw = swText
  .replace(/const SHELL_CACHE = "[^"]+";/, `const SHELL_CACHE = "klf-shell-${stamp}";`)
  .replace(/const DATA_CACHE = "[^"]+";/, `const DATA_CACHE = "klf-data-${stamp}";`);

if (process.argv.includes("--check")) {
  if (nextSw !== swText) {
    console.error(
      `sw.js önbellek sürümü güncel değil (beklenen: ${stamp}). 'node scripts/stamp-sw.mjs' çalıştırın.`
    );
    process.exit(1);
  }
  console.log(`PASS · sw.js sürümü güncel (${stamp})`);
} else {
  fs.writeFileSync(swPath, nextSw, "utf8");
  console.log(`sw.js önbellek sürümü damgalandı: ${stamp}`);
}
