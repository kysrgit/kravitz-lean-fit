/**
 * Dosya: src/render/index.js
 * Açıklama: Sekme geçişleri, klavye navigasyonu, ana içerik yönlendirmesi ve
 * render sonrası kart/tablo/sayaç etkileşim bağlayıcılarını dışa aktarır.
 */

import { WORKOUT_DAYS } from "../../data.js";
import {
  animateTabChange,
  animateVariantChange,
  refreshMotionForContent,
} from "../../js/motion.js";
import {
  TABS,
  elements,
  escapeHtml,
  findExerciseById,
  getCoreOrCardioItem,
  getExerciseVariants,
  saveSetLogEntry,
  state,
} from "../state.js";
import {
  clearPhotoTimers,
  observeVisibleVideos,
  shouldDisableAutoplay,
  startRestTimer,
} from "../media.js";
import { openMediaModal } from "../modal.js";
import { applyVariantToCard } from "./cards.js";
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

export function selectTab(tabId, { scrollToContent = false } = {}) {
  if (!tabId) return;
  state.activeTab = tabId;
  document.body.dataset.dayTheme = tabId;
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

// Üst sekme çubuğu ve mobil alt navigasyon barını senkronize biçimde oluşturur
export function renderTabs() {
  const hasSearch = state.searchQuery.trim().length > 0;
  document.body.dataset.dayTheme = hasSearch ? "day-1" : state.activeTab;

  elements.tabsNav.innerHTML = TABS.map((tab) => {
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
  }).join("");

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

  // Aktif üst sekme butonunu yatay şeritte ortala
  const activeTopTab = elements.tabsNav.querySelector(".tab-btn.active");
  if (activeTopTab && typeof activeTopTab.scrollIntoView === "function") {
    activeTopTab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  // Mobil başparmak bölgesi alt navigasyon barını oluştur (sıralama: 1-4. Gün, Özet, 21'ler, Besin)
  if (elements.mobileBottomNav) {
    const mobileOrder = ["day-1", "day-2", "day-3", "day-4", "summary", "core-guide", "nutrition"];
    const mobileTabs = mobileOrder.map((id) => TABS.find((t) => t.id === id)).filter(Boolean);

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
}

// Medya veya dış form referans sahnesi HTML'ini üretir
// Lisanslı yerel medya yoksa MuscleWiki kaynak sayfasına giden "Formu izle" bağlantısı gösterilir.

export function bindCardInteractions() {
  clearPhotoTimers();

  document.querySelectorAll(".media-stage").forEach((stage) => {
    const videoEl = stage.querySelector(".media-video");
    const frontImg = stage.querySelector(".frame-front");
    const sideImg = stage.querySelector(".frame-side");
    const indicator = stage.querySelector(".pose-indicator");
    const modeButtons = stage.querySelectorAll(".pose-btn");
    let photoLoopTimer = null;

    const stopPhotoLoop = () => {
      if (photoLoopTimer) {
        window.clearInterval(photoLoopTimer);
        photoLoopTimer = null;
      }
    };

    // Seçilen görünüme göre video açısını veya HD fotoğraf karesini uygular
    const applyMode = (mode) => {
      stopPhotoLoop();
      if (!videoEl) return;

      if (mode === "front" || mode === "side") {
        const targetSrc = mode === "front" ? videoEl.dataset.frontSrc : videoEl.dataset.sideSrc;
        if (videoEl.getAttribute("src") !== targetSrc) {
          videoEl.setAttribute("src", targetSrc);
          videoEl.load();
        }
        videoEl.classList.remove("is-hidden");
        if (!shouldDisableAutoplay()) {
          videoEl.play().catch(() => {});
        }
        if (frontImg) frontImg.classList.add("is-hidden");
        if (sideImg) sideImg.classList.add("is-hidden");
        indicator.textContent = mode === "front" ? "Ön Açı · Video" : "Yan Açı · Video";
        return;
      }

      // Kare modu: Ön ve yan açı kareleri arasında akıcı geçiş
      videoEl.classList.add("is-hidden");
      videoEl.pause();

      let showSide = false;
      const showFrame = (isSide) => {
        if (frontImg) frontImg.classList.toggle("is-hidden", isSide);
        if (sideImg) sideImg.classList.toggle("is-hidden", !isSide);
        indicator.textContent = isSide ? "Kare · Yan Açı" : "Kare · Ön Açı";
      };

      showFrame(false);
      if (!shouldDisableAutoplay()) {
        photoLoopTimer = window.setInterval(() => {
          showSide = !showSide;
          showFrame(showSide);
        }, 1700);
        state.photoTimers.push(photoLoopTimer);
      }
    };

    modeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        modeButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        applyMode(btn.dataset.mode);
      });
    });
  });

  observeVisibleVideos();

  // Kart içi Alternatif Hareketler seçicisi
  document.querySelectorAll("[data-variant-kind]").forEach((cardEl) => {
    const kind = cardEl.dataset.variantKind;
    const itemId = cardEl.dataset.itemId;
    const item = kind === "core" ? getCoreOrCardioItem(itemId) : findExerciseById(itemId);
    const variants = getExerciseVariants(item, kind);

    cardEl.querySelectorAll(".alt-pill-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.variantIndex);
        animateVariantChange(cardEl, () => applyVariantToCard(cardEl, variants, idx));
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
      renderMainContent();
    });
  });

  // Set günlüğü (kg / tekrar) canlı kayıt
  document.querySelectorAll("[data-set-log-row]").forEach((rowEl) => {
    const exId = rowEl.dataset.logEx;
    const setNum = rowEl.dataset.logSet;
    const kgInput = rowEl.querySelector('[data-log-field="kg"]');
    const repsInput = rowEl.querySelector('[data-log-field="reps"]');
    const badgeEl = rowEl.querySelector("[data-set-prev]");

    const persistRow = () => {
      const kgVal = kgInput ? kgInput.value.trim() : "";
      const repsVal = repsInput ? repsInput.value.trim() : "";
      saveSetLogEntry(exId, setNum, kgVal, repsVal);
      if (badgeEl && (kgVal !== "" || repsVal !== "")) {
        badgeEl.textContent = `Kaydedildi: ${kgVal || "-"} kg × ${repsVal || "-"} tek.`;
      }
    };

    // Mobilde odak kaybetmeden (blur olmadan) anlık yerel kayıt sağla
    if (kgInput) {
      kgInput.addEventListener("input", persistRow);
      kgInput.addEventListener("change", persistRow);
    }
    if (repsInput) {
      repsInput.addEventListener("input", persistRow);
      repsInput.addEventListener("change", persistRow);
    }
  });

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
    const selectedDay = WORKOUT_DAYS.find((d) => d.id === state.activeTab) || WORKOUT_DAYS[0];
    renderWorkoutDay(selectedDay);
  }

  // Tüm görünümlerde kart, tablo, set günlüğü, modal ve sayaç etkileşimlerini bağla
  bindCardInteractions();
  refreshMotionForContent();
}

// Olay dinleyicilerini başlatır

export { renderBodyLogsSection, renderSystemPillars, renderTanitaSection };
