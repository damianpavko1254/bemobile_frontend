<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import type { ThemeMode } from '@/composables/useTheme'
import { useTheme } from '@/composables/useTheme'

const { themeMode, setTheme, resolveEffectiveTheme } = useTheme()

const isDark = computed(() => resolveEffectiveTheme() === 'dark')

function cycleTheme() {
  const order: ThemeMode[] = ['light', 'dark', 'system']
  const current = themeMode.value ?? 'system'
  const idx = order.indexOf(current)
  setTheme(order[(idx + 1) % order.length] ?? 'light')
}

const ariaLabel = computed(() => {
  if (themeMode.value === 'system') return 'Theme: System'
  return isDark.value ? 'Switch to light mode' : 'Switch to dark mode'
})

const icon = computed(() => {
  if (themeMode.value === 'system') return 'pi pi-desktop'
  return isDark.value ? 'pi pi-sun' : 'pi pi-moon'
})
</script>

<template>
  <Button
    :icon="icon"
    text
    rounded
    :aria-label="ariaLabel"
    @click="cycleTheme"
  />
</template>
