import localForage from 'localforage'
import throttle from 'lodash/throttle'
import { Store } from 'pinia'
import { watch } from 'vue'

localForage.config({
  name: 'Astral',
  storeName: 'astral_local_store',
})

export const useSyncToLocalStorage = async <TStore extends Store, TKey extends keyof TStore>(
  store: TStore,
  key: TKey
): Promise<void> => {
  // Leading + trailing throttle: a single commit (e.g. the full star list) is written
  // immediately, while bursts of rapid mutations collapse into at most one write per window.
  const persist = throttle(
    (value: TStore[TKey]) => {
      localForage.setItem(key as string, JSON.parse(JSON.stringify(value)))
    },
    800,
    { leading: true, trailing: true }
  )

  watch(
    () => store[key],
    newVal => persist(newVal)
  )

  const storedValue = (await localForage.getItem(key as string)) as Nullable<TStore[TKey]>

  if (storedValue !== null) {
    store[key] = storedValue
  }

  return Promise.resolve()
}
