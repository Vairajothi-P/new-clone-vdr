export const BRAND_STORAGE_KEY = 'vdr_brand_theme';
export const DEFAULT_BRAND = '#1C7F9F';
export const DEFAULT_BRAND_DARK = '#166882';
export const DEFAULT_BRAND_SOFT = 'rgba(28, 127, 159, 0.14)';
export const DEFAULT_BRAND_RGB = '28,127,159';

const normalizeHex = (value) => {
  if (typeof value !== 'string') return DEFAULT_BRAND;
  let hex = value.trim();
  if (hex.startsWith('#')) hex = hex.slice(1);
  if (hex.length === 3) {
    hex = hex.split('').map((char) => char + char).join('');
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return DEFAULT_BRAND;
  return `#${hex.toUpperCase()}`;
};

const hexToRgb = (hex) => {
  const normalized = normalizeHex(hex);
  const [, r, g, b] = normalized.match(/^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i) || [];
  return r && g && b
    ? `${parseInt(r, 16)},${parseInt(g, 16)},${parseInt(b, 16)}`
    : DEFAULT_BRAND_RGB;
};

const shadeHex = (hex, percent) => {
  const normalized = normalizeHex(hex);
  const num = parseInt(normalized.slice(1), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 255) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 255) + percent));
  const b = Math.min(255, Math.max(0, (num & 255) + percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

export const getStoredBrandTheme = () => {
  if (typeof window === 'undefined') return DEFAULT_BRAND;
  const stored = localStorage.getItem(BRAND_STORAGE_KEY);
  return stored || DEFAULT_BRAND;
};

export const applyBrandTheme = (theme = DEFAULT_BRAND) => {
  if (typeof window === 'undefined') return;

  const trimmed = typeof theme === 'string' ? theme.trim() : DEFAULT_BRAND;
  const isHex = trimmed.startsWith('#');
  const brand = isHex ? normalizeHex(trimmed) : trimmed || DEFAULT_BRAND;
  const rgb = isHex ? hexToRgb(brand) : DEFAULT_BRAND_RGB;
  const dark = isHex ? shadeHex(brand, -14) : DEFAULT_BRAND_DARK;
  const soft = isHex ? `rgba(${rgb}, 0.14)` : DEFAULT_BRAND_SOFT;

  document.documentElement.style.setProperty('--brand', brand);
  document.documentElement.style.setProperty('--brand-dark', dark);
  document.documentElement.style.setProperty('--brand-soft', soft);
  document.documentElement.style.setProperty('--brand-rgb', rgb);
  document.documentElement.style.setProperty('--brand-secondary', '#2BB8A6');

  localStorage.setItem(BRAND_STORAGE_KEY, brand);
};
