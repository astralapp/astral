import { useEventListener } from '@vueuse/core'
import { reactive, watch } from 'vue'

interface UseUrlParamsReturnValue {
  params: Record<string, null | string>
}

export const useUrlParams = (): UseUrlParamsReturnValue => {
  const urlParams = new URLSearchParams(location.search || '')
  const params: Record<string, null | string> = reactive({})

  urlParams.forEach((value, key) => (params[key] = value))

  watch(params, newParams => {
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        delete params[key]
        urlParams.delete(key)
      } else {
        urlParams.set(key, value)
      }
    })

    const query = urlParams.toString()

    window.history.replaceState(
      window.history.state,
      '',
      query ? `${window.location.pathname}?${query}` : window.location.pathname
    )
  })

  useEventListener(window, 'popstate', () => {
    urlParams.forEach((value, key) => (params[key] = value))
  })

  return {
    params,
  }
}
