'use client';

import { AntdCol } from '@/common/components/antd-col/antd-col';
import { AntdInputSearch } from '@/common/components/antd-input-search/antd-input-search';
import { AntdRow } from '@/common/components/antd-row/antd-row';
import { SearchParameters } from '@/common/types/search-parameters';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { stringify } from 'querystring';
import { PropsWithChildren, ReactElement } from 'react';

export const SearchControls = (props: PropsWithChildren): ReactElement => {
  const { children } = props;

  const pathname = usePathname();

  const { push } = useRouter();

  const searchParams = useSearchParams();

  const count = parseInt(searchParams.get('count') ?? '10');
  const keywords = searchParams.getAll('keywords');
  const page = parseInt(searchParams.get('page') ?? '1');

  const searchHandler = (value: string): void => {
    const newKeywords = value.split(' ').filter((newKeyword: string): boolean => {
      return 0 !== newKeyword.length;
    });

    const searchParameters = { count, page } as SearchParameters;

    if (0 < newKeywords.length) {
      searchParameters.keywords = newKeywords;
    }

    push(`${pathname}?${stringify(searchParameters)}`);
  };

  return (
    <AntdRow gutter={[0, 16]}>
      <AntdCol span={24}>
        <AntdInputSearch allowClear defaultValue={keywords.join(' ')} enterButton onSearch={searchHandler} />
      </AntdCol>
      <AntdCol span={24}>
      </AntdCol>
      <AntdCol span={24}>
        {children}
      </AntdCol>
      <AntdCol span={24}>
      </AntdCol>
    </AntdRow>
  );
};
