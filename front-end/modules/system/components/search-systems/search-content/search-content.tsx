'use client';

import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { InputPagination } from '@/common/components/input-pagination/input-pagination';
import { InputSearch } from '@/common/components/input-search/input-search';
import { useSearchSystems } from '@/system/hooks/use-search-systems';
import { LoadingResults } from './loading-results/loading-results';

export const SearchContent = () => {
  const [searchResults, loading] = useSearchSystems();

  const { total } = searchResults ?? { total: 0 };

  return (
    <AntdRow gutter={[0, 16]}>
      <AntdCol span={24}>
        <InputSearch />
      </AntdCol>
      <AntdCol span={24}>
        <InputPagination resultType='Formal Systems' total={total} />
      </AntdCol>
      <AntdCol span={24}>
        {loading && (
          <LoadingResults />
        )}
      </AntdCol>
      <AntdCol span={24}>
        <InputPagination resultType='Formal Systems' total={total} />
      </AntdCol>
    </AntdRow>
  );
};
