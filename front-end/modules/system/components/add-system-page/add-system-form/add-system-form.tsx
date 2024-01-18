'use client';

import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { useAddSystem } from '@/system/hooks/use-add-system';
import { NewSystemPayload } from '@/system/types/new-system-payload';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<NewSystemPayload>;

export const AddSystemForm = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  const [addSystem, isAddingSystem, hasFailed] = useAddSystem();

  return (
    <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isAddingSystem}>
      <TypedAntdForm labelCol={{ xs: { span: 0 }, sm: { span: 8 } }} wrapperCol={{ xs: { span: 24 }, sm: { span: 16 } }} onFinish={addSystem}>
        {children}
      </TypedAntdForm>
      {hasFailed && (
        <AntdAlert closable description='Failed to add formal system.' message='Error' showIcon type='error' />
      )}
    </AntdSpin>
  );
};
