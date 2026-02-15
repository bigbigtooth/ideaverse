/**
 * @fileoverview Vue I18n configuration for internationalization
 * @module i18n
 * @description Configures Vue I18n for multi-language support.
 * Currently supports:
 * - Chinese (Simplified): zh-CN
 * - English (US): en-US
 * 
 * Language detection priority:
 * 1. Saved preference in localStorage
 * 2. Browser language preference
 * 3. Default fallback to English
 * 
 * @copyright 2026 BigTooth
 * @license GPL-3.0
 */

import { createI18n } from 'vue-i18n'
import zhCN from '../locales/zh-CN'
import enUS from '../locales/en-US'

/**
 * Determines the default locale based on user preferences
 * Priority: localStorage > browser language > fallback
 * @returns {string} The locale code to use ('zh-CN' or 'en-US')
 */
function getDefaultLocale() {
  const savedLanguage = localStorage.getItem('ideaverse_language')
  if (savedLanguage) {
    return savedLanguage
  }
  const browserLang = navigator.language || navigator.languages?.[0]
  if (browserLang && browserLang.toLowerCase().startsWith('zh')) {
    return 'zh-CN'
  }
  return 'en-US'
}

/**
 * Updates the HTML document lang attribute
 * @param {string} locale - The locale code to set
 */
function updateHtmlLang(locale) {
  document.documentElement.lang = locale
}

const defaultLocale = getDefaultLocale()
updateHtmlLang(defaultLocale)

/**
 * Vue I18n instance
 * @type {import('vue-i18n').I18n}
 */
const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

export default i18n
