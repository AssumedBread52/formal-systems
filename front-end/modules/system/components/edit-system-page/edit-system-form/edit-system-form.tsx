'use client';

import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { useEditSystem } from '@/system/hooks/use-edit-system';
import { useGetSystemById } from '@/system/hooks/use-get-system-by-id';
import { EditSystemPayload } from '@/system/types/edit-system-payload';
import { useParams } from 'next/navigation';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<EditSystemPayload>;

export const EditSystemForm = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  const params = useParams();
  const { 'system-id': id } = params;

  const [system] = useGetSystemById(id);

  const [editSystem, isEditingSystem, hasFailed] = useEditSystem();

  let initialValues = {};
  if (system) {
    const { title, description } = system;

    initialValues = {
      newTitle: title,
      newDescription: description
    };
  }

  return (
    <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isEditingSystem}>
      <TypedAntdForm initialValues={initialValues} labelCol={{ sm: { span: 0 }, md: { span: 8 } }} wrapperCol={{ sm: { span: 24 }, md: { span: 16 } }} onFinish={editSystem}>
        {children}
      </TypedAntdForm>
      {hasFailed && (
        <AntdAlert closable description='Failed to edit formal system.' message='Error' showIcon type='error' />
      )}
    </AntdSpin>
  );
};
