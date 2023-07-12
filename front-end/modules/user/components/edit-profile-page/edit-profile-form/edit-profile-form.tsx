'use client';

import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { useEditProfile } from '@/user/hooks/use-edit-profile';
import { EditProfilePayload } from '@/user/types/edit-profile-payload';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<EditProfilePayload>;

export const EditProfileForm = (props: PropsWithChildren<EditProfilePayload>): ReactElement => {
  const { children } = props;

  const [editProfile, isEditingProfile, hasFailed] = useEditProfile();

  return (
    <AntdCard headStyle={{ textAlign: 'center' }} style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '600px' }} title='Edit Profile'>
      <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isEditingProfile}>
        <TypedAntdForm initialValues={props} labelCol={{ xs: { span: 0 }, sm: { span: 8 } }} wrapperCol={{ xs: { span: 24 }, sm: { span: 16 } }} onFinish={editProfile}>
          {children}
        </TypedAntdForm>
        {hasFailed && (
          <AntdAlert closable description='Failed to edit profile.' message='Error' showIcon type='error' />
        )}
      </AntdSpin>
    </AntdCard>
  );
};
