import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { CancelButton } from '@/common/components/cancel-button/cancel-button';
import { InputEmail } from '@/common/components/input-email/input-email';
import { InputFirstName } from '@/common/components/input-first-name/input-first-name';
import { InputLastName } from '@/common/components/input-last-name/input-last-name';
import { InputPassword } from '@/common/components/input-password/input-password';
import { fetchSessionUser } from '@/user/fetch-data/fetch-session-user';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { EditProfileForm } from './edit-profile-form/edit-profile-form';

export const EditProfilePage = async (): Promise<ReactElement> => {
  const { firstName, lastName, email } = await fetchSessionUser();

  return (
    <AntdCard styles={{ header: { textAlign: 'center' } }} style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '600px' }} title='Edit Profile'>
      <EditProfileForm newFirstName={firstName} newLastName={lastName} newEmail={email}>
        <InputFirstName name='newFirstName' />
        <InputLastName name='newLastName' />
        <InputEmail name='newEmail' />
        <InputPassword name='newPassword' optional />
        <AntdFormItem wrapperCol={{ xs: { span: 24 }, sm: { offset: 8 } }}>
          <AntdSpace wrap>
            <AntdButton htmlType='submit' type='primary'>
              Submit
            </AntdButton>
            <CancelButton />
            <AntdButton htmlType='reset'>
              Reset
            </AntdButton>
          </AntdSpace>
        </AntdFormItem>
      </EditProfileForm>
    </AntdCard>
  );
};

export const metadata = {
  title: 'Edit Profile'
} as Metadata;
