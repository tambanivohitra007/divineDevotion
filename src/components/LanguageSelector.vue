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
/* Modern Language Selector */
.language-selector {
  position: relative;
}

.language-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  padding: var(--space-sm) var(--space-md);
  font-size: 13px;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-width: auto;
  cursor: pointer;
}

.language-btn:hover {
  background: var(--color-surface);
  border-color: var(--color-border-hover);
  color: var(--color-text-primary);
  transform: translateY(-1px);
}

.language-btn:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}

.language-btn i {
  font-size: 14px;
  opacity: 0.7;
}

.language-text {
  font-size: 16px;
  line-height: 1;
}

.dropdown-menu {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: var(--space-sm) 0;
  min-width: 160px;
  margin-top: var(--space-xs);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 14px;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.dropdown-item:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.dropdown-item.active {
  background: var(--color-accent-light);
  color: var(--color-accent);
  font-weight: 500;
}

.flag {
  font-size: 16px;
  flex-shrink: 0;
}

/* Remove Bootstrap dropdown arrow */
.language-btn::after {
  display: none;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .language-btn {
    padding: var(--space-sm);
  }
  
  .language-text {
    font-size: 14px;
  }
  
  .dropdown-menu {
    min-width: 140px;
  }
}
</style>
