import { sleep } from '@/utils'
import { Ref, ref } from 'vue'

export const ToastType = {
  Error: 'error',
  Success: 'success',
} as const
export type ToastType = Values<typeof ToastType>

interface GlobalToastReturnType {
  currentMessage: Ref<string>
  currentType: Ref<ToastType>
  isVisible: Ref<boolean>
  show: (message: string, type?: ToastType) => void
}

const isVisible = ref(false)
const currentMessage = ref('')
const currentType = ref<ToastType>(ToastType.Success)

let timeout: ReturnType<typeof setTimeout>
const DURATION = 3750

export const useGlobalToast = (): GlobalToastReturnType => {
  const show = async (message: string, type: ToastType = ToastType.Success) => {
    clearTimeout(timeout)

    currentMessage.value = message
    currentType.value = type

    await sleep(1)

    isVisible.value = true

    timeout = setTimeout(() => {
      isVisible.value = false
    }, DURATION)
  }

  return {
    currentMessage,
    currentType,
    isVisible,
    show,
  }
}
