/**
 * Dosya: src/modal.js
 * Açıklama: Egzersiz formu ve alternatif seçici detay modalını, klavye odak tuzağını (focus trap)
 * ve kapanışta tetikleyiciye odak iadesini yönetir.
 */

import { MUSCLEWIKI_LICENSE_URL, getExerciseMedia } from "../data.js";
import { elements, escapeHtml } from "./state.js";
import { shouldDisableAutoplay } from "./media.js";
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

  let activeVariantIndex = initialVariantIndex;
  let currentCamera = "front";
  let currentSpeed = 1;

  const cameraBtns = elements.modalPlaybackBar.querySelectorAll(".camera-btn");
  const speedBtns = elements.modalPlaybackBar.querySelectorAll(".speed-btn");

  // Harici kaynak veya lisanslı medya aksiyon linkini günceller
  const updateExternalLink = (media) => {
    const resolvedUrl = media.sourceUrl || "https://musclewiki.com/";
    elements.modalExternalActions.innerHTML = `
      <a
        href="${escapeHtml(resolvedUrl)}"
        target="_blank"
        rel="noopener noreferrer"
        class="source-link-btn"
      >
        Formu izle ${lucideIcon("arrow-up-right", { size: 14 })}
      </a>
    `;
  };

  // Seçilen varyanta göre modal başlığını, referans kartını ve ipuçlarını yeniler
  const applyModalVariant = (variantIdx) => {
    activeVariantIndex = variantIdx;
    const variant = variants[variantIdx] || variants[0];
    const media = getExerciseMedia(variant);
    const resolvedSourceUrl = media.sourceUrl || "https://musclewiki.com/";
    const licenseUrl = media.licenseUrl || MUSCLEWIKI_LICENSE_URL;

    elements.modalBadge.textContent = variant.modalBadge;
    elements.modalTitle.textContent = variant.name;
    elements.modalSubtitle.textContent = variant.turkishName;

    if (media.frontMp4) {
      const disableAutoplay = shouldDisableAutoplay();
      elements.modalVideoContainer.innerHTML = `
        <video
          id="modal-video-player"
          controls
          ${disableAutoplay ? "" : "autoplay"}
          loop
          muted
          playsinline
        ></video>
      `;
      const player = document.getElementById("modal-video-player");
      player.src = currentCamera === "front" ? media.frontMp4 : media.sideMp4 || media.frontMp4;
      player.poster = (currentCamera === "front" ? media.frontImg : media.sideImg) || "";
      player.load();
      player.playbackRate = currentSpeed;
      if (!disableAutoplay) {
        player.play().catch(() => {});
      }
      updateExternalLink(media);
      elements.modalPlaybackBar.hidden = false;
    } else {
      elements.modalPlaybackBar.hidden = true;
      elements.modalExternalActions.innerHTML = "";
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

    if (media.frontImg && media.sideImg) {
      elements.modalFramesSection.hidden = false;
      elements.modalImgFront.src = media.frontImg;
      elements.modalImgFront.alt = `${variant.name} ön açı karesi`;
      elements.modalImgSide.src = media.sideImg;
      elements.modalImgSide.alt = `${variant.name} yan açı karesi`;
    } else {
      elements.modalFramesSection.hidden = true;
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

  cameraBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.camera === "front");
    btn.onclick = () => {
      currentCamera = btn.dataset.camera;
      cameraBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const variant = variants[activeVariantIndex] || variants[0];
      const media = getExerciseMedia(variant);
      const player = document.getElementById("modal-video-player");
      if (player && media.frontMp4) {
        player.src = currentCamera === "front" ? media.frontMp4 : media.sideMp4 || media.frontMp4;
        player.poster = (currentCamera === "front" ? media.frontImg : media.sideImg) || "";
        player.load();
        player.playbackRate = currentSpeed;
        player.play().catch(() => {});
      }
    };
  });

  speedBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.speed === "1");
    btn.onclick = () => {
      currentSpeed = parseFloat(btn.dataset.speed);
      const player = document.getElementById("modal-video-player");
      if (player) {
        player.playbackRate = currentSpeed;
      }
      speedBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    };
  });

  applyModalVariant(activeVariantIndex);

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

// Modalı kapatır, video oynatımını durdurur ve odağı tetikleyen öğeye iade eder
export function closeMediaModal() {
  const player = document.getElementById("modal-video-player");
  if (player) {
    player.pause();
  }
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
