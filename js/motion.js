/** ARENA Hareket Sistemi — GSAP 3 ve mikro etkileşimler. */
import { CustomEase, Flip, gsap, ScrollTrigger, SplitText } from "../vendor/gsap/index.js";

CustomEase.create("arenaSnap", "0.2,0.9,0.25,1");
CustomEase.create("arenaHeavy", "0.16,1,0.3,1");

const CARD_SEL = ".exercise-card,.core-card,.macro-card,.summary-table-card,.summary-prose-card";
const BAR_SEL = ".set-bar,.pyramid-bar-fill";
const FLIP_SEL = '[data-flip-id="tab-indicator"],[data-flip-id="mobile-tab-indicator"]';
const MAG_SEL = ".video-trigger-btn,.view-card-details-btn,.source-link-btn";
const CLR_TX = "transform,opacity";
const mq = (q) => Boolean(window.matchMedia?.(q).matches);

let ready = false;
let reduced = mq("(prefers-reduced-motion: reduce)");
let canHover = mq("(hover: hover) and (pointer: fine)");
let heroSplit = null;
const triggers = [];

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

function resetMotion() {
  while (triggers.length) triggers.pop()?.kill();
  heroSplit?.revert();
  heroSplit = null;
}

function scaleText(orig, ratio) {
  const m = orig.match(/-?\d[\d.]*(?:,\d+)?/);
  if (!m) return orig;
  const raw = m[0];
  const dec = raw.includes(",") ? raw.split(",")[1].length : 0;
  const val = Number(raw.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(val)) return orig;
  return orig.replace(
    raw,
    dec > 0 ? (val * ratio).toFixed(dec).replace(".", ",") : String(Math.round(val * ratio))
  );
}

/** Hedef ölçeği koruyarak GPU scaleX dolumu uygular. */
function animateBars(nodes, cssVar, fallback, delay = 0, onScroll = false) {
  nodes.forEach((el, i) => {
    const raw = el.style.getPropertyValue(cssVar) || getComputedStyle(el).getPropertyValue(cssVar);
    const tw = gsap.fromTo(
      el,
      { scaleX: 0, transition: "none" },
      {
        scaleX: parseFloat(raw) || fallback,
        duration: onScroll ? 0.45 : 0.5,
        delay: onScroll ? 0 : i * delay,
        ease: "arenaSnap",
        transformOrigin: "left center",
        clearProps: "transform,transition",
        scrollTrigger: onScroll ? { trigger: el, start: "top 95%", once: true } : undefined,
      }
    );
    if (onScroll && tw.scrollTrigger) triggers.push(tw.scrollTrigger);
  });
}

function bindPointer(el, key, xP, yP, rx, ry, spec) {
  if (!canHover || reduced || el.dataset[key]) return;
  el.dataset[key] = "1";
  if (spec) gsap.set(el, { transformPerspective: 900 });
  const tx = gsap.quickTo(el, xP, { duration: 0.32, ease: "power2.out" });
  const ty = gsap.quickTo(el, yP, { duration: 0.32, ease: "power2.out" });
  el.addEventListener(
    "pointermove",
    (e) => {
      if (reduced || !canHover) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const px = clamp((e.clientX - r.left) / r.width, 0, 1);
      const py = clamp((e.clientY - r.top) / r.height, 0, 1);
      tx((spec ? 0.5 - py : px * 2 - 1) * rx);
      ty((spec ? px - 0.5 : py * 2 - 1) * ry);
      if (spec) {
        el.style.setProperty("--spec-x", `${(px * 100).toFixed(1)}%`);
        el.style.setProperty("--spec-y", `${(py * 100).toFixed(1)}%`);
      }
    },
    { passive: true }
  );
  el.addEventListener(
    "pointerleave",
    () => {
      tx(0);
      ty(0);
    },
    { passive: true }
  );
}

function bindHoverFX(root, sel) {
  if (!canHover || reduced || !root) return;
  root
    .querySelectorAll(".exercise-card,.core-card")
    .forEach((c) => bindPointer(c, "tilt", "rotationX", "rotationY", 14, 14, true));
  root.querySelectorAll(sel).forEach((b) => bindPointer(b, "mag", "x", "y", 6, 6));
}

function riseY(els, yPercent, duration, stagger) {
  if (els?.length) {
    gsap.fromTo(
      els,
      { yPercent },
      { yPercent: 0, duration, stagger, ease: "arenaSnap", clearProps: "transform" }
    );
  }
}

/** GSAP matchMedia ile hareket sistemini başlatır. */
export function initArenaMotion() {
  if (ready) return;
  ready = true;
  gsap.matchMedia().add(
    {
      reduce: "(prefers-reduced-motion: reduce)",
      desktop: "(min-width: 769px)",
      hover: "(hover: hover) and (pointer: fine)",
    },
    (ctx) => {
      const { reduce, desktop, hover } = ctx.conditions;
      reduced = Boolean(reduce);
      canHover = Boolean(hover && !reduce);

      if (reduce) {
        resetMotion();
        gsap.set(
          `${CARD_SEL},.hero-word-solid,.hero-rule-num,[data-hero-line="outline"],${BAR_SEL},.score-progress-fill,.macro-gauge-fill`,
          { clearProps: "all" }
        );
        gsap.globalTimeline.clear();
        return resetMotion;
      }

      const h1 = document.getElementById("hero-arena-heading");
      if (h1) {
        h1.setAttribute("aria-label", "KRAVITZ LEAN & FIT");
        const solid = h1.querySelectorAll(".hero-word-solid");
        if (solid.length) {
          heroSplit = SplitText.create(solid, { type: "chars", charsClass: "hero-char" });
          heroSplit?.chars?.forEach((c) => c.setAttribute("aria-hidden", "true"));
          riseY(heroSplit?.chars, 24, 0.48, 0.018);
        }
      }

      riseY(document.querySelectorAll(".hero-rule-num"), 18, 0.4, 0.05);

      if (desktop) {
        const out = document.querySelector('[data-hero-line="outline"]');
        const hero = document.querySelector(".hero-section");
        if (out && hero) {
          gsap.to(out, {
            yPercent: 14,
            ease: "none",
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5 },
          });
        }
      }

      if (canHover) {
        document
          .querySelectorAll("#toggle-tanita-btn,#open-summary-btn")
          .forEach((b) => bindPointer(b, "mag", "x", "y", 6, 6));
      }
      refreshMotionForContent();
      return resetMotion;
    }
  );
}

/** #content-area güncellendiğinde scroll tetikleyicilerini yeniler. */
export function refreshMotionForContent() {
  while (triggers.length) triggers.pop()?.kill();
  if (!ready || reduced) return;
  const root = document.getElementById("content-area");
  if (!root) return;

  const vis = [];
  const bel = [];
  const vh = window.innerHeight * 0.95;
  root.querySelectorAll(CARD_SEL).forEach((c) => {
    (c.getBoundingClientRect().top > vh ? bel : vis).push(c);
  });
  if (vis.length) {
    gsap.fromTo(
      vis,
      { y: 12 },
      { y: 0, duration: 0.4, stagger: 0.04, ease: "arenaSnap", clearProps: CLR_TX }
    );
  }
  if (bel.length) {
    gsap.set(bel, { y: 18, opacity: 0 });
    triggers.push(
      ...ScrollTrigger.batch(bel, {
        start: "top 92%",
        once: true,
        onEnter: (b) =>
          gsap.to(b, {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.04,
            ease: "arenaSnap",
            overwrite: "auto",
            clearProps: CLR_TX,
          }),
      })
    );
  }

  animateBars(root.querySelectorAll(BAR_SEL), "--bar-scale", 1, 0, true);

  root.querySelectorAll(".macro-gauge-fill").forEach((ring) => {
    const total =
      parseFloat(ring.getAttribute("stroke-dasharray") || getComputedStyle(ring).strokeDasharray) ||
      145;
    const tw = gsap.from(ring, {
      strokeDashoffset: total,
      duration: 0.65,
      ease: "arenaHeavy",
      clearProps: "strokeDashoffset",
      scrollTrigger: { trigger: ring, start: "top 94%", once: true },
    });
    if (tw.scrollTrigger) triggers.push(tw.scrollTrigger);
  });

  bindHoverFX(root, MAG_SEL);
  ScrollTrigger.refresh();
}

/** Sekme göstergesini Flip ile kaydırır; istenirse View Transition uygular. */
export function animateTabChange(renderTabsFn, renderContentFn, { useViewTransition = true } = {}) {
  const st = !reduced && ready ? Flip.getState(FLIP_SEL) : null;
  renderTabsFn();
  if (st) {
    Flip.from(st, {
      targets: FLIP_SEL,
      duration: 0.28,
      ease: "arenaSnap",
      scale: true,
      prune: true,
    });
  }
  if (useViewTransition && !reduced && document.startViewTransition) {
    document.startViewTransition(() => renderContentFn());
  } else {
    renderContentFn();
  }
}

/** Alternatif hareket seçiminde kart geçişini uygular. */
export function animateVariantChange(cardEl, applyFn) {
  applyFn();
  if (reduced || !cardEl) return;
  gsap.fromTo(
    cardEl,
    { scale: 0.985, opacity: 0.86 },
    { scale: 1, opacity: 1, duration: 0.24, ease: "arenaSnap", clearProps: CLR_TX }
  );
  animateBars(cardEl.querySelectorAll(BAR_SEL), "--bar-scale", 1, 0.03);
}

/** Skor tabelası çekmecesi açılışında çubuk ve sayaçları çalıştırır. */
export function animateScoreboardOpen() {
  if (reduced) return;
  const drawer = document.getElementById("tanita-drawer");
  if (!drawer || drawer.hidden) return;
  animateBars(drawer.querySelectorAll(".score-progress-fill"), "--score-progress", 0.5, 0.05);

  new Set(drawer.querySelectorAll("[data-count-value],.tanita-current")).forEach((el) => {
    const orig = (el.dataset.origText ||= el.textContent ?? "");
    gsap.killTweensOf(el);
    const t = { p: 0 };
    gsap.to(t, {
      p: 1,
      duration: 0.6,
      ease: "arenaHeavy",
      onUpdate: () => {
        el.textContent = scaleText(orig, t.p);
      },
      onComplete: () => {
        el.textContent = orig;
      },
    });
  });
}
