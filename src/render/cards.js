/**
 * Dosya: src/render/cards.js
 * Açıklama: Egzersiz kartları, Core/21'ler kartları, günlük özet tabloları, alternatif hap seçicisi
 * ve kart içi varyant güncelleme işlemlerini render eder.
 */

import { CORE_LIBRARY, getExerciseMedia } from "../../data.js";
import { escapeHtml, getExerciseSetHistory, getExerciseVariants } from "../state.js";
import { createMediaStageHtml } from "../media.js";
import { lucideIcon } from "./icons.js";

export function createAlternativesBoxHtml(variants, activeIndex = 0) {
  if (!variants || variants.length <= 1) return "";

  const activeVariant = variants[activeIndex] || variants[0];
  const pillsHtml = variants
    .map(
      (variant) => `
      <button
        type="button"
        class="alt-pill-btn ${variant.index === activeVariant.index ? "active" : ""}"
        data-variant-index="${variant.index}"
      >
        ${escapeHtml(variant.pillLabel)}
      </button>
    `
    )
    .join("");

  const reasonHtml = activeVariant.whenToUse
    ? `<strong>Ne Zaman Yapılır:</strong> ${escapeHtml(activeVariant.whenToUse)}`
    : "";

  return `
    <div class="alternatives-box">
      <div class="alternatives-header">${lucideIcon("refresh-cw", { size: 15 })} <span>Alternatif Hareketler (Makine Doluysa / Yapılamıyorsa)</span></div>
      <div class="alt-pills-row">${pillsHtml}</div>
      <div class="alt-reason-banner" ${activeVariant.whenToUse ? "" : "hidden"}>${reasonHtml}</div>
    </div>
  `;
}

// Tekil egzersiz kartı HTML'ini üretir
export function createExerciseCardHtml(exercise, badgeText, initialVariantIndex = 0) {
  const coreItem = CORE_LIBRARY[exercise.coreRestId];
  const maxSets = exercise.pyramidSets.length;

  const variants = getExerciseVariants(exercise, "exercise");
  const activeVariant = variants[initialVariantIndex] || variants[0];

  const restSeconds = exercise.restSeconds || 90;
  const restWindowLabel =
    restSeconds >= 120
      ? `${restSeconds} sn (2-3 dk · Bileşik)`
      : `${restSeconds} sn (60-90 sn · İzolasyon)`;
  const { todaySession, previousSession } = getExerciseSetHistory(exercise.id);

  const pyramidHtml = exercise.pyramidSets
    .map((step, index) => {
      const widthPercent = Math.max(36, Math.round(100 - (index * 52) / Math.max(1, maxSets - 1)));
      const setLabel = step.isWarmup ? `${step.set}. Set (Isınma Seti)` : `${step.set}. Set`;
      const todaySet = todaySession?.sets?.[String(step.set)] || null;
      const prevSet = previousSession?.sets?.[String(step.set)] || null;
      const prevBadgeText =
        prevSet && (prevSet.kg !== "" || prevSet.reps !== "")
          ? `Önceki: ${prevSet.kg !== "" ? `${prevSet.kg} kg` : "-"} × ${prevSet.reps !== "" ? `${prevSet.reps} tek.` : "-"}`
          : todaySet && (todaySet.kg !== "" || todaySet.reps !== "")
            ? `Bugün: ${todaySet.kg !== "" ? `${todaySet.kg} kg` : "-"} × ${todaySet.reps !== "" ? `${todaySet.reps} tek.` : "-"}`
            : "Önceki: Henüz kayıt yok";

      return `
        <div class="pyramid-step ${step.isWarmup ? "is-warmup" : ""}">
          <div class="pyramid-step-main">
            <span class="set-num">${escapeHtml(setLabel)}</span>
            <div class="set-bar-wrap">
              <span class="set-load">${escapeHtml(step.load)}</span>
              <div class="set-bar ${step.isWarmup ? "is-warmup" : ""}" style="width: ${widthPercent}%"></div>
            </div>
            <span class="set-reps">${escapeHtml(step.reps)}</span>
          </div>
          <div class="set-log-controls" data-set-log-row data-log-ex="${escapeHtml(exercise.id)}" data-log-set="${escapeHtml(step.set)}">
            <span class="set-prev-badge" data-set-prev>${escapeHtml(prevBadgeText)}</span>
            <div class="set-log-inputs">
              <label class="set-log-field">
                <span>kg</span>
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="0.5"
                  inputmode="decimal"
                  aria-label="${escapeHtml(exercise.name)} ${escapeHtml(step.set)}. set kg"
                  data-log-field="kg"
                  value="${escapeHtml(todaySet?.kg ?? "")}"
                  placeholder="kg"
                />
              </label>
              <label class="set-log-field">
                <span>Tekrar</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  inputmode="numeric"
                  aria-label="${escapeHtml(exercise.name)} ${escapeHtml(step.set)}. set tekrar"
                  data-log-field="reps"
                  value="${escapeHtml(todaySet?.reps ?? "")}"
                  placeholder="tek."
                />
              </label>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  const tipsHtml = activeVariant.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("");

  const stageHtml = createMediaStageHtml({
    badgeText,
    name: activeVariant.name,
    primaryTag: activeVariant.primaryTag,
    secondaryTag: activeVariant.secondaryTag,
    tips: activeVariant.tips,
    sourceUrl: activeVariant.sourceUrl,
    videoKey: activeVariant.videoKey,
    triggerAttr: `data-open-exercise="${escapeHtml(exercise.id)}"`,
  });

  const alternativesHtml = createAlternativesBoxHtml(variants, activeVariant.index);

  return `
    <article
      class="exercise-card"
      data-exercise-id="${escapeHtml(exercise.id)}"
      data-variant-kind="exercise"
      data-item-id="${escapeHtml(exercise.id)}"
      data-active-variant-index="${activeVariant.index}"
    >
      ${stageHtml}

      <div class="card-body">
        <div class="exercise-header">
          <div class="exercise-tags">
            <span class="tag-chip">${escapeHtml(activeVariant.primaryTag)}</span>
            <span class="tag-chip equipment">${escapeHtml(activeVariant.secondaryTag)}</span>
          </div>
          <h3 class="exercise-title">${escapeHtml(activeVariant.name)}</h3>
          <p class="exercise-subtitle">${escapeHtml(activeVariant.turkishName)}</p>
        </div>

        ${alternativesHtml}

        <div class="pyramid-box">
          <div class="pyramid-box-title-row">
            <span class="pyramid-box-title">Piramit Merdiveni (${maxSets} Set · 1. Set Isınma)</span>
            <div class="rest-timer-trigger-wrap">
              <span class="rest-duration-badge">${lucideIcon("clock", { size: 14 })} Dinlenme: ${escapeHtml(restWindowLabel)}</span>
              <button
                type="button"
                class="start-rest-timer-btn"
                data-start-timer="${escapeHtml(restSeconds)}"
                data-timer-label="${escapeHtml(activeVariant.name)} Dinlenme"
              >
                ${lucideIcon("play", { size: 14 })} Sayacı Başlat
              </button>
            </div>
          </div>
          <p class="rest-strategy-note">21 core yap, kalan sürede dinlenerek çalışma setine toparlanmış gir (Schoenfeld ve ark., 2016).</p>
          <div class="pyramid-steps">${pyramidHtml}</div>
        </div>

        <ul class="tips-list">${tipsHtml}</ul>

        ${
          coreItem
            ? `
          <button
            type="button"
            class="core-rest-btn"
            data-open-core="${escapeHtml(coreItem.id)}"
          >
            <span class="core-thumb-badge" aria-hidden="true">21×</span>
            <div class="core-rest-copy">
              <span class="core-rest-kicker">Set Arası Aktif Dinlenme</span>
              <span class="core-rest-text">${escapeHtml(exercise.coreRestLabel)}</span>
            </div>
            <span class="core-rest-action">Form &amp; Alternatifler →</span>
          </button>
        `
            : ""
        }
      </div>
    </article>
  `;
}

// Core kartı HTML'ini üretir
export function createCoreCardHtml(core, initialVariantIndex = 0) {
  const isVacuum = core.id === "stomach_vacuum";
  const variants = getExerciseVariants(core, "core");
  const activeVariant = variants[initialVariantIndex] || variants[0];

  const stageHtml = createMediaStageHtml({
    badgeText: isVacuum ? "SABAH RUTİNİ" : "21× AKTİF DİNLENME",
    name: activeVariant.name,
    primaryTag: activeVariant.primaryTag,
    secondaryTag: activeVariant.secondaryTag,
    tips: activeVariant.tips,
    sourceUrl: activeVariant.sourceUrl,
    videoKey: activeVariant.videoKey,
    triggerAttr: `data-open-core="${escapeHtml(core.id)}"`,
  });

  const alternativesHtml = createAlternativesBoxHtml(variants, activeVariant.index);
  const tipsHtml = activeVariant.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("");

  return `
    <article
      class="core-card"
      data-variant-kind="core"
      data-item-id="${escapeHtml(core.id)}"
      data-active-variant-index="${activeVariant.index}"
    >
      ${stageHtml}
      <div class="card-body">
        <div class="exercise-header">
          <div class="exercise-tags">
            <span class="tag-chip">${escapeHtml(activeVariant.primaryTag)}</span>
            <span class="tag-chip equipment">${escapeHtml(activeVariant.secondaryTag)}</span>
          </div>
          <h3 class="exercise-title">${escapeHtml(activeVariant.name)}</h3>
          <p class="exercise-subtitle">${escapeHtml(activeVariant.turkishName)}</p>
        </div>

        ${alternativesHtml}

        <ul class="tips-list">${tipsHtml}</ul>
      </div>
    </article>
  `;
}

// Antrenman öncesi ısınma protokolü kutusunu üretir

export function createDaySummaryTableHtml(
  day,
  { showDayHeader = false, showJumpBtn = false } = {}
) {
  const rowsHtml = (day.exercises || [])
    .map((exercise) => {
      const coreItem = CORE_LIBRARY[exercise.coreRestId];
      const restSeconds = exercise.restSeconds || 90;
      const restBadgeText =
        restSeconds >= 120 ? `${restSeconds} sn (2-3 dk)` : `${restSeconds} sn (60-90 sn)`;
      const pyramidHtml = (exercise.pyramidSets || [])
        .map(
          (step) => `
          <div class="table-pyramid-item ${step.isWarmup ? "is-warmup" : ""}">
            <span class="table-set-num">${escapeHtml(step.isWarmup ? `${step.set}. Set (Isınma)` : `${step.set}. Set`)}</span>
            <span class="table-set-reps">${escapeHtml(step.reps)}</span>
            <span class="table-set-load">${escapeHtml(step.load)}</span>
          </div>
        `
        )
        .join("");

      const altsHtml = (exercise.alternatives || [])
        .map(
          (alt, idx) => `
          <div class="table-alt-item">
            <button
              type="button"
              class="table-alt-btn"
              data-open-exercise="${escapeHtml(exercise.id)}"
              data-open-variant="${idx + 1}"
            >
              <strong>Alt ${idx + 1}:</strong> ${escapeHtml(alt.name)}
            </button>
            <div class="table-alt-meta">
              ${escapeHtml(alt.turkishName)}${alt.equipment ? ` · ${escapeHtml(alt.equipment)}` : ""}${
                alt.reps ? ` · ${escapeHtml(alt.reps)}` : ""
              }
            </div>
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
          <td class="col-order" data-label="Hareket Sırası"><span class="table-order-badge">${escapeHtml(exercise.order)}</span></td>
          <td class="col-main" data-label="Ana Hareket & Ekipman">
            <div class="table-ex-name">${escapeHtml(exercise.name)}</div>
            <div class="table-ex-tr">${escapeHtml(exercise.turkishName)}</div>
            <div class="table-meta-row">
              <span class="tag-chip">${escapeHtml(exercise.muscleGroup)}</span>
              <span class="tag-chip equipment">${escapeHtml(exercise.equipment)}</span>
              <button
                type="button"
                class="table-video-btn"
                data-open-exercise="${escapeHtml(exercise.id)}"
                data-open-variant="0"
              >
                Form &amp; Detay
              </button>
              <a
                href="${escapeHtml(getExerciseMedia(exercise).sourceUrl || "https://musclewiki.com/")}"
                target="_blank"
                rel="noopener noreferrer"
                class="table-video-btn"
              >
                Formu izle ${lucideIcon("arrow-up-right", { size: 14 })}
              </a>
            </div>
          </td>
          <td class="col-pyramid" data-label="Piramit Set & Tekrarlar">
            <div class="table-rest-pill">${lucideIcon("clock", { size: 14 })} Dinlenme: ${escapeHtml(restBadgeText)}</div>
            <div class="table-pyramid-list">${pyramidHtml}</div>
          </td>
          <td class="col-core" data-label="Set Arası (21'ler Core + Dinlenme)">
            <div class="table-core-note">21 core yap, kalan sürede ${escapeHtml(restBadgeText)} tamamla.</div>
            ${
              coreItem
                ? `
              <button
                type="button"
                class="table-core-btn"
                data-open-core="${escapeHtml(coreItem.id)}"
                data-open-variant="0"
              >
                <strong>${escapeHtml(coreItem.name)}</strong>
                <span>${escapeHtml(coreItem.reps)}</span>
              </button>
              <div class="table-core-note">${escapeHtml(exercise.coreRestLabel)}</div>
            `
                : `<span>${escapeHtml(exercise.coreRestLabel)}</span>`
            }
          </td>
          <td class="col-alts" data-label="Alternatifler (Doluysa / Yapılamıyorsa)">
            <div class="table-alt-list">${altsHtml}</div>
          </td>
        </tr>
      `;
    })
    .join("");

  const headerHtml = showDayHeader
    ? `
      <div class="summary-table-header">
        <div>
          <h3>${escapeHtml(day.fullTitle)}</h3>
          <p>${escapeHtml(day.targetGoal)}</p>
        </div>
        <div class="summary-table-header-actions">
          <span class="meta-pill">${lucideIcon("clock", { size: 14 })} ${escapeHtml(day.duration)}</span>
          <span class="meta-pill">${lucideIcon("calendar", { size: 14 })} ${escapeHtml(day.scheduleNote)}</span>
          ${
            showJumpBtn
              ? `<button type="button" class="table-jump-btn" data-jump-day="${escapeHtml(day.id)}">Gün Kartlarını Aç →</button>`
              : ""
          }
        </div>
      </div>
    `
    : `
      <div class="summary-table-header compact">
        <div>
          <h3>${lucideIcon("clipboard-list", { size: 18 })} ${escapeHtml(day.tabLabel)} Hızlı Tablo Özeti</h3>
          <p>Hareket, piramit set/tekrarları, set arası 21'ler core ve alternatiflere tek bakışta göz at.</p>
        </div>
      </div>
    `;

  const cardIdAttr = showDayHeader ? `id="summary-day-${escapeHtml(day.id)}"` : "";

  return `
    <div class="summary-table-card" ${cardIdAttr}>
      ${headerHtml}
      <div class="table-responsive">
        <table class="workout-summary-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ana Hareket &amp; Ekipman</th>
              <th>Piramit Set &amp; Tekrarlar</th>
              <th>Set Arası (21'ler Core)</th>
              <th>Alternatif Hareketler (1 &amp; 2)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Antrenman günü görünümünü (Tablo + Hareket Kartları seçicisi ile) render eder

export function applyVariantToCard(cardEl, variants, variantIndex) {
  const variant = variants[variantIndex] || variants[0];
  if (!variant) return;

  const media = getExerciseMedia(variant);
  cardEl.dataset.activeVariantIndex = String(variant.index);

  // Referans sahnesi bilgilerini ve harici bağlantıyı güncelle
  const sourceLinkEl = cardEl.querySelector(".source-link-btn");
  const previewMetaEl = cardEl.querySelector(".reference-preview-meta");
  const previewCueEl = cardEl.querySelector(".reference-preview-cue");
  if (sourceLinkEl) {
    sourceLinkEl.href = media.sourceUrl || "https://musclewiki.com/";
  }
  if (previewMetaEl) {
    previewMetaEl.textContent = [variant.primaryTag, variant.secondaryTag]
      .filter(Boolean)
      .join(" · ");
  }
  if (previewCueEl) {
    previewCueEl.textContent =
      (variant.tips && variant.tips[0]) || "Kontrollü tempo ve tam hareket açıklığıyla uygula.";
  }

  // Lisanslı medya sahnesi varsa video ve kareleri güncelle
  const videoEl = cardEl.querySelector(".media-video");
  const frontImg = cardEl.querySelector(".frame-front");
  const sideImg = cardEl.querySelector(".frame-side");
  const activeModeBtn = cardEl.querySelector(".pose-btn.active");
  const activeMode = activeModeBtn ? activeModeBtn.dataset.mode : "front";

  if (videoEl && media.frontMp4) {
    videoEl.dataset.frontSrc = media.frontMp4 || "";
    videoEl.dataset.sideSrc = media.sideMp4 || "";
    videoEl.setAttribute("aria-label", `${variant.name} hareket videosu`);
    videoEl.poster = media.frontImg || "";

    if (activeMode === "front" || activeMode === "side") {
      const targetSrc = activeMode === "front" ? media.frontMp4 : media.sideMp4;
      videoEl.setAttribute("src", targetSrc);
      videoEl.load();
      videoEl.play().catch(() => {});
    }
  }

  if (frontImg && media.frontImg) {
    frontImg.src = media.frontImg;
    frontImg.alt = `${variant.name} ön açı karesi`;
  }
  if (sideImg && media.sideImg) {
    sideImg.src = media.sideImg;
    sideImg.alt = `${variant.name} yan açı karesi`;
  }

  // Başlık, etiket ve ipuçlarını güncelle
  const titleEl = cardEl.querySelector(".exercise-title");
  const subtitleEl = cardEl.querySelector(".exercise-subtitle");
  const equipmentChip = cardEl.querySelector(".tag-chip.equipment");
  const tipsListEl = cardEl.querySelector(".tips-list");
  const reasonBanner = cardEl.querySelector(".alt-reason-banner");

  if (titleEl) titleEl.textContent = variant.name;
  if (subtitleEl) subtitleEl.textContent = variant.turkishName;
  if (equipmentChip) equipmentChip.textContent = variant.secondaryTag;
  if (tipsListEl) {
    tipsListEl.innerHTML = variant.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("");
  }

  if (reasonBanner) {
    if (variant.whenToUse) {
      reasonBanner.innerHTML = `<strong>Ne Zaman Yapılır:</strong> ${escapeHtml(variant.whenToUse)}`;
      reasonBanner.hidden = false;
    } else {
      reasonBanner.innerHTML = "";
      reasonBanner.hidden = true;
    }
  }

  // Alternatif hap butonlarının aktiflik durumunu güncelle
  cardEl.querySelectorAll(".alt-pill-btn").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.variantIndex) === variant.index);
  });
}

// Kartlardaki Ön Açı / Yan Açı / Fotoğraf geçişlerini, alternatif seçicileri ve modal butonlarını bağlar
