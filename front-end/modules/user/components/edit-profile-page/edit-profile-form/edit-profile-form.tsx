'use client';

import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { useEditProfile } from '@/user/hooks/use-edit-profile';
import { useSessionUser } from '@/user/hooks/use-session-user';
import { EditProfilePayload } from '@/user/types/edit-profile-payload';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<EditProfilePayload>;

export const EditProfileForm = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  const [user, loading] = useSessionUser();

  const [editProfile, isEditingProfile, hasFailed] = useEditProfile();

  let initialValues = {};
  if (user) {
    const { firstName, lastName, email } = user;

    initialValues = {
      newFirstName: firstName,
      newLastName: lastName,
      newEmail: email
    };
  }

  return (
    <AntdCard headStyle={{ textAlign: 'center' }} loading={loading} style={{ marginLeft: 'auto', marginRight: 'auto', minWidth: '180px', width: '50vw' }} title='Edit Profile'>
      <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isEditingProfile}>
        <TypedAntdForm initialValues={initialValues} labelCol={{ sm: { span: 0 }, md: { span: 8 } }} wrapperCol={{ sm: { span: 24 }, md: { span: 16 } }} onFinish={editProfile}>
          {children}
        </TypedAntdForm>
        {hasFailed && (
          <AntdAlert closable description='Failed to edit profile.' message='Error' showIcon type='error' />
        )}
      </AntdSpin>
    </AntdCard>
  );
};
