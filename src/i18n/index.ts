// src/i18n/index.ts
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import fr from './locales/fr.json'
import mg from './locales/mg.json'

const messages = {
  en,
  fr,
  mg
}

// Get saved language or default to English
const savedLocale = localStorage.getItem('divine-devotion-locale') || 'en'

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: savedLocale,
  fallbackLocale: 'en',
  messages
})

export default i18n
