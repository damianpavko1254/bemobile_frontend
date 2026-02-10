import { ref } from 'vue'

/**
 * Composable for async operations with loading and error state
 */
export function useAsync<T>(asyncFn: () => Promise<T>) {
  const data = ref<T | null>(null) as { value: T | null }
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  async function execute() {
    isLoading.value = true
    error.value = null
    try {
      data.value = await asyncFn()
      return data.value
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return { data, error, isLoading, execute }
}
