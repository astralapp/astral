type ReactiveFlashBag = {
  error: ComputedRef<null | string>
  success: ComputedRef<null | string>
}
export function useFlashBag(): ReactiveFlashBag {
  const flash = useProperty('flash')

  return {
    error: computed(() => flash.value?.error ?? null),
    success: computed(() => flash.value?.success ?? null),
  }
}
