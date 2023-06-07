import { AnyAction, Dispatch, Middleware, MiddlewareArray, configureStore } from '@reduxjs/toolkit';
import { api } from './api';

const { middleware, reducer, reducerPath } = api;

let refreshTimeout: null | NodeJS.Timeout = null;

export const store = configureStore({
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(middleware).concat((_) => {
      return (next) => {
        return (action) => {
          if (api.endpoints.refreshToken.matchFulfilled(action) || api.endpoints.signIn.matchFulfilled(action) || api.endpoints.signUp.matchFulfilled(action)) {
            const { payload } = action;
            const { token } = payload;

            localStorage.setItem('token', token);

            refreshTimeout = setTimeout(() => {
              store.dispatch(api.endpoints.refreshToken.initiate());
            }, 45000);
          } else if (api.endpoints.refreshToken.matchRejected(action) || api.endpoints.signOut.matchFulfilled(action)) {
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
