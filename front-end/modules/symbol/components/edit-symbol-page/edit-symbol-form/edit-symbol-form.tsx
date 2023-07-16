'use client';

import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { useEditSymbol } from '@/symbol/hooks/use-edit-symbol';
import { EditSymbolPayload } from '@/symbol/types/edit-symbol-payload';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<EditSymbolPayload>;

export const EditSymbolForm = (props: PropsWithChildren<EditSymbolPayload>): ReactElement => {
  const { children } = props;

  const [editSymbol, isEditingSymbol, hasFailed] = useEditSymbol();

  return (
    <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isEditingSymbol}>
      <TypedAntdForm initialValues={props} labelCol={{ xs: { span: 0 }, sm: { span: 8 } }} wrapperCol={{ xs: { span: 24 }, sm: { span: 16 } }} onFinish={editSymbol}>
        {children}
      </TypedAntdForm>
      {hasFailed && (
        <AntdAlert closable description='Failed to edit symbol.' message='Error' showIcon type='error' />
      )}
    </AntdSpin>
  );
};
