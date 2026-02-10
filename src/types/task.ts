export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export interface Task {
  id: number
  title: string
  description?: string
  status: TaskStatus
  createdAt: string
  _links?: Record<string, { href: string }>
}

export interface TaskRequest {
  title: string
  description?: string
  status?: TaskStatus
}

export interface HateoasLink {
  href: string
  hreflang?: string
  title?: string
  type?: string
  templated?: boolean
}

export interface PageMetadata {
  size: number
  totalElements: number
  totalPages: number
  number: number
}

export interface PagedTasksResponse {
  _embedded?: {
    tasks: Task[]
  }
  _links: Record<string, HateoasLink>
  page: PageMetadata
}
