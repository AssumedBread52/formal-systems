import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { authApi } from './auth-api';

const { reducer, reducerPath } = authApi;

let refreshTimeout: NodeJS.Timeout | null = null;

const saveToken = (token: string): void => {
  localStorage.setItem('token', token);

  refreshTimeout = setTimeout((): void => {
    authStore.dispatch(authApi.endpoints.refreshToken.initiate());
  }, 45000);
};

const refreshTokenMiddleware = createListenerMiddleware();

refreshTokenMiddleware.startListening({
  matcher: authApi.endpoints.refreshToken.matchFulfilled,
  effect: (action) => {
    const { payload } = action;
    const { token } = payload;

    saveToken(token);
  }
});

export const authStore = configureStore({
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(authApi.middleware).concat(refreshTokenMiddleware.middleware).concat((_) => {
      return (next) => {
        return (action) => {
          if (authApi.endpoints.signInUser.matchFulfilled(action)) {
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
