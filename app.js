/**
 * Dosya: app.js
 * Açıklama: Kravitz Lean & Fit uygulamasının ana giriş modülü. Modülleri başlatır,
 * global olay dinleyicilerini (profil, bel/kilo formu, arama, modal odak tuzağı, SW kaydı) bağlar.
 */

import { getProgramDays } from "./data.js";
import { calculateMifflinBmr } from "./src/nutrition.js";
import {
  DISCLAIMER_ACK_KEY,
  clearStoredProfile,
  elements,
  exportAllUserData,
  findModeForTabId,
  getActiveTabs,
  getTodayIsoDate,
  importUserData,
  loadBodyLogs,
  loadPrefs,
  saveBodyLogs,
  savePrefs,
  saveStoredProfile,
  state,
} from "./src/state.js";
import { animateScoreboardOpen, initArenaMotion } from "./js/motion.js";
import { initRestTimerControls } from "./src/media.js";
import { closeMediaModal, getModalFocusableElements } from "./src/modal.js";
import {
  renderBodyLogsSection,
  renderMainContent,
  renderSystemPillars,
  renderTabs,
  renderTanitaSection,
  selectTab,
} from "./src/render/index.js";

function initEventListeners() {
  // Üst bar "Yazılı & Tablo Özet" kısayol butonu
  if (elements.openSummaryBtn) {
    elements.openSummaryBtn.addEventListener("click", () => {
      selectTab("summary", { scrollToContent: true });
    });
  }

  // Hero ve kartlardaki #kaynaklar bağlantılarını kaynaklar bölümüne yönlendirir
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href="#kaynaklar"], [data-open-sources]');
    if (!link) return;
    event.preventDefault();
    if (!document.getElementById("kaynaklar")) {
      selectTab("summary", { scrollToContent: false });
    }
    document.getElementById("kaynaklar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Profilim çekmecesi aç/kapa
  elements.tanitaToggleBtn.addEventListener("click", () => {
    const isExpanded = elements.tanitaToggleBtn.getAttribute("aria-expanded") === "true";
    elements.tanitaToggleBtn.setAttribute("aria-expanded", String(!isExpanded));
    elements.tanitaDrawer.hidden = isExpanded;
    if (!elements.tanitaDrawer.hidden) {
      animateScoreboardOpen();
    }
  });

  // Profilim formu kaydetme, BMR tahmini ve sıfırlama
  const calcBmrBtn = document.getElementById("calc-bmr-btn");
  if (calcBmrBtn && elements.profileForm) {
    calcBmrBtn.addEventListener("click", () => {
      const formData = new FormData(elements.profileForm);
      const bmr = calculateMifflinBmr({
        sex: String(formData.get("sex") || "male"),
        weightKg: Number(formData.get("weightKg")),
        heightCm: Number(formData.get("heightCm")),
        age: Number(formData.get("age")),
      });
      const bmrInput = elements.profileForm.elements.namedItem("bmrKcal");
      if (bmrInput) bmrInput.value = String(bmr);
      if (elements.profileSaveStatus) {
        elements.profileSaveStatus.textContent = `Mifflin-St Jeor BMR hesaplandı (~${bmr} kcal). Uygulamak için Profili Kaydet'e bas.`;
      }
    });
  }

  if (elements.profileForm) {
    elements.profileForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(elements.profileForm);
      const rawMuscle = String(formData.get("muscleMassKg") || "").trim();
      const nextProfile = {
        isCustom: true,
        sex: String(formData.get("sex") || "male"),
        age: Number(formData.get("age")),
        heightCm: Number(formData.get("heightCm")),
        weightKg: Number(formData.get("weightKg")),
        bodyFatPct: Number(formData.get("bodyFatPct")),
        muscleMassKg: rawMuscle !== "" ? Number(rawMuscle) : null,
        bmrKcal: Number(formData.get("bmrKcal")),
        waistCm: Number(formData.get("waistCm")),
        activityMultiplier: Number(formData.get("activityMultiplier")),
        targetBodyFatPct: Number(formData.get("targetBodyFatPct")),
      };
      const saved = saveStoredProfile(nextProfile);
      renderTanitaSection();
      renderMainContent();
      if (elements.profileSaveStatus) {
        elements.profileSaveStatus.textContent = saved
          ? "Kaydedildi — hedefler tarayıcı hafızasından güncellendi."
          : "Hedefler geçici olarak güncellendi (tarayıcı depolaması kapalı).";
      }
    });
  }

  if (elements.resetProfileBtn) {
    elements.resetProfileBtn.addEventListener("click", () => {
      clearStoredProfile();
      renderTanitaSection();
      renderMainContent();
      if (elements.profileSaveStatus) {
        elements.profileSaveStatus.textContent = "Örnek profil değerlerine dönüldü.";
      }
    });
  }

  // Haftalık program modu seçici (4 Günlük / 3 Gün Full-Body / 3 Gün Üst-Alt-Full)
  document.querySelectorAll("#program-mode-switcher [data-program-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextMode = btn.dataset.programMode;
      if (!nextMode || nextMode === state.programMode) return;
      state.programMode = nextMode;
      const validIds = new Set(getActiveTabs(nextMode).map((t) => t.id));
      const nextTab = validIds.has(state.activeTab)
        ? state.activeTab
        : getProgramDays(nextMode)[0]?.id || "day-1";
      savePrefs({ programMode: nextMode, activeTab: nextTab });
      selectTab(nextTab, { scrollToContent: false });
    });
  });

  // Arama alanı (180ms debounce ile DOM yükünü azaltır)
  let searchDebounceTimer = null;
  elements.searchInput.addEventListener("input", (event) => {
    state.searchQuery = event.target.value;
    elements.clearSearchBtn.hidden = state.searchQuery.length === 0;
    if (searchDebounceTimer) window.clearTimeout(searchDebounceTimer);
    searchDebounceTimer = window.setTimeout(() => {
      renderTabs();
      renderMainContent();
    }, 180);
  });

  elements.clearSearchBtn.addEventListener("click", () => {
    if (searchDebounceTimer) {
      window.clearTimeout(searchDebounceTimer);
      searchDebounceTimer = null;
    }
    state.searchQuery = "";
    elements.searchInput.value = "";
    elements.clearSearchBtn.hidden = true;
    renderTabs();
    renderMainContent();
  });

  // JSON yedek indirme & geri yükleme
  const exportBackupBtn = document.getElementById("export-backup-btn");
  const importBackupInput = document.getElementById("import-backup-input");
  const backupStatus = document.getElementById("backup-status");

  if (exportBackupBtn) {
    exportBackupBtn.addEventListener("click", () => {
      const payload = exportAllUserData();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kravitz-lean-fit-yedek-${getTodayIsoDate()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (backupStatus) {
        backupStatus.textContent = "Yedek dosyası indirildi.";
      }
    });
  }

  if (importBackupInput) {
    importBackupInput.addEventListener("change", async () => {
      const file = importBackupInput.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const result = importUserData(parsed);
        if (result.ok) {
          const nextPrefs = loadPrefs();
          state.programMode = nextPrefs.programMode || "4day";
          state.viewMode = ["both", "table-only", "cards-only"].includes(nextPrefs.viewMode)
            ? nextPrefs.viewMode
            : "both";
          state.activeTab = nextPrefs.activeTab || getProgramDays(state.programMode)[0]?.id || "day-1";
          renderTanitaSection();
          renderBodyLogsSection();
          renderTabs();
          renderMainContent();
        }
        if (backupStatus) {
          backupStatus.textContent = result.message;
        }
      } catch {
        if (backupStatus) {
          backupStatus.textContent = "JSON dosyası okunamadı.";
        }
      } finally {
        importBackupInput.value = "";
      }
    });
  }

  // Tarayıcı geri/ileri hash navigasyonu
  window.addEventListener("hashchange", () => {
    const rawHash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!rawHash || rawHash === "kaynaklar") return;
    const resolved = findModeForTabId(rawHash);
    if (!resolved.valid) return;
    if (resolved.mode && resolved.mode !== state.programMode) {
      state.programMode = resolved.mode;
    }
    selectTab(rawHash, { scrollToContent: false, syncHash: false });
  });

  // Modal kapatma (<dialog> yerel ESC cancel olayı + backdrop tıklaması + odak tuzağı)
  elements.modalCloseBtn.addEventListener("click", closeMediaModal);
  elements.modal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeMediaModal();
  });
  elements.modal.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      closeMediaModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!elements.modal.open) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMediaModal();
      return;
    }

    if (event.key === "Tab") {
      const focusables = getModalFocusableElements();
      if (focusables.length === 0) {
        event.preventDefault();
        if (elements.modalCloseBtn) elements.modalCloseBtn.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const dialog = elements.modal.querySelector(".modal-dialog");
      const activeInside = dialog ? dialog.contains(document.activeElement) : false;

      if (event.shiftKey) {
        if (!activeInside || document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (!activeInside || document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

// İlk açılış sağlık uyarısını localStorage durumuna göre gösterir/gizler
function initDisclaimerBanner() {
  const banner = document.getElementById("medical-disclaimer-banner");
  const acceptBtn = document.getElementById("medical-disclaimer-accept");
  if (!banner) return;

  let acknowledged = false;
  try {
    acknowledged = window.localStorage.getItem(DISCLAIMER_ACK_KEY) === "1";
  } catch {
    acknowledged = false;
  }

  banner.hidden = acknowledged;

  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      try {
        window.localStorage.setItem(DISCLAIMER_ACK_KEY, "1");
      } catch {
        // Depolama erişimi kısıtlıysa sessizce kapat
      }
      banner.hidden = true;
    });
  }
}

// Bekleyen yeni Service Worker için yenileme bildirimi gösterir
function showSwUpdateBanner(waitingWorker) {
  if (!waitingWorker || document.getElementById("sw-update-banner")) return;
  const bar = document.createElement("aside");
  bar.id = "sw-update-banner";
  bar.className = "disclaimer-banner";
  bar.setAttribute("role", "status");
  bar.innerHTML = `<div class="disclaimer-copy"><strong>Yeni sürüm hazır</strong> — Güncel içeriği görmek için yenileyin.</div><button type="button" class="disclaimer-btn">Yenile</button>`;
  bar.querySelector("button")?.addEventListener("click", (e) => {
    e.currentTarget.disabled = true;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  });
  document.querySelector("main")?.prepend(bar);
}

// Çevrimdışı PWA desteği için Service Worker kaydını yapar
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .then((reg) => {
          if (reg.waiting) showSwUpdateBanner(reg.waiting);
          reg.addEventListener("updatefound", () => {
            const nw = reg.installing;
            nw?.addEventListener("statechange", () => {
              if (nw.state === "installed" && navigator.serviceWorker.controller) {
                showSwUpdateBanner(nw);
              }
            });
          });
        })
        .catch(() => {});
    });
  } catch {
    // Ortam desteklemiyorsa sessizce atla
  }
}

// Haftalık bel ve kilo takip formunu bağlar
function initBodyLogForm() {
  const bodyForm = document.getElementById("body-log-form");
  if (!bodyForm) return;
  const dateInput = bodyForm.elements.namedItem("date");
  if (dateInput && !dateInput.value) {
    dateInput.value = getTodayIsoDate();
  }

  bodyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(bodyForm);
    const dateVal = String(formData.get("date") || getTodayIsoDate());
    const waistCm = Number(formData.get("waistCm"));
    const weightKg = Number(formData.get("weightKg"));
    if (!Number.isFinite(waistCm) || !Number.isFinite(weightKg)) return;

    const existing = loadBodyLogs().filter((item) => item.date !== dateVal);
    existing.push({ date: dateVal, waistCm, weightKg });
    existing.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    saveBodyLogs(existing);
    renderBodyLogsSection();
  });

  renderBodyLogsSection();
}

// Kalıcı tercihler ve URL hash üzerinden başlangıç sekmesini / modunu yükler
function restoreInitialNavigationState() {
  const prefs = loadPrefs();
  state.programMode = ["4day", "3day-aba", "3day-ulf"].includes(prefs.programMode)
    ? prefs.programMode
    : "4day";
  state.viewMode = ["both", "table-only", "cards-only"].includes(prefs.viewMode)
    ? prefs.viewMode
    : "both";

  const rawHash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (rawHash && rawHash !== "kaynaklar") {
    const resolved = findModeForTabId(rawHash);
    if (resolved.valid) {
      if (resolved.mode) state.programMode = resolved.mode;
      state.activeTab = rawHash;
      return;
    }
  }

  const validTabIds = new Set(getActiveTabs(state.programMode).map((t) => t.id));
  state.activeTab = validTabIds.has(prefs.activeTab)
    ? prefs.activeTab
    : getProgramDays(state.programMode)[0]?.id || "day-1";
}

// Uygulama başlangıcı
function bootstrap() {
  restoreInitialNavigationState();
  registerServiceWorker();
  initDisclaimerBanner();
  renderSystemPillars();
  renderTanitaSection();
  initBodyLogForm();
  initRestTimerControls();
  renderTabs();
  renderMainContent();
  // Hareket sistemini ilk boyamadan sonra boşta çalıştır (açılış uzun görevlerini önler)
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => initArenaMotion(), { timeout: 250 });
  } else {
    window.setTimeout(() => initArenaMotion(), 0);
  }
  initEventListeners();
}

bootstrap();
