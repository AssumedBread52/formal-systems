import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { CancelButton } from '@/common/components/cancel-button/cancel-button';
import { InputContent } from '@/common/components/input-content/input-content';
import { InputDescription } from '@/common/components/input-description/input-description';
import { InputHiddenSystemId } from '@/common/components/input-hidden-system-id/input-hidden-system-id';
import { InputSymbolType } from '@/common/components/input-symbol-type/input-symbol-type';
import { InputTitle } from '@/common/components/input-title/input-title';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { AddSymbolForm } from './add-symbol-form/add-symbol-form';

export const AddSymbolPage = (props: ServerSideProps): ReactElement => {
  const { params } = props;

  const { 'system-id': systemId = '' } = params;

  return (
    <AntdCard headStyle={{ textAlign: 'center' }} style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '600px' }} title='Add Symbol'>
      <AddSymbolForm systemId={systemId}>
        <InputTitle name='title' />
        <InputDescription name='description' />
        <InputSymbolType name='type' />
        <InputContent name='content' />
        <InputHiddenSystemId />
        <AntdFormItem wrapperCol={{ xs: { span: 24 }, sm: { offset: 8 } }}>
          <AntdSpace wrap>
            <AntdButton htmlType='submit' type='primary'>
              Submit
            </AntdButton>
            <CancelButton />
          </AntdSpace>
        </AntdFormItem>
      </AddSymbolForm>
    </AntdCard>
  );
};

export const metadata = {
  title: 'Add Symbol'
} as Metadata;
