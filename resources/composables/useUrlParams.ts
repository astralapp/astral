import { useEventListener } from '@vueuse/core'
import { reactive, watch } from 'vue'

interface UseUrlParamsReturnValue {
  clearParams: () => void
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
    if (!Object.keys(params).length) {
      clearParams()
    } else {
      window.history.replaceState(window.history.state, '', `${window.location.pathname}?${urlParams.toString()}`)
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
    clearParams,
    params,
  }
}
