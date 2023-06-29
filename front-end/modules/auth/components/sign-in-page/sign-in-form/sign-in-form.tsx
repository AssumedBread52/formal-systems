'use client';

import { useSignIn } from '@/auth/hooks/use-sign-in';
import { SignInPayload } from '@/auth/types/sign-in-payload';
import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<SignInPayload>;

export const SignInForm = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  const [signIn, isSigningIn, hasFailed] = useSignIn();

  return (
    <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isSigningIn}>
      <TypedAntdForm labelCol={{ xs: { span: 0 },  sm: { span: 8 } }} wrapperCol={{ xs: { span: 24 }, sm: { span: 16 } }} onFinish={signIn}>
        {children}
      </TypedAntdForm>
      {hasFailed && (
        <AntdAlert closable description='Failed to sign in.' message='Error' showIcon type='error' />
      )}
    </AntdSpin>
  );
};
