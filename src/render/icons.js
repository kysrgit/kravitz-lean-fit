/**
 * Dosya: src/render/icons.js
 * Açıklama: Arayüzdeki tüm emojilerin yerini alan Lucide (ISC lisansı) inline SVG sprite
 * yardımcısını ve sınıf eşlemelerini sağlar. Tüm ikonlar 1.5 px çizgi kalınlığındadır.
 */

import { escapeHtml } from "../state.js";

/**
 * index.html içindeki Lucide inline SVG sprite sembolüne (<symbol id="icon-...">)
 * başvuran erişilebilir SVG düğümü HTML'i üretir.
 */
export function lucideIcon(name, { size = 16, className = "", label = "" } = {}) {
  const safeName = escapeHtml(name);
  const safeSize = Number(size) || 16;
  const classes = ["icon", className].filter(Boolean).join(" ");
  const a11yAttrs = label ? `role="img" aria-label="${escapeHtml(label)}"` : 'aria-hidden="true"';

  return `<svg class="${escapeHtml(classes)}" width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false" ${a11yAttrs}><use href="#icon-${safeName}"></use></svg>`;
}
