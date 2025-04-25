// store.ts
import { configureStore, Middleware } from '@reduxjs/toolkit';
import authReducer from '@/store/authSlice';
import { useDispatch } from 'react-redux';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  // Add any middleware if needed here.
  // You may want to disable serializable state invariant checks in production.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }) as Middleware[],
});

// Optional: Typed hooks
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export type RootState = ReturnType<typeof store.getState>;
