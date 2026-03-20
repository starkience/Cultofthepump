import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query/react'
import localForage from 'localforage'
import { PersistConfig, persistReducer } from 'redux-persist'
import { updateVersion } from 'state/global/actions'
import { INDEXED_DB_REDUX_TABLE_NAME, PERSIST_VERSION } from 'state/migrations'
import { InterfaceState, interfacePersistedStateList, interfaceReducer } from 'state/webReducer'
import { isDevEnv, isTestEnv } from 'utilities/src/environment/env'

const persistConfig: PersistConfig<InterfaceState> = {
  key: 'interface',
  version: PERSIST_VERSION,
  storage: localForage.createInstance({
    name: INDEXED_DB_REDUX_TABLE_NAME,
    driver: localForage.LOCALSTORAGE,
  }),
  whitelist: interfacePersistedStateList,
  throttle: 1000, // ms
  serialize: false,
  // The typescript definitions are wrong - we need this to be false for unserialized storage to work.
  // We need unserialized storage for inspectable db entries for debugging.
  // @ts-ignore
  deserialize: false,
  debug: isDevEnv(),
}

const persistedReducer = persistReducer(persistConfig, interfaceReducer)

function createDefaultStore() {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: isTestEnv()
          ? false
          : {
              warnAfter: 128,
              // meta.arg and meta.baseQueryMeta are defaults. payload.trade is a nonserializable return value, but that's ok
              // because we are not adding it into any persisted store that requires serialization (e.g. localStorage)
              ignoredActionPaths: ['meta.arg', 'meta.baseQueryMeta', 'payload.trade'],
              ignoredActions: [
                // ignore the redux-persist actions
                'persist/PERSIST',
                'persist/REHYDRATE',
                'persist/PURGE',
                'persist/FLUSH',
              ],
            },
      }),
  })

  return store
}

const store = createDefaultStore()

setupListeners(store.dispatch)

store.dispatch(updateVersion())

export default store
