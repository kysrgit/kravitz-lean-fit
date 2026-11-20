/**
 * Dosya: src/render/index.js
 * Açıklama: Sekme geçişleri, klavye navigasyonu, ana içerik yönlendirmesi ve
 * render sonrası kart/tablo/sayaç etkileşim bağlayıcılarını dışa aktarır.
 */

import { PROGRAM_MODES, getProgramDays } from "../../data.js";
import {
  animateTabChange,
  animateVariantChange,
  refreshMotionForContent,
} from "../../js/motion.js";
import {
  elements,
  escapeHtml,
  findExerciseById,
  getActiveProfileTargets,
  getActiveTabs,
  getCoreOrCardioItem,
  getDayProgressStats,
  getDayThemeForTab,
  getExerciseVariants,
  loadPrefs,
  savePrefs,
  saveSetLogEntry,
  state,
} from "../state.js";
import { clearPhotoTimers, observeVisibleStages, startRestTimer } from "../media.js";
import { openMediaModal } from "../modal.js";
import { applyVariantToCard, syncCardNextActiveStep } from "./cards.js";
import { lucideIcon } from "./icons.js";
import {
  renderBodyLogsSection,
  renderCoreGuide,
  renderFullSummaryTab,
  renderNutritionProtocol,
  renderSearchResults,
  renderSystemPillars,
  renderTanitaSection,
  renderWorkoutDay,
} from "./sections.js";

export function selectTab(tabId, { scrollToContent = false, syncHash = true } = {}) {
  if (!tabId) return;
  state.activeTab = tabId;
  document.body.dataset.dayTheme = getDayThemeForTab(tabId);
  savePrefs({ activeTab: tabId, programMode: state.programMode });
  if (syncHash && window.history && typeof window.history.replaceState === "function") {
    try {
      window.history.replaceState(null, "", `#${encodeURIComponent(tabId)}`);
    } catch {
      // Ortam geçmiş erişimini engellerse yoksay
    }
  }
  if (state.searchQuery) {
    state.searchQuery = "";
    elements.searchInput.value = "";
    elements.clearSearchBtn.hidden = true;
  }
  animateTabChange(renderTabs, renderMainContent, { useViewTransition: scrollToContent });
  if (scrollToContent && elements.contentArea) {
    elements.contentArea.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Üst sekme çubuğu, program modu seçicisi ve mobil alt navigasyon barını senkronize oluşturur
export function renderTabs() {
  const hasSearch = state.searchQuery.trim().length > 0;
  const activeTabs = getActiveTabs(state.programMode);
  document.body.dataset.dayTheme = hasSearch ? "day-1" : getDayThemeForTab(state.activeTab);

  document.querySelectorAll("#program-mode-switcher [data-program-mode]").forEach((btn) => {
    const isSelected = btn.dataset.programMode === state.programMode;
    btn.classList.toggle("active", isSelected);
    btn.setAttribute("aria-pressed", String(isSelected));
  });

  elements.tabsNav.innerHTML = activeTabs
    .map((tab) => {
      const isActive = state.activeTab === tab.id && !hasSearch;
      const topIcon = tab.topIconName ? lucideIcon(tab.topIconName, { size: 14 }) : "";
      return `
      <button
        type="button"
        role="tab"
        class="tab-btn ${isActive ? "active" : ""}"
        data-tab="${escapeHtml(tab.id)}"
        aria-selected="${isActive}"
        tabindex="${isActive ? "0" : "-1"}"
      >
        <span class="tab-btn-top">${topIcon}${escapeHtml(tab.top)}</span>
        <span class="tab-btn-sub">${escapeHtml(tab.sub)}</span>
        ${isActive ? '<span class="tab-active-indicator" data-flip-id="tab-indicator" aria-hidden="true"></span>' : ""}
      </button>
    `;
    })
    .join("");

  if (elements.openSummaryBtn) {
    elements.openSummaryBtn.classList.toggle("active", state.activeTab === "summary" && !hasSearch);
  }

  const tabButtons = Array.from(elements.tabsNav.querySelectorAll('[role="tab"]'));
  tabButtons.forEach((btn, idx) => {
    btn.addEventListener("click", () => {
      selectTab(btn.dataset.tab, { scrollToContent: true });
    });

    btn.addEventListener("keydown", (event) => {
      let nextIdx = null;
      if (event.key === "ArrowRight") {
        nextIdx = (idx + 1) % tabButtons.length;
      } else if (event.key === "ArrowLeft") {
        nextIdx = (idx - 1 + tabButtons.length) % tabButtons.length;
      } else if (event.key === "Home") {
        nextIdx = 0;
      } else if (event.key === "End") {
        nextIdx = tabButtons.length - 1;
      }

      if (nextIdx === null) return;
      event.preventDefault();
      const targetTabId = tabButtons[nextIdx].dataset.tab;
      selectTab(targetTabId, { scrollToContent: false });
      const focusedTab = Array.from(elements.tabsNav.querySelectorAll('[role="tab"]')).find(
        (el) => el.dataset.tab === targetTabId
      );
      if (focusedTab) {
        focusedTab.focus();
      }
    });
  });

  // Aktif üst sekme butonunu yalnızca yatay şeritte ortala (sayfayı dikeyde kaydırmadan)
  const activeTopTab = elements.tabsNav.querySelector(".tab-btn.active");
  if (activeTopTab && typeof elements.tabsNav.scrollTo === "function") {
    const nav = elements.tabsNav;
    const left = activeTopTab.offsetLeft - (nav.clientWidth - activeTopTab.clientWidth) / 2;
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    nav.scrollTo({ left: Math.max(0, left), behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  // Mobil başparmak bölgesi alt navigasyon barını oluştur (aktif günler + Özet, 21'ler, Besin)
  if (elements.mobileBottomNav) {
    const dayIds = getProgramDays(state.programMode).map((d) => d.id);
    const mobileOrder = [...dayIds, "summary", "core-guide", "nutrition"];
    const mobileTabs = mobileOrder.map((id) => activeTabs.find((t) => t.id === id)).filter(Boolean);
    elements.mobileBottomNav.style.setProperty("--mobile-nav-cols", String(mobileTabs.length));

    elements.mobileBottomNav.innerHTML = mobileTabs
      .map((tab) => {
        const isActive = state.activeTab === tab.id && !hasSearch;
        const iconVisual = tab.mobileIconName
          ? lucideIcon(tab.mobileIconName, { size: 18 })
          : `<span class="mobile-nav-code tabular">${escapeHtml(tab.mobileCode)}</span>`;
        return `
        <button
          type="button"
          class="mobile-nav-btn ${isActive ? "active" : ""}"
          data-mobile-tab="${escapeHtml(tab.id)}"
          aria-current="${isActive ? "page" : "false"}"
        >
          ${isActive ? '<span class="mobile-nav-indicator" data-flip-id="mobile-tab-indicator" aria-hidden="true"></span>' : ""}
          <span class="mobile-nav-icon" aria-hidden="true">${iconVisual}</span>
          <span class="mobile-nav-label">${escapeHtml(tab.mobileLabel)}</span>
        </button>
      `;
      })
      .join("");

    elements.mobileBottomNav.querySelectorAll(".mobile-nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectTab(btn.dataset.mobileTab, { scrollToContent: true });
      });
    });
  }

  updateHeroTelemetry();
}

// Hero içindeki canlı program durumu ve profil hedef kartını senkronize günceller
export function updateHeroTelemetry() {
  const modeBadgeEl = document.getElementById("hero-mode-badge");
  const ringEl = document.getElementById("hero-progress-ring");
  const pctEl = document.getElementById("hero-progress-pct");
  const dayLabelEl = document.getElementById("hero-active-day-label");
  const metaEl = document.getElementById("hero-progress-meta");
  const kcalEl = document.getElementById("hero-kcal-val");
  const proteinEl = document.getElementById("hero-protein-val");

  const modeInfo = PROGRAM_MODES.find((m) => m.id === state.programMode);
  if (modeBadgeEl && modeInfo) {
    modeBadgeEl.textContent = modeInfo.label;
  }

  const activeDays = getProgramDays(state.programMode);
  const activeDay = activeDays.find((d) => d.id === state.activeTab) || activeDays[0];
  if (activeDay) {
    const prefs = loadPrefs();
    const { doneCount, totalCount, pct } = getDayProgressStats(activeDay, prefs.selectedVariants);
    const circumference = 150.8;
    if (dayLabelEl) {
      dayLabelEl.textContent = `${activeDay.tabLabel} · ${activeDay.shortTitle}`;
    }
    if (pctEl) {
      pctEl.textContent = `%${pct}`;
    }
    if (metaEl) {
      metaEl.textContent = `${doneCount} / ${totalCount} Set tamamlandı`;
    }
    if (ringEl) {
      ringEl.setAttribute("stroke-dashoffset", (circumference * (1 - pct / 100)).toFixed(1));
    }
  }

  const targets = getActiveProfileTargets();
  if (kcalEl) {
    kcalEl.textContent = `${targets.targetCalories} kcal`;
  }
  if (proteinEl) {
    proteinEl.textContent = `${targets.proteinTargetG} g`;
  }
}

// Aktif gün sayfasındaki bugünkü set tamamlanma çubuğunu günceller
function updateActiveDayProgressUi() {
  const strip = document.getElementById("day-progress-strip");
  if (!strip) {
    updateHeroTelemetry();
    return;
  }
  const dayId = strip.dataset.progressDay;
  const day = getProgramDays(state.programMode).find((d) => d.id === dayId);
  if (!day) return;
  const prefs = loadPrefs();
  const { doneCount, totalCount, pct } = getDayProgressStats(day, prefs.selectedVariants);
  const textEl = document.getElementById("day-progress-text");
  const fillEl = document.getElementById("day-progress-fill");
  const pillEl = document.getElementById("day-progress-pct-pill");
  if (textEl) {
    textEl.textContent = `Bugünkü İlerleme: ${doneCount} / ${totalCount} Set (%${pct})`;
  }
  if (pillEl) {
    pillEl.textContent = `%${pct}`;
  }
  if (fillEl) {
    fillEl.style.transform = `scaleX(${(pct / 100).toFixed(3)})`;
  }
  strip.classList.toggle("is-complete", totalCount > 0 && doneCount === totalCount);
  updateHeroTelemetry();
}

export function bindCardInteractions() {
  clearPhotoTimers();
  observeVisibleStages();

  // Kart içi Alternatif Hareketler seçicisi
  document.querySelectorAll("[data-variant-kind]").forEach((cardEl) => {
    const kind = cardEl.dataset.variantKind;
    const itemId = cardEl.dataset.itemId;
    const item = kind === "core" ? getCoreOrCardioItem(itemId) : findExerciseById(itemId);
    const variants = getExerciseVariants(item, kind);

    cardEl.querySelectorAll(".alt-pill-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.variantIndex);
        animateVariantChange(cardEl, () => {
          applyVariantToCard(cardEl, variants, idx);
          updateActiveDayProgressUi();
        });
      });
    });
  });

  // Ana egzersiz detaylı video modalı butonları (kartta seçili veya tabloda tıklanan alternatifle açılır)
  document.querySelectorAll("[data-open-exercise]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const exercise = findExerciseById(btn.dataset.openExercise);
      if (!exercise) return;
      const cardEl = btn.closest("[data-variant-kind]");
      const activeIdx =
        btn.dataset.openVariant !== undefined
          ? Number(btn.dataset.openVariant)
          : cardEl
            ? Number(cardEl.dataset.activeVariantIndex || 0)
            : 0;
      const variants = getExerciseVariants(exercise, "exercise");
      openMediaModal({ variants, initialVariantIndex: activeIdx });
    });
  });

  // Core / Aktif dinlenme detaylı video modalı butonları
  document.querySelectorAll("[data-open-core]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const core = getCoreOrCardioItem(btn.dataset.openCore);
      if (!core) return;
      const parentCoreCard = btn.closest('.core-card[data-variant-kind="core"]');
      const activeIdx =
        btn.dataset.openVariant !== undefined
          ? Number(btn.dataset.openVariant)
          : parentCoreCard
            ? Number(parentCoreCard.dataset.activeVariantIndex || 0)
            : 0;
      const variants = getExerciseVariants(core, "core");
      openMediaModal({ variants, initialVariantIndex: activeIdx });
    });
  });

  // Gün içi görünüm modu seçici (Tablo + Kartlar / Sadece Tablo / Sadece Kartlar)
  document.querySelectorAll("[data-view-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextMode = btn.dataset.viewMode;
      if (!nextMode || nextMode === state.viewMode) return;
      state.viewMode = nextMode;
      savePrefs({ viewMode: nextMode });
      renderMainContent();
    });
  });

  // Set günlüğü (kg / tekrar / tamamlandı) canlı kayıt ve otomatik dinlenme sayacı
  document.querySelectorAll("[data-set-log-row]").forEach((rowEl) => {
    const exId = rowEl.dataset.logEx;
    const setNum = rowEl.dataset.logSet;
    const kgInput = rowEl.querySelector('[data-log-field="kg"]');
    const repsInput = rowEl.querySelector('[data-log-field="reps"]');
    const doneBtn = rowEl.querySelector("[data-set-done-btn]");
    const badgeEl = rowEl.querySelector("[data-set-prev]");

    const persistRow = (explicitDone = undefined) => {
      const logKey = rowEl.dataset.logKey || exId;
      const kgVal = kgInput ? kgInput.value.trim() : "";
      const repsVal = repsInput ? repsInput.value.trim() : "";
      const doneState =
        explicitDone === undefined
          ? doneBtn?.getAttribute("aria-pressed") === "true"
          : explicitDone;
      saveSetLogEntry(logKey, setNum, kgVal, repsVal, doneState);
      if (badgeEl && (kgVal !== "" || repsVal !== "")) {
        badgeEl.textContent = `Kaydedildi: ${kgVal || "-"} kg × ${repsVal || "-"} tek.`;
      }
    };

    // Mobilde odak kaybetmeden (blur olmadan) anlık yerel kayıt sağla
    if (kgInput) {
      kgInput.addEventListener("input", () => persistRow());
      kgInput.addEventListener("change", () => persistRow());
    }
    if (repsInput) {
      repsInput.addEventListener("input", () => persistRow());
      repsInput.addEventListener("change", () => persistRow());
    }
    // Braun/Hevy hızlı -/+ ağırlık ve tekrar adımlayıcıları
    rowEl.querySelectorAll("[data-step-field]").forEach((stepBtn) => {
      stepBtn.addEventListener("click", () => {
        const field = stepBtn.dataset.stepField;
        const delta = Number(stepBtn.dataset.stepDelta || 0);
        const targetInput = field === "kg" ? kgInput : repsInput;
        if (!targetInput || !Number.isFinite(delta)) return;

        const rawVal = targetInput.value.trim();
        const prevRaw = targetInput.dataset.prevVal ?? "";
        const hasPrev = prevRaw !== "" && Number.isFinite(Number(prevRaw));
        const base = rawVal !== "" ? Number(rawVal) : hasPrev ? Number(prevRaw) : 0;
        const clamped = Math.max(0, base + delta);
        const formatted =
          field === "kg"
            ? String(Math.min(500, Math.round(clamped * 2) / 2))
            : String(Math.min(100, Math.round(clamped)));
        targetInput.value = formatted;
        persistRow();
      });
    });

    if (doneBtn) {
      doneBtn.addEventListener("click", () => {
        const nextDone = doneBtn.getAttribute("aria-pressed") !== "true";
        doneBtn.setAttribute("aria-pressed", String(nextDone));
        rowEl.closest(".pyramid-step")?.classList.toggle("is-done", nextDone);
        persistRow(nextDone);
        syncCardNextActiveStep(rowEl.closest(".exercise-card"));
        updateActiveDayProgressUi();
        if (nextDone && loadPrefs().autoRestTimer !== false) {
          const secs = Number(rowEl.dataset.restSeconds) || 90;
          const cardTitle =
            rowEl
              .closest(".exercise-card")
              ?.querySelector(".exercise-title")
              ?.textContent?.trim() || "Set";
          startRestTimer(secs, `${cardTitle} · ${setNum}. Set Dinlenme`);
        }
      });
    }
  });

  const autoTimerToggle = document.getElementById("auto-rest-timer-toggle");
  if (autoTimerToggle) {
    autoTimerToggle.addEventListener("change", () => {
      savePrefs({ autoRestTimer: autoTimerToggle.checked });
    });
  }

  // Kart üzerindeki dinlenme geri sayım butonları
  document.querySelectorAll("[data-start-timer]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const secs = Number(btn.dataset.startTimer) || 90;
      const label = btn.dataset.timerLabel || "Set Arası Dinlenme";
      startRestTimer(secs, label);
    });
  });

  // Özet sayfasından ilgili videolu güne hızlı geçiş
  document.querySelectorAll("[data-jump-day]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectTab(btn.dataset.jumpDay, { scrollToContent: true });
    });
  });

  // Özet sayfası içi hızlı bölüm atlama butonları
  document.querySelectorAll("[data-scroll-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetEl = document.getElementById(btn.dataset.scrollTarget);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Yazdır / PDF Kaydet butonu
  const printBtn = document.getElementById("print-summary-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }
}

// ID üzerinden egzersiz kaydını bulur

export function renderMainContent() {
  if (state.searchQuery.trim().length > 0) {
    renderSearchResults(state.searchQuery);
  } else if (state.activeTab === "core-guide") {
    renderCoreGuide();
  } else if (state.activeTab === "nutrition") {
    renderNutritionProtocol();
  } else if (state.activeTab === "summary") {
    renderFullSummaryTab();
  } else {
    const activeDays = getProgramDays(state.programMode);
    const selectedDay = activeDays.find((d) => d.id === state.activeTab) || activeDays[0];
    renderWorkoutDay(selectedDay);
  }

  // Tüm görünümlerde kart, tablo, set günlüğü, modal ve sayaç etkileşimlerini bağla
  bindCardInteractions();
  refreshMotionForContent();
}

// Olay dinleyicilerini başlatır

export { renderBodyLogsSection, renderSystemPillars, renderTanitaSection };
