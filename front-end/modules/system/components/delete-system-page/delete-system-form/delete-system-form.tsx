'use client';

import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { IdPayload } from '@/common/types/id-payload';
import { useDeleteSystem } from '@/system/hooks/use-delete-system';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<IdPayload>;

export const DeleteSystemForm = (props: PropsWithChildren<IdPayload>): ReactElement => {
  const { children } = props;

  const [deleteSystem, isDeletingSystem, hasFailed] = useDeleteSystem();

  return (
    <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isDeletingSystem}>
      <TypedAntdForm initialValues={props} onFinish={deleteSystem}>
        {children}
      </TypedAntdForm>
      {hasFailed && (
        <AntdAlert closable description='Failed to delete formal system.' message='Error' showIcon type='error' />
      )}
    </AntdSpin>
  );
};
