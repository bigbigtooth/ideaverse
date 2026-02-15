<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Globe } from 'lucide-vue-next'

const { locale } = useI18n()

const currentLanguage = computed(() => {
  return locale.value === 'zh-CN' ? '中文' : 'EN'
})

function toggleLanguage() {
  const newLocale = locale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  locale.value = newLocale
  localStorage.setItem('ideaverse_language', newLocale)
  document.documentElement.lang = newLocale
}
</script>

<template>
  <button class="language-switcher" @click="toggleLanguage" :title="locale === 'zh-CN' ? 'Switch to English' : '切换到中文'">
    <Globe class="globe-icon" :size="18" />
    <span class="language-text">{{ currentLanguage }}</span>
  </button>
</template>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.language-switcher:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
}

.globe-icon {
  flex-shrink: 0;
}

.language-text {
  font-weight: 500;
}
</style>
