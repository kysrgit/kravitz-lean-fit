/**
 * Dosya: src/render/sections.js
 * Açıklama: Program günleri, tam yazılı/tablolu özet, Core rehberi, beslenme protokolü,
 * bel/kilo trend SVG grafiği, bilimsel kaynaklar ve arama sonuçlarını render eder.
 */

import {
  CARDIO_FINISHER,
  CORE_LIBRARY,
  LIFESTYLE_AND_WARMUP,
  NUTRITION_PROTOCOL,
  PROGRESSION_MODEL,
  SCIENTIFIC_SOURCES,
  SYSTEM_PILLARS,
  THREE_DAY_TEMPLATES,
  WORKOUT_DAYS,
  getExerciseMedia,
} from "../../data.js";
import {
  elements,
  escapeHtml,
  findMatchingVariantIndex,
  getActiveProfileTargets,
  loadBodyLogs,
  saveBodyLogs,
  state,
  syncProfileForm,
} from "../state.js";
import { createCoreCardHtml, createDaySummaryTableHtml, createExerciseCardHtml } from "./cards.js";

export function renderSourcesSectionHtml() {
  return `
    <section class="sources-panel" aria-labelledby="sources-heading">
      <div class="sources-header">
        <h3 id="sources-heading">📚 Kaynaklar</h3>
        <p class="muted-text">
          Bu uygulama <strong>Kravitz'ten Esinlenilmiş Uyarlama</strong>dır. Basın haberlerinde
          (Men's Health AU; Fitbook, 2026) Kravitz'in haftada 5-6 gün ve 50-35-21-14-10 veya
          50-25-12-5 tekrar şemalarıyla çalıştığı, bilinçli aralıklı oruç uygulamadığı aktarılır;
          buradaki 4 günlük 30-15-10-5 şeması ve isteğe bağlı öğün penceresi sürdürülebilir bir uyarlamadır.
        </p>
      </div>
      <ul class="sources-list">
        ${SCIENTIFIC_SOURCES.map(
          (src) => `
          <li class="source-item">
            <div class="source-topic">${escapeHtml(src.topic)}</div>
            <div class="source-citation">${escapeHtml(src.citation)}</div>
            <p class="source-note">${escapeHtml(src.note)}</p>
          </li>
        `
        ).join("")}
      </ul>
    </section>
  `;
}

// Sistem temel kurallarını (3 sütun) render eder
export function renderSystemPillars() {
  elements.pillarsGrid.innerHTML = SYSTEM_PILLARS.map(
    (pillar) => `
      <article class="pillar-card">
        <span class="pillar-badge">${escapeHtml(pillar.badge)}</span>
        <h3>${escapeHtml(pillar.title)}</h3>
        <p>${escapeHtml(pillar.description)}</p>
      </article>
    `
  ).join("");
}

// localStorage üzerinden kayıtlı profili güvenli (try/catch) biçimde okur
// Güvenli tarih anahtarı (YYYY-AA-GG)

export function createBodyTrendSvgHtml(logs) {
  if (!logs || logs.length === 0) {
    return `<p class="muted-text">Henüz bel/kilo kaydı yok. Yukarıdan haftalık ölçüm eklediğinde trend grafiği burada oluşur.</p>`;
  }

  if (logs.length === 1) {
    const single = logs[0];
    return `<p class="muted-text">İlk kayıt alındı (${escapeHtml(single.date)} · Bel: ${escapeHtml(single.waistCm)} cm · Kilo: ${escapeHtml(single.weightKg)} kg). Trend çizgisi için en az 2 haftalık ölçüm ekle.</p>`;
  }

  const width = 340;
  const height = 136;
  const padX = 28;
  const padY = 20;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;

  const waists = logs.map((l) => Number(l.waistCm));
  const weights = logs.map((l) => Number(l.weightKg));
  const minWst = Math.min(...waists) - 1;
  const maxWst = Math.max(...waists) + 1;
  const minWgt = Math.min(...weights) - 1;
  const maxWgt = Math.max(...weights) + 1;

  const mapPoints = (vals, minVal, maxVal) => {
    const span = Math.max(0.5, maxVal - minVal);
    return vals.map((v, idx) => {
      const x = padX + (idx / Math.max(1, vals.length - 1)) * plotW;
      const y = padY + plotH - ((v - minVal) / span) * plotH;
      return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), v };
    });
  };

  const waistPts = mapPoints(waists, minWst, maxWst);
  const weightPts = mapPoints(weights, minWgt, maxWgt);
  const toPolyline = (pts) => pts.map((p) => `${p.x},${p.y}`).join(" ");

  return `
    <div class="svg-trend-legend">
      <span class="legend-waist">● Bel (cm)</span>
      <span class="legend-weight">● Kilo (kg)</span>
    </div>
    <svg class="body-trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Haftalık bel çevresi ve kilo trend grafiği">
      <line x1="${padX}" y1="${padY}" x2="${padX}" y2="${height - padY}" stroke="#334155" stroke-width="1" />
      <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" stroke="#334155" stroke-width="1" />
      <polyline fill="none" stroke="#f59e0b" stroke-width="2.5" points="${escapeHtml(toPolyline(waistPts))}" />
      <polyline fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-dasharray="4 3" points="${escapeHtml(toPolyline(weightPts))}" />
      ${waistPts.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#f59e0b" />`).join("")}
      ${weightPts.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#38bdf8" />`).join("")}
      <text x="${padX}" y="${height - 4}" fill="#94a3b8" font-size="9">${escapeHtml(logs[0].date)}</text>
      <text x="${width - padX}" y="${height - 4}" text-anchor="end" fill="#94a3b8" font-size="9">${escapeHtml(logs[logs.length - 1].date)}</text>
    </svg>
  `;
}

// Bel ve kilo günlük listesi + trend grafiğini render eder
export function renderBodyLogsSection() {
  const chartEl = document.getElementById("body-log-chart");
  const listEl = document.getElementById("body-log-list");
  if (!chartEl || !listEl) return;

  const logs = loadBodyLogs();
  chartEl.innerHTML = createBodyTrendSvgHtml(logs);

  if (logs.length === 0) {
    listEl.innerHTML = "";
    return;
  }

  const recentDesc = [...logs].reverse().slice(0, 8);
  listEl.innerHTML = `
    <ul class="body-log-items">
      ${recentDesc
        .map(
          (entry) => `
        <li class="body-log-row">
          <span><strong>${escapeHtml(entry.date)}</strong> · Bel: <strong>${escapeHtml(entry.waistCm)} cm</strong> · Kilo: ${escapeHtml(entry.weightKg)} kg</span>
          <button type="button" class="body-log-del-btn" data-del-body-date="${escapeHtml(entry.date)}">Sil</button>
        </li>
      `
        )
        .join("")}
    </ul>
  `;

  listEl.querySelectorAll("[data-del-body-date]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetDate = btn.dataset.delBodyDate;
      const updated = loadBodyLogs().filter((item) => item.date !== targetDate);
      saveBodyLogs(updated);
      renderBodyLogsSection();
    });
  });
}

// Dinlenme sayacı, Wake Lock ve ses/titreşim yönetimi

export function renderTanitaSection() {
  const profile = getActiveProfileTargets();
  syncProfileForm(profile);

  const sourceLabel = profile.isCustom ? "Kayıtlı Profilin (Bu Cihazda)" : "Örnek Değerler";
  elements.tanitaMeta.textContent = `${sourceLabel} · Yaş: ${profile.age} · Hedef: ${profile.targetStyle}`;
  if (elements.profileTargetChip) {
    elements.profileTargetChip.textContent = `Hedef: %${profile.targetBodyFatPct} Yağ · ~${profile.targetWeightKg} kg · ${profile.targetCalories} kcal`;
  }

  const metricsHtml = profile.metrics
    .map(
      (item) => `
      <article class="tanita-card ${item.highlight ? "highlight" : ""}">
        <div class="tanita-label">${escapeHtml(item.label)}</div>
        <div class="tanita-values">
          <span class="tanita-current">${escapeHtml(item.current)}</span>
          <span class="tanita-target">→ ${escapeHtml(item.target)}</span>
        </div>
        <p class="tanita-note">${escapeHtml(item.note)}</p>
      </article>
    `
    )
    .join("");

  elements.tanitaGrid.innerHTML = `
    ${metricsHtml}
    <p class="bia-standard-note" style="grid-column: 1 / -1;">📏 <strong>Ölçüm Standardı:</strong> ${escapeHtml(profile.biaMeasurementNote)}</p>
  `;
}

// Aktif sekmeye geçer, aramayı temizler ve isteğe bağlı içerik alanına yumuşakça odaklanır

export function createWarmupBannerHtml() {
  const { warmupProtocol } = LIFESTYLE_AND_WARMUP;
  return `
    <div class="warmup-banner">
      <div class="warmup-banner-head">
        <strong>🔥 ${escapeHtml(warmupProtocol.title)}:</strong>
        <span>${escapeHtml(warmupProtocol.summary)}</span>
      </div>
      <ul class="warmup-steps-list">
        ${warmupProtocol.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
      </ul>
    </div>
  `;
}

// Günlük adım hedefi, uyku ve ısınma kartlarını üretir
export function createLifestyleGridHtml() {
  const { dailySteps, sleep, warmupProtocol } = LIFESTYLE_AND_WARMUP;
  return `
    <div class="three-col-grid lifestyle-grid">
      <article class="info-panel">
        <span class="meal-time-badge">👣 Günlük Aktivite</span>
        <h3>${escapeHtml(dailySteps.title)}</h3>
        <div class="lifestyle-target">${escapeHtml(dailySteps.target)}</div>
        <p class="muted-text">${escapeHtml(dailySteps.description)}</p>
      </article>
      <article class="info-panel">
        <span class="meal-time-badge">😴 Toparlanma</span>
        <h3>${escapeHtml(sleep.title)}</h3>
        <div class="lifestyle-target">${escapeHtml(sleep.target)}</div>
        <p class="muted-text">${escapeHtml(sleep.description)}</p>
      </article>
      <article class="info-panel">
        <span class="meal-time-badge">🔥 Seans Başlangıcı</span>
        <h3>${escapeHtml(warmupProtocol.title)}</h3>
        <div class="lifestyle-target">${escapeHtml(warmupProtocol.summary)}</div>
        <ul class="table-bullets">
          ${warmupProtocol.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
        </ul>
      </article>
    </div>
  `;
}

// Çift ilerleme + deload ve 3 günlük alternatif şablon panelini oluşturur
export function createProgressionAndTemplatesHtml() {
  const templatesHtml = THREE_DAY_TEMPLATES.templates
    .map(
      (tpl) => `
      <div class="template-subcard">
        <div class="template-subhead">
          <strong>${escapeHtml(tpl.name)}</strong>
          <span class="tag-chip">${escapeHtml(tpl.frequencyNote)}</span>
        </div>
        <ul class="table-bullets">
          ${tpl.days.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}
        </ul>
      </div>
    `
    )
    .join("");

  return `
    <section class="progression-section" aria-label="İlerleme kuralı ve 3 günlük alternatif">
      <div class="two-col-grid">
        <article class="info-panel">
          <h3>📈 ${escapeHtml(PROGRESSION_MODEL.title)}</h3>
          <ul class="table-bullets">
            <li><strong>Çift İlerleme:</strong> ${escapeHtml(PROGRESSION_MODEL.doubleProgression)}</li>
            <li><strong>Planlı Deload:</strong> ${escapeHtml(PROGRESSION_MODEL.deloadRule)}</li>
            <li><strong>Isınma Notu:</strong> ${escapeHtml(PROGRESSION_MODEL.warmupNote)}</li>
          </ul>
        </article>

        <article class="info-panel">
          <h3>📅 Haftada 3 Gün Antrenman Alternatifi (≥2×/Hafta Frekans)</h3>
          <p class="muted-text" style="margin-bottom:10px;">${escapeHtml(THREE_DAY_TEMPLATES.intro)}</p>
          <div class="templates-stack">${templatesHtml}</div>
        </article>
      </div>
    </section>
  `;
}

// Core kataloğu veya bitiriş kardiyosu öğesini id ile getirir

export function createCardioFinisherSectionHtml() {
  return `
    <section class="finisher-section" aria-label="Bitiriş Kardiyosu">
      <div class="finisher-section-header">
        <div>
          <span class="finisher-badge">🏃 BİTİRİŞ KARDİYOSU · CORE DEĞİL</span>
          <h3>Antrenman Sonu İsteğe Bağlı Kondisyon Finisher</h3>
          <p class="muted-text">
            Eğimli yürüyüş bir karın (core) hareketi değildir; kavrama veya set arası dinlenmeyi etkilemeden
            yalnızca seans sonunda toplam enerji harcamasını ve kondisyonu desteklemek için ayrılmıştır.
          </p>
        </div>
      </div>
      <div class="core-grid">
        ${createCoreCardHtml(CARDIO_FINISHER)}
      </div>
    </section>
  `;
}

// Seçilen antrenman günü için okunaklı ve etkileşimli tablo özeti üretir

export function renderWorkoutDay(day) {
  const viewModeBarHtml = `
    <div class="view-mode-bar" role="group" aria-label="Görünüm modu seçici">
      <span class="view-mode-label">Görünüm Modu:</span>
      <div class="view-mode-buttons">
        <button
          type="button"
          class="view-mode-btn ${state.viewMode === "both" ? "active" : ""}"
          data-view-mode="both"
        >
          📋 Tablo + Hareket Kartları
        </button>
        <button
          type="button"
          class="view-mode-btn ${state.viewMode === "table-only" ? "active" : ""}"
          data-view-mode="table-only"
        >
          📊 Sadece Yazılı / Tablo Özeti
        </button>
        <button
          type="button"
          class="view-mode-btn ${state.viewMode === "cards-only" ? "active" : ""}"
          data-view-mode="cards-only"
        >
          🏋️ Sadece Hareket Kartları
        </button>
      </div>
    </div>
  `;

  const tableHtml =
    state.viewMode !== "cards-only"
      ? createDaySummaryTableHtml(day, { showDayHeader: false, showJumpBtn: false })
      : "";

  const cardsSectionHtml =
    state.viewMode !== "table-only"
      ? `<div class="exercises-grid">${day.exercises
          .map((exercise) =>
            createExerciseCardHtml(exercise, `${day.tabLabel} · Hareket ${exercise.order}`)
          )
          .join("")}</div>`
      : "";

  elements.contentArea.innerHTML = `
    <div class="day-banner">
      <div>
        <h2>${escapeHtml(day.fullTitle)}</h2>
        <p>${escapeHtml(day.targetGoal)}</p>
      </div>
      <div class="day-meta-badges">
        <span class="meta-pill">⏱ ${escapeHtml(day.duration)}</span>
        <span class="meta-pill">📅 ${escapeHtml(day.scheduleNote)}</span>
      </div>
    </div>
    ${createWarmupBannerHtml()}
    ${viewModeBarHtml}
    ${tableHtml}
    ${cardsSectionHtml}
    ${createProgressionAndTemplatesHtml()}
    ${createCardioFinisherSectionHtml()}
  `;
}

// Tüm programın yazılı ve tablolu özetini tek sayfada render eder
export function renderFullSummaryTab() {
  const weeklyScheduleRowsHtml = WORKOUT_DAYS.map(
    (day) => `
      <tr>
        <td data-label="Gün"><strong>${escapeHtml(day.tabLabel)}</strong><div class="table-alt-meta">${escapeHtml(day.shortTitle)}</div></td>
        <td data-label="Odak Bölgeler">${escapeHtml(day.fullTitle.replace(/^\d+\.\s*GÜN:\s*/i, ""))}</td>
        <td data-label="Süre"><span class="tag-chip equipment">${escapeHtml(day.duration)}</span></td>
        <td data-label="Takvim Notu">${escapeHtml(day.scheduleNote)}</td>
        <td data-label="Hızlı Geçiş">
          <button type="button" class="table-jump-btn" data-jump-day="${escapeHtml(day.id)}">
            Gün Kartlarını Aç →
          </button>
        </td>
      </tr>
    `
  ).join("");

  const allDaysTablesHtml = WORKOUT_DAYS.map((day) =>
    createDaySummaryTableHtml(day, { showDayHeader: true, showJumpBtn: true })
  ).join("");

  const coreRowsHtml = Object.values(CORE_LIBRARY)
    .map((core) => {
      const altsHtml = (core.alternatives || [])
        .map(
          (alt, idx) => `
          <div class="table-alt-item">
            <button
              type="button"
              class="table-alt-btn"
              data-open-core="${escapeHtml(core.id)}"
              data-open-variant="${idx + 1}"
            >
              <strong>Alt ${idx + 1}:</strong> ${escapeHtml(alt.name)}
            </button>
            <div class="table-alt-meta">${escapeHtml(alt.turkishName)}${alt.reps ? ` · ${escapeHtml(alt.reps)}` : ""}</div>
            ${
              alt.whenToUse
                ? `<div class="table-alt-when"><strong>Ne zaman:</strong> ${escapeHtml(alt.whenToUse)}</div>`
                : ""
            }
          </div>
        `
        )
        .join("");

      return `
        <tr>
          <td class="col-main" data-label="Core Hareketi">
            <div class="table-ex-name">${escapeHtml(core.name)}</div>
            <div class="table-ex-tr">${escapeHtml(core.turkishName)}</div>
            <div class="table-meta-row">
              <button
                type="button"
                class="table-video-btn"
                data-open-core="${escapeHtml(core.id)}"
                data-open-variant="0"
              >
                Form &amp; Detay
              </button>
              <a
                href="${escapeHtml(getExerciseMedia(core).sourceUrl || "https://musclewiki.com/")}"
                target="_blank"
                rel="noopener noreferrer"
                class="table-video-btn"
              >
                Formu izle ↗
              </a>
            </div>
          </td>
          <td data-label="Hedef Bölge"><span class="tag-chip">${escapeHtml(core.target)}</span></td>
          <td data-label="Tekrar / Süre"><strong>${escapeHtml(core.reps)}</strong></td>
          <td class="col-cue" data-label="Nasıl Yapılır">
            <div>${escapeHtml(core.formCue)}</div>
            ${core.macfitTip ? `<div class="table-alt-when"><strong>Salon İpucu:</strong> ${escapeHtml(core.macfitTip)}</div>` : ""}
          </td>
          <td class="col-alts" data-label="Alternatifler"><div class="table-alt-list">${altsHtml}</div></td>
        </tr>
      `;
    })
    .join("");

  const { summary, fastingWindows, fastedTrainingNote, morningFastRules, dailyMeals, waistRules } =
    NUTRITION_PROTOCOL;
  const profileTargets = getActiveProfileTargets();

  const macroRowsHtml = [
    [
      "Günlük Kalori Hedefi",
      `${profileTargets.targetCalories} kcal (Örnek Plan: ${summary.calories})`,
      `Profil BMR (${profileTargets.bmrKcal} kcal) ve tahmini TDEE (${profileTargets.estimatedTdeeKcal} kcal) baz alınır · Haftalık hedef: vücut ağırlığının %0,5-1'i`,
    ],
    [
      "Günlük Protein",
      summary.protein,
      `${profileTargets.muscleMassKg.toFixed(1)} kg kas kütleni korumaya destek olur (örnek planda 180 g; ~1,8-2,2 g/kg)`,
    ],
    [
      "Karbonhidrat (Çiğ/Kuru Bazlı)",
      summary.carbs,
      "Antrenman günlerinde yüksek, dinlenme günlerinde kontrollü (~4 kcal/g)",
    ],
    ["Sağlıklı Yağlar", summary.fats, "Hormon dengesi ve tokluk (~9 kcal/g)"],
    ["Sıvı Tüketimi", summary.water, "Gün boyu dengeli hidrasyon ve elektrolit desteği"],
  ]
    .map(
      ([label, value, note]) => `
      <tr>
        <td data-label="Kalem"><strong>${escapeHtml(label)}</strong></td>
        <td data-label="Günlük Hedef"><span class="table-macro-badge">${escapeHtml(value)}</span></td>
        <td data-label="Amaç / Not">${escapeHtml(note)}</td>
      </tr>
    `
    )
    .join("");

  const trainingSum = dailyMeals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.totals.kcal,
      protein: acc.protein + m.totals.protein,
      carbs: acc.carbs + m.totals.carbs,
      fat: acc.fat + m.totals.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const restSum = dailyMeals.reduce(
    (acc, m) => {
      const t = m.restDayTotals || m.totals;
      return {
        kcal: acc.kcal + t.kcal,
        protein: acc.protein + t.protein,
        carbs: acc.carbs + t.carbs,
        fat: acc.fat + t.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const mealsRowsHtml =
    dailyMeals
      .map(
        (meal) => `
      <tr>
        <td data-label="Saat">
          <span class="meal-time-badge">${escapeHtml(meal.time)}</span>
          <div class="meal-totals-chip">Antrenman: ${escapeHtml(meal.totals.kcal)} kcal (P ${escapeHtml(meal.totals.protein)}g · K ${escapeHtml(meal.totals.carbs)}g · Y ${escapeHtml(meal.totals.fat)}g)</div>
          <div class="meal-totals-chip rest">Dinlenme: ${escapeHtml(meal.restDayTotals.kcal)} kcal (P ${escapeHtml(meal.restDayTotals.protein)}g · K ${escapeHtml(meal.restDayTotals.carbs)}g · Y ${escapeHtml(meal.restDayTotals.fat)}g)</div>
        </td>
        <td data-label="Öğün"><strong>${escapeHtml(meal.title)}</strong></td>
        <td data-label="İçerik (Çiğ / Pişmiş)">
          <ul class="table-bullets">
            ${meal.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </td>
      </tr>
    `
      )
      .join("") +
    `
      <tr class="meals-total-row">
        <td data-label="Günlük Toplam" colspan="3">
          <strong>Antrenman Günü Toplamı:</strong> ${escapeHtml(trainingSum.kcal)} kcal (P ${escapeHtml(trainingSum.protein)} g · K ${escapeHtml(trainingSum.carbs)} g · Y ${escapeHtml(trainingSum.fat)} g)
          &nbsp;|&nbsp;
          <strong>Dinlenme Günü Toplamı:</strong> ${escapeHtml(restSum.kcal)} kcal (P ${escapeHtml(restSum.protein)} g · K ${escapeHtml(restSum.carbs)} g · Y ${escapeHtml(restSum.fat)} g)
        </td>
      </tr>
    `;

  elements.contentArea.innerHTML = `
    <div class="summary-layout">
      <div class="day-banner">
        <div>
          <h2>📋 Kravitz Lean &amp; Fit — Tüm Programın Yazılı &amp; Tablo Özeti</h2>
          <p>
            Kartlar arasında gezinmeden; tüm antrenman günlerini, piramit set/tekrarlarını,
            set arası 21'ler core hareketlerini, alternatifleri ve beslenme protokolünü tek sayfada gör.
          </p>
        </div>
        <div class="day-meta-badges">
          <button type="button" id="print-summary-btn" class="btn-outline btn-print-summary">
            🖨️ Yazdır / PDF Kaydet
          </button>
        </div>
      </div>

      <!-- Mobilde ve Masaüstünde Tek Dokunuşla Bölüm Atlama Çubuğu -->
      <div class="summary-quick-nav" role="navigation" aria-label="Özet Bölümleri Hızlı Geçiş">
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-sec-weekly">🗓️ Haftalık Şema</button>
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-day-day-1">1. Gün</button>
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-day-day-2">2. Gün</button>
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-day-day-3">3. Gün</button>
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-day-day-4">4. Gün</button>
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-sec-core">🔥 21'ler Core</button>
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-sec-nutrition">🥗 Beslenme</button>
      </div>

      <!-- Bölüm 1: Sistem Özeti, Profil Hedefleri & Haftalık Şema -->
      <section id="summary-sec-weekly" class="summary-section-block">
        <div class="summary-section-title-row">
          <h3>1. Sistem Özeti, Profil Hedefleri &amp; Haftalık Antrenman Şeması</h3>
        </div>

        <div class="summary-prose-grid">
          <article class="summary-prose-card">
            <h4>🎯 Sistemin 3 Altın Kuralı (Yazılı Özet)</h4>
            <ul class="table-bullets">
              ${SYSTEM_PILLARS.map(
                (p) =>
                  `<li><strong>${escapeHtml(p.badge)} (${escapeHtml(p.title)}):</strong> ${escapeHtml(p.description)}</li>`
              ).join("")}
            </ul>
          </article>

          <article class="summary-prose-card">
            ${(() => {
              const profile = getActiveProfileTargets();
              const label = profile.isCustom
                ? "Kayıtlı Profilin"
                : "Örnek Profil (Profilim formundan özelleştir)";
              return `
                <h4>📊 Profil Başlangıç → Hedef Özeti</h4>
                <p class="summary-prose-lead">
                  <strong>${escapeHtml(label)}:</strong> ${escapeHtml(profile.age)} yaş ·
                  Hedef: <strong>${escapeHtml(profile.targetStyle)}</strong>
                </p>
                <ul class="table-bullets">
                  ${profile.metrics
                    .map(
                      (m) =>
                        `<li><strong>${escapeHtml(m.label)}:</strong> ${escapeHtml(m.current)} → <strong>${escapeHtml(m.target)}</strong> (${escapeHtml(m.note)})</li>`
                    )
                    .join("")}
                </ul>
              `;
            })()}
          </article>
        </div>

        <div class="summary-table-card">
          <div class="summary-table-header compact">
            <div>
              <h3>🗓️ Haftalık Antrenman Günleri Şeması (3 veya 4 Gün)</h3>
            </div>
          </div>
          <div class="table-responsive">
            <table class="workout-summary-table">
              <thead>
                <tr>
                  <th>Gün</th>
                  <th>Odak Bölgeler</th>
                  <th>Süre</th>
                  <th>Haftalık Takvim Notu</th>
                  <th>Hızlı Geçiş</th>
                </tr>
              </thead>
              <tbody>
                ${weeklyScheduleRowsHtml}
              </tbody>
            </table>
          </div>
        </div>
        ${createProgressionAndTemplatesHtml()}
      </section>

      <!-- Bölüm 2: 4 Günlük Antrenman Programı Tam Tablosu -->
      <section class="summary-section-block">
        <div class="summary-section-title-row">
          <h3>2. 4 Günlük Antrenman Programı Tam Tablosu (1. Gün – 4. Gün)</h3>
        </div>
        <div class="summary-tables-stack">
          ${allDaysTablesHtml}
        </div>
      </section>

      <!-- Bölüm 3: 21'ler Aktif Core & Sabah Mide Vakumu Tam Tablosu -->
      <section id="summary-sec-core" class="summary-section-block">
        <div class="summary-section-title-row">
          <h3>3. 21'ler Aktif Core &amp; Sabah Mide Vakumu Tam Tablosu</h3>
        </div>
        <div class="summary-table-card">
          <div class="table-responsive">
            <table class="workout-summary-table">
              <thead>
                <tr>
                  <th>Core Hareketi</th>
                  <th>Hedef Bölge</th>
                  <th>Tekrar / Süre</th>
                  <th>Nasıl Yapılır (Kısa Özet)</th>
                  <th>Alternatif 1 &amp; Alternatif 2</th>
                </tr>
              </thead>
              <tbody>
                ${coreRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <div class="summary-table-card finisher-summary-card">
          <div class="summary-table-header compact">
            <div>
              <h3>🏃 Bitiriş Kardiyosu (Core Listesinden Ayrı · Seans Sonu)</h3>
              <p>${escapeHtml(CARDIO_FINISHER.turkishName)} (${escapeHtml(CARDIO_FINISHER.reps)}) — ${escapeHtml(CARDIO_FINISHER.macfitTip)}</p>
            </div>
            <button type="button" class="table-video-btn" data-open-core="${escapeHtml(CARDIO_FINISHER.id)}">Form &amp; Alternatifler</button>
          </div>
        </div>
      </section>

      <!-- Bölüm 4: Beslenme, Öğün Zamanlaması & Enerji Dengesi Özeti -->
      <section id="summary-sec-nutrition" class="summary-section-block">
        <div class="summary-section-title-row">
          <h3>4. Beslenme, Öğün Zamanlaması &amp; Enerji Dengesi Protokolü</h3>
        </div>

        <div class="summary-table-card">
          <div class="summary-table-header compact">
            <div>
              <h3>🥗 Günlük Makro &amp; Kalori Hedef Tablosu</h3>
            </div>
          </div>
          <div class="table-responsive">
            <table class="workout-summary-table">
              <thead>
                <tr>
                  <th>Kalem</th>
                  <th>Günlük Hedef</th>
                  <th>Amaç / Not</th>
                </tr>
              </thead>
              <tbody>
                ${macroRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <div class="summary-table-card">
          <div class="summary-table-header compact">
            <div>
              <h3>🕒 Saat Saat Günlük Öğün Tablosu</h3>
            </div>
          </div>
          <div class="table-responsive">
            <table class="workout-summary-table">
              <thead>
                <tr>
                  <th>Saat</th>
                  <th>Öğün</th>
                  <th>İçerik ve Porsiyon Özeti</th>
                </tr>
              </thead>
              <tbody>
                ${mealsRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <div class="summary-prose-grid">
          <article class="summary-prose-card">
            <h4>⏱️ İsteğe Bağlı Öğün Zamanlaması (Aralıklı Oruç) &amp; Sabah Notları</h4>
            <ul class="table-bullets">
              ${fastingWindows
                .map(
                  (win) =>
                    `<li><strong>${escapeHtml(win.name)} (${escapeHtml(win.window)}):</strong> ${escapeHtml(win.description)}</li>`
                )
                .join("")}
            </ul>
            <p class="muted-text" style="margin-top:8px;">${escapeHtml(fastedTrainingNote)}</p>
            <hr class="summary-divider" />
            <p class="summary-prose-subhead">Açlık Penceresi Tercih Edenler İçin İçecek Notları:</p>
            <ul class="table-bullets">
              ${morningFastRules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}
            </ul>
          </article>

          <article class="summary-prose-card">
            <h4>📌 Vücut Kompozisyonu İçin 3 Temel Kural</h4>
            <ul class="table-bullets">
              ${waistRules
                .map(
                  (rule) =>
                    `<li><strong>${escapeHtml(rule.title)}:</strong> ${escapeHtml(rule.text)}</li>`
                )
                .join("")}
            </ul>
          </article>
        </div>
      </section>

      <section class="summary-section-block">
        <div class="summary-section-title-row">
          <h3>5. Günlük Adım Hedefi, Uyku ve Isınma Protokolü</h3>
        </div>
        ${createLifestyleGridHtml()}
      </section>

      ${renderSourcesSectionHtml()}
    </div>
  `;
}

// Core (21'ler) ve Mide Vakumu rehber sekmesini render eder
export function renderCoreGuide(filteredItems = null) {
  const coreEntries = filteredItems || Object.values(CORE_LIBRARY);
  const cardsHtml = coreEntries.map((core) => createCoreCardHtml(core)).join("");

  elements.contentArea.innerHTML = `
    <div class="day-banner">
      <div>
        <h2>21’ler Aktif Core Dinlenmesi &amp; Sabah Mide Vakumu Rehberi</h2>
        <p>
          Core çalışmaları bölgesel yağ eritmez (Ramirez-Campillo R. ve ark., Human Movement 2022;23, DOI: 10.5114/hm.2022.110373);
          gövde stabilitesi, postür farkındalığı ve karın kaslarının kuvvet/hipertrofi gelişimi için uygulanır.
        </p>
      </div>
      <div class="day-meta-badges">
        <span class="meta-pill">🎯 Hedef: Gövde Stabilitesi &amp; Core Kuvveti</span>
      </div>
    </div>
    <div class="core-grid">${cardsHtml}</div>
    ${createCardioFinisherSectionHtml()}
  `;
}

// Beslenme ve enerji dengesi protokolü sekmesini render eder
export function renderNutritionProtocol() {
  const { summary, fastingWindows, fastedTrainingNote, morningFastRules, dailyMeals, waistRules } =
    NUTRITION_PROTOCOL;
  const profileTargets = getActiveProfileTargets();
  const trainingDayTotals = dailyMeals.reduce(
    (acc, meal) => ({
      kcal: acc.kcal + meal.totals.kcal,
      protein: acc.protein + meal.totals.protein,
      carbs: acc.carbs + meal.totals.carbs,
      fat: acc.fat + meal.totals.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const restDayTotals = dailyMeals.reduce(
    (acc, meal) => {
      const rt = meal.restDayTotals || meal.totals;
      return {
        kcal: acc.kcal + rt.kcal,
        protein: acc.protein + rt.protein,
        carbs: acc.carbs + rt.carbs,
        fat: acc.fat + rt.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  elements.contentArea.innerHTML = `
    <div class="nutrition-layout">
      <div class="day-banner">
        <div>
          <h2>Kravitz'ten Esinlenilmiş Uyarlama — Beslenme ve Enerji Dengesi</h2>
          <p>
            Profil BMR değerin (${escapeHtml(profileTargets.bmrKcal)} kcal) ve günlük ~${escapeHtml(profileTargets.proteinTargetG)} g protein hedefinle
            mevcut kas kütleni (%${escapeHtml(profileTargets.targetBodyFatPct)} hedef yağ oranı) koruyarak haftalık %0,5-%1 kilo kaybı (genel öneri) hedeflenir.
          </p>
        </div>
        <div class="day-meta-badges">
          <span class="meta-pill">🎯 Kişisel Kalori Hedefi: ${escapeHtml(profileTargets.targetCalories)} kcal</span>
          <span class="meta-pill">📉 Örnek Plan: ${escapeHtml(trainingDayTotals.kcal)} / ${escapeHtml(restDayTotals.kcal)} kcal</span>
        </div>
      </div>

      <div class="macro-grid">
        <article class="macro-card">
          <div class="macro-label">Ortalama Kalori Hedefi</div>
          <div class="macro-val">${escapeHtml(summary.targetKcal)} kcal</div>
          <div class="macro-sub">Antrenman: ${escapeHtml(trainingDayTotals.kcal)} · Dinlenme: ${escapeHtml(restDayTotals.kcal)} kcal</div>
        </article>
        <article class="macro-card">
          <div class="macro-label">Günlük Protein</div>
          <div class="macro-val">${escapeHtml(summary.proteinG)} g</div>
          <div class="macro-sub">${escapeHtml(summary.proteinG * 4)} kcal (%${Math.round(((summary.proteinG * 4) / summary.targetKcal) * 100)})</div>
        </article>
        <article class="macro-card">
          <div class="macro-label">Karbonhidrat</div>
          <div class="macro-val">${escapeHtml(summary.carbsG)} g</div>
          <div class="macro-sub">Antr: ${escapeHtml(trainingDayTotals.carbs)} g · Dinl: ${escapeHtml(restDayTotals.carbs)} g</div>
        </article>
        <article class="macro-card">
          <div class="macro-label">Sağlıklı Yağlar</div>
          <div class="macro-val">${escapeHtml(summary.fatG)} g</div>
          <div class="macro-sub">${escapeHtml(summary.fatG * 9)} kcal (zeytinyağı, yumurta, badem)</div>
        </article>
        <article class="macro-card">
          <div class="macro-label">Sıvı Tüketimi</div>
          <div class="macro-val">${escapeHtml(summary.water)}</div>
          <div class="macro-sub">Hidrasyon &amp; mineral desteği</div>
        </article>
      </div>

      <div class="two-col-grid">
        <article class="info-panel">
          <h3>⏱️ İsteğe Bağlı Öğün Zamanlaması (Aralıklı Oruç)</h3>
          ${fastingWindows
            .map(
              (win) => `
            <div class="fasting-window-box">
              <strong>${escapeHtml(win.name)}</strong>
              <div class="fasting-window-time">${escapeHtml(win.window)}</div>
              <p>${escapeHtml(win.description)}</p>
            </div>
          `
            )
            .join("")}
          <p class="muted-text" style="margin-top:10px;">${escapeHtml(fastedTrainingNote)}</p>
        </article>

        <article class="info-panel">
          <h3>☕ Sabah Saatleri &amp; İçecek Rehberi</h3>
          <ul>
            ${morningFastRules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}
          </ul>
        </article>
      </div>

      <div class="daily-totals-bar">
        <div class="daily-total-pill">
          <strong>🏋️ Antrenman Günü Toplamı:</strong>
          <span>${escapeHtml(trainingDayTotals.kcal)} kcal · P ${escapeHtml(trainingDayTotals.protein)} g · K ${escapeHtml(trainingDayTotals.carbs)} g · Y ${escapeHtml(trainingDayTotals.fat)} g</span>
        </div>
        <div class="daily-total-pill is-rest">
          <strong>🛌 Dinlenme Günü Toplamı:</strong>
          <span>${escapeHtml(restDayTotals.kcal)} kcal · P ${escapeHtml(restDayTotals.protein)} g · K ${escapeHtml(restDayTotals.carbs)} g · Y ${escapeHtml(restDayTotals.fat)} g</span>
        </div>
      </div>

      <div class="three-col-grid">
        ${dailyMeals
          .map(
            (meal) => `
          <article class="info-panel">
            <span class="meal-time-badge">${escapeHtml(meal.time)}</span>
            <h3>${escapeHtml(meal.title)}</h3>
            <div class="meal-macros-summary">
              <div class="meal-macro-line"><strong>Antrenman:</strong> ${escapeHtml(meal.totals.kcal)} kcal (P ${escapeHtml(meal.totals.protein)}g · K ${escapeHtml(meal.totals.carbs)}g · Y ${escapeHtml(meal.totals.fat)}g)</div>
              <div class="meal-macro-line rest"><strong>Dinlenme:</strong> ${escapeHtml(meal.restDayTotals.kcal)} kcal (P ${escapeHtml(meal.restDayTotals.protein)}g · K ${escapeHtml(meal.restDayTotals.carbs)}g · Y ${escapeHtml(meal.restDayTotals.fat)}g)</div>
            </div>
            <ul>
              ${meal.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </article>
        `
          )
          .join("")}
      </div>

      <div class="three-col-grid">
        ${waistRules
          .map(
            (rule) => `
          <article class="info-panel">
            <h3>📌 ${escapeHtml(rule.title)}</h3>
            <p class="muted-text">${escapeHtml(rule.text)}</p>
          </article>
        `
          )
          .join("")}
      </div>

      ${createLifestyleGridHtml()}

      ${renderSourcesSectionHtml()}
    </div>
  `;
}

// Arama kutusuna göre ana ve alternatif hareketler arasında eşleşen ilk varyant indeksini bulur

export function renderSearchResults(query) {
  const normalized = query.trim().toLowerCase();
  const matchedExercises = [];

  WORKOUT_DAYS.forEach((day) => {
    day.exercises.forEach((ex) => {
      const restText = (ex.coreRestLabel || "").toLowerCase();
      let variantIdx = findMatchingVariantIndex(ex, "exercise", normalized);
      if (variantIdx === -1 && restText.includes(normalized)) {
        variantIdx = 0;
      }
      if (variantIdx !== -1) {
        matchedExercises.push({
          dayLabel: day.tabLabel,
          exercise: ex,
          initialVariantIndex: variantIdx,
        });
      }
    });
  });

  const matchedCore = [];
  [...Object.values(CORE_LIBRARY), CARDIO_FINISHER].forEach((core) => {
    const variantIdx = findMatchingVariantIndex(core, "core", normalized);
    if (variantIdx !== -1) {
      matchedCore.push({ core, initialVariantIndex: variantIdx });
    }
  });

  if (matchedExercises.length === 0 && matchedCore.length === 0) {
    elements.contentArea.innerHTML = `
      <div class="empty-state">
        <h3>"${escapeHtml(query)}" için hareket bulunamadı</h3>
        <p>Örnek aramalar: Biceps, Arnold, Omuz, Sırt, Hack Squat, Dead Bug, Plank</p>
      </div>
    `;
    return;
  }

  const exercisesHtml = matchedExercises
    .map(({ dayLabel, exercise, initialVariantIndex }) =>
      createExerciseCardHtml(
        exercise,
        `${dayLabel} · Hareket ${exercise.order}`,
        initialVariantIndex
      )
    )
    .join("");

  const coreSectionHtml =
    matchedCore.length > 0
      ? `
      <div style="margin-top: 26px;">
        <h3 style="font-family: Oswald, sans-serif; margin-bottom: 14px;">Eşleşen Core (21'ler) ve Alternatif Hareketler</h3>
        <div class="core-grid">
          ${matchedCore
            .map(({ core, initialVariantIndex }) => createCoreCardHtml(core, initialVariantIndex))
            .join("")}
        </div>
      </div>
    `
      : "";

  elements.contentArea.innerHTML = `
    <div class="day-banner">
      <div>
        <h2>Arama Sonuçları: "${escapeHtml(query)}"</h2>
        <p>${matchedExercises.length} ana/alternatif hareket ve ${matchedCore.length} core hareketi bulundu.</p>
      </div>
    </div>
    ${exercisesHtml ? `<div class="exercises-grid">${exercisesHtml}</div>` : ""}
    ${coreSectionHtml}
  `;
}

// Kart üzerindeki aktif varyantı (Ana Hareket veya Alt 1 / Alt 2) kart DOM'una uygular
