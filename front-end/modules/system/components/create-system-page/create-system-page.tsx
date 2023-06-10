import { AntdCard } from '@/common/components/antd-card/antd-card';
import { Metadata } from 'next';
import { ReactElement } from 'react';
import { CreateSystemForm } from './create-system-form/create-system-form';

export const CreateSystemPage = (): ReactElement => {
  return (
    <AntdCard headStyle={{ textAlign: 'center' }} style={{ marginLeft: 'auto', marginRight: 'auto', minWidth: '180px', width: '50vw' }} title='Create Formal System'>
      <CreateSystemForm>
        Create System Page
      </CreateSystemForm>
    </AntdCard>
  );
};

export const metadata = {
  title: 'Create Formal System'
} as Metadata;
