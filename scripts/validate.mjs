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

const {
  CORE_LIBRARY,
  DEFAULT_PROFILE,
  NUTRITION_PROTOCOL,
  PROGRAM_MODES,
  THREE_DAY_TEMPLATES,
  WORKOUT_DAYS,
  calculateProfileTargets,
  getProgramDays,
} = await import(pathToFileURL(path.join(rootDir, "data.js")).href);
const { scaleMealPlanForProfile } = await import(
  pathToFileURL(path.join(rootDir, "src", "nutrition.js")).href
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

// 5. Tüm program modlarındaki hareketlerde pyramidSets, restSeconds ve gün başına en fazla 2 ısınma hareketi
const exStructureIssues = [];
const noWarmupIds = new Set([
  "stomach-vacuum-card",
  "farmers-walk",
  "renegade-row-pushup",
  "kettlebell-swing",
  "cable-lateral-raise-day4",
  "hip-thrust-3day",
  "single-arm-row-3day",
]);
let totalModeExercises = 0;
for (const modeInfo of PROGRAM_MODES) {
  for (const day of getProgramDays(modeInfo.id)) {
    let warmupCount = 0;
    for (const ex of day.exercises) {
      totalModeExercises += 1;
      if (!Array.isArray(ex.pyramidSets) || ex.pyramidSets.length === 0) {
        exStructureIssues.push(`${modeInfo.id}/${ex.id}: pyramidSets eksik`);
      } else {
        const hasWarmup = ex.pyramidSets.some((s) => s.isWarmup);
        if (hasWarmup) warmupCount += 1;
        if (noWarmupIds.has(ex.id) && hasWarmup) {
          exStructureIssues.push(`${modeInfo.id}/${ex.id}: isinma seti olmamali`);
        }
      }
      if (typeof ex.restSeconds !== "number" || ex.restSeconds <= 0) {
        exStructureIssues.push(`${modeInfo.id}/${ex.id}: restSeconds eksik`);
      }
    }
    if (warmupCount > 2) {
      exStructureIssues.push(`${modeInfo.id}/${day.id}: isinma seti sayisi=${warmupCount} (>2)`);
    }
  }
}
check(
  "Hareket set & restSeconds yapısı",
  exStructureIssues.length === 0,
  exStructureIssues.length === 0
    ? `${PROGRAM_MODES.length} program modunda toplam ${totalModeExercises} hareket slotu eksiksiz`
    : exStructureIssues.join("; ")
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
  "single-arm-row-3day",
]);
const gripConflicts = [];
for (const modeInfo of PROGRAM_MODES) {
  for (const day of getProgramDays(modeInfo.id)) {
    for (const ex of day.exercises) {
      if (GRIP_TAXING_IDS.has(ex.id) && ex.coreRestId === "hanging_leg_raise") {
        gripConflicts.push(`${modeInfo.id}/${ex.id}`);
      }
      if (ex.coreRestId === "incline_walk") {
        gripConflicts.push(`${modeInfo.id}/${ex.id}->incline_walk`);
      }
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

// 11. 4 günlük ana planda her büyük kas grubu haftada en az 2 farklı günde geçmeli
const mainPlanFreqIssues = [];
const mainMusclePatterns = [
  ["Göğüs", /(Incline Dumbbell Press|Machine Chest Press|Cable Crossover|Göğüs)/i],
  ["Sırt", /(Lat Pulldown|Seated Cable Row|Renegade Row|Sırt)/i],
  ["Omuz", /(Shoulder Press|Lateral Raise|Face Pull|Omuz)/i],
  ["Quadriceps", /(Leg Press|Goblet Squat|Walking Lunges|Ön Bacak|Quadriceps)/i],
  [
    "Arka Bacak/Kalça",
    /(Romanian Deadlift|Seated Leg Curl|Kettlebell Swing|Goblet Squat|Arka Bacak)/i,
  ],
];
for (const [group, re] of mainMusclePatterns) {
  const daysHit = WORKOUT_DAYS.filter((day) =>
    day.exercises.some((ex) => re.test(`${ex.name} ${ex.muscleGroup}`))
  ).length;
  if (daysHit < 2) {
    mainPlanFreqIssues.push(`${group} (${daysHit} gün)`);
  }
}
check(
  "4 günlük ana plan kas sıklığı (≥2×/hafta)",
  mainPlanFreqIssues.length === 0,
  mainPlanFreqIssues.length === 0
    ? "Göğüs, Sırt, Omuz, Quadriceps ve Arka Bacak/Kalça ≥2 gün/hafta"
    : mainPlanFreqIssues.join(", ")
);

// 12. Dinamik beslenme ölçekleme tutarlılığı (4 farklı profil)
const nutritionScaleIssues = [];
const testProfiles = [
  {
    name: "60kg Kadın",
    sex: "female",
    age: 27,
    heightCm: 165,
    weightKg: 60,
    bodyFatPct: 24,
    bmrKcal: 1330,
    activityMultiplier: 1.45,
    targetBodyFatPct: 19,
  },
  { name: "80kg Erkek (Varsayılan)", ...DEFAULT_PROFILE },
  {
    name: "95kg Erkek",
    sex: "male",
    age: 30,
    heightCm: 182,
    weightKg: 95,
    bodyFatPct: 22,
    bmrKcal: 1960,
    activityMultiplier: 1.5,
    targetBodyFatPct: 14,
  },
  {
    name: "110kg Erkek",
    sex: "male",
    age: 32,
    heightCm: 186,
    weightKg: 110,
    bodyFatPct: 26,
    bmrKcal: 2150,
    activityMultiplier: 1.45,
    targetBodyFatPct: 15,
  },
];
for (const prof of testProfiles) {
  const targets = calculateProfileTargets(prof);
  const plan = scaleMealPlanForProfile(NUTRITION_PROTOCOL.dailyMeals, targets);
  if (plan.restTargetKcal < targets.bmrKcal) {
    nutritionScaleIssues.push(`${prof.name}: restTargetKcal < bmrKcal`);
  }
  const sumMode = (key) =>
    plan.scaledMeals.reduce(
      (a, m) => ({
        kcal: a.kcal + m[key].kcal,
        protein: a.protein + m[key].protein,
      }),
      { kcal: 0, protein: 0 }
    );
  const tSum = sumMode("totals");
  const rSum = sumMode("restDayTotals");
  if (Math.abs(tSum.kcal - plan.trainingTargetKcal) / plan.trainingTargetKcal > 0.05) {
    nutritionScaleIssues.push(`${prof.name}: antrenman kcal sapma > %5`);
  }
  if (Math.abs(rSum.kcal - plan.restTargetKcal) / plan.restTargetKcal > 0.05) {
    nutritionScaleIssues.push(`${prof.name}: dinlenme kcal sapma > %5`);
  }
  for (const meal of plan.scaledMeals) {
    for (const [modeKey, totProt] of [
      ["totals", tSum.protein],
      ["restDayTotals", rSum.protein],
    ]) {
      const m = meal[modeKey];
      const macroSumKcal = m.protein * 4 + m.carbs * 4 + m.fat * 9;
      if (Math.abs(macroSumKcal - m.kcal) / m.kcal > 0.03) {
        nutritionScaleIssues.push(`${prof.name}/${meal.title} (${modeKey}): makro-kcal fark > %3`);
      }
      if (m.protein / totProt > 0.48) {
        nutritionScaleIssues.push(`${prof.name}/${meal.title} (${modeKey}): protein payı > %48`);
      }
    }
  }
}
check(
  "Dinamik beslenme ölçekleme tutarlılığı (4 profil)",
  nutritionScaleIssues.length === 0,
  nutritionScaleIssues.length === 0
    ? "4 farklı profilde öğün kalorileri, ±%5 hedef ve ≤%48 tek öğün protein kuralı doğrulandı"
    : nutritionScaleIssues.slice(0, 4).join("; ")
);

// 13. SVG sprite sembol eşleşmesi
const rawHtml = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const definedSymbols = new Set(
  [...rawHtml.matchAll(/<symbol[^>]+id="icon-([^"]+)"/g)].map((m) => m[1])
);
const missingIcons = [];
for (const filePath of projectFiles) {
  if (!filePath.endsWith(".js") && !filePath.endsWith(".html")) continue;
  const txt = fs.readFileSync(filePath, "utf8");
  const rel = path.relative(rootDir, filePath);
  for (const match of txt.matchAll(/lucideIcon\(\s*["']([^"']+)["']/g)) {
    if (!definedSymbols.has(match[1])) missingIcons.push(`${rel}: ${match[1]}`);
  }
  for (const match of txt.matchAll(/href="#icon-([a-z0-9-]+)"/gi)) {
    if (!definedSymbols.has(match[1])) missingIcons.push(`${rel}: #icon-${match[1]}`);
  }
}
check(
  "SVG sprite sembol eşleşmesi",
  missingIcons.length === 0,
  missingIcons.length === 0
    ? `${definedSymbols.size} ikon sembolü ve tüm kullanımlar eşleşti`
    : `eksik=${missingIcons.join(", ")}`
);

// 14. Ölü video kalıntısı olmaması ve Service Worker yaşam döngüsü kontrolleri
const deadVideoHits = [];
for (const filePath of projectFiles) {
  const txt = fs.readFileSync(filePath, "utf8");
  if (/\b(frontMp4|sideMp4)\b/.test(txt)) {
    deadVideoHits.push(path.relative(rootDir, filePath));
  }
}
const hasMediaCacheProtected =
  /const MEDIA_CACHE\s*=/.test(swText) &&
  /validCaches\s*=\s*new Set\(\[[^\]]*MEDIA_CACHE/.test(swText);
const hasSkipWaitingHandler =
  /addEventListener\(\s*["']message["'][\s\S]*SKIP_WAITING[\s\S]*skipWaiting/.test(swText);
check(
  "Ölü video temizliği ve SW yaşam döngüsü",
  deadVideoHits.length === 0 && hasMediaCacheProtected && hasSkipWaitingHandler,
  deadVideoHits.length === 0 && hasMediaCacheProtected && hasSkipWaitingHandler
    ? "0 ölü video referansı; MEDIA_CACHE korumalı ve SKIP_WAITING dinleyicisi aktif"
    : `deadVideo=${deadVideoHits.join(",")} mediaCache=${hasMediaCacheProtected} skipWaiting=${hasSkipWaitingHandler}`
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
