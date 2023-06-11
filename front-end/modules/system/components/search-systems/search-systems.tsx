import { AntdCard } from '@/common/components/antd-card/antd-card';
import { ReactElement } from 'react';
import { CreateButton } from './create-button/create-button';

export const SearchSystems = (): ReactElement => {
  return (
    <AntdCard extra={<CreateButton />} title='Formal Systems'>
      Search Systems
    </AntdCard>
  );
};
