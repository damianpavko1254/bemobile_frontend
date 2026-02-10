import type { Task, TaskRequest, PagedTasksResponse } from '@/types'

// Use empty string in dev to hit Vite proxy (/api → localhost:8080), or full URL for direct requests
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const TASKS_BASE = `${API_BASE}/api/v1/tasks`

interface FetchTasksParams {
  page?: number
  size?: number
  sort?: string
  title?: string
  status?: string
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function fetchTasks(params: FetchTasksParams = {}): Promise<PagedTasksResponse> {
  const search = new URLSearchParams()
  if (params.page != null) search.set('page', String(params.page))
  if (params.size != null) search.set('size', String(params.size))
  if (params.sort) search.set('sort', params.sort)
  if (params.title) search.set('title', params.title)
  if (params.status) search.set('status', params.status)
  const qs = search.toString()
  const url = qs ? `${TASKS_BASE}?${qs}` : TASKS_BASE
  return request<PagedTasksResponse>(url)
}

export async function fetchTaskById(id: number): Promise<Task> {
  return request<Task>(`${TASKS_BASE}/${id}`)
}

export async function createTask(data: TaskRequest): Promise<Task> {
  return request<Task>(TASKS_BASE, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateTask(id: number, data: TaskRequest): Promise<Task> {
  return request<Task>(`${TASKS_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteTask(id: number): Promise<void> {
  return request<void>(`${TASKS_BASE}/${id}`, { method: 'DELETE' })
}
