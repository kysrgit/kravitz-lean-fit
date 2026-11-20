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
  getExerciseMedia,
  getProgramDays,
} from "../../data.js";
import {
  elements,
  escapeHtml,
  findMatchingVariantIndex,
  getActiveProfileTargets,
  getDayProgressStats,
  loadBodyLogs,
  loadPrefs,
  saveBodyLogs,
  scaleMealPlanForProfile,
  state,
  syncProfileForm,
} from "../state.js";
import { createCoreCardHtml, createDaySummaryTableHtml, createExerciseCardHtml } from "./cards.js";
import { lucideIcon } from "./icons.js";

export function renderSourcesSectionHtml() {
  return `
    <section id="kaynaklar" class="sources-panel" aria-labelledby="sources-heading">
      <div class="sources-header">
        <h3 id="sources-heading">${lucideIcon("book-open", { size: 18 })} Kaynaklar</h3>
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
  elements.pillarsGrid.innerHTML = SYSTEM_PILLARS.map((pillar, idx) => {
    const numLabel = String(idx + 1).padStart(2, "0");
    return `
      <article class="pillar-card">
        <div class="pillar-card-head">
          <span class="pillar-badge">${escapeHtml(pillar.badge)}</span>
          <span class="pillar-index display-type tabular" aria-hidden="true">${numLabel}</span>
        </div>
        <h3>${escapeHtml(pillar.title)}</h3>
        <p>${escapeHtml(pillar.description)} <a href="#kaynaklar" class="pillar-source-link" data-open-sources>Kaynak ↗</a></p>
      </article>
    `;
  }).join("");
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
      <line x1="${padX}" y1="${padY}" x2="${padX}" y2="${height - padY}" stroke="var(--line)" stroke-width="1" />
      <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" stroke="var(--line)" stroke-width="1" />
      <polyline fill="none" stroke="var(--day-accent)" stroke-width="2.5" points="${escapeHtml(toPolyline(waistPts))}" />
      <polyline fill="none" stroke="var(--set-core)" stroke-width="2.2" stroke-dasharray="4 3" points="${escapeHtml(toPolyline(weightPts))}" />
      ${waistPts.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="var(--day-accent)" />`).join("")}
      ${weightPts.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="var(--set-core)" />`).join("")}
      <text x="${padX}" y="${height - 4}" fill="var(--text-2)" font-size="12">${escapeHtml(logs[0].date)}</text>
      <text x="${width - padX}" y="${height - 4}" text-anchor="end" fill="var(--text-2)" font-size="12">${escapeHtml(logs[logs.length - 1].date)}</text>
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

// Profil skor tablosu (Tanita / mezura) kartlarını ve hedef ilerleme çubuğunu üretir
function getMetricProgressRatio(profile, idx) {
  if (idx === 0) return Math.min(0.95, Math.max(0.25, 1 - (profile.waistCm - 74) / 36));
  if (idx === 1)
    return Math.min(0.95, Math.max(0.25, profile.targetWeightKg / Math.max(1, profile.weightKg)));
  if (idx === 2)
    return Math.min(
      0.95,
      Math.max(0.25, profile.targetBodyFatPct / Math.max(1, profile.bodyFatPct))
    );
  if (idx === 3)
    return Math.min(0.95, Math.max(0.3, profile.muscleMassKg / Math.max(1, profile.weightKg)));
  if (idx === 4)
    return Math.min(0.95, Math.max(0.3, profile.bmrKcal / Math.max(1, profile.targetCalories)));
  return 0.68;
}

export function renderTanitaSection() {
  const profile = getActiveProfileTargets();
  syncProfileForm(profile);

  const sourceLabel = profile.isCustom ? "Kayıtlı Profilin (Bu Cihazda)" : "Örnek Değerler";
  elements.tanitaMeta.textContent = `${sourceLabel} · Yaş: ${profile.age} · Hedef: ${profile.targetStyle}`;
  if (elements.profileTargetChip) {
    elements.profileTargetChip.textContent = `Hedef: %${profile.targetBodyFatPct} Yağ · ~${profile.targetWeightKg} kg · ${profile.targetCalories} kcal`;
  }

  const metricsHtml = profile.metrics
    .map((item, idx) => {
      const progressRatio = getMetricProgressRatio(profile, idx).toFixed(2);
      const priorityBadge = item.highlight
        ? '<span class="tanita-priority-tag"><span class="tanita-priority-dot" aria-hidden="true"></span>ANA HEDEF</span>'
        : "";
      return `
      <article class="tanita-card ${item.highlight ? "highlight" : ""}">
        <div class="tanita-card-head">
          <div class="tanita-label">${escapeHtml(item.label)}</div>
          ${priorityBadge}
        </div>
        <div class="tanita-values">
          <div class="tanita-score-line">
            <div>
              <span class="tanita-score-tag">MEVCUT</span>
              <span class="tanita-current display-type tabular" data-count-value="${escapeHtml(item.current)}">${escapeHtml(item.current)}</span>
            </div>
            <div class="tanita-target-wrap">
              <span class="tanita-score-tag">HEDEF</span>
              <span class="tanita-target tabular">${lucideIcon("arrow-right", { size: 14 })} ${escapeHtml(item.target)}</span>
            </div>
          </div>
          <div class="score-progress-track" aria-hidden="true">
            <span class="score-progress-fill" style="--score-progress: ${progressRatio}"></span>
          </div>
        </div>
        <p class="tanita-note">${escapeHtml(item.note)}</p>
      </article>
    `;
    })
    .join("");

  elements.tanitaGrid.innerHTML = `
    ${metricsHtml}
    <p class="bia-standard-note" style="grid-column: 1 / -1;">${lucideIcon("ruler", { size: 15 })} <span><strong>Ölçüm Standardı:</strong> ${escapeHtml(profile.biaMeasurementNote)}</span></p>
  `;
}

// Aktif sekmeye geçer, aramayı temizler ve isteğe bağlı içerik alanına yumuşakça odaklanır

export function createWarmupBannerHtml() {
  const { warmupProtocol } = LIFESTYLE_AND_WARMUP;
  return `
    <div class="warmup-banner">
      <div class="warmup-banner-head">
        <strong>${lucideIcon("flame", { size: 16 })} ${escapeHtml(warmupProtocol.title)}:</strong>
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
        <span class="meal-time-badge">${lucideIcon("footprints", { size: 14 })} Günlük Aktivite</span>
        <h3>${escapeHtml(dailySteps.title)}</h3>
        <div class="lifestyle-target">${escapeHtml(dailySteps.target)}</div>
        <p class="muted-text">${escapeHtml(dailySteps.description)}</p>
      </article>
      <article class="info-panel">
        <span class="meal-time-badge">${lucideIcon("moon", { size: 14 })} Toparlanma</span>
        <h3>${escapeHtml(sleep.title)}</h3>
        <div class="lifestyle-target">${escapeHtml(sleep.target)}</div>
        <p class="muted-text">${escapeHtml(sleep.description)}</p>
      </article>
      <article class="info-panel">
        <span class="meal-time-badge">${lucideIcon("flame", { size: 14 })} Seans Başlangıcı</span>
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
          <h3>${lucideIcon("trending-up", { size: 18 })} ${escapeHtml(PROGRESSION_MODEL.title)}</h3>
          <ul class="table-bullets">
            <li><strong>Çift İlerleme:</strong> ${escapeHtml(PROGRESSION_MODEL.doubleProgression)}</li>
            <li><strong>Planlı Deload:</strong> ${escapeHtml(PROGRESSION_MODEL.deloadRule)}</li>
            <li><strong>Isınma Notu:</strong> ${escapeHtml(PROGRESSION_MODEL.warmupNote)}</li>
          </ul>
        </article>

        <article class="info-panel">
          <h3>${lucideIcon("calendar", { size: 18 })} Haftada 3 Gün Antrenman Alternatifi (≥2×/Hafta Frekans)</h3>
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
          <span class="finisher-badge">${lucideIcon("zap", { size: 14 })} BİTİRİŞ KARDİYOSU · CORE DEĞİL</span>
          <h3>Antrenman Sonu İsteğe Bağlı Kondisyon Finisher</h3>
          <p class="muted-text">
            Eğimli yürüyüş bir karın (core) hareketi değildir; kavrama veya set arası dinlenmeyi etkilemeden
            yalnızca seans sonunda toplam enerji harcamasını ve kondisyonu desteklemek için ayrılmıştır.
          </p>
        </div>
      </div>
      <div class="core-grid">
        ${createCoreCardHtml(CARDIO_FINISHER, Number(loadPrefs().selectedVariants?.[CARDIO_FINISHER.id] || 0))}
      </div>
    </section>
  `;
}

// Seçilen antrenman günü için okunaklı ve etkileşimli tablo özeti üretir

export function renderWorkoutDay(day) {
  const prefs = loadPrefs();
  const progress = getDayProgressStats(day, prefs.selectedVariants);

  const progressStripHtml = `
    <div id="day-progress-strip" class="day-progress-strip" data-progress-day="${escapeHtml(day.id)}">
      <div class="day-progress-main">
        <div class="day-progress-head">
          <span id="day-progress-text" class="day-progress-text tabular">Bugünkü İlerleme: ${progress.doneCount} / ${progress.totalCount} Set (%${progress.pct})</span>
        </div>
        <div class="day-progress-track" aria-hidden="true">
          <div id="day-progress-fill" class="day-progress-fill" style="transform: scaleX(${(progress.pct / 100).toFixed(3)})"></div>
        </div>
      </div>
      <label class="auto-timer-toggle">
        <input type="checkbox" id="auto-rest-timer-toggle" ${prefs.autoRestTimer !== false ? "checked" : ""} />
        <span>Set bitince sayacı başlat</span>
      </label>
    </div>
  `;

  const viewModeBarHtml = `
    <div class="view-mode-bar" role="group" aria-label="Görünüm modu seçici">
      <span class="view-mode-label">Görünüm Modu:</span>
      <div class="view-mode-buttons">
        <button
          type="button"
          class="view-mode-btn ${state.viewMode === "both" ? "active" : ""}"
          data-view-mode="both"
        >
          ${lucideIcon("clipboard-list", { size: 15 })} Tablo + Hareket Kartları
        </button>
        <button
          type="button"
          class="view-mode-btn ${state.viewMode === "table-only" ? "active" : ""}"
          data-view-mode="table-only"
        >
          ${lucideIcon("trending-up", { size: 15 })} Sadece Yazılı / Tablo Özeti
        </button>
        <button
          type="button"
          class="view-mode-btn ${state.viewMode === "cards-only" ? "active" : ""}"
          data-view-mode="cards-only"
        >
          ${lucideIcon("dumbbell", { size: 15 })} Sadece Hareket Kartları
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
            createExerciseCardHtml(
              exercise,
              `${day.tabLabel} · Hareket ${exercise.order}`,
              Number(prefs.selectedVariants?.[exercise.id] || 0)
            )
          )
          .join("")}</div>`
      : "";

  const dayNumMatch = String(day.id || "").match(/(\d+)$/);
  const dayNumLabel = String(dayNumMatch ? dayNumMatch[1] : "1").padStart(2, "0");

  elements.contentArea.innerHTML = `
    <div class="day-banner">
      <div class="day-poster-lead">
        <span class="day-poster-num display-type tabular" aria-hidden="true">${escapeHtml(dayNumLabel)}</span>
        <div class="day-poster-copy">
          <span class="day-poster-kicker">${escapeHtml(day.tabLabel)} · ARENA PROTOKOLÜ</span>
          <h2>${escapeHtml(day.fullTitle)}</h2>
          <p>${escapeHtml(day.targetGoal)}</p>
        </div>
      </div>
      <div class="day-meta-badges">
        <span class="meta-pill">${lucideIcon("clock", { size: 16 })} <span>${escapeHtml(day.duration)}</span></span>
        <span class="meta-pill">${lucideIcon("calendar", { size: 16 })} <span>${escapeHtml(day.scheduleNote)}</span></span>
      </div>
    </div>
    ${createWarmupBannerHtml()}
    ${progressStripHtml}
    ${viewModeBarHtml}
    ${tableHtml}
    ${cardsSectionHtml}
    ${createProgressionAndTemplatesHtml()}
    ${createCardioFinisherSectionHtml()}
  `;
}

// Günlük öğün toplamlarını (antrenman veya dinlenme) hesaplar
function sumMealTotals(meals, useRest = false) {
  return meals.reduce(
    (acc, meal) => {
      const t = useRest ? meal.restDayTotals || meal.totals : meal.totals;
      return {
        kcal: acc.kcal + t.kcal,
        protein: acc.protein + t.protein,
        carbs: acc.carbs + t.carbs,
        fat: acc.fat + t.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

// Makro toplamlarını tek satır özet metnine dönüştürür
function formatMacroSummary(t, spaced = false) {
  const g = spaced ? " g" : "g";
  return `${escapeHtml(t.kcal)} kcal (P ${escapeHtml(t.protein)}${g} · K ${escapeHtml(t.carbs)}${g} · Y ${escapeHtml(t.fat)}${g})`;
}

// Özet tabloları için ortak kart ve duyarlı tablo sarmalayıcısı oluşturur
function wrapSummaryTableCard(headers, rowsHtml, headingHtml = "") {
  const head = headingHtml
    ? `<div class="summary-table-header compact"><div><h3>${headingHtml}</h3></div></div>`
    : "";
  return `<div class="summary-table-card">${head}<div class="table-responsive"><table class="workout-summary-table"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rowsHtml}</tbody></table></div></div>`;
}

// Tüm programın yazılı ve tablolu özetini tek sayfada render eder
export function renderFullSummaryTab() {
  const activeDays = getProgramDays(state.programMode);
  const weeklyScheduleRowsHtml = activeDays.map(
    (day) => `
      <tr>
        <td data-label="Gün"><strong>${escapeHtml(day.tabLabel)}</strong><div class="table-alt-meta">${escapeHtml(day.shortTitle)}</div></td>
        <td data-label="Odak Bölgeler">${escapeHtml(day.fullTitle.replace(/^\d+\.\s*GÜN(?:\s*\([^)]+\))?:\s*/i, ""))}</td>
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

  const allDaysTablesHtml = activeDays.map((day) =>
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
                Formu izle ${lucideIcon("arrow-up-right", { size: 14 })}
              </a>
            </div>
          </td>
          <td data-label="Hedef Bölge"><span class="tag-chip">${escapeHtml(core.target)}</span></td>
          <td data-label="Tekrar / Süre"><strong>${escapeHtml(core.reps)}</strong></td>
          <td class="col-cue" data-label="Nasıl Yapılır">
            <div>${escapeHtml(core.formCue)}</div>
            ${core.gymTip ? `<div class="table-alt-when"><strong>Salon İpucu:</strong> ${escapeHtml(core.gymTip)}</div>` : ""}
          </td>
          <td class="col-alts" data-label="Alternatifler"><div class="table-alt-list">${altsHtml}</div></td>
        </tr>
      `;
    })
    .join("");

  const { summary, fastingWindows, fastedTrainingNote, morningFastRules, dailyMeals, waistRules } =
    NUTRITION_PROTOCOL;
  const profileTargets = getActiveProfileTargets();
  const {
    trainingTargetKcal,
    restTargetKcal,
    proteinTargetG,
    carbsTargetG,
    fatTargetG,
    scaledMeals,
  } = scaleMealPlanForProfile(dailyMeals, profileTargets);

  const macroRowsHtml = [
    [
      "Günlük Kalori Hedefin",
      `Antrenman: ${trainingTargetKcal} kcal · Dinlenme: ${restTargetKcal} kcal`,
      `Profil BMR (${profileTargets.bmrKcal} kcal) ve tahmini TDEE (${profileTargets.estimatedTdeeKcal} kcal) baz alınır · Haftalık hedef: vücut ağırlığının %0,5-1'i`,
    ],
    [
      "Günlük Protein",
      `${proteinTargetG} g (2,0 g/kg)`,
      `${profileTargets.muscleMassKg.toFixed(1)} kg kas kütleni korumaya destek olur`,
    ],
    [
      "Karbonhidrat (Çiğ/Kuru Bazlı)",
      `${carbsTargetG} g`,
      "Antrenman günlerinde yüksek, dinlenme günlerinde kontrollü (~4 kcal/g)",
    ],
    ["Sağlıklı Yağlar", `${fatTargetG} g`, "Hormon dengesi ve tokluk (~9 kcal/g)"],
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

  const trainingSum = sumMealTotals(scaledMeals);
  const restSum = sumMealTotals(scaledMeals, true);

  const mealsRowsHtml =
    scaledMeals
      .map(
        (meal) => `
      <tr>
        <td data-label="Saat">
          <span class="meal-time-badge">${escapeHtml(meal.time)}</span>
          <div class="meal-totals-chip">Antrenman: ${formatMacroSummary(meal.totals)}</div>
          <div class="meal-totals-chip rest">Dinlenme: ${formatMacroSummary(meal.restDayTotals)}</div>
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
          <strong>Antrenman Günü Toplamı:</strong> ${formatMacroSummary(trainingSum, true)}
          &nbsp;|&nbsp;
          <strong>Dinlenme Günü Toplamı:</strong> ${formatMacroSummary(restSum, true)}
        </td>
      </tr>
    `;

  elements.contentArea.innerHTML = `
    <div class="summary-layout">
      <div class="day-banner">
        <div class="day-poster-lead">
          <span class="day-poster-num display-type tabular" aria-hidden="true">00</span>
          <div class="day-poster-copy">
            <span class="day-poster-kicker">TAM MAÇ PROGRAMI · TEK SAYFA ÖZET</span>
            <h2>Kravitz Lean &amp; Fit — Program Özeti</h2>
            <p>
              Kartlar arasında gezinmeden; tüm antrenman günlerini, piramit set/tekrarlarını,
              set arası 21'ler core hareketlerini, alternatifleri ve beslenme protokolünü tek sayfada gör.
            </p>
          </div>
        </div>
        <div class="day-meta-badges">
          <button type="button" id="print-summary-btn" class="btn-outline btn-print-summary">
            ${lucideIcon("printer", { size: 15 })} Yazdır / PDF Kaydet
          </button>
        </div>
      </div>

      <!-- Mobilde ve Masaüstünde Tek Dokunuşla Bölüm Atlama Çubuğu -->
      <div class="summary-quick-nav" role="navigation" aria-label="Özet Bölümleri Hızlı Geçiş">
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-sec-weekly">${lucideIcon("calendar", { size: 14 })} Haftalık Şema</button>
        ${activeDays
          .map(
            (day) =>
              `<button type="button" class="summary-quick-chip" data-scroll-target="summary-day-${escapeHtml(day.id)}">${escapeHtml(day.tabLabel)}</button>`
          )
          .join("")}
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-sec-core">${lucideIcon("flame", { size: 14 })} 21'ler Core</button>
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-sec-nutrition">${lucideIcon("utensils", { size: 14 })} Beslenme</button>
      </div>

      <!-- Bölüm 1: Sistem Özeti, Profil Hedefleri & Haftalık Şema -->
      <section id="summary-sec-weekly" class="summary-section-block">
        <div class="summary-section-title-row">
          <h3>1. Sistem Özeti, Profil Hedefleri &amp; Haftalık Antrenman Şeması</h3>
        </div>

        <div class="summary-prose-grid">
          <article class="summary-prose-card match-ticket">
            <h4>${lucideIcon("target", { size: 16 })} Sistemin 3 Altın Kuralı (Yazılı Özet)</h4>
            <ul class="table-bullets">
              ${SYSTEM_PILLARS.map(
                (p) =>
                  `<li><strong>${escapeHtml(p.badge)} (${escapeHtml(p.title)}):</strong> ${escapeHtml(p.description)}</li>`
              ).join("")}
            </ul>
          </article>

          <article class="summary-prose-card match-ticket">
            ${(() => {
              const profile = getActiveProfileTargets();
              const label = profile.isCustom
                ? "Kayıtlı Profilin"
                : "Örnek Profil (Profilim formundan özelleştir)";
              return `
                <h4>${lucideIcon("trending-up", { size: 16 })} Profil Başlangıç → Hedef Özeti</h4>
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

        ${wrapSummaryTableCard(
          ["Gün", "Odak Bölgeler", "Süre", "Haftalık Takvim Notu", "Hızlı Geçiş"],
          weeklyScheduleRowsHtml,
          `${lucideIcon("calendar", { size: 18 })} Haftalık Antrenman Günleri Şeması (3 veya 4 Gün)`
        )}
        ${createProgressionAndTemplatesHtml()}
      </section>

      <section class="summary-section-block">
        <div class="summary-section-title-row">
          <h3>2. Haftalık Antrenman Programı Tam Tablosu (${activeDays.length} Günlük Mod)</h3>
        </div>
        <div class="summary-tables-stack">
          ${allDaysTablesHtml}
        </div>
      </section>

      <section id="summary-sec-core" class="summary-section-block">
        <div class="summary-section-title-row">
          <h3>3. 21'ler Aktif Core &amp; Sabah Mide Vakumu Tam Tablosu</h3>
        </div>
        ${wrapSummaryTableCard(
          [
            "Core Hareketi",
            "Hedef Bölge",
            "Tekrar / Süre",
            "Nasıl Yapılır (Kısa Özet)",
            "Alternatif 1 &amp; Alternatif 2",
          ],
          coreRowsHtml
        )}

        <div class="summary-table-card finisher-summary-card">
          <div class="summary-table-header compact">
            <div>
              <h3>${lucideIcon("zap", { size: 18 })} Bitiriş Kardiyosu (Core Listesinden Ayrı · Seans Sonu)</h3>
              <p>${escapeHtml(CARDIO_FINISHER.turkishName)} (${escapeHtml(CARDIO_FINISHER.reps)}) — ${escapeHtml(CARDIO_FINISHER.gymTip)}</p>
            </div>
            <button type="button" class="table-video-btn" data-open-core="${escapeHtml(CARDIO_FINISHER.id)}">Form &amp; Alternatifler</button>
          </div>
        </div>
      </section>

      <section id="summary-sec-nutrition" class="summary-section-block">
        <div class="summary-section-title-row">
          <h3>4. Beslenme, Öğün Zamanlaması &amp; Enerji Dengesi Protokolü</h3>
        </div>

        ${wrapSummaryTableCard(
          ["Kalem", "Günlük Hedef", "Amaç / Not"],
          macroRowsHtml,
          `${lucideIcon("utensils", { size: 18 })} Günlük Makro &amp; Kalori Hedef Tablosu`
        )}

        ${wrapSummaryTableCard(
          ["Saat", "Öğün", "İçerik ve Porsiyon Özeti"],
          mealsRowsHtml,
          `${lucideIcon("clock", { size: 18 })} Saat Saat Günlük Öğün Tablosu`
        )}

        <div class="summary-prose-grid">
          <article class="summary-prose-card match-ticket">
            <h4>${lucideIcon("clock", { size: 16 })} İsteğe Bağlı Öğün Zamanlaması (Aralıklı Oruç) &amp; Sabah Notları</h4>
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

          <article class="summary-prose-card match-ticket">
            <h4>${lucideIcon("target", { size: 16 })} Vücut Kompozisyonu İçin 3 Temel Kural</h4>
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
  const prefs = loadPrefs();
  const cardsHtml = coreEntries
    .map((core) => createCoreCardHtml(core, Number(prefs.selectedVariants?.[core.id] || 0)))
    .join("");

  elements.contentArea.innerHTML = `
    <div class="day-banner">
      <div class="day-poster-lead">
        <span class="day-poster-num display-type tabular" aria-hidden="true">21</span>
        <div class="day-poster-copy">
          <span class="day-poster-kicker">AKTİF DİNLENME · SABAH VAKUMU</span>
          <h2>21’ler Aktif Core &amp; Mide Vakumu</h2>
          <p>
            Core çalışmaları bölgesel yağ eritmez (Ramirez-Campillo R. ve ark., Human Movement 2022;23, DOI: 10.5114/hm.2022.110373);
            gövde stabilitesi, postür farkındalığı ve karın kaslarının kuvvet/hipertrofi gelişimi için uygulanır.
          </p>
        </div>
      </div>
      <div class="day-meta-badges">
        <span class="meta-pill">${lucideIcon("target", { size: 14 })} Hedef: Gövde Stabilitesi &amp; Core Kuvveti</span>
      </div>
    </div>
    <div class="core-grid">${cardsHtml}</div>
    ${createCardioFinisherSectionHtml()}
  `;
}

// Dairesel SVG makro ilerleme halkasını üretir (stroke-dasharray/dashoffset)
function createMacroGaugeSvgHtml(ratio, labelText, toneClass = "") {
  const circumference = 157.08;
  const clamped = Math.max(0.05, Math.min(1, Number(ratio) || 0.05));
  const dashoffset = (circumference * (1 - clamped)).toFixed(1);
  return `
    <div class="macro-gauge ${escapeHtml(toneClass)}" aria-hidden="true">
      <svg class="macro-gauge-svg" viewBox="0 0 64 64" width="56" height="56">
        <circle class="macro-gauge-track" cx="32" cy="32" r="25" />
        <circle
          class="macro-gauge-fill"
          cx="32"
          cy="32"
          r="25"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${dashoffset}"
          transform="rotate(-90 32 32)"
        />
      </svg>
      <span class="macro-gauge-pct display-type tabular">${escapeHtml(labelText)}</span>
    </div>
  `;
}

// Makro hedef kartını ortak HTML şablonuyla oluşturur
function createMacroCardHtml(label, value, ratio, gaugeLabel, tone, subText) {
  return `
    <article class="macro-card">
      <div class="macro-card-top">
        <div class="macro-card-meta">
          <div class="macro-label">${escapeHtml(label)}</div>
          <div class="macro-val tabular">${escapeHtml(value)}</div>
        </div>
        ${createMacroGaugeSvgHtml(ratio, gaugeLabel, tone)}
      </div>
      <div class="macro-sub">${subText}</div>
    </article>
  `;
}

// Beslenme ve enerji dengesi protokolü sekmesini render eder
export function renderNutritionProtocol() {
  const { summary, fastingWindows, fastedTrainingNote, morningFastRules, dailyMeals, waistRules } =
    NUTRITION_PROTOCOL;
  const profileTargets = getActiveProfileTargets();
  const {
    trainingTargetKcal,
    proteinTargetG,
    carbsTargetG,
    fatTargetG,
    scaledMeals,
  } = scaleMealPlanForProfile(dailyMeals, profileTargets);
  const trainingDayTotals = sumMealTotals(scaledMeals);
  const restDayTotals = sumMealTotals(scaledMeals, true);

  const kcalRatio =
    profileTargets.estimatedTdeeKcal > 0
      ? trainingTargetKcal / profileTargets.estimatedTdeeKcal
      : 0.85;
  const proteinRatio = (proteinTargetG * 4) / trainingTargetKcal;
  const carbsRatio = (carbsTargetG * 4) / trainingTargetKcal;
  const fatRatio = (fatTargetG * 9) / trainingTargetKcal;
  const macroCardsHtml = [
    [
      "Günlük Kalori Hedefin",
      `${trainingTargetKcal} kcal`,
      kcalRatio,
      `TDEE %${Math.round(kcalRatio * 100)}`,
      "tone-volt",
      `Antrenman: ${escapeHtml(trainingDayTotals.kcal)} · Dinlenme: ${escapeHtml(restDayTotals.kcal)} kcal`,
    ],
    [
      "Günlük Protein (2,0 g/kg)",
      `${proteinTargetG} g`,
      proteinRatio,
      `%${Math.round(proteinRatio * 100)}`,
      "tone-volt",
      `${escapeHtml(proteinTargetG * 4)} kcal (%${Math.round(proteinRatio * 100)})`,
    ],
    [
      "Karbonhidrat",
      `${carbsTargetG} g`,
      carbsRatio,
      `%${Math.round(carbsRatio * 100)}`,
      "tone-core",
      `Antr: ${escapeHtml(trainingDayTotals.carbs)} g · Dinl: ${escapeHtml(restDayTotals.carbs)} g`,
    ],
    [
      "Sağlıklı Yağlar",
      `${fatTargetG} g`,
      fatRatio,
      `%${Math.round(fatRatio * 100)}`,
      "tone-blaze",
      `${escapeHtml(fatTargetG * 9)} kcal (zeytinyağı, yumurta, badem)`,
    ],
    ["Sıvı Tüketimi", summary.water, 0.88, "3.5L", "tone-core", "Hidrasyon &amp; mineral desteği"],
  ]
    .map((args) => createMacroCardHtml(...args))
    .join("");

  elements.contentArea.innerHTML = `
    <div class="nutrition-layout">
      <div class="day-banner">
        <div class="day-poster-lead">
          <span class="day-poster-num display-type tabular" aria-hidden="true">06</span>
          <div class="day-poster-copy">
            <span class="day-poster-kicker">BESLENME PROTOKOLÜ · ENERJİ DENGESİ</span>
            <h2>Kravitz Uyarlaması — Beslenme</h2>
            <p>
              Profil BMR değerin (${escapeHtml(profileTargets.bmrKcal)} kcal) ve günlük ~${escapeHtml(profileTargets.proteinTargetG)} g protein hedefinle
              mevcut kas kütleni (%${escapeHtml(profileTargets.targetBodyFatPct)} hedef yağ oranı) koruyarak haftalık %0,5-%1 kilo kaybı (genel öneri) hedeflenir.
            </p>
          </div>
        </div>
        <div class="day-meta-badges">
          <span class="meta-pill">${lucideIcon("target", { size: 14 })} Kişisel Kalori Hedefi: ${escapeHtml(profileTargets.targetCalories)} kcal</span>
          <span class="meta-pill">${lucideIcon("trending-down", { size: 14 })} Örnek Plan: ${escapeHtml(trainingDayTotals.kcal)} / ${escapeHtml(restDayTotals.kcal)} kcal</span>
        </div>
      </div>

      <div class="macro-grid">
        ${macroCardsHtml}
      </div>

      <div class="two-col-grid">
        <article class="info-panel">
          <h3>${lucideIcon("clock", { size: 18 })} İsteğe Bağlı Öğün Zamanlaması (Aralıklı Oruç)</h3>
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
          <h3>${lucideIcon("coffee", { size: 18 })} Sabah Saatleri &amp; İçecek Rehberi</h3>
          <ul>
            ${morningFastRules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}
          </ul>
        </article>
      </div>

      <div class="daily-totals-bar">
        <div class="daily-total-pill">
          <strong>${lucideIcon("dumbbell", { size: 15 })} Antrenman Günü Toplamı:</strong>
          <span>${escapeHtml(trainingDayTotals.kcal)} kcal · P ${escapeHtml(trainingDayTotals.protein)} g · K ${escapeHtml(trainingDayTotals.carbs)} g · Y ${escapeHtml(trainingDayTotals.fat)} g</span>
        </div>
        <div class="daily-total-pill is-rest">
          <strong>${lucideIcon("moon", { size: 15 })} Dinlenme Günü Toplamı:</strong>
          <span>${escapeHtml(restDayTotals.kcal)} kcal · P ${escapeHtml(restDayTotals.protein)} g · K ${escapeHtml(restDayTotals.carbs)} g · Y ${escapeHtml(restDayTotals.fat)} g</span>
        </div>
      </div>

      <div class="nutrition-timeline">
        ${scaledMeals
          .map(
            (meal, idx) => `
          <article class="info-panel meal-timeline-card">
            <div class="meal-timeline-head">
              <span class="meal-time-display display-type tabular">${escapeHtml(meal.time)}</span>
              <span class="meal-time-kicker">ÖĞÜN ${String(idx + 1).padStart(2, "0")}</span>
            </div>
            <h3>${escapeHtml(meal.title)}</h3>
            <div class="meal-macros-summary">
              <div class="meal-macro-line"><strong>Antrenman:</strong> ${formatMacroSummary(meal.totals)}</div>
              <div class="meal-macro-line rest"><strong>Dinlenme:</strong> ${formatMacroSummary(meal.restDayTotals)}</div>
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
            <h3>${lucideIcon("target", { size: 18 })} ${escapeHtml(rule.title)}</h3>
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
  const prefs = loadPrefs();
  const matchedExercises = [];

  getProgramDays(state.programMode).forEach((day) => {
    day.exercises.forEach((ex) => {
      const restText = (ex.coreRestLabel || "").toLowerCase();
      let variantIdx = findMatchingVariantIndex(ex, "exercise", normalized);
      if (variantIdx === -1 && restText.includes(normalized)) {
        variantIdx = Number(prefs.selectedVariants?.[ex.id] || 0);
      } else if (variantIdx === 0 && prefs.selectedVariants?.[ex.id]) {
        variantIdx = Number(prefs.selectedVariants[ex.id]);
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
        <h3 class="search-subhead display-type">Eşleşen Core (21'ler) ve Alternatif Hareketler</h3>
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
      <div class="day-poster-lead">
        <span class="day-poster-num display-type tabular" aria-hidden="true">${String(matchedExercises.length + matchedCore.length).padStart(2, "0")}</span>
        <div class="day-poster-copy">
          <span class="day-poster-kicker">ARAMA SONUÇLARI</span>
          <h2>Arama: "${escapeHtml(query)}"</h2>
          <p>${matchedExercises.length} ana/alternatif hareket ve ${matchedCore.length} core hareketi bulundu.</p>
        </div>
      </div>
    </div>
    ${exercisesHtml ? `<div class="exercises-grid">${exercisesHtml}</div>` : ""}
    ${coreSectionHtml}
  `;
}

// Kart üzerindeki aktif varyantı (Ana Hareket veya Alt 1 / Alt 2) kart DOM'una uygular
