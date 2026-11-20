/**
 * Dosya: src/media.js
 * Açıklama: Medya görünürlük gözlemcisi (IntersectionObserver), prefers-reduced-motion / saveData kontrolü,
 * dış form önizleme sahnesi üretimi ve Wake Lock + ses/titreşim destekli dinlenme sayacı yönetimi.
 */

import { getExerciseMedia } from "../data.js";
import { TIMER_STORAGE_KEY, escapeHtml, state } from "./state.js";
import { lucideIcon } from "./render/icons.js";

let mediaVisibilityObserver = null;

// prefers-reduced-motion veya Data Saver aktifken otomatik oynatmayı kapatır
export function shouldDisableAutoplay() {
  const reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData === true);
  return reducedMotion || saveData;
}

// Görünürlük bazlı egzersiz fotoğraf sahnesi gözlemcisini temizler ve yeniden kurar
export function observeVisibleStages() {
  if (mediaVisibilityObserver) {
    mediaVisibilityObserver.disconnect();
    mediaVisibilityObserver = null;
  }

  const photoStages = Array.from(document.querySelectorAll(".is-photo-stage"));
  if (photoStages.length === 0) return;

  if (shouldDisableAutoplay() || typeof IntersectionObserver === "undefined") {
    return;
  }

  const toggleStagePhase = (stage, forceStart = false) => {
    const next = forceStart || stage.dataset.photoPhase === "end" ? "start" : "end";
    stage.dataset.photoPhase = next;
    const badge = stage.querySelector("[data-phase-badge]");
    if (badge) badge.textContent = next === "start" ? "BAŞLANGIÇ" : "BİTİŞ";
  };

  mediaVisibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (!el.classList.contains("is-photo-stage")) return;
        if (entry.isIntersecting) {
          if (!el._photoTimer) {
            el._photoTimer = window.setInterval(() => toggleStagePhase(el), 1600);
            state.photoTimers.push(el._photoTimer);
          }
        } else if (el._photoTimer) {
          window.clearInterval(el._photoTimer);
          el._photoTimer = null;
          toggleStagePhase(el, true);
        }
      });
    },
    { threshold: [0, 0.25, 0.5] }
  );

  photoStages.forEach((stage) => mediaVisibilityObserver.observe(stage));
}

// Günlere özel mobil ikonlar

export function clearPhotoTimers() {
  state.photoTimers.forEach((timerId) => window.clearInterval(timerId));
  state.photoTimers = [];
}

/**
 * Ana hareketi ve alternatiflerini hem kartlar hem de modal için tek bir standart listeye çevirir.
 * kind: "exercise" | "core"
 */

let restTimerInterval = null;
let wakeLockSentinel = null;

export async function acquireScreenWakeLock() {
  try {
    if (
      navigator.wakeLock &&
      typeof navigator.wakeLock.request === "function" &&
      !wakeLockSentinel
    ) {
      wakeLockSentinel = await navigator.wakeLock.request("screen");
      wakeLockSentinel.addEventListener("release", () => {
        wakeLockSentinel = null;
      });
    }
  } catch {
    // Tarayıcı izin vermezse veya desteklemiyorsa sessizce atla
  }
}

export function releaseScreenWakeLock() {
  try {
    if (wakeLockSentinel && typeof wakeLockSentinel.release === "function") {
      wakeLockSentinel.release().catch(() => {});
    }
  } catch {
    // Sessizce atla
  } finally {
    wakeLockSentinel = null;
  }
}

export function notifyRestTimerComplete() {
  try {
    if (navigator.vibrate && typeof navigator.vibrate === "function") {
      navigator.vibrate([180, 90, 180]);
    }
  } catch {
    // Titreşim desteklenmiyorsa atla
  }

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    }
  } catch {
    // Ses engellendiyse veya yoksa sessizce atla
  }
}

export function formatTimerClock(seconds) {
  const safeSec = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(safeSec / 60);
  const secs = safeSec % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function stopRestTimer({ clearStorage = true } = {}) {
  if (restTimerInterval) {
    window.clearInterval(restTimerInterval);
    restTimerInterval = null;
  }
  releaseScreenWakeLock();
  if (clearStorage) {
    try {
      window.localStorage.removeItem(TIMER_STORAGE_KEY);
    } catch {
      // Yoksay
    }
  }
  const bar = document.getElementById("rest-timer-bar");
  if (bar) {
    bar.hidden = true;
    bar.classList.remove("is-finished");
  }
}

export function startRestTimer(
  durationSeconds,
  label = "Set Arası Dinlenme",
  existingEndAt = null
) {
  const bar = document.getElementById("rest-timer-bar");
  const clockEl = document.getElementById("rest-timer-clock");
  const labelEl = document.getElementById("rest-timer-label");
  if (!bar || !clockEl || !labelEl) return;

  if (restTimerInterval) {
    window.clearInterval(restTimerInterval);
    restTimerInterval = null;
  }

  const endAt = existingEndAt || Date.now() + durationSeconds * 1000;
  try {
    window.localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({ endAt, label }));
  } catch {
    // Yoksay
  }

  bar.hidden = false;
  bar.classList.remove("is-finished");
  labelEl.textContent = label;
  acquireScreenWakeLock();

  const updateTick = () => {
    const remainingSec = (endAt - Date.now()) / 1000;
    if (remainingSec <= 0) {
      clockEl.textContent = "00:00";
      labelEl.textContent = `${label} · Süre doldu, ağır sete hazır!`;
      bar.classList.add("is-finished");
      window.clearInterval(restTimerInterval);
      restTimerInterval = null;
      releaseScreenWakeLock();
      notifyRestTimerComplete();
      try {
        window.localStorage.removeItem(TIMER_STORAGE_KEY);
      } catch {
        // Yoksay
      }
      return;
    }
    clockEl.textContent = formatTimerClock(remainingSec);
  };

  updateTick();
  restTimerInterval = window.setInterval(updateTick, 500);
}

export function initRestTimerControls() {
  const stopBtn = document.getElementById("rest-timer-stop-btn");
  const plusBtn = document.getElementById("rest-timer-plus-btn");

  if (stopBtn) {
    stopBtn.addEventListener("click", () => stopRestTimer({ clearStorage: true }));
  }

  if (plusBtn) {
    plusBtn.addEventListener("click", () => {
      try {
        const raw = window.localStorage.getItem(TIMER_STORAGE_KEY);
        if (!raw) {
          startRestTimer(15, "Ek Dinlenme");
          return;
        }
        const saved = JSON.parse(raw);
        const nextEndAt = Math.max(Date.now(), Number(saved.endAt || Date.now())) + 15000;
        startRestTimer(15, saved.label || "Set Arası Dinlenme", nextEndAt);
      } catch {
        startRestTimer(15, "Ek Dinlenme");
      }
    });
  }

  // Yarım kalan sayaç varsa yenilemede devam ettir
  try {
    const raw = window.localStorage.getItem(TIMER_STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && Number(saved.endAt) > Date.now()) {
        startRestTimer(
          Math.ceil((Number(saved.endAt) - Date.now()) / 1000),
          saved.label || "Set Arası Dinlenme",
          Number(saved.endAt)
        );
      } else {
        window.localStorage.removeItem(TIMER_STORAGE_KEY);
      }
    }
  } catch {
    // Yoksay
  }
}

// localStorage'dan kayıtlı profili yükler

export function createMediaStageHtml({
  badgeText,
  name,
  primaryTag,
  secondaryTag,
  tips = [],
  sourceUrl,
  videoKey,
  triggerAttr,
}) {
  const media = getExerciseMedia({ videoKey, sourceUrl });

  if (media.startImg && media.endImg) {
    return `
      <div class="media-stage is-photo-stage" data-photo-phase="start">
        <div class="photo-stage-frame">
          <img
            class="stage-photo stage-photo-start"
            src="${escapeHtml(media.startImgSmall)}"
            srcset="${escapeHtml(media.startImgSmall)} 480w, ${escapeHtml(media.startImg)} 960w"
            sizes="(max-width: 768px) 100vw, 440px"
            alt="${escapeHtml(name)} başlangıç pozisyonu"
            loading="lazy"
            decoding="async"
          />
          <img
            class="stage-photo stage-photo-end"
            src="${escapeHtml(media.endImgSmall)}"
            srcset="${escapeHtml(media.endImgSmall)} 480w, ${escapeHtml(media.endImg)} 960w"
            sizes="(max-width: 768px) 100vw, 440px"
            alt="${escapeHtml(name)} bitiş pozisyonu"
            loading="lazy"
            decoding="async"
          />
          <div class="photo-stage-vignette" aria-hidden="true"></div>
          <span class="order-badge">${escapeHtml(badgeText)}</span>
          <span class="photo-phase-badge" data-phase-badge>BAŞLANGIÇ</span>
        </div>
        <div class="media-controls-bar">
          <button
            type="button"
            class="video-trigger-btn"
            ${triggerAttr}
          >
            ${lucideIcon("maximize-2", { size: 14 })} Detay
          </button>
          <a
            href="${escapeHtml(media.sourceUrl || "https://musclewiki.com/")}"
            target="_blank"
            rel="noopener noreferrer"
            class="source-link-btn"
          >
            Formu izle ${lucideIcon("arrow-up-right", { size: 14 })}
          </a>
        </div>
      </div>
    `;
  }

  const resolvedUrl = media.sourceUrl || "https://musclewiki.com/";
  const cueText = tips[0] || "Kontrollü tempo ve tam hareket açıklığıyla uygula.";
  const metaSummary = [primaryTag, secondaryTag].filter(Boolean).join(" · ");

  return `
    <div class="media-stage is-reference-stage" data-media-mode="reference">
      <div class="media-overlay-top">
        <span class="order-badge">${escapeHtml(badgeText)}</span>
        <span class="pose-indicator">MuscleWiki · Dış Kaynak</span>
      </div>

      <div class="reference-preview-body">
        <div class="reference-stage-emblem" aria-hidden="true">
          ${lucideIcon("dumbbell", { size: 36, className: "icon-hero" })}
        </div>
        <div class="reference-preview-copy">
          <div class="reference-preview-meta">${escapeHtml(metaSummary)}</div>
          <p class="reference-preview-cue">${escapeHtml(cueText)}</p>
        </div>
      </div>

      <div class="media-controls-bar">
        <a
          href="${escapeHtml(resolvedUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          class="source-link-btn"
        >
          Formu izle ${lucideIcon("arrow-up-right", { size: 14 })}
        </a>

        <button
          type="button"
          class="video-trigger-btn"
          ${triggerAttr}
        >
          <span>İpuçları &amp; Alt.</span>
        </button>
      </div>
    </div>
  `;
}

// Kart ve modal içinde ortak kullanılan "Alternatif Hareketler" seçici kutusunu üretir
