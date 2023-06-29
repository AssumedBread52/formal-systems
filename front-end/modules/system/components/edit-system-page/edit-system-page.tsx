import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { CancelButton } from '@/common/components/cancel-button/cancel-button';
import { InputDescription } from '@/common/components/input-description/input-description';
import { InputTitle } from '@/common/components/input-title/input-title';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { EditSystemForm } from './edit-system-form/edit-system-form';
import { AntdCard } from '@/common/components/antd-card/antd-card';

export const EditSystemPage = (props: ServerSideProps): ReactElement => {
  const { params } = props;

  const { 'system-title': systemTitle = '' } = params;

  const title = decodeURIComponent(systemTitle);

  return (
    <AntdCard headStyle={{ textAlign: 'center' }} style={{ marginLeft: 'auto', marginRight: 'auto', minWidth: '180px', width: '50vw' }} title={`Edit ${title}`}>
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
    </AntdCard>
  );
};

export const generateMetadata = async (props: ServerSideProps): Promise<Metadata> => {
  const { params } = props;

  const { 'system-title': systemTitle = '' } = params;

  const title = decodeURIComponent(systemTitle);

  return {
    title: `Delete ${title}`
  };
};
