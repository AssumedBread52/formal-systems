import { ServerSideProps } from '@/app/types/server-side-props';
import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdFormItem } from '@/common/components/antd-form-item/antd-form-item';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { CancelButton } from '@/common/components/cancel-button/cancel-button';
import { InputContent } from '@/common/components/input-content/input-content';
import { InputDescription } from '@/common/components/input-description/input-description';
import { InputHiddenId } from '@/common/components/input-hidden-id/input-hidden-id';
import { InputHiddenSystemId } from '@/common/components/input-hidden-system-id/input-hidden-system-id';
import { InputSymbolType } from '@/common/components/input-symbol-type/input-symbol-type';
import { InputTitle } from '@/common/components/input-title/input-title';
import { fetchSymbol } from '@/symbol/fetch-data/fetch-symbol';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { EditSymbolForm } from './edit-symbol-form/edit-symbol-form';

export const EditSymbolPage = async (props: ServerSideProps): Promise<ReactElement> => {
  const { params } = props;

  const { 'system-id': systemId = '', 'symbol-id': symbolId = '' } = params;

  const { id, title, description, type, content } = await fetchSymbol(systemId, symbolId);

  return (
    <AntdCard headStyle={{ textAlign: 'center' }} style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '600px' }} title={`Edit ${title}`}>
      <EditSymbolForm id={id} newTitle={title} newDescription={description} newType={type} newContent={content} systemId={systemId}>
        <InputHiddenId />
        <InputHiddenSystemId />
        <InputTitle name='newTitle' />
        <InputDescription name='newDescription' />
        <InputSymbolType name='newType' />
        <InputContent name='newContent' />
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
      </EditSymbolForm>
    </AntdCard>
  );
};

export const generateMetadata = (props: ServerSideProps): Metadata => {
  const { params } = props;

  const { 'symbol-title': symbolTitle = '' } = params;

  return {
    title: `Edit ${decodeURIComponent(symbolTitle)}`
  };
};
