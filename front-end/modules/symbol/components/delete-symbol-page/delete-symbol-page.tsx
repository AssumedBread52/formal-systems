import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { CancelButton } from '@/common/components/cancel-button/cancel-button';
import { InputHiddenId } from '@/common/components/input-hidden-id/input-hidden-id';
import { InputHiddenSystemId } from '@/common/components/input-hidden-system-id/input-hidden-system-id';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { DeleteSymbolForm } from './delete-symbol-form/delete-symbol-form';

export const DeleteSymbolPage = (props: ServerSideProps): ReactElement => {
  const { params } = props;

  const { 'system-id': systemId = '', 'symbol-id': symbolId = '', 'symbol-title': symbolTitle = '' } = params;

  return (
    <AntdCard headStyle={{ textAlign: 'center' }} style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '600px' }} title={`Delete ${decodeURIComponent(symbolTitle)}`}>
      <DeleteSymbolForm id={symbolId} systemId={systemId}>
        <InputHiddenId />
        <InputHiddenSystemId />
        <AntdFormItem style={{ textAlign: 'center' }}>
          <AntdSpace direction='vertical'>
            <AntdButton htmlType='submit' type='primary'>
              Submit
            </AntdButton>
            <CancelButton />
          </AntdSpace>
        </AntdFormItem>
      </DeleteSymbolForm>
    </AntdCard>
  );
};

export const generateMetadata = (props: ServerSideProps): Metadata => {
  const { params } = props;

  const { 'symbol-title': symbolTitle = '' } = params;

  return {
    title: `Delete ${decodeURIComponent(symbolTitle)}`
  };
};
