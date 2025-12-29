import { ref, computed, watch } from 'vue'

const isDarkTheme = ref<boolean>(false)

// Initialize theme from localStorage or system preference
function initializeTheme() {
  if (typeof window === 'undefined') return

  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkTheme.value = savedTheme === 'dark'
  } else {
    // Check system preference
    isDarkTheme.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
}

// Watch for system theme changes
function setupSystemThemeListener() {
  if (typeof window === 'undefined') return

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      isDarkTheme.value = e.matches
      applyTheme()
    }
  })
}

function applyTheme() {
  if (typeof document === 'undefined') return

  const html = document.documentElement
  if (isDarkTheme.value) {
    html.classList.add('dark')
    html.setAttribute('data-theme', 'dark')
  } else {
    html.classList.remove('dark')
    html.setAttribute('data-theme', 'light')
  }
}

watch(isDarkTheme, () => {
  applyTheme()
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
  }
})

// Initialize on module load
initializeTheme()
setupSystemThemeListener()

export function useLayout() {
  const toggleDarkMode = () => {
    isDarkTheme.value = !isDarkTheme.value
  }

  const getPrimary = () => {
    if (typeof document === 'undefined') return '#6366f1'
    const documentStyle = getComputedStyle(document.documentElement)
    return documentStyle.getPropertyValue('--p-primary-500') || '#6366f1'
  }

  const getSurface = () => {
    if (typeof document === 'undefined') return '#ffffff'
    const documentStyle = getComputedStyle(document.documentElement)
    return documentStyle.getPropertyValue('--p-surface-0') || '#ffffff'
  }

  return {
    isDarkTheme: computed(() => isDarkTheme.value),
    toggleDarkMode,
    getPrimary,
    getSurface,
  }
}

