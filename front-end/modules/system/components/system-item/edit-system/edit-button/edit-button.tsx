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
import { InputDescription } from '@/common/components/input-description/input-description';
import { InputHiddenId } from '@/common/components/input-hidden-id/input-hidden-id';
import { InputTitle } from '@/common/components/input-title/input-title';
import { EditSystemPayload } from '@/system/types/edit-system-payload';
import { useRouter } from 'next/navigation';
import { Fragment, ReactElement, useEffect, useState } from 'react';

const { useEditSystemMutation } = api;

const TypedAntdForm = AntdForm<EditSystemPayload>;

export const EditButton = (props: EditSystemPayload): ReactElement => {
  const [open, setOpen] = useState<boolean>(false);

  const [editSystem, { isError, isLoading, isSuccess }] = useEditSystemMutation();

  const { refresh } = useRouter();

  useEffect((): void => {
    if (!isSuccess) {
      return;
    }

    setOpen(false);

    refresh();
  }, [refresh, isSuccess]);

  const cancelHandler = (): void => {
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
        <AntdCard headStyle={{ textAlign: 'center' }} title='Edit Formal System'>
          <AntdSpin indicator={<AntdLoadingOutlined />} size='large' spinning={isLoading}>
            <TypedAntdForm initialValues={props} labelCol={{ xs: { span: 24 }, sm: { span: 8 } }} onFinish={editSystem}>
              <InputHiddenId />
              <InputTitle name='newTitle' />
              <InputDescription name='newDescription' />
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
              <AntdAlert closable description='Failed to edit formal system.' message='Error' showIcon type='error' />
            )}
          </AntdSpin>
        </AntdCard>
      </AntdModal>
    </Fragment>
  );
};
