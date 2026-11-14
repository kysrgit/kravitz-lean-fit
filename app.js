/**
 * Dosya: app.js
 * Açıklama: Kravitz Lean & Fit uygulamasının mobil öncelikli (Mobile-First) arayüz oluşturma,
 * üst + alt başparmak (thumb-zone) sekme yönetimi, gün içi ve tam sayfa yazılı/tablolu program özeti,
 * ana + alternatif hareket arama, kart ve modal içi etkileşimli Alternatif Hareketler seçicisi,
 * dış kaynak MuscleWiki form referans bağlantıları ("Formu izle ↗") ve detay modalını yürütür.
 */

import {
  CORE_LIBRARY,
  MUSCLEWIKI_LICENSE_URL,
  DEFAULT_PROFILE,
  NUTRITION_PROTOCOL,
  SYSTEM_PILLARS,
  WORKOUT_DAYS,
  calculateProfileTargets,
  getExerciseMedia,
} from "./data.js";

const PROFILE_STORAGE_KEY = "klf:v1:profile";

// Uygulama durumu
const state = {
  activeTab: "day-1",
  viewMode: "both", // "both" | "table-only" | "cards-only"
  searchQuery: "",
  photoTimers: [],
};

// Günlere özel mobil ikonlar
const DAY_MOBILE_ICONS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];

// Sekme tanımları (masaüstü üst bar + mobil thumb-zone alt navigasyon barı)
const TABS = [
  ...WORKOUT_DAYS.map((day, idx) => ({
    id: day.id,
    top: day.tabLabel,
    sub: day.shortTitle,
    mobileIcon: DAY_MOBILE_ICONS[idx] || "•",
    mobileLabel: day.tabLabel,
  })),
  {
    id: "core-guide",
    top: "Aktif Dinlenme",
    sub: "21'ler Core & Vakum",
    mobileIcon: "🔥",
    mobileLabel: "21'ler",
  },
  {
    id: "nutrition",
    top: "Protokol",
    sub: "Beslenme & Enerji Açığı",
    mobileIcon: "🥗",
    mobileLabel: "Besin",
  },
  {
    id: "summary",
    top: "📋 Hızlı Bakış",
    sub: "Yazılı & Tablo Özet",
    mobileIcon: "📋",
    mobileLabel: "Özet",
  },
];

// DOM referansları
const elements = {
  pillarsGrid: document.getElementById("pillars-grid"),
  openSummaryBtn: document.getElementById("open-summary-btn"),
  tanitaToggleBtn: document.getElementById("toggle-tanita-btn"),
  tanitaDrawer: document.getElementById("tanita-drawer"),
  tanitaMeta: document.getElementById("tanita-meta"),
  tanitaGrid: document.getElementById("tanita-grid"),
  profileTargetChip: document.getElementById("profile-target-chip"),
  profileForm: document.getElementById("profile-form"),
  resetProfileBtn: document.getElementById("reset-profile-btn"),
  profileSaveStatus: document.getElementById("profile-save-status"),
  tabsNav: document.getElementById("tabs-nav"),
  mobileBottomNav: document.getElementById("mobile-bottom-nav"),
  searchInput: document.getElementById("exercise-search"),
  clearSearchBtn: document.getElementById("clear-search-btn"),
  contentArea: document.getElementById("content-area"),
  modal: document.getElementById("media-modal"),
  modalCloseBtn: document.getElementById("modal-close-btn"),
  modalBadge: document.getElementById("modal-badge"),
  modalTitle: document.getElementById("modal-title"),
  modalSubtitle: document.getElementById("modal-subtitle"),
  modalVariantsBar: document.getElementById("modal-variants-bar"),
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
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Aktif fotoğraf döngü zamanlayıcılarını temizler
function clearPhotoTimers() {
  state.photoTimers.forEach((timerId) => window.clearInterval(timerId));
  state.photoTimers = [];
}

/**
 * Ana hareketi ve alternatiflerini hem kartlar hem de modal için tek bir standart listeye çevirir.
 * kind: "exercise" | "core"
 */
function getExerciseVariants(item, kind) {
  if (!item) return [];

  if (kind === "core") {
    const primary = {
      index: 0,
      pillLabel: "Ana Core Hareketi",
      isAlternative: false,
      name: item.name,
      turkishName: item.turkishName,
      primaryTag: item.target,
      secondaryTag: item.reps,
      modalBadge: `Aktif Dinlenme Core · ${item.reps}`,
      whenToUse: null,
      videoKey: item.videoKey,
      sourceUrl: item.sourceUrl || getExerciseMedia(item.videoKey).sourceUrl,
      tips: [item.formCue, `MACFit İpucu: ${item.macfitTip}`],
    };

    const alts = (item.alternatives || []).map((alt, i) => ({
      index: i + 1,
      pillLabel: `Alt ${i + 1}: ${alt.name}`,
      isAlternative: true,
      name: alt.name,
      turkishName: alt.turkishName,
      primaryTag: item.target,
      secondaryTag: alt.reps || item.reps,
      modalBadge: `Alternatif Core · ${alt.reps || item.reps}`,
      whenToUse: alt.whenToUse,
      videoKey: alt.videoKey,
      sourceUrl: alt.sourceUrl || getExerciseMedia(alt.videoKey).sourceUrl,
      tips: [alt.formCue, `MACFit İpucu: ${alt.macfitTip}`],
    }));

    return [primary, ...alts];
  }

  const primary = {
    index: 0,
    pillLabel: "Ana Hareket",
    isAlternative: false,
    name: item.name,
    turkishName: item.turkishName,
    primaryTag: item.muscleGroup,
    secondaryTag: item.equipment,
    modalBadge: `${item.muscleGroup} · ${item.equipment}`,
    whenToUse: null,
    videoKey: item.videoKey,
    sourceUrl: item.sourceUrl || getExerciseMedia(item.videoKey).sourceUrl,
    tips: item.tips || [],
  };

  const alts = (item.alternatives || []).map((alt, i) => {
    const secondaryTag = alt.equipment
      ? `${alt.equipment}${alt.reps ? ` · ${alt.reps}` : ""}`
      : item.equipment;
    return {
      index: i + 1,
      pillLabel: `Alt ${i + 1}: ${alt.name}`,
      isAlternative: true,
      name: alt.name,
      turkishName: alt.turkishName,
      primaryTag: item.muscleGroup,
      secondaryTag,
      modalBadge: `Alternatif · ${secondaryTag}`,
      whenToUse: alt.whenToUse,
      videoKey: alt.videoKey,
      sourceUrl: alt.sourceUrl || getExerciseMedia(alt.videoKey).sourceUrl,
      tips: alt.tips || [],
    };
  });

  return [primary, ...alts];
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

// localStorage üzerinden kayıtlı profili güvenli (try/catch) biçimde okur
function loadStoredProfile() {
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? { ...DEFAULT_PROFILE, ...parsed, isCustom: true } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

// Kullanıcı profilini yalnızca localStorage'a güvenli biçimde kaydeder
function saveStoredProfile(profile) {
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ ...profile, isCustom: true }));
    return true;
  } catch {
    return false;
  }
}

// Kişisel profil verisini sıfırlar
function clearStoredProfile() {
  try {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch {
    // localStorage kullanılamıyorsa sessizce atla
  }
}

// Aktif profil hedeflerini hesaplayıp döndürür
function getActiveProfileTargets() {
  return calculateProfileTargets(loadStoredProfile());
}

// Profil formunu mevcut veya örnek değerlerle doldurur
function syncProfileForm(profileTargets) {
  if (!elements.profileForm) return;
  const fieldNames = [
    "age",
    "weightKg",
    "bodyFatPct",
    "muscleMassKg",
    "bmrKcal",
    "waistCm",
    "activityMultiplier",
    "targetBodyFatPct",
  ];
  fieldNames.forEach((name) => {
    const input = elements.profileForm.elements.namedItem(name);
    if (input) {
      input.value = String(profileTargets[name]);
    }
  });
}

// Profilim & hedefler bölümünü render eder
function renderTanitaSection() {
  const profile = getActiveProfileTargets();
  syncProfileForm(profile);

  const sourceLabel = profile.isCustom ? "Kayıtlı Profilin (Bu Cihazda)" : "Örnek Değerler";
  elements.tanitaMeta.textContent = `${sourceLabel} · Yaş: ${profile.age} · Hedef: ${profile.targetStyle}`;
  if (elements.profileTargetChip) {
    elements.profileTargetChip.textContent = `Hedef: %${profile.targetBodyFatPct} Yağ · ~${profile.targetWeightKg} kg · ${profile.targetCalories} kcal`;
  }

  elements.tanitaGrid.innerHTML = profile.metrics
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

// Aktif sekmeye geçer, aramayı temizler ve isteğe bağlı içerik alanına yumuşakça odaklanır
function selectTab(tabId, { scrollToContent = false } = {}) {
  if (!tabId) return;
  state.activeTab = tabId;
  if (state.searchQuery) {
    state.searchQuery = "";
    elements.searchInput.value = "";
    elements.clearSearchBtn.hidden = true;
  }
  renderTabs();
  renderMainContent();
  if (scrollToContent && elements.contentArea) {
    elements.contentArea.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Üst sekme çubuğu ve mobil alt navigasyon barını senkronize biçimde oluşturur
function renderTabs() {
  const hasSearch = state.searchQuery.trim().length > 0;

  elements.tabsNav.innerHTML = TABS.map(
    (tab) => `
      <button
        type="button"
        role="tab"
        class="tab-btn ${state.activeTab === tab.id && !hasSearch ? "active" : ""}"
        data-tab="${escapeHtml(tab.id)}"
        aria-selected="${state.activeTab === tab.id && !hasSearch}"
      >
        <span class="tab-btn-top">${escapeHtml(tab.top)}</span>
        <span class="tab-btn-sub">${escapeHtml(tab.sub)}</span>
      </button>
    `
  ).join("");

  if (elements.openSummaryBtn) {
    elements.openSummaryBtn.classList.toggle("active", state.activeTab === "summary" && !hasSearch);
  }

  elements.tabsNav.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectTab(btn.dataset.tab, { scrollToContent: true });
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
    const mobileTabs = mobileOrder
      .map((id) => TABS.find((t) => t.id === id))
      .filter(Boolean);

    elements.mobileBottomNav.innerHTML = mobileTabs
      .map(
        (tab) => `
        <button
          type="button"
          class="mobile-nav-btn ${state.activeTab === tab.id && !hasSearch ? "active" : ""}"
          data-mobile-tab="${escapeHtml(tab.id)}"
          aria-current="${state.activeTab === tab.id && !hasSearch ? "page" : "false"}"
        >
          <span class="mobile-nav-icon" aria-hidden="true">${escapeHtml(tab.mobileIcon)}</span>
          <span class="mobile-nav-label">${escapeHtml(tab.mobileLabel)}</span>
        </button>
      `
      )
      .join("");

    elements.mobileBottomNav.querySelectorAll(".mobile-nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectTab(btn.dataset.mobileTab, { scrollToContent: true });
      });
    });
  }
}

// Medya veya dış form referans sahnesi HTML'ini üretir
// Lisanslı yerel medya yoksa MuscleWiki kaynak sayfasına giden "Formu izle ↗" bağlantısı gösterilir.
function createMediaStageHtml({
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

  if (media.frontMp4) {
    return `
      <div class="media-stage" data-media-mode="front">
        <video
          class="media-video"
          src="${escapeHtml(media.frontMp4)}"
          poster="${escapeHtml(media.startImg || "")}"
          data-front-src="${escapeHtml(media.frontMp4)}"
          data-side-src="${escapeHtml(media.sideMp4 || "")}"
          autoplay
          loop
          muted
          playsinline
          preload="metadata"
          aria-label="${escapeHtml(name)} hareket videosu"
        ></video>

        ${
          media.startImg
            ? `<img
                class="media-frame frame-start is-hidden"
                src="${escapeHtml(media.startImg)}"
                alt="${escapeHtml(name)} ön açı karesi"
                loading="lazy"
              />`
            : ""
        }
        ${
          media.endImg
            ? `<img
                class="media-frame frame-end is-hidden"
                src="${escapeHtml(media.endImg)}"
                alt="${escapeHtml(name)} yan açı karesi"
                loading="lazy"
              />`
            : ""
        }

        <div class="media-overlay-top">
          <span class="order-badge">${escapeHtml(badgeText)}</span>
          <span class="pose-indicator">Ön Açı · Video</span>
        </div>

        <div class="media-controls-bar">
          <div class="pose-toggle-group" role="group" aria-label="Kamera ve görünüm seçici">
            <button type="button" class="pose-btn active" data-mode="front">Ön Açı</button>
            <button type="button" class="pose-btn" data-mode="side">Yan Açı</button>
            <button type="button" class="pose-btn" data-mode="photo">Kare</button>
          </div>

          <button
            type="button"
            class="video-trigger-btn"
            ${triggerAttr}
          >
            <span>Form &amp; Detay</span>
          </button>
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
        <div class="reference-preview-meta">${escapeHtml(metaSummary)}</div>
        <p class="reference-preview-cue">${escapeHtml(cueText)}</p>
      </div>

      <div class="media-controls-bar">
        <a
          href="${escapeHtml(resolvedUrl)}"
          target="_blank"
          rel="noopener noreferrer"
          class="source-link-btn"
        >
          Formu izle ↗
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
function createAlternativesBoxHtml(variants, activeIndex = 0) {
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
      <div class="alternatives-header">🔄 Alternatif Hareketler (Makine Doluysa / Yapılamıyorsa)</div>
      <div class="alt-pills-row">${pillsHtml}</div>
      <div class="alt-reason-banner" ${activeVariant.whenToUse ? "" : "hidden"}>${reasonHtml}</div>
    </div>
  `;
}

// Tekil egzersiz kartı HTML'ini üretir
function createExerciseCardHtml(exercise, badgeText, initialVariantIndex = 0) {
  const coreItem = CORE_LIBRARY[exercise.coreRestId];
  const coreMedia = coreItem ? getExerciseMedia(coreItem.videoKey) : null;
  const maxSets = exercise.pyramidSets.length;

  const variants = getExerciseVariants(exercise, "exercise");
  const activeVariant = variants[initialVariantIndex] || variants[0];

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
function createCoreCardHtml(core, initialVariantIndex = 0) {
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

// Seçilen antrenman günü için okunaklı ve etkileşimli tablo özeti üretir
function createDaySummaryTableHtml(day, { showDayHeader = false, showJumpBtn = false } = {}) {
  const rowsHtml = (day.exercises || [])
    .map((exercise) => {
      const coreItem = CORE_LIBRARY[exercise.coreRestId];
      const pyramidHtml = (exercise.pyramidSets || [])
        .map(
          (step) => `
          <div class="table-pyramid-item">
            <span class="table-set-num">${escapeHtml(step.set)}. Set</span>
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
                Formu izle ↗
              </a>
            </div>
          </td>
          <td class="col-pyramid" data-label="Piramit Set & Tekrarlar">
            <div class="table-pyramid-list">${pyramidHtml}</div>
          </td>
          <td class="col-core" data-label="Set Arası (21'ler Core)">
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
          <span class="meta-pill">⏱ ${escapeHtml(day.duration)}</span>
          <span class="meta-pill">📅 ${escapeHtml(day.scheduleNote)}</span>
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
          <h3>📋 ${escapeHtml(day.tabLabel)} Hızlı Tablo Özeti</h3>
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
function renderWorkoutDay(day) {
  const viewModeBarHtml = `
    <div class="view-mode-bar" role="group" aria-label="Görünüm modu seçici">
      <span class="view-mode-label">Görünüm Modu:</span>
      <div class="view-mode-buttons">
        <button
          type="button"
          class="view-mode-btn ${state.viewMode === "both" ? "active" : ""}"
          data-view-mode="both"
        >
          📋 Tablo + Hareket Kartları
        </button>
        <button
          type="button"
          class="view-mode-btn ${state.viewMode === "table-only" ? "active" : ""}"
          data-view-mode="table-only"
        >
          📊 Sadece Yazılı / Tablo Özeti
        </button>
        <button
          type="button"
          class="view-mode-btn ${state.viewMode === "cards-only" ? "active" : ""}"
          data-view-mode="cards-only"
        >
          🏋️ Sadece Hareket Kartları
        </button>
      </div>
    </div>
  `;

  const tableHtml =
    state.viewMode !== "cards-only"
      ? createDaySummaryTableHtml(day, { showDayHeader: false, showJumpBtn: false })
      : "";

  const cardsSectionHtml =
    state.viewMode !== "table-only"
      ? `<div class="exercises-grid">${day.exercises
          .map((exercise) =>
            createExerciseCardHtml(exercise, `${day.tabLabel} · Hareket ${exercise.order}`)
          )
          .join("")}</div>`
      : "";

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
    ${viewModeBarHtml}
    ${tableHtml}
    ${cardsSectionHtml}
  `;

  bindCardInteractions();
}

// Tüm programın yazılı ve tablolu özetini tek sayfada render eder
function renderFullSummaryTab() {
  const weeklyScheduleRowsHtml = WORKOUT_DAYS.map(
    (day) => `
      <tr>
        <td data-label="Gün"><strong>${escapeHtml(day.tabLabel)}</strong><div class="table-alt-meta">${escapeHtml(day.shortTitle)}</div></td>
        <td data-label="Odak Bölgeler">${escapeHtml(day.fullTitle.replace(/^\d+\.\s*GÜN:\s*/i, ""))}</td>
        <td data-label="Süre"><span class="tag-chip equipment">${escapeHtml(day.duration)}</span></td>
        <td data-label="Takvim Notu">${escapeHtml(day.scheduleNote)}</td>
        <td data-label="Hızlı Geçiş">
          <button type="button" class="table-jump-btn" data-jump-day="${escapeHtml(day.id)}">
            Gün Kartlarını Aç →
          </button>
        </td>
      </tr>
    `
  ).join("");

  const allDaysTablesHtml = WORKOUT_DAYS.map((day) =>
    createDaySummaryTableHtml(day, { showDayHeader: true, showJumpBtn: true })
  ).join("");

  const coreRowsHtml = Object.values(CORE_LIBRARY)
    .map((core) => {
      const altsHtml = (core.alternatives || [])
        .map(
          (alt, idx) => `
          <div class="table-alt-item">
            <button
              type="button"
              class="table-alt-btn"
              data-open-core="${escapeHtml(core.id)}"
              data-open-variant="${idx + 1}"
            >
              <strong>Alt ${idx + 1}:</strong> ${escapeHtml(alt.name)}
            </button>
            <div class="table-alt-meta">${escapeHtml(alt.turkishName)}${alt.reps ? ` · ${escapeHtml(alt.reps)}` : ""}</div>
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
          <td class="col-main" data-label="Core Hareketi">
            <div class="table-ex-name">${escapeHtml(core.name)}</div>
            <div class="table-ex-tr">${escapeHtml(core.turkishName)}</div>
            <div class="table-meta-row">
              <button
                type="button"
                class="table-video-btn"
                data-open-core="${escapeHtml(core.id)}"
                data-open-variant="0"
              >
                Form &amp; Detay
              </button>
              <a
                href="${escapeHtml(getExerciseMedia(core).sourceUrl || "https://musclewiki.com/")}"
                target="_blank"
                rel="noopener noreferrer"
                class="table-video-btn"
              >
                Formu izle ↗
              </a>
            </div>
          </td>
          <td data-label="Hedef Bölge"><span class="tag-chip">${escapeHtml(core.target)}</span></td>
          <td data-label="Tekrar / Süre"><strong>${escapeHtml(core.reps)}</strong></td>
          <td class="col-cue" data-label="Nasıl Yapılır">
            <div>${escapeHtml(core.formCue)}</div>
            ${core.macfitTip ? `<div class="table-alt-when"><strong>MACFit İpucu:</strong> ${escapeHtml(core.macfitTip)}</div>` : ""}
          </td>
          <td class="col-alts" data-label="Alternatifler"><div class="table-alt-list">${altsHtml}</div></td>
        </tr>
      `;
    })
    .join("");

  const { summary, fastingWindows, morningFastRules, dailyMeals, waistRules } = NUTRITION_PROTOCOL;
  const profileTargets = getActiveProfileTargets();

  const macroRowsHtml = [
    [
      "Günlük Kalori Hedefi",
      `${profileTargets.targetCalories} kcal (Örnek Plan: ${summary.calories})`,
      `Profil BMR (${profileTargets.bmrKcal} kcal) ve tahmini TDEE (${profileTargets.estimatedTdeeKcal} kcal) baz alınır · Haftalık hedef: vücut ağırlığının %0,5-1'i`,
    ],
    ["Günlük Protein", summary.protein, `${profileTargets.muscleMassKg.toFixed(1)} kg kas kütleni korumaya destek olur (örnek planda 180 g; ~1,8-2,2 g/kg)`],
    ["Karbonhidrat (Çiğ/Kuru Bazlı)", summary.carbs, "Antrenman günlerinde yüksek, dinlenme günlerinde kontrollü (~4 kcal/g)"],
    ["Sağlıklı Yağlar", summary.fats, "Hormon dengesi ve tokluk (~9 kcal/g)"],
    ["Sıvı Tüketimi", summary.water, "Gün boyu dengeli hidrasyon ve elektrolit desteği"],
  ]
    .map(
      ([label, value, note]) => `
      <tr>
        <td data-label="Kalem"><strong>${escapeHtml(label)}</strong></td>
        <td data-label="Günlük Hedef"><span class="table-macro-badge">${escapeHtml(value)}</span></td>
        <td data-label="Amaç / Not">${escapeHtml(note)}</td>
      </tr>
    `
    )
    .join("");

  const trainingSum = dailyMeals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.totals.kcal,
      protein: acc.protein + m.totals.protein,
      carbs: acc.carbs + m.totals.carbs,
      fat: acc.fat + m.totals.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const restSum = dailyMeals.reduce(
    (acc, m) => {
      const t = m.restDayTotals || m.totals;
      return {
        kcal: acc.kcal + t.kcal,
        protein: acc.protein + t.protein,
        carbs: acc.carbs + t.carbs,
        fat: acc.fat + t.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const mealsRowsHtml =
    dailyMeals
      .map(
        (meal) => `
      <tr>
        <td data-label="Saat">
          <span class="meal-time-badge">${escapeHtml(meal.time)}</span>
          <div class="meal-totals-chip">Antrenman: ${escapeHtml(meal.totals.kcal)} kcal (P ${escapeHtml(meal.totals.protein)}g · K ${escapeHtml(meal.totals.carbs)}g · Y ${escapeHtml(meal.totals.fat)}g)</div>
          <div class="meal-totals-chip rest">Dinlenme: ${escapeHtml(meal.restDayTotals.kcal)} kcal (P ${escapeHtml(meal.restDayTotals.protein)}g · K ${escapeHtml(meal.restDayTotals.carbs)}g · Y ${escapeHtml(meal.restDayTotals.fat)}g)</div>
        </td>
        <td data-label="Öğün"><strong>${escapeHtml(meal.title)}</strong></td>
        <td data-label="İçerik (Çiğ / Pişmiş)">
          <ul class="table-bullets">
            ${meal.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
        </td>
      </tr>
    `
      )
      .join("") +
    `
      <tr class="meals-total-row">
        <td data-label="Günlük Toplam" colspan="3">
          <strong>Antrenman Günü Toplamı:</strong> ${escapeHtml(trainingSum.kcal)} kcal (P ${escapeHtml(trainingSum.protein)} g · K ${escapeHtml(trainingSum.carbs)} g · Y ${escapeHtml(trainingSum.fat)} g)
          &nbsp;|&nbsp;
          <strong>Dinlenme Günü Toplamı:</strong> ${escapeHtml(restSum.kcal)} kcal (P ${escapeHtml(restSum.protein)} g · K ${escapeHtml(restSum.carbs)} g · Y ${escapeHtml(restSum.fat)} g)
        </td>
      </tr>
    `;

  elements.contentArea.innerHTML = `
    <div class="summary-layout">
      <div class="day-banner">
        <div>
          <h2>📋 Kravitz Lean &amp; Fit — Tüm Programın Yazılı &amp; Tablo Özeti</h2>
          <p>
            Kartlar arasında gezinmeden; tüm antrenman günlerini, piramit set/tekrarlarını,
            set arası 21'ler core hareketlerini, alternatifleri ve beslenme protokolünü tek sayfada gör.
          </p>
        </div>
        <div class="day-meta-badges">
          <button type="button" id="print-summary-btn" class="btn-outline btn-print-summary">
            🖨️ Yazdır / PDF Kaydet
          </button>
        </div>
      </div>

      <!-- Mobilde ve Masaüstünde Tek Dokunuşla Bölüm Atlama Çubuğu -->
      <div class="summary-quick-nav" role="navigation" aria-label="Özet Bölümleri Hızlı Geçiş">
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-sec-weekly">🗓️ Haftalık Şema</button>
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-day-day-1">1. Gün</button>
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-day-day-2">2. Gün</button>
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-day-day-3">3. Gün</button>
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-day-day-4">4. Gün</button>
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-sec-core">🔥 21'ler Core</button>
        <button type="button" class="summary-quick-chip" data-scroll-target="summary-sec-nutrition">🥗 Beslenme</button>
      </div>

      <!-- Bölüm 1: Sistem Özeti, Profil Hedefleri & Haftalık Şema -->
      <section id="summary-sec-weekly" class="summary-section-block">
        <div class="summary-section-title-row">
          <h3>1. Sistem Özeti, Profil Hedefleri &amp; Haftalık MACFit Şeması</h3>
        </div>

        <div class="summary-prose-grid">
          <article class="summary-prose-card">
            <h4>🎯 Sistemin 3 Altın Kuralı (Yazılı Özet)</h4>
            <ul class="table-bullets">
              ${SYSTEM_PILLARS.map(
                (p) => `<li><strong>${escapeHtml(p.badge)} (${escapeHtml(p.title)}):</strong> ${escapeHtml(p.description)}</li>`
              ).join("")}
            </ul>
          </article>

          <article class="summary-prose-card">
            ${(() => {
              const profile = getActiveProfileTargets();
              const label = profile.isCustom ? "Kayıtlı Profilin" : "Örnek Profil (Profilim formundan özelleştir)";
              return `
                <h4>📊 Profil Başlangıç → Hedef Özeti</h4>
                <p class="summary-prose-lead">
                  <strong>${escapeHtml(label)}:</strong> ${escapeHtml(profile.age)} yaş ·
                  Hedef: <strong>${escapeHtml(profile.targetStyle)}</strong>
                </p>
                <ul class="table-bullets">
                  ${profile.metrics
                    .map(
                      (m) => `<li><strong>${escapeHtml(m.label)}:</strong> ${escapeHtml(m.current)} → <strong>${escapeHtml(m.target)}</strong> (${escapeHtml(m.note)})</li>`
                    )
                    .join("")}
                </ul>
              `;
            })()}
          </article>
        </div>

        <div class="summary-table-card">
          <div class="summary-table-header compact">
            <div>
              <h3>🗓️ Haftalık Antrenman Günleri Şeması (3 veya 4 Gün)</h3>
            </div>
          </div>
          <div class="table-responsive">
            <table class="workout-summary-table">
              <thead>
                <tr>
                  <th>Gün</th>
                  <th>Odak Bölgeler</th>
                  <th>Süre</th>
                  <th>Haftalık Takvim Notu</th>
                  <th>Hızlı Geçiş</th>
                </tr>
              </thead>
              <tbody>
                ${weeklyScheduleRowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Bölüm 2: 4 Günlük Antrenman Programı Tam Tablosu -->
      <section class="summary-section-block">
        <div class="summary-section-title-row">
          <h3>2. 4 Günlük Antrenman Programı Tam Tablosu (1. Gün – 4. Gün)</h3>
        </div>
        <div class="summary-tables-stack">
          ${allDaysTablesHtml}
        </div>
      </section>

      <!-- Bölüm 3: 21'ler Aktif Core & Sabah Mide Vakumu Tam Tablosu -->
      <section id="summary-sec-core" class="summary-section-block">
        <div class="summary-section-title-row">
          <h3>3. 21'ler Aktif Core &amp; Sabah Mide Vakumu Tam Tablosu</h3>
        </div>
        <div class="summary-table-card">
          <div class="table-responsive">
            <table class="workout-summary-table">
              <thead>
                <tr>
                  <th>Core Hareketi</th>
                  <th>Hedef Bölge</th>
                  <th>Tekrar / Süre</th>
                  <th>Nasıl Yapılır (Kısa Özet)</th>
                  <th>Alternatif 1 &amp; Alternatif 2</th>
                </tr>
              </thead>
              <tbody>
                ${coreRowsHtml}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Bölüm 4: Beslenme, Öğün Zamanlaması & Enerji Dengesi Özeti -->
      <section id="summary-sec-nutrition" class="summary-section-block">
        <div class="summary-section-title-row">
          <h3>4. Beslenme, Öğün Zamanlaması &amp; Enerji Dengesi Protokolü</h3>
        </div>

        <div class="summary-table-card">
          <div class="summary-table-header compact">
            <div>
              <h3>🥗 Günlük Makro &amp; Kalori Hedef Tablosu</h3>
            </div>
          </div>
          <div class="table-responsive">
            <table class="workout-summary-table">
              <thead>
                <tr>
                  <th>Kalem</th>
                  <th>Günlük Hedef</th>
                  <th>Amaç / Not</th>
                </tr>
              </thead>
              <tbody>
                ${macroRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <div class="summary-table-card">
          <div class="summary-table-header compact">
            <div>
              <h3>🕒 Saat Saat Günlük Öğün Tablosu</h3>
            </div>
          </div>
          <div class="table-responsive">
            <table class="workout-summary-table">
              <thead>
                <tr>
                  <th>Saat</th>
                  <th>Öğün</th>
                  <th>İçerik ve Porsiyon Özeti</th>
                </tr>
              </thead>
              <tbody>
                ${mealsRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <div class="summary-prose-grid">
          <article class="summary-prose-card">
            <h4>⏱️ Aralıklı Oruç Pencereleri &amp; Sabah Açlık Kuralları</h4>
            <ul class="table-bullets">
              ${fastingWindows
                .map(
                  (win) => `<li><strong>${escapeHtml(win.name)} (${escapeHtml(win.window)}):</strong> ${escapeHtml(win.description)}</li>`
                )
                .join("")}
            </ul>
            <hr class="summary-divider" />
            <p class="summary-prose-subhead">Sabah Açlık Penceresinde Serbest Olanlar:</p>
            <ul class="table-bullets">
              ${morningFastRules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}
            </ul>
          </article>

          <article class="summary-prose-card">
            <h4>📌 Vücut Kompozisyonu İçin 3 Temel Kural</h4>
            <ul class="table-bullets">
              ${waistRules
                .map((rule) => `<li><strong>${escapeHtml(rule.title)}:</strong> ${escapeHtml(rule.text)}</li>`)
                .join("")}
            </ul>
          </article>
        </div>
      </section>
    </div>
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
          Core çalışmaları bölgesel yağ eritmez (Ramirez-Campillo R. ve ark., Human Movement 2022;23, DOI: 10.5114/hm.2022.110373);
          gövde stabilitesi, postür farkındalığı ve karın kaslarının kuvvet/hipertrofi gelişimi için uygulanır.
        </p>
      </div>
      <div class="day-meta-badges">
        <span class="meta-pill">🎯 Hedef: Gövde Stabilitesi &amp; Core Kuvveti</span>
      </div>
    </div>
    <div class="core-grid">${cardsHtml}</div>
  `;

  bindCardInteractions();
}

// Beslenme ve enerji dengesi protokolü sekmesini render eder
function renderNutritionProtocol() {
  const { summary, fastingWindows, morningFastRules, dailyMeals, waistRules } = NUTRITION_PROTOCOL;
  const profileTargets = getActiveProfileTargets();
  const trainingDayTotals = dailyMeals.reduce(
    (acc, meal) => ({
      kcal: acc.kcal + meal.totals.kcal,
      protein: acc.protein + meal.totals.protein,
      carbs: acc.carbs + meal.totals.carbs,
      fat: acc.fat + meal.totals.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const restDayTotals = dailyMeals.reduce(
    (acc, meal) => {
      const rt = meal.restDayTotals || meal.totals;
      return {
        kcal: acc.kcal + rt.kcal,
        protein: acc.protein + rt.protein,
        carbs: acc.carbs + rt.carbs,
        fat: acc.fat + rt.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  elements.contentArea.innerHTML = `
    <div class="nutrition-layout">
      <div class="day-banner">
        <div>
          <h2>Yağsız &amp; Fit Silüet İçin Kravitz Beslenme Protokolü</h2>
          <p>
            Profil BMR değerin (${escapeHtml(profileTargets.bmrKcal)} kcal) ve günlük ~${escapeHtml(profileTargets.proteinTargetG)} g protein hedefinle
            mevcut kas kütleni (%${escapeHtml(profileTargets.targetBodyFatPct)} hedef yağ oranı) koruyarak haftalık %0,5-%1 kilo kaybı (genel öneri) hedeflenir.
          </p>
        </div>
        <div class="day-meta-badges">
          <span class="meta-pill">🎯 Kişisel Kalori Hedefi: ${escapeHtml(profileTargets.targetCalories)} kcal</span>
          <span class="meta-pill">📉 Örnek Plan: ${escapeHtml(trainingDayTotals.kcal)} / ${escapeHtml(restDayTotals.kcal)} kcal</span>
        </div>
      </div>

      <div class="macro-grid">
        <article class="macro-card">
          <div class="macro-label">Ortalama Kalori Hedefi</div>
          <div class="macro-val">${escapeHtml(summary.targetKcal)} kcal</div>
          <div class="macro-sub">Antrenman: ${escapeHtml(trainingDayTotals.kcal)} · Dinlenme: ${escapeHtml(restDayTotals.kcal)} kcal</div>
        </article>
        <article class="macro-card">
          <div class="macro-label">Günlük Protein</div>
          <div class="macro-val">${escapeHtml(summary.proteinG)} g</div>
          <div class="macro-sub">${escapeHtml(summary.proteinG * 4)} kcal (%${Math.round(((summary.proteinG * 4) / summary.targetKcal) * 100)})</div>
        </article>
        <article class="macro-card">
          <div class="macro-label">Karbonhidrat</div>
          <div class="macro-val">${escapeHtml(summary.carbsG)} g</div>
          <div class="macro-sub">Antr: ${escapeHtml(trainingDayTotals.carbs)} g · Dinl: ${escapeHtml(restDayTotals.carbs)} g</div>
        </article>
        <article class="macro-card">
          <div class="macro-label">Sağlıklı Yağlar</div>
          <div class="macro-val">${escapeHtml(summary.fatG)} g</div>
          <div class="macro-sub">${escapeHtml(summary.fatG * 9)} kcal (zeytinyağı, yumurta, badem)</div>
        </article>
        <article class="macro-card">
          <div class="macro-label">Sıvı Tüketimi</div>
          <div class="macro-val">${escapeHtml(summary.water)}</div>
          <div class="macro-sub">Hidrasyon &amp; mineral desteği</div>
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

      <div class="daily-totals-bar">
        <div class="daily-total-pill">
          <strong>🏋️ Antrenman Günü Toplamı:</strong>
          <span>${escapeHtml(trainingDayTotals.kcal)} kcal · P ${escapeHtml(trainingDayTotals.protein)} g · K ${escapeHtml(trainingDayTotals.carbs)} g · Y ${escapeHtml(trainingDayTotals.fat)} g</span>
        </div>
        <div class="daily-total-pill is-rest">
          <strong>🛌 Dinlenme Günü Toplamı:</strong>
          <span>${escapeHtml(restDayTotals.kcal)} kcal · P ${escapeHtml(restDayTotals.protein)} g · K ${escapeHtml(restDayTotals.carbs)} g · Y ${escapeHtml(restDayTotals.fat)} g</span>
        </div>
      </div>

      <div class="three-col-grid">
        ${dailyMeals
          .map(
            (meal) => `
          <article class="info-panel">
            <span class="meal-time-badge">${escapeHtml(meal.time)}</span>
            <h3>${escapeHtml(meal.title)}</h3>
            <div class="meal-macros-summary">
              <div class="meal-macro-line"><strong>Antrenman:</strong> ${escapeHtml(meal.totals.kcal)} kcal (P ${escapeHtml(meal.totals.protein)}g · K ${escapeHtml(meal.totals.carbs)}g · Y ${escapeHtml(meal.totals.fat)}g)</div>
              <div class="meal-macro-line rest"><strong>Dinlenme:</strong> ${escapeHtml(meal.restDayTotals.kcal)} kcal (P ${escapeHtml(meal.restDayTotals.protein)}g · K ${escapeHtml(meal.restDayTotals.carbs)}g · Y ${escapeHtml(meal.restDayTotals.fat)}g)</div>
            </div>
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

// Arama kutusuna göre ana ve alternatif hareketler arasında eşleşen ilk varyant indeksini bulur
function findMatchingVariantIndex(item, kind, normalizedQuery) {
  const variants = getExerciseVariants(item, kind);
  for (const variant of variants) {
    const searchable = [
      variant.name,
      variant.turkishName,
      variant.primaryTag,
      variant.secondaryTag,
      variant.whenToUse,
    ]
      .join(" ")
      .toLowerCase();

    if (searchable.includes(normalizedQuery)) {
      return variant.index;
    }
  }
  return -1;
}

// Arama kutusuna göre tüm programdaki (ana + alternatif) eşleşen hareketleri gösterir
function renderSearchResults(query) {
  const normalized = query.trim().toLowerCase();
  const matchedExercises = [];

  WORKOUT_DAYS.forEach((day) => {
    day.exercises.forEach((ex) => {
      const restText = (ex.coreRestLabel || "").toLowerCase();
      let variantIdx = findMatchingVariantIndex(ex, "exercise", normalized);
      if (variantIdx === -1 && restText.includes(normalized)) {
        variantIdx = 0;
      }
      if (variantIdx !== -1) {
        matchedExercises.push({
          dayLabel: day.tabLabel,
          exercise: ex,
          initialVariantIndex: variantIdx,
        });
      }
    });
  });

  const matchedCore = [];
  Object.values(CORE_LIBRARY).forEach((core) => {
    const variantIdx = findMatchingVariantIndex(core, "core", normalized);
    if (variantIdx !== -1) {
      matchedCore.push({ core, initialVariantIndex: variantIdx });
    }
  });

  if (matchedExercises.length === 0 && matchedCore.length === 0) {
    elements.contentArea.innerHTML = `
      <div class="empty-state">
        <h3>"${escapeHtml(query)}" için hareket bulunamadı</h3>
        <p>Örnek aramalar: Biceps, Arnold, Omuz, Sırt, Hack Squat, Dead Bug, Plank</p>
      </div>
    `;
    return;
  }

  const exercisesHtml = matchedExercises
    .map(({ dayLabel, exercise, initialVariantIndex }) =>
      createExerciseCardHtml(
        exercise,
        `${dayLabel} · Hareket ${exercise.order}`,
        initialVariantIndex
      )
    )
    .join("");

  const coreSectionHtml =
    matchedCore.length > 0
      ? `
      <div style="margin-top: 26px;">
        <h3 style="font-family: Oswald, sans-serif; margin-bottom: 14px;">Eşleşen Core (21'ler) ve Alternatif Hareketler</h3>
        <div class="core-grid">
          ${matchedCore
            .map(({ core, initialVariantIndex }) => createCoreCardHtml(core, initialVariantIndex))
            .join("")}
        </div>
      </div>
    `
      : "";

  elements.contentArea.innerHTML = `
    <div class="day-banner">
      <div>
        <h2>Arama Sonuçları: "${escapeHtml(query)}"</h2>
        <p>${matchedExercises.length} ana/alternatif hareket ve ${matchedCore.length} core hareketi bulundu.</p>
      </div>
    </div>
    ${exercisesHtml ? `<div class="exercises-grid">${exercisesHtml}</div>` : ""}
    ${coreSectionHtml}
  `;

  bindCardInteractions();
}

// Kart üzerindeki aktif varyantı (Ana Hareket veya Alt 1 / Alt 2) kart DOM'una uygular
function applyVariantToCard(cardEl, variants, variantIndex) {
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
    previewMetaEl.textContent = [variant.primaryTag, variant.secondaryTag].filter(Boolean).join(" · ");
  }
  if (previewCueEl) {
    previewCueEl.textContent =
      (variant.tips && variant.tips[0]) || "Kontrollü tempo ve tam hareket açıklığıyla uygula.";
  }

  // Lisanslı medya sahnesi varsa video ve kareleri güncelle
  const videoEl = cardEl.querySelector(".media-video");
  const startImg = cardEl.querySelector(".frame-start");
  const endImg = cardEl.querySelector(".frame-end");
  const activeModeBtn = cardEl.querySelector(".pose-btn.active");
  const activeMode = activeModeBtn ? activeModeBtn.dataset.mode : "front";

  if (videoEl && media.frontMp4) {
    videoEl.dataset.frontSrc = media.frontMp4 || "";
    videoEl.dataset.sideSrc = media.sideMp4 || "";
    videoEl.setAttribute("aria-label", `${variant.name} hareket videosu`);
    videoEl.poster = media.startImg || "";

    if (activeMode === "front" || activeMode === "side") {
      const targetSrc = activeMode === "front" ? media.frontMp4 : media.sideMp4;
      videoEl.setAttribute("src", targetSrc);
      videoEl.load();
      videoEl.play().catch(() => {});
    }
  }

  if (startImg && media.startImg) {
    startImg.src = media.startImg;
    startImg.alt = `${variant.name} ön açı karesi`;
  }
  if (endImg && media.endImg) {
    endImg.src = media.endImg;
    endImg.alt = `${variant.name} yan açı karesi`;
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
function bindCardInteractions() {
  clearPhotoTimers();

  document.querySelectorAll(".media-stage").forEach((stage) => {
    const videoEl = stage.querySelector(".media-video");
    const startImg = stage.querySelector(".frame-start");
    const endImg = stage.querySelector(".frame-end");
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

      if (mode === "front" || mode === "side") {
        const targetSrc = mode === "front" ? videoEl.dataset.frontSrc : videoEl.dataset.sideSrc;
        if (videoEl.getAttribute("src") !== targetSrc) {
          videoEl.setAttribute("src", targetSrc);
          videoEl.load();
        }
        videoEl.classList.remove("is-hidden");
        videoEl.play().catch(() => {});
        if (startImg) startImg.classList.add("is-hidden");
        if (endImg) endImg.classList.add("is-hidden");
        indicator.textContent = mode === "front" ? "Ön Açı · Video" : "Yan Açı · Video";
        return;
      }

      // Kare modu: Ön ve yan açı kareleri arasında akıcı geçiş
      videoEl.classList.add("is-hidden");
      videoEl.pause();

      let showEnd = false;
      const showFrame = (isEnd) => {
        if (startImg) startImg.classList.toggle("is-hidden", isEnd);
        if (endImg) endImg.classList.toggle("is-hidden", !isEnd);
        indicator.textContent = isEnd ? "Kare · Yan Açı" : "Kare · Ön Açı";
      };

      showFrame(false);
      photoLoopTimer = window.setInterval(() => {
        showEnd = !showEnd;
        showFrame(showEnd);
      }, 1700);
      state.photoTimers.push(photoLoopTimer);
    };

    modeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        modeButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        applyMode(btn.dataset.mode);
      });
    });
  });

  // Kart içi Alternatif Hareketler seçicisi
  document.querySelectorAll("[data-variant-kind]").forEach((cardEl) => {
    const kind = cardEl.dataset.variantKind;
    const itemId = cardEl.dataset.itemId;
    const item = kind === "core" ? CORE_LIBRARY[itemId] : findExerciseById(itemId);
    const variants = getExerciseVariants(item, kind);

    cardEl.querySelectorAll(".alt-pill-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.variantIndex);
        applyVariantToCard(cardEl, variants, idx);
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
      const core = CORE_LIBRARY[btn.dataset.openCore];
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
function findExerciseById(exerciseId) {
  for (const day of WORKOUT_DAYS) {
    const found = day.exercises.find((ex) => ex.id === exerciseId);
    if (found) return found;
  }
  return null;
}

// Harici form referansı ("Formu izle ↗"), alternatif seçici ve uygulama ipuçları modalını açar
function openMediaModal({ variants, initialVariantIndex = 0 }) {
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
        Formu izle ↗
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
      elements.modalVideoContainer.innerHTML = `
        <video
          id="modal-video-player"
          controls
          autoplay
          loop
          muted
          playsinline
        ></video>
      `;
      const player = document.getElementById("modal-video-player");
      player.src = currentCamera === "front" ? media.frontMp4 : media.sideMp4 || media.frontMp4;
      player.poster = (currentCamera === "front" ? media.startImg : media.endImg) || "";
      player.load();
      player.playbackRate = currentSpeed;
      player.play().catch(() => {});
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
              Formu izle ↗ (MuscleWiki)
            </a>
            <a
              href="${escapeHtml(licenseUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              class="license-terms-link"
            >
              MuscleWiki Kullanım Şartları ↗
            </a>
          </div>
        </div>
      `;
    }

    if (media.startImg && media.endImg) {
      elements.modalFramesSection.hidden = false;
      elements.modalImgStart.src = media.startImg;
      elements.modalImgStart.alt = `${variant.name} ön açı karesi`;
      elements.modalImgEnd.src = media.endImg;
      elements.modalImgEnd.alt = `${variant.name} yan açı karesi`;
    } else {
      elements.modalFramesSection.hidden = true;
    }

    elements.modalTipsList.innerHTML = variant.tips.map((t) => `<li>${escapeHtml(t)}</li>`).join("");

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
        player.poster = (currentCamera === "front" ? media.startImg : media.endImg) || "";
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
  elements.modalVariantsBar.innerHTML = "";
  elements.modalVariantsBar.hidden = true;
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

  if (state.activeTab === "summary") {
    renderFullSummaryTab();
    return;
  }

  const selectedDay = WORKOUT_DAYS.find((d) => d.id === state.activeTab) || WORKOUT_DAYS[0];
  renderWorkoutDay(selectedDay);
}

// Olay dinleyicilerini başlatır
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
