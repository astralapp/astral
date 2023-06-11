import { reactive } from 'vue'

interface ConfirmConfig {
  cancel: () => void
  cancelLabel?: string
  confirm: () => void
  confirmLabel?: string
  isOpen: boolean
  message?: string
}

type ConfirmOptions = Pick<ConfirmConfig, 'cancelLabel' | 'confirmLabel'>

const confirmConfig = reactive<ConfirmConfig>({
  cancel: () => ({}),
  cancelLabel: 'Cancel',
  confirm: () => ({}),
  confirmLabel: 'Ok',
  isOpen: false,
  message: '',
})

export const useConfirm = () => {
  const isConfirmed = (message: string, options: ConfirmOptions = {}): Promise<boolean> => {
    const confirmPromise = new Promise((resolve, reject) => {
      Object.assign(confirmConfig, {
        ...options,
        cancel: reject,
        confirm: resolve,
        isOpen: true,
        message,
      })
    })

    return confirmPromise.then(
      () => {
        confirmConfig.isOpen = false
        return true
      },
      () => {
        confirmConfig.isOpen = false
        return false
      }
    )
  }

  return {
    confirmConfig,
    isConfirmed,
  }
}
