/**
 * Dosya: scripts/fetch-fedb-images.mjs
 * Açıklama: data/fedb-mapping.json içindeki free-exercise-db eşleşmelerini indirir,
 * sharp ile 480 px ve 960 px WebP (kalite 72) olarak assets/exercises/<videoKey>/ altına kaydeder.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const mappingPath = path.join(rootDir, "data", "fedb-mapping.json");
const outRoot = path.join(rootDir, "assets", "exercises");
const BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const mapping = JSON.parse(fs.readFileSync(mappingPath, "utf8"));
const entries = Object.entries(mapping).filter(
  ([, v]) => v && Array.isArray(v.images) && v.images.length >= 2
);

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function processExercise(videoKey, entry) {
  const dir = path.join(outRoot, videoKey);
  fs.mkdirSync(dir, { recursive: true });
  const positions = [
    { idx: 0, base: "start" },
    { idx: 1, base: "end" },
  ];
  for (const { idx, base } of positions) {
    const buf = await fetchBuffer(`${BASE_URL}${entry.images[idx]}`);
    await sharp(buf)
      .resize({ width: 480 })
      .webp({ quality: 72 })
      .toFile(path.join(dir, `${base}-480.webp`));
    await sharp(buf)
      .resize({ width: 960 })
      .webp({ quality: 58 })
      .toFile(path.join(dir, `${base}.webp`));
  }
}

let fileCount = 0;
let totalBytes = 0;
let maxBytes = 0;

// Eşzamanlı indirmeyi 6 ile sınırla
for (let i = 0; i < entries.length; i += 6) {
  const batch = entries.slice(i, i + 6);
  await Promise.all(batch.map(([key, val]) => processExercise(key, val)));
}

for (const [key] of entries) {
  for (const name of ["start-480.webp", "start.webp", "end-480.webp", "end.webp"]) {
    const size = fs.statSync(path.join(outRoot, key, name)).size;
    fileCount += 1;
    totalBytes += size;
    if (size > maxBytes) maxBytes = size;
  }
}

console.log(
  `Tamamlandı: ${entries.length} hareket, ${fileCount} dosya, en büyük=${(maxBytes / 1024).toFixed(1)} KB, toplam=${(totalBytes / 1024 / 1024).toFixed(2)} MB`
);
