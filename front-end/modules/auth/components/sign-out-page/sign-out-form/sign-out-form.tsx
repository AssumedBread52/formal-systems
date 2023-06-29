'use client';

import { useSignOut } from '@/auth/hooks/use-sign-out';
import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<void>;

export const SignOutForm = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  const [signOut, isSigningOut, hasFailed] = useSignOut();

  return (
    <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isSigningOut}>
      <TypedAntdForm onFinish={signOut}>
        {children}
      </TypedAntdForm>
      {hasFailed && (
        <AntdAlert closable description='Failed to sign out.' message='Error' showIcon type='error' />
      )}
    </AntdSpin>
  );
};
