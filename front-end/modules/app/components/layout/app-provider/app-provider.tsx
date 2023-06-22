'use client';

import { api } from '@/app/api';
import { store } from '@/app/store';
import { PropsWithChildren, ReactElement, useEffect } from 'react';
import { Provider } from 'react-redux';

export const AppProvider = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  useEffect((): void => {
    const token = localStorage.getItem('token');

    if (!token) {
      return;
    }

    const { endpoints } = api;

    const { refreshToken } = endpoints;

    store.dispatch(refreshToken.initiate());
  }, []);

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};
