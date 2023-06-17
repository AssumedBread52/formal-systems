'use client';

import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { useDeleteSystem } from '@/system/hooks/use-delete-system';
import { useGetSystemById } from '@/system/hooks/use-get-system-by-id';
import { useParams } from 'next/navigation';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<void>;

export const DeleteSystemForm = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  const params = useParams();

  const { 'system-id': id } = params;

  const [system, loading] = useGetSystemById(id);

  const [finishHandler, spinning, description] = useDeleteSystem();

  return (
    <AntdCard headStyle={{ textAlign: 'center' }} loading={loading} style={{ marginLeft: 'auto', marginRight: 'auto', minWidth: '180px', width: '50vw' }} title={`Delete ${id}`}>
      <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={spinning}>
        <TypedAntdForm onFinish={() => finishHandler(system?.id ?? '')}>
          {children}
        </TypedAntdForm>
        {description && (
          <AntdAlert closable description={description} message='Error' showIcon type='error' />
        )}
      </AntdSpin>
    </AntdCard>
  );
};
