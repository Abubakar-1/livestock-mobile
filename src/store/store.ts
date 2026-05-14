import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import authReducer from '../features/auth/authSlice';
import { baseApi } from './baseApi';

// Custom storage engine using SecureStore for native and localStorage for web
const sanitizeKey = (key: string) => key.replace(/[^a-zA-Z0-9.\-_]/g, '_');

const customStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return Promise.resolve(typeof window !== 'undefined' ? localStorage.getItem(key) : null);
    }
    return SecureStore.getItemAsync(sanitizeKey(key));
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(sanitizeKey(key), value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') localStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(sanitizeKey(key));
  },
};

const rootReducer = combineReducers({
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

const persistConfig = {
  key: 'root',
  version: 1,
  storage: customStorage,
  whitelist: ['auth'], // Only persist auth slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

