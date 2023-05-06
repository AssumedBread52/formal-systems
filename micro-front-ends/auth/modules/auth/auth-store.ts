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
const signInMiddleware = createListenerMiddleware();
const signOutMiddleware = createListenerMiddleware();
const expireMiddleware = createListenerMiddleware();

refreshTokenMiddleware.startListening({
  matcher: authApi.endpoints.refreshToken.matchFulfilled,
  effect: (action) => {
    const { payload } = action;
    const { token } = payload;

    saveToken(token);
  }
});

signInMiddleware.startListening({
  matcher: authApi.endpoints.signInUser.matchFulfilled,
  effect: (action) => {
    const { payload } = action;
    const { token } = payload;

    saveToken(token);
  }
});

signOutMiddleware.startListening({
  matcher: authApi.endpoints.signOutUser.matchFulfilled,
  effect: () => {
    localStorage.removeItem('token');

    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
  }
});

expireMiddleware.startListening({
  matcher: authApi.endpoints.refreshToken.matchRejected,
  effect: () => {
    localStorage.removeItem('token');

    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
  }
})

export const authStore = configureStore({
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(authApi.middleware).concat(signInMiddleware.middleware).concat(signOutMiddleware.middleware).concat(refreshTokenMiddleware.middleware).concat(expireMiddleware.middleware);
  },
  reducer: {
    [reducerPath]: reducer
  }
});
