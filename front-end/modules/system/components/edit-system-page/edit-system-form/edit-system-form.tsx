'use client';

import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { useEditSystem } from '@/system/hooks/use-edit-system';
import { useGetSystemByUrlPath } from '@/system/hooks/use-get-system-by-url-path';
import { EditSystemPayload } from '@/system/types/edit-system-payload';
import { useParams } from 'next/navigation';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<EditSystemPayload>;

export const EditSystemForm = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  const params = useParams();
  const { 'system-url-path': urlPath } = params;

  const [system, loading] = useGetSystemByUrlPath(urlPath);

  const [finishHandler, spinning, description] = useEditSystem();

  let initialValues = {};
  if (system) {
    const { title, description } = system;

    initialValues = {
      newTitle: title,
      newDescription: description
    };
  }

  return (
    <AntdCard headStyle={{ textAlign: 'center' }} loading={loading} style={{ marginLeft: 'auto', marginRight: 'auto', minWidth: '180px', width: '50vw' }} title={`Edit ${decodeURIComponent(urlPath)}`}>
      <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={spinning}>
        <TypedAntdForm initialValues={initialValues} labelCol={{ sm: { span: 0 }, md: { span: 8 } }} wrapperCol={{ sm: { span: 24 }, md: { span: 16 } }} onFinish={finishHandler}>
          {children}
        </TypedAntdForm>
        {description && (
          <AntdAlert closable description={description} message='Error' showIcon type='error' />
        )}
      </AntdSpin>
    </AntdCard>
  );
};
