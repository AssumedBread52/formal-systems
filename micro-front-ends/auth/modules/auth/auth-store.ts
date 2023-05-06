import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './auth-api';

const { middleware, reducer, reducerPath } = authApi;

export const authStore = configureStore({
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(middleware);
  },
  reducer: {
    [reducerPath]: reducer
  }
});
