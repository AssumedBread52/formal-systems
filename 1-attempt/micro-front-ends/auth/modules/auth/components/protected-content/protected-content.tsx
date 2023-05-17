import { useReadSessionUserId } from '@/auth/hooks';
import { ProtectedContentProps } from '@/auth/types';
import { Fragment, PropsWithChildren, ReactElement } from 'react';

export const ProtectedContent = (props: PropsWithChildren<ProtectedContentProps>): ReactElement => {
  const { invert, userId, children } = props;

  const authorized = useReadSessionUserId(userId);

  const show = (authorized && !invert) || (!authorized && invert);

  return (
    <Fragment>
      {show && children}
    </Fragment>
  );
};
