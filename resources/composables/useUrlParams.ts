import { reactive, watch } from 'vue'
import { useEventListener } from '@vueuse/core'

interface UseUrlParamsReturnValue {
  params: Record<string, string | null>
  clearParams: () => void
}

export const useUrlParams = (): UseUrlParamsReturnValue => {
  const urlParams = new URLSearchParams(location.search || '')
  const params: Record<string, string | null> = reactive(Object.assign({}))

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
    if (!Object.keys(params).length) {
      clearParams()
    } else {
      window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`)
    }
  })

  const clearParams = () => {
    Object.keys(params).forEach(key => {
      urlParams.delete(key)
      params[key] = null
      window.history.pushState(null, document.title, window.location.pathname)
    })
  }

  useEventListener(window, 'popstate', () => {
    urlParams.forEach((value, key) => (params[key] = value))
  })

  return {
    params,
    clearParams,
  }
}
