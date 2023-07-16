import { AntdCard } from '@/common/components/antd-card/antd-card';
import { Metadata } from 'next';
import { ReactElement } from 'react';

export const CreateSymbolPage = (): ReactElement => {
  return (
    <AntdCard headStyle={{ textAlign: 'center' }} style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '600px' }} title='Create Symbol'>
      Placeholder for creating new symbols
    </AntdCard>
  );
};

export const metadata = {
  title: 'Create Symbol'
} as Metadata;
