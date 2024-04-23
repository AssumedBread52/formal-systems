'use client';

import { api } from '@/app/api';
import { RouteParams } from '@/app/types/route-params';
import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdModal } from '@/common/components/antd-modal/antd-modal';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { InputContent } from '@/common/components/input-content/input-content';
import { InputDescription } from '@/common/components/input-description/input-description';
import { InputHiddenSystemId } from '@/common/components/input-hidden-system-id/input-hidden-system-id';
import { InputSymbolType } from '@/common/components/input-symbol-type/input-symbol-type';
import { InputTitle } from '@/common/components/input-title/input-title';
import { NewSymbolPayload } from '@/symbol/types/new-symbol-payload';
import { useParams, useRouter } from 'next/navigation';
import { Fragment, ReactElement, useEffect, useState } from 'react';

const { useAddSymbolMutation } = api;

const TypedAntdForm = AntdForm<NewSymbolPayload>;

export const AddSymbol = (): ReactElement => {
  const [open, setOpen] = useState<boolean>(false);

  const [addSymbol, { isError, isLoading, isSuccess, reset }] = useAddSymbolMutation();

  const { 'system-id': systemId = '' } = useParams<RouteParams>();

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
        Add Symbol
      </AntdButton>
      <AntdModal destroyOnClose closeIcon={null} footer={null} open={open} onCancel={cancelHandler}>
        <AntdCard styles={{ header: { textAlign: 'center' } }} title='Add Symbol'>
          <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isLoading}>
            <TypedAntdForm initialValues={{ systemId }} labelCol={{ xs: { span: 24 }, sm: { span: 8 } }} onFinish={addSymbol}>
              <InputTitle name='title' />
              <InputDescription name='description' />
              <InputSymbolType name='type' />
              <InputContent name='content' />
              <InputHiddenSystemId />
              <AntdFormItem wrapperCol={{ xs: { span: 24 }, sm: { offset: 8 } }}>
                <AntdSpace>
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
              <AntdAlert closable description='Failed to add symbol.' message='Error' showIcon type='error' />
            )}
          </AntdSpin>
        </AntdCard>
      </AntdModal>
    </Fragment>
  );
};
