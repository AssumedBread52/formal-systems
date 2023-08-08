import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';

const { middleware, reducer, reducerPath } = api;

let refreshTimeout: NodeJS.Timeout | null = null;

export const store = configureStore({
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(middleware).concat((_) => {
      return (next) => {
        return (action) => {
          const { endpoints } = api;

          const { refreshToken, signIn, signUp, signOut } = endpoints;

          if (refreshToken.matchFulfilled(action) || signIn.matchFulfilled(action) || signUp.matchFulfilled(action)) {
            refreshTimeout = setTimeout(() => {
              store.dispatch(api.endpoints.refreshToken.initiate());
            }, 45000);
          } else if (refreshToken.matchRejected(action) || signOut.matchFulfilled(action)) {
            if (refreshTimeout) {
              clearTimeout(refreshTimeout);
            }
          }

          return next(action);
        };
      };
    });
  },
  reducer: {
    [reducerPath]: reducer
  }
});
