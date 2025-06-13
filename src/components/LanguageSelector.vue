<template>
  <div class="language-selector">
    <div class="dropdown">
      <button
        class="btn btn-outline-light dropdown-toggle language-btn"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        :title="$t('navigation.language')"
      >
        <i class="bi bi-globe"></i>
        <span class="language-text">{{ currentLanguageFlag }}</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li>
          <button
            class="dropdown-item"
            :class="{ active: $i18n.locale === 'en' }"
            @click="changeLanguage('en')"
          >
            <span class="flag">🇺🇸</span>
            English
          </button>
        </li>        <li>
          <button
            class="dropdown-item"
            :class="{ active: $i18n.locale === 'fr' }"
            @click="changeLanguage('fr')"
          >
            <span class="flag">🇫🇷</span>
            Français
          </button>
        </li>
        <li>
          <button
            class="dropdown-item"
            :class="{ active: $i18n.locale === 'mg' }"
            @click="changeLanguage('mg')"
          >
            <span class="flag">🇲🇬</span>
            Malagasy
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const currentLanguageFlag = computed(() => {
  switch (locale.value) {
    case 'fr':
      return '🇫🇷'
    case 'mg':
      return '🇲🇬'
    default:
      return '🇺🇸'
  }
})

const changeLanguage = (newLocale: string) => {
  locale.value = newLocale
  // Save the language preference
  localStorage.setItem('divine-devotion-locale', newLocale)
  
  // Update document lang attribute for accessibility
  document.documentElement.lang = newLocale
}
</script>

<style scoped>
.language-selector {
  position: relative;
}

.language-btn {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-primary);
  padding: 0.5rem 0.75rem;
  transition: var(--transition-smooth);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: auto;
}

.language-btn:hover {
  border-color: var(--divine-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
  color: var(--text-primary);
}

.language-btn:focus {
  border-color: var(--divine-primary);
  box-shadow: 0 0 0 0.2rem rgba(249, 115, 22, 0.25);
  color: var(--text-primary);
}

.language-text {
  font-size: 1.2rem;
}

.dropdown-menu {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  min-width: 140px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: var(--text-primary);
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  transition: var(--transition-smooth);
}

.dropdown-item:hover {
  background: rgba(249, 115, 22, 0.1);
  color: var(--divine-primary);
}

.dropdown-item.active {
  background: rgba(249, 115, 22, 0.2);
  color: var(--divine-primary);
  font-weight: 600;
}

.flag {
  font-size: 1.1rem;
}

/* Dark mode adjustments */
[data-bs-theme="dark"] .language-btn {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

[data-bs-theme="dark"] .dropdown-menu {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

[data-bs-theme="dark"] .dropdown-item {
  color: #ffffff;
}
</style>
