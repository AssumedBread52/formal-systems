'use client';

import { useIsAuthorized } from '@/auth/hooks/use-is-authorized';
import { ProtectedContentProps } from '@/auth/types/protected-content-props';
import { Fragment, PropsWithChildren, ReactElement } from 'react';

export const ProtectedContent = (props: PropsWithChildren<ProtectedContentProps>): ReactElement => {
  const { children, userId } = props;

  const isAuthorized = useIsAuthorized(userId);

  return (
    <Fragment>
      {isAuthorized && children}
    </Fragment>
  );
};
