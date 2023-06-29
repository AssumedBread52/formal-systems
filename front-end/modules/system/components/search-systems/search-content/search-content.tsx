'use client';

import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { InputPagination } from '@/common/components/input-pagination/input-pagination';
import { InputSearch } from '@/common/components/input-search/input-search';
import { SearchResults } from '@/common/types/search-results';
import { System } from '@/system/types/system';
import { SystemList } from './system-list/system-list';

export const SearchContent = (props: SearchResults<System>) => {
  const { results, total } = props;

  return (
    <AntdRow gutter={[0, 16]}>
      <AntdCol span={24}>
        <InputSearch />
      </AntdCol>
      <AntdCol span={24}>
        <InputPagination resultType='Formal Systems' total={total} />
      </AntdCol>
      <AntdCol span={24}>
        <SystemList systems={results} />
      </AntdCol>
      <AntdCol span={24}>
        <InputPagination resultType='Formal Systems' total={total} />
      </AntdCol>
    </AntdRow>
  );
};
