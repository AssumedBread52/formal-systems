import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { CancelButton } from '@/common/components/cancel-button/cancel-button';
import { InputDescription } from '@/common/components/input-description/input-description';
import { InputHiddenSystemId } from '@/common/components/input-hidden-system-id/input-hidden-system-id';
import { InputSymbolType } from '@/common/components/input-symbol-type/input-symbol-type';
import { InputTitle } from '@/common/components/input-title/input-title';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { CreateSymbolForm } from './create-symbol-form/create-symbol-form';

export const CreateSymbolPage = (): ReactElement => {
  return (
    <AntdCard headStyle={{ textAlign: 'center' }} style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '600px' }} title='Create Symbol'>
      <CreateSymbolForm>
        <InputTitle name='title' />
        <InputDescription name='description' />
        <InputSymbolType name='type' />
        Content
        <InputHiddenSystemId />
        <AntdFormItem wrapperCol={{ xs: { span: 24 }, sm: { offset: 8 } }}>
          <AntdSpace wrap>
            <AntdButton htmlType='submit' type='primary'>
              Submit
            </AntdButton>
            <CancelButton />
          </AntdSpace>
        </AntdFormItem>
      </CreateSymbolForm>
    </AntdCard>
  );
};

export const metadata = {
  title: 'Create Symbol'
} as Metadata;
