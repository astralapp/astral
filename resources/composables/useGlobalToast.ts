import { Ref, ref } from 'vue'
import { sleep } from '@/scripts/utils'

export enum ToastType {
  Success = 'success',
  Error = 'error',
}

interface GlobalToastReturnType {
  show: (message: string, type?: ToastType) => void
  isVisible: Ref<boolean>
  currentMessage: Ref<string>
  currentType: Ref<ToastType>
}

const isVisible = ref(false)
const currentMessage = ref('')
const currentType = ref(ToastType.Success)

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
    show,
    isVisible,
    currentMessage,
    currentType,
  }
}
