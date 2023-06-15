export function useFlashBag(): App.Data.FlashBagData {
  const flash = useProperty('flash')

  return {
    error: flash.value?.error ?? null,
    success: flash.value?.success ?? null,
  }
}
