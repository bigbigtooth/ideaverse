import { createI18n } from 'vue-i18n'
import zhCN from '../locales/zh-CN'
import enUS from '../locales/en-US'

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

function updateHtmlLang(locale) {
  document.documentElement.lang = locale
}

const defaultLocale = getDefaultLocale()
updateHtmlLang(defaultLocale)

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
