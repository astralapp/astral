import { reactive } from 'vue'

interface ConfirmConfig {
  isOpen: boolean
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  confirm: () => void
  cancel: () => void
}

type ConfirmOptions = Pick<ConfirmConfig, 'confirmLabel' | 'cancelLabel'>

const confirmConfig = reactive<ConfirmConfig>({
  isOpen: false,
  message: '',
  confirmLabel: 'Ok',
  cancelLabel: 'Cancel',
  confirm: () => ({}),
  cancel: () => ({}),
})

export const useConfirm = () => {
  const isConfirmed = (message: string, options: ConfirmOptions = {}): Promise<boolean> => {
    const confirmPromise = new Promise((resolve, reject) => {
      Object.assign(confirmConfig, {
        ...options,
        isOpen: true,
        message,
        confirm: resolve,
        cancel: reject,
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
    isConfirmed,
    confirmConfig,
  }
}
