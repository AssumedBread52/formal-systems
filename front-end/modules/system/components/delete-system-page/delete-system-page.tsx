import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { CancelButton } from '@/common/components/cancel-button/cancel-button';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { DeleteSystemForm } from './delete-system-form/delete-system-form';

export const DeleteSystemPage = (): ReactElement => {
  return (
    <DeleteSystemForm>
      <AntdFormItem style={{ textAlign: 'center' }}>
        <AntdSpace direction='vertical'>
          <AntdButton htmlType='submit' type='primary'>
            Submit
          </AntdButton>
          <CancelButton />
        </AntdSpace>
      </AntdFormItem>
    </DeleteSystemForm>
  );
};

export const generateMetadata = (props: ServerSideProps): Metadata => {
  const { params } = props;
  const { 'system-url-path': urlPath } = params;

  return {
    title: `Delete ${decodeURIComponent(urlPath ?? '')}`
  };
};
