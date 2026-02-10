<script setup lang="ts">
import ThemeToggle from '@/components/common/ThemeToggle.vue'
</script>

<template>
  <header class="app-header">
    <span class="app-brand">Task Manager</span>
    <ThemeToggle />
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 4rem;
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--p-surface-0);
  border-bottom: 1px solid var(--p-surface-200);
  backdrop-filter: blur(12px);
  transition: background-color 0.2s, border-color 0.2s;
}

.app-dark .app-header {
  background: rgb(20 25 31 / 0.85);
  border-bottom-color: rgb(255 255 255 / 0.08);
}

.app-brand {
  font-weight: 600;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}
</style>
