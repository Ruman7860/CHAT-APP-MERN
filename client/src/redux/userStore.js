import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage as storage
import userReducer from './userSlice'; // Import your slice (e.g., userSlice)

const rootReducer = combineReducers({
  user: userReducer, // Add other reducers if needed
});

// Configuration for redux-persist
const persistConfig = {
  key: 'root', // The key used in localStorage to store the state
  storage, // Use localStorage (or sessionStorage) as the storage option
  version: 1, // Optional versioning for persistence
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer, // Use the persisted reducer
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check to avoid issues with non-serializable data
    }),
});

export const persistor = persistStore(store); // This is used to persist the store