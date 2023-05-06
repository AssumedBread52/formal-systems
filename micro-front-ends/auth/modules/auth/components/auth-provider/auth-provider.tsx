import { authStore } from '@/auth/auth-store';
import { PropsWithChildren, ReactElement } from 'react';
import { Provider } from 'react-redux';

export const AuthProvider = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  return (
    <Provider store={authStore}>
      {children}
    </Provider>
  );
};
