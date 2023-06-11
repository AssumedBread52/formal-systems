import { AntdCard } from '@/common/components/antd-card/antd-card';
import { SearchControls } from '@/common/components/search-controls/search-controls';
import { ReactElement } from 'react';
import { CreateButton } from './create-button/create-button';

export const SearchSystems = (): ReactElement => {
  return (
    <AntdCard extra={<CreateButton />} title='Formal Systems'>
      <SearchControls>
        Search Systems
      </SearchControls>
    </AntdCard>
  );
};
