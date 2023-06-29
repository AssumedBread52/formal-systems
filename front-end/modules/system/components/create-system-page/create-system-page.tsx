import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { CancelButton } from '@/common/components/cancel-button/cancel-button';
import { InputDescription } from '@/common/components/input-description/input-description';
import { InputTitle } from '@/common/components/input-title/input-title';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { CreateSystemForm } from './create-system-form/create-system-form';

export const CreateSystemPage = (): ReactElement => {
  return (
    <AntdCard headStyle={{ textAlign: 'center' }} style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '600px' }} title='Create Formal System'>
      <CreateSystemForm>
        <InputTitle name='title' />
        <InputDescription name='description' />
        <AntdFormItem wrapperCol={{ xs: { span: 24 }, sm: { offset: 8 } }}>
          <AntdSpace wrap>
            <AntdButton htmlType='submit' type='primary'>
              Submit
            </AntdButton>
            <CancelButton />
          </AntdSpace>
        </AntdFormItem>
      </CreateSystemForm>
    </AntdCard>
  );
};

export const metadata = {
  title: 'Create Formal System'
} as Metadata;
