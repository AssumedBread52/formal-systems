import { authApi } from '@/auth/auth-api';
import { authStore } from '@/auth/auth-store';
import { PropsWithChildren, ReactElement, useEffect } from 'react';
import { Provider } from 'react-redux';

export const AuthProvider = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  useEffect((): void => {
    const token = localStorage.getItem('token');

    if (token) {
      authStore.dispatch(authApi.endpoints.refreshToken.initiate());
    }
  }, []);

  return (
    <Provider store={authStore}>
      {children}
    </Provider>
  );
};
