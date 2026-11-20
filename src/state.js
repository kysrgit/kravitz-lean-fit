/**
 * Dosya: src/state.js
 * Açıklama: Uygulama durumu, sekme tanımları, DOM referansları, güvenli HTML kaçış yardımcısı
 * ve localStorage tabanlı profil / set günlüğü / vücut ölçümü kalıcılık yardımcıları.
 */

import {
  CARDIO_FINISHER,
  CORE_LIBRARY,
  DEFAULT_PROFILE,
  WORKOUT_DAYS,
  calculateProfileTargets,
  getExerciseMedia,
} from "../data.js";

export const PROFILE_STORAGE_KEY = "klf:v1:profile";
export const DISCLAIMER_ACK_KEY = "klf:v1:disclaimer_ack";
export const WORKOUT_LOGS_STORAGE_KEY = "klf:v1:workout_logs";
export const TIMER_STORAGE_KEY = "klf:v1:timer";
export const BODY_LOGS_STORAGE_KEY = "klf:v1:body_logs";

// Uygulama durumu
export const state = {
  activeTab: "day-1",
  viewMode: "both", // "both" | "table-only" | "cards-only"
  searchQuery: "",
  photoTimers: [],
};

export const DAY_MOBILE_CODES = ["01", "02", "03", "04"];

// Sekme tanımları (masaüstü üst bar + mobil thumb-zone alt navigasyon barı)
export const TABS = [
  ...WORKOUT_DAYS.map((day, idx) => ({
    id: day.id,
    top: day.tabLabel,
    sub: day.shortTitle,
    mobileCode: DAY_MOBILE_CODES[idx] || "00",
    mobileIconName: null,
    mobileLabel: day.tabLabel,
  })),
  {
    id: "core-guide",
    top: "Aktif Dinlenme",
    sub: "21'ler Core & Vakum",
    mobileCode: null,
    mobileIconName: "flame",
    mobileLabel: "21'ler",
  },
  {
    id: "nutrition",
    top: "Protokol",
    sub: "Beslenme & Enerji Açığı",
    mobileCode: null,
    mobileIconName: "utensils",
    mobileLabel: "Besin",
  },
  {
    id: "summary",
    top: "Hızlı Bakış",
    sub: "Yazılı & Tablo Özet",
    topIconName: "clipboard-list",
    mobileCode: null,
    mobileIconName: "clipboard-list",
    mobileLabel: "Özet",
  },
];

// DOM referansları
export const elements = {
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
  modalTipsList: document.getElementById("modal-tips-list"),
};

// HTML özel karakterlerini güvenli metne dönüştürür
export function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Aktif fotoğraf döngü zamanlayıcılarını temizler

export function getExerciseVariants(item, kind) {
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
      tips: [item.formCue, `Salon İpucu: ${item.gymTip}`],
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
      tips: [alt.formCue, `Salon İpucu: ${alt.gymTip}`],
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

// Bilimsel kaynaklar ve basın uyarlama notları bölümünü üretir

// Yerel saat dilimine göre YYYY-MM-DD tarih dizesini döndürür (gece UTC kaymasını önler)
export function getTodayIsoDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// localStorage'dan set günlüklerini okur
export function loadWorkoutLogs() {
  try {
    const raw = window.localStorage.getItem(WORKOUT_LOGS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

// Belirli hareket ve set için ağırlık/tekrar kaydını localStorage'a kaydeder
export function saveSetLogEntry(exerciseId, setNum, kgVal, repsVal) {
  const logs = loadWorkoutLogs();
  const today = getTodayIsoDate();
  const entry = logs[exerciseId] || { sessions: [] };
  const sessions = Array.isArray(entry.sessions) ? [...entry.sessions] : [];

  let todaySession = sessions.find((s) => s.date === today);
  if (!todaySession) {
    todaySession = { date: today, sets: {} };
    sessions.push(todaySession);
    sessions.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    // En fazla son 12 seansı sakla
    if (sessions.length > 12) {
      sessions.splice(0, sessions.length - 12);
    }
  }

  todaySession.sets = todaySession.sets || {};
  todaySession.sets[String(setNum)] = {
    kg: kgVal === "" ? "" : Number(kgVal),
    reps: repsVal === "" ? "" : Number(repsVal),
  };

  logs[exerciseId] = { sessions };
  try {
    window.localStorage.setItem(WORKOUT_LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // Depolama kotası veya gizli sekme engelinde sessizce devam et
  }
}

// Hareketin bugünkü ve bir önceki seanstaki set değerlerini döndürür
export function getExerciseSetHistory(exerciseId) {
  const logs = loadWorkoutLogs();
  const entry = logs[exerciseId];
  const sessions = Array.isArray(entry?.sessions) ? entry.sessions : [];
  const today = getTodayIsoDate();
  const todaySession = sessions.find((s) => s.date === today) || null;
  const previousSessions = sessions.filter((s) => s.date !== today);
  const previousSession =
    previousSessions.length > 0 ? previousSessions[previousSessions.length - 1] : null;
  return { todaySession, previousSession };
}

// Haftalık bel & kilo kayıtlarını okur
export function loadBodyLogs() {
  try {
    const raw = window.localStorage.getItem(BODY_LOGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item) =>
          item &&
          item.date &&
          Number.isFinite(Number(item.waistCm)) &&
          Number.isFinite(Number(item.weightKg))
      )
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  } catch {
    return [];
  }
}

// Haftalık bel & kilo kayıtlarını kaydeder
export function saveBodyLogs(logs) {
  try {
    window.localStorage.setItem(BODY_LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // Depolama erişilemiyorsa sessizce atla
  }
}

// Bel ve kilo geçmişi için duyarlı SVG trend grafiği üretir

export function loadStoredProfile() {
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? { ...DEFAULT_PROFILE, ...parsed, isCustom: true }
      : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

// Kullanıcı profilini yalnızca localStorage'a güvenli biçimde kaydeder
export function saveStoredProfile(profile) {
  try {
    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ ...profile, isCustom: true })
    );
    return true;
  } catch {
    return false;
  }
}

// Kişisel profil verisini sıfırlar
export function clearStoredProfile() {
  try {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch {
    // localStorage kullanılamıyorsa sessizce atla
  }
}

// Aktif profil hedeflerini hesaplayıp döndürür
export function getActiveProfileTargets() {
  return calculateProfileTargets(loadStoredProfile());
}

import { scaleMealPlanForProfile } from "./nutrition.js";

export { scaleMealPlanForProfile };

// Profil formunu mevcut veya örnek değerlerle doldurur
export function syncProfileForm(profileTargets) {
  if (!elements.profileForm) return;
  const fieldNames = [
    "sex",
    "age",
    "heightCm",
    "weightKg",
    "bodyFatPct",
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
  const muscleInput = elements.profileForm.elements.namedItem("muscleMassKg");
  if (muscleInput) {
    muscleInput.value = profileTargets.hasCustomMuscle ? String(profileTargets.muscleMassKg) : "";
  }
}

// Profilim & hedefler bölümünü render eder

export function getCoreOrCardioItem(itemId) {
  return CORE_LIBRARY[itemId] || (CARDIO_FINISHER.id === itemId ? CARDIO_FINISHER : null);
}

// Antrenman sonu opsiyonel Bitiriş Kardiyosu bölümünü render eder

export function findMatchingVariantIndex(item, kind, normalizedQuery) {
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

export function findExerciseById(exerciseId) {
  for (const day of WORKOUT_DAYS) {
    const found = day.exercises.find((ex) => ex.id === exerciseId);
    if (found) return found;
  }
  return null;
}

// Harici form referansı ("Formu izle"), alternatif seçici ve uygulama ipuçları modalını açar
