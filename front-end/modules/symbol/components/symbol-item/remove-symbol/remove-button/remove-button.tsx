'use client';

import { api } from '@/app/api';
import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdDeleteOutlined } from '@/common/components/antd-delete-outlined/antd-delete-outlined';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdModal } from '@/common/components/antd-modal/antd-modal';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { InputHiddenId } from '@/common/components/input-hidden-id/input-hidden-id';
import { InputHiddenSystemId } from '@/common/components/input-hidden-system-id/input-hidden-system-id';
import { Symbol } from '@/symbol/types/symbol';
import { useRouter } from 'next/navigation';
import { Fragment, ReactElement, useEffect, useState } from 'react';

const { useRemoveSymbolMutation } = api;

const TypedAntdForm = AntdForm<Pick<Symbol, 'id' | 'systemId'>>;

export const RemoveButton = (props: Pick<Symbol, 'id' | 'systemId'>): ReactElement => {
  const [open, setOpen] = useState<boolean>(false);

  const [removeSymbol, { isError, isLoading, isSuccess, reset }] = useRemoveSymbolMutation();

  const { refresh } = useRouter();

  useEffect((): void => {
    if (!isSuccess) {
      return;
    }

    setOpen(false);

    refresh();
  }, [refresh, isSuccess]);

  const cancelHandler = (): void => {
    reset();

    setOpen(false);
  };

  const clickHandler = (): void => {
    setOpen(true);
  };

  return (
    <Fragment>
      <AntdButton type='primary' onClick={clickHandler}>
        <AntdDeleteOutlined />
      </AntdButton>
      <AntdModal destroyOnClose closeIcon={null} footer={null} open={open} onCancel={cancelHandler}>
        <AntdCard headStyle={{ textAlign: 'center' }} title='Remove Symbol'>
          <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isLoading}>
            <TypedAntdForm initialValues={props} onFinish={removeSymbol}>
              <InputHiddenId />
              <InputHiddenSystemId />
              <AntdFormItem style={{ textAlign: 'center' }}>
                <AntdSpace direction='vertical'>
                  <AntdButton htmlType='submit' type='primary'>
                    Submit
                  </AntdButton>
                  <AntdButton onClick={cancelHandler}>
                    Cancel
                  </AntdButton>
                </AntdSpace>
              </AntdFormItem>
            </TypedAntdForm>
            {isError && (
              <AntdAlert closable description='Failed to remove symbol.' message='Error' showIcon type='error' />
            )}
          </AntdSpin>
        </AntdCard>
      </AntdModal>
    </Fragment>
  );
};
