import { AntdCard } from '@/common/components/antd-card/antd-card';
import { ReactElement } from 'react';
import { CreateButton } from './create-button/create-button';
import { SearchControls } from './search-controls/search-controls';

export const SearchSystems = (): ReactElement => {
  return (
    <AntdCard extra={<CreateButton />} title='Formal Systems'>
      <SearchControls />
    </AntdCard>
  );
};
