'use client';

import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { IdPayload } from '@/common/types/id-payload';
import { useAddSymbol } from '@/symbol/hooks/use-add-symbol';
import { NewSymbolPayload } from '@/symbol/types/new-symbol-payload';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<NewSymbolPayload>;

export const AddSymbolForm = (props: PropsWithChildren<IdPayload>): ReactElement => {
  const { id, children } = props;

  const [addSymbol, isAddingSymbol, hasFailed] = useAddSymbol();

  return (
    <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isAddingSymbol}>
      <TypedAntdForm initialValues={{ systemId: id }} labelCol={{ xs: { span: 0 }, sm: { span: 8 } }} wrapperCol={{ xs: { span: 24 }, sm: { span: 16 } }} onFinish={addSymbol}>
        {children}
      </TypedAntdForm>
      {hasFailed && (
        <AntdAlert closable description='Failed to add symbol.' message='Error' showIcon type='error' />
      )}
    </AntdSpin>
  );
};
