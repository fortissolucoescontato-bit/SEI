/**
 * Abstração de compatibilidade entre Chrome e Firefox.
 * No ambiente TypeScript com @types/chrome, usamos chrome diretamente.
 */
export const isChrome = typeof (globalThis as unknown as { browser?: unknown }).browser === 'undefined'

// Unifica a API do browser: usa `browser` no Firefox e `chrome` no Chrome.
export const currentBrowser: typeof chrome = isChrome
  ? chrome
  : (globalThis as unknown as { browser: typeof chrome }).browser
