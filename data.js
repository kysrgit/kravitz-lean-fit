/**
 * Dosya: data.js
 * Açıklama: Kravitz Lean & Fit antrenman programı, harici MuscleWiki egzersiz bağlantıları (`sourceUrl`),
 * her hareket için 2'şer alternatif egzersiz, 21'ler Core rehberi ve beslenme protokolünü içerir.
 */

export const MUSCLEWIKI_LICENSE_URL = "https://api.musclewiki.com/api-terms";

const EXERCISE_SOURCE_URLS = {
  ab_wheel: "https://musclewiki.com/exercise/roll-outs",
  arnold_press: "https://musclewiki.com/exercise/dumbbell-seated-arnold-press",
  assisted_pullup: "https://musclewiki.com/exercise/machine-assisted-pull-up",
  barbell_bent_over_row: "https://musclewiki.com/exercise/barbell-bent-over-row",
  barbell_curl: "https://musclewiki.com/exercise/barbell-curl",
  barbell_hip_thrust: "https://musclewiki.com/exercise/barbell-hip-thrust",
  barbell_incline_press: "https://musclewiki.com/exercise/barbell-incline-bench-press",
  barbell_overhead_press: "https://musclewiki.com/exercise/barbell-overhead-press",
  bench_dips: "https://musclewiki.com/exercise/bench-dips",
  bicycle_crunch: "https://musclewiki.com/exercise/bodyweight-bicycle-crunch",
  bodyweight_crunch: "https://musclewiki.com/exercise/bodyweight-crunch",
  bodyweight_lunges: "https://musclewiki.com/exercise/bodyweight-forward-lunge",
  bodyweight_pushup: "https://musclewiki.com/exercise/push-up",
  bulgarian_split_squat: "https://musclewiki.com/exercise/dumbbell-bulgarian-split-squat",
  cable_bayesian_curl: "https://musclewiki.com/exercise/cable-bayesian-curl",
  cable_crossover: "https://musclewiki.com/exercise/cable-pec-fly",
  cable_crunch: "https://musclewiki.com/exercise/cable-rope-kneeling-crunch",
  cable_hammer_curl: "https://musclewiki.com/exercise/cable-hammer-curl",
  cable_lateral_raise: "https://musclewiki.com/exercise/cable-low-single-arm-lateral-raise",
  cable_woodchopper: "https://musclewiki.com/exercise/cable-woodchopper",
  db_overhead_triceps: "https://musclewiki.com/exercise/dumbbell-overhead-tricep-extension",
  db_romanian_deadlift: "https://musclewiki.com/exercise/dumbbell-romanian-deadlift",
  dead_bug: "https://musclewiki.com/exercise/dead-bug",
  decline_crunch: "https://musclewiki.com/exercise/bodyweight-situp",
  dumbbell_bicep_curl: "https://musclewiki.com/exercise/dumbbell-curl",
  dumbbell_calf_raise: "https://musclewiki.com/exercise/dumbbell-calf-raise",
  dumbbell_chest_fly: "https://musclewiki.com/exercise/dumbbell-chest-fly",
  dumbbell_lateral_raise: "https://musclewiki.com/exercise/dumbbell-lateral-raise",
  dumbbell_leg_curl: "https://musclewiki.com/exercise/dumbbell-leg-curl",
  dumbbell_rear_delt_fly: "https://musclewiki.com/exercise/dumbbell-rear-delt-fly",
  face_pull: "https://musclewiki.com/exercise/machine-face-pulls",
  farmers_walk: "https://musclewiki.com/exercise/kettlebell-farmers-carry",
  goblet_squat: "https://musclewiki.com/exercise/dumbbell-goblet-squat",
  hack_squat: "https://musclewiki.com/exercise/machine-hack-squat",
  hanging_leg_raise: "https://musclewiki.com/exercise/hanging-knee-raises",
  incline_db_press: "https://musclewiki.com/exercise/dumbbell-incline-bench-press",
  incline_hammer_curl: "https://musclewiki.com/exercise/dumbbell-incline-hammer-curl",
  incline_walk: "https://musclewiki.com/exercise/treadmill-walk",
  kettlebell_swing: "https://musclewiki.com/exercise/kettlebell-swing",
  leg_press: "https://musclewiki.com/exercise/leg-press",
  lying_leg_curl: "https://musclewiki.com/exercises/hamstrings",
  lying_leg_raise: "https://musclewiki.com/exercise/laying-leg-raises",
  machine_chest_press: "https://musclewiki.com/exercise/machine-chest-press",
  machine_pec_fly: "https://musclewiki.com/exercise/machine-pec-fly",
  mountain_climbers: "https://musclewiki.com/exercise/mountain-climber",
  pallof_press: "https://musclewiki.com/exercise/cable-pallof-press-rotation",
  plank: "https://musclewiki.com/exercise/hand-plank",
  plank_pullthrough: "https://musclewiki.com/exercise/dumbbell-plank-pullthrough",
  renegade_row_pushup: "https://musclewiki.com/exercise/dumbbell-renegade-row",
  reverse_crunch: "https://musclewiki.com/exercise/reverse-crunch-kick-up",
  reverse_fly_machine: "https://musclewiki.com/exercise/machine-reverse-fly",
  romanian_deadlift: "https://musclewiki.com/exercise/barbell-romanian-deadlift",
  rope_triceps_pushdown: "https://musclewiki.com/exercise/cable-cross-pushdown",
  russian_twist: "https://musclewiki.com/exercise/dumbbell-russian-twist",
  seated_cable_row: "https://musclewiki.com/exercise/seated-cable-row",
  seated_calf_raise: "https://musclewiki.com/exercise/machine-seated-calf-raises",
  seated_db_shoulder_press: "https://musclewiki.com/exercise/dumbbell-seated-overhead-press",
  seated_leg_curl: "https://musclewiki.com/exercise/machine-seated-leg-curl",
  single_arm_db_row: "https://musclewiki.com/exercise/dumbbell-single-arm-row",
  standing_calf_raise: "https://musclewiki.com/exercise/machine-standing-calf-raises",
  standing_hammer_curl: "https://musclewiki.com/exercise/dumbbell-hammer-curl",
  stomach_vacuum: "https://musclewiki.com/exercises/abdominals",
  straight_arm_pulldown: "https://musclewiki.com/exercise/cable-bent-over-bar-pullover",
  underhand_pulldown: "https://musclewiki.com/exercise/machine-underhand-pulldown",
  walking_lunges: "https://musclewiki.com/exercise/dumbbell-forward-lunge",
  wide_grip_lat_pulldown: "https://musclewiki.com/exercise/machine-pulldown",
};

// Yardımcı fonksiyon: Egzersizin dış kaynak form sayfası bağlantısını ve lisans bilgisini döndürür.
// Üçüncü taraf video/görseller telif ve lisans uyumu nedeniyle bu repoda barındırılmaz.
export function getExerciseMedia(keyOrItem) {
  const isObj = keyOrItem && typeof keyOrItem === "object";
  const videoKey = isObj ? keyOrItem.videoKey : keyOrItem;
  const directSourceUrl = isObj ? keyOrItem.sourceUrl : null;
  const sourceUrl =
    directSourceUrl ||
    (videoKey ? EXERCISE_SOURCE_URLS[videoKey] || "https://musclewiki.com/" : null);

  return {
    sourceUrl,
    licenseUrl: MUSCLEWIKI_LICENSE_URL,
    frontMp4: null,
    sideMp4: null,
    frontImg: null,
    sideImg: null,
  };
}

// Varsayılan anonim örnek profil (Kullanıcı kendi verisini tarayıcıdaki "Profilim" formundan girer; yalnızca localStorage'da saklanır)
export const DEFAULT_PROFILE = {
  isCustom: false,
  age: 28,
  weightKg: 80,
  bodyFatPct: 18,
  muscleMassKg: 62,
  bmrKcal: 1800,
  waistCm: 86,
  activityMultiplier: 1.45,
  targetBodyFatPct: 12,
  targetStyle: "Atletik & Fit Silüet (Lean / Fit Vücut)",
};

// Profil verilerinden hedef kilo, tahmini TDEE, günlük kalori ve protein hedeflerini hesaplar
export function calculateProfileTargets(profile = DEFAULT_PROFILE) {
  const safe = { ...DEFAULT_PROFILE, ...(profile || {}) };
  const age = Math.max(16, Math.min(85, Number(safe.age) || DEFAULT_PROFILE.age));
  const weightKg = Math.max(40, Math.min(200, Number(safe.weightKg) || DEFAULT_PROFILE.weightKg));
  const bodyFatPct = Math.max(
    5,
    Math.min(55, Number(safe.bodyFatPct) || DEFAULT_PROFILE.bodyFatPct)
  );
  const muscleMassKg = Math.max(
    25,
    Math.min(120, Number(safe.muscleMassKg) || DEFAULT_PROFILE.muscleMassKg)
  );
  const bmrKcal = Math.max(1000, Math.min(3500, Number(safe.bmrKcal) || DEFAULT_PROFILE.bmrKcal));
  const waistCm = Math.max(55, Math.min(160, Number(safe.waistCm) || DEFAULT_PROFILE.waistCm));
  const activityMultiplier = Math.max(
    1.2,
    Math.min(2.0, Number(safe.activityMultiplier) || DEFAULT_PROFILE.activityMultiplier)
  );
  const targetBodyFatPct = Math.max(
    8,
    Math.min(30, Number(safe.targetBodyFatPct) || DEFAULT_PROFILE.targetBodyFatPct)
  );

  const leanMassKg = Number((weightKg * (1 - bodyFatPct / 100)).toFixed(1));
  const fatMassKg = Number((weightKg - leanMassKg).toFixed(1));
  const targetWeightKg = Number((leanMassKg / (1 - targetBodyFatPct / 100)).toFixed(1));
  const estimatedTdeeKcal = Math.round(bmrKcal * activityMultiplier);
  const rawDeficit = Math.round(estimatedTdeeKcal * 0.18);
  const targetCalories = Math.max(
    bmrKcal,
    Math.round((estimatedTdeeKcal - Math.max(300, Math.min(550, rawDeficit))) / 10) * 10
  );
  const proteinTargetG = Math.round(weightKg * 2.0);

  return {
    ...safe,
    isCustom: Boolean(safe.isCustom),
    age,
    weightKg,
    bodyFatPct,
    muscleMassKg,
    bmrKcal,
    waistCm,
    activityMultiplier,
    targetBodyFatPct,
    leanMassKg,
    fatMassKg,
    targetWeightKg,
    estimatedTdeeKcal,
    targetCalories,
    proteinTargetG,
    biaMeasurementNote:
      "Ana ilerleme ölçütün bel mezurasıdır. BIA cihazındaki vücut su yüzdesi yağ oranı düştükçe zaten yükselir ve akut hidrasyona, son öğüne veya egzersize karşı çok duyarlıdır; bu yüzden ölçümleri her zaman aynı standart koşulda (ör. sabah aç karnına) yap.",
    metrics: [
      {
        label: "Bel Çevresi (Birincil Ana Metrik)",
        current: `${waistCm.toFixed(0)} cm`,
        target: "İstikrarlı Düşüş (Mezura)",
        note: "Tartı veya tek günlük BIA yerine haftada 1 kez sabah aç karnına aynı noktadan ölç.",
        highlight: true,
      },
      {
        label: "Mevcut → Hedef Kilo",
        current: `${weightKg.toFixed(1)} kg`,
        target: `~${targetWeightKg.toFixed(1)} kg`,
        note: "Kas kütlesini koruyarak kademeli yağ kaybı (genel öneri)",
        highlight: false,
      },
      {
        label: "Vücut Yağ Oranı (BIA Tahmini)",
        current: `%${bodyFatPct.toFixed(1)} (${fatMassKg.toFixed(1)} kg)`,
        target: `%${targetBodyFatPct.toFixed(0)}`,
        note: "BIA hidrasyona duyarlıdır; aynı koşulda (sabah aç) uzun vadeli trende bak",
        highlight: false,
      },
      {
        label: "Kas Kütlesi / Yağsız Kütle",
        current: `${muscleMassKg.toFixed(1)} kg`,
        target: "Mevcudu Koru",
        note: `Günlük ~${proteinTargetG} g protein (~2 g/kg, genel öneri) ile desteklenir`,
        highlight: false,
      },
      {
        label: "BMR & Kalori Hedefi",
        current: `${bmrKcal} kcal BMR`,
        target: `${targetCalories} kcal/gün`,
        note: `Tahmini TDEE: ${estimatedTdeeKcal} kcal (Çarpan: ${activityMultiplier})`,
        highlight: false,
      },
      {
        label: "Haftalık Hız (Genel Öneri)",
        current: `%${(0.5).toFixed(1)} - %1,0 / hafta`,
        target: `${(weightKg * 0.005).toFixed(2)} - ${(weightKg * 0.01).toFixed(2)} kg`,
        note: safe.isCustom
          ? "Kayıtlı profiline göre haftalık %0,5-1 hedef aralığı"
          : "Örnek veri (kendi verini Profilim formundan girebilirsin)",
        highlight: false,
      },
    ],
  };
}

// Kanita dayali uyarlama ve basili kaynak listesi
export const SCIENTIFIC_SOURCES = [
  {
    topic: "Bölgesel Yağ Yakımı (Spot Reduction)",
    citation: "Ramirez-Campillo R. ve ark., Human Movement 2022;23. DOI: 10.5114/hm.2022.110373",
    note: "Karın veya tek bölge egzersizleri bölgesel yağ yakımı sağlamaz; toplam enerji açığı gerekir.",
  },
  {
    topic: "Aralıklı Oruç ve Sürekli Kalori Kısıtlaması",
    citation: "Semnani-Azad Z. ve ark., BMJ 2025;389:e082007. DOI: 10.1136/bmj-2024-082007",
    note: "Benzer kalori açığında aralıklı oruç ile standart öğün düzeni benzer kilo ve yağ kaybı sonuçları verir.",
  },
  {
    topic: "Set Arası Dinlenme Süreleri",
    citation:
      "Schoenfeld B.J. ve ark., J Strength Cond Res 2016;30(7):1805-12. DOI: 10.1519/JSC.0000000000001272",
    note: "Ağır ve bileşik egzersizlerde yeterli set arası dinlenme kuvvet ve hipertrofi verimini destekler.",
  },
  {
    topic: "Lenny Kravitz / Dodd Romero Basın Şeması Farkları",
    citation:
      'Men\'s Health AU, "The Workout That Keeps Lenny Kravitz Ripped"; Fitbook (2026), "Lenny Kravitz Training & Ernährung"',
    note: "Basın kaynaklarında 50-35-21-14-10 veya 50-25-12-5 set şemaları ve haftada 5-6 gün geçtiği, bilinçli aralıklı oruç uygulanmadığı aktarılır. Bu sitedeki 30-15-10-5 ve 4 günlük plan sürdürülebilir bir uyarlamadır.",
  },
  {
    topic: "Egzersiz Form Sayfaları ve Lisans Şartları",
    citation: "MuscleWiki API Terms (https://api.musclewiki.com/api-terms)",
    note: "Tüm form bağlantıları harici MuscleWiki sayfalarına yönlendirilir; üçüncü taraf medya barındırılmaz.",
  },
];

// Kravitz'ten Esinlenilmiş Uyarlama: 3 temel prensip
export const SYSTEM_PILLARS = [
  {
    badge: "01 · UYARLANMIŞ PİRAMİT",
    title: "30 → 15 → 10 → 5 Tekrar",
    description:
      "Kravitz'ten Esinlenilmiş Uyarlama: Basında (Men's Health AU; Fitbook, 2026) 50-35-21-14-10 / 50-25-12-5 ve haftada 5-6 gün aktarılsa da burada sürdürülebilir 4 günlük 30-15-10-5 uyarlaması uygulanır.",
  },
  {
    badge: "02 · DİNLENME VE CORE PENCERESİ",
    title: "21× Core + Tam Toparlanma",
    description:
      "Bileşik hareketlerde 2-3 dk (150 sn), izolasyonlarda 60-90 sn (75 sn) dinlenme penceresinin başında 21 core yap, kalan sürede dinlenip ağır sete toparlanmış gir (Schoenfeld B.J. ve ark., J Strength Cond Res 2016;30(7):1805-12, DOI: 10.1519/JSC.0000000000001272).",
  },
  {
    badge: "03 · KOT PANTOLON TESTİ",
    title: "45-60 Dk Odaklı Seans",
    description:
      "Basın kaynaklarında Kravitz'in bilinçli aralıklı oruç uygulamadığı belirtilir; buradaki 18:6 / 16:8 pencereleri isteğe bağlıdır. Gelişimi tartıdan çok bel mezurasıyla izle.",
  },
];

// Core / Aktif dinlenme hareketlerinin merkezi kataloğu (her biri 2'şer alternatif hareket içerir)
export const CORE_LIBRARY = {
  hanging_leg_raise: {
    id: "hanging_leg_raise",
    name: "Hanging Leg / Knee Raise",
    turkishName: "Barfikste Asılarak Diz / Bacak Kaldırma",
    target: "Alt Karın & Derin Core",
    reps: "21 Tekrar (3 Set)",
    imageId: "Hanging_Leg_Raise",
    videoKey: "hanging_leg_raise",
    sourceUrl: "https://musclewiki.com/exercise/hanging-knee-raises",
    formCue:
      "Barfikse asıl, sallanmayı durdur. Dizlerini veya düz bacaklarını kalçanı hafifçe yukarı kıvırarak göğsüne çek. Yavaşça indir.",
    macfitTip:
      "Zorlanırsan ilk sette diz bükük (Knee Raise), sonraki setlerde düz bacak yapabilirsin.",
    alternatives: [
      {
        id: "lying_leg_raise_alt",
        name: "Flat Bench Lying Leg Raise",
        turkishName: "Yerde / Sehpada Yatarak Bacak Kaldırma",
        reps: "21 Tekrar (3 Set)",
        whenToUse:
          "Barfiks demiri doluysa, avuçların/ön kolun yorulduysa veya sallanmayı önlemek istediğinde.",
        videoKey: "lying_leg_raise",
        sourceUrl: "https://musclewiki.com/exercise/laying-leg-raises",
        formCue:
          "Sırtüstü yat, eller kalça yanında veya sehpaya sabit. Bel boşluğunu yere bastırarak bacakları kontrollü kaldırıp yere değmeden durdur.",
        macfitTip:
          "İniş fazını 2 saniyeye yaymak alt karındaki gerilimi barfiks kadar yoğun tutar.",
      },
      {
        id: "reverse_crunch_alt",
        name: "Reverse Crunch (Kalça Kıvırma)",
        turkishName: "Ters Mekik (Kalça Yukarı Kıvırma)",
        reps: "21 Tekrar (3 Set)",
        whenToUse:
          "Bacakları düz kaldırırken belin öne açılıyorsa dizler bükülü şekilde saf alt karın için.",
        videoKey: "reverse_crunch",
        sourceUrl: "https://musclewiki.com/exercise/reverse-crunch-kick-up",
        formCue:
          "Dizleri göğse doğru çekip leğen kemiğini hafifçe yerden yukarı kıvır; kontrollü şekilde başlangıç açısına dön.",
        macfitTip: "Bacaklarla ivme almak yerine sadece alt karnını bükerek kalçayı yerden ayır.",
      },
    ],
  },
  cable_crunch: {
    id: "cable_crunch",
    name: "Kneeling Rope Cable Crunch",
    turkishName: "Kablo İp İle Diz Üstü Mekik",
    target: "Üst & Orta Karın Kasları",
    reps: "21 Tekrar (3 Set)",
    imageId: "Cable_Crunch",
    videoKey: "cable_crunch",
    sourceUrl: "https://musclewiki.com/exercise/cable-rope-kneeling-crunch",
    formCue:
      "Halat aparatını şakak hizasında sabitle, kalçanı geriye oynatmadan sadece omurganı bükerek dirseklerini dizlerine yaklaştır.",
    macfitTip:
      "Ağırlığı kollarınla değil, karnını sıkarak aşağı çek; en alt noktada nefesi tamamen boşalt.",
    alternatives: [
      {
        id: "bodyweight_crunch_alt",
        name: "Bodyweight Floor Crunch",
        turkishName: "Yerde Kontrollü Kısa Mekik",
        reps: "21 Tekrar (3 Set)",
        whenToUse:
          "MACFit kablo istasyonu veya halat aparatı yoğun saatte doluysa hiç beklemeden matta uygula.",
        videoKey: "bodyweight_crunch",
        sourceUrl: "https://musclewiki.com/exercise/bodyweight-crunch",
        formCue:
          "Dizler bükülü sırtüstü yat, eller şakaklarda. Belini yerden kaldırmadan sadece kürek kemiklerini yerden ayırıp karnını sık.",
        macfitTip: "Boynundan çekme; çenenle göğsün arasında bir yumruk boşluk kalsın.",
      },
      {
        id: "decline_crunch_alt",
        name: "Sit-Up & Full Crunch",
        turkishName: "Tam Mekik (Sit-Up)",
        reps: "21 Tekrar (3 Set)",
        whenToUse:
          "Daha yüksek tekrarlı nabız artışı ve tüm ön karın duvarını çalıştırmak istediğinde.",
        videoKey: "decline_crunch",
        sourceUrl: "https://musclewiki.com/exercise/bodyweight-situp",
        formCue:
          "Ayaklar yerde sabit, karın kaslarıyla gövdeyi kontrollü şekilde yukarı kaldır ve yavaşça belini yere sererek in.",
        macfitTip: "İnerken kendini yere bırakma; inişin son kısmında karın kasların aktif kalsın.",
      },
    ],
  },
  bicycle_crunch: {
    id: "bicycle_crunch",
    name: "Bicycle Crunch",
    turkishName: "Bisiklet Mekik (Sağ-Sol Toplam 21)",
    target: "Karın & Oblik (Yan Bel)",
    reps: "21 Tekrar (3 Set)",
    imageId: "Air_Bike",
    videoKey: "bicycle_crunch",
    sourceUrl: "https://musclewiki.com/exercise/bodyweight-bicycle-crunch",
    formCue:
      "Sırtüstü yat, eller kulak hizasında (boyundan çekme). Sağ dirseği sol dize yaklaştırırken diğer bacağı yere paralel uzat.",
    macfitTip: "Hızlı ve savurarak değil, her dönüşte 1 saniye karın sıkıştırmasıyla uygula.",
    alternatives: [
      {
        id: "russian_twist_alt",
        name: "Seated Dumbbell Russian Twist",
        turkishName: "Oturarak Gövde Döndürme (Oblik)",
        reps: "21 Tekrar (3 Set)",
        whenToUse: "Yatar pozisyonda boynun gerginleşiyorsa oturarak yan bel kaslarını hedefle.",
        videoKey: "russian_twist",
        sourceUrl: "https://musclewiki.com/exercise/dumbbell-russian-twist",
        formCue:
          "Sırtı dik tutarak gövdeyi 45° geriye yasla, omuz ve göğsü sağa-sola kontrollü döndür.",
        macfitTip: "Başlangıçta ağırlıksız, ilerledikçe 5 kg dambıl veya plaka ile uygula.",
      },
      {
        id: "cable_woodchopper_alt",
        name: "Standing Cable Woodchopper",
        turkishName: "Ayakta Kablo İle Yan Bel Çevirme",
        reps: "21 Tekrar (Her Yön)",
        whenToUse:
          "Yerde mat sermek istemediğinde, kablo makinesinin hemen yanında ayakta devam etmek için.",
        videoKey: "cable_woodchopper",
        sourceUrl: "https://musclewiki.com/exercise/cable-woodchopper",
        formCue:
          "Kabloyu göğüs hizasında tut, ayakları sabitleyip gövdeni yan karın kaslarınla döndür.",
        macfitTip: "Düşük kilo seç, dönüşü kollarınla değil göbek hizandan üret.",
      },
    ],
  },
  plank: {
    id: "plank",
    name: "Forearm Vakumlu Plank",
    turkishName: "Dirsek Üstü İç Karın Vakumlu Plank",
    target: "Transverse Abdominis (İç Korse)",
    reps: "45 Saniye Tutuş",
    imageId: "Plank",
    videoKey: "plank",
    sourceUrl: "https://musclewiki.com/exercise/hand-plank",
    formCue:
      "Dirsekler omuz altında, kalça ne yukarıda ne sarkık. Göbek deliğini omurgaya doğru içeri çekerek tüm gövdeyi kilitle.",
    macfitTip:
      "Belini çukurlaştırmadan kalçanı ve karnını aynı anda sıktığında karın titremeye başlamalı.",
    alternatives: [
      {
        id: "dead_bug_alt",
        name: "Dead Bug (Çapraz Kontrol)",
        turkishName: "Dead Bug (Bel Dostu Core Kilidi)",
        reps: "21 Tekrar (Sağ-Sol)",
        whenToUse:
          "Üst itiş günlerinde omuzların plankta çok yoruluyorsa veya belinde hassasiyet varsa.",
        videoKey: "dead_bug",
        sourceUrl: "https://musclewiki.com/exercise/dead-bug",
        formCue:
          "Sırtüstü yat, beli yere tamamen yapıştır. Sağ kolu geriye uzatırken sol bacağı yere değdirmeden aç ve merkeze dön.",
        macfitTip: "Belinin altına elin girmemeli; tüm hareket boyunca beli zemine mühürle.",
      },
      {
        id: "hollow_hold_alt",
        name: "Hollow Core Hold",
        turkishName: "Hollow Hold (Tam Gövde Kilitleme)",
        reps: "30-45 Saniye Tutuş",
        whenToUse:
          "Standart plank sana kolay gelmeye başladığında iç karın yoğunluğunu 2 katına çıkarmak için.",
        videoKey: "stomach_vacuum",
        sourceUrl: "https://musclewiki.com/exercises/abdominals",
        formCue:
          "Sırtüstü uzan, bel boşluğunu yere bastırıp kolları baş gerisine, bacakları yerden 15 cm yukarıda uzatarak kilitle.",
        macfitTip: "Zorlanırsan dizleri hafifçe bükerek bel temasını koru.",
      },
    ],
  },
  decline_crunch: {
    id: "decline_crunch",
    name: "Sit-Up & Floor Crunch",
    turkishName: "Tam Mekik (Sit-Up) & Karın Sıkıştırma",
    target: "Tüm Karın Duvarı",
    reps: "21 Tekrar (3 Set)",
    imageId: "Decline_Crunch",
    videoKey: "decline_crunch",
    sourceUrl: "https://musclewiki.com/exercise/bodyweight-situp",
    formCue:
      "Ayakları sabitle veya dizleri bük, beli sertçe yere vurmadan karın kaslarınla gövdeyi yukarı kaldırıp kontrollü geri in.",
    macfitTip:
      "MACFit'te eğimli mekik sehpası doluysa veya boşsa düz mat üstünde aynı tempoyla uygula.",
    alternatives: [
      {
        id: "bodyweight_crunch_dc",
        name: "Bodyweight Short Crunch",
        turkishName: "Kısa Mesafe Karın Sıkıştırma",
        reps: "21 Tekrar (3 Set)",
        whenToUse:
          "Tam mekikte kalça önü (hip flexor) yoruluyor veya belin ağrıyorsa saf üst karın için.",
        videoKey: "bodyweight_crunch",
        sourceUrl: "https://musclewiki.com/exercise/bodyweight-crunch",
        formCue:
          "Alt sırt zemine yapışık kalsın; sadece üst gövdeyi 30° kaldırıp tepede 1 saniye karnını sık.",
        macfitTip: "Kalça fleksörlerini devreden çıkarmak için topuklarını kalçana yakın tut.",
      },
      {
        id: "dead_bug_dc",
        name: "Dead Bug (Bel Korumalı Core)",
        turkishName: "Dead Bug — Bel Yükü Olmayan Core",
        reps: "21 Tekrar",
        whenToUse:
          "Eğimli sehpa rahatsız ediyorsa sıfır omurga bükülmesiyle derin karın çalıştırmak için.",
        videoKey: "dead_bug",
        sourceUrl: "https://musclewiki.com/exercise/dead-bug",
        formCue: "Belini mata bastır, ters kol ve bacağı kontrollü nefes vererek uzat.",
        macfitTip: "Her nefes verişte göbek deliğini içine çek.",
      },
    ],
  },
  russian_twist: {
    id: "russian_twist",
    name: "Dumbbell Russian Twist",
    turkishName: "Oturarak Gövde Döndürme (Oblik)",
    target: "Yan Karın & Bel Simidi",
    reps: "21 Tekrar (3 Set)",
    imageId: "Russian_Twist",
    videoKey: "russian_twist",
    sourceUrl: "https://musclewiki.com/exercise/dumbbell-russian-twist",
    formCue:
      "Gövdeyi 45 derece geriye yatır, sırtı dik tut. Topuklar hafifçe havada veya yerde iken göğüs kafesini sağa-sola çevir.",
    macfitTip:
      "Sadece ellerini değil omuzlarını ve göğsünü döndür; ilk sette ağırlıksız, sonra 5 kg dambıl tutabilirsin.",
    alternatives: [
      {
        id: "cable_woodchopper_rt",
        name: "Cable Woodchopper",
        turkishName: "Ayakta Kablo İle Yan Bel Çevirme",
        reps: "21 Tekrar (Her Yön)",
        whenToUse:
          "Oturarak gövde çevirmek belinde batma yaratıyorsa dik omurga pozisyonunda ayakta uygula.",
        videoKey: "cable_woodchopper",
        sourceUrl: "https://musclewiki.com/exercise/cable-woodchopper",
        formCue: "Kabloyu omuz hizasına al, yan dön ve kolları gergin tutup gövdeyle çevir.",
        macfitTip: "Ayak parmak uçların sabit, kalçanı kilitleyip sadece bel üstünü döndür.",
      },
      {
        id: "bicycle_crunch_rt",
        name: "Bicycle Crunch",
        turkishName: "Bisiklet Mekik (Dinamik Oblik)",
        reps: "21 Tekrar (Toplam)",
        whenToUse: "Dambıl veya ek ağırlık olmadan yüksek nabızlı çapraz karın için.",
        videoKey: "bicycle_crunch",
        sourceUrl: "https://musclewiki.com/exercise/bodyweight-bicycle-crunch",
        formCue: "Sırtüstü yat, ters dirseği ters dize yaklaştırırken diğer bacağı tam aç.",
        macfitTip: "Üst karın + yan bel simidini aynı anda vurur.",
      },
    ],
  },
  lying_leg_raise: {
    id: "lying_leg_raise",
    name: "Flat Bench Lying Leg Raise",
    turkishName: "Sehpada / Yerde Yatarak Bacak Kaldırma",
    target: "Alt Karın",
    reps: "21 Tekrar (3 Set)",
    imageId: "Flat_Bench_Lying_Leg_Raise",
    videoKey: "lying_leg_raise",
    sourceUrl: "https://musclewiki.com/exercise/laying-leg-raises",
    formCue:
      "Düz sehpaya veya mata uzan, ellerle sehpanın kenarını tut. Bel boşluğunu yere bastırarak bacakları kontrollü kaldır ve indir.",
    macfitTip: "Topukları yere değdirmeden durdurmak alt karındaki gerilimi kesintisiz tutar.",
    alternatives: [
      {
        id: "reverse_crunch_llr",
        name: "Reverse Crunch Kick-Up",
        turkishName: "Ters Mekik (Dizler Bükülü Kalça Kaldırış)",
        reps: "21 Tekrar (3 Set)",
        whenToUse: "Bacakları düz indirirken alt belin yerden havalanıyorsa bel güvenliği için.",
        videoKey: "reverse_crunch",
        sourceUrl: "https://musclewiki.com/exercise/reverse-crunch-kick-up",
        formCue:
          "Dizler bükülü halde bacakları yukarı kaldırırken kalçanı hafifçe yerden ayırıp kontrollü indir.",
        macfitTip: "Bel açığını kapatmak için diz bükülü versiyon her zaman daha güvenlidir.",
      },
      {
        id: "dead_bug_llr",
        name: "Dead Bug (Kontrollü İndiriş)",
        turkishName: "Dead Bug — Tek Bacaklı Alt Karın Kontrolü",
        reps: "21 Tekrar",
        whenToUse:
          "İki bacağı aynı anda indirmek belini zorluyorsa tek bacakla aynı alt karın gerilimini yakala.",
        videoKey: "dead_bug",
        sourceUrl: "https://musclewiki.com/exercise/dead-bug",
        formCue: "Sırayla bir bacağı yere paralel indirip geri çek; diğer bacak 90° açıda kalsın.",
        macfitTip: "Bel teması bozulduğu an hareketi bir üst açıda durdur.",
      },
    ],
  },
  cable_woodchopper: {
    id: "cable_woodchopper",
    name: "Standing Cable Wood Chop",
    turkishName: "Kablo İle Yan Bel Çevirme (Woodchopper)",
    target: "Oblikler & Gövde Rotasyon Kontrolü",
    reps: "21 Tekrar (Her Yön / 3 Set)",
    imageId: "Standing_Cable_Wood_Chop",
    videoKey: "cable_woodchopper",
    sourceUrl: "https://musclewiki.com/exercise/cable-woodchopper",
    formCue:
      "Kablo makinesini omuz hizasına al, yan dön. Kollar gergin halde kabloyu gövdeni döndürerek karşı tarafa çek.",
    macfitTip: "Düşük kilo seç, kollarla değil yan karın (oblik) kaslarınla dönüşü üret.",
    alternatives: [
      {
        id: "russian_twist_cw",
        name: "Dumbbell Russian Twist",
        turkishName: "Dambıl İle Oturarak Yan Bel Çevirme",
        reps: "21 Tekrar (3 Set)",
        whenToUse: "MACFit kablo istasyonu doluysa tek bir dambılla mat üstünde hemen uygula.",
        videoKey: "russian_twist",
        sourceUrl: "https://musclewiki.com/exercise/dumbbell-russian-twist",
        formCue: "Gövde 45° geride, göğsünü her tekrarda sağa-sola tam döndür.",
        macfitTip: "Dizlerini birbirine yapıştırırsan oblik aktivasyonu daha da artar.",
      },
      {
        id: "plank_pullthrough_cw",
        name: "Dumbbell Plank Pull-Through",
        turkishName: "Plank Pozisyonunda Dambıl Çekme",
        reps: "20 Çekiş (Sağ-Sol)",
        whenToUse:
          "Dönmeyi engelleyen (anti-rotasyon) derin bel kası çalışması yapmak istediğinde.",
        videoKey: "plank_pullthrough",
        sourceUrl: "https://musclewiki.com/exercise/dumbbell-plank-pullthrough",
        formCue:
          "Şınav pozisyonunda tek elle yerdeki dambılı gövdenin altından karşı tarafa çek; kalçan dönmesin.",
        macfitTip: "Ayakları omuzdan biraz geniş açmak kalçayı sabit tutmayı kolaylaştırır.",
      },
    ],
  },
  reverse_crunch: {
    id: "reverse_crunch",
    name: "Reverse Crunch Kick-Up",
    turkishName: "Ters Mekik (Kalça Yukarı Kıvırma)",
    target: "Alt Karın",
    reps: "21 Tekrar (3 Set)",
    imageId: "Reverse_Crunch",
    videoKey: "reverse_crunch",
    sourceUrl: "https://musclewiki.com/exercise/reverse-crunch-kick-up",
    formCue:
      "Sırtüstü yat, bacakları yukarı uzatıp kalçanı kontrollü şekilde yerden kaldırarak alt karnı maksimum sıkıştır.",
    macfitTip: "İvme almak yerine alt karın kasıyla leğen kemiğini yukarı kıvırmaya odaklan.",
    alternatives: [
      {
        id: "lying_leg_raise_rc",
        name: "Lying Leg Raise",
        turkishName: "Yerde Yatarak Bacak Kaldırma",
        reps: "21 Tekrar (3 Set)",
        whenToUse:
          "Kalçayı dikey yukarı kıvırmakta zorlanıyorsan uzun kaldıraçlı alt karın gerilimi için.",
        videoKey: "lying_leg_raise",
        sourceUrl: "https://musclewiki.com/exercise/laying-leg-raises",
        formCue:
          "Eller kalça yanında sabit, bacakları yere değdirmeden yukarı kaldırıp yavaşça indir.",
        macfitTip: "Bacakları yukarıda 90 dereceden geriye kaçırmadan dur.",
      },
      {
        id: "dead_bug_rc",
        name: "Dead Bug",
        turkishName: "Dead Bug (Alt Karın & Postür)",
        reps: "21 Tekrar",
        whenToUse: "Sırt/boyun gerginliğini tamamen sıfırlayarak alt karnı izole etmek için.",
        videoKey: "dead_bug",
        sourceUrl: "https://musclewiki.com/exercise/dead-bug",
        formCue: "Bel boşluğunu zemine bastır, çapraz kol ve bacağı senkronize açıp kapat.",
        macfitTip: "Nefes verirken alt karnın sertleştiğini hisset.",
      },
    ],
  },
  ab_wheel: {
    id: "ab_wheel",
    name: "Ab Wheel Rollout",
    turkishName: "Karın Tekerleği İle İleri Açılış",
    target: "Tüm Ön & Derin Core",
    reps: "21 Tekrar (veya 12-15 Temiz)",
    imageId: "Ab_Roller",
    videoKey: "ab_wheel",
    sourceUrl: "https://musclewiki.com/exercise/roll-outs",
    formCue:
      "Dizlerin üstünde tekerleği tut, kalçayı sık ve sırtı hafif kamburlaştır. Belini çukurlaştırmadan ileri uzanıp karınla geri çek.",
    macfitTip: "Belinde batma hissettiğin an açılma mesafesini kısalt.",
    alternatives: [
      {
        id: "plank_aw",
        name: "Forearm Vakumlu Plank",
        turkishName: "Dirsek Üstü Vakumlu Plank",
        reps: "45 Saniye Tutuş",
        whenToUse:
          "MACFit fonksiyonel alanında karın tekerleği (Ab Roller) yoksa veya belin çukurlaşıyorsa.",
        videoKey: "plank",
        sourceUrl: "https://musclewiki.com/exercise/hand-plank",
        formCue: "Dirsekler omuz altında, kalçayı sıkarak tüm ön karnı kilitle ve sabit kal.",
        macfitTip: "Dirsekleri ayak uçlarına doğru çekiyormuş gibi izometrik güç uygula.",
      },
      {
        id: "plank_pullthrough_aw",
        name: "Dumbbell Plank Pull-Through",
        turkishName: "Plank İle Dambıl Kaydırma",
        reps: "20 Çekiş",
        whenToUse:
          "Tekerlek yerine serbest dambıl kullanarak derin karın dayanıklılığı kurmak için.",
        videoKey: "plank_pullthrough",
        sourceUrl: "https://musclewiki.com/exercise/dumbbell-plank-pullthrough",
        formCue: "Plank pozisyonunda dambılı göğüs altından yana çek ve kalçayı oynatma.",
        macfitTip: "Hafif-orta (5-7.5 kg) dambıl bu hareket için idealdir.",
      },
    ],
  },
  mountain_climbers: {
    id: "mountain_climbers",
    name: "Mountain Climbers",
    turkishName: "Dağ Tırmanışı (Her Bacak 21)",
    target: "Core + Kardiyo Yağ Yakımı",
    reps: "21 Tekrar (Her Bacak)",
    imageId: "Mountain_Climbers",
    videoKey: "mountain_climbers",
    sourceUrl: "https://musclewiki.com/exercise/mountain-climber",
    formCue:
      "Şınav pozisyonunda eller omuz altında. Kalçayı zıplatmadan sırayla dizleri hızla göğse çek.",
    macfitTip: "Nefesini tutma, ritmik ve hızlı tempoyla nabzı yukarı taşı.",
    alternatives: [
      {
        id: "bicycle_crunch_mc",
        name: "Bicycle Crunch",
        turkishName: "Bisiklet Mekik (Eklemsiz Nabız)",
        reps: "21 Tekrar (Her Yön)",
        whenToUse:
          "El bileklerin veya omuzların ağırlık setlerinden yorulduysa yükü üst gövdeden almak için.",
        videoKey: "bicycle_crunch",
        sourceUrl: "https://musclewiki.com/exercise/bodyweight-bicycle-crunch",
        formCue: "Sırtüstü yat ve seri ama kontrollü biçimde çapraz diz-dirsek teması kur.",
        macfitTip: "Bacakları tam uzatarak nabzı ve karın yanmasını aynı seviyede tut.",
      },
      {
        id: "dead_bug_mc",
        name: "Dead Bug (Tempolu)",
        turkishName: "Dead Bug (Bilek Dostu Core)",
        reps: "21 Tekrar",
        whenToUse: "Bilek hassasiyetinde veya zıplama/darbe istemediğin günlerde.",
        videoKey: "dead_bug",
        sourceUrl: "https://musclewiki.com/exercise/dead-bug",
        formCue: "Sırtüstü bel sabit, ters kol-bacak değişimini akıcı tempoda uygula.",
        macfitTip: "Nefes kontrolünü hiç bozmadan tempoyu belirle.",
      },
    ],
  },
  stomach_vacuum: {
    id: "stomach_vacuum",
    name: "Stomach Vacuum & Hollow Core Hold",
    turkishName: "Sabah Mide Vakumu & İç Karın Kilitleme",
    target: "Transversus Abdominis (TVA Kontrolü & Postür)",
    reps: "Her Sabah 5 Set × 20 Saniye",
    imageId: "Stomach_Vacuum",
    videoKey: "stomach_vacuum",
    sourceUrl: "https://musclewiki.com/exercises/abdominals",
    formCue:
      "Sabah aç karnına nefesi boşaltıp derin karın kasını (Transversus Abdominis - TVA) içeri çekerek izometrik aktivasyon sağla; matta Hollow Hold ile gövde stabilitesini pekiştir.",
    macfitTip:
      "Amaç bölgesel yağ yakmak değil; postür farkındalığı ve derin karın kası (TVA) nöromüsküler kontrolü geliştirmektir.",
    alternatives: [
      {
        id: "dead_bug_sv",
        name: "Dead Bug (Bel Bastırma & Vakum)",
        turkishName: "Dead Bug (Nefes Kontrollü İç Korse)",
        reps: "21 Tekrar",
        whenToUse:
          "Hollow Hold sırasında bel boşluğun yerden havalanıyorsa beli koruyarak iç karını sıkmak için.",
        videoKey: "dead_bug",
        sourceUrl: "https://musclewiki.com/exercise/dead-bug",
        formCue: "Dizler 90° havada beli yere mühürle, nefes vererek çapraz uzan.",
        macfitTip: "Her nefes verişte karnını içine doğru çekerek vakum etkisi yarat.",
      },
      {
        id: "plank_sv",
        name: "Vakumlu Forearm Plank",
        turkishName: "Dirsek Üstü Vakumlu Plank",
        reps: "45 Saniye Tutuş",
        whenToUse:
          "Sırtüstü yerine yüzüstü yerçekimine karşı göbek deliğini yukarı çekmek istediğinde.",
        videoKey: "plank",
        sourceUrl: "https://musclewiki.com/exercise/hand-plank",
        formCue: "Dirsekler üstünde dur, göbeğini yukarı omurgaya doğru vakumlayıp tut.",
        macfitTip: "Nefesini kesmeden küçük burun nefesleriyle tutuşu sürdür.",
      },
    ],
  },
  dead_bug: {
    id: "dead_bug",
    name: "Dead Bug (Anti-Extension Core)",
    turkishName: "Dead Bug — Bel Koruyucu Çapraz Uzatma",
    target: "Derin Core (TVA) & Lomber Stabilite (Kavrama Gerektirmez)",
    reps: "21 Tekrar (Alternatif Bacak-Kol)",
    imageId: "Dead_Bug",
    videoKey: "dead_bug",
    sourceUrl: "https://musclewiki.com/exercise/dead-bug",
    formCue:
      "Sırtüstü yatıp bel boşluğunu mindere bastır. Nefes vererek karşı kol ve bacağı kontrollü uzat; kavrama kaslarını dinlendirir.",
    macfitTip:
      "Romanian Deadlift veya Row gibi kavramayı yoran hareketlerin set aralarında ideal core eşleşmesidir.",
    alternatives: [
      {
        id: "plank_db",
        name: "Forearm Plank",
        turkishName: "Ön Kol Üstünde İzometrik Plank",
        reps: "45 Saniye Tutuş",
        whenToUse: "Matta yere sırtüstü yatmak istemiyorsan kavrama yormadan devam etmek için.",
        videoKey: "plank",
        sourceUrl: "https://musclewiki.com/exercise/hand-plank",
        formCue: "Dirsekler omuz altında, karın ve kalça sıkı sabit bekle.",
        macfitTip: "Ellerle yumruk sıkmadan ön kolları mindere yasla.",
      },
      {
        id: "reverse_crunch_db",
        name: "Reverse Crunch",
        turkishName: "Ters Mekik (Alt Karın)",
        reps: "21 Tekrar",
        whenToUse: "Çapraz koordinasyon yerine doğrudan alt karın odaklı çalışmak istediğinde.",
        videoKey: "reverse_crunch",
        sourceUrl: "https://musclewiki.com/exercise/reverse-crunch-kick-up",
        formCue: "Kuyruk sokumunu kontrollü şekilde yerden kaldır ve yavaşça indir.",
        macfitTip: "Ellerini kalçanın iki yanında gevşek bırak.",
      },
    ],
  },
  pallof_press: {
    id: "pallof_press",
    name: "Cable Pallof Press (Anti-Rotation)",
    turkishName: "Kabloda Pallof Press — Anti-Rotasyon Core",
    target: "Oblikler & Derin Gövde Stabilitesi",
    reps: "Toplam 21 Tekrar (10-11 Sağ + 10-11 Sol)",
    imageId: "Pallof_Press",
    videoKey: "pallof_press",
    sourceUrl: "https://musclewiki.com/exercise/cable-pallof-press-rotation",
    formCue:
      "Kabloyu göğüs hizasına al, yan dur ve kolları öne düz itip gövdenin dönmesine izin verme.",
    macfitTip:
      "Düşük dirençle hafif tutuş yeterlidir; Straight-Arm Pulldown arasında kavramayı bozmaz.",
    alternatives: [
      {
        id: "dead_bug_pp",
        name: "Dead Bug",
        turkishName: "Dead Bug (Mat Üzeri)",
        reps: "21 Tekrar",
        whenToUse: "Kablo istasyonu meşgulse ek ekipmansız ve tamamen kavramasız devam etmek için.",
        videoKey: "dead_bug",
        sourceUrl: "https://musclewiki.com/exercise/dead-bug",
        formCue: "Bel boşluğunu yere kilitleyip çapraz kol-bacağı yavaşça aç.",
        macfitTip: "Nefesi bacağı uzatırken kontrollü ver.",
      },
      {
        id: "plank_pp",
        name: "Forearm Plank",
        turkishName: "Ön Kol Plank",
        reps: "45 Saniye Tutuş",
        whenToUse: "Sırt/çekiş günlerinde sıfır ön kol yüküyle core stabilitesi sağlamak için.",
        videoKey: "plank",
        sourceUrl: "https://musclewiki.com/exercise/hand-plank",
        formCue: "Bel çukurunu açmadan gövdeyi tek parça tut.",
        macfitTip: "Dirseklerle zemini kendine doğru çekermiş gibi gerilim yarat.",
      },
    ],
  },
};

// Bitiriş Kardiyosu (Core hareketi değildir; antrenman sonunda isteğe bağlı uygulanır)
export const CARDIO_FINISHER = {
  id: "incline_walk",
  name: "Incline Treadmill Walk",
  turkishName: "Yüksek Eğimli Tempolu Yürüyüş",
  target: "Genel Kondisyon & Toplam Enerji Harcaması (Bitiriş Kardiyosu)",
  reps: "10-15 Dakika Finisher (Eğim 10-12 · Hız 5.0-5.5 km/s)",
  imageId: "Walking_Treadmill",
  videoKey: "incline_walk",
  sourceUrl: "https://musclewiki.com/exercise/treadmill-walk",
  formCue:
    "Koşu bandının ön barlarına tutunmadan dik dur. Adımlarını kalçadan iterek at ve burundan kontrollü nefes al.",
  macfitTip:
    "Bu çalışma bir core egzersizi değildir; antrenman bittikten sonra toplam günlük enerji harcamasını artırmak için ayrı bitiriş kardiyosu olarak uygulanır.",
  alternatives: [
    {
      id: "mountain_climbers_iw",
      name: "Mountain Climbers Finisher",
      turkishName: "Dağ Tırmanışı (Bitiriş Kondisyonu)",
      reps: "4 Tur × 21/Bacak (30 sn Ara)",
      whenToUse: "MACFit'te koşu bantları doluysa mat alanında kondisyon bitirişi yapmak için.",
      videoKey: "mountain_climbers",
      sourceUrl: "https://musclewiki.com/exercise/mountain-climber",
      formCue: "Plank pozisyonunda seri diz çekişlerle tempolu kondisyon çalışması yap.",
      macfitTip: "Her turun ardından 20-30 saniye ayakta derin nefeslen.",
    },
    {
      id: "goblet_squat_iw",
      name: "Tempo Dumbbell Goblet Squat",
      turkishName: "Hafif Dambıl İle Yüksek Tekrar Squat",
      reps: "3 Set × 20-25 Tekrar (45 sn Ara)",
      whenToUse: "Kardiyo alanına geçemiyorsan dambıl alanında metabolik bitiriş uygulamak için.",
      videoKey: "goblet_squat",
      sourceUrl: "https://musclewiki.com/exercise/dumbbell-goblet-squat",
      formCue: "Göğüste hafif-orta dambıl tut, kesintisiz ve akıcı tempoda çömelip kalk.",
      macfitTip: "Büyük bacak kasları antrenman sonu toplam enerji harcamasını artırır.",
    },
  ],
};

// Yaşam tarzı bileşenleri (adım, uyku) ve antrenman öncesi ısınma protokolü (genel öneri)
export const LIFESTYLE_AND_WARMUP = {
  dailySteps: {
    title: "Günlük Adım Hedefi (Genel Öneri)",
    target: "8.000 – 10.000 adım / gün",
    description:
      "Başlangıç düzeyine göre 6.000-7.000 adımdan kademeli artırılabilir; salon dışındaki enerji harcamasını destekler (genel öneri).",
  },
  sleep: {
    title: "Uyku & Toparlanma (Genel Öneri)",
    target: "7 – 9 saat / gece",
    description:
      "Düzenli 7-9 saat uyku kas toparlanmasını, antrenman performansını ve günlük iştah yönetimini destekler (genel öneri).",
  },
  warmupProtocol: {
    title: "Antrenman Öncesi Isınma Protokolü (Genel Öneri)",
    summary: "5 dk genel ısınma + dinamik eklem mobilitesi + harekete özel 1. ısınma seti",
    steps: [
      "5 dakika genel ısınma: koşu bandı hafif tempolu yürüyüş veya sabit bisiklet",
      "2-3 dakika dinamik mobilite: omuz rotasyonları, band pull-apart ve kalça esnetme",
      "Harekete özel ısınma: her ana hareketin '1. Set (Isınma Seti)' basamağıyla hafif kiloda teknik prova",
    ],
  },
};

// Çift ilerleme ve deload kuralı (genel öneri)
export const PROGRESSION_MODEL = {
  title: "Çift İlerleme Kuralı & 4-6 Haftalık Deload (Genel Öneri)",
  doubleProgression:
    "Çalışma setlerinde (2., 3. ve 4. set) hedef tekrar sayısına form bozulmadan art arda 2 antrenman ulaşırsan, bir sonraki seansta yükü %2,5 - %5 artır (genel öneri).",
  deloadRule:
    "Her 4-6 haftada bir 1 hafta planlı deload (toparlanma haftası) uygula: toplam set sayısını %30-40 azalt veya çalışma ağırlıklarını %10-15 düşür (genel öneri).",
  warmupNote:
    "1. Set (Isınma Seti) yük artışı hesabına katılmaz; yalnızca eklem hazırlığı ve teknik provadır.",
};

// Haftada 3 gün gidenler için her kası haftada en az 2 kez çalıştıran alternatif şablonlar
export const THREE_DAY_TEMPLATES = {
  intro:
    "Haftada 3 gün salona gidiyorsan 4 günlük bölünmüş planın 4. günü düşer ve bazı kas grupları haftada 1 kez uyarılır. 3 günlük haftalarda her kas grubunu haftada en az 2 kez çalıştırmak için aşağıdaki iki şablondan birini kullan (genel öneri):",
  templates: [
    {
      id: "full-body-aba",
      name: "Şablon A · Full-Body A / B / A (Pazartesi – Çarşamba – Cuma)",
      frequencyNote: "Her kas grubu haftada 3 kez uyarılır (≥2×/hafta).",
      days: [
        "1. Gün (Pzt · Full-Body A): Incline DB Press, Seated Cable Row, Leg Press, Lateral Raise, Dumbbell Bicep Curl + Set arası 21× Core",
        "2. Gün (Çar · Full-Body B): Seated DB Shoulder Press, Wide-Grip Lat Pulldown, Romanian Deadlift, Seated Leg Curl, Rope Triceps Pushdown + Kavramasız Core (Dead Bug / Plank)",
        "3. Gün (Cum · Full-Body A2): Barbell/Machine Chest Press, Single-Arm/Cable Row, Walking Lunges, Face Pull, Incline Hammer Curl + Bitiriş Kardiyosu",
      ],
    },
    {
      id: "upper-lower-full",
      name: "Şablon B · Üst / Alt / Full-Body (Pazartesi – Çarşamba – Cuma)",
      frequencyNote: "Üst ve alt vücut dahil her büyük kas grubu haftada 2 kez uyarılır.",
      days: [
        "1. Gün (Pzt · Üst Vücut): Incline DB Press, Wide-Grip Lat Pulldown, Seated DB Shoulder Press, Seated Cable Row, Face Pull",
        "2. Gün (Çar · Alt Vücut): Leg Press, Romanian Deadlift (ara dinlenme Dead Bug), Walking Lunges, Seated Leg Curl, Standing Calf Raise",
        "3. Gün (Cum · Full-Body): Kettlebell Swing, Cable Crossover, Straight-Arm Pulldown (ara dinlenme Pallof Press), Lateral Raise, Dumbbell Bicep Curl + Bitiriş Kardiyosu",
      ],
    },
  ],
};

// Haftalık 4 günlük MACFit antrenman programı (her ana harekete özel 2 alternatif dahil)
export const WORKOUT_DAYS = [
  {
    id: "day-1",
    tabLabel: "1. Gün",
    shortTitle: "Üst İtiş & V-Taper",
    fullTitle: "1. GÜN: Üst Vücut İtiş & V-Taper (Göğüs + Omuz + Triceps)",
    duration: "45 - 55 Dakika",
    targetGoal:
      "Omuzları genişletip göğsü şekillendirerek belin optik olarak çok daha dar ('Spider-Man' silüeti) görünmesini sağlamak.",
    scheduleNote:
      "4 Günlük Plan: Pazartesi · 3 Günlük Gidişlerde: Aşağıdaki Full-Body A / Üst Vücut şablonunu uygula",
    exercises: [
      {
        id: "incline-db-press",
        restSeconds: 150,
        order: 1,
        name: "Incline Dumbbell Press",
        turkishName: "Eğimli Sehpada Dambıl Göğüs İtiş",
        muscleGroup: "Üst Göğüs & Ön Omuz",
        equipment: "30° Eğimli Sehpa + Dambıl",
        imageId: "Incline_Dumbbell_Press",
        videoKey: "incline_db_press",
        sourceUrl: "https://musclewiki.com/exercise/dumbbell-incline-bench-press",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "30 Tekrar", load: "Çok Hafif (Isınma & Kan Pompalama)" },
          { set: 2, reps: "15 Tekrar", load: "Orta Ağırlık" },
          { set: 3, reps: "10 Tekrar", load: "Zorlayıcı Ağırlık" },
          { set: 4, reps: "5 Tekrar", load: "Ağır / Kusursuz Form" },
        ],
        coreRestId: "hanging_leg_raise",
        coreRestLabel: "Set Arası Aktif Dinlenme: 21× Hanging Leg / Knee Raise (3 Set)",
        tips: [
          "Sehpa açısını 30 dereceye ayarla (45 derecede yük omuza kayar).",
          "Dambılları indirirken dirseklerini gövdeye 45° açıda tut, göğüs hizasına kadar indir.",
          "İlk 30 tekrar setinde kasın ısınmasını hisset, ağır 5 tekrarda patlayıcı it.",
        ],
        alternatives: [
          {
            id: "incline-db-press-alt-1",
            name: "Incline Barbell Bench Press",
            turkishName: "Eğimli Sehpada Bar İle Üst Göğüs İtiş",
            equipment: "Eğimli Sehpa + Olimpik Bar",
            whenToUse:
              "İstediğin ağırlıktaki dambıllar doluysa veya ağır 5 tekrarlık sette dengeyi daha kolay kurmak istediğinde.",
            videoKey: "barbell_incline_press",
            sourceUrl: "https://musclewiki.com/exercise/barbell-incline-bench-press",
            tips: [
              "Barı köprücük kemiğinin 2-3 parmak altına kontrollü indir ve göğsü kilitle.",
              "Omuz genişliğinden bir karış açık tutuşla bileklerini dik tut.",
            ],
          },
          {
            id: "incline-db-press-alt-2",
            name: "Machine Chest Press",
            turkishName: "Makinede Oturarak Göğüs İtiş",
            equipment: "MACFit Chest Press Makinesi",
            whenToUse:
              "Serbest ağırlık sehpaları tamamen doluysa veya tek başına güvenli şekilde tükenişe gitmek istediğinde.",
            videoKey: "machine_chest_press",
            sourceUrl: "https://musclewiki.com/exercise/machine-chest-press",
            tips: [
              "Koltuk yüksekliğini tutamaklar orta göğüs hizana gelecek şekilde ayarla.",
              "Omuzlarını geride sehpaya bastırarak itişi tamamen göğüste tut.",
            ],
          },
        ],
      },
      {
        id: "seated-db-shoulder-press",
        restSeconds: 150,
        order: 2,
        name: "Seated Dumbbell Shoulder Press",
        turkishName: "Oturarak Dambıl Omuz Press",
        muscleGroup: "Ön & Yan Omuz",
        equipment: "Dik Sehpa + Dambıl",
        imageId: "Dumbbell_Shoulder_Press",
        videoKey: "seated_db_shoulder_press",
        sourceUrl: "https://musclewiki.com/exercise/dumbbell-seated-overhead-press",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "30 Tekrar", load: "Hafif Ağırlık" },
          { set: 2, reps: "15 Tekrar", load: "Orta Ağırlık" },
          { set: 3, reps: "10 Tekrar", load: "Orta-Ağır" },
          { set: 4, reps: "5 Tekrar", load: "Ağır Kilogram" },
        ],
        coreRestId: "cable_crunch",
        coreRestLabel: "Set Arası Aktif Dinlenme: 21× Cable Crunch (3 Set)",
        tips: [
          "Sırtını sehpaya tam yasla, belini aşırı çukurlaştırmamak için karnını sık.",
          "Dambılları tepe noktada birbirine çarpmadan kontrollü durdur.",
        ],
        alternatives: [
          {
            id: "seated-db-shoulder-alt-1",
            name: "Seated Dumbbell Arnold Press",
            turkishName: "Oturarak Dambıl Arnold Press",
            equipment: "Dik Sehpa + Hafif-Orta Dambıl",
            whenToUse:
              "Ön ve yan omuz ekleminde sıkışma hissediyorsan veya daha düşük kiloyla maksimum yanma arıyorsan.",
            videoKey: "arnold_press",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-seated-arnold-press",
            tips: [
              "Başlangıçta avuç içleri sana dönük olsun, yukarı iterken bilekleri dışa doğru çevir.",
              "Rotasyon sayesinde omuzun hem ön hem yan başı tek harekette ateşlenir.",
            ],
          },
          {
            id: "seated-db-shoulder-alt-2",
            name: "Standing Barbell Overhead Press",
            turkishName: "Ayakta Bar İle Omuz Press (OHP)",
            equipment: "Olimpik Bar + Squat Rack",
            whenToUse:
              "Dik sehpalar boş değilse hem omuz hem derin karın korseni çalıştırmak için.",
            videoKey: "barbell_overhead_press",
            sourceUrl: "https://musclewiki.com/exercise/barbell-overhead-press",
            tips: [
              "Kalçanı ve karnını sık, belini geriye yaslamadan barı baş üstüne düz çizgide it.",
              "Bar yüzünden geçerken kafanı hafif geriye çek, üstte koltuk altlarını ileri aç.",
            ],
          },
        ],
      },
      {
        id: "dumbbell-lateral-raise",
        restSeconds: 75,
        order: 3,
        name: "Dumbbell Lateral Raise",
        turkishName: "Dambıl Yana Açış (V-Taper Anahtarı)",
        muscleGroup: "Yan Omuz (Deltoid)",
        equipment: "Dambıl",
        imageId: "Side_Lateral_Raise",
        videoKey: "dumbbell_lateral_raise",
        sourceUrl: "https://musclewiki.com/exercise/dumbbell-lateral-raise",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "35 Tekrar", load: "Çok Hafif (2.5 - 4 kg)" },
          { set: 2, reps: "20 Tekrar", load: "Hafif-Orta" },
          { set: 3, reps: "15 Tekrar", load: "Orta Ağırlık" },
          { set: 4, reps: "10 Tekrar", load: "Kontrollü Ağır (Omuz güvenliği için min 10)" },
        ],
        coreRestId: "bicycle_crunch",
        coreRestLabel: "Set Arası Aktif Dinlenme: 21× Bicycle Crunch (Sağ-Sol Toplam 21)",
        tips: [
          "Yan omuz eklemini korumak için bu harekette 5 tekrara inme; minimum 10 tekrarda kal.",
          "Dambılları yukarı değil, odanın iki yan duvarına doğru uzatarak kaldır.",
        ],
        alternatives: [
          {
            id: "lateral-raise-alt-1",
            name: "Single-Arm Cable Lateral Raise",
            turkishName: "Kablo İle Tek Kol Yana Açış",
            equipment: "Cable İstasyonu (En Alt Makara)",
            whenToUse:
              "Hareketin her milimetresinde sabit gerilim istediğinde veya hafif dambıl bulamadığında.",
            videoKey: "cable_lateral_raise",
            sourceUrl: "https://musclewiki.com/exercise/cable-low-single-arm-lateral-raise",
            tips: [
              "Makarayı bilek hizasına indir, boş elinle makine direğini tutup gövdeni sabit tut.",
              "Kabloyu önünden veya arkandan geçirerek yan omzu tamamen izole et.",
            ],
          },
          {
            id: "lateral-raise-alt-2",
            name: "Bent-Over Dumbbell Rear/Side Fly",
            turkishName: "Öne Eğilerek Dambıl Omuz Açış",
            equipment: "Dambıl",
            whenToUse:
              "Yan omuza ek olarak arka omuz yuvarlaklığını da vurgulayıp duruşunu dikleştirmek istediğinde.",
            videoKey: "dumbbell_rear_delt_fly",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-rear-delt-fly",
            tips: [
              "Kalçadan öne eğil, sırtı düz tut ve dambılları dirseklerinle dışa süpür.",
              "Kürek kemiklerini sıkmaktan ziyade elleri yan duvarlara uzatmaya odaklan.",
            ],
          },
        ],
      },
      {
        id: "cable-crossover",
        restSeconds: 75,
        order: 4,
        name: "Cable Crossover / Fly",
        turkishName: "Kablo İle Göğüs Sıkıştırma",
        muscleGroup: "Göğüs İç Çizgi & Dış Hat",
        equipment: "MACFit Cable İstasyonu",
        imageId: "Cable_Crossover",
        videoKey: "cable_crossover",
        sourceUrl: "https://musclewiki.com/exercise/cable-pec-fly",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "30 Tekrar", load: "Hafif" },
          { set: 2, reps: "15 Tekrar", load: "Orta" },
          { set: 3, reps: "10 Tekrar", load: "Zorlayıcı" },
        ],
        coreRestId: "plank",
        coreRestLabel: "Set Arası Aktif Dinlenme: 45 Saniye Vakumlu Plank",
        tips: [
          "Bir adım öne çık, göğsünü dik tut ve dirseklerdeki hafif bükülmeyi sabit tut.",
          "Ellerini göğüs önünde birleştirirken 1 saniye sıkıştır.",
        ],
        alternatives: [
          {
            id: "cable-crossover-alt-1",
            name: "Machine Pec Deck Fly",
            turkishName: "Pec Deck (Kelebek) Göğüs Sıkıştırma",
            equipment: "MACFit Pec Fly Makinesi",
            whenToUse:
              "Çiftli kablo istasyonu yoğun saatlerde doluysa oturduğun yerden aynı açıyla göğsü izole et.",
            videoKey: "machine_pec_fly",
            sourceUrl: "https://musclewiki.com/exercise/machine-pec-fly",
            tips: [
              "Tutamaklar omuzundan yukarıda olmasın; göğüs ortası hizasına otur.",
              "Kolları geriye omuzları aşırı esnetmeyecek kadar açıp önde birleştir.",
            ],
          },
          {
            id: "cable-crossover-alt-2",
            name: "Flat Dumbbell Chest Fly",
            turkishName: "Düz Sehpada Dambıl Göğüs Açış",
            equipment: "Düz Sehpa + Dambıl",
            whenToUse:
              "Kablo ve kelebek makinesinin ikisi de meşgulse dambıl alanında hızlı çözüm için.",
            videoKey: "dumbbell_chest_fly",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-chest-fly",
            tips: [
              "Büyük bir ağaca sarılır gibi kolları geniş yay çizerek aç, dirsekleri kilitleme.",
              "Dambılları yukarıda birbirine vurmadan göğüs hizasında sıkıştırarak dur.",
            ],
          },
        ],
      },
      {
        id: "rope-triceps-pushdown",
        restSeconds: 75,
        order: 5,
        name: "Cable Triceps Pushdown",
        turkishName: "Kablo İle Arka Kol İtiş",
        muscleGroup: "Triceps (3 Baş)",
        equipment: "Cable + Düz Bar veya İp",
        imageId: "Triceps_Pushdown_-_Rope_Attachment",
        videoKey: "rope_triceps_pushdown",
        sourceUrl: "https://musclewiki.com/exercise/cable-cross-pushdown",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "35 Tekrar", load: "Hafif" },
          { set: 2, reps: "20 Tekrar", load: "Orta" },
          { set: 3, reps: "12 Tekrar", load: "Orta-Ağır" },
          { set: 4, reps: "6 Tekrar", load: "Ağır" },
        ],
        coreRestId: "hanging_leg_raise",
        coreRestLabel: "Set Arası Aktif Dinlenme: 21× Hanging Knee Raise (Bitirici)",
        tips: [
          "Dirseklerini kaburgalarına yapıştır ve hareket boyunca öne-arkaya oynatma.",
          "En alt noktada kolları tamamen düzleyip arka kolu 1 saniye kas.",
        ],
        alternatives: [
          {
            id: "triceps-pushdown-alt-1",
            name: "Dumbbell Overhead Triceps Extension",
            turkishName: "Baş Üstü Dambıl Arka Kol Uzatma",
            equipment: "Tek Ağır Dambıl",
            whenToUse:
              "Kablo sırası beklemek istemediğinde ve arka kolun uzun başını tam esnetmek istediğinde.",
            videoKey: "db_overhead_triceps",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-overhead-tricep-extension",
            tips: [
              "Tek dambılı iki elinle başının arkasından kontrollü indirip tavana kilitle.",
              "Dirseklerin yanlara aşırı açılmasına izin verme, başa yakın tut.",
            ],
          },
          {
            id: "triceps-pushdown-alt-2",
            name: "Bench Triceps Dips",
            turkishName: "Sehpada Arka Kol Dips",
            equipment: "Düz Sehpa (Vücut Ağırlığı)",
            whenToUse:
              "Hiçbir ekipman boş değilse sadece bir sehpa kenarıyla yüksek tekrar pump almak için.",
            videoKey: "bench_dips",
            sourceUrl: "https://musclewiki.com/exercise/bench-dips",
            tips: [
              "Sırtını sehpaya çok yakın indir, dirsekler 90° bükülene kadar inip arka kolla it.",
              "Zorlaştırmak istersen ayaklarını ileri uzatabilirsin.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "day-2",
    tabLabel: "2. Gün",
    shortTitle: "Alt Vücut & Metabolik",
    fullTitle: "2. GÜN: Atletik Alt Vücut & Metabolik Ateşleme (Bacak + Kalça + Core)",
    duration: "50 - 60 Dakika",
    targetGoal:
      "Vücudundaki en büyük kas grubu olan alt vücut kaslarını çalıştırarak kuvvet, iş kapasitesi ve genel enerji harcamasını artırmak.",
    scheduleNote: "4 Günlük Plan: Salı/Çarşamba · 3 Günlük Plan: Full-Body B veya Alt Vücut",
    exercises: [
      {
        id: "leg-press",
        restSeconds: 150,
        order: 1,
        name: "Leg Press",
        turkishName: "Leg Press (Bacak İtiş)",
        muscleGroup: "Ön Bacak (Quadriceps) & Kalça",
        equipment: "MACFit Leg Press Makinesi",
        imageId: "Leg_Press",
        videoKey: "leg_press",
        sourceUrl: "https://musclewiki.com/exercise/leg-press",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "30 Tekrar", load: "Hafif (Diz & Kalça Isındırma)" },
          { set: 2, reps: "15 Tekrar", load: "Orta Plaka" },
          { set: 3, reps: "10 Tekrar", load: "Yüksek Plaka" },
          { set: 4, reps: "5 Tekrar", load: "Ağır & Kontrollü İniş" },
        ],
        coreRestId: "decline_crunch",
        coreRestLabel: "Set Arası Aktif Dinlenme: 21× Sit-Up / Mekik (3 Set)",
        tips: [
          "En üst noktada dizlerini tamamen kilitleme, hafif kırık bırak.",
          "Aşağı inerken kalçan sehpadan kalkmasın; gücü topuklarından iterek üret.",
        ],
        alternatives: [
          {
            id: "leg-press-alt-1",
            name: "Machine Hack Squat",
            turkishName: "Hack Squat Makinesi",
            equipment: "MACFit Hack Squat",
            whenToUse:
              "Leg Press doluysa veya beli destekleyerek ön bacağı daha derin çalıştırmak istediğinde.",
            videoKey: "hack_squat",
            sourceUrl: "https://musclewiki.com/exercise/machine-hack-squat",
            tips: [
              "Belini pedle tam bütünleştir, topukları kaldırmadan dizlerin yönünde derinleş.",
              "Yine piramit 30-15-10-5 düzeniyle kası yanana kadar uygula.",
            ],
          },
          {
            id: "leg-press-alt-2",
            name: "Dumbbell Goblet Squat",
            turkishName: "Göğüste Dambıl İle Squat",
            equipment: "Tek Ağır Dambıl / Kettlebell",
            whenToUse:
              "Tüm bacak makineleri sıradaysa dambıl alanında metabolizmayı hızlandıran serbest hareket için.",
            videoKey: "goblet_squat",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-goblet-squat",
            tips: [
              "Dambılı göğsüne yapıştır, dirsekler diz içlerine doğru çömel ve topuklardan iterek kalk.",
              "Gövdeni dik tuttuğun için core ve bacak aynı anda çalışır.",
            ],
          },
        ],
      },
      {
        id: "romanian-deadlift",
        restSeconds: 150,
        order: 2,
        name: "Barbell Romanian Deadlift (RDL)",
        turkishName: "Bar İle Romen Deadlift (Arka Bacak & Kalça)",
        muscleGroup: "Arka Bacak (Hamstring) & Kalça",
        equipment: "Olimpik Bar",
        imageId: "Romanian_Deadlift",
        videoKey: "romanian_deadlift",
        sourceUrl: "https://musclewiki.com/exercise/barbell-romanian-deadlift",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "25 Tekrar", load: "Hafif (Form Provası)" },
          { set: 2, reps: "15 Tekrar", load: "Orta Ağırlık" },
          { set: 3, reps: "10 Tekrar", load: "Zorlayıcı Ağırlık" },
          { set: 4, reps: "6 Tekrar", load: "Ağır Kilogram" },
        ],
        coreRestId: "dead_bug",
        coreRestLabel: "Set Arası Aktif Dinlenme: 21× Dead Bug (Kavrama Gerektirmez)",
        tips: [
          "Sırtını tamamen düz kilitle, barı bacaklarına sürtercesine yakın indir.",
          "Eğilmek için belini bükme; kalçanı geriye iterek arka bacağındaki gerilmeyi hisset.",
        ],
        alternatives: [
          {
            id: "rdl-alt-1",
            name: "Dumbbell Romanian Deadlift",
            turkishName: "Dambıl İle Romen Deadlift",
            equipment: "Çift Dambıl",
            whenToUse:
              "Olimpik bar veya rack alanı boş değilse dambıllarla kalçaya daha rahat ağırlık merkezi kurmak için.",
            videoKey: "db_romanian_deadlift",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-romanian-deadlift",
            tips: [
              "Dambılları bacak önünden değil yan-ön çaprazda sürterek kaval kemiği ortasına kadar indir.",
              "Arka bacakta gerilme zirveye çıktığında kalçayı öne iterek doğrul.",
            ],
          },
          {
            id: "rdl-alt-2",
            name: "Barbell Hip Thrust",
            turkishName: "Sehpada Kalça İtiş (Hip Thrust)",
            equipment: "Düz Sehpa + Bar (veya Hip Thrust Makinesi)",
            whenToUse:
              "Belinde hafif yorgunluk varsa bel yükünü azaltıp doğrudan kalça ve arka zinciri patlatmak için.",
            videoKey: "barbell_hip_thrust",
            sourceUrl: "https://musclewiki.com/exercise/barbell-hip-thrust",
            tips: [
              "Kürek kemiklerinin alt ucu sehpaya dayalı olsun, tepe noktada kalçayı 1 saniye sertçe sık.",
              "Çeneni hafif göğse yakın tutarak belini aşırı kavisleme.",
            ],
          },
        ],
      },
      {
        id: "walking-lunges",
        restSeconds: 150,
        order: 3,
        name: "Dumbbell Forward / Walking Lunges",
        turkishName: "Dambıl İle İleri Adım / Yürüyen Lunge",
        muscleGroup: "Bacak, Kalça & Denge",
        equipment: "Dambıl",
        imageId: "Dumbbell_Lunges",
        videoKey: "walking_lunges",
        sourceUrl: "https://musclewiki.com/exercise/dumbbell-forward-lunge",
        pyramidSets: [
          {
            set: 1,
            isWarmup: true,
            reps: "20 Tekrar",
            load: "Vücut Ağırlığı / Hafif (Her Bacak 10)",
          },
          { set: 2, reps: "12 Tekrar", load: "Orta Dambıl (Her Bacak 6)" },
          { set: 3, reps: "8 Tekrar", load: "Ağır Dambıl (Her Bacak 8)" },
        ],
        coreRestId: "russian_twist",
        coreRestLabel: "Set Arası Aktif Dinlenme: 21× Russian Twist (3 Set)",
        tips: [
          "Adımını çok dar atma; öndeki dizin parmak ucunu aşırı geçmesin, gövde dik kalsın.",
          "Alt vücut kas kuvveti ve kalça stabilitesi için yüksek metabolik iş yükü sunar.",
        ],
        alternatives: [
          {
            id: "lunges-alt-1",
            name: "Dumbbell Bulgarian Split Squat",
            turkishName: "Arka Ayak Sehpada Tek Bacak Squat",
            equipment: "Düz Sehpa + Dambıl",
            whenToUse:
              "Salonda yürümek için boş koridor yoksa tek bir sehpa başında bacak ve kalçayı yakmak için.",
            videoKey: "bulgarian_split_squat",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-bulgarian-split-squat",
            tips: [
              "Arka ayağın üstünü sehpaya koy, gövdeyi hafif öne verip ön topuktan güç alarak kalk.",
              "Önce zayıf bacağınla başla, iki bacağa da eşit tekrar yap.",
            ],
          },
          {
            id: "lunges-alt-2",
            name: "Bodyweight Forward Lunges",
            turkishName: "Ağırlıksız Yerinde Lunge",
            equipment: "Ekipmansız",
            whenToUse:
              "Bacakların çok yorulduğunda veya dizlerinde hafif hassasiyet varsa yüksek tempolu form için.",
            videoKey: "bodyweight_lunges",
            sourceUrl: "https://musclewiki.com/exercise/bodyweight-forward-lunge",
            tips: [
              "Elleri göğüs önünde birleştirip denge kur, arka dizi yere hafifçe yaklaştırıp ön topukla it.",
              "Kesintisiz akıcı tempo nabzını yüksek tutar.",
            ],
          },
        ],
      },
      {
        id: "seated-leg-curl",
        restSeconds: 75,
        order: 4,
        name: "Seated Leg Curl",
        turkishName: "Oturarak Arka Bacak Bükme",
        muscleGroup: "Arka Bacak (Hamstring)",
        equipment: "MACFit Seated Leg Curl",
        imageId: "Seated_Leg_Curl",
        videoKey: "seated_leg_curl",
        sourceUrl: "https://musclewiki.com/exercise/machine-seated-leg-curl",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "30 Tekrar", load: "Hafif" },
          { set: 2, reps: "15 Tekrar", load: "Orta" },
          { set: 3, reps: "10 Tekrar", load: "Zorlayıcı" },
        ],
        coreRestId: "plank",
        coreRestLabel: "Set Arası Aktif Dinlenme: 45 Saniye Plank",
        tips: [
          "Üst kilit pedinin diz üstü bacaklarını sımsıkı sabitlediğinden emin ol.",
          "Aşağı çekerken patlayıcı, yukarı bırakırken 2 saniyede kontrollü bırak.",
        ],
        alternatives: [
          {
            id: "seated-curl-alt-1",
            name: "Lying Leg Curl Machine",
            turkishName: "Yatarak Arka Bacak Bükme Makinesi",
            equipment: "MACFit Lying Leg Curl",
            whenToUse: "MACFit şubende oturarak model yoksa veya Seated Leg Curl makinesi doluysa.",
            videoKey: "lying_leg_curl",
            sourceUrl: "https://musclewiki.com/exercises/hamstrings",
            tips: [
              "Kalçanı pedden kaldırmadan topuklarını kalçana doğru çek ve zirvede 1 sn sık.",
              "Kontrollü iniş arka bacak sıkılaşmasını 2 kat artırır.",
            ],
          },
          {
            id: "seated-curl-alt-2",
            name: "Dumbbell Lying Leg Curl",
            turkishName: "Sehpada Dambıl İle Arka Bacak Bükme",
            equipment: "Düz Sehpa + Tek Dambıl",
            whenToUse:
              "Her iki arka bacak makinesi de sıradaysa sadece bir sehpa ve dambılla izole etmek için.",
            videoKey: "dumbbell_leg_curl",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-leg-curl",
            tips: [
              "Sehpaya yüzüstü uzan, hafif-orta bir dambılı ayak tabanlarının arasına sıkıştırıp topukları kalçaya çek.",
              "Dambılı yere düşürmemek için yavaş ve kontrollü tekrar yap.",
            ],
          },
        ],
      },
      {
        id: "standing-calf-raise",
        restSeconds: 75,
        order: 5,
        name: "Standing Calf Raise + Eğimli Yürüyüş",
        turkishName: "Ayakta Kalf & 10 Dk Yağ Yakım Yürüyüşü",
        muscleGroup: "Kalf & Kardiyovasküler Sistem",
        equipment: "Calf Makinesi + Koşu Bandı",
        imageId: "Standing_Calf_Raises",
        videoKey: "standing_calf_raise",
        sourceUrl: "https://musclewiki.com/exercise/machine-standing-calf-raises",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "30 Tekrar", load: "Hafif" },
          { set: 2, reps: "20 Tekrar", load: "Orta" },
          { set: 3, reps: "12 Tekrar", load: "Ağır (Tepe ve Dipte 1 sn Bekle)" },
        ],
        coreRestId: "reverse_crunch",
        coreRestLabel:
          "Set Arası Aktif Dinlenme: 21× Reverse Crunch (3 Set) + Sonra Bitiriş Kardiyosu",
        tips: [
          "Kalf hareketini zıplayarak değil, topuğu tam aşağı esnetip tam parmak ucuna çıkarak yap.",
          "Hemen ardından koşu bandında tutunmadan 10 dakika eğimli yürüyüşle yağ yakımını kapat.",
        ],
        alternatives: [
          {
            id: "calf-raise-alt-1",
            name: "Seated Calf Raise Machine",
            turkishName: "Oturarak Kalf Kaldırma",
            equipment: "Seated Calf Makinesi",
            whenToUse:
              "Ayakta Calf Raise veya Smith Machine doluysa, alt bacağın Soleus kasını hedeflemek için.",
            videoKey: "seated_calf_raise",
            sourceUrl: "https://musclewiki.com/exercise/machine-seated-calf-raises",
            tips: [
              "Aşil tendonunda tam esneme hissetmek için her tekrarın dibinde 1 saniye dur.",
              "Dizler 90° bükülü olduğu için kalfın alt-dış hattını şekillendirir.",
            ],
          },
          {
            id: "calf-raise-alt-2",
            name: "Dumbbell Standing Calf Raise",
            turkishName: "Elde Dambıl İle Ayakta Kalf",
            equipment: "Çift Dambıl (İsteğe Bağlı Basamak/Plaka)",
            whenToUse:
              "Kalf makinelerinin hiçbiri boş değilse dambıl yanında hemen tamamlamak için.",
            videoKey: "dumbbell_calf_raise",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-calf-raise",
            tips: [
              "Parmak uçlarını bir ağırlık plakasının üstüne koyarsan hareket açıklığı artar.",
              "Sallanmayı önlemek için bir sehpaya tek elle hafif destek alabilirsin.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "day-3",
    tabLabel: "3. Gün",
    shortTitle: "Sırt & Kol (Bruce Lee)",
    fullTitle: "3. GÜN: Bruce Lee Sırt & Kol Detayı (Sırt + Arka Omuz + Biceps)",
    duration: "45 - 55 Dakika",
    targetGoal:
      "Sırt kanatlarını (Lat) açarak bel çevresini daha ince göstermek ve Lenny Kravitz'in 45->5 özel Biceps piramidiyle kolları keskinleştirmek.",
    scheduleNote: "4 Günlük Plan: Perşembe/Cuma · 3 Günlük Plan: Full-Body A2 / Cuma Full-Body",
    exercises: [
      {
        id: "wide-grip-lat-pulldown",
        restSeconds: 150,
        order: 1,
        name: "Wide-Grip Lat Pulldown",
        turkishName: "Geniş Tutuş Kanat Çekiş",
        muscleGroup: "Sırt Genişliği (Latissimus Dorsi)",
        equipment: "Lat Pulldown İstasyonu",
        imageId: "Wide-Grip_Lat_Pulldown",
        videoKey: "wide_grip_lat_pulldown",
        sourceUrl: "https://musclewiki.com/exercise/machine-pulldown",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "30 Tekrar", load: "Hafif (Kanat Aktivasyonu)" },
          { set: 2, reps: "15 Tekrar", load: "Orta Ağırlık" },
          { set: 3, reps: "10 Tekrar", load: "Zorlayıcı Ağırlık" },
          { set: 4, reps: "5 Tekrar", load: "Ağır & Kontrollü" },
        ],
        coreRestId: "lying_leg_raise",
        coreRestLabel: "Set Arası Aktif Dinlenme: 21× Lying Leg Raise (3 Set)",
        tips: [
          "Barı ensene değil, göğsünün üst kısmına doğru çek; omuzlarını kulaklarından uzak tut.",
          "Ellerini bir kanca gibi düşün ve dirseklerini aşağı doğru çekmeye odaklan.",
        ],
        alternatives: [
          {
            id: "lat-pulldown-alt-1",
            name: "Assisted Pull-Up Machine",
            turkishName: "Destekli Barfiks Makinesi",
            equipment: "MACFit Assisted Pull-Up",
            whenToUse:
              "Lat Pulldown doluysa veya kendi vücut ağırlığınla dikey sırt çekişi yapmak istediğinde.",
            videoKey: "assisted_pullup",
            sourceUrl: "https://musclewiki.com/exercise/machine-assisted-pull-up",
            tips: [
              "Destek ağırlığını son sette azaltarak zorlayıcı 5-8 tekrara yaklaş.",
              "Göğsünü bara doğru kaldırıp kürek kemiklerini aşağı bastır.",
            ],
          },
          {
            id: "lat-pulldown-alt-2",
            name: "Underhand (Reverse-Grip) Pulldown",
            turkishName: "Ters (Dar) Tutuş Kanat Çekiş",
            equipment: "Lat Pulldown İstasyonu",
            whenToUse:
              "Omuz önü hassasiyetinde veya alt kanat (lower lats) liflerini daha yoğun vurmak için.",
            videoKey: "underhand_pulldown",
            sourceUrl: "https://musclewiki.com/exercise/machine-underhand-pulldown",
            tips: [
              "Avuç içleri sana baksın, eller omuz genişliğinde olsun.",
              "Dirseklerini kalçana doğru aşağı çek; biceps de ek destek verecektir.",
            ],
          },
        ],
      },
      {
        id: "seated-cable-row",
        restSeconds: 150,
        order: 2,
        name: "Seated Cable Row",
        turkishName: "Oturarak Kablo Sırt Çekiş",
        muscleGroup: "Orta Sırt & Postür",
        equipment: "Seated Row İstasyonu",
        imageId: "Seated_Cable_Rows",
        videoKey: "seated_cable_row",
        sourceUrl: "https://musclewiki.com/exercise/seated-cable-row",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "30 Tekrar", load: "Hafif" },
          { set: 2, reps: "15 Tekrar", load: "Orta" },
          { set: 3, reps: "10 Tekrar", load: "Orta-Ağır" },
          { set: 4, reps: "5 Tekrar", load: "Ağır" },
        ],
        coreRestId: "cable_woodchopper",
        coreRestLabel: "Set Arası Aktif Dinlenme: 21× Cable Woodchopper (Bel Simidi / Oblik)",
        tips: [
          "Gövdeyi aşırı öne-arkaya sallamadan kürek kemiklerini arkada birbirine sıkıştır.",
          "Üst sırt ve omuz kuşağı postürünü dengelemeye yardımcı olur.",
        ],
        alternatives: [
          {
            id: "cable-row-alt-1",
            name: "Single-Arm Dumbbell Row",
            turkishName: "Sehpaya Dayalı Tek Kol Dambıl Row",
            equipment: "Düz Sehpa + Tek Dambıl",
            whenToUse:
              "Seated Row makinesi doluysa veya sağ-sol sırt dengesizliğini gidermek istediğinde.",
            videoKey: "single_arm_db_row",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-single-arm-row",
            tips: [
              "Dambılı göğse doğru değil, kalça cebine doğru yay çizerek çek.",
              "Sırtını masa gibi düz tut, omuzu aşağı serbest bırakıp kürek kemiğini tam çalıştır.",
            ],
          },
          {
            id: "cable-row-alt-2",
            name: "Barbell Bent-Over Row",
            turkishName: "Öne Eğilerek Bar İle Sırt Çekiş",
            equipment: "Olimpik Bar / Z-Bar",
            whenToUse:
              "Tüm kablo ve sırt makineleri meşgulse barla tüm arka zinciri ve sırt kalınlığını vurmak için.",
            videoKey: "barbell_bent_over_row",
            sourceUrl: "https://musclewiki.com/exercise/barbell-bent-over-row",
            tips: [
              "Dizleri hafif bük, gövdeyi ~45° öne eğ ve barı göbek deliğine doğru çek.",
              "Belini kilitlemek için karnını içeride tut.",
            ],
          },
        ],
      },
      {
        id: "face-pull",
        restSeconds: 75,
        order: 3,
        name: "Cable Face Pull",
        turkishName: "Kablo İle Yüze Çekiş (Arka Omuz)",
        muscleGroup: "Arka Omuz & Üst Sırt",
        equipment: "Cable + İp Aparatı",
        imageId: "Face_Pull",
        videoKey: "face_pull",
        sourceUrl: "https://musclewiki.com/exercise/machine-face-pulls",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "30 Tekrar", load: "Hafif" },
          { set: 2, reps: "20 Tekrar", load: "Orta" },
          { set: 3, reps: "15 Tekrar", load: "Orta-Zorlayıcı" },
        ],
        coreRestId: "reverse_crunch",
        coreRestLabel: "Set Arası Aktif Dinlenme: 21× Reverse Crunch (Alt Karın - 3 Set)",
        tips: [
          "Kabloyu göz hizasına ayarla, ipi başparmakların geriye bakacak şekilde alnına/kulak hizana çek.",
          "Omuzları geriye açarak Bruce Lee tarzı atletik üst vücut duruşunu oturtur.",
        ],
        alternatives: [
          {
            id: "face-pull-alt-1",
            name: "Rear Delt Reverse Fly Machine",
            turkishName: "Makinede Ters Kelebek (Arka Omuz)",
            equipment: "MACFit Reverse Fly (Pec Deck Ters)",
            whenToUse:
              "Kablo halatı doluysa kelebek makinesine ters oturarak aynı arka omuz hedefini vur.",
            videoKey: "reverse_fly_machine",
            sourceUrl: "https://musclewiki.com/exercise/machine-reverse-fly",
            tips: [
              "Göğsünü pede daya, dirsekleri omuz hizasında tutarak kolları geriye doğru aç.",
              "Trapezleri sıkmadan sadece arka omuz başlarıyla hareket et.",
            ],
          },
          {
            id: "face-pull-alt-2",
            name: "Bent-Over Dumbbell Rear Delt Fly",
            turkishName: "Eğilerek Dambıl Arka Omuz Açış",
            equipment: "Hafif Dambıl (3-6 kg)",
            whenToUse:
              "Kablo veya makine boş değilse düşük dambıllarla her yerde uygulanabilen alternatif.",
            videoKey: "dumbbell_rear_delt_fly",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-rear-delt-fly",
            tips: [
              "Hafif ağırlık seç ki ivme almadan arka omuzların 30-15 tekrarda tam yansın.",
              "Hareketi durdurmadan akıcı ve kontrollü uygula.",
            ],
          },
        ],
      },
      {
        id: "dumbbell-bicep-curl",
        restSeconds: 75,
        order: 4,
        name: "Dumbbell Bicep Curl (Kravitz Özel Seti)",
        turkishName: "Dambıl Biceps Curl — Lenny Kravitz Piramidi",
        muscleGroup: "Biceps (Ön Kol)",
        equipment: "Dambıl (4-5 kg'dan 17.5-20 kg'a)",
        imageId: "Dumbbell_Bicep_Curl",
        videoKey: "dumbbell_bicep_curl",
        sourceUrl: "https://musclewiki.com/exercise/dumbbell-curl",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "45 Tekrar", load: "4-5 kg (Tam Lenny Kravitz Pompası)" },
          { set: 2, reps: "20 Tekrar", load: "9-10 kg" },
          { set: 3, reps: "10 Tekrar", load: "12.5-15 kg" },
          { set: 4, reps: "5 Tekrar", load: "17.5-20 kg (Sallanmadan)" },
        ],
        coreRestId: "bicycle_crunch",
        coreRestLabel: "Set Arası Aktif Dinlenme: 21× Bicycle Crunch (3 Set)",
        tips: [
          "Kravitz'ten esinlenilmiş yüksek tekrarlı başlangıç setidir: kontrollü tempoyla kası ısıt.",
          "Dirseklerini bel hizasında sabitle; son 5 tekrarlık ağır sette belinden güç alma.",
        ],
        alternatives: [
          {
            id: "bicep-curl-alt-1",
            name: "Barbell / EZ-Bar Bicep Curl",
            turkishName: "Bar İle Biceps Curl (Kravitz Piramidi)",
            equipment: "Düz Bar veya Z-Bar",
            whenToUse:
              "Aradığın basamaklardaki dambıllar doluysa tek bir bara plaka ekleyerek piramidi sürdür.",
            videoKey: "barbell_curl",
            sourceUrl: "https://musclewiki.com/exercise/barbell-curl",
            tips: [
              "Boş bar (~10-15 kg) veya Z-bar (~7.5 kg) ile 35-45 tekrarla başla, plaka takarak 5 tekrara in.",
              "Bilek hassasiyetinde Z-bar kavrayışı çok rahattır.",
            ],
          },
          {
            id: "bicep-curl-alt-2",
            name: "Cable Bayesian Bicep Curl",
            turkishName: "Kabloda Arkadan Gergin Biceps Curl",
            equipment: "Cable İstasyonu (Alt Makara)",
            whenToUse:
              "Sabit gerilimle biceps tepe noktasını ve uzun başını ekstra esnetmek istediğinde.",
            videoKey: "cable_bayesian_curl",
            sourceUrl: "https://musclewiki.com/exercise/cable-bayesian-curl",
            tips: [
              "Kablo makinesine arkanı dönüp bir adım öne çık ki kolun gövdenin hafif arkasından başlasın.",
              "Dirseği arkada sabitleyip sadece ön kolu bük.",
            ],
          },
        ],
      },
      {
        id: "incline-hammer-curl",
        restSeconds: 75,
        order: 5,
        name: "Incline Hammer Curl",
        turkishName: "Eğimli Sehpada Çekiç Curl",
        muscleGroup: "Brachialis & Ön Kol (Forearm)",
        equipment: "45° Sehpa + Dambıl",
        imageId: "Incline_Hammer_Curls",
        videoKey: "incline_hammer_curl",
        sourceUrl: "https://musclewiki.com/exercise/dumbbell-incline-hammer-curl",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "25 Tekrar", load: "Hafif" },
          { set: 2, reps: "15 Tekrar", load: "Orta" },
          { set: 3, reps: "8 Tekrar", load: "Ağır" },
        ],
        coreRestId: "plank",
        coreRestLabel: "Set Arası Aktif Dinlenme: 45 Saniye Vakumlu Plank",
        tips: [
          "Avuç içleri birbirine baksın; kollarını tam aşağı sarkıtıp gerilimi hisset.",
          "Tişört içinde ön kol ve biceps ayrımını en keskin gösteren harekettir.",
        ],
        alternatives: [
          {
            id: "hammer-curl-alt-1",
            name: "Standing Dumbbell Hammer Curl",
            turkishName: "Ayakta Dambıl Çekiç Curl",
            equipment: "Sadece Dambıl (Sehpasız)",
            whenToUse:
              "Eğimli sehpa boş değilse veya ayakta biraz daha ağır kilogramlarla çalışmak istediğinde.",
            videoKey: "standing_hammer_curl",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-hammer-curl",
            tips: [
              "Dirseklerini kaburga yanına kilitle, dambılları sallamadan nötr tutuşla omza çek.",
              "İnişte 2 saniyede kontrollü bırakmak ön kol kasını (brachioradialis) güçlendirir.",
            ],
          },
          {
            id: "hammer-curl-alt-2",
            name: "Cable Rope Hammer Curl",
            turkishName: "Kablo İp İle Çekiç Curl",
            equipment: "Cable + İp Aparatı",
            whenToUse:
              "Dambıl rafı kalabalıksa veya pin takarak ağırlıkları 5 saniyede değiştirmek istediğinde.",
            videoKey: "cable_hammer_curl",
            sourceUrl: "https://musclewiki.com/exercise/cable-hammer-curl",
            tips: [
              "Alt makaraya halat tak, başparmaklar yukarı bakacak şekilde çekip tepede 1 sn sık.",
              "Ağırlığı indirdiğinde dirseklerde hafif gerginlik kalsın, tam boşaltma.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "day-4",
    tabLabel: "4. Gün",
    shortTitle: "Full-Body & Kondisyon",
    fullTitle: "4. GÜN: Full-Body Fonksiyonel Kondisyon & Metabolik Antrenman",
    duration: "45 Dakika (Yüksek İş Kapasitesi)",
    targetGoal:
      "Tüm vücut kaslarını birleştirip günlük enerji açığını ve atletik iş kapasitesini desteklemek (yağ kaybı bölgesel egzersizle değil toplam enerji açığıyla gerçekleşir; Ramirez-Campillo R. ve ark., DOI: 10.5114/hm.2022.110373).",
    scheduleNote:
      "4 Günlük Plan: Cumartesi/Pazar (Haftada 3 gün gidilen dönemlerde 3 Günlük Alternatif Şablon seçilir)",
    exercises: [
      {
        id: "kettlebell-swing",
        restSeconds: 150,
        order: 1,
        name: "Kettlebell Swing",
        turkishName: "Kettlebell Savurma (Kalça & Metabolik Patlama)",
        muscleGroup: "Kalça, Arka Bacak, Core & Kondisyon",
        equipment: "Kettlebell (MACFit Fonksiyonel Alan)",
        imageId: "One-Arm_Kettlebell_Swings",
        videoKey: "kettlebell_swing",
        sourceUrl: "https://musclewiki.com/exercise/kettlebell-swing",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "30 Tekrar", load: "10-12 kg (Ritmi Bul)" },
          { set: 2, reps: "20 Tekrar", load: "14-16 kg" },
          { set: 3, reps: "15 Tekrar", load: "16-20 kg" },
          { set: 4, reps: "12 Tekrar", load: "20-24 kg" },
        ],
        coreRestId: "ab_wheel",
        coreRestLabel: "Set Arası Aktif Dinlenme: 21× Ab Wheel Rollout / Plank",
        tips: [
          "Kollarınla kaldırma! Kettlebell'i göğüs hizasına fırlatan şey kalçanı sertçe öne kilitlemendir.",
          "Sırtını düz tut ve tepe noktada karnını sertçe sık.",
        ],
        alternatives: [
          {
            id: "kb-swing-alt-1",
            name: "Dumbbell Goblet Squat (Tempolu)",
            turkishName: "Tempolu Dambıl Goblet Squat",
            equipment: "Tek Dambıl",
            whenToUse:
              "MACFit'te ağır Kettlebell yoksa veya o gün beline dinamik salınım yükü vermek istemiyorsan.",
            videoKey: "goblet_squat",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-goblet-squat",
            tips: [
              "Orta ağırlıkta bir dambılı dik tutup duraksamadan 30-20-15 tekrar tempoda squat yap.",
              "Kalp ritmini Kettlebell Swing kadar hızlı yükseltir.",
            ],
          },
          {
            id: "kb-swing-alt-2",
            name: "Dumbbell Romanian Deadlift",
            turkishName: "Hızlı Romen Deadlift (Arka Zincir)",
            equipment: "Çift Dambıl",
            whenToUse: "Aynı kalça ve arka bacak kas grubunu daha kontrollü tempoyla vurmak için.",
            videoKey: "db_romanian_deadlift",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-romanian-deadlift",
            tips: [
              "Kalçayı geriye it, yukarı çıkarken kalçayı ve karnı sertçe kilitle.",
              "Dinlenmeleri 30 saniyede tutarak metabolik etkiyi koru.",
            ],
          },
        ],
      },
      {
        id: "renegade-row-pushup",
        restSeconds: 150,
        order: 2,
        name: "Alternating Dumbbell Renegade Row",
        turkishName: "Plankta Dambıl Renegade Row (Sırt & Core)",
        muscleGroup: "Sırt, Göğüs & Anti-Rotasyon Core",
        equipment: "2 Adet Altıgen (Hex) Dambıl",
        imageId: "Alternating_Renegade_Row",
        videoKey: "renegade_row_pushup",
        sourceUrl: "https://musclewiki.com/exercise/dumbbell-renegade-row",
        pyramidSets: [
          {
            set: 1,
            isWarmup: true,
            reps: "20 Tekrar (Toplam)",
            load: "Hafif Dambıl (7.5 - 10 kg) · İsteğe Bağlı Arada Şınav",
          },
          { set: 2, reps: "16 Tekrar (Toplam)", load: "Orta Dambıl (12.5 kg)" },
          { set: 3, reps: "12 Tekrar (Toplam)", load: "Ağır Dambıl (15 kg)" },
        ],
        coreRestId: "mountain_climbers",
        coreRestLabel: "Set Arası Aktif Dinlenme: 21× Mountain Climbers (Her Bacak)",
        tips: [
          "Ayaklarını omuz genişliğinden biraz fazla aç ki dambılı çekerken kalçan sağa sola dönmesin.",
          "Dilersen her sağ-sol çekişten sonra 1 şınav ekleyerek göğsü de dahil edebilirsin.",
        ],
        alternatives: [
          {
            id: "renegade-alt-1",
            name: "Bodyweight Strict Push-Up",
            turkishName: "Vücut Ağırlığı İle Şınav (Sıkı Core)",
            equipment: "Ekipmansız",
            whenToUse:
              "Yuvarlak dambıllar bileğini burkuyorsa veya altıgen (Hex) dambıl bulamadıysan.",
            videoKey: "bodyweight_pushup",
            sourceUrl: "https://musclewiki.com/exercise/push-up",
            tips: [
              "Karın ve kalçayı plank gibi sık, göğsü yere yaklaştırıp dirsekleri 45° geriye it.",
              "Yüksek tekrarlarla göğüs + core dayanıklılığını uçurur.",
            ],
          },
          {
            id: "renegade-alt-2",
            name: "Dumbbell Plank Pull-Through",
            turkishName: "Plankta Dambıl Yana Çekme",
            equipment: "Tek Dambıl",
            whenToUse:
              "Sadece 1 dambıl varken aynı anti-rotasyon karın kilidini bilek yükü olmadan yakalamak için.",
            videoKey: "plank_pullthrough",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-plank-pullthrough",
            tips: [
              "Ellerin doğrudan zeminde olsun (bilek daha güvenli), sırayla tek elle dambılı altından karşıya çek.",
              "Gövdenin dönmesine izin verme.",
            ],
          },
        ],
      },
      {
        id: "straight-arm-pulldown",
        restSeconds: 75,
        order: 3,
        name: "Straight-Arm Cable Pulldown",
        turkishName: "Düz Kol Kablo Çekiş (Kanat & Core)",
        muscleGroup: "Alt Kanat & Serratus (Kaburga Çizgisi)",
        equipment: "Cable + Düz Bar veya İp",
        imageId: "Straight-Arm_Pulldown",
        videoKey: "straight_arm_pulldown",
        sourceUrl: "https://musclewiki.com/exercise/cable-bent-over-bar-pullover",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "30 Tekrar", load: "Hafif" },
          { set: 2, reps: "15 Tekrar", load: "Orta" },
          { set: 3, reps: "10 Tekrar", load: "Orta-Ağır" },
        ],
        coreRestId: "pallof_press",
        coreRestLabel:
          "Set Arası Aktif Dinlenme: 21× Cable Pallof Press (10-11/Taraf · Kavrama Yormaz)",
        tips: [
          "Dirsekleri kilitlemeden hafif kırık bırak, kabloyu kalçana doğru çek.",
          "İndirirken karnını sık; kaburga üzerindeki 'serratus' çizgilerini belirginleştirir.",
        ],
        alternatives: [
          {
            id: "straight-arm-alt-1",
            name: "Wide-Grip Lat Pulldown",
            turkishName: "Geniş Tutuş Kanat Çekiş",
            equipment: "Lat Pulldown Makinesi",
            whenToUse:
              "Kablo istasyonu doluysa doğrudan Lat makinesinde yüksek tekrar sırt pompası için.",
            videoKey: "wide_grip_lat_pulldown",
            sourceUrl: "https://musclewiki.com/exercise/machine-pulldown",
            tips: [
              "Hafif-orta kiloyla göğsüne çekip kanatlarda 1 saniye kasılma hisset.",
              "Setler arası beklemeden hemen core hareketine geç.",
            ],
          },
          {
            id: "straight-arm-alt-2",
            name: "Single-Arm Dumbbell Row",
            turkishName: "Tek Kol Dambıl Row",
            equipment: "Dambıl + Sehpa",
            whenToUse:
              "Tüm kablo istasyonları meşgulse kesintisiz tempolu sırt ve kalp atışı için.",
            videoKey: "single_arm_db_row",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-single-arm-row",
            tips: [
              "Sağ kol 15 tekrar bitince hiç dinlenmeden sol kola geç.",
              "Karın korseni sıkı tutarak omurga rotasyonunu sıfırda tut.",
            ],
          },
        ],
      },
      {
        id: "farmers-walk",
        restSeconds: 150,
        order: 4,
        name: "Farmer's Walk (Çiftçi Yürüyüşü)",
        turkishName: "Ağır Kettlebell / Dambıl İle Çiftçi Yürüyüşü",
        muscleGroup: "Derin Core, Kavrama, Omuz & Yağ Yakımı",
        equipment: "2 Adet Ağır Kettlebell veya Dambıl",
        imageId: "Farmers_Walk",
        videoKey: "farmers_walk",
        sourceUrl: "https://musclewiki.com/exercise/kettlebell-farmers-carry",
        pyramidSets: [
          { set: 1, isWarmup: true, reps: "45 Saniye Yürüyüş", load: "Orta-Ağır (2× 20 kg)" },
          { set: 2, reps: "45 Saniye Yürüyüş", load: "Ağır (2× 25 kg)" },
          { set: 3, reps: "45 Saniye Yürüyüş", load: "Maksimum Temiz (2× 27.5-30 kg)" },
        ],
        coreRestId: "plank",
        coreRestLabel: "Set Arası Aktif Dinlenme: 45 Sn Ön Kol Plank (Kavrama Gerektirmez)",
        tips: [
          "Omuzlarını geriye ve aşağı çek, karnını içeri vakumla ve küçük, hızlı adımlarla yürü.",
          "Yorgunlukta gövdeni sağa sola yatırmamak için derin karın kasların aralıksız çalışır.",
        ],
        alternatives: [
          {
            id: "farmers-alt-1",
            name: "Dumbbell Plank Pull-Through",
            turkishName: "Plankta Dambıl Çekme (Alan Gerekmez)",
            equipment: "Tek Dambıl",
            whenToUse:
              "Salon çok kalabalıksa ve ağır ağırlıklarla yürüyecek boş koridor yoksa yerinde aynı core kası için.",
            videoKey: "plank_pullthrough",
            sourceUrl: "https://musclewiki.com/exercise/dumbbell-plank-pullthrough",
            tips: [
              "Şınav pozisyonunda karnı ve kalçayı kilitleyip ağırlığı sağa-sola kontrollü taşı.",
              "Bölgesel bel ve oblik dayanıklılığını zirveye çıkarır.",
            ],
          },
          {
            id: "farmers-alt-2",
            name: "Forearm Vakumlu Plank",
            turkishName: "Dirsek Üstü 60 Sn Vakumlu Plank",
            equipment: "Ekipmansız",
            whenToUse:
              "Ön kol tutuşun önceki günlerden çok yorgunsa tutuş gereksinimi olmadan bel korseni sıkılaştırmak için.",
            videoKey: "plank",
            sourceUrl: "https://musclewiki.com/exercise/hand-plank",
            tips: [
              "Göbeğini omurgaya vakumlayarak 45-60 saniye kusursuz düz çizgiyi koru.",
              "Yürüyüş olmadan benzer derin karın yorgunluğu sağlar.",
            ],
          },
        ],
      },
      {
        id: "stomach-vacuum-card",
        restSeconds: 75,
        order: 5,
        name: "Stomach Vacuum & Hollow Core Hold",
        turkishName: "Mide Vakumu & Hollow Hold (Postür & TVA Kontrolü)",
        muscleGroup: "Transversus Abdominis (Derin Karın & Postür)",
        equipment: "Ekipmansız (Sabah + Antrenman Kapanışı)",
        imageId: "Stomach_Vacuum",
        videoKey: "stomach_vacuum",
        sourceUrl: "https://musclewiki.com/exercises/abdominals",
        pyramidSets: [
          {
            set: 1,
            isWarmup: true,
            reps: "20-30 Sn Tutuş",
            load: "Sabah Aç Karnına / Finisher - Set 1",
          },
          { set: 2, reps: "20-30 Sn Tutuş", load: "Sabah Aç Karnına / Finisher - Set 2" },
          { set: 3, reps: "20-30 Sn Tutuş", load: "Sabah Aç Karnına / Finisher - Set 3" },
          { set: 4, reps: "20-30 Sn Tutuş", load: "Sabah Aç Karnına / Finisher - Set 4" },
          { set: 5, reps: "20-30 Sn Tutuş", load: "Sabah Aç Karnına / Finisher - Set 5" },
        ],
        coreRestId: "dead_bug",
        coreRestLabel:
          "Eşlik Eden Derin Core: 21× Dead Bug (Bel Destekli) + Sonra Bitiriş Kardiyosu",
        tips: [
          "Bölgesel yağ yakmaz; postür farkındalığı ve derin karın kası (Transversus Abdominis - TVA) nöromüsküler kontrolünü güçlendirir (Ramirez-Campillo ve ark., DOI: 10.5114/hm.2022.110373).",
          "Sabah aç karnına nefesi boşaltarak TVA aktivasyonu, salonda Hollow Hold ile gövde stabilitesi çalış.",
        ],
        alternatives: [
          {
            id: "vacuum-card-alt-1",
            name: "Dead Bug (Bel Korumalı İç Karın)",
            turkishName: "Dead Bug (Nefes Kontrollü İç Korse)",
            reps: "21 Tekrar",
            equipment: "Ekipmansız (Mat)",
            whenToUse: "Hollow hold sırasında belin yerden havalanıyor ve bel boşluğun ağrıyorsa.",
            videoKey: "dead_bug",
            sourceUrl: "https://musclewiki.com/exercise/dead-bug",
            tips: [
              "Her çapraz uzanmada tüm nefesini boşaltıp belini yere mühürle.",
              "İç karın kasını zorlamadan ama son derece etkili çalıştırır.",
            ],
          },
          {
            id: "vacuum-card-alt-2",
            name: "Forearm Vakumlu Plank",
            turkishName: "Dirsek Üstü Vakumlu Plank",
            reps: "45 Saniye Tutuş",
            equipment: "Ekipmansız (Mat)",
            whenToUse:
              "Sırtüstü yatmadan veya sabah rutinine ek yüzüstü iç karın çalışması istediğinde.",
            videoKey: "plank",
            sourceUrl: "https://musclewiki.com/exercise/hand-plank",
            tips: [
              "Plank duruşundayken göbeğini yerçekimine ters şekilde omurgaya doğru içeri çek.",
              "Karın kasların yanarken bel çukurunu sıfırda tut.",
            ],
          },
        ],
      },
    ],
  },
];

// Beslenme, makro-kalori dengesi ve porsiyon protokolü verileri
export const NUTRITION_PROTOCOL = {
  summary: {
    targetKcal: 2100,
    trainingDayTargetKcal: 2150,
    restDayTargetKcal: 1975,
    proteinG: 180,
    carbsG: 190,
    fatG: 68,
    calories: "2.100 kcal (Antrenman: 2.150 · Dinlenme: 1.975)",
    protein: "180 g",
    carbs: "190 g (Antrenman: 205 g · Dinlenme: 158 g)",
    fats: "68 g",
    water: "3,0 – 3,5 Litre + 1-2 Maden Suyu",
  },
  fastingWindows: [
    {
      name: "Seçenek A: İsteğe Bağlı Geç Pencere (18:6)",
      window: "İlk Öğün: 14:30 - 15:00  |  Son Öğün: 20:30",
      description:
        "Kalori uyumunu kolaylaştırmak için tercih edilebilen isteğe bağlı zamanlama penceresi; aynı kalori açığında sürekli beslenme düzeniyle benzer kilo kaybı sağlar (Semnani-Azad Z. ve ark., BMJ 2025;389:e082007, DOI: 10.1136/bmj-2024-082007).",
    },
    {
      name: "Seçenek B: İsteğe Bağlı Standart Pencere (16:8)",
      window: "İlk Öğün: 12:30  |  Son Öğün: 20:30",
      description:
        "İş veya okul temposunda öğün sayısını sadeleştirmek için isteğe bağlı zamanlama penceresi. Zorunlu değildir; toplam kalori ve protein sağlandığında standart 3 öğünle eşdeğer sonuç verir (BMJ 2025;389:e082007).",
    },
  ],
  fastedTrainingNote:
    "Sabah aç karnına antrenman tercih edilirse seans sonrası öğünde 25-40 g protein alımı önerilir; gün içine yayılmış normal öğün düzeni de aynı ölçüde geçerlidir (genel öneri).",
  morningFastRules: [
    "Su (oda sıcaklığında veya limonlu)",
    "Şekersiz Sade Kahve (Americano / Filtre / Espresso) — Antrenman öncesi uyanıklığı ve iştah kontrolünü destekleyebilir (genel öneri)",
    "Şekersiz Yeşil Çay veya Sade Maden Suyu",
    "Açlık penceresi tercih edilirse kalori içermeyen içecekler seçilir; sabah aç antrenman yapılırsa sonrasında 25-40 g protein alınır (genel öneri)",
  ],
  dailyMeals: [
    {
      time: "Öğün 1 · 14:00 - 15:00",
      title: "İlk Öğün: Sebzeli Omlet & Yulaf",
      totals: { kcal: 685, protein: 48, carbs: 56, fat: 30 },
      restDayTotals: { kcal: 685, protein: 48, carbs: 56, fat: 30 },
      items: [
        "4 yumurta beyazı (~130 g çiğ) + 2 tam orta yumurta (~100 g çiğ, tavada omlet)",
        "150 g çiğ ıspanak, 1 yeşil biber, 80 g taze mantar + 1 tatlı kaşığı (5 g) sızma zeytinyağı",
        "75 g yarım yağlı lor veya light beyaz peynir (pişmemiş)",
        "65 g (kuru/çiğ ağırlık) yulaf ezmesi + 15 g çiğ badem (VEYA 2 dilim (~70 g) tam buğday ekmeği + 10 g badem)",
      ],
    },
    {
      time: "Öğün 2 · 17:30",
      title: "Antrenman Çevresi Hızlı Yakıt",
      totals: { kcal: 445, protein: 40, carbs: 62, fat: 4 },
      restDayTotals: { kcal: 275, protein: 38, carbs: 22, fat: 4 },
      items: [
        "1,5 ölçek (45 g toz, su ile) Whey Protein Shake",
        "Antrenman günleri: 1 orta boy muz (~120 g soyulmuş) + 3 adet tam pirinç patlağı (~27 g kuru) veya 45 g kuru ağırlık yulaf",
        "Dinlenme günleri: Karbonhidratı düşürmek için pirinç patlağı çıkarılır; yalnızca 1 orta boy yeşil elma (~150 g taze) eklenir",
      ],
    },
    {
      time: "Öğün 3 · 20:00",
      title: "Akşam Protein + Büyük Salata + Ölçülü Karbonhidrat",
      totals: { kcal: 1020, protein: 92, carbs: 87, fat: 34 },
      restDayTotals: { kcal: 1015, protein: 94, carbs: 80, fat: 35 },
      items: [
        "350 g çiğ ağırlık (~260 g pişmiş) derisiz ızgara tavuk göğsü, hindi göğsü veya yağsız dana eti",
        "Büyük Yeşil Salata: 150 g taze roka/marul, 150 g salatalık, 150 g haşlanmış brokoli + 1,5 yemek kaşığı (15 g) sızma zeytinyağı + limon/elma sirkesi",
        "Antrenman günleri: 95 g çiğ/kuru ağırlık (~280 g pişmiş) basmati pirinç, bulgur veya karabuğday",
        "Dinlenme günleri: 75 g çiğ/kuru ağırlık (~220 g pişmiş) basmati pirinç/bulgur + 10 g çiğ ceviz içi",
      ],
    },
  ],
  waistRules: [
    {
      title: "Birincil İlerleme Ölçütü: Bel Mezurası & BIA Şartları",
      text: "İlerlemede birincil gösterge bel ölçüsüdür. BIA'daki su yüzdesi yağ düştükçe doğal olarak yükselir ve akut hidrasyondan çok etkilenir; BIA ölçümünü daima aynı standart koşullarda (sabah aç karnına) yap.",
    },
    {
      title: "Postür & Derin Karın (TVA) Kontrolü + Genel Açık",
      text: "Sabah mide vakumu bölgesel yağ yakımı sağlamaz; postür ve TVA kontrolünü geliştirir. Yağ kaybı toplam enerji açığıyla gerçekleşir (Ramirez-Campillo R. ve ark., Human Movement 2022;23, DOI: 10.5114/hm.2022.110373).",
    },
    {
      title: "Haftalık Kayıp Hızı (%0,5-1) & Kalori Ayarı",
      text: "Aşırı açık kas kaybını artırabilir (genel öneri). 2–3 haftalık bel ölçüsü ve ağırlık ortalamasına göre haftalık %0,5-1 kayıp için kaloriyi ±100-150 kcal ayarla.",
    },
  ],
};
