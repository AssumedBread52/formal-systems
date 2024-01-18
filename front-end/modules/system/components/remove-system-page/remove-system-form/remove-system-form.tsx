'use client';

import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { useRemoveSystem } from '@/system/hooks/use-remove-system';
import { System } from '@/system/types/system';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<Pick<System, 'id'>>;

export const RemoveSystemForm = (props: PropsWithChildren<Pick<System, 'id'>>): ReactElement => {
  const { children } = props;

  const [removeSystem, isRemovingSystem, hasFailed] = useRemoveSystem();

  return (
    <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isRemovingSystem}>
      <TypedAntdForm initialValues={props} onFinish={removeSystem}>
        {children}
      </TypedAntdForm>
      {hasFailed && (
        <AntdAlert closable description='Failed to remove formal system.' message='Error' showIcon type='error' />
      )}
    </AntdSpin>
  );
};
