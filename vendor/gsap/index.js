/**
 * Yerel GSAP 3.15.1 UMD eklentilerini ES Module olarak dışa aktarır.
 */
const { gsap, ScrollTrigger, SplitText, Flip } = globalThis;
gsap?.registerPlugin?.(ScrollTrigger, SplitText, Flip);

const bz = (t, p, q) => ((1 - 3 * q + 3 * p) * t + (3 * q - 6 * p)) * t * t + 3 * p * t;
const solve = (a, b, c, d) => (x) => {
  if (x <= 0 || x >= 1) return x <= 0 ? 0 : 1;
  let l = 0, h = 1, t = x;
  for (let i = 0; i < 9; i++) {
    t = (l + h) / 2;
    if (bz(t, a, c) < x) l = t; else h = t;
  }
  return bz(t, b, d);
};

export const CustomEase = {
  create(name, s) {
    const n = String(s || "").split(",").map(Number).filter(Number.isFinite);
    const fn = n.length === 4 ? solve(n[0], n[1], n[2], n[3]) : (t) => t;
    gsap?.registerEase?.(name, fn);
    return fn;
  },
};

export { Flip, gsap, ScrollTrigger, SplitText };
export default gsap;
