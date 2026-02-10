export * from './task'

export interface RouteMeta {
  title?: string
  requiresAuth?: boolean
}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
  }
}
