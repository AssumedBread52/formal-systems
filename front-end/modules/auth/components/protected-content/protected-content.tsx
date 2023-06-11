'use client';

import { useIsAuthorized } from '@/auth/hooks/use-is-authorized';
import { Fragment, PropsWithChildren, ReactElement } from 'react';

export const ProtectedContent = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  const isAuthorized = useIsAuthorized();

  return (
    <Fragment>
      {isAuthorized && children}
    </Fragment>
  );
};
