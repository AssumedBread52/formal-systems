'use client';

import { AntdInputSearch } from '@/common/components/antd-input-search/antd-input-search';
import { SearchParameters } from '@/common/types/search-parameters';
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

    const searchParameters = { count, page: 1 } as SearchParameters;

    if (0 < newKeywords.length) {
      searchParameters.keywords = newKeywords;
    }

    push(`${pathname}?${stringify(searchParameters)}`);
  };

  return (
    <AntdInputSearch allowClear defaultValue={keywords.join(' ')} enterButton onSearch={searchHandler} />
  );
};
