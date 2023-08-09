'use client';

import { api } from '@/app/api';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { PropsWithChildren, ReactElement } from 'react';
import { EditProfileForm } from './edit-profile-form/edit-profile-form';

const { useSessionUserQuery } = api;

export const ProfileCard = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  const { data, isLoading, isSuccess } = useSessionUserQuery();

  return (
    <AntdCard headStyle={{ textAlign: 'center' }} style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '600px' }} loading={isLoading} title='Edit Profile'>
      {isSuccess && (
        <EditProfileForm newFirstName={data.firstName} newLastName={data.lastName} newEmail={data.email}>
          {children}
        </EditProfileForm>
      )}
    </AntdCard>
  );
};
