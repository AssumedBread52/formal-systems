'use client';

import { RouteParams } from '@/app/types/route-params';
import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { useAddSymbol } from '@/symbol/hooks/use-add-symbol';
import { NewSymbolPayload } from '@/symbol/types/new-symbol-payload';
import { useParams } from 'next/navigation';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<NewSymbolPayload>;

export const AddSymbolForm = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  const { 'system-id': systemId = '' } = useParams<RouteParams>();

  const [addSymbol, isAddingSymbol, hasFailed] = useAddSymbol();

  return (
    <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isAddingSymbol}>
      <TypedAntdForm initialValues={{ systemId }} labelCol={{ xs: { span: 0 }, sm: { span: 8 } }} wrapperCol={{ xs: { span: 24 }, sm: { span: 16 } }} onFinish={addSymbol}>
        {children}
      </TypedAntdForm>
      {hasFailed && (
        <AntdAlert closable description='Failed to add symbol.' message='Error' showIcon type='error' />
      )}
    </AntdSpin>
  );
};
