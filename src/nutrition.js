/**
 * Dosya: src/nutrition.js
 * Açıklama: Mifflin-St Jeor BMR hesaplayıcısı ve yapılandırılmış besin öğelerine dayalı
 * kesin makro/kalori ölçekleme motoru (DOM bağımlılığı yoktur; tarayıcı ve Node testleri tarafından ortak kullanılır).
 */

function roundToStep(value, step = 5, minVal = 0) {
  const safeStep = Math.max(1, Number(step) || 1);
  const rounded = Math.round(Number(value) / safeStep) * safeStep;
  return Math.max(minVal, rounded);
}

// 100 g başına makro değerlerinden kaloriyi (4×Protein + 4×Karbonhidrat + 9×Yağ) tutarlı biçimde hesaplar
function calcMacrosFromGrams(grams, per100) {
  const factor = Math.max(0, Number(grams) || 0) / 100;
  const p = (Number(per100.p) || 0) * factor;
  const c = (Number(per100.c) || 0) * factor;
  const f = (Number(per100.f) || 0) * factor;
  return { p, c, f, kcal: p * 4 + c * 4 + f * 9 };
}

function finalizeMealTotals(raw) {
  const protein = Math.round(raw.p);
  const carbs = Math.round(raw.c);
  const fat = Math.round(raw.f);
  const kcal = Math.round(protein * 4 + carbs * 4 + fat * 9);
  return { kcal, protein, carbs, fat };
}

// Mifflin-St Jeor formülü ile bazal metabolizma hızını (BMR) tahmin eder
export function calculateMifflinBmr({ sex = "male", weightKg, heightCm, age }) {
  const safeWeight = Math.max(40, Math.min(200, Number(weightKg) || 80));
  const safeHeight = Math.max(140, Math.min(220, Number(heightCm) || 178));
  const safeAge = Math.max(16, Math.min(85, Number(age) || 28));
  const offset = sex === "female" ? -161 : 5;
  const raw = 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge + offset;
  return Math.max(950, Math.round(raw / 10) * 10);
}

// Öğün kalemi için okunaklı Türkçe porsiyon satırı üretir
function formatIngredientLine(ing, trainGrams, restGrams) {
  if (trainGrams === 0 && restGrams === 0) return null;

  const formatAmt = (g) => {
    if (ing.unitEquiv && ing.unitGrams) {
      const count = Math.max(1, Math.round((g / ing.unitGrams) * 2) / 2);
      const countStr = String(count).replace(".", ",");
      return `${countStr} ${ing.unitEquiv} (~${g} g${ing.unitSuffix ? ` ${ing.unitSuffix}` : ""})`;
    }
    return `${g} g${ing.unitSuffix ? ` ${ing.unitSuffix}` : ""}`;
  };

  if (trainGrams === restGrams) {
    return `${formatAmt(trainGrams)} ${ing.label}`;
  }
  if (trainGrams > 0 && restGrams === 0) {
    return `Antrenman günleri: ${formatAmt(trainGrams)} ${ing.label}`;
  }
  if (trainGrams === 0 && restGrams > 0) {
    return `Dinlenme günleri: ${formatAmt(restGrams)} ${ing.label}`;
  }
  return `Antrenman: ${formatAmt(trainGrams)} / Dinlenme: ${formatAmt(restGrams)} ${ing.label}`;
}

// Belirli gün modu (antrenman veya dinlenme) için öğünlerdeki besin gramajlarını çözer
function solveDayGrams(dailyMeals, dayTargets, isRest) {
  const flatItems = [];
  dailyMeals.forEach((meal, mealIdx) => {
    (meal.ingredients || []).forEach((ing) => {
      const refG = isRest && ing.restG !== undefined ? ing.restG : ing.baseG;
      flatItems.push({ mealIdx, ing, refG, grams: refG });
    });
  });

  const sumRole = (role, filterFn = () => true) =>
    flatItems.reduce(
      (acc, entry) => {
        if (entry.ing.role !== role || !filterFn(entry)) return acc;
        const m = calcMacrosFromGrams(entry.grams, entry.ing.per100);
        return { p: acc.p + m.p, c: acc.c + m.c, f: acc.f + m.f };
      },
      { p: 0, c: 0, f: 0 }
    );

  const sumBaseRefMacros = (role) =>
    flatItems.reduce(
      (acc, entry) => {
        if (entry.ing.role !== role) return acc;
        const m = calcMacrosFromGrams(entry.refG, entry.ing.per100);
        return { p: acc.p + m.p, c: acc.c + m.c, f: acc.f + m.f };
      },
      { p: 0, c: 0, f: 0 }
    );

  const fixedM = sumBaseRefMacros("fixed");
  const baseProtM = sumBaseRefMacros("protein");
  const baseCarbM = sumBaseRefMacros("carb");
  const baseFatM = sumBaseRefMacros("fat");

  // 1. Ön ölçek tahmini (çapraz makroları dikkate al)
  let cScaleEst = baseCarbM.c > 0 ? Math.max(0.35, (dayTargets.carbsG - fixedM.c) / baseCarbM.c) : 1;
  let fScaleEst = baseFatM.f > 0 ? Math.max(0.2, (dayTargets.fatG - fixedM.f) / baseFatM.f) : 1;

  // 2. Protein kaynaklarını hedef proteine göre ölçekle
  const calcPScale = (cEst, fEst) => {
    const neededProtFromRole = Math.max(
      20,
      dayTargets.proteinG - fixedM.p - baseCarbM.p * cEst - baseFatM.p * fEst
    );
    return baseProtM.p > 0 ? Math.max(0.45, Math.min(2.2, neededProtFromRole / baseProtM.p)) : 1;
  };

  let pScale = calcPScale(cScaleEst, fScaleEst);
  const applyScale = (role, scale) => {
    flatItems.forEach((entry) => {
      if (entry.ing.role !== role || entry.refG === 0) return;
      const minG = entry.ing.minG ?? entry.ing.roundStep ?? 5;
      entry.grams = roundToStep(entry.refG * scale, entry.ing.roundStep || 5, minG);
    });
  };

  applyScale("protein", pScale);
  let actualProtM = sumRole("protein");

  // 3. Yağ kaynaklarını (eklenecek tahmini karbonhidrat içi yağ düşülerek) ölçekle
  const neededFatFromRole0 = Math.max(
    4,
    dayTargets.fatG - fixedM.f - actualProtM.f - baseCarbM.f * cScaleEst
  );
  fScaleEst = baseFatM.f > 0 ? Math.max(0.25, Math.min(2.0, neededFatFromRole0 / baseFatM.f)) : 1;
  applyScale("fat", fScaleEst);
  const actualFatM = sumRole("fat");

  // 4. Karbonhidrat kaynaklarını kalan kalori bütçesine göre ölçekle (böylece kcal hedefle örtüşür)
  const usedKcalBeforeCarb =
    (fixedM.p + actualProtM.p + actualFatM.p) * 4 +
    (fixedM.c + actualProtM.c + actualFatM.c) * 4 +
    (fixedM.f + actualProtM.f + actualFatM.f) * 9;
  const remainingKcalForCarb = Math.max(200, dayTargets.kcal - usedKcalBeforeCarb);
  const baseCarbKcal = baseCarbM.p * 4 + baseCarbM.c * 4 + baseCarbM.f * 9;
  const cScale = baseCarbKcal > 0 ? Math.max(0.35, Math.min(2.5, remainingKcalForCarb / baseCarbKcal)) : 1;
  applyScale("carb", cScale);
  const actualCarbM = sumRole("carb");

  // 5. İkinci geçiş: gerçek karbonhidrat ve yağ kaynaklarından gelen proteini düşerek protein rolünü ince ayarla
  const nonProtProtein = fixedM.p + actualCarbM.p + actualFatM.p;
  if (baseProtM.p > 0) {
    const refinedPScale = Math.max(
      0.45,
      Math.min(2.2, (dayTargets.proteinG - nonProtProtein) / baseProtM.p)
    );
    applyScale("protein", refinedPScale);
    actualProtM = sumRole("protein");
  }

  // 6. Günlük toplam kaloriyi hedefle (±25 kcal) hizalamak için en büyük karbonhidrat kalemine 5 g ince ayar uygula
  const sumAllKcal = () =>
    flatItems.reduce((sum, entry) => sum + calcMacrosFromGrams(entry.grams, entry.ing.per100).kcal, 0);

  const adjustableCarb = flatItems
    .filter((e) => e.ing.role === "carb" && e.grams > 0 && (e.ing.roundStep || 5) <= 10)
    .sort((a, b) => b.grams - a.grams)[0];

  if (adjustableCarb) {
    const step = adjustableCarb.ing.roundStep || 5;
    for (let i = 0; i < 6; i += 1) {
      const diff = dayTargets.kcal - sumAllKcal();
      if (Math.abs(diff) <= 22) break;
      const deltaG = diff > 0 ? step : -step;
      const nextG = adjustableCarb.grams + deltaG;
      if (nextG < (adjustableCarb.ing.minG ?? 15)) break;
      adjustableCarb.grams = nextG;
    }
  }

  const perMealTotals = dailyMeals.map(() => ({ p: 0, c: 0, f: 0 }));
  const gramsByItem = new Map();
  flatItems.forEach((entry) => {
    const m = calcMacrosFromGrams(entry.grams, entry.ing.per100);
    perMealTotals[entry.mealIdx].p += m.p;
    perMealTotals[entry.mealIdx].c += m.c;
    perMealTotals[entry.mealIdx].f += m.f;
    gramsByItem.set(`${entry.mealIdx}:${entry.ing.id}`, entry.grams);
  });

  return {
    gramsByItem,
    mealTotals: perMealTotals.map(finalizeMealTotals),
  };
}

// Öğün planını aktif profilin kalori ve makro hedeflerine göre matematiksel olarak ölçekler
export function scaleMealPlanForProfile(dailyMeals, profileTargets) {
  const trainingTargetKcal = Math.max(
    profileTargets.bmrKcal,
    Math.round(Number(profileTargets.targetCalories) || 2140)
  );
  const restTargetKcal = Math.max(
    profileTargets.bmrKcal,
    Math.round((trainingTargetKcal * 0.92) / 10) * 10
  );
  const proteinTargetG = Math.round(Number(profileTargets.proteinTargetG) || 160);
  const fatTargetG = Math.max(45, Math.round((trainingTargetKcal * 0.27) / 9));
  const carbsTargetG = Math.max(
    80,
    Math.round((trainingTargetKcal - proteinTargetG * 4 - fatTargetG * 9) / 4)
  );
  const restCarbsTargetG = Math.max(
    55,
    Math.round((restTargetKcal - proteinTargetG * 4 - fatTargetG * 9) / 4)
  );

  const trainSolved = solveDayGrams(
    dailyMeals,
    { kcal: trainingTargetKcal, proteinG: proteinTargetG, carbsG: carbsTargetG, fatG: fatTargetG },
    false
  );
  const restSolved = solveDayGrams(
    dailyMeals,
    { kcal: restTargetKcal, proteinG: proteinTargetG, carbsG: restCarbsTargetG, fatG: fatTargetG },
    true
  );

  const scaledMeals = dailyMeals.map((meal, mealIdx) => {
    const items = (meal.ingredients || [])
      .map((ing) => {
        const tg = trainSolved.gramsByItem.get(`${mealIdx}:${ing.id}`) ?? ing.baseG;
        const rg = restSolved.gramsByItem.get(`${mealIdx}:${ing.id}`) ?? (ing.restG ?? ing.baseG);
        return formatIngredientLine(ing, tg, rg);
      })
      .filter(Boolean);

    return {
      ...meal,
      totals: trainSolved.mealTotals[mealIdx],
      restDayTotals: restSolved.mealTotals[mealIdx],
      items,
    };
  });

  return {
    trainingTargetKcal,
    restTargetKcal,
    proteinTargetG,
    carbsTargetG,
    fatTargetG,
    scaledMeals,
  };
}
