import { AntdCard } from '@/common/components/antd-card/antd-card';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { CreateSymbolForm } from './create-symbol-form/create-symbol-form';

export const CreateSymbolPage = (): ReactElement => {
  return (
    <AntdCard headStyle={{ textAlign: 'center' }} style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '600px' }} title='Create Symbol'>
      <CreateSymbolForm>
        Placeholder for creating new symbols
      </CreateSymbolForm>
    </AntdCard>
  );
};

export const metadata = {
  title: 'Create Symbol'
} as Metadata;
