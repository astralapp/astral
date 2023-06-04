import { watch, ComputedRef } from 'vue'
import { Store } from 'pinia'

type StoreSyncTuple<TStore extends Store, TKey extends keyof TStore['$state']> = [
  TStore,
  TKey,
  ComputedRef<TStore[TKey]>
]

type MappedStoreSyncTuples<T> = {
  [K in keyof T]: T[K] extends Store ? StoreSyncTuple<T[K], keyof T[K]['$state']> & { length: 3 } : never
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSyncValuesToStores = <T extends any[]>(...mappings: MappedStoreSyncTuples<T>): void => {
  mappings.forEach(([store, key, propGetter]) => {
    watch(
      propGetter,
      propValue => {
        store[key] = propValue
      },
      {
        immediate: true,
      }
    )
  })
}
