'use client';

import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdPagination } from '@/common/components/antd-pagination/antd-pagination';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { InputSearch } from '@/common/components/input-search/input-search';
import { SearchControlsProps } from '@/common/types/search-controls-props';
import { SearchParameters } from '@/common/types/search-parameters';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { stringify } from 'querystring';
import { PropsWithChildren, ReactElement, ReactNode } from 'react';

export const SearchControls = (props: PropsWithChildren<SearchControlsProps>): ReactElement => {
  const { children, total, resultType } = props;

  const pathname = usePathname();

  const { push } = useRouter();

  const searchParams = useSearchParams();

  const count = parseInt(searchParams.get('count') ?? '10');
  const keywords = searchParams.getAll('keywords');
  const page = parseInt(searchParams.get('page') ?? '1');

  const showTotal = (total: number, range: [number, number]): ReactNode => {
    const [min, max] = range;

    return `${min} - ${max} of ${total} ${resultType}`;
  };

  const changeHandler = (page: number, pageSize: number): void => {
    const searchParameters = { count: pageSize, page } as SearchParameters;

    if (0 < keywords.length) {
      searchParameters.keywords = keywords;
    }

    push(`${pathname}?${stringify(searchParameters)}`);
  };

  return (
    <AntdRow gutter={[0, 16]}>
      <AntdCol span={24}>
        <InputSearch />
      </AntdCol>
      <AntdCol span={24}>
        <AntdPagination current={page} pageSize={count} showQuickJumper showSizeChanger showTitle style={{ textAlign: 'center' }} total={total} onChange={changeHandler} showTotal={showTotal} />
      </AntdCol>
      <AntdCol span={24}>
        {children}
      </AntdCol>
      <AntdCol span={24}>
        <AntdPagination current={page} pageSize={count} showQuickJumper showSizeChanger showTitle style={{ textAlign: 'center' }} total={total} onChange={changeHandler} showTotal={showTotal} />
      </AntdCol>
    </AntdRow>
  );
};
