<script setup lang="ts"></script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <span class="footer-text">
        © {{ new Date().getFullYear() }} BeMobile. All rights reserved.
      </span>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: auto;
  padding: 0.875rem 1.5rem;
  border-top: 1px solid var(--p-surface-200);
  background: var(--p-surface-0);
}

.app-dark .app-footer {
  background: rgb(20 25 31 / 0.85);
  border-top-color: rgb(255 255 255 / 0.08);
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  text-align: center;
}

.footer-text {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}
</style>
