export const THEME_STORAGE_KEY = 'virnect-admin-theme';

export function getStoredTheme() {
  if (typeof window === 'undefined') return 'dark';

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';
  } catch {
    return 'dark';
  }
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

export function saveTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage is optional; the active page can still use the selected theme.
  }
  applyTheme(theme);
}
