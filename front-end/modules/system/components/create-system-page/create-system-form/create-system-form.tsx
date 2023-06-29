'use client';

import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { useCreateSystem } from '@/system/hooks/use-create-system';
import { NewSystemPayload } from '@/system/types/new-system-payload';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<NewSystemPayload>;

export const CreateSystemForm = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  const [createSystem, isCreatingSystem, hasFailed] = useCreateSystem();

  return (
    <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isCreatingSystem}>
      <TypedAntdForm labelCol={{ sm: { span: 0 }, md: { span: 8 } }} wrapperCol={{ sm: { span: 24 }, md: { span: 16 } }} onFinish={createSystem}>
        {children}
      </TypedAntdForm>
      {hasFailed && (
        <AntdAlert closable description='Failed to create formal system.' message='Error' showIcon type='error' />
      )}
    </AntdSpin>
  );
};
