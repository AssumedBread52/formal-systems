'use client';

import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { useRemoveSymbol } from '@/symbol/hooks/use-remove-symbol';
import { Symbol } from '@/symbol/types/symbol';
import { PropsWithChildren, ReactElement } from 'react';

const TypedAntdForm = AntdForm<Pick<Symbol, 'id' | 'systemId'>>;

export const RemoveSymbolForm = (props: PropsWithChildren<Pick<Symbol, 'id' | 'systemId'>>): ReactElement => {
  const { children } = props;

  const [removeSymbol, isRemovingSymbol, hasFailed] = useRemoveSymbol();

  return (
    <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isRemovingSymbol}>
      <TypedAntdForm initialValues={props} onFinish={removeSymbol}>
        {children}
      </TypedAntdForm>
      {hasFailed && (
        <AntdAlert closable description='Failed to remove symbol.' message='Error' showIcon type='error' />
      )}
    </AntdSpin>
  );
};
