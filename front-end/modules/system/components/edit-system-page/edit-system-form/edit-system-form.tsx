'use client';

import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { useEditSystem } from '@/system/hooks/use-edit-system';
import { EditSystemPayload } from '@/system/types/edit-system-payload';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<EditSystemPayload>;

export const EditSystemForm = (props: PropsWithChildren<EditSystemPayload>): ReactElement => {
  const { children } = props;

  const [editSystem, isEditingSystem, hasFailed] = useEditSystem();

  return (
    <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isEditingSystem}>
      <TypedAntdForm initialValues={props} labelCol={{ xs: { span: 0 }, sm: { span: 8 } }} wrapperCol={{ xs: { span: 24 }, sm: { span: 16 } }} onFinish={editSystem}>
        {children}
      </TypedAntdForm>
      {hasFailed && (
        <AntdAlert closable description='Failed to edit formal system.' message='Error' showIcon type='error' />
      )}
    </AntdSpin>
  );
};
