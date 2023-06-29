import { AntdCard } from '@/common/components/antd-card/antd-card';
import { ReactElement } from 'react';
import { CreateLink } from './create-link/create-link';
import { SearchContent } from './search-content/search-content';

export const SearchSystems = (): ReactElement => {
  return (
    <AntdCard extra={<CreateLink />} title='Formal Systems'>
      <SearchContent />
    </AntdCard>
  );
};
