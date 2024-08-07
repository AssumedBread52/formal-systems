import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { CancelButton } from '@/common/components/cancel-button/cancel-button';
import { InputEmail } from '@/common/components/input-email/input-email';
import { InputPassword } from '@/common/components/input-password/input-password';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { SignInForm } from './sign-in-form/sign-in-form';

export const SignInPage = (): ReactElement => {
  return (
    <AntdCard styles={{ header: { textAlign: 'center' } }} style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '600px' }} title='Sign In'>
      <SignInForm>
        <InputEmail name='email' />
        <InputPassword name='password' />
        <AntdFormItem wrapperCol={{ xs: { span: 24 }, sm: { offset: 8 } }}>
          <AntdSpace wrap>
            <AntdButton htmlType='submit' type='primary'>
              Submit
            </AntdButton>
            <CancelButton />
          </AntdSpace>
        </AntdFormItem>
      </SignInForm>
    </AntdCard>
  );
};

export const metadata = {
  title: 'Sign In'
} as Metadata;
