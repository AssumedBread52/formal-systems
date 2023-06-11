'use client';

import { AntdButton } from '@/common/components/antd-button/antd-button';
import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdResult } from '@/common/components/antd-result/antd-result';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { InputPagination } from '@/common/components/input-pagination/input-pagination';
import { InputSearch } from '@/common/components/input-search/input-search';
import { useSearchSystems } from '@/system/hooks/use-search-systems';
import { useRouter } from 'next/navigation';
import { LoadingResults } from './loading-results/loading-results';

export const SearchContent = () => {
  const { back } = useRouter();
  const [searchResults, loading, errorMessage] = useSearchSystems();

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
        {errorMessage && (
          <AntdResult status='500' subTitle={errorMessage} extra={[<AntdButton htmlType='button' type='primary' onClick={back}>Back</AntdButton>]} />
        )}
      </AntdCol>
      <AntdCol span={24}>
        <InputPagination resultType='Formal Systems' total={total} />
      </AntdCol>
    </AntdRow>
  );
};
