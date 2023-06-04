import { watch } from 'vue'
import localForage from 'localforage'
import { Store } from 'pinia'

localForage.config({
  name: 'Astral',
  storeName: 'astral_local_store',
})

export const useSyncToLocalStorage = async <TStore extends Store, TKey extends keyof TStore>(
  store: TStore,
  key: TKey
): Promise<void> => {
  let storedValue: Nullable<TStore[TKey]> = null
  watch(
    () => store[key],
    async newVal => {
      await localForage.setItem(key as string, JSON.parse(JSON.stringify(newVal)))
    }
  )

  storedValue = (await localForage.getItem(key as string)) as TStore[TKey]

  if (storedValue) {
    store[key] = storedValue
  }

  return Promise.resolve()
}
