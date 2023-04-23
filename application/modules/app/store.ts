import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api-slice';

const { middleware, reducer, reducerPath } = apiSlice;

export const appStore = configureStore({
  reducer: {
    [reducerPath]: reducer
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(middleware)
  }
});
