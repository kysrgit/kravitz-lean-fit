/**
 * Dosya: src/render/cards.js
 * Açıklama: Egzersiz kartları, Core/21'ler kartları, günlük özet tabloları, alternatif hap seçicisi
 * ve kart içi varyant güncelleme işlemlerini render eder.
 */

import { CORE_LIBRARY, getExerciseMedia } from "../../data.js";
import {
  escapeHtml,
  getExerciseLogKey,
  getExerciseSetHistory,
  getExerciseVariants,
  savePrefs,
} from "../state.js";
import { createMediaStageHtml, observeVisibleStages } from "../media.js";
import { openMediaModal } from "../modal.js";
import { lucideIcon } from "./icons.js";

function formatSetPrevBadge(prevSet, todaySet) {
  if (prevSet && (prevSet.kg !== "" || prevSet.reps !== "")) {
    return `Önceki: ${prevSet.kg !== "" ? `${prevSet.kg} kg` : "-"} × ${prevSet.reps !== "" ? `${prevSet.reps} tek.` : "-"}`;
  }
  if (todaySet && (todaySet.kg !== "" || todaySet.reps !== "")) {
    return `Bugün: ${todaySet.kg !== "" ? `${todaySet.kg} kg` : "-"} × ${todaySet.reps !== "" ? `${todaySet.reps} tek.` : "-"}`;
  }
  return "";
}

// Kart içinde tamamlanmamış ilk seti sıradaki aktif set olarak işaretler
export function syncCardNextActiveStep(cardEl) {
  if (!cardEl) return;
  const steps = Array.from(cardEl.querySelectorAll(".pyramid-step"));
  let assignedNext = false;
  steps.forEach((stepEl) => {
    const isDone = stepEl.classList.contains("is-done");
    const isNext = !isDone && !assignedNext;
    if (isNext) assignedNext = true;
    stepEl.classList.toggle("is-next-active", isNext);
  });
  const allDone = steps.length > 0 && steps.every((s) => s.classList.contains("is-done"));
  cardEl.classList.toggle("is-card-complete", allDone);
}

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
      <div class="alternatives-header">${lucideIcon("refresh-cw", { size: 15 })} <span>Yedek Oyuncular · Alternatifler (Makine Doluysa)</span></div>
      <div class="alt-pills-row">${pillsHtml}</div>
      <div class="alt-reason-banner" ${activeVariant.whenToUse ? "" : "hidden"}>${reasonHtml}</div>
    </div>
  `;
}

// Tekil egzersiz kartı HTML'ini üretir
export function createExerciseCardHtml(exercise, badgeText, initialVariantIndex = 0) {
  const coreItem = CORE_LIBRARY[exercise.coreRestId];
  const maxSets = exercise.pyramidSets.length;
  const seqLabel = String(exercise.order || 1).padStart(2, "0");

  const variants = getExerciseVariants(exercise, "exercise");
  const activeVariant = variants[initialVariantIndex] || variants[0];

  const restSeconds = exercise.restSeconds || 90;
  const activeLogKey = getExerciseLogKey(exercise.id, activeVariant.index, variants);
  const { todaySession, previousSession } = getExerciseSetHistory(activeLogKey);
  const firstPendingIdx = exercise.pyramidSets.findIndex(
    (step) => !todaySession?.sets?.[String(step.set)]?.done
  );
  const allSetsDone = exercise.pyramidSets.length > 0 && firstPendingIdx === -1;

  const pyramidHtml = exercise.pyramidSets
    .map((step, index) => {
      const scaleRatio = Math.min(
        1,
        Math.max(0.36, 0.36 + (index / Math.max(1, maxSets - 1)) * 0.64)
      ).toFixed(2);
      const setLabel = `${step.set}. Set`;
      const phaseBadgeText = step.isWarmup ? "ISINMA" : "ÇALIŞMA";
      const todaySet = todaySession?.sets?.[String(step.set)] || null;
      const prevSet = previousSession?.sets?.[String(step.set)] || null;
      const isDone = Boolean(todaySet?.done);
      const isNextActive = !isDone && index === firstPendingIdx;
      const prevBadgeText = formatSetPrevBadge(prevSet, todaySet);

      return `
        <div class="pyramid-step ${step.isWarmup ? "is-warmup" : ""} ${isDone ? "is-done" : ""} ${isNextActive ? "is-next-active" : ""}">
          <div class="pyramid-step-head">
            <div class="set-head-group">
              <span class="set-phase-badge ${step.isWarmup ? "is-warmup" : "is-work"}">${phaseBadgeText}</span>
              <span class="set-num">${escapeHtml(setLabel)}</span>
              <span class="set-load-sep" aria-hidden="true">·</span>
              <span class="set-load">${escapeHtml(step.load)}</span>
            </div>
            <span class="set-reps tabular">${escapeHtml(step.reps)}</span>
          </div>
          <div
            class="set-log-controls"
            data-set-log-row
            data-log-ex="${escapeHtml(exercise.id)}"
            data-log-key="${escapeHtml(activeLogKey)}"
            data-log-set="${escapeHtml(step.set)}"
            data-rest-seconds="${escapeHtml(restSeconds)}"
          >
            <span class="set-prev-badge" data-set-prev>${escapeHtml(prevBadgeText)}</span>
            <div class="set-log-inputs">
              <div
                class="stepper-group"
                role="group"
                aria-label="${escapeHtml(activeVariant.name)} ${escapeHtml(step.set)}. set ağırlık"
              >
                <button
                  type="button"
                  class="stepper-btn"
                  data-step-field="kg"
                  data-step-delta="-2.5"
                  aria-label="2.5 kg azalt"
                  title="-2.5 kg"
                >
                  ${lucideIcon("minus", { size: 13 })}
                </button>
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="0.5"
                  inputmode="decimal"
                  placeholder="kg"
                  aria-label="${escapeHtml(activeVariant.name)} ${escapeHtml(step.set)}. set kg"
                  data-log-field="kg"
                  data-prev-val="${escapeHtml(prevSet?.kg ?? "")}"
                  value="${escapeHtml(todaySet?.kg ?? "")}"
                />
                <button
                  type="button"
                  class="stepper-btn"
                  data-step-field="kg"
                  data-step-delta="2.5"
                  aria-label="2.5 kg artır"
                  title="+2.5 kg"
                >
                  ${lucideIcon("plus", { size: 13 })}
                </button>
              </div>
              <div
                class="stepper-group"
                role="group"
                aria-label="${escapeHtml(activeVariant.name)} ${escapeHtml(step.set)}. set tekrar"
              >
                <button
                  type="button"
                  class="stepper-btn"
                  data-step-field="reps"
                  data-step-delta="-1"
                  aria-label="1 tekrar azalt"
                  title="-1 tekrar"
                >
                  ${lucideIcon("minus", { size: 13 })}
                </button>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  inputmode="numeric"
                  placeholder="tek"
                  aria-label="${escapeHtml(activeVariant.name)} ${escapeHtml(step.set)}. set tekrar"
                  data-log-field="reps"
                  data-prev-val="${escapeHtml(prevSet?.reps ?? "")}"
                  value="${escapeHtml(todaySet?.reps ?? "")}"
                />
                <button
                  type="button"
                  class="stepper-btn"
                  data-step-field="reps"
                  data-step-delta="1"
                  aria-label="1 tekrar artır"
                  title="+1 tekrar"
                >
                  ${lucideIcon("plus", { size: 13 })}
                </button>
              </div>
              <button
                type="button"
                class="set-done-btn"
                data-set-done-btn
                aria-pressed="${isDone}"
                aria-label="${escapeHtml(activeVariant.name)} ${escapeHtml(step.set)}. seti tamamlandı olarak işaretle"
                title="Seti tamamlandı olarak işaretle"
              >
                ${lucideIcon("check", { size: 16 })}
              </button>
            </div>
          </div>
          <div class="set-bar-track" aria-hidden="true">
            <div class="set-bar ${step.isWarmup ? "is-warmup" : ""}" style="--bar-scale: ${scaleRatio}"></div>
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
      class="exercise-card ${allSetsDone ? "is-card-complete" : ""}"
      data-exercise-id="${escapeHtml(exercise.id)}"
      data-variant-kind="exercise"
      data-item-id="${escapeHtml(exercise.id)}"
      data-active-variant-index="${activeVariant.index}"
    >
      <div class="card-specular" aria-hidden="true"></div>
      ${stageHtml}

      <div class="card-body">
        <div class="exercise-header">
          <span class="card-seq-num display-type tabular" aria-hidden="true">${escapeHtml(seqLabel)}</span>
          <h3 class="exercise-title">${escapeHtml(activeVariant.name)}</h3>
          <p class="exercise-subtitle">${escapeHtml(activeVariant.turkishName)}</p>
        </div>

        <div class="pyramid-box">
          <div class="pyramid-box-title-row">
            <span class="pyramid-box-title">Piramit (${maxSets} Set)</span>
            <button
              type="button"
              class="start-rest-timer-btn"
              data-start-timer="${escapeHtml(restSeconds)}"
              data-timer-label="${escapeHtml(activeVariant.name)} Dinlenme"
              aria-label="${escapeHtml(restSeconds)} saniye dinlenme sayacını başlat"
            >
              ${lucideIcon("clock", { size: 13 })}
              <span>${escapeHtml(restSeconds)} sn · Başlat</span>
              ${lucideIcon("play", { size: 12 })}
            </button>
          </div>
          <p class="rest-strategy-note">${coreItem ? "21 core yap, kalan sürede dinlenerek çalışma setine toparlanmış gir (Schoenfeld ve ark., 2016)." : "Tam pasif dinlenme: ağır sete nefes ve gövde kilidin tam toparlanmış gir (Schoenfeld ve ark., 2016)."}</p>
          <div class="pyramid-steps">${pyramidHtml}</div>
        </div>

        <details class="card-details">
          <summary class="card-details-summary">
            <span>Form İpuçları &amp; Alternatifler</span>
            ${lucideIcon("chevron-down", { size: 15 })}
          </summary>
          <div class="card-details-body">
            ${alternativesHtml}
            <ul class="tips-list">${tipsHtml}</ul>
          </div>
        </details>

        ${
          coreItem
            ? `
          <button
            type="button"
            class="core-rest-btn"
            data-open-core="${escapeHtml(coreItem.id)}"
          >
            <span class="core-thumb-badge tabular" aria-hidden="true">21×</span>
            <div class="core-rest-copy">
              <span class="core-rest-kicker">Set Arası Aktif Dinlenme</span>
              <span class="core-rest-text">${escapeHtml(exercise.coreRestLabel)}</span>
            </div>
            <span class="core-rest-action">Form &amp; Alternatifler ${lucideIcon("arrow-right", { size: 14 })}</span>
          </button>
        `
            : `
          <div class="core-rest-passive">
            <span class="core-thumb-badge tabular" aria-hidden="true">${lucideIcon("clock", { size: 18 })}</span>
            <div class="core-rest-copy">
              <span class="core-rest-kicker">Set Arası Pasif Toparlanma</span>
              <span class="core-rest-text">${escapeHtml(exercise.coreRestLabel || "Tam pasif dinlenme — Ağır sette gövde kilidi için core eklenmez.")}</span>
            </div>
          </div>
        `
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
          <td class="col-core" data-label="Set Arası (Core / Dinlenme)">
            ${
              coreItem
                ? `
              <div class="table-core-note">21 core yap, kalan sürede ${escapeHtml(restBadgeText)} tamamla.</div>
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
                : `<div class="table-core-note">${escapeHtml(exercise.coreRestLabel || "Tam pasif dinlenme")}</div>`
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

  cardEl.dataset.activeVariantIndex = String(variant.index);

  // Medya sahnesini seçilen varyantın fotoğraf/referans sahnesiyle tamamen yenile
  const isCore = cardEl.dataset.variantKind === "core";
  const itemId = cardEl.dataset.itemId || "";
  const oldStage = cardEl.querySelector(".media-stage");
  if (oldStage) {
    if (oldStage._photoTimer) {
      window.clearInterval(oldStage._photoTimer);
      oldStage._photoTimer = null;
    }
    const badgeText =
      oldStage.querySelector(".order-badge")?.textContent?.trim() ||
      (isCore ? "21× AKTİF DİNLENME" : "HAREKET");
    const triggerAttr = isCore
      ? `data-open-core="${escapeHtml(itemId)}"`
      : `data-open-exercise="${escapeHtml(itemId)}"`;
    const stageHtml = createMediaStageHtml({
      badgeText,
      name: variant.name,
      primaryTag: variant.primaryTag,
      secondaryTag: variant.secondaryTag,
      tips: variant.tips,
      sourceUrl: variant.sourceUrl,
      videoKey: variant.videoKey,
      triggerAttr,
    });
    const wrapper = document.createElement("div");
    wrapper.innerHTML = stageHtml.trim();
    const newStage = wrapper.firstElementChild;
    if (newStage) {
      oldStage.replaceWith(newStage);
      const modalTrigger = newStage.querySelector("[data-open-exercise], [data-open-core]");
      if (modalTrigger) {
        modalTrigger.addEventListener("click", () => {
          openMediaModal({ variants, initialVariantIndex: variant.index });
        });
      }
      observeVisibleStages();
    }
  }

  // Dinlenme sayacı etiketini seçilen varyant adına göre güncelle
  const timerBtn = cardEl.querySelector(".start-rest-timer-btn");
  if (timerBtn) {
    timerBtn.dataset.timerLabel = `${variant.name} Dinlenme`;
  }

  // Seçili varyantı kalıcı tercihlere yaz ve set kayıt satırlarını yeni varyanta geçir
  if (itemId) {
    savePrefs({ selectedVariants: { [itemId]: variant.index } });
  }
  if (!isCore && itemId) {
    const nextLogKey = getExerciseLogKey(itemId, variant.index, variants);
    const { todaySession, previousSession } = getExerciseSetHistory(nextLogKey);
    cardEl.querySelectorAll("[data-set-log-row]").forEach((rowEl) => {
      const setNum = String(rowEl.dataset.logSet || "");
      rowEl.dataset.logKey = nextLogKey;
      const todaySet = todaySession?.sets?.[setNum] || null;
      const prevSet = previousSession?.sets?.[setNum] || null;
      const kgInput = rowEl.querySelector('[data-log-field="kg"]');
      const repsInput = rowEl.querySelector('[data-log-field="reps"]');
      const doneBtn = rowEl.querySelector("[data-set-done-btn]");
      const prevBadge = rowEl.querySelector("[data-set-prev]");
      if (kgInput) {
        kgInput.value = todaySet?.kg ?? "";
        kgInput.dataset.prevVal = prevSet?.kg ?? "";
        kgInput.setAttribute("aria-label", `${variant.name} ${setNum}. set kg`);
      }
      if (repsInput) {
        repsInput.value = todaySet?.reps ?? "";
        repsInput.dataset.prevVal = prevSet?.reps ?? "";
        repsInput.setAttribute("aria-label", `${variant.name} ${setNum}. set tekrar`);
      }
      if (doneBtn) {
        doneBtn.setAttribute("aria-pressed", String(Boolean(todaySet?.done)));
        doneBtn.setAttribute(
          "aria-label",
          `${variant.name} ${setNum}. seti tamamlandı olarak işaretle`
        );
      }
      rowEl.closest(".pyramid-step")?.classList.toggle("is-done", Boolean(todaySet?.done));
      if (prevBadge) {
        prevBadge.textContent = formatSetPrevBadge(prevSet, todaySet);
      }
    });
    syncCardNextActiveStep(cardEl);
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
