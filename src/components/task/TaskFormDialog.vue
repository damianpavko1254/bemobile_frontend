<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import type { Task, TaskRequest, TaskStatus } from '@/types'

const props = withDefaults(
  defineProps<{
    visible: boolean
    task: Task | null
    loading?: boolean
  }>(),
  { loading: false }
)

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'submit', payload: TaskRequest): void
}>()

const title = ref('')
const description = ref('')
const status = ref<TaskStatus>('TODO')

const statusOptions: { label: string; value: TaskStatus }[] = [
  { label: 'Todo', value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done', value: 'DONE' },
]

const errors = ref<{ title?: string }>({})

watch(
  () => [props.visible, props.task],
  () => {
    if (props.visible) {
      if (props.task) {
        title.value = props.task.title
        description.value = props.task.description ?? ''
        status.value = props.task.status
      } else {
        title.value = ''
        description.value = ''
        status.value = 'TODO'
      }
      errors.value = {}
    }
  },
  { immediate: true }
)

function validate(): boolean {
  const t = title.value.trim()
  if (!t) {
    errors.value = { title: 'Title is required' }
    return false
  }
  errors.value = {}
  return true
}

function submit() {
  if (!validate()) return
  emit('submit', {
    title: title.value.trim(),
    description: description.value.trim() || undefined,
    status: status.value,
  })
}

function close() {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    :header="task ? 'Edit Task' : 'New Task'"
    modal
    :style="{ width: '28rem' }"
    :dismissable-mask="true"
    class="task-form-dialog"
    @update:visible="emit('update:visible', $event)"
  >
    <form class="task-form" @submit.prevent="submit">
      <div class="form-field">
        <label for="task-title">Title *</label>
        <InputText
          id="task-title"
          v-model="title"
          class="w-full"
          :class="{ 'p-invalid': errors.title }"
          placeholder="Task title"
        />
        <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
      </div>
      <div class="form-field">
        <label for="task-description">Description</label>
        <Textarea
          id="task-description"
          v-model="description"
          class="w-full"
          rows="4"
          placeholder="Optional description"
        />
      </div>
      <div class="form-field">
        <label for="task-status">Status</label>
        <Select
          id="task-status"
          v-model="status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>
    </form>
    <template #footer>
      <Button label="Cancel" text :disabled="loading" @click="close" />
      <Button
        :label="task ? 'Update' : 'Create'"
        icon="pi pi-check"
        :loading="loading"
        :disabled="loading"
        @click="submit"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.task-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 500;
  font-size: 0.875rem;
}

.w-full {
  width: 100%;
}
</style>
