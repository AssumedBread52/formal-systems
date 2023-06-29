'use client';

import { useSignUp } from '@/auth/hooks/use-sign-up';
import { SignUpPayload } from '@/auth/types/sign-up-payload';
import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<SignUpPayload>;

export const SignUpForm = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  const [signUp, isSigningUp, hasFailed] = useSignUp();

  return (
    <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isSigningUp}>
      <TypedAntdForm labelCol={{ xs: { span: 0 }, sm: { span: 8 } }} wrapperCol={{ xs: { span: 24 }, sm: { span: 16 } }} onFinish={signUp}>
        {children}
      </TypedAntdForm>
      {hasFailed && (
        <AntdAlert closable description='Failed to sign up.' message='Error' showIcon type='error' />
      )}
    </AntdSpin>
  );
};
