/**
 * Dosya: src/modal.js
 * Açıklama: Egzersiz formu ve alternatif seçici detay modalını, klavye odak tuzağını (focus trap)
 * ve kapanışta tetikleyiciye odak iadesini yönetir.
 */

import { MUSCLEWIKI_LICENSE_URL, getExerciseMedia } from "../data.js";
import { elements, escapeHtml } from "./state.js";
import { lucideIcon } from "./render/icons.js";
import { createAlternativesBoxHtml } from "./render/cards.js";

let lastFocusedBeforeModal = null;

// Modal içindeki odaklanabilir ve görünür öğeleri döndürür
export function getModalFocusableElements() {
  const dialog = elements.modal.querySelector(".modal-dialog");
  if (!dialog) return [];
  const candidates = dialog.querySelectorAll(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  return Array.from(candidates).filter((el) => {
    if (el.closest("[hidden]")) return false;
    return el.getClientRects().length > 0;
  });
}

export function openMediaModal({ variants, initialVariantIndex = 0 }) {
  lastFocusedBeforeModal =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (!variants || variants.length === 0) return;

  // Seçilen varyanta göre modal başlığını, fotoğraf/referans kartını ve ipuçlarını yeniler
  const applyModalVariant = (variantIdx) => {
    const variant = variants[variantIdx] || variants[0];
    const media = getExerciseMedia(variant);
    const resolvedSourceUrl = media.sourceUrl || "https://musclewiki.com/";
    const licenseUrl = media.licenseUrl || MUSCLEWIKI_LICENSE_URL;

    elements.modalBadge.textContent = variant.modalBadge;
    elements.modalTitle.textContent = variant.name;
    elements.modalSubtitle.textContent = variant.turkishName;

    if (media.startImg && media.endImg) {
      let activePos = "start";
      const renderPhotoModal = () => {
        const isStart = activePos === "start";
        const mainSrc = isStart ? media.startImg : media.endImg;
        const thumbSrc = isStart ? media.endImgSmall : media.startImgSmall;
        elements.modalVideoContainer.innerHTML = `
          <div class="modal-photo-stage">
            <div class="modal-photo-tabs" role="tablist" aria-label="Pozisyon seçimi">
              <button type="button" role="tab" aria-selected="${isStart}" class="pose-btn ${isStart ? "active" : ""}" data-modal-pos="start">Başlangıç</button>
              <button type="button" role="tab" aria-selected="${!isStart}" class="pose-btn ${!isStart ? "active" : ""}" data-modal-pos="end">Bitiş</button>
            </div>
            <div class="modal-photo-grid">
              <img class="modal-photo-main" src="${escapeHtml(mainSrc)}" alt="${escapeHtml(variant.name)} ${isStart ? "başlangıç" : "bitiş"} pozisyonu" />
              <button type="button" class="modal-photo-thumb-btn" data-modal-pos="${isStart ? "end" : "start"}" aria-label="${isStart ? "Bitiş pozisyonuna geç" : "Başlangıç pozisyonuna geç"}">
                <img class="modal-photo-thumb" src="${escapeHtml(thumbSrc)}" alt="${escapeHtml(variant.name)} ${isStart ? "bitiş" : "başlangıç"} önizleme" />
                <span>${isStart ? "Bitiş" : "Başlangıç"}</span>
              </button>
            </div>
            <div class="modal-photo-credit">
              <span>Görsel: ${escapeHtml(media.credit || "free-exercise-db (public domain)")}</span>
              <a href="${escapeHtml(resolvedSourceUrl)}" target="_blank" rel="noopener noreferrer" class="license-terms-link">
                Videolu anlatım: Formu izle ${lucideIcon("arrow-up-right", { size: 13 })} (MuscleWiki)
              </a>
            </div>
          </div>
        `;
        elements.modalVideoContainer.querySelectorAll("[data-modal-pos]").forEach((btn) => {
          btn.addEventListener("click", () => {
            activePos = btn.dataset.modalPos;
            renderPhotoModal();
          });
          btn.addEventListener("keydown", (ev) => {
            if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
              ev.preventDefault();
              activePos = activePos === "start" ? "end" : "start";
              renderPhotoModal();
              elements.modalVideoContainer
                .querySelector(`[role="tab"][data-modal-pos="${activePos}"]`)
                ?.focus();
            }
          });
        });
      };
      renderPhotoModal();
    } else {
      elements.modalVideoContainer.innerHTML = `
        <div class="modal-source-card">
          <p>
            Lisans ve kullanım şartları gereği üçüncü taraf egzersiz videoları bu sitede yeniden barındırılmaz.
            Hareketin adım adım videosunu ve kas haritasını doğrudan kaynak sayfasından izleyebilirsin:
          </p>
          <div class="modal-source-actions">
            <a
              href="${escapeHtml(resolvedSourceUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              class="source-link-btn is-modal"
            >
              Formu izle ${lucideIcon("arrow-up-right", { size: 14 })} (MuscleWiki)
            </a>
            <a
              href="${escapeHtml(licenseUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              class="license-terms-link"
            >
              MuscleWiki Kullanım Şartları ${lucideIcon("arrow-up-right", { size: 14 })}
            </a>
          </div>
        </div>
      `;
    }

    elements.modalTipsList.innerHTML = variant.tips
      .map((t) => `<li>${escapeHtml(t)}</li>`)
      .join("");

    // Modal içi varyant çubuğunu güncelle
    if (variants.length > 1) {
      elements.modalVariantsBar.innerHTML = createAlternativesBoxHtml(variants, variant.index);
      elements.modalVariantsBar.hidden = false;
      elements.modalVariantsBar.querySelectorAll(".alt-pill-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          applyModalVariant(Number(btn.dataset.variantIndex));
        });
      });
    } else {
      elements.modalVariantsBar.innerHTML = "";
      elements.modalVariantsBar.hidden = true;
    }
  };

  applyModalVariant(initialVariantIndex);

  if (typeof elements.modal.showModal === "function") {
    if (!elements.modal.open) {
      elements.modal.showModal();
    }
  } else {
    elements.modal.setAttribute("open", "");
  }
  document.body.style.overflow = "hidden";
  // Ekran okuyucu ve klavye gezinmesi icin odaklamayi senkron uygula
  const focusables = getModalFocusableElements();
  if (focusables.length > 0) {
    focusables[0].focus();
  } else if (elements.modalCloseBtn) {
    elements.modalCloseBtn.focus();
  }
}

// Modalı kapatır ve odağı tetikleyen öğeye iade eder
export function closeMediaModal() {
  if (typeof elements.modal.close === "function") {
    if (elements.modal.open) {
      elements.modal.close();
    }
  } else {
    elements.modal.removeAttribute("open");
  }
  elements.modalVideoContainer.innerHTML = "";
  elements.modalVariantsBar.innerHTML = "";
  elements.modalVariantsBar.hidden = true;
  document.body.style.overflow = "";

  const restoreTarget = lastFocusedBeforeModal;
  lastFocusedBeforeModal = null;
  if (
    restoreTarget &&
    document.contains(restoreTarget) &&
    typeof restoreTarget.focus === "function"
  ) {
    restoreTarget.focus();
  }
}

// Aktif sekmeye veya aramaya göre ana içeriği render eder
