<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Skeleton from 'primevue/skeleton'
import ProgressSpinner from 'primevue/progressspinner'
import ConfirmDialog from 'primevue/confirmdialog'
// import ConfirmPopup from 'primevue/confirmpopup'
import { useConfirm } from 'primevue/useconfirm'
import type { Task, TaskStatus, TaskRequest } from '@/types'
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from '@/services/taskService'
import TaskFormDialog from '@/components/task/TaskFormDialog.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

function parseQuery(q: Record<string, unknown>) {
  return {
    page: q.page ? Math.max(0, parseInt(String(q.page), 10) || 0) : 0,
    size: q.size ? Math.max(1, Math.min(50, parseInt(String(q.size), 10) || 10)) : 10,
    title: q.title ? String(q.title) : '',
    status: (q.status && ['TODO', 'IN_PROGRESS', 'DONE'].includes(String(q.status)))
      ? (String(q.status) as TaskStatus)
      : null as TaskStatus | null,
  }
}

const tasks = ref<Task[]>([])
const loading = ref(false)
const totalElements = ref(0)
const totalPages = ref(0)
const pageNumber = ref(parseQuery(route.query).page)
const pageSize = ref(parseQuery(route.query).size)
const links = ref<Record<string, { href: string }>>({})
const searchTitle = ref(parseQuery(route.query).title)
const filterStatus = ref<TaskStatus | null>(parseQuery(route.query).status)
const showFormDialog = ref(false)
const editingTask = ref<Task | null>(null)
const submitting = ref(false)

const statusOptions: { label: string; value: TaskStatus }[] = [
  { label: 'Todo', value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done', value: 'DONE' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    dateStyle: 'medium',
  })
}

async function loadTasks(shouldLoad = true) {
  if (shouldLoad) loading.value = true
  try {
    const res = await fetchTasks({
      page: pageNumber.value,
      size: pageSize.value,
      title: searchTitle.value || undefined,
      status: filterStatus.value ?? undefined,
    })
    tasks.value = res._embedded?.tasks ?? []
    totalElements.value = res.page.totalElements
    totalPages.value = res.page.totalPages
    pageNumber.value = res.page.number
    pageSize.value = res.page.size
    links.value = res._links ?? {}
    const newPage = String(res.page.number)
    const newSize = String(res.page.size)
    if (route.query.page !== newPage || route.query.size !== newSize) {
      router.replace({
        query: { ...route.query, page: newPage, size: newSize },
      })
    }
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e instanceof Error ? e.message : 'Failed to load tasks',
    })
  } finally {
    if (shouldLoad) loading.value = false
  }
}

function onPage(event: { page: number; rows: number }) {
  router.replace({
    query: {
      ...route.query,
      page: String(event.page),
      size: String(event.rows),
    },
  })
}

function openCreate() {
  editingTask.value = null
  showFormDialog.value = true
}

function openEdit(task: Task) {
  editingTask.value = { ...task }
  showFormDialog.value = true
}

async function onFormSubmit(payload: TaskRequest) {
  submitting.value = true
  try {
    if (editingTask.value) {
      const updated = await updateTask(editingTask.value.id, payload)
      const idx = tasks.value.findIndex((t) => t.id === updated.id)
      if (idx !== -1) tasks.value[idx] = updated
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Task updated' })
    } else {
      const created = await createTask(payload)
      totalElements.value += 1
      if (pageNumber.value === 0) {
        tasks.value = [created, ...tasks.value]
        if (tasks.value.length > pageSize.value) tasks.value.pop()
      }
      toast.add({ severity: 'success', summary: 'Created', detail: 'Task created' })
    }
    showFormDialog.value = false
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: e instanceof Error ? e.message : 'Failed to save task',
    })
  } finally {
    submitting.value = false
  }
}

function onStatusChange(task: Task, newStatus: TaskStatus) {
  updateTask(task.id, {
    title: task.title,
    description: task.description,
    status: newStatus,
  })
    .then(() => {
      toast.add({ severity: 'success', summary: 'Status updated', life: 2000 })
      loadTasks()
    })
    .catch((e) => {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: e instanceof Error ? e.message : 'Failed to update',
      })
    })
}

function confirmDelete(task: Task, event: Event) {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: `Delete "${task.title}"?`,
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-text',
    accept: () => {
      deleteTask(task.id)
        .then(() => {
          toast.add({ severity: 'success', summary: 'Deleted', life: 2000 })
          loadTasks()
        })
        .catch((e) => {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: e instanceof Error ? e.message : 'Failed to delete',
          })
        })
    },
  })
}

function syncRefsFromRoute() {
  const q = parseQuery(route.query)
  pageNumber.value = q.page
  pageSize.value = q.size
  searchTitle.value = q.title
  filterStatus.value = q.status
}

watch(
  () => [route.query.page, route.query.size, route.query.title, route.query.status],
  () => {
    syncRefsFromRoute()
    loadTasks()
  },
  { immediate: true }
)

let searchDebounce: ReturnType<typeof setTimeout>
watch([searchTitle, filterStatus], () => {
  pageNumber.value = 0
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    router.replace({
      query: {
        page: '0',
        size: String(pageSize.value),
        ...(searchTitle.value && { title: searchTitle.value }),
        ...(filterStatus.value && { status: filterStatus.value }),
      },
    })
  }, 300)
})
</script>

<template>
  <div class="tasks-view">
    <ConfirmDialog />
    <!-- <ConfirmPopup /> -->
    <TaskFormDialog
      v-model:visible="showFormDialog"
      :task="editingTask"
      :loading="submitting"
      @submit="onFormSubmit"
    />
    <div class="tasks-card">
      <div class="tasks-header">
        <div class="tasks-header-left">
          <h1 class="tasks-title">Tasks</h1>
          <p class="tasks-subtitle">
            {{ totalElements }} {{ totalElements === 1 ? 'task' : 'tasks' }}
          </p>
        </div>
        <Button
          label="New Task"
          icon="pi pi-plus"
          class="new-task-btn"
          @click="openCreate"
        />
      </div>
      <div class="tasks-filters">
        <IconField iconPosition="left" class="search-field">
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText
            v-model="searchTitle"
            placeholder="Search tasks..."
            class="search-input"
          />
        </IconField>
        <Select
          v-model="filterStatus"
          :options="[{ label: 'All statuses', value: null }, ...statusOptions]"
          option-label="label"
          option-value="value"
          placeholder="Status"
          class="status-filter"
          show-clear
        />
      </div>
      <div class="tasks-table-wrapper">
        <div v-if="loading" class="table-loading-overlay">
          <ProgressSpinner style="width: 48px; height: 48px" stroke-width="4" />
        </div>
        <DataTable
          :value="tasks"
          :loading="loading"
          :paginator="true"
          :rows="pageSize"
          :total-records="totalElements"
          :lazy="true"
          :first="pageNumber * pageSize"
          paginator-template="PrevPageLink PageLinks NextPageLink CurrentPageReport RowsPerPageDropdown"
          current-page-report-template="{first}-{last} of {totalRecords}"
          :rows-per-page-options="[5, 10, 25, 50]"
          data-key="id"
          responsive-layout="scroll"
          class="tasks-table"
          @page="onPage"
        >
          <template #empty>
            <div class="empty-state">
              <div class="empty-icon-wrap">
                <i class="pi pi-inbox" />
              </div>
              <h3>No tasks yet</h3>
              <p>Create your first task to get started</p>
              <Button
                label="Add Task"
                icon="pi pi-plus"
                @click="openCreate"
              />
            </div>
          </template>
          <template #loading>
            <div class="loading-skeletons">
              <Skeleton height="2.75rem" class="skeleton-row" />
              <Skeleton height="2.75rem" class="skeleton-row" />
              <Skeleton height="2.75rem" class="skeleton-row" />
              <Skeleton height="2.75rem" class="skeleton-row" />
            </div>
          </template>
          <Column field="title" header="Title">
            <template #body="{ data }">
              <span class="task-title-cell">{{ data.title }}</span>
              <span v-if="data.description" class="task-desc-hint">
                {{ data.description.slice(0, 50) }}{{ data.description.length > 50 ? '…' : '' }}
              </span>
            </template>
          </Column>
          <Column field="status" header="Status">
            <template #body="{ data }">
              <Select
                :model-value="data.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                class="status-select"
                @update:model-value="(v) => onStatusChange(data, v)"
              />
            </template>
          </Column>
          <Column field="createdAt" header="Date" style="width: 130px">
            <template #body="{ data }">
              <span class="date-cell">{{ formatDate(data.createdAt) }}</span>
            </template>
          </Column>
          <Column header="" style="width: 100px">
            <template #body="{ data }">
              <div class="actions-cell">
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  severity="secondary"
                  aria-label="Edit"
                  class="action-btn"
                  @click="openEdit(data)"
                />
                <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="secondary"
                  aria-label="Delete"
                  class="action-btn action-btn-danger"
                  @click="confirmDelete(data, $event)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tasks-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0.5rem;
}

.tasks-card {
  background: var(--p-surface-0);
  border-radius: 16px;
  border: 1px solid var(--p-surface-200);
  overflow: hidden;
  box-shadow: var(--app-card-shadow);
  transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
}

:root:not(.app-dark) .tasks-card {
  box-shadow: var(--app-card-shadow-lg);
}

.app-dark .tasks-card {
  background: #0d0d0d;
  border-color: rgb(255 255 255 / 0.1);
  box-shadow: 0 4px 24px rgb(0 0 0 / 0.4);
  color: #e5e5e5;
}

.app-dark .tasks-card .tasks-title {
  color: #f5f5f5;
}

.app-dark .tasks-card .tasks-subtitle {
  color: #9ca3af;
}

.tasks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid var(--p-surface-200);
}

.app-dark .tasks-header {
  border-bottom-color: rgb(255 255 255 / 0.08);
}

.tasks-header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tasks-title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0;
}

.tasks-subtitle {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

.new-task-btn {
  font-weight: 500;
}

.tasks-filters {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.75rem;
  background: var(--p-surface-50);
  border-bottom: 1px solid var(--p-surface-200);
}

.app-dark .tasks-filters {
  background: #161616;
  border-bottom-color: rgb(255 255 255 / 0.08);
}

.search-field {
  flex: 1;
  min-width: 0;
}

.search-input {
  width: 100%;
  padding: 10px;
}

.status-filter {
  min-width: 140px;
}

.tasks-table-wrapper {
  position: relative;
  overflow-x: auto;
}

.table-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 0.6);
  z-index: 10;
}

.app-dark .table-loading-overlay {
  background: rgb(0 0 0 / 0.4);
}

.tasks-table {
  border: none !important;
}

.tasks-table :deep(.p-datatable-thead > tr > th) {
  background: var(--p-surface-50) !important;
  border-bottom: 1px solid var(--p-surface-200);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--p-text-muted-color);
  padding: 0.875rem 1.25rem;
}

.app-dark .tasks-table :deep(.p-datatable-thead > tr > th) {
  background: #161616 !important;
  border-bottom-color: rgb(255 255 255 / 0.08);
  color: #9ca3af !important;
}

.tasks-table :deep(.p-datatable-tbody > tr > td) {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--p-surface-100);
  vertical-align: middle;
  font-size: 0.8rem;
}

.app-dark .tasks-table :deep(.p-datatable-tbody > tr > td) {
  border-bottom-color: rgb(255 255 255 / 0.06);
  color: #e5e5e5;
}

.tasks-table :deep(.p-datatable-tbody > tr:hover) {
  background: var(--p-surface-50) !important;
}

.app-dark .tasks-table :deep(.p-datatable-tbody > tr:hover) {
  background: #1a1a1a !important;
}

.tasks-table :deep(.p-datatable-tbody > tr:last-child > td) {
  border-bottom: none;
}

.task-title-cell {
  font-weight: 500;
  display: block;
}

.app-dark .tasks-card .task-title-cell {
  color: #f5f5f5;
}

.task-desc-hint {
  display: block;
  font-size: 0.8125rem;
  color: var(--p-text-muted-color);
  margin-top: 0.125rem;
}

.app-dark .tasks-card .task-desc-hint {
  color: #9ca3af;
}

.status-select {
  min-width: 120px;
  font-size: 0.8rem;
}

.tasks-table :deep(.status-select),
.tasks-table :deep(.status-select .p-select-label),
.tasks-table :deep(.status-select .p-inputtext),
.tasks-table :deep(.status-select label) {
  font-size: 0.8rem;
}

.date-cell {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.app-dark .tasks-card .date-cell {
  color: #9ca3af;
}

.actions-cell {
  display: flex;
  gap: 0.125rem;
}

.action-btn {
  opacity: 0.7;
}

.action-btn:hover {
  opacity: 1;
}

.action-btn-danger:hover {
  color: var(--p-red-500) !important;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon-wrap {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1.25rem;
  border-radius: 12px;
  background: var(--p-surface-100);
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-dark .empty-icon-wrap {
  background: #262626;
}

.empty-icon-wrap i {
  font-size: 1.75rem;
  color: var(--p-text-muted-color);
}

.app-dark .empty-icon-wrap i {
  color: #9ca3af;
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.app-dark .empty-state h3 {
  color: #f5f5f5;
}

.empty-state p {
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
  margin: 0 0 1.25rem;
}

.app-dark .empty-state p {
  color: #9ca3af;
}

.loading-skeletons {
  padding: 1rem 1.75rem;
}

.skeleton-row {
  margin-bottom: 0.5rem;
  border-radius: 8px;
}

.skeleton-row:last-child {
  margin-bottom: 0;
}

.tasks-table :deep(.p-paginator) {
  background: var(--p-surface-50) !important;
  border-top: 1px solid var(--p-surface-200);
  padding: 0.75rem 1.25rem;
}

.app-dark .tasks-table :deep(.p-paginator) {
  background: #161616 !important;
  border-top-color: rgb(255 255 255 / 0.08);
  color: #e5e5e5;
}

.app-dark .tasks-table :deep(.p-paginator .p-paginator-pages .p-button) {
  color: #e5e5e5;
}

.app-dark .tasks-table :deep(.p-paginator .p-paginator-current) {
  color: #9ca3af;
}
</style>
