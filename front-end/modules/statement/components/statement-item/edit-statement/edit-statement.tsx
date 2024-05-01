'use client';

import { api } from '@/app/api';
import { AntdAlert } from '@/common/components/antd-alert/antd-alert';
import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdEditOutlined } from '@/common/components/antd-edit-outlined/antd-edit-outlined';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdForm } from '@/common/components/antd-form/antd-form';
import { AntdLoadingOutlined } from '@/common/components/antd-loading-outlined/antd-loading-outlined';
import { AntdModal } from '@/common/components/antd-modal/antd-modal';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { AntdSpin } from '@/common/components/antd-spin/antd-spin';
import { InputAssertion } from '@/common/components/input-assertion/input-assertion';
import { InputDescription } from '@/common/components/input-description/input-description';
import { InputDistinctVariableRestrictions } from '@/common/components/input-distinct-variable-restrictions/input-distinct-variable-restrictions';
import { InputHiddenId } from '@/common/components/input-hidden-id/input-hidden-id';
import { InputHiddenSystemId } from '@/common/components/input-hidden-system-id/input-hidden-system-id';
import { InputLogicalHypotheses } from '@/common/components/input-logical-hypotheses/input-logical-hypotheses';
import { InputTitle } from '@/common/components/input-title/input-title';
import { InputVariableTypeHypotheses } from '@/common/components/input-variable-type-hypotheses/input-variable-type-hypotheses';
import { EditStatementPayload } from '@/statement/types/edit-statement-payload';
import { useRouter } from 'next/navigation';
import { Fragment, ReactElement, useEffect, useState } from 'react';

const { useEditStatementMutation } = api;

const TypedAntdForm = AntdForm<EditStatementPayload>;

export const EditStatement = (props: EditStatementPayload): ReactElement => {
  const [open, setOpen] = useState<boolean>(false);

  const [editStatement, { isError, isLoading, isSuccess, reset }] = useEditStatementMutation();

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
        <AntdEditOutlined />
      </AntdButton>
      <AntdModal destroyOnClose closeIcon={null} footer={null} open={open} onCancel={cancelHandler}>
        <AntdCard styles={{ header: { textAlign: 'center' } }} title='Edit Statement'>
          <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isLoading}>
            <TypedAntdForm initialValues={props} labelCol={{ xs: { span: 24 }, sm: { span: 8 } }} onFinish={editStatement}>
              <InputHiddenId />
              <InputTitle name='newTitle' />
              <InputDescription name='newDescription' />
              <InputDistinctVariableRestrictions name='newDistinctVariableRestrictions' />
              <InputVariableTypeHypotheses name='newVariableTypeHypotheses' />
              <InputLogicalHypotheses name='logicalHypotheses' />
              <InputAssertion name='newAssertion' />
              <InputHiddenSystemId />
              <AntdFormItem wrapperCol={{ xs: { span: 24 }, sm: { offset: 8 } }}>
                <AntdSpace>
                  <AntdButton htmlType='submit' type='primary'>
                    Submit
                  </AntdButton>
                  <AntdButton onClick={cancelHandler}>
                    Cancel
                  </AntdButton>
                  <AntdButton htmlType='reset'>
                    Reset
                  </AntdButton>
                </AntdSpace>
              </AntdFormItem>
            </TypedAntdForm>
            {isError && (
              <AntdAlert closable description='Failed to edit statement.' message='Error' showIcon type='error' />
            )}
          </AntdSpin>
        </AntdCard>
      </AntdModal>
    </Fragment>
  );
};
