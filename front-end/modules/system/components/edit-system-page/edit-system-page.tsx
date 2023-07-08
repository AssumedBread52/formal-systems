import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { CancelButton } from '@/common/components/cancel-button/cancel-button';
import { InputDescription } from '@/common/components/input-description/input-description';
import { InputHiddenId } from '@/common/components/input-hidden-id/input-hidden-id';
import { InputTitle } from '@/common/components/input-title/input-title';
import { fetchSystem } from '@/system/fetch-data/fetch-system';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { EditSystemForm } from './edit-system-form/edit-system-form';

export const EditSystemPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params } = props;

  const { 'system-id': systemId = '' } = params;

  const { id, title, description } = await fetchSystem(systemId);

  return (
    <AntdCard headStyle={{ textAlign: 'center' }} style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '600px' }} title={`Edit ${title}`}>
      <EditSystemForm id={id} newTitle={title} newDescription={description}>
        <InputHiddenId />
        <InputTitle name='newTitle' />
        <InputDescription name='newDescription' />
        <AntdFormItem wrapperCol={{ xs: { span: 24 }, sm: { offset: 8 } }}>
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

  return {
    title: `Edit ${decodeURIComponent(systemTitle)}`
  };
};
