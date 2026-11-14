/**
 * Dosya: app.js
 * Açıklama: Kravitz Lean & Fit uygulamasının ana giriş modülü. Modülleri başlatır,
 * global olay dinleyicilerini (profil, bel/kilo formu, arama, modal odak tuzağı, SW kaydı) bağlar.
 */

import {
  DISCLAIMER_ACK_KEY,
  clearStoredProfile,
  elements,
  getTodayIsoDate,
  loadBodyLogs,
  saveBodyLogs,
  saveStoredProfile,
  state,
} from "./src/state.js";
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

  // Profilim çekmecesi aç/kapa
  elements.tanitaToggleBtn.addEventListener("click", () => {
    const isExpanded = elements.tanitaToggleBtn.getAttribute("aria-expanded") === "true";
    elements.tanitaToggleBtn.setAttribute("aria-expanded", String(!isExpanded));
    elements.tanitaDrawer.hidden = isExpanded;
  });

  // Profilim formu kaydetme ve sıfırlama
  if (elements.profileForm) {
    elements.profileForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(elements.profileForm);
      const nextProfile = {
        isCustom: true,
        age: Number(formData.get("age")),
        weightKg: Number(formData.get("weightKg")),
        bodyFatPct: Number(formData.get("bodyFatPct")),
        muscleMassKg: Number(formData.get("muscleMassKg")),
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

  // Arama alanı
  elements.searchInput.addEventListener("input", (event) => {
    state.searchQuery = event.target.value;
    elements.clearSearchBtn.hidden = state.searchQuery.length === 0;
    renderTabs();
    renderMainContent();
  });

  elements.clearSearchBtn.addEventListener("click", () => {
    state.searchQuery = "";
    elements.searchInput.value = "";
    elements.clearSearchBtn.hidden = true;
    renderTabs();
    renderMainContent();
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

// Çevrimdışı PWA desteği için Service Worker kaydını yapar
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
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

// Uygulama başlangıcı
function bootstrap() {
  registerServiceWorker();
  initDisclaimerBanner();
  renderSystemPillars();
  renderTanitaSection();
  initBodyLogForm();
  initRestTimerControls();
  renderTabs();
  renderMainContent();
  initEventListeners();
}

bootstrap();
