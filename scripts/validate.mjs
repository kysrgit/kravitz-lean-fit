/**
 * Dosya: scripts/validate.mjs
 * Açıklama: Kravitz Lean & Fit program ve kod tabanı doğrulama scripti (sıfır dış bağımlılık).
 * Beslenme makro-kalori tutarlılığını, öğün toplamlarını, yasaklı/kişisel ifadeleri,
 * ısınma/dinlenme yapısını, kavrama çakışmalarını ve sağlık uyarısı varlığını kontrol eder.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const { CORE_LIBRARY, NUTRITION_PROTOCOL, THREE_DAY_TEMPLATES, WORKOUT_DAYS } = await import(
  pathToFileURL(path.join(rootDir, "data.js")).href
);

const failures = [];
const passes = [];

function check(name, condition, detail) {
  if (condition) {
    passes.push(`PASS · ${name}: ${detail}`);
  } else {
    failures.push(`FAIL · ${name}: ${detail}`);
  }
}

function collectProjectTextFiles() {
  const targets = [
    path.join(rootDir, "index.html"),
    path.join(rootDir, "data.js"),
    path.join(rootDir, "app.js"),
    path.join(rootDir, "styles.css"),
    path.join(rootDir, "sw.js"),
    path.join(rootDir, "README.md"),
  ];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "vendor") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".js") || entry.name.endsWith(".css")) targets.push(full);
    }
  };
  for (const sub of ["src", "js", "styles"]) {
    const subRoot = path.join(rootDir, sub);
    if (fs.existsSync(subRoot)) walk(subRoot);
  }
  return targets.filter((p) => fs.existsSync(p));
}

// 1. Makro toplami ile kalori hedefi (±%5)
const { targetKcal, proteinG, carbsG, fatG } = NUTRITION_PROTOCOL.summary;
const macroKcal = proteinG * 4 + carbsG * 4 + fatG * 9;
const summaryDiffRatio = Math.abs(macroKcal - targetKcal) / targetKcal;
check(
  "Makro-kalori uyumu",
  summaryDiffRatio <= 0.05,
  `targetKcal=${targetKcal}, hesaplanan=${macroKcal} (fark %${(summaryDiffRatio * 100).toFixed(2)})`
);

// 2. Her ogunde totals ve restDayTotals alani + tutarlilik (±%10)
const mealIssues = [];
for (const meal of NUTRITION_PROTOCOL.dailyMeals) {
  for (const field of ["totals", "restDayTotals"]) {
    const t = meal[field];
    if (!t || [t.kcal, t.protein, t.carbs, t.fat].some((v) => typeof v !== "number")) {
      mealIssues.push(`${meal.title} (${field} eksik)`);
      continue;
    }
    const calc = t.protein * 4 + t.carbs * 4 + t.fat * 9;
    const diff = Math.abs(calc - t.kcal) / t.kcal;
    if (diff > 0.1) {
      mealIssues.push(`${meal.title} (${field} fark %${(diff * 100).toFixed(1)})`);
    }
  }
}
check(
  "Öğün totals alanları",
  mealIssues.length === 0,
  mealIssues.length === 0
    ? `${NUTRITION_PROTOCOL.dailyMeals.length} öğün tam uyumlu`
    : mealIssues.join("; ")
);

// 3. Yasakli ifadeler kontrolu
const projectFiles = collectProjectTextFiles();
const forbiddenChecks = [
  { label: "yok edici", regex: /yok edici/i },
  { label: "insülini sıfır", regex: /ins[uü]lini s[iı]f[iı]r/i },
  { label: "4K", regex: /(?:^|[^a-z0-9])4k(?:$|[^a-z0-9])/i },
  { label: "koruma moduna", regex: /koruma moduna/i },
  { label: "BPM'de yağ yakar", regex: /bpm['’]?de ya[ğg] yakar/i },
  { label: "açık kaynak video", regex: /a[çc][iı]k kaynak(?:l[iı])?\s*video/i },
];
const forbiddenHits = [];
for (const filePath of projectFiles) {
  const content = fs.readFileSync(filePath, "utf8");
  const rel = path.relative(rootDir, filePath);
  for (const rule of forbiddenChecks) {
    if (rule.regex.test(content)) {
      forbiddenHits.push(`${rel} -> "${rule.label}"`);
    }
  }
}
check(
  "Yasaklı ifadeler",
  forbiddenHits.length === 0,
  forbiddenHits.length === 0 ? "0 eşleşme" : forbiddenHits.join(", ")
);

// 4. Kisisel olcum verisi kontrolu
const personalTokens = [
  "TANITA_PROFILE",
  "84,4",
  "84.4",
  "62,9",
  "62.9",
  "18,3",
  "18.3",
  "21,7",
  "21.7",
  "23,1",
  "23.1",
  "1970",
  "47,1",
  "55,8",
  "22.05.2026",
];
const personalHits = [];
for (const filePath of projectFiles) {
  const content = fs.readFileSync(filePath, "utf8");
  const rel = path.relative(rootDir, filePath);
  for (const token of personalTokens) {
    if (content.includes(token)) {
      personalHits.push(`${rel} -> "${token}"`);
    }
  }
}
check(
  "Kişisel ölçüm verisi temizliği",
  personalHits.length === 0,
  personalHits.length === 0 ? "0 kişisel değer kaldı" : personalHits.join(", ")
);

// 5. Her harekette pyramidSets, restSeconds ve gün başına en fazla 2 ısınma hareketi
const exStructureIssues = [];
const noWarmupIds = new Set(["stomach-vacuum-card", "farmers-walk", "renegade-row-pushup"]);
for (const day of WORKOUT_DAYS) {
  let warmupCount = 0;
  for (const ex of day.exercises) {
    if (!Array.isArray(ex.pyramidSets) || ex.pyramidSets.length === 0) {
      exStructureIssues.push(`${ex.id}: pyramidSets eksik`);
    } else {
      const hasWarmup = ex.pyramidSets.some((s) => s.isWarmup);
      if (hasWarmup) warmupCount += 1;
      if (noWarmupIds.has(ex.id) && hasWarmup) {
        exStructureIssues.push(`${ex.id}: isinma seti olmamali`);
      }
    }
    if (typeof ex.restSeconds !== "number" || ex.restSeconds <= 0) {
      exStructureIssues.push(`${ex.id}: restSeconds eksik`);
    }
  }
  if (warmupCount > 2) {
    exStructureIssues.push(`${day.id}: isinma seti olan hareket sayisi=${warmupCount} (>2)`);
  }
}
check(
  "Hareket set & restSeconds yapısı",
  exStructureIssues.length === 0,
  exStructureIssues.length === 0 ? "20 ana hareketin tamamı eksiksiz" : exStructureIssues.join("; ")
);

// 6. Kavramayi yoran hareketlere hanging_leg_raise eslesmesi + incline_walk ayrımı
const GRIP_TAXING_IDS = new Set([
  "romanian-deadlift",
  "wide-grip-lat-pulldown",
  "seated-cable-row",
  "straight-arm-pulldown",
  "farmers-walk",
  "renegade-row-pushup",
  "kettlebell-swing",
  "dumbbell-bicep-curl",
  "incline-hammer-curl",
]);
const gripConflicts = [];
for (const day of WORKOUT_DAYS) {
  for (const ex of day.exercises) {
    if (GRIP_TAXING_IDS.has(ex.id) && ex.coreRestId === "hanging_leg_raise") {
      gripConflicts.push(ex.id);
    }
    if (ex.coreRestId === "incline_walk") {
      gripConflicts.push(`${ex.id}->incline_walk`);
    }
  }
}
const inclineInsideCore = Object.prototype.hasOwnProperty.call(CORE_LIBRARY, "incline_walk");
check(
  "Kavrama çakışması ve Bitiriş Kardiyosu ayrımı",
  gripConflicts.length === 0 && !inclineInsideCore,
  gripConflicts.length === 0 && !inclineInsideCore
    ? "0 kavrama çakışması; incline_walk CORE_LIBRARY dışında"
    : `çakışma=${gripConflicts.join(",")} inclineInsideCore=${inclineInsideCore}`
);

// 7. Saglik uyarisi sayfada var mi?
const htmlText = fs.readFileSync(path.join(rootDir, "index.html"), "utf8").replace(/\s+/g, " ");
const disclaimerPhrase =
  "Bu içerik tıbbi tavsiye değildir; kronik rahatsızlık, ilaç kullanımı veya ağrı varsa hekime danışın.";
const disclaimerCount = htmlText.split(disclaimerPhrase).length - 1;
check(
  "Sağlık uyarısı metni",
  disclaimerCount >= 2,
  `index.html içinde ${disclaimerCount} konumda mevcut (banner + footer)`
);

// 8. Service Worker önbellek dosyaları diskte mevcut mu?
const swText = fs.readFileSync(path.join(rootDir, "sw.js"), "utf8");
const swBlock = swText.match(/APP_SHELL_URLS\s*=\s*\[([\s\S]*?)\]/);
const swUrls = swBlock ? [...swBlock[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
const missingSw = swUrls
  .filter((u) => u !== "./")
  .filter((u) => !fs.existsSync(path.join(rootDir, u.replace(/^\.\//, ""))));
check(
  "Service Worker önbellek dosyaları",
  swUrls.length > 0 && missingSw.length === 0,
  missingSw.length === 0
    ? `${swUrls.length} önbellek girdisi doğrulandı`
    : `eksik=${missingSw.join(",")}`
);

// 9. 3 günlük şablonlarda her büyük kas grubu haftada en az 2 kez geçmeli
const templateFreqIssues = [];
const musclePatterns = [
  ["Göğüs", /(Incline DB Press|Chest Press|Cable Crossover)/i],
  ["Sırt", /(Cable Row|Lat Pulldown|Single-Arm\/Cable Row|Straight-Arm Pulldown)/i],
  ["Omuz", /(Lateral Raise|Shoulder Press|Face Pull)/i],
  ["Quadriceps", /(Leg Press|Walking Lunges|Goblet Squat)/i],
  ["Arka Bacak/Kalça", /(Romanian Deadlift|Leg Curl|Hip Thrust|Back Extension|Kettlebell Swing)/i],
];
for (const tpl of THREE_DAY_TEMPLATES.templates) {
  for (const [group, re] of musclePatterns) {
    const count = tpl.days.filter((d) => re.test(d)).length;
    if (count < 2) templateFreqIssues.push(`${tpl.id}: ${group} (${count}x)`);
  }
}
check(
  "3 günlük şablon kas sıklığı (≥2×/hafta)",
  templateFreqIssues.length === 0,
  templateFreqIssues.length === 0
    ? `${THREE_DAY_TEMPLATES.templates.length} şablonda tüm büyük kas grupları ≥2×/hafta`
    : templateFreqIssues.join("; ")
);

// 10. Eşleşmesi olan her videoKey için 4 WebP görsel dosyasının diskte varlığı
const fedbMapping = JSON.parse(
  fs.readFileSync(path.join(rootDir, "data", "fedb-mapping.json"), "utf8")
);
const missingImages = [];
for (const [key, val] of Object.entries(fedbMapping)) {
  if (!val) continue;
  for (const name of ["start.webp", "end.webp", "start-480.webp", "end-480.webp"]) {
    const imgPath = path.join(rootDir, "assets", "exercises", key, name);
    if (!fs.existsSync(imgPath)) missingImages.push(`${key}/${name}`);
  }
}
check(
  "Egzersiz görsel dosyaları (free-exercise-db)",
  missingImages.length === 0,
  missingImages.length === 0
    ? `${Object.values(fedbMapping).filter(Boolean).length * 4} WebP görseli doğrulandı`
    : `eksik=${missingImages.slice(0, 5).join(",")}`
);

for (const line of passes) {
  console.log(line);
}
for (const line of failures) {
  console.error(line);
}

if (failures.length > 0) {
  console.error(`\nToplam ${failures.length} doğrulama hatası bulundu.`);
  process.exit(1);
}
console.log(`\nTüm ${passes.length} doğrulama kontrolü başarıyla geçti.`);
