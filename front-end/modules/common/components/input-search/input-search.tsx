'use client';

import { AntdInputSearch } from '@/common/components/antd-input-search/antd-input-search';
import { PaginatedSearchParams } from '@/common/types/paginated-search-params';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { stringify } from 'querystring';
import { ReactElement } from 'react';

export const InputSearch = (): ReactElement => {
  const pathname = usePathname();

  const { push } = useRouter();

  const searchParams = useSearchParams();

  const count = parseInt(searchParams.get('count') ?? '10');
  const keywords = searchParams.getAll('keywords');

  const searchHandler = (value: string): void => {
    const newKeywords = value.split(' ').filter((newKeyword: string): boolean => {
      return 0 !== newKeyword.length;
    });

    const paginatedSearchParams = { count, page: 1 } as PaginatedSearchParams;

    if (0 < newKeywords.length) {
      paginatedSearchParams.keywords = newKeywords;
    }

    push(`${pathname}?${stringify(paginatedSearchParams)}`);
  };

  return (
    <AntdInputSearch allowClear defaultValue={keywords.join(' ')} enterButton onSearch={searchHandler} />
  );
};
