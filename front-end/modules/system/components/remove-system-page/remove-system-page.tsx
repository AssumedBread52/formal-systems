import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { CancelButton } from '@/common/components/cancel-button/cancel-button';
import { InputHiddenId } from '@/common/components/input-hidden-id/input-hidden-id';
import { fetchSystem } from '@/system/fetch-data/fetch-system';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { RemoveSystemForm } from './remove-system-form/remove-system-form';

export const RemoveSystemPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params } = props;

  const { 'system-id': systemId = '' } = params;

  const { title } = await fetchSystem(systemId);

  return (
    <AntdCard headStyle={{ textAlign: 'center' }} style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '600px' }} title={`Remove ${title}`}>
      <RemoveSystemForm id={systemId}>
        <InputHiddenId />
        <AntdFormItem style={{ textAlign: 'center' }}>
          <AntdSpace direction='vertical'>
            <AntdButton htmlType='submit' type='primary'>
              Submit
            </AntdButton>
            <CancelButton />
          </AntdSpace>
        </AntdFormItem>
      </RemoveSystemForm>
    </AntdCard>
  );
};

export const generateMetadata = async (props: ServerSideProps): Promise<Metadata> => {
  const { params } = props;

  const { 'system-id': systemId = '' } = params;

  const { title } = await fetchSystem(systemId);

  return {
    title: `Remove ${title}`
  };
};
