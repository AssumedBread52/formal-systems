import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { CancelButton } from '@/common/components/cancel-button/cancel-button';
import { InputDescription } from '@/common/components/input-description/input-description';
import { InputTitle } from '@/common/components/input-title/input-title';
import { System } from '@/system/types/system';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { EditSystemForm } from './edit-system-form/edit-system-form';

export const EditSystemPage = (): ReactElement => {
  return (
    <EditSystemForm>
      <InputTitle name='newTitle' />
      <InputDescription name='newDescription' />
      <AntdFormItem wrapperCol={{ sm: { span: 24 }, md: { offset: 8 } }}>
        <AntdSpace wrap>
          <AntdButton htmlType='submit' type='primary'>
            Submit
          </AntdButton>
          <CancelButton />
          <AntdButton htmlType='reset'>
            Reset
          </AntdButton>
        </AntdSpace>
      </AntdFormItem>
    </EditSystemForm>
  );
};

export const generateMetadata = async (props: ServerSideProps): Promise<Metadata> => {
  const { params } = props;

  const { 'system-id': id } = params;

  const response = await fetch(`http://${process.env.BACK_END_HOSTNAME}:${process.env.NEXT_PUBLIC_BACK_END_PORT}/system/${id}`);

  const system = await response.json() as System;

  const { title } = system;

  return {
    title: `Delete ${title}`
  };
};
