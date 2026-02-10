<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'

const router = useRouter()
</script>

<template>
  <div class="not-found-view">
    <Card class="not-found-card">
      <template #content>
        <div class="not-found-content">
          <span class="not-found-code">404</span>
          <h1 class="not-found-title">Page not found</h1>
          <p class="not-found-message">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div class="not-found-actions">
            <Button
              label="Go to Tasks"
              class="not-found-btn"
              @click="router.push({ name: 'tasks' })"
            />
            <Button
              label="Go Back"
              text
              severity="secondary"
              @click="router.back()"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.not-found-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
}

.not-found-card {
  max-width: 420px;
  text-align: center;
}

.not-found-card :deep(.p-card-content) {
  padding: 2rem;
}

.not-found-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.not-found-code {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
  color: var(--p-primary-color);
  letter-spacing: -0.05em;
}

.not-found-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.02em;
}

.not-found-message {
  font-size: 0.95rem;
  color: var(--p-text-muted-color);
  margin: 0;
  line-height: 1.5;
}

.not-found-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.5rem;
}

.not-found-btn {
  width: 100%;
  justify-content: center;
}

@media (min-width: 480px) {
  .not-found-actions {
    flex-direction: row;
    justify-content: center;
  }

  .not-found-btn {
    width: auto;
  }
}
</style>
