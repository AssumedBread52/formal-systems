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
import { InputDescription } from '@/common/components/input-description/input-description';
import { InputHiddenSystemId } from '@/common/components/input-hidden-system-id/input-hidden-system-id';
import { InputTitle } from '@/common/components/input-title/input-title';
import { NewStatementPayload } from '@/statement/types/new-statement-payload';
import { useParams, useRouter } from 'next/navigation';
import { Fragment, ReactElement, useEffect, useState } from 'react';

const { useAddStatementMutation } = api;

const TypedAntdForm = AntdForm<NewStatementPayload>;

export const AddStatement = (): ReactElement => {
  const [open, setOpen] = useState<boolean>(false);

  const [addStatement, { isError, isLoading, isSuccess, reset }] = useAddStatementMutation();

  const { 'system-id': systemId = '' } = useParams<RouteParams>();

  const { refresh } = useRouter();

  const cancelHandler = (): void => {
    reset();

    setOpen(false);
  };

  const clickHandler = (): void => {
    setOpen(true);
  };

  useEffect((): void => {
    if (!isSuccess) {
      return;
    }

    setOpen(false);

    refresh();
  }, [refresh, isSuccess]);

  return (
    <Fragment>
      <AntdButton type='primary' onClick={clickHandler}>
        Add Statement
      </AntdButton>
      <AntdModal destroyOnClose closeIcon={null} footer={null} open={open} onCancel={cancelHandler}>
        <AntdCard styles={{ header: { textAlign: 'center' } }} title='Add Statement'>
          <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isLoading}>
            <TypedAntdForm initialValues={{ systemId }} labelCol={{ xs: { span: 24 }, sm: { span: 8 } }} onFinish={addStatement}>
              <InputTitle name='title' />
              <InputDescription name='description' />
              Distinct Variable Restrictions
              Variable Type Hypotheses
              Logical Hypotheses
              Assertion
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
              <AntdAlert closable description='Failed to add statement.' message='Error' showIcon type='error' />
            )}
          </AntdSpin>
        </AntdCard>
      </AntdModal>
    </Fragment>
  );
};
