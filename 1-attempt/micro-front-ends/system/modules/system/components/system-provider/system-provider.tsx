import { systemApi } from '@/system/system-api';
import { ApiProvider } from '@reduxjs/toolkit/dist/query/react';
import { PropsWithChildren, ReactElement } from 'react';

export const SystemProvider = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  return (
    <ApiProvider api={systemApi}>
      {children}
    </ApiProvider>
  );
};
