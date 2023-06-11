import { AntdCard } from '@/common/components/antd-card/antd-card';
import { SearchControls } from '@/common/components/search-controls/search-controls';
import { ReactElement } from 'react';
import { CreateButton } from './create-button/create-button';
import { SystemList } from './system-list/system-list';

export const SearchSystems = (): ReactElement => {
  const { results, total } = { results: [], total: 0 };

  return (
    <AntdCard extra={<CreateButton />} title='Formal Systems'>
      <SearchControls total={total} resultType='formal systems'>
        <SystemList systems={results} />
      </SearchControls>
    </AntdCard>
  );
};
