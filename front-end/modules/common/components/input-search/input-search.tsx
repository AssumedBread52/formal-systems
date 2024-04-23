'use client';

import { AntdInputSearch } from '@/common/components/antd-input-search/antd-input-search';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ReactElement } from 'react';

export const InputSearch = (): ReactElement => {
  const pathname = usePathname();

  const { push } = useRouter();

  const searchParams = useSearchParams();

  const keywords = searchParams.getAll('keywords[]');

  const searchHandler = (value: string): void => {
    const newSearchParams = new URLSearchParams(searchParams);

    newSearchParams.delete('page');
    newSearchParams.delete('keywords[]');

    value.split(' ').forEach((newKeyword: string): void => {
      if (0 === newKeyword.length) {
        return;
      }

      newSearchParams.append('keywords[]', newKeyword);
    });

    push(`${pathname}?${newSearchParams.toString()}`);
  };

  return (
    <AntdInputSearch allowClear defaultValue={keywords.join(' ')} enterButton onSearch={searchHandler} />
  );
};
