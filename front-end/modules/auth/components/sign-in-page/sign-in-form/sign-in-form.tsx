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

  const [finishHandler, spinning, description] = useSignIn();

  return (
    <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={spinning}>
      <TypedAntdForm labelCol={{ sm: { span: 0 },  md: { span: 8 } }} wrapperCol={{ sm: { span: 24 }, md: { span: 16 } }} onFinish={finishHandler}>
        {children}
      </TypedAntdForm>
      {description && (
        <AntdAlert closable description={description} message='Error' showIcon type='error' />
      )}
    </AntdSpin>
  );
};
