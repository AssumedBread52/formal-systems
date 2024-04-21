import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { CancelButton } from '@/common/components/cancel-button/cancel-button';
import { InputEmail } from '@/common/components/input-email/input-email';
import { InputFirstName } from '@/common/components/input-first-name/input-first-name';
import { InputLastName } from '@/common/components/input-last-name/input-last-name';
import { InputPassword } from '@/common/components/input-password/input-password';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { SignUpForm } from './sign-up-form/sign-up-form';

export const SignUpPage = (): ReactElement => {
  return (
    <AntdCard styles={{ header: { textAlign: 'center' } }} style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '600px' }} title='Sign Up'>
      <SignUpForm>
        <InputFirstName name='firstName' />
        <InputLastName name='lastName' />
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
      </SignUpForm>
    </AntdCard>
  );
};

export const metadata = {
  title: 'Sign Up'
} as Metadata;
