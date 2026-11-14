/**
 * Dosya: app.js
 * Açıklama: Kravitz Lean & Fit uygulamasının arayüz oluşturma, sekme yönetimi,
 * egzersiz arama, reklamsız yerel MP4 video sahneleri, fotoğraf geçişleri ve hız kontrollü video modalını yürütür.
 */

import {
  CORE_LIBRARY,
  NUTRITION_PROTOCOL,
  SYSTEM_PILLARS,
  TANITA_PROFILE,
  WORKOUT_DAYS,
  getExerciseMedia,
} from "./data.js";

// Uygulama durumu
const state = {
  activeTab: "day-1",
  searchQuery: "",
};

// Sekme tanımları
const TABS = [
  ...WORKOUT_DAYS.map((day) => ({
    id: day.id,
    top: day.tabLabel,
    sub: day.shortTitle,
  })),
  {
    id: "core-guide",
    top: "Aktif Dinlenme",
    sub: "21'ler Core & Vakum",
  },
  {
    id: "nutrition",
    top: "Protokol",
    sub: "Beslenme & Göbek Eritme",
  },
];

// DOM referansları
const elements = {
  pillarsGrid: document.getElementById("pillars-grid"),
  tanitaToggleBtn: document.getElementById("toggle-tanita-btn"),
  tanitaDrawer: document.getElementById("tanita-drawer"),
  tanitaMeta: document.getElementById("tanita-meta"),
  tanitaGrid: document.getElementById("tanita-grid"),
  tabsNav: document.getElementById("tabs-nav"),
  searchInput: document.getElementById("exercise-search"),
  clearSearchBtn: document.getElementById("clear-search-btn"),
  contentArea: document.getElementById("content-area"),
  modal: document.getElementById("media-modal"),
  modalCloseBtn: document.getElementById("modal-close-btn"),
  modalBadge: document.getElementById("modal-badge"),
  modalTitle: document.getElementById("modal-title"),
  modalSubtitle: document.getElementById("modal-subtitle"),
  modalVideoContainer: document.getElementById("modal-video-container"),
  modalPlaybackBar: document.getElementById("modal-playback-bar"),
  modalFramesSection: document.getElementById("modal-frames-section"),
  modalImgStart: document.getElementById("modal-img-start"),
  modalImgEnd: document.getElementById("modal-img-end"),
  modalTipsList: document.getElementById("modal-tips-list"),
  modalExternalActions: document.getElementById("modal-external-actions"),
};

// HTML özel karakterlerini güvenli metne dönüştürür
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Sistem temel kurallarını (3 sütun) render eder
function renderSystemPillars() {
  elements.pillarsGrid.innerHTML = SYSTEM_PILLARS.map(
    (pillar) => `
      <article class="pillar-card">
        <span class="pillar-badge">${escapeHtml(pillar.badge)}</span>
        <h3>${escapeHtml(pillar.title)}</h3>
        <p>${escapeHtml(pillar.description)}</p>
      </article>
    `
  ).join("");
}

// Tanita ölçüm röntgenini render eder
function renderTanitaSection() {
  elements.tanitaMeta.textContent = `Son Ölçüm: ${TANITA_PROFILE.date} · Yaş: ${TANITA_PROFILE.age} · Hedef: ${TANITA_PROFILE.targetStyle}`;
  elements.tanitaGrid.innerHTML = TANITA_PROFILE.metrics
    .map(
      (item) => `
      <article class="tanita-card ${item.highlight ? "highlight" : ""}">
        <div class="tanita-label">${escapeHtml(item.label)}</div>
        <div class="tanita-values">
          <span class="tanita-current">${escapeHtml(item.current)}</span>
          <span class="tanita-target">→ ${escapeHtml(item.target)}</span>
        </div>
        <p class="tanita-note">${escapeHtml(item.note)}</p>
      </article>
    `
    )
    .join("");
}

// Sekme butonlarını oluşturur
function renderTabs() {
  elements.tabsNav.innerHTML = TABS.map(
    (tab) => `
      <button
        type="button"
        role="tab"
        class="tab-btn ${state.activeTab === tab.id && !state.searchQuery ? "active" : ""}"
        data-tab="${escapeHtml(tab.id)}"
        aria-selected="${state.activeTab === tab.id && !state.searchQuery}"
      >
        <span class="tab-btn-top">${escapeHtml(tab.top)}</span>
        <span class="tab-btn-sub">${escapeHtml(tab.sub)}</span>
      </button>
    `
  ).join("");

  elements.tabsNav.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.activeTab = btn.dataset.tab;
      if (state.searchQuery) {
        state.searchQuery = "";
        elements.searchInput.value = "";
        elements.clearSearchBtn.hidden = true;
      }
      renderTabs();
      renderMainContent();
    });
  });
}

// Medya sahnesi HTML'ini (yerel MP4 video + başlangıç/bitiş fotoğrafları) üretir
function createMediaStageHtml({ badgeText, name, videoKey, imageId, triggerAttr }) {
  const media = getExerciseMedia(videoKey, imageId);

  return `
    <div class="media-stage" data-media-mode="video">
      <video
        class="media-video"
        src="${escapeHtml(media.mp4)}"
        poster="${escapeHtml(media.gif || media.start || "")}"
        autoplay
        loop
        muted
        playsinline
        preload="metadata"
        aria-label="${escapeHtml(name)} hareket videosu"
      ></video>

      ${
        media.start
          ? `<img
              class="media-frame frame-start is-hidden"
              src="${escapeHtml(media.start)}"
              alt="${escapeHtml(name)} başlangıç pozisyonu"
              loading="lazy"
            />`
          : ""
      }
      ${
        media.end
          ? `<img
              class="media-frame frame-end is-hidden"
              src="${escapeHtml(media.end)}"
              alt="${escapeHtml(name)} bitiş pozisyonu"
              loading="lazy"
            />`
          : ""
      }

      <div class="media-overlay-top">
        <span class="order-badge">${escapeHtml(badgeText)}</span>
        <span class="pose-indicator">Canlı Video</span>
      </div>

      <div class="media-controls-bar">
        <div class="pose-toggle-group" role="group" aria-label="Görünüm seçici">
          <button type="button" class="pose-btn active" data-pose="video">Canlı Video</button>
          <button type="button" class="pose-btn" data-pose="start">1. Başlangıç</button>
          <button type="button" class="pose-btn" data-pose="end">2. Bitiş</button>
        </div>

        <button
          type="button"
          class="video-trigger-btn"
          ${triggerAttr}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>Detaylı Video</span>
        </button>
      </div>
    </div>
  `;
}

// Tekil egzersiz kartı HTML'ini üretir
function createExerciseCardHtml(exercise, badgeText) {
  const coreItem = CORE_LIBRARY[exercise.coreRestId];
  const coreMedia = coreItem ? getExerciseMedia(coreItem.videoKey, coreItem.imageId) : null;
  const maxSets = exercise.pyramidSets.length;

  const pyramidHtml = exercise.pyramidSets
    .map((step, index) => {
      const widthPercent = Math.max(36, Math.round(100 - (index * 52) / Math.max(1, maxSets - 1)));
      return `
        <div class="pyramid-step">
          <span class="set-num">${step.set}. Set</span>
          <div class="set-bar-wrap">
            <span class="set-load">${escapeHtml(step.load)}</span>
            <div class="set-bar" style="width: ${widthPercent}%"></div>
          </div>
          <span class="set-reps">${escapeHtml(step.reps)}</span>
        </div>
      `;
    })
    .join("");

  const tipsHtml = exercise.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("");

  const stageHtml = createMediaStageHtml({
    badgeText,
    name: exercise.name,
    videoKey: exercise.videoKey,
    imageId: exercise.imageId,
    triggerAttr: `data-open-exercise="${escapeHtml(exercise.id)}"`,
  });

  return `
    <article class="exercise-card" data-exercise-id="${escapeHtml(exercise.id)}">
      ${stageHtml}

      <div class="card-body">
        <div class="exercise-header">
          <div class="exercise-tags">
            <span class="tag-chip">${escapeHtml(exercise.muscleGroup)}</span>
            <span class="tag-chip equipment">${escapeHtml(exercise.equipment)}</span>
          </div>
          <h3 class="exercise-title">${escapeHtml(exercise.name)}</h3>
          <p class="exercise-subtitle">${escapeHtml(exercise.turkishName)}</p>
        </div>

        <div class="pyramid-box">
          <div class="pyramid-box-title">Piramit Merdiveni (${maxSets} Set)</div>
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
            ${
              coreMedia && (coreMedia.gif || coreMedia.start)
                ? `<img class="core-thumb" src="${escapeHtml(coreMedia.gif || coreMedia.start)}" alt="${escapeHtml(coreItem.name)}" loading="lazy" />`
                : ""
            }
            <div class="core-rest-copy">
              <span class="core-rest-kicker">Set Arası Aktif Dinlenme</span>
              <span class="core-rest-text">${escapeHtml(exercise.coreRestLabel)}</span>
            </div>
            <span class="core-rest-action">Video &amp; Form →</span>
          </button>
        `
            : ""
        }
      </div>
    </article>
  `;
}

// Core kartı HTML'ini üretir
function createCoreCardHtml(core) {
  const isVacuum = core.id === "stomach_vacuum";
  const stageHtml = createMediaStageHtml({
    badgeText: isVacuum ? "SABAH RUTİNİ" : "21× AKTİF DİNLENME",
    name: core.name,
    videoKey: core.videoKey,
    imageId: core.imageId,
    triggerAttr: `data-open-core="${escapeHtml(core.id)}"`,
  });

  return `
    <article class="core-card">
      ${stageHtml}
      <div class="card-body">
        <div class="exercise-header">
          <div class="exercise-tags">
            <span class="tag-chip">${escapeHtml(core.target)}</span>
            <span class="tag-chip equipment">${escapeHtml(core.reps)}</span>
          </div>
          <h3 class="exercise-title">${escapeHtml(core.name)}</h3>
          <p class="exercise-subtitle">${escapeHtml(core.turkishName)}</p>
        </div>

        <ul class="tips-list">
          <li>${escapeHtml(core.formCue)}</li>
          <li><strong>MACFit İpucu:</strong> ${escapeHtml(core.macfitTip)}</li>
        </ul>
      </div>
    </article>
  `;
}

// Antrenman günü görünümünü render eder
function renderWorkoutDay(day) {
  const cardsHtml = day.exercises
    .map((exercise) => createExerciseCardHtml(exercise, `${day.tabLabel} · Hareket ${exercise.order}`))
    .join("");

  elements.contentArea.innerHTML = `
    <div class="day-banner">
      <div>
        <h2>${escapeHtml(day.fullTitle)}</h2>
        <p>${escapeHtml(day.targetGoal)}</p>
      </div>
      <div class="day-meta-badges">
        <span class="meta-pill">⏱ ${escapeHtml(day.duration)}</span>
        <span class="meta-pill">📅 ${escapeHtml(day.scheduleNote)}</span>
      </div>
    </div>
    <div class="exercises-grid">${cardsHtml}</div>
  `;

  bindCardInteractions();
}

// Core (21'ler) ve Mide Vakumu rehber sekmesini render eder
function renderCoreGuide(filteredItems = null) {
  const coreEntries = filteredItems || Object.values(CORE_LIBRARY);
  const cardsHtml = coreEntries.map((core) => createCoreCardHtml(core)).join("");

  elements.contentArea.innerHTML = `
    <div class="day-banner">
      <div>
        <h2>21’ler Aktif Core Dinlenmesi &amp; Sabah Mide Vakumu Rehberi</h2>
        <p>
          Piramit setleri arasında oturmak yerine bu karın hareketlerinden birini 21 tekrar yap.
          Ayrıca her sabah aç karnına 5×20 sn Mide Vakumu ile iç karın korseni sıkılaştır.
        </p>
      </div>
      <div class="day-meta-badges">
        <span class="meta-pill">🎯 Hedef: 10,6 kg Gövde Yağını Eritme</span>
      </div>
    </div>
    <div class="core-grid">${cardsHtml}</div>
  `;

  bindCardInteractions();
}

// Beslenme ve göbek eritme protokolü sekmesini render eder
function renderNutritionProtocol() {
  const { summary, fastingWindows, morningFastRules, dailyMeals, waistRules } = NUTRITION_PROTOCOL;

  elements.contentArea.innerHTML = `
    <div class="nutrition-layout">
      <div class="day-banner">
        <div>
          <h2>Göbek Yağını (%23,1 → %11) Eriten Kravitz Beslenme Protokolü</h2>
          <p>
            BMR değerin 1970 kcal olduğu için aç kalmadan, günde 170-180 g proteinle 62,9 kg kas
            kütleni koruyarak net yağ yakımı sağlarsın.
          </p>
        </div>
        <div class="day-meta-badges">
          <span class="meta-pill">💧 Hedef Su Oranı: %55,8 → %60+</span>
        </div>
      </div>

      <div class="macro-grid">
        <article class="macro-card">
          <div class="macro-label">Günlük Kalori Hedefi</div>
          <div class="macro-val">${escapeHtml(summary.calories)}</div>
        </article>
        <article class="macro-card">
          <div class="macro-label">Günlük Protein</div>
          <div class="macro-val">${escapeHtml(summary.protein)}</div>
        </article>
        <article class="macro-card">
          <div class="macro-label">Temiz Karbonhidrat</div>
          <div class="macro-val">${escapeHtml(summary.carbs)}</div>
        </article>
        <article class="macro-card">
          <div class="macro-label">Sağlıklı Yağlar</div>
          <div class="macro-val">${escapeHtml(summary.fats)}</div>
        </article>
        <article class="macro-card">
          <div class="macro-label">Sıvı Tüketimi</div>
          <div class="macro-val">${escapeHtml(summary.water)}</div>
        </article>
      </div>

      <div class="two-col-grid">
        <article class="info-panel">
          <h3>⏱️ Lenny Kravitz Aralıklı Oruç Saatleri</h3>
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
        </article>

        <article class="info-panel">
          <h3>☕ Sabah Açlık Penceresi Kuralları</h3>
          <ul>
            ${morningFastRules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}
          </ul>
        </article>
      </div>

      <div class="three-col-grid">
        ${dailyMeals
          .map(
            (meal) => `
          <article class="info-panel">
            <span class="meal-time-badge">${escapeHtml(meal.time)}</span>
            <h3>${escapeHtml(meal.title)}</h3>
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
            <h3>📌 ${escapeHtml(rule.title)}</h3>
            <p class="muted-text">${escapeHtml(rule.text)}</p>
          </article>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

// Arama kutusuna göre tüm programdaki eşleşen hareketleri gösterir
function renderSearchResults(query) {
  const normalized = query.trim().toLowerCase();
  const matchedExercises = [];

  WORKOUT_DAYS.forEach((day) => {
    day.exercises.forEach((ex) => {
      const searchable = [
        ex.name,
        ex.turkishName,
        ex.muscleGroup,
        ex.equipment,
        ex.coreRestLabel,
      ]
        .join(" ")
        .toLowerCase();

      if (searchable.includes(normalized)) {
        matchedExercises.push({ dayLabel: day.tabLabel, exercise: ex });
      }
    });
  });

  const matchedCore = Object.values(CORE_LIBRARY).filter((core) => {
    const searchable = [core.name, core.turkishName, core.target].join(" ").toLowerCase();
    return searchable.includes(normalized);
  });

  if (matchedExercises.length === 0 && matchedCore.length === 0) {
    elements.contentArea.innerHTML = `
      <div class="empty-state">
        <h3>"${escapeHtml(query)}" için hareket bulunamadı</h3>
        <p>Örnek aramalar: Biceps, Omuz, Sırt, Bacak, Karın, Plank, Squat</p>
      </div>
    `;
    return;
  }

  const exercisesHtml = matchedExercises
    .map(({ dayLabel, exercise }) =>
      createExerciseCardHtml(exercise, `${dayLabel} · Hareket ${exercise.order}`)
    )
    .join("");

  const coreSectionHtml =
    matchedCore.length > 0
      ? `
      <div style="margin-top: 26px;">
        <h3 style="font-family: Oswald, sans-serif; margin-bottom: 14px;">Eşleşen Core (21'ler) Hareketleri</h3>
        <div class="core-grid">
          ${matchedCore.map((core) => createCoreCardHtml(core)).join("")}
        </div>
      </div>
    `
      : "";

  elements.contentArea.innerHTML = `
    <div class="day-banner">
      <div>
        <h2>Arama Sonuçları: "${escapeHtml(query)}"</h2>
        <p>${matchedExercises.length} ana hareket ve ${matchedCore.length} core hareketi bulundu.</p>
      </div>
    </div>
    ${exercisesHtml ? `<div class="exercises-grid">${exercisesHtml}</div>` : ""}
    ${coreSectionHtml}
  `;

  bindCardInteractions();
}

// Kartlardaki Canlı Video / Başlangıç / Bitiş geçişlerini ve modal butonlarını bağlar
function bindCardInteractions() {
  document.querySelectorAll(".media-stage").forEach((stage) => {
    const videoEl = stage.querySelector(".media-video");
    const startImg = stage.querySelector(".frame-start");
    const endImg = stage.querySelector(".frame-end");
    const indicator = stage.querySelector(".pose-indicator");
    const poseButtons = stage.querySelectorAll(".pose-btn");

    // Seçilen moda göre video ve fotoğraf görünürlüğünü değiştirir
    const applyMode = (mode) => {
      if (mode === "video") {
        stage.classList.remove("is-photo-mode");
        if (videoEl) {
          videoEl.classList.remove("is-hidden");
          videoEl.play().catch(() => {});
        }
        if (startImg) startImg.classList.add("is-hidden");
        if (endImg) endImg.classList.add("is-hidden");
        indicator.textContent = "Canlı Video";
      } else if (mode === "start") {
        stage.classList.add("is-photo-mode");
        if (videoEl) {
          videoEl.classList.add("is-hidden");
          videoEl.pause();
        }
        if (startImg) startImg.classList.remove("is-hidden");
        if (endImg) endImg.classList.add("is-hidden");
        indicator.textContent = "1. Başlangıç";
      } else {
        stage.classList.add("is-photo-mode");
        if (videoEl) {
          videoEl.classList.add("is-hidden");
          videoEl.pause();
        }
        if (startImg) startImg.classList.add("is-hidden");
        if (endImg) endImg.classList.remove("is-hidden");
        indicator.textContent = "2. Bitiş / Kasılma";
      }
    };

    poseButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        poseButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        applyMode(btn.dataset.pose);
      });
    });
  });

  // Ana egzersiz detaylı video modalı butonları
  document.querySelectorAll("[data-open-exercise]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const exercise = findExerciseById(btn.dataset.openExercise);
      if (!exercise) return;
      openMediaModal({
        badge: `${exercise.muscleGroup} · ${exercise.equipment}`,
        title: exercise.name,
        subtitle: exercise.turkishName,
        videoKey: exercise.videoKey,
        imageId: exercise.imageId,
        tips: exercise.tips,
      });
    });
  });

  // Core / Aktif dinlenme detaylı video modalı butonları
  document.querySelectorAll("[data-open-core]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const core = CORE_LIBRARY[btn.dataset.openCore];
      if (!core) return;
      openMediaModal({
        badge: `Aktif Dinlenme Core · ${core.reps}`,
        title: core.name,
        subtitle: core.turkishName,
        videoKey: core.videoKey,
        imageId: core.imageId,
        tips: [core.formCue, `MACFit İpucu: ${core.macfitTip}`],
      });
    });
  });
}

// ID üzerinden egzersiz kaydını bulur
function findExerciseById(exerciseId) {
  for (const day of WORKOUT_DAYS) {
    const found = day.exercises.find((ex) => ex.id === exerciseId);
    if (found) return found;
  }
  return null;
}

// Reklamsız yerel HTML5 MP4 Video & Form Görselleri modalını açar
function openMediaModal({ badge, title, subtitle, videoKey, imageId, tips }) {
  const media = getExerciseMedia(videoKey, imageId);

  elements.modalBadge.textContent = badge;
  elements.modalTitle.textContent = title;
  elements.modalSubtitle.textContent = subtitle;

  // Yerel HTML5 video oynatıcı
  if (media.mp4) {
    elements.modalVideoContainer.innerHTML = `
      <video
        id="modal-video-player"
        src="${escapeHtml(media.mp4)}"
        poster="${escapeHtml(media.gif || media.start || "")}"
        controls
        autoplay
        loop
        muted
        playsinline
      ></video>
    `;

    // Hız kontrol butonlarını sıfırla ve bağla
    const speedBtns = elements.modalPlaybackBar.querySelectorAll(".speed-btn");
    const player = document.getElementById("modal-video-player");

    speedBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.speed === "1");
      btn.onclick = () => {
        const rate = parseFloat(btn.dataset.speed);
        if (player) {
          player.playbackRate = rate;
        }
        speedBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      };
    });

    elements.modalExternalActions.innerHTML = `
      <a
        href="${escapeHtml(media.mp4)}"
        download="${escapeHtml(videoKey)}.mp4"
        class="download-mp4-link"
      >
        MP4 İndir ↓
      </a>
    `;
    elements.modalPlaybackBar.hidden = false;
  } else {
    elements.modalVideoContainer.innerHTML = "";
    elements.modalPlaybackBar.hidden = true;
    elements.modalExternalActions.innerHTML = "";
  }

  // Başlangıç ve Bitiş kareleri
  if (media.start && media.end) {
    elements.modalFramesSection.hidden = false;
    elements.modalImgStart.src = media.start;
    elements.modalImgEnd.src = media.end;
  } else {
    elements.modalFramesSection.hidden = true;
  }

  // İpuçları
  elements.modalTipsList.innerHTML = tips.map((t) => `<li>${escapeHtml(t)}</li>`).join("");

  elements.modal.hidden = false;
  document.body.style.overflow = "hidden";
}

// Modalı kapatır ve video oynatımını durdurur
function closeMediaModal() {
  const player = document.getElementById("modal-video-player");
  if (player) {
    player.pause();
  }
  elements.modal.hidden = true;
  elements.modalVideoContainer.innerHTML = "";
  document.body.style.overflow = "";
}

// Aktif sekmeye veya aramaya göre ana içeriği render eder
function renderMainContent() {
  if (state.searchQuery.trim().length > 0) {
    renderSearchResults(state.searchQuery);
    return;
  }

  if (state.activeTab === "core-guide") {
    renderCoreGuide();
    return;
  }

  if (state.activeTab === "nutrition") {
    renderNutritionProtocol();
    return;
  }

  const selectedDay = WORKOUT_DAYS.find((d) => d.id === state.activeTab) || WORKOUT_DAYS[0];
  renderWorkoutDay(selectedDay);
}

// Olay dinleyicilerini başlatır
function initEventListeners() {
  // Tanita çekmecesi aç/kapa
  elements.tanitaToggleBtn.addEventListener("click", () => {
    const isExpanded = elements.tanitaToggleBtn.getAttribute("aria-expanded") === "true";
    elements.tanitaToggleBtn.setAttribute("aria-expanded", String(!isExpanded));
    elements.tanitaDrawer.hidden = isExpanded;
  });

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

  // Modal kapatma
  elements.modalCloseBtn.addEventListener("click", closeMediaModal);
  elements.modal.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      closeMediaModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.modal.hidden) {
      closeMediaModal();
    }
  });
}

// Uygulama başlangıcı
function bootstrap() {
  renderSystemPillars();
  renderTanitaSection();
  renderTabs();
  renderMainContent();
  initEventListeners();
}

bootstrap();
