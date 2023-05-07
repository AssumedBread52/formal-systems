import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './auth-api';

const { middleware, reducer, reducerPath } = authApi;

let refreshTimeout: NodeJS.Timeout | null = null;

export const authStore = configureStore({
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(middleware).concat((_) => {
      return (next) => {
        return (action) => {
          if (authApi.endpoints.refreshToken.matchFulfilled(action) || authApi.endpoints.signInUser.matchFulfilled(action)) {
            const { payload } = action;
            const { token } = payload;

            localStorage.setItem('token', token);

            refreshTimeout = setTimeout(() => {
              authStore.dispatch(authApi.endpoints.refreshToken.initiate());
            }, 45000);
          } else if (authApi.endpoints.refreshToken.matchRejected(action) || authApi.endpoints.signOutUser.matchFulfilled(action)) {
            localStorage.removeItem('token');

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
