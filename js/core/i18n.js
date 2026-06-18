export const LANGUAGE_STORAGE_KEY = 'central190-language-v1';

function deepGet(object, path) {
  return String(path || '').split('.').reduce((value, key) => value?.[key], object);
}

function interpolate(template, values = {}) {
  return String(template ?? '').replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

export class I18nManager {
  constructor({ translations, supportedLocales, defaultLocale = 'pt-BR', storage = globalThis.localStorage } = {}) {
    this.translations = translations || {};
    this.supportedLocales = supportedLocales || Object.keys(this.translations);
    this.defaultLocale = defaultLocale;
    this.storage = storage;
    this.locale = this.resolveLocale(this.readStoredLocale() || globalThis.navigator?.language || defaultLocale);
  }

  resolveLocale(locale) {
    if (this.supportedLocales.includes(locale)) return locale;
    const short = String(locale || '').toLowerCase().split('-')[0];
    return this.supportedLocales.find((item) => item.toLowerCase().startsWith(`${short}-`)) || this.defaultLocale;
  }

  readStoredLocale() {
    try { return this.storage?.getItem(LANGUAGE_STORAGE_KEY); } catch { return null; }
  }

  setLocale(locale, { persist = true } = {}) {
    this.locale = this.resolveLocale(locale);
    if (persist) {
      try { this.storage?.setItem(LANGUAGE_STORAGE_KEY, this.locale); } catch { /* storage can be unavailable */ }
    }
    document.documentElement.lang = this.locale;
    return this.locale;
  }

  t(key, values = {}, fallback = '') {
    const own = deepGet(this.translations[this.locale], key);
    const base = deepGet(this.translations[this.defaultLocale], key);
    return interpolate(own ?? base ?? fallback ?? key, values);
  }

  applyDocument(root = document) {
    document.documentElement.lang = this.locale;
    root.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = this.t(node.dataset.i18n, {}, node.textContent);
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
      node.setAttribute('placeholder', this.t(node.dataset.i18nPlaceholder, {}, node.getAttribute('placeholder') || ''));
    });
    root.querySelectorAll('[data-i18n-aria]').forEach((node) => {
      node.setAttribute('aria-label', this.t(node.dataset.i18nAria, {}, node.getAttribute('aria-label') || ''));
    });
    root.querySelectorAll('[data-i18n-alt]').forEach((node) => {
      node.setAttribute('alt', this.t(node.dataset.i18nAlt, {}, node.getAttribute('alt') || ''));
    });
    root.querySelectorAll('[data-i18n-subtitle]').forEach((node) => {
      node.dataset.subtitle = this.t(node.dataset.i18nSubtitle, {}, node.dataset.subtitle || '');
    });
  }
}
