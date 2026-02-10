import { ref, computed, watch, onMounted } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'app-theme'

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(mode: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (mode === 'dark') {
    root.classList.add('app-dark')
  } else {
    root.classList.remove('app-dark')
  }
}

const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? 'system'
const themeMode = ref<ThemeMode>(stored)

function resolveEffectiveTheme(): 'light' | 'dark' {
  if (themeMode.value === 'system') return getSystemPreference()
  return themeMode.value
}

applyTheme(resolveEffectiveTheme())

export function useTheme() {
  const effectiveTheme = ref<'light' | 'dark'>(resolveEffectiveTheme())
  const isDark = computed(() => effectiveTheme.value === 'dark')

  function refreshEffectiveTheme() {
    effectiveTheme.value = resolveEffectiveTheme()
    applyTheme(effectiveTheme.value)
  }

  function setTheme(mode: ThemeMode) {
    themeMode.value = mode
    localStorage.setItem(STORAGE_KEY, mode)
    refreshEffectiveTheme()
  }

  onMounted(() => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (themeMode.value === 'system') refreshEffectiveTheme()
    })
  })

  watch(themeMode, refreshEffectiveTheme, { immediate: true })

  return { themeMode, isDark, setTheme, resolveEffectiveTheme }
}
