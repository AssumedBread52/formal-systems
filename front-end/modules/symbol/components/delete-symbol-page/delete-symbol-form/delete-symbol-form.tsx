'use client';

import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { useDeleteSymbol } from '@/symbol/hooks/use-delete-symbol';
import { DeleteSymbolPayload } from '@/symbol/types/delete-symbol-payload';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<DeleteSymbolPayload>;

export const DeleteSymbolForm = (props: PropsWithChildren<DeleteSymbolPayload>): ReactElement => {
  const { children } = props;

  const [deleteSymbol, isDeletingSymbol, hasFailed] = useDeleteSymbol();

  return (
    <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isDeletingSymbol}>
      <TypedAntdForm initialValues={props} onFinish={deleteSymbol}>
        {children}
      </TypedAntdForm>
      {hasFailed && (
        <AntdAlert closable description='Failed to delete symbol.' message='Error' showIcon type='error' />
      )}
    </AntdSpin>
  );
};
